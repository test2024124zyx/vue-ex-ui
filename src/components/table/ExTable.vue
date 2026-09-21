<template>
  <div
    ref="tableRef"
    :class="tableClasses"
    :style="tableStyles"
  >
    <!-- 表格容器 -->
    <div
      ref="containerRef"
      class="ex-table__container"
      :style="containerStyle"
      @scroll.passive="handleVirtualScroll"
    >
      <table
        class="ex-table__main"
        :aria-busy="loading || undefined"
      >
        <!-- 表头 -->
        <thead
          v-if="showHeader"
          class="ex-table__header"
        >
          <tr
            v-for="(headerRow, rowIndex) in headerRows"
            :key="rowIndex"
          >
            <!-- 选择列表头 -->
            <th
              v-if="selectable && rowIndex === 0"
              class="ex-table__selection-column"
              :rowspan="headerDepth"
              scope="col"
            >
              <div class="ex-table__cell ex-table__cell--center">
                <ExCheckbox
                  v-if="selectionType === 'checkbox'"
                  :model-value="allSelected"
                  :indeterminate="someSelected"
                  :disabled="loading || selectableKeys.length === 0"
                  :aria-label="t('selectAll')"
                  @update:model-value="toggleAllSelection"
                />
              </div>
            </th>
            <th
              v-for="headerCell in headerRow"
              :key="headerCell.path"
              :class="getHeaderCellClasses(headerCell.column, headerCell.isLeaf)"
              :style="getColumnStyle(headerCell.column, headerCell.leafIndex, true)"
              :colspan="headerCell.colspan > 1 ? headerCell.colspan : undefined"
              :rowspan="headerCell.rowspan > 1 ? headerCell.rowspan : undefined"
              :scope="headerCell.isLeaf ? 'col' : 'colgroup'"
              :aria-sort="
                headerCell.isLeaf && headerCell.column.sortable
                  ? getAriaSort(headerCell.column.key)
                  : undefined
              "
              @click="headerCell.isLeaf && handleHeaderClick(headerCell.column)"
            >
              <button
                v-if="headerCell.isLeaf && headerCell.column.sortable"
                type="button"
                class="ex-table__cell ex-table__sort-button"
                :disabled="loading"
                @click.stop="handleHeaderClick(headerCell.column)"
              >
                <span class="ex-table__cell-content">
                  <slot
                    :name="`header-${headerCell.column.key}`"
                    :column="headerCell.column"
                  >
                    {{ headerCell.column.title }}
                  </slot>
                </span>

                <!-- 排序图标 -->
                <span class="ex-table__sort-icon">
                  <ExIcon
                    v-if="getSortOrder(headerCell.column.key) === 'asc'"
                    icon="arrow-up-line"
                    :size="14"
                    aria-hidden="true"
                  />
                  <ExIcon
                    v-else-if="getSortOrder(headerCell.column.key) === 'desc'"
                    icon="arrow-down-line"
                    :size="14"
                    aria-hidden="true"
                  />
                  <ExIcon
                    v-else
                    icon="arrow-up-down-line"
                    :size="14"
                    style="opacity: 0.3"
                    aria-hidden="true"
                  />
                </span>
              </button>
              <div
                v-else
                class="ex-table__cell"
              >
                <span class="ex-table__cell-content">
                  <slot
                    :name="`header-${headerCell.column.key}`"
                    :column="headerCell.column"
                  >
                    {{ headerCell.column.title }}
                  </slot>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="ex-table__body">
          <!-- 虚拟滚动上方占位 -->
          <tr
            v-if="topSpacerHeight > 0"
            aria-hidden="true"
            class="ex-table__spacer-row"
          >
            <td
              :colspan="totalColspan"
              :style="{ height: `${topSpacerHeight}px`, padding: 0 }"
            />
          </tr>

          <tr
            v-for="{ record, index, sourceIndex } in renderRows"
            :key="getRowKey(record, sourceIndex)"
            :class="getRowClasses(record, sourceIndex)"
            :style="useVirtual ? { height: `${normalizedRowHeight}px` } : undefined"
            @click="handleRowClick(record, index, $event)"
          >
            <!-- 选择列单元格 -->
            <td
              v-if="selectable"
              class="ex-table__selection-column"
              @click.stop
            >
              <div class="ex-table__cell ex-table__cell--center">
                <ExCheckbox
                  v-if="selectionType === 'checkbox'"
                  :model-value="isRowSelected(record, sourceIndex)"
                  :disabled="loading || !rowSelectable(record, sourceIndex)"
                  :aria-label="t('selectRowAria', { index: index + 1 })"
                  @update:model-value="
                    val => toggleRowSelectionAtIndex(record, sourceIndex, val === true)
                  "
                />
                <ExRadio
                  v-else
                  :model-value="isRowSelected(record, sourceIndex)"
                  :value="true"
                  :disabled="loading || !rowSelectable(record, sourceIndex)"
                  :aria-label="t('selectRowAria', { index: index + 1 })"
                  @update:model-value="() => toggleRowSelectionAtIndex(record, sourceIndex, true)"
                />
              </div>
            </td>
            <td
              v-for="{ column, classes, style } in bodyColumns"
              :key="column.key"
              :class="classes"
              :style="style"
              :data-label="column.title"
              :title="getCellTitle(record, column, index)"
            >
              <div class="ex-table__cell">
                <slot
                  :name="column.slot || `cell-${column.key}`"
                  :record="record"
                  :value="getCellValue(record, column, index)"
                  :index="index"
                  :column="column"
                >
                  <CellContent :value="getCellValue(record, column, index)" />
                </slot>
              </div>
            </td>
          </tr>

          <!-- 虚拟滚动下方占位 -->
          <tr
            v-if="bottomSpacerHeight > 0"
            aria-hidden="true"
            class="ex-table__spacer-row"
          >
            <td
              :colspan="totalColspan"
              :style="{ height: `${bottomSpacerHeight}px`, padding: 0 }"
            />
          </tr>

          <!-- 空数据（加载中不显示，避免与 loading 遮罩叠加） -->
          <tr
            v-if="!loading && sortedData.length === 0"
            class="ex-table__empty-row"
          >
            <td
              :colspan="leafColumns.length + (selectable ? 1 : 0)"
              class="ex-table__empty-cell"
            >
              <div class="ex-table__empty">
                <slot name="empty">
                  <ExIcon
                    icon="inbox-line"
                    :size="48"
                    style="opacity: 0.3; margin-bottom: 12px"
                    aria-hidden="true"
                  />
                  <p>{{ emptyText || t('empty') }}</p>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 加载遮罩 -->
    <div
      v-if="loading"
      class="ex-table__loading"
      role="status"
      aria-live="polite"
      :aria-label="t('loading')"
    >
      <div
        class="ex-table__loading-spinner"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import ExRadio from '../radio/ExRadio.vue';
