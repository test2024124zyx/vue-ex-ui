import { beforeEach, describe, expect, it, vi } from 'vitest';
import QRCodeGenerator from '../../../src/components/qrcode/qrcode-generator';

const toCanvas = vi.fn().mockResolvedValue(undefined);
const toDataURL = vi.fn().mockResolvedValue('data:image/png;base64,test');

vi.mock('qrcode', () => ({
  toCanvas,
  toDataURL,
}));

describe('QRCodeGenerator', () => {
  beforeEach(() => {
    toCanvas.mockClear();
    toDataURL.mockClear();
  });

  it('使用默认生成参数并将非法尺寸回退到安全值', async () => {
    const canvas = document.createElement('canvas');

    await QRCodeGenerator.toCanvas(canvas, 'default', { width: Number.NaN });

    expect(toCanvas).toHaveBeenCalledWith(
      canvas,
      'default',
      expect.objectContaining({
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      })
    );
  });

  it('限制过小和过大的尺寸，并保留显式颜色、边距和纠错级别', async () => {
    const canvas = document.createElement('canvas');

    await QRCodeGenerator.toCanvas(canvas, 'small', {
      width: 1,
      margin: 0,
      errorCorrectionLevel: 'H',
      color: { dark: '#111111', light: '#eeeeee' },
    });
    await QRCodeGenerator.toCanvas(canvas, 'large', { width: 4096 });

    expect(toCanvas.mock.calls[0][2]).toEqual({
      width: 32,
      margin: 0,
      errorCorrectionLevel: 'H',
      color: { dark: '#111111', light: '#eeeeee' },
    });
    expect(toCanvas.mock.calls[1][2]).toEqual({
      width: 2048,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });
  });

  it('生成数据 URL 时透传完整选项并返回第三方结果', async () => {
    const result = await QRCodeGenerator.toDataURL('payload', {
      width: 512,
      margin: 4,
      errorCorrectionLevel: 'Q',
      color: { dark: '#123456' },
    });

    expect(result).toBe('data:image/png;base64,test');
    expect(toDataURL).toHaveBeenCalledWith('payload', {
      width: 512,
      margin: 4,
      errorCorrectionLevel: 'Q',
      color: { dark: '#123456', light: '#ffffff' },
    });
  });
});
