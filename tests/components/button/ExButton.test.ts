import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExButton from '../../../src/components/button/ExButton.vue'
import type { ExButtonProps } from '../../../src/components/button/types'

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name', 'spin'],
    template: '<span class="ex-icon" :class="{ spin }">{{ name }}</span>'
  }
}))

describe('ExButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('ex-button')
    expect(wrapper.classes()).toContain('ex-button--primary')
    expect(wrapper.classes()).toContain('ex-button--medium')
  })

  it('renders different button types', () => {
    const types: ExButtonProps['type'][] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'text', 'link']
    
    types.forEach(type => {
      const wrapper = mount(ExButton, {
        props: { type },
        slots: { default: 'Button' }
      })
      expect(wrapper.classes()).toContain(`ex-button--${type}`)
    })
  })

  it('renders different button sizes', () => {
    const sizes: ExButtonProps['size'][] = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const wrapper = mount(ExButton, {
        props: { size },
        slots: { default: 'Button' }
      })
      expect(wrapper.classes()).toContain(`ex-button--${size}`)
    })
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(ExButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ex-button--disabled')
  })

  it('handles loading state correctly', () => {
    const wrapper = mount(ExButton, {
      props: { loading: true },
      slots: { default: 'Button' }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ex-button--loading')
    // 在新约定下不强依赖图标组件，仅校验样式与禁用
  })

  it('renders with icon (slot + Iconify, prefix)', () => {
    const wrapper = mount(ExButton, {
      slots: { 
        default: 'Search',
        prefix: '<ex-icon src="https://api.iconify.design/ri/search-line.svg"></ex-icon>'
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-icon" :src="src"></i>'
          }
        }
      }
    })

    expect(wrapper.find('.ex-button__icon--left').exists()).toBe(true)
    expect(wrapper.find('.ex-icon').exists()).toBe(true)
  })

  it('renders icon on the right (slot + Iconify, suffix)', () => {
    const wrapper = mount(ExButton, {
      slots: { 
        default: 'Next',
        suffix: '<ex-icon src="https://api.iconify.design/ri/arrow-right-line.svg"></ex-icon>'
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-icon" :src="src"></i>'
          }
        }
      }
    })

    expect(wrapper.find('.ex-button__icon--right').exists()).toBe(true)
    expect(wrapper.find('.ex-icon').exists()).toBe(true)
  })

  it('handles click events', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ExButton, {
      props: { onClick },
      slots: { default: 'Click me' }
    })

    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not emit click when disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ExButton, {
      props: { 
        disabled: true,
        onClick
      },
      slots: { default: 'Click me' }
    })

    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not emit click when loading', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ExButton, {
      props: { 
        loading: true,
        onClick
      },
      slots: { default: 'Click me' }
    })

    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders as block button', () => {
    const wrapper = mount(ExButton, {
      props: { block: true },
      slots: { default: 'Block Button' }
    })

    expect(wrapper.classes()).toContain('ex-button--block')
  })

  it('renders with custom class', () => {
    const wrapper = mount(ExButton, {
      props: { class: 'custom-class' },
      slots: { default: 'Button' }
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('renders with custom style', () => {
    const customStyle = { color: 'red', fontSize: '18px' }
    const wrapper = mount(ExButton, {
      props: { style: customStyle },
      slots: { default: 'Button' }
    })

    const button = wrapper.find('button')
    expect(button.element.style.color).toBe('red')
    expect(button.element.style.fontSize).toBe('18px')
  })

  it('handles focus and blur events', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const wrapper = mount(ExButton, {
      props: { onFocus, onBlur },
      slots: { default: 'Button' }
    })

    const button = wrapper.find('button')
    await button.trigger('focus')
    expect(onFocus).toHaveBeenCalledTimes(1)

    await button.trigger('blur')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('exposes focus and blur methods', () => {
    const wrapper = mount(ExButton, {
      slots: { default: 'Button' }
    })

    const vm = wrapper.vm as any
    expect(typeof vm.focus).toBe('function')
    expect(typeof vm.blur).toBe('function')
    expect(typeof vm.getElement).toBe('function')
  })

  it('renders with different shapes', () => {
    const shapes: ExButtonProps['shape'][] = ['default', 'round', 'circle']
    
    shapes.forEach(shape => {
      const wrapper = mount(ExButton, {
        props: { shape },
        slots: { default: 'Button' }
      })
      expect(wrapper.classes()).toContain(`ex-button--${shape}`)
    })
  })

  it('renders as plain button', () => {
    const wrapper = mount(ExButton, {
      props: { plain: true },
      slots: { default: 'Plain Button' }
    })

    expect(wrapper.classes()).toContain('ex-button--plain')
  })

  it('renders with correct native type', () => {
    const wrapper = mount(ExButton, {
      props: { nativeType: 'submit' },
      slots: { default: 'Submit' }
    })

    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })

  it('renders with aria-label', () => {
    const wrapper = mount(ExButton, {
      props: { ariaLabel: 'Close dialog' },
      slots: { default: 'X' }
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe('Close dialog')
  })
})