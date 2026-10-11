import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, defineComponent, h, nextTick, reactive } from 'vue';
import { useTableEditing } from '../../../src/components/table/use-table-editing';
import { useTableColumnInteractions } from '../../../src/components/table/use-table-column-interactions';
import type { TableColumn, TableDataItem } from '../../../src/components/table/types';

const disposers: Array<() => void> = [];
afterEach(() => disposers.splice(0).forEach(dispose => dispose()));
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(accept => {
    resolve = accept;
  });
  return { promise, resolve };
};

describe('Table 跨状态更新回归', () => {
  it('待保存时外部原地修改同一行不能被旧草稿覆盖', async () => {
    const task = deferred();
    const props = reactive({
      editable: true,
      data: [{ key: 'a', name: '甲', count: 1 }] as TableDataItem[],
      columns: [{ key: 'name', editable: true }] as TableColumn[],
      saveEdit: () => task.promise,
    });
    const emit = vi.fn((_event: string, ..._args: unknown[]) => {});
    let api!: ReturnType<typeof useTableEditing>;
    const wrapper = mount(
      defineComponent({
        setup() {
          const rows = computed(() =>
            props.data.map((record, sourceIndex) => ({ record, sourceIndex }))
          );
          api = useTableEditing(props, emit, rows, record => record.key!);
          return () => h('div');
        },
      })
    );
    disposers.push(() => wrapper.unmount());
    const record = props.data[0]!;
    api.startRowEdit(record);
    api.setEditValue(record, 0, props.columns[0]!, '编辑名称');
    const result = api.saveRowEdit(record);
    await nextTick();
    record.count = 2;
    await nextTick();
    task.resolve();
    await result;
    const updates = emit.mock.calls.filter(([event]) => event === 'update:data');
    // 允许拒绝冲突或合并不冲突字段，但不可把外部计数恢复成旧值。
    for (const [, value] of updates) expect((value as TableDataItem[])[0]?.count).toBe(2);
  });

  it('取消 A 列拖宽只恢复 A，保留拖动期间父级对 B 的独立更新', () => {
    const props = reactive({
      columns: [
        { key: 'a', width: 100 },
        { key: 'b', width: 120 },
      ] as TableColumn[],
      resizableColumns: true,
      columnWidths: { a: 100, b: 120 } as Record<string, number>,
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
    disposers.push(() => wrapper.unmount());
    const header = document.createElement('th');
    header.getBoundingClientRect = () => ({ width: 100 }) as DOMRect;
    const pointer = new Event('pointerdown', { cancelable: true });
    Object.assign(pointer, { pointerId: 1, button: 0, clientX: 100 });
    api.startResize(pointer as PointerEvent, props.columns[0]!, header);
    props.columnWidths = { a: 160, b: 240 };
    api.cancelResize();
    expect(
      emit.mock.calls.filter(([event]) => event === 'update:columnWidths').at(-1)?.[1]
    ).toEqual({
      a: 100,
      b: 240,
    });
  });
});
