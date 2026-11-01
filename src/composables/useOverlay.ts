import { computed, inject, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue';
import type { ComputedRef, InjectionKey, Ref } from 'vue';
import {
  createFocusTrap,
  getOverlayFocusContainers,
  getOverlayOwnedContainers,
  lockDocumentScroll,
  registerOverlay,
  resolveOverlayZIndex,
  scheduleAutoFocus,
  unlockDocumentScroll,
} from './overlay-manager';
import type { OverlayStackEntry } from './overlay-manager';
import { createSharedInjectionKey } from '../utils/shared-runtime';

const OVERLAY_PARENT_KEY: InjectionKey<OverlayStackEntry> =
  createSharedInjectionKey('overlay-parent');

/** 内联控件读取所在浮层作用域，便于父层隐藏时清理第三方提示和高亮。 */
export function useOverlayParentActive(): ComputedRef<boolean> {
  const parent = inject(OVERLAY_PARENT_KEY, undefined);
  return computed(() => parent?.active?.() ?? true);
}

export interface UseOverlayOptions {
  /** 浮层真实打开状态。 */
  active: () => boolean;
  /** 布局容器在非浮层模式仍可展示后代；省略时沿用 active。 */
  scopeActive?: () => boolean;
  /** 对话框或面板容器。 */
  container: Ref<HTMLElement | undefined>;
  /** 语义层级下限；实际层级会随父层级和打开顺序动态提升。 */
  zIndex?: () => number;
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
  /** 子面板仅在焦点仍位于其逻辑子树内时恢复，避免干扰 Tab 的下一目标。 */
  restoreFocusOnlyWhenContained?: boolean;
  /** 是否立即同步初始打开状态，默认 true。 */
  immediate?: boolean;
  /** 父层关闭时同步隐藏子面板，避免保留的 Teleport 内容悬空。 */
  onParentClose?: () => void;
}

export interface UseOverlayReturn {
  readonly active: ComputedRef<boolean>;
  activate: () => void;
  deactivate: () => void;
  zIndex: ComputedRef<number>;
  containsTarget: (target: Node | null) => boolean;
}

/** 统一管理浮层栈、滚动锁定、焦点圈闭、Escape 与焦点恢复。 */
export function useOverlay(options: UseOverlayOptions): UseOverlayReturn {
  const parent = inject(OVERLAY_PARENT_KEY, undefined);
  const disposed = ref(false);
  const active = computed(
    () => !disposed.value && options.active() && (parent?.active?.() ?? true)
  );
  const zIndex = computed(() => resolveOverlayZIndex(entry, options.zIndex?.() ?? 0));
  const entry: OverlayStackEntry = {
    parent,
    active: () =>
      !disposed.value &&
      (options.scopeActive?.() ?? options.active()) &&
      (parent?.active?.() ?? true),
    container: () => options.container.value,
    zIndex: () => (active.value ? zIndex.value : (parent?.zIndex?.() ?? -1)),
    trapFocus: () => options.trapFocus?.() !== false,
    canEscape: () => options.closeOnEscape?.() !== false,
    onEscape: () => options.onEscape?.(),
  };
  provide(OVERLAY_PARENT_KEY, entry);
  let releaseFocusTrap: (() => void) | null = null;
  let cancelAutoFocus: (() => void) | null = null;
  let unregisterOverlay: (() => boolean) | null = null;
  let previousActiveElement: HTMLElement | null = null;
  let holdsScrollLock = false;
  let activationRevision = 0;

  const shouldLock = () => options.lockScroll?.() !== false;
  const shouldTrapFocus = () => options.trapFocus?.() !== false;
  const shouldAutoFocus = () => options.autoFocus?.() !== false;

  const syncScrollLock = () => {
    const shouldHold = active.value && shouldLock();
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
    if (active.value && shouldTrapFocus() && options.container.value) {
      releaseFocusTrap = createFocusTrap(options.container.value, () =>
        getOverlayFocusContainers(entry)
      );
    }
  };

  const activate = () => {
    if (disposed.value || typeof document === 'undefined') return;
    const revision = ++activationRevision;
    if (options.restoreFocus) {
      previousActiveElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (!unregisterOverlay) {
      unregisterOverlay = registerOverlay(entry);
    }
    syncScrollLock();

    nextTick(() => {
      if (revision !== activationRevision || !active.value || !options.container.value) return;
      syncFocusTrap();
      cancelAutoFocus?.();
      cancelAutoFocus = shouldAutoFocus()
        ? scheduleAutoFocus(options.container.value, () => getOverlayOwnedContainers(entry))
        : null;
    });
  };

  const deactivate = () => {
    if (typeof document === 'undefined') return;
    activationRevision += 1;
    const shouldRestoreFocus =
      !options.restoreFocusOnlyWhenContained ||
      getOverlayOwnedContainers(entry).some(container =>
        container.contains(document.activeElement)
      );
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

    if (
      options.restoreFocus &&
      shouldRestoreFocus &&
      wasTop &&
      (parent?.active?.() ?? true) &&
      previousActiveElement?.isConnected
    ) {
      previousActiveElement.focus({ preventScroll: true });
    }
    previousActiveElement = null;
  };

  watch(active, value => (value ? activate() : deactivate()), {
    immediate: options.immediate ?? true,
  });
  watch(shouldLock, () => {
    if (active.value) syncScrollLock();
  });
  watch(shouldTrapFocus, () => {
    if (active.value) syncFocusTrap();
  });
  watch(
    () => parent?.active?.(),
    (value, previous) => {
      if (previous && value === false && options.active()) options.onParentClose?.();
    }
  );

  onBeforeUnmount(() => {
    disposed.value = true;
    deactivate();
  });

  const containsTarget = (target: Node | null) =>
    getOverlayOwnedContainers(entry).some(container => container.contains(target));
  return { active, activate, deactivate, zIndex, containsTarget };
}
