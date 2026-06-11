import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExCheckboxGroup from '../../../src/components/checkbox/ExCheckboxGroup.vue';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import type { ExCheckboxGroupProps } from '../../../src/components/checkbox/types';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExCheckboxGroup', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExCheckboxGroup, {
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.find('.ex-checkbox-group').exists()).toBe(true);
      expect(wrapper.findAll('.ex-checkbox').length).toBe(2);
    });

    it('renders with label', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          label: 'Select Options',
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.text()).toContain('Select Options');
      expect(wrapper.find('.ex-checkbox-group__label').exists()).toBe(true);
    });

    it('renders required indicator', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          label: 'Select Options',
          required: true,
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.find('.ex-checkbox-group__required').exists()).toBe(true);
    });
  });

  // 尺寸测试
  describe('Sizes', () => {
    const sizes: ExCheckboxGroupProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExCheckboxGroup, {
          props: { size },
          slots: {
            default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
          },
          global: {
            components: { ExCheckbox },
          },
        });

        expect(wrapper.classes()).toContain(`ex-checkbox-group--${size}`);
      });
    });
  });

  // 状态测试
  describe('Status', () => {
    const statuses: ExCheckboxGroupProps['status'][] = [
      'default',
      'success',
      'warning',
      'error',
    ];

    statuses.forEach((status) => {
      it(`renders ${status} status correctly`, () => {
        const wrapper = mount(ExCheckboxGroup, {
          props: { status },
          slots: {
            default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
          },
          global: {
            components: { ExCheckbox },
          },
        });

        expect(wrapper.classes()).toContain(`ex-checkbox-group--${status}`);
      });
    });
  });

  // v-model 测试
  describe('v-model', () => {
    it('updates modelValue when checkbox is clicked', async () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: [],
          'onUpdate:modelValue': (value: Array<string | number>) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[0];
      await firstCheckbox.setValue(true);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['1']]);
    });

    it('works with pre-selected values', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: ['1', '2'],
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
            <ExCheckbox value="3">Option 3</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[2].element as HTMLInputElement).checked).toBe(false);
    });
  });

  // 垂直布局测试
  describe('Vertical Layout', () => {
    it('applies vertical class', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          vertical: true,
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.classes()).toContain('ex-checkbox-group--vertical');
    });
  });

  // 禁用状态测试
  describe('Disabled State', () => {
    it('disables all checkboxes', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          disabled: true,
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.classes()).toContain('ex-checkbox-group--disabled');
      const checkboxWrappers = wrapper.findAllComponents(ExCheckbox);
      checkboxWrappers.forEach((checkboxWrapper) => {
        expect(checkboxWrapper.classes()).toContain('ex-checkbox--disabled');
      });
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          disabled: true,
          modelValue: [],
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 只读状态测试
  describe('Readonly State', () => {
    it('makes all checkboxes readonly', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          readonly: true,
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.classes()).toContain('ex-checkbox-group--readonly');
      const checkboxWrappers = wrapper.findAllComponents(ExCheckbox);
      checkboxWrappers.forEach((checkboxWrapper) => {
        expect(checkboxWrapper.classes()).toContain('ex-checkbox--readonly');
      });
    });
  });

  // 最小/最大限制测试
  describe('Min/Max Limits', () => {
    it('respects min limit', async () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: ['1', '2'],
          min: 2,
          'onUpdate:modelValue': (value: Array<string | number>) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
            <ExCheckbox value="3">Option 3</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      // 尝试取消选中一个，应该被阻止
      const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[0];
      await firstCheckbox.setValue(false);

      // 值不应该改变，因为已经达到最小限制
      expect(wrapper.props('modelValue')).toEqual(['1', '2']);
    });

    it('respects max limit', async () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: ['1', '2'],
          max: 2,
          'onUpdate:modelValue': (value: Array<string | number>) =>
            wrapper.setProps({ modelValue: value }),
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
            <ExCheckbox value="3">Option 3</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      // 尝试选中第三个，应该被阻止
      const thirdCheckbox = wrapper.findAll('input[type="checkbox"]')[2];
      await thirdCheckbox.setValue(true);

      // 值不应该改变，因为已经达到最大限制
      expect(wrapper.props('modelValue')).toEqual(['1', '2']);
    });
  });

  // 事件测试
  describe('Events', () => {
    it('emits change event', async () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: [],
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setValue(true);

      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });

  // 帮助文本和错误信息测试
  describe('Help Text and Error Message', () => {
    it('renders help text', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          helpText: 'Select at least one option',
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.text()).toContain('Select at least one option');
      expect(wrapper.find('.ex-checkbox-group__help').exists()).toBe(true);
    });

    it('renders error message', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          errorMessage: 'Please select at least one option',
          status: 'error',
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.text()).toContain('Please select at least one option');
      expect(wrapper.find('.ex-checkbox-group__error').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ex-checkbox-group--error');
    });
  });

  // 暴露方法测试
  describe('Exposed Methods', () => {
    it('exposes checkAll method', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          modelValue: [],
          options: [
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
          ],
        },
        slots: {
          default: `
            <ExCheckbox value="1">Option 1</ExCheckbox>
            <ExCheckbox value="2">Option 2</ExCheckbox>
          `,
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.checkAll).toBe('function');
    });

    it('exposes uncheckAll method', () => {
      const wrapper = mount(ExCheckboxGroup, {
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.uncheckAll).toBe('function');
    });

    it('exposes toggleAll method', () => {
      const wrapper = mount(ExCheckboxGroup, {
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.toggleAll).toBe('function');
    });
  });

  // 自定义样式测试
  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          customClass: 'custom-group',
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.classes()).toContain('custom-group');
    });

    it('applies custom style', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          customStyle: { padding: '20px' },
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      expect(wrapper.attributes('style')).toContain('padding: 20px');
    });
  });

  // ARIA 属性测试
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mount(ExCheckboxGroup, {
        props: {
          label: 'Select Options',
          helpText: 'Help text',
        },
        slots: {
          default: '<ExCheckbox value="1">Option 1</ExCheckbox>',
        },
        global: {
          components: { ExCheckbox },
        },
      });

      const group = wrapper.find('.ex-checkbox-group');
      expect(group.attributes('role')).toBe('group');
      expect(group.attributes('aria-labelledby')).toBeTruthy();
      expect(group.attributes('aria-describedby')).toBeTruthy();
    });
  });
});
