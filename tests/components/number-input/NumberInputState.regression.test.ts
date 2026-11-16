import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('数值边界与表单输入事件', () => {
  it.each([
    { initial: 0.1, step: 0.2, expected: 0.3 },
    { initial: 1e-7, step: 2e-7, expected: 3e-7 },
  ])('普通模式精确提交 $initial 加 $step', async ({ initial, step, expected }) => {
    const wrapper = mount(ExNumberInput, { props: { modelValue: initial, step } });
    wrappers.push(wrapper);
    await wrapper.get('.ex-number-input__button--increase').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[expected]]);
    expect(wrapper.emitted('change')).toEqual([[expected, initial]]);
    await wrapper.setProps({ modelValue: expected });
    await wrapper.get('.ex-number-input__button--decrease').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([initial]);
  });

  it('严格步长模式也按当前值加减，写回和失焦时保留步进结果', async () => {
    const wrapper = mount(ExNumberInput, {
      props: { modelValue: 0.1, min: 0, step: 0.2, strictStep: true },
    });
    wrappers.push(wrapper);
    const input = wrapper.get('input');
    expect(input.element.value).toBe('0.1');
    await wrapper.get('.ex-number-input__button--increase').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.3]);
    await wrapper.setProps({ modelValue: 0.3 });
    expect(input.element.value).toBe('0.3');
    await input.trigger('focus');
    await input.trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.5]);
    await wrapper.setProps({ modelValue: 0.5 });
    await input.trigger('change');
    await input.trigger('blur');
    expect(input.element.value).toBe('0.5');
    expect(wrapper.emitted('update:modelValue')).toEqual([[0.3], [0.5]]);
    await wrapper.get('.ex-number-input__button--decrease').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.3]);
  });

  it.each([
    { initial: 4.96, expected: 5, min: 0, max: 5, direction: 'increase', key: 'ArrowUp' },
    { initial: 0.04, expected: 0, min: 0, max: 5, direction: 'decrease', key: 'ArrowDown' },
  ] as const)(
    '格式化显示已到端点时仍可提交端点：$initial → $expected',
    async ({ initial, expected, min, max, direction, key }) => {
      const wrapper = mount(ExNumberInput, {
        props: { modelValue: initial, min, max, precision: 1 },
      });
      wrappers.push(wrapper);
      const input = wrapper.get('input');
      expect(Number(input.element.value)).toBe(expected);
      const button = wrapper.get<HTMLButtonElement>(`.ex-number-input__button--${direction}`);
      expect(button.element.disabled).toBe(false);
      await button.trigger('click');
      await input.trigger('keydown', { key });
      wrapper.vm[direction]();
      expect(wrapper.emitted('update:modelValue')).toEqual([[expected], [expected], [expected]]);
    }
  );

  it.each([
    { value: 0.3, text: '0.30000000000000000000' },
    { value: -1e-7, text: '-0.00000010000000000000' },
  ])('高精度显示使用十进制有效数字并补零：$value', ({ value, text }) => {
    const wrapper = mount(ExNumberInput, { props: { modelValue: value, precision: 20 } });
    wrappers.push(wrapper);
    expect(wrapper.get('input').element.value).toBe(text);
  });

  it('方向键和大步长基于焦点内的有效草稿，即使模型已到达上限', async () => {
    const wrapper = mount(ExNumberInput, {
      props: { modelValue: 5, min: 0, max: 5, step: 0.2, strictStep: true },
    });
    wrappers.push(wrapper);
    const input = wrapper.get('input');
    await input.trigger('focus');
    input.element.value = '0.1';
    await input.trigger('input');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await input.trigger('keydown', { key: 'ArrowUp', shiftKey: true });
    expect(wrapper.emitted('update:modelValue')).toEqual([[2.1]]);
    await wrapper.setProps({ modelValue: 2.1 });
    await input.trigger('keydown', { key: 'PageDown' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.1]);
  });

  it('显示补齐指定精度，模型为数字，边界值超出显示精度时保持准确', async () => {
    const wrapper = mount(ExNumberInput, { props: { modelValue: 1.5, precision: 2 } });
    wrappers.push(wrapper);
    const input = wrapper.get('input');
    expect(input.element.value).toBe('1.50');
    await input.setValue('1.005');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.01]);
    await wrapper.setProps({ modelValue: 0.125, max: 0.125 });
    expect(input.element.value).toBe('0.125');
  });

  it.each([1e308, -1e308, Number.MAX_VALUE])(
    '精度舍入保留可表示的大数 %s，不生成 Infinity',
    async value => {
      const wrapper = mount(ExNumberInput, { props: { modelValue: value, precision: 2 } });
      wrappers.push(wrapper);
      expect(Number(wrapper.get('input').element.value)).toBe(value);
      const text = `${value < 0 ? '-' : ''}${'9'.repeat(307)}`;
      await wrapper.get('input').setValue(text);
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([Number(text)]);
    }
  );

  it.each([
    { min: -1, max: 0.15, value: '0.15' },
    { min: 0.16, max: 1, value: '0.16' },
    { min: -0.15, max: -0.11, value: '-0.15' },
  ])('精度舍入不突破显式范围：%j', async ({ min, max, value }) => {
    const wrapper = mount(ExNumberInput, { props: { min, max, precision: 1 } });
    wrappers.push(wrapper);
    await wrapper.get('input').setValue(value);
    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as number;
    expect(emitted).toBeGreaterThanOrEqual(min);
    expect(emitted).toBeLessThanOrEqual(max);
    expect(Number(wrapper.get('input').element.value)).toBe(emitted);
  });

  it('动态精度立即更新非编辑显示且不发出用户修改事件', async () => {
    const wrapper = mount(ExNumberInput, { props: { modelValue: 1.234, precision: 2 } });
    wrappers.push(wrapper);
    await wrapper.setProps({ precision: 1 });
    expect(wrapper.get('input').element.value).toBe('1.2');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('真实 Form 的 input 规则收到输入通知并读取已提交的数值', async () => {
    const validator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) => done());
    const model = reactive({ count: 1 });
    const wrapper = mount(ExForm, {
      props: { model, rules: { count: [{ validator, trigger: 'input' }] } },
      slots: {
        default: () =>
          h(ExFormItem, { prop: 'count' }, () =>
            h(ExNumberInput, {
              modelValue: model.count,
              'onUpdate:modelValue': value => (model.count = value ?? 0),
            })
          ),
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').setValue('2');
    await flushPromises();
    expect(validator).toHaveBeenCalled();
    expect(validator.mock.calls.at(-1)?.[1]).toBe(2);
  });
});
