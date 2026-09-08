# FileList 文件列表

<script setup>
import { ref } from 'vue'

const files = [
  {
    id: 'folder',
    name: 'documents',
    isDirectory: true,
    modifiedTime: '2026-07-10T08:00:00Z',
    children: [
      {
        id: 'report',
        name: 'report.pdf',
        size: 2048,
        type: 'application/pdf',
        modifiedTime: '2026-07-10T09:00:00Z',
      },
    ],
  },
  {
    id: 'photo',
    name: 'photo.png',
    size: 1024,
    type: 'image/png',
    modifiedTime: '2026-07-09T09:00:00Z',
  },
]

const selectedIds = ref([])
const viewMode = ref('list')
const searchValue = ref('')
const sortField = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const actionStatus = ref('选择文件操作后，这里会显示请求内容。')
const reportAction = (action, file) => {
  actionStatus.value = `${action}请求：${file.name}`
}

const defaultFiles = [
  { id: 'report', name: 'report.txt', size: 2048, type: 'text/plain', modifiedTime: '2026-07-10T09:00:00Z' },
  { id: 'notes', name: 'notes.txt', size: 1024, type: 'text/plain', modifiedTime: '2026-07-09T09:00:00Z' },
  { id: 'budget', name: 'budget.csv', size: 4096, type: 'text/csv', modifiedTime: '2026-07-08T09:00:00Z' },
]
const defaultSelection = ref(['report'])
const pageSize = 4
const paginationPage = ref(1)
const paginatedFiles = Array.from({ length: 12 }, (_, index) => ({
  id: `document-${index + 1}`,
  name: `document-${String(index + 1).padStart(2, '0')}.txt`,
  size: (index + 1) * 1024,
  type: 'text/plain',
}))
</script>

## 基础用法

