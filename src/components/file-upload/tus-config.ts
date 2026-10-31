import { ExFileUploadError } from './errors';
import type { UploadTusOptions } from './tus-types';
import type { UploadHeaders } from './types';

export const DEFAULT_TUS_RETRY_DELAYS = [0, 1000, 3000, 5000] as const;
const HEADER_NAME = /^[!#$%&'*+.^_`|~\da-z-]+$/i;
const RESERVED_HEADERS = /^(?:tus-|upload-|content-length$|content-type$|host$)/i;
const hasControlCharacter = (value: string) =>
  Array.from(value).some(character => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });

export const tusConfigurationError = (message: string) =>
  new ExFileUploadError(message, { code: 'configuration-error' });

/** 协议参数严格拒绝非法输入，避免无限重试、空分片或服务端偏移损坏。 */
export function normalizeTusOptions(options: UploadTusOptions = {}) {
  const chunkSize = options.chunkSize ?? Number.POSITIVE_INFINITY;
  if (
    chunkSize !== Number.POSITIVE_INFINITY &&
    (!Number.isSafeInteger(chunkSize) || chunkSize <= 0)
  ) {
    throw tusConfigurationError('tus chunkSize 必须为正安全整数');
  }
  const retryDelays = options.retryDelays ?? DEFAULT_TUS_RETRY_DELAYS;
  if (
    !Array.isArray(retryDelays) ||
    retryDelays.some(delay => !Number.isSafeInteger(delay) || delay < 0)
  ) {
    throw tusConfigurationError('tus retryDelays 必须为非负安全整数数组');
  }
  return { chunkSize, retryDelays: [...retryDelays], resume: options.resume !== false };
}

/** 地址解析先于认证请求；不允许凭证内嵌、执行协议或控制字符。 */
export function resolveTusUrl(value: string, base = document.baseURI): URL {
  if (typeof value !== 'string' || !value.trim() || hasControlCharacter(value)) {
    throw tusConfigurationError('tus 上传地址无效');
  }
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    throw tusConfigurationError('tus 上传地址无效');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) {
    throw tusConfigurationError('tus 仅允许不含凭证和片段的 HTTP(S) 地址');
  }
  return url;
}

export function createTusUrlGuard(endpoint: URL, options: UploadTusOptions = {}) {
  const origins = new Set([endpoint.origin]);
  for (const origin of options.allowedOrigins ?? []) {
    const parsed = resolveTusUrl(origin, endpoint.href);
    if (parsed.href !== `${parsed.origin}/`) {
      throw tusConfigurationError('tus allowedOrigins 必须使用完整来源地址');
    }
    origins.add(parsed.origin);
  }
  return (value: string) => {
    const url = resolveTusUrl(value, endpoint.href);
    if (!origins.has(url.origin)) throw tusConfigurationError('tus 上传资源来源不在允许列表中');
    return url.href;
  };
}

export function validateTusHeaders(headers: UploadHeaders | undefined): UploadHeaders {
  const result: UploadHeaders = {};
  for (const [name, value] of Object.entries(headers ?? {})) {
    if (
      !HEADER_NAME.test(name) ||
      RESERVED_HEADERS.test(name) ||
      typeof value !== 'string' ||
      /[\r\n]/.test(value)
    ) {
      throw tusConfigurationError('tus 自定义请求头不能覆盖协议头或包含非法字符');
    }
    result[name] = value;
  }
  return result;
}

export function validateTusMetadata(value: Record<string, string> | undefined) {
  const metadata: Record<string, string> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    if (!key || /[,\s]/.test(key) || hasControlCharacter(key) || typeof item !== 'string') {
      throw tusConfigurationError('tus 元数据键不得包含空白或逗号，值必须为字符串');
    }
    metadata[key] = item;
  }
  return metadata;
}
