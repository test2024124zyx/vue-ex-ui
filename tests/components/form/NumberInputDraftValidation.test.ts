import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';
import type { FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

const createForm = (rule: FormRule) => {
  const model = reactive({ count: 1 as number | null });
  const wrapper = mount(ExForm, {
    props: { model, rules: { count: [rule] } },
    slots: {
      default: () =>
        h(ExFormItem, { prop: 'count' }, () =>
          h(ExNumberInput, {
            modelValue: model.count,
            'onUpdate:modelValue': value => (model.count = value),
          })
        ),
    },
  });
  wrappers.push(wrapper);
  return { wrapper, model };
};

describe('NumberInput 输入草稿校验', () => {
  it('只触发 input 时校验当前数值，不提前提交 change 模型', async () => {
    const validator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) => done());
    const { wrapper, model } = createForm({ trigger: 'input', validator });
    const input = wrapper.get('input');
    input.element.value = '2';
    await input.trigger('input');
    await flushPromises();
    expect(validator.mock.calls.at(-1)?.[1]).toBe(2);
    expect(model.count).toBe(1);
  });

  it('空输入立即触发必填错误，错误事件携带被校验的空值', async () => {
    const { wrapper } = createForm({ trigger: 'input', required: true, message: '请输入数量' });
    const input = wrapper.get('input');
    input.element.value = '';
    await input.trigger('input');
    await flushPromises();
    expect(wrapper.text()).toContain('请输入数量');
    expect(wrapper.emitted('field-validate')?.at(-1)?.[1]).toEqual({
      valid: false,
      errors: [{ field: 'count', message: '请输入数量', value: null }],
    });
  });

  it('失焦校验使用已确认模型，不能沿用被父级拒绝的输入草稿', async () => {
    const validator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) => done());
    const { wrapper } = createForm({ trigger: ['input', 'blur'], validator });
    const input = wrapper.get('input');
    input.element.value = '2';
    await input.trigger('input');
    await flushPromises();
    expect(validator.mock.calls.at(-1)?.[1]).toBe(2);
    await input.trigger('blur');
    await flushPromises();
    expect(validator.mock.calls.at(-1)?.[1]).toBe(1);
  });

  it('较早的异步草稿验证不能覆盖较新的输入结果', async () => {
    const completions: Array<(error?: string) => void> = [];
    const { wrapper } = createForm({
      trigger: 'input',
      validator: (_rule, _value, done) => {
        completions.push(done);
      },
    });
    const input = wrapper.get('input');
    input.element.value = '2';
    await input.trigger('input');
    await flushPromises();
    input.element.value = '3';
    await input.trigger('input');
    await flushPromises();
    completions[1]!();
    await flushPromises();
    completions[0]!('旧草稿错误');
    await flushPromises();
    expect(wrapper.text()).not.toContain('旧草稿错误');
  });
});
