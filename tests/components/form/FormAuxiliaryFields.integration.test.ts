import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';
import type { ExFileUploadExposed, UploadFile } from '../../../src/components/file-upload/types';
import { FORM_ITEM_INJECTION_KEY } from '../../../src/components/form/use-form-item';

const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function createFields(uploadProps: Record<string, unknown> = {}) {
  const state = reactive({ disabled: false, readonly: false });
  const wrapper = mount({
    render: () =>
      h(
        ExForm,
        { ...state, size: 'large' },
        {
          default: () => [
            h(
              ExFormItem,
              { label: '验证码', error: '验证码错误' },
              {
                default: () => h(ExVerificationCode, { autoSubmit: true, autoSubmitDelay: 100 }),
              }
            ),
            h(
              ExFormItem,
              { label: '附件', error: '附件错误' },
              {
                default: () => h(ExFileUpload, { autoUpload: false, ...uploadProps }),
              }
            ),
          ],
        }
      ),
  });
  wrappers.push(wrapper);
  return { wrapper, state };
}

const makeUpload = (): UploadFile => {
  const raw = new File(['内容'], '附件.txt', { type: 'text/plain' });
  return {
    uid: 'attachment',
    name: raw.name,
    size: raw.size,
    type: raw.type,
    raw,
    status: 'ready',
  };
};

async function selectFile(wrapper: VueWrapper) {
  const input = wrapper.get('input[type="file"]');
  Object.defineProperty(input.element, 'files', { configurable: true, value: [makeUpload().raw] });
  await input.trigger('change');
  await flushPromises();
}

