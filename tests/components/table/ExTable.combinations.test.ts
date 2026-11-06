import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';
import type {
  TableColumn,
  TableDataItem,
  TableSpanMethod,
} from '../../../src/components/table/types';

enableAutoUnmount(afterEach);
afterEach(() => vi.unstubAllGlobals());

describe('Table 树形、分页与选择的组合契约', () => {
  const columns: TableColumn[] = [{ key: 'name', title: '名称', sortable: true }];

  it('同级排序不拆散父子，根分页包含展开后代并按原始索引选择', async () => {
    const data = [
      {
        key: 2,
        name: 'B',
        children: [
          { key: 3, name: 'Z' },
          { key: 4, name: 'A' },
        ],
      },
      { key: 1, name: 'A' },
    ];
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        tree: true,
        defaultExpandAllRows: true,
        selectable: true,
        pagination: { pageSize: 1 },
      },
    });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(3);
    await wrapper.get('.ex-table__sort-button').trigger('click');
    expect(wrapper.findAll('.ex-table__row').map(row => row.text())).toEqual(['A']);
    wrapper.getComponent(ExPagination).vm.$emit('change', 2, 1);
    await nextTick();
    expect(wrapper.findAll('.ex-table__row').map(row => row.text())).toEqual(['B', 'A', 'Z']);
    wrapper.vm.toggleRowSelection(data[0]!.children![0]!, true);
    await nextTick();
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)).toEqual([[3]]);
    expect(wrapper.findAll('.ex-table__row--selected')[0]!.text()).toBe('Z');
  });

  it('循环树与非记录子项不产生无限遍历，外部展开方法兼容原始记录', async () => {
    const parent: TableDataItem = { key: 'p', name: '父' };
    parent.nodes = [parent, null, 1, { key: 'c', name: '子' }];
    const wrapper = mount(ExTable, {
      props: { columns, data: [parent], tree: true, childrenKey: 'nodes', treeIndent: -1 },
    });
    wrapper.vm.toggleRowExpansion(parent, true);
    await nextTick();
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
    expect(
      wrapper.findAll('.ex-table__row')[1]!.get('.ex-table__cell').attributes('style')
    ).toContain('20px');
    wrapper.vm.toggleRowExpansion(parent, false);
    await nextTick();
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(1);
  });

  it('受控详情、受控到非受控切换和不可展开记录均保持明确状态', async () => {
    const first = { key: 1, name: '一' };
    const second = { key: 2, name: '二' };
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: [first, second],
        detailExpandedRowKeys: [],
        rowExpandable: row => row.key === 1,
      },
      slots: { 'expanded-row': ({ record }) => h('div', String(record.name)) },
    });
    wrapper.vm.toggleDetailExpansion(second, true);
    expect(wrapper.emitted('detail-expand-change')).toBeUndefined();
    wrapper.vm.toggleDetailExpansion(first, true);
    await nextTick();
    expect(wrapper.find('.ex-table__expanded-row').exists()).toBe(false);
    await wrapper.setProps({ detailExpandedRowKeys: [1] });
    expect(wrapper.get('.ex-table__expanded-row').text()).toBe('一');
    await wrapper.setProps({ detailExpandedRowKeys: undefined });
    expect(wrapper.get('.ex-table__expanded-row').text()).toBe('一');
    wrapper.vm.toggleDetailExpansion(first, false);
    await nextTick();
    expect(wrapper.find('.ex-table__expanded-row').exists()).toBe(false);
  });

  it('loading 阻止树、详情和分页请求，非法分页容量回退到有效值', async () => {
    const data = [{ key: 1, name: '父', children: [{ key: 2, name: '子' }] }];
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        tree: true,
        loading: true,
        pagination: { pageSize: Number.NaN, current: -2 },
      },
      slots: { 'expanded-row': () => '详情' },
    });
    wrapper.vm.toggleRowExpansion(data[0]!, true);
    wrapper.vm.toggleDetailExpansion(data[0]!, true);
    wrapper.getComponent(ExPagination).vm.$emit('change', 2, 5);
    await nextTick();
    expect(wrapper.emitted('expand-change')).toBeUndefined();
    expect(wrapper.emitted('detail-expand-change')).toBeUndefined();
    expect(wrapper.emitted('pagination-change')).toBeUndefined();
    expect(wrapper.getComponent(ExPagination).props('pageSize')).toBe(10);
    expect(wrapper.getComponent(ExPagination).props('current')).toBe(1);
  });

  it('过滤缩短当前页后回到有效根页，页容量变化不修改父级记录', async () => {
    const data = Array.from({ length: 6 }, (_, key) => ({ key, name: `记录${key}` }));
    const wrapper = mount(ExTable, { props: { columns, data, pagination: {} } });
    wrapper.getComponent(ExPagination).vm.$emit('change', 3, 2);
    await nextTick();
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toBe('记录4');
    await wrapper.setProps({
      columns: [
        {
          ...columns[0]!,
          onFilter: (_, row) => (row as TableDataItem).key === 0,
          filteredValue: [true],
        },
      ],
    });
    expect(wrapper.getComponent(ExPagination).props('current')).toBe(1);
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toBe('记录0');
    expect(data).toHaveLength(6);
  });
});

