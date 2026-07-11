import type { InputAutosize } from './types';

export interface TextareaHeightMetrics {
  scrollHeight: number;
  lineHeight: string | number;
  fontSize: string | number;
  paddingTop: string | number;
  paddingBottom: string | number;
  borderTopWidth: string | number;
  borderBottomWidth: string | number;
  minRows: number;
  maxRows?: number;
}

export interface TextareaHeightResult {
  height: number;
  overflowY: 'auto' | 'hidden';
}

/** 将组件模型值转换为原生文本控件能够稳定表达的字符串。 */
export function normalizeInputValue(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

/** 原生 minlength/maxlength 只接受非负有限整数。 */
export function normalizeNonNegativeInteger(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || !Number.isInteger(value) || (value as number) < 0) {
    return undefined;
  }
  return value;
}

/** rows 和自动高度行数必须是正有限整数。 */
export function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || !Number.isInteger(value) || (value as number) <= 0) {
    return fallback;
  }
  return value as number;
}

/** 统一自动高度边界，保证最大行数永远不会小于最小行数。 */
export function resolveTextareaRows(
  autosize: InputAutosize,
  rows: number | undefined
): { minRows: number; maxRows: number | undefined } {
  const fallbackRows = normalizePositiveInteger(rows, 3);
  if (typeof autosize !== 'object') {
    return {
      minRows: fallbackRows,
      maxRows: undefined,
    };
  }

  const minRows = normalizePositiveInteger(autosize.minRows, fallbackRows);
  const normalizedMaxRows = normalizePositiveInteger(autosize.maxRows, 0);

  return {
    minRows,
    maxRows: normalizedMaxRows > 0 ? Math.max(minRows, normalizedMaxRows) : undefined,
  };
}

function parseCssPixels(value: string | number): number | undefined {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** 根据真实盒模型测量值计算 textarea 的 border-box 高度。 */
export function calculateTextareaHeight(metrics: TextareaHeightMetrics): TextareaHeightResult {
  const fontSize = parseCssPixels(metrics.fontSize) ?? 16;
  const lineHeight = parseCssPixels(metrics.lineHeight) ?? fontSize * 1.2;
  const padding =
    (parseCssPixels(metrics.paddingTop) ?? 0) + (parseCssPixels(metrics.paddingBottom) ?? 0);
  const border =
    (parseCssPixels(metrics.borderTopWidth) ?? 0) +
    (parseCssPixels(metrics.borderBottomWidth) ?? 0);
  const scrollHeight = Number.isFinite(metrics.scrollHeight)
    ? Math.max(0, metrics.scrollHeight)
    : 0;
  const naturalHeight = scrollHeight + border;
  const minHeight = metrics.minRows * lineHeight + padding + border;
  const maxHeight =
    metrics.maxRows === undefined
      ? Number.POSITIVE_INFINITY
      : metrics.maxRows * lineHeight + padding + border;
  const height = Math.min(Math.max(naturalHeight, minHeight), maxHeight);

  return {
    height,
    overflowY: naturalHeight > maxHeight ? 'auto' : 'hidden',
  };
}

/** 合并 aria-describedby 等由空格分隔的 ID 列表，并保持首次出现顺序。 */
export function mergeAriaTokens(...values: Array<string | undefined>): string | undefined {
  const tokens = new Set<string>();

  for (const value of values) {
    for (const token of value?.trim().split(/\s+/) ?? []) {
      if (token) tokens.add(token);
    }
  }

  return tokens.size > 0 ? [...tokens].join(' ') : undefined;
}
