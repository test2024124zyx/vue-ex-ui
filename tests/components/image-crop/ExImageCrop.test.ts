import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, type SetupContext } from 'vue';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import ExImageCrop from '../../../src/components/image-crop/ExImageCrop.vue';
import { ExImageCropError } from '../../../src/components/image-crop/errors';
import type { CropResult, ExImageCropExposed } from '../../../src/components/image-crop/types';
import type { LoadedBrowserImageResource } from '../../../src/utils/image-resource';
import { setLocale } from '../../../src/locale';

const resourceMocks = vi.hoisted(() => ({
  loadBrowserImageResource: vi.fn(),
}));

const cropMocks = vi.hoisted(() => ({
  drawCropPreview: vi.fn(),
  renderCrop: vi.fn(),
}));

vi.mock('../../../src/utils/image-resource', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../src/utils/image-resource')>();
  return {
    ...actual,
    loadBrowserImageResource: resourceMocks.loadBrowserImageResource,
  };
});

vi.mock('../../../src/components/image-crop/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../src/components/image-crop/utils')>();
  return {
    ...actual,
    drawCropPreview: cropMocks.drawCropPreview,
    renderCrop: cropMocks.renderCrop,
  };
});

const ControlStub = {
  name: 'ImageCropControlStub',
  inheritAttrs: false,
  props: {
    loading: Boolean,
    disabled: Boolean,
    icon: String,
    size: [Number, String],
  },
  emits: ['click'],
  setup(props: Record<string, unknown>, { attrs, emit, slots }: SetupContext) {
    return () => {
      if (typeof props.icon === 'string' && props.icon.length > 0) {
        return h('span', { class: 'icon-stub', 'aria-hidden': 'true' });
      }
      return h(
        'button',
        {
          ...attrs,
          type: 'button',
          disabled: props.disabled === true || props.loading === true,
          onClick: (event: MouseEvent) => emit('click', event),
        },
        slots.default?.()
      );
    };
  },
};

const createResource = (name = 'current'): LoadedBrowserImageResource => ({
  image: {
    naturalWidth: 800,
    naturalHeight: 600,
  } as HTMLImageElement,
  blob: new Blob([name], { type: 'image/png' }),
  objectUrl: `blob:${name}`,
  size: name.length,
  mediaType: 'image/png',
  dimension: { width: 800, height: 600 },
  dispose: vi.fn(),
});

const cropResult: CropResult = {
  blob: new Blob(['crop'], { type: 'image/png' }),
  previewArea: { x: 70, y: 60, width: 360, height: 280 },
  sourceArea: { x: 40, y: 20, width: 720, height: 560 },
  originalSize: { width: 800, height: 600 },
  outputSize: { width: 720, height: 560 },
  outputType: 'image/png',
  rotation: 0,
  zoom: 1,
};

