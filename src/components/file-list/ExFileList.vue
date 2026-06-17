<template>
  <div
    ref="listRef"
    class="ex-file-list"
  >
    <!-- 工具栏 -->
    <div
      v-if="showToolbar"
      class="ex-file-list__toolbar"
    >
      <div class="ex-file-list__toolbar-left">
        <!-- 搜索 -->
        <div
          v-if="showSearch"
          class="ex-file-list__search"
        >
          <ExInput
            v-model="searchKeyword"
            :placeholder="t('fileList.searchPlaceholder')"
            clearable
            @input="handleSearch"
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

        <!-- 排序 -->
        <div
          v-if="showSort"
          class="ex-file-list__sort"
        >
          <ExSelect
            v-model="currentSortField"
            :options="sortOptions"
            size="small"
            style="width: 120px"
            @change="handleSort"
          />
          <ExButton
            size="small"
            @click="toggleSortOrder"
          >
            <template #prefix>
              <ExIcon
                v-if="currentSortOrder === 'asc'"
                icon="sort-asc"
                :size="16"
                aria-hidden="true"
              />
              <ExIcon
                v-else
                icon="sort-desc"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
        </div>
      </div>

      <div class="ex-file-list__toolbar-right">
        <!-- 视图切换 -->
        <div
          v-if="showViewSwitch"
          class="ex-file-list__view-switch"
        >
          <ExButton
            size="small"
            :type="currentViewMode === 'list' ? 'primary' : 'default'"
            @click="changeViewMode('list')"
          >
            <template #prefix>
              <ExIcon
                icon="list-check"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
          <ExButton
            size="small"
            :type="currentViewMode === 'grid' ? 'primary' : 'default'"
            @click="changeViewMode('grid')"
          >
            <template #prefix>
              <ExIcon
                icon="grid-line"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
          <ExButton
            size="small"
            :type="currentViewMode === 'table' ? 'primary' : 'default'"
            @click="changeViewMode('table')"
          >
            <template #prefix>
              <ExIcon
                icon="table-line"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
          <ExButton
            size="small"
            :type="currentViewMode === 'tree' ? 'primary' : 'default'"
            @click="changeViewMode('tree')"
          >
            <template #prefix>
              <ExIcon
                icon="node-tree"
                :size="16"
                aria-hidden="true"
              />
            </template>
          </ExButton>
        </div>

        <!-- 全选 -->
        <ExButton
          v-if="selectable && multiple"
          size="small"
          @click="toggleSelectAll"
        >
          {{ isAllSelected ? t('fileList.unselectAll') : t('fileList.selectAll') }}
        </ExButton>
      </div>
    </div>

    <!-- 文件列表内容 -->
    <div
      v-if="loading"
      class="ex-file-list__loading"
    >
      <ExLoading
        :visible="true"
        :fullscreen="false"
        :mask="false"
        type="spinner"
        size="large"
      />
      <p>{{ t('fileList.loading') }}</p>
    </div>

    <ExEmpty
      v-else-if="displayFiles.length === 0"
      :description="emptyText || t('fileList.empty')"
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
      :class="`ex-file-list__content ex-file-list__content--${currentViewMode}`"
    >
      <!-- 列表视图 -->
      <div
        v-if="currentViewMode === 'list'"
        class="ex-file-list__list"
      >
        <div
          v-for="file in paginatedFiles"
          :key="file.id"
          :class="['ex-file-list__list-item', { 'is-selected': isSelected(file.id) }]"
          role="button"
          tabindex="0"
          :aria-label="file.name"
          @click="handleClick(file)"
          @dblclick="handleDblClick(file)"
          @keydown="handleItemKeydown(file, $event)"
        >
          <div class="ex-file-list__list-item-left">
            <input
              v-if="selectable"
              type="checkbox"
              :checked="isSelected(file.id)"
              class="ex-file-list__checkbox"
              @click.stop="handleSelect(file)"
            >
            <div class="ex-file-list__list-item-icon">
              <img
                v-if="file.thumbUrl"
                :src="file.thumbUrl"
                :alt="file.name"
                class="ex-file-list__thumbnail"
              >
              <ExIcon
                v-else
                :icon="getFileIcon(file)"
                :size="32"
                aria-hidden="true"
              />
            </div>
            <div class="ex-file-list__list-item-info">
              <div class="ex-file-list__list-item-name">
                {{ file.name }}
              </div>
              <div class="ex-file-list__list-item-meta">
                <span v-if="showSize && !file.isDirectory">{{ formatBytes(file.size) }}</span>
                <span v-if="showModifiedTime && file.modifiedTime">
                  {{ formatDate(file.modifiedTime) }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="showActions"
            class="ex-file-list__list-item-actions"
          >
            <button
              v-if="previewable"
              class="ex-file-list__action-btn"
              @click.stop="handlePreview(file)"
            >
              <ExIcon
                icon="eye-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
            <button
              v-if="downloadable"
              class="ex-file-list__action-btn"
              @click.stop="handleDownload(file)"
            >
              <ExIcon
                icon="download-2-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
            <button
              v-if="deletable"
              class="ex-file-list__action-btn"
              @click.stop="handleDelete(file)"
            >
              <ExIcon
                icon="delete-bin-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 网格视图 -->
      <div
        v-else-if="currentViewMode === 'grid'"
        class="ex-file-list__grid"
      >
        <div
          v-for="file in paginatedFiles"
          :key="file.id"
          :class="['ex-file-list__grid-item', { 'is-selected': isSelected(file.id) }]"
          role="button"
          tabindex="0"
          :aria-label="file.name"
          @click="handleClick(file)"
          @dblclick="handleDblClick(file)"
          @keydown="handleItemKeydown(file, $event)"
        >
          <input
            v-if="selectable"
            type="checkbox"
            :checked="isSelected(file.id)"
            class="ex-file-list__checkbox ex-file-list__checkbox--grid"
            @click.stop="handleSelect(file)"
          >
          <div class="ex-file-list__grid-item-preview">
            <img
              v-if="file.thumbUrl"
              :src="file.thumbUrl"
              :alt="file.name"
              class="ex-file-list__grid-item-image"
            >
            <ExIcon
              v-else
              :icon="getFileIcon(file)"
              :size="48"
              class="ex-file-list__grid-item-icon"
              aria-hidden="true"
            />
          </div>
          <div class="ex-file-list__grid-item-name">
            {{ file.name }}
          </div>
          <div
            v-if="showSize && !file.isDirectory"
            class="ex-file-list__grid-item-size"
          >
            {{ formatBytes(file.size) }}
          </div>
          <div
            v-if="showActions"
            class="ex-file-list__grid-item-actions"
          >
            <button
              v-if="previewable"
              class="ex-file-list__action-btn"
              @click.stop="handlePreview(file)"
            >
              <ExIcon
                icon="eye-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
            <button
              v-if="downloadable"
              class="ex-file-list__action-btn"
              @click.stop="handleDownload(file)"
            >
              <ExIcon
                icon="download-2-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
            <button
              v-if="deletable"
              class="ex-file-list__action-btn"
              @click.stop="handleDelete(file)"
            >
              <ExIcon
                icon="delete-bin-line"
                :size="16"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 树形视图 -->
      <div
        v-else-if="currentViewMode === 'tree'"
        class="ex-file-list__tree"
      >
        <ExTree
          :data="treeData"
          :expanded-keys="expandedFolderKeys"
          :selected-keys="internalSelectedIds"
          :checkable="selectable && multiple"
          :checked-keys="selectable && multiple ? internalSelectedIds : []"
          :show-icon="true"
          @update:expanded-keys="expandedFolderKeys = $event"
          @select="handleTreeSelect"
          @check="handleTreeCheck"
          @node-click="handleTreeNodeClick"
          @node-contextmenu="handleTreeNodeContextmenu"
        >
          <template #default="{ node }">
            <div class="ex-file-list__tree-node">
              <span class="ex-file-list__tree-node-label">{{ node.label }}</span>
              <div
                v-if="showActions"
                class="ex-file-list__tree-node-actions"
              >
                <button
                  v-if="previewable && !node.data?.isDirectory"
                  class="ex-file-list__action-btn"
                  @click.stop="handlePreview(node.data)"
                >
                  <ExIcon
                    icon="eye-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
                <button
                  v-if="downloadable && !node.data?.isDirectory"
                  class="ex-file-list__action-btn"
                  @click.stop="handleDownload(node.data)"
                >
                  <ExIcon
                    icon="download-2-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
                <button
                  v-if="deletable"
                  class="ex-file-list__action-btn"
                  @click.stop="handleDelete(node.data)"
                >
                  <ExIcon
                    icon="delete-bin-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </template>
        </ExTree>
      </div>

      <!-- 表格视图 -->
      <table
        v-else-if="currentViewMode === 'table'"
        class="ex-file-list__table"
      >
        <thead>
          <tr>
            <th
              v-if="selectable"
              class="ex-file-list__table-cell ex-file-list__table-cell--checkbox"
            >
              <input
                v-if="multiple"
                type="checkbox"
                :checked="isAllSelected"
                class="ex-file-list__checkbox"
                @change="toggleSelectAll"
              >
            </th>
            <th class="ex-file-list__table-cell">
              {{ t('fileList.name') }}
            </th>
            <th
              v-if="showSize"
              class="ex-file-list__table-cell"
            >
              {{ t('fileList.size') }}
            </th>
            <th
              v-if="showType"
              class="ex-file-list__table-cell"
            >
              {{ t('fileList.type') }}
            </th>
            <th
              v-if="showModifiedTime"
              class="ex-file-list__table-cell"
            >
              {{ t('fileList.modifiedTime') }}
            </th>
            <th
              v-if="showActions"
              class="ex-file-list__table-cell ex-file-list__table-cell--actions"
            >
              {{ t('fileList.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in paginatedFiles"
            :key="file.id"
            :class="['ex-file-list__table-row', { 'is-selected': isSelected(file.id) }]"
            @click="handleClick(file)"
            @dblclick="handleDblClick(file)"
          >
            <td
              v-if="selectable"
              class="ex-file-list__table-cell ex-file-list__table-cell--checkbox"
            >
              <input
                type="checkbox"
                :checked="isSelected(file.id)"
                class="ex-file-list__checkbox"
                @click.stop="handleSelect(file)"
              >
            </td>
            <td class="ex-file-list__table-cell">
              <div class="ex-file-list__table-name">
                <img
                  v-if="file.thumbUrl"
                  :src="file.thumbUrl"
                  :alt="file.name"
                  class="ex-file-list__table-thumbnail"
                >
                <ExIcon
                  v-else
                  :icon="getFileIcon(file)"
                  :size="24"
                  aria-hidden="true"
                />
                <span>{{ file.name }}</span>
              </div>
            </td>
            <td
              v-if="showSize"
              class="ex-file-list__table-cell"
            >
              {{ file.isDirectory ? '-' : formatBytes(file.size) }}
            </td>
            <td
              v-if="showType"
              class="ex-file-list__table-cell"
            >
              {{ file.isDirectory ? t('fileList.folder') : file.type }}
            </td>
            <td
              v-if="showModifiedTime"
              class="ex-file-list__table-cell"
            >
              {{ file.modifiedTime ? formatDate(file.modifiedTime) : '-' }}
            </td>
            <td
              v-if="showActions"
              class="ex-file-list__table-cell ex-file-list__table-cell--actions"
            >
              <div class="ex-file-list__table-actions">
                <button
                  v-if="previewable"
                  class="ex-file-list__action-btn"
                  @click.stop="handlePreview(file)"
                >
                  <ExIcon
                    icon="eye-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
                <button
                  v-if="downloadable"
                  class="ex-file-list__action-btn"
                  @click.stop="handleDownload(file)"
                >
                  <ExIcon
                    icon="download-2-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
                <button
                  v-if="deletable"
                  class="ex-file-list__action-btn"
                  @click.stop="handleDelete(file)"
                >
                  <ExIcon
                    icon="delete-bin-line"
                    :size="16"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div
      v-if="showPagination && totalPages > 1"
      class="ex-file-list__pagination"
    >
      <ExPagination
        v-model:current="currentPage"
        :total="displayFiles.length"
        :page-size="props.pageSize"
        show-total
        show-size-changer
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { ref, computed, watch } from 'vue';
import type {
  ExFileListProps,
  ExFileListEmits,
  ExFileListExposed,
  FileItem,
  ViewMode,
  SortField,
  SortOrder,
} from './types';
import type { TreeNode } from '../tree/types';
import ExLoading from '../loading/ExLoading.vue';
import ExTree from '../tree/ExTree.vue';
import ExButton from '../button/ExButton.vue';
import ExInput from '../input/ExInput.vue';
import ExSelect from '../select/ExSelect.vue';
import ExPagination from '../pagination/ExPagination.vue';
import ExEmpty from '../empty/ExEmpty.vue';
import type { SelectOption } from '../select/types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExFileList',
});

const props = withDefaults(defineProps<ExFileListProps>(), {
  files: () => [],
  viewMode: 'list',
  selectable: false,
  multiple: false,
  selectedIds: () => [],
  showToolbar: true,
  showSearch: true,
  showSort: true,
  showViewSwitch: true,
  sortField: 'name',
  sortOrder: 'asc',
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
});

const emit = defineEmits<ExFileListEmits>();

const { t } = useI18n();

const listRef = ref<HTMLDivElement>();
const searchKeyword = ref('');
const currentViewMode = ref<ViewMode>(props.viewMode);
const currentSortField = ref<SortField>(props.sortField);
const currentSortOrder = ref<SortOrder>(props.sortOrder);
const internalSelectedIds = ref<string[]>([...props.selectedIds]);
const currentPage = ref(1);
const expandedFolderKeys = ref<string[]>([]);

// 排序选项（用 computed 保证切换语言时 label 实时更新）
const sortOptions = computed<SelectOption[]>(() => [
  { value: 'name', label: t('fileList.name') },
  { value: 'size', label: t('fileList.size') },
  { value: 'type', label: t('fileList.type') },
  { value: 'modifiedTime', label: t('fileList.modifiedTime') },
]);

// 过滤和排序后的文件列表
const displayFiles = computed(() => {
  let result = [...props.files];

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(file => file.name.toLowerCase().includes(keyword));
  }

  // 排序
  result.sort((a, b) => {
    let compareResult = 0;
    const field = currentSortField.value;

    switch (field) {
      case 'name':
        compareResult = a.name.localeCompare(b.name);
        break;
      case 'size':
        compareResult = a.size - b.size;
        break;
      case 'type':
        compareResult = a.type.localeCompare(b.type);
        break;
      case 'modifiedTime':
        compareResult = (a.modifiedTime?.getTime() || 0) - (b.modifiedTime?.getTime() || 0);
        break;
    }

    return currentSortOrder.value === 'asc' ? compareResult : -compareResult;
  });

  return result;
});

// 分页后的文件列表
const paginatedFiles = computed(() => {
  if (!props.showPagination) return displayFiles.value;

  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return displayFiles.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(displayFiles.value.length / props.pageSize);
});

// 转换为树形数据
const treeData = computed((): TreeNode[] => {
  const convertToTreeNode = (file: FileItem): TreeNode => {
    return {
      key: file.id,
      label: file.name,
      icon: getFileIcon(file),
      children: file.children ? file.children.map(convertToTreeNode) : undefined,
      isLeaf: !file.isDirectory,
      data: file,
    };
  };

  return displayFiles.value.map(convertToTreeNode);
});

const isAllSelected = computed(() => {
  return (
    displayFiles.value.length > 0 &&
    displayFiles.value.every(file => internalSelectedIds.value.includes(file.id))
  );
});

// 监听选中状态变化
watch(
  () => props.selectedIds,
  newIds => {
    internalSelectedIds.value = [...newIds];
  }
);

// 同步受控的视图模式与排序（运行时改 prop 生效，支持 v-model:viewMode）
watch(
  () => props.viewMode,
  v => {
    currentViewMode.value = v;
  }
);
watch(
  () => props.sortField,
  v => {
    currentSortField.value = v;
  }
);
watch(
  () => props.sortOrder,
  v => {
    currentSortOrder.value = v;
  }
);

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化日期
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// 获取文件图标（内置 SVG 图标名）
const getFileIcon = (file: FileItem): string => {
  if (file.isDirectory) {
    return 'folder-line';
  }

  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) {
    return 'image-line';
  }
  if (type.startsWith('video/')) {
    return 'video-line';
  }
  if (type.startsWith('audio/')) {
    return 'music-line';
  }
  if (type === 'application/pdf') {
    return 'file-pdf-line';
  }
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {
    return 'file-zip-line';
  }
  if (type.includes('word') || type.includes('document')) {
    return 'file-word-line';
  }
  if (type.includes('excel') || type.includes('spreadsheet')) {
    return 'file-excel-line';
  }
  if (type.includes('powerpoint') || type.includes('presentation')) {
    return 'file-ppt-line';
  }

  return 'file-text-line';
};

