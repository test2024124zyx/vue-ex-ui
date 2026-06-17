import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import type { ExInputProps } from '../../../src/components/input/types';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name'],
    template: '<span class="ex-icon">{{ name }}</span>',
  },
}));

describe('ExInput', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExInput);

    expect(wrapper.find('.ex-input').exists()).toBe(true);
    expect(wrapper.find('.ex-input__control').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-input--medium');
    expect(wrapper.classes()).toContain('ex-input--neon');
  });

  it('renders with v-model', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: 'test value',
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    });

    await nextTick();

    const input = wrapper.find('.ex-input__control');
    expect((input.element as HTMLInputElement).value).toBe('test value');

    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value']);
  });

  it('renders different sizes', () => {
    const sizes: ExInputProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      const wrapper = mount(ExInput, {
        props: { size },
      });
      expect(wrapper.classes()).toContain(`ex-input--${size}`);
    });
  });

  it('renders different variants', () => {
    const variants: ExInputProps['variant'][] = ['neon', 'ghost', 'filled'];

    variants.forEach((variant) => {
      const wrapper = mount(ExInput, {
        props: { variant },
      });
      expect(wrapper.classes()).toContain(`ex-input--${variant}`);
    });
  });

  it('renders different statuses', () => {
    const statuses: ExInputProps['status'][] = ['success', 'warning', 'error'];

    statuses.forEach((status) => {
      const wrapper = mount(ExInput, {
        props: { status },
      });
      expect(wrapper.classes()).toContain(`ex-input--${status}`);
    });
  });

  it('handles disabled state', () => {
    const wrapper = mount(ExInput, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain('ex-input--disabled');
    const input = wrapper.find('.ex-input__control');
    expect(input.attributes('disabled')).toBeDefined();
  });

  it('handles readonly state', () => {
    const wrapper = mount(ExInput, {
      props: { readonly: true },
    });

    expect(wrapper.classes()).toContain('ex-input--readonly');
    const input = wrapper.find('.ex-input__control');
    expect(input.attributes('readonly')).toBeDefined();
  });

  it('shows clear button when clearable and has value', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: 'test',
        clearable: true,
      },
    });

    const input = wrapper.find('.ex-input__control');
    await input.trigger('focus');
    await nextTick();

    expect(wrapper.find('.ex-input__clear-icon').exists()).toBe(true);
  });

  it('clears value when clear button is clicked', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: 'test',
        clearable: true,
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    });

    const input = wrapper.find('.ex-input__control');
    await input.trigger('focus');
    await nextTick();

    const clearButton = wrapper.find('.ex-input__clear-icon');
    await clearButton.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('shows password toggle when showPassword is true', () => {
    const wrapper = mount(ExInput, {
      props: {
        type: 'password',
        showPassword: true,
        modelValue: 'password',
      },
    });

    expect(wrapper.find('.ex-input__password-icon').exists()).toBe(true);
  });

  it('toggles password visibility', async () => {
    const wrapper = mount(ExInput, {
      props: {
        type: 'password',
        showPassword: true,
        modelValue: 'password',
      },
    });

    const input = wrapper.find('.ex-input__control');
    expect(input.attributes('type')).toBe('password');

    const toggleButton = wrapper.find('.ex-input__password-icon');
    await toggleButton.trigger('click');
    await nextTick();

    expect(input.attributes('type')).toBe('text');
  });

  it('shows word limit when enabled', () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: 'test',
        showWordLimit: true,
        maxlength: 10,
      },
    });

    const wordLimit = wrapper.find('.ex-input__word-limit');
    expect(wordLimit.exists()).toBe(true);
    expect(wordLimit.text()).toBe('4/10');
  });

  it('renders with prefix slot', () => {
    const wrapper = mount(ExInput, {
      slots: {
        prefix: '<span class="custom-prefix">$</span>',
      },
    });

    expect(wrapper.find('.ex-input__prefix').exists()).toBe(true);
    expect(wrapper.find('.custom-prefix').exists()).toBe(true);
  });

  it('renders with suffix slot', () => {
    const wrapper = mount(ExInput, {
      slots: {
        suffix: '<span class="custom-suffix">%</span>',
      },
    });

    expect(wrapper.find('.ex-input__suffix').exists()).toBe(true);
    expect(wrapper.find('.custom-suffix').exists()).toBe(true);
  });

  it('renders with prepend content', () => {
    const wrapper = mount(ExInput, {
      props: { prepend: 'https://' },
    });

    expect(wrapper.find('.ex-input__prepend').exists()).toBe(true);
    expect(wrapper.find('.ex-input__prepend').text()).toBe('https://');
    expect(wrapper.classes()).toContain('ex-input--with-prepend');
  });

  it('renders with append content', () => {
    const wrapper = mount(ExInput, {
      props: { append: '.com' },
    });

    expect(wrapper.find('.ex-input__append').exists()).toBe(true);
    expect(wrapper.find('.ex-input__append').text()).toBe('.com');
    expect(wrapper.classes()).toContain('ex-input--with-append');
  });

  it('renders with label', () => {
    const wrapper = mount(ExInput, {
      props: {
        label: 'Username',
        required: true,
      },
    });

    const label = wrapper.find('.ex-input__label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toContain('Username');
    expect(wrapper.find('.ex-input__required').exists()).toBe(true);
  });

  it('shows help text', () => {
    const wrapper = mount(ExInput, {
      props: {
        helpText: 'Enter your username',
      },
    });

    expect(wrapper.find('.ex-input__help-text').exists()).toBe(true);
    expect(wrapper.find('.ex-input__help-text').text()).toBe('Enter your username');
  });

  it('shows error message', () => {
    const wrapper = mount(ExInput, {
      props: {
        status: 'error',
        errorMessage: 'Username is required',
      },
    });

    expect(wrapper.find('.ex-input__error').exists()).toBe(true);
    expect(wrapper.find('.ex-input__error').text()).toContain('Username is required');
  });

  it('renders as textarea', () => {
    const wrapper = mount(ExInput, {
      props: {
        type: 'textarea',
        rows: 5,
      },
    });

    expect(wrapper.classes()).toContain('ex-input--textarea');
    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('rows')).toBe('5');
  });

  it('emits input event', async () => {
    const wrapper = mount(ExInput);
    const input = wrapper.find('.ex-input__control');

    await input.setValue('test');
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input')?.[0][0]).toBe('test');
  });

  it('emits change event', async () => {
    const wrapper = mount(ExInput);
    const input = wrapper.find('.ex-input__control');

    await input.trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('emits focus and blur events', async () => {
    const wrapper = mount(ExInput);
    const input = wrapper.find('.ex-input__control');

    await input.trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    expect(wrapper.classes()).toContain('ex-input--focused');

    await input.trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('emits enter event on Enter key', async () => {
    const wrapper = mount(ExInput);
    const input = wrapper.find('.ex-input__control');

    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('enter')).toBeTruthy();
  });

  it('exposes focus method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as any;

    expect(typeof vm.focus).toBe('function');
  });

  it('exposes blur method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as any;

    expect(typeof vm.blur).toBe('function');
  });

  it('exposes select method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as any;

    expect(typeof vm.select).toBe('function');
  });

  it('exposes clear method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as any;

    expect(typeof vm.clear).toBe('function');
  });

  it('exposes getInputElement method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as { getInputElement?: () => HTMLInputElement | null };

    expect(typeof vm.getInputElement).toBe('function');
  });

  // 新增测试：验证 validate 方法
  it('exposes validate method', () => {
    const wrapper = mount(ExInput);
    const vm = wrapper.vm as any;

    expect(typeof vm.validate).toBe('function');
  });

  it('validates input with rules', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: '',
        rules: [
          (value: string) => !!value || '不能为空',
          (value: string) => value.length >= 3 || '至少3个字符',
        ],
      },
    });

    const vm = wrapper.vm as any;
    
    // 空值验证失败
    expect(vm.validate()).toBe(false);
    await nextTick();
    expect(wrapper.find('.ex-input__error').exists()).toBe(true);

    // 设置值后验证
    await wrapper.setProps({ modelValue: 'ab' });
    expect(vm.validate()).toBe(false);

    await wrapper.setProps({ modelValue: 'abc' });
    expect(vm.validate()).toBe(true);
  });

  it('emits validation-error event', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: '',
        rules: [(value: string) => !!value || '不能为空'],
      },
    });

    const input = wrapper.find('.ex-input__control');
    await input.setValue('');
    await nextTick();

    expect(wrapper.emitted('validation-error')).toBeTruthy();
  });

  // 新增测试：验证输入法支持
  it('handles composition events', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: '',
        rules: [(value: string) => value.length <= 5 || '最多5个字符'],
      },
    });

    const input = wrapper.find('.ex-input__control');

    // 开始输入法输入
    await input.trigger('compositionstart');
    await input.setValue('测试文本很长');
    await nextTick();

    // 输入法激活时不应该触发验证
    expect(wrapper.find('.ex-input__error').exists()).toBe(false);

    // 结束输入法输入
    await input.trigger('compositionend');
    await nextTick();

    // 输入法结束后应该触发验证
    expect(wrapper.emitted('validation-error')).toBeTruthy();
  });

  // 新增测试：验证国际化
  it('uses i18n for validation messages', async () => {
    const wrapper = mount(ExInput, {
      props: {
        modelValue: '',
        status: 'success',
      },
    });

    await nextTick();

    // 验证成功消息应该使用国际化
    const successText = wrapper.find('.ex-input__success-text');
    if (successText.exists()) {
      expect(successText.text()).toBeTruthy();
      expect(successText.text()).not.toBe('验证通过'); // 不应该是硬编码的文本
    }
  });

  // 新增测试：验证格式化器
  it('applies formatter and parser', async () => {
    const formatter = (value: string) => value.toUpperCase();
    const parser = (value: string) => value.toLowerCase();

    const wrapper = mount(ExInput, {
      props: {
        modelValue: '',
        formatter,
        parser,
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    });

    const input = wrapper.find('.ex-input__control');
    await input.setValue('test');
    await nextTick();

    // 实际值应该是小写（parser）
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test']);
    
    // 显示值应该是大写（formatter）
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe('TEST');
  });
});
