import type { UploadFile, UploadHttpMethod } from './types';

/** 按原生 accept 语义匹配扩展名、精确 MIME 和 MIME 通配符。 */
export function matchesUploadAccept(file: File, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  const rules = accept
    .split(',')
    .map(rule => rule.trim().toLowerCase())
    .filter(Boolean);

  if (rules.length === 0) return true;
  return rules.some(rule => {
    if (rule.startsWith('.')) return fileName.endsWith(rule);
    if (rule.endsWith('/*')) return mimeType.startsWith(rule.slice(0, -1));
    return Boolean(mimeType && mimeType === rule);
  });
}

/** 把数量限制规范为非负安全整数；非法值表示不限制。 */
export function normalizeUploadLimit(limit?: number): number | undefined {
  if (!Number.isFinite(limit)) return undefined;
  const normalized = Math.max(0, Math.floor(limit ?? 0));
  return Number.isSafeInteger(normalized) ? normalized : undefined;
}

/** 把文件大小限制规范为正安全整数字节；非法值表示不限制。 */
export function normalizeUploadMaxFileSize(maxFileSize?: number): number | undefined {
  if (!Number.isFinite(maxFileSize) || (maxFileSize ?? 0) <= 0) return undefined;
  const normalized = Math.floor(maxFileSize ?? 0);
  return Number.isSafeInteger(normalized) ? normalized : undefined;
}

/** 把任意进度限制到 0 至 100 的整数。 */
export function normalizeUploadPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/** 创建隔离的列表与文件项快照，同时保留 File、响应和错误对象引用。 */
export function cloneUploadFileList(files: readonly UploadFile[]): UploadFile[] {
  return files.map(file => ({ ...file }));
}

/** 运行时修复请求方法，避免动态绑定非法字符串。 */
export function normalizeUploadMethod(method?: UploadHttpMethod): UploadHttpMethod {
  return method === 'PUT' || method === 'PATCH' ? method : 'POST';
}

/** 运行时修复 XHR 超时值。 */
export function normalizeUploadTimeout(timeout?: number): number {
  if (!Number.isFinite(timeout) || (timeout ?? 0) <= 0) return 0;
  const normalized = Math.floor(timeout ?? 0);
  return Number.isSafeInteger(normalized) ? normalized : 0;
}

export const isSuccessfulUploadStatus = (status: number): boolean => status >= 200 && status < 300;

/** 仅从结构明确的对象响应中提取服务端文件地址。 */
export function getUploadResponseUrl(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const url = (response as { url?: unknown }).url;
  return typeof url === 'string' && url.trim() ? url : undefined;
}

/** 为选择区生成紧凑且稳定的文件大小提示。 */
export function formatUploadFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${Math.ceil((bytes / (1024 * 1024)) * 10) / 10} MB`;
}
