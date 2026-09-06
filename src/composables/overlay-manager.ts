import { shallowReactive } from 'vue';
import { createDocumentRuntime } from '../utils/shared-runtime';
import { isComposingKeyboardEvent } from '../utils/keyboard';

/** 可聚焦元素选择器，供自动聚焦与焦点圈闭共享。 */
const FOCUSABLE_SELECTOR =
  'a[href], area[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

const isVisibleFocusable = (element: HTMLElement): boolean => {
  if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true')
    return false;
  if (element.tabIndex < 0 || element.hidden || element.closest('[inert]')) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
};

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    isVisibleFocusable
  );

const measureScrollbarWidth = (owner: Document): number =>
  Math.max(0, (owner.defaultView?.innerWidth ?? 0) - owner.documentElement.clientWidth);

/** 引用计数式锁定页面滚动，支持多个嵌套浮层。 */
export function lockDocumentScroll(): void {
  const runtime = getOverlayRuntime();
  const owner = runtime.owner;
  if (!owner) return;
  if (runtime.scrollLockCount > 0) {
    runtime.scrollLockCount += 1;
    return;
  }

  const body = owner.body;
  runtime.originalBodyOverflow = body.style.overflow;
  runtime.originalBodyPaddingRight = body.style.paddingRight;
  const root = owner.documentElement;
  const scrollbarWidth = root.scrollHeight > root.clientHeight ? measureScrollbarWidth(owner) : 0;
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  body.style.overflow = 'hidden';
  runtime.scrollLockCount = 1;
}

/** 仅在最后一个持有者释放时恢复页面原始滚动样式。 */
export function unlockDocumentScroll(): void {
  const runtime = getOverlayRuntime();
  if (!runtime.owner || runtime.scrollLockCount === 0) return;
  runtime.scrollLockCount -= 1;
  if (runtime.scrollLockCount > 0) return;
  runtime.owner.body.style.overflow = runtime.originalBodyOverflow;
  runtime.owner.body.style.paddingRight = runtime.originalBodyPaddingRight;
}

export interface OverlayStackEntry {
  canEscape: () => boolean;
  onEscape: () => void | Promise<void>;
  parent?: OverlayStackEntry;
  active?: () => boolean;
  container?: () => HTMLElement | undefined;
  zIndex?: () => number;
  trapFocus?: () => boolean;
}

// 不同构建入口共享文档级栈、滚动锁和监听器本身，避免只共享标志却无法正确注销。
const getOverlayRuntime = createDocumentRuntime('overlay', owner => ({
  owner,
  overlayStack: shallowReactive<OverlayStackEntry[]>([]),
  scrollLockCount: 0,
  originalBodyOverflow: '',
  originalBodyPaddingRight: '',
  keydownHandler: null as ((event: KeyboardEvent) => void) | null,
}));
const OVERLAY_LAYER_STEP = 1;
const MAXIMUM_CSS_Z_INDEX = 2_147_483_647;

const isOverlayPresent = (entry: OverlayStackEntry) =>
  !entry.container || Boolean(entry.container()?.isConnected);

const handleGlobalKeydown = (
  event: KeyboardEvent,
  runtime: ReturnType<typeof getOverlayRuntime>
) => {
  if (event.key !== 'Escape' || isComposingKeyboardEvent(event) || event.defaultPrevented) return;
  const top = [...runtime.overlayStack].reverse().find(isOverlayPresent);
  if (!top?.canEscape()) return;
  event.preventDefault();
  event.stopPropagation();
  void top.onEscape();
};

/** 注册浮层并返回注销函数；注销结果表示该浮层关闭前是否位于栈顶。 */
export function registerOverlay(entry: OverlayStackEntry): () => boolean {
  const runtime = getOverlayRuntime();
  const { overlayStack } = runtime;
  overlayStack.push(entry);
  if (!runtime.keydownHandler && runtime.owner) {
    // 捕获阶段确定唯一接收者，避免子控件关闭后同一次事件继续关闭父弹窗。
    runtime.keydownHandler = event => handleGlobalKeydown(event, runtime);
    runtime.owner.addEventListener('keydown', runtime.keydownHandler, true);
  }

  return () => {
    const index = overlayStack.indexOf(entry);
    if (index < 0) return false;
    const wasTop = overlayStack.slice(index + 1).every(candidate => isDescendant(candidate, entry));
    overlayStack.splice(index, 1);
    if (overlayStack.length === 0 && runtime.keydownHandler && runtime.owner) {
      runtime.owner.removeEventListener('keydown', runtime.keydownHandler, true);
      runtime.keydownHandler = null;
    }
    return wasTop;
  };
}

