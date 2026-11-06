import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import type { ExTreeExposed, TreeNode } from '../../../src/components/tree/types';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};
const root = (): TreeNode => ({ key: 'root', label: '远程目录', isLeaf: false });
const leaf = (key = 'child'): TreeNode => ({ key, label: key, isLeaf: true });
const mounted: Array<ReturnType<typeof mount>> = [];
afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()));
const createTree = (props: Record<string, unknown>) => {
  const wrapper = mount(ExTree, { props: { data: [root()], ...props } });
  mounted.push(wrapper);
  return { wrapper, api: wrapper.vm as unknown as ExTreeExposed };
};

describe('ExTree 异步子节点', () => {
  it('受控展开数组原地更新后仍会加载和取消，保持 Vue 响应式契约', async () => {
    const expandedKeys = reactive<string[]>([]);
    const request = deferred<TreeNode[]>();
    const loadData = vi.fn(() => request.promise);
    const { wrapper } = createTree({ loadData, expandedKeys });
    expandedKeys.push('root');
    await nextTick();
    expect(loadData).toHaveBeenCalledOnce();
    expect(wrapper.get('[data-node-key="root"]').attributes('aria-busy')).toBe('true');
    expandedKeys.splice(0);
    await nextTick();
    expect(wrapper.get('[data-node-key="root"]').attributes('aria-busy')).toBeUndefined();
  });

  it('受控展开真正接受后才加载，保持入参不变并缓存成功结果', async () => {
    const data = [root()];
    const request = deferred<TreeNode[]>();
    const loadData = vi.fn(() => request.promise);
    const { wrapper, api } = createTree({ data, loadData, expandedKeys: [] });
    await wrapper.get('.ex-tree-node__expand-icon').trigger('click');
    expect(loadData).not.toHaveBeenCalled();
    await wrapper.setProps({ expandedKeys: ['root'] });
    expect(loadData).toHaveBeenCalledOnce();
    expect(wrapper.get('[data-node-key="root"]').attributes('aria-busy')).toBe('true');
    request.resolve([leaf()]);
    await flushPromises();
    expect(data[0].children).toBeUndefined();
    expect(api.getNode('child')?.label).toBe('child');
    expect(api.getNodeLoadState('root').status).toBe('loaded');
    await wrapper.setProps({ expandedKeys: [] });
    await wrapper.setProps({ expandedKeys: ['root'] });
    expect(loadData).toHaveBeenCalledOnce();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
  });

  it('右方向键加载，空结果成为叶子且不会自动重复请求', async () => {
    const loadData = vi.fn(async () => []);
    const { wrapper, api } = createTree({ loadData });
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    expect(loadData).toHaveBeenCalledOnce();
    expect(wrapper.get('[role="treeitem"]').attributes('aria-expanded')).toBeUndefined();
    expect(api.getNodeLoadState('root').status).toBe('loaded');
    expect(api.getNode('root')?.children).toEqual([]);
  });

  it('默认展开加载，失败可从按钮重试且错误不会被当作空数据缓存', async () => {
    const failure = new Error('离线');
    const loadData = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce([leaf()]);
    const { wrapper, api } = createTree({ loadData, defaultExpandedKeys: ['root'] });
    await flushPromises();
    expect(api.getNodeLoadState('root')).toMatchObject({ status: 'error', error: failure });
    expect(wrapper.emitted('load-error')?.[0]?.[0]).toBe(failure);
    await wrapper.get('.ex-tree-node__retry').trigger('click');
    await flushPromises();
    expect(api.getNodeLoadState('root').status).toBe('loaded');
    expect(wrapper.find('[data-node-key="child"]').exists()).toBe(true);
  });

  it('收起取消请求，不遵守 signal 的迟到结果不能写回', async () => {
    const first = deferred<TreeNode[]>();
    const second = deferred<TreeNode[]>();
    const loadData = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { api, wrapper } = createTree({ loadData });
    api.requestNodeExpansion('root', true);
    await nextTick();
    const signal = loadData.mock.calls[0][1].signal as AbortSignal;
    api.requestNodeExpansion('root', false);
    await nextTick();
    expect(signal.aborted).toBe(true);
    api.requestNodeExpansion('root', true);
    await nextTick();
    second.resolve([leaf('fresh')]);
    await flushPromises();
    first.resolve([leaf('stale')]);
    await flushPromises();
    expect(api.getNode('fresh')).not.toBeNull();
    expect(api.getNode('stale')).toBeNull();
    expect(wrapper.emitted('load')).toHaveLength(1);
  });

  it('重载失败保留旧子树，下一次成功后原子替换', async () => {
    const loadData = vi.fn().mockResolvedValueOnce([leaf('old')]);
    const { api } = createTree({ loadData, defaultExpandedKeys: ['root'] });
    await flushPromises();
    loadData.mockRejectedValueOnce(new Error('离线'));
    expect(await api.reloadNode('root')).toBe(false);
    expect(api.getNode('old')).not.toBeNull();
    loadData.mockResolvedValueOnce([leaf('new')]);
    expect(await api.reloadNode('root')).toBe(true);
    expect(api.getNode('old')).toBeNull();
    expect(api.getNode('new')).not.toBeNull();
  });

  it('加载完成时继承已确认父节点的级联意图，受控模型仍只发更新请求', async () => {
    const loadData = vi.fn(async () => [leaf(), { ...leaf('disabled'), disabled: true }]);
    const { wrapper, api } = createTree({
      loadData,
      checkable: true,
      checkedKeys: ['root'],
      defaultExpandedKeys: ['root'],
    });
    await flushPromises();
    expect(wrapper.emitted('update:checkedKeys')?.at(-1)).toEqual([['root', 'child']]);
    expect(api.getCheckedNodes().map(node => node.key)).toEqual(['root', 'child']);
    expect(wrapper.props('checkedKeys')).toEqual(['root']);
    await wrapper.setProps({ checkedKeys: ['root', 'child'] });
    expect(api.getCheckedNodes().map(node => node.key)).toEqual(['root', 'child']);
  });

  it('中途取消勾选和严格模式都不会让新增子节点被自动勾选', async () => {
    const request = deferred<TreeNode[]>();
    const { api } = createTree({
      loadData: () => request.promise,
      checkable: true,
      defaultCheckedKeys: ['root'],
      defaultExpandedKeys: ['root'],
    });
    api.requestNodeCheck('root', false);
    request.resolve([leaf()]);
    await flushPromises();
    expect(api.getCheckedNodes()).toEqual([]);
    const strict = createTree({
      loadData: async () => [leaf()],
      checkable: true,
      checkStrictly: true,
      defaultCheckedKeys: ['root'],
      defaultExpandedKeys: ['root'],
    });
    await flushPromises();
    expect(strict.api.getCheckedNodes().map(node => node.key)).toEqual(['root']);
  });

  it('虚拟模式加载后更新可见索引，方向键能够进入新子节点', async () => {
    const { wrapper, api } = createTree({
      loadData: async () => [leaf()],
      virtual: true,
      defaultExpandedKeys: ['root'],
    });
    await flushPromises();
    expect(api.getNode('child')).not.toBeNull();
    await wrapper.get('[data-node-key="root"]').trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(wrapper.get('[data-node-key="child"]').attributes('tabindex')).toBe('0');
    expect(wrapper.get('[data-node-key="child"]').attributes('aria-posinset')).toBe('1');
  });
});
