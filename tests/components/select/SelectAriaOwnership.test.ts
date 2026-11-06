import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSelect from '../../../src/components/select/ExSelect.vue';

describe('Select 仅由实际 combobox 表达展开与活动项', () => {
  it.each([false, true])('searchable=%s 时单选与多选的语义不重复', async searchable => {
    for (const multiple of [false, true]) {
      const wrapper = mount(ExSelect, {
        props: { searchable, multiple, options: [{ value: 'a', label: '选项甲' }] },
        attrs: { 'aria-label': '选择项目' },
        attachTo: document.body,
      });
      try {
        const trigger = wrapper.get('.ex-select__trigger');
        const control = wrapper.get('[role="combobox"]');
        expect(wrapper.findAll('[role="combobox"]')).toHaveLength(1);
        expect(control.attributes('aria-expanded')).toBe('false');
        await trigger.trigger('click');
        await control.trigger('keydown', { key: 'ArrowDown' });
        expect(control.attributes('aria-expanded')).toBe('true');
        expect(control.attributes('aria-activedescendant')).toBeTruthy();
        if (searchable) {
          expect(trigger.attributes('aria-expanded')).toBeUndefined();
          expect(trigger.attributes('aria-activedescendant')).toBeUndefined();
          expect(trigger.attributes('aria-controls')).toBeUndefined();
        }
      } finally {
        wrapper.unmount();
      }
    }
  });
});
