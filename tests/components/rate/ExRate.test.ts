import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ExRate from '../../../src/components/rate/ExRate.vue';
import type { ExRateProps } from '../../../src/components/rate/types';

describe('ExRate', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ============================================================================
  // 基础渲染测试
  // ============================================================================
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = mount(ExRate);

      expect(wrapper.find('.ex-rate').exists()).toBe(true);
      expect(wrapper.findAll('.ex-rate__star')).toHaveLength(5);
    });

    it('renders with custom max value', () => {
      wrapper = mount(ExRate, {
        props: {
          max: 10,
        },
      });

      expect(wrapper.findAll('.ex-rate__star')).toHaveLength(10);
    });

    it('renders with initial value', () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 3,
        },
      });

      const activeStars = wrapper.findAll('.ex-rate__star.is-active');
      expect(activeStars).toHaveLength(3);
    });
  });

  // ============================================================================
  // 尺寸变体测试
  // ============================================================================
  describe('Sizes', () => {
    const sizes: ExRateProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        wrapper = mount(ExRate, {
          props: { size },
        });

        expect(wrapper.classes()).toContain(`ex-rate--${size}`);
      });
    });
  });

  // ============================================================================
  // 交互测试
  // ============================================================================
  describe('Interaction', () => {
    it('updates value on click', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 0,
          'onUpdate:modelValue': (value: number) =>
            wrapper.setProps({ modelValue: value }),
        },
      });

      const stars = wrapper.findAll('.ex-rate__star');
      await stars[2].trigger('click');

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3]);
      expect(wrapper.emitted('change')?.[0]).toEqual([3]);
    });

    it('does not update when disabled', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 0,
          disabled: true,
        },
      });

      const stars = wrapper.findAll('.ex-rate__star');
      await stars[2].trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('does not update when readonly', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 3,
          readonly: true,
        },
      });

      const stars = wrapper.findAll('.ex-rate__star');
      await stars[4].trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  // ============================================================================
  // 分数显示测试
  // ============================================================================
  describe('Score Display', () => {
    it('shows score when showScore is true', () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 3,
          showScore: true,
        },
      });

      expect(wrapper.find('.ex-rate__text').exists()).toBe(true);
      expect(wrapper.find('.ex-rate__text').text()).toBe('3');
    });

    it('uses custom score template', () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 4,
          showScore: true,
          scoreTemplate: '{value} 分',
        },
      });

      expect(wrapper.find('.ex-rate__text').text()).toBe('4 分');
    });

    it('shows text when showText is true', () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 3,
          showText: true,
          texts: ['极差', '失望', '一般', '满意', '惊喜'],
        },
      });

      expect(wrapper.find('.ex-rate__text').exists()).toBe(true);
      expect(wrapper.find('.ex-rate__text').text()).toBe('一般');
    });
  });

  // ============================================================================
  // 禁用状态测试
  // ============================================================================
  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      wrapper = mount(ExRate, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.classes()).toContain('is-disabled');
    });
  });

  // ============================================================================
  // 只读状态测试
  // ============================================================================
  describe('Readonly State', () => {
    it('renders readonly state correctly', () => {
      wrapper = mount(ExRate, {
        props: {
          readonly: true,
        },
      });

      expect(wrapper.classes()).toContain('is-readonly');
    });
  });

  // ============================================================================
  // 暴露方法测试
  // ============================================================================
  describe('Exposed Methods', () => {
    it('exposes setCurrentValue method', () => {
      wrapper = mount(ExRate);
      const vm = wrapper.vm as any;

      expect(typeof vm.setCurrentValue).toBe('function');
    });

    it('exposes resetCurrentValue method', () => {
      wrapper = mount(ExRate);
      const vm = wrapper.vm as any;

      expect(typeof vm.resetCurrentValue).toBe('function');
    });

    it('setCurrentValue works correctly', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 0,
        },
      });
      const vm = wrapper.vm as any;

      vm.setCurrentValue(4);
      await wrapper.vm.$nextTick();

      const activeStars = wrapper.findAll('.ex-rate__star.is-active');
      expect(activeStars).toHaveLength(4);
    });

    it('resetCurrentValue works correctly', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 3,
        },
      });
      const vm = wrapper.vm as any;

      vm.resetCurrentValue();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0]);
    });
  });
});
