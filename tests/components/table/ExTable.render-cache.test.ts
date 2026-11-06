import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, markRaw, nextTick, reactive, ref } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import type { TableColumn, TableDataItem } from '../../../src/components/table/types';

describe('ExTable 单元格计算与更新隔离', () => {
  it('省略标题、插槽参数和默认内容共用一次格式化结果', () => {
    const render = vi.fn(value => `金额 ${value}`);
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'amount', ellipsis: true, render }],
        data: [{ key: 1, amount: 20 }],
      },
    });
    expect(wrapper.get('tbody td').attributes('title')).toBe('金额 20');
    expect(wrapper.get('tbody td').text()).toBe('金额 20');
    expect(render).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('响应式记录只重算受影响的单元格，保留嵌套字段与外部响应式依赖', async () => {
    const suffix = ref('元');
    const rows = reactive([
      { key: 1, amount: 10, detail: { count: 2 } },
      { key: 2, amount: 20, detail: { count: 3 } },
    ]);
    const render = vi.fn(
      (value, record) => `${Number(value) * record.detail.count}${suffix.value}`
    );
    const wrapper = mount(ExTable, { props: { columns: [{ key: 'amount', render }], data: rows } });
    render.mockClear();
    rows[0]!.detail.count = 4;
    await nextTick();
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['40元', '60元']);
    expect(render).toHaveBeenCalledTimes(1);
    render.mockClear();
    suffix.value = '分';
    await nextTick();
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['40分', '60分']);
    expect(render).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it('普通记录的原地修改、嵌套修改和非响应式格式化闭包仍在重新传入数据后生效', async () => {
    let suffix = '元';
    const rows = [markRaw({ key: 1, detail: { value: 10 } })];
    const render = vi.fn((_value, row) => `${row.detail.value}${suffix}`);
    const wrapper = mount(ExTable, { props: { columns: [{ key: 'detail', render }], data: rows } });
    render.mockClear();
    rows[0]!.detail.value = 99;
    suffix = '分';
    await wrapper.setProps({ data: [...rows] });
    expect(wrapper.get('tbody td').text()).toBe('99分');
    expect(render).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('排序、替换记录和替换列渲染函数不会复用错误索引或旧内容', async () => {
    const rows = reactive([
      { key: 1, value: 20 },
      { key: 2, value: 10 },
    ]);
    const render = vi.fn((value, _row, index) => `${index}:${value}`);
    const columns: TableColumn[] = [{ key: 'value', sortable: true, render }];
    const wrapper = mount(ExTable, { props: { columns, data: rows } });
    await wrapper.get('.ex-table__sort-button').trigger('click');
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['0:10', '1:20']);
    await wrapper.setProps({ data: reactive([{ key: 1, value: 7 }]) });
    expect(wrapper.get('tbody td').text()).toBe('0:7');
    columns[0]!.render = value => h('strong', {}, `新 ${value}`);
    await wrapper.setProps({ columns: [...columns] });
    expect(wrapper.get('tbody strong').text()).toBe('新 7');
    wrapper.unmount();
  });

  it('自定义插槽仍获得格式化值并响应父级插槽状态', async () => {
    const rows = reactive([{ key: 1, amount: 10 }]);
    const suffix = ref('A');
    const render = vi.fn(value => Number(value) * 2);
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'amount', render }], data: rows },
      slots: {
        'cell-amount': ({ value }: { value: unknown }) => h('b', `${value}${suffix.value}`),
      },
    });
    expect(wrapper.get('b').text()).toBe('20A');
    suffix.value = 'B';
    await nextTick();
    expect(wrapper.get('b').text()).toBe('20B');
    rows[0]!.amount = 30;
    await nextTick();
    expect(wrapper.get('b').text()).toBe('60B');
    wrapper.unmount();
  });

  it('同一对象在不同位置重复出现时，各位置的索引仍正确', () => {
    const record: TableDataItem = { amount: 10 };
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'amount', render: (_value, _row, index) => index }],
        data: [record, record],
      },
    });
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['0', '1']);
    wrapper.unmount();
  });
});
