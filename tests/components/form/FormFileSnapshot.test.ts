import { afterEach, describe, expect, it, vi } from 'vitest';
import { File as NativeFile, Blob as NativeBlob } from 'node:buffer';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormInstance, FormItemInstance, FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.unstubAllGlobals();
});

function createField(rule?: FormRule) {
  vi.stubGlobal('Blob', NativeBlob);
  vi.stubGlobal('File', NativeFile);
  const original = new NativeFile(['原始内容'], 'report.txt', { lastModified: 1 });
  const model = reactive({ file: original });
  const form = ref<FormInstance>();
  const item = ref<FormItemInstance>();
  const wrapper = mount({
    render: () =>
      h(ExForm, { ref: form, model }, () =>
        h(ExFormItem, { ref: item, prop: 'file', rules: rule })
      ),
  });
  wrappers.push(wrapper);
  return { model, form, item, wrapper };
}

describe('表单原生文件值的快照与重置', () => {
  it('重置初始文件后，文件名、字节和原生读取方法仍然有效', async () => {
    const { model, form } = createField();
    model.file = new NativeFile(['替换内容'], 'replacement.txt');
    await nextTick();
    form.value!.resetFields();
    await nextTick();
    expect(model.file.name).toBe('report.txt');
    expect(await model.file.text()).toBe('原始内容');
    expect(await model.file.arrayBuffer()).toHaveProperty('byteLength', model.file.size);
  });

  it('同名同大小文件被替换时，旧文件内容校验结果失效', async () => {
    let finish!: () => void;
    const pending = new Promise<void>(resolve => (finish = resolve));
    let validatedText = '';
    const { model, item, wrapper } = createField({
      trigger: 'blur',
      validator: async (_rule, value) => {
        validatedText = await (value as NativeFile).text();
        await pending;
        throw new Error('旧文件不合法');
      },
    });
    const result = item.value!.validate('blur');
    await flushPromises();
    model.file = new NativeFile(['替换内容'], 'report.txt', { lastModified: 1 });
    await nextTick();
    finish();
    await expect(result).resolves.toMatchObject({ outOfDate: true });
    expect(validatedText).toBe('原始内容');
    expect(wrapper.text()).not.toContain('旧文件不合法');
  });
});
