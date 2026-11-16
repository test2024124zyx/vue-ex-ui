import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import QRCodeGenerator from '../../../src/components/qrcode/qrcode-generator';
import ExQRCode from '../../../src/components/qrcode/ExQRCode.vue';

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

  it.each(['red', '#xyz', '#12345', '#1234567', ''])(
    '拒绝非法颜色 %j，两个入口都不调用渲染器',
    async dark => {
      const options = { color: { dark } };
      await expect(
        QRCodeGenerator.toCanvas(document.createElement('canvas'), 'value', options)
      ).rejects.toThrow('前景色');
      await expect(QRCodeGenerator.toDataURL('value', options)).rejects.toThrow('前景色');
      expect(toCanvas).not.toHaveBeenCalled();
      expect(toDataURL).not.toHaveBeenCalled();
    }
  );

  it('规范化透明色和边距，非有限和负值边距使用默认，过大边距限制画布尺寸', async () => {
    const canvas = document.createElement('canvas');
    await QRCodeGenerator.toCanvas(canvas, 'value', {
      margin: Number.POSITIVE_INFINITY,
      color: { dark: '#1234', light: ' ABCDEF80 ' },
    });
    await QRCodeGenerator.toDataURL('value', { margin: -1 });
    await QRCodeGenerator.toDataURL('value', { margin: Number.MAX_SAFE_INTEGER });
    expect(toCanvas).toHaveBeenCalledWith(
      canvas,
      'value',
      expect.objectContaining({ margin: 2, color: { dark: '#1234', light: '#ABCDEF80' } })
    );
    expect(toDataURL.mock.calls[0]?.[1].margin).toBe(2);
    const normalizedMargin = toDataURL.mock.calls[1]?.[1].margin as number;
    // qrcode 在宽度不足时按每模块 4 像素绘制，最大二维码矩阵宽 177 个模块。
    expect((177 + normalizedMargin * 2) * 4).toBeLessThanOrEqual(2048);
  });

  it('组件报告非法背景色并停止导出，修正后恢复生成', async () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,ok');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(ExQRCode, { props: { value: 'payload', bgColor: 'rgb(255,255,255)' } });
    try {
      await flushPromises();
      expect(wrapper.emitted('error')).toEqual([
        [expect.objectContaining({ message: expect.stringContaining('背景色') })],
      ]);
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
      expect(wrapper.vm.toDataURL()).toBe('');
      expect(toCanvas).not.toHaveBeenCalled();

      await wrapper.setProps({ bgColor: '#ffff' });
      await flushPromises();
      expect(toCanvas).toHaveBeenCalledOnce();
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.vm.toDataURL()).toBe('data:image/png;base64,ok');
    } finally {
      wrapper.unmount();
      context.mockRestore();
      encode.mockRestore();
      consoleError.mockRestore();
    }
  });
});
