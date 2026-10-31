import type { HttpRequest, Upload } from 'tus-js-client';
import { ExFileUploadError } from './errors';
import {
  createTusUrlGuard,
  normalizeTusOptions,
  resolveTusUrl,
  tusConfigurationError,
  validateTusHeaders,
  validateTusMetadata,
} from './tus-config';
import { normalizeUploadPercent, normalizeUploadTimeout } from './upload-utils';
import { TusHttpStack } from './tus-http-stack';
import type {
  UploadRequestHandle,
  UploadRequestOptions,
  UploadTransportResult,
} from './upload-request';
import type { UploadResolveContext } from './types';
import type { UploadTusOptions, UploadTusResponse } from './tus-types';

interface TusRequestOptions extends Omit<UploadRequestOptions, 'method' | 'data' | 'name'> {
  tus?: UploadTusOptions;
  uploadUrl?: string;
  onUploadUrl?: (url: string) => void;
  onResumeUnavailable?: (error: unknown) => void;
}

export interface TusUploadHandle extends UploadRequestHandle {
  /** 当前已确认的 tus 资源地址。 */
  readonly uploadUrl: string | undefined;
  /** 使用标准 Termination 扩展永久取消；未取得资源地址时返回 false。 */
  terminate: (signal?: AbortSignal) => Promise<boolean>;
}

const transportError = (cause: unknown, code: 'request-error' | 'termination-error') => {
  if (cause instanceof ExFileUploadError) return cause;
  const underlying = (cause as { causingError?: unknown } | null)?.causingError;
  if (code === 'request-error' && underlying instanceof ExFileUploadError) return underlying;
  const response = (cause as { originalResponse?: { getStatus(): number } } | null)
    ?.originalResponse;
  const status = response?.getStatus();
  return new ExFileUploadError(
    code === 'termination-error' ? '服务端未确认取消上传资源' : 'tus 上传失败',
    { code: code === 'request-error' && status ? 'http-error' : code, status, cause }
  );
};

/** 只在实际 tus 请求时加载依赖；SSR、普通上传和基础组件不触发协议初始化。 */
export function createTusUploadRequest(options: TusRequestOptions): TusUploadHandle {
  const controller = new AbortController();
  let terminationSignal = new AbortController().signal;
  const requestCleanups = new Map<HttpRequest, () => void>();
  let upload: Upload | undefined;
  let finished = false;
  let started = false;
  let terminating = false;
  let knownUrl = options.uploadUrl;
  let settle!: (result: UploadTransportResult) => void;
  const promise = new Promise<UploadTransportResult>(resolve => {
    settle = resolve;
  });
  const current = () => !finished && !controller.signal.aborted;
  const finish = (result: UploadTransportResult) => {
    if (finished) return;
    finished = true;
    for (const cleanup of requestCleanups.values()) cleanup();
    requestCleanups.clear();
    settle(result);
  };
  const abort = () => {
    if (finished) return false;
    controller.abort();
    void upload?.abort(false).catch(() => undefined);
    finish({ outcome: 'aborted' });
    return true;
  };

  void (async () => {
    try {
      if (!options.file.raw || typeof document === 'undefined') {
        throw tusConfigurationError('tus 上传需要浏览器环境和原始 File');
      }
      const normalized = normalizeTusOptions(options.tus);
      const context: UploadResolveContext = { signal: controller.signal };
      const action =
        typeof options.action === 'function'
          ? await options.action(options.file, context)
          : options.action;
      if (!current()) return;
      const endpoint = resolveTusUrl(action);
      const guardUrl = createTusUrlGuard(endpoint, options.tus);
      if (knownUrl) knownUrl = guardUrl(knownUrl);
      const configuredMetadata = options.tus?.metadata;
      const metadata = validateTusMetadata(
        typeof configuredMetadata === 'function'
          ? await configuredMetadata(options.file, context)
          : configuredMetadata
      );
      if (!current()) return;
      const tus = await import('tus-js-client');
      if (!current()) return;
      if (!tus.isSupported) {
        throw new ExFileUploadError('当前环境不支持 tus 上传', { code: 'unsupported' });
      }
      const onBeforeRequest = async (request: HttpRequest) => {
        guardUrl(request.getURL());
        const signal = terminating ? terminationSignal : controller.signal;
        signal.throwIfAborted();
        const headers = validateTusHeaders(
          typeof options.headers === 'function'
            ? await options.headers(options.file, { signal })
            : options.headers
        );
        signal.throwIfAborted();
        for (const [name, value] of Object.entries(headers)) request.setHeader(name, value);
        const native = request.getUnderlyingObject() as {
          withCredentials?: boolean;
          timeout?: number;
        } | null;
        if (native) {
          native.withCredentials = options.withCredentials === true;
          native.timeout = normalizeUploadTimeout(options.timeout);
        }
        const abortRequest = () => void request.abort().catch(() => undefined);
        signal.addEventListener('abort', abortRequest, { once: true });
        requestCleanups.set(request, () => signal.removeEventListener('abort', abortRequest));
      };
      upload = new tus.Upload(options.file.raw, {
        endpoint: endpoint.href,
        uploadUrl: knownUrl,
        chunkSize: normalized.chunkSize,
        retryDelays: normalized.retryDelays,
        parallelUploads: 1,
        httpStack: new TusHttpStack(),
        metadata: { filename: options.file.name, filetype: options.file.type, ...metadata },
        fingerprint: async source =>
          JSON.stringify([
            'ex-ui-tus-v1',
            endpoint.href,
            options.tus?.resumeKey ?? '',
            source.name,
            source.type,
            source.size,
            source.lastModified,
          ]),
        storeFingerprintForResuming: normalized.resume,
        removeFingerprintOnSuccess: true,
        onBeforeRequest,
        onAfterResponse: request => {
          requestCleanups.get(request)?.();
          requestCleanups.delete(request);
        },
        onShouldRetry: error => {
          const signal = terminating ? terminationSignal : controller.signal;
          const status = error.originalResponse?.getStatus() ?? 0;
          return (
            !signal.aborted && (status < 400 || status >= 500 || status === 409 || status === 423)
          );
        },
        onUploadUrlAvailable: () => {
          if (!current() || !upload?.url) return;
          knownUrl = guardUrl(upload.url);
          options.onUploadUrl?.(knownUrl);
        },
        onProgress: (sent, total) => {
          if (current() && total > 0)
            options.onProgress?.(normalizeUploadPercent((sent / total) * 100));
        },
        onSuccess: () => {
          if (!current()) return;
          try {
            const uploadUrl = guardUrl(upload?.url ?? knownUrl ?? '');
            knownUrl = uploadUrl;
            finish({ outcome: 'success', response: { uploadUrl } satisfies UploadTusResponse });
          } catch (cause) {
            finish({ outcome: 'error', error: transportError(cause, 'request-error') });
          }
        },
        onError: cause => {
          if (current())
            finish({ outcome: 'error', error: transportError(cause, 'request-error') });
        },
      });
      if (normalized.resume && !knownUrl) {
        try {
          const previous = await upload.findPreviousUploads();
          if (!current()) return;
          const candidate = previous
            .filter(item => {
              if (
                !item.uploadUrl ||
                item.size !== options.file.raw!.size ||
                item.parallelUploadUrls?.length
              )
                return false;
              try {
                guardUrl(item.uploadUrl);
                return true;
              } catch {
                return false;
              }
            })
            .sort((a, b) => Date.parse(b.creationTime) - Date.parse(a.creationTime))[0];
          if (candidate) upload.resumeFromPreviousUpload(candidate);
        } catch (cause) {
          if (!current()) return;
          // 存储失败允许新传输继续，但明确通知业务端不可依赖跨会话续传。
          upload.options.storeFingerprintForResuming = false;
          options.onResumeUnavailable?.(cause);
        }
      }
      if (!current()) return;
      started = true;
      upload.start();
    } catch (cause) {
      if (current()) finish({ outcome: 'error', error: transportError(cause, 'request-error') });
    }
  })();

  return {
    promise,
    abort,
    get pending() {
      return !started && !finished;
    },
    get uploadUrl() {
      return knownUrl;
    },
    async terminate(signal) {
      controller.abort();
      finish({ outcome: 'aborted' });
      if (!upload?.url) {
        await upload?.abort(false);
        if (!knownUrl) return false;
        const terminated = await terminateTusUploadResource(
          { ...options, uploadUrl: knownUrl },
          signal
        );
        knownUrl = undefined;
        return terminated;
      }
      terminating = true;
      terminationSignal = signal ?? new AbortController().signal;
      try {
        terminationSignal.throwIfAborted();
        await upload.abort(true);
        knownUrl = undefined;
        return true;
      } catch (cause) {
        throw transportError(cause, 'termination-error');
      } finally {
        terminating = false;
        for (const cleanup of requestCleanups.values()) cleanup();
        requestCleanups.clear();
      }
    },
  };
}

