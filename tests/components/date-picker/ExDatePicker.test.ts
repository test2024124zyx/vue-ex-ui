import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ExDatePicker from '../../../src/components/date-picker/ExDatePicker.vue'
import { dateUtils } from '../../../src/components/date-picker/utils'

// Mock i18n
const mockT = vi.fn((key: string) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

// Mock teleport
const mockTeleport = {
  template: '<div><slot /></div>'
}

describe('ExDatePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExDatePicker, {
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker').exists()).toBe(true)
      expect(wrapper.find('.ex-date-picker__input').exists()).toBe(true)
    })

    it('应该支持不同尺寸', () => {
      const wrapper = mount(ExDatePicker, {
        props: { size: 'large' },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker--large').exists()).toBe(true)
    })

    it('应该支持禁用状态', () => {
      const wrapper = mount(ExDatePicker, {
        props: { disabled: true },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.is-disabled').exists()).toBe(true)
      expect(wrapper.find('input').element.disabled).toBe(true)
    })

    it('应该支持只读状态', () => {
      const wrapper = mount(ExDatePicker, {
        props: { readonly: true },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.is-readonly').exists()).toBe(true)
      expect(wrapper.find('input').element.readOnly).toBe(true)
    })
  })

  describe('值处理', () => {
    it('应该正确显示日期值', () => {
      const date = new Date('2023-12-25')
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: date,
          type: 'date'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('2023-12-25')
    })

    it('应该正确显示日期时间值', () => {
      const date = new Date('2023-12-25 14:30:00')
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: date,
          type: 'datetime'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('2023-12-25 14:30:00')
    })

    it('应该正确显示范围值', () => {
      const startDate = new Date('2023-12-25')
      const endDate = new Date('2023-12-31')
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: [startDate, endDate],
          type: 'daterange'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const inputs = wrapper.findAll('input')
      expect((inputs[0].element as HTMLInputElement).value).toBe('2023-12-25')
      expect((inputs[1].element as HTMLInputElement).value).toBe('2023-12-31')
    })

    it('应该支持字符串格式的值', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: '2023-12-25',
          type: 'date'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('2023-12-25')
    })
  })

  describe('事件处理', () => {
    it('应该在值改变时触发事件', async () => {
      const wrapper = mount(ExDatePicker, {
        props: { type: 'date' },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input')
      await input.setValue('2023-12-25')
      await input.trigger('input')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该在聚焦时触发事件', async () => {
      const wrapper = mount(ExDatePicker, {
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input')
      await input.trigger('focus')

      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('应该在失焦时触发事件', async () => {
      const wrapper = mount(ExDatePicker, {
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input')
      await input.trigger('blur')

      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('应该在清空时触发事件', async () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: new Date('2023-12-25'),
          clearable: true
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const clearIcon = wrapper.find('.ex-date-picker__clear')
      await clearIcon.trigger('click')

      expect(wrapper.emitted('clear')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('占位符', () => {
    it('应该显示默认占位符', () => {
      const wrapper = mount(ExDatePicker, {
        props: { type: 'date' },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.placeholder).toBe('选择日期')
    })

    it('应该支持自定义占位符', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          type: 'date',
          placeholder: '请选择日期'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.placeholder).toBe('请选择日期')
    })

    it('应该为范围选择显示正确的占位符', () => {
      const wrapper = mount(ExDatePicker, {
        props: { type: 'daterange' },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const inputs = wrapper.findAll('input')
      expect((inputs[0].element as HTMLInputElement).placeholder).toBe('开始日期')
      expect((inputs[1].element as HTMLInputElement).placeholder).toBe('结束日期')
    })
  })

  describe('格式化', () => {
    it('应该支持自定义格式', () => {
      const date = new Date('2023-12-25')
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: date,
          type: 'date',
          format: 'DD/MM/YYYY'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('25/12/2023')
    })

    it('应该根据类型使用正确的默认格式', () => {
      const date = new Date('2023-12-25 14:30:00')
      
      // 日期格式
      const dateWrapper = mount(ExDatePicker, {
        props: { 
          modelValue: date,
          type: 'date'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })
      expect((dateWrapper.find('input').element as HTMLInputElement).value).toBe('2023-12-25')

      // 日期时间格式
      const datetimeWrapper = mount(ExDatePicker, {
        props: { 
          modelValue: date,
          type: 'datetime'
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })
      expect((datetimeWrapper.find('input').element as HTMLInputElement).value).toBe('2023-12-25 14:30:00')
    })
  })

  describe('键盘交互', () => {
    it('应该支持 Escape 键关闭面板', async () => {
      const wrapper = mount(ExDatePicker, {
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'Escape' })

      // 验证面板关闭逻辑
      expect(wrapper.vm.visible).toBe(false)
    })

    it('应该支持 Enter 键确认选择', async () => {
      const wrapper = mount(ExDatePicker, {
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'Enter' })

      // 验证 Enter 键处理逻辑
      expect(wrapper.vm.visible).toBe(true)
    })
  })

  describe('清空功能', () => {
    it('应该在可清空时显示清空图标', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: new Date('2023-12-25'),
          clearable: true
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker__clear').exists()).toBe(true)
    })

    it('应该在不可清空时隐藏清空图标', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: new Date('2023-12-25'),
          clearable: false
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker__clear').exists()).toBe(false)
    })

    it('应该在禁用时隐藏清空图标', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          modelValue: new Date('2023-12-25'),
          clearable: true,
          disabled: true
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker__clear').exists()).toBe(false)
    })
  })

  describe('范围选择', () => {
    it('应该正确识别范围类型', () => {
      const wrapper = mount(ExDatePicker, {
        props: { type: 'daterange' },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.is-range').exists()).toBe(true)
      expect(wrapper.find('.ex-date-picker__range-wrapper').exists()).toBe(true)
    })

    it('应该显示范围分隔符', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          type: 'daterange',
          rangeSeparator: ' 至 '
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker__separator').text()).toBe(' 至 ')
    })

    it('应该支持自定义范围分隔符', () => {
      const wrapper = mount(ExDatePicker, {
        props: { 
          type: 'daterange',
          rangeSeparator: ' ~ '
        },
        global: {
          components: {
            teleport: mockTeleport
          }
        }
      })

      expect(wrapper.find('.ex-date-picker__separator').text()).toBe(' ~ ')
    })
  })

  describe('工具函数测试', () => {
    it('dateUtils.format 应该正确格式化日期', () => {
      const date = new Date('2023-12-25 14:30:45')
      
      expect(dateUtils.format(date, 'YYYY-MM-DD')).toBe('2023-12-25')
      expect(dateUtils.format(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2023-12-25 14:30:45')
      expect(dateUtils.format(date, 'DD/MM/YYYY')).toBe('25/12/2023')
    })

    it('dateUtils.parse 应该正确解析日期字符串', () => {
      const result1 = dateUtils.parse('2023-12-25', 'YYYY-MM-DD')
      expect(result1?.getFullYear()).toBe(2023)
      expect(result1?.getMonth()).toBe(11) // 月份从0开始
      expect(result1?.getDate()).toBe(25)

      const result2 = dateUtils.parse('25/12/2023', 'DD/MM/YYYY')
      expect(result2?.getFullYear()).toBe(2023)
      expect(result2?.getMonth()).toBe(11)
      expect(result2?.getDate()).toBe(25)
    })

    it('dateUtils.isValid 应该正确验证日期', () => {
      expect(dateUtils.isValid(new Date('2023-12-25'))).toBe(true)
      expect(dateUtils.isValid(new Date('invalid'))).toBe(false)
      expect(dateUtils.isValid('not a date' as any)).toBe(false)
    })

    it('dateUtils.isSame 应该正确比较日期', () => {
      const date1 = new Date('2023-12-25 14:30:00')
      const date2 = new Date('2023-12-25 16:45:00')
      const date3 = new Date('2023-12-26 14:30:00')

      expect(dateUtils.isSame(date1, date2, 'day')).toBe(true)
      expect(dateUtils.isSame(date1, date3, 'day')).toBe(false)
      expect(dateUtils.isSame(date1, date2, 'hour')).toBe(false)
    })

    it('dateUtils.add 应该正确添加时间', () => {
      const date = new Date('2023-12-25')
      const result = dateUtils.add(date, 7, 'day')
      
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // 1月
      expect(result.getDate()).toBe(1)
    })

    it('dateUtils.subtract 应该正确减少时间', () => {
      const date = new Date('2023-12-25')
      const result = dateUtils.subtract(date, 7, 'day')
      
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(11) // 12月
      expect(result.getDate()).toBe(18)
    })
  })
})