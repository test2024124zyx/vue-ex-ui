import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import type { FormItemInstance } from '../../../src/components/form/types';

describe('ExFormItem', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExFormItem);
      expect(wrapper.find('.ex-form-item').exists()).toBe(true);
    });

    it('renders with label', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
        },
      });
      expect(wrapper.find('.ex-form-item__label-text').text()).toContain('Username');
    });

    it('renders with prop', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          prop: 'username',
          label: 'Username',
        },
      });
      expect(wrapper.attributes('data-field')).toBe('username');
    });
  });

  describe('Label Configuration', () => {
    it('applies label width', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          labelWidth: '100px',
        },
      });
      const label = wrapper.find('.ex-form-item__label');
      expect(label.attributes('style')).toContain('width');
    });

    it('applies label align', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          labelAlign: 'left',
        },
      });
      expect(wrapper.find('.ex-form-item__label').classes()).toContain('ex-form-item__label--left');
    });

    it('applies label placement', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          labelPlacement: 'top',
        },
      });
      expect(wrapper.classes()).toContain('ex-form-item--top');
    });

    it('shows colon by default', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
        },
      });
      expect(wrapper.find('.ex-form-item__colon').exists()).toBe(true);
    });

    it('hides colon when showColon is false', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          showColon: false,
        },
      });
      expect(wrapper.find('.ex-form-item__colon').exists()).toBe(false);
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExFormItem, {
          props: { size },
        });
        expect(wrapper.classes()).toContain(`ex-form-item--${size}`);
      });
    });
  });

  describe('Required State', () => {
    it('shows required mark when required is true', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          required: true,
        },
      });
      expect(wrapper.classes()).toContain('is-required');
      expect(wrapper.findAll('.ex-form-item__required-mark')).toHaveLength(1);
    });

    it('shows required mark from rules', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          prop: 'username',
          rules: { required: true, message: 'Required' },
        },
      });
      expect(wrapper.classes()).toContain('is-required');
      expect(wrapper.find('.ex-form-item__required-mark').exists()).toBe(true);
    });

    it('keeps exactly one required mark for top labels', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          required: true,
          labelPlacement: 'top',
        },
      });

      expect(wrapper.findAll('.ex-form-item__required-mark')).toHaveLength(1);
    });
  });

  describe('Validation Status', () => {
    const statuses = ['success', 'warning', 'error', 'validating'] as const;

    statuses.forEach(status => {
      it(`renders ${status} status correctly`, () => {
        const wrapper = mount(ExFormItem, {
          props: {
            label: 'Username',
            validateStatus: status,
          },
        });
        expect(wrapper.classes()).toContain(`is-${status}`);
      });
    });
  });

  describe('Help Text', () => {
    it('renders help text', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          help: 'Enter your username',
        },
      });
      expect(wrapper.find('.ex-form-item__help').text()).toBe('Enter your username');
    });

    it('adds has-help class when help text exists', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          help: 'Enter your username',
        },
      });
      expect(wrapper.classes()).toContain('has-help');
    });
  });

  describe('Error Message', () => {
    it('renders error message', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          error: 'Username is required',
        },
      });
      expect(wrapper.find('.ex-form-item__error').text()).toBe('Username is required');
    });

    it('adds has-error-message class when error exists', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          error: 'Username is required',
        },
      });
      expect(wrapper.classes()).toContain('has-error-message');
    });

    it('hides help text when error is shown', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          help: 'Enter your username',
          error: 'Username is required',
        },
      });
      expect(wrapper.find('.ex-form-item__help').exists()).toBe(false);
      expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);
    });

    it('clears a controlled error when the error prop becomes empty', async () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          error: 'Invalid username',
        },
      });

      expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);
      await wrapper.setProps({ error: '' });

      expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
      expect(wrapper.classes()).not.toContain('is-error');
    });
  });

  describe('Feedback', () => {
    it('shows feedback when hasFeedback is true', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          hasFeedback: true,
          validateStatus: 'success',
        },
      });
      expect(wrapper.classes()).toContain('has-feedback');
      expect(wrapper.find('.ex-form-item__feedback').exists()).toBe(true);
    });

    it('shows success feedback icon', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          hasFeedback: true,
          validateStatus: 'success',
        },
      });
      expect(wrapper.find('.ex-form-item__feedback--success').exists()).toBe(true);
    });

    it('shows error feedback icon', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          hasFeedback: true,
          validateStatus: 'error',
        },
      });
      expect(wrapper.find('.ex-form-item__feedback--error').exists()).toBe(true);
    });

    it('shows warning feedback icon', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          hasFeedback: true,
          validateStatus: 'warning',
        },
      });
      expect(wrapper.find('.ex-form-item__feedback--warning').exists()).toBe(true);
    });

    it('shows validating feedback icon', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
          hasFeedback: true,
          validateStatus: 'validating',
        },
      });
      expect(wrapper.find('.ex-form-item__feedback--validating').exists()).toBe(true);
    });
  });

  describe('Form Context', () => {
    it('inherits size from form', () => {
      const wrapper = mount(ExForm, {
        props: {
          size: 'large',
        },
        slots: {
          default: '<ex-form-item label="Username" />',
        },
        global: {
          components: { ExFormItem },
        },
      });

      // Form 通过 provide/inject 传递配置
      expect(wrapper.props('size')).toBe('large');
    });

    it('inherits labelAlign from form', () => {
      const wrapper = mount(ExForm, {
        props: {
          labelAlign: 'left',
        },
        slots: {
          default: '<ex-form-item label="Username" />',
        },
        global: {
          components: { ExFormItem },
        },
      });

      // Form 通过 provide/inject 传递配置
      expect(wrapper.props('labelAlign')).toBe('left');
    });
  });

  describe('Exposed Methods', () => {
    it('exposes validate method', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          prop: 'username',
          label: 'Username',
        },
      });
      const vm = wrapper.vm as unknown as FormItemInstance;
      expect(typeof vm.validate).toBe('function');
    });

    it('exposes resetField method', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          prop: 'username',
          label: 'Username',
        },
      });
      const vm = wrapper.vm as unknown as FormItemInstance;
      expect(typeof vm.resetField).toBe('function');
    });

    it('exposes clearValidate method', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          prop: 'username',
          label: 'Username',
        },
      });
      const vm = wrapper.vm as unknown as FormItemInstance;
      expect(typeof vm.clearValidate).toBe('function');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          class: 'custom-form-item',
        },
      });
      expect(wrapper.classes()).toContain('custom-form-item');
    });

    it('applies custom style object', () => {
      const style = { padding: '20px' };
      const wrapper = mount(ExFormItem, {
        props: { style },
      });
      expect(wrapper.attributes('style')).toBeDefined();
    });
  });

  describe('Slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(ExFormItem, {
        props: {
          label: 'Username',
        },
        slots: {
          default: '<input type="text" />',
        },
      });
      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('renders label slot', () => {
      const wrapper = mount(ExFormItem, {
        slots: {
          label: '<span class="custom-label">Custom Label</span>',
        },
      });
      expect(wrapper.find('.custom-label').text()).toBe('Custom Label');
    });
  });
});
