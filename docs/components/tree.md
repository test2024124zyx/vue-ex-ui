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
const checkExpandedKeys = ref(['documents'])
const customData = [
  {
    key: 'documents', label: '文档', data: { status: '已同步' },
    children: [
      { key: 'report', label: 'report.pdf', data: { status: '待审核' } },
      { key: 'notes', label: 'notes.txt', data: { status: '已同步' } },
    ],
  },
]
const virtualCount = 2000
const largeTree = Array.from({ length: virtualCount }, (_, index) => ({
  key: `file-${index + 1}`, label: `文件 ${index + 1}.txt`,
}))
const virtualSelectedKeys = ref([])
</script>

## 基础用法

::: raw

<div class="demo-container">
  <ExTree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    :data="data"
  />
</div>

:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from 'vue-ex-ui';

const data: TreeNode[] = [
  {
    key: 'documents',
    label: '文档',
    children: [
      { key: 'report', label: 'report.pdf' },
      { key: 'notes', label: 'notes.txt' },
    ],
  },
  { key: 'images', label: '图片', children: [{ key: 'photo', label: 'photo.png' }] },
];
const expandedKeys = ref<string[]>(['documents']);
const selectedKeys = ref<string[]>([]);
</script>

<template>
  <div class="demo-container">
    <ExTree
      v-model:expanded-keys="expandedKeys"
      v-model:selected-keys="selectedKeys"
      :data="data"
    />
  </div>
</template>
```

:::

## 勾选

::: raw

<div class="demo-container">
  <ExTree
    v-model:expanded-keys="checkExpandedKeys"
    v-model:checked-keys="checkedKeys"
    :data="data"
    checkable
  />
</div>

:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from 'vue-ex-ui';

const data: TreeNode[] = [
  {
    key: 'documents',
    label: '文档',
    children: [
      { key: 'report', label: 'report.pdf' },
      { key: 'notes', label: 'notes.txt' },
    ],
  },
  { key: 'images', label: '图片', children: [{ key: 'photo', label: 'photo.png' }] },
];
const checkExpandedKeys = ref<string[]>(['documents']);
const checkedKeys = ref<string[]>([]);
</script>

<template>
  <div class="demo-container">
    <ExTree
      v-model:expanded-keys="checkExpandedKeys"
      v-model:checked-keys="checkedKeys"
      :data="data"
      checkable
    />
  </div>
</template>
```

:::

设置 `check-strictly` 后，父子节点的勾选状态互不级联。

## 自定义节点内容

::: raw
<div class="demo-container">
  <ex-tree :data="customData" :default-expanded-keys="['documents']">
    <template #default="{ node }">
      <span>{{ node.label }} · {{ node.data?.status }}</span>
    </template>
  </ex-tree>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
const customData = [
  {
    key: 'documents',
    label: '文档',
    data: { status: '已同步' },
    children: [
      { key: 'report', label: 'report.pdf', data: { status: '待审核' } },
      { key: 'notes', label: 'notes.txt', data: { status: '已同步' } },
    ],
  },
];
</script>

<template>
  <div class="demo-container">
    <ex-tree
      :data="customData"
      :default-expanded-keys="['documents']"
    >
      <template #default="{ node }">
        <span>{{ node.label }} · {{ node.data?.status }}</span>
      </template>
    </ex-tree>
  </div>
</template>
```

:::

## 虚拟滚动

渲染 2000 个独立文件节点，视口只保留可见范围与缓冲区。滚动到底部或使用方向键移动焦点，可以检查最后一项是否可达。

::: raw
<div class="demo-container">
  <ex-tree v-model:selected-keys="virtualSelectedKeys" :data="largeTree" virtual :height="320" :item-height="28" :virtual-buffer="6" />
  <p role="status">共 {{ virtualCount }} 项，已选：{{ virtualSelectedKeys.join(', ') || '未选择' }}</p>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const virtualCount = 2000;
const largeTree = Array.from({ length: virtualCount }, (_, index) => ({
  key: `file-${index + 1}`,
  label: `文件 ${index + 1}.txt`,
}));
const virtualSelectedKeys = ref([]);
</script>

<template>
  <div class="demo-container">
    <ex-tree
      v-model:selected-keys="virtualSelectedKeys"
      :data="largeTree"
      virtual
      :height="320"
      :item-height="28"
      :virtual-buffer="6"
    />
    <p role="status">
      共 {{ virtualCount }} 项，已选：{{ virtualSelectedKeys.join(', ') || '未选择' }}
    </p>
  </div>
</template>
```

:::

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
