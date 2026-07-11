export const FLEX_GAP_PRESETS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type FlexGapPreset = keyof typeof FLEX_GAP_PRESETS;
export type FlexLength = number | string;

/** 把间距值规范为可用 CSS 长度，避免输出 NaN/Infinity。 */
export function resolveFlexGap(value?: FlexLength): string | undefined {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    return `${Math.max(0, value)}px`;
  }
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const preset = FLEX_GAP_PRESETS[normalized as FlexGapPreset];
  return preset === undefined ? normalized : `${preset}px`;
}

/** grow/shrink 不能为负数；非法值使用调用方默认值。 */
export function normalizeFlexFactor(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/** 数字 basis 使用非负像素，自定义 CSS 值会去除首尾空白。 */
export function resolveFlexBasis(value: FlexLength): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${Math.max(0, value)}px` : 'auto';
  }
  return value.trim() || 'auto';
}

/** order 必须是安全整数，避免生成浏览器会忽略的值。 */
export function normalizeFlexOrder(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const normalized = Math.trunc(value);
  return Number.isSafeInteger(normalized) ? normalized : 0;
}

/** 解析显式 flex；非法显式值会回退到 grow/shrink/basis 组合。 */
export function resolveFlexShorthand(
  flex: FlexLength | undefined,
  grow: number,
  shrink: number,
  basis: FlexLength
): string | undefined {
  if (typeof flex === 'number' && Number.isFinite(flex) && flex >= 0) return String(flex);
  if (typeof flex === 'string' && flex.trim()) return flex.trim();

  const normalizedGrow = normalizeFlexFactor(grow, 0);
  const normalizedShrink = normalizeFlexFactor(shrink, 1);
  const normalizedBasis = resolveFlexBasis(basis);
  if (normalizedGrow === 0 && normalizedShrink === 1 && normalizedBasis === 'auto') {
    return undefined;
  }
  return `${normalizedGrow} ${normalizedShrink} ${normalizedBasis}`;
}
