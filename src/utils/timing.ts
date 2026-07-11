/** 可安全推导参数与返回值的通用函数约束。 */
export type TimingCallback = (...args: never[]) => unknown;

/** 非法延迟统一归零，避免 NaN 计时器和负数产生浏览器差异。 */
export const normalizeDelay = (delay: number): number =>
  Number.isFinite(delay) && delay > 0 ? delay : 0;
