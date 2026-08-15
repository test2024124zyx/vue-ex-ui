import { mount } from '@vue/test-utils';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h, nextTick } from 'vue';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';
import type { ExCalendarExposed, CalendarEvent } from '../../../src/components/calendar/types';

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

  it('日视图展示空状态、节假日和事件描述，并支持自定义外观', async () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Review',
        description: 'Release checklist',
        date: new Date(2024, 0, 15),
        type: 'danger',
      },
    ];
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'day',
        modelValue: new Date(2024, 0, 15),
        events,
        holidays: [{ name: '发布日', date: '01-15', type: 'holiday' }],
        showLunar: false,
        showSolarTerm: false,
        fullscreen: true,
        class: { custom: true },
        style: 'color: red',
      },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-calendar--day', 'ex-calendar--fullscreen', 'custom'])
    );
    expect(wrapper.attributes('style')).toContain('color: red');
    expect(wrapper.get('.ex-calendar__day-holiday').text()).toBe('发布日');
    expect(wrapper.get('.ex-calendar__day-event-description').text()).toBe('Release checklist');
    await wrapper.get('.ex-calendar__day-event').trigger('click');
    expect(wrapper.emitted('event-click')?.at(-1)?.[0]).toMatchObject({ id: 'event-1' });

    await wrapper.setProps({ events: [] });
    expect(wrapper.find('.ex-calendar__day-empty').exists()).toBe(true);
  });

  it('周视图处理签到、事件上限、键盘选择和禁用单元格', async () => {
    const date = new Date(2024, 0, 15);
    const events = [1, 2, 3, 4].map(id => ({
      id,
      title: `Event ${id}`,
      date,
      type: id === 1 ? 'success' : undefined,
    })) as CalendarEvent[];
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'week',
        modelValue: date,
        events,
        checkedInDates: [date],
        showLunar: false,
        showSolarTerm: false,
        disabledDate: candidate => candidate.getDate() === 16,
      },
      attachTo: document.body,
    });
    const selected = wrapper.get('.ex-calendar__cell[aria-selected="true"]');

    expect(selected.classes()).toContain('ex-calendar__cell--checked-in');
    expect(wrapper.findAll('.ex-calendar__event')).toHaveLength(2);
    expect(wrapper.get('.ex-calendar__event-more').text()).toBe('+2');
    await selected.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toEqual(date);
    const disabled = wrapper.find('.ex-calendar__cell[aria-disabled="true"]');
    await disabled.trigger('click');
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toEqual(date);
  });

  it('年视图可切换月份，模式按钮发出双向事件，导航方法覆盖所有周期', async () => {
    const wrapper = mount(ExCalendar, {
      props: { mode: 'year', modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    const exposed = wrapper.vm as unknown as ExCalendarExposed;

    expect(wrapper.findAll('.ex-calendar__year-month')).toHaveLength(12);
    await wrapper.findAll('.ex-calendar__year-month')[4].trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:mode')?.at(-1)).toEqual(['month']);
    expect(wrapper.classes()).toContain('ex-calendar--month');

    await wrapper.setProps({ mode: 'day' });
    await nextTick();
    exposed.prevMonth();
    exposed.nextMonth();
    exposed.prevYear();
    exposed.nextYear();
    exposed.goToday();
    expect(wrapper.emitted('month-change')).toBeTruthy();
    expect(wrapper.emitted('year-change')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(exposed.getElement()).toBe(wrapper.element);
  });

  it('键盘方向、Home/End 和翻页导航都会寻找可用日期', async () => {
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'month',
        modelValue: new Date(2024, 0, 15),
        showSolarTerm: false,
        disabledDate: candidate => candidate.getDate() === 16,
      },
      attachTo: document.body,
    });
    const cell = wrapper.get('.ex-calendar__cell[tabindex="0"]');
    for (const key of [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ]) {
      await cell.trigger('keydown', { key });
      await nextTick();
    }
    await cell.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')).toBeTruthy();
    await cell.trigger('keydown', { key: 'Unmapped' });
    expect(wrapper.find('.ex-calendar__grid').exists()).toBe(true);
  });

  it('禁用日期搜索找不到可用目标时保持当前日期', async () => {
    const initial = new Date(2024, 0, 15);
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'month',
        modelValue: initial,
        showSolarTerm: false,
        disabledDate: () => true,
      },
      attachTo: document.body,
    });
    const cell = wrapper.get('.ex-calendar__cell[tabindex="-1"]');
    await cell.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(wrapper.get('.ex-calendar__year').text()).toContain('2024');
  });

  it('受控值、模式和今天按钮同步更新视图', async () => {
    const wrapper = mount(ExCalendar, {
      props: {
        mode: 'month',
        modelValue: null,
        showToday: false,
        showSolarTerm: false,
        ariaLabel: '日期选择',
      },
    });
    expect(wrapper.attributes('aria-label')).toBe('日期选择');
    expect(wrapper.find('.ex-calendar__today-btn').exists()).toBe(false);
    await wrapper.setProps({ modelValue: new Date(2025, 4, 20), mode: 'week' });
    await nextTick();
    expect(wrapper.classes()).toContain('ex-calendar--week');
    expect(wrapper.find('.ex-calendar__week-view').exists()).toBe(true);
  });
});
