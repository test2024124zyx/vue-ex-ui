import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExTree from '../../../src/components/tree/ExTree.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ExTreeExposed, TreeLoadContext, TreeNode } from '../../../src/components/tree/types';

const leaf = (key: string): TreeNode => ({ key, label: key, isLeaf: true });
const root: TreeNode = { key: 'root', label: '资料', isLeaf: false };
const wrappers: Array<ReturnType<typeof mount>> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('ExTree 异步数据交互一致性', () => {
  it('服务端渲染不启动请求，避免请求脱离组件挂载与清理生命周期', async () => {
    const loadData = vi.fn(async () => [leaf('child')]);
    const html = await renderToString(
      createSSRApp({
        render: () => h(ExTree, { data: [root], loadData, defaultExpandedKeys: ['root'] }),
      })
    );
    expect(html).toContain('资料');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('重载祖先会取消旧后代请求并删除旧缓存，同 key 新分支重新加载', async () => {
    let resolveStale!: (nodes: TreeNode[]) => void;
    let calls = 0;
    const loadData = vi.fn((node: TreeNode, _context: TreeLoadContext) => {
      if (node.key === 'root') {
        return Promise.resolve([{ key: 'nested', label: `目录${++calls}`, isLeaf: false }]);
      }
      if (calls === 1) {
        return new Promise<TreeNode[]>(resolve => {
          resolveStale = resolve;
        });
      }
      return Promise.resolve([leaf('current')]);
    });
    const wrapper = mount(ExTree, {
      props: { data: [root], loadData, defaultExpandedKeys: ['root', 'nested'] },
    });
    wrappers.push(wrapper);
    const api = wrapper.vm as unknown as ExTreeExposed;
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(2);
    const staleSignal = loadData.mock.calls[1][1].signal;
    expect(await api.reloadNode('root')).toBe(true);
    await flushPromises();
    expect(staleSignal.aborted).toBe(true);
    expect(api.getNode('current')).not.toBeNull();
    resolveStale([leaf('obsolete')]);
    await flushPromises();
    expect(api.getNode('obsolete')).toBeNull();
    expect(api.getNode('nested')?.label).toBe('目录2');
  });

  it('父节点勾选继承沿用 Tree 的禁用边界，过滤可搜索新加载节点', async () => {
    const wrapper = mount(ExTree, {
      props: {
        data: [root],
        loadData: async () => [
          { key: 'disabled', label: '禁用', disabled: true, children: [leaf('enabled')] },
          { ...leaf('guarded'), checkable: false },
        ],
        checkable: true,
        defaultExpandedKeys: ['root'],
        defaultCheckedKeys: ['root'],
        filterNodeMethod: (value, node) => node.label.includes(value),
      },
    });
    wrappers.push(wrapper);
    const api = wrapper.vm as unknown as ExTreeExposed;
    await flushPromises();
    expect(api.getCheckedNodes().map(node => node.key)).toEqual(['root', 'enabled']);
    api.filter('enabled');
    await nextTick();
    expect(wrapper.find('[data-node-key="enabled"]').exists()).toBe(true);
    expect(wrapper.find('[data-node-key="guarded"]').exists()).toBe(false);
  });

  it('深层异步子树的勾选继承使用迭代遍历，不受调用栈深度限制', async () => {
    const depth = 12000;
    let descendant = leaf('last');
    for (let level = depth - 1; level >= 0; level -= 1) {
      descendant = { key: `level-${level}`, label: `层级${level}`, children: [descendant] };
    }
    const wrapper = mount(ExTree, {
      props: {
        data: [root],
        loadData: async () => [descendant],
        virtual: true,
        checkable: true,
        defaultExpandedKeys: ['root'],
        defaultCheckedKeys: ['root'],
      },
    });
    wrappers.push(wrapper);
    const api = wrapper.vm as unknown as ExTreeExposed;
    await flushPromises();
    expect(api.getCheckedNodes()).toHaveLength(depth + 2);
    expect(wrapper.emitted('load')).toHaveLength(1);
  });

  it('局部语言和关闭动效配置生效，重试成功后恢复被移除按钮的焦点', async () => {
    const loadData = vi.fn().mockRejectedValueOnce(new Error('离线')).mockResolvedValueOnce([]);
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { locale: 'zh-CN', animation: false },
      slots: {
        default: () => h(ExTree, { data: [root], loadData, defaultExpandedKeys: ['root'] }),
      },
    });
    wrappers.push(wrapper);
    await flushPromises();
    expect(wrapper.get('.ex-tree-node__status').text()).toBe('子节点加载失败');
    const retry = wrapper.get<HTMLButtonElement>('.ex-tree-node__retry');
    expect(retry.attributes('aria-label')).toBe('资料: 重试加载');
    expect(wrapper.find('.ex-tree-node--no-animation').exists()).toBe(true);
    retry.element.focus();
    await retry.trigger('click');
    await flushPromises();
    expect(document.activeElement).toBe(wrapper.get('[data-node-key="root"]').element);
    expect(wrapper.find('.ex-tree-node__retry').exists()).toBe(false);
  });

  it('错误节点使用右方向键重试，不会发出选择或勾选事件', async () => {
    const loadData = vi
      .fn()
      .mockRejectedValueOnce(new Error('离线'))
      .mockResolvedValueOnce([leaf('ok')]);
    const wrapper = mount(ExTree, {
      props: { data: [root], loadData, defaultExpandedKeys: ['root'] },
    });
    wrappers.push(wrapper);
    await flushPromises();
    await wrapper.get('[data-node-key="root"]').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    expect(wrapper.find('[data-node-key="ok"]').exists()).toBe(true);
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('check')).toBeUndefined();
  });
});