::: raw
<div class="demo-container">
  <ex-file-list
    v-model:selected-ids="selectedIds"
    v-model:view-mode="viewMode"
    v-model:search-value="searchValue"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:current-page="currentPage"
    :files="files"
    selectable
    multiple
    @preview-request="file => reportAction('预览', file)"
    @download-request="file => reportAction('下载', file)"
    @delete-request="file => reportAction('删除', file)"
  />
  <output aria-live="polite">{{ actionStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { FileItem, SortField, SortOrder, ViewMode } from 'vue-ex-ui';

const files: FileItem[] = [
  {
    id: 'folder',
    name: 'documents',
    isDirectory: true,
    modifiedTime: '2026-07-10T08:00:00Z',
    children: [
      {
        id: 'report',
        name: 'report.pdf',
        size: 2048,
        type: 'application/pdf',
        modifiedTime: '2026-07-10T09:00:00Z',
      },
    ],
  },
  {
    id: 'photo',
    name: 'photo.png',
    size: 1024,
    type: 'image/png',
    modifiedTime: '2026-07-09T09:00:00Z',
  },
];

const selectedIds = ref<string[]>([]);
const viewMode = ref<ViewMode>('list');
const searchValue = ref('');
const sortField = ref<SortField>('name');
const sortOrder = ref<SortOrder>('asc');
const currentPage = ref(1);
const actionStatus = ref('选择文件操作后，这里会显示请求内容。');
const reportAction = (action: string, file: FileItem) => {
  actionStatus.value = `${action}请求：${file.name}`;
};
</script>

<template>
  <div class="demo-container">
    <ex-file-list
      v-model:selected-ids="selectedIds"
      v-model:view-mode="viewMode"
      v-model:search-value="searchValue"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      v-model:current-page="currentPage"
      :files="files"
      selectable
      multiple
      @preview-request="file => reportAction('预览', file)"
      @download-request="file => reportAction('下载', file)"
      @delete-request="file => reportAction('删除', file)"
    />
    <output aria-live="polite">{{ actionStatus }}</output>
  </div>
</template>
```

:::

## 非受控初始值

初始以网格展示并选中 `report.txt`。清空搜索可查看其他文件；切换视图或选择文件后，组件自行管理后续状态。下方文本仅观察选择事件，不回写控制值。

::: raw
<div class="demo-container">
  <ex-file-list
    :files="defaultFiles"
    default-view-mode="grid"
    :default-selected-ids="['report']"
    default-search-value="report"
    default-sort-field="modifiedTime"
    default-sort-order="desc"
    :default-current-page="1"
    :show-actions="false"
    selectable
    @update:selected-ids="defaultSelection = $event"
  />
  <output aria-live="polite">已选：{{ defaultSelection.join('、') || '无' }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { FileItem } from 'vue-ex-ui';

const defaultFiles: FileItem[] = [
  {
    id: 'report',
    name: 'report.txt',
    size: 2048,
    type: 'text/plain',
    modifiedTime: '2026-07-10T09:00:00Z',
  },
  {
    id: 'notes',
    name: 'notes.txt',
    size: 1024,
    type: 'text/plain',
    modifiedTime: '2026-07-09T09:00:00Z',
  },
  {
    id: 'budget',
    name: 'budget.csv',
    size: 4096,
    type: 'text/csv',
    modifiedTime: '2026-07-08T09:00:00Z',
  },
];
const defaultSelection = ref(['report']);
</script>

<template>
  <ex-file-list
    :files="defaultFiles"
    default-view-mode="grid"
    :default-selected-ids="['report']"
    default-search-value="report"
    default-sort-field="modifiedTime"
    default-sort-order="desc"
    :default-current-page="1"
    :show-actions="false"
    selectable
    @update:selected-ids="defaultSelection = $event"
  />
  <output aria-live="polite">已选：{{ defaultSelection.join('、') || '无' }}</output>
</template>
```

:::

## 分页

共 12 个文件，每页 4 个。页码由 `v-model:current-page` 回写，切换页码可以看到不同文件。

::: raw
<div class="demo-container">
  <ex-file-list
    v-model:current-page="paginationPage"
    :files="paginatedFiles"
    :page-size="pageSize"
    :show-actions="false"
    show-pagination
  />
  <output aria-live="polite">第 {{ paginationPage }} 页，共 {{ paginatedFiles.length }} 个文件</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { FileItem } from 'vue-ex-ui';

const pageSize = 4;
const paginationPage = ref(1);
const paginatedFiles: FileItem[] = Array.from({ length: 12 }, (_, index) => ({
  id: `document-${index + 1}`,
  name: `document-${String(index + 1).padStart(2, '0')}.txt`,
  size: (index + 1) * 1024,
  type: 'text/plain',
}));
</script>

<template>
  <ex-file-list
    v-model:current-page="paginationPage"
    :files="paginatedFiles"
    :page-size="pageSize"
    :show-actions="false"
    show-pagination
  />
  <output aria-live="polite">
    第 {{ paginationPage }} 页，共 {{ paginatedFiles.length }} 个文件
  </output>
</template>
```

:::

## Props

| 属性                   | 类型                                           | 默认值   |
| ---------------------- | ---------------------------------------------- | -------- |
| `files`                | `readonly FileItem[]`                          | 必填     |
| `view-mode`            | `ViewMode`                                     | —        |
| `default-view-mode`    | `ViewMode`                                     | `'list'` |
| `selectable`           | `boolean`                                      | `false`  |
| `multiple`             | `boolean`                                      | `false`  |
| `selected-ids`         | `readonly string[]`                            | —        |
| `default-selected-ids` | `readonly string[]`                            | `[]`     |
| `show-toolbar`         | `boolean`                                      | `true`   |
| `show-search`          | `boolean`                                      | `true`   |
| `search-value`         | `string`                                       | —        |
| `default-search-value` | `string`                                       | `''`     |
| `show-sort`            | `boolean`                                      | `true`   |
| `show-view-switch`     | `boolean`                                      | `true`   |
| `sort-field`           | `'name' \| 'size' \| 'type' \| 'modifiedTime'` | —        |
| `default-sort-field`   | `SortField`                                    | `'name'` |
| `sort-order`           | `'asc' \| 'desc'`                              | —        |
| `default-sort-order`   | `SortOrder`                                    | `'asc'`  |
| `show-size`            | `boolean`                                      | `true`   |
| `show-type`            | `boolean`                                      | `true`   |
| `show-modified-time`   | `boolean`                                      | `true`   |
| `show-actions`         | `boolean`                                      | `true`   |
| `previewable`          | `boolean`                                      | `true`   |
| `downloadable`         | `boolean`                                      | `true`   |
| `deletable`            | `boolean`                                      | `true`   |
| `empty-text`           | `string`                                       | —        |
| `loading`              | `boolean`                                      | `false`  |
| `page-size`            | `number`                                       | `20`     |
| `show-pagination`      | `boolean`                                      | `false`  |
| `current-page`         | `number`                                       | —        |
| `default-current-page` | `number`                                       | `1`      |

## FileItem

| 字段           | 类型                                | 必填 |
| -------------- | ----------------------------------- | ---- |
| `id`           | `string`                            | 是   |
| `name`         | `string`                            | 是   |
| `size`         | `number`                            | 否   |
| `type`         | `string`                            | 否   |
| `url`          | `string`                            | 否   |
| `thumbUrl`     | `string`                            | 否   |
| `modifiedTime` | `Date \| number \| string`          | 否   |
| `createdTime`  | `Date \| number \| string`          | 否   |
| `isDirectory`  | `boolean`                           | 否   |
| `children`     | `readonly FileItem[]`               | 否   |
| `meta`         | `Readonly<Record<string, unknown>>` | 否   |

全量数据树中的 `id` 必须非空且唯一。目录可省略 `size` 和 `type`。

运行时从多选切换到单选时，非受控状态会保留第一个有效标识并提交规范化更新；再次开启多选不会恢复已经收窄掉的陈旧选择。受控模式仍以父组件同步后的 `selected-ids` 为准。

## Events

| 事件                  | 参数                                                     |
| --------------------- | -------------------------------------------------------- |
| `update:selected-ids` | `(ids: string[])`                                        |
| `selection-request`   | `(file: FileItem, selected: boolean, nextIds: string[])` |
| `click`               | `(file: FileItem)`                                       |
| `dblclick`            | `(file: FileItem)`                                       |
| `preview-request`     | `(file: FileItem)`                                       |
| `download-request`    | `(file: FileItem)`                                       |
| `delete-request`      | `(file: FileItem)`                                       |
| `update:search-value` | `(value: string)`                                        |
| `search`              | `(value: string)`                                        |
| `update:sort-field`   | `(field: SortField)`                                     |
| `update:sort-order`   | `(order: SortOrder)`                                     |
| `sort`                | `(field: SortField, order: SortOrder)`                   |
| `update:view-mode`    | `(mode: ViewMode)`                                       |
| `update:current-page` | `(page: number)`                                         |
| `page-change`         | `(page: number)`                                         |

`preview-request`、`download-request` 和 `delete-request` 只表示用户请求，实际执行结果由业务层处理。

## Exposed

| 方法               | 类型                           |
| ------------------ | ------------------------------ |
| `getSelectedFiles` | `() => FileItem[]`             |
| `getElement`       | `() => HTMLDivElement \| null` |

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
