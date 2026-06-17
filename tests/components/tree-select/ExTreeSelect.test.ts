import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import type { TreeSelectNode } from '../../../src/components/tree-select/types';

const data: TreeSelectNode[] = [
  {
    value: '1',
    label: 'P1',
    children: [
      { value: '1-1', label: 'C1' },
      { value: '1-2', label: 'C2' },
    ],
  },
  { value: '2', label: 'P2' },
];

describe('ExTreeSelect', () => {
  let wrapper: ReturnType<typeof mount> | null = null;
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  const mountTS = (props = {}) => {
    wrapper = mount(ExTreeSelect, { props: { data, ...props }, attachTo: document.body });
    return wrapper;
  };

  it('未选择显示占位', () => {
    mountTS({ placeholder: '请选择' });
    expect(wrapper!.find('.ex-tree-select__placeholder').text()).toBe('请选择');
  });

  it('单选：点击节点选中并关闭', async () => {
    mountTS({ defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('1');
    expect(wrapper!.emitted('visible-change')!.at(-1)![0]).toBe(false);
  });

  it('多选级联：勾选父节点连带子节点', async () => {
    mountTS({ multiple: true, modelValue: [], defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1 -> cascade
    await nextTick();
    const value = wrapper!.emitted('update:modelValue')!.at(-1)![0] as string[];
    expect(value).toContain('1');
    expect(value).toContain('1-1');
    expect(value).toContain('1-2');
    expect(value.length).toBe(3);
  });

  it('check-strictly：父子互不关联', async () => {
    mountTS({ multiple: true, checkStrictly: true, modelValue: [], defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1 only
    await nextTick();
    const value = wrapper!.emitted('update:modelValue')!.at(-1)![0] as string[];
    expect(value).toEqual(['1']);
  });

  it('可搜索过滤节点', async () => {
    mountTS({ filterable: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const input = document.querySelector<HTMLInputElement>('.ex-tree-select__search-input')!;
    input.value = 'C1';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    const labels = Array.from(document.querySelectorAll('.ex-tree-select__node-label')).map(
      el => el.textContent
    );
    expect(labels).toContain('C1');
    expect(labels).toContain('P1'); // 祖先路径保留
    expect(labels).not.toContain('C2');
    expect(labels).not.toContain('P2');
  });

  it('清空触发 clear', async () => {
    mountTS({ modelValue: '1', clearable: true });
    await wrapper!.find('.ex-tree-select__clear').trigger('click');
    expect(wrapper!.emitted('clear')).toBeTruthy();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBeNull();
  });
});
