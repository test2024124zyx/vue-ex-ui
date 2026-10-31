import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createSSRApp, h, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { CascaderLoadContext, CascaderOption } from '../../../src/components/cascader/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));
const options = [
  { value: 'a', label: '甲', children: [{ value: 'same', label: '甲的叶子' }] },
  { value: 'b', label: '乙', children: [{ value: 'same', label: '乙的叶子' }] },
];

describe('Cascader 多选与异步路径', () => {
  it('独立 selectedPaths 绑定保留完整路径，允许不同分支同值并保持面板打开', async () => {
    const wrapper = mount(ExCascader, { props: { options, multiple: true, teleported: false } });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('.ex-cascader__option').trigger('click');
    await wrapper.findAll('.ex-cascader__menu')[1]!.get('button').trigger('click');
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('true');
    await wrapper.findAll('.ex-cascader__menu')[0]!.findAll('button')[1]!.trigger('click');
    await wrapper.findAll('.ex-cascader__menu')[1]!.get('button').trigger('click');
    expect(wrapper.emitted('update:selectedPaths')?.at(-1)).toEqual([
      [
        ['a', 'same'],
        ['b', 'same'],
      ],
    ]);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.findAll('.ex-cascader__tag')).toHaveLength(2);
    expect(
      wrapper
        .findAll('[role="listbox"]')
        .every(list => list.attributes('aria-multiselectable') === 'true')
    ).toBe(true);
  });

  it('父级拒绝多选更新时标签和查询保持原值，接受和清空时更新真实状态', async () => {
    const value = ref<Array<Array<string | number>>>([['a', 'same']]);
    const accept = ref(false);
    const wrapper = mount({
      render: () =>
        h(ExCascader, {
          options,
          multiple: true,
          selectedPaths: value.value,
          teleported: false,
          'onUpdate:selectedPaths': next => {
            if (accept.value) value.value = next;
          },
        }),
    });
    wrappers.push(wrapper);
    await wrapper.get('.ex-cascader__tag-remove').trigger('click');
    expect(wrapper.findAll('.ex-cascader__tag')).toHaveLength(1);
    accept.value = true;
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(value.value).toEqual([]);
    expect(wrapper.findAll('.ex-cascader__tag')).toHaveLength(0);
  });

  it('多选清空保留禁用祖先路径，搜索只能切换可交互的完整路径', async () => {
    const wrapper = mount(ExCascader, {
      props: {
        options: [{ ...options[0]!, disabled: true }, options[1]!],
        multiple: true,
        selectedPaths: [
          ['a', 'same'],
          ['b', 'same'],
        ],
        filterable: true,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.findAll('.ex-cascader__tag-remove')).toHaveLength(1);
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(wrapper.emitted('update:selectedPaths')?.at(-1)).toEqual([[['a', 'same']]]);
    await wrapper.get('input').setValue('叶子');
    const results = wrapper.findAll('.ex-cascader__search-results [role="option"]');
    expect(results[0]!.attributes('disabled')).toBeDefined();
    await results[1]!.trigger('click');
    expect(wrapper.emitted('update:selectedPaths')?.at(-1)).toEqual([[['a', 'same']]]);
  });

  it('懒加载中间节点不会误当叶子提交，成功后展示新一列并支持键盘进入', async () => {
    const loadData = vi.fn(async () => [{ value: 'leaf', label: '叶子', isLeaf: true }]);
    const wrapper = mount(ExCascader, {
      props: {
        options: [{ value: 'root', label: '父节点', isLeaf: false }],
        loadData,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('input').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    expect(loadData).toHaveBeenCalledTimes(1);
    expect(loadData.mock.calls[0]?.length).toBe(2);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.findAll('.ex-cascader__menu')).toHaveLength(2);
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['root', 'leaf']]);
  });

  it('加载错误提供重试，空数组结果明确转为可选择叶子', async () => {
    const loadData = vi.fn().mockRejectedValueOnce(new Error('失败')).mockResolvedValue([]);
    const wrapper = mount(ExCascader, {
      props: {
        options: [{ value: 'root', label: '父节点', isLeaf: false }],
        loadData,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.get('.ex-cascader__option').trigger('click');
    await flushPromises();
    await wrapper.get('.ex-cascader__retry').trigger('click');
    await flushPromises();
    await wrapper.get('.ex-cascader__option').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['root']]);
  });

  it('单多选切换分别保留绑定值，折叠标签和公开查询返回独立快照', async () => {
    const wrapper = mount(ExCascader, {
      props: {
        options,
        multiple: true,
        selectedPaths: [
          ['a', 'same'],
          ['b', 'same'],
        ],
        modelValue: ['b', 'same'],
        collapseTags: true,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.get('.ex-cascader__tag-label').text()).toBe('甲 / 甲的叶子');
    expect(wrapper.findAll('.ex-cascader__tag')[1]!.text()).toBe('+1');
    const snapshot = wrapper.vm.getCheckedPaths();
    snapshot[0]!.push('mutated');
    expect(wrapper.vm.getCheckedPaths()[0]).toEqual(['a', 'same']);
    expect(wrapper.vm.getCheckedNodes().map(node => node.label)).toEqual(['甲的叶子', '乙的叶子']);
    await wrapper.setProps({ multiple: false });
    expect(wrapper.get('input').element.value).toBe('乙 / 乙的叶子');
    await wrapper.setProps({ multiple: true });
    expect(wrapper.find('.ex-cascader__tag').text()).toContain('甲的叶子');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('update:selectedPaths')).toBeUndefined();
  });

  it('多选依照 changeOnSelect 选择任意级，Form 只读继承阻止交互', async () => {
    const readonly = ref(false);
    const wrapper = mount({
      render: () =>
        h(ExForm, { readonly: readonly.value }, () =>
          h(ExFormItem, {}, () =>
            h(ExCascader, { options, multiple: true, changeOnSelect: true, teleported: false })
          )
        ),
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('.ex-cascader__option').trigger('click');
    const cascader = wrapper.getComponent(ExCascader);
    expect(cascader.emitted('update:selectedPaths')?.at(-1)).toEqual([[['a']]]);
    readonly.value = true;
    await flushPromises();
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('.ex-cascader__tag-remove').exists()).toBe(false);
    await expect(cascader.vm.reloadNode(['a'])).resolves.toBe(false);
  });

  it('多选服务端渲染展示现有路径，不触发懒加载', async () => {
    const loadData = vi.fn(async () => []);
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ExCascader, {
            options,
            multiple: true,
            selectedPaths: [['a', 'same']],
            loadData,
          }),
      })
    );
    expect(html).toContain('甲的叶子');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('同值分支使用完整路径隔离，离开键盘加载分支后中止并忽略晚到子项', async () => {
    let resolveOld!: (nodes: CascaderOption[]) => void;
    const oldRequest = new Promise<CascaderOption[]>(resolve => {
      resolveOld = resolve;
    });
    const loadData = vi.fn((_option: CascaderOption, context: CascaderLoadContext) => {
      if (context.path.length === 1)
        return Promise.resolve([
          { value: 'same', label: `${context.path[0]} 子分支`, isLeaf: false },
        ]);
      return oldRequest;
    });
    const wrapper = mount(ExCascader, {
      props: {
        options: [
          { value: 'a', label: '甲', isLeaf: false },
          { value: 'b', label: '乙', isLeaf: false },
        ],
        loadData,
        teleported: false,
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('input').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    await wrapper.get('input').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    const oldSignal = loadData.mock.calls[1]![1].signal;
    await wrapper
      .findAll('.ex-cascader__menu')[0]!
      .findAll('.ex-cascader__option')[1]!
      .trigger('click');
    await flushPromises();
    expect(oldSignal.aborted).toBe(true);
    expect(loadData.mock.calls[2]![1].path).toEqual(['b']);
    resolveOld([{ value: 'late', label: '过期叶子' }]);
    await flushPromises();
    expect(wrapper.text()).not.toContain('过期叶子');
    expect(wrapper.findAll('.ex-cascader__menu')[1]!.text()).toContain('b 子分支');
  });
});