import { computed, ref, watch, onBeforeUnmount, isVNode, toDisplayString } from 'vue';
import { useComponentSize } from '../config-provider/composables';
import type {
  ExTableProps,
  ExTableEmits,
  ExTableExposed,
  TableColumn,
  TableDataItem,
  TableSortInfo,
} from './types';
import { useLocale } from '../../locale';
import { useTableCells } from './use-table-cells';

defineOptions({
  name: 'ExTable',
});

const props = withDefaults(defineProps<ExTableProps>(), {
  bordered: false,
  striped: false,
  hoverable: true,
  loading: false,
  showHeader: true,
  remoteSort: false,
  rowKey: 'key',
  layout: 'table',
  selectable: false,
  selectionType: 'checkbox',
  virtual: false,
  rowHeight: 48,
  virtualBuffer: 6,
});

const emit = defineEmits<ExTableEmits>();

const tableRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const { t } = useLocale('table');
const componentSize = useComponentSize(computed(() => props.size));
const CellContent = ({ value }: { value: unknown }) =>
  isVNode(value)
    ? value
    : Array.isArray(value) && value.every(isVNode)
      ? value
      : toDisplayString(value);
const sortInfo = ref<TableSortInfo>({ key: '', order: null });

// 虚拟滚动：当前滚动位置
const scrollTop = ref(0);

