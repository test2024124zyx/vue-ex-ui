import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSwitch from '../../../src/components/switch/ExSwitch.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

describe('ExSwitch with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-switch />',
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switchComponent = wrapper.findComponent(ExSwitch);
      expect(switchComponent.classes()).toContain('ex-switch--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-switch size="small" />',
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switchComponent = wrapper.findComponent(ExSwitch);
      expect(switchComponent.classes()).toContain('ex-switch--small');
      expect(switchComponent.classes()).not.toContain('ex-switch--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExSwitch);

      // 默认尺寸是 medium
      expect(wrapper.classes()).toContain('ex-switch--medium');
    });

    it('multiple switches inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-switch />
              <ex-switch />
              <ex-switch />
            </div>
          `,
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switches = wrapper.findAllComponents(ExSwitch);
      expect(switches).toHaveLength(3);
      switches.forEach((switchComponent) => {
        expect(switchComponent.classes()).toContain('ex-switch--small');
      });
    });
  });

  describe('Nested ConfigProvider', () => {
    it('uses nearest ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <div>
              <ex-switch />
              <ex-config-provider size="small">
                <ex-switch />
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExSwitch, ExConfigProvider },
        },
      });

      const switches = wrapper.findAllComponents(ExSwitch);
      expect(switches[0].classes()).toContain('ex-switch--large');
      expect(switches[1].classes()).toContain('ex-switch--small');
    });
  });

  describe('Size with other props', () => {
    it('inherits size while maintaining other props', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-switch :model-value="true" active-text="ON" inactive-text="OFF" />',
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switchComponent = wrapper.findComponent(ExSwitch);
      expect(switchComponent.classes()).toContain('ex-switch--large');
      expect(switchComponent.classes()).toContain('is-checked');
      expect(switchComponent.classes()).toContain('has-text');
    });

    it('works with disabled state', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-switch disabled />',
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switchComponent = wrapper.findComponent(ExSwitch);
      expect(switchComponent.classes()).toContain('ex-switch--large');
      expect(switchComponent.classes()).toContain('is-disabled');
    });

    it('works with loading state', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: '<ex-switch loading />',
        },
        global: {
          components: { ExSwitch },
        },
      });

      const switchComponent = wrapper.findComponent(ExSwitch);
      expect(switchComponent.classes()).toContain('ex-switch--small');
      expect(switchComponent.classes()).toContain('is-loading');
    });
  });

  describe('All sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`correctly applies ${size} size from ConfigProvider`, () => {
        const wrapper = mount(ExConfigProvider, {
          props: { size },
          slots: {
            default: '<ex-switch />',
          },
          global: {
            components: { ExSwitch },
          },
        });

        const switchComponent = wrapper.findComponent(ExSwitch);
        expect(switchComponent.classes()).toContain(`ex-switch--${size}`);
      });
    });
  });
});