// 是否选中
const isSelected = (id: string): boolean => {
  return internalSelectedIds.value.includes(id);
};

// 处理选择
const handleSelect = (file: FileItem) => {
  if (!props.selectable) return;

  const index = internalSelectedIds.value.indexOf(file.id);
  if (index > -1) {
    internalSelectedIds.value.splice(index, 1);
    emit('select', file, false);
  } else {
    if (props.multiple) {
      internalSelectedIds.value.push(file.id);
    } else {
      internalSelectedIds.value = [file.id];
    }
    emit('select', file, true);
  }

  emit('update:selectedIds', internalSelectedIds.value);
};

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    internalSelectedIds.value = [];
  } else {
    internalSelectedIds.value = displayFiles.value.map(file => file.id);
  }
  emit('update:selectedIds', internalSelectedIds.value);
};

// 点击文件
const handleClick = (file: FileItem) => {
  emit('click', file);
};

// 双击文件
const handleDblClick = (file: FileItem) => {
  emit('dblclick', file);
};

// 键盘支持（Enter/Space 等价于点击该项）
const handleItemKeydown = (file: FileItem, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick(file);
  }
};

// 预览
const handlePreview = (file: FileItem) => {
  emit('preview', file);
};

// 下载
const handleDownload = (file: FileItem) => {
  emit('download', file);
};

