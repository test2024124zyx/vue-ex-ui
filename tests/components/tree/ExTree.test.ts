import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
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
      const wrapper = mount(ExTree, { props: { data, ariaLabel: '资源目录' } });
      expect(wrapper.find('.ex-tree').exists()).toBe(true);
      expect(wrapper.find('.ex-tree').attributes('aria-label')).toBe('资源目录');
      expect(wrapper.find('.ex-tree').attributes('aria-multiselectable')).toBeUndefined();
      const items = wrapper.findAll('[role="treeitem"]');
      // 默认未展开时只渲染顶层两个节点
      expect(items.length).toBe(2);
    });

    it('treeitem 应带 aria-expanded 属性', () => {
      const wrapper = mount(ExTree, { props: { data } });
      const first = wrapper.find('[role="treeitem"]');
      expect(first.attributes('aria-expanded')).toBeDefined();
    });

    it('多选树声明 aria-multiselectable', () => {
      const wrapper = mount(ExTree, { props: { data, multiple: true } });
      expect(wrapper.find('.ex-tree').attributes('aria-multiselectable')).toBe('true');
    });

    it('展开后仍只保留一个树级 Tab 停靠点', () => {
      const wrapper = mount(ExTree, {
        props: { data, defaultExpandedKeys: ['1'] },
      });
      const tabStops = wrapper
        .findAll('[role="treeitem"]')
        .filter(node => node.attributes('tabindex') === '0');

      expect(tabStops).toHaveLength(1);
      expect(tabStops[0].text()).toContain('父节点 1');
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

    it('受控 expandedKeys 只发出展开请求，外部同步前不改变节点', async () => {
      const wrapper = mount(ExTree, { props: { data, expandedKeys: [] } });

      await wrapper.find('.ex-tree-node__expand-icon').trigger('click');

      expect(wrapper.emitted('update:expandedKeys')).toEqual([[['1']]]);
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);

      await wrapper.setProps({ expandedKeys: ['1'] });
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4);
    });
  });

  describe('选择', () => {
    it('点击节点内容应触发选择事件', async () => {
      const wrapper = mount(ExTree, { props: { data, selectable: true } });
      await wrapper.find('.ex-tree-node__content').trigger('click');
      expect(wrapper.emitted('update:selectedKeys') || wrapper.emitted('select')).toBeTruthy();
    });

    it('受控 selectedKeys 在外部同步前不伪造选中状态', async () => {
      const wrapper = mount(ExTree, {
        props: { data, selectable: true, selectedKeys: [] },
      });

      await wrapper.find('.ex-tree-node__content').trigger('click');

      expect(wrapper.emitted('update:selectedKeys')).toEqual([[['1']]]);
      expect(wrapper.find('[role="treeitem"]').attributes('aria-selected')).toBe('false');

      await wrapper.setProps({ selectedKeys: ['1'] });
      expect(wrapper.find('[role="treeitem"]').attributes('aria-selected')).toBe('true');
    });

    it('受控 checkedKeys 在外部同步前恢复原生复选框状态', async () => {
      const wrapper = mount(ExTree, {
        props: { data, checkable: true, checkStrictly: true, checkedKeys: [] },
      });
      const checkbox = wrapper.get('.ex-tree-node__checkbox input');

      await checkbox.setValue(true);
      await nextTick();

      expect(wrapper.emitted('update:checkedKeys')).toEqual([[['1']]]);
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
      expect(wrapper.find('[role="treeitem"]').attributes('aria-checked')).toBe('false');
      expect(checkbox.attributes('aria-label')).toBe('父节点 1');
    });

    it('级联勾选不会改写禁用或不可勾选节点', async () => {
      const guardedData: TreeNode[] = [
        {
          key: 'parent',
          label: '父节点',
          children: [
            { key: 'enabled', label: '可勾选' },
            { key: 'disabled', label: '禁用', disabled: true },
            { key: 'guarded', label: '不可勾选', checkable: false },
          ],
        },
      ];
      const wrapper = mount(ExTree, {
        props: { data: guardedData, checkable: true, defaultExpandedKeys: ['parent'] },
      });

      await wrapper.get('.ex-tree-node__checkbox input').setValue(true);

      expect(wrapper.emitted('update:checkedKeys')?.[0]).toEqual([['parent', 'enabled']]);
    });

    it('部分勾选的树节点应该暴露 aria-checked="mixed"', () => {
      const wrapper = mount(ExTree, {
        props: {
          data,
          checkable: true,
          defaultExpandedKeys: ['1'],
          defaultCheckedKeys: ['1-1'],
        },
      });

      expect(wrapper.find('[role="treeitem"]').attributes('aria-checked')).toBe('mixed');
    });

    it('子节点全部勾选时不应该把禁用父节点加入 checkedKeys', async () => {
      const guardedData: TreeNode[] = [
        {
          key: 'disabled-parent',
          label: '禁用父节点',
          disabled: true,
          children: [{ key: 'child', label: '子节点' }],
        },
      ];
      const wrapper = mount(ExTree, {
        props: { data: guardedData, checkable: true, defaultExpandedKeys: ['disabled-parent'] },
      });
      const childCheckbox = wrapper.findAll('.ex-tree-node__checkbox input')[1];

      await childCheckbox.setValue(true);

      expect(wrapper.emitted('update:checkedKeys')?.at(-1)).toEqual([['child']]);
    });
  });

  describe('键盘与上下文菜单', () => {
    it('方向键、Home、End 与 Enter 按可见顺序导航和选择', async () => {
      const wrapper = mount(ExTree, {
        props: { data, defaultExpandedKeys: ['1'], selectable: true },
        attachTo: document.body,
      });
      const items = wrapper.findAll<HTMLElement>('[role="treeitem"]');

      items[0].element.focus();
      await items[0].trigger('keydown', { key: 'ArrowDown' });
      expect(document.activeElement).toBe(items[1].element);

      await items[1].trigger('keydown', { key: 'End' });
      expect(document.activeElement).toBe(items[3].element);
      await items[3].trigger('keydown', { key: 'Home' });
      expect(document.activeElement).toBe(items[0].element);

      await items[0].trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      expect(document.activeElement).toBe(items[1].element);
      await items[1].trigger('keydown', { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(items[0].element);

      await items[0].trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:selectedKeys')?.at(-1)).toEqual([['1']]);
      wrapper.unmount();
    });

    it('右方向键展开、左方向键收起，空格勾选当前节点', async () => {
      const wrapper = mount(ExTree, {
        props: { data, checkable: true, checkStrictly: true },
      });
      const root = wrapper.find<HTMLElement>('[role="treeitem"]');

      await root.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['1']]);
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4);

      await root.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('update:checkedKeys')?.at(-1)).toEqual([['1']]);

      await root.trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[]]);
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    });

    it('右键阻止浏览器默认菜单并透传原始事件', async () => {
      const wrapper = mount(ExTree, { props: { data } });
      await wrapper.get('.ex-tree-node__content').trigger('contextmenu');

      const event = wrapper.emitted('node-contextmenu')?.[0]?.[1] as MouseEvent;
      expect(event).toBeInstanceOf(MouseEvent);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('节点内容插槽', () => {
    it('普通和递归节点都使用调用方提供的渲染内容', async () => {
      const wrapper = mount(ExTree, {
        props: { data, defaultExpandedKeys: ['1'] },
        slots: {
          default: ({ node }: { node: TreeNode }) => h('strong', `自定义-${node.label}`),
        },
      });

      const labels = wrapper.findAll('strong').map(node => node.text());
      expect(labels).toEqual([
        '自定义-父节点 1',
        '自定义-子节点 1-1',
        '自定义-子节点 1-2',
        '自定义-父节点 2',
      ]);
    });

    it('虚拟模式同样转发节点内容插槽', () => {
      const wrapper = mount(ExTree, {
        props: { data, virtual: true, height: 100 },
        slots: {
          default: ({ node }: { node: TreeNode }) => h('strong', `虚拟-${node.label}`),
        },
      });

      expect(wrapper.find('strong').text()).toBe('虚拟-父节点 1');
    });

    it('虚拟滚动对非法尺寸输入使用安全默认值', () => {
      const wrapper = mount(ExTree, {
        props: { data, virtual: true, height: 0, itemHeight: 0, virtualBuffer: -2 },
      });

      expect(wrapper.get('.ex-tree__viewport').attributes('style')).toContain('height: 400px');
      expect(wrapper.get('.ex-tree__phantom').attributes('style')).not.toMatch(/NaN|Infinity/);
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    });

    it('虚拟滚动只把当前窗口节点移入渲染区', async () => {
      const largeData: TreeNode[] = Array.from({ length: 20 }, (_, index) => ({
        key: String(index),
        label: `节点 ${index}`,
      }));
      let frame: FrameRequestCallback | undefined;
      const requestFrame = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation(callback => {
          frame = callback;
          return 1;
        });
      const wrapper = mount(ExTree, {
        props: {
          data: largeData,
          virtual: true,
          height: 56,
          itemHeight: 28,
          virtualBuffer: 0,
        },
      });
      const viewport = wrapper.get<HTMLElement>('.ex-tree__viewport');
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
      expect(wrapper.text()).toContain('节点 0');

      viewport.element.scrollTop = 140;
      await viewport.trigger('scroll');
      frame?.(0);
      await nextTick();

      expect(wrapper.text()).toContain('节点 5');
      expect(wrapper.text()).not.toContain('节点 0');
      requestFrame.mockRestore();
    });

    it('滚轮将激活节点移出窗口后仍保留唯一的可见 tabstop', async () => {
      const largeData: TreeNode[] = Array.from({ length: 20 }, (_, index) => ({
        key: String(index),
        label: `节点 ${index}`,
        disabled: index === 5,
      }));
      let frame: FrameRequestCallback | undefined;
      const requestFrame = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation(callback => {
          frame = callback;
          return 1;
        });
      const wrapper = mount(ExTree, {
        props: {
          data: largeData,
          virtual: true,
          height: 56,
          itemHeight: 28,
          virtualBuffer: 0,
        },
      });
      const viewport = wrapper.get<HTMLElement>('.ex-tree__viewport');

      viewport.element.scrollTop = 140;
      await viewport.trigger('scroll');
      frame?.(0);
      await nextTick();

      const renderedNodes = wrapper.findAll<HTMLElement>('[role="treeitem"]');
      const tabStops = renderedNodes.filter(node => node.attributes('tabindex') === '0');
      expect(tabStops).toHaveLength(1);
      expect(tabStops[0]?.text()).toContain('节点 6');
      requestFrame.mockRestore();
    });

    it('虚拟树方向键应该能导航到当前窗口之外的下一节点', async () => {
      const largeData: TreeNode[] = Array.from({ length: 20 }, (_, index) => ({
        key: String(index),
        label: `节点 ${index}`,
      }));
      const wrapper = mount(ExTree, {
        props: {
          data: largeData,
          virtual: true,
          height: 56,
          itemHeight: 28,
          virtualBuffer: 0,
        },
        attachTo: document.body,
      });
      const second = wrapper.findAll<HTMLElement>('[role="treeitem"]')[1];
      second.element.focus();

      await second.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      expect(document.activeElement?.textContent).toContain('节点 2');
      expect(wrapper.get<HTMLElement>('.ex-tree__viewport').element.scrollTop).toBe(56);
      wrapper.unmount();
    });

    it('节点插槽中的交互控件不会触发树节点键盘选择', async () => {
      const wrapper = mount(ExTree, {
        props: { data, selectable: true },
        slots: {
          default: ({ node }: { node: TreeNode }) =>
            h('button', { class: 'node-action', type: 'button' }, node.label),
        },
      });

      await wrapper.get('.node-action').trigger('keydown', { key: ' ' });

      expect(wrapper.emitted('update:selectedKeys')).toBeUndefined();
      expect(wrapper.emitted('node-click')).toBeUndefined();
    });
  });

  describe('拖拽请求', () => {
    it('只对当前树中的完整源节点发出 drop 事件', async () => {
      const transferValues = new Map<string, string>();
      const dataTransfer = {
        effectAllowed: 'none',
        dropEffect: 'none',
        setData: vi.fn((type: string, value: string) => {
          transferValues.set(type, value);
        }),
        getData: vi.fn((type: string) => transferValues.get(type) ?? ''),
      };
      const wrapper = mount(ExTree, { props: { data, draggable: true } });
      const nodes = wrapper.findAll('[role="treeitem"]');
      vi.spyOn(nodes[1].element, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      await nodes[0].trigger('dragstart', { dataTransfer });
      await nodes[1].trigger('dragenter', { dataTransfer });
      expect(nodes[1].classes()).toContain('ex-tree-node--drag-over');
      await nodes[1].trigger('dragleave', { dataTransfer });
      expect(nodes[1].classes()).not.toContain('ex-tree-node--drag-over');
      await nodes[1].trigger('dragenter', { dataTransfer });
      await nodes[1].trigger('dragover', { dataTransfer, clientY: 50 });
      await nodes[1].trigger('drop', { dataTransfer });

      expect(wrapper.emitted('node-drop')?.[0]?.slice(0, 3)).toEqual([data[0], data[1], 'inner']);

      await nodes[0].trigger('dragstart', { dataTransfer });
      await nodes[1].trigger('dragover', { dataTransfer, clientY: 10 });
      await nodes[1].trigger('drop', { dataTransfer });
      expect(wrapper.emitted('node-drop')?.[1]?.[2]).toBe('before');

      await nodes[0].trigger('dragstart', { dataTransfer });
      await nodes[1].trigger('dragover', { dataTransfer, clientY: 90 });
      await nodes[1].trigger('drop', { dataTransfer });
      expect(wrapper.emitted('node-drop')?.[2]?.[2]).toBe('after');
      await nodes[0].trigger('dragend', { dataTransfer });
      expect(wrapper.emitted('node-drag-enter')).toHaveLength(2);
      expect(wrapper.emitted('node-drag-leave')).toHaveLength(1);
      expect(wrapper.emitted('node-drag-end')).toHaveLength(1);

      transferValues.set('text/plain', 'external-key');
      await nodes[1].trigger('dragover', { dataTransfer, clientY: 0 });
      await nodes[1].trigger('drop', { dataTransfer });
      expect(wrapper.emitted('node-drop')).toHaveLength(3);
    });
  });

  describe('过滤', () => {
    it('保留命中节点的祖先路径并请求展开祖先', async () => {
      const wrapper = mount(ExTree, {
        props: {
          data,
          filterNodeMethod: (value, node) => node.label.includes(value),
          class: ['custom-tree'],
          style: { width: '320px' },
        },
      });
      const vm = wrapper.vm as unknown as { filter: (value: string) => void };

      vm.filter('子节点 1-2');
      await nextTick();

      expect(wrapper.classes()).toContain('custom-tree');
      expect(wrapper.attributes('style')).toContain('width: 320px');
      expect(wrapper.text()).toContain('父节点 1');
      expect(wrapper.text()).toContain('子节点 1-2');
      expect(wrapper.text()).not.toContain('父节点 2');
      expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['1']]);

      vm.filter('不存在');
      await nextTick();
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0);

      vm.filter('');
      await nextTick();
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4);
    });
  });

  describe('公开实例', () => {
    it('只保留查询方法和语义明确的状态请求方法', () => {
      const wrapper = mount(ExTree, { props: { data } });
      const vm = wrapper.vm as unknown as Record<string, unknown>;

      expect(vm.setSelected).toBeUndefined();
      expect(vm.setChecked).toBeUndefined();
      expect(vm.setExpanded).toBeUndefined();
      expect(vm.expandAll).toBeUndefined();
      expect(vm.collapseAll).toBeUndefined();
      expect(vm.requestNodeSelection).toBeTypeOf('function');
      expect(vm.requestNodeCheck).toBeTypeOf('function');
      expect(vm.requestNodeExpansion).toBeTypeOf('function');
      expect(vm.requestExpandAll).toBeTypeOf('function');
      expect(vm.requestCollapseAll).toBeTypeOf('function');
    });

    it('查询方法返回真实节点，请求方法拒绝不存在或受保护节点', () => {
      const guardedData: TreeNode[] = [
        {
          key: 'parent',
          label: '父节点',
          children: [
            { key: 'selected', label: '已选择' },
            { key: 'other', label: '未选择' },
            { key: 'disabled', label: '禁用', disabled: true },
            { key: 'guarded', label: '受保护', selectable: false, checkable: false },
          ],
        },
      ];
      const wrapper = mount(ExTree, {
        props: {
          data: guardedData,
          multiple: true,
          checkable: true,
          defaultSelectedKeys: ['selected'],
          defaultCheckedKeys: ['selected'],
        },
      });
      const vm = wrapper.vm as unknown as {
        getSelectedNodes: () => TreeNode[];
        getCheckedNodes: () => TreeNode[];
        getHalfCheckedNodes: () => TreeNode[];
        getNode: (key: string) => TreeNode | null;
        requestNodeSelection: (key: string, selected: boolean) => boolean;
        requestNodeCheck: (key: string, checked: boolean) => boolean;
        requestNodeExpansion: (key: string, expanded: boolean) => boolean;
      };

      expect(vm.getSelectedNodes()).toEqual([guardedData[0].children?.[0]]);
      expect(vm.getCheckedNodes()).toEqual([guardedData[0].children?.[0]]);
      expect(vm.getHalfCheckedNodes()).toEqual([guardedData[0]]);
      expect(vm.getNode('selected')).toEqual(guardedData[0].children?.[0]);
      expect(vm.getNode('missing')).toBeNull();
      expect(vm.requestNodeSelection('missing', true)).toBe(false);
      expect(vm.requestNodeSelection('disabled', true)).toBe(false);
      expect(vm.requestNodeSelection('guarded', true)).toBe(false);
      expect(vm.requestNodeCheck('guarded', true)).toBe(false);
      expect(vm.requestNodeExpansion('disabled', true)).toBe(false);
    });

    it('非受控请求方法真实更新选择、勾选和展开状态', async () => {
      const wrapper = mount(ExTree, {
        props: { data, multiple: true, checkable: true },
      });
      const vm = wrapper.vm as unknown as {
        requestNodeSelection: (key: string, selected: boolean) => boolean;
        requestNodeCheck: (key: string, checked: boolean) => boolean;
        requestNodeExpansion: (key: string, expanded: boolean) => boolean;
        requestExpandAll: () => void;
        requestCollapseAll: () => void;
        getElement: () => HTMLDivElement | null;
      };

      expect(vm.requestNodeSelection('1', true)).toBe(true);
      expect(vm.requestNodeCheck('1-1', true)).toBe(true);
      expect(vm.requestNodeExpansion('1', true)).toBe(true);
      await nextTick();
      expect(wrapper.find('[role="treeitem"]').attributes('aria-selected')).toBe('true');
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4);

      vm.requestExpandAll();
      await nextTick();
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(5);
      vm.requestCollapseAll();
      await nextTick();
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
      expect(vm.getElement()).toBe(wrapper.element);
    });

    it('展开全部应该跳过禁用的可展开节点', () => {
      const guardedData: TreeNode[] = [
        {
          key: 'disabled-parent',
          label: '禁用父节点',
          disabled: true,
          children: [{ key: 'disabled-child', label: '子节点' }],
        },
        {
          key: 'enabled-parent',
          label: '正常父节点',
          children: [{ key: 'enabled-child', label: '子节点' }],
        },
      ];
      const wrapper = mount(ExTree, { props: { data: guardedData } });

      (wrapper.vm as unknown as { requestExpandAll: () => void }).requestExpandAll();

      expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['enabled-parent']]);
    });
  });
});
