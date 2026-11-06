import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import type { TreeNode } from '../../../src/components/tree/types';
import type { CascaderOption } from '../../../src/components/cascader/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('Tree 确认值的联动与深层数据', () => {
  it('外部值向下继承、向上汇总，禁用项不参与且不擅自改写父级值', async () => {
    const data = [
      {
        key: 'p',
        label: '父',
        children: [
          { key: 'a', label: '甲' },
          { key: 'b', label: '乙' },
          { key: 'disabled', label: '禁用', disabled: true },
          { key: 'guarded', label: '不可勾选', checkable: false },
        ],
      },
    ];
    const wrapper = mount(ExTree, {
      props: { data, checkable: true, checkedKeys: ['p'], defaultExpandAll: true },
    });
    wrappers.push(wrapper);
    expect(wrapper.vm.getCheckedNodes().map(node => node.key)).toEqual(['p', 'a', 'b']);
    await wrapper.setProps({ checkedKeys: ['a', 'b'] });
    expect(wrapper.get<HTMLInputElement>('[data-node-key="p"] input').element.checked).toBe(true);
    expect(wrapper.emitted('update:checkedKeys')).toBeUndefined();
    wrapper.vm.requestNodeCheck('a', false);
    expect(wrapper.emitted('update:checkedKeys')?.at(-1)).toEqual([['b']]);
    // 父级拒绝请求时仍保持确认的联动状态。
    expect(wrapper.vm.getCheckedNodes().map(node => node.key)).toEqual(['a', 'b', 'p']);
    await wrapper.setProps({ checkedKeys: ['a'] });
    expect(wrapper.vm.getHalfCheckedNodes().map(node => node.key)).toEqual(['p']);
    await wrapper.setProps({ checkedKeys: ['p'], checkStrictly: true });
    expect(wrapper.vm.getCheckedNodes().map(node => node.key)).toEqual(['p']);
  });

  it.each(['tree', 'cascader'] as const)('%s 五千层合法树可挂载、动态更新与筛选', async kind => {
    let root: TreeNode & CascaderOption = { key: 'leaf', value: 'leaf', label: '最深节点' };
    for (let index = 4999; index >= 0; index--)
      root = { key: String(index), value: index, label: `层级 ${index}`, children: [root] };
    const data = reactive([root]);
    const wrapper = mount({
      render: () =>
        kind === 'tree'
          ? h(ExTree, {
              data,
              virtual: true,
              filterNodeMethod: (query, node) => node.label.includes(query),
            })
          : h(ExCascader, { options: data, filterable: true, teleported: false }),
    });
    wrappers.push(wrapper);
    data[0]!.label = '新的根节点';
    await nextTick();
    if (kind === 'tree') {
      const tree = wrapper.getComponent(ExTree);
      expect(tree.vm.getNode('0')?.label).toBe('新的根节点');
      tree.vm.filter('最深');
      await nextTick();
      expect(tree.emitted('update:expandedKeys')?.[0]?.[0]).toHaveLength(5000);
      expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(40);
    } else {
      await wrapper.get('input').setValue('最深');
      expect(wrapper.text()).toContain('最深节点');
      expect(wrapper.text()).toContain('新的根节点');
    }
  });
});
