# TreeSelect 树选择

在下拉面板中以树形结构选择，支持单选、多选（级联勾选）、搜索、异步子节点与虚拟滚动。

<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'

const treeData = [
  {
    value: 'tokyo', label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      { value: 'shinjuku', label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ]
      },
    ]
  },
  {
    value: 'night-city', label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ]
  },
]

const single = ref(null)
const multi = ref([])
const searchVal = ref(null)
const strict = ref([])
const asyncValue = ref(null)
const virtualValue = ref(null)
const lazyRoots = [
  { value: 'north', label: '华北', isLeaf: false },
  { value: 'east', label: '华东', isLeaf: false },
]
const virtualData = Array.from({ length: 5000 }, (_, value) => ({ value, label: `资源节点 ${value}` }))
const loadTreeNodes = async (node, { signal }) => {
  const response = await fetch(withBase('/demo-assets/hierarchical-options.json'), { signal })
  if (!response.ok) throw new Error(`加载失败：HTTP ${response.status}`)
  const branches = await response.json()
  return branches[node.value] ?? []
}
</script>

## 基础用法

单选模式，点击节点即选中并关闭。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="single" :data="treeData" placeholder="请选择区域" clearable />
  <span style="color: var(--ex-color-text-secondary);">值：{{ single ?? '（空）' }}</span>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="single"
      :data="treeData"
      placeholder="请选择区域"
      clearable
    />
    <span style="color: var(--ex-color-text-secondary);">值：{{ single ?? '（空）' }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const single = ref(null);
const treeData = [
  {
    value: 'tokyo',
    label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      {
        value: 'shinjuku',
        label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ],
      },
    ],
  },
  {
    value: 'night-city',
    label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ],
  },
];
</script>
```

:::

## 多选（级联勾选）

设置 `multiple` 显示复选框，勾选父节点会级联选中子节点，子节点状态回溯影响父节点（半选）。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="multi" :data="treeData" multiple clearable default-expand-all placeholder="请选择" />
  <span style="color: var(--ex-color-text-secondary);">已选 {{ multi.length }} 项</span>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="multi"
      :data="treeData"
      multiple
      clearable
      default-expand-all
      placeholder="请选择"
    />
    <span style="color: var(--ex-color-text-secondary);">已选 {{ multi.length }} 项</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const multi = ref([]);
const treeData = [
  {
    value: 'tokyo',
    label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      {
        value: 'shinjuku',
        label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ],
      },
    ],
  },
  {
    value: 'night-city',
    label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ],
  },
];
</script>
```

:::

## 父子不关联

设置 `check-strictly`，父子节点的勾选状态相互独立。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="strict" :data="treeData" multiple check-strictly default-expand-all placeholder="独立勾选" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const strict = ref([]);
const treeData = [
  {
    value: 'tokyo',
    label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      {
        value: 'shinjuku',
        label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ],
      },
    ],
  },
  {
    value: 'night-city',
    label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ],
  },
];
</script>

<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="strict"
      :data="treeData"
      multiple
      check-strictly
      default-expand-all
      placeholder="独立勾选"
    />
  </div>
</template>
```

:::

## 可搜索

设置 `filterable`，输入关键字过滤节点（自动展开匹配路径）。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="searchVal" :data="treeData" filterable clearable placeholder="输入关键字搜索" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const searchVal = ref(null);
const treeData = [
  {
    value: 'tokyo',
    label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      {
        value: 'shinjuku',
        label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ],
      },
    ],
  },
  {
    value: 'night-city',
    label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ],
  },
];
</script>

<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="searchVal"
      :data="treeData"
      filterable
      clearable
      placeholder="输入关键字搜索"
    />
  </div>
</template>
```

:::

## 禁用

整体禁用，或对单个节点设置 `disabled`（如示例中的 “Westbrook”）。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="single" :data="treeData" disabled placeholder="已禁用" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const single = ref(null);
const treeData = [
  {
    value: 'tokyo',
    label: 'Neo Tokyo',
    children: [
      { value: 'shibuya', label: '涩谷区' },
      {
        value: 'shinjuku',
        label: '新宿区',
        children: [
          { value: 'kabukicho', label: '歌舞伎町' },
          { value: 'nishi', label: '西新宿' },
        ],
      },
    ],
  },
  {
    value: 'night-city',
    label: 'Night City',
    children: [
      { value: 'watson', label: 'Watson' },
      { value: 'westbrook', label: 'Westbrook', disabled: true },
    ],
  },
];
</script>

