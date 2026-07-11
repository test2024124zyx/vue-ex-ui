import { normalizeDelay } from './timing';
import type { TimingCallback } from './timing';

export interface ThrottledFunction<T extends TimingCallback> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void;
  /** 取消当前节流窗口中的尾调用。 */
  cancel(): void;
  /** 立即执行尾调用并返回原函数结果。 */
  flush(): ReturnType<T> | undefined;
  /** 是否存在等待执行的尾调用。 */
  pending(): boolean;
}

/**
 * 创建首尾缘节流函数。窗口内的多次调用会合并为一次，并使用最新参数。
 */
export function throttle<T extends TimingCallback>(fn: T, delay = 100): ThrottledFunction<T> {
  const wait = normalizeDelay(delay);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastInvokeTime: number | null = null;
  let pendingCall: { context: ThisParameterType<T>; args: Parameters<T> } | null = null;

  const invoke = (time: number): ReturnType<T> | undefined => {
    if (!pendingCall) return undefined;

    const call = pendingCall;
    pendingCall = null;
    lastInvokeTime = time;
    return Reflect.apply(fn, call.context, call.args) as ReturnType<T>;
  };

  const cancelTimer = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const throttled = function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const now = Date.now();
    pendingCall = { context: this, args };

    if (lastInvokeTime === null || wait === 0 || now - lastInvokeTime >= wait) {
      cancelTimer();
      invoke(now);
      return;
    }

    if (timer === null) {
      const remaining = wait - (now - lastInvokeTime);
      timer = setTimeout(() => {
        timer = null;
        invoke(Date.now());
      }, remaining);
    }
  } as ThrottledFunction<T>;

  throttled.cancel = () => {
    cancelTimer();
    pendingCall = null;
  };
  throttled.flush = () => {
    if (timer === null) return undefined;
    cancelTimer();
    return invoke(Date.now());
  };
  throttled.pending = () => timer !== null;

  return throttled;
}