describe('Table 合并区域验证', () => {
  const data = Array.from({ length: 4 }, (_, key) => ({
    key,
    a: `A${key}`,
    b: `B${key}`,
    c: `C${key}`,
  }));
  const columns: TableColumn[] = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];

  it('卡片模式保留每条记录的完整字段，切回表格后应用合并', async () => {
    const spanMethod = vi.fn<TableSpanMethod>(({ rowIndex, columnIndex }) =>
      rowIndex === 0 && columnIndex === 0 ? [2, 1] : undefined
    );
    const wrapper = mount(ExTable, {
      props: { columns, data, layout: 'card', virtual: true, virtualHeight: 500, spanMethod },
    });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(12);
    expect(wrapper.classes()).toContain('ex-table--virtual');
    expect(spanMethod).not.toHaveBeenCalled();
    await wrapper.setProps({ layout: 'table' });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(11);
    expect(spanMethod).toHaveBeenCalled();
  });

  it.each([
    ['invalid-span', (() => [-1, 2]) as TableSpanMethod],
    ['out-of-bounds', (() => [10, 1]) as TableSpanMethod],
    [
      'callback-error',
      (() => {
        throw new Error('业务计算失败');
      }) as TableSpanMethod,
    ],
  ])('报告 %s 并保留每条业务内容', (reason, spanMethod) => {
    const wrapper = mount(ExTable, { props: { columns, data, spanMethod } });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(12);
    expect(wrapper.emitted('span-error')?.[0]?.[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason })])
    );
  });

  it('横向跨度自动省略覆盖列，固定区域边界被拒绝', async () => {
    const spanMethod: TableSpanMethod = ({ columnIndex }) =>
      columnIndex === 0 ? { rowspan: 1, colspan: 2 } : undefined;
    const wrapper = mount(ExTable, { props: { columns, data, spanMethod } });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(8);
    expect(wrapper.findAll('.ex-table__body-cell')[0]!.attributes('colspan')).toBe('2');
    await wrapper.setProps({ columns: [{ key: 'a', fixed: 'left' }, { key: 'b' }, { key: 'c' }] });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(12);
    expect(wrapper.emitted('span-error')?.at(-1)?.[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: 'fixed-boundary' })])
    );
  });

  it('拒绝覆盖已有跨度以及跨越展开详情的合并', async () => {
    const spanMethod: TableSpanMethod = ({ rowIndex, columnIndex }) =>
      rowIndex === 0 && columnIndex === 1
        ? [2, 1]
        : rowIndex === 1 && columnIndex === 0
          ? [1, 2]
          : undefined;
    const wrapper = mount(ExTable, {
      props: { columns, data, spanMethod },
      slots: { 'expanded-row': () => '详情' },
    });
    expect(wrapper.emitted('span-error')?.[0]?.[0]).toEqual([
      expect.objectContaining({ reason: 'overlap' }),
    ]);
    wrapper.vm.toggleDetailExpansion(data[0]!, true);
    await nextTick();
    expect(wrapper.emitted('span-error')?.at(-1)?.[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: 'detail-boundary' })])
    );
    expect(wrapper.find('.ex-table__expanded-row').exists()).toBe(true);
  });

  it('跨多个相邻跨度的虚拟窗口扩展至完整边界并保留绝对位置语义', async () => {
    const rows = Array.from({ length: 50 }, (_, key) => ({ key, a: `A${key}`, b: `B${key}` }));
    const spanMethod: TableSpanMethod = ({ rowIndex, columnIndex }) =>
      rowIndex === 0 && columnIndex === 0
        ? [5, 1]
        : rowIndex === 4 && columnIndex === 1
          ? [5, 1]
          : undefined;
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: rows,
        virtual: true,
        rowHeight: 40,
        virtualHeight: 80,
        virtualBuffer: 0,
        spanMethod,
      },
    });
    const container = wrapper.get('.ex-table__container');
    container.element.scrollTop = 160;
    await container.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(9);
    expect(wrapper.findAll('.ex-table__row')[0]!.attributes('aria-rowindex')).toBe('2');
    expect(wrapper.get('table').attributes('aria-rowcount')).toBe('51');
  });
});

