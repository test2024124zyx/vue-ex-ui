import type { QRCodeLevel } from './types';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: QRCodeLevel;
  color?: { dark?: string; light?: string };
}

export const DEFAULT_QRCODE_SIZE = 200;
const MIN_QRCODE_SIZE = 32;
const MAX_QRCODE_SIZE = 2048;
const DEFAULT_QRCODE_MARGIN = 2;
const MAX_SYMBOL_MODULES = 177;
const FALLBACK_PIXELS_PER_MODULE = 4;
// 请求宽度不足时底层按默认比例绘制，限制最宽矩阵加边距后的最大画布。
const MAX_QRCODE_MARGIN = Math.floor(
  (MAX_QRCODE_SIZE / FALLBACK_PIXELS_PER_MODULE - MAX_SYMBOL_MODULES) / 2
);
const HEX_COLOR = /^#?(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;

export function normalizeQRCodeSize(size: number | undefined): number {
  return typeof size === 'number' && Number.isFinite(size)
    ? Math.min(MAX_QRCODE_SIZE, Math.max(MIN_QRCODE_SIZE, size))
    : DEFAULT_QRCODE_SIZE;
}

function normalizeColor(value: string, name: string): string {
  const color = typeof value === 'string' ? value.trim() : '';
  if (!HEX_COLOR.test(color)) throw new Error(`二维码${name}必须是 3、4、6 或 8 位十六进制颜色`);
  return color.startsWith('#') ? color : `#${color}`;
}

export function normalizeQRCodeOptions(options: QRCodeOptions) {
  const { margin, color, errorCorrectionLevel, width } = options;
  const { dark = '#000000', light = '#ffffff' } = color ?? {};
  return {
    width: normalizeQRCodeSize(width),
    margin:
      typeof margin === 'number' && Number.isFinite(margin) && margin >= 0
        ? Math.min(MAX_QRCODE_MARGIN, margin)
        : DEFAULT_QRCODE_MARGIN,
    errorCorrectionLevel: errorCorrectionLevel || 'M',
    color: {
      dark: normalizeColor(dark, '前景色'),
      light: normalizeColor(light, '背景色'),
    },
  };
}
