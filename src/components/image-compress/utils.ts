import { ExImageCompressError, toImageCompressError } from './errors';
import type {
  CompressMode,
  CompressOptions,
  CompressResult,
  ImageCompressSource,
  ImageDimension,
  ImageOutputType,
} from './types';

const DEFAULT_QUALITY = 0.8;
const DEFAULT_TARGET_SIZE_KB = 500;
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1080;
const MIN_QUALITY = 0.01;
const MAX_SIZE_ATTEMPTS = 12;
const QUALITY_SEARCH_STEPS = 10;
const OUTPUT_TYPES: readonly ImageOutputType[] = ['image/png', 'image/jpeg', 'image/webp'];

export interface ImageCompressLoadedResource {
  image: HTMLImageElement;
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  originalType: string;
  originalDimension: ImageDimension;
  dispose: () => void;
}

export interface NormalizedCompressOptions {
  mode: CompressMode;
  quality: number;
  targetBytes: number;
  maxWidth: number;
  maxHeight: number;
  outputType: ImageOutputType;
  keepAspectRatio: boolean;
  backgroundColor: string;
  signal?: AbortSignal;
}

function isCompressMode(value: unknown): value is CompressMode {
  return value === 'quality' || value === 'size' || value === 'dimension';
}

function isOutputType(value: unknown): value is ImageOutputType {
  return OUTPUT_TYPES.includes(value as ImageOutputType);
}

function normalizeFiniteNumber(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum = Number.POSITIVE_INFINITY
): number {
  if (!Number.isFinite(value) || (value as number) <= 0) return fallback;
  return Math.min(maximum, Math.max(minimum, value as number));
}

/** 将所有运行时选项收敛到 Canvas 可以可靠执行的范围。 */
export function normalizeCompressOptions(options: CompressOptions = {}): NormalizedCompressOptions {
  const targetSize = normalizeFiniteNumber(options.targetSize, DEFAULT_TARGET_SIZE_KB, 0.001);

  return {
    mode: isCompressMode(options.mode) ? options.mode : 'quality',
    quality: normalizeFiniteNumber(options.quality, DEFAULT_QUALITY, MIN_QUALITY, 1),
    targetBytes: targetSize * 1024,
    maxWidth: Math.floor(normalizeFiniteNumber(options.maxWidth, DEFAULT_MAX_WIDTH, 1)),
    maxHeight: Math.floor(normalizeFiniteNumber(options.maxHeight, DEFAULT_MAX_HEIGHT, 1)),
    outputType: isOutputType(options.outputType) ? options.outputType : 'image/jpeg',
    keepAspectRatio: options.keepAspectRatio !== false,
    backgroundColor: options.backgroundColor?.trim() || '#ffffff',
    signal: options.signal,
  };
}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ExImageCompressError('ABORTED', '图片压缩已取消');
  }
}

function assertDomAvailable(): void {
  if (
    typeof document === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new ExImageCompressError('DOM_UNAVAILABLE', '当前环境不支持浏览器图片压缩');
  }
}

async function resolveSourceBlob(source: ImageCompressSource, signal?: AbortSignal): Promise<Blob> {
  assertNotAborted(signal);

  if (source instanceof Blob) return source;
  if (typeof source !== 'string' || !source.trim()) {
    throw new ExImageCompressError('INVALID_SOURCE', '图片来源不能为空');
  }
  if (typeof fetch !== 'function') {
    throw new ExImageCompressError('SOURCE_FETCH_FAILED', '当前环境无法读取远程图片');
  }

  try {
    const response = await fetch(source, { signal });
    if (!response.ok) {
      throw new ExImageCompressError(
        'SOURCE_FETCH_FAILED',
        '图片请求失败，HTTP 状态码 ' + String(response.status)
      );
    }
    return await response.blob();
  } catch (error) {
    throw toImageCompressError(error, 'SOURCE_FETCH_FAILED', '图片请求失败');
  }
}

function decodeImage(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    let settled = false;

    const cleanup = (): void => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener('abort', handleAbort);
    };
    const finishResolve = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(image);
    };
    const finishReject = (error: ExImageCompressError): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const handleAbort = (): void => {
      image.src = '';
      finishReject(new ExImageCompressError('ABORTED', '图片加载已取消'));
    };

    image.onload = () => finishResolve();
    image.onerror = event => {
      finishReject(new ExImageCompressError('LOAD_FAILED', '图片无法解码', event));
    };
    signal?.addEventListener('abort', handleAbort, { once: true });

    if (signal?.aborted) {
      handleAbort();
      return;
    }
    image.src = url;
  });
}

