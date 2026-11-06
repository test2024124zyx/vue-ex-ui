import type {
  LoadingBarColor,
  LoadingBarOptions,
  LoadingBarStatus,
  NormalizedLoadingBarOptions,
} from './types';

export const DEFAULT_LOADING_BAR_HEIGHT = 3;
export const MIN_LOADING_BAR_HEIGHT = 1;
export const MAX_LOADING_BAR_HEIGHT = 16;
export const INITIAL_LOADING_BAR_PERCENTAGE = 4;
export const MAX_TRICKLE_PERCENTAGE = 90;
export const MAX_LOADING_BAR_Z_INDEX = 2_147_483_647;

const LOADING_BAR_STATUSES = new Set<LoadingBarStatus>(['loading', 'success', 'error', 'warning']);

/** 声明式输入采用安全回退，避免非法运行时值破坏布局。 */
export function normalizeLoadingBarPercentage(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function normalizeLoadingBarHeight(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_LOADING_BAR_HEIGHT;
  }
  return Math.max(MIN_LOADING_BAR_HEIGHT, Math.min(MAX_LOADING_BAR_HEIGHT, value));
}

export function normalizeLoadingBarZIndex(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return Math.min(MAX_LOADING_BAR_Z_INDEX, Math.floor(value));
}

export function normalizeLoadingBarStatus(value: unknown): LoadingBarStatus {
  return LOADING_BAR_STATUSES.has(value as LoadingBarStatus)
    ? (value as LoadingBarStatus)
    : 'loading';
}

/** 颜色回调异常应由调用方感知，只有无效返回值会回退主题色。 */
export function resolveLoadingBarColor(
  color: LoadingBarColor | undefined,
  percentage: number
): string | undefined {
  const candidate = typeof color === 'function' ? color(percentage) : color;
  if (typeof candidate !== 'string') return undefined;
  const normalized = candidate.trim();
  return normalized || undefined;
}

/** 使用收敛算法推进，结果单调且永远停留在完成阈值之前。 */
export function getNextLoadingBarPercentage(value: number): number {
  const current = Math.min(MAX_TRICKLE_PERCENTAGE, normalizeLoadingBarPercentage(value));
  if (current >= MAX_TRICKLE_PERCENTAGE) return MAX_TRICKLE_PERCENTAGE;
  const increment = Math.max(0.5, (MAX_TRICKLE_PERCENTAGE - current) * 0.08);
  return Math.min(MAX_TRICKLE_PERCENTAGE, Number((current + increment).toFixed(3)));
}

const normalizeServiceColor = (color: unknown): LoadingBarColor | undefined => {
  if (color === undefined) return undefined;
  if (typeof color === 'function') return color as LoadingBarColor;
  if (typeof color !== 'string' || color.trim() === '') {
    throw new TypeError('LoadingBar color 必须是非空字符串或颜色函数');
  }
  return color.trim();
};

const normalizeServiceHeight = (height: unknown): number => {
  if (typeof height !== 'number' || !Number.isFinite(height)) {
    throw new TypeError('LoadingBar height 必须是有限数值');
  }
  if (height < 1 || height > MAX_LOADING_BAR_HEIGHT) {
    throw new RangeError(`LoadingBar height 必须在 1-${MAX_LOADING_BAR_HEIGHT} 之间`);
  }
  return height;
};

const normalizeServiceZIndex = (zIndex: unknown): number | undefined => {
  if (zIndex === undefined) return undefined;
  if (typeof zIndex !== 'number' || !Number.isFinite(zIndex)) {
    throw new TypeError('LoadingBar zIndex 必须是有限数值');
  }
  if (zIndex < 0 || zIndex > MAX_LOADING_BAR_Z_INDEX) {
    throw new RangeError(`LoadingBar zIndex 必须在 0-${MAX_LOADING_BAR_Z_INDEX} 之间`);
  }
  return Math.floor(zIndex);
};

/**
 * 先完整校验再生成新对象，配置失败时不会改变控制器已有状态。
 * 未声明字段会被忽略，因此被删除的旧选项不会进入组件属性。
 */
export function mergeLoadingBarOptions(
  current: NormalizedLoadingBarOptions,
  options: LoadingBarOptions
): NormalizedLoadingBarOptions {
  const nextColor = Object.prototype.hasOwnProperty.call(options, 'color')
    ? normalizeServiceColor(options.color)
    : current.color;
  const nextHeight =
    options.height === undefined ? current.height : normalizeServiceHeight(options.height);
  const nextZIndex = Object.prototype.hasOwnProperty.call(options, 'zIndex')
    ? normalizeServiceZIndex(options.zIndex)
    : current.zIndex;

  return {
    color: nextColor,
    height: nextHeight,
    zIndex: nextZIndex,
  };
}
