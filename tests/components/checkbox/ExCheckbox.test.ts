import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import type { ExCheckboxProps } from '../../../src/components/checkbox/types';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExCheckbox', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExCheckbox, {
        slots: {
          default: 'Checkbox Label',
        },
      });

      expect(wrapper.find('.ex-checkbox').exists()).toBe(true);
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Checkbox Label');
    });

    it('renders with label prop', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          label: 'Test Label',
        },
      });

      expect(wrapper.text()).toContain('Test Label');
    });

    it('renders without label', () => {
      const wrapper = mount(ExCheckbox);

      expect(wrapper.find('.ex-checkbox__label-text').exists()).toBe(false);
    });
  });

  // 尺寸测试
  describe('Sizes', () => {
    const sizes: ExCheckboxProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExCheckbox, {
          props: { size },
          slots: { default: 'Checkbox' },
        });

        expect(wrapper.classes()).toContain(`ex-checkbox--${size}`);
      });
    });
  });

  // 状态测试
  describe('Status', () => {
    const statuses: ExCheckboxProps['status'][] = [
      'default',
      'success',
      'warning',
      'error',
    ];

    statuses.forEach((status) => {
      it(`renders ${status} status correctly`, () => {
        const wrapper = mount(ExCheckbox, {
          props: { status },
          slots: { default: 'Checkbox' },
        });

        expect(wrapper.classes()).toContain(`ex-checkbox--${status}`);
      });
    });
  });

  // v-model 测试
  describe('v-model', () => {
    it('updates modelValue on click', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
          'onUpdate:modelValue': (value: boolean) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.setValue(true);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('works with custom true/false values', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: 'no',
          trueValue: 'yes',
          falseValue: 'no',
          'onUpdate:modelValue': (value: string) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.setValue(true);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['yes']);
    });

    it('reflects checked state correctly', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.classes()).toContain('ex-checkbox--checked');
      expect(wrapper.find('.ex-checkbox__box--checked').exists()).toBe(true);
    });
  });

  // 禁用状态测试
  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          disabled: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.classes()).toContain('ex-checkbox--disabled');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          disabled: true,
          modelValue: false,
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('change');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 只读状态测试
  describe('Readonly State', () => {
    it('renders readonly state correctly', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          readonly: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.classes()).toContain('ex-checkbox--readonly');
      expect(wrapper.find('input').attributes('readonly')).toBeDefined();
    });

    it('prevents value change when readonly', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          readonly: true,
          modelValue: false,
          'onUpdate:modelValue': (value: boolean) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('change');

      // readonly 状态下，值不应该改变
      expect(wrapper.props('modelValue')).toBe(false);
      // change 事件不应该被触发
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 中间状态测试
  describe('Indeterminate State', () => {
    it('renders indeterminate state correctly', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          indeterminate: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.classes()).toContain('ex-checkbox--indeterminate');
      expect(wrapper.find('.ex-checkbox__box--indeterminate').exists()).toBe(
        true
      );
    });

    it('shows indeterminate icon', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          indeterminate: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(
        wrapper.find('.ex-checkbox__indeterminate-icon').exists()
      ).toBe(true);
    });
  });

  // 事件测试
  describe('Events', () => {
    it('emits change event with correct value', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.setValue(true);

      expect(wrapper.emitted('change')?.[0][0]).toBe(true);
    });

    it('emits focus event', async () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
      expect(wrapper.classes()).toContain('ex-checkbox--focused');
    });

    it('emits blur event', async () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('focus');
      await input.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
      expect(wrapper.classes()).not.toContain('ex-checkbox--focused');
    });
  });

  // 键盘导航测试
  describe('Keyboard Navigation', () => {
    it('toggles on Space key', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('keydown', { code: 'Space' });

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('does not toggle on Space when disabled', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
          disabled: true,
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('keydown', { code: 'Space' });

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  // 帮助文本和错误信息测试
  describe('Help Text and Error Message', () => {
    it('renders help text', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          helpText: 'This is help text',
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.text()).toContain('This is help text');
      expect(wrapper.find('.ex-checkbox__help').exists()).toBe(true);
    });

    it('renders error message', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          errorMessage: 'This field is required',
          status: 'error',
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.text()).toContain('This field is required');
      expect(wrapper.find('.ex-checkbox__error').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ex-checkbox--error');
    });

    it('renders help text slot', () => {
      const wrapper = mount(ExCheckbox, {
        slots: {
          default: 'Checkbox',
          help: 'Custom help text',
        },
      });

      expect(wrapper.text()).toContain('Custom help text');
    });

    it('renders error slot', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          status: 'error',
        },
        slots: {
          default: 'Checkbox',
          error: 'Custom error message',
        },
      });

      expect(wrapper.text()).toContain('Custom error message');
    });
  });

  // 表单验证测试
  describe('Form Validation', () => {
    it('validates with rules', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
          rules: [(value: boolean) => value === true || 'Must be checked'],
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.setValue(true);

      // 验证通过，不应该有错误信息
      expect(wrapper.find('.ex-checkbox__error').exists()).toBe(false);
    });

    it('shows validation error', async () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          modelValue: false,
          rules: [(value: boolean) => value === true || 'Must be checked'],
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      await input.trigger('change');

      // 等待下一个 tick
      await wrapper.vm.$nextTick();

      // 验证失败，应该有错误信息
      expect(wrapper.find('.ex-checkbox__error').exists()).toBe(true);
    });
  });

  // 必填标记测试
  describe('Required', () => {
    it('renders required indicator', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          required: true,
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });
  });

  // 自定义样式测试
  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          customClass: 'custom-checkbox',
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.classes()).toContain('custom-checkbox');
    });

    it('applies custom style', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          customStyle: { color: 'red' },
        },
        slots: { default: 'Checkbox' },
      });

      expect(wrapper.attributes('style')).toContain('color: red');
    });
  });

  // 暴露方法测试
  describe('Exposed Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.blur).toBe('function');
    });

    it('exposes getCheckboxElement method', () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.getCheckboxElement).toBe('function');
    });
  });

  // ARIA 属性测试
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          helpText: 'Help text',
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      expect(input.attributes('aria-describedby')).toBeTruthy();
    });

    it('sets aria-invalid when error', () => {
      const wrapper = mount(ExCheckbox, {
        props: {
          errorMessage: 'Error',
          status: 'error',
        },
        slots: { default: 'Checkbox' },
      });

      const input = wrapper.find('input[type="checkbox"]');
      expect(input.attributes('aria-invalid')).toBe('true');
    });
  });
});