/** 读取并解码一次图片资源；调用方必须在不再使用时执行 dispose。 */
export async function loadImageResource(
  source: ImageCompressSource,
  signal?: AbortSignal
): Promise<ImageCompressLoadedResource> {
  assertDomAvailable();
  const blob = await resolveSourceBlob(source, signal);
  assertNotAborted(signal);

  if (blob.size <= 0 || (blob.type && !blob.type.toLowerCase().startsWith('image/'))) {
    throw new ExImageCompressError('INVALID_SOURCE', '来源不是有效图片');
  }

  const previewUrl = URL.createObjectURL(blob);
  try {
    const image = await decodeImage(previewUrl, signal);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new ExImageCompressError('INVALID_DIMENSION', '图片尺寸无效');
    }

    let disposed = false;
    return {
      image,
      blob,
      previewUrl,
      originalSize: blob.size,
      originalType: blob.type || 'application/octet-stream',
      originalDimension: { width, height },
      dispose: () => {
        if (disposed) return;
        disposed = true;
        URL.revokeObjectURL(previewUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw toImageCompressError(error, 'LOAD_FAILED', '图片加载失败');
  }
}

/** 计算尺寸模式输出尺寸，保持比例时不会放大原图。 */
export function calculateCompressedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
  keepAspectRatio: boolean
): ImageDimension {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new ExImageCompressError('INVALID_DIMENSION', '图片尺寸无效');
  }

  const safeMaxWidth = Math.max(1, Math.floor(maxWidth));
  const safeMaxHeight = Math.max(1, Math.floor(maxHeight));
  if (!keepAspectRatio) {
    return {
      width: Math.min(Math.round(width), safeMaxWidth),
      height: Math.min(Math.round(height), safeMaxHeight),
    };
  }

  const scale = Math.min(1, safeMaxWidth / width, safeMaxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawImage(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  resource: ImageCompressLoadedResource,
  dimension: ImageDimension,
  options: NormalizedCompressOptions
): void {
  canvas.width = dimension.width;
  canvas.height = dimension.height;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, dimension.width, dimension.height);

  if (options.outputType === 'image/jpeg') {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, dimension.width, dimension.height);
  }
  context.drawImage(resource.image, 0, 0, dimension.width, dimension.height);
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  outputType: ImageOutputType,
  quality: number | undefined,
  signal?: AbortSignal
): Promise<Blob> {
  assertNotAborted(signal);

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = (): void => signal?.removeEventListener('abort', handleAbort);
    const finishReject = (error: ExImageCompressError): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const handleAbort = (): void => {
      finishReject(new ExImageCompressError('ABORTED', '图片压缩已取消'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
    try {
      canvas.toBlob(
        blob => {
          if (settled) return;
          if (!blob) {
            finishReject(new ExImageCompressError('ENCODE_FAILED', '浏览器未能编码图片'));
            return;
          }
          if (blob.type.toLowerCase() !== outputType) {
            finishReject(
              new ExImageCompressError('UNSUPPORTED_OUTPUT', '当前浏览器不支持输出 ' + outputType)
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
      finishReject(toImageCompressError(error, 'ENCODE_FAILED', '图片编码失败'));
    }
  });
}

interface EncodedCandidate {
  blob: Blob;
  quality: number | null;
}

async function findLossyCandidate(
  canvas: HTMLCanvasElement,
  outputType: Exclude<ImageOutputType, 'image/png'>,
  targetBytes: number,
  signal?: AbortSignal
): Promise<{ candidate: EncodedCandidate | null; smallest: Blob }> {
  let low = MIN_QUALITY;
  let high = 1;
  let bestBlob = await encodeCanvas(canvas, outputType, low, signal);
  const smallest = bestBlob;
  let bestQuality = low;

  if (bestBlob.size > targetBytes) {
    return { candidate: null, smallest };
  }

  for (let index = 0; index < QUALITY_SEARCH_STEPS; index += 1) {
    const quality = (low + high) / 2;
    const blob = await encodeCanvas(canvas, outputType, quality, signal);
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = quality;
      low = quality;
    } else {
      high = quality;
    }
  }

  return {
    candidate: {
      blob: bestBlob,
      quality: bestQuality,
    },
    smallest,
  };
}

function shrinkDimension(
  dimension: ImageDimension,
  currentBytes: number,
  targetBytes: number
): ImageDimension {
  const estimatedScale = Math.sqrt(targetBytes / Math.max(1, currentBytes)) * 0.95;
  const scale = Math.min(0.9, Math.max(0.1, estimatedScale));
  const width = Math.max(1, Math.floor(dimension.width * scale));
  const height = Math.max(1, Math.floor(dimension.height * scale));

  return {
    width: width === dimension.width && width > 1 ? width - 1 : width,
    height: height === dimension.height && height > 1 ? height - 1 : height,
  };
}

async function encodeToTargetSize(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  resource: ImageCompressLoadedResource,
  initialDimension: ImageDimension,
  options: NormalizedCompressOptions
): Promise<{ candidate: EncodedCandidate; dimension: ImageDimension }> {
  let dimension = initialDimension;

  for (let attempt = 0; attempt < MAX_SIZE_ATTEMPTS; attempt += 1) {
    assertNotAborted(options.signal);
    drawImage(canvas, context, resource, dimension, options);

    let candidate: EncodedCandidate | null;
    let smallest: Blob;
    if (options.outputType === 'image/png') {
      smallest = await encodeCanvas(canvas, options.outputType, undefined, options.signal);
      candidate = smallest.size <= options.targetBytes ? { blob: smallest, quality: null } : null;
    } else {
      const search = await findLossyCandidate(
        canvas,
        options.outputType,
        options.targetBytes,
        options.signal
      );
      candidate = search.candidate;
      smallest = search.smallest;
    }

    if (candidate) return { candidate, dimension };
    if (dimension.width === 1 && dimension.height === 1) break;
    dimension = shrinkDimension(dimension, smallest.size, options.targetBytes);
  }

  throw new ExImageCompressError('TARGET_UNREACHABLE', '当前格式无法达到目标文件大小');
}

/** 对已加载资源执行唯一一套压缩算法，不接管资源生命周期。 */
export async function compressLoadedImage(
  resource: ImageCompressLoadedResource,
  rawOptions: CompressOptions = {}
): Promise<CompressResult> {
  assertDomAvailable();
  const options = normalizeCompressOptions(rawOptions);
  assertNotAborted(options.signal);

  if (options.mode === 'quality' && options.outputType === 'image/png') {
    throw new ExImageCompressError('UNSUPPORTED_MODE', 'PNG 为无损格式，不支持质量模式');
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new ExImageCompressError('CANVAS_UNAVAILABLE', '当前浏览器无法创建 Canvas 2D 上下文');
  }

  try {
    let dimension = resource.originalDimension;
    if (options.mode === 'dimension') {
      dimension = calculateCompressedDimensions(
        resource.originalDimension.width,
        resource.originalDimension.height,
        options.maxWidth,
        options.maxHeight,
        options.keepAspectRatio
      );
    }

    let encoded: EncodedCandidate;
    if (options.mode === 'size') {
      const sized = await encodeToTargetSize(canvas, context, resource, dimension, options);
      encoded = sized.candidate;
      dimension = sized.dimension;
    } else {
      drawImage(canvas, context, resource, dimension, options);
      const quality = options.outputType === 'image/png' ? undefined : options.quality;
      encoded = {
        blob: await encodeCanvas(canvas, options.outputType, quality, options.signal),
        quality: quality ?? null,
      };
    }

    const compressionRatio =
      resource.originalSize > 0
        ? Math.round((1 - encoded.blob.size / resource.originalSize) * 100)
        : 0;

    return {
      blob: encoded.blob,
      originalSize: resource.originalSize,
      originalType: resource.originalType,
      compressedSize: encoded.blob.size,
      compressionRatio,
      originalDimension: { ...resource.originalDimension },
      compressedDimension: { ...dimension },
      outputType: options.outputType,
      qualityUsed: encoded.quality,
      mode: options.mode,
    };
  } finally {
    // 归零画布可尽快释放浏览器持有的像素缓冲区。
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** 加载、压缩并可靠释放单张图片资源。 */
export async function compressImage(
  source: ImageCompressSource,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const resource = await loadImageResource(source, options.signal);
  try {
    return await compressLoadedImage(resource, options);
  } finally {
    resource.dispose();
  }
}

/** 顺序压缩可限制多张大图同时占用的 Canvas 像素内存。 */
export async function compressImages(
  sources: readonly ImageCompressSource[],
  options: CompressOptions = {}
): Promise<CompressResult[]> {
  const results: CompressResult[] = [];
  for (const source of sources) {
    results.push(await compressImage(source, options));
  }
  return results;
}

/** 将非负字节数格式化为稳定的二进制单位字符串。 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError('bytes 必须是非负有限数');
  }
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const unitIndex = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** unitIndex;
  return unitIndex === 0 ? Math.round(value) + ' B' : value.toFixed(2) + ' ' + units[unitIndex];
}

function getFileExtension(type: string): string {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'bin';
}

/** 通过临时原生链接下载 Blob，并在浏览器接管点击后释放 URL。 */
export function downloadCompressedImage(blob: Blob, filename?: string): void {
  assertDomAvailable();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    filename?.trim() || 'compressed-' + String(Date.now()) + '.' + getFileExtension(blob.type);
  link.style.display = 'none';

  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
