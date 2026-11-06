export type BrowserImageSource = string | Blob;

export const MAX_BROWSER_IMAGE_SOURCE_BYTES = 64 * 1024 * 1024;
export const MAX_BROWSER_IMAGE_PIXELS = 32_000_000;
export const MAX_BROWSER_IMAGE_DIMENSION = 32_768;
export const MAX_BROWSER_CANVAS_PIXELS = 32_000_000;

export interface BrowserImageResourceLimits {
  maxSourceBytes?: number;
  maxPixels?: number;
  maxDimension?: number;
  requestInit?: Pick<RequestInit, 'credentials' | 'mode' | 'referrerPolicy'>;
}

export interface ImageDimension {
  width: number;
  height: number;
}

export type BrowserImageErrorCode =
  | 'INVALID_SOURCE'
  | 'SOURCE_FETCH_FAILED'
  | 'LOAD_FAILED'
  | 'INVALID_DIMENSION'
  | 'ENCODE_FAILED'
  | 'UNSUPPORTED_OUTPUT'
  | 'ABORTED'
  | 'DOM_UNAVAILABLE';

export interface LoadedBrowserImageResource {
  image: HTMLImageElement;
  blob: Blob;
  objectUrl: string;
  size: number;
  mediaType: string;
  dimension: ImageDimension;
  dispose: () => void;
}

/** 浏览器图片读取与编码失败的内部稳定错误。 */
export class BrowserImageError extends Error {
  readonly code: BrowserImageErrorCode;
  readonly cause?: unknown;

  constructor(code: BrowserImageErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'BrowserImageError';
    this.code = code;
    this.cause = cause;
  }
}

/** 保留已分类错误，并把浏览器取消异常转换为统一错误码。 */
export function toBrowserImageError(
  error: unknown,
  code: BrowserImageErrorCode,
  fallbackMessage: string
): BrowserImageError {
  if (error instanceof BrowserImageError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new BrowserImageError('ABORTED', '图片操作已取消', error);
  }

  const message = error instanceof Error && error.message.trim() ? error.message : fallbackMessage;
  return new BrowserImageError(code, message, error);
}

/** 在异步阶段边界检查取消状态，避免继续分配图片与像素资源。 */
export function throwIfImageOperationAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new BrowserImageError('ABORTED', '图片操作已取消');
  }
}

function assertImageLoadingAvailable(): void {
  if (
    typeof Image === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof URL.revokeObjectURL !== 'function'
  ) {
    throw new BrowserImageError('DOM_UNAVAILABLE', '当前环境不支持浏览器图片处理');
  }
}

const normalizeLimit = (value: number | undefined, fallback: number): number =>
  Number.isFinite(value) && (value as number) > 0 ? (value as number) : fallback;

export function assertImagePixelBudget(
  width: number,
  height: number,
  maxPixels = MAX_BROWSER_CANVAS_PIXELS,
  maxDimension = MAX_BROWSER_IMAGE_DIMENSION
): void {
  const pixelLimit = normalizeLimit(maxPixels, MAX_BROWSER_CANVAS_PIXELS);
  const dimensionLimit = normalizeLimit(maxDimension, MAX_BROWSER_IMAGE_DIMENSION);
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    width > dimensionLimit ||
    height > dimensionLimit ||
    width * height > pixelLimit
  ) {
    throw new BrowserImageError('INVALID_DIMENSION', '图片尺寸超过浏览器安全处理上限');
  }
}

async function resolveSourceBlob(
  source: BrowserImageSource,
  signal: AbortSignal | undefined,
  maxSourceBytes: number,
  requestInit?: BrowserImageResourceLimits['requestInit']
): Promise<Blob> {
  throwIfImageOperationAborted(signal);

  if (typeof Blob !== 'undefined' && source instanceof Blob) return source;
  if (typeof source !== 'string' || !source.trim()) {
    throw new BrowserImageError('INVALID_SOURCE', '图片来源不能为空');
  }
  if (typeof fetch !== 'function') {
    throw new BrowserImageError('SOURCE_FETCH_FAILED', '当前环境无法读取远程图片');
  }

  try {
    const response = await fetch(source, { ...(requestInit ?? {}), signal });
    if (!response.ok) {
      throw new BrowserImageError(
        'SOURCE_FETCH_FAILED',
        '图片请求失败，HTTP 状态码 ' + String(response.status)
      );
    }
    const declaredSize = Number(response.headers?.get('content-length'));
    if (Number.isFinite(declaredSize) && declaredSize > maxSourceBytes) {
      throw new BrowserImageError('INVALID_SOURCE', '图片文件超过安全大小上限');
    }
    if (!response.body) {
      const blob = await response.blob();
      if (blob.size > maxSourceBytes) {
        throw new BrowserImageError('INVALID_SOURCE', '图片文件超过安全大小上限');
      }
      return blob;
    }

    const reader = response.body.getReader();
    const chunks: ArrayBuffer[] = [];
    let loaded = 0;
    while (true) {
      throwIfImageOperationAborted(signal);
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      loaded += value.byteLength;
      if (loaded > maxSourceBytes) {
        void reader.cancel();
        throw new BrowserImageError('INVALID_SOURCE', '图片文件超过安全大小上限');
      }
      // ReadableStream 的分片可能由 SharedArrayBuffer 承载，复制后再交给 Blob 保证浏览器类型契约。
      const chunk = new Uint8Array(value.byteLength);
      chunk.set(value);
      chunks.push(chunk.buffer);
    }
    return new Blob(chunks, { type: response.headers?.get('content-type') ?? '' });
  } catch (error) {
    throw toBrowserImageError(error, 'SOURCE_FETCH_FAILED', '图片请求失败');
  }
}

