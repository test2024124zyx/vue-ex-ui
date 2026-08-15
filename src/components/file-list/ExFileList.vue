<template>
  <div
    ref="listRef"
    class="ex-file-list"
    :aria-busy="loading"
  >
    <div
      v-if="showToolbar"
      class="ex-file-list__toolbar"
    >
      <div class="ex-file-list__toolbar-left">
        <div
          v-if="showSearch"
          class="ex-file-list__search"
        >
          <ExInput
            :model-value="effectiveSearchValue"
            :placeholder="t('searchPlaceholder')"
            clearable
            @update:model-value="handleSearchInput"
          >
            <template #prefix>
              <ExIcon
                icon="search-line"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExInput>
        </div>

        <div
          v-if="showSort"
          class="ex-file-list__sort"
        >
          <ExSelect
            :model-value="effectiveSortField"
            :options="sortOptions"
            size="small"
            class="ex-file-list__sort-select"
            @update:model-value="handleSortFieldChange"
          />
          <ExButton
            size="small"
            class="ex-file-list__sort-order"
            :aria-label="effectiveSortOrder === 'asc' ? t('sortDescending') : t('sortAscending')"
            @click="toggleSortOrder"
          >
            <template #prefix>
              <ExIcon
                :icon="effectiveSortOrder === 'asc' ? 'sort-asc' : 'sort-desc'"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
        </div>
      </div>

      <div class="ex-file-list__toolbar-right">
        <div
          v-if="showViewSwitch"
          class="ex-file-list__view-switch"
        >
          <ExButton
            v-for="option in viewOptions"
            :key="option.value"
            size="small"
            class="ex-file-list__view-button"
            :type="effectiveViewMode === option.value ? 'primary' : 'default'"
            :aria-label="option.label"
            :aria-pressed="effectiveViewMode === option.value"
            @click="changeViewMode(option.value)"
          >
            <template #prefix>
              <ExIcon
                :icon="option.icon"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
        </div>

        <ExButton
          v-if="selectable && multiple"
          size="small"
          :aria-label="isAllVisibleSelected ? t('unselectVisible') : t('selectVisible')"
          @click="toggleVisibleSelection"
        >
          {{ isAllVisibleSelected ? t('unselectAll') : t('selectAll') }}
        </ExButton>
      </div>
    </div>

    <div
      v-if="loading"
      class="ex-file-list__loading"
      role="status"
      aria-live="polite"
    >
      <ExLoading
        :visible="true"
        :fullscreen="false"
        :mask="false"
        type="spinner"
        size="large"
      />
      <p>{{ t('loading') }}</p>
    </div>

    <ExEmpty
      v-else-if="activeRootEntries.length === 0"
      :description="emptyText ?? t('empty')"
    >
      <template #image>
        <ExIcon
          icon="folder-open-line"
          :size="64"
          aria-hidden="true"
        />
      </template>
    </ExEmpty>

    <div
      v-else
      :class="`ex-file-list__content ex-file-list__content--${effectiveViewMode}`"
    >
      <ul
        v-if="effectiveViewMode === 'list'"
        class="ex-file-list__list"
        :aria-label="t('listAria')"
      >
        <li
          v-for="file in paginatedFiles"
          :key="file.id"
          :class="['ex-file-list__list-item', { 'is-selected': isSelected(file.id) }]"
        >
          <input
            v-if="selectable"
            type="checkbox"
            class="ex-file-list__checkbox"
            :checked="isSelected(file.id)"
            :aria-label="t('selectFile', { name: file.name })"
            @change="handleSelectionInput(file, $event)"
          />
          <button
            type="button"
            class="ex-file-list__list-trigger"
            @click="handleClick(file)"
            @dblclick="handleDblClick(file)"
          >
            <span class="ex-file-list__list-item-icon">
              <img
                v-if="file.thumbUrl"
                :src="file.thumbUrl"
                alt=""
                aria-hidden="true"
                class="ex-file-list__thumbnail"
              />
              <ExIcon
                v-else
                :icon="getFileItemIcon(file)"
                :size="32"
                aria-hidden="true"
              />
            </span>
            <span class="ex-file-list__list-item-info">
              <span class="ex-file-list__list-item-name">{{ file.name }}</span>
              <span
                v-if="hasListMeta(file)"
                class="ex-file-list__list-item-meta"
              >
                <span v-if="showSize && !file.isDirectory">{{ formatSize(file.size) }}</span>
                <span v-if="showModifiedTime">{{ formatDate(file.modifiedTime) }}</span>
              </span>
            </span>
          </button>
          <div
            v-if="hasAvailableActions(file)"
            class="ex-file-list__list-item-actions"
          >
            <ExFileListActions
              :file="file"
              :previewable="previewable"
              :downloadable="downloadable"
              :deletable="deletable"
              @preview-request="requestPreview"
              @download-request="requestDownload"
              @delete-request="requestDelete"
            />
          </div>
        </li>
      </ul>

      <ul
        v-else-if="effectiveViewMode === 'grid'"
        class="ex-file-list__grid"
        :aria-label="t('gridAria')"
      >
        <li
          v-for="file in paginatedFiles"
          :key="file.id"
          :class="['ex-file-list__grid-item', { 'is-selected': isSelected(file.id) }]"
        >
          <input
            v-if="selectable"
            type="checkbox"
            class="ex-file-list__checkbox ex-file-list__checkbox--grid"
            :checked="isSelected(file.id)"
            :aria-label="t('selectFile', { name: file.name })"
            @change="handleSelectionInput(file, $event)"
          />
          <button
            type="button"
            class="ex-file-list__grid-trigger"
            @click="handleClick(file)"
            @dblclick="handleDblClick(file)"
          >
            <span class="ex-file-list__grid-item-preview">
              <img
                v-if="file.thumbUrl"
                :src="file.thumbUrl"
                alt=""
                aria-hidden="true"
                class="ex-file-list__grid-item-image"
              />
              <ExIcon
                v-else
                :icon="getFileItemIcon(file)"
                :size="48"
                class="ex-file-list__grid-item-icon"
                aria-hidden="true"
              />
            </span>
            <span class="ex-file-list__grid-item-name">{{ file.name }}</span>
            <span
              v-if="showSize && !file.isDirectory"
              class="ex-file-list__grid-item-size"
            >
              {{ formatSize(file.size) }}
            </span>
          </button>
          <div
            v-if="hasAvailableActions(file)"
            class="ex-file-list__grid-item-actions"
          >
            <ExFileListActions
              :file="file"
              :previewable="previewable"
              :downloadable="downloadable"
              :deletable="deletable"
              @preview-request="requestPreview"
              @download-request="requestDownload"
              @delete-request="requestDelete"
            />
          </div>
        </li>
      </ul>

      <div
        v-else-if="effectiveViewMode === 'tree'"
        class="ex-file-list__tree"
      >
        <ExTree
          :data="treeData"
          :expanded-keys="treeExpandedKeys"
          :selected-keys="selectable && !multiple ? effectiveSelectedIds : []"
          :checked-keys="selectable && multiple ? effectiveSelectedIds : []"
          :selectable="selectable && !multiple"
          :checkable="selectable && multiple"
          :check-strictly="true"
          :show-icon="true"
          @update:expanded-keys="handleExpandedKeysUpdate"
          @select="handleTreeSelect"
          @check="handleTreeCheck"
          @node-click="handleTreeNodeClick"
        >
          <template #default="{ node }">
            <span class="ex-file-list__tree-node">
              <span class="ex-file-list__tree-node-label">{{ node.label }}</span>
              <span
                v-if="hasTreeNodeActions(node)"
                class="ex-file-list__tree-node-actions"
              >
                <ExButton
                  v-if="canPreviewTreeNode(node)"
                  type="text"
                  size="small"
                  shape="circle"
                  class="ex-file-list__action-button"
                  :aria-label="t('previewFile', { name: node.label })"
                  @click.stop="requestTreePreview(node)"
                >
                  <template #prefix>
                    <ExIcon
                      icon="eye-line"
                      :size="16"
                      aria-hidden="true"
                    />
                  </template>
                </ExButton>
                <ExButton
                  v-if="canDownloadTreeNode(node)"
                  type="text"
                  size="small"
                  shape="circle"
                  class="ex-file-list__action-button"
                  :aria-label="t('downloadFile', { name: node.label })"
                  @click.stop="requestTreeDownload(node)"
                >
                  <template #prefix>
                    <ExIcon
                      icon="download-2-line"
                      :size="16"
                      aria-hidden="true"
                    />
                  </template>
                </ExButton>
                <ExButton
                  v-if="showActions && deletable"
                  type="text"
                  size="small"
                  shape="circle"
                  class="ex-file-list__action-button"
                  :aria-label="t('deleteFile', { name: node.label })"
                  @click.stop="requestTreeDelete(node)"
                >
                  <template #prefix>
                    <ExIcon
                      icon="delete-bin-line"
                      :size="16"
                      aria-hidden="true"
                    />
                  </template>
                </ExButton>
              </span>
            </span>
          </template>
        </ExTree>
      </div>

      <table
        v-else
        class="ex-file-list__table"
        :aria-label="t('tableAria')"
      >
        <thead>
          <tr>
            <th
              v-if="selectable"
              scope="col"
              class="ex-file-list__table-cell ex-file-list__table-cell--checkbox"
            >
              <input
                v-if="multiple"
                type="checkbox"
                class="ex-file-list__checkbox"
                :checked="isAllVisibleSelected"
                :indeterminate="isPartiallyVisibleSelected"
                :aria-label="isAllVisibleSelected ? t('unselectVisible') : t('selectVisible')"
                @change="handleVisibleSelectionInput"
              />
            </th>
            <th
              scope="col"
              class="ex-file-list__table-cell"
            >
              {{ t('name') }}
            </th>
            <th
              v-if="showSize"
              scope="col"
              class="ex-file-list__table-cell"
            >
              {{ t('size') }}
            </th>
            <th
              v-if="showType"
              scope="col"
              class="ex-file-list__table-cell"
            >
              {{ t('type') }}
            </th>
            <th
              v-if="showModifiedTime"
              scope="col"
              class="ex-file-list__table-cell"
            >
              {{ t('modifiedTime') }}
            </th>
            <th
              v-if="showActionColumn"
              scope="col"
              class="ex-file-list__table-cell ex-file-list__table-cell--actions"
            >
              {{ t('actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in paginatedFiles"
            :key="file.id"
            :class="['ex-file-list__table-row', { 'is-selected': isSelected(file.id) }]"
          >
            <td
              v-if="selectable"
              class="ex-file-list__table-cell ex-file-list__table-cell--checkbox"
            >
              <input
                type="checkbox"
                class="ex-file-list__checkbox"
                :checked="isSelected(file.id)"
                :aria-label="t('selectFile', { name: file.name })"
                @change="handleSelectionInput(file, $event)"
              />
            </td>
            <td class="ex-file-list__table-cell">
              <button
                type="button"
                class="ex-file-list__table-trigger"
                @click="handleClick(file)"
                @dblclick="handleDblClick(file)"
              >
                <img
                  v-if="file.thumbUrl"
                  :src="file.thumbUrl"
                  alt=""
                  aria-hidden="true"
                  class="ex-file-list__table-thumbnail"
                />
                <ExIcon
                  v-else
                  :icon="getFileItemIcon(file)"
                  :size="24"
                  aria-hidden="true"
                />
                <span>{{ file.name }}</span>
              </button>
            </td>
            <td
              v-if="showSize"
              class="ex-file-list__table-cell"
            >
              {{ file.isDirectory ? '-' : formatSize(file.size) }}
            </td>
            <td
              v-if="showType"
              class="ex-file-list__table-cell"
            >
              {{ formatType(file) }}
            </td>
            <td
              v-if="showModifiedTime"
              class="ex-file-list__table-cell"
            >
              {{ formatDate(file.modifiedTime) }}
            </td>
            <td
              v-if="showActionColumn"
              class="ex-file-list__table-cell ex-file-list__table-cell--actions"
            >
              <div
                v-if="hasAvailableActions(file)"
                class="ex-file-list__table-actions"
              >
                <ExFileListActions
                  :file="file"
                  :previewable="previewable"
                  :downloadable="downloadable"
                  :deletable="deletable"
                  @preview-request="requestPreview"
                  @download-request="requestDownload"
                  @delete-request="requestDelete"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!loading && showPagination && totalPages > 1"
      class="ex-file-list__pagination"
    >
      <ExPagination
        :current="normalizedCurrentPage"
        :total="activeRootEntries.length"
        :page-size="safePageSize"
        :show-total="true"
        :show-size-changer="false"
        @update:current="handlePageRequest"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { SelectOption, SelectValue } from '../select/types';
import type { TreeNode } from '../tree/types';
import type {
  ExFileListEmits,
  ExFileListExposed,
  ExFileListProps,
  FileItem,
  FileItemTime,
  SortField,
  SortOrder,
  ViewMode,
} from './types';
import ExButton from '../button/ExButton.vue';
import ExEmpty from '../empty/ExEmpty.vue';
import ExIcon from '../icon/ExIcon.vue';
import ExInput from '../input/ExInput.vue';
import ExLoading from '../loading/ExLoading.vue';
import ExPagination from '../pagination/ExPagination.vue';
import ExSelect from '../select/ExSelect.vue';
import ExTree from '../tree/ExTree.vue';
import ExFileListActions from './ExFileListActions.vue';
import { useControllableState } from '../../composables/useControllableState';
import { useLocale } from '../../locale';
import { formatFileSize } from '../../utils/format';
import { logger } from '../../utils/logger';
import {
  clampFileListPage,
  collectFileEntries,
  filterAndSortFileEntries,
  flattenFileEntries,
  getFileItemIcon,
  getFileItemTimestamp,
  normalizeFileListPageSize,
} from './file-list-utils';
import type { FileEntry } from './file-list-utils';

defineOptions({ name: 'ExFileList' });

const props = withDefaults(defineProps<ExFileListProps>(), {
  defaultViewMode: 'list',
  selectable: false,
  multiple: false,
  defaultSelectedIds: () => [],
  showToolbar: true,
  showSearch: true,
  defaultSearchValue: '',
  showSort: true,
  showViewSwitch: true,
  defaultSortField: 'name',
  defaultSortOrder: 'asc',
  showSize: true,
  showType: true,
  showModifiedTime: true,
  showActions: true,
  previewable: true,
  downloadable: true,
  deletable: true,
  loading: false,
  pageSize: 20,
  showPagination: false,
  defaultCurrentPage: 1,
});

const emit = defineEmits<ExFileListEmits>();
const { t, locale } = useLocale('fileList');
const listRef = ref<HTMLDivElement>();
const expandedFolderKeys = ref<string[]>([]);

const isViewMode = (value: unknown): value is ViewMode =>
  value === 'list' || value === 'grid' || value === 'table' || value === 'tree';
const isSortField = (value: unknown): value is SortField =>
  value === 'name' || value === 'size' || value === 'type' || value === 'modifiedTime';
const isSortOrder = (value: unknown): value is SortOrder => value === 'asc' || value === 'desc';

const viewState = useControllableState<ViewMode>({
  controlledValue: () => props.viewMode,
  defaultValue: () => (isViewMode(props.defaultViewMode) ? props.defaultViewMode : 'list'),
  onChange: value => emit('update:viewMode', value),
});
const sortFieldState = useControllableState<SortField>({
  controlledValue: () => props.sortField,
  defaultValue: () => (isSortField(props.defaultSortField) ? props.defaultSortField : 'name'),
  onChange: value => emit('update:sortField', value),
});
const sortOrderState = useControllableState<SortOrder>({
  controlledValue: () => props.sortOrder,
  defaultValue: () => (isSortOrder(props.defaultSortOrder) ? props.defaultSortOrder : 'asc'),
  onChange: value => emit('update:sortOrder', value),
});
const searchState = useControllableState<string>({
  controlledValue: () => props.searchValue,
  defaultValue: () => props.defaultSearchValue,
  onChange: value => emit('update:searchValue', value),
});
const selectionState = useControllableState<readonly string[]>({
  controlledValue: () => props.selectedIds,
  defaultValue: () => props.defaultSelectedIds,
  clone: value => [...value],
  onChange: value => emit('update:selectedIds', [...value]),
});
const pageState = useControllableState<number>({
  controlledValue: () => props.currentPage,
  defaultValue: () => props.defaultCurrentPage,
  onChange: value => emit('update:currentPage', value),
});

const effectiveViewMode = computed(() =>
  isViewMode(viewState.value.value) ? viewState.value.value : 'list'
);
const effectiveSortField = computed(() =>
  isSortField(sortFieldState.value.value) ? sortFieldState.value.value : 'name'
);
const effectiveSortOrder = computed(() =>
  isSortOrder(sortOrderState.value.value) ? sortOrderState.value.value : 'asc'
);
const effectiveSearchValue = computed(() => searchState.value.value);

const normalizeSelectedIds = (ids: readonly string[]): string[] => {
  const uniqueIds = [...new Set(ids.filter(id => typeof id === 'string' && id.length > 0))];
  return props.multiple ? uniqueIds : uniqueIds.slice(0, 1);
};
const effectiveSelectedIds = computed(() => normalizeSelectedIds(selectionState.value.value));
const selectedIdSet = computed(() => new Set(effectiveSelectedIds.value));

watch(
  () => props.multiple,
  () => {
    const currentIds = selectionState.value.value;
    const normalized = normalizeSelectedIds(currentIds);
    if (
      normalized.length !== currentIds.length ||
      normalized.some((id, index) => id !== currentIds[index])
    ) {
      // 模式收窄时提交规范化状态，避免重新开启多选后复活旧选择。
      selectionState.request(normalized);
    }
  }
);

const collection = computed(() => collectFileEntries(props.files));
watch(
  () => [collection.value.duplicateIds.join('\u0000'), collection.value.invalidItemCount] as const,
  ([duplicateIds, invalidCount]) => {
    if (duplicateIds) {
      logger.warn(`ExFileList 忽略了重复文件 ID：${duplicateIds.split('\u0000').join(', ')}`);
    }
    if (invalidCount > 0) {
      logger.warn(`ExFileList 忽略了 ${invalidCount} 个缺少有效 id 或 name 的数据项`);
    }
  },
  { immediate: true }
);

const flatEntries = computed(() =>
  filterAndSortFileEntries(collection.value.entries, {
    keyword: effectiveSearchValue.value,
    field: effectiveSortField.value,
    order: effectiveSortOrder.value,
    locale: locale.value,
    includeMatchingAncestors: false,
  })
);
const filteredTreeEntries = computed(() =>
  filterAndSortFileEntries(collection.value.entries, {
    keyword: effectiveSearchValue.value,
    field: effectiveSortField.value,
    order: effectiveSortOrder.value,
    locale: locale.value,
    includeMatchingAncestors: true,
  })
);
const activeRootEntries = computed(() =>
  effectiveViewMode.value === 'tree' ? filteredTreeEntries.value : flatEntries.value
);

const safePageSize = computed(() => normalizeFileListPageSize(props.pageSize));
const totalPages = computed(() =>
  props.showPagination
    ? Math.max(1, Math.ceil(activeRootEntries.value.length / safePageSize.value))
    : 1
);
const normalizedCurrentPage = computed(() =>
  props.showPagination ? clampFileListPage(pageState.value.value, totalPages.value) : 1
);

watch(
  [() => pageState.value.value, totalPages, () => props.showPagination],
  ([page, pages, paginationVisible]) => {
    if (!paginationVisible) return;
    const normalized = clampFileListPage(page, pages);
    if (!Object.is(normalized, page)) pageState.request(normalized);
  },
  { immediate: true }
);

const paginatedRootEntries = computed(() => {
  if (!props.showPagination) return activeRootEntries.value;
  const start = (normalizedCurrentPage.value - 1) * safePageSize.value;
  return activeRootEntries.value.slice(start, start + safePageSize.value);
});
const paginatedFiles = computed(() => paginatedRootEntries.value.map(entry => entry.file));

const toTreeNode = (entry: FileEntry): TreeNode => ({
  key: entry.file.id,
  label: entry.file.name,
  icon: getFileItemIcon(entry.file),
  children: entry.children.length > 0 ? entry.children.map(toTreeNode) : undefined,
  isLeaf: entry.children.length === 0,
  data: entry.file,
});
const treeData = computed(() => paginatedRootEntries.value.map(toTreeNode));

const searchableExpandedKeys = computed(() => {
  if (!effectiveSearchValue.value.trim()) return [];
  const keys: string[] = [];
  const visit = (entries: readonly FileEntry[]) => {
    for (const entry of entries) {
      if (entry.children.length > 0) {
        keys.push(entry.file.id);
        visit(entry.children);
      }
    }
  };
  visit(paginatedRootEntries.value);
  return keys;
});
const treeExpandedKeys = computed(() => [
  ...new Set([...expandedFolderKeys.value, ...searchableExpandedKeys.value]),
]);

const visibleSelectionFiles = computed(() =>
  effectiveViewMode.value === 'tree'
    ? flattenFileEntries(paginatedRootEntries.value)
    : paginatedFiles.value
);
const isAllVisibleSelected = computed(
  () =>
    visibleSelectionFiles.value.length > 0 &&
    visibleSelectionFiles.value.every(file => selectedIdSet.value.has(file.id))
);
const isPartiallyVisibleSelected = computed(() => {
  if (isAllVisibleSelected.value) return false;
  return visibleSelectionFiles.value.some(file => selectedIdSet.value.has(file.id));
});
const showActionColumn = computed(() => paginatedFiles.value.some(hasAvailableActions));

const sortOptions = computed<SelectOption[]>(() => [
  { value: 'name', label: t('name') },
  { value: 'size', label: t('size') },
  { value: 'type', label: t('type') },
  { value: 'modifiedTime', label: t('modifiedTime') },
]);
const viewOptions = computed(() => [
  { value: 'list' as const, label: t('list'), icon: 'list-check' },
  { value: 'grid' as const, label: t('grid'), icon: 'grid-line' },
  { value: 'table' as const, label: t('table'), icon: 'table-line' },
  { value: 'tree' as const, label: t('tree'), icon: 'node-tree' },
]);

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
);

function hasAvailableActions(file: FileItem): boolean {
  if (!props.showActions) return false;
  return Boolean(
    props.deletable || (!file.isDirectory && (props.previewable || props.downloadable))
  );
}

const hasListMeta = (file: FileItem): boolean =>
  Boolean((props.showSize && !file.isDirectory) || props.showModifiedTime);
const isSelected = (id: string): boolean => selectedIdSet.value.has(id);
const formatSize = (size: number | undefined): string =>
  size !== undefined && Number.isFinite(size) && size >= 0 ? formatFileSize(size) : '-';
const formatDate = (value: FileItemTime | undefined): string => {
  const timestamp = getFileItemTimestamp(value);
  return timestamp === null ? '-' : dateFormatter.value.format(timestamp);
};
const formatType = (file: FileItem): string => {
  if (file.isDirectory) return t('folder');
  const type = file.type?.trim();
  return type || '-';
};

const requestPageReset = () => {
  if (pageState.value.value !== 1) pageState.request(1);
};
const handleSearchInput = (value: string | number) => {
  const nextValue = String(value);
  searchState.request(nextValue);
  emit('search', nextValue);
  requestPageReset();
};
const handleSortFieldChange = (value: SelectValue) => {
  if (!isSortField(value)) return;
  sortFieldState.request(value);
  emit('sort', value, effectiveSortOrder.value);
  requestPageReset();
};
const toggleSortOrder = () => {
  const nextOrder: SortOrder = effectiveSortOrder.value === 'asc' ? 'desc' : 'asc';
  sortOrderState.request(nextOrder);
  emit('sort', effectiveSortField.value, nextOrder);
  requestPageReset();
};
const changeViewMode = (mode: ViewMode) => {
  if (mode === effectiveViewMode.value) return;
  viewState.request(mode);
  requestPageReset();
};
const handlePageRequest = (page: number) => {
  const normalized = clampFileListPage(page, totalPages.value);
  if (normalized === normalizedCurrentPage.value) return;
  pageState.request(normalized);
  emit('page-change', normalized);
};

const requestSelection = (file: FileItem, selected: boolean) => {
  if (!props.selectable) return;
  const currentIds = effectiveSelectedIds.value;
  const nextIds = selected
    ? props.multiple
      ? [...currentIds.filter(id => id !== file.id), file.id]
      : [file.id]
    : currentIds.filter(id => id !== file.id);
  const normalized = normalizeSelectedIds(nextIds);
  selectionState.request(normalized);
  emit('selection-request', file, selected, [...normalized]);
};
const handleSelectionInput = (file: FileItem, event: Event) => {
  const input = event.currentTarget as HTMLInputElement;
  requestSelection(file, input.checked);
  nextTick(() => {
    input.checked = isSelected(file.id);
  });
};
const toggleVisibleSelection = () => {
  if (!props.selectable || !props.multiple || visibleSelectionFiles.value.length === 0) return;
  const visibleIds = new Set(visibleSelectionFiles.value.map(file => file.id));
  const nextIds = isAllVisibleSelected.value
    ? effectiveSelectedIds.value.filter(id => !visibleIds.has(id))
    : [
        ...effectiveSelectedIds.value,
        ...[...visibleIds].filter(id => !selectedIdSet.value.has(id)),
      ];
  selectionState.request(normalizeSelectedIds(nextIds));
};
const handleVisibleSelectionInput = (event: Event) => {
  const input = event.currentTarget as HTMLInputElement;
  toggleVisibleSelection();
  nextTick(() => {
    input.checked = isAllVisibleSelected.value;
    input.indeterminate = isPartiallyVisibleSelected.value;
  });
};

const resolveTreeFile = (node: TreeNode): FileItem | null => {
  const file = node.data;
  return file && typeof file === 'object' && 'id' in file ? (file as FileItem) : null;
};
const handleTreeSelect = (_keys: string[], node: TreeNode, selected: boolean) => {
  const file = resolveTreeFile(node);
  if (file) requestSelection(file, selected);
};
const handleTreeCheck = (_keys: string[], node: TreeNode, checked: boolean) => {
  const file = resolveTreeFile(node);
  if (file) requestSelection(file, checked);
};
const handleTreeNodeClick = (node: TreeNode) => {
  const file = resolveTreeFile(node);
  if (file) emit('click', file);
};
const handleExpandedKeysUpdate = (keys: string[]) => {
  expandedFolderKeys.value = [...keys];
};

const canPreviewTreeNode = (node: TreeNode): boolean => {
  const file = resolveTreeFile(node);
  return Boolean(props.showActions && props.previewable && file && !file.isDirectory);
};
const canDownloadTreeNode = (node: TreeNode): boolean => {
  const file = resolveTreeFile(node);
  return Boolean(props.showActions && props.downloadable && file && !file.isDirectory);
};
const hasTreeNodeActions = (node: TreeNode): boolean =>
  Boolean(
    canPreviewTreeNode(node) || canDownloadTreeNode(node) || (props.showActions && props.deletable)
  );

const handleClick = (file: FileItem) => emit('click', file);
const handleDblClick = (file: FileItem) => emit('dblclick', file);
const requestPreview = (file: FileItem) => emit('preview-request', file);
const requestDownload = (file: FileItem) => emit('download-request', file);
const requestDelete = (file: FileItem) => emit('delete-request', file);
const requestTreePreview = (node: TreeNode) => {
  const file = resolveTreeFile(node);
  if (file && !file.isDirectory) requestPreview(file);
};
const requestTreeDownload = (node: TreeNode) => {
  const file = resolveTreeFile(node);
  if (file && !file.isDirectory) requestDownload(file);
};
const requestTreeDelete = (node: TreeNode) => {
  const file = resolveTreeFile(node);
  if (file) requestDelete(file);
};

const getSelectedFiles = (): FileItem[] =>
  flattenFileEntries(collection.value.entries).filter(file => selectedIdSet.value.has(file.id));
const getElement = () => listRef.value ?? null;

defineExpose<ExFileListExposed>({ getSelectedFiles, getElement });
</script>

<style scoped lang="scss" src="./ExFileList.scss"></style>