// 删除
const handleDelete = (file: FileItem) => {
  emit('delete', file);
};

// 搜索
const handleSearch = () => {
  emit('search', searchKeyword.value);
  currentPage.value = 1;
};

// 排序
const handleSort = () => {
  emit('sort', currentSortField.value, currentSortOrder.value);
};

const toggleSortOrder = () => {
  currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc';
  handleSort();
};

// 切换视图模式
const changeViewMode = (mode: ViewMode) => {
  currentViewMode.value = mode;
  emit('update:viewMode', mode);
};

// 树形视图相关：处理树节点选择
const handleTreeSelect = (_selectedKeys: string[], node: TreeNode) => {
  const file = node.data as FileItem;
  if (file) {
    emit('click', file);
  }
};

const handleTreeCheck = (checkedKeys: string[]) => {
  internalSelectedIds.value = checkedKeys;
  emit('update:selectedIds', checkedKeys);
};

const handleTreeNodeClick = (node: TreeNode) => {
  const file = node.data as FileItem;
  if (file) {
    emit('click', file);
    if (file.isDirectory) {
      // 展开/收起文件夹（受控 expanded-keys，不可变更新使 Tree 实时响应）
      if (expandedFolderKeys.value.includes(node.key)) {
        expandedFolderKeys.value = expandedFolderKeys.value.filter(k => k !== node.key);
      } else {
        expandedFolderKeys.value = [...expandedFolderKeys.value, node.key];
      }
    }
  }
};

