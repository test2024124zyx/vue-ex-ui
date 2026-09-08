import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import type {
  ExTreeSelectExposed,
  TreeSelectNode,
} from '../../../src/components/tree-select/types';

enableAutoUnmount(afterEach);

const makeData = (disabled = true): TreeSelectNode[] => [
  {
    value: 'root',
    label: '总部门',
    children: [
      {
        value: 'blocked',
        label: '限制团队',
        disabled,
        children: [
          {
            value: 'branch',
            label: '成员分组',
            children: [{ value: 'locked', label: '成员甲' }],
          },
        ],
      },
      { value: 'allowed', label: '成员乙' },
      { value: 'other', label: '成员丙' },
    ],
  },
];

describe('TreeSelect 禁用祖先', () => {
  it.each([
    { multiple: false, checkStrictly: false },
    { multiple: true, checkStrictly: false },
    { multiple: true, checkStrictly: true },
  ])('搜索后代在 $multiple/$checkStrictly 模式下仍不能选择或展开', async mode => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        ...mode,
        data: makeData(),
        modelValue: mode.multiple ? ['locked'] : 'locked',
        filterable: true,
        teleported: false,
      },
      attachTo: document.body,
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('input').setValue('成员');
    const nodes = wrapper.findAll('[role="treeitem"]');
    for (const node of nodes.slice(1, 4)) {
      expect(node.attributes('aria-disabled')).toBe('true');
      expect(node.attributes('tabindex')).toBe('-1');
      await node.trigger('click');
      await node.trigger('keydown', { key: 'Enter' });
      await node.trigger('keydown', { key: ' ' });
      await node.get('.ex-tree-select__expand').trigger('click');
    }
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('expand')).toBeUndefined();
    expect(wrapper.text()).toContain('成员甲');

    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    await nodes[0]!.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    expect(document.activeElement?.textContent).toContain('成员乙');
  });

  it('勾选父节点跳过完整禁用子树，取消父节点保留外部已选的禁用值', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: makeData(),
        multiple: true,
        modelValue: ['locked'],
        defaultExpandAll: true,
        teleported: false,
      },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    const parent = wrapper.get('[role="treeitem"]');
    expect(parent.attributes('aria-checked')).toBe('mixed');
    await parent.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      ['locked', 'root', 'allowed', 'other'],
    ]);
    expect(parent.attributes('aria-checked')).toBe('mixed');

    await wrapper.setProps({
      modelValue: ['root', 'blocked', 'branch', 'locked', 'allowed', 'other'],
    });
    await parent.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['blocked', 'branch', 'locked']]);
  });

  it('操作可用子节点只更新可用祖先，半选状态保留真实外部选值', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: makeData(),
        multiple: true,
        modelValue: ['locked', 'other'],
        defaultExpandAll: true,
        teleported: false,
      },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    const allowed = wrapper.findAll('[role="treeitem"]').find(node => node.text() === '成员乙')!;
    await allowed.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      ['locked', 'other', 'allowed', 'root'],
    ]);
    expect(allowed.attributes('aria-checked')).toBe('false');
    expect(wrapper.get('[role="treeitem"]').attributes('aria-checked')).toBe('mixed');
  });

  it('既有展开分支动态禁用后保留显示，但禁止后代选择、展开、键盘和标签删除', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: makeData(false),
        multiple: true,
        modelValue: ['locked', 'allowed'],
        defaultExpandAll: true,
        clearable: true,
        teleported: false,
      },
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.setProps({ data: makeData() });
    const branch = wrapper.findAll('[role="treeitem"]').find(node => node.text() === '成员分组')!;
    const leaf = wrapper.findAll('[role="treeitem"]').find(node => node.text() === '成员甲')!;
    expect(leaf.attributes('aria-checked')).toBe('true');
    expect(leaf.attributes('aria-disabled')).toBe('true');
    expect(branch.attributes('aria-expanded')).toBe('true');
    await leaf.trigger('click');
    await leaf.trigger('keydown', { key: ' ' });
    await branch.get('.ex-tree-select__expand').trigger('click');
    const lockedTag = wrapper.findAll('.ex-tree-select__tag')[0]!;
    expect(lockedTag.find('button').exists()).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('expand')).toBeUndefined();

    await wrapper.get('.ex-tree-select__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['locked']]);
    expect(wrapper.findAll('.ex-tree-select__tag')).toHaveLength(2);
    await wrapper.setProps({ modelValue: ['locked'] });
    expect(wrapper.find('.ex-tree-select__clear').exists()).toBe(false);
  });

  it('单选禁用后代的清空不可绕过路径限制，重新启用后才允许请求清空', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: { data: makeData(), modelValue: 'locked', clearable: true, teleported: false },
    });
    expect(wrapper.get('.ex-tree-select__label').text()).toBe('成员甲');
    expect(wrapper.find('.ex-tree-select__clear').exists()).toBe(false);
    await wrapper.setProps({ data: makeData(false) });
    await wrapper.get('.ex-tree-select__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    expect(wrapper.get('.ex-tree-select__label').text()).toBe('成员甲');
  });

  it('搜索期间原对象祖先切换 disabled 立即撤掉后代键盘入口并禁止旧节点操作', async () => {
    const data = ref(makeData(false));
    const wrapper = mount({
      render: () => h(ExTreeSelect, { data: data.value, filterable: true, teleported: false }),
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('input').setValue('成员甲');
    const leaf = wrapper.findAll('[role="treeitem"]').at(-1)!;
    data.value[0]!.children![0]!.disabled = true;
    await nextTick();
    expect(leaf.attributes('aria-disabled')).toBe('true');
    await leaf.trigger('click');
    expect(wrapper.getComponent(ExTreeSelect).emitted('update:modelValue')).toBeUndefined();
  });

  it('公开展开方法跳过禁用分支，已展开后禁用的分支不能被批量收起改写', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: { data: makeData(), teleported: false },
    });
    const exposed = wrapper.vm as unknown as ExTreeSelectExposed;
    exposed.expandAll();
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.findAll('[role="treeitem"]').map(node => node.text())).toEqual([
      '总部门',
      '限制团队',
      '成员乙',
      '成员丙',
    ]);
    await wrapper.setProps({ data: makeData(false) });
    exposed.expandAll();
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(6);
    await wrapper.setProps({ data: makeData() });
    exposed.collapseAll();
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    await wrapper.get('.ex-tree-select__expand').trigger('click');
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(6);
    expect(wrapper.findAll('[role="treeitem"]')[2]!.attributes('aria-expanded')).toBe('true');
  });
});
