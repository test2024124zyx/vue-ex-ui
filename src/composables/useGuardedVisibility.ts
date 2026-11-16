import { onScopeDispose, ref, watch } from 'vue';
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
  /** 是否跳过与当前受控值相同的更新请求；旧组件默认保留原行为。 */
  skipRedundantRequests?: boolean;
}

export interface UseGuardedVisibilityReturn {
  /** 守卫通过后的真实可见状态。 */
  visible: Ref<boolean>;
  /** 是否至少成功打开过一次，用于保留未销毁内容。 */
  hasOpened: Ref<boolean>;
  /** 请求父级打开，并撤销尚未完成的关闭任务。 */
  requestOpen: () => void;
  /** 经关闭守卫请求父级关闭；并发请求共享同一个结果。 */
  requestClose: () => Promise<boolean>;
}

const isPromiseLike = (value: unknown): value is PromiseLike<boolean> =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  typeof (value as PromiseLike<boolean>).then === 'function';

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
  let closeRevision = 0;
  let pendingClose: Promise<boolean> | null = null;
  let disposed = false;

  // 销毁撤销全部异步意图，迟到的守卫不能再触发业务回调。
  onScopeDispose(() => {
    disposed = true;
    openRevision += 1;
    closeRevision += 1;
    pendingClose = null;
  });

  /** 守卫异常等同于拒绝本次状态变化，并交由组件事件显式暴露。 */
  const runGuard = (
    getGuard: (() => VisibilityGuard | undefined) | undefined,
    phase: VisibilityGuardPhase
  ): boolean | Promise<boolean> => {
    try {
      const guard = getGuard?.();
      if (!guard) return true;

      const result = guard();
      if (!isPromiseLike(result)) return result !== false;
      // Promise.resolve 同时兼容跨 realm Promise 与标准 thenable。
      return Promise.resolve(result).then(
        value => value !== false,
        error => {
          if (!disposed) options.onGuardError?.(error, phase);
          return false;
        }
      );
    } catch (error) {
      options.onGuardError?.(error, phase);
      return false;
    }
  };

  const applyModelValue = (nextValue: boolean) => {
    const revision = ++openRevision;
    closeRevision += 1;
    pendingClose = null;

    if (!nextValue) {
      if (visible.value) {
        visible.value = false;
        options.onClose?.();
      }
      return;
    }
    if (visible.value) return;

    const applyGuardResult = (allowed: boolean): void => {
      if (disposed || revision !== openRevision || !options.modelValue()) return;
      if (!allowed) {
        options.requestModelValue(false);
        return;
      }

      hasOpened.value = true;
      visible.value = true;
      options.onOpen?.();
    };

    const guardResult = runGuard(options.beforeOpen, 'open');
    if (typeof guardResult === 'boolean') applyGuardResult(guardResult);
    else void guardResult.then(applyGuardResult);
  };

  watch(options.modelValue, applyModelValue, { immediate: true });

  const requestOpen = (): void => {
    if (disposed) return;
    if (options.modelValue()) {
      // 打开意图只撤销关闭任务，不使仍在执行的 beforeOpen 失效。
      closeRevision += 1;
      pendingClose = null;
      if (options.skipRedundantRequests) return;
    }
    options.requestModelValue(true);
  };

  const requestClose = (): Promise<boolean> => {
    if (disposed) return Promise.resolve(false);
    if (options.skipRedundantRequests && !options.modelValue()) return Promise.resolve(false);
    if (pendingClose) return pendingClose;

    const modelRevision = openRevision;
    const operationRevision = closeRevision;
    const operation = (async () => {
      const guardResult = runGuard(options.beforeClose, 'close');
      const allowed =
        typeof guardResult === 'boolean' ? guardResult : await Promise.resolve(guardResult);
      if (!allowed) return false;
      if (
        disposed ||
        modelRevision !== openRevision ||
        operationRevision !== closeRevision ||
        (options.skipRedundantRequests && !options.modelValue())
      ) {
        return false;
      }
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
