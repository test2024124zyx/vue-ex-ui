import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';
import type {
  ExVerificationCodeExposed,
  VerificationCodeInternalState,
} from '../../../src/components/verification-code/types';

describe('ExVerificationCode regressions', () => {
  const wrappers: VueWrapper[] = [];

  const mountCode = (props: Record<string, unknown> = {}) => {
    const wrapper = mount(ExVerificationCode, { props });
    wrappers.push(wrapper);
    return wrapper;
  };

  afterEach(() => {
    wrappers
      .splice(0)
      .reverse()
      .forEach(wrapper => wrapper.unmount());
    vi.useRealTimers();
  });

  it('浏览器一次写入完整 OTP 时填满所有格子', async () => {
    const wrapper = mountCode({ length: 6 });
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');

    input.element.value = '123456';
    await input.trigger('input');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('123456');
    expect(wrapper.emitted('complete')?.at(-1)?.[0]).toBe('123456');
  });

  it('非法 length 不会使组件初始化崩溃并会归一化为安全范围', () => {
    expect(() => mountCode({ length: -1 })).not.toThrow();
    expect(wrappers.at(-1)?.findAll('.ex-verification-code__cell')).toHaveLength(1);
    expect(() => mountCode({ length: Number.POSITIVE_INFINITY })).not.toThrow();
    expect(wrappers.at(-1)?.findAll('.ex-verification-code__cell')).toHaveLength(12);
  });

  it('缩短 length 时同步通知受控模型截断后的值', async () => {
    const wrapper = mountCode({ length: 6, modelValue: '123456' });

    await wrapper.setProps({ length: 4 });

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('1234');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('1234');
  });

  it('自动提交等待期间禁用组件会取消提交', async () => {
    vi.useFakeTimers();
    const wrapper = mountCode({ length: 4, autoSubmit: true, autoSubmitDelay: 100 });
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');
    input.element.value = '1234';
    await input.trigger('input');
    await wrapper.setProps({ disabled: true });

    vi.advanceTimersByTime(100);
    await nextTick();

    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('渲染标签、分隔符、状态、加载和自定义尺寸样式', () => {
    const wrapper = mountCode({
      length: 4,
      label: '验证码',
      required: true,
      separatorPositions: [2],
      separator: '·',
      placeholder: '_',
      status: 'error',
      errorMessage: '验证码错误',
      loading: true,
      mask: true,
      showMaskToggle: true,
      cellWidth: 32,
      cellGap: '4px',
      customClass: 'custom-code',
      customStyle: { color: 'red' },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'ex-verification-code--error',
        'ex-verification-code--loading',
        'custom-code',
      ])
    );
    expect(wrapper.get('.ex-verification-code__label').text()).toContain('验证码');
    expect(wrapper.get('.ex-verification-code__required').text()).toBe('*');
    expect(wrapper.findAll('.ex-verification-code__separator')).toHaveLength(1);
    expect(wrapper.get('.ex-verification-code__separator').text()).toBe('·');
    expect(wrapper.find('.ex-verification-code__loading').exists()).toBe(true);
    expect(wrapper.get('.ex-verification-code__help').text()).toBe('验证码错误');
    expect(wrapper.get('.ex-verification-code__cells').attributes('style')).toContain('gap: 4px');
    expect(wrapper.get('.ex-verification-code__cell').attributes('style')).toContain('width: 32px');
    expect(wrapper.attributes('style')).toContain('color: red');
    expect(wrapper.find('.ex-verification-code__mask-toggle').exists()).toBe(true);
  });

  it('输入事件过滤非法字符、遵守顺序并处理遮罩延迟', async () => {
    vi.useFakeTimers();
    const wrapper = mountCode({ length: 4, mask: true, maskDelay: 100 });
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');

    input.element.value = 'a1b2';
    await input.trigger('input');
    expect(wrapper.findAll('.ex-verification-code__cell--filled')).toHaveLength(2);
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('12');
    expect(wrapper.findAll('.ex-verification-code__cell-content')[0].text()).toBe('•');
    expect(wrapper.findAll('.ex-verification-code__cell-content')[1].text()).toBe('2');

    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.findAll('.ex-verification-code__cell-content')[0].text()).toBe('•');

    input.element.value = '---';
    await input.trigger('input');
    expect(input.element.value).toBe('');

    await wrapper.setProps({ inputMode: 'alphanumeric' });
    input.element.value = 'A-9';
    await input.trigger('input');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toContain('A');
    vi.useRealTimers();
  });

  it('键盘事件覆盖导航、删除、首尾边界及禁用只读保护', async () => {
    const wrapper = mountCode({ length: 4 });
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');
    const state = wrapper.vm as unknown as VerificationCodeInternalState;

    state.cells.splice(0, state.cells.length, '1', '2', '', '');
    state.focusedIndex = 1;
    await input.trigger('keydown', { key: 'ArrowLeft' });
    expect(state.focusedIndex).toBe(0);
    await input.trigger('keydown', { key: 'ArrowRight' });
    expect(state.focusedIndex).toBe(1);
    await input.trigger('keydown', { key: 'End' });
    expect(state.focusedIndex).toBe(2);
    await input.trigger('keydown', { key: 'Home' });
    expect(state.focusedIndex).toBe(0);
    await input.trigger('keydown', { key: 'Delete' });
    expect(state.cells).toEqual(['2', '', '', '']);
    await input.trigger('keydown', { key: 'Backspace' });
    expect(state.focusedIndex).toBe(0);

    await wrapper.setProps({ disabled: true });
    await input.trigger('keydown', { key: 'ArrowRight' });
    expect(state.focusedIndex).toBe(0);
    await wrapper.setProps({ disabled: false, readonly: true });
    await input.trigger('keydown', { key: 'ArrowRight' });
    expect(state.focusedIndex).toBe(0);
  });

  it('粘贴从第一个空格子开始填充，并拒绝已满、禁用和只读状态', async () => {
    const wrapper = mountCode({ length: 4 });
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');
    const paste = (value: string) => {
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: () => value },
      });
      input.element.dispatchEvent(event);
      return event;
    };

    paste('a12-3');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('123');

    const state = wrapper.vm as unknown as VerificationCodeInternalState;
    state.cells = ['1', '2', '3', '4'];
    expect(paste('9').defaultPrevented).toBe(true);

    await wrapper.setProps({ disabled: true });
    expect(paste('9').defaultPrevented).toBe(true);
    await wrapper.setProps({ disabled: false, readonly: true });
    expect(paste('9').defaultPrevented).toBe(true);
  });

  it('遮罩切换、单元格点击、聚焦失焦和公开方法保持一致', async () => {
    const wrapper = mount(ExVerificationCode, {
      props: { length: 3, mask: true, showMaskToggle: true, modelValue: '123' },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const exposed = wrapper.vm as unknown as ExVerificationCodeExposed;
    const input = wrapper.get<HTMLInputElement>('.ex-verification-code__hidden-input');

    expect(wrapper.findAll('.ex-verification-code__cell-content')[0].text()).toBe('•');
    await wrapper.get('.ex-verification-code__mask-toggle').trigger('click');
    expect(wrapper.findAll('.ex-verification-code__cell-content')[0].text()).toBe('1');

    await wrapper.findAll('.ex-verification-code__cell')[2].trigger('click');
    expect(document.activeElement).toBe(input.element);
    await input.trigger('focus');
    await input.trigger('blur');
    exposed.focus();
    exposed.blur();
    expect(exposed.getElement()).toBe(wrapper.element);

    exposed.clear();
    expect(exposed.getValue()).toBe('');
    expect(wrapper.emitted('clear')).toBeTruthy();
    exposed.setValue('9x87');
    expect(exposed.getValue()).toBe('987');
    exposed.submit();
    expect(wrapper.emitted('submit')?.at(-1)?.[0]).toBe('987');
  });

  it('模型、长度、输入模式和遮罩属性变化会同步内部状态', async () => {
    const wrapper = mountCode({ length: 5, modelValue: '12-3' });
    const state = wrapper.vm as unknown as VerificationCodeInternalState;

    expect(state.cells).toEqual(['1', '2', '3', '', '']);
    await wrapper.setProps({ inputMode: 'alphanumeric', modelValue: 'aB-9' });
    expect(state.cells).toEqual(['a', 'B', '9', '', '']);
    await wrapper.setProps({ length: 2 });
    expect(state.cells).toEqual(['a', 'B']);
    await wrapper.setProps({ mask: true });
    expect(wrapper.classes()).toContain('ex-verification-code--medium');
  });

  it('自动提交在完整值、禁用和手动提交之间遵守状态条件', async () => {
    vi.useFakeTimers();
    const wrapper = mountCode({ length: 2, autoSubmit: true, autoSubmitDelay: 50 });
    const exposed = wrapper.vm as unknown as ExVerificationCodeExposed;

    exposed.setValue('12');
    vi.advanceTimersByTime(50);
    expect(wrapper.emitted('submit')?.at(-1)?.[0]).toBe('12');

    await wrapper.setProps({ disabled: true });
    exposed.submit();
    expect(wrapper.emitted('submit')).toHaveLength(2);
    vi.useRealTimers();
  });
});
