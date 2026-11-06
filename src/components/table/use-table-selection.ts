import { computed, ref, watch, toRaw, type ComputedRef } from 'vue';
import type { ExTableProps, ExTableEmits, TableDataItem } from './types';
import type { IndexedTableRow } from './use-table-rows';

type Emit = <K extends keyof ExTableEmits>(event: K, ...args: ExTableEmits[K]) => void;

/** 选择状态独立于展开、分页与虚拟窗口，离页键不会被当前页面全选覆盖。 */
export function useTableSelection(
  props: ExTableProps,
  emit: Emit,
  allRows: ComputedRef<IndexedTableRow[]>,
  visibleRows: ComputedRef<IndexedTableRow[]>,
  getRowKey: (record: TableDataItem, index: number) => string | number
) {
  const internalSelectedKeys = ref([...(props.selectedRowKeys ?? [])]);
  watch(
    () => props.selectedRowKeys,
    (keys, previousKeys) => {
      if (keys !== undefined) internalSelectedKeys.value = [...keys];
      else if (previousKeys !== undefined) {
        // 解除控制继承当前模式的真实值，不能保留单选模式隐藏的额外键。
        internalSelectedKeys.value =
          props.selectionType === 'radio' ? previousKeys.slice(0, 1) : [...previousKeys];
      }
    },
    { deep: true, flush: 'sync' }
  );
  const effectiveSelectedKeys = computed(() => {
    const keys = props.selectedRowKeys ?? internalSelectedKeys.value;
    return props.selectionType === 'radio' ? keys.slice(0, 1) : keys;
  });
  const selectedKeySet = computed(() => new Set(effectiveSelectedKeys.value));
  const rowSelectable = (record: TableDataItem, index: number) =>
    !props.isRowSelectable || props.isRowSelectable(record, index);
  const isRowSelected = (record: TableDataItem, index: number) =>
    selectedKeySet.value.has(getRowKey(record, index));
  const selectableKeys = computed(() =>
    visibleRows.value.filter(row => rowSelectable(row.record, row.sourceIndex)).map(row => row.key)
  );
  const allSelected = computed(
    () =>
      selectableKeys.value.length > 0 &&
      selectableKeys.value.every(key => selectedKeySet.value.has(key))
  );
  const someSelected = computed(
    () => !allSelected.value && selectableKeys.value.some(key => selectedKeySet.value.has(key))
  );
  const getSelectedRows = (keys: Array<string | number>) => {
    const selected = new Set(keys);
    return allRows.value.filter(row => selected.has(row.key)).map(row => row.record);
  };
  const commit = (keys: Array<string | number>) => {
    if (props.selectedRowKeys === undefined) internalSelectedKeys.value = [...keys];
    emit('update:selectedRowKeys', [...keys]);
    emit('selection-change', [...keys], getSelectedRows(keys));
  };
  watch(
    () => props.selectionType,
    mode => {
      // 模式切换收敛内部状态，避免切回多选时复活已经不再生效的选择。
      if (
        mode === 'radio' &&
        props.selectedRowKeys === undefined &&
        internalSelectedKeys.value.length > 1
      ) {
        commit(internalSelectedKeys.value.slice(0, 1));
      }
    }
  );
  const toggleRowSelectionAtIndex = (record: TableDataItem, index: number, selected?: boolean) => {
    if (props.loading || !rowSelectable(record, index)) return;
    const key = getRowKey(record, index);
    const current = selectedKeySet.value.has(key);
    const next = selected ?? !current;
    if (next === current) return;
    const keys =
      props.selectionType === 'radio'
        ? next
          ? [key]
          : []
        : next
          ? [...effectiveSelectedKeys.value, key]
          : effectiveSelectedKeys.value.filter(item => item !== key);
    emit('select', record, next, getSelectedRows(keys));
    commit(keys);
  };
  const toggleRowSelection = (record: TableDataItem, selected?: boolean) => {
    const row = allRows.value.find(item => toRaw(item.record) === toRaw(record));
    if (row) toggleRowSelectionAtIndex(record, row.sourceIndex, selected);
  };
  const toggleAllSelection = () => {
    // 程序化入口同样遵守单选约束，不能因隐藏了表头全选框就省略模式校验。
    if (props.loading || props.selectionType === 'radio') return;
    const next = !allSelected.value;
    const visible = new Set(selectableKeys.value);
    const keys = next
      ? [...new Set([...effectiveSelectedKeys.value, ...visible])]
      : effectiveSelectedKeys.value.filter(key => !visible.has(key));
    emit('select-all', next, getSelectedRows(keys));
    commit(keys);
  };
  const clearSelection = () => {
    if (effectiveSelectedKeys.value.length) commit([]);
  };
  return {
    rowSelectable,
    isRowSelected,
    selectableKeys,
    allSelected,
    someSelected,
    toggleRowSelectionAtIndex,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,
  };
}
