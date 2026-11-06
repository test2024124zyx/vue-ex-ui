import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, reactive } from 'vue';
import type { TableColumn } from '../../../src/components/table/types';
import type { TableColumnInteractionProps } from '../../../src/components/table/table-column-interaction-types';
import { useTableColumnInteractions } from '../../../src/components/table/use-table-column-interactions';

const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach(dispose => dispose()));

function create(options: TableColumnInteractionProps = {}, columns?: TableColumn[]) {
  const props = reactive({
    columns: columns ?? [
      { key: 'a', width: 100, minWidth: 60, maxWidth: 180 },
      { key: 'b', width: 120 },
      { key: 'c', width: 140 },
    ],
    resizableColumns: true,
    reorderableColumns: true,
    ...options,
  });
  const emit = vi.fn((_event: string, ..._args: unknown[]) => {});
  let api!: ReturnType<typeof useTableColumnInteractions>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useTableColumnInteractions(props, emit);
        return () => h('div');
      },
    })
  );
  cleanup.push(() => wrapper.unmount());
  return { props, api, emit, wrapper };
}

describe('Table 列宽与列顺序状态', () => {
  it('调整宽度受上下界约束，不修改列对象', () => {
    const { props, api, emit } = create();
    expect(api.resizeColumn('a', 999)).toBe(true);
    expect(api.getColumnWidth(props.columns[0]!)).toBe(180);
    expect(props.columns[0]?.width).toBe(100);
    expect(api.resizeColumn('a', 1)).toBe(true);
    expect(api.getColumnWidth(props.columns[0]!)).toBe(60);
    expect(api.resizeColumn('a', Number.NaN)).toBe(false);
    expect(api.resizeColumn('missing', 100)).toBe(false);
    expect(emit.mock.calls.some(([event]) => event === 'column-resize')).toBe(true);
  });

  it('受控宽度只发请求，父级回写后才改变可见状态', () => {
    const { props, api, emit } = create({ columnWidths: { a: 110 } });
    api.resizeColumn('a', 160);
    expect(api.getColumnWidth(props.columns[0]!)).toBe(110);
    expect(emit.mock.calls.find(([event]) => event === 'update:columnWidths')?.[1]).toEqual({
      a: 160,
    });
    props.columnWidths = { a: 160 };
    expect(api.getColumnWidth(props.columns[0]!)).toBe(160);
  });

  it('已有像素字符串下限约束状态与实际CSS，非法上限不产生反向范围', () => {
    const { props, api } = create({}, [{ key: 'a', minWidth: '120px', maxWidth: 80 }]);
    api.resizeColumn('a', 60);
    expect(api.getColumnWidth(props.columns[0]!)).toBe(120);
    api.resizeColumn('a', 160);
    expect(api.getColumnWidth(props.columns[0]!)).toBe(160);
  });

  it('重排列保留叶列引用以及未声明列，原数组不变', () => {
    const { props, api } = create();
    expect(api.moveColumn('c', 'a', 'before')).toBe(true);
    expect(api.effectiveColumns.value.map(column => column.key)).toEqual(['c', 'a', 'b']);
    expect(api.effectiveColumns.value[0]).toBe(props.columns[2]);
    expect(props.columns.map(column => column.key)).toEqual(['a', 'b', 'c']);
    expect(api.moveColumnByOffset('c', -1)).toBe(false);
    expect(api.moveColumnByOffset('c', 1)).toBe(true);
    expect(api.effectiveColumns.value.map(column => column.key)).toEqual(['a', 'c', 'b']);
  });

  it('分组内重排有效，跨分组或固定区域重排被拒绝', () => {
    const { api } = create({}, [
      { key: 'group', children: [{ key: 'a' }, { key: 'b' }] },
      { key: 'c' },
      { key: 'fixed', fixed: 'left' },
    ]);
    expect(api.moveColumn('b', 'a', 'before')).toBe(true);
    expect(api.effectiveColumns.value[0]?.children?.map(column => column.key)).toEqual(['b', 'a']);
    expect(api.moveColumn('a', 'c', 'before')).toBe(false);
    expect(api.moveColumn('fixed', 'c', 'before')).toBe(false);
  });

  it('受控顺序与单列禁用分别生效', () => {
    const { props, api, emit } = create({ columnOrder: ['b', 'a'] });
    expect(api.effectiveColumns.value.map(column => column.key)).toEqual(['b', 'a', 'c']);
    api.moveColumn('c', 'b', 'before');
    expect(api.effectiveColumns.value.map(column => column.key)).toEqual(['b', 'a', 'c']);
    expect(emit.mock.calls.some(([event]) => event === 'update:columnOrder')).toBe(true);
    props.columns[0]!.resizable = false;
    props.columns[0]!.reorderable = false;
    expect(api.resizeColumn('a', 150)).toBe(false);
    expect(api.moveColumn('a', 'b', 'after')).toBe(false);
  });

  it('指针取消恢复初始宽度，卸载后不会再处理移动', () => {
    const { props, api, wrapper } = create();
    const header = document.createElement('th');
    header.getBoundingClientRect = () => ({ width: 100 }) as DOMRect;
    const pointer = (type: string, clientX: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { clientX, pointerId: 7, button: 0 });
      return event as PointerEvent;
    };
    api.startResize(pointer('pointerdown', 100), props.columns[0]!, header);
    document.dispatchEvent(pointer('pointermove', 150));
    expect(api.getColumnWidth(props.columns[0]!)).toBe(150);
    document.dispatchEvent(pointer('pointercancel', 150));
    expect(api.getColumnWidth(props.columns[0]!)).toBe(100);
    api.startResize(pointer('pointerdown', 100), props.columns[0]!, header);
    wrapper.unmount();
    document.dispatchEvent(pointer('pointermove', 180));
    expect(api.resizingKey.value).toBeUndefined();
  });
});
