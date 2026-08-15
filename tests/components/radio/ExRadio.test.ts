import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import type { ExRadioInstance, ExRadioProps } from '../../../src/components/radio/types';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExRadio', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: {
          default: 'Radio Label',
        },
      });

      expect(wrapper.find('.ex-radio').exists()).toBe(true);
      expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Radio Label');
    });

    it('renders with label prop', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          label: 'Test Label',
        },
      });

      expect(wrapper.text()).toContain('Test Label');
    });

    it('renders without label', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
      });

      expect(wrapper.find('.ex-radio__label-text').exists()).toBe(false);
    });
  });

  // 尺寸测试
  describe('Sizes', () => {
    const sizes: ExRadioProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExRadio, {
          props: { value: 'test', size },
          slots: { default: 'Radio' },
        });

        expect(wrapper.classes()).toContain(`ex-radio--${size}`);
      });
    });
  });

  // 状态测试
  describe('Status', () => {
    const statuses: ExRadioProps['status'][] = ['default', 'success', 'warning', 'error'];

    statuses.forEach(status => {
      it(`renders ${status} status correctly`, () => {
        const wrapper = mount(ExRadio, {
          props: { value: 'test', status },
          slots: { default: 'Radio' },
        });

        expect(wrapper.classes()).toContain(`ex-radio--${status}`);
      });
    });
  });

  // v-model 测试
  describe('v-model', () => {
    it('updates modelValue on click', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          modelValue: '',
          value: 'test',
          'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.setValue(true);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test']);
    });

    it('reflects checked state correctly', () => {
      const wrapper = mount(ExRadio, {
        props: {
          modelValue: 'test',
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.classes()).toContain('ex-radio--checked');
      expect(wrapper.find('.ex-radio__box--checked').exists()).toBe(true);
      expect(wrapper.find('.ex-radio__dot').exists()).toBe(true);
    });

    it('does not check when value does not match', () => {
      const wrapper = mount(ExRadio, {
        props: {
          modelValue: 'other',
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.classes()).not.toContain('ex-radio--checked');
      expect(wrapper.find('.ex-radio__dot').exists()).toBe(false);
    });
  });

  // 禁用状态测试
  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          disabled: true,
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.classes()).toContain('ex-radio--disabled');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          disabled: true,
          modelValue: '',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.trigger('change');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 只读状态测试
  describe('Readonly State', () => {
    it('renders readonly state correctly', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          readonly: true,
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.classes()).toContain('ex-radio--readonly');
      expect(wrapper.find('input').attributes('readonly')).toBeDefined();
    });

    it('does not emit events when readonly', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          readonly: true,
          modelValue: '',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.trigger('change');

      // readonly 状态下不应该触发 change 事件
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 事件测试
  describe('Events', () => {
    it('emits change event with correct value', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          modelValue: '',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.setValue(true);

      expect(wrapper.emitted('change')?.[0][0]).toBe('test');
    });

    it('emits focus event', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
      expect(wrapper.classes()).toContain('ex-radio--focused');
    });

    it('emits blur event', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.trigger('focus');
      await input.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
      expect(wrapper.classes()).not.toContain('ex-radio--focused');
    });
  });

  // 帮助文本和错误信息测试
  describe('Help Text and Error Message', () => {
    it('renders help text', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          helpText: 'This is help text',
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.text()).toContain('This is help text');
      expect(wrapper.find('.ex-radio__help').exists()).toBe(true);
    });

    it('renders error message', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          errorMessage: 'This field is required',
          status: 'error',
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.text()).toContain('This field is required');
      expect(wrapper.find('.ex-radio__error').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ex-radio--error');
    });

    it('renders help text slot', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: {
          default: 'Radio',
          help: 'Custom help text',
        },
      });

      expect(wrapper.text()).toContain('Custom help text');
    });

    it('renders error slot', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          status: 'error',
        },
        slots: {
          default: 'Radio',
          error: 'Custom error message',
        },
      });

      expect(wrapper.text()).toContain('Custom error message');
    });
  });

  // 表单验证测试
  describe('Form Validation', () => {
    it('validates with rules', async () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          modelValue: 'test',
          rules: [(value: string) => value === 'test' || 'Must be test'],
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      await input.trigger('change');

      expect(wrapper.find('.ex-radio__error').exists()).toBe(false);
    });
  });

  // 必填标记测试
  describe('Required', () => {
    it('renders required indicator', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          required: true,
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });
  });

  // 自定义样式测试
  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          customClass: 'custom-radio',
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.classes()).toContain('custom-radio');
    });

    it('applies custom style', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          customStyle: { color: 'red' },
        },
        slots: { default: 'Radio' },
      });

      expect(wrapper.attributes('style')).toContain('color: red');
    });
  });

  // 暴露方法测试
  describe('Exposed Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const vm = wrapper.vm as unknown as ExRadioInstance;
      expect(typeof vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const vm = wrapper.vm as unknown as ExRadioInstance;
      expect(typeof vm.blur).toBe('function');
    });

    it('exposes getRadioElement method', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const vm = wrapper.vm as unknown as { getRadioElement: () => HTMLInputElement | null };
      expect(typeof vm.getRadioElement).toBe('function');
    });
  });

  // ARIA 属性测试
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          helpText: 'Help text',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('aria-describedby')).toBeTruthy();
    });

    it('sets aria-invalid when error', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          errorMessage: 'Error',
          status: 'error',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('aria-invalid')).toBe('true');
    });
  });

  // Name 属性测试
  describe('Name Attribute', () => {
    it('uses provided name', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
          name: 'test-group',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('name')).toBe('test-group');
    });

    it('generates unique name when not provided', () => {
      const wrapper = mount(ExRadio, {
        props: {
          value: 'test',
        },
        slots: { default: 'Radio' },
      });

      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('name')).toMatch(/^radio-ex-radio-/);
    });
  });
});
