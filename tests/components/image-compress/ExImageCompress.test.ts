import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import {
  flushPromises,
  mount,
  type ComponentMountingOptions,
  type VueWrapper,
} from '@vue/test-utils';
import { ExImageCompressError } from '../../../src/components/image-compress/errors';
import ExImageCompress from '../../../src/components/image-compress/ExImageCompress.vue';
import type {
  CompressResult,
  ExImageCompressExposed,
} from '../../../src/components/image-compress/types';
import type { ImageCompressLoadedResource } from '../../../src/components/image-compress/utils';
import { setLocale } from '../../../src/locale';

const utilityMocks = vi.hoisted(() => ({
  loadImageResource: vi.fn(),
  compressLoadedImage: vi.fn(),
  downloadCompressedImage: vi.fn(),
}));

vi.mock('../../../src/components/image-compress/utils', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../../../src/components/image-compress/utils')>();
  return {
    ...actual,
    loadImageResource: utilityMocks.loadImageResource,
    compressLoadedImage: utilityMocks.compressLoadedImage,
    downloadCompressedImage: utilityMocks.downloadCompressedImage,
  };
});

const ButtonStub = defineComponent({
  name: 'ExButton',
  inheritAttrs: false,
  props: {
    loading: Boolean,
    disabled: Boolean,
  },
  emits: ['click'],
  template:
    '<button v-bind="$attrs" type="button" :disabled="disabled || loading" @click="$emit(\'click\')"><slot name="prefix"></slot><slot></slot></button>',
});

const SliderStub = defineComponent({
  name: 'ExSlider',
  props: {
    modelValue: { type: Number, default: 0 },
  },
  emits: ['update:modelValue'],
  template:
    '<input class="slider-stub" type="range" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
});

const NumberInputStub = defineComponent({
  name: 'ExNumberInput',
  props: {
    modelValue: { type: Number, default: 0 },
  },
  emits: ['update:modelValue'],
  template:
    '<input class="number-input-stub" type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
});

const SelectStub = defineComponent({
  name: 'ExSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
  template:
    '<select class="select-stub" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
});

const IconStub = defineComponent({
  name: 'ExIcon',
  template: '<span class="icon-stub" aria-hidden="true"></span>',
});

