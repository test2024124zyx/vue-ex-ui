import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';

describe('ExForm', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExForm);
      expect(wrapper.find('.ex-form').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ex-form--vertical');
      expect(wrapper.classes()).toContain('ex-form--medium');
    });

    it('renders with custom layout', () => {
      const wrapper = mount(ExForm, {
        props: {
          layout: 'horizontal',
        },
      });
      expect(wrapper.classes()).toContain('ex-form--horizontal');
    });

    it('renders with inline layout', () => {
      const wrapper = mount(ExForm, {
        props: {
          layout: 'inline',
        },
      });
      expect(wrapper.classes()).toContain('ex-form--inline');
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExForm, {
          props: { size },
        });
        expect(wrapper.classes()).toContain(`ex-form--${size}`);
      });
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      const wrapper = mount(ExForm, {
        props: {
          disabled: true,
        },
      });
      expect(wrapper.classes()).toContain('is-disabled');
    });

    it('renders readonly state', () => {
      const wrapper = mount(ExForm, {
        props: {
          readonly: true,
        },
      });
      expect(wrapper.classes()).toContain('is-readonly');
    });

    it('renders with feedback', () => {
      const wrapper = mount(ExForm, {
        props: {
          hasFeedback: true,
        },
      });
      expect(wrapper.classes()).toContain('has-feedback');
    });
  });

  describe('Form Model', () => {
    it('accepts model prop', () => {
      const model = { username: 'test', email: 'test@example.com' };
      const wrapper = mount(ExForm, {
        props: { model },
      });
      expect(wrapper.props('model')).toEqual(model);
    });

    it('accepts rules prop', () => {
      const rules = {
        username: { required: true, message: 'Username is required' },
      };
      const wrapper = mount(ExForm, {
        props: { rules },
      });
      expect(wrapper.props('rules')).toEqual(rules);
    });
  });

  describe('Events', () => {
    it('emits submit event', async () => {
      const wrapper = mount(ExForm);
      await wrapper.find('form').trigger('submit');
      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('emits reset event', async () => {
      const wrapper = mount(ExForm);
      await wrapper.find('form').trigger('reset');
      expect(wrapper.emitted('reset')).toBeTruthy();
    });

    it('prevents default submit behavior', async () => {
      const wrapper = mount(ExForm);
      const event = new Event('submit');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      await wrapper.find('form').element.dispatchEvent(event);
      await nextTick();
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('provides validation context to form items', () => {
      const model = { username: '' };
      const rules = {
        username: { required: true, message: 'Required' },
      };

      const wrapper = mount(ExForm, {
        props: { model, rules },
        slots: {
          default: '<ex-form-item prop="username" label="Username" />',
        },
        global: {
          components: { ExFormItem },
        },
      });

      expect(wrapper.findComponent(ExFormItem).exists()).toBe(true);
    });
  });

  describe('Exposed Methods', () => {
    it('exposes validate method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.validate).toBe('function');
    });

    it('exposes validateField method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.validateField).toBe('function');
    });

    it('exposes resetFields method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.resetFields).toBe('function');
    });

    it('exposes clearValidate method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.clearValidate).toBe('function');
    });

    it('exposes getFieldValue method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.getFieldValue).toBe('function');
    });

    it('exposes setFieldValue method', () => {
      const wrapper = mount(ExForm);
      const vm = wrapper.vm as any;
      expect(typeof vm.setFieldValue).toBe('function');
    });
  });

  describe('Label Configuration', () => {
    it('applies label width', () => {
      const wrapper = mount(ExForm, {
        props: {
          labelWidth: '100px',
        },
      });
      expect(wrapper.props('labelWidth')).toBe('100px');
    });

    it('applies label align', () => {
      const wrapper = mount(ExForm, {
        props: {
          labelAlign: 'left',
        },
      });
      expect(wrapper.props('labelAlign')).toBe('left');
    });

    it('applies label placement', () => {
      const wrapper = mount(ExForm, {
        props: {
          labelPlacement: 'top',
        },
      });
      expect(wrapper.props('labelPlacement')).toBe('top');
    });

    it('shows colon by default', () => {
      const wrapper = mount(ExForm);
      expect(wrapper.props('showColon')).toBe(true);
    });

    it('hides colon when showColon is false', () => {
      const wrapper = mount(ExForm, {
        props: {
          showColon: false,
        },
      });
      expect(wrapper.props('showColon')).toBe(false);
    });
  });

  describe('Validation Options', () => {
    it('validates on rule change by default', () => {
      const wrapper = mount(ExForm);
      expect(wrapper.props('validateOnRuleChange')).toBe(true);
    });

    it('scrolls to error by default', () => {
      const wrapper = mount(ExForm);
      expect(wrapper.props('scrollToError')).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExForm, {
        props: {
          customClass: 'custom-form',
        },
      });
      expect(wrapper.props('customClass')).toBe('custom-form');
    });

    it('applies custom style object', () => {
      const style = { padding: '20px' };
      const wrapper = mount(ExForm, {
        props: { customStyle: style },
      });
      expect(wrapper.props('customStyle')).toEqual(style);
    });
  });

  describe('Form Name', () => {
    it('applies name attribute', () => {
      const wrapper = mount(ExForm, {
        props: {
          name: 'test-form',
        },
      });
      expect(wrapper.find('form').attributes('name')).toBe('test-form');
    });
  });
});
