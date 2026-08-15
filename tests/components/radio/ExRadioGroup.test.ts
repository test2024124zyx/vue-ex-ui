import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExRadioGroup from '../../../src/components/radio/ExRadioGroup.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import type { ExRadioGroupInstance, ExRadioGroupProps } from '../../../src/components/radio/types';

// Mock ExIcon component
vi.mock('../../../src/components/icon/ExIcon.vue', () => ({
  default: {
    name: 'ExIcon',
    props: ['src', 'size', 'clickable'],
    template: '<span class="ex-icon" :data-src="src">Icon</span>',
  },
}));

describe('ExRadioGroup', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ExRadioGroup, {
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.find('.ex-radio-group').exists()).toBe(true);
      expect(wrapper.findAll('.ex-radio').length).toBe(2);
    });

    it('renders with label', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          label: 'Select Option',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.text()).toContain('Select Option');
      expect(wrapper.find('.ex-radio-group__label').exists()).toBe(true);
    });

    it('renders required indicator', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          label: 'Select Option',
          required: true,
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.find('.ex-radio-group__required').exists()).toBe(true);
    });

    it('required 应该传递给组内所有原生单选框', () => {
      const wrapper = mount(ExRadioGroup, {
        props: { required: true },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: { components: { ExRadio } },
      });

      wrapper.findAll('input[type="radio"]').forEach(radio => {
        expect((radio.element as HTMLInputElement).required).toBe(true);
      });
    });
  });

  // 尺寸测试
  describe('Sizes', () => {
    const sizes: ExRadioGroupProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ExRadioGroup, {
          props: { size },
          slots: {
            default: '<ExRadio value="1">Option 1</ExRadio>',
          },
          global: {
            components: { ExRadio },
          },
        });

        expect(wrapper.classes()).toContain(`ex-radio-group--${size}`);
      });
    });
  });

  // 状态测试
  describe('Status', () => {
    const statuses: ExRadioGroupProps['status'][] = ['default', 'success', 'warning', 'error'];

    statuses.forEach(status => {
      it(`renders ${status} status correctly`, () => {
        const wrapper = mount(ExRadioGroup, {
          props: { status },
          slots: {
            default: '<ExRadio value="1">Option 1</ExRadio>',
          },
          global: {
            components: { ExRadio },
          },
        });

        expect(wrapper.classes()).toContain(`ex-radio-group--${status}`);
      });
    });
  });

  // v-model 测试
  describe('v-model', () => {
    it('updates modelValue when radio is clicked', async () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: '',
          'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
        },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      const firstRadio = wrapper.findAll('input[type="radio"]')[0];
      await firstRadio.setValue(true);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1']);
    });

    it('works with pre-selected value', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: '2',
        },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
            <ExRadio value="3">Option 3</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      const radios = wrapper.findAll('input[type="radio"]');
      expect((radios[0].element as HTMLInputElement).checked).toBe(false);
      expect((radios[1].element as HTMLInputElement).checked).toBe(true);
      expect((radios[2].element as HTMLInputElement).checked).toBe(false);
    });
  });

  // 垂直布局测试
  describe('Vertical Layout', () => {
    it('applies vertical class', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          vertical: true,
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.classes()).toContain('ex-radio-group--vertical');
    });
  });

  // 禁用状态测试
  describe('Disabled State', () => {
    it('disables all radios', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          disabled: true,
        },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.classes()).toContain('ex-radio-group--disabled');
      const radioWrappers = wrapper.findAllComponents(ExRadio);
      radioWrappers.forEach(radioWrapper => {
        expect(radioWrapper.classes()).toContain('ex-radio--disabled');
      });
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          disabled: true,
          modelValue: '',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const radio = wrapper.find('input[type="radio"]');
      await radio.trigger('change');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // 只读状态测试
  describe('Readonly State', () => {
    it('makes all radios readonly', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          readonly: true,
        },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.classes()).toContain('ex-radio-group--readonly');
      const radioWrappers = wrapper.findAllComponents(ExRadio);
      radioWrappers.forEach(radioWrapper => {
        expect(radioWrapper.classes()).toContain('ex-radio--readonly');
      });
    });
  });

  // 事件测试
  describe('Events', () => {
    it('emits change event', async () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: '',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const radio = wrapper.find('input[type="radio"]');
      await radio.setValue(true);

      expect(wrapper.emitted('change')).toBeTruthy();
    });
  });

  // 帮助文本和错误信息测试
  describe('Help Text and Error Message', () => {
    it('renders help text', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          helpText: 'Select one option',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.text()).toContain('Select one option');
      expect(wrapper.find('.ex-radio-group__help').exists()).toBe(true);
    });

    it('renders error message', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          errorMessage: 'Please select an option',
          status: 'error',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.text()).toContain('Please select an option');
      expect(wrapper.find('.ex-radio-group__error').exists()).toBe(true);
      expect(wrapper.classes()).toContain('ex-radio-group--error');
    });
  });

  // 暴露方法测试
  describe('Exposed Methods', () => {
    it('exposes getValue method', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: 'test',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const vm = wrapper.vm as unknown as ExRadioGroupInstance;
      expect(typeof vm.getValue).toBe('function');
      expect(vm.getValue()).toBe('test');
    });

    it.each([false, 0])('getValue 应该保留假值 %s', modelValue => {
      const wrapper = mount(ExRadioGroup, {
        props: { modelValue },
        slots: { default: '<ExRadio :value="0">Option</ExRadio>' },
        global: { components: { ExRadio } },
      });

      expect((wrapper.vm as unknown as ExRadioGroupInstance).getValue()).toBe(modelValue);
    });

    it('exposes setValue method', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: '',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const vm = wrapper.vm as unknown as ExRadioGroupInstance;
      expect(typeof vm.setValue).toBe('function');
    });

    it('setValue 应该执行与用户操作相同的校验', async () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          modelValue: 'ok',
          rules: [(value: string | number | boolean) => value === 'ok' || 'invalid'],
        },
        slots: { default: '<ExRadio value="ok">Option</ExRadio>' },
        global: { components: { ExRadio } },
      });

      (wrapper.vm as unknown as ExRadioGroupInstance).setValue('bad');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ex-radio-group__error').text()).toContain('invalid');
    });

    it('exposes getRadioGroupElement method', () => {
      const wrapper = mount(ExRadioGroup, {
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const vm = wrapper.vm as unknown as ExRadioGroupInstance;
      expect(typeof vm.getRadioGroupElement).toBe('function');
      expect(vm.getRadioGroupElement()).toBe(wrapper.element);
    });
  });

  // 自定义样式测试
  describe('Custom Styling', () => {
    it('applies custom class', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          customClass: 'custom-group',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.classes()).toContain('custom-group');
    });

    it('applies custom style', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          customStyle: { padding: '20px' },
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      expect(wrapper.attributes('style')).toContain('padding: 20px');
    });
  });

  // ARIA 属性测试
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          label: 'Select Option',
          helpText: 'Help text',
        },
        slots: {
          default: '<ExRadio value="1">Option 1</ExRadio>',
        },
        global: {
          components: { ExRadio },
        },
      });

      const group = wrapper.find('.ex-radio-group');
      expect(group.attributes('role')).toBe('radiogroup');
      expect(group.attributes('aria-labelledby')).toBeTruthy();
      expect(group.attributes('aria-describedby')).toBeTruthy();
    });

    it('没有可见标签时不应该引用不存在的 aria-labelledby', () => {
      const wrapper = mount(ExRadioGroup, {
        slots: { default: '<ExRadio value="1">Option</ExRadio>' },
        global: { components: { ExRadio } },
      });

      expect(wrapper.find('[role="radiogroup"]').attributes('aria-labelledby')).toBeUndefined();
    });
  });

  // Name 属性测试
  describe('Name Attribute', () => {
    it('applies name to all radios', () => {
      const wrapper = mount(ExRadioGroup, {
        props: {
          name: 'test-group',
        },
        slots: {
          default: `
            <ExRadio value="1">Option 1</ExRadio>
            <ExRadio value="2">Option 2</ExRadio>
          `,
        },
        global: {
          components: { ExRadio },
        },
      });

      const radios = wrapper.findAll('input[type="radio"]');
      radios.forEach(radio => {
        expect(radio.attributes('name')).toBe('test-group');
      });
    });
  });
});
