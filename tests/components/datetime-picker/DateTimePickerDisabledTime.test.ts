import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('日期时间的独立时间约束', () => {
  it('禁用小时阻止确认，修改到合法时间后可以提交', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: {
        modelValue: new Date(2026, 9, 15, 9),
        type: 'datetime',
        teleported: false,
        disabledTime: () => ({ disabledHours: () => [9] }),
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    expect(wrapper.get('.ex-datetime-picker__confirm-btn').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    await wrapper.get('[data-time-part="hour"]').setValue('10');
    await wrapper.get('.ex-datetime-picker__confirm-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(new Date(2026, 9, 15, 10));
  });

  it('分钟与秒约束读取对应小时、分钟，动态规则立即重新校验', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: {
        modelValue: new Date(2026, 9, 15, 9, 30, 20),
        type: 'datetime',
        teleported: false,
        disabledTime: () => ({ disabledMinutes: (hour: number) => (hour === 9 ? [30] : []) }),
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    expect(wrapper.get('.ex-datetime-picker__confirm-btn').attributes('disabled')).toBeDefined();
    await wrapper.setProps({
      disabledTime: () => ({
        disabledSeconds: (hour: number, minute: number) =>
          hour === 9 && minute === 30 ? [20] : [],
      }),
    });
    expect(wrapper.get('.ex-datetime-picker__confirm-btn').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-time-part="second"]').setValue('21');
    expect(wrapper.get('.ex-datetime-picker__confirm-btn').attributes('disabled')).toBeUndefined();
  });

  it('范围端点独立校验，规则收到的日期副本不能污染待提交值', async () => {
    const calls: string[] = [];
    const wrapper = mount(ExDateTimePicker, {
      props: {
        modelValue: [new Date(2026, 9, 15, 9), new Date(2026, 9, 16, 18)] as [Date, Date],
        type: 'datetimerange',
        teleported: false,
        disabledTime: (date: Date, endpoint: 'start' | 'end') => {
          calls.push(endpoint);
          date.setFullYear(2000);
          return { disabledHours: () => (endpoint === 'end' ? [18] : []) };
        },
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    expect(wrapper.get('.ex-datetime-picker__confirm-btn').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-time-part="end-hour"]').setValue('19');
    await wrapper.get('.ex-datetime-picker__confirm-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      new Date(2026, 9, 15, 9),
      new Date(2026, 9, 16, 19),
    ]);
    expect(calls).toContain('start');
    expect(calls).toContain('end');
  });

  it('纯日期与年月周模式不调用时间约束', async () => {
    const disabledTime = vi.fn(() => ({ disabledHours: () => [0] }));
    const wrapper = mount(ExDateTimePicker, {
      props: {
        modelValue: new Date(2026, 9, 15),
        type: 'month',
        showTime: true,
        teleported: false,
        disabledTime,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-period="2026-11"]').trigger('click');
    expect(disabledTime).not.toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(new Date(2026, 10, 1));
  });
});
