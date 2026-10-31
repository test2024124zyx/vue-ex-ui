import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import type { DateTimePickerType } from '../../../src/components/datetime-picker/types';

const wrappers: Array<{ unmount(): void }> = [];
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 29));
});
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
});

describe('日期选择的年、月和 ISO 周模式', () => {
  it.each([
    ['year', '[data-period="2024"]', new Date(2024, 0, 1), '2024'],
    ['month', '[data-period="2026-02"]', new Date(2026, 1, 1), '2026-02'],
    ['week', '[data-date="2026-10-29"]', new Date(2026, 9, 26), '2026-W44'],
  ] as const)('%s 模式选择完整周期并以正确格式显示', async (type, selector, date, display) => {
    const wrapper = mount(ExDateTimePicker, { props: { type, teleported: false } });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get(selector).trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(date);
    expect(wrapper.get('input').element.value).toBe(display);
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false');
  });

  it.each([
    [
      'yearrange',
      '[data-period="2027"]',
      '[data-period="2024"]',
      new Date(2024, 0, 1),
      new Date(2027, 0, 1),
    ],
    [
      'monthrange',
      '[data-period="2026-12"]',
      '[data-period="2026-02"]',
      new Date(2026, 1, 1),
      new Date(2026, 11, 1),
    ],
    [
      'weekrange',
      '[data-date="2026-10-29"]',
      '[data-date="2026-10-06"]',
      new Date(2026, 9, 5),
      new Date(2026, 9, 26),
    ],
  ] as const)(
    '%s 反向选择按周期起点排序，首个端点不提交',
    async (type, first, second, start, end) => {
      const wrapper = mount(ExDateTimePicker, { props: { type, teleported: false } });
      wrappers.push(wrapper);
      await wrapper.get('input').trigger('click');
      await wrapper.get(first).trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      await wrapper.get(second).trigger('click');
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([start, end]);
    }
  );

  it('跨年周返回上一年周一，展示 ISO 周年与周数', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { type: 'week', modelValue: new Date(2021, 0, 1), teleported: false },
    });
    wrappers.push(wrapper);
    expect(wrapper.get('input').element.value).toBe('2020-W53');
    await wrapper.get('input').trigger('click');
    expect(wrapper.findAll('.ex-datetime-picker__day--selected')).toHaveLength(7);
    await wrapper.get('[data-date="2021-01-03"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(new Date(2020, 11, 28));
  });

  it('月模式按月初调用禁用规则，键盘跳过被禁用周期', async () => {
    const disabledDate = vi.fn((date: Date) => date.getMonth() === 10);
    const wrapper = mount(ExDateTimePicker, {
      props: { type: 'month', modelValue: new Date(2026, 9, 29), teleported: false, disabledDate },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.get('[data-period="2026-11"]').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-period="2026-10"]').trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-period')).toBe('2026-12');
    expect(disabledDate.mock.calls.every(([date]) => date.getDate() === 1)).toBe(true);
  });

  it('年面板分页和月键盘跨年都更新浏览位置，不改写确认值', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: {
        type: 'year' as DateTimePickerType,
        modelValue: new Date(2026, 9, 29),
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-action="next-year"]').trigger('click');
    expect(wrapper.find('[data-period="2036"]').exists()).toBe(true);
    expect(wrapper.get('input').element.value).toBe('2026');
    await wrapper.setProps({ type: 'month', modelValue: new Date(2026, 11, 1) });
    await wrapper.get('[data-period="2026-12"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.find('[data-period="2027-01"]').exists()).toBe(true);
  });

  it('年月范围预览随指针退出清除，禁用周期不会产生可选范围预览', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: {
        type: 'yearrange',
        teleported: false,
        disabledDate: (date: Date) => date.getFullYear() === 2025,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    await wrapper.get('[data-period="2026"]').trigger('click');
    await wrapper.get('[data-period="2027"]').trigger('pointerenter');
    expect(wrapper.get('[data-period="2027"]').classes()).toContain('is-preview');
    await wrapper.get('[data-period="2027"]').trigger('pointerleave');
    expect(wrapper.findAll('.is-preview')).toHaveLength(0);
    wrapper.get('[data-period="2025"]').element.dispatchEvent(new Event('pointerenter'));
    await nextTick();
    expect(wrapper.findAll('.is-preview')).toHaveLength(0);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
