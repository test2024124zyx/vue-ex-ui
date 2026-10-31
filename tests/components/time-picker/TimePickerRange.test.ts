import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, ref } from 'vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import type { TimePickerRange } from '../../../src/components/time-picker/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('TimePicker 独立时间范围', () => {
  it('两个端点均选择后才可确认，仅提交完整范围而不发出单值事件', async () => {
    const wrapper = mount(ExTimePicker, {
      props: { range: true, teleported: false, format: 'HH:mm' },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    expect(wrapper.emitted('update:rangeValue')).toBeUndefined();
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.emitted('update:rangeValue')).toEqual([[['09:00', '18:00']]]);
    expect(wrapper.emitted('range-change')).toEqual([[['09:00', '18:00']]]);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.get('.ex-time-picker__text').text()).toContain('09:00');
    expect(wrapper.get('.ex-time-picker__text').text()).toContain('18:00');
  });

  it('逆序范围不能确认，修正结束时间后可以提交', async () => {
    const wrapper = mount(ExTimePicker, { props: { range: true, teleported: false } });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('click');
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    await wrapper.get('[data-unit="h"][data-value="20"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.emitted('update:rangeValue')?.at(-1)).toEqual([['18:00:00', '20:00:00']]);
  });

  it('父级拒绝范围提交与清空时仍显示确认值，重新打开丢弃被拒绝的草稿', async () => {
    const rangeValue: TimePickerRange = ['09:00:00', '18:00:00'];
    const wrapper = mount(ExTimePicker, { props: { range: true, rangeValue, teleported: false } });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="10"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.get('.ex-time-picker__text').text()).toContain('09:00:00');
    await wrapper.get('.ex-time-picker__clear').trigger('click');
    expect(wrapper.get('.ex-time-picker__text').text()).toContain('18:00:00');
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('[data-unit="h"][data-value="9"]').attributes('aria-selected')).toBe('true');
  });

  it('父级接受和转换范围更新时显示最新回写，显式 null 为受控空值', async () => {
    const value = ref<TimePickerRange | null>(null);
    const wrapper = mount({
      render: () =>
        h(ExTimePicker, {
          range: true,
          rangeValue: value.value,
          teleported: false,
          'onUpdate:rangeValue': next => (value.value = next ? ['08:00:00', '19:00:00'] : null),
        }),
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.get('.ex-time-picker__text').text()).toContain('08:00:00');
    await wrapper.get('.ex-time-picker__clear').trigger('click');
    expect(value.value).toBeNull();
    expect(wrapper.find('.ex-time-picker__text').exists()).toBe(false);
  });

  it('禁用规则区分范围端点，运行时更新后重新校验整个范围', async () => {
    const wrapper = mount(ExTimePicker, {
      props: {
        range: true,
        rangeValue: ['09:00:00', '18:00:00'] as TimePickerRange,
        teleported: false,
        disabledHours: (endpoint?: 'start' | 'end') => (endpoint === 'end' ? [18] : []),
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    expect(wrapper.get('[data-unit="h"][data-value="18"]').attributes('aria-disabled')).toBe(
      'true'
    );
    await wrapper.get('[data-unit="h"][data-value="19"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeUndefined();
    await wrapper.setProps({ readonly: true });
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.emitted('update:rangeValue')).toBeUndefined();
  });

  it('单值非受控选择与范围使用相同确认值机制，重新打开不会丢失', async () => {
    const wrapper = mount(ExTimePicker, { props: { teleported: false, format: 'HH:mm' } });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.get('.ex-time-picker__text').text()).toBe('09:00');
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('[data-unit="h"][data-value="9"]').attributes('aria-selected')).toBe('true');
  });

  it('小时切换进入分钟全禁用分支后，不能提交此前合法的旧草稿', async () => {
    const wrapper = mount(ExTimePicker, {
      props: {
        range: true,
        rangeValue: ['09:00:00', '18:00:00'] as TimePickerRange,
        teleported: false,
        disabledMinutes: (hour: number) =>
          hour === 10 ? Array.from({ length: 60 }, (_, index) => index) : [],
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="10"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeDefined();
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.emitted('update:rangeValue')).toBeUndefined();
  });

  it('键盘切换端点并进入时间列，Escape 取消草稿且保留焦点归还', async () => {
    const wrapper = mount(ExTimePicker, {
      props: {
        range: true,
        rangeValue: ['09:00:00', '18:00:00'] as TimePickerRange,
        teleported: false,
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-endpoint="start"]').trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-endpoint')).toBe('end');
    await wrapper.get('[data-endpoint="end"]').trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-value')).toBe('18');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('[data-unit="h"][data-value="19"]').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('update:rangeValue')).toBeUndefined();
    expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element);
  });

  it('展开期间外部范围替换立即更新两个端点，解除受控保留已确认快照', async () => {
    const wrapper = mount(ExTimePicker, {
      props: {
        range: true,
        rangeValue: ['09:00:00', '18:00:00'] as TimePickerRange,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.setProps({ rangeValue: ['10:30:00', '20:45:00'] });
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    expect(wrapper.get('[data-unit="h"][data-value="20"]').attributes('aria-selected')).toBe(
      'true'
    );
    await wrapper.setProps({ rangeValue: undefined });
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.emitted('update:rangeValue')?.at(-1)).toEqual([['10:30:00', '20:45:00']]);
    await wrapper.get('.ex-time-picker__clear').trigger('click');
    expect(wrapper.find('.ex-time-picker__text').exists()).toBe(false);
  });

  it.each([
    ['25:00:00', '18:00:00'],
    ['bad', '18:00:00'],
    ['09:00:00', '18:99:00'],
  ])('非法范围不会被当作已完成选择：%j', async (start, end) => {
    const wrapper = mount(ExTimePicker, {
      props: {
        range: true,
        rangeValue: [start, end],
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('.ex-time-picker__confirm').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.ex-time-picker__text').exists()).toBe(false);
  });

  it('格式中的时间单位顺序与解析、输出一致，无效格式使用稳定默认值', async () => {
    const wrapper = mount(ExTimePicker, {
      props: { format: 'ss:mm:HH', modelValue: '03:02:01', teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('[data-unit="h"][data-value="1"]').attributes('aria-selected')).toBe('true');
    await wrapper.get('[data-unit="h"][data-value="4"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['03:02:04']);
    await wrapper.setProps({ format: 'invalid', modelValue: '01:02:03' });
    expect(wrapper.findAll('.ex-time-picker__column')).toHaveLength(3);
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['01:02:03']);
  });

  it('范围端点标题占用高度后，选中项仍滚动到时间列内而不是标题后方', async () => {
    const wrapper = mount(ExTimePicker, {
      props: { range: true, teleported: false },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    const column = wrapper.get<HTMLElement>('.ex-time-picker__column');
    const cell = wrapper.get<HTMLElement>('[data-unit="h"][data-value="18"]');
    // 对应真实浏览器中端点标题使时间列相对弹层下移的布局。
    const headerHeight = 94;
    const cellOffsetWithinPanel = 712;
    Object.defineProperty(column.element, 'offsetTop', { value: headerHeight });
    Object.defineProperty(cell.element, 'offsetTop', { value: cellOffsetWithinPanel });
    await cell.trigger('click');
    expect(column.element.scrollTop).toBe(cellOffsetWithinPanel - headerHeight);
  });
});
