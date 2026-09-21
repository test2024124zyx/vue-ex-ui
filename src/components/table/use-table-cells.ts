import { computed, isReactive, onBeforeUnmount, onBeforeUpdate, onUpdated, ref, watch } from 'vue';
import type { ComputedRef } from 'vue';
import type { TableColumn, TableDataItem } from './types';

interface CachedCell {
  index: number;
  field: string;
  render: TableColumn['render'];
  value?: ComputedRef<unknown>;
  rawValue?: unknown;
  revision?: number;
  lastSeen: number;
}

/** 单元格值按记录和列隔离，响应式依赖决定哪些格式化结果需要重新计算。 */
export function useTableCells(data: () => TableDataItem[]) {
  const revision = ref(0);
  const dataRevision = ref(0);
  let renderRevision = 0;
  const records = new Map<TableDataItem, Map<TableColumn, CachedCell>>();

  // 新数组可能携带绕过响应式代理的原地修改，整体替换时必须重新验证缓存。
  watch(
    data,
    () => {
      dataRevision.value += 1;
    },
    { flush: 'sync' }
  );

  onBeforeUpdate(() => {
    // 普通对象不具备依赖通知，父组件重新传入数据时仍须读取原地修改后的值。
    revision.value += 1;
    renderRevision += 1;
  });

  onUpdated(() => {
    // 虚拟滚动的数据数组仍持有离屏记录，弱键不足以限制缓存，必须按渲染窗口回收。
    for (const [record, cells] of records) {
      for (const [column, cell] of cells) {
        if (cell.lastSeen !== renderRevision) cells.delete(column);
      }
      if (cells.size === 0) records.delete(record);
    }
  });
  onBeforeUnmount(() => records.clear());

  function getCellValue(record: TableDataItem, column: TableColumn, index: number): unknown {
    // 未使用格式化函数的普通文本无需分配单元格缓存。
    const field = column.dataIndex || column.key;
    const render = column.render;
    if (!render) return record[field];
    let cells = records.get(record);
    if (!cells) {
      cells = new Map();
      records.set(record, cells);
    }
    let cell = cells.get(column);
    if (!cell || cell.index !== index || cell.field !== field || cell.render !== render) {
      cell = {
        index,
        field,
        render,
        lastSeen: renderRevision,
      };
      if (isReactive(record)) {
        cell.value = computed(() => {
          void dataRevision.value;
          return render(record[field], record, index);
        });
      }
      cells.set(column, cell);
    }
    cell.lastSeen = renderRevision;
    if (cell.value) return cell.value.value;
    // 普通数据只在本轮渲染内复用，避免为大批非响应式记录额外创建计算属性。
    if (cell.revision !== renderRevision) {
      cell.rawValue = render(record[field], record, index);
      cell.revision = renderRevision;
    }
    return cell.rawValue;
  }

  return { getCellValue, revision };
}
