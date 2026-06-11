import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExDivider from '../../../src/components/divider/ExDivider.vue'
import type { ExDividerProps } from '../../../src/components/divider/types'

describe('ExDivider', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExDivider)

    expect(wrapper.find('.ex-divider').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(true)
  })

  it('renders with text content', () => {
    const wrapper = mount(ExDivider, {
      slots: {
        default: 'Divider Text'
      }
    })

    expect(wrapper.find('.ex-divider--with-text').exists()).toBe(true)
    expect(wrapper.find('.ex-divider__text').exists()).toBe(true)
    expect(wrapper.text()).toBe('Divider Text')
  })

  it('renders as vertical divider', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical'
      }
    })

    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(false)
  })

  it('renders with different orientations', () => {
    const orientations: ExDividerProps['orientation'][] = ['left', 'center', 'right']
    
    orientations.forEach(orientation => {
      const wrapper = mount(ExDivider, {
        props: {
          orientation
        },
        slots: {
          default: 'Text'
        }
      })

      expect(wrapper.find(`.ex-divider--${orientation}`).exists()).toBe(true)
    })
  })

  it('renders with dashed style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        dashed: true
      }
    })

    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true)
  })

  it('renders with different sizes', () => {
    const sizes = ['small', 'default', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(ExDivider, {
        props: {
          size
        }
      })

      expect(wrapper.find(`.ex-divider--${size}`).exists()).toBe(true)
    })
  })

  it('renders with custom numeric size', () => {
    const wrapper = mount(ExDivider, {
      props: {
        size: 5
      }
    })

    const dividerElement = wrapper.find('.ex-divider')
    expect(dividerElement.attributes('style')).toContain('border-width: 5px')
  })

  it('renders with custom margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        margin: '16px'
      }
    })

    const dividerElement = wrapper.find('.ex-divider')
    expect(dividerElement.attributes('style')).toContain('margin: 16px 0')
  })

  it('renders with numeric margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        margin: 20
      }
    })

    const dividerElement = wrapper.find('.ex-divider')
    expect(dividerElement.attributes('style')).toContain('margin: 20px 0')
  })

  it('renders with orientation margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        orientation: 'left',
        orientationMargin: '10%'
      },
      slots: {
        default: 'Text'
      }
    })

    const textElement = wrapper.find('.ex-divider__text')
    expect(textElement.attributes('style')).toContain('margin-left: 10%')
  })

  it('renders with numeric orientation margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        orientation: 'right',
        orientationMargin: 50
      },
      slots: {
        default: 'Text'
      }
    })

    const textElement = wrapper.find('.ex-divider__text')
    expect(textElement.attributes('style')).toContain('margin-right: 50px')
  })

  it('renders with plain text style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        plain: true
      },
      slots: {
        default: 'Plain Text'
      }
    })

    expect(wrapper.find('.ex-divider--plain').exists()).toBe(true)
  })

  it('applies custom class and style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        class: 'custom-divider',
        style: { borderColor: 'red' }
      }
    })

    expect(wrapper.classes()).toContain('custom-divider')
    expect(wrapper.attributes('style')).toContain('border-color: red')
  })

  it('handles vertical divider with text', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical'
      },
      slots: {
        default: 'Vertical Text'
      }
    })

    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--with-text').exists()).toBe(true)
    expect(wrapper.text()).toBe('Vertical Text')
  })

  it('combines multiple props correctly', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'horizontal',
        orientation: 'left',
        dashed: true,
        size: 'large',
        plain: true,
        margin: '32px'
      },
      slots: {
        default: 'Combined Props'
      }
    })

    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--left').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--large').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--plain').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--with-text').exists()).toBe(true)
    expect(wrapper.attributes('style')).toContain('margin: 32px 0')
  })

  it('handles empty slot content', () => {
    const wrapper = mount(ExDivider, {
      slots: {
        default: ''
      }
    })

    expect(wrapper.find('.ex-divider--with-text').exists()).toBe(false)
    expect(wrapper.find('.ex-divider__text').exists()).toBe(false)
  })

  it('renders with complex slot content', () => {
    const wrapper = mount(ExDivider, {
      slots: {
        default: '<span class="custom-text">Custom <strong>Content</strong></span>'
      }
    })

    expect(wrapper.find('.custom-text').exists()).toBe(true)
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Content')
  })

  it('handles orientation margin only for left/right orientations', () => {
    // Center orientation should not apply orientation margin
    const centerWrapper = mount(ExDivider, {
      props: {
        orientation: 'center',
        orientationMargin: '20px'
      },
      slots: {
        default: 'Center Text'
      }
    })

    const centerTextElement = centerWrapper.find('.ex-divider__text')
    expect(centerTextElement.attributes('style')).not.toContain('margin-left')
    expect(centerTextElement.attributes('style')).not.toContain('margin-right')

    // Left orientation should apply margin-left
    const leftWrapper = mount(ExDivider, {
      props: {
        orientation: 'left',
        orientationMargin: '20px'
      },
      slots: {
        default: 'Left Text'
      }
    })

    const leftTextElement = leftWrapper.find('.ex-divider__text')
    expect(leftTextElement.attributes('style')).toContain('margin-left: 20px')
  })

  it('handles different size and type combinations', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical',
        size: 'small',
        dashed: true
      }
    })

    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--small').exists()).toBe(true)
    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true)
  })
})