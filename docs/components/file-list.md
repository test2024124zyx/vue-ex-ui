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
</script>

## 基础用法

<div class="demo-container">
  <ExFileList
    v-model:selected-ids="selectedIds"
    v-model:view-mode="viewMode"
    v-model:search-value="searchValue"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:current-page="currentPage"
    :files="files"
    selectable
    multiple
    @preview-request="file => console.log('preview request', file)"
    @download-request="file => console.log('download request', file)"
    @delete-request="file => console.log('delete request', file)"
  />
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { FileItem, SortField, SortOrder, ViewMode } from 'vue-ex-ui';

const files: FileItem[] = [
  { id: 'folder', name: 'documents', isDirectory: true },
  { id: 'report', name: 'report.pdf', size: 2048, type: 'application/pdf' },
];
const selectedIds = ref<string[]>([]);
const viewMode = ref<ViewMode>('list');
const searchValue = ref('');
const sortField = ref<SortField>('name');
const sortOrder = ref<SortOrder>('asc');
const currentPage = ref(1);
</script>

<template>
  <ExFileList
    v-model:selected-ids="selectedIds"
    v-model:view-mode="viewMode"
    v-model:search-value="searchValue"
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    v-model:current-page="currentPage"
    :files="files"
    selectable
    multiple
    @preview-request="handlePreviewRequest"
    @download-request="handleDownloadRequest"
    @delete-request="handleDeleteRequest"
  />
</template>
```

## 非受控初始值

```vue
<template>
  <ExFileList
    :files="files"
    default-view-mode="grid"
    :default-selected-ids="['report']"
    default-search-value="report"
    default-sort-field="modifiedTime"
    default-sort-order="desc"
    :default-current-page="1"
    selectable
  />
</template>
```

## 分页

```vue
<template>
  <ExFileList
    v-model:current-page="currentPage"
    :files="files"
    :page-size="20"
    show-pagination
  />
</template>
```

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
