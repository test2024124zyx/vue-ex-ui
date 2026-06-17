import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSwitch from '../../../src/components/switch/ExSwitch.vue';

describe('ExSwitch', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(ExSwitch);
      expect(wrapper.find('.ex-switch').exists()).toBe(true);
      expect(wrapper.find('.ex-switch__core').exists()).toBe(true);
      expect(wrapper.find('.ex-switch__action').exists()).toBe(true);
      expect(wrapper.find('.ex-switch__input').exists()).toBe(true);
    });

    it('should render with default props', () => {
      const wrapper = mount(ExSwitch);
      expect(wrapper.classes()).toContain('ex-switch--medium');
      expect(wrapper.find('input').element.checked).toBe(false);
    });

    it('should render with custom class and style', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          class: 'custom-switch',
          style: { margin: '10px' },
        },
      });
      expect(wrapper.classes()).toContain('custom-switch');
      expect(wrapper.attributes('style')).toContain('margin: 10px');
    });
  });

  // 尺寸测试
  describe('Size', () => {
    it('should render small size', () => {
      const wrapper = mount(ExSwitch, {
        props: { size: 'small' },
      });
      expect(wrapper.classes()).toContain('ex-switch--small');
    });

    it('should render medium size', () => {
      const wrapper = mount(ExSwitch, {
        props: { size: 'medium' },
      });
      expect(wrapper.classes()).toContain('ex-switch--medium');
    });

    it('should render large size', () => {
      const wrapper = mount(ExSwitch, {
        props: { size: 'large' },
      });
      expect(wrapper.classes()).toContain('ex-switch--large');
    });
  });

  // 状态测试
  describe('State', () => {
    it('should be checked when modelValue equals activeValue', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: true,
          activeValue: true,
          inactiveValue: false,
        },
      });
      expect(wrapper.classes()).toContain('is-checked');
      expect(wrapper.find('input').element.checked).toBe(true);
    });

    it('should be unchecked when modelValue equals inactiveValue', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });
      expect(wrapper.classes()).not.toContain('is-checked');
      expect(wrapper.find('input').element.checked).toBe(false);
    });

    it('should work with custom active/inactive values', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: 'yes',
          activeValue: 'yes',
          inactiveValue: 'no',
        },
      });
      expect(wrapper.classes()).toContain('is-checked');
      expect(wrapper.find('input').element.checked).toBe(true);
    });

    it('should be disabled', () => {
      const wrapper = mount(ExSwitch, {
        props: { disabled: true },
      });
      expect(wrapper.classes()).toContain('is-disabled');
      expect(wrapper.find('input').element.disabled).toBe(true);
    });

    it('should be loading', () => {
      const wrapper = mount(ExSwitch, {
        props: { loading: true },
      });
      expect(wrapper.classes()).toContain('is-loading');
      expect(wrapper.find('.ex-switch__loading').exists()).toBe(true);
      expect(wrapper.find('.ex-switch__spinner').exists()).toBe(true);
    });
  });

  // 文本标签测试
  describe('Text Labels', () => {
    it('should render active and inactive text', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          activeText: 'On',
          inactiveText: 'Off',
        },
      });
      expect(wrapper.classes()).toContain('has-text');
      expect(wrapper.find('.ex-switch__label--left').text()).toBe('Off');
      expect(wrapper.find('.ex-switch__label--right').text()).toBe('On');
    });

    it('should render inline prompt text', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          activeText: 'On',
          inactiveText: 'Off',
          inlinePrompt: true,
        },
      });
      expect(wrapper.classes()).toContain('has-inline-prompt');
      expect(wrapper.find('.ex-switch__inner').exists()).toBe(true);
      expect(wrapper.find('.ex-switch__inner-text').text()).toBe('Off');
    });

    it('should show active text when checked with inline prompt', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: true,
          activeText: 'On',
          inactiveText: 'Off',
          inlinePrompt: true,
        },
      });
      expect(wrapper.find('.ex-switch__inner-text').text()).toBe('On');
    });
  });

  // 交互测试
  describe('Interaction', () => {
    it('should emit update:modelValue when clicked', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0]).toEqual([true]);
    });

    it('should emit change event when input changes', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });

      const input = wrapper.find('input');
      await input.setValue(true);
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0]).toEqual([true]);
    });

    it('should not emit events when disabled', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          disabled: true,
        },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('should not emit events when loading', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          loading: true,
        },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('should handle keyboard events', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });

      const input = wrapper.find('input');

      // 第一次按Space键，从false切换到true
      await input.trigger('keydown', { code: 'Space' });
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);

      // 更新props以模拟v-model的变化
      await wrapper.setProps({ modelValue: true });

      // 第二次按Enter键，从true切换到false
      await input.trigger('keydown', { code: 'Enter' });
      expect(wrapper.emitted('update:modelValue')![1]).toEqual([false]);
    });
  });

  // 焦点测试
  describe('Focus', () => {
    it('should emit focus event', async () => {
      const wrapper = mount(ExSwitch);
      const input = wrapper.find('input');

      await input.trigger('focus');
      expect(wrapper.classes()).toContain('is-focused');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('should emit blur event', async () => {
      const wrapper = mount(ExSwitch);
      const input = wrapper.find('input');

      await input.trigger('focus');
      await input.trigger('blur');
      expect(wrapper.classes()).not.toContain('is-focused');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  // 验证状态测试
  describe('Validation Status', () => {
    it('should render error status', () => {
      const wrapper = mount(ExSwitch, {
        props: { validateStatus: 'error' },
      });
      expect(wrapper.classes()).toContain('is-error');
    });

    it('should render warning status', () => {
      const wrapper = mount(ExSwitch, {
        props: { validateStatus: 'warning' },
      });
      expect(wrapper.classes()).toContain('is-warning');
    });

    it('should render success status', () => {
      const wrapper = mount(ExSwitch, {
        props: { validateStatus: 'success' },
      });
      expect(wrapper.classes()).toContain('is-success');
    });
  });

  // 自定义颜色测试
  describe('Custom Colors', () => {
    it('should apply active color when checked', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: true,
          activeColor: '#ff0000',
        },
      });
      const core = wrapper.find('.ex-switch__core');
      expect(core.attributes('style')).toContain('background-color: rgb(255, 0, 0)');
    });

    it('should apply inactive color when unchecked', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          inactiveColor: '#00ff00',
        },
      });
      const core = wrapper.find('.ex-switch__core');
      expect(core.attributes('style')).toContain('background-color: rgb(0, 255, 0)');
    });
  });

  // 宽度测试
  describe('Width', () => {
    it('should apply custom width as number', () => {
      const wrapper = mount(ExSwitch, {
        props: { width: 100 },
      });
      expect(wrapper.attributes('style')).toContain('width: 100px');
    });

    it('should apply custom width as string', () => {
      const wrapper = mount(ExSwitch, {
        props: { width: '200px' },
      });
      expect(wrapper.attributes('style')).toContain('width: 200px');
    });
  });

  // 插槽测试
  describe('Slots', () => {
    it('should render active slot content', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: true,
          inlinePrompt: true,
        },
        slots: {
          active: '<span class="custom-active">ON</span>',
        },
      });
      expect(wrapper.find('.custom-active').exists()).toBe(true);
      expect(wrapper.find('.custom-active').text()).toBe('ON');
    });

    it('should render inactive slot content', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          inlinePrompt: true,
        },
        slots: {
          inactive: '<span class="custom-inactive">OFF</span>',
        },
      });
      expect(wrapper.find('.custom-inactive').exists()).toBe(true);
      expect(wrapper.find('.custom-inactive').text()).toBe('OFF');
    });
  });

  // 暴露方法测试
  describe('Exposed Methods', () => {
    it('should expose focus method', () => {
      const wrapper = mount(ExSwitch);
      const focusSpy = vi.spyOn(wrapper.find('input').element, 'focus');

      (wrapper.vm as any).focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should expose blur method', () => {
      const wrapper = mount(ExSwitch);
      const blurSpy = vi.spyOn(wrapper.find('input').element, 'blur');

      (wrapper.vm as any).blur();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('should expose toggle method', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });

      (wrapper.vm as any).toggle();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
    });

    it('should not toggle when disabled', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          disabled: true,
        },
      });

      (wrapper.vm as any).toggle();
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('should not toggle when loading', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          loading: true,
        },
      });

      (wrapper.vm as any).toggle();
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  // 无障碍测试
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(ExSwitch, {
        props: {
          id: 'test-switch',
          name: 'test',
          ariaLabel: 'Test switch',
          ariaDescribedby: 'test-desc',
        },
      });

      const input = wrapper.find('input');
      expect(input.attributes('id')).toBe('test-switch');
      expect(input.attributes('name')).toBe('test');
      expect(input.attributes('aria-label')).toBe('Test switch');
      expect(input.attributes('aria-describedby')).toBe('test-desc');
    });

    it('should be keyboard accessible', async () => {
      const wrapper = mount(ExSwitch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      });

      const input = wrapper.find('input');

      // 测试 Space 键
      await input.trigger('keydown', { code: 'Space' });
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);

      // 同步父级 v-model 后测试 Enter 键
      await wrapper.setProps({ modelValue: true });
      await input.trigger('keydown', { code: 'Enter' });
      await nextTick();
      expect(wrapper.emitted('update:modelValue')![1]).toEqual([false]);
    });
  });
});
