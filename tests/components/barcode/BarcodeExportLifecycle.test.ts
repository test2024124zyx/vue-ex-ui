import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ExBarcode from '../../../src/components/barcode/ExBarcode.vue';
import { generateBarcode } from '../../../src/components/barcode/barcode-generator';

vi.mock('../../../src/components/barcode/barcode-generator', () => ({ generateBarcode: vi.fn() }));
const wrappers: Array<{ unmount(): void }> = [];

beforeEach(() => {
  vi.mocked(generateBarcode).mockReset().mockResolvedValue(undefined);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:barcode-export');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 240;
      naturalHeight = 100;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(value: string) {
        if (value) queueMicrotask(() => this.onload?.());
      }
    }
  );
});
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const createBarcode = async () => {
  const wrapper = mount(ExBarcode, { props: { value: '123456' } });
  wrappers.push(wrapper);
  await flushPromises();
  return wrapper;
};

describe('条码导出成功与失败恢复', () => {
  it('成功导出指定格式与文件名，释放图片和下载对象地址', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const data = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,valid');
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback =>
      callback(new Blob(['png']))
    );
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      names.push(this.download);
    });
    const wrapper = await createBarcode();
    expect(await wrapper.vm.toDataURL('image/jpeg')).toContain('data:image/jpeg');
    expect(data).toHaveBeenCalledWith('image/jpeg');
    wrapper.vm.download('业务条码.png');
    await flushPromises();
    expect(names).toEqual(['业务条码.png']);
    expect(drawImage).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
  });

  it('Canvas 不可用或编码被拒绝时返回空结果且不产生下载', async () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const wrapper = await createBarcode();
    expect(await wrapper.vm.toDataURL()).toBe('');
    context.mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new Error('画布污染');
    });
    expect(await wrapper.vm.toDataURL()).toBe('');
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(null));
    wrapper.vm.download();
    await flushPromises();
    expect(click).not.toHaveBeenCalled();
  });

  it('值校验回调失败进入错误状态，重新生成合法内容后恢复导出能力', async () => {
    vi.mocked(generateBarcode).mockImplementationOnce(async (_element, _value, options) => {
      options?.valid?.(false);
    });
    const wrapper = await createBarcode();
    expect(wrapper.get('[role="alert"]').text()).not.toBe('');
    expect(await wrapper.vm.toDataURL()).toBe('');
    await wrapper.setProps({ value: '654321' });
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});
