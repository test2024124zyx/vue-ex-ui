import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormInstance } from '../../../src/components/form/types';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';
import type { ExFileUploadExposed, UploadFile } from '../../../src/components/file-upload/types';
import type { UploadTransportResult } from '../../../src/components/file-upload/upload-request';
import type { createTusUploadRequest } from '../../../src/components/file-upload/tus-upload';

type TusRequestOptions = Parameters<typeof createTusUploadRequest>[0];
const tasks = vi.hoisted(
  () =>
    [] as Array<{
      options: TusRequestOptions;
      resolve: (result: UploadTransportResult) => void;
      abort: ReturnType<typeof vi.fn>;
      terminate: ReturnType<typeof vi.fn>;
    }>
);
vi.mock('../../../src/components/file-upload/tus-upload', () => ({
  createTusUploadRequest: (options: TusRequestOptions) => {
    let resolve!: (result: UploadTransportResult) => void;
    const promise = new Promise<UploadTransportResult>(done => (resolve = done));
    const abort = vi.fn(() => {
      resolve({ outcome: 'aborted' });
      return true;
    });
    const terminate = vi.fn(async () => true);
    tasks.push({ options, resolve, abort, terminate });
    return { promise, abort, terminate, pending: false, uploadUrl: options.uploadUrl };
  },
}));

