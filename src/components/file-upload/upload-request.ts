import { ExFileUploadError } from './errors';
import {
  isSuccessfulUploadStatus,
  normalizeUploadMethod,
  normalizeUploadPercent,
  normalizeUploadTimeout,
} from './upload-utils';
import type {
  UploadAction,
  UploadConfigResolver,
  UploadData,
  UploadFile,
  UploadHeaders,
  UploadHttpMethod,
  UploadResolveContext,
} from './types';

export type UploadTransportResult =
  | { outcome: 'success'; response: unknown }
  | { outcome: 'error'; error: ExFileUploadError }
  | { outcome: 'aborted' };

export interface UploadRequestOptions {
  file: UploadFile;
  action: UploadAction;
  method?: UploadHttpMethod;
  headers?: UploadHeaders | UploadConfigResolver<UploadHeaders>;
  data?: UploadData | UploadConfigResolver<UploadData>;
  name?: string;
  withCredentials?: boolean;
  timeout?: number;
  onProgress?: (percent: number) => void;
}

export interface UploadRequestHandle {
  promise: Promise<UploadTransportResult>;
  /** 返回本次调用是否真实中止了尚未完成的任务。 */
  abort: () => boolean;
}

const resolveConfig = async <T>(
  value: T | UploadConfigResolver<T> | undefined,
  file: UploadFile,
  context: UploadResolveContext
): Promise<T | undefined> => {
  if (typeof value === 'function') {
    return (value as UploadConfigResolver<T>)(file, context);
  }
  return value;
};

const resolveAction = async (
  action: UploadAction,
  file: UploadFile,
  context: UploadResolveContext
): Promise<string> => {
  const value = typeof action === 'function' ? await action(file, context) : action;
  if (typeof value !== 'string') {
    throw new ExFileUploadError('上传地址解析器必须返回字符串', {
      code: 'configuration-error',
    });
  }
  const url = value.trim();
  if (!url) {
    throw new ExFileUploadError('上传地址不能为空', { code: 'configuration-error' });
  }
  return url;
};

const createFormData = (file: UploadFile, fieldName: string, data?: UploadData): FormData => {
  if (!file.raw) {
    throw new ExFileUploadError('待上传文件缺少原始 File', { code: 'configuration-error' });
  }

  const formData = new FormData();
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;
      if (value instanceof Blob) formData.append(key, value);
      else formData.append(key, String(value));
    }
  }
  formData.append(fieldName.trim() || 'file', file.raw, file.raw.name);
  return formData;
};

const applyHeaders = (request: XMLHttpRequest, headers?: UploadHeaders): void => {
  if (!headers) return;
  for (const [name, value] of Object.entries(headers)) {
    if (name.trim().toLowerCase() === 'content-type') {
      throw new ExFileUploadError('multipart 上传不能手动设置 Content-Type', {
        code: 'configuration-error',
      });
    }
    request.setRequestHeader(name, value);
  }
};

const parseResponse = (request: XMLHttpRequest): unknown => {
  const text = request.responseText;
  if (!text) return null;
  const contentType =
    typeof request.getResponseHeader === 'function'
      ? (request.getResponseHeader('content-type')?.toLowerCase() ?? '')
      : '';
  const trimmed = text.trim();
  const declaresJson = contentType.includes('application/json') || contentType.includes('+json');
  const resemblesJson = trimmed.startsWith('{') || trimmed.startsWith('[');

  if (declaresJson || resemblesJson) {
    try {
      return JSON.parse(text) as unknown;
    } catch (cause) {
      if (declaresJson) {
        throw new ExFileUploadError('服务端返回了无效 JSON', {
          code: 'response-error',
          status: request.status,
          cause,
        });
      }
    }
  }
  return text;
};

const normalizeTransportError = (cause: unknown): ExFileUploadError =>
  cause instanceof ExFileUploadError
    ? cause
    : new ExFileUploadError('无法创建或发送上传请求', {
        code: 'request-error',
        cause,
      });

/**
 * 创建一个可在动态配置解析阶段中止的 XHR 上传任务。
 * Promise 只以可判别结果兑现，不产生未处理 rejection。
 */
export function createUploadRequest(options: UploadRequestOptions): UploadRequestHandle {
  const controller = new AbortController();
  const context: UploadResolveContext = { signal: controller.signal };
  let request: XMLHttpRequest | null = null;
  let completed = false;
  let settle: (result: UploadTransportResult) => void = () => undefined;

  const finish = (result: UploadTransportResult): void => {
    if (completed) return;
    completed = true;
    request = null;
    settle(result);
  };

  const promise = new Promise<UploadTransportResult>(resolve => {
    settle = resolve;

    void (async () => {
      try {
        const url = await resolveAction(options.action, options.file, context);
        if (controller.signal.aborted) return;
        const headers = await resolveConfig(options.headers, options.file, context);
        if (controller.signal.aborted) return;
        const data = await resolveConfig(options.data, options.file, context);
        if (controller.signal.aborted) return;

        const xhr = new XMLHttpRequest();
        request = xhr;
        xhr.upload.addEventListener('progress', event => {
          if (!event.lengthComputable || event.total <= 0) return;
          options.onProgress?.(normalizeUploadPercent((event.loaded / event.total) * 100));
        });
        xhr.addEventListener('load', () => {
          if (!isSuccessfulUploadStatus(xhr.status)) {
            finish({
              outcome: 'error',
              error: new ExFileUploadError(xhr.statusText || `上传请求返回 HTTP ${xhr.status}`, {
                code: 'http-error',
                status: xhr.status,
              }),
            });
            return;
          }
          try {
            finish({ outcome: 'success', response: parseResponse(xhr) });
          } catch (cause) {
            finish({ outcome: 'error', error: normalizeTransportError(cause) });
          }
        });
        xhr.addEventListener('error', event => {
          finish({
            outcome: 'error',
            error: new ExFileUploadError('上传请求发生网络错误', {
              code: 'request-error',
              cause: event,
            }),
          });
        });
        xhr.addEventListener('timeout', event => {
          finish({
            outcome: 'error',
            error: new ExFileUploadError('上传请求超时', { code: 'timeout', cause: event }),
          });
        });
        xhr.addEventListener('abort', () => finish({ outcome: 'aborted' }));

        const formData = createFormData(options.file, options.name ?? 'file', data);
        xhr.open(normalizeUploadMethod(options.method), url, true);
        xhr.withCredentials = options.withCredentials === true;
        xhr.timeout = normalizeUploadTimeout(options.timeout);
        applyHeaders(xhr, headers);
        xhr.send(formData);
      } catch (cause) {
        if (controller.signal.aborted) return;
        finish({ outcome: 'error', error: normalizeTransportError(cause) });
      }
    })();
  });

  const abort = (): boolean => {
    if (completed) return false;
    controller.abort();
    try {
      request?.abort();
    } catch {
      // 中止结果由任务控制器确定，旧浏览器的 XHR 清理异常不能改变该终态。
    }
    finish({ outcome: 'aborted' });
    return true;
  };

  return { promise, abort };
}
