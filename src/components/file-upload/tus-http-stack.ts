import type { HttpRequest, HttpResponse, HttpStack } from 'tus-js-client';
import { ExFileUploadError } from './errors';

/**
 * 通过官方 HttpStack 扩展点禁止自动重定向，避免正文和认证头绕过来源校验。
 * fetch 无可靠的上传进度事件，进度由 tus 在收到服务端偏移确认后统一报告。
 */
export class TusHttpStack implements HttpStack {
  getName(): string {
    return 'ex-ui-fetch';
  }

  createRequest(method: string, url: string): HttpRequest {
    const controller = new AbortController();
    const headers = new Headers();
    const settings = { withCredentials: false, timeout: 0 };
    let complete = false;
    let settleAbort: (() => void) | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      clearTimeout(timeout);
      settleAbort = undefined;
    };
    return {
      getMethod: () => method,
      getURL: () => url,
      getHeader: name => headers.get(name) ?? undefined,
      setHeader: (name, value) => headers.set(name, value),
      setProgressHandler() {
        // 不把浏览器排队的字节误报为服务端已接收的字节。
      },
      getUnderlyingObject: () => settings,
      send(body: XMLHttpRequestBodyInit | null = null): Promise<HttpResponse> {
        if (controller.signal.aborted)
          return Promise.reject(new DOMException('上传请求已中止', 'AbortError'));
        return new Promise((resolve, reject) => {
          const fail = (error: unknown) => {
            if (complete) return;
            complete = true;
            cleanup();
            reject(error);
          };
          settleAbort = () => fail(new DOMException('上传请求已中止', 'AbortError'));
          if (settings.timeout > 0) {
            timeout = setTimeout(() => {
              fail(new ExFileUploadError('tus 请求超时', { code: 'timeout' }));
              controller.abort();
            }, settings.timeout);
          }
          void (async () => {
            try {
              // WebKit 的文件切片直接作为 fetch 正文时可能丢失偏移；只读取当前分片。
              const payload = body instanceof Blob ? await body.arrayBuffer() : body;
              if (complete || controller.signal.aborted) return;
              const response = await fetch(url, {
                method,
                headers,
                body: payload,
                credentials: settings.withCredentials ? 'include' : 'same-origin',
                redirect: 'error',
                signal: controller.signal,
              });
              const responseBody = await response.text();
              if (complete) return;
              complete = true;
              cleanup();
              resolve({
                getStatus: () => response.status,
                getHeader: name => response.headers.get(name) ?? undefined,
                getBody: () => responseBody,
                getUnderlyingObject: () => response,
              });
            } catch (cause) {
              fail(
                new ExFileUploadError('tus 请求失败或包含不允许的重定向', {
                  code: 'request-error',
                  cause,
                })
              );
            }
          })();
        });
      },
      async abort() {
        if (complete || controller.signal.aborted) return;
        // 立即兑现取消，不能依赖网络栈或迟到的响应自行结束。
        settleAbort?.();
        controller.abort();
      },
    };
  }
}
