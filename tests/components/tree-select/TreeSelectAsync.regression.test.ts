import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import type { TreeSelectNode } from '../../../src/components/tree-select/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((success, failure) => {
    resolve = success;
    reject = failure;
  });
  return { promise, resolve, reject };
};

describe('TreeSelect 异步分支', () => {
  it('万层静态树启用异步能力仍可初始化，SSR 不发起请求', async () => {
    let root: TreeSelectNode = { value: 'leaf', label: '最深节点' };
    for (let depth = 9999; depth >= 0; depth--)
      root = { value: depth, label: `层级 ${depth}`, children: [root] };
    const loadData = vi.fn(async () => []);
    const html = await renderToString(
      createSSRApp({
        render: () => h(ExTreeSelect, { data: [root], modelValue: 'leaf', loadData }),
      })
    );
    expect(html).toContain('最深节点');
    expect(loadData).not.toHaveBeenCalled();
  });
  it('展开未加载节点后显示忙碌状态，成功后可选子项且不修改输入数据', async () => {
    const request = deferred<Array<{ value: string; label: string }>>();
    const data = [{ value: 'root', label: '父节点', isLeaf: false }];
    const loadData = vi.fn(() => request.promise);
    const wrapper = mount(ExTreeSelect, { props: { data, loadData, teleported: false } });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('.ex-tree-select__expand').trigger('click');
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(wrapper.get('[role="treeitem"]').attributes('aria-busy')).toBe('true');
    request.resolve([{ value: 'child', label: '子节点' }]);
    await flushPromises();
    expect(data[0]).not.toHaveProperty('children');
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    await wrapper.findAll('[role="treeitem"]')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['child']);
    expect(wrapper.emitted('load')).toHaveLength(1);
  });

  it('失败后由明确重试入口重新加载，空结果收敛为叶子', async () => {
    const loadData = vi.fn().mockRejectedValueOnce(new Error('网络失败')).mockResolvedValue([]);
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: [{ value: 'root', label: '父节点', isLeaf: false }],
        loadData,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('.ex-tree-select__expand').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('load-error')).toHaveLength(1);
    await wrapper.get('.ex-tree-select__retry').trigger('click');
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(2);
    expect(wrapper.get('[role="treeitem"]').attributes('aria-expanded')).toBeUndefined();
  });

  it('关闭面板中止请求，忽略不响应取消的晚到结果', async () => {
    const request = deferred<Array<{ value: string; label: string }>>();
    const loadData = vi.fn((_node, _context) => request.promise);
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: [{ value: 'root', label: '父节点', isLeaf: false }],
        loadData,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('.ex-tree-select__expand').trigger('click');
    const signal = loadData.mock.calls[0]![1].signal as AbortSignal;
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(signal.aborted).toBe(true);
    request.resolve([{ value: 'stale', label: '旧结果' }]);
    await flushPromises();
    expect(wrapper.emitted('load')).toBeUndefined();
  });

  it('虚拟树只渲染窗口内节点，End 导航先滚动再聚焦最后节点', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: Array.from({ length: 500 }, (_, value) => ({ value, label: `节点 ${value}` })),
        virtual: true,
        height: 220,
        itemHeight: 44,
        teleported: false,
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(30);
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'End' });
    await flushPromises();
    const last = wrapper
      .findAll('[role="treeitem"]')
      .find(node => node.text().includes('节点 499'));
    expect(last?.element).toBe(document.activeElement);
    expect(last?.attributes('aria-posinset')).toBe('500');
    expect(last?.attributes('aria-setsize')).toBe('500');
  });

  it('等待子节点时重复向右不会跳到兄弟，已选父节点的后加载子项继承勾选', async () => {
    const request = deferred<Array<{ value: string; label: string }>>();
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: [
          { value: 'root', label: '父节点', isLeaf: false },
          { value: 'other', label: '兄弟' },
        ],
        loadData: () => request.promise,
        multiple: true,
        modelValue: ['root'],
        teleported: false,
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    const root = wrapper.get('[role="treeitem"]');
    await root.trigger('keydown', { key: 'ArrowRight' });
    await root.trigger('keydown', { key: 'ArrowRight' });
    expect(root.element).toBe(document.activeElement);
    request.resolve([{ value: 'child', label: '子节点' }]);
    await flushPromises();
    const child = wrapper.findAll('[role="treeitem"]')[1]!;
    expect(child.attributes('aria-checked')).toBe('true');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await child.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
    expect(child.attributes('aria-checked')).toBe('true');
  });
});
