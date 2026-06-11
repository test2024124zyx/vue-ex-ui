import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import ExCheckboxGroup from '../../../src/components/checkbox/ExCheckboxGroup.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExCheckbox with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-checkbox>Checkbox</ex-checkbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkbox = wrapper.findComponent(ExCheckbox);
      expect(checkbox.classes()).toContain('ex-checkbox--large');
    });

    it('component size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: '<ex-checkbox size="small">Checkbox</ex-checkbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkbox = wrapper.findComponent(ExCheckbox);
      expect(checkbox.classes()).toContain('ex-checkbox--small');
      expect(checkbox.classes()).not.toContain('ex-checkbox--large');
    });

    it('uses default size when no ConfigProvider', () => {
      const wrapper = mount(ExCheckbox, {
        slots: { default: 'Checkbox' },
      });

      // 默认尺寸是 medium
      expect(wrapper.classes()).toContain('ex-checkbox--medium');
    });

    it('multiple checkboxes inherit same size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: {
          default: `
            <div>
              <ex-checkbox>Checkbox 1</ex-checkbox>
              <ex-checkbox>Checkbox 2</ex-checkbox>
              <ex-checkbox>Checkbox 3</ex-checkbox>
            </div>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      expect(checkboxes).toHaveLength(3);
      checkboxes.forEach((checkbox) => {
        expect(checkbox.classes()).toContain('ex-checkbox--small');
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
              <ex-checkbox>Outer Checkbox</ex-checkbox>
              <ex-config-provider size="small">
                <ex-checkbox>Inner Checkbox</ex-checkbox>
              </ex-config-provider>
            </div>
          `,
        },
        global: {
          components: { ExCheckbox, ExConfigProvider },
        },
      });

      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      expect(checkboxes[0].classes()).toContain('ex-checkbox--large');
      expect(checkboxes[1].classes()).toContain('ex-checkbox--small');
    });
  });
});

describe('ExCheckboxGroup with ConfigProvider', () => {
  describe('Size Inheritance', () => {
    it('inherits size from ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-checkbox-group :model-value="[]">
              <ex-checkbox value="1">Option 1</ex-checkbox>
              <ex-checkbox value="2">Option 2</ex-checkbox>
            </ex-checkbox-group>
          `,
        },
        global: {
          components: { ExCheckbox, ExCheckboxGroup },
        },
      });

      const group = wrapper.findComponent(ExCheckboxGroup);
      expect(group.classes()).toContain('ex-checkbox-group--large');

      // 子复选框也应该继承尺寸
      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      checkboxes.forEach((checkbox) => {
        expect(checkbox.classes()).toContain('ex-checkbox--large');
      });
    });

    it('group size prop overrides ConfigProvider size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-checkbox-group :model-value="[]" size="small">
              <ex-checkbox value="1">Option 1</ex-checkbox>
              <ex-checkbox value="2">Option 2</ex-checkbox>
            </ex-checkbox-group>
          `,
        },
        global: {
          components: { ExCheckbox, ExCheckboxGroup },
        },
      });

      const group = wrapper.findComponent(ExCheckboxGroup);
      expect(group.classes()).toContain('ex-checkbox-group--small');
      expect(group.classes()).not.toContain('ex-checkbox-group--large');

      // 子复选框应该继承 group 的尺寸
      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      checkboxes.forEach((checkbox) => {
        expect(checkbox.classes()).toContain('ex-checkbox--small');
      });
    });

    it('individual checkbox size overrides group size', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-checkbox-group :model-value="[]">
              <ex-checkbox value="1">Option 1</ex-checkbox>
              <ex-checkbox value="2" size="small">Option 2</ex-checkbox>
            </ex-checkbox-group>
          `,
        },
        global: {
          components: { ExCheckbox, ExCheckboxGroup },
        },
      });

      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      expect(checkboxes[0].classes()).toContain('ex-checkbox--large');
      expect(checkboxes[1].classes()).toContain('ex-checkbox--small');
    });
  });

  describe('Size Priority', () => {
    it('follows correct size priority: component > group > ConfigProvider', () => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'large' },
        slots: {
          default: `
            <ex-checkbox-group :model-value="[]" size="medium">
              <ex-checkbox value="1">Uses medium (from group)</ex-checkbox>
              <ex-checkbox value="2" size="small">Uses small (from prop)</ex-checkbox>
            </ex-checkbox-group>
          `,
        },
        global: {
          components: { ExCheckbox, ExCheckboxGroup },
        },
      });

      const group = wrapper.findComponent(ExCheckboxGroup);
      expect(group.classes()).toContain('ex-checkbox-group--medium');

      const checkboxes = wrapper.findAllComponents(ExCheckbox);
      expect(checkboxes[0].classes()).toContain('ex-checkbox--medium');
      expect(checkboxes[1].classes()).toContain('ex-checkbox--small');
    });
  });
});
