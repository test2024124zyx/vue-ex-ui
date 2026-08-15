import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExQRCode from '../../../src/components/qrcode/ExQRCode.vue';

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

  it('refresh 返回可等待的生成 Promise', async () => {
    const wrapper = mount(ExQRCode, { props: { value: 'refreshable' } });
    await flushPromises();

    const result = (wrapper.vm as { refresh: () => Promise<void> }).refresh();
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(generator.toCanvas).toHaveBeenCalledTimes(2);
  });
});