<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="single"
      :data="treeData"
      disabled
      placeholder="已禁用"
    />
  </div>
</template>
```

:::

## 异步加载与重试

`isLeaf: false` 表示可加载的分支。展开时调用 `loadData(node, { signal, path })`，
成功后缓存子节点；失败后显示重试按钮。下面的示例真实请求文档站点中的同源 JSON 数据。

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="asyncValue" :data="lazyRoots" :load-data="loadTreeNodes" clearable aria-label="异步地区选择" />
  <span role="status">已选：{{ asyncValue ?? '未选择' }}</span>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';
import { withBase } from 'vitepress';

const asyncValue = ref(null);
const lazyRoots = [
  { value: 'north', label: '华北', isLeaf: false },
  { value: 'east', label: '华东', isLeaf: false },
];
const loadTreeNodes = async (node, { signal }) => {
  const response = await fetch(withBase('/demo-assets/hierarchical-options.json'), { signal });
  if (!response.ok) throw new Error(`加载失败：HTTP ${response.status}`);
  const branches = await response.json();
  return branches[node.value] ?? [];
};
</script>

<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="asyncValue"
      :data="lazyRoots"
      :load-data="loadTreeNodes"
      clearable
      aria-label="异步地区选择"
    />
    <span role="status">已选：{{ asyncValue ?? '未选择' }}</span>
  </div>
</template>
```

:::

`loadData` 必须返回 `Promise<TreeSelectNode[]>`；全树的 `value` 必须唯一。
加载结果不写入传入的 `data`。收起分支、关闭面板、禁用、替换数据和卸载时会中止自动请求；
即使请求不响应 `AbortSignal`，过期结果也不会进入组件。返回空数组会将分支视为叶子，仍可通过
`reloadNode(value)` 重新获取。搜索仅过滤已加载数据，不会主动下载所有隐藏分支。

级联多选中，已确认父节点的后加载可用子节点继承其勾选状态；加载本身不产生模型变更请求。
`default-expand-all` 和 `expandAll()` 展开当前已知节点，不会递归下载未知层级。

## 大数据虚拟滚动

::: raw

<div class="demo-container">
  <ExTreeSelect v-model="virtualValue" :data="virtualData" virtual :height="264" :item-height="44" filterable clearable aria-label="五千节点选择" />
  <span role="status">已选：{{ virtualValue ?? '未选择' }}</span>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const virtualValue = ref(null);
const virtualData = Array.from({ length: 5000 }, (_, value) => ({
  value,
  label: `资源节点 ${value}`,
}));
</script>

<template>
  <div class="demo-container">
    <ExTreeSelect
      v-model="virtualValue"
      :data="virtualData"
      virtual
      :height="264"
      :item-height="44"
      filterable
      clearable
      aria-label="五千节点选择"
    />
    <span role="status">已选：{{ virtualValue ?? '未选择' }}</span>
  </div>
