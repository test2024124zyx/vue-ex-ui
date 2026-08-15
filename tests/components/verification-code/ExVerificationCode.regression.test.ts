import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';

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
});
