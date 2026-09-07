import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
});

describe('验证码原生输入与遮罩契约', () => {
  it('真实输入保留完整值，逐字输入、完整性校验和删除保持一致', async () => {
    const wrapper = mount(ExVerificationCode, { props: { required: true, length: 4 } });
    wrappers.push(wrapper);
    const input = wrapper.get('input');
    expect(input.element.checkValidity()).toBe(false);
    for (const [index, char] of [...'1234'].entries()) {
      input.element.value = '1234'.slice(0, index + 1);
      input.element.dispatchEvent(
        new InputEvent('input', { data: char, inputType: 'insertText', bubbles: true })
      );
      await nextTick();
      expect(input.element.value).toBe('1234'.slice(0, index + 1));
      expect(input.element.checkValidity()).toBe(index === 3);
    }
    await input.trigger('keydown', { key: 'Backspace' });
    expect(input.element.value).toBe('123');
    expect(input.element.checkValidity()).toBe(false);
    await wrapper.setProps({ modelValue: '9876' });
    expect(input.element.value).toBe('9876');
    expect(input.element.checkValidity()).toBe(true);
  });

  it('浏览器替换式自动填充覆盖已有完整值', async () => {
    const wrapper = mount(ExVerificationCode, { props: { modelValue: '1234', length: 4 } });
    wrappers.push(wrapper);
    const input = wrapper.get('input');
    input.element.value = '9876';
    input.element.dispatchEvent(
      new InputEvent('input', { inputType: 'insertReplacementText', bubbles: true })
    );
    await nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['9876']);
    expect(input.element.value).toBe('9876');
  });

  it('零遮罩延迟立即隐藏每个字符，动态取消延迟也不会留下明文', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExVerificationCode, { props: { mask: true, maskDelay: 0, length: 4 } });
    wrappers.push(wrapper);
    await wrapper.get('input').setValue('1234');
    const displayed = () =>
      wrapper.findAll('.ex-verification-code__cell-content').map(cell => cell.text());
    expect(displayed()).toEqual(['•', '•', '•', '•']);
    await wrapper.setProps({ maskDelay: 100 });
    await wrapper.get('input').setValue('5');
    expect(displayed().at(-1)).toBe('5');
    await wrapper.setProps({ maskDelay: 0 });
    expect(displayed()).toEqual(['•', '•', '•', '•']);
    await vi.advanceTimersByTimeAsync(100);
    expect(displayed()).toEqual(['•', '•', '•', '•']);
  });
});
