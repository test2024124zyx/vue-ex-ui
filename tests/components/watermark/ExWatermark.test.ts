import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExWatermark from '@/components/watermark/ExWatermark.vue';
import { ExWatermark as InstallableWatermark } from '@/components/watermark';
import {
  getRotatedSize,
  normalizeNumber,
  renderWatermarkTile,
} from '@/components/watermark/watermark-utils';

interface CanvasContextMock {
  scale: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  font: string;
  fillStyle: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  globalAlpha: number;
}

class ControllableImage {
  static instances: ControllableImage[] = [];

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string | null = null;
  referrerPolicy = '';
  private currentSrc = '';

  constructor() {
    ControllableImage.instances.push(this);
  }

  get src(): string {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
  }

  load(): void {
    this.onload?.();
  }

  fail(): void {
    this.onerror?.();
  }
}

const contexts: CanvasContextMock[] = [];
const canvasIds = new WeakMap<HTMLCanvasElement, number>();

const waitAsync = async (): Promise<void> => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
};

const createContext = (): CanvasContextMock => ({
  scale: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  restore: vi.fn(),
  measureText: vi.fn((text: string) => ({
    width: text.length * 10,
    actualBoundingBoxAscent: 12,
    actualBoundingBoxDescent: 4,
    fontBoundingBoxAscent: 12,
    fontBoundingBoxDescent: 4,
  })),
  font: '',
  fillStyle: '',
  textAlign: 'center',
  textBaseline: 'middle',
  globalAlpha: 1,
});

