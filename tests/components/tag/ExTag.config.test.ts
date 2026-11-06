import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTag from '../../../src/components/tag/ExTag.vue';
import ExTagInput from '../../../src/components/tag/ExTagInput.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['name', 'size'],
    template: '<span class="ex-icon">Icon</span>',
  },
}));

describe('ExTag with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-tag>Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-tag size="small">Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--small');
      expect(tag.classes()).not.toContain('ex-tag--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExTag, {
        slots: { default: 'Tag' },
      });

      // 默认尺寸是 medium
      expect(wrapper.classes()).toContain('ex-tag--medium');
    });

    it('multiple tags inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-tag>Tag 1</ex-tag>
              <ex-tag>Tag 2</ex-tag>
              <ex-tag>Tag 3</ex-tag>
            </div>
          `,
        },
        global: {
          components: { ExTag },
        },
      });

      const tags = wrapper.findAllComponents(ExTag);
      expect(tags).toHaveLength(3);
      tags.forEach(tag => {
        expect(tag.classes()).toContain('ex-tag--small');
      });
    });
  });

  describe('Locale Inheritance', () => {
    it('uses the nearest ConfigProvider locale for Tag and TagInput labels', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { locale: 'zh-CN' },
        slots: {
          default: '<ex-tag closable>标签</ex-tag><ex-tag-input />',
        },
        global: {
          components: { ExTag, ExTagInput },
        },
      });

      expect(wrapper.find('.ex-tag__close').attributes('aria-label')).toBe('移除标签');
      expect(wrapper.find('.ex-tag-input__button').attributes('aria-label')).toBe('新标签');
    });
  });

  describe('Nested ConfigProvider', () => {
    it('uses nearest ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <div>
              <ex-tag>Outer Tag</ex-tag>
              <ex-config-provider size="small">
                <ex-tag>Inner Tag</ex-tag>
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExTag, ExConfigProvider },
        },
      });

      const tags = wrapper.findAllComponents(ExTag);
      expect(tags[0].classes()).toContain('ex-tag--large');
      expect(tags[1].classes()).toContain('ex-tag--small');
    });
  });

  describe('Size with other props', () => {
    it('inherits size while maintaining type', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-tag type="success">Success Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--large');
      expect(tag.classes()).toContain('ex-tag--success');
    });

    it('works with closable prop', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: '<ex-tag closable>Closable Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--small');
      expect(tag.classes()).toContain('is-closable');
    });

    it('works with round prop', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-tag round>Round Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--large');
      expect(tag.classes()).toContain('is-round');
    });

    it('works with effect prop', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'medium' },
        slots: {
          default: '<ex-tag effect="dark">Dark Tag</ex-tag>',
        },
        global: {
          components: { ExTag },
        },
      });

      const tag = wrapper.findComponent(ExTag);
      expect(tag.classes()).toContain('ex-tag--medium');
      expect(tag.classes()).toContain('ex-tag--dark');
    });
  });

  describe('All sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`correctly applies ${size} size from ConfigProvider`, () => {
        const wrapper = mount(ExConfigProvider, {
          props: { size },
          slots: {
            default: '<ex-tag>Tag</ex-tag>',
          },
          global: {
            components: { ExTag },
          },
        });

        const tag = wrapper.findComponent(ExTag);
        expect(tag.classes()).toContain(`ex-tag--${size}`);
      });
    });
  });
});
