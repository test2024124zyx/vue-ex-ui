import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue'
import { createI18n } from 'vue-i18n'
import zhCN from '../../../src/locale/zh-CN'
import enUS from '../../../src/locale/en-US'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

// Mock teleport
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    Teleport: {
      name: 'Teleport',
      props: ['to'],
      setup(props: any, { slots }: any) {
        return () => slots.default?.()
      }
    }
  }
})

describe('ExTimePicker', () => {
  let wrapper: any

  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = ''
  })

  const createWrapper = (props = {}) => {
    return mount(ExTimePicker, {
      props,
      global: {
        plugins: [i18n],
        stubs: {
          'ex-icon': {
            template: '<span class="mock-icon">{{ name }}</span>',
            props: ['name']
          },
          'time-panel': {
            template: '<div class="mock-time-panel"></div>',
            props: ['value', 'format', 'step', 'disabledTime', 'showNow', 'use12Hours', 'visible'],
            emits: ['change', 'confirm', 'now']
          }
        }
      }
    })
  }

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      wrapper = createWrapper()
      expect(wrapper.find('.ex-time-picker').exists()).toBe(true)
      expect(wrapper.find('.ex-time-picker__input').exists()).toBe(true)
      expect(wrapper.find('.ex-time-picker__suffix').exists()).toBe(true)
    })

    it('应该显示占位符', () => {
      wrapper = createWrapper({ placeholder: '请选择时间' })
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.attributes('placeholder')).toBe('请选择时间')
    })

    it('应该支持不同尺寸', () => {
      wrapper = createWrapper({ size: 'large' })
      expect(wrapper.find('.ex-time-picker--large').exists()).toBe(true)
    })

    it('应该支持禁用状态', () => {
      wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('.ex-time-picker--disabled').exists()).toBe(true)
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('应该支持只读状态', () => {
      wrapper = createWrapper({ readonly: true })
      expect(wrapper.find('.ex-time-picker--readonly').exists()).toBe(true)
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.attributes('readonly')).toBeDefined()
    })
  })

  describe('值处理', () => {
    it('应该正确显示时间值', async () => {
      const time = new Date(2023, 0, 1, 14, 30, 45)
      wrapper = createWrapper({ modelValue: time })
      await nextTick()
      
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('14:30:45')
    })

    it('应该支持字符串时间值', async () => {
      wrapper = createWrapper({ modelValue: '09:15:30' })
      await nextTick()
      
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('09:15:30')
    })

    it('应该支持不同时间格式', async () => {
      const time = new Date(2023, 0, 1, 14, 30, 45)
      wrapper = createWrapper({ 
        modelValue: time,
        format: 'HH:mm'
      })
      await nextTick()
      
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('14:30')
    })

    it('应该支持12小时制格式', async () => {
      const time = new Date(2023, 0, 1, 14, 30, 45)
      wrapper = createWrapper({ 
        modelValue: time,
        format: 'hh:mm:ss A',
        use12Hours: true
      })
      await nextTick()
      
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('02:30:45 PM')
    })
  })

  describe('交互功能', () => {
    it('应该在点击触发器时显示面板', async () => {
      wrapper = createWrapper()
      const trigger = wrapper.find('.ex-time-picker__trigger')
      
      await trigger.trigger('click')
      expect(wrapper.vm.panelVisible).toBe(true)
    })

    it('应该在禁用时不响应点击', async () => {
      wrapper = createWrapper({ disabled: true })
      const trigger = wrapper.find('.ex-time-picker__trigger')
      
      await trigger.trigger('click')
      expect(wrapper.vm.panelVisible).toBe(false)
    })

    it('应该支持键盘操作', async () => {
      wrapper = createWrapper()
      const input = wrapper.find('.ex-time-picker__input')
      
      // Enter 键显示面板
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.vm.panelVisible).toBe(true)
      
      // Escape 键隐藏面板
      await input.trigger('keydown', { key: 'Escape' })
      expect(wrapper.vm.panelVisible).toBe(false)
    })

    it('应该支持清空功能', async () => {
      wrapper = createWrapper({ 
        modelValue: '14:30:45',
        clearable: true
      })
      
      // 模拟聚焦状态以显示清空按钮
      wrapper.vm.focused = true
      await nextTick()
      
      const clearIcon = wrapper.find('.ex-time-picker__clear')
      expect(clearIcon.exists()).toBe(true)
      
      await clearIcon.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
      expect(wrapper.emitted('clear')).toBeTruthy()
    })
  })

  describe('事件处理', () => {
    it('应该触发 focus 事件', async () => {
      wrapper = createWrapper()
      const input = wrapper.find('.ex-time-picker__input')
      
      await input.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('应该触发 blur 事件', async () => {
      wrapper = createWrapper()
      const input = wrapper.find('.ex-time-picker__input')
      
      await input.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('应该触发 change 事件', async () => {
      wrapper = createWrapper()
      const time = new Date(2023, 0, 1, 14, 30, 45)
      
      // 模拟时间面板变更
      wrapper.vm.handleTimeChange(time)
      
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([time])
      expect(wrapper.emitted('change')?.[0][0]).toEqual({
        value: time,
        timeString: '14:30:45'
      })
    })

    it('应该处理输入验证', async () => {
      wrapper = createWrapper()
      const input = wrapper.find('.ex-time-picker__input')
      
      // 输入有效时间
      await input.setValue('15:45:30')
      await input.trigger('input')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      
      // 输入无效时间
      await input.setValue('invalid-time')
      await input.trigger('input')
      
      // 应该不触发更新事件或设置为null
      const events = wrapper.emitted('update:modelValue')
      expect(events?.[events.length - 1]?.[0]).toBeNull()
    })
  })

  describe('时间步长', () => {
    it('应该支持自定义时间步长', () => {
      const step = { hour: 2, minute: 15, second: 30 }
      wrapper = createWrapper({ step })
      
      expect(wrapper.props('step')).toEqual(step)
    })
  })

  describe('禁用时间', () => {
    it('应该支持禁用特定时间', () => {
      const disabledTime = {
        disabledHours: () => [0, 1, 2],
        disabledMinutes: (hour: number) => hour === 12 ? [0, 30] : [],
        disabledSeconds: (hour: number, minute: number) => []
      }
      
      wrapper = createWrapper({ disabledTime })
      expect(wrapper.props('disabledTime')).toEqual(disabledTime)
    })
  })

  describe('前缀和后缀图标', () => {
    it('应该显示前缀图标', () => {
      wrapper = createWrapper({ prefixIcon: 'time' })
      expect(wrapper.find('.ex-time-picker__prefix').exists()).toBe(true)
    })

    it('应该显示默认后缀图标', () => {
      wrapper = createWrapper()
      const suffix = wrapper.find('.ex-time-picker__suffix')
      expect(suffix.exists()).toBe(true)
      expect(suffix.find('.ex-time-picker__icon').exists()).toBe(true)
    })
  })

  describe('状态样式', () => {
    it('应该支持错误状态', () => {
      wrapper = createWrapper({ status: 'error' })
      expect(wrapper.find('.ex-time-picker--error').exists()).toBe(true)
    })

    it('应该支持警告状态', () => {
      wrapper = createWrapper({ status: 'warning' })
      expect(wrapper.find('.ex-time-picker--warning').exists()).toBe(true)
    })

    it('应该支持无边框模式', () => {
      wrapper = createWrapper({ bordered: false })
      expect(wrapper.find('.ex-time-picker--borderless').exists()).toBe(true)
    })
  })

  describe('方法暴露', () => {
    it('应该暴露 focus 方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('应该暴露 blur 方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.blur).toBe('function')
    })

    it('应该暴露 showPanel 方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.showPanel).toBe('function')
    })

    it('应该暴露 hidePanel 方法', () => {
      wrapper = createWrapper()
      expect(typeof wrapper.vm.hidePanel).toBe('function')
    })
  })

  describe('国际化', () => {
    it('应该支持中文', async () => {
      wrapper = createWrapper()
      // 默认应该使用中文占位符
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.attributes('placeholder')).toBe('选择时间')
    })

    it('应该支持英文', async () => {
      i18n.global.locale.value = 'en-US'
      wrapper = createWrapper()
      await nextTick()
      
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.attributes('placeholder')).toBe('Select time')
      
      // 恢复中文
      i18n.global.locale.value = 'zh-CN'
    })
  })

  describe('边界情况', () => {
    it('应该处理空值', () => {
      wrapper = createWrapper({ modelValue: null })
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('')
    })

    it('应该处理无效的时间字符串', () => {
      wrapper = createWrapper({ modelValue: 'invalid-time' })
      const input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('invalid-time')
    })

    it('应该在格式变更时更新显示', async () => {
      const time = new Date(2023, 0, 1, 14, 30, 45)
      wrapper = createWrapper({ 
        modelValue: time,
        format: 'HH:mm:ss'
      })
      await nextTick()
      
      let input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('14:30:45')
      
      // 更改格式
      await wrapper.setProps({ format: 'HH:mm' })
      await nextTick()
      
      input = wrapper.find('.ex-time-picker__input')
      expect(input.element.value).toBe('14:30')
    })
  })
})