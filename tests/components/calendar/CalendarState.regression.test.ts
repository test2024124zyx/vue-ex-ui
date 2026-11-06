import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';
import type { ExCalendarExposed } from '../../../src/components/calendar/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('日历日期导航和网格语义', () => {
  it('公开翻月和翻年后保留唯一可用键盘入口，动态禁用会迁移入口', async () => {
    const wrapper = mount(ExCalendar, {
      props: { modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    wrappers.push(wrapper);
    const api = wrapper.vm as unknown as ExCalendarExposed;
    for (const navigate of [api.nextMonth, api.prevMonth, api.nextYear, api.prevYear]) {
      navigate();
      await nextTick();
      expect(wrapper.findAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    }
    const oldDate = Number(wrapper.get('[role="gridcell"][tabindex="0"]').attributes('data-date'));
    await wrapper.setProps({ disabledDate: date => date.getTime() === oldDate });
    const current = wrapper.get('[role="gridcell"][tabindex="0"]');
    expect(current.attributes('data-date')).not.toBe(String(oldDate));
    expect(current.attributes('aria-disabled')).toBe('false');
  });

  it.each([
    ['PageDown', new Date(2024, 0, 31), new Date(2024, 1, 29)],
    ['PageUp', new Date(2024, 2, 31), new Date(2024, 1, 29)],
  ] as const)('%s 月末导航限制在相邻月份', async (key, start, end) => {
    const wrapper = mount(ExCalendar, {
      props: { modelValue: start, showSolarTerm: false },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="gridcell"][tabindex="0"]').trigger('keydown', { key });
    expect(wrapper.get('[role="gridcell"][tabindex="0"]').attributes('data-date')).toBe(
      String(end.getTime())
    );
    expect(document.activeElement).toBe(wrapper.get('[role="gridcell"][tabindex="0"]').element);
  });

  it('今天操作不能选择禁用日期', async () => {
    const wrapper = mount(ExCalendar, {
      props: { modelValue: new Date(2024, 0, 15), showSolarTerm: false, disabledDate: () => true },
    });
    wrappers.push(wrapper);
    await wrapper.get('.ex-calendar__today-btn').trigger('click');
    (wrapper.vm as unknown as ExCalendarExposed).goToday();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it.each(['month', 'week'] as const)('%s 网格为日期单元格提供七列行结构', mode => {
    const wrapper = mount(ExCalendar, { props: { mode, showSolarTerm: false } });
    wrappers.push(wrapper);
    const rows = wrapper.findAll('[role="grid"] > [role="row"]');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.findAll(':scope > [role="gridcell"]').length === 7)).toBe(true);
    expect(wrapper.findAll('[role="grid"] > [role="gridcell"]')).toHaveLength(0);
  });
});