describe('ExImageCompress', () => {
  let wrapper: VueWrapper | null = null;
  let objectUrlIndex = 0;

  beforeEach(() => {
    setLocale('en-US');
    objectUrlIndex = 0;
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => {
        objectUrlIndex += 1;
        return 'blob:compressed-' + String(objectUrlIndex);
      }),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.replaceChildren();
    setLocale('en-US');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    utilityMocks.loadImageResource.mockReset();
    utilityMocks.compressLoadedImage.mockReset();
    utilityMocks.downloadCompressedImage.mockReset();
  });

  /** 统一挂载真实组件，只替换本组件之外已独立测试的交互控件。 */
  const mountCompress = (options: ComponentMountingOptions<typeof ExImageCompress> = {}) => {
    wrapper = mount(ExImageCompress, {
      ...options,
      attachTo: document.body,
      global: {
        ...options.global,
        stubs: {
          ExButton: ButtonStub,
          ExSlider: SliderStub,
          ExNumberInput: NumberInputStub,
          ExSelect: SelectStub,
          ExIcon: IconStub,
          ...options.global?.stubs,
        },
      },
    });
    return wrapper;
  };

  const createResource = (
    name: string,
    width = 640,
    height = 360,
    size = 2048
  ): ImageCompressLoadedResource => {
    const image = document.createElement('img');
    return {
      image,
      blob: new Blob([new Uint8Array(size)], { type: 'image/jpeg' }),
      previewUrl: 'blob:' + name,
      originalSize: size,
      originalType: 'image/jpeg',
      originalDimension: { width, height },
      dispose: vi.fn(),
    };
  };

  const createResult = (overrides: Partial<CompressResult> = {}): CompressResult => ({
    blob: new Blob([new Uint8Array(512)], { type: 'image/jpeg' }),
    originalSize: 2048,
    compressedSize: 512,
    compressionRatio: 75,
    originalDimension: { width: 640, height: 360 },
    compressedDimension: { width: 640, height: 360 },
    originalType: 'image/jpeg',
    outputType: 'image/jpeg',
    qualityUsed: 0.8,
    mode: 'quality',
    ...overrides,
  });

  const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    return { promise, resolve, reject };
  };

  it('加载一次源资源，展示真实预览信息并发出完整 load 载荷', async () => {
    const resource = createResource('source');
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    const file = new File([new Uint8Array(16)], 'source.jpg', { type: 'image/jpeg' });
    const imageCompress = mountCompress({
      props: {
        src: file,
      },
    });

    await flushPromises();

    expect(utilityMocks.loadImageResource).toHaveBeenCalledOnce();
    expect(utilityMocks.loadImageResource.mock.calls[0]?.[0]).toBe(file);
    expect(utilityMocks.loadImageResource.mock.calls[0]?.[1]).toBeInstanceOf(AbortSignal);
    expect(imageCompress.get('.ex-image-compress__preview-original img').attributes('src')).toBe(
      'blob:source'
    );
    expect(imageCompress.get('.ex-image-compress__preview-original').text()).toContain('2.00 KB');
    expect(imageCompress.get('.ex-image-compress__preview-original').text()).toContain('640 × 360');
    expect(imageCompress.emitted('load')).toEqual([
      [
        {
          originalSize: 2048,
          originalType: 'image/jpeg',
          originalDimension: { width: 640, height: 360 },
        },
      ],
    ]);
  });

  it('showPreview=false 仍完成资源加载，autoCompress 只在本次资源就绪后执行一次', async () => {
    const resource = createResource('hidden');
    const result = createResult();
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockResolvedValue(result);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
        showPreview: false,
        autoCompress: true,
      },
    });

    await flushPromises();

    expect(imageCompress.find('.ex-image-compress__preview').exists()).toBe(false);
    expect(utilityMocks.compressLoadedImage).toHaveBeenCalledOnce();
    expect(imageCompress.emitted('start')).toHaveLength(1);
    expect(imageCompress.emitted('compress')).toEqual([[result]]);
  });

  it('src 快速切换会中止旧任务、释放迟到资源，且旧结果不能覆盖新资源', async () => {
    const first = deferred<ImageCompressLoadedResource>();
    const firstResource = createResource('first');
    const secondResource = createResource('second');
    utilityMocks.loadImageResource
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(secondResource);
    const firstFile = new File([new Uint8Array(4)], 'first.jpg', { type: 'image/jpeg' });
    const secondFile = new File([new Uint8Array(4)], 'second.jpg', { type: 'image/jpeg' });
    const imageCompress = mountCompress({
      props: {
        src: firstFile,
      },
    });
    const firstSignal = utilityMocks.loadImageResource.mock.calls[0]?.[1] as AbortSignal;

    await imageCompress.setProps({ src: secondFile });
    await flushPromises();
    expect(firstSignal.aborted).toBe(true);
    expect(imageCompress.get('.ex-image-compress__preview-original img').attributes('src')).toBe(
      'blob:second'
    );

    first.resolve(firstResource);
    await flushPromises();
    expect(firstResource.dispose).toHaveBeenCalledOnce();
    expect(imageCompress.emitted('load')).toHaveLength(1);
  });

  it('compress 使用资源与当前设置的快照，维护 busy、start 和 compress 语义', async () => {
    const resource = createResource('source');
    const result = createResult();
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockResolvedValue(result);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
        mode: 'dimension',
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 600,
        keepAspectRatio: false,
        backgroundColor: '#eeeeee',
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;

    await expect(exposed.compress()).resolves.toBe(result);

    expect(utilityMocks.compressLoadedImage).toHaveBeenCalledWith(
      resource,
      expect.objectContaining({
        mode: 'dimension',
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 600,
        keepAspectRatio: false,
        backgroundColor: '#eeeeee',
        signal: expect.any(AbortSignal),
      })
    );
    expect(imageCompress.attributes('aria-busy')).toBe('false');
    expect(imageCompress.emitted('start')).toEqual([[]]);
    expect(imageCompress.emitted('compress')).toEqual([[result]]);
    expect(imageCompress.get('.ex-image-compress__preview-compressed img').attributes('src')).toBe(
      'blob:compressed-1'
    );
    expect(exposed.getResult()).toBe(result);
  });

  it('并发 compress 调用共享同一 Promise，不重复编码和事件', async () => {
    const resource = createResource('source');
    const pending = deferred<CompressResult>();
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockReturnValue(pending.promise);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;

    const first = exposed.compress();
    const second = exposed.compress();
    expect(second).toBe(first);
    await nextTick();
    expect(imageCompress.attributes('aria-busy')).toBe('true');
    expect(utilityMocks.compressLoadedImage).toHaveBeenCalledOnce();
    expect(imageCompress.emitted('start')).toHaveLength(1);

    pending.resolve(createResult());
    await first;
    expect(imageCompress.attributes('aria-busy')).toBe('false');
  });

  it('压缩期间设置变化会取消旧快照且不提交失效结果', async () => {
    const resource = createResource('source');
    const pending = deferred<CompressResult>();
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockReturnValue(pending.promise);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
        quality: 0.8,
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;

    const compression = exposed.compress();
    await nextTick();
    const signal = utilityMocks.compressLoadedImage.mock.calls[0]?.[1]?.signal as AbortSignal;
    await imageCompress.setProps({ quality: 0.2 });

    expect(signal.aborted).toBe(true);
    pending.resolve(createResult({ qualityUsed: 0.8 }));
    await expect(compression).rejects.toMatchObject({ code: 'ABORTED' });
    expect(exposed.getResult()).toBeNull();
    expect(imageCompress.emitted('compress')).toBeUndefined();
  });

  it('已有结果在压缩设置变化后立即失效并释放地址', async () => {
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    utilityMocks.compressLoadedImage.mockResolvedValue(createResult());
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
        quality: 0.8,
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;
    await exposed.compress();

    await imageCompress.setProps({ quality: 0.3 });

    expect(exposed.getResult()).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:compressed-1');
  });

  it('压缩失败发出一次 error、恢复 busy，并让暴露方法保留拒绝语义', async () => {
    const failure = new ExImageCompressError('ENCODE_FAILED', '编码失败');
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    utilityMocks.compressLoadedImage.mockRejectedValue(failure);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;

    await expect(exposed.compress()).rejects.toBe(failure);
    expect(imageCompress.emitted('error')).toEqual([[failure]]);
    expect(imageCompress.attributes('aria-busy')).toBe('false');
  });

  it('源加载失败展示 alert，发出 Error 实例且不尝试自动压缩', async () => {
    const failure = new ExImageCompressError('LOAD_FAILED', '图片无法解码');
    utilityMocks.loadImageResource.mockRejectedValue(failure);
    const imageCompress = mountCompress({
      props: {
        src: 'https://example.com/broken.jpg',
        autoCompress: true,
      },
    });

    await flushPromises();

    expect(imageCompress.get('.ex-image-compress__error').attributes('role')).toBe('alert');
    expect(imageCompress.get('.ex-image-compress__error').text()).toBe('图片无法解码');
    expect(imageCompress.emitted('error')).toEqual([[failure]]);
    expect(utilityMocks.compressLoadedImage).not.toHaveBeenCalled();
  });

  it('reset 清理压缩预览和结果并恢复 props 设置，但保留已加载原图', async () => {
    const resource = createResource('source');
    const result = createResult();
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockResolvedValue(result);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
        quality: 0.6,
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;
    await exposed.compress();

    exposed.reset();
    await flushPromises();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:compressed-1');
    expect(exposed.getResult()).toBeNull();
    expect(imageCompress.find('.ex-image-compress__preview-compressed img').exists()).toBe(false);
    expect(imageCompress.get('.slider-stub').attributes('value')).toBe('0.6');
    expect(resource.dispose).not.toHaveBeenCalled();
  });

  it('src 变化与卸载都释放源资源、压缩预览和活动任务', async () => {
    const firstResource = createResource('first');
    const secondResource = createResource('second');
    utilityMocks.loadImageResource
      .mockResolvedValueOnce(firstResource)
      .mockResolvedValueOnce(secondResource);
    utilityMocks.compressLoadedImage.mockResolvedValue(createResult());
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'first.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;
    await exposed.compress();

    await imageCompress.setProps({
      src: new File([new Uint8Array(4)], 'second.jpg', { type: 'image/jpeg' }),
    });
    await flushPromises();
    expect(firstResource.dispose).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:compressed-1');
    expect(exposed.getResult()).toBeNull();

    imageCompress.unmount();
    wrapper = null;
    expect(secondResource.dispose).toHaveBeenCalledOnce();
  });

  it('download 只使用真实结果 Blob，未压缩时保持无操作', async () => {
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    utilityMocks.compressLoadedImage.mockResolvedValue(createResult());
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;

    exposed.download('before.jpg');
    expect(utilityMocks.downloadCompressedImage).not.toHaveBeenCalled();

    const result = await exposed.compress();
    exposed.download('after.jpg');
    expect(utilityMocks.downloadCompressedImage).toHaveBeenCalledWith(result.blob, 'after.jpg');
  });

  it('PNG 输出禁用无法生效的质量模式，并自动选中尺寸模式', async () => {
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.png', { type: 'image/png' }),
        mode: 'quality',
        outputType: 'image/png',
      },
    });
    await flushPromises();

    const qualityButton = imageCompress.get('[data-mode="quality"]');
    const dimensionButton = imageCompress.get('[data-mode="dimension"]');
    expect(qualityButton.attributes('disabled')).toBeDefined();
    expect(qualityButton.attributes('aria-pressed')).toBe('false');
    expect(dimensionButton.attributes('aria-pressed')).toBe('true');

    await imageCompress.setProps({ outputType: 'image/jpeg' });
    expect(imageCompress.get('[data-mode="quality"]').attributes('aria-pressed')).toBe('true');
  });

  it('外部设置变化会同步到下一次压缩快照', async () => {
    const resource = createResource('source');
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockResolvedValue(createResult());
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();

    await imageCompress.setProps({
      mode: 'size',
      targetSize: 200,
      outputType: 'image/webp',
      quality: 0.55,
    });
    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;
    await exposed.compress();

    expect(utilityMocks.compressLoadedImage).toHaveBeenCalledWith(
      resource,
      expect.objectContaining({
        mode: 'size',
        targetSize: 200,
        outputType: 'image/webp',
        quality: 0.55,
      })
    );
  });

  it('控制区使用 fieldset/legend，模式按钮暴露 aria-pressed', async () => {
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();

    expect(imageCompress.findAll('fieldset').length).toBeGreaterThanOrEqual(2);
    expect(imageCompress.get('legend').text()).toBe('Compress mode');
    expect(imageCompress.get('[data-mode="quality"]').attributes('aria-pressed')).toBe('true');
    expect(imageCompress.attributes('aria-busy')).toBe('false');
  });

  it('通过控制面板完成设置、压缩、下载与重置的完整用户链路', async () => {
    const resource = createResource('source');
    const compressed = createResult({
      mode: 'dimension',
      outputType: 'image/webp',
    });
    utilityMocks.loadImageResource.mockResolvedValue(resource);
    utilityMocks.compressLoadedImage.mockResolvedValue(compressed);
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();

    await imageCompress.get('.slider-stub').setValue('0.5');
    await imageCompress.get('.select-stub').setValue('image/webp');
    await imageCompress.get('[data-mode="size"]').trigger('click');
    await imageCompress.get('.number-input-stub').setValue('100');
    await imageCompress.get('[data-mode="dimension"]').trigger('click');
    const dimensions = imageCompress.findAll('.number-input-stub');
    expect(dimensions).toHaveLength(2);
    await dimensions[0]!.setValue('300');
    await dimensions[1]!.setValue('200');

    await imageCompress.get('.ex-image-compress__actions button:nth-child(2)').trigger('click');
    await flushPromises();

    expect(utilityMocks.compressLoadedImage).toHaveBeenCalledWith(
      resource,
      expect.objectContaining({
        mode: 'dimension',
        quality: 0.5,
        targetSize: 100,
        maxWidth: 300,
        maxHeight: 200,
        outputType: 'image/webp',
      })
    );

    await imageCompress.get('.ex-image-compress__actions button:nth-child(3)').trigger('click');
    expect(utilityMocks.downloadCompressedImage).toHaveBeenCalledWith(compressed.blob, undefined);

    await imageCompress.get('.ex-image-compress__actions button:nth-child(1)').trigger('click');
    expect((imageCompress.vm as unknown as ExImageCompressExposed).getResult()).toBeNull();
  });

  it('暴露 getElement 返回组件根节点', async () => {
    utilityMocks.loadImageResource.mockResolvedValue(createResource('source'));
    const imageCompress = mountCompress({
      props: {
        src: new File([new Uint8Array(4)], 'source.jpg', { type: 'image/jpeg' }),
      },
    });
    await flushPromises();

    const exposed = imageCompress.vm as unknown as ExImageCompressExposed;
    expect(exposed.getElement()).toBe(imageCompress.element);
  });
});
