import type { ImageLength } from './types';

const PLAIN_NUMBER = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
const CSS_LENGTH = /^(?:\d+(?:\.\d*)?|\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/i;
const CSS_FUNCTION = /^(?:calc|min|max|clamp|var|fit-content)\(.+\)$/i;
const DIMENSION_KEYWORDS = new Set(['auto', 'min-content', 'max-content', 'fit-content']);

const normalizeLength = (
  value: ImageLength | undefined,
  allowDimensionKeywords: boolean
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : undefined;
  }

  const normalized = value.trim();
  if (!normalized || /[;{}\n\r]/.test(normalized)) return undefined;
  if (PLAIN_NUMBER.test(normalized)) return `${normalized}px`;
  if (CSS_LENGTH.test(normalized) || CSS_FUNCTION.test(normalized)) return normalized;
  if (allowDimensionKeywords && DIMENSION_KEYWORDS.has(normalized.toLowerCase())) {
    return normalized.toLowerCase();
  }
  return undefined;
};

/** 规范图片宽高，兼容数字字符串并拒绝无效或危险声明。 */
export function normalizeImageDimension(value: ImageLength | undefined): string | undefined {
  return normalizeLength(value, true);
}

/** 规范圆角，圆角不接受 auto 等尺寸关键字。 */
export function normalizeImageRadius(value: ImageLength | undefined): string | undefined {
  return normalizeLength(value, false);
}
