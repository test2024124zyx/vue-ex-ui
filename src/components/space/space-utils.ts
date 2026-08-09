import { resolveSpacing, SPACING_PRESETS, type SpacingLength } from '../../utils/spacing';

/** Space 的语义预设映射到公共间距刻度。 */
export const SPACE_SIZE_PRESETS = {
  small: SPACING_PRESETS.sm,
  medium: SPACING_PRESETS.md,
  large: SPACING_PRESETS.lg,
} as const;

export type SpaceSizePreset = keyof typeof SPACE_SIZE_PRESETS;
export type SpaceGap = SpaceSizePreset | SpacingLength;

/** 将 Space 预设、数字或 CSS 长度解析为可用的 gap 值。 */
export function resolveSpaceGap(value?: SpaceGap): string | undefined {
  if (typeof value === 'string') {
    const preset = SPACE_SIZE_PRESETS[value as SpaceSizePreset];
    if (preset !== undefined) return `${preset}px`;
  }

  return resolveSpacing(value);
}
