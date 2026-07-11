# Tree 树形控件

<script setup>
import { ref } from 'vue'

const data = [
  {
    key: 'documents',
    label: '文档',
    children: [
      { key: 'report', label: 'report.pdf' },
      { key: 'notes', label: 'notes.txt' },
    ],
  },
  { key: 'images', label: '图片', children: [{ key: 'photo', label: 'photo.png' }] },
]
const expandedKeys = ref(['documents'])
const selectedKeys = ref([])
const checkedKeys = ref([])
</script>

## 基础用法

<div class="demo-container">
  <ExTree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    :data="data"
  />
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from 'vue-ex-ui';

const data: TreeNode[] = [
  {
    key: 'documents',
    label: '文档',
    children: [{ key: 'report', label: 'report.pdf' }],
  },
];
const expandedKeys = ref<string[]>(['documents']);
const selectedKeys = ref<string[]>([]);
</script>

<template>
  <ExTree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    :data="data"
  />
</template>
```

## 勾选

<div class="demo-container">
  <ExTree
    v-model:expanded-keys="expandedKeys"
    v-model:checked-keys="checkedKeys"
    :data="data"
    checkable
  />
</div>

```vue
<template>
  <ExTree
    v-model:expanded-keys="expandedKeys"
    v-model:checked-keys="checkedKeys"
    :data="data"
    checkable
  />
</template>
```

设置 `check-strictly` 后，父子节点的勾选状态互不级联。

## 自定义节点内容

```vue
<template>
  <ExTree
    :data="data"
    :default-expanded-keys="['documents']"
  >
    <template #default="{ node }">
      <span>{{ node.label }} · {{ node.data?.status }}</span>
    </template>
  </ExTree>
</template>
```

## 虚拟滚动

```vue
<template>
  <ExTree
    :data="largeTree"
    virtual
    :height="400"
    :item-height="28"
    :virtual-buffer="6"
  />
</template>
```

## Props

| 属性                    | 类型                                            | 默认值  |
| ----------------------- | ----------------------------------------------- | ------- |
| `data`                  | `TreeNode[]`                                    | 必填    |
| `default-expanded-keys` | `string[]`                                      | `[]`    |
| `expanded-keys`         | `string[]`                                      | —       |
| `default-selected-keys` | `string[]`                                      | `[]`    |
| `selected-keys`         | `string[]`                                      | —       |
| `default-checked-keys`  | `string[]`                                      | `[]`    |
| `checked-keys`          | `string[]`                                      | —       |
| `selectable`            | `boolean`                                       | `true`  |
| `multiple`              | `boolean`                                       | `false` |
| `checkable`             | `boolean`                                       | `false` |
| `check-strictly`        | `boolean`                                       | `false` |
| `default-expand-all`    | `boolean`                                       | `false` |
| `show-line`             | `boolean`                                       | `false` |
| `show-icon`             | `boolean`                                       | `true`  |
| `draggable`             | `boolean`                                       | `false` |
| `disabled`              | `boolean`                                       | `false` |
| `aria-label`            | `string`                                        | —       |
| `virtual`               | `boolean`                                       | `false` |
| `item-height`           | `number`                                        | `28`    |
| `height`                | `number \| string`                              | `400`   |
| `virtual-buffer`        | `number`                                        | `6`     |
| `filter-node-method`    | `(value: string, node: TreeNode) => boolean`    | —       |
| `class`                 | `string \| string[] \| Record<string, boolean>` | —       |
| `style`                 | `string \| Record<string, string \| number>`    | —       |

受控属性只在对应外部值更新后生效。只需要初始值时使用 `default-*` 属性。

## TreeNode

| 字段         | 类型         | 必填 |
| ------------ | ------------ | ---- |
| `key`        | `string`     | 是   |
| `label`      | `string`     | 是   |
| `children`   | `TreeNode[]` | 否   |
| `disabled`   | `boolean`    | 否   |
| `selectable` | `boolean`    | 否   |
| `checkable`  | `boolean`    | 否   |
| `isLeaf`     | `boolean`    | 否   |
| `icon`       | `string`     | 否   |
| `data`       | `unknown`    | 否   |

## Events

| 事件                   | 参数                                                  |
| ---------------------- | ----------------------------------------------------- |
| `update:expanded-keys` | `(keys: string[])`                                    |
| `update:selected-keys` | `(keys: string[])`                                    |
| `update:checked-keys`  | `(keys: string[])`                                    |
| `expand`               | `(keys: string[], node: TreeNode, expanded: boolean)` |
| `select`               | `(keys: string[], node: TreeNode, selected: boolean)` |
| `check`                | `(keys: string[], node: TreeNode, checked: boolean)`  |
| `node-click`           | `(node: TreeNode, event: MouseEvent)`                 |
| `node-contextmenu`     | `(node: TreeNode, event: MouseEvent)`                 |
| `node-drag-start`      | `(node: TreeNode, event: DragEvent)`                  |
| `node-drag-enter`      | `(node: TreeNode, event: DragEvent)`                  |
| `node-drag-leave`      | `(node: TreeNode, event: DragEvent)`                  |
| `node-drag-end`        | `(node: TreeNode, event: DragEvent)`                  |
| `node-drop`            | `(dragNode, dropNode, position, event)`               |

`node-drop` 只报告放置请求，调用方负责更新 `data`。

## Slots

| 插槽      | 参数                 |
| --------- | -------------------- |
| `default` | `{ node: TreeNode }` |

## Exposed

| 方法                   | 类型                                          |
| ---------------------- | --------------------------------------------- |
| `getSelectedNodes`     | `() => TreeNode[]`                            |
| `getCheckedNodes`      | `() => TreeNode[]`                            |
| `getHalfCheckedNodes`  | `() => TreeNode[]`                            |
| `requestNodeSelection` | `(key: string, selected: boolean) => boolean` |
| `requestNodeCheck`     | `(key: string, checked: boolean) => boolean`  |
| `requestNodeExpansion` | `(key: string, expanded: boolean) => boolean` |
| `getNode`              | `(key: string) => TreeNode \| null`           |
| `requestExpandAll`     | `() => void`                                  |
| `requestCollapseAll`   | `() => void`                                  |
| `filter`               | `(value: string) => void`                     |
| `getElement`           | `() => HTMLDivElement \| null`                |

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
