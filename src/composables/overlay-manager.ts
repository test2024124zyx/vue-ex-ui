import { shallowReactive } from 'vue';
import { createDocumentRuntime } from '../utils/shared-runtime';
import { isComposingKeyboardEvent } from '../utils/keyboard';

/** 可聚焦元素选择器，供自动聚焦与焦点圈闭共享。 */
const FOCUSABLE_SELECTOR =
  'a[href], area[href], button, input, select, textarea, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

const isVisibleFocusable = (element: HTMLElement): boolean => {
  // :disabled 包含 fieldset 的继承禁用语义，并保留首个 legend 的原生例外。
  if (
    element.matches(':disabled') ||
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-hidden') === 'true'
  )
    return false;
  if (element.tabIndex < 0) return false;
  // 控件自身的样式不能反映 display:none、hidden 和 inert 的祖先。
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (
      ancestor.hidden ||
      ancestor.hasAttribute('inert') ||
      ancestor.getAttribute('aria-hidden') === 'true'
    )
      return false;
    const style = element.ownerDocument.defaultView?.getComputedStyle(ancestor);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.visibility === 'collapse'
    )
      return false;
  }
  return true;
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
  localEscapeHandlers: new WeakMap<
    HTMLElement,
    {
      active: () => boolean;
      close: () => void;
      ownsTab?: (event: KeyboardEvent) => boolean;
    }
  >(),
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
  // 展开的内联控件先处理自身 Escape；归属之外的面板不能截获当前栈顶事件。
  const localBoundary = event
    .composedPath()
    .find(
      target =>
        target instanceof HTMLElement &&
        runtime.localEscapeHandlers.get(target)?.active() &&
        (!top || getOverlayOwnedContainers(top).some(container => container.contains(target)))
    );
  if (localBoundary instanceof HTMLElement) {
    event.preventDefault();
    event.stopPropagation();
    runtime.localEscapeHandlers.get(localBoundary)?.close();
    return;
  }
  if (!top?.canEscape()) return;
  event.preventDefault();
  event.stopPropagation();
  void top.onEscape();
};

/** 为浮层内部的内联展开控件提供先于父层的 Escape 处理权，不新增视觉层级。 */
export function registerOverlayEscapeBoundary(
  element: HTMLElement,
  active: () => boolean,
  close: () => void,
  ownsTab?: (event: KeyboardEvent) => boolean
): () => void {
  const handlers = getOverlayRuntime().localEscapeHandlers;
  const handler = { active, close, ownsTab };
  handlers.set(element, handler);
  return () => {
    if (handlers.get(element) === handler) handlers.delete(element);
  };
}

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

/** 子菜单退出时按触发器所在模态边界移动；普通页面交回浏览器原生 Tab 顺序。 */
export function moveFocusAfterPopup(
  trigger: HTMLElement,
  popup: HTMLElement,
  reverse: boolean
): boolean {
  const boundary = [...getOverlayRuntime().overlayStack]
    .reverse()
    .find(entry => isOverlayPresent(entry) && entry.trapFocus?.());
  if (!boundary) return false;
  const containers = getOverlayOwnedContainers(boundary);
  if (!containers.some(container => container.contains(trigger))) return false;
  const focusable = [...new Set(containers.flatMap(getFocusableElements))].filter(
    element => !popup.contains(element)
  );
  const index = focusable.indexOf(trigger);
  if (index < 0) return false;
  const offset = reverse ? -1 : 1;
  focusable[(index + offset + focusable.length) % focusable.length]!.focus({ preventScroll: true });
  return true;
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
    const handlers = getOverlayRuntime().localEscapeHandlers;
    // 编辑器消费的 Tab 先留给本地处理；放行后仍按所属浮层的焦点顺序移动。
    if (
      isComposingKeyboardEvent(event) ||
      event
        .composedPath()
        .some(
          target =>
            target instanceof HTMLElement &&
            containers.some(owner => owner.contains(target)) &&
            handlers.get(target)?.ownsTab?.(event)
        )
    )
      return;
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