beforeEach(() => {
  contexts.length = 0;
  ControllableImage.instances.length = 0;

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
    const context = createContext();
    contexts.push(context);
    canvasIds.set(this, contexts.length);
    return context as unknown as CanvasRenderingContext2D;
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function () {
    return `data:image/png;base64,CANVAS_${canvasIds.get(this) ?? 0}`;
  });
  vi.stubGlobal('Image', ControllableImage);
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 2,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

describe('ExWatermark', () => {
  it('导出可安装组件', () => {
    expect(InstallableWatermark.name).toBe('ExWatermark');
    expect(InstallableWatermark.install).toBeInstanceOf(Function);
  });

  it('数字归一化和旋转几何在非法值与边界值下保持稳定', () => {
    expect(normalizeNumber(Number.NaN, 12, 1, 20)).toBe(12);
    expect(normalizeNumber(-5, 12, 1, 20)).toBe(1);
    expect(normalizeNumber(99, 12, 1, 20)).toBe(20);
    expect(getRotatedSize(80, 20, 90)).toEqual({ width: 20, height: 80 });
    expect(getRotatedSize(80, 20, 450)).toEqual({ width: 20, height: 80 });
  });

  it('Canvas 上下文不可用时返回空瓦片并报告错误', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
    const onError = vi.fn();

    const tile = await renderWatermarkTile({
      props: { type: 'text' },
      text: 'NO CANVAS',
      color: '',
      fontFamily: '',
      onError,
    });

    expect(tile).toEqual({ dataUrl: '', width: 0, height: 0 });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Canvas') })
    );
  });

  it('空文本不生成透明占位图片', async () => {
    const tile = await renderWatermarkTile({
      props: { type: 'text' },
      text: [],
      color: '',
      fontFamily: '',
      onError: vi.fn(),
    });

    expect(tile).toEqual({ dataUrl: '', width: 0, height: 0 });
  });

  it('图片缺少地址时报告错误并使用文本回退', async () => {
    const onError = vi.fn();
    const tile = await renderWatermarkTile({
      props: { type: 'image', repeat: false, dprAware: false },
      text: 'FALLBACK',
      color: '',
      fontFamily: '',
      onError,
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('imageSrc') })
    );
    expect(tile.dataUrl).toContain('data:image/png;base64,CANVAS_');
  });

  it('Canvas 导出失败时保留瓦片尺寸并报告错误', async () => {
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementationOnce(() => {
      throw new Error('tainted canvas');
    });
    const onError = vi.fn();
    const tile = await renderWatermarkTile({
      props: { type: 'text', staggered: false },
      text: 'EXPORT',
      color: '#fff',
      fontFamily: 'sans-serif',
      onError,
    });

    expect(tile.dataUrl).toBe('');
    expect(tile.width).toBeGreaterThan(0);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'tainted canvas' }));
  });

  it('按文字尺寸、旋转包围盒和间距生成不会裁切的瓦片', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        text: 'LONG WATERMARK',
        angle: 0,
        gapX: 20,
        gapY: 10,
        staggered: false,
        fullPage: false,
      },
    });

    await waitAsync();

    const overlayStyle = wrapper.get('.ex-watermark__overlay').attributes('style');
    expect(overlayStyle).toContain('background-size: 160px 26px');
    expect(contexts[1]?.fillText).toHaveBeenCalledWith('LONG WATERMARK', 0, 0);
  });

  it('默认使用错位平铺并绘制无缝边界副本', async () => {
    const wrapper = mount(ExWatermark, {
      props: { text: 'EX', angle: 0, gapX: 20, gapY: 10, fullPage: false },
    });

    await waitAsync();

    expect(wrapper.get('.ex-watermark__overlay').attributes('style')).toContain(
      'background-size: 80px 26px'
    );
    expect(contexts[1]?.fillText).toHaveBeenCalledTimes(3);
  });

  it('支持多行文本、字体样式和对齐方式', async () => {
    mount(ExWatermark, {
      props: {
        text: ['第一行', 'SECOND'],
        fontSize: 18,
        lineHeight: 24,
        fontWeight: 700,
        fontStyle: 'italic',
        textAlign: 'right',
        staggered: false,
      },
    });

    await waitAsync();

    const drawContext = contexts[1];
    expect(drawContext?.font).toContain('italic 700 18px');
    expect(drawContext?.textAlign).toBe('right');
    expect(drawContext?.fillText).toHaveBeenNthCalledWith(1, '第一行', 30, -12);
    expect(drawContext?.fillText).toHaveBeenNthCalledWith(2, 'SECOND', 30, 12);
  });

  it('未指定颜色和字体时跟随组件主题的计算样式', async () => {
    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
      const style = originalGetComputedStyle(element);
      if ((element as HTMLElement).classList?.contains('ex-watermark__overlay')) {
        Object.defineProperties(style, {
          color: { configurable: true, value: 'rgb(230, 240, 255)' },
          fontFamily: { configurable: true, value: '"JetBrains Mono", monospace' },
        });
      }
      return style;
    });

    mount(ExWatermark, { props: { text: 'THEME', fullPage: false } });
    await waitAsync();

    expect(contexts[1]?.fillStyle).toBe('rgb(230, 240, 255)');
    expect(contexts[1]?.font).toContain('"JetBrains Mono", monospace');
  });

  it('成功加载图片时使用高清安全设置和指定尺寸', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        type: 'image',
        imageSrc: '/logo.png',
        imageWidth: 80,
        imageHeight: 32,
        angle: 0,
        gapX: 20,
        gapY: 10,
        staggered: false,
        fullPage: false,
      },
    });

    await nextTick();
    const image = ControllableImage.instances[0];
    expect(image?.crossOrigin).toBe('anonymous');
    expect(image?.referrerPolicy).toBe('no-referrer');
    image?.load();
    await waitAsync();

    expect(contexts[1]?.drawImage).toHaveBeenCalled();
    expect(wrapper.get('.ex-watermark__overlay').attributes('style')).toContain(
      'background-size: 100px 42px'
    );
  });

  it('图片加载失败时发出错误事件并回退到文本水印', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        type: 'image',
        imageSrc: '/missing.png',
        text: '图片回退',
        fullPage: false,
      },
    });

    await nextTick();
    ControllableImage.instances[0]?.fail();
    await waitAsync();

    expect(wrapper.emitted('error')).toHaveLength(1);
    expect(contexts[1]?.fillText).toHaveBeenCalledWith('图片回退', 0, 0);
    expect(wrapper.vm.toDataURL()).toContain('data:image/png;base64,CANVAS_');
  });

  it('忽略较早完成的异步图片绘制结果', async () => {
    const wrapper = mount(ExWatermark, {
      props: { type: 'image', imageSrc: '/first.png', fullPage: false },
    });
    await nextTick();
    const firstImage = ControllableImage.instances[0];

    await wrapper.setProps({ imageSrc: '/second.png' });
    await nextTick();
    const secondImage = ControllableImage.instances[1];
    secondImage?.load();
    await waitAsync();
    const latestDataUrl = wrapper.vm.toDataURL();

    firstImage?.load();
    await waitAsync();
    expect(wrapper.vm.toDataURL()).toBe(latestDataUrl);
  });

  it('无效的尺寸和透明度会回退到安全范围', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        text: 'SAFE',
        gapX: -1,
        gapY: Number.NaN,
        fontSize: 0,
        opacity: 9,
        fullPage: false,
      },
    });

    await waitAsync();

    const style = wrapper.get('.ex-watermark__overlay').attributes('style');
    expect(style).not.toContain('NaN');
    expect(style).not.toContain('-1px');
    expect(style).toContain('opacity: 1');
  });

  it('运行时切换响应式配置会正确重绑和清理监听器', async () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(ExWatermark, {
      props: { responsive: false, fullPage: false },
    });
    await waitAsync();
    expect(addEventListener).not.toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
      expect.anything()
    );

    await wrapper.setProps({ responsive: true });
    await waitAsync();
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), {
      passive: true,
    });

    await wrapper.setProps({ throttleMs: 250 });
    await waitAsync();
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function), {
      passive: true,
    });

    wrapper.unmount();
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function), {
      passive: true,
    });
  });

  it('防篡改会恢复被删除或改写的覆盖层并通知调用方', async () => {
    const wrapper = mount(ExWatermark, {
      attachTo: document.body,
      props: { antiTamper: true, text: 'PROTECTED', fullPage: false },
    });
    await waitAsync();

    const root = wrapper.get('.ex-watermark').element;
    const overlay = wrapper.get('.ex-watermark__overlay').element as HTMLElement;
    const expectedStyle = overlay.getAttribute('style');
    overlay.className = 'tampered';
    overlay.style.display = 'none';
    overlay.hidden = true;
    overlay.remove();
    await waitAsync();

    expect(root.contains(overlay)).toBe(true);
    expect(overlay.className).toBe('ex-watermark__overlay');
    expect(overlay.hidden).toBe(false);
    expect(overlay.getAttribute('style')).toBe(expectedStyle);
    expect(wrapper.emitted('remove')).toHaveLength(1);
    wrapper.unmount();
  });

  it('关闭防篡改时不会恢复覆盖层', async () => {
    const wrapper = mount(ExWatermark, {
      props: { antiTamper: false, text: 'NORMAL', fullPage: false },
    });
    await waitAsync();
    const root = wrapper.get('.ex-watermark').element;
    const overlay = wrapper.get('.ex-watermark__overlay').element;

    overlay.remove();
    await waitAsync();
    expect(root.contains(overlay)).toBe(false);
  });

  it('只将覆盖层标记为装饰元素，不污染插槽内容语义', async () => {
    const wrapper = mount(ExWatermark, {
      slots: { default: '<article aria-label="业务内容">正文</article>' },
      props: { fullPage: false },
    });
    await waitAsync();

    expect(wrapper.get('.ex-watermark').attributes('role')).toBeUndefined();
    expect(wrapper.get('.ex-watermark__overlay').attributes('aria-hidden')).toBe('true');
    expect(wrapper.get('article').attributes('aria-label')).toBe('业务内容');
  });

  it('支持全屏、布局、交互和程序化控制属性', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        fullPage: true,
        repeat: false,
        offsetX: 18,
        offsetY: 12,
        opacity: 0.5,
        zIndex: 1200,
        pointerEvents: 'auto',
        selectable: true,
      },
    });
    await waitAsync();

    const overlay = wrapper.get('.ex-watermark__overlay');
    const rootStyle = wrapper.get('.ex-watermark').attributes('style');
    expect(overlay.classes()).toContain('is-fixed');
    expect(overlay.attributes('style')).toContain('background-repeat: no-repeat');
    expect(overlay.attributes('style')).toContain('background-position: 18px 12px');
    expect(overlay.attributes('style')).toContain('opacity: 0.5');
    expect(rootStyle).toContain('--ex-watermark-z-index: 1200');
    expect(rootStyle).toContain('--ex-watermark-pointer-events: auto');
    expect(rootStyle).toContain('--ex-watermark-user-select: text');
    expect(wrapper.vm.refresh).toBeInstanceOf(Function);
    expect(wrapper.vm.toDataURL()).toContain('data:image/png;base64,CANVAS_');
  });
});
