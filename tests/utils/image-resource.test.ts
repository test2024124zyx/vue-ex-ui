import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BrowserImageError,
  encodeCanvasToBlob,
  loadBrowserImageResource,
} from '../../src/utils/image-resource';

describe('image-resource', () => {
  let imageInstances: Array<{
    naturalWidth: number;
    naturalHeight: number;
    onload: (() => void) | null;
    onerror: ((event: Event) => void) | null;
    src: string;
  }>;

  beforeEach(() => {
    imageInstances = [];
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:image-resource'),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 640;
        naturalHeight = 480;
        decoding = '';
        onload: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        private source = '';

        constructor() {
          imageInstances.push(this);
        }

        set src(value: string) {
          this.source = value;
          if (value) queueMicrotask(() => this.onload?.());
        }

        get src(): string {
          return this.source;
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('读取 Blob 一次并提供幂等资源释放', async () => {
    const source = new Blob(['image'], { type: 'image/png' });
    const resource = await loadBrowserImageResource(source);

    expect(resource.blob).toBe(source);
    expect(resource.dimension).toEqual({ width: 640, height: 480 });
    expect(resource.size).toBe(source.size);
    expect(resource.mediaType).toBe('image/png');
    expect(URL.createObjectURL).toHaveBeenCalledOnce();

    resource.dispose();
    resource.dispose();
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('远程来源只请求一次并透传取消信号', async () => {
    const controller = new AbortController();
    const blob = new Blob(['remote'], { type: 'image/webp' });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      blob: async () => blob,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const resource = await loadBrowserImageResource(
      'https://example.com/image.webp',
      controller.signal
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/image.webp', {
      signal: controller.signal,
    });
    expect(resource.mediaType).toBe('image/webp');
    resource.dispose();
  });

  it('流式读取远程图片时按原顺序合并二进制分片', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          new Response(new Uint8Array([1, 2, 3, 4]), {
            headers: { 'content-type': 'image/png' },
          })
        )
      )
    );

    const resource = await loadBrowserImageResource('https://example.com/stream.png');
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(resource.blob);
    });

    expect(Array.from(new Uint8Array(bytes))).toEqual([1, 2, 3, 4]);
    resource.dispose();
  });

  it.each([
    ['', 'INVALID_SOURCE'],
    ['   ', 'INVALID_SOURCE'],
  ] as const)('拒绝空字符串来源 %#', async (source, code) => {
    await expect(loadBrowserImageResource(source)).rejects.toMatchObject({ code });
  });

  it('拒绝空文件与非图片媒体类型', async () => {
    await expect(
      loadBrowserImageResource(new Blob([], { type: 'image/png' }))
    ).rejects.toMatchObject({ code: 'INVALID_SOURCE' });
    await expect(
      loadBrowserImageResource(new Blob(['text'], { type: 'text/plain' }))
    ).rejects.toMatchObject({ code: 'INVALID_SOURCE' });
  });

  it('在解码前拒绝超过字节上限的来源', async () => {
    await expect(
      loadBrowserImageResource(new Blob(['12345'], { type: 'image/png' }), undefined, {
        maxSourceBytes: 4,
      })
    ).rejects.toMatchObject({ code: 'INVALID_SOURCE' });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('解码后拒绝超过像素预算的图片并释放对象 URL', async () => {
    await expect(
      loadBrowserImageResource(new Blob(['image'], { type: 'image/png' }), undefined, {
        maxPixels: 100,
      })
    ).rejects.toMatchObject({ code: 'INVALID_DIMENSION' });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-resource');
  });

  it('将 HTTP 与网络失败归类为来源请求失败', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 }))
    );
    await expect(loadBrowserImageResource('https://example.com/missing.png')).rejects.toMatchObject(
      {
        code: 'SOURCE_FETCH_FAILED',
      }
    );

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('network down')))
    );
    await expect(loadBrowserImageResource('https://example.com/error.png')).rejects.toMatchObject({
      code: 'SOURCE_FETCH_FAILED',
      cause: expect.any(TypeError),
    });
  });

  it('解码失败会释放已创建的对象 URL', async () => {
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 0;
        naturalHeight = 0;
        decoding = '';
        onload: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        set src(value: string) {
          if (value) queueMicrotask(() => this.onerror?.(new Event('error')));
        }
      }
    );

    await expect(
      loadBrowserImageResource(new Blob(['broken'], { type: 'image/png' }))
    ).rejects.toMatchObject({ code: 'LOAD_FAILED' });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-resource');
  });

  it('拒绝解码后尺寸无效的图片并释放资源', async () => {
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 0;
        naturalHeight = 480;
        decoding = '';
        onload: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        set src(value: string) {
          if (value) queueMicrotask(() => this.onload?.());
        }
      }
    );

    await expect(
      loadBrowserImageResource(new Blob(['invalid'], { type: 'image/png' }))
    ).rejects.toMatchObject({ code: 'INVALID_DIMENSION' });
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('在开始前和解码等待期间均可取消', async () => {
    const preAborted = new AbortController();
    preAborted.abort();
    await expect(
      loadBrowserImageResource(new Blob(['image'], { type: 'image/png' }), preAborted.signal)
    ).rejects.toMatchObject({ code: 'ABORTED' });

    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 640;
        naturalHeight = 480;
        decoding = '';
        onload: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        src = '';
      }
    );
    const duringDecode = new AbortController();
    const pending = loadBrowserImageResource(
      new Blob(['image'], { type: 'image/png' }),
      duringDecode.signal
    );
    await Promise.resolve();
    duringDecode.abort();

    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' });
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('在浏览器图片 API 不可用时返回稳定错误', async () => {
    vi.stubGlobal('Image', undefined);
    await expect(
      loadBrowserImageResource(new Blob(['image'], { type: 'image/png' }))
    ).rejects.toMatchObject({ code: 'DOM_UNAVAILABLE' });
  });

  it('编码 Canvas 并校验浏览器返回的真实媒体类型', async () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'toBlob').mockImplementation((callback, type) => {
      callback(new Blob(['encoded'], { type: type ?? 'image/png' }));
    });

    const blob = await encodeCanvasToBlob(canvas, 'image/jpeg', 0.8);

    expect(blob.type).toBe('image/jpeg');
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
  });

  it('编码前拒绝超过像素预算的 Canvas', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 101;
    canvas.height = 1;
    const toBlob = vi.spyOn(canvas, 'toBlob');

    await expect(
      encodeCanvasToBlob(canvas, 'image/png', undefined, undefined, 100)
    ).rejects.toMatchObject({ code: 'INVALID_DIMENSION' });
    expect(toBlob).not.toHaveBeenCalled();
  });

  it('区分编码空结果、不支持格式与同步异常', async () => {
    const nullCanvas = document.createElement('canvas');
    vi.spyOn(nullCanvas, 'toBlob').mockImplementation(callback => callback(null));
    await expect(encodeCanvasToBlob(nullCanvas, 'image/png')).rejects.toMatchObject({
      code: 'ENCODE_FAILED',
    });

    const fallbackCanvas = document.createElement('canvas');
    vi.spyOn(fallbackCanvas, 'toBlob').mockImplementation(callback => {
      callback(new Blob(['fallback'], { type: 'image/png' }));
    });
    await expect(encodeCanvasToBlob(fallbackCanvas, 'image/webp', 0.9)).rejects.toMatchObject({
      code: 'UNSUPPORTED_OUTPUT',
    });

    const throwingCanvas = document.createElement('canvas');
    vi.spyOn(throwingCanvas, 'toBlob').mockImplementation(() => {
      throw new DOMException('tainted', 'SecurityError');
    });
    await expect(encodeCanvasToBlob(throwingCanvas, 'image/jpeg', 0.9)).rejects.toMatchObject({
      code: 'ENCODE_FAILED',
      cause: expect.any(DOMException),
    });
  });

  it('编码等待期间取消后忽略迟到回调', async () => {
    const controller = new AbortController();
    const canvas = document.createElement('canvas');
    let callback: BlobCallback | undefined;
    vi.spyOn(canvas, 'toBlob').mockImplementation(next => {
      callback = next;
    });

    const pending = encodeCanvasToBlob(canvas, 'image/png', undefined, controller.signal);
    controller.abort();
    callback?.(new Blob(['late'], { type: 'image/png' }));

    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' });
  });

  it('错误类型保留稳定 code 与 cause', () => {
    const cause = new Error('root');
    const error = new BrowserImageError('LOAD_FAILED', '无法加载', cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BrowserImageError');
    expect(error.code).toBe('LOAD_FAILED');
    expect(error.cause).toBe(cause);
  });
});
