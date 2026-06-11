/**
 * 图片压缩工具函数
 * 提供无需 UI 的后台压缩功能
 */

import type { CompressResult, CompressMode } from './types';

export interface CompressOptions {
  /** 压缩模式 */
  mode?: CompressMode;
  /** 压缩质量 0-1 */
  quality?: number;
  /** 目标文件大小（KB） */
  targetSize?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 输出格式 */
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 是否保持宽高比 */
  keepAspectRatio?: boolean;
}

/**
 * 压缩图片
 * @param src 图片源（URL 或 File）
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressImage(
  src: string | File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    mode = 'quality',
    quality = 0.8,
    targetSize = 500,
    maxWidth = 1920,
    maxHeight = 1080,
    outputType = 'image/jpeg',
    keepAspectRatio = true,
  } = options;

  // 加载图片
  const image = await loadImage(src);
  const originalSize = await getImageSize(src);
  const originalDimension = { width: image.width, height: image.height };

  // 创建 canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // 计算目标尺寸
  let width = image.width;
  let height = image.height;

  if (mode === 'dimension') {
    if (width > maxWidth || height > maxHeight) {
      if (keepAspectRatio) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }
    }
  }

  canvas.width = width;
  canvas.height = height;

  // 绘制图片
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  let finalQuality = quality;
  let blob: Blob;

  // 根据模式压缩
  if (mode === 'size') {
    // 二分查找最佳质量
    let minQuality = 0.1;
    let maxQuality = 1;
    const targetBytes = targetSize * 1024;

    while (maxQuality - minQuality > 0.01) {
      finalQuality = (minQuality + maxQuality) / 2;
      blob = await canvasToBlob(canvas, outputType, finalQuality);

      if (blob.size > targetBytes) {
        maxQuality = finalQuality;
      } else {
        minQuality = finalQuality;
      }
    }
    blob = await canvasToBlob(canvas, outputType, finalQuality);
  } else {
    blob = await canvasToBlob(canvas, outputType, finalQuality);
  }

  const dataUrl = canvas.toDataURL(outputType, finalQuality);
  const compressionRatio = Math.round((1 - blob.size / originalSize) * 100);

  return {
    blob,
    dataUrl,
    originalSize,
    compressedSize: blob.size,
    compressionRatio,
    originalDimension,
    compressedDimension: { width, height },
  };
}

/**
 * 批量压缩图片
 * @param sources 图片源数组
 * @param options 压缩选项
 * @returns 压缩结果数组
 */
export async function compressImages(
  sources: Array<string | File>,
  options: CompressOptions = {}
): Promise<CompressResult[]> {
  return Promise.all(sources.map(src => compressImage(src, options)));
}

/**
 * 加载图片
 */
function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    if (typeof src === 'string') {
      image.crossOrigin = 'anonymous';
      image.src = src;
    } else {
      image.src = URL.createObjectURL(src);
    }

    image.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(image.src);
      }
      resolve(image);
    };
    
    image.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(image.src);
      }
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * 获取图片文件大小
 */
async function getImageSize(src: string | File): Promise<number> {
  if (typeof src === 'string') {
    const response = await fetch(src);
    const blob = await response.blob();
    return blob.size;
  }
  return src.size;
}

/**
 * Canvas 转 Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 下载压缩后的图片
 */
export function downloadCompressedImage(
  blob: Blob,
  filename?: string,
  outputType: string = 'image/jpeg'
): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const extension = outputType.split('/')[1];
  link.download = filename || `compressed-${Date.now()}.${extension}`;
  
  link.click();
  URL.revokeObjectURL(url);
}
