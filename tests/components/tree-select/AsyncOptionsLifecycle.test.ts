import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { useAsyncOptions } from '../../../src/components/tree-select/use-async-options';
import type { TreeSelectNode } from '../../../src/components/tree-select/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));
const deferred = () => {
  let resolve!: (nodes: TreeSelectNode[]) => void;
  const promise = new Promise<TreeSelectNode[]>(done => {
    resolve = done;
  });
  return { promise, resolve };
};
const createHost = (
  initial: TreeSelectNode[],
  initialLoader: (
    node: TreeSelectNode,
    context: { signal: AbortSignal }
  ) => Promise<TreeSelectNode[]>
) => {
  const data = ref(initial);
  const loader = ref(initialLoader);
  const blocked = ref(false);
  const active = ref(true);
  const onLoad = vi.fn();
  const onError = vi.fn();
  let controller!: ReturnType<typeof useAsyncOptions<TreeSelectNode>>;
  const wrapper = mount(
    defineComponent({
      setup() {
        controller = useAsyncOptions({
          data: () => data.value,
          loader: () => loader.value,
          blocked: () => blocked.value,
          active: () => active.value,
          identity: 'value',
          onLoad,
          onError,
        });
        return () => h('div', controller.data.value.map(node => node.label).join(','));
      },
    })
  );
  wrappers.push(wrapper);
  return { data, loader, blocked, active, onLoad, onError, wrapper, controller };
};

describe('异步树请求生命周期与不可信返回结构', () => {
  it('同一节点的重复加载共享请求，手动取消立即结束等待且可显式重试', async () => {
    const first = deferred();
    const second = deferred();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const host = createHost([{ value: 'root', label: '根', isLeaf: false }], load);
    const task = host.controller.load(['root']);
    expect(host.controller.load(['root'])).toBe(task);
    expect(host.controller.cancel(['root'])).toBe(true);
    expect(host.controller.cancel(['root'])).toBe(false);
    await expect(task).resolves.toBe(false);
    await expect(host.controller.load(['root'])).resolves.toBe(false);
    const retry = host.controller.reload(['root']);
    second.resolve([{ value: 'new', label: '新节点' }]);
    await expect(retry).resolves.toBe(true);
    first.resolve([{ value: 'old', label: '旧节点' }]);
    await flushPromises();
    expect(host.controller.data.value[0]?.children?.[0]?.value).toBe('new');
    expect(host.onLoad).toHaveBeenCalledTimes(1);
  });

  it.each(['disabled', 'replace', 'loader', 'unmount'] as const)(
    '%s 会中止在途请求，晚到结果不能进入新一代状态',
    async action => {
      const request = deferred();
      const load = vi.fn(() => request.promise);
      const host = createHost([{ value: 'root', label: '根', isLeaf: false }], load);
      host.controller.syncExpanded([['root']]);
      await flushPromises();
      const promise = host.controller.load(['root']);
      const signal = (load.mock.calls[0] as unknown as [TreeSelectNode, { signal: AbortSignal }])[1]
        .signal;
      if (action === 'disabled') host.blocked.value = true;
      if (action === 'replace') host.data.value = [{ value: 'replacement', label: '替换' }];
      if (action === 'loader') host.loader.value = async () => [];
      if (action === 'unmount') host.wrapper.unmount();
      await flushPromises();
      expect(signal.aborted).toBe(true);
      await expect(promise).resolves.toBe(false);
      request.resolve([{ value: 'stale', label: '旧节点' }]);
      await flushPromises();
      expect(
        host.onLoad.mock.calls.some(call =>
          call[1]?.some((node: TreeSelectNode) => node.value === 'stale')
        )
      ).toBe(false);
    }
  );

  it.each([
    null,
    [{}],
    [{ value: 'root', label: '冲突' }],
    [
      { value: 'a', label: '甲' },
      { value: 'a', label: '重复' },
    ],
    [{ value: Number.NaN, label: '无效键' }],
    [{ value: 'a', label: '甲', disabled: 'yes' }],
    [{ value: 'a', label: '甲', children: {} }],
  ])('拒绝无效异步返回 %j，保留原节点并进入可重试错误态', async value => {
    const host = createHost(
      [{ value: 'root', label: '根', isLeaf: false }],
      vi.fn().mockResolvedValue(value)
    );
    await expect(host.controller.load(['root'])).resolves.toBe(false);
    expect(host.controller.stateFor(['root']).status).toBe('error');
    expect(host.onError).toHaveBeenCalledTimes(1);
    expect(host.controller.data.value[0]?.children).toBeUndefined();
  });

  it('拒绝循环返回，状态查询和事件子树不会暴露可修改的内部结构', async () => {
    const cycle: TreeSelectNode = { value: 'child', label: '子节点' };
    cycle.children = [cycle];
    const host = createHost(
      [{ value: 'root', label: '根', isLeaf: false }],
      vi
        .fn()
        .mockResolvedValueOnce([cycle])
        .mockResolvedValue([{ value: 'valid', label: '有效' }])
    );
    await expect(host.controller.load(['root'])).resolves.toBe(false);
    const snapshot = host.controller.stateFor(['root']);
    snapshot.status = 'loaded';
    expect(host.controller.stateFor(['root']).status).toBe('error');
    await host.controller.reload(['root']);
    host.onLoad.mock.calls[0]![1][0].label = '外部修改';
    expect(host.controller.data.value[0]?.children?.[0]?.label).toBe('有效');
  });

  it('空结果形成叶子后仍可显式重载，重载父节点中止旧后代并清除缓存', async () => {
    const child = deferred();
    const load = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ value: 'child', label: '子', isLeaf: false }])
      .mockReturnValueOnce(child.promise)
      .mockResolvedValueOnce([{ value: 'new', label: '新' }]);
    const host = createHost([{ value: 'root', label: '根', isLeaf: false }], load);
    await host.controller.load(['root']);
    await expect(host.controller.reload(['root'])).resolves.toBe(true);
    const oldChild = host.controller.load(['child']);
    await host.controller.reload(['root']);
    await expect(oldChild).resolves.toBe(false);
    child.resolve([{ value: 'late', label: '晚到' }]);
    await flushPromises();
    expect(host.controller.data.value[0]?.children?.[0]?.value).toBe('new');
    expect(host.controller.stateFor(['child'])).toEqual({ status: 'idle' });
  });
});
