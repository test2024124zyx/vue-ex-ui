import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import type { TreeSelectNode } from '../../../src/components/tree-select/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('深层树数据索引和半选状态', () => {
  it('一万层树初始化和已选节点显示不依赖调用栈深度', () => {
    let node: TreeSelectNode = { value: 9999, label: '末级节点' };
    for (let value = 9998; value >= 0; value--)
      node = { value, label: `节点${value}`, children: [node] };
    // 通过真实父组件传参，避免测试工具自身递归检查深层 props 干扰组件验证。
    const wrapper = mount({ render: () => h(ExTreeSelect, { modelValue: 9999, data: [node] }) });
    wrappers.push(wrapper);
    expect(wrapper.text()).toContain('末级节点');
  });

  it('后代选择驱动祖先半选，搜索保留祖先且不修改选择', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: {
        multiple: true,
        modelValue: ['leaf'],
        filterable: true,
        data: [
          {
            value: 'parent',
            label: '父级',
            children: [
              { value: 'leaf', label: '叶子' },
              { value: 'other', label: '其他' },
            ],
          },
        ],
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    const parent = document.querySelector('[role="treeitem"]')!;
    expect(parent.getAttribute('aria-checked')).toBe('mixed');
    const input = document.querySelector<HTMLInputElement>('.ex-tree-select__search input')!;
    input.value = '叶子';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    const nodes = [...document.querySelectorAll('[role="treeitem"]')];
    expect(nodes.map(item => item.getAttribute('aria-checked'))).toEqual(['mixed', 'true']);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
