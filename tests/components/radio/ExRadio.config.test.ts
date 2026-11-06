import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import ExRadioGroup from '../../../src/components/radio/ExRadioGroup.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExRadio with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-radio value="1">Radio</ex-radio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const radio = wrapper.findComponent(ExRadio);
      expect(radio.classes()).toContain('ex-radio--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-radio value="1" size="small">Radio</ex-radio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const radio = wrapper.findComponent(ExRadio);
      expect(radio.classes()).toContain('ex-radio--small');
      expect(radio.classes()).not.toContain('ex-radio--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExRadio, {
        props: { value: '1' },
        slots: { default: 'Radio' },
      });

      // 默认尺寸是 medium
      expect(wrapper.classes()).toContain('ex-radio--medium');
    });

    it('multiple radios inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-radio value="1">Radio 1</ex-radio>
              <ex-radio value="2">Radio 2</ex-radio>
              <ex-radio value="3">Radio 3</ex-radio>
            </div>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      const radios = wrapper.findAllComponents(ExRadio);
      expect(radios).toHaveLength(3);
      radios.forEach(radio => {
        expect(radio.classes()).toContain('ex-radio--small');
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
              <ex-radio value="1">Outer Radio</ex-radio>
              <ex-config-provider size="small">
                <ex-radio value="2">Inner Radio</ex-radio>
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExRadio, ExConfigProvider },
        },
      });

      const radios = wrapper.findAllComponents(ExRadio);
      expect(radios[0].classes()).toContain('ex-radio--large');
      expect(radios[1].classes()).toContain('ex-radio--small');
    });
  });
});

describe('ExRadioGroup with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-radio-group model-value="1">
              <ex-radio value="1">Option 1</ex-radio>
              <ex-radio value="2">Option 2</ex-radio>
            </ex-radio-group>
          `,
        },
        global: {
          components: { ExRadio, ExRadioGroup },
        },
      });

      const group = wrapper.findComponent(ExRadioGroup);
      expect(group.classes()).toContain('ex-radio-group--large');

      // 子单选框也应该继承尺寸
      const radios = wrapper.findAllComponents(ExRadio);
      radios.forEach(radio => {
        expect(radio.classes()).toContain('ex-radio--large');
      });
    });

    it('group size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-radio-group model-value="1" size="small">
              <ex-radio value="1">Option 1</ex-radio>
              <ex-radio value="2">Option 2</ex-radio>
            </ex-radio-group>
          `,
        },
        global: {
          components: { ExRadio, ExRadioGroup },
        },
      });

      const group = wrapper.findComponent(ExRadioGroup);
      expect(group.classes()).toContain('ex-radio-group--small');
      expect(group.classes()).not.toContain('ex-radio-group--large');

      // 子单选框应该继承 group 的尺寸
      const radios = wrapper.findAllComponents(ExRadio);
      radios.forEach(radio => {
        expect(radio.classes()).toContain('ex-radio--small');
      });
    });

    it('individual radio size overrides group size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-radio-group model-value="1">
              <ex-radio value="1">Option 1</ex-radio>
              <ex-radio value="2" size="small">Option 2</ex-radio>
            </ex-radio-group>
          `,
        },
        global: {
          components: { ExRadio, ExRadioGroup },
        },
      });

      const radios = wrapper.findAllComponents(ExRadio);
      expect(radios[0].classes()).toContain('ex-radio--large');
      expect(radios[1].classes()).toContain('ex-radio--small');
    });
  });

  describe('Size Priority', () => {
    it('follows correct size priority: component > group > ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-radio-group model-value="1" size="medium">
              <ex-radio value="1">Uses medium (from group)</ex-radio>
              <ex-radio value="2" size="small">Uses small (from prop)</ex-radio>
            </ex-radio-group>
          `,
        },
        global: {
          components: { ExRadio, ExRadioGroup },
        },
      });

      const group = wrapper.findComponent(ExRadioGroup);
      expect(group.classes()).toContain('ex-radio-group--medium');

      const radios = wrapper.findAllComponents(ExRadio);
      expect(radios[0].classes()).toContain('ex-radio--medium');
      expect(radios[1].classes()).toContain('ex-radio--small');
    });
  });
});
