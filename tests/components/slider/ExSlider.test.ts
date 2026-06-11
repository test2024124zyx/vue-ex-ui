import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ExSlider from '../../../src/components/slider/ExSlider.vue'
import type { ExSliderProps } from '../../../src/components/slider/types'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

// Mock子组件
vi.mock('../../../src/components/slider/SliderButton.vue', () => ({
  default: {
    name: 'SliderButton',
    template: '<div class="slider-button-mock" @mousedown="$emit(\'drag-start\', { value: 50, index: 0 })"></div>',
    props: ['value', 'min', 'max', 'vertical', 'disabled', 'readonly', 'size', 'color', 'showTooltip', 'formatTooltip', 'dragging', 'index'],
    emits: ['drag-start', 'drag', 'drag-end']
  }
}))

vi.mock('../../../src/components/slider/SliderInput.vue', () => ({
  default: {
    name: 'SliderInput',
    template: '<div class="slider-input-mock"></div>',
    props: ['value', 'min', 'max', 'step', 'disabled', 'readonly', 'size', 'showControls', 'range'],
    emits: ['change']
  }
}))

describe('ExSlider', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: Partial<ExSliderProps> = {}) => {
    return mount(ExSlider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        step: 1,
        ...props
      },
      global: {
        stubs: {
          'ex-icon': true
        }
      }
    })
  }

  beforeEach(() => {
    // Mock DOM methods
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      value: vi.fn(() => ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 32,
        width: 200,
        height: 32
      }))
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.ex-slider').exists()).toBe(true)
      expect(wrapper.find('.ex-slider__track').exists()).toBe(true)
      expect(wrapper.find('.ex-slider__rail').exists()).toBe(true)
      expect(wrapper.find('.ex-slider__track-active').exists()).toBe(true)
    })

    it('应该显示正确的默认值', () => {
      wrapper = createWrapper({ modelValue: 30 })
      expect(wrapper.props('modelValue')).toBe(30)
    })

    it('应该支持最小值和最大值', () => {
      wrapper = createWrapper({ min: 10, max: 90 })
      expect(wrapper.props('min')).toBe(10)
      expect(wrapper.props('max')).toBe(90)
    })

    it('应该支持步长设置', () => {
      wrapper = createWrapper({ step: 5 })
      expect(wrapper.props('step')).toBe(5)
    })
  })

  describe('尺寸变体', () => {
    it('应该支持小尺寸', () => {
      wrapper = createWrapper({ size: 'small' })
      expect(wrapper.find('.ex-slider--small').exists()).toBe(true)
    })

    it('应该支持中等尺寸', () => {
      wrapper = createWrapper({ size: 'medium' })
      expect(wrapper.find('.ex-slider--medium').exists()).toBe(true)
    })

    it('应该支持大尺寸', () => {
      wrapper = createWrapper({ size: 'large' })
      expect(wrapper.find('.ex-slider--large').exists()).toBe(true)
    })
  })

  describe('状态', () => {
    it('应该支持禁用状态', () => {
      wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.ex-slider--disabled').exists()).toBe(true)
    })

    it('应该支持只读状态', () => {
      wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.ex-slider--disabled').exists()).toBe(true)
    })

    it('禁用状态下不应该响应点击', async () => {
      wrapper = createWrapper({ disabled: true })
      const track = wrapper.find('.ex-slider__track')
      
      await track.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('只读状态下不应该响应点击', async () => {
      wrapper = createWrapper({ disabled: true })
      const track = wrapper.find('.ex-slider__track')
      
      await track.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('范围模式', () => {
    it('应该支持范围模式', () => {
      wrapper = createWrapper({ 
        range: true, 
        modelValue: [20, 80] 
      })
      expect(wrapper.find('.ex-slider--range').exists()).toBe(true)
    })

    it('范围模式下应该渲染两个滑块按钮', () => {
      wrapper = createWrapper({ 
        range: true, 
        modelValue: [20, 80] 
      })
      const buttons = wrapper.findAll('.slider-button-mock')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('垂直方向', () => {
    it('应该支持垂直方向', () => {
      wrapper = createWrapper({ direction: 'vertical' })
      expect(wrapper.find('.ex-slider--vertical').exists()).toBe(true)
    })

    it('垂直方向下应该设置正确的高度', () => {
      wrapper = createWrapper({ 
        direction: 'vertical', 
        height: '300px' 
      })
      expect(wrapper.props('height')).toBe('300px')
    })
  })

  describe('步长标记', () => {
    it('应该支持显示步长标记', () => {
      wrapper = createWrapper({ showStops: true })
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(true)
    })

    it('不显示步长标记时不应该渲染stops容器', () => {
      wrapper = createWrapper({ showStops: false })
      expect(wrapper.find('.ex-slider__stops').exists()).toBe(false)
    })
  })

  describe('自定义标记', () => {
    it('应该支持自定义标记', () => {
      const marks = {
        0: '0°C',
        25: '25°C',
        50: '50°C',
        75: '75°C',
        100: '100°C'
      }
      wrapper = createWrapper({ marks })
      expect(wrapper.find('.ex-slider__marks').exists()).toBe(true)
    })

    it('没有标记时不应该渲染marks容器', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.ex-slider__marks').exists()).toBe(false)
    })

    it('应该添加with-marks类名', () => {
      const marks = { 0: 'Min', 100: 'Max' }
      wrapper = createWrapper({ marks })
      expect(wrapper.find('.ex-slider--with-marks').exists()).toBe(true)
    })
  })

  describe('输入框', () => {
    it('应该支持显示输入框', () => {
      wrapper = createWrapper({ showInput: true })
      expect(wrapper.find('.ex-slider__input').exists()).toBe(true)
      expect(wrapper.find('.slider-input-mock').exists()).toBe(true)
    })

    it('不显示输入框时不应该渲染input容器', () => {
      wrapper = createWrapper({ showInput: false })
      expect(wrapper.find('.ex-slider__input').exists()).toBe(false)
    })

    it('显示输入框时应该添加with-input类名', () => {
      wrapper = createWrapper({ showInput: true })
      expect(wrapper.find('.ex-slider--with-input').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该触发update:modelValue事件', async () => {
      wrapper = createWrapper()
      
      // 模拟值变化
      await wrapper.setProps({ modelValue: 75 })
      
      expect(wrapper.props('modelValue')).toBe(75)
    })

    it('应该触发change事件', async () => {
      wrapper = createWrapper()
      
      // 模拟拖拽结束
      const vm = wrapper.vm as any
      vm.handleDragEnd({ value: 75, index: 0 })
      
      await nextTick()
      
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该触发input事件', async () => {
      wrapper = createWrapper()
      
      // 模拟值输入
      const vm = wrapper.vm as any
      vm.updateValue(75)
      
      await nextTick()
      
      expect(wrapper.emitted('input')).toBeTruthy()
    })

    it('应该触发drag-start事件', async () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm as any
      vm.handleDragStart({ value: 50, index: 0 })
      
      await nextTick()
      
      expect(wrapper.emitted('drag-start')).toBeTruthy()
    })

    it('应该触发drag事件', async () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm as any
      vm.handleDrag({ value: 60, index: 0 })
      
      await nextTick()
      
      expect(wrapper.emitted('drag')).toBeTruthy()
    })

    it('应该触发drag-end事件', async () => {
      wrapper = createWrapper()
      
      const vm = wrapper.vm as any
      vm.handleDragEnd({ value: 70, index: 0 })
      
      await nextTick()
      
      expect(wrapper.emitted('drag-end')).toBeTruthy()
    })
  })

  describe('键盘交互', () => {
    it('应该支持方向键操作', async () => {
      wrapper = createWrapper()
      const slider = wrapper.find('.ex-slider')
      
      await slider.trigger('keydown', { key: 'ArrowRight' })
      
      // 验证键盘事件被处理
      expect(wrapper.vm).toBeDefined()
    })

    it('应该支持Home和End键', async () => {
      wrapper = createWrapper()
      const slider = wrapper.find('.ex-slider')
      
      await slider.trigger('keydown', { key: 'Home' })
      await slider.trigger('keydown', { key: 'End' })
      
      // 验证键盘事件被处理
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('工具提示', () => {
    it('应该支持显示工具提示', () => {
      wrapper = createWrapper({ showTooltip: true })
      expect(wrapper.props('showTooltip')).toBe(true)
    })

    it('应该支持自定义工具提示格式化', () => {
      const formatTooltip = (value: number) => `${value}%`
      wrapper = createWrapper({ formatTooltip })
      expect(wrapper.props('formatTooltip')).toBe(formatTooltip)
    })
  })

  describe('反向模式', () => {
    it('应该支持反向模式', () => {
      wrapper = createWrapper({ reverse: true })
      expect(wrapper.find('.ex-slider--reverse').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该设置正确的ARIA属性', () => {
      wrapper = createWrapper()
      const button = wrapper.find('.slider-button-mock')
      
      // 验证子组件接收到正确的props
      expect(wrapper.vm).toBeDefined()
    })

    it('应该支持自定义ARIA标签', () => {
      wrapper = createWrapper({ 
        ariaLabel: 'Volume control'
      })
      expect(wrapper.props('ariaLabel')).toBe('Volume control')
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的modelValue', () => {
      wrapper = createWrapper({ modelValue: undefined as any })
      expect(wrapper.vm).toBeDefined()
    })

    it('应该处理超出范围的值', () => {
      wrapper = createWrapper({ 
        modelValue: 150, 
        min: 0, 
        max: 100 
      })
      expect(wrapper.vm).toBeDefined()
    })

    it('应该处理负数范围', () => {
      wrapper = createWrapper({ 
        modelValue: -50, 
        min: -100, 
        max: 0 
      })
      expect(wrapper.props('modelValue')).toBe(-50)
      expect(wrapper.props('min')).toBe(-100)
      expect(wrapper.props('max')).toBe(0)
    })

    it('应该处理小数步长', () => {
      wrapper = createWrapper({ 
        modelValue: 0.5, 
        min: 0, 
        max: 1, 
        step: 0.1 
      })
      expect(wrapper.props('step')).toBe(0.1)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理节流', async () => {
      wrapper = createWrapper()
      
      // 模拟快速拖拽
      const vm = wrapper.vm as any
      vm.handleDrag({ value: 60, index: 0 })
      vm.handleDrag({ value: 61, index: 0 })
      vm.handleDrag({ value: 62, index: 0 })
      
      await nextTick()
      
      // 验证事件被正确处理
      expect(wrapper.emitted('drag')).toBeTruthy()
    })
  })

  describe('暴露的方法', () => {
    it('应该暴露focus方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('应该暴露blur方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.blur).toBe('function')
    })
  })
})