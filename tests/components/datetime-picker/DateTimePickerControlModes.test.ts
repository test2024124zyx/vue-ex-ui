import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, ref } from 'vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import type { DateTimePickerValue } from '../../../src/components/datetime-picker/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('日期选择器确认值与编辑草稿', () => {
  it('父级拒绝选择和清空时，输入框始终显示已确认值', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { modelValue: new Date(2026, 9, 15), teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-date="2026-10-20"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(new Date(2026, 9, 20));
    expect(wrapper.get('input').element.value).toBe('2026-10-15');
    await wrapper.get('.ex-datetime-picker__clear').trigger('click');
    expect(wrapper.get('input').element.value).toBe('2026-10-15');
    expect(wrapper.find('.ex-datetime-picker__clear').exists()).toBe(true);
  });

  it('未确认的日期时间草稿不提前改变输入框，取消后恢复原值', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { modelValue: new Date(2026, 9, 15, 12), type: 'datetime', teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-date="2026-10-20"]').trigger('click');
    expect(wrapper.get('input').element.value).toBe('2026-10-15 12:00:00');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await wrapper.get('input').trigger('keydown', { key: 'Escape' });
    expect(wrapper.get('input').element.value).toBe('2026-10-15 12:00:00');
  });

  it('父级转换回写后，以转换后的值展示并从该值继续编辑', async () => {
    const value = ref<DateTimePickerValue>(new Date(2026, 9, 15));
    const wrapper = mount({
      render: () =>
        h(ExDateTimePicker, {
          modelValue: value.value,
          teleported: false,
          'onUpdate:modelValue': () => (value.value = new Date(2026, 9, 21)),
        }),
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-date="2026-10-20"]').trigger('click');
    expect(wrapper.get('input').element.value).toBe('2026-10-21');
    await wrapper.get('input').trigger('click');
    expect(wrapper.get('[data-date="2026-10-21"]').classes()).toContain(
      'ex-datetime-picker__day--selected'
    );
  });

  it('解除受控保留最后确认值，非受控提交在重新打开和清空后保持一致', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { modelValue: new Date(2026, 9, 15), teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.setProps({ modelValue: undefined });
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-date="2026-10-20"]').trigger('click');
    expect(wrapper.get('input').element.value).toBe('2026-10-20');
    await wrapper.get('input').trigger('click');
    expect(wrapper.get('input').element.value).toBe('2026-10-20');
    await wrapper.get('.ex-datetime-picker__clear').trigger('click');
    expect(wrapper.get('input').element.value).toBe('');
  });

  it('显式 null 保持受控空值，范围选择不泄漏半成品或被拒绝的结果', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { modelValue: null, type: 'daterange', teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    const days = wrapper.findAll('.ex-datetime-picker__day:not([disabled])');
    await days[10]!.trigger('click');
    expect(wrapper.get('input').element.value).toBe('');
    await days[15]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(2);
    expect(wrapper.get('input').element.value).toBe('');
    expect(wrapper.find('.ex-datetime-picker__clear').exists()).toBe(false);
  });
});
