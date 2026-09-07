import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  flushPromises,
  mount,
  type ComponentMountingOptions,
  type VueWrapper,
} from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExFileDownload from '../../../src/components/file-download/ExFileDownload.vue';
import { ExFileDownloadError } from '../../../src/components/file-download/errors';
import type {
  ExFileDownloadExposed,
  ExFileDownloadTransport,
} from '../../../src/components/file-download/types';
import { setLocale } from '../../../src/locale';

type XhrListener = (event: Record<string, unknown>) => void;

/** 可显式推进状态的 XHR，确保并发、取消与异常分支都可重复验证。 */
class MockXHR {
  static instances: MockXHR[] = [];

  readonly listeners = new Map<string, XhrListener[]>();
  readonly open = vi.fn();
  readonly setRequestHeader = vi.fn();
  readonly send = vi.fn();
  readonly abort = vi.fn(() => this.trigger('abort', {}));
  readonly getResponseHeader = vi.fn(
    (name: string) => this.responseHeaders[name.toLowerCase()] ?? null
  );
  status = 200;
  statusText = 'OK';
  responseType = '';
  response: unknown = new Blob(['data'], { type: 'application/octet-stream' });
  withCredentials = false;
  responseHeaders: Record<string, string> = {};

  constructor() {
    MockXHR.instances.push(this);
  }

  addEventListener(type: string, listener: XhrListener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  trigger(type: string, event: Record<string, unknown>) {
    this.listeners.get(type)?.forEach(listener => listener(event));
  }

  triggerProgress(loaded: number, total: number, lengthComputable = true) {
    this.trigger('progress', { loaded, total, lengthComputable });
  }

  triggerLoad() {
    this.trigger('load', {});
  }

  triggerError() {
    this.trigger('error', {});
  }
}

interface FetchResponseOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  chunks?: Uint8Array[];
  body?: boolean;
  fallbackBlob?: Blob;
}

/** 构造同时覆盖流式读取和 blob 回退路径的最小 Fetch Response。 */
const createFetchResponse = ({
  ok = true,
  status = 200,
  statusText = 'OK',
  headers = {},
  chunks = [],
  body = true,
  fallbackBlob = new Blob(['fallback'], { type: 'application/octet-stream' }),
}: FetchResponseOptions = {}): Response => {
  let index = 0;
  return {
    ok,
    status,
    statusText,
    headers: new Headers(headers),
    body: body
      ? {
          getReader: () => ({
            read: async () =>
              index < chunks.length
                ? { done: false, value: chunks[index++] }
                : { done: true, value: undefined },
          }),
        }
      : null,
    blob: vi.fn(async () => fallbackBlob),
  } as unknown as Response;
};

