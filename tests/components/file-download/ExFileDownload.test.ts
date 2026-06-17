import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExFileDownload from '../../../src/components/file-download/ExFileDownload.vue';

// ---- 受控的 XMLHttpRequest 模拟（下载用 GET + blob 响应）----
class MockXHR {
  static instances: MockXHR[] = [];
  _h: Record<string, (e?: any) => void> = {};
  status = 200;
  statusText = 'OK';
  responseType = '';
  response: unknown = new Blob(['data']);
  withCredentials = false;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this._h['abort']?.());

  constructor() {
    MockXHR.instances.push(this);
  }
  addEventListener(e: string, cb: (e?: any) => void) {
    this._h[e] = cb;
  }
  triggerProgress(loaded: number, total: number) {
    this._h['progress']?.({ lengthComputable: true, loaded, total });
  }
  triggerLoad() {
    this._h['load']?.();
  }
}

// 构造一个支持进度的 fetch 响应
function fetchResponse(opts: {
  ok?: boolean;
  status?: number;
  contentLength?: string | null;
  chunks?: Uint8Array[];
}) {
  const { ok = true, status = 200, contentLength = null, chunks = [] } = opts;
  let i = 0;
  return {
    ok,
    status,
    headers: { get: (k: string) => (k.toLowerCase() === 'content-length' ? contentLength : null) },
    body: {
      getReader: () => ({
        read: async () =>
          i < chunks.length ? { done: false, value: chunks[i++] } : { done: true, value: undefined },
      }),
    },
  };
}

describe('ExFileDownload', () => {
  beforeEach(() => {
    MockXHR.instances = [];
    // jsdom 无 createObjectURL
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });
    // 避免 jsdom 的 anchor 导航告警
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('link 方式', () => {
    it('点击后立即触发 start 与 success，状态为 success', async () => {
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.png', filename: 'file.png', method: 'link' },
      });
      await wrapper.find('button').trigger('click');
      await nextTick();

      expect(wrapper.emitted('start')).toBeTruthy();
      expect(wrapper.emitted('success')).toBeTruthy();
      expect(wrapper.emitted('success')![0][0]).toBeInstanceOf(Blob);
    });
  });

  describe('xhr 方式', () => {
    it('progress 事件带 (percent, loaded, total)，load 时 success', async () => {
      vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.zip', filename: 'f.zip', method: 'xhr' },
      });
      await wrapper.find('button').trigger('click');

      const xhr = MockXHR.instances[0];
      expect(xhr.open).toHaveBeenCalledWith('GET', 'https://x/file.zip', true);

      xhr.triggerProgress(50, 200);
      const progress = wrapper.emitted('progress');
      expect(progress).toBeTruthy();
      expect(progress![0]).toEqual([25, 50, 200]);

      xhr.triggerLoad();
      await flushPromises();
      expect(wrapper.emitted('success')).toBeTruthy();
    });
  });

  describe('fetch 方式', () => {
    it('读取分块并报告进度，完成后 success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          fetchResponse({ contentLength: '4', chunks: [new Uint8Array([1, 2]), new Uint8Array([3, 4])] })
        )
      );
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.bin', filename: 'f.bin', method: 'fetch' },
      });
      await wrapper.find('button').trigger('click');
      await flushPromises();

      expect(wrapper.emitted('progress')).toBeTruthy();
      const success = wrapper.emitted('success');
      expect(success).toBeTruthy();
      expect(success![0][0]).toBeInstanceOf(Blob);
    });

    it('cancel() 通过 AbortController 中止 fetch，不触发 error', async () => {
      let captured: AbortSignal | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              captured = init.signal as AbortSignal;
              captured.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.bin', filename: 'f.bin', method: 'fetch' },
      });
      await wrapper.find('button').trigger('click');
      await nextTick();

      (wrapper.vm as any).cancel();
      await flushPromises();

      expect(captured?.aborted).toBe(true);
      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('error')).toBeFalsy();
    });

    it('pause() 对进行中的 fetch 生效并触发 pause', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              (init.signal as AbortSignal).addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.bin', method: 'fetch' },
      });
      await wrapper.find('button').trigger('click');
      await nextTick();

      (wrapper.vm as any).pause();
      await flushPromises();
      expect(wrapper.emitted('pause')).toBeTruthy();
    });
  });

  describe('默认作用域插槽', () => {
    it('提供 download/status/percent 作用域参数', () => {
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.png' },
        slots: {
          default: `<template #default="{ status, percent }">
            <span class="slot-status">{{ status }}-{{ percent }}</span>
          </template>`,
        },
      });
      expect(wrapper.find('.slot-status').text()).toBe('idle-0');
    });
  });

  describe('卸载清理', () => {
    it('卸载时中止进行中的 fetch', async () => {
      let captured: AbortSignal | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise(() => {
              captured = init.signal as AbortSignal;
            })
        )
      );
      const wrapper = mount(ExFileDownload, {
        props: { url: 'https://x/file.bin', method: 'fetch' },
      });
      await wrapper.find('button').trigger('click');
      await nextTick();

      wrapper.unmount();
      expect(captured?.aborted).toBe(true);
    });

    it('getElement() 返回根 DOM 元素', () => {
      const wrapper = mount(ExFileDownload, { props: { url: 'https://x/f.png' } });
      expect((wrapper.vm as any).getElement()).toBeInstanceOf(HTMLElement);
    });
  });
});
