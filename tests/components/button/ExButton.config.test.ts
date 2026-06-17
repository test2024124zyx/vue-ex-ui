import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
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
});
