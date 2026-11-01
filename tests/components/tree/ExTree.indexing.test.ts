import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import type { ExTreeExposed, TreeNode } from '../../../src/components/tree/types';

describe('ExTree 大树计算及状态一致性', () => {
  const createDeepTree = (depth: number) => {
    let childrenReads = 0;
    let node: TreeNode = { key: 'leaf', label: '叶节点' };
    for (let level = depth - 1; level >= 0; level -= 1) {
      const child = node;
      node = {
        key: `level-${level}`,
        label: `第 ${level} 层`,
        get children() {
          childrenReads += 1;
          return [child];
        },
      };
    }
    return {
      data: [node],
      reads: () => childrenReads,
      reset: () => {
        childrenReads = 0;
      },
    };
  };

  it('深树外部勾选向上聚合为全选，避免逐祖先重复遍历整棵子树', () => {
    const depth = 200;
    const tree = createDeepTree(depth);
    const wrapper = mount(ExTree, {
      props: { data: tree.data, checkable: true, defaultCheckedKeys: ['leaf'] },
    });
    const methods = wrapper.vm as unknown as ExTreeExposed;
    expect(methods.getHalfCheckedNodes()).toEqual([]);
    expect(methods.getCheckedNodes()).toHaveLength(depth + 1);
    expect(tree.reads()).toBeLessThan(depth * 15);
    wrapper.unmount();
  });

  it('叶节点级联勾选沿父索引更新，保持受保护节点语义及原始输出顺序', async () => {
    const depth = 200;
    const tree = createDeepTree(depth);
    const wrapper = mount(ExTree, { props: { data: tree.data, checkable: true } });
    const methods = wrapper.vm as unknown as ExTreeExposed;
    tree.reset();
    methods.requestNodeCheck('leaf', true);
    await nextTick();
    expect(methods.getCheckedNodes().map(node => node.key)).toEqual([
      'leaf',
      ...Array.from({ length: depth }, (_, level) => `level-${depth - level - 1}`),
    ]);
    expect(methods.getHalfCheckedNodes()).toEqual([]);
    expect(tree.reads()).toBeLessThan(depth * 15);
    wrapper.unmount();
  });

  it('禁用和不可勾选节点不参与半选计数，其可勾选后代仍参与级联', async () => {
    const data: TreeNode[] = [
      {
        key: 'root',
        label: '根节点',
        children: [
          {
            key: 'disabled',
            label: '禁用',
            disabled: true,
            children: [{ key: 'nested', label: '后代' }],
          },
          { key: 'guarded', label: '不可勾选', checkable: false },
          { key: 'other', label: '其他' },
        ],
      },
    ];
    const wrapper = mount(ExTree, {
      props: { data, checkable: true, defaultCheckedKeys: ['nested'] },
    });
    const methods = wrapper.vm as unknown as ExTreeExposed;
    expect(methods.getHalfCheckedNodes().map(node => node.key)).toEqual(['root']);
    methods.requestNodeCheck('root', true);
    await nextTick();
    expect(methods.getCheckedNodes().map(node => node.key)).toEqual(['nested', 'root', 'other']);
    expect(methods.getHalfCheckedNodes()).toEqual([]);
    methods.requestNodeCheck('root', false);
    await nextTick();
    expect(methods.getCheckedNodes()).toEqual([]);
    wrapper.unmount();
  });

  it('替换树数据后祖先索引、半选集合和可见展开状态同步失效', async () => {
    const first: TreeNode[] = [
      { key: 'old', label: '旧父级', children: [{ key: 'leaf', label: '叶节点' }] },
    ];
    const second: TreeNode[] = [
      {
        key: 'new',
        label: '新父级',
        children: [
          { key: 'leaf', label: '叶节点' },
          { key: 'other', label: '其他' },
        ],
      },
    ];
    const wrapper = mount(ExTree, {
      props: { data: first, checkable: true, defaultExpandedKeys: ['old'] },
    });
    const methods = wrapper.vm as unknown as ExTreeExposed;
    await wrapper.setProps({ data: second });
    methods.requestNodeCheck('leaf', true);
    methods.requestNodeExpansion('new', true);
    await nextTick();
    expect(methods.getNode('old')).toBeNull();
    expect(methods.getHalfCheckedNodes().map(node => node.key)).toEqual(['new']);
    expect(methods.getCheckedNodes().map(node => node.key)).toEqual(['leaf']);
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
    expect(wrapper.get('[data-node-key="leaf"]').attributes('aria-checked')).toBe('true');
    wrapper.unmount();
  });
});
