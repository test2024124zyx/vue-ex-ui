import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import type { Component } from 'vue';
import ExDateTimePicker from '../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExInput from '../../src/components/input/ExInput.vue';
import ExNumberInput from '../../src/components/number-input/ExNumberInput.vue';
import ExSelect from '../../src/components/select/ExSelect.vue';
import ExTreeSelect from '../../src/components/tree-select/ExTreeSelect.vue';

enableAutoUnmount(afterEach);
afterEach(() => vi.restoreAllMocks());

interface FieldInstance {
  focus: (options?: FocusOptions) => void;
  getElement: () => HTMLElement | null;
  clear: () => void;
}

describe('输入控件的公开实例方法', () => {
  it.each([
    ['Input', ExInput, 'input'],
    ['NumberInput', ExNumberInput, 'input'],
    ['Select', ExSelect, '[role="combobox"]'],
    ['DateTimePicker', ExDateTimePicker, '[role="combobox"]'],
    ['TreeSelect', ExTreeSelect, '[role="combobox"]'],
  ] as const)(
    '%s 的 focus 将 FocusOptions 传给真实控件，并能获取元素',
    (_name, component, selector) => {
      const wrapper = mount(component as Component, { attachTo: document.body });
      const field = wrapper.vm as unknown as FieldInstance;
      const focus = vi.spyOn(wrapper.get<HTMLElement>(selector).element, 'focus');
      field.focus({ preventScroll: true });
      expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
      expect(field.getElement()?.contains(wrapper.get(selector).element)).toBe(true);
    }
  );

  it.each([
    ['Select', ExSelect, 'a'],
    ['DateTimePicker', ExDateTimePicker, new Date(2026, 10, 16)],
    ['TreeSelect', ExTreeSelect, 'a'],
  ] as const)('%s 可用公开方法清空，保持受控和只读语义', async (_name, component, modelValue) => {
    const wrapper = mount(component as Component, {
      props: { modelValue, clearable: false },
      attachTo: document.body,
    });
    const field = wrapper.vm as unknown as FieldInstance;
    field.clear();
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
    expect(wrapper.emitted('clear')).toEqual([[]]);
    await wrapper.setProps({ readonly: true });
    field.clear();
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
  });
});
