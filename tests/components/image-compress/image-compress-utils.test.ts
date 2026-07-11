import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ExImageCompressError,
  toImageCompressError,
} from '../../../src/components/image-compress/errors';
import {
  calculateCompressedDimensions,
  compressImage,
  compressImages,
  compressLoadedImage,
  downloadCompressedImage,
  formatBytes,
  loadImageResource,
  normalizeCompressOptions,
  type ImageCompressLoadedResource,
} from '../../../src/components/image-compress/utils';
import type { ImageOutputType } from '../../../src/components/image-compress/types';

describe('image-compress utils', () => {
  const clearRect = vi.fn();
  const drawImage = vi.fn();
  const fillRect = vi.fn();
  const context = {
    clearRect,
    drawImage,
    fillRect,
    fillStyle: '',
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
  } as unknown as CanvasRenderingContext2D;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:resource'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearRect.mockClear();
    drawImage.mockClear();
    fillRect.mockClear();
    context.fillStyle = '';
    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = 'low';
  });

  /** 创建已解码资源，隔离加载过程后精确测试 Canvas 编码核心。 */
  const createResource = (
    width = 400,
    height = 200,
    originalSize = 2000
  ): ImageCompressLoadedResource => {
    const image = document.createElement('img');
    Object.defineProperties(image, {
      naturalWidth: { configurable: true, value: width },
      naturalHeight: { configurable: true, value: height },
    });

    return {
      image,
      blob: new Blob([new Uint8Array(originalSize)], { type: 'image/png' }),
      previewUrl: 'blob:source',
      originalSize,
      originalType: 'image/png',
      originalDimension: { width, height },
      dispose: vi.fn(),
    };
  };

  const setCanvasEncoder = (
    encoder: (canvas: HTMLCanvasElement, type: string, quality: number | undefined) => Blob | null
  ) =>
    vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function (callback, type, quality) {
        callback(encoder(this, type ?? '', quality));
      });

  it('规范化运行时选项，拒绝 NaN、负数和未知枚举污染 Canvas', () => {
    const options = normalizeCompressOptions({
      mode: 'unknown' as 'quality',
      quality: Number.NaN,
      targetSize: -10,
      maxWidth: 10.8,
      maxHeight: Number.POSITIVE_INFINITY,
      outputType: 'image/gif' as ImageOutputType,
      keepAspectRatio: false,
      backgroundColor: '  ',
    });

    expect(options).toEqual(
      expect.objectContaining({
        mode: 'quality',
        quality: 0.8,
        targetBytes: 500 * 1024,
        maxWidth: 10,
        maxHeight: 1080,
        outputType: 'image/jpeg',
        keepAspectRatio: false,
        backgroundColor: '#ffffff',
      })
    );
  });

  it('尺寸模式在保持比例时不放大原图，不保持比例时独立约束两轴', () => {
    expect(calculateCompressedDimensions(4000, 1000, 1000, 1000, true)).toEqual({
      width: 1000,
      height: 250,
    });
    expect(calculateCompressedDimensions(4000, 1000, 1000, 1000, false)).toEqual({
      width: 1000,
      height: 1000,
    });
    expect(calculateCompressedDimensions(320, 180, 1920, 1080, true)).toEqual({
      width: 320,
      height: 180,
    });
  });

  it('尺寸计算对无效原图尺寸抛出可识别错误', () => {
    expect(() => calculateCompressedDimensions(0, 100, 100, 100, true)).toThrowError(
      expect.objectContaining({
        code: 'INVALID_DIMENSION',
      })
    );
  });

  it('质量模式使用指定质量编码，并在 JPEG 输出前填充透明背景', async () => {
    setCanvasEncoder((_canvas, type) => new Blob([new Uint8Array(600)], { type }));
    const resource = createResource();

    const result = await compressLoadedImage(resource, {
      mode: 'quality',
      quality: 0.65,
      outputType: 'image/jpeg',
      backgroundColor: '#fefefe',
    });

    expect(result).toEqual(
      expect.objectContaining({
        originalSize: 2000,
        compressedSize: 600,
        compressionRatio: 70,
        originalDimension: { width: 400, height: 200 },
        compressedDimension: { width: 400, height: 200 },
        outputType: 'image/jpeg',
        qualityUsed: 0.65,
        mode: 'quality',
      })
    );
    expect(context.fillStyle).toBe('#fefefe');
    expect(fillRect).toHaveBeenCalledWith(0, 0, 400, 200);
    expect(drawImage).toHaveBeenCalledWith(resource.image, 0, 0, 400, 200);
    expect(context.imageSmoothingEnabled).toBe(true);
    expect(context.imageSmoothingQuality).toBe('high');
  });

  it('尺寸模式真实执行 keepAspectRatio=false，并保留 PNG 透明通道', async () => {
    setCanvasEncoder((_canvas, type) => new Blob([new Uint8Array(500)], { type }));
    const resource = createResource(4000, 1000);

    const result = await compressLoadedImage(resource, {
      mode: 'dimension',
      maxWidth: 1000,
      maxHeight: 1000,
      keepAspectRatio: false,
      outputType: 'image/png',
    });

    expect(result.compressedDimension).toEqual({ width: 1000, height: 1000 });
    expect(result.qualityUsed).toBeNull();
    expect(fillRect).not.toHaveBeenCalled();
  });

  it('目标大小模式为有损格式选择不超过上限的最高可用质量', async () => {
    setCanvasEncoder((_canvas, type, quality) => {
      const size = Math.max(1, Math.round((quality ?? 1) * 1000));
      return new Blob([new Uint8Array(size)], { type });
    });
    const resource = createResource(400, 200, 2000);

    const result = await compressLoadedImage(resource, {
      mode: 'size',
      targetSize: 0.5,
      outputType: 'image/webp',
    });

    expect(result.compressedSize).toBeLessThanOrEqual(512);
    expect(result.compressedSize).toBeGreaterThan(480);
    expect(result.qualityUsed).toBeGreaterThan(0.45);
    expect(result.qualityUsed).toBeLessThanOrEqual(0.52);
    expect(result.mode).toBe('size');
  });

  it('目标大小模式在最低质量仍超限时逐步缩小尺寸，包括 PNG', async () => {
    setCanvasEncoder((canvas, type) => {
      const size = Math.max(80, Math.ceil((canvas.width * canvas.height) / 2));
      return new Blob([new Uint8Array(size)], { type });
    });
    const resource = createResource(100, 100, 10000);

    const result = await compressLoadedImage(resource, {
      mode: 'size',
      targetSize: 1,
      outputType: 'image/png',
    });

    expect(result.compressedSize).toBeLessThanOrEqual(1024);
    expect(result.compressedDimension.width).toBeLessThan(100);
    expect(result.compressedDimension.height).toBeLessThan(100);
    expect(result.qualityUsed).toBeNull();
    expect(result.mode).toBe('size');
  });

  it('目标大小在 1×1 仍无法达到时明确失败，不返回伪达标结果', async () => {
    setCanvasEncoder((_canvas, type) => new Blob([new Uint8Array(5000)], { type }));

    await expect(
      compressLoadedImage(createResource(10, 10), {
        mode: 'size',
        targetSize: 1,
        outputType: 'image/png',
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'TARGET_UNREACHABLE',
      })
    );
  });

  it('PNG 不接受无法生效的质量模式', async () => {
    await expect(
      compressLoadedImage(createResource(), {
        mode: 'quality',
        outputType: 'image/png',
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_MODE',
      })
    );
  });

  it('浏览器回退到其他 MIME 时拒绝冒充请求格式', async () => {
    setCanvasEncoder(() => new Blob([new Uint8Array(100)], { type: 'image/png' }));

    await expect(
      compressLoadedImage(createResource(), {
        outputType: 'image/webp',
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_OUTPUT',
      })
    );
  });

  it('Canvas context 与 toBlob 失败均转换为稳定错误码', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
    await expect(compressLoadedImage(createResource())).rejects.toEqual(
      expect.objectContaining({
        code: 'CANVAS_UNAVAILABLE',
      })
    );

    setCanvasEncoder(() => null);
    await expect(compressLoadedImage(createResource())).rejects.toEqual(
      expect.objectContaining({
        code: 'ENCODE_FAILED',
      })
    );
  });

  it('压缩开始前已取消时不创建伪结果', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      compressLoadedImage(createResource(), {
        signal: controller.signal,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'ABORTED',
      })
    );
  });

  it('File 资源只创建一个对象 URL，dispose 幂等释放', async () => {
    class ImageMock {
      naturalWidth = 640;
      naturalHeight = 360;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.(new Event('load')));
      }
    }

    vi.stubGlobal('Image', ImageMock);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const file = new File([new Uint8Array(32)], 'source.png', { type: 'image/png' });
    const resource = await loadImageResource(file);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(resource.originalSize).toBe(32);
    expect(resource.originalType).toBe('image/png');
    expect(resource.originalDimension).toEqual({ width: 640, height: 360 });

    resource.dispose();
    resource.dispose();
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('URL 资源只请求一次，并拒绝 HTTP 失败与非图片响应', async () => {
    class ImageMock {
      naturalWidth = 10;
      naturalHeight = 10;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.(new Event('load')));
      }
    }

    vi.stubGlobal('Image', ImageMock);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array(20), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const resource = await loadImageResource('https://example.com/source.jpg');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(resource.originalSize).toBe(20);
    resource.dispose();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(loadImageResource('https://example.com/missing.jpg')).rejects.toEqual(
      expect.objectContaining({
        code: 'SOURCE_FETCH_FAILED',
      })
    );

    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(['text'], { type: 'text/plain' }), { status: 200 })
    );
    await expect(loadImageResource('https://example.com/not-image')).rejects.toEqual(
      expect.objectContaining({
        code: 'INVALID_SOURCE',
      })
    );
  });

  it('图片解码等待期间取消会停止加载并释放对象 URL', async () => {
    class PendingImageMock {
      naturalWidth = 0;
      naturalHeight = 0;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      src = '';
    }

    vi.stubGlobal('Image', PendingImageMock);
    const controller = new AbortController();
    const promise = loadImageResource(
      new File([new Uint8Array(8)], 'pending.png', { type: 'image/png' }),
      controller.signal
    );

    await Promise.resolve();
    controller.abort();
    await expect(promise).rejects.toEqual(
      expect.objectContaining({
        code: 'ABORTED',
      })
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('图片解码失败转换为 LOAD_FAILED 并释放对象 URL', async () => {
    class BrokenImageMock {
      naturalWidth = 0;
      naturalHeight = 0;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onerror?.(new Event('error')));
      }
    }

    vi.stubGlobal('Image', BrokenImageMock);

    await expect(
      loadImageResource(new File([new Uint8Array(8)], 'broken.png', { type: 'image/png' }))
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'LOAD_FAILED',
      })
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('Canvas 编码等待期间取消会立即拒绝，迟到回调不能改写结果', async () => {
    let encodeCallback: BlobCallback | null = null;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => {
      encodeCallback = callback;
    });
    const controller = new AbortController();
    const promise = compressLoadedImage(createResource(), {
      signal: controller.signal,
    });

    controller.abort();
    await expect(promise).rejects.toEqual(
      expect.objectContaining({
        code: 'ABORTED',
      })
    );

    encodeCallback?.(new Blob([new Uint8Array(10)], { type: 'image/jpeg' }));
  });

  it('compressImage 在成功和失败后都释放临时源资源', async () => {
    class ImageMock {
      naturalWidth = 40;
      naturalHeight = 20;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.(new Event('load')));
      }
    }

    vi.stubGlobal('Image', ImageMock);
    setCanvasEncoder((_canvas, type) => new Blob([new Uint8Array(10)], { type }));

    const result = await compressImage(
      new File([new Uint8Array(100)], 'source.jpg', { type: 'image/jpeg' }),
      {
        quality: 0.5,
      }
    );
    expect(result.compressedSize).toBe(10);
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();

    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
    await expect(
      compressImage(new File([new Uint8Array(100)], 'source.jpg', { type: 'image/jpeg' }))
    ).rejects.toBeInstanceOf(ExImageCompressError);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('compressImages 顺序返回与输入一致的结果并逐张释放资源', async () => {
    class ImageMock {
      naturalWidth = 40;
      naturalHeight = 20;
      decoding = '';
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.(new Event('load')));
      }
    }

    vi.stubGlobal('Image', ImageMock);
    setCanvasEncoder((_canvas, type) => new Blob([new Uint8Array(10)], { type }));
    const first = new File([new Uint8Array(100)], 'first.jpg', {
      type: 'image/jpeg',
    });
    const second = new File([new Uint8Array(200)], 'second.jpg', {
      type: 'image/jpeg',
    });

    const results = await compressImages([first, second], { quality: 0.5 });

    expect(results.map(item => item.originalSize)).toEqual([100, 200]);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('错误规范化保留已分类错误，并识别 AbortError 与未知异常', () => {
    const classified = new ExImageCompressError('ENCODE_FAILED', '编码失败');
    expect(toImageCompressError(classified, 'LOAD_FAILED', '加载失败')).toBe(classified);

    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    expect(toImageCompressError(abortError, 'LOAD_FAILED', '加载失败').code).toBe('ABORTED');
    expect(toImageCompressError('unknown', 'LOAD_FAILED', '加载失败')).toEqual(
      expect.objectContaining({
        code: 'LOAD_FAILED',
        message: '加载失败',
      })
    );
  });

  it('缺少浏览器对象 URL 能力时明确报告 DOM_UNAVAILABLE', async () => {
    vi.stubGlobal('URL', {});

    await expect(
      loadImageResource(new File([new Uint8Array(8)], 'source.png', { type: 'image/png' }))
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'DOM_UNAVAILABLE',
      })
    );
  });

  it('formatBytes 覆盖零值、大单位和非法输入', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 ** 5)).toBe('1.00 PB');
    expect(() => formatBytes(-1)).toThrow(RangeError);
    expect(() => formatBytes(Number.NaN)).toThrow(RangeError);
  });

  it('下载使用 Blob 的真实 MIME、挂载原生链接，并延迟释放 URL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const append = vi.spyOn(document.body, 'appendChild');
    const blob = new Blob([new Uint8Array(4)], { type: 'image/webp' });

    downloadCompressedImage(blob);

    expect(click).toHaveBeenCalledOnce();
    expect(append).toHaveBeenCalledOnce();
    const link = append.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(link.download).toBe('compressed-1767312000000.webp');
    expect(link.isConnected).toBe(false);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:resource');
  });
});
