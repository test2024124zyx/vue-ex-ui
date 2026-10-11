<template>
  <div
    ref="tableRef"
    :class="tableClasses"
    :style="tableStyles"
  >
    <div
      ref="containerRef"
      class="ex-table__container"
      :style="containerStyle"
      @scroll.passive="handleVirtualScroll"
    >
      <table
        class="ex-table__main"
        :aria-busy="loading || undefined"
        :aria-rowcount="virtual ? ariaRows.total + (showHeader ? headerDepth : 0) : undefined"
      >
        <thead
          v-if="showHeader"
          class="ex-table__header"
        >
          <tr
            v-for="(headerRow, rowIndex) in headerRows"
            :key="rowIndex"
          >
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
              v-if="hasDetails && rowIndex === 0"
              class="ex-table__detail-column"
              :rowspan="headerDepth"
              scope="col"
            >
              <span class="ex-table__sr-only">{{ t('expand') }}</span>
            </th>
            <th
              v-for="headerCell in headerRow"
              :key="headerCell.path"
              :data-column-key="headerCell.column.key"
              :data-column-managed-width="hasManagedWidth(headerCell.column) ? '' : undefined"
              :class="getCellClasses(headerCell.column, true, headerCell.isLeaf)"
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
                <span class="ex-table__sort-icon">
                  <ExIcon
                    :icon="
                      getSortOrder(headerCell.column.key) === 'asc'
                        ? 'arrow-up-line'
                        : getSortOrder(headerCell.column.key) === 'desc'
                          ? 'arrow-down-line'
                          : 'arrow-up-down-line'
                    "
                    :size="14"
                    :style="getSortOrder(headerCell.column.key) ? undefined : { opacity: 0.3 }"
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
              <ExTableColumnControls
                v-if="
                  headerCell.isLeaf &&
                  (canResize(headerCell.column) || canReorder(headerCell.column))
                "
                :column="headerCell.column"
                :width="getColumnWidth(headerCell.column)"
                :resizable="canResize(headerCell.column)"
                :reorderable="canReorder(headerCell.column)"
                :resizing="resizingKey === headerCell.column.key"
                :disabled="loading"
                @resize-start="startResize"
                @resize-cancel="cancelResize"
                @resize="width => resizeColumn(headerCell.column.key, width)"
                @move="
                  direction =>
                    moveColumnByOffset(headerCell.column.key, direction === 'before' ? -1 : 1)
                "
                @drop="(source, position) => moveColumn(source, headerCell.column.key, position)"
              />
            </th>
            <th
              v-if="editable && rowIndex === 0"
              class="ex-table__actions-column"
              :rowspan="headerDepth"
              scope="col"
            >
              {{ t('edit') }}
            </th>
          </tr>
        </thead>
        <tbody class="ex-table__body">
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
          <template
            v-for="row in renderRows"
            :key="row.key"
          >
            <tr
              :ref="element => setRowRef(row.key, element)"
              :class="getRowClasses(row.record, row.sourceIndex)"
              :style="
                useVirtual && !dynamicRows ? { height: `${normalizedRowHeight}px` } : undefined
              "
              :aria-rowindex="
                virtual
                  ? ariaRows.positions[row.index]! + (showHeader ? headerDepth : 0)
                  : undefined
              "
              @click="handleRowClick(row.record, row.index, $event)"
            >
              <td
                v-if="selectable"
                class="ex-table__selection-column"
                @click.stop
              >
                <div class="ex-table__cell ex-table__cell--center">
                  <ExCheckbox
                    v-if="selectionType === 'checkbox'"
                    :model-value="isRowSelected(row.record, row.sourceIndex)"
                    :disabled="loading || !rowSelectable(row.record, row.sourceIndex)"
                    :aria-label="t('selectRowAria', { index: row.index + 1 })"
                    @update:model-value="
                      value =>
                        toggleRowSelectionAtIndex(row.record, row.sourceIndex, value === true)
                    "
                  />
                  <ExRadio
                    v-else
                    :model-value="isRowSelected(row.record, row.sourceIndex)"
                    :value="true"
                    :disabled="loading || !rowSelectable(row.record, row.sourceIndex)"
                    :aria-label="t('selectRowAria', { index: row.index + 1 })"
                    @update:model-value="
                      toggleRowSelectionAtIndex(row.record, row.sourceIndex, true)
                    "
                  />
                </div>
              </td>
              <td
                v-if="hasDetails"
                class="ex-table__detail-column"
                @click.stop
              >
                <button
                  v-if="canExpandDetails(row)"
                  type="button"
                  class="ex-table__detail-toggle"
                  :disabled="loading"
                  :aria-expanded="isDetailExpanded(row)"
                  :aria-label="isDetailExpanded(row) ? t('collapse') : t('expand')"
                  @click="toggleExpansion(row, undefined, true)"
                >
                  <ExIcon
                    :icon="isDetailExpanded(row) ? 'subtract-line' : 'add-line'"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
              </td>
              <template
                v-for="{ column, classes, style, columnIndex } in bodyColumns"
                :key="column.key"
              >
                <td
                  v-if="getSpan(row.index, columnIndex).rowspan > 0"
                  :class="classes"
                  :style="style"
                  :rowspan="
                    getSpan(row.index, columnIndex).rowspan > 1
                      ? getSpan(row.index, columnIndex).rowspan
                      : undefined
                  "
                  :colspan="
                    getSpan(row.index, columnIndex).colspan > 1
                      ? getSpan(row.index, columnIndex).colspan
                      : undefined
                  "
                  :data-label="column.title"
                  :title="getCellTitle(row.record, column, row.index)"
                >
                  <!-- 普通文本保留轻量路径，只有复杂内容才创建内容组件。 -->
                  <div
                    class="ex-table__cell"
                    :style="
                      tree && columnIndex === 0
                        ? { paddingInlineStart: `${row.depth * normalizedIndent}px` }
                        : undefined
                    "
                  >
                    <template v-if="tree && columnIndex === 0">
                      <button
                        v-if="row.children.length"
                        type="button"
                        class="ex-table__tree-toggle"
                        :disabled="loading"
                        :aria-expanded="expandedKeys.has(row.key)"
                        :aria-label="expandedKeys.has(row.key) ? t('collapse') : t('expand')"
                        @click.stop="toggleExpansion(row)"
                      >
                        <ExIcon
                          :icon="
                            expandedKeys.has(row.key) ? 'arrow-down-s-line' : 'arrow-right-s-line'
                          "
                          :size="16"
                          aria-hidden="true"
                        />
                      </button>
                      <span
                        v-else
                        class="ex-table__tree-indent"
                        aria-hidden="true"
                      />
                    </template>
                    <slot
                      v-if="
                        getEditState(row.record, row.sourceIndex) &&
                        canEditCell(row.record, column, row.sourceIndex)
                      "
                      :name="`edit-${column.key}`"
                      :record="row.record"
                      :index="row.index"
                      :column="column"
                      :draft="getEditState(row.record, row.sourceIndex)!.draft"
                      :value="
                        getEditState(row.record, row.sourceIndex)!.draft[
                          column.dataIndex || column.key
                        ]
                      "
                      :update="
                        (value: unknown) => setEditValue(row.record, row.sourceIndex, column, value)
                      "
                      :errors="getEditState(row.record, row.sourceIndex)!.errors"
                      :saving="getEditState(row.record, row.sourceIndex)!.saving"
                    >
                      <ExTableEditCell
                        :column="column"
                        :value="
                          getEditState(row.record, row.sourceIndex)!.draft[
                            column.dataIndex || column.key
                          ]
                        "
                        :error="
                          getEditState(row.record, row.sourceIndex)!.errors[
                            column.dataIndex || column.key
                          ]
                        "
                        :disabled="loading || getEditState(row.record, row.sourceIndex)!.saving"
                        @update:value="
                          value => setEditValue(row.record, row.sourceIndex, column, value)
                        "
                        @cancel="cancelRowEdit(row.record, row.sourceIndex)"
                      />
                    </slot>
                    <template
                      v-else-if="
                        !$slots[column.slot || `cell-${column.key}`] &&
                        isTextContent(getCellValue(row.record, column, row.index))
                      "
                    >
                      {{ getCellValue(row.record, column, row.index) }}
                    </template>
                    <slot
                      v-else
                      :name="column.slot || `cell-${column.key}`"
                      :record="row.record"
                      :value="getCellValue(row.record, column, row.index)"
                      :index="row.index"
                      :column="column"
                      :draft="getEditState(row.record, row.sourceIndex)?.draft ?? row.record"
                      :update="
                        (value: unknown) => setEditValue(row.record, row.sourceIndex, column, value)
                      "
                      :errors="getEditState(row.record, row.sourceIndex)?.errors ?? {}"
                      :saving="getEditState(row.record, row.sourceIndex)?.saving ?? false"
                    >
                      <CellContent :value="getCellValue(row.record, column, row.index)" />
                    </slot>
                  </div>
                </td>
              </template>
              <td
                v-if="editable"
                class="ex-table__actions-column"
                @click.stop
              >
                <ExTableRowActions
                  :editing="Boolean(getEditState(row.record, row.sourceIndex))"
                  :saving="getEditState(row.record, row.sourceIndex)?.saving ?? false"
                  :disabled="loading || !canEditRow(row.record, row.sourceIndex)"
                  :error="getEditState(row.record, row.sourceIndex)?.errors.$row"
                  @edit="startRowEdit(row.record, row.sourceIndex)"
                  @save="saveRowEdit(row.record, row.sourceIndex)"
                  @cancel="cancelRowEdit(row.record, row.sourceIndex)"
                />
              </td>
            </tr>
            <tr
              v-if="isDetailExpanded(row)"
              :ref="element => setDetailRef(row.key, element)"
              class="ex-table__expanded-row"
              :aria-rowindex="
                virtual
                  ? ariaRows.positions[row.index]! + 1 + (showHeader ? headerDepth : 0)
                  : undefined
              "
            >
              <td
                :colspan="totalColspan"
                class="ex-table__expanded-cell"
              >
                <div class="ex-table__expanded-content">
                  <slot
                    name="expanded-row"
                    :record="row.record"
                    :index="row.index"
                  />
                </div>
              </td>
            </tr>
          </template>
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
          <tr
            v-if="!loading && visibleRows.length === 0"
            class="ex-table__empty-row"
          >
            <td
              :colspan="totalColspan"
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
    <div
      v-if="paginationConfig"
      class="ex-table__pagination"
    >
      <ExPagination
        v-bind="paginationConfig"
        :current="current"
        :page-size="pageSize"
        :total="total"
        :disabled="loading || paginationConfig.disabled"
        @change="changePage"
      />
    </div>
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
import { computed, ref, isVNode, toDisplayString, useSlots } from 'vue';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import ExRadio from '../radio/ExRadio.vue';
import ExPagination from '../pagination/ExPagination.vue';
import ExTableEditCell from './ExTableEditCell.vue';
import ExTableRowActions from './ExTableRowActions.vue';
import ExTableColumnControls from './ExTableColumnControls.vue';
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
import { useTableColumns, getFixedSide } from './use-table-columns';
import { useTableRows, DEFAULT_TREE_INDENT } from './use-table-rows';
import { useTableSelection } from './use-table-selection';
import { useTableSpans } from './use-table-spans';
import { useTableVirtual, DEFAULT_ROW_HEIGHT, DEFAULT_VIRTUAL_BUFFER } from './use-table-virtual';
import { useTableEditing } from './use-table-editing';
import { useTableColumnInteractions } from './use-table-column-interactions';

