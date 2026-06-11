import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExLink from '../../../src/components/link/ExLink.vue'
import ExIcon from '../../../src/components/icon/ExIcon.vue'

// Mock ExIcon 组件
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name'],
    template: '<i :class="`icon-${name}`"></i>'
  }
}))

describe('ExLink', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExLink, {
      slots: {
        default: 'Test Link'
      }
    })

    expect(wrapper.text()).toBe('Test Link')
    expect(wrapper.classes()).toContain('ex-link')
    expect(wrapper.classes()).toContain('ex-link--default')
    expect(wrapper.classes()).toContain('ex-link--medium')
  })

  it('renders as anchor tag with href', () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://example.com'
      },
      slots: {
        default: 'External Link'
      }
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })

  it('renders as router-link with to prop', async () => {
    // Mock router-link component
    const RouterLinkStub = {
      name: 'RouterLink',
      props: ['to'],
      template: '<a><slot /></a>'
    }

    const wrapper = mount(ExLink, {
      props: {
        to: '/about'
      },
      slots: {
        default: 'Router Link'
      },
      global: {
        stubs: {
          'router-link': RouterLinkStub
        }
      }
    })

    expect(wrapper.vm.$options.name).toBe('ExLink')
    // 检查是否渲染为router-link组件
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(true)
  })

  it('applies correct type classes', () => {
    const types = ['primary', 'success', 'warning', 'danger', 'info']
    
    types.forEach(type => {
      const wrapper = mount(ExLink, {
        props: { type },
        slots: { default: 'Link' }
      })
      expect(wrapper.classes()).toContain(`ex-link--${type}`)
    })
  })

  it('applies correct size classes', () => {
    const sizes = ['small', 'medium', 'large']
    
    sizes.forEach(size => {
      const wrapper = mount(ExLink, {
        props: { size },
        slots: { default: 'Link' }
      })
      expect(wrapper.classes()).toContain(`ex-link--${size}`)
    })
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(ExLink, {
      props: {
        disabled: true,
        href: 'https://example.com'
      },
      slots: {
        default: 'Disabled Link'
      }
    })

    expect(wrapper.classes()).toContain('ex-link--disabled')
    expect(wrapper.attributes('tabindex')).toBe('-1')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('shows/hides underline correctly', () => {
    const withUnderline = mount(ExLink, {
      props: { underline: true },
      slots: { default: 'Link' }
    })
    expect(withUnderline.classes()).not.toContain('ex-link--no-underline')

    const withoutUnderline = mount(ExLink, {
      props: { underline: false },
      slots: { default: 'Link' }
    })
    expect(withoutUnderline.classes()).toContain('ex-link--no-underline')
  })

  it('renders icon correctly (slot + Iconify)', () => {
    const wrapper = mount(ExLink, {
      props: {
        iconPlacement: 'left'
      },
      slots: {
        default: 'Home Link',
        icon: '<ex-icon src="https://api.iconify.design/ri/home-2-line.svg"></ex-icon>'
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-link__icon ex-icon" :src="src"></i>'
          }
        }
      }
    })

    const iconEl = wrapper.find('.ex-link__icon--left')
    expect(iconEl.exists()).toBe(true)
  })

  it('renders external icon for external links', () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://external.com',
        showExternalIcon: true
      },
      slots: {
        default: 'External Link'
      },
      global: {
        components: {
          ExIcon
        }
      }
    })

    expect(wrapper.classes()).toContain('ex-link--external')
    const externalIcon = wrapper.find('.ex-link__external-icon')
    expect(externalIcon.exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://example.com'
      },
      slots: {
        default: 'Click Me'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toHaveLength(1)
  })

  it('prevents click when disabled', async () => {
    const wrapper = mount(ExLink, {
      props: {
        disabled: true,
        href: 'https://example.com'
      },
      slots: {
        default: 'Disabled Link'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://example.com'
      },
      slots: {
        default: 'Focus Me'
      }
    })

    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()

    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('applies custom class and style', () => {
    const wrapper = mount(ExLink, {
      props: {
        class: 'custom-class',
        style: { color: 'red' }
      },
      slots: {
        default: 'Styled Link'
      }
    })

    expect(wrapper.classes()).toContain('custom-class')
    expect((wrapper.element as HTMLElement).style.color).toBe('red')
  })

  it('sets correct target and rel attributes', () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://external.com',
        target: '_blank'
      },
      slots: {
        default: 'External Link'
      }
    })

    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
  })

  it('exposes focus and blur methods', () => {
    const wrapper = mount(ExLink, {
      props: {
        href: 'https://example.com'
      },
      slots: {
        default: 'Test Link'
      }
    })

    const vm = wrapper.vm as any
    expect(typeof vm.focus).toBe('function')
    expect(typeof vm.blur).toBe('function')
    expect(typeof vm.getElement).toBe('function')
  })

  it('handles array class prop correctly', () => {
    const wrapper = mount(ExLink, {
      props: {
        class: ['class1', 'class2']
      },
      slots: {
        default: 'Link'
      }
    })

    expect(wrapper.classes()).toContain('class1')
    expect(wrapper.classes()).toContain('class2')
  })

  it('handles object class prop correctly', () => {
    const wrapper = mount(ExLink, {
      props: {
        class: {
          'active': true,
          'inactive': false
        }
      },
      slots: {
        default: 'Link'
      }
    })

    expect(wrapper.classes()).toContain('active')
    expect(wrapper.classes()).not.toContain('inactive')
  })

  it('detects external links correctly', () => {
    // 内部链接
    const internalWrapper = mount(ExLink, {
      props: {
        href: '/internal-page'
      },
      slots: {
        default: 'Internal Link'
      }
    })
    expect(internalWrapper.classes()).not.toContain('ex-link--external')

    // 外部链接
    const externalWrapper = mount(ExLink, {
      props: {
        href: 'https://external.com'
      },
      slots: {
        default: 'External Link'
      }
    })
    expect(externalWrapper.classes()).toContain('ex-link--external')
  })
})