const makeFile = (uid: string): UploadFile => {
  const raw = new File(['abcdefghij'], `${uid}.txt`, { type: 'text/plain' });
  return { uid, raw, name: raw.name, size: raw.size, type: raw.type, status: 'ready' };
};
const wrappers: Array<{ unmount(): void }> = [];
const create = (props = {}) => {
  const wrapper = mount(ExFileUpload, {
    props: {
      transport: 'tus',
      action: '/files/',
      defaultFileList: [makeFile('a')],
      autoUpload: false,
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return { wrapper, vm: wrapper.vm as unknown as ExFileUploadExposed };
};

describe('FileUpload tus 用户流程', () => {
  beforeEach(() => tasks.splice(0));
  afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

  it('表单重置撤销 tus 活动任务和队列，旧资源回调无效且不永久删除服务端文件', async () => {
    const model = reactive({ files: [makeFile('a'), makeFile('b')] });
    const form = ref<FormInstance>();
    const upload = ref<ExFileUploadExposed>();
    const wrapper = mount({
      render: () =>
        h(ExForm, { ref: form, model }, () =>
          h(ExFormItem, { prop: 'files' }, () =>
            h(ExFileUpload, {
              ref: upload,
              transport: 'tus',
              action: '/files/',
              concurrency: 1,
              fileList: model.files,
              'onUpdate:fileList': files => (model.files = files),
            })
          )
        ),
    });
    wrappers.push(wrapper);
    const pending = upload.value!.submit();
    await flushPromises();
    form.value!.resetFields();
    await nextTick();
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/old');
    tasks[0]!.options.onProgress?.(100);
    tasks[0]!.resolve({ outcome: 'success', response: {} });
    await expect(pending).resolves.toMatchObject([{ outcome: 'aborted' }, { outcome: 'aborted' }]);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.abort).toHaveBeenCalledOnce();
    expect(tasks[0]!.terminate).not.toHaveBeenCalled();
    expect(model.files.every(file => file.status === 'ready' && !file.tusUploadUrl)).toBe(true);
    expect(wrapper.findComponent(ExFileUpload).emitted('success')).toBeUndefined();
  });

  it('暂停保留已确认资源和进度，继续上传重新查询该资源偏移', async () => {
    const { vm, wrapper } = create();
    const first = vm.submit();
    await flushPromises();
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/id');
    tasks[0]!.options.onProgress?.(50);
    await flushPromises();
    expect(wrapper.find('[data-upload-action="pause"]').exists()).toBe(true);
    expect(vm.pause('a')).toBe(1);
    await expect(first).resolves.toMatchObject([{ outcome: 'paused' }]);
    expect(vm.getFiles()[0]).toMatchObject({ status: 'paused', percent: 50 });
    const resumed = vm.resume('a');
    await flushPromises();
    expect(tasks[1]!.options.uploadUrl).toBe('http://localhost/files/id');
    tasks[1]!.resolve({ outcome: 'success', response: { uploadUrl: 'http://localhost/files/id' } });
    await expect(resumed).resolves.toMatchObject([{ outcome: 'success' }]);
    expect(vm.getFiles()[0]).toMatchObject({ status: 'success', percent: 100 });
    expect(wrapper.emitted('resumed')).toHaveLength(1);
  });

  it.each([
    { tus: { resumeKey: 'account-b' }, headers: { Authorization: 'Bearer b' } },
    { action: '/other-files/' },
    { withCredentials: true },
    { headers: { Authorization: 'Bearer refreshed' } },
  ])('传输作用域改变后不恢复旧资源，也不沿用旧进度：%j', async changes => {
    const { vm, wrapper } = create({ tus: { resumeKey: 'account-a' } });
    const first = vm.submit();
    await flushPromises();
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/account-a');
    tasks[0]!.options.onProgress?.(50);
    vm.pause('a');
    await first;
    await wrapper.setProps(changes);
    expect(vm.getFiles()[0]).toMatchObject({ status: 'ready', percent: 0 });
    expect(vm.getFiles()[0]!.tusUploadUrl).toBeUndefined();
    const second = vm.resume('a');
    await flushPromises();
    expect(tasks[1]!.options.uploadUrl).toBeUndefined();
    expect(tasks[0]!.terminate).not.toHaveBeenCalled();
    vm.abort();
    await second;
  });

  it('受控列表拒绝清空旧地址时，账号切换仍阻止继续和删除旧账号资源', async () => {
    const source = {
      ...makeFile('a'),
      status: 'paused' as const,
      tusUploadUrl: 'http://localhost/files/account-a',
    };
    const { vm, wrapper } = create({ fileList: [source], tus: { resumeKey: 'account-a' } });
    await wrapper.setProps({ tus: { resumeKey: 'account-b' } });
    const resumed = vm.resume('a');
    await flushPromises();
    expect(tasks[0]!.options.uploadUrl).toBeUndefined();
    vm.abort();
    await resumed;
    await expect(vm.cancel('a')).resolves.toMatchObject([{ cancelled: true, terminated: true }]);
    expect(tasks[0]!.terminate).toHaveBeenCalledOnce();
    expect(tasks[0]!.options.uploadUrl).toBeUndefined();
  });

  it('账号切换会中止排队和进行中的上传，并忽略旧账号迟到的回调', async () => {
    const { vm, wrapper } = create({
      tus: { resumeKey: 'account-a' },
      concurrency: 1,
      defaultFileList: [makeFile('a'), makeFile('b')],
    });
    const pending = vm.submit();
    await flushPromises();
    await wrapper.setProps({ tus: { resumeKey: 'account-b' } });
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/late');
    tasks[0]!.options.onProgress?.(80);
    tasks[0]!.resolve({ outcome: 'success', response: {} });
    await expect(pending).resolves.toMatchObject([{ outcome: 'aborted' }, { outcome: 'aborted' }]);
    expect(tasks).toHaveLength(1);
    expect(wrapper.emitted('success')).toBeUndefined();
    expect(vm.getFiles().every(file => file.status === 'ready' && !file.tusUploadUrl)).toBe(true);
  });

  it('账号切换会中止未完成的永久取消，迟到确认不能清空新账号状态', async () => {
    const { vm, wrapper } = create({ tus: { resumeKey: 'account-a' } });
    const pending = vm.submit();
    await flushPromises();
    let finish!: (terminated: boolean) => void;
    tasks[0]!.terminate.mockImplementation(
      () => new Promise<boolean>(resolve => (finish = resolve))
    );
    const cancelled = vm.cancel('a');
    await flushPromises();
    await wrapper.setProps({ tus: { resumeKey: 'account-b' } });
    finish(true);
    await expect(cancelled).resolves.toMatchObject([{ cancelled: false }]);
    await pending;
    expect(wrapper.emitted('cancelled')).toBeUndefined();
    expect(vm.getFiles()[0]!.status).toBe('ready');
  });

  it('并发上限约束文件，取消排队项后不会启动该文件', async () => {
    const { vm } = create({
      concurrency: 1,
      defaultFileList: [makeFile('a'), makeFile('b'), makeFile('c')],
    });
    const submitted = vm.submit();
    await flushPromises();
    expect(tasks).toHaveLength(1);
    expect(vm.getFiles().map(file => file.status)).toEqual(['uploading', 'queued', 'queued']);
    expect(vm.abort('b')).toBe(1);
    tasks[0]!.resolve({ outcome: 'success', response: { uploadUrl: '/files/a' } });
    await flushPromises();
    expect(tasks).toHaveLength(2);
    expect(tasks[1]!.options.file.uid).toBe('c');
    tasks[1]!.resolve({ outcome: 'success', response: { uploadUrl: '/files/c' } });
    await expect(submitted).resolves.toMatchObject([
      { outcome: 'success' },
      { outcome: 'aborted' },
      { outcome: 'success' },
    ]);
  });

  it('永久取消等待服务器确认，失败保留资源地址和可重试状态', async () => {
    const { vm, wrapper } = create();
    const pending = vm.submit();
    await flushPromises();
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/id');
    tasks[0]!.terminate.mockRejectedValue(new Error('服务器拒绝终止'));
    const [failed] = await vm.cancel('a');
    expect(failed).toMatchObject({ cancelled: false, terminated: false });
    expect(vm.getFiles()[0]).toMatchObject({
      status: 'error',
      tusUploadUrl: 'http://localhost/files/id',
    });
    expect(wrapper.emitted('cancelled')).toBeUndefined();
    tasks[0]!.terminate.mockResolvedValue(true);
    await expect(vm.cancel('a')).resolves.toMatchObject([{ cancelled: true, terminated: true }]);
    expect(vm.getFiles()[0]).toMatchObject({ status: 'ready', percent: 0 });
    expect(vm.getFiles()[0]!.tusUploadUrl).toBeUndefined();
    await pending;
  });

  it('失败和暂停文件提供真实重试入口，普通完成文件不会重新提交', async () => {
    const { vm, wrapper } = create();
    const submitted = vm.submit();
    await flushPromises();
    tasks[0]!.resolve({ outcome: 'error', error: new Error('断网') as never });
    await submitted;
    await flushPromises();
    await wrapper.get('[data-upload-action="retry"]').trigger('click');
    await flushPromises();
    expect(tasks).toHaveLength(2);
    tasks[1]!.resolve({ outcome: 'success', response: {} });
    await flushPromises();
    await expect(vm.submit('a')).resolves.toMatchObject([
      { outcome: 'ignored', reason: 'not-ready' },
    ]);
  });

  it('卸载中止活动请求并丢弃排队任务，迟到回调不再发事件', async () => {
    const { vm, wrapper } = create({
      concurrency: 1,
      defaultFileList: [makeFile('a'), makeFile('b')],
    });
    const submitted = vm.submit();
    await flushPromises();
    wrapper.unmount();
    tasks[0]!.options.onProgress?.(80);
    tasks[0]!.options.onUploadUrl?.('http://localhost/files/late');
    await submitted;
    expect(tasks).toHaveLength(1);
    expect(wrapper.emitted('progress')).toBeUndefined();
    expect(wrapper.emitted('success')).toBeUndefined();
  });

  it('字段只读时不恢复或永久取消上传，受控列表不会被内部状态覆盖', async () => {
    const source = { ...makeFile('a'), status: 'paused' as const, percent: 40 };
    const { vm, wrapper } = create({ fileList: [source], readonly: true });
    await expect(vm.resume('a')).resolves.toMatchObject([
      { outcome: 'ignored', reason: 'readonly' },
    ]);
    await expect(vm.cancel('a')).resolves.toMatchObject([{ cancelled: false }]);
    await wrapper.setProps({ readonly: false });
    const resumed = vm.resume('a');
    await flushPromises();
    expect(vm.getFiles()[0]).toMatchObject({ status: 'paused', percent: 40 });
    vm.abort();
    await resumed;
  });

  it.each(['text', 'picture', 'picture-card'] as const)(
    '%s 模式均有可操作的暂停、继续和取消按钮',
    async listType => {
      const { wrapper, vm } = create({ listType });
      const pending = vm.submit();
      await flushPromises();
      await wrapper.get('[data-upload-action="pause"]').trigger('click');
      await pending;
      expect(wrapper.get('[data-upload-action="resume"]').attributes('disabled')).toBeUndefined();
      await wrapper.get('[data-upload-action="cancel"]').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('cancelled')).toHaveLength(1);
    }
  );

  it('没有上传地址时不会错误报告恢复成功，失败详情可直接读取', async () => {
    const { wrapper, vm } = create({
      action: '',
      defaultFileList: [{ ...makeFile('a'), status: 'error', error: '访问被拒绝' }],
    });
    await expect(vm.resume('a')).resolves.toMatchObject([
      { outcome: 'ignored', reason: 'no-action' },
    ]);
    expect(wrapper.emitted('resumed')).toBeUndefined();
    expect(wrapper.get('[role="alert"]').text()).toBe('访问被拒绝');
  });

  it('永久取消期间同 UID 换文件，迟到响应不能清空替换文件', async () => {
    const original = makeFile('a');
    const { wrapper, vm } = create({ fileList: [original] });
    const pending = vm.submit();
    await flushPromises();
    let finish!: (terminated: boolean) => void;
    tasks[0]!.terminate.mockImplementation(
      () => new Promise<boolean>(resolve => (finish = resolve))
    );
    const cancelled = vm.cancel('a');
    await flushPromises();
    const replacement = { ...makeFile('a'), name: 'replacement.txt' };
    await wrapper.setProps({ fileList: [replacement] });
    finish(true);
    await expect(cancelled).resolves.toMatchObject([{ cancelled: false }]);
    await pending;
    expect(vm.getFiles()[0]!.name).toBe('replacement.txt');
    expect(wrapper.emitted('cancelled')).toBeUndefined();
  });
});
