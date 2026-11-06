import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTree from '../../../src/components/tree/ExTree.vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import { logger } from '../../../src/utils/logger';
import type { TreeNode } from '../../../src/components/tree/types';
import type { CascaderOption } from '../../../src/components/cascader/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

function cyclicNode() {
  const leaf = { key: 'leaf', value: 'leaf', label: '合法子项' };
  const root: TreeNode & CascaderOption = { key: 'root', value: 'root', label: '根节点' };
  let reads = 0;
  // 对旧实现设置确定的遍历上限，回归失败时也不让测试进程耗尽内存。
  Object.defineProperty(root, 'children', {
    enumerable: true,
    get: () => {
      if (++reads > 100) throw new Error('循环遍历未终止');
      return [root, leaf];
    },
  });
  return { root, leaf };
}

describe('静态树结构与拖拽来源边界', () => {
  it.each(['tree', 'tree-select', 'cascader'] as const)(
    '%s 跳过循环边、保留合法项并告警，不修改输入',
    async kind => {
      const { root, leaf } = cyclicNode();
      const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
      const wrapper =
        kind === 'tree'
          ? mount(ExTree, { props: { data: [root], defaultExpandAll: true } })
          : kind === 'tree-select'
            ? mount(ExTreeSelect, {
                props: {
                  data: [root],
                  defaultExpandAll: true,
                  filterable: true,
                  teleported: false,
                },
              })
            : mount(ExCascader, {
                props: { options: [root], filterable: true, teleported: false },
              });
      wrappers.push(wrapper);
      if (kind !== 'tree') {
        await wrapper.get('[role="combobox"]').trigger('click');
        await wrapper.get('input').setValue('合法');
      }
      expect(wrapper.text()).toContain('合法子项');
      expect(warning).toHaveBeenCalledWith(expect.stringContaining('循环'));
      expect(root.children).toEqual([root, leaf]);
    }
  );

  it('自定义拖拽格式丢失时，仍拒绝跨树与过期会话并允许当前树拖拽', async () => {
    const a = mount(ExTree, {
      props: { data: [{ key: 'same', label: '外部节点' }], draggable: true },
    });
    const b = mount(ExTree, {
      props: {
        data: [
          { key: 'same', label: '当前节点' },
          { key: 'target', label: '目标' },
        ],
        draggable: true,
      },
    });
    wrappers.push(a, b);
    const payload = new Map<string, string>();
    const transfer = {
      setData: (type: string, value: string) => payload.set(type, value),
      getData: (type: string) => (type === 'text/plain' ? (payload.get(type) ?? '') : ''),
    };
    const target = b.get('[data-node-key="target"]');
    vi.spyOn(target.element, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      height: 40,
    } as DOMRect);
    const drop = async () => {
      await target.trigger('dragover', { dataTransfer: transfer, clientY: 20 });
      await target.trigger('drop', { dataTransfer: transfer });
    };
    await a.get('[data-node-key="same"]').trigger('dragstart', { dataTransfer: transfer });
    await drop();
    expect(b.emitted('node-drop')).toBeUndefined();
    await b.get('[data-node-key="same"]').trigger('dragstart', { dataTransfer: transfer });
    await drop();
    expect(b.emitted('node-drop')?.[0]?.[0]).toMatchObject({ label: '当前节点' });
    await drop();
    expect(b.emitted('node-drop')).toHaveLength(1);
    await b.get('[data-node-key="same"]').trigger('dragstart', { dataTransfer: transfer });
    document.dispatchEvent(new Event('dragstart', { bubbles: true }));
    await drop();
    expect(b.emitted('node-drop')).toHaveLength(1);
  });

  it('外部多选值包含全部可用子节点时父节点全选，取消子节点恢复半选', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        data: [
          {
            value: 'root',
            label: '根',
            children: [
              { value: 'a', label: '甲' },
              { value: 'b', label: '乙' },
              { value: 'disabled', label: '禁用', disabled: true },
            ],
          },
        ],
        modelValue: ['a', 'b'],
        multiple: true,
        defaultExpandAll: true,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    expect(wrapper.findAll('[role="treeitem"]')[0]!.attributes('aria-checked')).toBe('true');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await wrapper.setProps({ modelValue: ['a'] });
    expect(wrapper.findAll('[role="treeitem"]')[0]!.attributes('aria-checked')).toBe('mixed');
  });
});
