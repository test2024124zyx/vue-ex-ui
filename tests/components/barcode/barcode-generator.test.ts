import type { BarcodeOptions } from '../../../src/components/barcode/types';

const { renderBarcode } = vi.hoisted(() => ({
  renderBarcode: vi.fn(),
}));

vi.mock('jsbarcode', () => ({ default: renderBarcode }));

import { generateBarcode } from '../../../src/components/barcode/barcode-generator';

const createSvg = (): SVGSVGElement =>
  document.createElementNS('http://www.w3.org/2000/svg', 'svg');

describe('barcode-generator', () => {
  beforeEach(() => {
    renderBarcode.mockReset();
  });

  it('透传生成选项并等待 JsBarcode 确认内容有效', async () => {
    const valid = vi.fn();
    renderBarcode.mockImplementation(
      (_element: SVGSVGElement, _value: string, options: BarcodeOptions) => {
        options.valid?.(true);
      }
    );
    const svg = createSvg();

    await expect(
      generateBarcode(svg, 'EX-2026', { format: 'CODE128', width: 3, valid })
    ).resolves.toBeUndefined();

    expect(renderBarcode).toHaveBeenCalledWith(
      svg,
      'EX-2026',
      expect.objectContaining({ format: 'CODE128', width: 3 })
    );
    expect(valid).toHaveBeenCalledWith(true);
  });

  it('拒绝 JsBarcode 判定为无效的内容', async () => {
    renderBarcode.mockImplementation(
      (_element: SVGSVGElement, _value: string, options: BarcodeOptions) => {
        options.valid?.(false);
      }
    );

    await expect(generateBarcode(createSvg(), 'invalid')).rejects.toThrow('条码内容不符合指定格式');
  });

  it('保留渲染器抛出的异常供调用方定位', async () => {
    const renderError = new Error('render failed');
    renderBarcode.mockImplementation(() => {
      throw renderError;
    });

    await expect(generateBarcode(createSvg(), 'EX-2026')).rejects.toBe(renderError);
  });
});
