import type { PreviewFile, PreviewType } from './types';

export interface PreviewScaleConfig {
  min: number;
  max: number;
  step: number;
}

const IMAGE_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
]);
const VIDEO_EXTENSIONS = new Set(['m4v', 'mp4', 'ogv', 'webm']);
const AUDIO_EXTENSIONS = new Set(['aac', 'flac', 'm4a', 'mp3', 'oga', 'opus', 'wav']);
const TEXT_EXTENSIONS = new Set(['csv', 'log', 'md', 'markdown', 'text', 'txt']);
const CODE_EXTENSIONS = new Set([
  'c',
  'cjs',
  'cpp',
  'css',
  'go',
  'h',
  'html',
  'java',
  'js',
  'json',
  'jsx',
  'mjs',
  'php',
  'py',
  'rb',
  'rs',
  'scss',
  'sh',
  'sql',
  'ts',
  'tsx',
  'vue',
  'xml',
  'yaml',
  'yml',
]);

const CODE_MIME_TYPES = new Set([
  'application/javascript',
  'application/json',
  'application/ld+json',
  'application/typescript',
  'application/xml',
  'application/yaml',
  'text/css',
  'text/html',
  'text/javascript',
  'text/typescript',
  'text/xml',
  'text/yaml',
]);

const SAFE_TEXT_DATA_MIME_TYPES = new Set([
  'application/json',
  'application/ld+json',
  'application/xml',
  'application/yaml',
  'text/css',
  'text/csv',
  'text/javascript',
  'text/markdown',
  'text/plain',
  'text/typescript',
  'text/xml',
  'text/yaml',
]);

const DEFAULT_SCALE_CONFIG: PreviewScaleConfig = { min: 0.1, max: 5, step: 0.1 };
const EXPLICIT_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

const hasUnsafeUrlCharacter = (url: string): boolean =>
  Array.from(url).some(character => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || codePoint === 127;
  });

const normalizeMimeType = (mimeType?: string): string =>
  mimeType?.split(';', 1)[0]?.trim().toLowerCase() ?? '';

const detectMimeType = (mimeType: string): PreviewType | null => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (CODE_MIME_TYPES.has(mimeType)) return 'code';
  if (mimeType.startsWith('text/')) return 'text';
  return null;
};

const getDataMimeType = (url: string): string => {
  if (!url.toLowerCase().startsWith('data:')) return '';
  const commaIndex = url.indexOf(',');
  if (commaIndex < 0) return '';
  const descriptor = url.slice(5, commaIndex);
  return normalizeMimeType(descriptor) || 'text/plain';
};

const getExtension = (url: string): string => {
  const cleanUrl = url.split(/[?#]/, 1)[0] ?? '';
  const lastSegment = cleanUrl.split(/[\\/]/).pop() ?? '';
  const dotIndex = lastSegment.lastIndexOf('.');
  return dotIndex > -1 ? lastSegment.slice(dotIndex + 1).toLowerCase() : '';
};

/** 按文件显式类型、组件兜底类型、MIME、扩展名的顺序识别预览类型。 */
export function detectPreviewType(file: PreviewFile, fallback?: PreviewType): PreviewType {
  if (file.type) return file.type;
  if (fallback) return fallback;

  const mimeType = normalizeMimeType(file.mimeType) || getDataMimeType(file.url);
  const mimeTypeResult = detectMimeType(mimeType);
  if (mimeTypeResult) return mimeTypeResult;

  const extension = getExtension(file.url);
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (extension === 'pdf') return 'pdf';
  if (TEXT_EXTENSIONS.has(extension)) return 'text';
  if (CODE_EXTENSIONS.has(extension)) return 'code';

  // .ogg 同时可能是音频或视频，缺少 MIME 时不能可靠猜测。
  return 'unknown';
}

const isDataMimeAllowed = (mimeType: string, type: PreviewType): boolean => {
  if (type === 'image') return mimeType.startsWith('image/');
  if (type === 'video') return mimeType.startsWith('video/');
  if (type === 'audio') return mimeType.startsWith('audio/');
  if (type === 'pdf') return mimeType === 'application/pdf';
  if (type === 'text' || type === 'code') return SAFE_TEXT_DATA_MIME_TYPES.has(mimeType);
  return false;
};

/**
 * 校验预览地址协议。相对地址保持调用方原始语义，只移除首尾空白；
 * data 地址还会校验媒体类型，避免把可执行文档交给内嵌浏览上下文。
 */
export function validatePreviewUrl(
  rawUrl: string,
  type: PreviewType,
  baseUrl = 'https://ex-ui.invalid/'
): string | null {
  const url = rawUrl.trim();
  if (!url || hasUnsafeUrlCharacter(url)) return null;

  if (url.toLowerCase().startsWith('data:')) {
    const mimeType = getDataMimeType(url);
    return mimeType && isDataMimeAllowed(mimeType, type) ? url : null;
  }

  if (EXPLICIT_SCHEME_PATTERN.test(url)) {
    try {
      const protocol = new URL(url).protocol.toLowerCase();
      return protocol === 'http:' || protocol === 'https:' || protocol === 'blob:' ? url : null;
    } catch {
      return null;
    }
  }

  try {
    const resolvedProtocol = new URL(url, baseUrl).protocol.toLowerCase();
    return resolvedProtocol === 'http:' || resolvedProtocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/** 把任意索引收敛到当前文件列表的有效整数范围。 */
export function clampPreviewIndex(index: number, length: number): number {
  if (!Number.isFinite(length) || length <= 0) return 0;
  const normalizedIndex = Number.isFinite(index) ? Math.floor(index) : 0;
  return Math.min(Math.max(normalizedIndex, 0), Math.floor(length) - 1);
}

/** 修复缩放边界与步长，保证后续计算始终单调且可终止。 */
export function resolvePreviewScaleConfig(
  minScale: number,
  maxScale: number,
  scaleStep: number
): PreviewScaleConfig {
  const min = Number.isFinite(minScale) && minScale > 0 ? minScale : DEFAULT_SCALE_CONFIG.min;
  const candidateMax =
    Number.isFinite(maxScale) && maxScale > 0 ? maxScale : DEFAULT_SCALE_CONFIG.max;
  const max = Math.max(min, candidateMax);
  const step = Number.isFinite(scaleStep) && scaleStep > 0 ? scaleStep : DEFAULT_SCALE_CONFIG.step;
  return { min, max, step };
}

/** 把缩放值限制在安全区间，并消除浮点步进产生的尾差。 */
export function clampPreviewScale(value: number, config: PreviewScaleConfig): number {
  const finiteValue = Number.isFinite(value) ? value : config.min;
  const clamped = Math.min(Math.max(finiteValue, config.min), config.max);
  return Math.round(clamped * 1_000_000_000_000) / 1_000_000_000_000;
}

/** 把任意旋转角规范到 [0, 360) 区间。 */
export function normalizePreviewRotation(rotation: number): number {
  if (!Number.isFinite(rotation)) return 0;
  const normalized = rotation % 360;
  const positive = normalized < 0 ? normalized + 360 : normalized;
  return Object.is(positive, -0) ? 0 : positive;
}
