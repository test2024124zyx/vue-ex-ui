import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import { useFormItem } from '../../../src/components/form/use-form-item';
import type { FormInstance, FormItemInstance, FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('字段校验快照的结构值与调度身份', () => {
  it.each([true, false])('结构值确认相同=%s 时保留或作废正在执行的 input 校验', async equal => {
    const model = reactive({ value: { tags: ['初始'] } });
    let finish: ((error?: string) => void) | undefined;
    const rule: FormRule = {
      trigger: 'input',
      validator: (_rule, _value, done) => { finish = done; },
    };
    const Field = defineComponent({
      setup() {
        const field = useFormItem();
        return () => h('button', {
          type: 'button',
          onClick: () => field?.onFieldInput?.({ value: { tags: ['甲', '乙'] } }),
          onBlur: () => field?.onFieldBlur(),
        }, '编辑标签');
      },
    });
    const wrapper = mount(ExForm, {
      props: { model, rules: { value: [rule] } },
      slots: { default: () => h(ExFormItem, { prop: 'value' }, () => h(Field)) },
    });
    wrappers.push(wrapper);
    await wrapper.get('button').trigger('click');
    await flushPromises();
    model.value = { tags: equal ? ['甲', '乙'] : ['其他'] };
    await wrapper.get('button').trigger('blur');
    await flushPromises();
    finish!('标签组合不合法');
    await flushPromises();
    expect(wrapper.text().includes('标签组合不合法')).toBe(equal);
  });

  it('深层原地修改也使旧模型校验作废，不依赖对象引用变化', async () => {
    const model = reactive({ value: { tags: ['甲'] } });
    const finishes: Array<(error?: string) => void> = [];
    const wrapper = mount(ExForm, {
      props: {
        model,
        rules: { value: [{ trigger: 'blur', validator: (_rule, _value, done) => { finishes.push(done); } }] },
      },
      slots: { default: () => h(ExFormItem, { prop: 'value' }) },
    });
    wrappers.push(wrapper);
    const item = wrapper.findComponent(ExFormItem);
    const result = (item.vm as unknown as FormItemInstance).validate('blur');
    model.value.tags.push('乙');
    await nextTick();
    finishes[0]!('旧对象错误');
    await expect(result).resolves.toMatchObject({ outOfDate: true });
    expect(wrapper.text()).not.toContain('旧对象错误');
  });

  it.each(['reset', 'clear'] as const)('%s 取消排队校验后，新输入只由新的调度执行一次', async action => {
    const model = reactive({ value: 1 });
    const form = ref<FormInstance>();
    const validated: unknown[] = [];
    let requested = 2;
    const Field = defineComponent({
      setup() {
        const field = useFormItem();
        return () => h('button', {
          type: 'button',
          onClick: () => field?.onFieldInput?.({ value: requested }),
        }, '输入');
      },
    });
    const rules: Record<string, FormRule[]> = { value: [{
      trigger: 'input',
      validator: (_rule, value, done) => { validated.push(value); done(); },
    }] };
    const wrapper = mount({ render: () => h(ExForm, { ref: form, model, rules }, () =>
      h(ExFormItem, { prop: 'value' }, () => h(Field))) });
    wrappers.push(wrapper);
    wrapper.get('button').element.click();
    if (action === 'reset') form.value!.resetFields();
    else form.value!.clearValidate();
    requested = 3;
    wrapper.get('button').element.click();
    await flushPromises();
    expect(validated).toEqual([3]);
  });

  it('卸载后的公开 validate 引用不能重新启动校验或产生事件', async () => {
    let validations = 0;
    const wrapper = mount(ExForm, {
      props: { model: { value: 1 }, rules: { value: [{ validator: (_rule, _value, done) => { validations++; done(); } }] } },
      slots: { default: () => h(ExFormItem, { prop: 'value' }) },
    });
    const item = wrapper.findComponent(ExFormItem).vm as unknown as FormItemInstance;
    wrapper.unmount();
    await expect(item.validate()).resolves.toMatchObject({ outOfDate: true });
    expect(validations).toBe(0);
  });
});
