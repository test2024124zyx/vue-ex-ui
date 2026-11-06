import type { BarcodeOptions } from './types';

/**
 * 256 个 CODE128/CODE39 字符在最大模块宽度下约占 2—3 万像素，
 * 可将 SVG 主轴限制在浏览器常见的 32768 像素纹理边界附近，同时覆盖常规业务标识。
 */
export const MAX_BARCODE_VALUE_LENGTH = 256;
export const MAX_BARCODE_MODULE_WIDTH = 8;
export const MAX_BARCODE_HEIGHT = 2048;
export const MAX_BARCODE_FONT_SIZE = 256;
export const MAX_BARCODE_MARGIN = 1024;

const DEFAULT_BARCODE_MODULE_WIDTH = 2;
const DEFAULT_BARCODE_HEIGHT = 100;
const DEFAULT_BARCODE_FONT_SIZE = 20;
const DEFAULT_BARCODE_TEXT_MARGIN = 2;
const DEFAULT_BARCODE_MARGIN = 10;

const normalizePositiveMetric = (value: number | undefined, fallback: number, maximum: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(value, maximum);
};

const normalizeNonNegativeMetric = (
  value: number | undefined,
  fallback: number,
  maximum: number
) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback;
  return Math.min(value, maximum);
};

const normalizeOptionalMargin = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return Math.min(value, MAX_BARCODE_MARGIN);
};

/** 将所有会扩大 SVG 的数值统一约束到有限资源范围。 */
export function normalizeBarcodeOptions(options: BarcodeOptions): BarcodeOptions {
  return {
    ...options,
    width: normalizePositiveMetric(
      options.width,
      DEFAULT_BARCODE_MODULE_WIDTH,
      MAX_BARCODE_MODULE_WIDTH
    ),
    height: normalizePositiveMetric(options.height, DEFAULT_BARCODE_HEIGHT, MAX_BARCODE_HEIGHT),
    fontSize: normalizePositiveMetric(
      options.fontSize,
      DEFAULT_BARCODE_FONT_SIZE,
      MAX_BARCODE_FONT_SIZE
    ),
    textMargin: normalizeNonNegativeMetric(
      options.textMargin,
      DEFAULT_BARCODE_TEXT_MARGIN,
      MAX_BARCODE_MARGIN
    ),
    margin: normalizeNonNegativeMetric(options.margin, DEFAULT_BARCODE_MARGIN, MAX_BARCODE_MARGIN),
    marginTop: normalizeOptionalMargin(options.marginTop),
    marginBottom: normalizeOptionalMargin(options.marginBottom),
    marginLeft: normalizeOptionalMargin(options.marginLeft),
    marginRight: normalizeOptionalMargin(options.marginRight),
  };
}

/** 在加载 JsBarcode 前拒绝会线性放大 SVG 节点与路径的数据。 */
export function assertBarcodeValue(value: string): void {
  if (!value) throw new Error('条码内容不能为空');
  if (value.length > MAX_BARCODE_VALUE_LENGTH) {
    throw new Error(`条码内容不能超过 ${MAX_BARCODE_VALUE_LENGTH} 个字符`);
  }
}
