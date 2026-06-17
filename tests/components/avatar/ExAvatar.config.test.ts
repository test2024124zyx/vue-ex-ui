import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExAvatar from '../../../src/components/avatar/ExAvatar.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

describe('ExAvatar with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-avatar text="U" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-avatar text="U" size="small" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--small');
      expect(avatar.classes()).not.toContain('ex-avatar--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExAvatar, {
        props: { text: 'U' },
      });

      // 默认尺寸是 medium
      expect(wrapper.classes()).toContain('ex-avatar--medium');
    });

    it('multiple avatars inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-avatar text="A" />
              <ex-avatar text="B" />
              <ex-avatar text="C" />
            </div>
          `,
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatars = wrapper.findAllComponents(ExAvatar);
      expect(avatars).toHaveLength(3);
      avatars.forEach((avatar) => {
        expect(avatar.classes()).toContain('ex-avatar--small');
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
              <ex-avatar text="O" />
              <ex-config-provider size="small">
                <ex-avatar text="I" />
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExAvatar, ExConfigProvider },
        },
      });

      const avatars = wrapper.findAllComponents(ExAvatar);
      expect(avatars[0].classes()).toContain('ex-avatar--large');
      expect(avatars[1].classes()).toContain('ex-avatar--small');
    });
  });

  describe('Custom numeric size', () => {
    it('numeric size prop overrides ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-avatar text="U" :size="64" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      // 数字尺寸应该使用 custom 类
      expect(avatar.classes()).toContain('ex-avatar--custom');
      expect(avatar.attributes('style')).toContain('width: 64px');
      expect(avatar.attributes('style')).toContain('height: 64px');
    });

    it('ConfigProvider size works when no numeric size provided', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-avatar text="U" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--large');
      expect(avatar.classes()).not.toContain('ex-avatar--custom');
    });
  });

  describe('Size with other props', () => {
    it('inherits size while maintaining shape', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-avatar text="U" shape="square" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--large');
      expect(avatar.classes()).toContain('ex-avatar--square');
    });

    it('works with image src', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: '<ex-avatar src="https://example.com/avatar.jpg" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--small');
      expect(avatar.classes()).toContain('ex-avatar--image');
    });

    it('works with custom colors', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'medium' },
        slots: {
          default: '<ex-avatar text="U" background-color="#ff0000" text-color="#ffffff" />',
        },
        global: {
          components: { ExAvatar },
        },
      });

      const avatar = wrapper.findComponent(ExAvatar);
      expect(avatar.classes()).toContain('ex-avatar--medium');
      expect(avatar.attributes('style')).toContain('background-color: rgb(255, 0, 0)');
    });
  });

  describe('All sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`correctly applies ${size} size from ConfigProvider`, () => {
        const wrapper = mount(ExConfigProvider, {
          props: { size },
          slots: {
            default: '<ex-avatar text="U" />',
          },
          global: {
            components: { ExAvatar },
          },
        });

        const avatar = wrapper.findComponent(ExAvatar);
        expect(avatar.classes()).toContain(`ex-avatar--${size}`);
      });
    });
  });
});
