import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import type { CascaderOption, ExCascaderExposed } from '../../../src/components/cascader/types';

enableAutoUnmount(afterEach);

const makeOptions = (disabled = false): CascaderOption[] => [
  {
    value: 'root',
    label: '部门',
    disabled,
    children: [
      {
        value: 'team',
        label: '团队',
        children: [
          { value: 'selected', label: '成员甲' },
          { value: 'other', label: '成员乙' },
        ],
      },
    ],
  },
  { value: 'available', label: '可选成员' },
];
const selected = ['root', 'team', 'selected'];

describe('Cascader 禁用祖先与受控路径', () => {
  it('外部已选禁用路径仍显示完整值，所有后代原生禁用且不能清空', async () => {
    const wrapper = mount(ExCascader, {
      props: { options: makeOptions(true), modelValue: selected, teleported: false },
    });
    const input = wrapper.get('input');
    expect(input.element.value).toBe('部门 / 团队 / 成员甲');
    expect(wrapper.find('.ex-cascader__clear').exists()).toBe(false);
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');

    const columns = wrapper.findAll('.ex-cascader__menu');
    for (const column of columns.slice(1)) {
      for (const option of column.findAll('button')) {
        expect(option.attributes('disabled')).toBeDefined();
        expect(option.attributes('aria-disabled')).toBe('true');
        await option.trigger('click');
      }
    }
    for (const key of ['ArrowDown', 'Home', 'End', 'Enter', 'ArrowRight'])
      await input.trigger('keydown', { key });
    expect(input.attributes('aria-activedescendant')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(
      (wrapper.vm as unknown as ExCascaderExposed).getCheckedNodes().map(n => n.value)
    ).toEqual(selected);
  });

  it('已展开路径动态禁用后，点击悬停和键盘都不能继续改变后代', async () => {
    const wrapper = mount(ExCascader, {
      props: {
        options: makeOptions(),
        modelValue: selected,
        trigger: 'hover',
        changeOnSelect: true,
        teleported: false,
      },
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    const staleLeaf = wrapper.findAll('.ex-cascader__menu')[2]!.findAll('button')[1]!;
    await wrapper.setProps({ options: makeOptions(true) });
    await staleLeaf.trigger('mouseenter');
    await staleLeaf.trigger('click');
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.get('input').element.value).toBe('部门 / 团队 / 成员甲');

    await wrapper.setProps({ options: makeOptions() });
    await wrapper.findAll('.ex-cascader__menu')[2]!.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['root', 'team', 'other']]);
    expect(wrapper.get('input').element.value).toBe('部门 / 团队 / 成员甲');
  });

  it('搜索结果沿完整祖先路径禁用，键盘只提交可交互分支', async () => {
    const wrapper = mount(ExCascader, {
      props: { options: makeOptions(true), modelValue: [], filterable: true, teleported: false },
    });
    const input = wrapper.get('input');
    await input.setValue('成员');
    const results = wrapper.findAll('.ex-cascader__search-results button');
    expect(results.map(result => result.attributes('disabled') !== undefined)).toEqual([
      true,
      true,
      false,
    ]);
    await input.trigger('keydown', { key: 'Home' });
    expect(input.attributes('aria-activedescendant')).toBe(results[2]!.attributes('id'));
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['available']]);
    expect(input.element.value).toBe('');
  });

  it('搜索高亮后祖先禁用不会提交旧结果，也不会保留禁用活动后代', async () => {
    const wrapper = mount(ExCascader, {
      props: { options: makeOptions(), filterable: true, teleported: false },
    });
    const input = wrapper.get('input');
    await input.setValue('成员乙');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.setProps({ options: makeOptions(true) });
    await input.trigger('keydown', { key: 'Enter' });
    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(input.attributes('aria-activedescendant')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('父组件拒绝选择或清空时，展示值与公开选中节点始终来自 modelValue', async () => {
    const wrapper = mount(ExCascader, {
      props: { options: makeOptions(), modelValue: selected, teleported: false },
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.findAll('.ex-cascader__menu')[2]!.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['root', 'team', 'other']]);
    expect(wrapper.get('input').element.value).toBe('部门 / 团队 / 成员甲');
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
    expect(wrapper.get('input').element.value).toBe('部门 / 团队 / 成员甲');
    expect(
      (wrapper.vm as unknown as ExCascaderExposed).getCheckedNodes().map(n => n.value)
    ).toEqual(selected);
  });

  it('真实父组件接收选择、转换回写和清空时同步确认路径', async () => {
    const value = ref<Array<string | number>>(selected);
    const wrapper = mount({
      render: () =>
        h(ExCascader, {
          options: makeOptions(),
          modelValue: value.value,
          teleported: false,
          'onUpdate:modelValue': next => {
            value.value = next.length ? ['available'] : next;
          },
        }),
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.findAll('.ex-cascader__menu')[2]!.findAll('button')[1]!.trigger('click');
    await nextTick();
    expect(wrapper.get('input').element.value).toBe('可选成员');
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(wrapper.get('input').element.value).toBe('');
  });

  it('中间层选择被拒绝时保持确认值，原对象祖先禁用后不能继续选择或清空', async () => {
    const options = ref(makeOptions());
    const wrapper = mount({
      render: () =>
        h(ExCascader, {
          options: options.value,
          modelValue: selected,
          changeOnSelect: true,
          teleported: false,
        }),
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.findAll('.ex-cascader__menu')[1]!.get('button').trigger('click');
    const cascader = wrapper.getComponent(ExCascader);
    expect(cascader.emitted('update:modelValue')?.at(-1)).toEqual([['root', 'team']]);
    expect(wrapper.get('input').element.value).toBe('部门 / 团队 / 成员甲');
    options.value[0]!.disabled = true;
    await nextTick();
    const leaf = wrapper.findAll('.ex-cascader__menu')[2]!.get('button');
    expect(leaf.attributes('aria-disabled')).toBe('true');
    await leaf.trigger('click');
    expect(cascader.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.find('.ex-cascader__clear').exists()).toBe(false);
  });
});
