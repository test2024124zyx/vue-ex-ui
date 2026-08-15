import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExBarcode from '../../../src/components/barcode/ExBarcode.vue';
import type { ExBarcodeExposed } from '../../../src/components/barcode/types';
import { generateBarcode } from '../../../src/components/barcode/barcode-generator';

vi.mock('../../../src/components/barcode/barcode-generator', () => ({
  generateBarcode: vi.fn(),
}));

const mockedGenerate = vi.mocked(generateBarcode);

describe('ExBarcode', () => {
  beforeEach(() => {
    mockedGenerate.mockReset();
    mockedGenerate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('挂载与影响绘制的属性变化都会重新生成条码', async () => {
    const wrapper = mount(ExBarcode, { props: { value: 'first', width: 2 } });
    await nextTick();
    expect(mockedGenerate).toHaveBeenCalledOnce();

    await wrapper.setProps({ width: 3 });
    await nextTick();
    expect(mockedGenerate).toHaveBeenCalledTimes(2);
    expect(mockedGenerate.mock.calls[1]?.[2]).toMatchObject({ width: 3 });
  });

  it('将非有限、非正数和过大的绘制参数规范到安全范围', async () => {
    mount(ExBarcode, {
      props: {
        value: 'safe-options',
        width: Number.POSITIVE_INFINITY,
        height: -1,
        fontSize: 0,
        textMargin: -2,
        margin: Number.NaN,
        marginTop: Number.POSITIVE_INFINITY,
        marginBottom: -3,
        marginLeft: 100_000,
        marginRight: 12,
      },
    });
    await nextTick();

    expect(mockedGenerate).toHaveBeenCalledWith(
      expect.any(SVGSVGElement),
      'safe-options',
      expect.objectContaining({
        width: 2,
        height: 100,
        fontSize: 20,
        textMargin: 2,
        margin: 10,
        marginTop: undefined,
        marginBottom: undefined,
        marginLeft: 1024,
        marginRight: 12,
      })
    );
  });

  it('refresh 返回可等待的 Promise', async () => {
    let finish: (() => void) | undefined;
    mockedGenerate.mockImplementationOnce(() => new Promise<void>(resolve => (finish = resolve)));
    const wrapper = mount(ExBarcode, { props: { value: 'pending' } });
    const exposed = wrapper.vm as unknown as ExBarcodeExposed;

    const refreshResult = exposed.refresh();
    expect(refreshResult).toBeInstanceOf(Promise);
    finish?.();
    await refreshResult;
  });

  it('较早生成请求晚到的失败不会覆盖最新成功状态', async () => {
    let rejectFirst: ((reason: Error) => void) | undefined;
    mockedGenerate
      .mockImplementationOnce(() => new Promise<void>((_resolve, reject) => (rejectFirst = reject)))
      .mockResolvedValueOnce(undefined);
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const wrapper = mount(ExBarcode, { props: { value: 'first' } });

    await wrapper.setProps({ value: 'second' });
    await nextTick();
    rejectFirst?.(new Error('stale failure'));
    await nextTick();

    expect(wrapper.classes()).not.toContain('ex-barcode--error');
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('图片解码失败时 download 与 toDataURL 都回收 SVG 对象 URL', async () => {
    const createdUrls = ['blob:first', 'blob:second'];
    const createObjectURL = vi.fn(() => createdUrls.shift() ?? 'blob:extra');
    const revoke = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: revoke });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    class FailingImage {
      width = 0;
      height = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal('Image', FailingImage);

    const wrapper = mount(ExBarcode, { props: { value: '123' } });
    await nextTick();
    const exposed = wrapper.vm as unknown as ExBarcodeExposed;

    exposed.download('barcode.png');
    await expect(exposed.toDataURL()).resolves.toBe('');
    await Promise.resolve();

    expect(revoke).toHaveBeenCalledWith('blob:first');
    expect(revoke).toHaveBeenCalledWith('blob:second');
    vi.unstubAllGlobals();
  });

  it('导出像素超过浏览器预算时拒绝分配画布并回收对象 URL', async () => {
    const createdUrls = ['blob:download', 'blob:data-url'];
    const revoke = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => createdUrls.shift() ?? 'blob:extra'),
      revokeObjectURL: revoke,
    });
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['png'], { type: 'image/png' })));
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,unsafe');

    class OversizedImage {
      width = 8000;
      height = 5000;
      naturalWidth = 8000;
      naturalHeight = 5000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', OversizedImage);

    const wrapper = mount(ExBarcode, { props: { value: '123' } });
    await nextTick();
    const exposed = wrapper.vm as unknown as ExBarcodeExposed;

    exposed.download('barcode.png');
    await expect(exposed.toDataURL()).resolves.toBe('');
    await Promise.resolve();

    expect(drawImage).not.toHaveBeenCalled();
    expect(toBlob).not.toHaveBeenCalled();
    expect(toDataURL).not.toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:download');
    expect(revoke).toHaveBeenCalledWith('blob:data-url');
    expect(wrapper.find('.ex-barcode__error-text').text()).toContain(
      'Barcode image exceeds browser safe pixel limits'
    );
    vi.unstubAllGlobals();
  });

  it('组件卸载会取消待解码导出、释放对象 URL 并结束 Promise', async () => {
    const revoke = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:pending'),
      revokeObjectURL: revoke,
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    class PendingImage {
      width = 320;
      height = 120;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {}
    }
    vi.stubGlobal('Image', PendingImage);

    const wrapper = mount(ExBarcode, { props: { value: '123' } });
    await nextTick();
    const result = (wrapper.vm as unknown as ExBarcodeExposed).toDataURL();
    wrapper.unmount();

    expect(revoke).toHaveBeenCalledWith('blob:pending');
    await expect(result).resolves.toBe('');
    vi.unstubAllGlobals();
  });
});
