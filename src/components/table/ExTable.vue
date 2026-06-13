<template>
  <div ref="tableRef" :class="tableClasses" :style="tableStyles">
    <!-- 表格容器 -->
    <div class="ex-table__container" :style="containerStyle">
      <table class="ex-table__main">
        <!-- 表头 -->
        <thead v-if="showHeader" class="ex-table__header">
          <tr>
            <!-- 选择列表头 -->
            <th v-if="selectable" class="ex-table__selection-column">
              <div class="ex-table__cell ex-table__cell--center">
                <ExCheckbox
                  v-if="selectionType === 'checkbox'"
                  :model-value="allSelected"
                  :indeterminate="someSelected"
                  :disabled="selectableKeys.length === 0"
                  aria-label="全选"
                  @update:model-value="toggleAllSelection"
                />
              </div>
            </th>
            <th
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="getHeaderCellClasses(column)"
              :style="getColumnStyle(column, colIndex)"
              @click="handleHeaderClick(column)"
            >
              <div class="ex-table__cell">
                <span class="ex-table__cell-content">
                  <slot :name="`header-${column.key}`" :column="column">
                    {{ column.title }}
                  </slot>
                </span>

                <!-- 排序图标 -->
                <span v-if="column.sortable" class="ex-table__sort-icon">
                  <ExIcon
                    v-if="getSortOrder(column.key) === 'asc'"
                    icon="arrow-up-line"
                    :size="14"
                    aria-hidden="true"
                  />
                  <ExIcon
                    v-else-if="getSortOrder(column.key) === 'desc'"
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
              </div>
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="ex-table__body">
          <tr
            v-for="(record, index) in sortedData"
            :key="getRowKey(record, index)"
            :class="getRowClasses(record, index)"
            @click="handleRowClick(record, index, $event)"
          >
            <!-- 选择列单元格 -->
            <td v-if="selectable" class="ex-table__selection-column" @click.stop>
              <div class="ex-table__cell ex-table__cell--center">
                <ExCheckbox
                  v-if="selectionType === 'checkbox'"
                  :model-value="isRowSelected(record, index)"
                  :disabled="!rowSelectable(record, index)"
                  :aria-label="`选择第 ${index + 1} 行`"
                  @update:model-value="val => toggleRowSelection(record, val === true)"
                />
                <ExRadio
                  v-else
                  :model-value="
                    isRowSelected(record, index) ? getRowKey(record, index) : '__ex_none__'
                  "
                  :value="getRowKey(record, index)"
                  :disabled="!rowSelectable(record, index)"
                  :aria-label="`选择第 ${index + 1} 行`"
                  @update:model-value="() => toggleRowSelection(record, true)"
                />
              </div>
            </td>
            <td
              v-for="(column, colIndex) in columns"
              :key="column.key"
              :class="getBodyCellClasses(column)"
              :style="getColumnStyle(column, colIndex)"
              :data-label="column.title"
            >
              <div class="ex-table__cell">
                <slot
                  :name="column.slot || `cell-${column.key}`"
                  :record="record"
                  :value="getCellValue(record, column)"
                  :index="index"
                  :column="column"
                >
                  {{ getCellValue(record, column) }}
                </slot>
              </div>
            </td>
          </tr>

          <!-- 空数据 -->
          <tr v-if="sortedData.length === 0" class="ex-table__empty-row">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="ex-table__empty-cell">
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
    <div v-if="loading" class="ex-table__loading">
      <div class="ex-table__loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import ExRadio from '../radio/ExRadio.vue';
import { computed, ref, watch } from 'vue';
import type {
  ExTableProps,
  ExTableEmits,
  ExTableExposed,
  TableColumn,
  TableDataItem,
  TableSortInfo,
} from './types';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExTable',
});

const props = withDefaults(defineProps<ExTableProps>(), {
  size: 'medium',
  bordered: false,
  striped: false,
  hoverable: true,
  loading: false,
  showHeader: true,
  rowKey: 'key',
  layout: 'table',
  selectable: false,
  selectionType: 'checkbox',
});

const emit = defineEmits<ExTableEmits>();

const tableRef = ref<HTMLDivElement>();
const { t } = useLocale('table');
const sortInfo = ref<TableSortInfo>({ key: '', order: null });

// 计算属性
const tableClasses = computed(() => {
  const classes = ['ex-table', `ex-table--${props.size}`, `ex-table--layout-${props.layout}`];

  if (props.bordered) classes.push('ex-table--bordered');
  if (props.striped) classes.push('ex-table--striped');
  if (props.hoverable) classes.push('ex-table--hoverable');
  if (props.loading) classes.push('ex-table--loading');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const tableStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const containerStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.maxHeight) {
    styles.maxHeight =
      typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    styles.overflowY = 'auto';
  }
  return styles;
});

const getHeaderCellClasses = (column: TableColumn) => {
  const classes = ['ex-table__header-cell'];
  if (column.align) classes.push(`ex-table__cell--${column.align}`);
  if (column.sortable) classes.push('ex-table__header-cell--sortable');
  if (column.fixed) classes.push(`ex-table__cell--fixed-${column.fixed}`);
  return classes;
};

