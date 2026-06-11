import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExIcon from '../../../src/components/icon/ExIcon.vue'

describe('ExIcon', () => {
  // 基础渲染测试
  describe('基础渲染', () => {
    it('应该正确渲染默认图标', () => {
      const wrapper = mount(ExIcon)
      expect(wrapper.find('.ex-icon').exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('应该使用正确的HTML标签', () => {
      const wrapper = mount(ExIcon, {
        props: { tag: 'div' }
      })
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('应该应用自定义类名', () => {
      const wrapper = mount(ExIcon, {
        props: { customClass: 'custom-icon' }
      })
      expect(wrapper.classes()).toContain('custom-icon')
    })
  })

  // SVG 图标测试
  describe('SVG 图标', () => {
    it('应该渲染插槽中的SVG内容', () => {
      const wrapper = mount(ExIcon, {
        slots: {
          default: '<svg><path d="test"/></svg>'
        }
      })
      expect(wrapper.find('svg path').exists()).toBe(true)
      expect(wrapper.find('svg path').attributes('d')).toBe('test')
    })
  })

  // 字体图标测试
  describe('字体图标', () => {
    it('应该渲染字体图标', () => {
      const wrapper = mount(ExIcon, {
        props: {
          name: 'star',
          prefix: 'fas'
        }
      })
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('fas')
      expect(icon.classes()).toContain('fas-star')
    })

    it('应该处理没有前缀的图标名称', () => {
      const wrapper = mount(ExIcon, {
        props: { name: 'icon-name' }
      })
      const icon = wrapper.find('i')
      expect(icon.classes()).toContain('icon-name')
    })
  })

  // 图片图标测试
  describe('图片图标', () => {
    it('应该渲染图片图标', () => {
      const wrapper = mount(ExIcon, {
        props: {
          src: '/test-icon.png',
          alt: 'Test Icon'
        }
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/test-icon.png')
      expect(img.attributes('alt')).toBe('Test Icon')
    })

    it('应该使用默认alt文本', () => {
      const wrapper = mount(ExIcon, {
        props: { src: '/test-icon.png' }
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('icon')
    })
  })

  // 大小测试
  describe('大小设置', () => {
    it('应该设置数字大小', () => {
      const wrapper = mount(ExIcon, {
        props: { size: 24 }
      })
      const style = wrapper.attributes('style')
      expect(style).toContain('font-size: 24px')
      expect(style).toContain('width: 24px')
      expect(style).toContain('height: 24px')
    })

    it('应该设置字符串大小', () => {
      const wrapper = mount(ExIcon, {
        props: { size: '2rem' }
      })
      const style = wrapper.attributes('style')
      expect(style).toContain('font-size: 2rem')
      expect(style).toContain('width: 2rem')
      expect(style).toContain('height: 2rem')
    })
  })

  // 交互测试
  describe('交互功能', () => {
    it('应该处理点击事件', async () => {
      const wrapper = mount(ExIcon, {
        props: { clickable: true }
      })
      
      expect(wrapper.classes()).toContain('ex-icon--clickable')
      
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toHaveLength(1)
    })

    it('应该在禁用时阻止点击', async () => {
      const wrapper = mount(ExIcon, {
        props: {
          clickable: true,
          disabled: true
        }
      })
      
      expect(wrapper.classes()).toContain('ex-icon--disabled')
      
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})