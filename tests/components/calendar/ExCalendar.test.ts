import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';
import type { ExCalendarExposed } from '../../../src/components/calendar/types';

describe('ExCalendar', () => {
  it('受控值变化与清空时同步更新选中状态', async () => {
    const selected = new Date(2024, 0, 15);
    const wrapper = mount(ExCalendar, {
      props: { modelValue: selected, showSolarTerm: false },
    });

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(1);
    await wrapper.setProps({ modelValue: new Date(2024, 0, 16) });
    expect(wrapper.find('[aria-selected="true"] .ex-calendar__date-number').text()).toBe('16');
    await wrapper.setProps({ modelValue: null });
    await nextTick();

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(0);
  });

  it('从月末切换月份不会跳过目标月份', async () => {
    const wrapper = mount(ExCalendar, {
      props: { modelValue: new Date(2024, 0, 31), showSolarTerm: false },
    });
    const exposed = wrapper.vm as unknown as ExCalendarExposed;

    exposed.nextMonth();
    await nextTick();

    expect(wrapper.emitted('month-change')?.at(-1)).toEqual([2024, 2]);
    expect(wrapper.text()).toContain('2');
  });
});