const getBodyCellClasses = (column: TableColumn) => {
  const classes = ['ex-table__body-cell'];
  if (column.align) classes.push(`ex-table__cell--${column.align}`);
  if (column.fixed) classes.push(`ex-table__cell--fixed-${column.fixed}`);
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

// 找到最后一个没有指定宽度的列
const lastAutoWidthColumnIndex = computed(() => {
  for (let i = props.columns.length - 1; i >= 0; i--) {
    const column = props.columns[i];
    if (column && !column.width) {
      return i;
    }
  }
  return -1;
});

const getColumnStyle = (column: TableColumn, index?: number) => {
  const styles: Record<string, string> = {};
  if (column.width) {
    styles.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
  } else if (index === lastAutoWidthColumnIndex.value) {
    // 最后一个没有指定宽度的列，设置为 100% 以填充剩余空间
    styles.width = '100%';
  }
  if (column.minWidth) {
    styles.minWidth =
      typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth;
  }
  return styles;
};

const getRowKey = (record: TableDataItem, index: number): string | number => {
  const value = record[props.rowKey];
  return typeof value === 'string' || typeof value === 'number' ? value : index;
};

const getCellValue = (record: TableDataItem, column: TableColumn) => {
  if (column.render) {
    return column.render(record[column.dataIndex || column.key], record, 0);
  }
  return record[column.dataIndex || column.key];
};

const getSortOrder = (key: string) => {
  return sortInfo.value.key === key ? sortInfo.value.order : null;
};

// 排序数据
const sortedData = computed(() => {
  if (!sortInfo.value.key || !sortInfo.value.order) {
    return props.data;
  }

  const column = props.columns.find(col => col.key === sortInfo.value.key);
  if (!column) return props.data;

  const dataIndex = column.dataIndex || column.key;
  const sorted = [...props.data].sort((a, b) => {
    const aVal = a[dataIndex];
    const bVal = b[dataIndex];

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

  return sorted;
});

// ============================================================================
// 行选择 (Row Selection)
// ============================================================================

const sameKeys = (a: Array<string | number>, b: Array<string | number>) =>
  a.length === b.length && a.every((k, i) => k === b[i]);

// 内部维护选中 keys，初始化自 prop 并随 prop 变化同步（支持受控 v-model:selectedRowKeys）
const internalSelectedKeys = ref<Array<string | number>>([...(props.selectedRowKeys ?? [])]);
watch(
  () => props.selectedRowKeys,
  keys => {
    if (keys && !sameKeys(keys, internalSelectedKeys.value)) {
      internalSelectedKeys.value = [...keys];
    }
  }
);

const rowSelectable = (record: TableDataItem, index: number): boolean =>
  props.isRowSelectable ? props.isRowSelectable(record, index) : true;

const isRowSelected = (record: TableDataItem, index: number): boolean =>
  internalSelectedKeys.value.includes(getRowKey(record, index));

// 当前展示数据中「可选行」的 key 列表（全选/半选状态以此为准）
const selectableKeys = computed(() =>
  sortedData.value
    .filter((record, index) => rowSelectable(record, index))
    .map((record, index) => getRowKey(record, index))
);

const allSelected = computed(
  () =>
    selectableKeys.value.length > 0 &&
    selectableKeys.value.every(k => internalSelectedKeys.value.includes(k))
);

const someSelected = computed(
  () => !allSelected.value && selectableKeys.value.some(k => internalSelectedKeys.value.includes(k))
);

const selectedRowsData = computed(() =>
  props.data.filter((record, index) =>
    internalSelectedKeys.value.includes(getRowKey(record, index))
  )
);

const commitSelection = () => {
  emit('update:selectedRowKeys', [...internalSelectedKeys.value]);
  emit('selection-change', [...internalSelectedKeys.value], selectedRowsData.value);
};

const toggleRowSelection: ExTableExposed['toggleRowSelection'] = (record, selected) => {
  const dataIndex = props.data.indexOf(record);
  const idx = dataIndex < 0 ? 0 : dataIndex;
  if (!rowSelectable(record, idx)) return;

  const key = getRowKey(record, idx);
  const currentlySelected = internalSelectedKeys.value.includes(key);
  const next = selected ?? !currentlySelected;

  if (props.selectionType === 'radio') {
    if (next) internalSelectedKeys.value = [key];
    else if (currentlySelected) internalSelectedKeys.value = [];
    else return;
  } else if (next && !currentlySelected) {
    internalSelectedKeys.value = [...internalSelectedKeys.value, key];
  } else if (!next && currentlySelected) {
    internalSelectedKeys.value = internalSelectedKeys.value.filter(k => k !== key);
  } else {
    return; // 状态未变化
  }

  emit('select', record, next, selectedRowsData.value);
  commitSelection();
};

const toggleAllSelection: ExTableExposed['toggleAllSelection'] = () => {
  const shouldSelectAll = !allSelected.value;
  if (shouldSelectAll) {
    // 合并已有选中（保留不在当前可选列表中的 key），再加入全部可选行
    const merged = new Set(internalSelectedKeys.value);
    selectableKeys.value.forEach(k => merged.add(k));
    internalSelectedKeys.value = Array.from(merged);
  } else {
    const toRemove = new Set(selectableKeys.value);
    internalSelectedKeys.value = internalSelectedKeys.value.filter(k => !toRemove.has(k));
  }
  emit('select-all', shouldSelectAll, selectedRowsData.value);
  commitSelection();
};

const clearSelection: ExTableExposed['clearSelection'] = () => {
  if (internalSelectedKeys.value.length === 0) return;
  internalSelectedKeys.value = [];
  commitSelection();
};

// 事件处理
const handleHeaderClick = (column: TableColumn) => {
  if (!column.sortable) return;

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
