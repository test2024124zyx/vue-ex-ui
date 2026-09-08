import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import type { TreeSelectValue } from '../../../src/components/tree-select/types';

enableAutoUnmount(afterEach);

const data = [
  { value: 'first', label: '甲组' },
  { value: 'second', label: '乙组' },
];

describe('TreeSelect 受控模式切换', () => {
  it('未提供 modelValue 时单选本地确认，清空恢复占位', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: { data, clearable: true, teleported: false },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[role="treeitem"]').trigger('click');
    expect(wrapper.get('.ex-tree-select__label').text()).toBe('甲组');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['first']);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.get('[role="treeitem"]').attributes('aria-selected')).toBe('true');
    await wrapper.get('.ex-tree-select__clear').trigger('click');
    expect(wrapper.find('.ex-tree-select__label').exists()).toBe(false);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  });

  it.each([false, true])(
    '非受控多选 checkStrictly=%s 支持选择、删标签和清空',
    async checkStrictly => {
      const wrapper = mount(ExTreeSelect, {
        props: { data, multiple: true, checkStrictly, clearable: true, teleported: false },
      });
      await wrapper.get('[role="combobox"]').trigger('click');
      const nodes = wrapper.findAll('[role="treeitem"]');
      await nodes[0]!.trigger('click');
      await nodes[1]!.trigger('click');
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['first', 'second']]);
      expect(nodes.map(node => node.attributes('aria-checked'))).toEqual(['true', 'true']);
      await wrapper.findAll('.ex-tree-select__tag-close')[0]!.trigger('click');
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['second']]);
      expect(wrapper.findAll('.ex-tree-select__tag-label').map(tag => tag.text())).toEqual([
        '乙组',
      ]);
      await wrapper.get('.ex-tree-select__clear').trigger('click');
      expect(wrapper.findAll('.ex-tree-select__tag')).toHaveLength(0);
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
    }
  );

  it.each([false, true])('显式 null 在 multiple=%s 时仍是受控空值', async multiple => {
    const wrapper = mount(ExTreeSelect, {
      props: { data, modelValue: null, multiple, teleported: false },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[role="treeitem"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([multiple ? ['first'] : 'first']);
    expect(wrapper.find('.ex-tree-select__label').exists()).toBe(false);
    expect(wrapper.findAll('.ex-tree-select__tag')).toHaveLength(0);
  });

  it.each([false, true])('多选=%s 模式切换保留确认值和受控空值', async multiple => {
    const value = ref<TreeSelectValue | undefined>(multiple ? ['first'] : 'first');
    const wrapper = mount({
      render: () =>
        h(ExTreeSelect, {
          data,
          modelValue: value.value,
          multiple,
          clearable: true,
          teleported: false,
        }),
    });
    const selectedText = () => wrapper.get('.ex-tree-select__value').text();
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.findAll('[role="treeitem"]')[1]!.trigger('click');
    expect(selectedText()).toContain('甲组');
    expect(selectedText()).not.toContain('乙组');
    value.value = undefined;
    await nextTick();
    expect(selectedText()).toContain('甲组');
    if (!multiple) await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.findAll('[role="treeitem"]')[1]!.trigger('click');
    expect(selectedText()).toContain('乙组');
    value.value = null;
    await nextTick();
    expect(wrapper.find('.ex-tree-select__label').exists()).toBe(false);
    expect(wrapper.findAll('.ex-tree-select__tag')).toHaveLength(0);
    value.value = undefined;
    await nextTick();
    expect(wrapper.findAll('.ex-tree-select__tag')).toHaveLength(0);
    expect(wrapper.find('.ex-tree-select__label').exists()).toBe(false);
  });
});
