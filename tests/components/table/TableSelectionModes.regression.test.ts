import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTable from '../../../src/components/table/ExTable.vue';

describe('表格公开选择方法的模式约束', () => {
  it('同一轮解除控制并切换多选时继承上一轮单选的真实值', async () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'key' }],
        data: [{ key: 'a' }, { key: 'b' }],
        selectable: true,
        selectionType: 'radio',
        selectedRowKeys: ['a', 'b'],
      },
    });
    await wrapper.setProps({ selectionType: 'checkbox', selectedRowKeys: undefined });
    expect(
      wrapper
        .findAll<HTMLInputElement>('tbody input[type="checkbox"]')
        .map(input => input.element.checked)
    ).toEqual([true, false]);
    wrapper.unmount();
  });

  it('受控多选切为单选再解除控制时，不继承当前模式已舍弃的键', async () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'key' }],
        data: [{ key: 'a' }, { key: 'b' }],
        selectable: true,
        selectedRowKeys: ['a', 'b'],
      },
    });
    await wrapper.setProps({ selectionType: 'radio' });
    await wrapper.setProps({ selectedRowKeys: undefined });
    await wrapper.setProps({ selectionType: 'checkbox' });
    expect(
      wrapper
        .findAll<HTMLInputElement>('tbody input[type="checkbox"]')
        .map(input => input.element.checked)
    ).toEqual([true, false]);
    wrapper.unmount();
  });

  it('单选模式的全选方法不改变选择、不发出虚假的批量选择事件', async () => {
    const data = [{ key: 'a' }, { key: 'b' }];
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'key' }], data, selectable: true, selectionType: 'radio' },
    });
    wrapper.vm.toggleRowSelection(data[0]!);
    await wrapper.vm.$nextTick();
    const updates = wrapper.emitted('update:selectedRowKeys')?.length;
    wrapper.vm.toggleAllSelection();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:selectedRowKeys')).toHaveLength(updates!);
    expect(wrapper.emitted('select-all')).toBeUndefined();
    expect(
      wrapper.findAll<HTMLInputElement>('input[type="radio"]').map(input => input.element.checked)
    ).toEqual([true, false]);
    wrapper.unmount();
  });

  it('运行时从多选切换到单选后全选入口仍受当前模式约束', async () => {
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'key' }], data: [{ key: 'a' }, { key: 'b' }], selectable: true },
    });
    await wrapper.setProps({ selectionType: 'radio' });
    wrapper.vm.toggleAllSelection();
    expect(wrapper.emitted('update:selectedRowKeys')).toBeUndefined();
    await wrapper.setProps({ selectionType: 'checkbox' });
    wrapper.vm.toggleAllSelection();
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)).toEqual([['a', 'b']]);
    wrapper.unmount();
  });

  it('已有多选切换为单选时只保留首项，切回多选不恢复被丢弃的内部选择', async () => {
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'key' }], data: [{ key: 'a' }, { key: 'b' }], selectable: true },
    });
    wrapper.vm.toggleAllSelection();
    await wrapper.setProps({ selectionType: 'radio' });
    expect(
      wrapper.findAll<HTMLInputElement>('input[type="radio"]').map(input => input.element.checked)
    ).toEqual([true, false]);
    await wrapper.setProps({ selectionType: 'checkbox' });
    expect(
      wrapper
        .findAll<HTMLInputElement>('tbody input[type="checkbox"]')
        .map(input => input.element.checked)
    ).toEqual([true, false]);
    wrapper.unmount();
  });
});