function decodeObjectUrl(objectUrl: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    let settled = false;

    const cleanup = (): void => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener('abort', handleAbort);
    };
    const resolveOnce = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(image);
    };
    const rejectOnce = (error: BrowserImageError): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const handleAbort = (): void => {
      image.src = '';
      rejectOnce(new BrowserImageError('ABORTED', '图片加载已取消'));
    };

    image.onload = resolveOnce;
    image.onerror = event => {
      rejectOnce(new BrowserImageError('LOAD_FAILED', '图片无法解码', event));
    };
    signal?.addEventListener('abort', handleAbort, { once: true });

    if (signal?.aborted) {
      handleAbort();
      return;
    }
    image.src = objectUrl;
  });
}

/**
 * 将字符串或 Blob 统一读取为同一份可绘制资源。
 * 调用方在资源过期或组件卸载时必须执行 dispose。
 */
export async function loadBrowserImageResource(
  source: BrowserImageSource,
  signal?: AbortSignal,
  limits: BrowserImageResourceLimits = {}
): Promise<LoadedBrowserImageResource> {
  assertImageLoadingAvailable();
  const maxSourceBytes = normalizeLimit(limits.maxSourceBytes, MAX_BROWSER_IMAGE_SOURCE_BYTES);
  const maxPixels = normalizeLimit(limits.maxPixels, MAX_BROWSER_IMAGE_PIXELS);
  const maxDimension = normalizeLimit(limits.maxDimension, MAX_BROWSER_IMAGE_DIMENSION);
  const blob = await resolveSourceBlob(source, signal, maxSourceBytes, limits.requestInit);
  throwIfImageOperationAborted(signal);

  if (blob.size <= 0 || (blob.type && !blob.type.toLowerCase().startsWith('image/'))) {
    throw new BrowserImageError('INVALID_SOURCE', '来源不是有效图片');
  }
  if (blob.size > maxSourceBytes) {
    throw new BrowserImageError('INVALID_SOURCE', '图片文件超过安全大小上限');
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await decodeObjectUrl(objectUrl, signal);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    assertImagePixelBudget(width, height, maxPixels, maxDimension);

    let disposed = false;
    return {
      image,
      blob,
      objectUrl,
      size: blob.size,
      mediaType: blob.type || 'application/octet-stream',
      dimension: { width, height },
      dispose: () => {
        if (disposed) return;
        disposed = true;
        image.src = '';
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw toBrowserImageError(error, 'LOAD_FAILED', '图片加载失败');
  }
}

/** 将 Canvas 编码为指定格式，并拒绝浏览器静默回退到其他格式。 */
export function encodeCanvasToBlob(
  canvas: HTMLCanvasElement,
  outputType: string,
  quality?: number,
  signal?: AbortSignal,
  maxPixels = MAX_BROWSER_CANVAS_PIXELS
): Promise<Blob> {
  throwIfImageOperationAborted(signal);
  try {
    assertImagePixelBudget(canvas.width, canvas.height, maxPixels);
  } catch (error) {
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = (): void => signal?.removeEventListener('abort', handleAbort);
    const rejectOnce = (error: BrowserImageError): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const handleAbort = (): void => {
      rejectOnce(new BrowserImageError('ABORTED', '图片编码已取消'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
    try {
      canvas.toBlob(
        blob => {
          if (settled) return;
          if (!blob) {
            rejectOnce(new BrowserImageError('ENCODE_FAILED', '浏览器未能编码图片'));
            return;
          }
          if (blob.type.toLowerCase() !== outputType.toLowerCase()) {
            rejectOnce(
              new BrowserImageError('UNSUPPORTED_OUTPUT', '当前浏览器不支持输出 ' + outputType)
            );
            return;
          }

          settled = true;
          cleanup();
          resolve(blob);
        },
        outputType,
        quality
      );
    } catch (error) {
      rejectOnce(toBrowserImageError(error, 'ENCODE_FAILED', '图片编码失败'));
    }
  });
}
