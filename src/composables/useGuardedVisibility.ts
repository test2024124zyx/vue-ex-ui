import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export type VisibilityGuard = () => boolean | Promise<boolean>;
export type VisibilityGuardPhase = 'open' | 'close';

export interface UseGuardedVisibilityOptions {
  /** 外部受控状态。 */
  modelValue: () => boolean;
  /** 动态读取打开守卫。 */
  beforeOpen?: () => VisibilityGuard | undefined;
  /** 动态读取关闭守卫。 */
  beforeClose?: () => VisibilityGuard | undefined;
  /** 请求父级更新受控状态。 */
  requestModelValue: (value: boolean) => void;
  /** 打开守卫通过后的回调。 */
  onOpen?: () => void;
  /** 外部状态真正关闭后的回调。 */
  onClose?: () => void;
  /** 守卫抛出异常或 Promise 拒绝时的回调。 */
  onGuardError?: (error: unknown, phase: VisibilityGuardPhase) => void;
}

export interface UseGuardedVisibilityReturn {
  /** 守卫通过后的真实可见状态。 */
  visible: Ref<boolean>;
  /** 是否至少成功打开过一次，用于保留未销毁内容。 */
  hasOpened: Ref<boolean>;
  /** 请求父级打开。 */
  requestOpen: () => void;
  /** 经关闭守卫请求父级关闭；并发请求共享同一个结果。 */
  requestClose: () => Promise<boolean>;
}

/**
 * 管理带异步守卫的受控可见状态。
 * 每次外部状态变化都会使旧打开任务失效，避免迟到的 Promise 重新打开已关闭浮层。
 */
export function useGuardedVisibility(
  options: UseGuardedVisibilityOptions
): UseGuardedVisibilityReturn {
  const visible = ref(false);
  const hasOpened = ref(false);
  let openRevision = 0;
  let pendingClose: Promise<boolean> | null = null;

  /** 守卫异常等同于拒绝本次状态变化，并交由组件事件显式暴露。 */
  const runGuard = async (
    getGuard: (() => VisibilityGuard | undefined) | undefined,
    phase: VisibilityGuardPhase
  ): Promise<boolean> => {
    try {
      const guard = getGuard?.();
      return guard ? (await guard()) !== false : true;
    } catch (error) {
      options.onGuardError?.(error, phase);
      return false;
    }
  };

  const applyModelValue = async (nextValue: boolean) => {
    const revision = ++openRevision;
    if (!nextValue) {
      if (visible.value) {
        visible.value = false;
        options.onClose?.();
      }
      return;
    }
    if (visible.value) return;

    const allowed = await runGuard(options.beforeOpen, 'open');
    if (revision !== openRevision || !options.modelValue()) return;
    if (allowed === false) {
      options.requestModelValue(false);
      return;
    }

    hasOpened.value = true;
    visible.value = true;
    options.onOpen?.();
  };

  watch(options.modelValue, value => void applyModelValue(value), { immediate: true });

  const requestOpen = () => options.requestModelValue(true);

  const requestClose = (): Promise<boolean> => {
    if (pendingClose) return pendingClose;

    const operation = (async () => {
      const allowed = await runGuard(options.beforeClose, 'close');
      if (allowed === false) return false;
      options.requestModelValue(false);
      return true;
    })();

    pendingClose = operation;
    const clearPending = () => {
      if (pendingClose === operation) pendingClose = null;
    };
    void operation.then(clearPending, clearPending);
    return operation;
  };

  return { visible, hasOpened, requestOpen, requestClose };
}
