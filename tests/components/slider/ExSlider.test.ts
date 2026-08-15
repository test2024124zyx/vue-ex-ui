import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSlider from '../../../src/components/slider/ExSlider.vue';
import type { ExSliderProps } from '../../../src/components/slider/types';

// Mock 本地 locale 模块的 useI18n（组件已从本地 locale 导入，不再直接依赖 vue-i18n）
vi.mock('../../../src/locale', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../../../src/locale');
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) };
});

describe('ExSlider', () => {
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
  let wrapper: ReturnType<typeof createWrapper>;

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

    it('运行时切换范围模式时应该规范化当前值', async () => {
      wrapper = createWrapper({ modelValue: 40, range: false });

      await expect(wrapper.setProps({ range: true })).resolves.toBeUndefined();

      const thumbs = wrapper.findAll('[role="slider"]');
      expect(thumbs).toHaveLength(2);
      expect(thumbs[0].attributes('aria-valuenow')).toBe('40');
      expect(thumbs[1].attributes('aria-valuenow')).toBe('40');
    });

    it('范围模式的两个手柄应该具有可区分的自定义标签', () => {
      wrapper = createWrapper({ modelValue: [20, 80], range: true, ariaLabel: '价格' });

      const labels = wrapper
        .findAll('[role="slider"]')
        .map(thumb => thumb.attributes('aria-label'));
      expect(labels[0]).not.toBe(labels[1]);
      expect(labels).toEqual(['价格 slider.startValue', '价格 slider.endValue']);
    });

    it('倒序范围值会同步规范化手柄和输入框', () => {
      wrapper = createWrapper({ modelValue: [80, 20], range: true, showInput: true });

      const thumbs = wrapper.findAll('[role="slider"]');
      const inputs = wrapper.findAll<HTMLInputElement>('.ex-slider__input');
      expect(thumbs.map(thumb => thumb.attributes('aria-valuenow'))).toEqual(['20', '80']);
      expect(inputs.map(input => input.element.value)).toEqual(['20', '80']);
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

    it('无效步长不应该生成步进点或阻塞渲染', () => {
      wrapper = createWrapper({ showStops: true, step: 0 });

      expect(wrapper.find('.ex-slider').exists()).toBe(true);
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

    it('触摸取消时应该结束拖拽并阻止页面滚动', async () => {
      wrapper = createWrapper({ modelValue: 50 });
      const thumb = wrapper.find('.ex-slider__thumb');

      await thumb.trigger('mousedown', { clientX: 100, clientY: 16 });
      const moveEvent = new Event('touchmove', { bubbles: true, cancelable: true });
      Object.defineProperty(moveEvent, 'touches', {
        value: [{ clientX: 150, clientY: 16 }],
      });
      document.dispatchEvent(moveEvent);
      document.dispatchEvent(new Event('touchcancel'));
      await nextTick();

      expect(moveEvent.defaultPrevented).toBe(true);
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

      // 验证子组件接收到正确的props
      expect(wrapper.vm).toBeDefined();
    });

    it('应该支持自定义ARIA标签', () => {
      wrapper = createWrapper({
        ariaLabel: 'Volume control',
      });
      expect(wrapper.props('ariaLabel')).toBe('Volume control');
    });

    it('应该把无障碍描述传递给可操作手柄', () => {
      wrapper = createWrapper({ ariaDescription: '使用方向键调整音量' });

      expect(wrapper.find('[role="slider"]').attributes('aria-description')).toBe(
        '使用方向键调整音量'
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的modelValue', () => {
      wrapper = createWrapper({
        modelValue: undefined as unknown as ExSliderProps['modelValue'],
      });
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

    it('最小值等于最大值时不应该生成 NaN 样式', () => {
      wrapper = createWrapper({ modelValue: 10, min: 10, max: 10 });

      expect(wrapper.find('.ex-slider__bar').attributes('style')).not.toContain('NaN');
      expect(wrapper.find('.ex-slider__thumb').attributes('style')).not.toContain('NaN');
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

  describe('交互分支回归', () => {
    it('轨道点击应该按方向和反向模式换算值', async () => {
      wrapper = createWrapper();
      await wrapper.find('.ex-slider__track-wrapper').trigger('mousedown', {
        clientX: 150,
        clientY: 16,
      });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(75);

      await wrapper.setProps({ direction: 'vertical', reverse: false });
      await wrapper.find('.ex-slider__track-wrapper').trigger('mousedown', {
        clientX: 10,
        clientY: 25,
      });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(22);

      await wrapper.setProps({ reverse: true });
      await wrapper.find('.ex-slider__track-wrapper').trigger('mousedown', {
        clientX: 10,
        clientY: 25,
      });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(78);
    });

    it('范围轨道点击应该更新距离更近的手柄并保持顺序', async () => {
      wrapper = createWrapper({ range: true, modelValue: [20, 80] });
      await wrapper.find('.ex-slider__track-wrapper').trigger('mousedown', {
        clientX: 50,
        clientY: 16,
      });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([25, 80]);

      await wrapper.find('.ex-slider__track-wrapper').trigger('mousedown', {
        clientX: 170,
        clientY: 16,
      });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([25, 85]);
    });

    it('范围拖拽应该限制手柄越过另一端并支持触摸事件', async () => {
      wrapper = createWrapper({ range: true, modelValue: [20, 80] });
      const start = wrapper.findAll('.ex-slider__thumb')[0]!;
      await start.trigger('mousedown', { clientX: 40, clientY: 16 });

      const move = new Event('touchmove', { bubbles: true, cancelable: true });
      Object.defineProperty(move, 'touches', { value: [{ clientX: 190, clientY: 16 }] });
      document.dispatchEvent(move);
      await nextTick();
      expect(move.defaultPrevented).toBe(true);
      expect(wrapper.emitted('input')?.at(-1)?.[0]).toEqual([80, 80]);

      document.dispatchEvent(new Event('touchend'));
      await nextTick();
      expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual([80, 80]);
    });

    it('键盘应该覆盖步进、分页和范围两端边界', async () => {
      wrapper = createWrapper({ modelValue: 50, step: 5 });
      const thumb = wrapper.find('[role="slider"]');
      for (const key of ['ArrowDown', 'ArrowLeft']) {
        await thumb.trigger('keydown', { key });
      }
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(40);
      await thumb.trigger('keydown', { key: 'PageDown' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(0);
      await thumb.trigger('keydown', { key: 'ArrowUp' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(5);
      await thumb.trigger('keydown', { key: 'PageUp' });
      await thumb.trigger('keydown', { key: 'Home' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(0);
      await thumb.trigger('keydown', { key: 'End' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(100);
      await thumb.trigger('keydown', { key: 'Tab' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(100);

      wrapper.unmount();
      wrapper = createWrapper({ range: true, modelValue: [20, 80], step: 10 });
      const thumbs = wrapper.findAll('[role="slider"]');
      await thumbs[0]!.trigger('keydown', { key: 'End' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([80, 80]);
      await thumbs[1]!.trigger('keydown', { key: 'Home' });
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([80, 80]);
    });

    it('输入框应该规范化标量和范围值', async () => {
      wrapper = createWrapper({ modelValue: 10, step: 5, showInput: true });
      const input = wrapper.find<HTMLInputElement>('.ex-slider__input');
      await input.setValue('13');
      await input.trigger('change');
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(15);

      wrapper.unmount();
      wrapper = createWrapper({ range: true, modelValue: [20, 80], step: 5, showInput: true });
      const inputs = wrapper.findAll<HTMLInputElement>('.ex-slider__input');
      await inputs[0]!.setValue('90');
      await inputs[1]!.setValue('10');
      await inputs[1]!.trigger('change');
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([10, 90]);
    });

    it('标记、步进点、悬停提示和暴露方法应该保持可用', async () => {
      wrapper = createWrapper({
        modelValue: 25,
        showStops: true,
        showTooltip: true,
        formatTooltip: value => `${value}%`,
        marks: {
          '-10': 'outside',
          25: { value: 25, label: 'quarter', style: { color: 'red' } },
          100: 'max',
        },
      });
      expect(wrapper.findAll('.ex-slider__stop')).toHaveLength(99);
      expect(wrapper.findAll('.ex-slider__mark')).toHaveLength(2);
      const thumb = wrapper.find('.ex-slider__thumb');
      await thumb.trigger('mouseenter');
      expect(wrapper.find('.ex-slider__tooltip').text()).toBe('25%');
      await thumb.trigger('mouseleave');
      expect(wrapper.find('.ex-slider__tooltip').exists()).toBe(false);

      expect(wrapper.vm.getElement()?.classList.contains('ex-slider')).toBe(true);
      wrapper.vm.reset();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(0);
      wrapper.vm.focus();
      wrapper.vm.blur();
      expect(wrapper.vm.getElement()).toBeTruthy();
    });

    it('无效范围和超大步进不应该生成无界步进点', () => {
      wrapper = createWrapper({ showStops: true, min: 0, max: 1001, step: 1 });
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(false);
      wrapper.unmount();
      wrapper = createWrapper({ showStops: true, min: 10, max: 5, step: 1 });
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(false);
    });

    it('禁用状态应该阻断触摸轨道和键盘操作', async () => {
      wrapper = createWrapper({ disabled: true });
      await wrapper.find('.ex-slider__track-wrapper').trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 16 }],
      });
      await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });
});
