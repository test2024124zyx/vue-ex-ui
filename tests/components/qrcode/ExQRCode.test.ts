import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import ExQRCode from '../../../src/components/qrcode/ExQRCode.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

const generator = vi.hoisted(() => ({
  toCanvas: vi.fn<(...args: unknown[]) => Promise<void>>(),
}));

vi.mock('../../../src/components/qrcode/qrcode-generator', () => ({
  default: generator,
}));

describe('ExQRCode', () => {
  const drawImage = vi.fn();

  beforeEach(() => {
    generator.toCanvas.mockReset();
    generator.toCanvas.mockResolvedValue(undefined);
    drawImage.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,ok');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('字符串样式保留圆角与尺寸，使用自定义圆角时以调用方为准', async () => {
    const wrapper = mount(ExQRCode, {
      props: { value: 'example', size: 120, borderRadius: 8, style: 'opacity: 0.5' },
    });
    const { style } = wrapper.element as HTMLElement;
    expect(style.width).toBe('120px');
    expect(style.borderRadius).toBe('8px');
    expect(style.opacity).toBe('0.5');

    await wrapper.setProps({ style: 'border-radius: 12px' });
    expect(style.borderRadius).toBe('12px');
  });

  it('过期生成不得在最新结果之后覆盖可见画布', async () => {
    let finishFirst: () => void = () => undefined;
    generator.toCanvas
      .mockImplementationOnce(
        canvas =>
          new Promise<void>(resolve => {
            finishFirst = () => {
              (canvas as HTMLCanvasElement).dataset.value = 'first';
              resolve();
            };
          })
      )
      .mockImplementationOnce(async canvas => {
        (canvas as HTMLCanvasElement).dataset.value = 'second';
      });

    const wrapper = mount(ExQRCode, { props: { value: 'first' } });
    await flushPromises();
    await wrapper.setProps({ value: 'second' });
    await flushPromises();

    expect((drawImage.mock.calls.at(-1)?.[0] as HTMLCanvasElement).dataset.value).toBe('second');
    const committedCount = drawImage.mock.calls.length;
    finishFirst();
    await flushPromises();

    expect(drawImage).toHaveBeenCalledTimes(committedCount);
  });

  it('只允许最新一次异步生成结果更新状态', async () => {
    let rejectFirst: (reason?: unknown) => void = () => undefined;
    generator.toCanvas
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectFirst = reject;
          })
      )
      .mockResolvedValueOnce(undefined);
    const wrapper = mount(ExQRCode, { props: { value: 'first' } });
    await flushPromises();

    await wrapper.setProps({ value: 'second' });
    await flushPromises();
    rejectFirst(new Error('stale failure'));
    await flushPromises();

    expect(wrapper.find('.ex-qrcode__error').exists()).toBe(false);
    expect((wrapper.vm as { toDataURL: () => string }).toDataURL()).toBe(
      'data:image/png;base64,ok'
    );
  });

  it('生成完成前不会导出尚未就绪的画布', async () => {
    generator.toCanvas.mockImplementationOnce(() => new Promise<void>(() => undefined));
    const wrapper = mount(ExQRCode, { props: { value: 'pending' } });
    await flushPromises();

    expect((wrapper.vm as { toDataURL: () => string }).toDataURL()).toBe('');
  });

  it('把非法或过大的尺寸限制在安全画布范围内', async () => {
    const wrapper = mount(ExQRCode, {
      props: { value: 'bounded', size: Number.POSITIVE_INFINITY, iconSize: -10 },
      slots: { icon: '<span>logo</span>' },
    });
    await flushPromises();

    expect(wrapper.attributes('style')).toContain('width: 200px');
    expect(generator.toCanvas.mock.calls.at(-1)?.[2]).toMatchObject({ width: 200 });
    expect(wrapper.get('.ex-qrcode__icon').attributes('style')).toContain('width: 0px');

    await wrapper.setProps({ size: 100_000, iconSize: 100_000 });
    await flushPromises();
    expect(wrapper.attributes('style')).toContain('width: 2048px');
    expect(generator.toCanvas.mock.calls.at(-1)?.[2]).toMatchObject({ width: 2048 });
    expect(wrapper.get('.ex-qrcode__icon').attributes('style')).toContain('width: 2048px');
  });

  it('加载与错误状态向辅助技术播报', async () => {
    let rejectGeneration: (reason?: unknown) => void = () => undefined;
    generator.toCanvas.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectGeneration = reject;
        })
    );
    const wrapper = mount(ExQRCode, { props: { value: 'broken' } });
    await flushPromises();

    expect(wrapper.get('.ex-qrcode__loading').attributes('role')).toBe('status');
    expect(wrapper.get('.ex-qrcode__loading').attributes('aria-live')).toBe('polite');

    rejectGeneration(new Error('generation failed'));
    await flushPromises();
    expect(wrapper.get('.ex-qrcode__error').attributes('role')).toBe('alert');
  });

  it('默认读屏名称随语言切换，显式名称优先', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () => [
          h(ExQRCode, { value: '项目编码' }),
          h(ExQRCode, { value: '项目编码', ariaLabel: '项目签到' }),
        ],
      },
    });
    try {
      const [localized, custom] = wrapper.findAll('.ex-qrcode');
      expect(localized?.attributes('aria-label')).toBe('二维码：项目编码');
      await wrapper.setProps({ locale: 'en-US' });
      expect(localized?.attributes('aria-label')).toBe('QR Code: 项目编码');
      expect(custom?.attributes('aria-label')).toBe('项目签到');
    } finally {
      wrapper.unmount();
    }
  });

  it('refresh 返回可等待的生成 Promise', async () => {
    const wrapper = mount(ExQRCode, { props: { value: 'refreshable' } });
    await flushPromises();

    const result = (wrapper.vm as { refresh: () => Promise<void> }).refresh();
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(generator.toCanvas).toHaveBeenCalledTimes(2);
  });

  it('下载使用调用方文件名，编码与下载失败通过 error 反馈', async () => {
    const links: HTMLAnchorElement[] = [];
    const connected: boolean[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      links.push(this);
      connected.push(this.isConnected);
    });
    const wrapper = mount(ExQRCode, { props: { value: 'downloadable' } });
    await flushPromises();
    wrapper.vm.download('业务二维码.png');
    expect(links.map(link => link.download)).toEqual(['业务二维码.png']);
    expect(connected).toEqual([true]);
    expect(links[0]?.isConnected).toBe(false);
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    click.mockImplementationOnce(function (this: HTMLAnchorElement) {
      links.push(this);
      throw new Error('下载被拒绝');
    });
    wrapper.vm.download();
    expect(links[1]?.isConnected).toBe(false);
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toBeInstanceOf(Error);
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementationOnce(() => {
      throw new Error('无法编码');
    });
    expect(wrapper.vm.toDataURL()).toBe('');
    expect(wrapper.emitted('error')).toHaveLength(2);
    wrapper.unmount();
  });
});
