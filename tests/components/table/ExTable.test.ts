import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import type { ExTableProps, TableColumn, TableDataItem } from '../../../src/components/table/types';

describe('ExTable', () => {
  const columns: TableColumn[] = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'age', title: 'Age', dataIndex: 'age', sortable: true, align: 'center' },
    { key: 'score', title: 'Score', dataIndex: 'score', sortable: true, align: 'right' },
  ];

  const data: TableDataItem[] = [
    { key: 1, name: 'Player1', age: 25, score: 100 },
    { key: 2, name: 'Player2', age: 30, score: 95 },
    { key: 3, name: 'Player3', age: 28, score: 98 },
  ];

  it('renders correctly with default props', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    expect(wrapper.find('.ex-table').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-table--medium');
    expect(wrapper.find('.ex-table__header').exists()).toBe(true);
    expect(wrapper.find('.ex-table__body').exists()).toBe(true);
  });

  it('renders table headers correctly', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    const headers = wrapper.findAll('.ex-table__header-cell');
    expect(headers.length).toBe(columns.length);
    expect(headers[0].text()).toContain('Name');
    expect(headers[1].text()).toContain('Age');
    expect(headers[2].text()).toContain('Score');
  });

  it('renders table data correctly', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    const rows = wrapper.findAll('.ex-table__row');
    expect(rows.length).toBe(data.length);
    expect(rows[0].text()).toContain('Player1');
    expect(rows[1].text()).toContain('Player2');
    expect(rows[2].text()).toContain('Player3');
  });

  it('renders different table sizes', () => {
    const sizes: ExTableProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExTable, {
        props: { columns, data, size },
      });
      expect(wrapper.classes()).toContain(`ex-table--${size}`);
    });
  });

  it('handles bordered state', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, bordered: true },
    });

    expect(wrapper.classes()).toContain('ex-table--bordered');
  });

  it('handles striped state', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, striped: true },
    });

    expect(wrapper.classes()).toContain('ex-table--striped');
  });

  it('handles hoverable state', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, hoverable: true },
    });

    expect(wrapper.classes()).toContain('ex-table--hoverable');
  });

  it('handles loading state', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, loading: true },
    });

    expect(wrapper.classes()).toContain('ex-table--loading');
    expect(wrapper.find('.ex-table__loading').exists()).toBe(true);
    expect(wrapper.find('.ex-table__loading-spinner').exists()).toBe(true);
  });

  it('renders empty state when no data', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data: [] },
    });

    expect(wrapper.find('.ex-table__empty').exists()).toBe(true);
  });

  it('renders custom empty text', () => {
    const emptyText = 'No players found';
    const wrapper = mount(ExTable, {
      props: { columns, data: [], emptyText },
    });

    expect(wrapper.find('.ex-table__empty').text()).toContain(emptyText);
  });

  it('handles sortable columns', async () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    const sortableHeaders = wrapper.findAll('.ex-table__header-cell--sortable');
    expect(sortableHeaders.length).toBeGreaterThan(0);

    // Click to sort
    await sortableHeaders[0].trigger('click');
    expect(wrapper.emitted('sort-change')).toBeTruthy();
  });

  it('handles row click events', async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(ExTable, {
      props: { columns, data, onRowClick },
    });

    const rows = wrapper.findAll('.ex-table__row');
    await rows[0].trigger('click');
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit row click when loading', async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(ExTable, {
      props: { columns, data, loading: true, onRowClick },
    });

    const rows = wrapper.findAll('.ex-table__row');
    await rows[0].trigger('click');
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('renders with custom cell alignment', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    const cells = wrapper.findAll('.ex-table__body-cell');
    expect(cells[1].classes()).toContain('ex-table__cell--center');
    expect(cells[2].classes()).toContain('ex-table__cell--right');
  });

  it('hides header when showHeader is false', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, showHeader: false },
    });

    expect(wrapper.find('.ex-table__header').exists()).toBe(false);
  });

  it('renders with max height', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, maxHeight: 300 },
    });

    const container = wrapper.find('.ex-table__container');
    expect(container.attributes('style')).toContain('max-height: 300px');
  });

  it('exposes getElement and clearSort methods', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data },
    });

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
    expect(typeof vm.clearSort).toBe('function');
  });

  it('renders with custom class', () => {
    const wrapper = mount(ExTable, {
      props: { columns, data, class: 'custom-table' },
    });

    expect(wrapper.classes()).toContain('custom-table');
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const wrapper = mount(ExTable, {
      props: { columns, data, style: customStyle },
    });

    expect(wrapper.attributes('style')).toContain('background-color: red');
  });

  describe('row selection', () => {
    const findRowCheckboxes = (wrapper: ReturnType<typeof mount>) =>
      // 第一个是表头全选框，其余为行复选框
      wrapper.findAllComponents(ExCheckbox).slice(1);

    // 通过 classList 统计选中行（jsdom 在复用 DOM 节点移除类后，CSS 选择器
    // `.ex-table__row--selected` 仍可能误匹配，classes() 读取 classList 才准确）
    const countSelected = (wrapper: ReturnType<typeof mount>) =>
      wrapper.findAll('.ex-table__row').filter(r => r.classes().includes('ex-table__row--selected'))
        .length;

    it('does not render a selection column by default', () => {
      const wrapper = mount(ExTable, { props: { columns, data } });
      expect(wrapper.find('.ex-table__selection-column').exists()).toBe(false);
    });

    it('renders a selection column when selectable', () => {
      const wrapper = mount(ExTable, { props: { columns, data, selectable: true } });
      // 1 个表头 + 每行各 1 个
      expect(wrapper.findAll('.ex-table__selection-column').length).toBe(data.length + 1);
      // 不应增加 header-cell 计数（选择列用独立类名）
      expect(wrapper.findAll('.ex-table__header-cell').length).toBe(columns.length);
    });

    it('selects a row via its checkbox and emits events', async () => {
      const wrapper = mount(ExTable, { props: { columns, data, selectable: true } });
      findRowCheckboxes(wrapper)[0].vm.$emit('update:modelValue', true);
      await nextTick();

      expect(wrapper.emitted('update:selectedRowKeys')?.[0]).toEqual([[1]]);
      const change = wrapper.emitted('selection-change')?.[0] as [number[], TableDataItem[]];
      expect(change[0]).toEqual([1]);
      expect(change[1]).toEqual([data[0]]);
      expect(countSelected(wrapper)).toBe(1);
    });

    it('toggles all rows via the header checkbox', async () => {
      const wrapper = mount(ExTable, { props: { columns, data, selectable: true } });

      wrapper.findAllComponents(ExCheckbox)[0].vm.$emit('update:modelValue', true);
      await nextTick();
      expect(wrapper.emitted('select-all')?.[0]?.[0]).toBe(true);
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([1, 2, 3]);
      expect(countSelected(wrapper)).toBe(data.length);

      // 再次点击表头全选框应取消全选
      wrapper.findAllComponents(ExCheckbox)[0].vm.$emit('update:modelValue', false);
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([]);
      expect(countSelected(wrapper)).toBe(0);
    });

    it('reflects controlled selectedRowKeys (v-model)', () => {
      const wrapper = mount(ExTable, {
        props: { columns, data, selectable: true, selectedRowKeys: [2] },
      });
      const selectedRows = wrapper
        .findAll('.ex-table__row')
        .filter(r => r.classes().includes('ex-table__row--selected'));
      expect(selectedRows.length).toBe(1);
      expect(selectedRows[0].text()).toContain('Player2');
    });

    it('shows indeterminate state when some rows are selected', () => {
      const wrapper = mount(ExTable, {
        props: { columns, data, selectable: true, selectedRowKeys: [1] },
      });
      const headerCheckbox = wrapper.findAllComponents(ExCheckbox)[0];
      expect(headerCheckbox.props('indeterminate')).toBe(true);
      expect(headerCheckbox.props('modelValue')).toBe(false);
    });

    it('supports single selection with radio type', async () => {
      const wrapper = mount(ExTable, {
        props: { columns, data, selectable: true, selectionType: 'radio' },
      });
      // radio 模式无表头全选框
      expect(wrapper.findAllComponents(ExCheckbox).length).toBe(0);
      const radios = wrapper.findAllComponents(ExRadio);
      expect(radios.length).toBe(data.length);

      radios[0].vm.$emit('update:modelValue', 1);
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([1]);

      // 选另一行应替换而非累加
      radios[2].vm.$emit('update:modelValue', 3);
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([3]);
      expect(countSelected(wrapper)).toBe(1);
    });

    it('respects isRowSelectable', async () => {
      const wrapper = mount(ExTable, {
        props: {
          columns,
          data,
          selectable: true,
          isRowSelectable: (record: TableDataItem) => record.key !== 2,
        },
      });
      const rowCheckboxes = findRowCheckboxes(wrapper);
      expect(rowCheckboxes[1].props('disabled')).toBe(true);

      // 全选只选可选行（排除 key=2）
      wrapper.findAllComponents(ExCheckbox)[0].vm.$emit('update:modelValue', true);
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([1, 3]);
    });

    it('exposes selection methods', async () => {
      const wrapper = mount(ExTable, { props: { columns, data, selectable: true } });
      const vm = wrapper.vm as unknown as {
        toggleRowSelection: (r: TableDataItem, s?: boolean) => void;
        toggleAllSelection: () => void;
        clearSelection: () => void;
      };

      vm.toggleRowSelection(data[0], true);
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([1]);

      vm.toggleAllSelection();
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([1, 2, 3]);

      vm.clearSelection();
      await nextTick();
      expect(wrapper.emitted('update:selectedRowKeys')?.at(-1)?.[0]).toEqual([]);
    });
  });
});