describe('ExFileDownload', () => {
  let wrappers: VueWrapper[] = [];
  let clickedAnchors: Array<{ href: string; download: string }> = [];
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let pageBase: HTMLBaseElement;

  beforeEach(() => {
    wrappers = [];
    clickedAnchors = [];
    MockXHR.instances = [];
    setLocale('en-US');

    const NativeURL = globalThis.URL;
    class TestURL extends NativeURL {}
    createObjectURL = vi.fn(() => 'blob:https://app.example/generated');
    revokeObjectURL = vi.fn();
    Object.defineProperties(TestURL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    });
    vi.stubGlobal('URL', TestURL);
    // 使用真实文档基础地址，保持组件和浏览器链接的相对 URL 解析一致。
    pageBase = document.createElement('base');
    pageBase.href = 'https://app.example/page';
    document.head.prepend(pageBase);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      clickedAnchors.push({ href: this.href, download: this.download });
    });
  });

  afterEach(() => {
    wrappers.reverse().forEach(wrapper => wrapper.unmount());
    wrappers = [];
    pageBase.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setLocale('en-US');
  });

  const mountDownload = (options: ComponentMountingOptions<typeof ExFileDownload> = {}) => {
    const wrapper = mount(ExFileDownload, options);
    wrappers.push(wrapper);
    return wrapper;
  };

  const exposed = (wrapper: VueWrapper) => wrapper.vm as unknown as ExFileDownloadExposed;

  describe('链接交接', () => {
    it('默认状态只提供真实方法，不再暴露伪暂停与伪恢复 API', () => {
      const wrapper = mountDownload({ props: { url: '/files/manual.pdf' } });
      const instance = exposed(wrapper) as ExFileDownloadExposed & Record<string, unknown>;

      expect(wrapper.get('button').text()).toBe('Download');
      expect(wrapper.attributes('aria-busy')).toBe('false');
      expect(instance.pause).toBeUndefined();
      expect(instance.resume).toBeUndefined();
      expect(instance.getElement()).toBe(wrapper.element);
    });

    it('link 只报告浏览器链接已触发，不伪报 success 或构造空 Blob', async () => {
      const wrapper = mountDownload({
        props: {
          url: ' /files/manual.pdf ',
          filename: '../manual?.pdf',
          transport: 'link',
        },
      });

      const result = await exposed(wrapper).download();
      await nextTick();

      expect(result).toEqual({
        outcome: 'triggered',
        transport: 'link',
        url: 'https://app.example/files/manual.pdf',
        filename: 'manual_.pdf',
      });
      expect(clickedAnchors).toEqual([
        { href: 'https://app.example/files/manual.pdf', download: 'manual_.pdf' },
      ]);
      expect(wrapper.emitted('start')).toEqual([['link']]);
      expect(wrapper.emitted('trigger')).toEqual([
        ['https://app.example/files/manual.pdf', 'manual_.pdf'],
      ]);
      expect(wrapper.emitted('success')).toBeUndefined();
      expect(createObjectURL).not.toHaveBeenCalled();
      expect(wrapper.get('button').text()).toBe('Download requested');
    });

    it('link 的 start 监听器重入 download 时只触发一个浏览器链接', async () => {
      let nestedResult: ReturnType<ExFileDownloadExposed['download']> | undefined;
      const wrapper = mountDownload({
        props: { url: '/files/manual.pdf' },
        attrs: {
          onStart: () => {
            nestedResult = exposed(wrapper).download();
          },
        },
      });

      await exposed(wrapper).download();

      await expect(nestedResult).resolves.toEqual({ outcome: 'ignored', reason: 'busy' });
      expect(clickedAnchors).toHaveLength(1);
      expect(wrapper.emitted('start')).toHaveLength(1);
    });

    it('危险地址和非法运行时 transport 转为可识别错误且不会创建链接', async () => {
      const dangerous = mountDownload({ props: { url: 'javascript:alert(1)' } });
      const dangerousResult = await exposed(dangerous).download();
      expect(dangerousResult.outcome).toBe('error');
      expect(dangerous.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'invalid-url' });

      dangerous.unmount();
      const invalidTransport = 'iframe' as ExFileDownloadTransport;
      const invalid = mountDownload({
        props: { url: '/file.zip', transport: invalidTransport },
      });
      const invalidResult = await exposed(invalid).download();
      expect(invalidResult.outcome).toBe('error');
      expect(invalid.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'invalid-transport' });
      expect(clickedAnchors).toHaveLength(0);
    });

    it('禁用状态返回 ignored，link 状态没有虚假的取消能力', async () => {
      const disabled = mountDownload({ props: { url: '/file.zip', disabled: true } });
      await expect(exposed(disabled).download()).resolves.toEqual({
        outcome: 'ignored',
        reason: 'disabled',
      });
      expect(disabled.emitted()).toEqual({});
      expect(exposed(disabled).cancel()).toBe(false);
      expect(disabled.emitted('cancel')).toBeUndefined();
    });
  });

  describe('Fetch 传输', () => {
    it('流式读取已知总量，保留 MIME、响应文件名和结构化进度', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn(async () =>
        createFetchResponse({
          headers: {
            'content-length': '4',
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment; filename="server.bin"',
          },
          chunks: [new Uint8Array([1, 2]), new Uint8Array([3, 4])],
        })
      );
      vi.stubGlobal('fetch', fetchMock);
      const wrapper = mountDownload({
        props: {
          url: '/files/data.bin',
          transport: 'fetch',
          headers: { Authorization: 'Bearer token' },
          withCredentials: true,
        },
      });

      const result = await exposed(wrapper).download();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://app.example/files/data.bin',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token' },
          credentials: 'include',
          signal: expect.any(AbortSignal),
        })
      );
      expect(wrapper.emitted('progress')).toEqual([
        [{ loaded: 2, total: 4, percent: 50 }],
        [{ loaded: 4, total: 4, percent: 100 }],
      ]);
      expect(result.outcome).toBe('success');
      if (result.outcome !== 'success') throw new Error('测试前置条件失败');
      expect(result.filename).toBe('server.bin');
      expect(result.blob.size).toBe(4);
      expect(result.blob.type).toBe('application/octet-stream');
      expect(wrapper.emitted('success')).toEqual([[result.blob, 'server.bin']]);
      expect(clickedAnchors.at(-1)?.download).toBe('server.bin');
      expect(revokeObjectURL).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:https://app.example/generated');
    });

    it('未知总量仍报告已读取字节，不伪造 0% 或总大小', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => createFetchResponse({ chunks: [new Uint8Array([1, 2, 3])] }))
      );
      const wrapper = mountDownload({
        props: { url: '/files/data.bin', transport: 'fetch' },
      });

      await exposed(wrapper).download();

      expect(wrapper.emitted('progress')).toEqual([[{ loaded: 3, total: null, percent: null }]]);
    });

    it('Content-Length 或流式累计超过 maxBytes 时中止并返回大小错误', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          createFetchResponse({
            headers: { 'content-length': '10' },
            chunks: [new Uint8Array([1])],
          })
        )
      );
      const declared = mountDownload({
        props: { url: '/large.bin', transport: 'fetch', maxBytes: 4 },
      });

      const declaredResult = await exposed(declared).download();
      expect(declaredResult.outcome).toBe('error');
      expect(declared.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'size-exceeded' });
      expect(createObjectURL).not.toHaveBeenCalled();

      declared.unmount();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          createFetchResponse({
            chunks: [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
          })
        )
      );
      const streamed = mountDownload({
        props: { url: '/stream.bin', transport: 'fetch', maxBytes: 4 },
      });

      const streamedResult = await exposed(streamed).download();
      expect(streamedResult.outcome).toBe('error');
      expect(streamed.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'size-exceeded' });
      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it('响应流不可用时回退 response.blob 并发出完成进度', async () => {
      const fallbackBlob = new Blob(['ready'], { type: 'text/plain' });
      const response = createFetchResponse({ body: false, fallbackBlob });
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response)
      );
      const wrapper = mountDownload({
        props: { url: '/files/readme.txt', transport: 'fetch' },
      });

      const result = await exposed(wrapper).download();

      expect(response.blob).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ outcome: 'success', blob: fallbackBlob });
      expect(wrapper.emitted('progress')).toEqual([
        [{ loaded: fallbackBlob.size, total: fallbackBlob.size, percent: 100 }],
      ]);
    });

    it('HTTP 与网络异常返回 error 结果并只发出一次错误事件', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => createFetchResponse({ ok: false, status: 404, statusText: 'Not Found' }))
      );
      const http = mountDownload({ props: { url: '/missing', transport: 'fetch' } });
      const httpResult = await exposed(http).download();
      expect(httpResult.outcome).toBe('error');
      expect(http.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'http-error', status: 404 });

      http.unmount();
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => Promise.reject(new TypeError('Failed to fetch')))
      );
      const network = mountDownload({ props: { url: '/offline', transport: 'fetch' } });
      const networkResult = await exposed(network).download();
      expect(networkResult.outcome).toBe('error');
      expect(network.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'network-error' });
      expect(network.emitted('error')).toHaveLength(1);
    });

    it('cancel 只在真实活动请求上生效，中止后返回 cancelled 且不发 error', async () => {
      let signal: AbortSignal | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
              signal = init.signal as AbortSignal;
              signal.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );
      const wrapper = mountDownload({ props: { url: '/large.zip', transport: 'fetch' } });

      const resultPromise = exposed(wrapper).download();
      await nextTick();
      expect(exposed(wrapper).cancel()).toBe(true);
      const result = await resultPromise;

      expect(signal?.aborted).toBe(true);
      expect(result).toEqual({ outcome: 'cancelled', transport: 'fetch' });
      expect(wrapper.emitted('cancel')).toEqual([[]]);
      expect(wrapper.emitted('error')).toBeUndefined();
      expect(wrapper.attributes('aria-busy')).toBe('false');
      expect(exposed(wrapper).cancel()).toBe(false);
    });

    it('下载中重复调用返回 busy，不会创建第二个请求', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
              (init.signal as AbortSignal).addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );
      const wrapper = mountDownload({ props: { url: '/large.zip', transport: 'fetch' } });

      const active = exposed(wrapper).download();
      await expect(exposed(wrapper).download()).resolves.toEqual({
        outcome: 'ignored',
        reason: 'busy',
      });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('start')).toHaveLength(1);
      exposed(wrapper).cancel();
      await active;
    });

    it('fetch 的 start 监听器可同步取消，取消后不会创建网络请求', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      let cancelResult = false;
      const wrapper = mountDownload({
        props: { url: '/large.zip', transport: 'fetch' },
        attrs: {
          onStart: () => {
            cancelResult = exposed(wrapper).cancel();
          },
        },
      });

      const result = await exposed(wrapper).download();

      expect(cancelResult).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toEqual({ outcome: 'cancelled', transport: 'fetch' });
      expect(wrapper.emitted('cancel')).toEqual([[]]);
    });

    it('已取消旧请求的迟到异常不会覆盖新请求成功状态', async () => {
      let rejectOld: ((reason?: unknown) => void) | undefined;
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<Response>((_resolve, reject) => {
              rejectOld = reject;
            })
        )
        .mockResolvedValueOnce(
          createFetchResponse({ body: false, fallbackBlob: new Blob(['new']) })
        );
      vi.stubGlobal('fetch', fetchMock);
      const wrapper = mountDownload({ props: { url: '/first', transport: 'fetch' } });

      const oldResult = exposed(wrapper).download();
      expect(exposed(wrapper).cancel()).toBe(true);
      await wrapper.setProps({ url: '/second' });
      const newResult = await exposed(wrapper).download();
      rejectOld?.(new TypeError('late failure'));
      await flushPromises();

      expect(newResult.outcome).toBe('success');
      expect(await oldResult).toEqual({ outcome: 'cancelled', transport: 'fetch' });
      expect(wrapper.emitted('error')).toBeUndefined();
      expect(wrapper.get('button').text()).toBe('Download ready');
    });

    it('卸载时中止请求并静默清理，不伪造用户 cancel 事件', async () => {
      let signal: AbortSignal | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
              signal = init.signal as AbortSignal;
              signal.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );
      const wrapper = mountDownload({ props: { url: '/large.zip', transport: 'fetch' } });
      void exposed(wrapper).download();

      wrapper.unmount();
      await flushPromises();

      expect(signal?.aborted).toBe(true);
      expect(wrapper.emitted('cancel')).toBeUndefined();
      expect(wrapper.emitted('error')).toBeUndefined();
    });
  });

  describe('XHR 传输', () => {
    beforeEach(() => {
      vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);
    });

    it('配置 GET、请求头与凭证，展示可访问进度并完成 Blob 下载', async () => {
      const wrapper = mountDownload({
        props: {
          url: '/files/archive.zip',
          filename: 'archive.zip',
          transport: 'xhr',
          headers: { 'X-Token': 'token' },
          withCredentials: true,
        },
      });

      const resultPromise = exposed(wrapper).download();
      const request = MockXHR.instances[0];
      expect(request.open).toHaveBeenCalledWith(
        'GET',
        'https://app.example/files/archive.zip',
        true
      );
      expect(request.setRequestHeader).toHaveBeenCalledWith('X-Token', 'token');
      expect(request.withCredentials).toBe(true);
      expect(request.responseType).toBe('blob');

      request.triggerProgress(50, 200);
      await nextTick();
      const progress = wrapper.get('[role="progressbar"]');
      expect(progress.attributes('aria-valuenow')).toBe('25');
      expect(progress.attributes('aria-valuetext')).toContain('50 B / 200 B');
      expect(wrapper.emitted('progress')).toEqual([[{ loaded: 50, total: 200, percent: 25 }]]);

      request.triggerLoad();
      const result = await resultPromise;
      expect(result).toMatchObject({ outcome: 'success', filename: 'archive.zip' });
      expect(wrapper.emitted('success')).toHaveLength(1);
    });

    it('不可计算总量时使用不确定进度语义', async () => {
      const wrapper = mountDownload({ props: { url: '/stream', transport: 'xhr' } });
      const resultPromise = exposed(wrapper).download();
      const request = MockXHR.instances[0];

      request.triggerProgress(64, 0, false);
      await nextTick();

      const progress = wrapper.get('[role="progressbar"]');
      expect(progress.attributes('aria-valuenow')).toBeUndefined();
      expect(progress.attributes('aria-valuetext')).toContain('64 B');
      expect(wrapper.get('.ex-file-download__progress-bar-inner').classes()).toContain(
        'is-indeterminate'
      );
      expect(wrapper.emitted('progress')).toEqual([[{ loaded: 64, total: null, percent: null }]]);

      exposed(wrapper).cancel();
      await resultPromise;
    });

    it('XHR 进度超过 maxBytes 时主动中止并返回大小错误', async () => {
      const wrapper = mountDownload({
        props: { url: '/large.bin', transport: 'xhr', maxBytes: 4 },
      });
      const resultPromise = exposed(wrapper).download();
      const request = MockXHR.instances[0];

      request.triggerProgress(5, 10);

      await expect(resultPromise).resolves.toMatchObject({
        outcome: 'error',
        error: { code: 'size-exceeded' },
      });
      expect(request.abort).toHaveBeenCalledOnce();
      expect(wrapper.emitted('cancel')).toBeUndefined();
    });

    it('HTTP、网络错误分别生成稳定错误码', async () => {
      const http = mountDownload({ props: { url: '/missing', transport: 'xhr' } });
      const httpPromise = exposed(http).download();
      const httpRequest = MockXHR.instances[0];
      httpRequest.status = 500;
      httpRequest.statusText = 'Server Error';
      httpRequest.triggerLoad();
      expect((await httpPromise).outcome).toBe('error');
      expect(http.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'http-error', status: 500 });

      http.unmount();
      const network = mountDownload({ props: { url: '/offline', transport: 'xhr' } });
      const networkPromise = exposed(network).download();
      MockXHR.instances[1].triggerError();
      expect((await networkPromise).outcome).toBe('error');
      expect(network.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'network-error' });
    });

    it('XHR cancel 中止真实请求并让活动 Promise 收敛为 cancelled', async () => {
      const wrapper = mountDownload({ props: { url: '/large.zip', transport: 'xhr' } });
      const resultPromise = exposed(wrapper).download();
      const request = MockXHR.instances[0];

      expect(exposed(wrapper).cancel()).toBe(true);

      expect(request.abort).toHaveBeenCalledTimes(1);
      await expect(resultPromise).resolves.toEqual({ outcome: 'cancelled', transport: 'xhr' });
      expect(wrapper.emitted('cancel')).toEqual([[]]);
      expect(wrapper.emitted('error')).toBeUndefined();
    });
  });

  describe('渲染契约与资源清理', () => {
    it('默认插槽获得可执行下载、取消、状态、进度和禁用信息', () => {
      const wrapper = mountDownload({
        props: { url: '/file.zip' },
        slots: {
          default: slotProps =>
            h(
              'button',
              {
                class: 'custom-trigger',
                disabled: slotProps.disabled,
                onClick: slotProps.download,
              },
              `${slotProps.status}:${slotProps.progress.percent ?? 'unknown'}:${typeof slotProps.cancel}`
            ),
        },
      });

      expect(wrapper.get('.custom-trigger').text()).toBe('idle:unknown:function');
    });

    it('progress 插槽只替换进度视图，showProgress=false 则完全关闭进度区域', async () => {
      vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);
      const custom = mountDownload({
        props: { url: '/file.zip', transport: 'xhr' },
        slots: {
          progress: ({ progress }) =>
            h('output', { class: 'custom-progress' }, String(progress.loaded)),
        },
      });
      const customPromise = exposed(custom).download();
      MockXHR.instances[0].triggerProgress(12, 100);
      await nextTick();
      expect(custom.get('.custom-progress').text()).toBe('12');
      exposed(custom).cancel();
      await customPromise;

      custom.unmount();
      const hidden = mountDownload({
        props: { url: '/file.zip', transport: 'xhr', showProgress: false },
      });
      const hiddenPromise = exposed(hidden).download();
      MockXHR.instances[1].triggerProgress(12, 100);
      await nextTick();
      expect(hidden.find('.ex-file-download__progress').exists()).toBe(false);
      exposed(hidden).cancel();
      await hiddenPromise;
    });

    it('对象 URL 延迟释放；卸载会提前释放且不会重复释放', async () => {
      vi.useFakeTimers();
      const response = createFetchResponse({ body: false, fallbackBlob: new Blob(['ready']) });
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response)
      );
      const wrapper = mountDownload({ props: { url: '/ready', transport: 'fetch' } });

      await exposed(wrapper).download();
      expect(revokeObjectURL).not.toHaveBeenCalled();
      wrapper.unmount();
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);

      vi.runAllTimers();
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it('合并原生属性并使用自定义按钮外观与固定文案', async () => {
      const wrapper = mountDownload({
        props: {
          url: '/file.zip',
          buttonText: '获取文件',
          buttonType: 'success',
          buttonSize: 'large',
        },
        attrs: { class: 'custom-download', 'data-testid': 'download' },
      });

      expect(wrapper.classes()).toContain('custom-download');
      expect(wrapper.attributes('data-testid')).toBe('download');
      expect(wrapper.get('button').text()).toBe('获取文件');
      expect(wrapper.get('button').classes()).toContain('ex-button--success');
      expect(wrapper.get('button').classes()).toContain('ex-button--large');
      await exposed(wrapper).download();
      expect(wrapper.get('button').text()).toBe('获取文件');
    });

    it('缺失浏览器下载能力时返回 unsupported 错误', async () => {
      const wrapper = mountDownload({ props: { url: '/file.zip', transport: 'fetch' } });
      vi.stubGlobal('fetch', undefined);

      const result = await exposed(wrapper).download();

      expect(result.outcome).toBe('error');
      expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(ExFileDownloadError);
      expect(wrapper.emitted('error')?.[0]?.[0]).toMatchObject({ code: 'unsupported' });
    });
  });
});
