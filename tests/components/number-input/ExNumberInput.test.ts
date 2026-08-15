import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';

describe('ExNumberInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof ExNumberInput>>;

  beforeEach(() => {
    wrapper = mount(ExNumberInput, {
      props: {
        modelValue: 0,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      expect(wrapper.find('.ex-number-input').exists()).toBe(true);
      expect(wrapper.find('.ex-number-input__input').exists()).toBe(true);
    });

    it('应该显示正确的值', () => {
      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    it('应该支持 v-model 双向绑定', async () => {
      await wrapper.setProps({ modelValue: 10 });
      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.value).toBe('10');
    });

    it('应该显示占位符', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          placeholder: '请输入数字',
        },
      });
      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.placeholder).toBe('请输入数字');
    });
  });

  describe('控制按钮', () => {
    it('应该显示控制按钮', () => {
      expect(wrapper.findAll('.ex-number-input__button').length).toBeGreaterThan(0);
    });

    it('应该隐藏控制按钮', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          controls: false,
        },
      });
      expect(wrapper.findAll('.ex-number-input__button').length).toBe(0);
    });

    it('点击增加按钮应该增加值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      await increaseButton.trigger('click');
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0][0]).toBe(1);
    });

    it('点击减少按钮应该减少值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
        },
      });

      const decreaseButton = wrapper.findAll('.ex-number-input__button--decrease')[0];
      await decreaseButton.trigger('click');
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0][0]).toBe(-1);
    });

    it('应该支持两侧布局', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          controlsPosition: 'both',
        },
      });
      expect(wrapper.classes()).toContain('ex-number-input--controls-both');
    });

    it('应该支持右侧布局', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          controlsPosition: 'right',
        },
      });
      expect(wrapper.classes()).toContain('ex-number-input--controls-right');
      expect(wrapper.find('.ex-number-input__controls').exists()).toBe(true);
    });
  });

  describe('步长', () => {
    it('应该按步长增加', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          step: 5,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      await increaseButton.trigger('click');
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0][0]).toBe(5);
    });

    it('应该按步长减少', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 10,
          step: 3,
        },
      });

      const decreaseButton = wrapper.findAll('.ex-number-input__button--decrease')[0];
      await decreaseButton.trigger('click');
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0][0]).toBe(7);
    });
  });

  describe('最小值和最大值', () => {
    it('应该限制最小值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          min: 0,
        },
      });

      const decreaseButton = wrapper.findAll('.ex-number-input__button--decrease')[0];
      expect(decreaseButton.attributes('disabled')).toBeDefined();
    });

    it('应该限制最大值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 10,
          max: 10,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      expect(increaseButton.attributes('disabled')).toBeDefined();
    });

    it('输入超出范围的值应该被限制', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 5,
          min: 0,
          max: 10,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('15');
      await input.trigger('change');

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
    });
  });

  describe('精度', () => {
    it('应该格式化为指定精度', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 1.234,
          precision: 2,
        },
      });

      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.value).toBe('1.23');
    });

    it('应该处理浮点数精度问题', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0.1,
          step: 0.2,
          precision: 1,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      await increaseButton.trigger('click');
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted?.[0][0]).toBe(0.3);
    });
  });

  describe('严格步长模式', () => {
    it('应该强制输入值为步长的倍数', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          min: 0,
          step: 5,
          strictStep: true,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('7');
      await input.trigger('change');

      // 7 应该被调整为最近的步长倍数 5
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
    });
  });

  describe('禁用和只读', () => {
    it('应该禁用输入框', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          disabled: true,
        },
      });

      expect(wrapper.classes()).toContain('ex-number-input--disabled');
      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('应该设置为只读', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          readonly: true,
        },
      });

      expect(wrapper.classes()).toContain('ex-number-input--readonly');
      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('禁用时按钮不应该响应点击', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 5,
          disabled: true,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      await increaseButton.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('只读时控制按钮和暴露方法都不应该修改值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 5,
          readonly: true,
        },
      });

      const increaseButton = wrapper.find('.ex-number-input__button--increase');
      expect(increaseButton.attributes('disabled')).toBeDefined();
      await increaseButton.trigger('click');
      wrapper.vm.increase();
      wrapper.vm.decrease();

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  describe('键盘操作', () => {
    it('应该支持上箭头键增加', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'ArrowUp' });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1]);
    });

    it('应该支持下箭头键减少', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'ArrowDown' });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([-1]);
    });

    it('应该支持 Shift + 箭头键大步长调整', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          step: 1,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'ArrowUp', shiftKey: true });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
    });

    it('应该支持 PageUp/PageDown 快速调整', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          step: 1,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'PageUp' });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);
    });

    it('应该支持 Home 键跳转到最小值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 50,
          min: 0,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'Home' });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0]);
    });

    it('应该支持 End 键跳转到最大值', async () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 50,
          max: 100,
        },
      });

      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('keydown', { key: 'End' });

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([100]);
    });
  });

  describe('输入验证', () => {
    it('应该过滤非法字符', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('abc123');

      const inputElement = input.element as HTMLInputElement;
      expect(inputElement.value).toBe('123');
    });

    it('应该允许负号', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('-5');
      await input.trigger('change');

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([-5]);
    });

    it('应该允许小数点', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('3.14');
      await input.trigger('change');

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3.14]);
    });
  });

  describe('尺寸', () => {
    it('应该支持小尺寸', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          size: 'small',
        },
      });
      expect(wrapper.classes()).toContain('ex-number-input--small');
    });

    it('应该支持中等尺寸', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          size: 'medium',
        },
      });
      expect(wrapper.classes()).toContain('ex-number-input--medium');
    });

    it('应该支持大尺寸', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          size: 'large',
        },
      });
      expect(wrapper.classes()).toContain('ex-number-input--large');
    });
  });

  describe('事件', () => {
    it('应该触发 input 事件', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('5');

      expect(wrapper.emitted('input')).toBeTruthy();
    });

    it('应该触发 change 事件', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.setValue('5');
      await input.trigger('change');

      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('应该触发 focus 事件', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('应该触发 blur 事件', async () => {
      const input = wrapper.find('.ex-number-input__input');
      await input.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('运行时修改防抖延迟应该立即生效', async () => {
      vi.useFakeTimers();
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          debounceDelay: 100,
        },
      });
      await wrapper.setProps({ debounceDelay: 0 });

      await wrapper.find('.ex-number-input__input').setValue('8');

      expect(wrapper.emitted('input')).toEqual([[8]]);
    });

    it('提交 change 前应该取消尚未触发的旧 input', async () => {
      vi.useFakeTimers();
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 0,
          debounceDelay: 100,
        },
      });
      const input = wrapper.find('.ex-number-input__input');
      (input.element as HTMLInputElement).value = '5';
      await input.trigger('input');
      (input.element as HTMLInputElement).value = '6';
      await input.trigger('change');

      vi.runAllTimers();

      expect(wrapper.emitted('update:modelValue')).toEqual([[6]]);
      expect(wrapper.emitted('input')).toBeUndefined();
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 focus 方法', () => {
      expect(wrapper.vm.focus).toBeDefined();
    });

    it('应该暴露 blur 方法', () => {
      expect(wrapper.vm.blur).toBeDefined();
    });

    it('应该暴露 select 方法', () => {
      expect(wrapper.vm.select).toBeDefined();
    });

    it('应该暴露 increase 方法', async () => {
      expect(wrapper.vm.increase).toBeDefined();
      wrapper.vm.increase();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1]);
    });

    it('应该暴露 decrease 方法', async () => {
      expect(wrapper.vm.decrease).toBeDefined();
      wrapper.vm.decrease();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([-1]);
    });

    it('应该暴露 getElement 方法', () => {
      expect(wrapper.vm.getElement).toBeDefined();
      expect(wrapper.vm.getElement()).toBeTruthy();
    });
  });

  describe('插槽', () => {
    it('应该支持自定义增加图标插槽', () => {
      wrapper = mount(ExNumberInput, {
        slots: {
          'increase-icon': '<span class="custom-increase-icon">+</span>',
        },
      });
      expect(wrapper.find('.custom-increase-icon').exists()).toBe(true);
    });

    it('应该支持自定义减少图标插槽', () => {
      wrapper = mount(ExNumberInput, {
        slots: {
          'decrease-icon': '<span class="custom-decrease-icon">-</span>',
        },
      });
      expect(wrapper.find('.custom-decrease-icon').exists()).toBe(true);
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 ARIA 属性', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 5,
          min: 0,
          max: 10,
        },
      });

      const input = wrapper.find('.ex-number-input__input').element as HTMLInputElement;
      expect(input.getAttribute('role')).toBe('spinbutton');
      expect(input.getAttribute('aria-valuemin')).toBe('0');
      expect(input.getAttribute('aria-valuemax')).toBe('10');
      expect(input.getAttribute('aria-valuenow')).toBe('5');
    });

    it('禁用的按钮应该有 tabindex="-1"', () => {
      wrapper = mount(ExNumberInput, {
        props: {
          modelValue: 10,
          max: 10,
        },
      });

      const increaseButton = wrapper.findAll('.ex-number-input__button--increase')[0];
      expect(increaseButton.attributes('tabindex')).toBe('-1');
    });

    it('默认无限边界不应该输出无效的 ARIA 数值', () => {
      const input = wrapper.find('.ex-number-input__input');

      expect(input.attributes('aria-valuemin')).toBeUndefined();
      expect(input.attributes('aria-valuemax')).toBeUndefined();
    });
  });
});