describe('ExImageCrop', () => {
  let wrapper: VueWrapper | null = null;
  let resizeCallback: ResizeObserverCallback | null = null;

  const mountCrop = async (props: Record<string, unknown> = {}) => {
    wrapper = mount(ExImageCrop, {
      props: {
        src: new Blob(['source'], { type: 'image/png' }),
        ...props,
      },
      attachTo: document.body,
      global: {
        stubs: {
          ExButton: ControlStub,
          ExIcon: ControlStub,
        },
      },
    });
    await flushPromises();
    await nextTick();
    return wrapper;
  };

  const dispatchPointer = async (
    element: Element,
    type: string,
    init: MouseEventInit & { pointerId: number }
  ): Promise<void> => {
    const event = new MouseEvent(type, { ...init, bubbles: true });
    Object.defineProperty(event, 'pointerId', { value: init.pointerId });
    element.dispatchEvent(event);
    await nextTick();
  };

  beforeEach(() => {
    setLocale('en-US');
    resizeCallback = null;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback;
        }

        observe(): void {
          resizeCallback?.(
            [
              {
                contentRect: {
                  width: 500,
                  height: 400,
                },
              } as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver
          );
        }

        disconnect = vi.fn();
        unobserve = vi.fn();
      }
    );
    Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    resourceMocks.loadBrowserImageResource.mockResolvedValue(createResource());
    cropMocks.drawCropPreview.mockReset();
    cropMocks.renderCrop.mockResolvedValue({
      blob: cropResult.blob,
      sourceArea: cropResult.sourceArea,
      outputSize: cropResult.outputSize,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.replaceChildren();
    setLocale('en-US');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'setPointerCapture');
    Reflect.deleteProperty(HTMLElement.prototype, 'releasePointerCapture');
    resourceMocks.loadBrowserImageResource.mockReset();
    cropMocks.drawCropPreview.mockReset();
    cropMocks.renderCrop.mockReset();
  });

  it.each([
    { minZoom: 2, maxZoom: 4, expected: 2 },
    { minZoom: 0.1, maxZoom: 0.5, expected: 0.5 },
  ])('初始和重置缩放遵循 $minZoom 到 $maxZoom 的边界', async ({ minZoom, maxZoom, expected }) => {
    const mounted = await mountCrop({ minZoom, maxZoom });
    const api = mounted.vm as unknown as ExImageCropExposed;
    expect((await api.crop()).zoom).toBe(expected);
    api.zoomIn();
    api.reset();
    expect((await api.crop()).zoom).toBe(expected);
  });

  it('容器尺寸变化的绘制失败进入错误事件，恢复有效尺寸后继续裁剪', async () => {
    const mounted = await mountCrop();
    const api = mounted.vm as unknown as ExImageCropExposed;
    const previous = api.getArea();
    cropMocks.drawCropPreview.mockImplementationOnce(() => {
      throw new ExImageCropError('INVALID_DIMENSION', 'oversized');
    });
    expect(() =>
      resizeCallback?.(
        [{ contentRect: { width: 10000, height: 10000 } } as ResizeObserverEntry],
        {} as ResizeObserver
      )
    ).not.toThrow();
    expect(mounted.emitted('error')?.at(-1)?.[0]).toMatchObject({ code: 'INVALID_DIMENSION' });
    expect(api.getArea()).toEqual(previous);
    resizeCallback?.(
      [{ contentRect: { width: 800, height: 600 } } as ResizeObserverEntry],
      {} as ResizeObserver
    );
    await expect(api.crop()).resolves.toHaveProperty('blob');
  });

  it('加载一次资源、建立布局并发出不可变尺寸快照', async () => {
    const resource = createResource('loaded');
    resourceMocks.loadBrowserImageResource.mockResolvedValueOnce(resource);
    const current = await mountCrop();

    expect(resourceMocks.loadBrowserImageResource).toHaveBeenCalledOnce();
    expect(cropMocks.drawCropPreview).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      resource.image,
      { width: 500, height: 400 },
      expect.objectContaining({ rotation: 0, displayScale: 0.5625 }),
      expect.any(Number)
    );
    expect(current.emitted('load')).toEqual([[{ width: 800, height: 600 }]]);
    expect(current.find('.ex-image-crop__crop-box').exists()).toBe(true);
    expect(current.attributes('aria-busy')).toBe('false');

    const area = (current.vm as unknown as ExImageCropExposed).getArea();
    area.x = -999;
    expect((current.vm as unknown as ExImageCropExposed).getArea().x).not.toBe(-999);
  });

  it('密集网格不随行列数分配 DOM，保持固定绘制节点', async () => {
    const mounted = await mountCrop({ gridRows: 1000, gridCols: 1000 });
    const grid = mounted.find('.ex-image-crop__grid');
    expect(grid.element.childElementCount).toBeLessThanOrEqual(2);
    expect((grid.element as HTMLElement).style.getPropertyValue('--ex-crop-grid-rows')).toBe(
      '1000'
    );
    await mounted.setProps({ gridRows: 1, gridCols: 1 });
    expect((grid.element as HTMLElement).style.getPropertyValue('--ex-crop-grid-rows')).toBe('1');
  });

  it('来源竞态只接受最新结果并释放过期资源', async () => {
    let resolveFirst: ((resource: LoadedBrowserImageResource) => void) | undefined;
    const first = createResource('first');
    const second = createResource('second');
    let firstSignal: AbortSignal | undefined;
    resourceMocks.loadBrowserImageResource
      .mockImplementationOnce((_source, signal: AbortSignal) => {
        firstSignal = signal;
        return new Promise(resolve => {
          resolveFirst = resolve;
        });
      })
      .mockResolvedValueOnce(second);

    wrapper = mount(ExImageCrop, {
      props: { src: 'https://example.com/first.png' },
      global: { stubs: { ExButton: ControlStub, ExIcon: ControlStub } },
    });
    await nextTick();
    await wrapper.setProps({ src: 'https://example.com/second.png' });
    await flushPromises();

    expect(firstSignal?.aborted).toBe(true);
    resolveFirst?.(first);
    await flushPromises();

    expect(first.dispose).toHaveBeenCalledOnce();
    expect(second.dispose).not.toHaveBeenCalled();
    expect(wrapper.emitted('load')).toEqual([[{ width: 800, height: 600 }]]);
  });

  it('加载失败显示可感知错误且不会渲染裁剪框', async () => {
    const error = new ExImageCropError('LOAD_FAILED', 'broken image');
    resourceMocks.loadBrowserImageResource.mockRejectedValueOnce(error);
    const current = await mountCrop();

    expect(current.get('[role="alert"]').text()).toContain('broken image');
    expect(current.find('.ex-image-crop__crop-box').exists()).toBe(false);
    expect(current.emitted('error')).toEqual([[error]]);
  });

  it('非法运行时配置阻止加载，修正后自动恢复同一来源', async () => {
    const current = await mountCrop({ quality: 2 });

    expect(resourceMocks.loadBrowserImageResource).not.toHaveBeenCalled();
    expect(current.find('.ex-image-crop__crop-box').exists()).toBe(false);
    expect(current.emitted('error')?.[0]?.[0]).toEqual(
      expect.objectContaining({ code: 'INVALID_CONFIGURATION' })
    );

    await current.setProps({ quality: 0.8 });
    await flushPromises();
    expect(resourceMocks.loadBrowserImageResource).toHaveBeenCalledOnce();
    expect(current.find('.ex-image-crop__crop-box').exists()).toBe(true);
  });

  it('工具栏无重复结构并提供按钮名称、类型和禁用状态', async () => {
    const current = await mountCrop({ toolbarPosition: 'top' });

    expect(current.findAll('.ex-image-crop__toolbar')).toHaveLength(1);
    expect(current.get('.ex-image-crop__toolbar').classes()).toContain(
      'ex-image-crop__toolbar--top'
    );
    const nativeButtons = current.findAll('.ex-image-crop__toolbar-button');
    expect(nativeButtons).toHaveLength(5);
    for (const button of nativeButtons) {
      expect(button.attributes('type')).toBe('button');
      expect(button.attributes('aria-label')).toBeTruthy();
      expect(button.attributes('title')).toBe(button.attributes('aria-label'));
    }
  });

  it('隐藏工具栏时仍可通过暴露方法完成裁剪', async () => {
    const current = await mountCrop({ showToolbar: false });

    expect(current.find('.ex-image-crop__toolbar').exists()).toBe(false);
    await expect((current.vm as unknown as ExImageCropExposed).crop()).resolves.toMatchObject({
      blob: cropResult.blob,
      sourceArea: cropResult.sourceArea,
    });
  });

  it('缩放、旋转与重置共享同一预览和事件状态', async () => {
    const current = await mountCrop({ zoomStep: 0.25, minZoom: 0.75, maxZoom: 1.25 });
    cropMocks.drawCropPreview.mockClear();

    await current.get('[aria-label="Zoom in"]').trigger('click');
    await current.get('[aria-label="Zoom in"]').trigger('click');
    await current.get('[aria-label="Rotate right"]').trigger('click');
    await current.get('[aria-label="Rotate left"]').trigger('click');

    expect(current.emitted('zoom')).toEqual([[1.25]]);
    expect(current.emitted('rotate')).toEqual([[90], [0]]);
    expect(cropMocks.drawCropPreview).toHaveBeenCalled();

    await current.get('[aria-label="Reset"]').trigger('click');
    expect((current.vm as unknown as ExImageCropExposed).getArea()).toEqual(
      expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) })
    );
  });

  it('编码参数变化不重置选区，缩放边界变化会收敛当前状态', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;
    exposed.setArea({ x: 100, y: 80, width: 200, height: 100 });
    const selected = exposed.getArea();

    await current.setProps({ quality: 0.7, outputType: 'image/jpeg' });
    expect(exposed.getArea()).toEqual(selected);

    await current.setProps({ minZoom: 1.5 });
    expect(current.emitted('zoom')?.at(-1)).toEqual([1.5]);
    expect(cropMocks.drawCropPreview).toHaveBeenCalled();
  });

  it('裁剪框支持指针拖动并被限制在当前图片边界', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;
    exposed.setArea({ x: 80, y: 60, width: 200, height: 120 });
    await nextTick();

    await dispatchPointer(current.get('.ex-image-crop__crop-box').element, 'pointerdown', {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    await dispatchPointer(current.get('.ex-image-crop__container').element, 'pointermove', {
      pointerId: 1,
      clientX: -1000,
      clientY: -1000,
    });
    await dispatchPointer(current.get('.ex-image-crop__container').element, 'pointerup', {
      pointerId: 1,
    });

    const area = exposed.getArea();
    expect(area.x).toBeGreaterThanOrEqual(25);
    expect(area.y).toBeGreaterThanOrEqual(31.25);
    expect(current.emitted('change')?.length).toBeGreaterThan(1);
  });

  it('圆形和固定比例裁剪仅显示角手柄并保持约束', async () => {
    const circle = await mountCrop({ shape: 'circle' });
    expect(circle.findAll('.ex-image-crop__handle')).toHaveLength(4);
    const circleArea = (circle.vm as unknown as ExImageCropExposed).getArea();
    expect(circleArea.width).toBe(circleArea.height);
    circle.unmount();
    wrapper = null;

    const fixed = await mountCrop({ aspectRatio: 16 / 9 });
    expect(fixed.findAll('.ex-image-crop__handle')).toHaveLength(4);
    const fixedArea = (fixed.vm as unknown as ExImageCropExposed).getArea();
    expect(fixedArea.width / fixedArea.height).toBeCloseTo(16 / 9);
  });

  it('键盘可移动裁剪框并通过手柄调整尺寸', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;
    const before = exposed.getArea();

    await current.get('.ex-image-crop__crop-box').trigger('keydown', {
      key: 'ArrowRight',
      shiftKey: true,
    });
    expect(exposed.getArea().x).toBe(before.x + 10);

    const beforeResize = exposed.getArea();
    await current.get('[data-direction="se"]').trigger('keydown', {
      key: 'ArrowRight',
    });
    expect(exposed.getArea().width).toBe(beforeResize.width + 1);
  });

  it('确认裁剪只执行一次并返回包含真实变换快照的结果', async () => {
    let resolveCrop:
      | ((value: {
          blob: Blob;
          sourceArea: CropResult['sourceArea'];
          outputSize: CropResult['outputSize'];
        }) => void)
      | undefined;
    cropMocks.renderCrop.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCrop = resolve;
        })
    );
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;

    const first = exposed.crop();
    const second = exposed.crop();
    expect(cropMocks.renderCrop).toHaveBeenCalledOnce();
    resolveCrop?.({
      blob: cropResult.blob,
      sourceArea: cropResult.sourceArea,
      outputSize: cropResult.outputSize,
    });

    await expect(first).resolves.toEqual(await second);
    const result = await first;
    expect(result).toEqual(
      expect.objectContaining({
        blob: cropResult.blob,
        sourceArea: cropResult.sourceArea,
        outputSize: cropResult.outputSize,
        outputType: 'image/png',
        rotation: 0,
        zoom: 1,
      })
    );
    expect(result.previewArea).not.toBe(exposed.getArea());
  });

  it('异步裁剪期间属性变化不会篡改已启动任务的结果语义', async () => {
    let resolveCrop:
      | ((value: {
          blob: Blob;
          sourceArea: CropResult['sourceArea'];
          outputSize: CropResult['outputSize'];
        }) => void)
      | undefined;
    cropMocks.renderCrop.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCrop = resolve;
        })
    );
    const current = await mountCrop();
    const pending = (current.vm as unknown as ExImageCropExposed).crop();

    await current.setProps({ outputType: 'image/jpeg', quality: 0.6 });
    resolveCrop?.({
      blob: cropResult.blob,
      sourceArea: cropResult.sourceArea,
      outputSize: cropResult.outputSize,
    });

    await expect(pending).resolves.toEqual(expect.objectContaining({ outputType: 'image/png' }));
    expect(cropMocks.renderCrop).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ outputType: 'image/png', quality: 0.9 })
    );
  });

  it('工具栏确认发出 crop，取消发出 cancel', async () => {
    const current = await mountCrop();

    await current.get('[data-action="crop"]').trigger('click');
    await flushPromises();
    await current.get('[data-action="cancel"]').trigger('click');

    expect(current.emitted('crop')?.[0]?.[0]).toEqual(
      expect.objectContaining({ blob: cropResult.blob })
    );
    expect(current.emitted('cancel')).toEqual([[]]);
  });

  it.each(['cancel', 'reset', 'source', 'unmount'] as const)(
    '编码完成与 %s 交错时旧裁剪结果不再发布',
    async action => {
      let finish!: (value: {
        blob: Blob;
        sourceArea: CropResult['sourceArea'];
        outputSize: CropResult['outputSize'];
      }) => void;
      cropMocks.renderCrop.mockImplementationOnce(() => new Promise(resolve => (finish = resolve)));
      const current = await mountCrop();
      await current.get('[data-action="crop"]').trigger('click');
      finish({
        blob: cropResult.blob,
        sourceArea: cropResult.sourceArea,
        outputSize: cropResult.outputSize,
      });
      if (action === 'cancel') await current.get('[data-action="cancel"]').trigger('click');
      else if (action === 'reset') (current.vm as unknown as ExImageCropExposed).reset();
      else if (action === 'source')
        await current.setProps({ src: new Blob(['新图'], { type: 'image/png' }) });
      else {
        current.unmount();
        wrapper = null;
      }
      await flushPromises();
      expect(current.emitted('crop')).toBeUndefined();
      expect(current.emitted('error')).toBeUndefined();
      if (action === 'cancel') expect(current.emitted('cancel')).toHaveLength(1);
    }
  );

  it('重置撤销正在拖动的旧起点，后续仍可开始新拖动', async () => {
    const current = await mountCrop();
    const api = current.vm as unknown as ExImageCropExposed;
    api.setArea({ x: 100, y: 100, width: 100, height: 100 });
    const box = current.get('.ex-image-crop__crop-box').element;
    const container = current.get('.ex-image-crop__container').element;
    await dispatchPointer(box, 'pointerdown', {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    api.reset();
    const resetArea = api.getArea();
    await dispatchPointer(container, 'pointermove', { pointerId: 1, clientX: 110, clientY: 100 });
    expect(api.getArea()).toEqual(resetArea);
    await dispatchPointer(box, 'pointerdown', {
      pointerId: 2,
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    await dispatchPointer(container, 'pointermove', { pointerId: 2, clientX: 110, clientY: 100 });
    expect(api.getArea().x).toBe(resetArea.x + 10);
  });

  it('裁剪失败只发出一次稳定错误并恢复忙碌状态', async () => {
    const error = new ExImageCropError('ENCODE_FAILED', 'encode failed');
    cropMocks.renderCrop.mockRejectedValueOnce(error);
    const current = await mountCrop();

    await current.get('[data-action="crop"]').trigger('click');
    await flushPromises();

    expect(current.emitted('error')).toEqual([[error]]);
    expect(current.attributes('aria-busy')).toBe('false');
  });

  it('未加载完成时 crop 明确拒绝而不是生成空结果', async () => {
    resourceMocks.loadBrowserImageResource.mockImplementationOnce(
      () => new Promise(() => undefined)
    );
    wrapper = mount(ExImageCrop, {
      props: { src: 'https://example.com/pending.png' },
      global: { stubs: { ExButton: ControlStub, ExIcon: ControlStub } },
    });

    await expect((wrapper.vm as unknown as ExImageCropExposed).crop()).rejects.toMatchObject({
      code: 'NOT_READY',
    });
  });

  it('外部设置区域会验证并复制，非法区域同步抛错', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;
    const nextArea = { x: -100, y: -100, width: 100, height: 100 };

    exposed.setArea(nextArea);
    nextArea.width = 999;
    expect(exposed.getArea()).toEqual({ x: 25, y: 31.25, width: 100, height: 100 });
    expect(() => exposed.setArea({ x: 0, y: 0, width: Number.NaN, height: 100 })).toThrowError(
      expect.objectContaining({ code: 'INVALID_AREA' })
    );
  });

  it('容器变化保留来源裁剪范围并重绘预览', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;
    exposed.setArea({ x: 100, y: 80, width: 200, height: 100 });
    cropMocks.drawCropPreview.mockClear();

    resizeCallback?.(
      [
        {
          contentRect: { width: 1000, height: 800 },
        } as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    );
    await nextTick();

    expect(exposed.getArea()).toEqual({ x: 200, y: 160, width: 400, height: 200 });
    expect(cropMocks.drawCropPreview).toHaveBeenCalled();
  });

  it('切换来源和卸载时取消任务并释放当前资源', async () => {
    const first = createResource('first');
    const second = createResource('second');
    const signals: AbortSignal[] = [];
    resourceMocks.loadBrowserImageResource.mockImplementation((_source, signal: AbortSignal) => {
      signals.push(signal);
      return Promise.resolve(signals.length === 1 ? first : second);
    });
    const current = await mountCrop();

    await current.setProps({ src: new Blob(['next'], { type: 'image/png' }) });
    await flushPromises();
    expect(first.dispose).toHaveBeenCalledOnce();
    expect(signals[0]?.aborted).toBe(true);

    current.unmount();
    wrapper = null;
    expect(second.dispose).toHaveBeenCalledOnce();
    expect(signals[1]?.aborted).toBe(true);
  });

  it('暴露根元素且运行时 API 不再包含无效 mode 与 rotateStep', async () => {
    const current = await mountCrop();
    const exposed = current.vm as unknown as ExImageCropExposed;

    expect(exposed.getElement()).toBe(current.element);
    const runtimeProps = (ExImageCrop as unknown as { props: Record<string, unknown> }).props;
    expect(runtimeProps).not.toHaveProperty('mode');
    expect(runtimeProps).not.toHaveProperty('rotateStep');
  });
});
