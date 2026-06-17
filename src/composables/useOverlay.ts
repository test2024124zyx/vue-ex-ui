// ExUI useOverlay —— 浮层（Modal / Dialog / Drawer 等）通用机制
//
// 把浮层「打开/关闭副作用」收敛到一处：
//   - 锁定/解锁页面滚动（引用计数，支持叠加）
//   - 自动聚焦 + Tab 焦点陷阱（trapFocus）
//   - Esc 键关闭（通过浮层栈，保证只关闭最顶层浮层）
//   - 关闭后归还焦点（可选）
//   - 组件卸载时的兜底清理
//
// 组件只需用一个响应式的「是否打开」来源驱动它，并保留各自的模板、emit 与
// 业务守卫（如 beforeOpen/beforeClose）。

import { watch, onBeforeUnmount, nextTick } from 'vue';
import type { Ref } from 'vue';
import { lockScroll, unlockScroll, trapFocus, autoFocus } from '../components/modal/utils';

export interface UseOverlayOptions {
  /** 响应式的「是否打开」来源（getter） */
  active: () => boolean;
  /** 浮层容器，用于自动聚焦与焦点陷阱 */
  container: Ref<HTMLElement | undefined>;
  /** 是否锁定页面滚动（getter），默认 true */
  lockScroll?: () => boolean;
  /** 是否允许 Esc 关闭（getter），默认 true */
  closeOnEscape?: () => boolean;
  /** Esc 在打开态被按下时调用（通常是组件的关闭/取消逻辑） */
  onEscape?: () => void;
  /** 关闭后是否把焦点归还给打开前的元素，默认 false */
  restoreFocus?: boolean;
  /** 监听是否 immediate（初始即打开时也执行副作用），默认 true */
  immediate?: boolean;
}

export interface UseOverlayReturn {
  /** 手动触发「打开」副作用 */
  activate: () => void;
  /** 手动触发「关闭」副作用 */
  deactivate: () => void;
}

// ----------------------------------------------------------------------------
// 浮层栈：保证 Esc 只关闭最顶层浮层，且全局只挂一个 keydown 监听
// ----------------------------------------------------------------------------
interface OverlayEntry {
  canEscape: () => boolean;
  onEscape: () => void;
}

const overlayStack: OverlayEntry[] = [];
let globalKeydownBound = false;

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  const top = overlayStack[overlayStack.length - 1];
  if (top && top.canEscape()) {
    top.onEscape();
  }
};

const pushOverlay = (entry: OverlayEntry) => {
  overlayStack.push(entry);
  if (!globalKeydownBound && typeof document !== 'undefined') {
    document.addEventListener('keydown', handleGlobalKeydown);
    globalKeydownBound = true;
  }
};

const removeOverlay = (entry: OverlayEntry) => {
  const index = overlayStack.indexOf(entry);
  if (index > -1) overlayStack.splice(index, 1);
  if (overlayStack.length === 0 && globalKeydownBound && typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleGlobalKeydown);
    globalKeydownBound = false;
  }
};

export function useOverlay(options: UseOverlayOptions): UseOverlayReturn {
  let releaseFocusTrap: (() => void) | null = null;
  let previousActiveElement: HTMLElement | null = null;
  // 本实例当前是否持有滚动锁，确保解锁次数与加锁次数严格配对
  let locked = false;
  let entry: OverlayEntry | null = null;

  const shouldLock = () => options.lockScroll?.() !== false;
  const canEscape = () => options.closeOnEscape?.() !== false;

  const activate = () => {
    // SSR 环境无 document：immediate watch 在 setup 阶段即触发，此处直接跳过
    if (typeof document === 'undefined') return;

    // 入栈，参与 Esc 顶层判定
    if (!entry) {
      entry = { canEscape, onEscape: () => options.onEscape?.() };
      pushOverlay(entry);
    }

    // DOM 就绪后再锁滚动与聚焦
    nextTick(() => {
      // 若在 nextTick 之前已经关闭，则不再执行打开副作用
      if (!options.active()) return;

      if (shouldLock() && !locked) {
        lockScroll();
        locked = true;
      }
      if (options.restoreFocus) {
        previousActiveElement = (document.activeElement as HTMLElement | null) ?? null;
      }
      if (options.container.value) {
        autoFocus(options.container.value);
        releaseFocusTrap = trapFocus(options.container.value);
      }
    });
  };

  const deactivate = () => {
    // SSR 环境无 document：immediate watch 初始为关闭态时会调用此函数，需跳过
    if (typeof document === 'undefined') return;

    if (entry) {
      removeOverlay(entry);
      entry = null;
    }
    if (locked) {
      unlockScroll();
      locked = false;
    }
    releaseFocusTrap?.();
    releaseFocusTrap = null;
    if (options.restoreFocus) {
      previousActiveElement?.focus?.();
      previousActiveElement = null;
    }
  };

  watch(options.active, value => (value ? activate() : deactivate()), {
    immediate: options.immediate ?? true,
  });

  onBeforeUnmount(() => {
    if (entry) {
      removeOverlay(entry);
      entry = null;
    }
    if (locked) {
      unlockScroll();
      locked = false;
    }
    releaseFocusTrap?.();
    releaseFocusTrap = null;
  });

  return { activate, deactivate };
}