</template>
```

:::

启用 `virtual` 后只创建可见窗口及缓冲节点。`height`、`item-height` 为像素值；
方向键、Home、End 会先滚动到目标，再移动焦点，节点仍保留完整层级与兄弟位置语义。

## API

### Props

| 属性                  | 说明                            | 类型                                | 默认值         |
| --------------------- | ------------------------------- | ----------------------------------- | -------------- |
| model-value / v-model | 绑定值：单选为值，多选为值数组  | `string \| number \| Array \| null` | `null`         |
| data                  | 树形数据                        | `TreeSelectNode[]`                  | `[]`           |
| load-data             | 异步子节点加载器                | `TreeSelectLoadData`                | —              |
| virtual               | 开启虚拟滚动                    | `boolean`                           | `false`        |
| height                | 树区域高度（像素）              | `number`                            | `264`          |
| item-height           | 虚拟节点行高（像素）            | `number`                            | `44`           |
| virtual-buffer        | 上下预渲染节点数量              | `number`                            | `4`            |
| multiple              | 是否多选（显示复选框）          | `boolean`                           | `false`        |
| check-strictly        | 多选时父子节点选中状态不关联    | `boolean`                           | `false`        |
| disabled              | 是否禁用                        | `boolean`                           | `false`        |
| clearable             | 是否可清空                      | `boolean`                           | `false`        |
| filterable            | 是否可搜索过滤                  | `boolean`                           | `false`        |
| placeholder           | 占位文本                        | `string`                            | 内置「请选择」 |
| size                  | 尺寸                            | `'small' \| 'medium' \| 'large'`    | 跟随全局配置   |
| default-expand-all    | 是否默认展开全部                | `boolean`                           | `false`        |
| collapse-tags         | 多选时折叠超出标签              | `boolean`                           | `false`        |
| teleported            | 弹层是否传送到 body             | `boolean`                           | `true`         |
| popper-class          | 弹层自定义类名                  | `string`                            | —              |
| id                    | 输入框 ID                       | `string`                            | —              |
| aria-label            | 输入框与树弹层的无障碍名称      | `string`                            | 使用占位文本   |
| aria-labelledby       | 输入框与树弹层的外部标签元素 ID | `string`                            | —              |
| aria-describedby      | 关联描述元素 ID                 | `string`                            | —              |

### TreeSelectNode

| 字段     | 说明                             | 类型               |
| -------- | -------------------------------- | ------------------ |
| value    | 节点值（唯一）                   | `string \| number` |
| label    | 节点显示文本                     | `string`           |
| children | 子节点                           | `TreeSelectNode[]` |
| disabled | 是否禁用                         | `boolean`          |
| isLeaf   | 是否为叶子，false 标记待加载分支 | `boolean`          |

### Events

| 事件名             | 说明                   | 类型                         |
| ------------------ | ---------------------- | ---------------------------- |
| update:model-value | 值更新                 | `(value) => void`            |
| change             | 值变化（携带选中节点） | `(value, nodes) => void`     |
| visible-change     | 面板显隐变化           | `(visible: boolean) => void` |
| expand             | 节点展开/收起          | `(keys) => void`             |
| focus / blur       | 焦点事件               | `(e: FocusEvent) => void`    |
| clear              | 清空                   | `() => void`                 |
| load               | 子节点成功加载         | `(node, children) => void`   |
| load-error         | 加载或结构校验失败     | `(error, node) => void`      |

### Methods

| 方法名                  | 说明               | 类型                             |
| ----------------------- | ------------------ | -------------------------------- |
| focus / blur            | 聚焦 / 失焦        | `() => void`                     |
| expandAll / collapseAll | 展开 / 收起全部    | `() => void`                     |
| reloadNode              | 面板打开时重载节点 | `(value) => Promise<boolean>`    |
| cancelNodeLoad          | 中止在途加载       | `(value) => boolean`             |
| getNodeLoadState        | 读取加载状态快照   | `(value) => TreeSelectLoadState` |

## 主题定制

TreeSelect 消费 ExUI 全局设计令牌：

```css
:root {
  --ex-color-bg-secondary: #11151c; /* 触发器背景 */
  --ex-color-bg-elevated: #0d1117; /* 面板背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-color-primary: #29abe2; /* 选中 / 勾选高亮 */
}
```

## 常见问题

**Q：单选和多选的绑定值类型不同吗？**
是的。单选为单个值（或 `null`），多选为值数组。切换 `multiple` 时请同步调整 `v-model` 初值。

**Q：多选时绑定值包含哪些节点？**
默认级联模式下，完全选中的父节点与其子节点都会出现在数组中；半选父节点不计入。开启 `check-strictly` 后仅包含被直接勾选的节点。

**Q：搜索为什么会展开节点？**
为了显示匹配项的完整路径，过滤期间会自动展开命中路径，清空搜索后恢复原展开状态。

## 最佳实践

- **层级数据的选择**（组织架构、地区、分类）用 TreeSelect 比扁平 Select 更直观。
- 多选大数据量时配合 `collapse-tags` 控制触发器高度。
- 通过节点的 `disabled` 精确控制不可选项；级联模式下禁用节点不会被父节点连带勾选。
- 表单中放入 `ExFormItem` 即可参与校验。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
