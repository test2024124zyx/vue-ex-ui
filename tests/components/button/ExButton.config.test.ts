import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExButton from '../../../src/components/button/ExButton.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

describe('ExButton with ConfigProvider', () => {
  it('inherits size from ConfigProvider', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        size: 'large',
      },
      slots: {
        default: '<ex-button>Button</ex-button>',
      },
      global: {
        components: {
          ExButton,
        },
      },
    });

    const button = wrapper.findComponent(ExButton);
    expect(button.classes()).toContain('ex-button--large');
  });

  it('component size prop overrides ConfigProvider size', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        size: 'large',
      },
      slots: {
        default: '<ex-button size="small">Button</ex-button>',
      },
      global: {
        components: {
          ExButton,
        },
      },
    });

    const button = wrapper.findComponent(ExButton);
    expect(button.classes()).toContain('ex-button--small');
  });

  it('uses medium size when no ConfigProvider and no size prop', () => {
    const wrapper = mount(ExButton, {
      slots: {
        default: 'Button',
      },
    });

    expect(wrapper.classes()).toContain('ex-button--medium');
  });

  it('disables button glow when ConfigProvider disables neon effects', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        neonEffect: false,
      },
      slots: {
        default: () =>
          h(ExButton, { type: 'primary', glow: true }, { default: () => 'Primary action' }),
      },
    });

    const button = wrapper.findComponent(ExButton);
    expect(button.classes()).toContain('ex-button--no-neon');
    expect(button.classes()).not.toContain('ex-button--glow');
  });

  it('disables button motion when ConfigProvider disables animations', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        animation: false,
      },
      slots: {
        default: () => h(ExButton, { type: 'primary' }, { default: () => 'Primary action' }),
      },
    });

    const button = wrapper.findComponent(ExButton);
    expect(button.classes()).toContain('ex-button--no-animation');
  });
});
