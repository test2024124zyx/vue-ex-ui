import { computed, ref, watch, toRaw, type ComputedRef } from 'vue';
import type {
  ExTableProps,
  ExTableEmits,
  TableColumn,
  TableDataItem,
  TableSortInfo,
} from './types';

export const DEFAULT_TREE_INDENT = 20;
const DEFAULT_PAGE_SIZE = 10;

export interface IndexedTableRow {
  record: TableDataItem;
  sourceIndex: number;
  key: string | number;
  depth: number;
  children: IndexedTableRow[];
}

export interface DisplayTableRow extends IndexedTableRow {
  index: number;
}

type Emit = <K extends keyof ExTableEmits>(event: K, ...args: ExTableEmits[K]) => void;
const positiveInteger = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) && (value ?? 0) > 0 ? Math.floor(value as number) : fallback;

/** 统一树结构、过滤排序、根级分页和展开，任何处理都不修改输入记录。 */
export function useTableRows(
  props: ExTableProps,
  emit: Emit,
  leafColumns: ComputedRef<TableColumn[]>,
  sortInfo: ComputedRef<TableSortInfo> | { value: TableSortInfo },
  hasDetails: () => boolean
) {
  const getRowKey = (record: TableDataItem, sourceIndex: number): string | number => {
    const key = record[props.rowKey ?? 'key'];
    return typeof key === 'string' || typeof key === 'number' ? key : sourceIndex;
  };
  const sourceTree = computed(() => {
    if (!props.tree) {
      // 平面表格沿用线性索引路径，不分配树遍历状态。
      const roots = props.data.map((record, sourceIndex) => ({
        record,
        sourceIndex,
        key: getRowKey(record, sourceIndex),
        depth: 0,
        children: [] as IndexedTableRow[],
      }));
      return { roots, all: roots };
    }
    const roots: IndexedTableRow[] = [];
    const all: IndexedTableRow[] = [];
    const active = new Set<TableDataItem>();
    const stack: Array<{
      record: TableDataItem;
      target: IndexedTableRow[];
      depth: number;
      exit?: boolean;
    }> = props.data.map(record => ({ record, target: roots, depth: 0 })).reverse();
    while (stack.length) {
      const entry = stack.pop()!;
      if (entry.exit) {
        active.delete(entry.record);
        continue;
      }
      if (!entry.record || typeof entry.record !== 'object' || active.has(entry.record)) continue;
      const sourceIndex = all.length;
      const node: IndexedTableRow = {
        record: entry.record,
        sourceIndex,
        key: getRowKey(entry.record, sourceIndex),
        depth: entry.depth,
        children: [],
      };
      entry.target.push(node);
      all.push(node);
      const children = entry.record[props.childrenKey ?? 'children'];
      if (!Array.isArray(children)) continue;
      // 进入和离开帧共用路径集合，深树不复制全部祖先，保持线性空间。
      active.add(entry.record);
      stack.push({ ...entry, exit: true });
      for (let index = children.length - 1; index >= 0; index--) {
        const record = children[index];
        if (record && typeof record === 'object')
          stack.push({ record, target: node.children, depth: entry.depth + 1 });
      }
    }
    return { roots, all };
  });
  const allSourceRows = computed(() => sourceTree.value.all);
  const internalExpanded = ref([...(props.defaultExpandedRowKeys ?? [])]);
  const internalDetails = ref([...(props.defaultDetailExpandedRowKeys ?? [])]);
  if (props.defaultExpandAllRows)
    internalExpanded.value = sourceTree.value.all
      .filter(row => row.children.length)
      .map(row => row.key);
  watch(
    () => props.expandedRowKeys,
    keys => {
      if (keys !== undefined) internalExpanded.value = [...keys];
    },
    { deep: true }
  );
  watch(
    () => props.detailExpandedRowKeys,
    keys => {
      if (keys !== undefined) internalDetails.value = [...keys];
    },
    { deep: true }
  );
  const expandedKeys = computed(() => new Set(props.expandedRowKeys ?? internalExpanded.value));
  const detailKeys = computed(() => new Set(props.detailExpandedRowKeys ?? internalDetails.value));
  const canExpandDetails = (row: IndexedTableRow) =>
    hasDetails() && (!props.rowExpandable || props.rowExpandable(row.record, row.sourceIndex));
  const isDetailExpanded = (row: IndexedTableRow) =>
    canExpandDetails(row) && detailKeys.value.has(row.key);
  function toggleExpansion(row: IndexedTableRow, expanded?: boolean, detail = false) {
    if (props.loading || (detail ? !canExpandDetails(row) : !row.children.length)) return;
    const keys = new Set(detail ? detailKeys.value : expandedKeys.value);
    const next = expanded ?? !keys.has(row.key);
    if (keys.has(row.key) === next) return;
    if (next) keys.add(row.key);
    else keys.delete(row.key);
    const result = [...keys];
    if (detail) {
      if (props.detailExpandedRowKeys === undefined) internalDetails.value = result;
      emit('update:detailExpandedRowKeys', result);
      emit('detail-expand-change', result, row.record, next);
    } else {
      if (props.expandedRowKeys === undefined) internalExpanded.value = result;
      emit('update:expandedRowKeys', result);
      emit('expand-change', result, row.record, next);
    }
  }
  const filteredRoots = computed(() => {
    const filters = leafColumns.value.filter(
      column => column.onFilter && column.filteredValue?.length
    );
    const column =
      !props.remoteSort && sortInfo.value.order
        ? leafColumns.value.find(item => item.key === sortInfo.value.key)
        : undefined;
    if (filters.length === 0 && !column) return sourceTree.value.roots;
    const compare = (a: IndexedTableRow, b: IndexedTableRow) => {
      if (!column) return 0;
      let value: number;
      if (column.sorter) value = column.sorter(a.record, b.record);
      else {
        const field = column.dataIndex ?? column.key;
        const left = a.record[field];
        const right = b.record[field];
        if (left === right) return 0;
        if (left == null) return 1;
        if (right == null) return -1;
        value =
          typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right));
      }
      return sortInfo.value.order === 'asc' ? value : -value;
    };
    const processed = new Map<IndexedTableRow, IndexedTableRow>();
    // 源数组为先序遍历，逆序处理确保先得到后代结果，避免深树递归栈溢出。
    for (let index = sourceTree.value.all.length - 1; index >= 0; index--) {
      const row = sourceTree.value.all[index]!;
      const children = row.children
        .map(child => processed.get(child))
        .filter((child): child is IndexedTableRow => Boolean(child))
        .sort(compare);
      const matches = filters.every(filter =>
        filter.filteredValue!.some(value => filter.onFilter!(value, row.record))
      );
      if (matches || children.length) processed.set(row, { ...row, children });
    }
    return sourceTree.value.roots
      .map(row => processed.get(row))
      .filter((row): row is IndexedTableRow => Boolean(row))
      .sort(compare);
  });
  const paginationConfig = computed(() => props.pagination || undefined);
  const internalCurrent = ref(1);
  const internalPageSize = ref(DEFAULT_PAGE_SIZE);
  watch(
    () => paginationConfig.value?.current,
    value => {
      if (value !== undefined) internalCurrent.value = positiveInteger(value, 1);
    },
    { immediate: true }
  );
  watch(
    () => paginationConfig.value?.pageSize,
    value => {
      if (value !== undefined) internalPageSize.value = positiveInteger(value, DEFAULT_PAGE_SIZE);
    },
    { immediate: true }
  );
  const pageSize = computed(() =>
    positiveInteger(paginationConfig.value?.pageSize ?? internalPageSize.value, DEFAULT_PAGE_SIZE)
  );
  const total = computed(() =>
    props.remotePagination
      ? Math.max(
          0,
          Number.isFinite(paginationConfig.value?.total)
            ? paginationConfig.value!.total!
            : props.data.length
        )
      : filteredRoots.value.length
  );
  const current = computed(() =>
    Math.min(
      positiveInteger(paginationConfig.value?.current ?? internalCurrent.value, 1),
      Math.max(1, Math.ceil(total.value / pageSize.value))
    )
  );
  function changePage(next: number, size: number) {
    if (props.loading || paginationConfig.value?.disabled) return;
    const capacity = positiveInteger(size, pageSize.value);
    const page = Math.min(positiveInteger(next, 1), Math.max(1, Math.ceil(total.value / capacity)));
    if (paginationConfig.value?.current === undefined) internalCurrent.value = page;
    if (paginationConfig.value?.pageSize === undefined) internalPageSize.value = capacity;
    const result = { current: page, pageSize: capacity, total: total.value };
    emit('update:pagination', result);
    emit('pagination-change', result);
  }
  const pageRoots = computed(() =>
    !paginationConfig.value || props.remotePagination
      ? filteredRoots.value
      : filteredRoots.value.slice(
          (current.value - 1) * pageSize.value,
          current.value * pageSize.value
        )
  );
  const visibleRows = computed<DisplayTableRow[]>(() => {
    const rows: DisplayTableRow[] = [];
    const stack = [...pageRoots.value].reverse();
    while (stack.length) {
      const row = stack.pop()!;
      rows.push({ ...row, index: rows.length });
      if (expandedKeys.value.has(row.key))
        for (let index = row.children.length - 1; index >= 0; index--)
          stack.push(row.children[index]!);
    }
    return rows;
  });
  const toggleRowExpansion = (record: TableDataItem, expanded?: boolean) => {
    const row = allSourceRows.value.find(item => toRaw(item.record) === toRaw(record));
    if (row) toggleExpansion(row, expanded);
  };
  const toggleDetailExpansion = (record: TableDataItem, expanded?: boolean) => {
    const row = allSourceRows.value.find(item => toRaw(item.record) === toRaw(record));
    if (row) toggleExpansion(row, expanded, true);
  };
  return {
    getRowKey,
    allSourceRows,
    visibleRows,
    expandedKeys,
    canExpandDetails,
    isDetailExpanded,
    toggleExpansion,
    toggleRowExpansion,
    toggleDetailExpansion,
    paginationConfig,
    current,
    pageSize,
    total,
    changePage,
  };
}
