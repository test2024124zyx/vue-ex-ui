import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { h, reactive } from 'vue';
import ExRate from '../../../src/components/rate/ExRate.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { ExRateInstance, ExRateProps } from '../../../src/components/rate/types';

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

    sizes.forEach(size => {
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
          'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
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
      const vm = wrapper.vm as unknown as ExRateInstance;

      expect(typeof vm.setCurrentValue).toBe('function');
    });

    it('exposes resetCurrentValue method', () => {
      wrapper = mount(ExRate);
      const vm = wrapper.vm as unknown as ExRateInstance;

      expect(typeof vm.resetCurrentValue).toBe('function');
    });

    it('setCurrentValue works correctly', async () => {
      wrapper = mount(ExRate, {
        props: {
          modelValue: 0,
          'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
        },
      });
      const vm = wrapper.vm as unknown as ExRateInstance;

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
      const vm = wrapper.vm as unknown as ExRateInstance;

      vm.resetCurrentValue();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0]);
    });

    it('禁用或只读时公开写方法不会绕过交互约束', async () => {
      wrapper = mount(ExRate, { props: { modelValue: 3, disabled: true } });
      const vm = wrapper.vm as unknown as ExRateInstance;

      vm.setCurrentValue(5);
      vm.resetCurrentValue();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('.ex-rate__star.is-active')).toHaveLength(3);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();

      await wrapper.setProps({ disabled: false, readonly: true });
      vm.setCurrentValue(5);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('公开写方法按 max 与半星步长规范化值', async () => {
      wrapper = mount(ExRate, { props: { modelValue: 0, max: 5, allowHalf: true } });
      const vm = wrapper.vm as unknown as ExRateInstance;

      vm.setCurrentValue(1.3);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1.5]);
      vm.setCurrentValue(99);
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5]);
    });
  });

  describe('FormItem integration', () => {
    it('继承表单禁用、标签与错误描述，并阻止鼠标修改', async () => {
      const model = reactive({ score: 0 });
      wrapper = mount(ExForm, {
        props: { model, disabled: true },
        slots: {
          default: () =>
            h(
              ExFormItem,
              { prop: 'score', label: '满意度', error: '请选择评分' },
              { default: () => h(ExRate, { modelValue: model.score }) }
            ),
        },
      });
      const rate = wrapper.get('.ex-rate');
      const label = wrapper.get('.ex-form-item__label');
      const error = wrapper.get('.ex-form-item__error');

      expect(rate.attributes('aria-labelledby')).toBe(label.attributes('id'));
      expect(rate.attributes('aria-describedby')).toContain(error.attributes('id'));
      expect(rate.attributes('aria-invalid')).toBe('true');
      expect(rate.attributes('aria-disabled')).toBe('true');
      expect(rate.attributes('tabindex')).toBeUndefined();
      await wrapper.findAll('.ex-rate__star')[2].trigger('click');
      expect(wrapper.findComponent(ExRate).emitted('update:modelValue')).toBeUndefined();
    });

    it('评分变更通知 FormItem 执行 change 校验', async () => {
      const model = reactive({ score: 0 });
      wrapper = mount(ExForm, {
        props: {
          model,
          rules: { score: { minValue: 2, trigger: 'change', message: '评分过低' } },
        },
        slots: {
          default: () =>
            h(
              ExFormItem,
              { prop: 'score', label: '满意度' },
              {
                default: () =>
                  h(ExRate, {
                    modelValue: model.score,
                    'onUpdate:modelValue': (value: number) => (model.score = value),
                  }),
              }
            ),
        },
      });

      await wrapper.findAll('.ex-rate__star')[0].trigger('click');
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 20));
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ex-form-item__error').text()).toContain('评分过低');
    });
  });
});
