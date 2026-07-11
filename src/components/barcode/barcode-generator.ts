import type { BarcodeOptions } from './types';

type BarcodeRenderer = (element: SVGSVGElement, value: string, options: BarcodeOptions) => void;

let renderer: BarcodeRenderer | null = null;
let rendererPromise: Promise<BarcodeRenderer> | null = null;

/** 动态加载并复用 JsBarcode，同一次并发加载只创建一个 Promise。 */
async function loadJsBarcode(): Promise<BarcodeRenderer> {
  if (renderer) return renderer;
  if (rendererPromise) return rendererPromise;

  rendererPromise = import('jsbarcode')
    .then(module => {
      renderer = (module.default || module) as unknown as BarcodeRenderer;
      return renderer;
    })
    .catch(error => {
      // 加载失败后允许下一次调用重试，错误通过 Promise 交给组件处理。
      rendererPromise = null;
      const loadError = new Error('无法加载 JsBarcode 依赖');
      (loadError as Error & { cause?: unknown }).cause = error;
      throw loadError;
    });

  return rendererPromise;
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
            reject(new Error('条码内容不符合指定格式'));
          }
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}
