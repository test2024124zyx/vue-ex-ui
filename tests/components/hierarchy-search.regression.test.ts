import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExMenu from '../../src/components/menu/ExMenu.vue';
import ExTree from '../../src/components/tree/ExTree.vue';
import ExTreeSelect from '../../src/components/tree-select/ExTreeSelect.vue';

enableAutoUnmount(afterEach);

const parent = { key: 'fruit', value: 'fruit', label: '水果' };
const children = [
  { key: 'apple', value: 'apple', label: '水果苹果' },
  { key: 'banana', value: 'banana', label: '香蕉' },
];
const data = [
  { ...parent, children },
  { key: 'tea', value: 'tea', label: '茶叶' },
];

describe('树形组件的筛选范围', () => {
  it('Tree 父项命中展开完整子树，只有后代命中时保留路径', async () => {
    const wrapper = mount(ExTree, {
      props: { data, filterNodeMethod: (query, node) => node.label.includes(query) },
    });
    wrapper.vm.filter('水果');
    await nextTick();
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).toContain('香蕉');
    expect(wrapper.text()).not.toContain('茶叶');
    wrapper.vm.filter('苹果');
    await nextTick();
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).not.toContain('香蕉');
  });

  it('TreeSelect 保留命中的父项全部子节点，以及仅后代命中的路径', async () => {
    const wrapper = mount(ExTreeSelect, { props: { data, filterable: true, teleported: false } });
    await wrapper.get('[role="combobox"]').trigger('click');
    const search = wrapper.get('input.ex-tree-select__search-input');
    await search.setValue('水果');
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).toContain('香蕉');
    expect(wrapper.text()).not.toContain('茶叶');
    await search.setValue('苹果');
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).not.toContain('香蕉');
  });

  it('菜单继续保留命中父项的全部子项，换成后代搜索时仅保留路径', async () => {
    const wrapper = mount(ExMenu, { props: { items: data, searchable: true } });
    const search = wrapper.get('input');
    await search.setValue('水果');
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).toContain('香蕉');
    expect(wrapper.text()).not.toContain('茶叶');
    await search.setValue('苹果');
    expect(wrapper.text()).toContain('水果苹果');
    expect(wrapper.text()).not.toContain('香蕉');
  });
});
