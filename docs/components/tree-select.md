# TreeSelect 树选择

在下拉面板中以树形结构选择，支持单选、多选（级联勾选）与搜索。

<script setup>
import { ref } from 'vue'

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
</script>

## 基础用法

单选模式，点击节点即选中并关闭。

<div class="demo-container">
  <ExTreeSelect v-model="single" :data="treeData" placeholder="请选择区域" clearable />
  <span style="color: var(--ex-color-text-secondary);">值：{{ single ?? '（空）' }}</span>
</div>

```vue
<template>
  <ExTreeSelect v-model="value" :data="treeData" clearable />
</template>

<script setup>
import { ref } from 'vue'
const value = ref(null)
const treeData = [
  { value: 'tokyo', label: 'Neo Tokyo', children: [
    { value: 'shibuya', label: '涩谷区' },
  ]},
]
</script>
```

## 多选（级联勾选）

设置 `multiple` 显示复选框，勾选父节点会级联选中子节点，子节点状态回溯影响父节点（半选）。

<div class="demo-container">
  <ExTreeSelect v-model="multi" :data="treeData" multiple clearable default-expand-all placeholder="请选择" />
  <span style="color: var(--ex-color-text-secondary);">已选 {{ multi.length }} 项</span>
</div>

```vue
<template>
  <ExTreeSelect v-model="value" :data="treeData" multiple clearable default-expand-all />
</template>

<script setup>
import { ref } from 'vue'
const value = ref([])
</script>
```

## 父子不关联

设置 `check-strictly`，父子节点的勾选状态相互独立。

<div class="demo-container">
  <ExTreeSelect v-model="strict" :data="treeData" multiple check-strictly default-expand-all placeholder="独立勾选" />
</div>

```vue
<template>
  <ExTreeSelect v-model="value" :data="treeData" multiple check-strictly />
</template>
```

## 可搜索

设置 `filterable`，输入关键字过滤节点（自动展开匹配路径）。

<div class="demo-container">
  <ExTreeSelect v-model="searchVal" :data="treeData" filterable clearable placeholder="输入关键字搜索" />
</div>

```vue
<template>
  <ExTreeSelect v-model="value" :data="treeData" filterable clearable />
</template>
```

## 禁用

整体禁用，或对单个节点设置 `disabled`（如示例中的 “Westbrook”）。

<div class="demo-container">
  <ExTreeSelect v-model="single" :data="treeData" disabled placeholder="已禁用" />
</div>

```vue
<template>
  <ExTreeSelect v-model="value" :data="treeData" disabled />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 绑定值：单选为值，多选为值数组 | `string \| number \| Array \| null` | `null` |
| data | 树形数据 | `TreeSelectNode[]` | `[]` |
| multiple | 是否多选（显示复选框） | `boolean` | `false` |
| check-strictly | 多选时父子节点选中状态不关联 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| filterable | 是否可搜索过滤 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | 内置「请选择」 |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | 跟随全局配置 |
| default-expand-all | 是否默认展开全部 | `boolean` | `false` |
| collapse-tags | 多选时折叠超出标签 | `boolean` | `false` |
| teleported | 弹层是否传送到 body | `boolean` | `true` |
| popper-class | 弹层自定义类名 | `string` | — |

### TreeSelectNode

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| value | 节点值（唯一） | `string \| number` |
| label | 节点显示文本 | `string` |
| children | 子节点 | `TreeSelectNode[]` |
| disabled | 是否禁用 | `boolean` |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| update:model-value | 值更新 | `(value) => void` |
| change | 值变化（携带选中节点） | `(value, nodes) => void` |
| visible-change | 面板显隐变化 | `(visible: boolean) => void` |
| expand | 节点展开/收起 | `(keys) => void` |
| focus / blur | 焦点事件 | `(e: FocusEvent) => void` |
| clear | 清空 | `() => void` |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| focus / blur | 聚焦 / 失焦 | `() => void` |
| expandAll / collapseAll | 展开 / 收起全部 | `() => void` |

## 主题定制

TreeSelect 消费 ExUI 全局设计令牌：

```css
:root {
  --ex-color-bg-secondary: #11151c;   /* 触发器背景 */
  --ex-color-bg-elevated: #0d1117;    /* 面板背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-color-primary: #29abe2;        /* 选中 / 勾选高亮 */
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
