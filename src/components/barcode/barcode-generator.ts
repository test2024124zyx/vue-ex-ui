// Barcode Generator
// 条码生成器 - 使用 JsBarcode 库

import type { BarcodeOptions } from './types';

/**
 * 动态导入 JsBarcode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let JsBarcode: any = null;

async function loadJsBarcode() {
  if (JsBarcode) return JsBarcode;

  try {
    // 动态导入 jsbarcode
    const module = await import('jsbarcode');
    JsBarcode = module.default || module;
    return JsBarcode;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to load JsBarcode:', error);
    }
    throw new Error('JsBarcode library not available');
  }
}

/**
 * 生成条码
 * @param element SVG 元素
 * @param value 条码值
 * @param options 选项
 */
export async function generateBarcode(
  element: SVGSVGElement,
  value: string,
  options: BarcodeOptions = {}
): Promise<void> {
  const lib = await loadJsBarcode();

  if (!lib) {
    throw new Error('JsBarcode not loaded');
  }

  return new Promise((resolve, reject) => {
    try {
      lib(element, value, {
        ...options,
        valid: (valid: boolean) => {
          if (options.valid) {
            options.valid(valid);
          }
          if (valid) {
            resolve();
          } else {
            reject(new Error('Invalid barcode value'));
          }
        },
      });
    } catch (_error) {
      reject(_error);
    }
  });
}

/**
 * 验证条码值
 * @param value 条码值
 * @param format 条码格式
 */
export function validateBarcodeValue(value: string, format: string): boolean {
  // 基本验证规则
  const rules: Record<string, RegExp> = {
    CODE128: /^[ -~]+$/,
    CODE39: /^[0-9A-Z\-.$ /+%]+$/,
    EAN13: /^\d{12,13}$/,
    EAN8: /^\d{7,8}$/,
    UPC: /^\d{11,12}$/,
    ITF14: /^\d{13,14}$/,
    MSI: /^\d+$/,
    pharmacode: /^\d+$/,
    codabar: /^[A-D][0-9\-$:/.+]+[A-D]$/,
  };

  const rule = rules[format];
  return rule ? rule.test(value) : true;
}

/**
 * 格式化条码值
 * @param value 原始值
 * @param format 条码格式
 */
export function formatBarcodeValue(value: string, format: string): string {
  switch (format) {
    case 'EAN13':
      // EAN-13 需要 13 位数字
      return value.padStart(13, '0').slice(0, 13);
    case 'EAN8':
      // EAN-8 需要 8 位数字
      return value.padStart(8, '0').slice(0, 8);
    case 'UPC':
      // UPC-A 需要 12 位数字
      return value.padStart(12, '0').slice(0, 12);
    case 'ITF14':
      // ITF-14 需要 14 位数字
      return value.padStart(14, '0').slice(0, 14);
    default:
      return value;
  }
}
