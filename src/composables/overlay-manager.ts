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

let scrollLockCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

const measureScrollbarWidth = (): number =>
  Math.max(0, window.innerWidth - document.documentElement.clientWidth);

/** 引用计数式锁定页面滚动，支持多个嵌套浮层。 */
export function lockDocumentScroll(): void {
  if (typeof document === 'undefined') return;
  if (scrollLockCount > 0) {
    scrollLockCount += 1;
    return;
  }

  const body = document.body;
  originalBodyOverflow = body.style.overflow;
  originalBodyPaddingRight = body.style.paddingRight;
  const root = document.documentElement;
  const scrollbarWidth = root.scrollHeight > root.clientHeight ? measureScrollbarWidth() : 0;
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  body.style.overflow = 'hidden';
  scrollLockCount = 1;
}

/** 仅在最后一个持有者释放时恢复页面原始滚动样式。 */
export function unlockDocumentScroll(): void {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;
  scrollLockCount -= 1;
  if (scrollLockCount > 0) return;
  document.body.style.overflow = originalBodyOverflow;
  document.body.style.paddingRight = originalBodyPaddingRight;
}

export interface OverlayStackEntry {
  canEscape: () => boolean;
  onEscape: () => void | Promise<void>;
}

const overlayStack: OverlayStackEntry[] = [];
let globalKeydownBound = false;

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  const top = overlayStack[overlayStack.length - 1];
  if (!top?.canEscape()) return;
  event.preventDefault();
  event.stopPropagation();
  void top.onEscape();
};

/** 注册浮层并返回注销函数；注销结果表示该浮层关闭前是否位于栈顶。 */
export function registerOverlay(entry: OverlayStackEntry): () => boolean {
  overlayStack.push(entry);
  if (!globalKeydownBound && typeof document !== 'undefined') {
    document.addEventListener('keydown', handleGlobalKeydown);
    globalKeydownBound = true;
  }

  return () => {
    const index = overlayStack.indexOf(entry);
    if (index < 0) return false;
    const wasTop = index === overlayStack.length - 1;
    overlayStack.splice(index, 1);
    if (overlayStack.length === 0 && globalKeydownBound && typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleGlobalKeydown);
      globalKeydownBound = false;
    }
    return wasTop;
  };
}

/** 安装 Tab 焦点圈闭，并返回清理函数。 */
export function createFocusTrap(container: HTMLElement): () => void {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      if (!container.hasAttribute('tabindex')) container.tabIndex = -1;
      container.focus();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !container.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
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
