import { normalizeDelay } from './timing';
import type { TimingCallback } from './timing';

export interface DebouncedFunction<T extends TimingCallback> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void;
  /** 取消尚未执行的尾调用。 */
  cancel(): void;
  /** 立即执行待处理调用并返回原函数结果。 */
  flush(): ReturnType<T> | undefined;
  /** 是否存在尚未执行的调用。 */
  pending(): boolean;
}

/**
 * 创建尾缘防抖函数，始终使用最后一次调用的参数与 this。
 */
export function debounce<T extends TimingCallback>(fn: T, delay: number): DebouncedFunction<T> {
  const wait = normalizeDelay(delay);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingCall: { context: ThisParameterType<T>; args: Parameters<T> } | null = null;

  const invoke = (): ReturnType<T> | undefined => {
    if (!pendingCall) return undefined;

    const call = pendingCall;
    pendingCall = null;
    return Reflect.apply(fn, call.context, call.args) as ReturnType<T>;
  };

  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    pendingCall = null;
  };

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timer !== null) clearTimeout(timer);
    pendingCall = { context: this, args };
    timer = setTimeout(() => {
      timer = null;
      invoke();
    }, wait);
  } as DebouncedFunction<T>;

  debounced.cancel = cancel;
  debounced.flush = () => {
    if (timer === null) return undefined;
    clearTimeout(timer);
    timer = null;
    return invoke();
  };
  debounced.pending = () => timer !== null;

  return debounced;
}
