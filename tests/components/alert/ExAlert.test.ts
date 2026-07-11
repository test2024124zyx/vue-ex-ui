import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExAlert from '../../../src/components/alert/ExAlert.vue';

describe('ExAlert', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert Title',
        },
      });

      expect(wrapper.find('.ex-alert').exists()).toBe(true);
      expect(wrapper.text()).toContain('Alert Title');
    });

    it('renders with description', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Title',
          description: 'This is a description',
        },
      });

      expect(wrapper.find('.ex-alert__description').exists()).toBe(true);
      expect(wrapper.text()).toContain('This is a description');
    });

    it('renders with default slot', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Title',
        },
        slots: {
          default: 'Slot content',
        },
      });

      expect(wrapper.text()).toContain('Slot content');
    });
  });

  describe('Types', () => {
    const types: Array<'success' | 'info' | 'warning' | 'error'> = [
      'success',
      'info',
      'warning',
      'error',
    ];

    types.forEach(type => {
      it(`renders ${type} type correctly`, () => {
        const wrapper = mount(ExAlert, {
          props: {
            type,
            title: 'Alert',
          },
        });

        expect(wrapper.find('.ex-alert').classes()).toContain(`ex-alert--${type}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExAlert, {
          props: {
            size,
            title: 'Alert',
          },
        });

        expect(wrapper.find('.ex-alert').classes()).toContain(`ex-alert--${size}`);
      });
    });
  });

  describe('Variants', () => {
    const variants: Array<'standard' | 'filled' | 'outlined'> = ['standard', 'filled', 'outlined'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const wrapper = mount(ExAlert, {
          props: {
            variant,
            title: 'Alert',
          },
        });

        expect(wrapper.find('.ex-alert').classes()).toContain(`ex-alert--${variant}`);
      });
    });
  });

  describe('Icon', () => {
    it('shows icon by default', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      expect(wrapper.find('.ex-alert__icon').exists()).toBe(true);
    });

    it('hides icon when showIcon is false', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          showIcon: false,
        },
      });

      expect(wrapper.find('.ex-alert__icon').exists()).toBe(false);
    });

    it('renders custom icon slot', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
        slots: {
          icon: '<span class="custom-icon">Icon</span>',
        },
      });

      expect(wrapper.find('.custom-icon').exists()).toBe(true);
    });
  });

  describe('Closable', () => {
    it('does not show close button by default', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      expect(wrapper.find('.ex-alert__close').exists()).toBe(false);
    });

    it('shows close button when closable is true', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      expect(wrapper.find('.ex-alert__close').exists()).toBe(true);
    });

    it('closes alert when close button is clicked', async () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      const closeBtn = wrapper.find('.ex-alert__close');
      await closeBtn.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.find('.ex-alert').isVisible()).toBe(false);
    });

    it('renders custom close text', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
          closeText: 'Dismiss',
        },
      });

      expect(wrapper.text()).toContain('Dismiss');
    });

    it('renders custom close slot', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
        slots: {
          close: '<span class="custom-close">X</span>',
        },
      });

      expect(wrapper.find('.custom-close').exists()).toBe(true);
    });

    it('uses a native button so keyboard activation follows browser semantics', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      const closeBtn = wrapper.find('.ex-alert__close');
      expect(closeBtn.element.tagName).toBe('BUTTON');
      expect(closeBtn.attributes('type')).toBe('button');
    });

    it('close 事件始终提供 MouseEvent 而不是伪造的类型断言', async () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      await wrapper.find('.ex-alert__close').trigger('click');

      expect(wrapper.emitted('close')?.[0]?.[0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe('Center', () => {
    it('centers content when center is true', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          center: true,
        },
      });

      expect(wrapper.find('.ex-alert').classes()).toContain('ex-alert--center');
    });
  });

  describe('Bordered', () => {
    it('shows border by default', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      expect(wrapper.find('.ex-alert').classes()).not.toContain('ex-alert--borderless');
    });

    it('hides border when bordered is false', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          bordered: false,
        },
      });

      expect(wrapper.find('.ex-alert').classes()).toContain('ex-alert--borderless');
    });
  });

  describe('Slots', () => {
    it('renders title slot', () => {
      const wrapper = mount(ExAlert, {
        slots: {
          title: '<strong>Custom Title</strong>',
        },
      });

      expect(wrapper.find('strong').exists()).toBe(true);
      expect(wrapper.text()).toContain('Custom Title');
    });

    it('renders action slot', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
        slots: {
          action: '<button class="action-btn">Action</button>',
        },
      });

      expect(wrapper.find('.action-btn').exists()).toBe(true);
      expect(wrapper.find('.ex-alert__action').exists()).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          customClass: 'custom-alert',
        },
      });

      expect(wrapper.find('.ex-alert').classes()).toContain('custom-alert');
    });

    it('applies custom style', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          customStyle: { color: 'red' },
        },
      });

      expect(wrapper.find('.ex-alert').attributes('style')).toContain('color: red');
    });
  });

  describe('Exposed Methods', () => {
    it('exposes close method', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.close).toBe('function');
    });

    it('close method hides alert', async () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      const vm = wrapper.vm as any;
      vm.close();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ex-alert').isVisible()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has correct role', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
        },
      });

      expect(wrapper.find('.ex-alert').attributes('role')).toBe('alert');
    });

    it('has correct aria-live for error', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          type: 'error',
        },
      });

      expect(wrapper.find('.ex-alert').attributes('aria-live')).toBe('assertive');
    });

    it('has correct aria-live for non-error', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          type: 'info',
        },
      });

      expect(wrapper.find('.ex-alert').attributes('aria-live')).toBe('polite');
    });

    it('close button has aria-label', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      const closeBtn = wrapper.find('.ex-alert__close');
      expect(closeBtn.attributes('aria-label')).toBeTruthy();
    });

    it('close button is keyboard accessible', () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      const closeBtn = wrapper.find('.ex-alert__close');
      expect(closeBtn.element.tagName).toBe('BUTTON');
      expect(closeBtn.attributes('type')).toBe('button');
    });
  });

  describe('Events', () => {
    it('emits close event', async () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      await wrapper.find('.ex-alert__close').trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits afterClose event after transition', async () => {
      const wrapper = mount(ExAlert, {
        props: {
          title: 'Alert',
          closable: true,
        },
      });

      const vm = wrapper.vm as any;
      vm.close();
      await wrapper.vm.$nextTick();

      // 模拟过渡结束
      const transition = wrapper.findComponent({ name: 'transition' });
      await transition.vm.$emit('after-leave');

      expect(wrapper.emitted('afterClose')).toBeTruthy();
    });
  });
});
