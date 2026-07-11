import { nextTick, onBeforeUnmount, watch } from 'vue';
import type { Ref } from 'vue';
import {
  createFocusTrap,
  lockDocumentScroll,
  registerOverlay,
  scheduleAutoFocus,
  unlockDocumentScroll,
} from './overlay-manager';

export interface UseOverlayOptions {
  /** 浮层真实打开状态。 */
  active: () => boolean;
  /** 对话框或面板容器。 */
  container: Ref<HTMLElement | undefined>;
  /** 是否锁定页面滚动，默认 true。 */
  lockScroll?: () => boolean;
  /** 是否允许 Escape 请求关闭，默认 true。 */
  closeOnEscape?: () => boolean;
  /** Escape 请求关闭入口。 */
  onEscape?: () => void | Promise<void>;
  /** 是否启用焦点圈闭，默认 true。 */
  trapFocus?: () => boolean;
  /** 是否在打开后自动聚焦，默认 true。 */
  autoFocus?: () => boolean;
  /** 关闭后是否恢复打开前焦点。 */
  restoreFocus?: boolean;
  /** 是否立即同步初始打开状态，默认 true。 */
  immediate?: boolean;
}

export interface UseOverlayReturn {
  activate: () => void;
  deactivate: () => void;
}

/** 统一管理浮层栈、滚动锁定、焦点圈闭、Escape 与焦点恢复。 */
export function useOverlay(options: UseOverlayOptions): UseOverlayReturn {
  let releaseFocusTrap: (() => void) | null = null;
  let cancelAutoFocus: (() => void) | null = null;
  let unregisterOverlay: (() => boolean) | null = null;
  let previousActiveElement: HTMLElement | null = null;
  let holdsScrollLock = false;
  let activationRevision = 0;

  const shouldLock = () => options.lockScroll?.() !== false;
  const shouldTrapFocus = () => options.trapFocus?.() !== false;
  const shouldAutoFocus = () => options.autoFocus?.() !== false;
  const canEscape = () => options.closeOnEscape?.() !== false;

  const syncScrollLock = () => {
    const shouldHold = options.active() && shouldLock();
    if (shouldHold && !holdsScrollLock) {
      lockDocumentScroll();
      holdsScrollLock = true;
    } else if (!shouldHold && holdsScrollLock) {
      unlockDocumentScroll();
      holdsScrollLock = false;
    }
  };

  const syncFocusTrap = () => {
    releaseFocusTrap?.();
    releaseFocusTrap = null;
    if (options.active() && shouldTrapFocus() && options.container.value) {
      releaseFocusTrap = createFocusTrap(options.container.value);
    }
  };

  const activate = () => {
    if (typeof document === 'undefined') return;
    const revision = ++activationRevision;
    if (options.restoreFocus) {
      previousActiveElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (!unregisterOverlay) {
      unregisterOverlay = registerOverlay({
        canEscape,
        onEscape: () => options.onEscape?.(),
      });
    }
    syncScrollLock();

    nextTick(() => {
      if (revision !== activationRevision || !options.active() || !options.container.value) return;
      syncFocusTrap();
      cancelAutoFocus?.();
      cancelAutoFocus = shouldAutoFocus() ? scheduleAutoFocus(options.container.value) : null;
    });
  };

  const deactivate = () => {
    if (typeof document === 'undefined') return;
    activationRevision += 1;
    const wasTop = unregisterOverlay?.() ?? false;
    unregisterOverlay = null;
    if (holdsScrollLock) {
      unlockDocumentScroll();
      holdsScrollLock = false;
    }
    releaseFocusTrap?.();
    releaseFocusTrap = null;
    cancelAutoFocus?.();
    cancelAutoFocus = null;

    if (options.restoreFocus && wasTop && previousActiveElement?.isConnected) {
      previousActiveElement.focus({ preventScroll: true });
    }
    previousActiveElement = null;
  };

  watch(options.active, value => (value ? activate() : deactivate()), {
    immediate: options.immediate ?? true,
  });
  watch(shouldLock, () => {
    if (options.active()) syncScrollLock();
  });
  watch(shouldTrapFocus, () => {
    if (options.active()) syncFocusTrap();
  });

  onBeforeUnmount(deactivate);

  return { activate, deactivate };
}