describe('验证码和附件的真实表单集成', () => {
  it('验证码输入和附件分组关联 FormItem 标签及错误', () => {
    const { wrapper } = createFields();
    const fields = wrapper.findAllComponents(ExFormItem);
    for (const [index, selector] of ['input[type="text"]', '.ex-file-upload'].entries()) {
      const item = fields[index]!;
      const control = item.get(selector);
      expect(control.attributes('aria-labelledby')).toBe(
        item.get('.ex-form-item__label').attributes('id')
      );
      expect(control.attributes('aria-describedby')).toContain(
        item.get('.ex-form-item__error').attributes('id')
      );
      expect(control.attributes('aria-invalid')).toBe('true');
    }
    expect(wrapper.find('.ex-verification-code--large').exists()).toBe(true);
  });

  it.each(['disabled', 'readonly'] as const)('继承 %s 后阻止输入、选文件及显式上传', async mode => {
    const action = vi.fn(() => '/upload');
    const { wrapper, state } = createFields({ defaultFileList: [makeUpload()], action });
    state[mode] = true;
    await nextTick();
    const input = wrapper.get('input[type="text"]');
    expect(input.attributes(mode)).toBeDefined();
    await input.setValue('123456');
    expect(wrapper.findComponent(ExVerificationCode).emitted('update:modelValue')).toBeUndefined();
    const upload = wrapper.findComponent(ExFileUpload);
    const api = upload.vm as unknown as ExFileUploadExposed;
    expect(api.openFileDialog()).toBe(false);
    await selectFile(wrapper);
    expect(upload.emitted('added')).toBeUndefined();
    expect(await api.submit()).toEqual([{ uid: 'attachment', outcome: 'ignored', reason: mode }]);
    expect(action).not.toHaveBeenCalled();
    api.requestClear();
    expect(api.getFiles()).toHaveLength(1);
  });

  it('验证码等待自动提交时 Form 切换只读取消提交', async () => {
    vi.useFakeTimers();
    const { wrapper, state } = createFields();
    const code = wrapper.findComponent(ExVerificationCode);
    await code.get('input').setValue('123456');
    state.readonly = true;
    await nextTick();
    vi.advanceTimersByTime(200);
    expect(code.emitted('submit')).toBeUndefined();
  });

  it('异步文件守卫等待期间变为只读后不加入列表，恢复后可以再次选择', async () => {
    let resolveGuard!: () => void;
    const beforeAdd = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveGuard = resolve;
        })
    );
    const { wrapper, state } = createFields({ beforeAdd });
    await selectFile(wrapper);
    state.readonly = true;
    await nextTick();
    resolveGuard();
    await flushPromises();
    const upload = wrapper.findComponent(ExFileUpload);
    expect(upload.emitted('added')).toBeUndefined();
    state.readonly = false;
    await nextTick();
    await selectFile(wrapper);
    resolveGuard();
    await flushPromises();
    expect(upload.emitted('added')).toHaveLength(1);
  });

  it('只读附件允许预览，禁止移除', async () => {
    const { wrapper, state } = createFields({ defaultFileList: [makeUpload()] });
    state.readonly = true;
    await nextTick();
    const upload = wrapper.findComponent(ExFileUpload);
    await upload.get('.ex-file-upload__list-item-name').trigger('click');
    await upload.get('.ex-file-upload__list-item-action').trigger('click');
    expect(upload.emitted('preview-request')).toHaveLength(1);
    expect(upload.emitted('remove-request')).toBeUndefined();
  });

  it('已失效的文件守卫晚到拒绝不会触发业务错误事件', async () => {
    let rejectGuard!: (error: Error) => void;
    const { wrapper, state } = createFields({
      beforeAdd: () =>
        new Promise<void>((_, reject) => {
          rejectGuard = reject;
        }),
    });
    await selectFile(wrapper);
    state.readonly = true;
    await nextTick();
    state.readonly = false;
    await nextTick();
    rejectGuard(new Error('旧选择已取消'));
    await flushPromises();
    expect(wrapper.findComponent(ExFileUpload).emitted('rejected')).toBeUndefined();
  });

  describe.each(['action', 'headers', 'data'] as const)('等待上传 %s 配置', configuration => {
    it.each(['disabled', 'readonly'] as const)('继承 %s 时中止待发送任务', async mode => {
      const send = vi.fn();
      class Request {
        upload = { addEventListener: vi.fn() };
        addEventListener = vi.fn();
        open = vi.fn();
        setRequestHeader = vi.fn();
        abort = vi.fn();
        send = send;
      }
      vi.stubGlobal('XMLHttpRequest', Request);
      let resolveConfiguration!: (value: string | Record<string, string>) => void;
      const delayed = new Promise<string | Record<string, string>>(resolve => {
        resolveConfiguration = resolve;
      });
      const { wrapper, state } = createFields({
        action: '/upload',
        defaultFileList: [makeUpload()],
        [configuration]: () => delayed,
      });
      const upload = wrapper.findComponent(ExFileUpload);
      const api = upload.vm as unknown as ExFileUploadExposed;
      const pending = api.submit();
      await flushPromises();
      state[mode] = true;
      await nextTick();
      resolveConfiguration(configuration === 'action' ? '/upload' : {});
      await flushPromises();
      expect(send).not.toHaveBeenCalled();
      expect(await pending).toEqual([{ uid: 'attachment', outcome: 'aborted' }]);
      expect(api.getFiles()[0]?.status).toBe('ready');
      expect(upload.emitted('aborted')?.[0]?.[2]).toBe(mode);
    });
  });

  it('输入、附件增删和整体失焦进入 FormItem 对应校验触发器', async () => {
    const context = { onFieldInput: vi.fn(), onFieldChange: vi.fn(), onFieldBlur: vi.fn() };
    const code = mount(ExVerificationCode, {
      global: { provide: { [FORM_ITEM_INJECTION_KEY as symbol]: context } },
    });
    wrappers.push(code);
    await code.get('input').setValue('123');
    await code.get('input').trigger('blur');
    expect(context.onFieldInput).toHaveBeenCalledOnce();
    expect(context.onFieldChange).toHaveBeenCalledOnce();
    expect(context.onFieldBlur).toHaveBeenCalledOnce();
    context.onFieldChange.mockClear();
    context.onFieldBlur.mockClear();
    const upload = mount(ExFileUpload, {
      props: { autoUpload: false },
      global: { provide: { [FORM_ITEM_INJECTION_KEY as symbol]: context } },
    });
    wrappers.push(upload);
    await selectFile(upload);
    expect(context.onFieldChange).toHaveBeenCalledOnce();
    await upload.get('.ex-file-upload__list-item-action').trigger('click');
    expect(context.onFieldChange).toHaveBeenCalledTimes(2);
    await upload.get('.ex-file-upload').trigger('focusout');
    expect(context.onFieldBlur).toHaveBeenCalledOnce();
  });
});
