import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h, nextTick } from 'vue';
import ExCalendar from '../../../src/components/calendar/ExCalendar.vue';
import type { ExCalendarExposed } from '../../../src/components/calendar/types';

const wrappers: Array<{ unmount(): void }> = [];
const referenceToday = new Date(2025, 4, 15, 12);
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(referenceToday);
});
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function expectEmptyCurrentMonth(root: Element, today: Date) {
  expect(root.querySelector('.ex-calendar__year')?.textContent).toContain(
    String(today.getFullYear())
  );
  expect(root.querySelector('.ex-calendar__month')?.textContent).toContain(
    String(today.getMonth() + 1)
  );
  expect(root.querySelectorAll('[aria-selected="true"]')).toHaveLength(0);
  const timestamp = new Date(today).setHours(0, 0, 0, 0);
  expect(root.querySelector('.ex-calendar__cell--today')?.getAttribute('data-date')).toBe(
    String(timestamp)
  );
}

describe('Calendar 空值视图锚点与严格受控', () => {
  it.each([null, undefined])('首次空值 %s 挂载到本月且不自动选择', async modelValue => {
    const wrapper = mount(ExCalendar, { props: { modelValue, showSolarTerm: false } });
    wrappers.push(wrapper);
    await nextTick();
    expectEmptyCurrentMonth(wrapper.element, referenceToday);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('date-click')).toBeUndefined();
  });

  it.each([false, true])('后续清空回本月且无选择，清空前浏览其他月份：%s', async browse => {
    const wrapper = mount(ExCalendar, {
      props: { modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    wrappers.push(wrapper);
    if (browse) {
      (wrapper.vm as unknown as ExCalendarExposed).nextMonth();
      await nextTick();
    }
    await wrapper.setProps({ modelValue: null });
    expectEmptyCurrentMonth(wrapper.element, referenceToday);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('跨年后再次清空读取当前时钟，刷新今天标记与键盘入口', async () => {
    vi.setSystemTime(new Date(2024, 11, 31, 23, 59));
    const wrapper = mount(ExCalendar, {
      props: { modelValue: new Date(2024, 0, 15), showSolarTerm: false },
    });
    wrappers.push(wrapper);
    await wrapper.setProps({ modelValue: null });
    expectEmptyCurrentMonth(wrapper.element, new Date());
    await wrapper.setProps({ modelValue: new Date(2024, 0, 15) });
    vi.setSystemTime(new Date(2025, 0, 1, 0, 1));
    await wrapper.setProps({ modelValue: null });
    expectEmptyCurrentMonth(wrapper.element, new Date());
    expect(wrapper.get('[role="gridcell"][tabindex="0"]').attributes('data-date')).toBe(
      String(new Date(2025, 0, 1).getTime())
    );
  });

  it('今天禁用仍可回到本月，保持空选择和可用键盘入口', async () => {
    const today = new Date(referenceToday).setHours(0, 0, 0, 0);
    const wrapper = mount(ExCalendar, {
      props: {
        modelValue: new Date(2024, 0, 15),
        showSolarTerm: false,
        disabledDate: date => date.getTime() === today,
      },
    });
    wrappers.push(wrapper);
    await wrapper.setProps({ modelValue: null });
    expectEmptyCurrentMonth(wrapper.element, referenceToday);
    expect(wrapper.get('.ex-calendar__cell--today').attributes('aria-disabled')).toBe('true');
    expect(wrapper.get('[role="gridcell"][tabindex="0"]').attributes('aria-disabled')).toBe(
      'false'
    );
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('空值 SSR 首屏稳定，跨日期水合后回本月且不发送选择事件', async () => {
    const update = vi.fn();
    const select = vi.fn();
    const click = vi.fn();
    const createApp = () =>
      createSSRApp({
        render: () =>
          h(ExCalendar, {
            modelValue: null,
            showSolarTerm: false,
            'onUpdate:modelValue': update,
            onSelect: select,
            onDateClick: click,
          }),
      });
    vi.setSystemTime(new Date(2024, 11, 31, 23, 59));
    const html = await renderToString(createApp());
    vi.setSystemTime(new Date(2025, 0, 1, 0, 1));
    expect(await renderToString(createApp())).toBe(html);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const warn = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    const app = createApp();
    app.mount(container);
    wrappers.push({
      unmount: () => {
        app.unmount();
        container.remove();
      },
    });
    await nextTick();
    expectEmptyCurrentMonth(container, new Date());
    expect(update).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('显式日期只请求更新，父级回写之前已确认选中值保持不变', async () => {
    const confirmed = new Date(2025, 4, 15);
    const requested = new Date(2025, 4, 16);
    const wrapper = mount(ExCalendar, {
      props: { modelValue: confirmed, showSolarTerm: false },
    });
    wrappers.push(wrapper);
    await wrapper.get(`[data-date="${requested.getTime()}"]`).trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([requested]);
    expect(wrapper.get('[aria-selected="true"]').attributes('data-date')).toBe(
      String(confirmed.getTime())
    );
    (wrapper.vm as unknown as ExCalendarExposed).selectDate(new Date(2025, 4, 17));
    await nextTick();
    expect(wrapper.get('[aria-selected="true"]').attributes('data-date')).toBe(
      String(confirmed.getTime())
    );
    await wrapper.setProps({ modelValue: requested });
    expect(wrapper.get('[aria-selected="true"]').attributes('data-date')).toBe(
      String(requested.getTime())
    );
    await wrapper.setProps({ modelValue: null });
    await wrapper.get(`[data-date="${requested.getTime()}"]`).trigger('click');
    expect(wrapper.find('[aria-selected="true"]').exists()).toBe(false);
  });

  it('显式模式等待父级回写，未提供模式时允许内部切换', async () => {
    const controlled = mount(ExCalendar, {
      props: { mode: 'year', modelValue: referenceToday, showSolarTerm: false },
    });
    wrappers.push(controlled);
    await controlled.get('.ex-calendar__year-month').trigger('click');
    expect(controlled.emitted('update:mode')?.at(-1)).toEqual(['month']);
    expect(controlled.classes()).toContain('ex-calendar--year');
    await controlled.setProps({ mode: 'month' });
    expect(controlled.classes()).toContain('ex-calendar--month');
    const uncontrolled = mount(ExCalendar, { props: { showSolarTerm: false } });
    wrappers.push(uncontrolled);
    await uncontrolled.findAll('.ex-calendar__mode-btn')[3]!.trigger('click');
    expect(uncontrolled.classes()).toContain('ex-calendar--year');
  });
});
