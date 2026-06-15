import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import type { TableColumn, TableDataItem } from '../../../src/components/table/types';

describe('ExTable 虚拟滚动', () => {
  const columns: TableColumn[] = [
    { key: 'name', title: '名称', dataIndex: 'name' },
    { key: 'age', title: '年龄', dataIndex: 'age' },
  ];
  const bigData: TableDataItem[] = Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    name: `用户 ${i}`,
    age: 20 + (i % 50),
  }));

  it('virtual=false 时渲染所有数据行', () => {
    const wrapper = mount(ExTable, { props: { columns, data: bigData } });
    const rows = wrapper.findAll('tbody tr').filter(r => !r.classes('ex-table__spacer-row'));
    expect(rows.length).toBe(1000);
  });

  it('virtual=true 时仅渲染窗口内行并带上下占位行', async () => {
    const wrapper = mount(ExTable, {
      props: { columns, data: bigData, virtual: true, rowHeight: 40, virtualHeight: 400 },
    });
    await nextTick();
    const dataRows = wrapper
      .findAll('tbody tr')
      .filter(r => !r.classes('ex-table__spacer-row') && !r.classes('ex-table__empty-row'));
    // 视口 400 / 行高 40 = 10 行 + 缓冲，应远小于 1000
    expect(dataRows.length).toBeGreaterThan(0);
    expect(dataRows.length).toBeLessThan(60);
    // 底部占位行存在（顶部在 scrollTop=0 时高度为 0，不渲染）
    expect(wrapper.find('.ex-table__spacer-row').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-table--virtual');
  });

  it('虚拟滚动下渲染行的内容索引正确（首行为第 0 条数据）', async () => {
    const wrapper = mount(ExTable, {
      props: { columns, data: bigData, virtual: true, rowHeight: 40, virtualHeight: 400 },
    });
    await nextTick();
    const firstDataRow = wrapper.findAll('tbody tr').find(r => !r.classes('ex-table__spacer-row'));
    expect(firstDataRow?.text()).toContain('用户 0');
  });
});
