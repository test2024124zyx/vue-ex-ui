import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';

enableAutoUnmount(afterEach);

describe('Table 树形数据与详情展开', () => {
  const columns = [{ key: 'name', title: '名称', sortable: true }];
  const data = [
    { key: 'b', name: '乙', children: [{ key: 'b1', name: '乙子' }] },
    { key: 'a', name: '甲', children: [{ key: 'a1', name: '甲子' }] },
  ];

  it('显式开启树后按同级排序，树展开与详情展开互不覆盖', async () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, tree: true },
      slots: { 'expanded-row': ({ record }) => h('div', `详情${record.name}`) },
    });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
    await wrapper.findAll('.ex-table__tree-toggle')[0]!.trigger('click');
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(3);
    await wrapper.findAll('.ex-table__detail-toggle')[0]!.trigger('click');
    expect(wrapper.get('.ex-table__expanded-row').text()).toBe('详情乙');
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(3);
    expect(data[0]!.children).toHaveLength(1);
  });

  it('受控展开等待回写，过滤后保留命中后代的祖先', async () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [
          {
            key: 'name',
            filteredValue: ['甲子'],
            onFilter: (value, row) => (row as { name: string }).name === value,
          },
        ],
        data,
        tree: true,
        expandedRowKeys: [],
      },
    });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(1);
    await wrapper.get('.ex-table__tree-toggle').trigger('click');
    expect(wrapper.emitted('update:expandedRowKeys')?.[0]).toEqual([['a']]);
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(1);
    await wrapper.setProps({ expandedRowKeys: ['a'] });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
  });

  it('未开启树时保持 children 字段原有普通数据语义', () => {
    const wrapper = mount(ExTable, { props: { columns, data } });
    expect(wrapper.find('.ex-table__tree-toggle').exists()).toBe(false);
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
  });
});

describe('Table 分页与合并单元格', () => {
  const columns = [
    { key: 'name', title: '名称' },
    { key: 'value', title: '值' },
  ];
  const data = Array.from({ length: 8 }, (_, key) => ({ key, name: `记录${key}`, value: key }));

  it('本地分页只切根记录，全选保留其他页面的键', async () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, selectable: true, pagination: { pageSize: 2 } },
    });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
    wrapper.vm.toggleAllSelection();
    wrapper.getComponent(ExPagination).vm.$emit('change', 2, 2);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toContain('记录2');
    wrapper.vm.toggleAllSelection();
    expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)).toEqual([[0, 1, 2, 3]]);
  });

  it('远程分页保留传入页面并发出请求，受控页码等待回写', async () => {
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: data.slice(0, 2),
        remotePagination: true,
        pagination: { current: 1, pageSize: 2, total: 100 },
      },
    });
    wrapper.getComponent(ExPagination).vm.$emit('change', 3, 2);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(2);
    expect(wrapper.getComponent(ExPagination).props('current')).toBe(1);
    expect(wrapper.emitted('pagination-change')?.[0]).toEqual([
      { current: 3, pageSize: 2, total: 100 },
    ]);
  });

  it('跨度覆盖格自动省略，非法跨度回退并保留内容', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: data.slice(0, 3),
        spanMethod: ({ rowIndex, columnIndex }) =>
          rowIndex === 0 && columnIndex === 0 ? [2, 1] : rowIndex === 2 ? [Infinity, 2] : undefined,
      },
    });
    expect(wrapper.findAll('.ex-table__row')[0]!.findAll('td')[0]!.attributes('rowspan')).toBe('2');
    expect(wrapper.findAll('.ex-table__row')[1]!.findAll('td')).toHaveLength(1);
    expect(wrapper.findAll('.ex-table__row')[2]!.findAll('td')).toHaveLength(2);
  });

  it('虚拟窗口跨合并区域仍渲染锚点，不关闭虚拟化', async () => {
    const rows = Array.from({ length: 100 }, (_, key) => ({ key, name: `记录${key}` }));
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data: rows,
        virtual: true,
        rowHeight: 40,
        virtualHeight: 80,
        virtualBuffer: 0,
        spanMethod: ({ rowIndex, columnIndex }) =>
          rowIndex === 0 && columnIndex === 0 ? [5, 1] : undefined,
      },
    });
    const container = wrapper.get('.ex-table__container');
    container.element.scrollTop = 120;
    await container.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toContain('记录0');
    expect(wrapper.findAll('.ex-table__row').length).toBeLessThan(20);
    expect(wrapper.classes()).toContain('ex-table--virtual');
  });
});
