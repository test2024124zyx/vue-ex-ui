import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import ExSwitch from '../../src/components/switch/ExSwitch.vue';
import ExNumberInput from '../../src/components/number-input/ExNumberInput.vue';
import ExSlider from '../../src/components/slider/ExSlider.vue';
import ExColorPicker from '../../src/components/color-picker/ExColorPicker.vue';
import ExDateTimePicker from '../../src/components/datetime-picker/ExDateTimePicker.vue';

enableAutoUnmount(afterEach);

describe('输入法组合中的快捷键', () => {
  it.each([
    { name: 'Switch', mountControl: () => mount(ExSwitch), selector: 'input', key: ' ' },
    {
      name: 'NumberInput',
      mountControl: () => mount(ExNumberInput),
      selector: 'input',
      key: 'ArrowUp',
    },
    {
      name: 'Slider',
      mountControl: () => mount(ExSlider),
      selector: '[role="slider"]',
      key: 'ArrowRight',
    },
  ])('$name 保留输入法按键，组合结束后仍可按键改值', async ({ mountControl, selector, key }) => {
    const wrapper = mountControl();
    const control = wrapper.get(selector);
    await control.trigger('keydown', { key, isComposing: true });
    await control.trigger('keydown', { key, keyCode: 229 });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await control.trigger('keydown', { key });
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
  });

  it.each([
    {
      name: 'ColorPicker',
      mountControl: () => mount(ExColorPicker),
      selector: '.ex-color-picker__trigger',
      key: 'ArrowDown',
    },
    {
      name: 'DateTimePicker',
      mountControl: () => mount(ExDateTimePicker),
      selector: 'input',
      key: 'Enter',
    },
  ])('$name 组合期间保持浮层关闭', async ({ mountControl, selector, key }) => {
    const wrapper = mountControl();
    const control = wrapper.get(selector);
    await control.trigger('keydown', { key, keyCode: 229 });
    expect(control.attributes('aria-expanded')).toBe('false');
    await control.trigger('keydown', { key });
    expect(control.attributes('aria-expanded')).toBe('true');
  });
});
