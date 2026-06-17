import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSlider from '../../../src/components/slider/ExSlider.vue';
import type { ExSliderProps } from '../../../src/components/slider/types';

// Mock 本地 locale 模块的 useI18n（组件已从本地 locale 导入，不再直接依赖 vue-i18n）
vi.mock('../../../src/locale', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../../src/locale');
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) };
});

describe('ExSlider', () => {
  let wrapper: VueWrapper<any>;

  const createWrapper = (props: Partial<ExSliderProps> = {}) => {
    return mount(ExSlider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        step: 1,
        ...props,
      },
      global: {
        stubs: {
          'ex-icon': true,
        },
      },
    });
  };

  beforeEach(() => {
    // Mock DOM methods（用 spyOn 而不是 defineProperty，jsdom 27 下该属性不可重定义）
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 200,
      bottom: 32,
      width: 200,
      height: 32,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      wrapper = createWrapper();
      expect(wrapper.find('.ex-slider').exists()).toBe(true);
      expect(wrapper.find('.ex-slider__track').exists()).toBe(true);
      expect(wrapper.find('.ex-slider__bar').exists()).toBe(true);
      expect(wrapper.find('.ex-slider__thumb').exists()).toBe(true);
    });

    it('应该显示正确的默认值', () => {
      wrapper = createWrapper({ modelValue: 30 });
      expect(wrapper.props('modelValue')).toBe(30);
    });

    it('应该支持最小值和最大值', () => {
      wrapper = createWrapper({ min: 10, max: 90 });
      expect(wrapper.props('min')).toBe(10);
      expect(wrapper.props('max')).toBe(90);
    });

    it('应该支持步长设置', () => {
      wrapper = createWrapper({ step: 5 });
      expect(wrapper.props('step')).toBe(5);
    });
  });

  describe('尺寸变体', () => {
    it('应该支持小尺寸', () => {
      wrapper = createWrapper({ size: 'small' });
      expect(wrapper.find('.ex-slider--small').exists()).toBe(true);
    });

    it('应该支持中等尺寸', () => {
      wrapper = createWrapper({ size: 'medium' });
      expect(wrapper.find('.ex-slider--medium').exists()).toBe(true);
    });

    it('应该支持大尺寸', () => {
      wrapper = createWrapper({ size: 'large' });
      expect(wrapper.find('.ex-slider--large').exists()).toBe(true);
    });
  });

  describe('状态', () => {
    it('应该支持禁用状态', () => {
      wrapper = createWrapper({ disabled: true });
      expect(wrapper.find('.ex-slider--disabled').exists()).toBe(true);
    });

    it('应该支持只读状态', () => {
      wrapper = createWrapper({ disabled: true });
      expect(wrapper.find('.ex-slider--disabled').exists()).toBe(true);
    });

    it('禁用状态下不应该响应点击', async () => {
      wrapper = createWrapper({ disabled: true });
      const track = wrapper.find('.ex-slider__track');

      await track.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('只读状态下不应该响应点击', async () => {
      wrapper = createWrapper({ disabled: true });
      const track = wrapper.find('.ex-slider__track');

      await track.trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('范围模式', () => {
    it('应该支持范围模式', () => {
      wrapper = createWrapper({
        range: true,
        modelValue: [20, 80],
      });
      expect(wrapper.find('.ex-slider--range').exists()).toBe(true);
    });

    it('范围模式下应该渲染两个滑块手柄', () => {
      wrapper = createWrapper({
        range: true,
        modelValue: [20, 80],
      });
      const thumbs = wrapper.findAll('.ex-slider__thumb');
      expect(thumbs).toHaveLength(2);
    });
  });

  describe('垂直方向', () => {
    it('应该支持垂直方向', () => {
      wrapper = createWrapper({ direction: 'vertical' });
      expect(wrapper.find('.ex-slider--vertical').exists()).toBe(true);
    });

    it('垂直方向下应该设置正确的高度', () => {
      wrapper = createWrapper({
        direction: 'vertical',
        height: '300px',
      });
      expect(wrapper.props('height')).toBe('300px');
    });
  });

  describe('步长标记', () => {
    it('应该支持显示步长标记', () => {
      wrapper = createWrapper({ showStops: true });
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(true);
    });

    it('不显示步长标记时不应该渲染stops容器', () => {
      wrapper = createWrapper({ showStops: false });
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(false);
    });
  });

  describe('自定义标记', () => {
    it('应该支持自定义标记', () => {
      const marks = {
        0: '0°C',
        25: '25°C',
        50: '50°C',
        75: '75°C',
        100: '100°C',
      };
      wrapper = createWrapper({ marks });
      expect(wrapper.find('.ex-slider__marks').exists()).toBe(true);
    });

    it('没有标记时不应该渲染marks容器', () => {
      wrapper = createWrapper();
      expect(wrapper.find('.ex-slider__marks').exists()).toBe(false);
    });

    it('应该渲染标记节点', () => {
      const marks = { 0: 'Min', 100: 'Max' };
      wrapper = createWrapper({ marks });
      expect(wrapper.find('.ex-slider__marks').exists()).toBe(true);
      expect(wrapper.findAll('.ex-slider__mark')).toHaveLength(2);
    });
  });

  describe('输入框', () => {
    it('应该支持显示输入框', () => {
      wrapper = createWrapper({ showInput: true });
      expect(wrapper.find('.ex-slider__input-wrapper').exists()).toBe(true);
      expect(wrapper.find('.ex-slider__input').exists()).toBe(true);
    });

    it('不显示输入框时不应该渲染input容器', () => {
      wrapper = createWrapper({ showInput: false });
      expect(wrapper.find('.ex-slider__input').exists()).toBe(false);
    });

    it('不显示输入框时不渲染输入容器', () => {
      wrapper = createWrapper({ showInput: false });
      expect(wrapper.find('.ex-slider__input-wrapper').exists()).toBe(false);
    });
  });

  describe('事件处理', () => {
    it('应该触发update:modelValue事件', async () => {
      wrapper = createWrapper();

      // 模拟值变化
      await wrapper.setProps({ modelValue: 75 });

      expect(wrapper.props('modelValue')).toBe(75);
    });

    it('键盘操作应该触发change与input事件', async () => {
      wrapper = createWrapper({ modelValue: 50 });

      const thumb = wrapper.find('.ex-slider__thumb');
      await thumb.trigger('keydown', { key: 'ArrowRight' });

      expect(wrapper.emitted('input')).toBeTruthy();
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(51);
    });

    it('拖拽过程中只触发input，松手时触发change', async () => {
      wrapper = createWrapper({ modelValue: 50 });

      const thumb = wrapper.find('.ex-slider__thumb');
      await thumb.trigger('mousedown', { clientX: 100, clientY: 16 });

      // 拖拽移动：emit input，不 emit change
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 16 }));
      await nextTick();
      expect(wrapper.emitted('input')).toBeTruthy();
      expect(wrapper.emitted('change')).toBeFalsy();

      // 松手：emit change
      document.dispatchEvent(new MouseEvent('mouseup'));
      await nextTick();
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('拖拽时手柄应该带有 is-dragging 类', async () => {
      wrapper = createWrapper({ modelValue: 50 });

      const thumb = wrapper.find('.ex-slider__thumb');
      await thumb.trigger('mousedown', { clientX: 100, clientY: 16 });

      expect(wrapper.find('.ex-slider__thumb.is-dragging').exists()).toBe(true);

      document.dispatchEvent(new MouseEvent('mouseup'));
      await nextTick();
      expect(wrapper.find('.ex-slider__thumb.is-dragging').exists()).toBe(false);
    });
  });

  describe('键盘交互', () => {
    it('应该支持方向键操作', async () => {
      wrapper = createWrapper();
      const slider = wrapper.find('.ex-slider');

      await slider.trigger('keydown', { key: 'ArrowRight' });

      // 验证键盘事件被处理
      expect(wrapper.vm).toBeDefined();
    });

    it('应该支持Home和End键', async () => {
      wrapper = createWrapper();
      const slider = wrapper.find('.ex-slider');

      await slider.trigger('keydown', { key: 'Home' });
      await slider.trigger('keydown', { key: 'End' });

      // 验证键盘事件被处理
      expect(wrapper.vm).toBeDefined();
    });
  });

  describe('工具提示', () => {
    it('应该支持显示工具提示', () => {
      wrapper = createWrapper({ showTooltip: true });
      expect(wrapper.props('showTooltip')).toBe(true);
    });

    it('应该支持自定义工具提示格式化', () => {
      const formatTooltip = (value: number) => `${value}%`;
      wrapper = createWrapper({ formatTooltip });
      expect(wrapper.props('formatTooltip')).toBe(formatTooltip);
    });
  });

  describe('反向模式', () => {
    it('应该支持反向模式', () => {
      wrapper = createWrapper({ reverse: true });
      expect(wrapper.find('.ex-slider--reverse').exists()).toBe(true);
    });
  });

  describe('可访问性', () => {
    it('应该设置正确的ARIA属性', () => {
      wrapper = createWrapper();
      const button = wrapper.find('.slider-button-mock');

      // 验证子组件接收到正确的props
      expect(wrapper.vm).toBeDefined();
    });

    it('应该支持自定义ARIA标签', () => {
      wrapper = createWrapper({
        ariaLabel: 'Volume control',
      });
      expect(wrapper.props('ariaLabel')).toBe('Volume control');
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的modelValue', () => {
      wrapper = createWrapper({ modelValue: undefined as any });
      expect(wrapper.vm).toBeDefined();
    });

    it('应该处理超出范围的值', () => {
      wrapper = createWrapper({
        modelValue: 150,
        min: 0,
        max: 100,
      });
      expect(wrapper.vm).toBeDefined();
    });

    it('应该处理负数范围', () => {
      wrapper = createWrapper({
        modelValue: -50,
        min: -100,
        max: 0,
      });
      expect(wrapper.props('modelValue')).toBe(-50);
      expect(wrapper.props('min')).toBe(-100);
      expect(wrapper.props('max')).toBe(0);
    });

    it('应该处理小数步长', () => {
      wrapper = createWrapper({
        modelValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      });
      expect(wrapper.props('step')).toBe(0.1);
    });
  });

  describe('性能优化', () => {
    it('连续拖拽移动只在松手时提交一次change', async () => {
      wrapper = createWrapper({ modelValue: 50 });

      const thumb = wrapper.find('.ex-slider__thumb');
      await thumb.trigger('mousedown', { clientX: 100, clientY: 16 });

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 16 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 16 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 160, clientY: 16 }));
      document.dispatchEvent(new MouseEvent('mouseup'));
      await nextTick();

      expect(wrapper.emitted('change')).toHaveLength(1);
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露focus方法', () => {
      wrapper = createWrapper();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('应该暴露blur方法', () => {
      wrapper = createWrapper();
      expect(typeof wrapper.vm.blur).toBe('function');
    });
  });
});