// 计算属性
const tableClasses = computed(() => {
  const classes = [
    'ex-table',
    `ex-table--${componentSize.value}`,
    `ex-table--layout-${props.layout}`,
  ];

  if (props.bordered) classes.push('ex-table--bordered');
  if (props.striped) classes.push('ex-table--striped');
  if (props.hoverable) classes.push('ex-table--hoverable');
  if (props.loading) classes.push('ex-table--loading');
  if (props.virtual) classes.push('ex-table--virtual');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const tableStyles = computed(() => {
  const layout = props.virtual ? { '--ex-table-row-height': `${normalizedRowHeight.value}px` } : {};
  return [layout, props.style];
});

const containerStyle = computed(() => {
  const styles: Record<string, string> = {};
  // 虚拟滚动：用固定视口高度作为滚动容器
  if (props.virtual) {
    styles.height = `${viewportHeight.value}px`;
    styles.overflowY = 'auto';
    return styles;
  }
  if (props.maxHeight) {
    styles.maxHeight =
      typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    styles.overflowY = 'auto';
  }
  return styles;
});

const getHeaderCellClasses = (column: TableColumn, isLeaf = true) => {
  const classes = ['ex-table__header-cell'];
  if (column.align) classes.push(`ex-table__cell--${column.align}`);
  if (isLeaf && column.sortable) classes.push('ex-table__header-cell--sortable');
  const fixed = getFixedSide(column);
  if (fixed) classes.push(`ex-table__cell--fixed-${fixed}`);
  if (column.ellipsis) classes.push('ex-table__cell--ellipsis');
  if (column.headerClassName) classes.push(column.headerClassName);
  return classes;
};

const getBodyCellClasses = (column: TableColumn) => {
  const classes = ['ex-table__body-cell'];
  if (column.align) classes.push(`ex-table__cell--${column.align}`);
  const fixed = getFixedSide(column);
  if (fixed) classes.push(`ex-table__cell--fixed-${fixed}`);
  if (column.ellipsis) classes.push('ex-table__cell--ellipsis');
  if (column.className) classes.push(column.className);
  return classes;
};

const getRowClasses = (record: TableDataItem, index: number) => {
  const classes = ['ex-table__row'];
  if (props.striped && index % 2 === 1) {
    classes.push('ex-table__row--striped');
  }
  if (props.selectable && isRowSelected(record, index)) {
    classes.push('ex-table__row--selected');
  }
  return classes;
};

const getColumnChildren = (column: TableColumn): TableColumn[] =>
  Array.isArray(column.children) ? column.children.filter(Boolean) : [];

const leafColumns = computed<TableColumn[]>(() => {
  const result: TableColumn[] = [];
  const visit = (columns: TableColumn[], ancestors: Set<TableColumn>) => {
    for (const column of columns) {
      const children = getColumnChildren(column);
      if (children.length === 0 || ancestors.has(column)) {
        result.push(column);
        continue;
      }
      const nextAncestors = new Set(ancestors).add(column);
      visit(children, nextAncestors);
    }
  };
  visit(props.columns, new Set());
  return result;
});

const getColumnDepth = (column: TableColumn, ancestors: Set<TableColumn>): number => {
  const children = getColumnChildren(column);
  if (children.length === 0 || ancestors.has(column)) return 1;
  const nextAncestors = new Set(ancestors).add(column);
  return 1 + Math.max(...children.map(child => getColumnDepth(child, nextAncestors)));
};

const headerDepth = computed(() =>
  props.columns.length === 0
    ? 1
    : Math.max(...props.columns.map(column => getColumnDepth(column, new Set())))
);

interface TableHeaderCell {
  column: TableColumn;
  path: string;
  colspan: number;
  rowspan: number;
  leafIndex: number;
  isLeaf: boolean;
}

const headerRows = computed<TableHeaderCell[][]>(() => {
  const rows = Array.from({ length: headerDepth.value }, () => [] as TableHeaderCell[]);
  let leafIndex = 0;
  const visit = (
    columns: TableColumn[],
    level: number,
    path: string,
    ancestors: Set<TableColumn>
  ): number => {
    let leafCount = 0;
    columns.forEach((column, index) => {
      const children = getColumnChildren(column);
      const isLeaf = children.length === 0 || ancestors.has(column);
      const cellPath = `${path}${column.key}:${index}`;
      if (isLeaf) {
        rows[level]?.push({
          column,
          path: cellPath,
          colspan: 1,
          rowspan: headerDepth.value - level,
          leafIndex,
          isLeaf: true,
        });
        leafIndex += 1;
        leafCount += 1;
        return;
      }
      const nextAncestors = new Set(ancestors).add(column);
      const childCount = visit(children, level + 1, `${cellPath}/`, nextAncestors);
      rows[level]?.push({
        column,
        path: cellPath,
        colspan: Math.max(1, childCount),
        rowspan: 1,
        leafIndex: -1,
        isLeaf: false,
      });
      leafCount += childCount;
    });
    return leafCount;
  };
  visit(props.columns, 0, '', new Set());
  return rows;
});

// 找到最后一个没有指定宽度的叶子列
const lastAutoWidthColumnIndex = computed(() => {
  for (let i = leafColumns.value.length - 1; i >= 0; i--) {
    const column = leafColumns.value[i];
    if (column && !column.width) {
      return i;
    }
  }
  return -1;
});

const toCssLength = (value: string | number): string =>
  typeof value === 'number' ? `${value}px` : value;

const getFixedSide = (column: TableColumn): 'left' | 'right' | undefined => {
  if (column.fixed === true) return 'left';
  return column.fixed || undefined;
};

// 按列构建左右前缀偏移，所有行复用同一结果，列宽变化后自动失效。
const fixedOffsets = computed(() => {
  const columns = leafColumns.value;
  const build = (side: 'left' | 'right') => {
    const offsets: string[] = Array(columns.length).fill('0px');
    let pixels = 0;
    const relativeLengths: string[] = [];
    const direction = side === 'left' ? 1 : -1;
    for (
      let index = side === 'left' ? 0 : columns.length - 1;
      index >= 0 && index < columns.length;
      index += direction
    ) {
      const column = columns[index];
      if (!column || getFixedSide(column) !== side) continue;
      offsets[index] = relativeLengths.length
        ? `calc(${[...relativeLengths, ...(pixels ? [`${pixels}px`] : [])].join(' + ')})`
        : `${pixels}px`;
      const length = toCssLength(column.width ?? column.minWidth ?? 0);
      if (/^\d+(?:\.\d+)?px$/.test(length)) pixels += Number.parseFloat(length);
      else relativeLengths.push(length);
    }
    return offsets;
  };
  return { left: build('left'), right: build('right') };
});

const getColumnStyle = (column: TableColumn, index = -1, header = false) => {
  const styles: Record<string, string> = {};
  if (column.width) {
    styles.width = toCssLength(column.width);
  } else if (index === lastAutoWidthColumnIndex.value) {
    // 最后一个没有指定宽度的列，设置为 100% 以填充剩余空间
    styles.width = '100%';
  }
  if (column.minWidth) {
    styles.minWidth = toCssLength(column.minWidth);
  }
  const fixed = getFixedSide(column);
  if (fixed && index >= 0) {
    styles.position = 'sticky';
    styles[fixed] = fixedOffsets.value[fixed][index] ?? '0px';
    styles.zIndex = header ? '3' : '2';
  }
  return styles;
};

const getRowKey = (record: TableDataItem, index: number): string | number => {
  const value = record[props.rowKey];
  return typeof value === 'string' || typeof value === 'number' ? value : index;
};

const { getCellValue, revision: cellRevision } = useTableCells(() => props.data);

// 每次表格更新只按列计算样式，兼容普通列对象原地修改后触发父级更新。
const bodyColumns = computed(() => {
  void cellRevision.value;
  return leafColumns.value.map((column, index) => ({
    column,
    classes: getBodyCellClasses(column),
    style: getColumnStyle(column, index),
  }));
});

const getCellTitle = (record: TableDataItem, column: TableColumn, index: number) => {
  if (!column.ellipsis) return undefined;
  const value = getCellValue(record, column, index);
  return value == null || typeof value === 'object' ? undefined : String(value);
};

const getSortOrder = (key: string) => {
  return sortInfo.value.key === key ? sortInfo.value.order : null;
};

interface IndexedTableRow {
  record: TableDataItem;
  sourceIndex: number;
}

// 排序时保留原始索引，保证缺少业务 key 的行仍具有稳定身份。
const sortedRows = computed<IndexedTableRow[]>(() => {
  let rows = props.data.map((record, sourceIndex) => ({ record, sourceIndex }));
  for (const column of leafColumns.value) {
    if (!column.onFilter || !column.filteredValue || column.filteredValue.length === 0) continue;
    rows = rows.filter(row =>
      column.filteredValue?.some(value => column.onFilter?.(value, row.record))
    );
  }
  // 远程排序：不在本地排序，直接用外部传入的 data
  if (props.remoteSort) {
    return rows;
  }

  if (!sortInfo.value.key || !sortInfo.value.order) {
    return rows;
  }

  const column = leafColumns.value.find(col => col.key === sortInfo.value.key);
  if (!column) return rows;

  const dataIndex = column.dataIndex || column.key;
  return rows.sort((a, b) => {
    if (column.sorter) {
      const result = column.sorter(a.record, b.record);
      return sortInfo.value.order === 'asc' ? result : -result;
    }
    const aVal = a.record[dataIndex];
    const bVal = b.record[dataIndex];

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortInfo.value.order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortInfo.value.order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
});

const sortedData = computed(() => sortedRows.value.map(row => row.record));

// ============================================================================
// 虚拟滚动 (Virtual Scrolling) —— opt-in，需配合固定 rowHeight
// ============================================================================

const useVirtual = computed(() => props.virtual && sortedData.value.length > 0);

const normalizedRowHeight = computed(() =>
  Number.isFinite(props.rowHeight) && props.rowHeight > 0 ? props.rowHeight : 48
);

const normalizedVirtualBuffer = computed(() =>
  Number.isFinite(props.virtualBuffer) && props.virtualBuffer >= 0
    ? Math.trunc(props.virtualBuffer)
    : 6
);

// 视口高度：优先 virtualHeight，其次数值型 maxHeight，最后回退 400
const viewportHeight = computed(() => {
  if (Number.isFinite(props.virtualHeight) && (props.virtualHeight ?? 0) > 0) {
    return props.virtualHeight as number;
  }
  if (
    typeof props.maxHeight === 'number' &&
    Number.isFinite(props.maxHeight) &&
    props.maxHeight > 0
  ) {
    return props.maxHeight;
  }
  return 400;
});

// 可视窗口起止索引
const virtualRange = computed(() => {
  const total = sortedData.value.length;
  if (!useVirtual.value) return { start: 0, end: total };
  const buffer = normalizedVirtualBuffer.value;
  const visibleCount = Math.ceil(viewportHeight.value / normalizedRowHeight.value) + buffer * 2;
  const requestedStart = Math.max(
    0,
    Math.floor(scrollTop.value / normalizedRowHeight.value) - buffer
  );
  const start = Math.min(requestedStart, Math.max(0, total - visibleCount));
  const end = Math.min(total, start + visibleCount);
  return { start, end };
});

// 实际渲染的行（携带绝对索引，保证选择/排序/插槽索引正确）
const renderRows = computed<{ record: TableDataItem; index: number; sourceIndex: number }[]>(() => {
  const { start, end } = virtualRange.value;
  const rows: { record: TableDataItem; index: number; sourceIndex: number }[] = [];
  for (let i = start; i < end; i++) {
    const row = sortedRows.value[i];
    if (row) rows.push({ record: row.record, index: i, sourceIndex: row.sourceIndex });
  }
  return rows;
});

// 上/下占位高度，保持滚动条总高度正确
const topSpacerHeight = computed(() =>
  useVirtual.value ? virtualRange.value.start * normalizedRowHeight.value : 0
);
const bottomSpacerHeight = computed(() =>
  useVirtual.value
    ? (sortedData.value.length - virtualRange.value.end) * normalizedRowHeight.value
    : 0
);

// 选择列 + 数据列的总列数（占位行 colspan 用）
const totalColspan = computed(() => leafColumns.value.length + (props.selectable ? 1 : 0));

let virtualRaf: number | null = null;
const handleVirtualScroll = () => {
  if (!useVirtual.value || !containerRef.value) return;
  if (virtualRaf !== null) cancelAnimationFrame(virtualRaf);
  virtualRaf = requestAnimationFrame(() => {
    if (containerRef.value) scrollTop.value = containerRef.value.scrollTop;
    virtualRaf = null;
  });
};

onBeforeUnmount(() => {
  if (virtualRaf !== null) {
    cancelAnimationFrame(virtualRaf);
    virtualRaf = null;
  }
});

// ============================================================================
// 行选择 (Row Selection)
// ============================================================================

// 受控时展示父级确认值，内部副本只用于切回非受控时承接最近值。
const internalSelectedKeys = ref<Array<string | number>>([...(props.selectedRowKeys ?? [])]);
watch(
  () => props.selectedRowKeys,
  keys => {
    if (keys !== undefined) {
      internalSelectedKeys.value = [...keys];
    }
  },
  { deep: true }
);
const effectiveSelectedKeys = computed(() => props.selectedRowKeys ?? internalSelectedKeys.value);

const rowSelectable = (record: TableDataItem, index: number): boolean =>
  props.isRowSelectable ? props.isRowSelectable(record, index) : true;

// 选中键保留有序数组对外输出，内部成员查询统一复用集合，避免全选时平方级扫描。
const selectedKeySet = computed(() => new Set(effectiveSelectedKeys.value));

const isRowSelected = (record: TableDataItem, index: number): boolean =>
  selectedKeySet.value.has(getRowKey(record, index));

// 当前展示数据中「可选行」的 key 列表（全选/半选状态以此为准）
const selectableKeys = computed(() =>
  sortedRows.value
    .filter(row => rowSelectable(row.record, row.sourceIndex))
    .map(row => getRowKey(row.record, row.sourceIndex))
);

const allSelected = computed(
  () =>
    selectableKeys.value.length > 0 && selectableKeys.value.every(k => selectedKeySet.value.has(k))
);

const someSelected = computed(
  () => !allSelected.value && selectableKeys.value.some(k => selectedKeySet.value.has(k))
);

const getSelectedRows = (keys: Array<string | number>) => {
  const selected = new Set(keys);
  return props.data.filter((record, index) => selected.has(getRowKey(record, index)));
};
const commitSelection = (keys: Array<string | number>) => {
  if (props.selectedRowKeys === undefined) internalSelectedKeys.value = [...keys];
  emit('update:selectedRowKeys', [...keys]);
  emit('selection-change', [...keys], getSelectedRows(keys));
};

const toggleRowSelectionAtIndex = (
  record: TableDataItem,
  sourceIndex: number,
  selected?: boolean
): void => {
  if (props.loading || !rowSelectable(record, sourceIndex)) return;

  const key = getRowKey(record, sourceIndex);
  const currentlySelected = selectedKeySet.value.has(key);
  const next = selected ?? !currentlySelected;
  let keys: Array<string | number>;

  if (props.selectionType === 'radio') {
    if (next) keys = [key];
    else if (currentlySelected) keys = [];
    else return;
  } else if (next && !currentlySelected) {
    keys = [...effectiveSelectedKeys.value, key];
  } else if (!next && currentlySelected) {
    keys = effectiveSelectedKeys.value.filter(k => k !== key);
  } else {
    return; // 状态未变化
  }

  emit('select', record, next, getSelectedRows(keys));
  commitSelection(keys);
};

const toggleRowSelection: ExTableExposed['toggleRowSelection'] = (record, selected) => {
  const sourceIndex = props.data.indexOf(record);
  toggleRowSelectionAtIndex(record, sourceIndex < 0 ? 0 : sourceIndex, selected);
};

const toggleAllSelection: ExTableExposed['toggleAllSelection'] = () => {
  if (props.loading) return;
  const shouldSelectAll = !allSelected.value;
  let keys: Array<string | number>;
  if (shouldSelectAll) {
    // 合并已有选中（保留不在当前可选列表中的 key），再加入全部可选行
    const merged = new Set(effectiveSelectedKeys.value);
    selectableKeys.value.forEach(k => merged.add(k));
    keys = Array.from(merged);
  } else {
    const toRemove = new Set(selectableKeys.value);
    keys = effectiveSelectedKeys.value.filter(k => !toRemove.has(k));
  }
  emit('select-all', shouldSelectAll, getSelectedRows(keys));
  commitSelection(keys);
};

const clearSelection: ExTableExposed['clearSelection'] = () => {
  if (effectiveSelectedKeys.value.length === 0) return;
  commitSelection([]);
};

// 事件处理
const handleHeaderClick = (column: TableColumn) => {
  if (props.loading || !column.sortable) return;

  if (sortInfo.value.key === column.key) {
    // 切换排序顺序：null -> asc -> desc -> null
    if (sortInfo.value.order === null) {
      sortInfo.value.order = 'asc';
    } else if (sortInfo.value.order === 'asc') {
      sortInfo.value.order = 'desc';
    } else {
      sortInfo.value.order = null;
      sortInfo.value.key = '';
    }
  } else {
    sortInfo.value.key = column.key;
    sortInfo.value.order = 'asc';
  }

  emit('sort-change', { ...sortInfo.value });
};

// 排序表头的无障碍 aria-sort 值
const getAriaSort = (key: string): 'ascending' | 'descending' | 'none' => {
  const order = getSortOrder(key);
  if (order === 'asc') return 'ascending';
  if (order === 'desc') return 'descending';
  return 'none';
};

const handleRowClick = (record: TableDataItem, index: number, event: MouseEvent) => {
  if (!props.loading) {
    emit('row-click', record, index, event);
  }
};

// 暴露的方法
const getElement = () => tableRef.value || null;

const clearSort = () => {
  sortInfo.value = { key: '', order: null };
};

defineExpose<ExTableExposed>({
  getElement,
  clearSort,
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
});
</script>

<style scoped lang="scss" src="./ExTable.scss"></style>
