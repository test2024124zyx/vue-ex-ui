import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExFilePreview from '../../../src/components/file-preview/ExFilePreview.vue';
import { ExFilePreviewError } from '../../../src/components/file-preview/errors';
import type { PreviewFile } from '../../../src/components/file-preview/types';
import { setLocale } from '../../../src/locale';

const imageFiles: PreviewFile[] = [
  { url: 'a.png', name: 'a.png' },
  { url: 'b.png', name: 'b.png' },
  { url: 'c.png', name: 'c.png' },
];

const response = (body: string, init: { ok?: boolean; status?: number; length?: string } = {}) => {
  const bytes = new TextEncoder().encode(body);
  let consumed = false;
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get: (name: string) => (name.toLowerCase() === 'content-length' ? init.length : null),
    },
    body: {
      getReader: () => ({
        read: vi.fn(async () => {
          if (consumed) return { done: true, value: undefined };
          consumed = true;
          return { done: false, value: bytes };
        }),
        cancel: vi.fn(async () => undefined),
        releaseLock: vi.fn(),
      }),
    },
    text: vi.fn(async () => body),
  } as unknown as Response;
};

describe('ExFilePreview', () => {
  const wrappers: VueWrapper[] = [];
  const mountPreview = (options: Parameters<typeof mount>[1]) => {
    const wrapper = mount(ExFilePreview, { ...options, attachTo: document.body });
    wrappers.push(wrapper);
    return wrapper;
  };

  beforeEach(() => {
    setLocale('en-US');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    for (const wrapper of wrappers.splice(0).reverse()) wrapper.unmount();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  describe('来源与类型', () => {
    it('识别带查询参数的图片，并优先使用文件自身显式类型', async () => {
      const wrapper = mountPreview({
        props: { visible: true, file: '/photo.PNG?size=2#view' },
      });
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe(
        '/photo.PNG?size=2#view'
      );

      await wrapper.setProps({
        file: { url: '/stream', name: 'sound', type: 'audio' },
        type: 'image',
      });
      expect(document.querySelector('.ex-file-preview__audio')).toBeTruthy();
      expect(document.querySelector('.ex-file-preview__image')).toBeNull();
    });

    it('没有文件时显示独立空态且不提供下载请求', async () => {
      mountPreview({ props: { visible: true } });
      await nextTick();

      expect(document.querySelector('.ex-file-preview__empty')).toBeTruthy();
      expect(document.querySelector('[aria-label="Download file"]')).toBeNull();
    });

    it('拒绝可执行地址并报告结构化错误', async () => {
      const wrapper = mountPreview({
        props: { visible: true, file: { url: 'javascript:alert(1)', type: 'image' } },
      });
      await nextTick();

      expect(document.querySelector('.ex-file-preview__invalid')).toBeTruthy();
      const error = wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError;
      expect(error).toBeInstanceOf(ExFilePreviewError);
      expect(error.code).toBe('invalid-source');
      expect(document.querySelector('.ex-file-preview__image')).toBeNull();
    });

    it('为 Blob/File 创建对象地址，并在替换和卸载时逐个释放', async () => {
      const createObjectURL = vi
        .fn<(source: Blob) => string>()
        .mockReturnValueOnce('blob:first')
        .mockReturnValueOnce('blob:second');
      const revokeObjectURL = vi.fn<(url: string) => void>();
      const NativeURL = URL;
      class ObjectURL extends NativeURL {
        static createObjectURL = createObjectURL;
        static revokeObjectURL = revokeObjectURL;
      }
      vi.stubGlobal('URL', ObjectURL);
      const first = new File(['first'], 'first.png', { type: 'image/png' });
      const second = new File(['second'], 'second.png', { type: 'image/png' });
      const wrapper = mountPreview({ props: { visible: true, file: first } });
      await nextTick();

      expect(createObjectURL).toHaveBeenCalledWith(first);
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe(
        'blob:first'
      );

      await wrapper.setProps({ file: second });
      await nextTick();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe(
        'blob:second'
      );

      wrapper.unmount();
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
    });

    it('对象地址创建失败时保留结构化根因并进入无效来源状态', async () => {
      const cause = new Error('object URL unavailable');
      const NativeURL = URL;
      class FailingObjectURL extends NativeURL {
        static createObjectURL = vi.fn(() => {
          throw cause;
        });
        static revokeObjectURL = vi.fn();
      }
      vi.stubGlobal('URL', FailingObjectURL);
      const file = new File(['content'], 'broken.png', { type: 'image/png' });
      const wrapper = mountPreview({ props: { visible: true, file } });
      await nextTick();

      expect(document.querySelector('.ex-file-preview__invalid')).toBeTruthy();
      const error = wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError;
      expect(error.code).toBe('invalid-source');
      expect(error.cause).toBe(cause);
    });
  });

  describe('索引受控语义', () => {
    it('受控索引只发出导航请求，父级同步前不切换文件', async () => {
      const wrapper = mountPreview({
        props: { visible: true, files: imageFiles, currentIndex: 0 },
      });
      await nextTick();

      (document.querySelector('[aria-label="Next file"]') as HTMLButtonElement).click();
      await nextTick();
      expect(wrapper.emitted('update:currentIndex')).toEqual([[1]]);
      expect(wrapper.emitted('navigation-request')?.[0]).toEqual([1, imageFiles[1]]);
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('a.png');

      await wrapper.setProps({ currentIndex: 1 });
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('b.png');
    });

    it('非受控索引使用 defaultCurrentIndex 并立即响应请求方法', async () => {
      const wrapper = mountPreview({
        props: { visible: true, files: imageFiles, defaultCurrentIndex: 1 },
      });
      const vm = wrapper.vm as unknown as { requestPrevious: () => void; requestNext: () => void };
      await nextTick();

      vm.requestPrevious();
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('a.png');
      vm.requestNext();
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('b.png');
    });

    it('文件列表收缩后修正越界索引', async () => {
      const wrapper = mountPreview({
        props: { visible: true, files: imageFiles, defaultCurrentIndex: 2 },
      });
      await wrapper.setProps({ files: imageFiles.slice(0, 1) });
      await nextTick();

      expect(wrapper.emitted('update:currentIndex')?.at(-1)).toEqual([0]);
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('a.png');
    });

    it('删除无法在受控模式兑现的旧命令式方法', () => {
      const wrapper = mountPreview({ props: { visible: false, files: imageFiles } });
      const vm = wrapper.vm as unknown as Record<string, unknown>;

      expect(vm.prev).toBeUndefined();
      expect(vm.next).toBeUndefined();
      expect(vm.zoomIn).toBeUndefined();
      expect(vm.download).toBeUndefined();
      expect(vm.close).toBeUndefined();
      expect(vm.requestPrevious).toBeTypeOf('function');
      expect(vm.requestDownload).toBeTypeOf('function');
      expect(vm.requestClose).toBeTypeOf('function');
    });
  });

  describe('缩放与旋转', () => {
    it('受控缩放和旋转等待父级同步', async () => {
      const wrapper = mountPreview({
        props: { visible: true, file: 'a.png', scale: 1, rotate: 0 },
      });
      await nextTick();

      (document.querySelector('[aria-label="Zoom in"]') as HTMLButtonElement).click();
      (document.querySelector('[aria-label="Rotate clockwise"]') as HTMLButtonElement).click();
      await nextTick();

      expect(wrapper.emitted('update:scale')?.at(-1)).toEqual([1.1]);
      expect(wrapper.emitted('update:rotate')?.at(-1)).toEqual([90]);
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('style')).toContain(
        'scale(1) rotate(0deg)'
      );

      await wrapper.setProps({ scale: 1.1, rotate: 90 });
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('style')).toContain(
        'scale(1.1) rotate(90deg)'
      );
    });

    it('非受控缩放使用安全边界并响应滚轮和重置请求', async () => {
      const wrapper = mountPreview({
        props: {
          visible: true,
          file: 'a.png',
          defaultScale: 2,
          minScale: 3,
          maxScale: 1,
          scaleStep: -1,
        },
      });
      const vm = wrapper.vm as unknown as {
        requestZoomOut: () => void;
        requestResetZoom: () => void;
      };
      await nextTick();

      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('style')).toContain(
        'scale(3)'
      );
      vm.requestZoomOut();
      expect(wrapper.emitted('update:scale')).toBeUndefined();

      vm.requestResetZoom();
      await nextTick();
      expect(wrapper.emitted('update:scale')?.at(-1)).toEqual([3]);

      const wheel = new WheelEvent('wheel', { deltaY: -1, cancelable: true });
      document.querySelector('.ex-file-preview__image-wrapper')?.dispatchEvent(wheel);
      expect(wheel.defaultPrevented).toBe(false);
    });

    it('关闭 zoomable 时滚轮不会阻断页面滚动', async () => {
      mountPreview({ props: { visible: true, file: 'a.png', zoomable: false } });
      await nextTick();
      const wheel = new WheelEvent('wheel', { deltaY: -1, cancelable: true });
      document.querySelector('.ex-file-preview__image-wrapper')?.dispatchEvent(wheel);
      expect(wheel.defaultPrevented).toBe(false);
    });

    it('规范旋转初始值，并用安全步长处理旋转请求', async () => {
      const wrapper = mountPreview({
        props: {
          visible: true,
          file: 'a.png',
          defaultRotate: -90,
          rotateStep: Number.NaN,
        },
      });
      const vm = wrapper.vm as unknown as {
        requestRotateClockwise: () => void;
        requestResetRotation: () => void;
      };
      await nextTick();

      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('style')).toContain(
        'rotate(270deg)'
      );
      vm.requestRotateClockwise();
      await nextTick();
      expect(wrapper.emitted('update:rotate')?.at(-1)).toEqual([0]);
      vm.requestResetRotation();
      expect(wrapper.emitted('update:rotate')?.at(-1)).toEqual([0]);
    });
  });

  describe('文本与代码加载', () => {
    it('空文本也进入已完成状态并发出 ready', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response(''))
      );
      const file: PreviewFile = { url: 'empty.txt', name: 'empty.txt' };
      const wrapper = mountPreview({ props: { visible: true, file } });
      await flushPromises();

      expect(document.querySelector('.ex-file-preview__text pre')).toBeTruthy();
      expect(document.querySelector('.ex-file-preview__loading')).toBeNull();
      expect(wrapper.emitted('ready')?.[0]).toEqual([file, 0]);
    });

    it('真实逐行渲染代码行号并保留空行', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response('const a = 1;\n\nreturn a;'))
      );
      mountPreview({
        props: { visible: true, file: { url: 'source.ts', type: 'code' }, showLineNumbers: true },
      });
      await flushPromises();

      const lines = [...document.querySelectorAll('.ex-file-preview__code-lines li')];
      expect(lines).toHaveLength(3);
      expect(lines[0].textContent).toContain('const a = 1;');
      expect(lines[1].textContent).toContain('\u200b');
      expect(lines[2].textContent).toContain('return a;');
    });

    it('拒绝非成功 HTTP 响应并结束加载状态', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response('server error', { ok: false, status: 500 }))
      );
      const wrapper = mountPreview({ props: { visible: true, file: 'note.txt' } });
      await flushPromises();

      expect(document.querySelector('.ex-file-preview__text-error')).toBeTruthy();
      expect(document.querySelector('.ex-file-preview__loading')).toBeNull();
      const error = wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError;
      expect(error.code).toBe('http-error');
    });

    it('按 Content-Length 和真实 UTF-8 字节数限制文本体积', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response('small', { length: '100' }))
        .mockResolvedValueOnce(response('四个汉字'));
      vi.stubGlobal('fetch', fetchMock);
      const wrapper = mountPreview({
        props: { visible: true, file: 'first.txt', maxTextBytes: 8 },
      });
      await flushPromises();
      expect((wrapper.emitted('error')?.at(-1)?.[0] as ExFilePreviewError).code).toBe(
        'text-too-large'
      );

      await wrapper.setProps({ file: 'second.txt' });
      await flushPromises();
      expect((wrapper.emitted('error')?.at(-1)?.[0] as ExFilePreviewError).code).toBe(
        'text-too-large'
      );
    });

    it('切换文件会中止旧请求，迟到响应不能覆盖新内容', async () => {
      type Pending = { resolve: (value: Response) => void; signal: AbortSignal };
      const pending = new Map<string, Pending>();
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (url: string, init?: RequestInit) =>
            new Promise<Response>(resolve => {
              pending.set(url, { resolve, signal: init?.signal as AbortSignal });
            })
        )
      );
      const wrapper = mountPreview({ props: { visible: true, file: 'first.txt' } });
      await nextTick();

      await wrapper.setProps({ file: 'second.txt' });
      expect(pending.get('first.txt')?.signal.aborted).toBe(true);

      pending.get('second.txt')?.resolve(response('second body'));
      await flushPromises();
      pending.get('first.txt')?.resolve(response('stale first body'));
      await flushPromises();

      expect(document.querySelector('.ex-file-preview__text')?.textContent).toContain(
        'second body'
      );
      expect(document.querySelector('.ex-file-preview__text')?.textContent).not.toContain(
        'stale first body'
      );
    });

    it('流式读取能够正确拼接跨分片 UTF-8 字符', async () => {
      const bytes = new TextEncoder().encode('汉');
      const chunks = [bytes.slice(0, 2), bytes.slice(2)];
      const reader = {
        read: vi
          .fn<() => Promise<ReadableStreamReadResult<Uint8Array>>>()
          .mockResolvedValueOnce({ done: false, value: chunks[0] })
          .mockResolvedValueOnce({ done: false, value: chunks[1] })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        cancel: vi.fn(async () => undefined),
        releaseLock: vi.fn(),
      };
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          status: 200,
          headers: { get: () => null },
          body: { getReader: () => reader },
        }))
      );
      mountPreview({ props: { visible: true, file: 'stream.txt', maxTextBytes: 3 } });
      await flushPromises();

      expect(document.querySelector('.ex-file-preview__text pre')?.textContent).toBe('汉');
      expect(reader.cancel).not.toHaveBeenCalled();
      expect(reader.releaseLock).toHaveBeenCalledOnce();
    });

    it('流式文本一旦超限就取消读取并报告 text-too-large', async () => {
      const reader = {
        read: vi
          .fn<() => Promise<ReadableStreamReadResult<Uint8Array>>>()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(5) }),
        cancel: vi.fn(async () => undefined),
        releaseLock: vi.fn(),
      };
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          status: 200,
          headers: { get: () => null },
          body: { getReader: () => reader },
        }))
      );
      const wrapper = mountPreview({
        props: { visible: true, file: 'stream.txt', maxTextBytes: 4 },
      });
      await flushPromises();

      expect(reader.cancel).toHaveBeenCalledOnce();
      expect((wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError).code).toBe(
        'text-too-large'
      );
    });

    it('响应缺少流和可信长度时拒绝无边界读取', async () => {
      const text = vi.fn(async () => 'unbounded');
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          status: 200,
          headers: { get: () => null },
          body: null,
          text,
        }))
      );
      const wrapper = mountPreview({ props: { visible: true, file: 'legacy.txt' } });
      await flushPromises();

      expect(text).not.toHaveBeenCalled();
      expect((wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError).code).toBe(
        'text-too-large'
      );
    });

    it('Content-Length 超限时中止底层请求', async () => {
      let signal: AbortSignal | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string, init?: RequestInit) => {
          signal = init?.signal as AbortSignal;
          return response('large', { length: '100' });
        })
      );
      mountPreview({ props: { visible: true, file: 'large.txt', maxTextBytes: 8 } });
      await flushPromises();

      expect(signal?.aborted).toBe(true);
    });

    it('网络读取异常统一报告 load-failed 并保留根因', async () => {
      const cause = new TypeError('network failed');
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => Promise.reject(cause))
      );
      const wrapper = mountPreview({ props: { visible: true, file: 'network.txt' } });
      await flushPromises();

      const error = wrapper.emitted('error')?.[0]?.[0] as ExFilePreviewError;
      expect(error.code).toBe('load-failed');
      expect(error.cause).toBe(cause);
      expect(document.querySelector('.ex-file-preview__text-error')).toBeTruthy();
    });
  });

  describe('关闭、下载与键盘', () => {
    it('Teleport 浮层继承 ConfigProvider 的层级与效果开关', async () => {
      const wrapper = mount(ExConfigProvider, {
        attachTo: document.body,
        props: { zIndex: 2200, animation: false, neonEffect: false },
        slots: {
          default: () => h(ExFilePreview, { visible: true, file: 'a.png' }),
        },
      });
      wrappers.push(wrapper);
      await nextTick();

      const preview = document.body.querySelector<HTMLElement>('.ex-file-preview');
      expect(preview?.style.zIndex).toBe('2250');
      expect(preview?.classList.contains('ex-no-animation')).toBe(true);
      expect(preview?.classList.contains('ex-no-neon')).toBe(true);
    });

    it('隐藏工具栏时仍独立显示关闭按钮', async () => {
      mountPreview({
        props: {
          visible: true,
          file: 'a.png',
          showToolbar: false,
          showClose: true,
          maskClosable: false,
          closeOnEscape: false,
        },
      });
      await nextTick();

      expect(document.querySelector('.ex-file-preview__standalone-close')).toBeTruthy();
    });

    it('非图片和系统缩放快捷键不会被预览器吞掉', async () => {
      mountPreview({ props: { visible: true, file: 'note.txt' } });
      await nextTick();
      const textDialog = Array.from(document.querySelectorAll('.ex-file-preview')).at(-1)!;
      const textZoom = new KeyboardEvent('keydown', { key: '+', bubbles: true, cancelable: true });
      textDialog.dispatchEvent(textZoom);
      expect(textZoom.defaultPrevented).toBe(false);

      mountPreview({ props: { visible: true, file: 'a.png' } });
      await nextTick();
      const browserZoom = new KeyboardEvent('keydown', {
        key: '+',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      Array.from(document.querySelectorAll('.ex-file-preview')).at(-1)!.dispatchEvent(browserZoom);
      expect(browserZoom.defaultPrevented).toBe(false);
    });

    it('图片已到缩放边界时滚轮保持页面默认行为', async () => {
      mountPreview({ props: { visible: true, file: 'a.png', scale: 5, maxScale: 5 } });
      await nextTick();
      const wheel = new WheelEvent('wheel', { deltaY: -1, cancelable: true });
      document.querySelector('.ex-file-preview__image-wrapper')?.dispatchEvent(wheel);

      expect(wheel.defaultPrevented).toBe(false);
    });

    it('旧媒体元素的迟到事件不会冒充当前文件 ready', async () => {
      const wrapper = mountPreview({
        props: { visible: true, files: imageFiles, currentIndex: 0 },
      });
      await nextTick();
      const staleImage = document.querySelector('.ex-file-preview__image') as HTMLImageElement;

      await wrapper.setProps({ currentIndex: 1 });
      staleImage.dispatchEvent(new Event('load'));
      await nextTick();

      expect(wrapper.emitted('ready')).toBeUndefined();
    });
    it('遮罩与 Escape 使用独立开关并只发出关闭请求', async () => {
      const wrapper = mountPreview({
        props: {
          visible: true,
          file: 'a.png',
          maskClosable: false,
          closeOnEscape: true,
        },
      });
      await nextTick();

      (document.querySelector('.ex-file-preview__mask') as HTMLElement).click();
      expect(wrapper.emitted('update:visible')).toBeUndefined();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
      expect(wrapper.emitted('close-request')).toEqual([[]]);
      expect(document.querySelector('.ex-file-preview')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('关闭 closeOnEscape 后 Escape 无效，但可点击遮罩请求关闭', async () => {
      const wrapper = mountPreview({
        props: { visible: true, file: 'a.png', maskClosable: true, closeOnEscape: false },
      });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      expect(wrapper.emitted('update:visible')).toBeUndefined();

      (document.querySelector('.ex-file-preview__mask') as HTMLElement).click();
      expect(wrapper.emitted('close-request')).toEqual([[]]);
    });

    it('下载按钮只报告业务请求，不伪造浏览器下载完成', async () => {
      const file: PreviewFile = { url: 'report.pdf', name: 'report.pdf' };
      const wrapper = mountPreview({ props: { visible: true, file } });
      await nextTick();

      (document.querySelector('[aria-label="Download file"]') as HTMLButtonElement).click();
      expect(wrapper.emitted('download-request')).toEqual([[file]]);
      expect(wrapper.emitted('download')).toBeUndefined();
    });

    it('快捷键只由事件所在预览层处理，并跳过媒体控件', async () => {
      const first = mountPreview({ props: { visible: true, files: imageFiles } });
      const second = mountPreview({ props: { visible: true, files: imageFiles } });
      await nextTick();
      const dialogs = [...document.querySelectorAll<HTMLElement>('.ex-file-preview')];

      dialogs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextTick();
      expect(second.emitted('update:currentIndex')?.at(-1)).toEqual([1]);
      expect(first.emitted('update:currentIndex')).toBeUndefined();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(second.emitted('update:currentIndex')).toHaveLength(1);
    });
  });

  describe('渲染事件与无障碍', () => {
    it('所有内置图标按钮都有名称，PDF iframe 有标题', async () => {
      const wrapper = mountPreview({
        props: { visible: true, file: { url: 'manual.pdf', name: 'manual.pdf' } },
      });
      await nextTick();
      const dialog = document.querySelector('.ex-file-preview') as HTMLElement;

      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(document.querySelector('iframe')?.getAttribute('title')).toContain('manual.pdf');
      expect(document.querySelector('[aria-label="Download file"]')).toBeTruthy();
      expect(document.querySelector('[aria-label="Close preview"]')).toBeTruthy();

      await wrapper.setProps({ file: 'a.png' });
      for (const label of [
        'Zoom out',
        'Zoom in',
        'Reset zoom',
        'Rotate counterclockwise',
        'Rotate clockwise',
      ]) {
        expect(document.querySelector(`[aria-label="${label}"]`)).toBeTruthy();
      }
    });

    it('媒体就绪和失败事件携带当前文件及索引', async () => {
      const file: PreviewFile = { url: 'a.png', name: 'a.png' };
      const wrapper = mountPreview({ props: { visible: true, file } });
      await nextTick();
      const image = document.querySelector('.ex-file-preview__image') as HTMLImageElement;

      image.dispatchEvent(new Event('load'));
      expect(wrapper.emitted('ready')).toEqual([[file, 0]]);
      image.dispatchEvent(new Event('error'));
      const event = wrapper.emitted('error')?.at(-1);
      expect(event?.[0]).toBeInstanceOf(ExFilePreviewError);
      expect(event?.slice(1)).toEqual([file, 0]);
    });

    it('渲染 toolbar 与 footer 插槽并传递文件和索引', async () => {
      mountPreview({
        props: { visible: true, file: imageFiles[0] },
        slots: {
          toolbar: ({ file, index }: { file: PreviewFile; index: number }) =>
            `${file.name}-${index}`,
          footer: ({ file, index }: { file: PreviewFile; index: number }) =>
            `${file.name}-${index}`,
        },
      });
      await nextTick();

      expect(document.querySelector('.ex-file-preview__toolbar-actions')?.textContent).toContain(
        'a.png-0'
      );
      expect(document.querySelector('.ex-file-preview__footer')?.textContent).toContain('a.png-0');
    });
  });
});
