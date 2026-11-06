/** 组件间距的公共预设，保证 Flex、Grid 和 Space 使用同一套刻度。 */
export const SPACING_PRESETS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type SpacingPreset = keyof typeof SPACING_PRESETS;
export type SpacingLength = number | string;

/** 将数字或 CSS 长度规范为可用于 gap 的值，阻断无效数字进入样式。 */
export function resolveSpacing(value?: SpacingLength): string | undefined {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    return `${Math.max(0, value)}px`;
  }

  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;

  const preset = SPACING_PRESETS[normalized as SpacingPreset];
  return preset === undefined ? normalized : `${preset}px`;
}
