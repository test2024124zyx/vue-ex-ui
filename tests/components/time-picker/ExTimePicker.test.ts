import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

describe('ExTimePicker', () => {
  let wrapper: ReturnType<typeof mount> | null = null;
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mountTP = (props = {}) => {
    wrapper = mount(ExTimePicker, { props, attachTo: document.body });
    return wrapper;
  };

  it('显示绑定值', () => {
    mountTP({ modelValue: '09:30:00' });
    expect(wrapper!.find('.ex-time-picker__text').text()).toBe('09:30:00');
  });

  it('未选择时显示占位', () => {
    mountTP({ placeholder: '选择时间' });
    expect(wrapper!.find('.ex-time-picker__placeholder').text()).toBe('选择时间');
  });

  it('点击触发器打开面板', async () => {
    mountTP();
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-time-picker__panel')).toBeTruthy();
  });

  it('format 控制列数（HH:mm 只有两列）', async () => {
    mountTP({ format: 'HH:mm' });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelectorAll('.ex-time-picker__column').length).toBe(2);
  });

  it('点选单元格更新值', async () => {
    mountTP({ modelValue: '00:00:00' });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    const firstHourCell = document
      .querySelectorAll<HTMLElement>('.ex-time-picker__column')[0]!
      .querySelectorAll<HTMLElement>('.ex-time-picker__cell')[5]!;
    firstHourCell.click();
    await nextTick();
    const emitted = wrapper!.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect((emitted!.at(-1)![0] as string).startsWith('05:')).toBe(true);
  });

  it('清空触发 clear', async () => {
    mountTP({ modelValue: '09:30:00', clearable: true });
    await wrapper!.find('.ex-time-picker__clear').trigger('click');
    expect(wrapper!.emitted('clear')).toBeTruthy();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('');
  });

  it('组合框、面板和清空控件应该具有完整的可访问语义', async () => {
    mountTP({
      modelValue: '09:30:00',
      clearable: true,
      id: 'meeting-time',
      ariaLabel: '会议时间',
      ariaDescribedby: 'meeting-help',
    });
    const trigger = wrapper!.find('.ex-time-picker__trigger');
    const clear = wrapper!.find('.ex-time-picker__clear');

    expect(trigger.attributes('id')).toBe('meeting-time');
    expect(trigger.attributes('aria-label')).toBe('会议时间');
    expect(trigger.attributes('aria-describedby')).toBe('meeting-help');
    expect(clear.element.tagName).toBe('BUTTON');

    await trigger.trigger('click');
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.ex-time-picker__panel')!;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(trigger.attributes('aria-controls')).toBe(panel.id);
    expect(
      Array.from(panel.querySelectorAll<HTMLElement>('[role="listbox"]')).map(column =>
        column.getAttribute('aria-label')
      )
    ).toEqual(['Hour', 'Minute', 'Second']);
  });

  it('方向键应该跳过禁用选项并提交选择', async () => {
    mountTP({ modelValue: '00:00:00', disabledHours: () => [1] });
    const trigger = wrapper!.find('.ex-time-picker__trigger');

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    expect(document.activeElement?.getAttribute('data-value')).toBe('0');

    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    );
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')?.at(-1)?.[0]).toBe('02:00:00');
    expect(document.activeElement?.getAttribute('data-value')).toBe('2');
  });

  it('修改小时后应该修正新上下文中已禁用的分钟和秒', async () => {
    mountTP({
      modelValue: '00:00:00',
      disabledMinutes: (hour: number) => (hour === 1 ? [0] : []),
      disabledSeconds: (hour: number, minute: number) => (hour === 1 && minute === 1 ? [0] : []),
    });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();

    const hourOne = document.querySelector<HTMLElement>('[data-unit="h"][data-value="1"]')!;
    hourOne.click();
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')?.at(-1)?.[0]).toBe('01:01:01');
  });

  it('“现在”应该遵守步长和禁用回调', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 34, 56));
    mountTP({
      hourStep: 5,
      minuteStep: 15,
      secondStep: 30,
      disabledHours: () => [10],
      disabledMinutes: (hour: number) => (hour === 15 ? [30] : []),
    });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();

    document.querySelector<HTMLButtonElement>('.ex-time-picker__now')!.click();
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')?.at(-1)?.[0]).toBe('15:00:00');
  });

  it('“现在”应该跳过最近小时的死路并选择最近的完整可用组合', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 34, 56));
    mountTP({
      disabledHours: () =>
        Array.from({ length: 24 }, (_, hour) => hour).filter(hour => hour !== 12 && hour !== 13),
      disabledMinutes: (hour: number) =>
        hour === 12 ? Array.from({ length: 60 }, (_, minute) => minute) : [],
    });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();

    const nowButton = document.querySelector<HTMLButtonElement>('.ex-time-picker__now')!;
    expect(nowButton.disabled).toBe(false);
    nowButton.click();
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')?.at(-1)?.[0]).toBe('13:00:00');
  });

  it('所有秒都禁用时应该禁用“现在”且不提交', async () => {
    mountTP({
      disabledSeconds: () => Array.from({ length: 60 }, (_, second) => second),
    });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();

    const nowButton = document.querySelector<HTMLButtonElement>('.ex-time-picker__now')!;
    expect(nowButton.disabled).toBe(true);
    nowButton.click();
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('运行时禁用应该关闭面板并阻止后续提交', async () => {
    mountTP({ modelValue: '00:00:00' });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    await wrapper!.setProps({ disabled: true });
    await nextTick();

    expect(document.querySelector('.ex-time-picker__panel')).toBeNull();
    expect(wrapper!.emitted('visible-change')?.at(-1)).toEqual([false]);
  });

  it('传送到 body 的面板应该限制在视口横向范围内', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 900,
      right: 1000,
      top: 20,
      bottom: 52,
      width: 100,
      height: 32,
      x: 900,
      y: 20,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    mountTP();

    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();

    expect(document.querySelector<HTMLElement>('.ex-time-picker__panel')!.style.left).toBe('696px');
  });

  it('Teleport 面板继承 ConfigProvider 的语义层级和效果开关', async () => {
    const provider = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExTimePicker) },
    });

    await provider.get('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.ex-time-picker__panel')!;
    expect(panel.style.zIndex).toBe('2400');
    expect(panel.classList).toContain('ex-no-neon');
    expect(panel.classList).toContain('ex-no-animation');
    provider.unmount();
  });
});