const isDescendant = (entry: OverlayStackEntry, ancestor: OverlayStackEntry): boolean => {
  for (let parent = entry.parent; parent; parent = parent.parent) {
    if (parent === ancestor) return true;
  }
  return false;
};

/** 父子归属与打开顺序共同决定层级；关闭后释放层级，不累积全局计数。 */
export function resolveOverlayZIndex(entry: OverlayStackEntry, base: number): number {
  const { overlayStack } = getOverlayRuntime();
  const normalizedBase = Number.isFinite(base) && base >= 0 ? Math.trunc(base) : 0;
  let layer = Math.max(normalizedBase, (entry.parent?.zIndex?.() ?? -1) + OVERLAY_LAYER_STEP);
  const index = overlayStack.indexOf(entry);
  for (const previous of overlayStack.slice(0, Math.max(0, index))) {
    if (!isOverlayPresent(previous) || isDescendant(previous, entry)) continue;
    layer = Math.max(layer, (previous.zIndex?.() ?? -1) + OVERLAY_LAYER_STEP);
  }
  return Math.min(layer, MAXIMUM_CSS_Z_INDEX);
}

/** 只有最上层模态边界圈闭焦点，且包含归属于它的 Teleport 子面板。 */
export function getOverlayFocusContainers(entry: OverlayStackEntry): HTMLElement[] {
  const { overlayStack } = getOverlayRuntime();
  const boundary = [...overlayStack]
    .reverse()
    .find(candidate => isOverlayPresent(candidate) && candidate.trapFocus?.());
  if (boundary !== entry) return [];
  return getOverlayOwnedContainers(entry);
}

/** 返回逻辑子树的面板节点，供点击外部判断和跨 Teleport 焦点边界共用。 */
export function getOverlayOwnedContainers(entry: OverlayStackEntry): HTMLElement[] {
  const { overlayStack } = getOverlayRuntime();
  return overlayStack
    .filter(candidate => candidate === entry || isDescendant(candidate, entry))
    .map(candidate => candidate.container?.())
    .filter((container): container is HTMLElement => Boolean(container?.isConnected));
}

/** 安装 Tab 焦点圈闭，并返回清理函数。 */
export function createFocusTrap(
  container: HTMLElement,
  getContainers: () => HTMLElement[] = () => [container]
): () => void {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const containers = getContainers();
    if (containers.length === 0) return;
    const focusable = [...new Set(containers.flatMap(getFocusableElements))];
    if (focusable.length === 0) {
      event.preventDefault();
      if (!container.hasAttribute('tabindex')) container.tabIndex = -1;
      container.focus();
      return;
    }

    // 每一步都按逻辑子树导航，避免两个 Teleport 容器之间的页面元素截获焦点。
    const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const direction = event.shiftKey ? -1 : 1;
    const nextIndex =
      activeIndex < 0
        ? event.shiftKey
          ? focusable.length - 1
          : 0
        : (activeIndex + direction + focusable.length) % focusable.length;
    event.preventDefault();
    focusable[nextIndex]!.focus();
  };

  document.addEventListener('keydown', handleKeydown, true);
  return () => document.removeEventListener('keydown', handleKeydown, true);
}

/** 在两帧布局稳定后聚焦首个可用控件，并返回可取消任务。 */
export function scheduleAutoFocus(container: HTMLElement): () => void {
  let firstFrame = 0;
  let secondFrame = 0;
  firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(() => {
      if (!container.isConnected) return;
      const target = getFocusableElements(container)[0] ?? container;
      if (target === container && !container.hasAttribute('tabindex')) container.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  });

  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
  };
}
