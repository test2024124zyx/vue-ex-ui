import type { HttpRequest, HttpResponse, HttpStack } from 'tus-js-client';
import { ExFileUploadError } from './errors';

/**
 * 通过 tus 官方 HttpStack 扩展点补齐 XHR timeout/abort 完成路径。
 * 不修改依赖源码；任何终态都清理监听，并让协议层获得可重试的失败结果。
 */
export class TusHttpStack implements HttpStack {
  getName(): string {
    return 'ex-ui-xhr';
  }

  createRequest(method: string, url: string): HttpRequest {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    const headers = new Map<string, string>();
    let aborted = false;
    let complete = false;
    let settleAbort: (() => void) | undefined;
    let reportProgress: ((sent: number) => void) | undefined;
    const cleanup = () => {
      xhr.onload = null;
      xhr.onerror = null;
      xhr.ontimeout = null;
      xhr.onabort = null;
      if (xhr.upload) xhr.upload.onprogress = null;
      settleAbort = undefined;
    };
    return {
      getMethod: () => method,
      getURL: () => url,
      getHeader: name => headers.get(name.toLowerCase()),
      setHeader(name, value) {
        headers.set(name.toLowerCase(), value);
        xhr.setRequestHeader(name, value);
      },
      setProgressHandler(handler) {
        reportProgress = handler;
      },
      getUnderlyingObject: () => xhr,
      send(body: XMLHttpRequestBodyInit | null = null): Promise<HttpResponse> {
        if (aborted) return Promise.reject(new DOMException('上传请求已中止', 'AbortError'));
        return new Promise((resolve, reject) => {
          const fail = (error: unknown) => {
            if (complete) return;
            complete = true;
            cleanup();
            reject(error);
          };
          settleAbort = () => fail(new DOMException('上传请求已中止', 'AbortError'));
          xhr.onload = () => {
            if (complete) return;
            complete = true;
            cleanup();
            resolve({
              getStatus: () => xhr.status,
              getHeader: name => xhr.getResponseHeader(name) ?? undefined,
              getBody: () => xhr.responseText,
              getUnderlyingObject: () => xhr,
            });
          };
          xhr.onerror = event =>
            fail(
              new ExFileUploadError('tus 请求发生网络错误', {
                code: 'request-error',
                cause: event,
              })
            );
          xhr.ontimeout = event =>
            fail(
              new ExFileUploadError('tus 请求超时', {
                code: 'timeout',
                cause: event,
              })
            );
          xhr.onabort = () => settleAbort?.();
          if (xhr.upload) {
            xhr.upload.onprogress = event => {
              if (!complete && event.lengthComputable) reportProgress?.(event.loaded);
            };
          }
          try {
            xhr.send(body);
          } catch (cause) {
            fail(cause);
          }
        });
      },
      async abort() {
        if (complete || aborted) return;
        aborted = true;
        // 先兑现 Promise，兼容不会在 abort() 中派发 abort 事件的旧实现。
        settleAbort?.();
        xhr.abort();
      },
    };
  }
}
