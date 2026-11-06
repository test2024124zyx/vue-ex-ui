import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormInstance } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
function track<T extends { unmount(): void }>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

describe('表单重置与错误定位回归', () => {
  it('对象和数组字段反复修改、重置后仍保留挂载时的初值', async () => {
    const model = reactive({ profile: { name: '初始姓名', tags: ['初始标签'] } });
    const wrapper = track(
      mount(ExForm, {
        props: { model },
        slots: { default: () => h(ExFormItem, { prop: 'profile' }) },
      })
    );
    const form = wrapper.vm as unknown as FormInstance;
    for (const name of ['第一次修改', '第二次修改']) {
      model.profile.name = name;
      model.profile.tags.push(name);
      await nextTick();
      form.resetFields();
      await nextTick();
      expect(model.profile).toEqual({ name: '初始姓名', tags: ['初始标签'] });
    }
  });

  it('重置清除错误且不自发重验，后续程序化修改仍执行 change 校验', async () => {
    const model = reactive({ name: '' });
    const wrapper = track(
      mount(ExForm, {
        props: {
          model,
          rules: { name: [{ required: true, trigger: 'change' }] },
          scrollToError: false,
        },
        slots: { default: () => h(ExFormItem, { prop: 'name' }) },
      })
    );
    model.name = '已填写';
    await flushPromises();
    (wrapper.vm as unknown as FormInstance).resetFields();
    await flushPromises();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
    model.name = '再次填写';
    await flushPromises();
    model.name = '';
    await flushPromises();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);
  });

  it.each([false, { behavior: 'auto', block: 'end' }] as const)(
    '校验定位遵守表单滚动配置 %s',
    async scrollIntoViewOptions => {
      const wrapper = track(
        mount(ExForm, {
          props: {
            model: { name: '' },
            rules: { name: [{ required: true }] },
            scrollIntoViewOptions,
          },
          slots: { default: () => h(ExFormItem, { prop: 'name' }) },
        })
      );
      const scroll = vi.fn();
      wrapper.get('[data-field]').element.scrollIntoView = scroll;
      await (wrapper.vm as unknown as FormInstance).validate();
      if (scrollIntoViewOptions === false) expect(scroll).not.toHaveBeenCalled();
      else expect(scroll).toHaveBeenCalledWith(scrollIntoViewOptions);
    }
  );
});
