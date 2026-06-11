import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExBadge from '../../../src/components/badge/ExBadge.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

describe('ExBadge with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-badge :count="5"><button>Button</button></ex-badge>',
        },
        global: {
          components: { ExBadge },
        },
      });

      const badge = wrapper.findComponent(ExBadge);
      const sup = badge.find('.ex-badge__sup');
      expect(sup.classes()).toContain('ex-badge__sup--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-badge :count="5" size="small"><button>Button</button></ex-badge>',
        },
        global: {
          components: { ExBadge },
        },
      });

      const badge = wrapper.findComponent(ExBadge);
      const sup = badge.find('.ex-badge__sup');
      expect(sup.classes()).toContain('ex-badge__sup--small');
      expect(sup.classes()).not.toContain('ex-badge__sup--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExBadge, {
        props: { count: 5 },
        slots: { default: '<button>Button</button>' },
      });

      const sup = wrapper.find('.ex-badge__sup');
      // 默认尺寸是 medium
      expect(sup.classes()).toContain('ex-badge__sup--medium');
    });

    it('multiple badges inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-badge :count="1"><button>Button 1</button></ex-badge>
              <ex-badge :count="2"><button>Button 2</button></ex-badge>
              <ex-badge :count="3"><button>Button 3</button></ex-badge>
            </div>
          `,
        },
        global: {
          components: { ExBadge },
        },
      });

      const badges = wrapper.findAllComponents(ExBadge);
      expect(badges).toHaveLength(3);
      badges.forEach((badge) => {
        const sup = badge.find('.ex-badge__sup');
        expect(sup.classes()).toContain('ex-badge__sup--small');
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
              <ex-badge :count="1"><button>Outer</button></ex-badge>
              <ex-config-provider size="small">
                <ex-badge :count="2"><button>Inner</button></ex-badge>
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExBadge, ExConfigProvider },
        },
      });

      const badges = wrapper.findAllComponents(ExBadge);
      const outerSup = badges[0].find('.ex-badge__sup');
      const innerSup = badges[1].find('.ex-badge__sup');
      
      expect(outerSup.classes()).toContain('ex-badge__sup--large');
      expect(innerSup.classes()).toContain('ex-badge__sup--small');
    });
  });

  describe('Size with other props', () => {
    it('inherits size while maintaining type', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-badge :count="5" type="success"><button>Button</button></ex-badge>',
        },
        global: {
          components: { ExBadge },
        },
      });

      const badge = wrapper.findComponent(ExBadge);
      const sup = badge.find('.ex-badge__sup');
      expect(sup.classes()).toContain('ex-badge__sup--large');
      expect(sup.classes()).toContain('ex-badge__sup--success');
    });

    it('works with dot mode', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: '<ex-badge dot><button>Button</button></ex-badge>',
        },
        global: {
          components: { ExBadge },
        },
      });

      const badge = wrapper.findComponent(ExBadge);
      const sup = badge.find('.ex-badge__sup');
      expect(sup.classes()).toContain('ex-badge__sup--small');
      expect(sup.classes()).toContain('ex-badge__sup--dot');
    });

    it('works with status mode', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-badge status="success" text="Success" />',
        },
        global: {
          components: { ExBadge },
        },
      });

      const badge = wrapper.findComponent(ExBadge);
      expect(badge.classes()).toContain('ex-badge--status');
    });
  });

  describe('All sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`correctly applies ${size} size from ConfigProvider`, () => {
        const wrapper = mount(ExConfigProvider, {
          props: { size },
          slots: {
            default: '<ex-badge :count="5"><button>Button</button></ex-badge>',
          },
          global: {
            components: { ExBadge },
          },
        });

        const badge = wrapper.findComponent(ExBadge);
        const sup = badge.find('.ex-badge__sup');
        expect(sup.classes()).toContain(`ex-badge__sup--${size}`);
      });
    });
  });
});
