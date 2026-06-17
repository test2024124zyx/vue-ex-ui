import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import type { TreeNode } from '../../../src/components/tree/types';

describe('ExTree', () => {
  const data: TreeNode[] = [
    {
      key: '1',
      label: '父节点 1',
      children: [
        { key: '1-1', label: '子节点 1-1' },
        { key: '1-2', label: '子节点 1-2' },
      ],
    },
    { key: '2', label: '父节点 2', children: [{ key: '2-1', label: '子节点 2-1' }] },
  ];

  describe('基础渲染与无障碍', () => {
    it('应该渲染根节点', () => {
      const wrapper = mount(ExTree, { props: { data } });
      expect(wrapper.find('.ex-tree').exists()).toBe(true);
      const items = wrapper.findAll('[role="treeitem"]');
      // 默认未展开时只渲染顶层两个节点
      expect(items.length).toBe(2);
    });

    it('treeitem 应带 aria-expanded 属性', () => {
      const wrapper = mount(ExTree, { props: { data } });
      const first = wrapper.find('[role="treeitem"]');
      expect(first.attributes('aria-expanded')).toBeDefined();
    });
  });

  describe('展开/收起', () => {
    it('点击展开图标应展开子节点', async () => {
      const wrapper = mount(ExTree, { props: { data } });
      await wrapper.find('.ex-tree-node__expand-icon').trigger('click');
      await nextTick();
      const items = wrapper.findAll('[role="treeitem"]');
      // 第一个父节点展开后，新增其 2 个子节点
      expect(items.length).toBe(4);
      expect(wrapper.emitted('update:expandedKeys')).toBeTruthy();
    });

    it('defaultExpandAll 应展开全部节点', () => {
      const wrapper = mount(ExTree, { props: { data, defaultExpandAll: true } });
      const items = wrapper.findAll('[role="treeitem"]');
      expect(items.length).toBe(5);
    });
  });

  describe('选择', () => {
    it('点击节点内容应触发选择事件', async () => {
      const wrapper = mount(ExTree, { props: { data, selectable: true } });
      await wrapper.find('.ex-tree-node__content').trigger('click');
      expect(wrapper.emitted('update:selectedKeys') || wrapper.emitted('select')).toBeTruthy();
    });
  });
});
