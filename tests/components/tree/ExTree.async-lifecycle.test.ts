import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import type { ExTreeExposed, TreeLoadContext, TreeNode } from '../../../src/components/tree/types';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(accept => {
    resolve = accept;
  });
  return { promise, resolve };
};
const branch = (key: string): TreeNode => ({ key, label: key, isLeaf: false });
const leaf = (key: string): TreeNode => ({ key, label: key, isLeaf: true });
const wrappers: Array<ReturnType<typeof mount>> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));
const createTree = (props: Record<string, unknown>) => {
  const wrapper = mount(ExTree, { props: { data: [branch('root')], ...props } });
  wrappers.push(wrapper);
  return { wrapper, api: wrapper.vm as unknown as ExTreeExposed };
};

describe('ExTree 请求生命周期与返回数据边界', () => {
  it('重复展开不会产生重复请求，不同分支可以独立并发', async () => {
    const requests = [deferred<TreeNode[]>(), deferred<TreeNode[]>()];
    const loadData = vi
      .fn()
      .mockReturnValueOnce(requests[0].promise)
      .mockReturnValueOnce(requests[1].promise);
    const { api } = createTree({ data: [branch('root'), branch('other')], loadData });
    api.requestNodeExpansion('root', true);
    api.requestNodeExpansion('other', true);
    await nextTick();
    api.requestNodeExpansion('root', true);
    await nextTick();
    expect(loadData).toHaveBeenCalledTimes(2);
    requests[1].resolve([leaf('second')]);
    requests[0].resolve([leaf('first')]);
    await flushPromises();
    expect(api.getNode('first')).not.toBeNull();
    expect(api.getNode('second')).not.toBeNull();
  });

  it('连续重载取消前代且立即完成被取消的 Promise', async () => {
    const first = deferred<TreeNode[]>();
    const second = deferred<TreeNode[]>();
    const loadData = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { api } = createTree({ loadData });
    const firstResult = api.reloadNode('root');
    const secondResult = api.reloadNode('root');
    expect(await firstResult).toBe(false);
    expect(loadData.mock.calls[0][1].signal.aborted).toBe(true);
    second.resolve([leaf('current')]);
    expect(await secondResult).toBe(true);
    first.resolve([leaf('obsolete')]);
    await flushPromises();
    expect(api.getNode('obsolete')).toBeNull();
  });

  it('显式取消保持展开状态且不会因其他节点完成加载自动重启', async () => {
    const request = deferred<TreeNode[]>();
    const loadData = vi.fn((node: TreeNode) =>
      node.key === 'root' ? request.promise : Promise.resolve([])
    );
    const { api } = createTree({ data: [branch('root'), branch('other')], loadData });
    api.requestNodeExpansion('root', true);
    await nextTick();
    expect(api.cancelNodeLoad('root')).toBe(true);
    expect(api.cancelNodeLoad('root')).toBe(false);
    api.requestNodeExpansion('other', true);
    await flushPromises();
    expect(loadData.mock.calls.filter(([node]) => node.key === 'root')).toHaveLength(1);
    expect(api.getNodeLoadState('root').status).toBe('idle');
    request.resolve([leaf('stale')]);
    await flushPromises();
    expect(api.getNode('stale')).toBeNull();
  });

  it('外部替换同 key 数据取消旧请求并重新加载新数据', async () => {
    const previous = deferred<TreeNode[]>();
    const loadData = vi
      .fn()
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce([leaf('fresh')]);
    const { wrapper, api } = createTree({ loadData, defaultExpandedKeys: ['root'] });
    await wrapper.setProps({ data: [{ ...branch('root'), label: '新目录' }] });
    await flushPromises();
    expect(loadData.mock.calls[0][1].signal.aborted).toBe(true);
    expect(api.getNode('fresh')).not.toBeNull();
    previous.resolve([leaf('stale')]);
    await flushPromises();
    expect(api.getNode('stale')).toBeNull();
  });

  it('替换加载函数与卸载都会取消在途请求', async () => {
    const first = deferred<TreeNode[]>();
    let firstSignal!: AbortSignal;
    const { wrapper, api } = createTree({
      loadData: (_node: TreeNode, { signal }: TreeLoadContext) => {
        firstSignal = signal;
        return first.promise;
      },
      defaultExpandedKeys: ['root'],
    });
    const second = deferred<TreeNode[]>();
    const nextLoader = vi.fn(() => second.promise);
    await wrapper.setProps({ loadData: nextLoader });
    expect(firstSignal.aborted).toBe(true);
    expect(nextLoader).toHaveBeenCalledOnce();
    const result = api.reloadNode('root');
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(await result).toBe(false);
    first.resolve([leaf('one')]);
    second.resolve([leaf('two')]);
    await flushPromises();
    expect(wrapper.emitted('load')).toBeUndefined();
    expect(await api.reloadNode('root')).toBe(false);
  });

  it('禁用整树时取消请求，恢复启用后重新加载；叶子与禁用节点不请求', async () => {
    const old = deferred<TreeNode[]>();
    const loadData = vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValue([leaf('loaded')]);
    const { wrapper, api } = createTree({
      data: [branch('root'), { ...branch('disabled'), disabled: true }, leaf('leaf')],
      loadData,
      defaultExpandedKeys: ['root', 'disabled', 'leaf'],
    });
    expect(loadData).toHaveBeenCalledOnce();
    expect(await api.reloadNode('disabled')).toBe(false);
    expect(await api.reloadNode('leaf')).toBe(false);
    expect(await api.reloadNode('missing')).toBe(false);
    await wrapper.setProps({ disabled: true });
    expect(loadData.mock.calls[0][1].signal.aborted).toBe(true);
    await wrapper.setProps({ disabled: false });
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(2);
    expect(api.getNode('loaded')).not.toBeNull();
  });

  it('收起祖先会取消隐藏后代加载，再展开时可以恢复', async () => {
    const first = deferred<TreeNode[]>();
    const loadData = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce([]);
    const { api } = createTree({
      data: [{ ...branch('root'), children: [branch('nested')] }],
      loadData,
      defaultExpandedKeys: ['root', 'nested'],
    });
    api.requestNodeExpansion('root', false);
    await nextTick();
    expect(loadData.mock.calls[0][1].signal.aborted).toBe(true);
    api.requestNodeExpansion('root', true);
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(2);
  });

  it('已知静态子树不自动加载，全部展开不会递归请求后来发现的分支', async () => {
    const loadData = vi.fn(async (_node: TreeNode) => [branch('discovered')]);
    const { api } = createTree({
      data: [{ ...branch('root'), children: [branch('nested')] }],
      loadData,
      defaultExpandAll: true,
    });
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(loadData.mock.calls[0][0].key).toBe('nested');
    expect(api.getNode('discovered')).not.toBeNull();
  });

  it('加载函数同步抛错后可通过重新展开重试', async () => {
    const loadData = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('离线');
      })
      .mockResolvedValueOnce([]);
    const { api } = createTree({ loadData, defaultExpandedKeys: ['root'] });
    await flushPromises();
    expect(api.getNodeLoadState('root').status).toBe('error');
    api.requestNodeExpansion('root', false);
    await nextTick();
    api.requestNodeExpansion('root', true);
    await flushPromises();
    expect(api.getNodeLoadState('root').status).toBe('loaded');
  });

  it.each([
    { name: '非数组', value: {} },
    { name: '空节点', value: [null] },
    { name: '缺少标签', value: [{ key: 'child' }] },
    { name: '重复 key', value: [leaf('child'), leaf('child')] },
    { name: '祖先 key 冲突', value: [leaf('root')] },
    { name: '其他分支 key 冲突', value: [leaf('sibling')] },
    { name: '非法 children', value: [{ ...leaf('child'), children: {} }] },
    { name: '非法禁用状态', value: [{ ...leaf('child'), disabled: 'false' }] },
  ])('拒绝 $name，保留原始树且发出失败事件', async ({ value }) => {
    const { api, wrapper } = createTree({
      data: [branch('root'), leaf('sibling')],
      loadData: async () => value,
      defaultExpandedKeys: ['root'],
    });
    await flushPromises();
    expect(api.getNodeLoadState('root').status).toBe('error');
    expect(api.getNode('child')).toBeNull();
    expect(api.getNode('sibling')).not.toBeNull();
    expect(wrapper.emitted('load-error')).toHaveLength(1);
  });

  it('循环对象不会卡住加载或污染数据，成功结果与事件数组相互隔离', async () => {
    const cycle = branch('cycle');
    cycle.children = [cycle];
    const loadData = vi.fn().mockResolvedValueOnce([cycle]);
    const { api, wrapper } = createTree({ loadData, defaultExpandedKeys: ['root'] });
    await flushPromises();
    expect(api.getNodeLoadState('root').status).toBe('error');
    const result = [leaf('fresh')];
    loadData.mockResolvedValueOnce(result);
    expect(await api.reloadNode('root')).toBe(true);
    result[0].label = '外部改写';
    const emitted = wrapper.emitted('load')?.[0]?.[1] as TreeNode[];
    emitted[0].label = '事件改写';
    emitted.push(leaf('injected'));
    expect(api.getNode('fresh')?.label).toBe('fresh');
    expect(api.getNode('injected')).toBeNull();
    const state = api.getNodeLoadState('root');
    state.status = 'error';
    expect(api.getNodeLoadState('root').status).toBe('loaded');
  });
});
