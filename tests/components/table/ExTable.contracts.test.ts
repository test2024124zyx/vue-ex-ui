import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTable from '../../../src/components/table/ExTable.vue';
import type {
  ExTableExposed,
  TableColumn,
  TableDataItem,
} from '../../../src/components/table/types';

describe('ExTable 数据计算与扩展契约', () => {
  const data = [
    { key: 'first', name: '第一条', price: 10, count: 2 },
    { key: 'second', name: '第二条', price: 3, count: 3 },
    { key: 'third', name: '第三条', price: 4, count: 5 },
  ];

  it('自定义排序器接收完整记录，支持组合字段、稳定排序和恢复原顺序', async () => {
    const sorter = vi.fn((a: TableDataItem, b: TableDataItem) => {
      return Number(a.price) * Number(a.count) - Number(b.price) * Number(b.count);
    });
    const columns: TableColumn[] = [{ key: 'name', title: '订单', sortable: true, sorter }];
    const wrapper = mount(ExTable, { props: { data, columns } });
    const rows = () => wrapper.findAll('.ex-table__row').map(row => row.text());
    const button = wrapper.get('.ex-table__sort-button');
    await button.trigger('click');
    expect(rows()).toEqual(['第二条', '第一条', '第三条']);
    expect(sorter).toHaveBeenCalled();
    expect(sorter.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ price: expect.any(Number), count: expect.any(Number) })
    );
    await button.trigger('click');
    expect(rows()).toEqual(['第一条', '第三条', '第二条']);
    await button.trigger('click');
    expect(rows()).toEqual(['第一条', '第二条', '第三条']);
    expect(data.map(row => row.key)).toEqual(['first', 'second', 'third']);
    wrapper.unmount();
  });

  it('远程排序只发出请求，保留过滤并跳过本地自定义排序器', async () => {
    const sorter = vi.fn(() => -1);
    const columns: TableColumn[] = [
      {
        key: 'name',
        title: '订单',
        sortable: true,
        sorter,
        filteredValue: [2],
        onFilter: (value, record) => Number((record as TableDataItem).count) > Number(value),
      },
    ];
    const wrapper = mount(ExTable, { props: { data, columns, remoteSort: true } });
    await wrapper.get('.ex-table__sort-button').trigger('click');
    expect(sorter).not.toHaveBeenCalled();
    expect(wrapper.findAll('.ex-table__row').map(row => row.text())).toEqual(['第二条', '第三条']);
    expect(wrapper.emitted('sort-change')?.[0]).toEqual([{ key: 'name', order: 'asc' }]);
    wrapper.unmount();
  });

  it('固定列偏移计算不会在每个单元格重新扫描所有前置列', () => {
    const columnCount = 20;
    const rowCount = 20;
    let widthReads = 0;
    const columns: TableColumn[] = Array.from({ length: columnCount }, (_, index) => ({
      key: `column-${index}`,
      fixed: 'left',
      get width() {
        widthReads += 1;
        return 80;
      },
    }));
    const wrapper = mount(ExTable, {
      props: { columns, data: Array.from({ length: rowCount }, (_, key) => ({ key })) },
    });
    expect(wrapper.findAll('.ex-table__cell--fixed-left').at(-1)?.attributes('style')).toContain(
      'left: 1520px'
    );
    // 每个单元格可以读取自己的宽度；相邻列偏移应按列缓存，不随行数重复求和。
    expect(widthReads).toBeLessThan(columnCount * (rowCount + 1) * 5);
    wrapper.unmount();
  });

  it('混合单位的左右固定偏移在列宽变化后保持正确', async () => {
    const columns: TableColumn[] = [
      { key: 'a', width: '2rem', fixed: 'left' },
      { key: 'b', width: 80, fixed: 'left' },
      { key: 'c', width: 90, fixed: 'right' },
      { key: 'd', minWidth: '3rem', fixed: 'right' },
    ];
    const wrapper = mount(ExTable, { props: { columns, data: [{ key: 1 }] } });
    const cells = () =>
      wrapper.findAll('tbody .ex-table__cell--fixed-left, tbody .ex-table__cell--fixed-right');
    expect(cells()[1]?.attributes('style')).toContain('left: calc(2rem)');
    expect(cells()[2]?.attributes('style')).toContain('right: calc(3rem)');
    await wrapper.setProps({
      columns: columns.map((column, index) => (index === 0 ? { ...column, width: 120 } : column)),
    });
    expect(cells()[1]?.attributes('style')).toContain('left: 120px');
    wrapper.unmount();
  });

  it('大量虚拟行全选保留离页键并正确排除不可选和过滤后的行', async () => {
    const rows = Array.from({ length: 2000 }, (_, key) => ({ key, enabled: key % 2 === 0 }));
    const columns: TableColumn[] = [
      {
        key: 'key',
        filteredValue: [1000],
        onFilter: (value, row) => Number((row as TableDataItem).key) < Number(value),
      },
    ];
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: rows,
        selectable: true,
        virtual: true,
        virtualHeight: 100,
        selectedRowKeys: ['other-page', 1500],
        isRowSelectable: row => Boolean(row.enabled),
      },
    });
    const methods = wrapper.vm as unknown as ExTableExposed;
    methods.toggleAllSelection();
    const selectedKeys = [
      'other-page',
      1500,
      ...rows
        .slice(0, 1000)
        .filter(row => row.enabled)
        .map(row => row.key),
    ];
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(selectedKeys);
    expect(wrapper.emitted('selection-change')?.at(-1)?.[1]).toEqual(
      rows.filter(row => selectedKeys.includes(row.key))
    );
    // 受控表格只有收到父级回写后，下一次全选操作才会请求取消。
    await wrapper.setProps({ selectedRowKeys: selectedKeys });
    methods.toggleAllSelection();
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual(['other-page', 1500]);
    wrapper.unmount();
  });
});
