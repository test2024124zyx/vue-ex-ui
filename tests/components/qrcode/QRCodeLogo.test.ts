import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, ref } from 'vue';
import ExQRCode from '../../../src/components/qrcode/ExQRCode.vue';
import type { ExQRCodeExposed } from '../../../src/components/qrcode/types';

vi.mock('../../../src/components/qrcode/qrcode-generator', () => ({
  default: { toCanvas: vi.fn(async () => undefined) },
}));

class LogoImage {
  static instances: LogoImage[] = [];
  naturalWidth = 80;
  naturalHeight = 40;
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    LogoImage.instances.push(this);
  }
}

describe('二维码中心 Logo 导出', () => {
  let wrapper: VueWrapper | undefined;
  const drawImage = vi.fn();
  beforeEach(() => {
    LogoImage.instances.length = 0;
    drawImage.mockReset();
    vi.stubGlobal('Image', LogoImage);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(new Uint8Array([1]), { headers: { 'content-type': 'image/png' } })
      )
    );
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      () => `blob:logo-${LogoImage.instances.length}`
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      drawImage,
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,logo'
    );
  });
  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const api = () => wrapper!.vm as unknown as ExQRCodeExposed;

  it('等待 Logo 就绪后按比例居中合成，再允许同步导出并释放解码资源', async () => {
    wrapper = mount(ExQRCode, {
      props: { value: 'logo' },
      slots: { icon: '<img src="/brand.png" alt="brand">' },
    });
    await flushPromises();
    expect(api().toDataURL()).toBe('');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/brand.png'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    const image = LogoImage.instances[0]!;
    image.onload?.();
    await flushPromises();
    expect(drawImage).toHaveBeenCalledWith(image, 84, 92, 32, 16);
    expect(api().toDataURL()).toBe('data:image/png;base64,logo');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:logo-0');
  });

  it('换源使旧加载失效，卸载取消当前加载且不产生滞后事件', async () => {
    const src = ref('/first.png');
    wrapper = mount(ExQRCode, {
      props: { value: 'logo' },
      slots: { icon: () => h('img', { src: src.value }) },
    });
    await flushPromises();
    const first = LogoImage.instances[0]!;
    expect(first).toBeDefined();
    const staleLoad = first.onload;
    src.value = '/second.png';
    await flushPromises();
    expect(first.src).toBe('');
    expect(first.onload).toBeNull();
    expect(LogoImage.instances).toHaveLength(2);
    staleLoad?.();
    await flushPromises();
    expect(api().toDataURL()).toBe('');
    const second = LogoImage.instances[1]!;
    wrapper.unmount();
    expect(second.src).toBe('');
    await flushPromises();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(wrapper.emitted('error')).toBeUndefined();
    wrapper = undefined;
  });

  it('加载失败发出错误，恢复新 Logo 后能够再次导出', async () => {
    const src = ref('/broken.png');
    wrapper = mount(ExQRCode, {
      props: { value: 'logo' },
      slots: { icon: () => h('img', { src: src.value }) },
    });
    await flushPromises();
    expect(LogoImage.instances[0]).toBeDefined();
    LogoImage.instances[0]!.onerror?.();
    await flushPromises();
    expect(wrapper.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'LOAD_FAILED' });
    expect(api().toDataURL()).toBe('');
    src.value = '/good.png';
    await flushPromises();
    LogoImage.instances.at(-1)!.onload?.();
    await flushPromises();
    expect(api().toDataURL()).toContain('data:image/png');
  });

  it('同步导出和下载的安全异常均通知调用方，不冒充导出成功', async () => {
    wrapper = mount(ExQRCode, { props: { value: 'plain' } });
    await flushPromises();
    const failure = new DOMException('tainted', 'SecurityError');
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementation(() => {
      throw failure;
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    expect(api().toDataURL()).toBe('');
    expect(() => api().download()).not.toThrow();
    expect(click).not.toHaveBeenCalled();
    expect(wrapper.emitted('error')).toEqual([[failure], [failure]]);
  });

  it('内联 SVG 以独立图片合成并回收 Blob URL', async () => {
    wrapper = mount(ExQRCode, {
      props: { value: 'svg' },
      slots: { icon: '<svg viewBox="0 0 80 40"><path fill="red" d="M0 0h80v40H0z"/></svg>' },
    });
    await flushPromises();
    expect(LogoImage.instances).toHaveLength(1);
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]![0] as Blob;
    expect(blob.type).toBe('image/svg+xml');
    LogoImage.instances[0]!.onload?.();
    await flushPromises();
    expect(drawImage).toHaveBeenCalledWith(LogoImage.instances[0], 84, 92, 32, 16);
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('Canvas Logo 直接合成，显式 refresh 更新像素且不创建 Blob URL', async () => {
    wrapper = mount(ExQRCode, {
      props: { value: 'canvas' },
      slots: { icon: '<canvas width="80" height="40"></canvas>' },
    });
    await flushPromises();
    const logo = wrapper.get('.ex-qrcode__icon canvas').element;
    expect(drawImage).toHaveBeenCalledWith(logo, 84, 92, 32, 16);
    const before = drawImage.mock.calls.length;
    await api().refresh();
    expect(drawImage.mock.calls.length).toBeGreaterThan(before);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('修改 Logo DOM 后立即导出也不会返回旧图片，缩放与移除槽同步重建', async () => {
    const shown = ref(true);
    wrapper = mount(ExQRCode, {
      props: { value: 'dynamic' },
      slots: { icon: () => (shown.value ? h('img', { src: '/first.png' }) : null) },
    });
    await flushPromises();
    LogoImage.instances.at(-1)!.onload?.();
    await flushPromises();
    const logo = wrapper.get('.ex-qrcode__icon img').element as HTMLImageElement;
    logo.src = '/second.png';
    expect(api().toDataURL()).toBe('');
    await flushPromises();
    LogoImage.instances.at(-1)!.onload?.();
    await flushPromises();
    await wrapper.setProps({ iconSize: 60 });
    await flushPromises();
    LogoImage.instances.at(-1)!.onload?.();
    await flushPromises();
    expect(drawImage).toHaveBeenCalledWith(LogoImage.instances.at(-1), 74, 87, 52, 26);
    shown.value = false;
    await flushPromises();
    expect(api().toDataURL()).toContain('data:image/png');
  });

  it('跨域请求拒绝时保持不可导出，并传播原始加载失败原因', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('CORS denied'));
    wrapper = mount(ExQRCode, {
      props: { value: 'cors' },
      slots: { icon: '<img src="https://cdn.example/logo.png">' },
    });
    await flushPromises();
    expect(api().toDataURL()).toBe('');
    expect(wrapper.emitted('error')?.[0]?.[0]).toMatchObject({
      code: 'SOURCE_FETCH_FAILED',
      message: 'CORS denied',
    });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('Canvas 像素变化即使不改变 DOM，也不能继续同步导出旧 Logo', async () => {
    wrapper = mount(ExQRCode, {
      props: { value: 'pixels' },
      slots: { icon: '<canvas width="80" height="40"></canvas>' },
    });
    await flushPromises();
    const canvas = wrapper.get('.ex-qrcode__icon canvas').element as HTMLCanvasElement;
    Object.defineProperty(canvas, 'toDataURL', {
      configurable: true,
      value: vi.fn(() => 'data:image/png;base64,new-pixels'),
    });
    expect(api().toDataURL()).toBe('');
    const calls = drawImage.mock.calls.length;
    await flushPromises();
    expect(drawImage.mock.calls.length).toBeGreaterThan(calls);
    expect(api().toDataURL()).toBe('data:image/png;base64,logo');
  });

  it.each([
    '<span>文字 Logo</span>',
    '<img src="/one.png"><span>额外文字</span>',
    '<svg><foreignObject><div>HTML</div></foreignObject></svg>',
  ])('不支持的 Logo 内容明确报告错误：%s', async icon => {
    wrapper = mount(ExQRCode, { props: { value: 'unsupported' }, slots: { icon } });
    await flushPromises();
    expect(wrapper.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'INVALID_SOURCE' });
    expect(api().toDataURL()).toBe('');
  });
});
