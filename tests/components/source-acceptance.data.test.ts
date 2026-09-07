import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExTable from '../../src/components/table/ExTable.vue';
import ExTree from '../../src/components/tree/ExTree.vue';
import ExVirtualList from '../../src/components/virtual-list/ExVirtualList.vue';
import ExTimeline from '../../src/components/timeline/ExTimeline.vue';
import ExTimelineItem from '../../src/components/timeline/ExTimelineItem.vue';
import ExSider from '../../src/components/layout/ExSider.vue';
import ExModal from '../../src/components/modal/ExModal.vue';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('数据与布局源码验收回归', () => {
  it('Table 拒绝回写时保留选择状态，事件携带请求的行', async () => {
    const row = { key: 'a', name: '甲' };
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'name', title: '名称' }],
        data: [row],
        selectable: true,
        selectedRowKeys: [],
      },
    });
    wrapper.vm.toggleRowSelection(row, true);
    await nextTick();
    expect(wrapper.findAll('tbody .ex-table__row--selected')).toHaveLength(0);
    expect(wrapper.emitted('selection-change')?.[0]).toEqual([['a'], [row]]);
    await wrapper.setProps({ selectedRowKeys: ['a'] });
    expect(wrapper.findAll('tbody .ex-table__row--selected')).toHaveLength(1);
    wrapper.vm.clearSelection();
    await nextTick();
    expect(wrapper.findAll('tbody .ex-table__row--selected')).toHaveLength(1);
  });

  it('Table 业务 key 不会误命中内部未选择状态', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'name', title: '名称' }],
        data: [{ key: '__ex_none__' }],
        selectable: true,
        selectionType: 'radio',
      },
    });
    expect((wrapper.get('input[type="radio"]').element as HTMLInputElement).checked).toBe(false);
  });

  it('Table render 返回 VNode 时按节点渲染', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'name', title: '名称', render: () => h('button', '查看') }],
        data: [{ key: 'a', name: '甲' }],
      },
    });
    expect(wrapper.get('tbody button').text()).toBe('查看');
  });

  it('Tree 虚拟窗口在数据缩短后收敛到有效范围', async () => {
    const data = Array.from({ length: 100 }, (_, index) => ({
      key: String(index),
      label: String(index),
    }));
    const wrapper = mount(ExTree, {
      props: { data, virtual: true, height: 56, itemHeight: 28, virtualBuffer: 0 },
    });
    const viewport = wrapper.get('.ex-tree__viewport');
    viewport.element.scrollTop = 1000;
    await viewport.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await wrapper.setProps({ data: data.slice(0, 3) });
    expect(wrapper.findAll('[role="treeitem"]').length).toBeGreaterThan(0);
    expect(viewport.element.scrollTop).toBeLessThanOrEqual(28);
  });

  it('Tree 虚拟父子导航与集合位置语义不依赖嵌套 DOM', async () => {
    const wrapper = mount(ExTree, {
      attachTo: document.body,
      props: {
        data: [
          {
            key: 'p',
            label: '父',
            children: [
              { key: 'a', label: '甲' },
              { key: 'b', label: '乙' },
            ],
          },
        ],
        virtual: true,
        expandedKeys: ['p'],
        height: 100,
      },
    });
    await wrapper.get('[data-node-key="p"]').trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect((document.activeElement as HTMLElement).dataset.nodeKey).toBe('a');
    const child = wrapper.get('[data-node-key="a"]');
    expect(child.attributes('aria-posinset')).toBe('1');
    expect(child.attributes('aria-setsize')).toBe('2');
    await child.trigger('keydown', { key: 'ArrowLeft' });
    await nextTick();
    expect((document.activeElement as HTMLElement).dataset.nodeKey).toBe('p');
  });

  it('Tree 百分比视口根据真实尺寸重新计算窗口并释放观察器', async () => {
    let resize: ResizeObserverCallback | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      }
    );
    const data = Array.from({ length: 100 }, (_, index) => ({
      key: String(index),
      label: String(index),
    }));
    const wrapper = mount(ExTree, {
      props: { data, virtual: true, height: '50%', itemHeight: 28, virtualBuffer: 0 },
    });
    await nextTick();
    Object.defineProperty(wrapper.get('.ex-tree__viewport').element, 'clientHeight', { value: 84 });
    resize?.([], {} as ResizeObserver);
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
    wrapper.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('Tree 递归节点拖拽只报告实际拖拽节点', async () => {
    const wrapper = mount(ExTree, {
      props: {
        data: [{ key: 'p', label: '父', children: [{ key: 'a', label: '甲' }] }],
        defaultExpandedKeys: ['p'],
        draggable: true,
      },
    });
    await wrapper
      .get('[data-node-key="a"]')
      .trigger('dragstart', { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    expect(wrapper.emitted('node-drag-start')).toHaveLength(1);
    expect(wrapper.emitted('node-drag-start')?.[0]?.[0]).toMatchObject({ key: 'a' });
  });

  it('VirtualList 保留内部输入的空格及组合控件的方向键', async () => {
    const wrapper = mount(ExVirtualList, {
      props: { dataSource: ['甲'], virtual: false, height: 100, itemHeight: 50 },
      slots: { default: () => h('input') },
    });
    await nextTick();
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    wrapper.get('input').element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.emitted('item-click')).toBeUndefined();
    await wrapper.setProps({ wrapperRole: 'presentation' });
    const down = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    wrapper.get('input').element.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(false);
  });

  it.each([false, true])('VirtualList SSR 输出可用初始内容，virtual=%s', async virtual => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            ExVirtualList,
            { dataSource: ['甲', '乙'], virtual, threshold: 1, height: 100, itemHeight: 50 },
            { default: ({ item }: { item: string }) => h('span', item) }
          ),
      })
    );
    expect(html).toContain('甲');
    expect(html).toContain('乙');
  });

  it('Timeline 反转展开的 Fragment，并保持动态顺序', async () => {
    const reversed = ref(true);
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(ExTimeline, { reverse: reversed.value }, () =>
            h(
              Fragment,
              ['甲', '乙', '丙'].map(label => h(ExTimelineItem, { key: label }, () => label))
            )
          )
      )
    );
    expect(wrapper.findAll('.ex-timeline-item').map(item => item.text())).toEqual([
      '丙',
      '乙',
      '甲',
    ]);
    reversed.value = false;
    await nextTick();
    expect(wrapper.findAll('.ex-timeline-item').map(item => item.text())).toEqual([
      '甲',
      '乙',
      '丙',
    ]);
  });

  it('Sider 完全折叠时内容退出焦点和可访问树', () => {
    const wrapper = mount(ExSider, {
      props: { collapsed: true, collapsedWidth: 0 },
      slots: { default: '<a href="/">入口</a>' },
    });
    expect(wrapper.get('.ex-sider__content').attributes()).toHaveProperty('hidden');
    expect(wrapper.get('.ex-sider__content').attributes()).toHaveProperty('inert');
  });

  it('Sider 与 Modal 共用 Escape 和滚动锁所有权', async () => {
    const collapsed = ref(false);
    const modal = ref(false);
    const wrapper = mount(
      defineComponent(
        () => () =>
          h('div', [
            h(
              ExSider,
              {
                breakpoint: 'md',
                collapsed: collapsed.value,
                'onUpdate:collapsed': value => {
                  collapsed.value = value;
                },
              },
              () => h('button', '侧栏操作')
            ),
            h(ExModal, {
              modelValue: modal.value,
              'onUpdate:modelValue': value => {
                modal.value = value;
              },
            }),
          ])
      ),
      { attachTo: document.body }
    );
    collapsed.value = false;
    await nextTick();
    modal.value = true;
    await nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(collapsed.value).toBe(false);
    modal.value = true;
    await nextTick();
    collapsed.value = true;
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');
    wrapper.unmount();
  });
});
