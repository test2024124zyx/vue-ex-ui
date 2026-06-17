import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExTypography from '../../../src/components/typography/ExTypography.vue'
import type { ExTypographyProps } from '../../../src/components/typography/types'

describe('ExTypography', () => {
  // 基础渲染测试
  it('renders correctly with default props', () => {
    const wrapper = mount(ExTypography)
    
    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.classes()).toContain('ex-typography')
    expect(wrapper.classes()).toContain('ex-typography--body')
    expect(wrapper.classes()).toContain('ex-typography--md')
  })

  // 文本内容测试
  it('renders text content correctly', () => {
    const text = 'Hello World'
    const wrapper = mount(ExTypography, {
      props: { text }
    })
    
    expect(wrapper.text()).toBe(text)
  })

  // 插槽内容测试
  it('renders slot content correctly', () => {
    const slotContent = 'Slot Content'
    const wrapper = mount(ExTypography, {
      slots: {
        default: slotContent
      }
    })
    
    expect(wrapper.text()).toBe(slotContent)
  })

  // 插槽优先级测试
  it('prioritizes slot content over text prop', () => {
    const text = 'Text Prop'
    const slotContent = 'Slot Content'
    const wrapper = mount(ExTypography, {
      props: { text },
      slots: {
        default: slotContent
      }
    })
    
    expect(wrapper.text()).toBe(slotContent)
  })

  // HTML 标签测试
  it('renders correct HTML tag', () => {
    const wrapper = mount(ExTypography, {
      props: { tag: 'h1' }
    })
    
    expect(wrapper.element.tagName).toBe('H1')
  })

  // 变体样式测试
  it.each([
    ['display', 'ex-typography--display'],
    ['heading', 'ex-typography--heading'],
    ['title', 'ex-typography--title'],
    ['body', 'ex-typography--body'],
    ['caption', 'ex-typography--caption'],
    ['overline', 'ex-typography--overline']
  ])('applies correct variant class for %s', (variant, expectedClass) => {
    const wrapper = mount(ExTypography, {
      props: { variant: variant as ExTypographyProps['variant'] }
    })
    
    expect(wrapper.classes()).toContain(expectedClass)
  })

  // 尺寸样式测试
  it.each([
    ['xs', 'ex-typography--xs'],
    ['sm', 'ex-typography--sm'],
    ['md', 'ex-typography--md'],
    ['lg', 'ex-typography--lg'],
    ['xl', 'ex-typography--xl'],
    ['2xl', 'ex-typography--2xl'],
    ['3xl', 'ex-typography--3xl'],
    ['4xl', 'ex-typography--4xl']
  ])('applies correct size class for %s', (size, expectedClass) => {
    const wrapper = mount(ExTypography, {
      props: { size: size as ExTypographyProps['size'] }
    })
    
    expect(wrapper.classes()).toContain(expectedClass)
  })

  // 修饰符测试
  it('applies modifier classes correctly', () => {
    const wrapper = mount(ExTypography, {
      props: {
        truncate: true,
        gradient: true,
        glow: true,
        center: true,
        bold: true,
        italic: true,
        underline: true
      }
    })
    
    expect(wrapper.classes()).toContain('ex-typography--truncate')
    expect(wrapper.classes()).toContain('ex-typography--gradient')
    expect(wrapper.classes()).toContain('ex-typography--glow')
    expect(wrapper.classes()).toContain('ex-typography--center')
    expect(wrapper.classes()).toContain('ex-typography--bold')
    expect(wrapper.classes()).toContain('ex-typography--italic')
    expect(wrapper.classes()).toContain('ex-typography--underline')
  })

  // 自定义样式测试
  it('applies custom styles correctly', () => {
    const customStyle = {
      fontSize: '20px',
      color: 'red'
    }
    const wrapper = mount(ExTypography, {
      props: { customStyle }
    })
    
    const style = wrapper.element.style
    expect(style.fontSize).toBe('20px')
    expect(style.color).toBe('red')
  })

  // 颜色样式测试
  it('applies color styles correctly', () => {
    const wrapper = mount(ExTypography, {
      props: { color: 'primary' }
    })
    
    const style = wrapper.element.style
    expect(style.color).toBe('var(--ex-color-primary)')
  })

  // 多行截断测试
  it('applies multi-line truncation styles correctly', () => {
    const wrapper = mount(ExTypography, {
      props: {
        truncate: true,
        maxLines: 3
      }
    })
    
    const style = wrapper.element.style
    expect(style.display).toBe('-webkit-box')
    expect(style.WebkitLineClamp).toBe('3')
    expect(style.WebkitBoxOrient).toBe('vertical')
    expect(style.overflow).toBe('hidden')
  })

  // 默认标签映射测试
  it('uses correct default tag for variants when tag is not specified', () => {
    const variantTagMap = [
      ['display', 'H1'],
      ['heading', 'H2'],
      ['title', 'H3'],
      ['body', 'P'],
      ['caption', 'SPAN'],
      ['overline', 'SPAN']
    ]

    variantTagMap.forEach(([variant, expectedTag]) => {
      const wrapper = mount(ExTypography, {
        props: { 
          variant: variant as ExTypographyProps['variant'],
          tag: undefined // 明确设置为 undefined 以使用默认映射
        }
      })
      
      expect(wrapper.element.tagName).toBe(expectedTag)
    })
  })

  // 属性继承测试
  it('inherits attributes correctly', () => {
    const wrapper = mount(ExTypography, {
      attrs: {
        id: 'test-id',
        'data-testid': 'typography-test'
      }
    })
    
    expect(wrapper.attributes('id')).toBe('test-id')
    expect(wrapper.attributes('data-testid')).toBe('typography-test')
  })

  // 响应式测试
  it('updates when props change', async () => {
    const wrapper = mount(ExTypography, {
      props: { variant: 'body' }
    })
    
    expect(wrapper.classes()).toContain('ex-typography--body')
    
    await wrapper.setProps({ variant: 'heading' })
    
    expect(wrapper.classes()).toContain('ex-typography--heading')
    expect(wrapper.classes()).not.toContain('ex-typography--body')
  })

  // 边界情况测试
  it('handles empty text gracefully', () => {
    const wrapper = mount(ExTypography, {
      props: { text: '' }
    })
    
    expect(wrapper.text()).toBe('')
  })

  it('handles undefined text gracefully', () => {
    const wrapper = mount(ExTypography, {
      props: { text: undefined }
    })
    
    expect(wrapper.text()).toBe('')
  })

  // 组件名称测试
  it('has correct component name', () => {
    const wrapper = mount(ExTypography)
    expect(wrapper.vm.$options.name).toBe('ExTypography')
  })
})