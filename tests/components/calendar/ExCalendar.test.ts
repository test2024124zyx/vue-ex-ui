import { mount } from '@vue/test-utils';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h, nextTick } from 'vue';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';
import type { ExCalendarExposed } from '../../../src/components/calendar/types';

describe('ExCalendar', () => {
  it('未提供日期时服务端输出不随系统时钟变化', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2024, 11, 31, 23, 59, 59));
      const firstHtml = await renderToString(
        createSSRApp({ render: () => h(ExCalendar, { showLunar: false, showSolarTerm: false }) })
      );
      vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 1));
      const secondHtml = await renderToString(
        createSSRApp({ render: () => h(ExCalendar, { showLunar: false, showSolarTerm: false }) })
      );

      expect(firstHtml).toBe(secondHtml);
      expect(firstHtml).toContain('2000');
    } finally {
      vi.useRealTimers();
    }
  });

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

  it('年视图周期箭头使用年份标签且月份可以通过键盘操作', async () => {
    const wrapper = mount(ExCalendar, {
      props: { mode: 'year', modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    const navButtons = wrapper.findAll('.ex-calendar__nav-btn');

    expect(navButtons[1].attributes('aria-label')).toBe(navButtons[0].attributes('aria-label'));
    expect(navButtons[2].attributes('aria-label')).toBe(navButtons[3].attributes('aria-label'));
    const month = wrapper.findAll('.ex-calendar__year-month')[1];
    expect(month.element.tagName).toBe('BUTTON');

    await month.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('mode-change')?.at(-1)?.[0]).toBe('month');
  });

  it('模式切换按钮暴露 aria-pressed 状态', () => {
    const wrapper = mount(ExCalendar, {
      props: { mode: 'week', modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    const buttons = wrapper.findAll('.ex-calendar__mode-btn');

    expect(buttons.filter(button => button.attributes('aria-pressed') === 'true')).toHaveLength(1);
    expect(buttons[1].attributes('aria-pressed')).toBe('true');
  });

  it('日期网格使用单一 roving tabindex 并支持方向键移动焦点', async () => {
    const wrapper = mount(ExCalendar, {
      props: { mode: 'month', modelValue: new Date(2024, 0, 15), showSolarTerm: false },
      attachTo: document.body,
    });
    const grid = wrapper.get('.ex-calendar__grid');
    expect(grid.attributes('role')).toBe('grid');

    const focusable = wrapper.findAll('.ex-calendar__cell[tabindex="0"]');
    expect(focusable).toHaveLength(1);
    expect(focusable[0].attributes('role')).toBe('gridcell');
    await focusable[0].trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    const nextFocusable = wrapper.findAll('.ex-calendar__cell[tabindex="0"]');
    expect(nextFocusable).toHaveLength(1);
    expect(document.activeElement).toBe(nextFocusable[0].element);
  });

  it('键盘导航可以跨过超过六周的连续禁用日期', async () => {
    const selected = new Date(2024, 0, 15);
    const disabledThrough = new Date(2024, 2, 15);
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'month',
        modelValue: selected,
        showSolarTerm: false,
        disabledDate: (date: Date) => date > selected && date <= disabledThrough,
      },
      attachTo: document.body,
    });
    const initial = wrapper.get('.ex-calendar__cell[tabindex="0"]');

    await initial.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    const focused = wrapper.get('.ex-calendar__cell[tabindex="0"]');
    expect(focused.attributes('aria-disabled')).toBe('false');
    expect(focused.get('.ex-calendar__date-number').text()).toBe('16');
    expect(document.activeElement).toBe(focused.element);
  });

  it('搜索范围内没有可用日期时保留原有 roving 焦点', async () => {
    const selected = new Date(2024, 0, 15);
    const selectedTimestamp = selected.setHours(0, 0, 0, 0);
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'month',
        modelValue: new Date(selectedTimestamp),
        showSolarTerm: false,
        disabledDate: (date: Date) => {
          const candidate = new Date(date);
          candidate.setHours(0, 0, 0, 0);
          return candidate.getTime() !== selectedTimestamp;
        },
      },
      attachTo: document.body,
    });
    const initial = wrapper.get('.ex-calendar__cell[tabindex="0"]');
    const initialDate = initial.attributes('data-date');
    (initial.element as HTMLElement).focus();

    await initial.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    const focusedCells = wrapper.findAll('.ex-calendar__cell[tabindex="0"]');
    expect(focusedCells).toHaveLength(1);
    expect(focusedCells[0].attributes('data-date')).toBe(initialDate);
    expect(focusedCells[0].attributes('aria-disabled')).toBe('false');
    expect(document.activeElement).toBe(focusedCells[0].element);
  });

  it('日程条目可以通过 Enter 触发 event-click', async () => {
    const date = new Date(2024, 0, 15);
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'day',
        modelValue: date,
        showSolarTerm: false,
        events: [{ id: 'event-1', title: 'Review', date }],
      },
    });
    const event = wrapper.get('.ex-calendar__day-event');

    expect(event.element.tagName).toBe('BUTTON');
    await event.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('event-click')?.at(-1)?.[0]).toMatchObject({ id: 'event-1' });
  });
});
