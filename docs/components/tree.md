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
const asyncTree = ref(null)
const failNextLoad = ref(false)
const asyncData = [{ key: 'workspace', label: '项目资源', isLeaf: false }]
const asyncCheckedKeys = ref([])
const demoDelayMs = 700
const loadChildren = (node, { signal }) => new Promise((resolve, reject) => {
  const cancel = () => {
    clearTimeout(timer)
    reject(new DOMException('请求已取消', 'AbortError'))
  }
  const timer = setTimeout(() => {
    signal.removeEventListener('abort', cancel)
    if (failNextLoad.value) {
      failNextLoad.value = false
      reject(new Error('演示加载失败'))
      return
    }
    resolve(node.key === 'workspace'
      ? [{ key: 'design', label: '设计文件', isLeaf: false }, { key: 'readme', label: 'README.md', isLeaf: true }]
      : [{ key: 'tokens', label: 'tokens.json', isLeaf: true }])
  }, demoDelayMs)
  if (signal.aborted) cancel()
  else signal.addEventListener('abort', cancel, { once: true })
})
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

## 异步子节点与失败重试

展开“项目资源”加载子节点。可以先勾选父节点，再展开观察新子节点继承勾选；加载期间收起会取消请求。勾选“下次加载失败”后重新加载，即可体验保留旧内容和节点内重试。

::: raw

<div class="demo-container">
  <ExCheckbox v-model="failNextLoad">下次加载失败</ExCheckbox>
  <ExButton size="small" @click="asyncTree?.reloadNode('workspace')">重新加载项目资源</ExButton>
  <ExTree
    ref="asyncTree"
    v-model:checked-keys="asyncCheckedKeys"
    :data="asyncData"
    :load-data="loadChildren"
    checkable
    aria-label="异步项目资源"
  />
  <p role="status">已勾选：{{ asyncCheckedKeys.join(', ') || '未选择' }}</p>
</div>

:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { ExTreeExposed, TreeLoadData, TreeNode } from 'vue-ex-ui';

const asyncTree = ref<ExTreeExposed | null>(null);
const failNextLoad = ref(false);
const asyncData: TreeNode[] = [{ key: 'workspace', label: '项目资源', isLeaf: false }];
const asyncCheckedKeys = ref<string[]>([]);
const demoDelayMs = 700;
// 演示使用可取消的本地请求；真实服务可以直接把 signal 传给 fetch。
const loadChildren: TreeLoadData = (node, { signal }) =>
  new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      reject(new DOMException('请求已取消', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      if (failNextLoad.value) {
        failNextLoad.value = false;
        reject(new Error('演示加载失败'));
        return;
      }
      resolve(
        node.key === 'workspace'
          ? [
              { key: 'design', label: '设计文件', isLeaf: false },
              { key: 'readme', label: 'README.md', isLeaf: true },
            ]
          : [{ key: 'tokens', label: 'tokens.json', isLeaf: true }]
      );
    }, demoDelayMs);
    if (signal.aborted) cancel();
    else signal.addEventListener('abort', cancel, { once: true });
  });
</script>

<template>
  <div class="demo-container">
    <ExCheckbox v-model="failNextLoad">下次加载失败</ExCheckbox>
    <ExButton
      size="small"
      @click="asyncTree?.reloadNode('workspace')"
    >
      重新加载项目资源
    </ExButton>
    <ExTree
      ref="asyncTree"
      v-model:checked-keys="asyncCheckedKeys"
      :data="asyncData"
      :load-data="loadChildren"
      checkable
      aria-label="异步项目资源"
    />
    <p role="status">已勾选：{{ asyncCheckedKeys.join(', ') || '未选择' }}</p>
  </div>
</template>
```

:::

`loadData(node, { signal })` 返回节点的完整子节点列表，空数组表示确定没有子节点。`isLeaf: false` 声明未知分支；`isLeaf: true` 禁止加载；已有非空 `children` 直接展示。所有 key 在整棵树中必须唯一，返回结构会校验重复 key、循环引用和字段类型。服务端渲染只输出已有数据，浏览器挂载后才启动异步加载。

成功结果在当前数据版本内缓存，组件不改写传入 `data` 或加载函数返回的结构。替换或修改 `data`、替换 `loadData` 会清除缓存并取消旧请求；外部数据始终优先。加载结果通过 `load` 事件和 `getNode()` 等方法读取，不会自动写回外部 `data`。

受控 `expandedKeys` 被父级接受后才开始请求；非严格模式按已确认父节点联动新加载的可选后代，通过 `update:checkedKeys` 请求模型更新，不直接修改外部数组。收起祖先取消其隐藏分支的自动请求；`cancelNodeLoad()` 显式取消后，重新展开或调用 `reloadNode()` 才会重试。即使加载函数忽略取消信号，迟到结果也不会覆盖新数据。

`reloadNode()` 在请求期间与失败后保留旧子树，成功后原子替换；重复重载取消前一次请求。失败显示节点内重试入口，节点上的右方向键也可重试。过滤只处理已加载节点，默认展开全部及 `requestExpandAll()` 只展开调用时已知分支，不会无限递归拉取后续分支。

## Props

| 属性                    | 类型                                            | 默认值  |
| ----------------------- | ----------------------------------------------- | ------- |
| `data`                  | `TreeNode[]`                                    | 必填    |
| `load-data`             | `TreeLoadData`                                  | —       |
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
| `load`                 | `(node: TreeNode, children: TreeNode[])`              |
| `load-error`           | `(error: unknown, node: TreeNode)`                    |

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
| `reloadNode`           | `(key: string) => Promise<boolean>`           |
| `cancelNodeLoad`       | `(key: string) => boolean`                    |
| `getNodeLoadState`     | `(key: string) => TreeNodeLoadState`          |

`reloadNode()` 成功返回 `true`，失败、取消、未知 key、禁用节点或明确叶子节点返回 `false`，不会抛出加载函数的错误。`TreeNodeLoadState` 包含 `status: 'idle' | 'loading' | 'loaded' | 'error'` 和可选的 `error`；查询结果是隔离快照。取消不会触发 `load-error`。

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