defineOptions({ name: 'ExTable' });
const props = withDefaults(defineProps<ExTableProps>(), {
  immutable: false,
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
  rowHeight: DEFAULT_ROW_HEIGHT,
  virtualBuffer: DEFAULT_VIRTUAL_BUFFER,
  tree: false,
  childrenKey: 'children',
  treeIndent: DEFAULT_TREE_INDENT,
  remotePagination: false,
});
const emit = defineEmits<ExTableEmits>();
const slots = useSlots();
const tableRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const { t } = useLocale('table');
const componentSize = useComponentSize(computed(() => props.size));
const hasDetails = computed(() => Boolean(slots['expanded-row']));
const normalizedIndent = computed(() =>
  Number.isFinite(props.treeIndent) && props.treeIndent >= 0
    ? props.treeIndent
    : DEFAULT_TREE_INDENT
);
// 对象和数组仍由内容组件追踪深层更新，避免扩大普通表格的渲染范围。
const isTextContent = (value: unknown) => value === null || typeof value !== 'object';
const CellContent = ({ value }: { value: unknown }) =>
  isVNode(value)
    ? value
    : Array.isArray(value) && value.every(isVNode)
      ? value
      : toDisplayString(value);
const sortInfo = ref<TableSortInfo>({ key: '', order: null });
const {
  effectiveColumns,
  getColumnWidth,
  hasManagedWidth,
  canResize,
  canReorder,
  resizeColumn,
  moveColumn,
  moveColumnByOffset,
  startResize,
  resizingKey,
  cancelResize,
} = useTableColumnInteractions(props, emit, tableRef);
const { leafColumns, headerDepth, headerRows, getColumnStyle } = useTableColumns(
  effectiveColumns,
  getColumnWidth,
  hasManagedWidth
);
const {
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
} = useTableRows(props, emit, leafColumns, sortInfo, () => hasDetails.value);
const {
  rowSelectable,
  isRowSelected,
  selectableKeys,
  allSelected,
  someSelected,
  toggleRowSelectionAtIndex,
  toggleRowSelection,
  toggleAllSelection,
  clearSelection,
} = useTableSelection(props, emit, allSourceRows, visibleRows, getRowKey);
const {
  getEditState,
  canEditRow,
  canEditCell,
  startRowEdit,
  setEditValue,
  saveRowEdit,
  cancelRowEdit,
} = useTableEditing(props, emit, allSourceRows, getRowKey);
const { getSpan, extendRange } = useTableSpans(
  props,
  visibleRows,
  leafColumns,
  isDetailExpanded,
  row => Boolean(getEditState(row.record, row.sourceIndex)),
  errors => emit('span-error', errors)
);
const {
  useVirtual,
  dynamicRows,
  normalizedRowHeight,
  viewportHeight,
  renderRows,
  topSpacerHeight,
  bottomSpacerHeight,
  handleVirtualScroll,
  setDetailRef,
  setRowRef,
} = useTableVirtual(props, visibleRows, containerRef, isDetailExpanded, extendRange);
const { getCellValue, revision: cellRevision } = useTableCells(
  () => props.data,
  () => props.immutable
);
const ariaRows = computed(() => {
  const positions: number[] = [];
  let total = 0;
  for (const row of visibleRows.value) {
    positions.push(++total);
    if (isDetailExpanded(row)) total += 1;
  }
  return { positions, total };
});
const tableClasses = computed(() => [
  'ex-table',
  `ex-table--${componentSize.value}`,
  `ex-table--layout-${props.layout}`,
  {
    'ex-table--bordered': props.bordered,
    'ex-table--striped': props.striped,
    'ex-table--hoverable': props.hoverable,
    'ex-table--loading': props.loading,
    'ex-table--virtual': props.virtual,
    'ex-table--dynamic-rows': dynamicRows.value,
  },
  ...normalizeCustomClass(props.class),
]);
const tableStyles = computed(() => [
  props.virtual ? { '--ex-table-row-height': `${normalizedRowHeight.value}px` } : {},
  props.style,
]);
const containerStyle = computed(() =>
  props.virtual
    ? { height: `${viewportHeight.value}px`, overflowY: 'auto' as const }
    : props.maxHeight
      ? {
          maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
        }
      : {}
);
const totalColspan = computed(() =>
  Math.max(
    1,
    leafColumns.value.length +
      Number(props.selectable) +
      Number(hasDetails.value) +
      Number(Boolean(props.editable))
  )
);
const getCellClasses = (column: TableColumn, header = false, leaf = true) => [
  header ? 'ex-table__header-cell' : 'ex-table__body-cell',
  {
    [`ex-table__cell--${column.align}`]: Boolean(column.align),
    'ex-table__header-cell--sortable': header && leaf && column.sortable,
    [`ex-table__cell--fixed-${getFixedSide(column)}`]: Boolean(getFixedSide(column)),
    'ex-table__cell--ellipsis': column.ellipsis,
  },
  header ? column.headerClassName : column.className,
];
const bodyColumns = computed(() => {
  void cellRevision.value;
  return leafColumns.value.map((column, columnIndex) => ({
    column,
    columnIndex,
    classes: getCellClasses(column),
    style: getColumnStyle(column, columnIndex),
  }));
});
const getRowClasses = (record: TableDataItem, index: number) => [
  'ex-table__row',
  {
    'ex-table__row--striped': props.striped && index % 2 === 1,
    'ex-table__row--selected': props.selectable && isRowSelected(record, index),
  },
];
const getCellTitle = (record: TableDataItem, column: TableColumn, index: number) => {
  if (!column.ellipsis) return undefined;
  const value = getCellValue(record, column, index);
  return value == null || typeof value === 'object' ? undefined : String(value);
};
const getSortOrder = (key: string) => (sortInfo.value.key === key ? sortInfo.value.order : null);
const getAriaSort = (key: string) =>
  getSortOrder(key) === 'asc' ? 'ascending' : getSortOrder(key) === 'desc' ? 'descending' : 'none';
const handleHeaderClick = (column: TableColumn) => {
  if (props.loading || !column.sortable) return;
  const order = getSortOrder(column.key);
  sortInfo.value =
    order === 'desc'
      ? { key: '', order: null }
      : { key: column.key, order: order === 'asc' ? 'desc' : 'asc' };
  emit('sort-change', { ...sortInfo.value });
};
const handleRowClick = (record: TableDataItem, index: number, event: MouseEvent) => {
  if (!props.loading) emit('row-click', record, index, event);
};
const getElement = () => tableRef.value ?? null;
const clearSort = () => {
  sortInfo.value = { key: '', order: null };
};
defineExpose<ExTableExposed>({
  getElement,
  clearSort,
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  toggleRowExpansion,
  toggleDetailExpansion,
  getEditState,
  startRowEdit,
  setEditValue,
  saveRowEdit,
  cancelRowEdit,
  resizeColumn,
  moveColumn,
  moveColumnByOffset,
  cancelResize,
});
</script>

<style scoped lang="scss" src="./ExTable.scss"></style>