/** 跨挂载恢复的资源不必重新上传，直接执行标准 DELETE 并清理匹配的续传记录。 */
export async function terminateTusUploadResource(
  options: TusRequestOptions,
  signal: AbortSignal = new AbortController().signal
): Promise<boolean> {
  if (!options.uploadUrl) return false;
  const context = { signal };
  const action =
    typeof options.action === 'function'
      ? await options.action(options.file, context)
      : options.action;
  signal.throwIfAborted();
  const endpoint = resolveTusUrl(action);
  const guardUrl = createTusUrlGuard(endpoint, options.tus);
  const uploadUrl = guardUrl(options.uploadUrl);
  const tus = await import('tus-js-client');
  signal.throwIfAborted();
  const cleanups: Array<() => void> = [];
  try {
    await tus.Upload.terminate(uploadUrl, {
      // 永久取消只尝试一次，失败由用户可见的重试入口恢复，避免卸载后的延迟删除。
      retryDelays: [],
      httpStack: new TusHttpStack(),
      onBeforeRequest: async request => {
        guardUrl(request.getURL());
        signal.throwIfAborted();
        const headers = validateTusHeaders(
          typeof options.headers === 'function'
            ? await options.headers(options.file, context)
            : options.headers
        );
        signal.throwIfAborted();
        for (const [name, value] of Object.entries(headers)) request.setHeader(name, value);
        const native = request.getUnderlyingObject() as {
          withCredentials?: boolean;
          timeout?: number;
        } | null;
        if (native) {
          native.withCredentials = options.withCredentials === true;
          native.timeout = normalizeUploadTimeout(options.timeout);
        }
        const abortRequest = () => void request.abort().catch(() => undefined);
        signal.addEventListener('abort', abortRequest, { once: true });
        cleanups.push(() => signal.removeEventListener('abort', abortRequest));
      },
    });
    try {
      const storage = tus.defaultOptions.urlStorage;
      const entries = await storage.findAllUploads();
      await Promise.all(
        entries
          .filter(entry => entry.uploadUrl === uploadUrl)
          .map(entry => storage.removeUpload(entry.urlStorageKey))
      );
    } catch (cause) {
      options.onResumeUnavailable?.(cause);
    }
    return true;
  } catch (cause) {
    throw transportError(cause, 'termination-error');
  } finally {
    cleanups.forEach(cleanup => cleanup());
  }
}
