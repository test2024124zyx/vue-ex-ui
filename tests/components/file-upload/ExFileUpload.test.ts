import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';

// ---- 受控的 XMLHttpRequest 模拟 ----
class MockXHR {
  static instances: MockXHR[] = [];
  upload: { _h: Record<string, (e: any) => void>; addEventListener: (e: string, cb: any) => void };
  _h: Record<string, (e?: any) => void> = {};
  status = 200;
  statusText = 'OK';
  responseText = '{"url":"https://cdn/x.png"}';
  response: unknown = null;
  withCredentials = false;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this._h['abort']?.());

  constructor() {
    MockXHR.instances.push(this);
    const uploadHandlers: Record<string, (e: any) => void> = {};
    this.upload = {
      _h: uploadHandlers,
      addEventListener: (e: string, cb: any) => {
        uploadHandlers[e] = cb;
      },
    };
  }

  addEventListener(e: string, cb: (e?: any) => void) {
    this._h[e] = cb;
  }
  triggerLoad() {
    this._h['load']?.();
  }
  triggerError() {
    this._h['error']?.();
  }
}

// 构造一个可控大小的 File
function makeFile(name: string, type: string, size = 8): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size, configurable: true });
  return f;
}

// 模拟选择文件（jsdom 无法直接写 input.files，用 defineProperty）
async function selectFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, 'files', { value: files, configurable: true });
  await input.trigger('change');
  await flushPromises();
}

describe('ExFileUpload', () => {
  beforeEach(() => {
    MockXHR.instances = [];
    vi.stubGlobal('XMLHttpRequest', MockXHR as unknown as typeof XMLHttpRequest);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('校验与边界', () => {
    it('accept 不匹配时触发 type-mismatch 且不加入列表', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { accept: 'image/*', autoUpload: false },
      });
      await selectFiles(wrapper, [makeFile('a.txt', 'text/plain')]);

      expect(wrapper.emitted('type-mismatch')).toBeTruthy();
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('超出 max-size 时触发 oversize', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { maxSize: 1, autoUpload: false }, // 1MB
      });
      await selectFiles(wrapper, [makeFile('big.png', 'image/png', 5 * 1024 * 1024)]);

      const oversize = wrapper.emitted('oversize');
      expect(oversize).toBeTruthy();
      expect(oversize![0][1]).toBe(1);
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('超出 limit 时触发 exceed 并截断', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { limit: 2, autoUpload: false, multiple: true },
      });
      await selectFiles(wrapper, [
        makeFile('1.png', 'image/png'),
        makeFile('2.png', 'image/png'),
        makeFile('3.png', 'image/png'),
      ]);

      expect(wrapper.emitted('exceed')).toBeTruthy();
      const lastList = wrapper.emitted('update:fileList')!.pop()![0] as unknown[];
      expect(lastList.length).toBe(2);
    });
  });

  describe('before-upload 钩子', () => {
    it('返回 false 阻止上传', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { autoUpload: false, beforeUpload: () => false },
      });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png')]);

      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('返回新 File 时替换待上传文件', async () => {
      const replacement = makeFile('replaced.png', 'image/png');
      const wrapper = mount(ExFileUpload, {
        props: { autoUpload: false, beforeUpload: () => replacement },
      });
      await selectFiles(wrapper, [makeFile('origin.png', 'image/png')]);

      const change = wrapper.emitted('change');
      expect(change).toBeTruthy();
      expect((change![0][0] as { name: string }).name).toBe('replaced.png');
    });
  });

  describe('上传流程与暴露方法', () => {
    it('autoUpload + action：选择后发起 XHR 并在 load 时触发 success', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { action: '/api/upload', autoUpload: true },
      });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png')]);

      expect(MockXHR.instances.length).toBe(1);
      const xhr = MockXHR.instances[0];
      expect(xhr.open).toHaveBeenCalledWith('POST', '/api/upload');
      expect(xhr.send).toHaveBeenCalled();

      xhr.triggerLoad();
      await flushPromises();
      const success = wrapper.emitted('success');
      expect(success).toBeTruthy();
      expect((success![0][1] as { status: string }).status).toBe('success');
    });

    it('submit() 手动上传 ready 文件', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { action: '/api/upload', autoUpload: false },
      });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png')]);
      expect(MockXHR.instances.length).toBe(0); // 未自动上传

      (wrapper.vm as any).submit();
      await flushPromises();
      expect(MockXHR.instances.length).toBe(1);
      expect(MockXHR.instances[0].send).toHaveBeenCalled();
    });

    it('clearFiles() 清空列表并 emit 空列表', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { autoUpload: false, multiple: true },
      });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png'), makeFile('b.png', 'image/png')]);

      (wrapper.vm as any).clearFiles();
      await nextTick();
      const lastList = wrapper.emitted('update:fileList')!.pop()![0] as unknown[];
      expect(lastList.length).toBe(0);
    });

    it('abort(file) 中止上传并把状态回退为 ready', async () => {
      const wrapper = mount(ExFileUpload, {
        props: { action: '/api/upload', autoUpload: true },
      });
      await selectFiles(wrapper, [makeFile('a.png', 'image/png')]);
      const xhr = MockXHR.instances[0];

      const file = wrapper.emitted('change')![0][0] as { uid: string };
      (wrapper.vm as any).abort(file);
      expect(xhr.abort).toHaveBeenCalled();
    });

    it('getElement() 返回根 DOM 元素', () => {
      const wrapper = mount(ExFileUpload);
      expect((wrapper.vm as any).getElement()).toBeInstanceOf(HTMLElement);
    });
  });

  describe('受控 fileList 同步', () => {
    it('外部 fileList 变化时内部列表同步渲染', async () => {
      const wrapper = mount(ExFileUpload, {
        props: {
          autoUpload: false,
          fileList: [{ uid: '1', name: 'a.png', size: 1, type: 'image/png', status: 'success' }],
        },
      });
      await nextTick();
      expect(wrapper.findAll('.ex-file-upload__list-item-name').length).toBe(1);

      await wrapper.setProps({
        fileList: [
          { uid: '1', name: 'a.png', size: 1, type: 'image/png', status: 'success' },
          { uid: '2', name: 'b.png', size: 1, type: 'image/png', status: 'success' },
        ],
      });
      await nextTick();
      expect(wrapper.findAll('.ex-file-upload__list-item-name').length).toBe(2);
    });
  });
});
