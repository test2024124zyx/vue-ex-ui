import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ExDateTimePickerExposed } from '../../../src/components/datetime-picker/types';

describe('ExDateTimePicker', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15, 12, 0, 0));
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mountPicker = (props = {}) => {
    wrapper = mount(ExDateTimePicker, { props, attachTo: document.body });
    return wrapper;
  };

  const input = () => wrapper!.find<HTMLInputElement>('.ex-datetime-picker__input');

  const openPanel = async () => {
    await input().trigger('click');
    await nextTick();
    return document.querySelector<HTMLElement>('.ex-datetime-picker__dropdown')!;
  };

  const dayButton = (date: string) =>
    document.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)!;

  it('输入框公开 combobox 状态并同步面板可见事件', async () => {
    mountPicker({ ariaLabel: '预约日期' });
    expect(input().attributes('role')).toBe('combobox');
    expect(input().attributes('aria-expanded')).toBe('false');
    expect(input().attributes('aria-label')).toBe('预约日期');

    const panel = await openPanel();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(input().attributes('aria-expanded')).toBe('true');
    expect(wrapper!.emitted('visible-change')).toEqual([[true]]);
  });

  it('默认把面板传送到 body，面板内操作不会被误判为外部点击', async () => {
    mountPicker();
    const panel = await openPanel();

    expect(document.body.contains(panel)).toBe(true);
    expect(wrapper!.element.contains(panel)).toBe(false);
    panel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();

    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBe(panel);
  });

  it('传送面板按视口夹取位置并在空间不足时向上展开', async () => {
    mountPicker();
    vi.spyOn(input().element, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      bottom: 736,
      left: 760,
      right: 960,
      width: 200,
      height: 36,
      x: 760,
      y: 700,
      toJSON: () => ({}),
    });
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(760);
    const panel = await openPanel();
    Object.defineProperty(panel, 'offsetWidth', { configurable: true, value: 360 });
    Object.defineProperty(panel, 'offsetHeight', { configurable: true, value: 500 });

    window.dispatchEvent(new Event('resize'));
    await nextTick();

    expect(panel.style.position).toBe('fixed');
    expect(Number.parseFloat(panel.style.left)).toBeGreaterThanOrEqual(8);
    expect(Number.parseFloat(panel.style.left)).toBeLessThanOrEqual(432);
    expect(Number.parseFloat(panel.style.top)).toBeLessThan(700);
  });

  it('teleported=false 时面板保留在组件内且不写入固定定位', async () => {
    mountPicker({ teleported: false });
    const panel = await openPanel();

    expect(wrapper!.element.contains(panel)).toBe(true);
    expect(panel.style.position).toBe('');
  });

  it('datetime 类型遵守自定义格式而不是强制固定格式', () => {
    mountPicker({
      modelValue: new Date(2024, 1, 3, 4, 5, 6),
      type: 'datetime',
      format: 'DD/MM/YYYY HH:mm',
    });
    expect(input().element.value).toBe('03/02/2024 04:05');
  });

  it('无效 Date 不进入内部状态，也不显示伪造的清空能力', () => {
    mountPicker({ modelValue: new Date(Number.NaN) });
    expect(input().element.value).toBe('');
    expect(wrapper!.find('.ex-datetime-picker__clear').exists()).toBe(false);
  });

  it('运行时禁用或只读会关闭面板并阻止再次打开', async () => {
    mountPicker();
    await openPanel();
    await wrapper!.setProps({ disabled: true });
    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBeNull();
    expect(input().attributes('disabled')).toBeDefined();

    await wrapper!.setProps({ disabled: false, readonly: true });
    await input().trigger('click');
    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBeNull();
    expect(input().attributes('aria-readonly')).toBe('true');
  });

  it('从月末切换月份时夹到目标月，不会越过二月', async () => {
    mountPicker({ modelValue: new Date(2024, 0, 31) });
    await openPanel();
    document.querySelector<HTMLButtonElement>('[data-action="next-month"]')!.click();
    await nextTick();

    expect(document.querySelector('.ex-datetime-picker__current')?.textContent).toContain('M2');
    expect(dayButton('2024-02-29')).toBeTruthy();
  });

  it('日期模式选择有效日期后立即提交独立 Date 并关闭', async () => {
    const original = new Date(2024, 4, 15);
    mountPicker({ modelValue: original });
    await openPanel();
    dayButton('2024-05-20').click();
    await nextTick();

    const emitted = wrapper!.emitted('update:modelValue')?.at(-1)?.[0] as Date;
    expect(emitted).toEqual(new Date(2024, 4, 20));
    expect(emitted).not.toBe(original);
    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBeNull();
  });

  it('disabledDate 同时禁用日期与今天按钮且不会提交', async () => {
    mountPicker({ disabledDate: (date: Date) => date.getDate() === 15 });
    await openPanel();
    expect(dayButton('2024-05-15').disabled).toBe(true);
    expect(
      document.querySelector<HTMLButtonElement>('.ex-datetime-picker__today-btn')!.disabled
    ).toBe(true);
    dayButton('2024-05-15').click();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('反向选择日期范围时按时间顺序提交两个本地零点', async () => {
    mountPicker({
      modelValue: [new Date(2024, 4, 1), new Date(2024, 4, 2)],
      type: 'daterange',
    });
    await openPanel();
    dayButton('2024-05-20').click();
    dayButton('2024-05-10').click();
    await nextTick();

    const value = wrapper!.emitted('update:modelValue')?.at(-1)?.[0] as [Date, Date];
    expect(value).toEqual([new Date(2024, 4, 10), new Date(2024, 4, 20)]);
    expect(value[0].getHours()).toBe(0);
    expect(value[1].getHours()).toBe(0);
  });

  it('日期时间范围允许显式零点，不会把 0 误判为缺省的 23:59:59', async () => {
    mountPicker({
      modelValue: [new Date(2024, 4, 1), new Date(2024, 4, 2)],
      type: 'datetimerange',
    });
    await openPanel();
    dayButton('2024-05-20').click();
    dayButton('2024-05-21').click();
    document.querySelector<HTMLButtonElement>('.ex-datetime-picker__confirm-btn')!.click();

    const value = wrapper!.emitted('update:modelValue')?.at(-1)?.[0] as [Date, Date];
    expect(value[0].getHours()).toBe(0);
    expect(value[1].getHours()).toBe(0);
    expect(value[1].getMinutes()).toBe(0);
    expect(value[1].getSeconds()).toBe(0);
  });

  it('timeStep 约束分钟输入并反映到最终 datetime 值', async () => {
    mountPicker({
      modelValue: new Date(2024, 4, 15, 10, 7, 0),
      type: 'datetime',
      timeStep: 15,
    });
    await openPanel();
    const minute = document.querySelector<HTMLInputElement>('[data-time-part="minute"]')!;
    expect(minute.step).toBe('15');
    minute.value = '13';
    minute.dispatchEvent(new Event('input', { bubbles: true }));
    minute.dispatchEvent(new Event('change', { bubbles: true }));
    await nextTick();
    document.querySelector<HTMLButtonElement>('.ex-datetime-picker__confirm-btn')!.click();

    const value = wrapper!.emitted('update:modelValue')?.at(-1)?.[0] as Date;
    expect(value.getMinutes()).toBe(15);
  });

  it('日期类型开启 showTime 后等待确认并保留自定义时间格式', async () => {
    mountPicker({
      modelValue: new Date(2024, 4, 15, 8, 0, 0),
      type: 'date',
      showTime: true,
      format: 'YYYY-MM-DD HH:mm',
    });
    await openPanel();
    dayButton('2024-05-20').click();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
    document.querySelector<HTMLButtonElement>('.ex-datetime-picker__confirm-btn')!.click();
    await nextTick();
    expect(input().element.value).toBe('2024-05-20 08:00');
  });

  it('点击外部取消未确认草稿，重新打开时恢复受控值', async () => {
    mountPicker({ modelValue: new Date(2024, 4, 15, 9), type: 'datetime' });
    await openPanel();
    dayButton('2024-05-20').click();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBeNull();
    expect(input().element.value).toBe('2024-05-15 09:00:00');

    await openPanel();
    expect(dayButton('2024-05-15').getAttribute('aria-selected')).toBe('true');
    expect(dayButton('2024-05-20').getAttribute('aria-selected')).toBe('false');
  });

  it('Escape 关闭面板并把焦点归还输入框', async () => {
    mountPicker({ modelValue: new Date(2024, 4, 15) });
    input().element.focus();
    await input().trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const focusedDay = document.activeElement as HTMLElement;
    expect(focusedDay.dataset.date).toBe('2024-05-15');

    focusedDay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(document.querySelector('.ex-datetime-picker__dropdown')).toBeNull();
    expect(document.activeElement).toBe(input().element);
  });

  it('日期网格支持方向键按天移动焦点', async () => {
    mountPicker({ modelValue: new Date(2024, 4, 15) });
    await input().trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await nextTick();

    expect((document.activeElement as HTMLElement).dataset.date).toBe('2024-05-16');
  });

  it('受控日期后来变为禁用时，键盘打开会聚焦下一个可用日期', async () => {
    mountPicker({
      modelValue: new Date(2024, 4, 15),
      disabledDate: (date: Date) => date.getDate() === 15,
    });

    await input().trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    await nextTick();

    expect((document.activeElement as HTMLElement).dataset.date).toBe('2024-05-16');
  });

  it('键盘导航可越过超过一年的连续禁用区间', async () => {
    const disabledThrough = new Date(2025, 5, 18).getTime();
    mountPicker({
      modelValue: new Date(2024, 4, 15),
      disabledDate: (date: Date) => date.getTime() <= disabledThrough,
    });
    await openPanel();
    const source = dayButton('2024-05-15');

    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextTick();
    await nextTick();

    const activeDay = document.querySelector<HTMLButtonElement>(
      '.ex-datetime-picker__day[tabindex="0"]'
    );
    expect(activeDay?.disabled).toBe(false);
    expect(activeDay?.dataset.date).toBe('2025-06-19');
  });

  it('所有日期均禁用时键盘导航保持当前月份且不产生禁用 tabstop', async () => {
    mountPicker({ modelValue: new Date(2024, 4, 15), disabledDate: () => true });
    await openPanel();
    const source = dayButton('2024-05-15');

    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextTick();

    expect(document.querySelector('.ex-datetime-picker__current')?.textContent).toContain('2024');
    expect(document.querySelector('.ex-datetime-picker__day:disabled[tabindex="0"]')).toBeNull();
  });

  it('范围未选完整时确认按钮保持禁用', async () => {
    mountPicker({ type: 'datetimerange' });
    await openPanel();
    dayButton('2024-05-15').click();
    await nextTick();
    expect(
      document.querySelector<HTMLButtonElement>('.ex-datetime-picker__confirm-btn')!.disabled
    ).toBe(true);
  });

  it('仅在面板打开期间注册外部指针监听', async () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    mountPicker();
    expect(addListener.mock.calls.some(([type]) => type === 'pointerdown')).toBe(false);

    await openPanel();
    expect(addListener.mock.calls.some(([type]) => type === 'pointerdown')).toBe(true);
    await input().trigger('click');
    expect(removeListener.mock.calls.some(([type]) => type === 'pointerdown')).toBe(true);
  });

  it('清空后发出 null、change 与 clear', async () => {
    mountPicker({ modelValue: new Date(2024, 4, 15) });
    await wrapper!.find('.ex-datetime-picker__clear').trigger('click');
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    expect(wrapper!.emitted('change')?.at(-1)).toEqual([null]);
    expect(wrapper!.emitted('clear')).toEqual([[]]);
  });

  it('公开方法聚焦、失焦并返回根元素', () => {
    mountPicker();
    const exposed = wrapper!.vm as unknown as ExDateTimePickerExposed;
    exposed.focus();
    expect(document.activeElement).toBe(input().element);
    exposed.blur();
    expect(document.activeElement).not.toBe(input().element);
    expect(exposed.getElement()).toBe(wrapper!.element);
  });

  it('Teleport 面板继承 ConfigProvider 的语义层级和效果开关', async () => {
    const provider = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExDateTimePicker) },
    });

    await provider.get('.ex-datetime-picker__input').trigger('click');
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.ex-datetime-picker__dropdown')!;
    expect(panel.style.zIndex).toBe('2400');
    expect(panel.classList).toContain('ex-no-neon');
    expect(panel.classList).toContain('ex-no-animation');
    provider.unmount();
  });
});