const handleTreeNodeContextmenu = (node: TreeNode, event: MouseEvent) => {
  event.preventDefault();
  const file = node.data as FileItem;
  if (file) {
    // 可以在这里添加右键菜单逻辑
    // console.log('Right click on:', file.name);
  }
};

// 暴露的方法
const selectAll = () => {
  internalSelectedIds.value = displayFiles.value.map(file => file.id);
  emit('update:selectedIds', internalSelectedIds.value);
};

const unselectAll = () => {
  internalSelectedIds.value = [];
  emit('update:selectedIds', internalSelectedIds.value);
};

const selectFile = (id: string) => {
  if (!internalSelectedIds.value.includes(id)) {
    if (props.multiple) {
      internalSelectedIds.value.push(id);
    } else {
      internalSelectedIds.value = [id];
    }
    emit('update:selectedIds', internalSelectedIds.value);
  }
};

const unselectFile = (id: string) => {
  const index = internalSelectedIds.value.indexOf(id);
  if (index > -1) {
    internalSelectedIds.value.splice(index, 1);
    emit('update:selectedIds', internalSelectedIds.value);
  }
};

const getSelectedFiles = (): FileItem[] => {
  return props.files.filter(file => internalSelectedIds.value.includes(file.id));
};

const refresh = () => {
  searchKeyword.value = '';
  currentPage.value = 1;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit('page-change', page);
};

const getElement = () => listRef.value || null;

defineExpose<ExFileListExposed>({
  selectAll,
  unselectAll,
  selectFile,
  unselectFile,
  getSelectedFiles,
  refresh,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFileList.scss"></style>
