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
