import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';
import { ExFileUploadError } from '../../../src/components/file-upload/errors';
import type { ExFileUploadExposed, UploadFile } from '../../../src/components/file-upload/types';
import { setLocale } from '../../../src/locale';

type MockListener = (event: ProgressEvent) => void;

/** 可精确驱动成功、HTTP 错误、网络错误、超时和中止的 XHR。 */
class MockXHR {
  static instances: MockXHR[] = [];
  readonly listeners = new Map<string, MockListener[]>();
  readonly uploadListeners = new Map<string, MockListener[]>();
  readonly upload = {
    addEventListener: (type: string, listener: MockListener) => {
      this.addListener(this.uploadListeners, type, listener);
    },
  };
  status = 200;
  statusText = 'OK';
  responseText = '{"url":"/files/a.txt"}';
  responseContentType = 'application/json';
  withCredentials = false;
  timeout = 0;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  getResponseHeader = vi.fn((name: string) =>
    name.toLowerCase() === 'content-type' ? this.responseContentType : null
  );

  constructor() {
    MockXHR.instances.push(this);
  }

  addEventListener(type: string, listener: MockListener): void {
    this.addListener(this.listeners, type, listener);
  }

  abort = vi.fn(() => this.dispatch('abort'));

  triggerProgress(loaded: number, total: number, lengthComputable = true): void {
    this.dispatch('progress', { loaded, total, lengthComputable });
  }

  triggerLoad(status = 200, responseText = this.responseText): void {
    this.status = status;
    this.responseText = responseText;
    this.dispatch('load');
  }

  triggerError(): void {
    this.dispatch('error');
  }

  triggerTimeout(): void {
    this.dispatch('timeout');
  }

  private addListener(
    target: Map<string, MockListener[]>,
    type: string,
    listener: MockListener
  ): void {
    target.set(type, [...(target.get(type) ?? []), listener]);
  }

