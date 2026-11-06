import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';

describe('日历农历与事件展示', () => {
  it('真实农历依赖显示春节和初一，并支持动态关闭农历与节气', async () => {
    const wrapper = mount(ExCalendar, {
      props: {
        modelValue: new Date(2024, 1, 10),
        mode: 'day',
        showLunar: true,
        showSolarTerm: true,
      },
    });
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(wrapper.text()).toContain('春节');
    await wrapper.setProps({ modelValue: new Date(2024, 1, 11) });
    expect(wrapper.text()).toContain('初二');
    await wrapper.setProps({ modelValue: new Date(2024, 1, 4) });
    expect(wrapper.text()).toContain('立春');
    await wrapper.setProps({ showLunar: false, showSolarTerm: false });
    expect(wrapper.text()).not.toContain('立春');
    wrapper.unmount();
  });

  it('月与周视图限制事件密度，日视图保留全部事件与业务节假日', async () => {
    const date = new Date(2024, 4, 15);
    const events = Array.from({ length: 5 }, (_, index) => ({
      id: index,
      title: `事件${index}`,
      date,
      description: `详情${index}`,
    }));
    const wrapper = mount(ExCalendar, {
      props: {
        modelValue: date,
        mode: 'month',
        events,
        showLunar: true,
        holidays: [{ name: '发布日', date: '05-15' }],
        checkedInDates: [date],
      },
    });
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(wrapper.text()).toContain('发布日');
    expect(wrapper.text()).toContain('+2');
    await wrapper.setProps({ mode: 'week' });
    expect(wrapper.text()).toContain('+3');
    await wrapper.setProps({ mode: 'day' });
    for (const event of events) expect(wrapper.text()).toContain(event.title);
    wrapper.unmount();
  });
});