describe('Table 编辑和列交互集成', () => {
  const columns: TableColumn[] = [
    { key: 'name', title: '姓名', editable: true, width: 100 },
    { key: 'age', title: '年龄', editor: 'number', editable: true, width: 100 },
  ];

  it('合并区域内任意行进入编辑时恢复全部字段，退出后恢复合并', async () => {
    const data = [
      { key: 1, name: '甲', age: 20 },
      { key: 2, name: '甲', age: 21 },
    ];
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        editable: true,
        spanMethod: ({ rowIndex, columnIndex }) =>
          rowIndex === 0 && columnIndex === 0 ? [2, 1] : undefined,
      },
    });
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(3);
    wrapper.vm.startRowEdit(data[1]!);
    await nextTick();
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(4);
    expect(wrapper.findAll('tbody input')).toHaveLength(2);
    expect(wrapper.emitted('span-error')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ reason: 'editing-boundary' }),
    ]);
    wrapper.vm.cancelRowEdit(data[1]!);
    await nextTick();
    expect(wrapper.findAll('.ex-table__body-cell')).toHaveLength(3);
  });

  it('行级编辑在主表中保存并请求父级回写，取消不改变记录', async () => {
    const data = [{ key: 1, name: '原名', age: 20 }];
    const wrapper = mount(ExTable, { props: { columns, data, editable: true } });
    await wrapper.get('.ex-table-row-actions button').trigger('click');
    await wrapper.get('tbody input[type="text"]').setValue('新名');
    await wrapper.get('tbody input[type="number"]').setValue('21');
    const buttons = wrapper.findAll('.ex-table-row-actions button');
    await buttons[0]!.trigger('click');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.emitted('update:data')?.at(-1)?.[0]).toEqual([
      { key: 1, name: '新名', age: 21 },
    ]);
    expect(data[0]!.name).toBe('原名');
    await wrapper.setProps({ data: [{ key: 1, name: '新名', age: 21 }] });
    await wrapper.get('.ex-table-row-actions button').trigger('click');
    await wrapper.get('tbody input[type="text"]').setValue('不保存');
    await wrapper.findAll('.ex-table-row-actions button')[1]!.trigger('click');
    expect(wrapper.find('tbody input').exists()).toBe(false);
    expect(wrapper.findAll('.ex-table__body-cell')[0]!.text()).toBe('新名');
  });

  it('自定义编辑槽收到草稿和更新方法，校验失败保留草稿并展示错误', async () => {
    const data = [{ key: 1, name: '原名', age: 20 }];
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        editable: true,
        validateEdit: () => ({ age: '年龄不允许', $row: '请检查资料' }),
      },
      slots: {
        'edit-name': ({ value, update, draft }) =>
          h(
            'button',
            { class: 'custom-edit', onClick: () => update(`${draft.age}岁`) },
            String(value)
          ),
      },
    });
    await wrapper.get('.ex-table-row-actions button').trigger('click');
    await wrapper.get('.custom-edit').trigger('click');
    await wrapper.findAll('.ex-table-row-actions button')[0]!.trigger('click');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.get('.custom-edit').text()).toBe('20岁');
    expect(wrapper.text()).toContain('年龄不允许');
    expect(wrapper.text()).toContain('请检查资料');
    expect(wrapper.emitted('update:data')).toBeUndefined();
    await wrapper.get('tbody input').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.custom-edit').exists()).toBe(false);
  });

  it('键盘调整列宽更新相邻固定列偏移，列移动同时更新表头与数据', async () => {
    const fixedColumns: TableColumn[] = columns.map(column => ({
      ...column,
      fixed: 'left',
      resizable: true,
      reorderable: true,
    }));
    const wrapper = mount(ExTable, {
      props: { columns: fixedColumns, data: [{ key: 1, name: '甲', age: 20 }] },
    });
    await wrapper.findAll('[role="separator"]')[0]!.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.findAll('tbody .ex-table__body-cell')[1]!.attributes('style')).toContain(
      'left: 110px'
    );
    await wrapper
      .findAll('.ex-table-column-controls__drag')[0]!
      .trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.findAll('tbody .ex-table__body-cell').map(cell => cell.text())).toEqual([
      '20',
      '甲',
    ]);
    expect(wrapper.emitted('column-order-change')?.at(-1)).toEqual([['age', 'name']]);
  });
});