  private dispatch(
    type: string,
    progress: Partial<Pick<ProgressEvent, 'loaded' | 'total' | 'lengthComputable'>> = {}
  ): void {
    const event = {
      loaded: progress.loaded ?? 0,
      total: progress.total ?? 0,
      lengthComputable: progress.lengthComputable ?? false,
    } as ProgressEvent;
    for (const listener of this.uploadListeners.get(type) ?? []) listener(event);
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

const makeFile = (name: string, type: string, size = 8): File => {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
};

const asUploadFile = (raw: File, status: UploadFile['status'] = 'ready'): UploadFile => ({
  uid: `uid-${raw.name}`,
  name: raw.name,
  size: raw.size,
  type: raw.type,
  status,
  percent: status === 'success' ? 100 : 0,
  raw,
});

describe('ExFileUpload', () => {
  const wrappers: VueWrapper[] = [];
  let createObjectURL: ReturnType<typeof vi.fn<(blob: Blob) => string>>;
  let revokeObjectURL: ReturnType<typeof vi.fn<(url: string) => void>>;

  const mountUpload = (options: Parameters<typeof mount>[1] = {}) => {
    const wrapper = mount(ExFileUpload, { ...options, attachTo: document.body });
    wrappers.push(wrapper);
    return wrapper;
  };

  const selectFiles = async (wrapper: VueWrapper, files: File[]): Promise<void> => {
    const input = wrapper.find<HTMLInputElement>('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: files, configurable: true });
    await input.trigger('change');
    await flushPromises();
  };

  beforeEach(() => {
    setLocale('en-US');
    MockXHR.instances = [];
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);

    let objectUrlIndex = 0;
    createObjectURL = vi.fn(() => `blob:upload-${++objectUrlIndex}`);
    revokeObjectURL = vi.fn();
    const NativeURL = URL;
    class ObjectURL extends NativeURL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    }
    vi.stubGlobal('URL', ObjectURL);
  });

  afterEach(() => {
    for (const wrapper of wrappers.splice(0).reverse()) wrapper.unmount();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('文件列表状态', () => {
    it('受控列表只发出新快照，父级同步前不提前渲染', async () => {
      const wrapper = mountUpload({ props: { fileList: [], autoUpload: false } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);

      const requested = wrapper.emitted('update:fileList')?.at(-1)?.[0] as UploadFile[];
      expect(requested).toHaveLength(1);
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(0);

      await wrapper.setProps({ fileList: requested });
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(1);
    });

    it('非受控列表使用 defaultFileList 并立即提交选择结果', async () => {
      const existing = asUploadFile(makeFile('existing.txt', 'text/plain'), 'success');
      const wrapper = mountUpload({
        props: { defaultFileList: [existing], autoUpload: false, multiple: true },
      });
      await selectFiles(wrapper, [makeFile('new.txt', 'text/plain')]);

      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(2);
      expect(wrapper.emitted('added')?.[0]?.[0]).toMatchObject({ name: 'new.txt' });
    });

    it('受控移除只发请求，父级同步后才移除 DOM', async () => {
      const file = asUploadFile(makeFile('a.txt', 'text/plain'));
      const wrapper = mountUpload({ props: { fileList: [file], autoUpload: false } });
      await nextTick();

      (document.querySelector('[aria-label="Remove a.txt"]') as HTMLButtonElement).click();
      await nextTick();
      expect(wrapper.emitted('remove-request')).toEqual([[file]]);
      expect(wrapper.emitted('update:fileList')?.at(-1)?.[0] as UploadFile[]).toEqual([]);
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(1);
      expect(wrapper.emitted('remove')).toBeUndefined();

      await wrapper.setProps({ fileList: [] });
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(0);
    });

    it('运行时解除受控后保留最后一个外部列表快照', async () => {
      const file = asUploadFile(makeFile('a.txt', 'text/plain'));
      const wrapper = mountUpload({ props: { fileList: [file], autoUpload: false } });

      await wrapper.setProps({ fileList: undefined });
      expect((wrapper.vm as unknown as ExFileUploadExposed).getFiles()).toMatchObject([
        { uid: file.uid, name: file.name },
      ]);
      (wrapper.vm as unknown as ExFileUploadExposed).requestClear();
      await nextTick();
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(0);
    });
  });

  describe('选择、校验与异步钩子', () => {
    it('按 accept 和字节上限拒绝文件，并返回统一可判别原因', async () => {
      const wrapper = mountUpload({
        props: { accept: 'image/*', maxFileSize: 8, autoUpload: false, multiple: true },
      });
      await selectFiles(wrapper, [
        makeFile('a.txt', 'text/plain', 4),
        makeFile('large.png', 'image/png', 9),
      ]);

      expect(wrapper.emitted('rejected')?.map(event => event[0])).toMatchObject([
        { code: 'accept', file: { name: 'a.txt' } },
        { code: 'size', file: { name: 'large.png' }, maxFileSize: 8 },
      ]);
      expect(wrapper.emitted('type-mismatch')).toBeUndefined();
      expect(wrapper.emitted('oversize')).toBeUndefined();
      expect(wrapper.emitted('added')).toBeUndefined();
    });

    it('异步 beforeAdd 串行执行，拒绝项不占用 limit 名额', async () => {
      const beforeAdd = vi.fn(async (file: File) => (file.name === 'skip.txt' ? false : file));
      const wrapper = mountUpload({
        props: { limit: 1, multiple: true, autoUpload: false, beforeAdd },
      });
      await selectFiles(wrapper, [
        makeFile('skip.txt', 'text/plain'),
        makeFile('accepted.txt', 'text/plain'),
      ]);

      expect(beforeAdd.mock.calls.map(call => call[0].name)).toEqual(['skip.txt', 'accepted.txt']);
      expect(wrapper.emitted('rejected')?.[0]?.[0]).toMatchObject({
        code: 'before-add',
        file: { name: 'skip.txt' },
      });
      expect(wrapper.emitted('added')?.[0]?.[0]).toMatchObject({ name: 'accepted.txt' });
    });

    it('重新校验 beforeAdd 返回的替换文件', async () => {
      const replacement = makeFile('replacement.txt', 'text/plain');
      const wrapper = mountUpload({
        props: {
          accept: 'image/*',
          autoUpload: false,
          beforeAdd: () => replacement,
        },
      });
      await selectFiles(wrapper, [makeFile('source.png', 'image/png')]);

      expect(wrapper.emitted('rejected')?.[0]?.[0]).toMatchObject({
        code: 'accept',
        file: replacement,
      });
      expect(wrapper.emitted('added')).toBeUndefined();
    });

    it('beforeAdd 异常不会静默丢失并保留根因', async () => {
      const cause = new Error('transform failed');
      const wrapper = mountUpload({
        props: { autoUpload: false, beforeAdd: async () => Promise.reject(cause) },
      });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);

      expect(wrapper.emitted('rejected')?.[0]?.[0]).toMatchObject({
        code: 'before-add-error',
        cause,
      });
    });

    it('清空列表会使仍在等待的 beforeAdd 结果失效', async () => {
      let resolveBeforeAdd: ((file: File) => void) | undefined;
      const beforeAdd = vi.fn(
        () =>
          new Promise<File>(resolve => {
            resolveBeforeAdd = resolve;
          })
      );
      const file = makeFile('late.txt', 'text/plain');
      const wrapper = mountUpload({ props: { action: '/upload', beforeAdd } });
      const input = wrapper.find<HTMLInputElement>('input[type="file"]');
      Object.defineProperty(input.element, 'files', { value: [file], configurable: true });

      await input.trigger('change');
      await nextTick();
      expect(beforeAdd).toHaveBeenCalledOnce();

      (wrapper.vm as unknown as ExFileUploadExposed).requestClear();
      resolveBeforeAdd?.(file);
      await flushPromises();

      expect((wrapper.vm as unknown as ExFileUploadExposed).getFiles()).toEqual([]);
      expect(wrapper.emitted('added')).toBeUndefined();
      expect(MockXHR.instances).toHaveLength(0);
    });

    it('清空列表会同时取消尚未开始的排队选择', async () => {
      let resolveFirst: ((file: File) => void) | undefined;
      const first = makeFile('first.txt', 'text/plain');
      const second = makeFile('second.txt', 'text/plain');
      const beforeAdd = vi.fn((file: File) => {
        if (file === first) {
          return new Promise<File>(resolve => {
            resolveFirst = resolve;
          });
        }
        return Promise.resolve(file);
      });
      const wrapper = mountUpload({ props: { autoUpload: false, beforeAdd } });
      const input = wrapper.find<HTMLInputElement>('input[type="file"]');

      Object.defineProperty(input.element, 'files', { value: [first], configurable: true });
      await input.trigger('change');
      await nextTick();
      Object.defineProperty(input.element, 'files', { value: [second], configurable: true });
      await input.trigger('change');

      (wrapper.vm as unknown as ExFileUploadExposed).requestClear();
      resolveFirst?.(first);
      await flushPromises();

      expect(beforeAdd).toHaveBeenCalledOnce();
      expect(wrapper.emitted('added')).toBeUndefined();
      expect((wrapper.vm as unknown as ExFileUploadExposed).getFiles()).toEqual([]);
    });

    it('禁用组件会使仍在等待的 beforeAdd 结果失效', async () => {
      let resolveBeforeAdd: ((file: File) => void) | undefined;
      const file = makeFile('late.txt', 'text/plain');
      const wrapper = mountUpload({
        props: {
          action: '/upload',
          beforeAdd: () =>
            new Promise<File>(resolve => {
              resolveBeforeAdd = resolve;
            }),
        },
      });
      const input = wrapper.find<HTMLInputElement>('input[type="file"]');
      Object.defineProperty(input.element, 'files', { value: [file], configurable: true });

      await input.trigger('change');
      await nextTick();
      await wrapper.setProps({ disabled: true });
      resolveBeforeAdd?.(file);
      await flushPromises();

      expect(wrapper.emitted('added')).toBeUndefined();
      expect(MockXHR.instances).toHaveLength(0);
    });

    it('单选模式的拖拽只接受首个文件并明确拒绝其余文件', async () => {
      const wrapper = mountUpload({ props: { drag: true, autoUpload: false } });
      await wrapper.find('.ex-file-upload__drag').trigger('drop', {
        dataTransfer: {
          files: [makeFile('first.txt', 'text/plain'), makeFile('second.txt', 'text/plain')],
        },
      });
      await flushPromises();

      expect(wrapper.emitted('added')?.[0]?.[0]).toMatchObject({ name: 'first.txt' });
      expect(wrapper.emitted('rejected')?.[0]?.[0]).toMatchObject({
        code: 'multiple',
        file: { name: 'second.txt' },
      });
    });

    it('达到 limit 后拒绝新文件且公开打开方法返回 false', async () => {
      const wrapper = mountUpload({ props: { limit: 1, multiple: true, autoUpload: false } });
      await selectFiles(wrapper, [
        makeFile('a.txt', 'text/plain'),
        makeFile('b.txt', 'text/plain'),
      ]);

      expect(wrapper.emitted('rejected')?.[0]?.[0]).toMatchObject({
        code: 'limit',
        limit: 1,
        file: { name: 'b.txt' },
      });
      expect((wrapper.vm as unknown as ExFileUploadExposed).openFileDialog()).toBe(false);
    });
  });

  describe('上传传输与结果', () => {
    it('完整提交方法、请求头、附加数据、凭证、超时、进度和 JSON 响应', async () => {
      const wrapper = mountUpload({
        props: {
          action: '/upload',
          method: 'PUT',
          headers: { 'x-token': 'secret' },
          data: { tenant: 7, enabled: true, ignored: null },
          withCredentials: true,
          timeout: 500,
        },
      });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);

      const xhr = MockXHR.instances[0];
      expect(xhr.open).toHaveBeenCalledWith('PUT', '/upload', true);
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('x-token', 'secret');
      expect(xhr.withCredentials).toBe(true);
      expect(xhr.timeout).toBe(500);
      const body = xhr.send.mock.calls[0]?.[0] as FormData;
      expect(body.get('tenant')).toBe('7');
      expect(body.get('enabled')).toBe('true');
      expect(body.has('ignored')).toBe(false);
      expect(body.get('file')).toBeInstanceOf(File);

      xhr.triggerProgress(12, 10);
      await nextTick();
      expect(wrapper.emitted('progress')?.at(-1)?.[0]).toMatchObject({ percent: 100 });
      xhr.triggerProgress(1, 10);
      await nextTick();
      expect(wrapper.emitted('progress')?.at(-1)?.[0]).toMatchObject({ percent: 100 });

      xhr.triggerLoad(201);
      await flushPromises();
      expect(wrapper.emitted('success')?.[0]?.[0]).toEqual({ url: '/files/a.txt' });
      expect(wrapper.emitted('success')?.[0]?.[1]).toMatchObject({
        status: 'success',
        percent: 100,
        url: '/files/a.txt',
      });
    });

    it('响应未提供新地址时保留文件原有 URL', async () => {
      const file = { ...asUploadFile(makeFile('a.txt', 'text/plain')), url: '/existing/a.txt' };
      const wrapper = mountUpload({
        props: { action: '/upload', autoUpload: false, defaultFileList: [file] },
      });
      const resultPromise = (wrapper.vm as unknown as ExFileUploadExposed).submit(file.uid);
      await flushPromises();
      const xhr = MockXHR.instances[0];
      xhr.responseContentType = 'text/plain';
      xhr.triggerLoad(200, 'accepted');
      await resultPromise;

      expect(wrapper.emitted('success')?.[0]?.[1]).toMatchObject({ url: '/existing/a.txt' });
    });

    it('HTTP 非成功响应产生带状态码的结构化错误', async () => {
      const wrapper = mountUpload({ props: { action: '/upload' } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      const xhr = MockXHR.instances[0];
      xhr.statusText = '';
      xhr.triggerLoad(422, 'invalid');
      await flushPromises();

      const error = wrapper.emitted('error')?.[0]?.[0] as ExFileUploadError;
      expect(error).toBeInstanceOf(ExFileUploadError);
      expect(error.code).toBe('http-error');
      expect(error.status).toBe(422);
      expect(wrapper.emitted('error')?.[0]?.[1]).toMatchObject({ status: 'error' });
    });

    it('网络错误与超时使用不同错误代码', async () => {
      const wrapper = mountUpload({
        props: { action: '/upload', autoUpload: false, multiple: true },
      });
      await selectFiles(wrapper, [
        makeFile('network.txt', 'text/plain'),
        makeFile('timeout.txt', 'text/plain'),
      ]);
      const vm = wrapper.vm as unknown as ExFileUploadExposed;
      const resultPromise = vm.submit();
      await flushPromises();
      MockXHR.instances[0]?.triggerError();
      MockXHR.instances[1]?.triggerTimeout();
      const results = await resultPromise;

      expect(results.map(result => result.error?.code)).toEqual(['request-error', 'timeout']);
      expect(wrapper.emitted('error')?.map(event => (event[0] as ExFileUploadError).code)).toEqual([
        'request-error',
        'timeout',
      ]);
    });

    it('submit 返回可判别结果，缺少 action 时不会伪装成已上传', async () => {
      const wrapper = mountUpload({ props: { autoUpload: false } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);

      const results = await (wrapper.vm as unknown as ExFileUploadExposed).submit();
      expect(results).toEqual([
        expect.objectContaining({
          uid: expect.any(String),
          outcome: 'ignored',
          reason: 'no-action',
        }),
      ]);
      expect(MockXHR.instances).toHaveLength(0);
      expect(wrapper.emitted('success')).toBeUndefined();
    });

    it('手动 submit 等待真实 XHR 结束后才兑现 success 结果', async () => {
      const wrapper = mountUpload({ props: { action: '/upload', autoUpload: false } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      const resultPromise = (wrapper.vm as unknown as ExFileUploadExposed).submit();
      await flushPromises();
      let settled = false;
      void resultPromise.then(() => {
        settled = true;
      });
      await nextTick();
      expect(settled).toBe(false);

      MockXHR.instances[0]?.triggerLoad();
      await expect(resultPromise).resolves.toEqual([
        expect.objectContaining({ outcome: 'success', response: { url: '/files/a.txt' } }),
      ]);
    });

    it('解析动态 action 期间也能真实中止，并向 resolver 传递 AbortSignal', async () => {
      let resolveAction: ((value: string) => void) | undefined;
      let receivedSignal: AbortSignal | undefined;
      const action = vi.fn(
        (_file: UploadFile, context: { signal: AbortSignal }) =>
          new Promise<string>(resolve => {
            receivedSignal = context.signal;
            resolveAction = resolve;
          })
      );
      const wrapper = mountUpload({ props: { action } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      const added = wrapper.emitted('added')?.[0]?.[0] as UploadFile;

      const abortedCount = (wrapper.vm as unknown as ExFileUploadExposed).abort(added.uid);
      expect(abortedCount).toBe(1);
      expect(receivedSignal?.aborted).toBe(true);
      expect(wrapper.emitted('aborted')?.[0]?.[0]).toMatchObject({ status: 'ready' });

      resolveAction?.('/late-upload');
      await flushPromises();
      expect(MockXHR.instances).toHaveLength(0);
    });

    it('同一文件重复 submit 复用活动任务，不创建重复 XHR', async () => {
      const wrapper = mountUpload({ props: { action: '/upload', autoUpload: false } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      const file = wrapper.emitted('added')?.[0]?.[0] as UploadFile;
      const vm = wrapper.vm as unknown as ExFileUploadExposed;

      const first = vm.submit(file);
      const second = vm.submit(file.uid);
      await flushPromises();
      expect(MockXHR.instances).toHaveLength(1);
      MockXHR.instances[0]?.triggerLoad();
      await expect(first).resolves.toMatchObject([{ outcome: 'success' }]);
      await expect(second).resolves.toMatchObject([{ outcome: 'success' }]);
    });

    it('非 ready 与缺少 raw 的文件返回准确 ignored 原因', async () => {
      const success = asUploadFile(makeFile('done.txt', 'text/plain'), 'success');
      const missingRaw: UploadFile = {
        uid: 'missing',
        name: 'missing.txt',
        size: 1,
        type: 'text/plain',
        status: 'ready',
      };
      const wrapper = mountUpload({
        props: { action: '/upload', defaultFileList: [success, missingRaw], autoUpload: false },
      });
      const vm = wrapper.vm as unknown as ExFileUploadExposed;

      await expect(vm.submit(success)).resolves.toMatchObject([{ reason: 'not-ready' }]);
      await expect(vm.submit(missingRaw.uid)).resolves.toMatchObject([{ reason: 'missing-raw' }]);
      await expect(vm.submit('unknown')).resolves.toEqual([]);
    });

    it('XHR 自发 abort 会恢复 ready 状态并只报告一次中止', async () => {
      const wrapper = mountUpload({ props: { action: '/upload' } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      MockXHR.instances[0]?.abort();
      await flushPromises();

      expect(wrapper.emitted('aborted')).toHaveLength(1);
      expect(wrapper.emitted('aborted')?.[0]).toMatchObject([
        { status: 'ready', percent: 0 },
        expect.any(Array),
        'manual',
      ]);
    });

    it('父级移除受控文件时中止对应活动任务', async () => {
      const file = asUploadFile(makeFile('a.txt', 'text/plain'));
      const wrapper = mountUpload({
        props: { action: '/upload', autoUpload: false, fileList: [file] },
      });
      const submitPromise = (wrapper.vm as unknown as ExFileUploadExposed).submit(file.uid);
      await flushPromises();
      const xhr = MockXHR.instances[0];

      await wrapper.setProps({ fileList: [] });
      expect(xhr.abort).toHaveBeenCalledOnce();
      expect(wrapper.emitted('aborted')?.at(-1)?.[2]).toBe('external');
      await expect(submitPromise).resolves.toMatchObject([{ outcome: 'aborted' }]);
    });

    it('requestClear 中止全部任务并报告真实中止数量', async () => {
      const wrapper = mountUpload({ props: { action: '/upload', multiple: true } });
      await selectFiles(wrapper, [
        makeFile('a.txt', 'text/plain'),
        makeFile('b.txt', 'text/plain'),
      ]);
      expect(MockXHR.instances).toHaveLength(2);

      const count = (wrapper.vm as unknown as ExFileUploadExposed).requestClear();
      expect(count).toBe(2);
      expect(wrapper.emitted('aborted')?.map(event => event[2])).toEqual(['clear', 'clear']);
      await nextTick();
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(0);
    });
  });

  describe('预览资源与生命周期', () => {
    it('图片缩略图使用对象地址，并在移除后释放', async () => {
      const wrapper = mountUpload({ props: { autoUpload: false, listType: 'picture' } });
      const image = makeFile('a.png', 'image/png');
      await selectFiles(wrapper, [image]);

      expect(createObjectURL).toHaveBeenCalledWith(image);
      expect(
        wrapper.find<HTMLImageElement>('.ex-file-upload__list-item-thumbnail').attributes('src')
      ).toBe('blob:upload-1');
      (document.querySelector('[aria-label="Remove a.png"]') as HTMLButtonElement).click();
      await nextTick();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:upload-1');
    });

    it('卸载时释放仍在使用的对象地址并中止活动上传', async () => {
      const wrapper = mountUpload({ props: { action: '/upload' } });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png')]);
      const xhr = MockXHR.instances[0];

      wrapper.unmount();
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:upload-1');
      expect(xhr.abort).toHaveBeenCalledOnce();
    });

    it('预览按钮只发业务请求，不宣称已完成预览', async () => {
      const file = asUploadFile(makeFile('a.png', 'image/png'));
      const wrapper = mountUpload({ props: { defaultFileList: [file], autoUpload: false } });
      await nextTick();

      (document.querySelector('[aria-label="Preview a.png"]') as HTMLButtonElement).click();
      expect(wrapper.emitted('preview-request')).toEqual([[file]]);
      expect(wrapper.emitted('preview')).toBeUndefined();
    });

    it('picture-card 模式使用语义按钮，并在禁用时阻止预览和移除', async () => {
      const file = asUploadFile(makeFile('a.png', 'image/png'), 'success');
      const wrapper = mountUpload({
        props: {
          defaultFileList: [file],
          listType: 'picture-card',
          autoUpload: false,
          disabled: true,
        },
      });
      await nextTick();

      const preview = document.querySelector('[aria-label="Preview a.png"]') as HTMLButtonElement;
      const remove = document.querySelector('[aria-label="Remove a.png"]') as HTMLButtonElement;
      expect(preview.tagName).toBe('BUTTON');
      expect(preview.disabled).toBe(true);
      preview.click();
      remove.click();
      expect(wrapper.emitted('preview-request')).toBeUndefined();
      expect(wrapper.emitted('remove-request')).toBeUndefined();
    });
  });

  describe('无障碍与公开方法', () => {
    it('拖拽区可由键盘打开文件选择器，禁用时不可操作', async () => {
      const wrapper = mountUpload({ props: { drag: true, autoUpload: false } });
      const input = wrapper.find<HTMLInputElement>('input[type="file"]');
      const click = vi.spyOn(input.element, 'click');
      const dragZone = wrapper.find('.ex-file-upload__drag');

      expect(dragZone.attributes('role')).toBe('button');
      expect(dragZone.attributes('tabindex')).toBe('0');
      await dragZone.trigger('keydown', { key: 'Enter' });
      expect(click).toHaveBeenCalledOnce();

      await wrapper.setProps({ disabled: true });
      await dragZone.trigger('keydown', { key: 'Enter' });
      expect(click).toHaveBeenCalledOnce();
      expect(dragZone.attributes('aria-disabled')).toBe('true');
    });

    it('公开方法使用可兑现名称，并删除受控模式下不真实的 clearFiles', async () => {
      const wrapper = mountUpload({ props: { autoUpload: false } });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);
      const vm = wrapper.vm as unknown as ExFileUploadExposed & Record<string, unknown>;

      expect(vm.openFileDialog).toBeTypeOf('function');
      expect(vm.requestClear).toBeTypeOf('function');
      expect(vm.clearFiles).toBeUndefined();
      expect(vm.getElement()).toBeInstanceOf(HTMLElement);
      vm.requestClear();
      await nextTick();
      expect(wrapper.findAll('.ex-file-upload__list-item')).toHaveLength(0);
    });

    it('自定义 trigger 插槽获得 openFileDialog 与禁用状态', async () => {
      const wrapper = mountUpload({
        props: { disabled: true },
        slots: {
          trigger: ({
            disabled,
            openFileDialog,
          }: {
            disabled: boolean;
            openFileDialog: () => boolean;
          }) => `${disabled}-${typeof openFileDialog}`,
        },
      });
      await nextTick();

      expect(wrapper.find('.ex-file-upload__button').text()).toBe('true-function');
    });
  });
});
