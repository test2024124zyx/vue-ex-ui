import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, ref } from 'vue';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';
import type { UploadFile } from '../../../src/components/file-upload/types';

/** 驱动真实上传控制器，只替换浏览器网络传输。 */
class ControlledXHR extends EventTarget {
  static requests: ControlledXHR[] = [];
  upload = new EventTarget();
  status = 200;
  responseText = '{"url":"/uploaded.txt"}';
  constructor() {
    super();
    ControlledXHR.requests.push(this);
  }
  open() {}
  send() {}
  setRequestHeader() {}
  getResponseHeader() {
    return 'application/json';
  }
  abort() {
    this.dispatchEvent(new Event('abort'));
  }
}

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  ControlledXHR.requests = [];
  vi.unstubAllGlobals();
});

describe('受控上传的回写与文件选择隔离', () => {
  it.each(['progress', 'success', 'clear', 'replace'] as const)(
    '等待 beforeAdd 时处理 %s，既不丢失新文件也不复活已撤销的选择',
    async event => {
      vi.stubGlobal('XMLHttpRequest', ControlledXHR);
      const raw = new File(['已有文件'], 'first.txt', { type: 'text/plain' });
      const files = ref<UploadFile[]>([
        { uid: 'first', name: raw.name, raw, size: raw.size, type: raw.type, status: 'ready' },
      ]);
      const nextFile = new File(['新增文件'], 'second.txt', { type: 'text/plain' });
      let finish!: () => void;
      const beforeAdd = vi.fn(() => new Promise<void>(resolve => (finish = resolve)));
      const wrapper = mount({
        render: () =>
          h(ExFileUpload, {
            fileList: files.value,
            action: '/upload',
            autoUpload: false,
            beforeAdd,
            // 业务回写可以复制并补充展示字段，不要求保持数组引用。
            'onUpdate:fileList': value => (files.value = value.map(file => ({ ...file }))),
          }),
      });
      wrappers.push(wrapper);
      const uploader = wrapper.getComponent(ExFileUpload);
      void uploader.vm.submit();
      await flushPromises();
      const input = uploader.get('input[type="file"]');
      Object.defineProperty(input.element, 'files', { value: [nextFile], configurable: true });
      await input.trigger('change');
      await flushPromises();
      expect(beforeAdd).toHaveBeenCalledOnce();

      const request = ControlledXHR.requests[0]!;
      if (event === 'progress')
        request.upload.dispatchEvent(
          new ProgressEvent('progress', { lengthComputable: true, loaded: 1, total: 2 })
        );
      else if (event === 'success') request.dispatchEvent(new Event('load'));
      else if (event === 'clear') files.value = [];
      else files.value = [{ ...files.value[0]!, raw: new File(['替换'], 'replacement.txt') }];
      await flushPromises();
      finish();
      await flushPromises();

      const shouldAdd = event === 'progress' || event === 'success';
      expect(files.value.some(file => file.raw === nextFile)).toBe(shouldAdd);
      expect(uploader.emitted('added')?.length ?? 0).toBe(shouldAdd ? 1 : 0);
      if (event === 'progress') expect(files.value[0]?.percent).toBe(50);
      if (event === 'success') expect(files.value[0]?.url).toBe('/uploaded.txt');
    }
  );
});
