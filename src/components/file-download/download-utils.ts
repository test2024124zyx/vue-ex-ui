import { ExFileDownloadError } from './errors';
import type { ExFileDownloadProgress } from './types';
import { formatFileSize } from '../../utils/format';

const ALLOWED_DOWNLOAD_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);
const DEFAULT_DOWNLOAD_NAME = 'download';
const UNICODE_FILENAME_FORMAT_CONTROLS =
  /[\u00ad\u061c\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g;

const runtimeBaseUrl = (): string => {
  if (typeof globalThis.location !== 'undefined' && globalThis.location.href) {
    return globalThis.location.href;
  }
  if (typeof document !== 'undefined' && document.baseURI) return document.baseURI;
  return 'http://localhost/';
};

/** 只允许可下载的网络协议，阻止 javascript、data 与本地文件协议。 */
export const normalizeDownloadUrl = (value: string, base = runtimeBaseUrl()): string => {
  const input = value.trim();
  if (!input) {
    throw new ExFileDownloadError('invalid-url', '下载地址不能为空');
  }

  let url: URL;
  try {
    url = new URL(input, base);
  } catch (cause) {
    throw new ExFileDownloadError('invalid-url', '下载地址格式无效', { cause });
  }

  if (!ALLOWED_DOWNLOAD_PROTOCOLS.has(url.protocol)) {
    throw new ExFileDownloadError('invalid-url', `不支持下载协议：${url.protocol}`);
  }

  return url.href;
};

/** 清理路径、控制字符和跨平台保留字符，避免下载属性产生意外文件名。 */
export const sanitizeDownloadFilename = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;

  const pathSegments = value.split(/[\\/]+/);
  const pathTail = pathSegments[pathSegments.length - 1] ?? '';
  const withoutControlCharacters = Array.from(pathTail, character => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127 ? '_' : character;
  }).join('');
  let filename = withoutControlCharacters
    .replace(UNICODE_FILENAME_FORMAT_CONTROLS, '_')
    .replace(/[<>:"|?*%]/g, '_')
    .trim()
    .replace(/[. ]+$/g, '');

  if (!filename || filename === '.' || filename === '..') return undefined;
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(filename)) {
    filename = `_${filename}`;
  }

  return Array.from(filename).slice(0, 240).join('') || undefined;
};

/** 解析 Content-Disposition 中的 RFC 5987 或传统 filename 参数。 */
export const parseContentDispositionFilename = (
  header: string | null | undefined
): string | undefined => {
  if (!header) return undefined;

  const extendedMatch = header.match(/filename\*\s*=\s*([^;]+)/i);
  if (extendedMatch) {
    const parameter = (extendedMatch[1] ?? '').trim().replace(/^"|"$/g, '');
    const encoded = parameter.replace(/^[^']*'[^']*'/, '');
    try {
      const decoded = decodeURIComponent(encoded);
      const filename = sanitizeDownloadFilename(decoded);
      if (filename) return filename;
    } catch {
      // 编码异常时继续尝试普通 filename，避免整个下载流程失败。
    }
  }

  const basicMatch = header.match(/filename\s*=\s*("(?:\\.|[^"])*"|[^;]+)/i);
  if (!basicMatch) return undefined;

  const raw = (basicMatch[1] ?? '').trim();
  const unquoted = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  return sanitizeDownloadFilename(unquoted.replace(/\\(.)/g, '$1'));
};

const filenameFromUrl = (url: string): string | undefined => {
  try {
    const pathname = new URL(url, runtimeBaseUrl()).pathname;
    const segments = pathname.split('/');
    const tail = segments[segments.length - 1];
    if (!tail) return undefined;
    try {
      return sanitizeDownloadFilename(decodeURIComponent(tail));
    } catch {
      return sanitizeDownloadFilename(tail);
    }
  } catch {
    return undefined;
  }
};

/** 按调用方、响应头、地址路径的优先级解析最终下载文件名。 */
export const resolveDownloadFilename = (
  explicitFilename: string | undefined,
  contentDisposition: string | null | undefined,
  url: string
): string =>
  sanitizeDownloadFilename(explicitFilename) ??
  parseContentDispositionFilename(contentDisposition) ??
  filenameFromUrl(url) ??
  DEFAULT_DOWNLOAD_NAME;

/** 严格解析 Content-Length，拒绝小数、负数和超出安全整数的值。 */
export const parseContentLength = (value: string | null): number | null => {
  if (value === null || !/^\d+$/.test(value.trim())) return null;
  const length = Number(value);
  return Number.isSafeInteger(length) ? length : null;
};

/** 生成不伪造未知总量的下载进度。 */
export const calculateDownloadProgress = (
  loaded: number,
  total: number | null,
  complete = false
): ExFileDownloadProgress => {
  const safeLoaded = Number.isFinite(loaded) && loaded > 0 ? loaded : 0;
  const safeTotal = total !== null && Number.isFinite(total) && total >= 0 ? total : null;
  const percent = complete
    ? 100
    : safeTotal !== null && safeTotal > 0
      ? Math.min(100, Math.max(0, Math.round((safeLoaded / safeTotal) * 100)))
      : null;

  return { loaded: safeLoaded, total: safeTotal, percent };
};

/** 下载命名空间保留兼容别名，实际格式化能力统一由共享工具实现。 */
export const formatDownloadBytes = formatFileSize;
