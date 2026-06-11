# Tree 树形控件

用清晰的层级结构展示信息，可展开或折叠。

<script setup>
import { ref } from 'vue'

const treeData = ref([
  {
    key: '1',
    label: '游戏目录',
    children: [
      {
        key: '1-1',
        label: '角色',
        children: [
          { key: '1-1-1', label: '战士.png' },
          { key: '1-1-2', label: '法师.png' },
          { key: '1-1-3', label: '刺客.png' },
        ],
      },
      {
        key: '1-2',
        label: '装备',
        children: [
          { key: '1-2-1', label: '武器.json' },
          { key: '1-2-2', label: '防具.json' },
        ],
      },
    ],
  },
  {
    key: '2',
    label: '配置文件',
    children: [
      { key: '2-1', label: 'config.json' },
      { key: '2-2', label: 'settings.json' },
    ],
  },
])

const selectedKeys = ref([])
const checkedKeys = ref([])
const expandedKeys = ref(['1'])

const handleSelect = (keys, node) => {
  console.log('Selected:', keys, node)
}

const handleCheck = (keys, node) => {
  console.log('Checked:', keys, node)
}

const handleNodeClick = (node) => {
  console.log('Node clicked:', node)
}
</script>

## 基础用法

最基础的树形控件用法。

<div class="demo-container">
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1']"
    @select="handleSelect"
    @node-click="handleNodeClick"
  />
</div>

```vue
<script setup>
import { ref } from 'vue'

const treeData = ref([
  {
    key: '1',
    label: '游戏目录',
    children: [
      {
        key: '1-1',
        label: '角色',
        children: [
          { key: '1-1-1', label: '战士.png' },
          { key: '1-1-2', label: '法师.png' },
        ],
      },
    ],
  },
])
</script>

<template>
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1']"
  />
</template>
```

## 可勾选

适用于需要选择层级时使用。

<div class="demo-container">
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1']"
    checkable
    @check="handleCheck"
  />
</div>

```vue
<template>
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1']"
    checkable
    @check="handleCheck"
  />
</template>
```

## 默认展开所有

默认展开所有节点。

<div class="demo-container">
  <ExTree
    :data="treeData"
    default-expand-all
  />
</div>

```vue
<template>
  <ExTree
    :data="treeData"
    default-expand-all
  />
</template>
```

## 显示连接线

显示节点之间的连接线。

<div class="demo-container">
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1', '1-1']"
    show-line
  />
</div>

```vue
<template>
  <ExTree
    :data="treeData"
    :default-expanded-keys="['1', '1-1']"
    show-line
  />
</template>
```

## 禁用节点

通过设置节点的 `disabled` 属性可以禁用节点。

<div class="demo-container">
  <ExTree
    :data="[
      {
        key: '1',
        label: '可用节点',
        children: [
          { key: '1-1', label: '子节点 1' },
          { key: '1-2', label: '禁用节点', disabled: true },
        ],
      },
    ]"
    :default-expanded-keys="['1']"
    checkable
  />
</div>

```vue
<template>
  <ExTree
    :data="[
      {
        key: '1',
        label: '可用节点',
        children: [
          { key: '1-1', label: '子节点 1' },
          { key: '1-2', label: '禁用节点', disabled: true },
        ],
      },
    ]"
    checkable
  />
</template>
```

## 自定义图标

可以为节点设置自定义图标。

<div class="demo-container">
  <ExTree
    :data="[
      {
        key: '1',
        label: '游戏资源',
        icon: 'https://api.iconify.design/ri/gamepad-line.svg',
        children: [
          {
            key: '1-1',
            label: '图片',
            icon: 'https://api.iconify.design/ri/image-line.svg',
          },
          {
            key: '1-2',
            label: '音频',
            icon: 'https://api.iconify.design/ri/music-line.svg',
          },
          {
            key: '1-3',
            label: '视频',
            icon: 'https://api.iconify.design/ri/video-line.svg',
          },
        ],
      },
    ]"
    :default-expanded-keys="['1']"
  />
</div>

```vue
<template>
  <ExTree
    :data="[
      {
        key: '1',
        label: '游戏资源',
        icon: 'https://api.iconify.design/ri/gamepad-line.svg',
        children: [
          {
            key: '1-1',
            label: '图片',
            icon: 'https://api.iconify.design/ri/image-line.svg',
          },
        ],
      },
    ]"
  />
</template>
```

## 赛博朋克主题示例

展示赛博朋克风格的树形控件应用场景。

<div class="demo-container" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(255, 0, 127, 0.05)); padding: 32px;">
  <h3 style="margin: 0 0 16px; color: var(--ex-color-neon-blue-500); font-family: var(--ex-font-primary); text-transform: uppercase;">
    游戏技能树
  </h3>
  <ExTree
    :data="[
      {
        key: 'warrior',
        label: '战士技能',
        icon: 'https://api.iconify.design/ri/sword-line.svg',
        children: [
          {
            key: 'warrior-attack',
            label: '攻击系',
            children: [
              { key: 'warrior-attack-1', label: '重击 Lv.5' },
              { key: 'warrior-attack-2', label: '旋风斩 Lv.3' },
              { key: 'warrior-attack-3', label: '破甲 Lv.1', disabled: true },
            ],
          },
          {
            key: 'warrior-defense',
            label: '防御系',
            children: [
              { key: 'warrior-defense-1', label: '铁壁 Lv.4' },
              { key: 'warrior-defense-2', label: '格挡 Lv.2' },
            ],
          },
        ],
      },
      {
        key: 'mage',
        label: '法师技能',
        icon: 'https://api.iconify.design/ri/magic-line.svg',
        children: [
          {
            key: 'mage-fire',
            label: '火系',
            children: [
              { key: 'mage-fire-1', label: '火球术 Lv.5' },
              { key: 'mage-fire-2', label: '火墙 Lv.3' },
            ],
          },
          {
            key: 'mage-ice',
            label: '冰系',
            children: [
              { key: 'mage-ice-1', label: '冰箭 Lv.4' },
              { key: 'mage-ice-2', label: '冰冻 Lv.2' },
            ],
          },
        ],
      },
    ]"
    :default-expanded-keys="['warrior', 'warrior-attack']"
    checkable
    show-line
  />
</div>

```vue
<template>
  <ExTree
    :data="skillTreeData"
    :default-expanded-keys="['warrior', 'warrior-attack']"
    checkable
    show-line
  />
</template>
```

## API

### Tree Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 树节点数据 | `TreeNode[]` | `[]` |
| `default-expanded-keys` | 默认展开的节点 key 数组 | `string[]` | `[]` |
| `expanded-keys` / `v-model:expanded-keys` | 展开的节点 key 数组（受控） | `string[]` | — |
| `default-selected-keys` | 默认选中的节点 key 数组 | `string[]` | `[]` |
| `selected-keys` / `v-model:selected-keys` | 选中的节点 key 数组（受控） | `string[]` | — |
| `default-checked-keys` | 默认勾选的节点 key 数组 | `string[]` | `[]` |
| `checked-keys` / `v-model:checked-keys` | 勾选的节点 key 数组（受控） | `string[]` | — |
| `selectable` | 是否可选择 | `boolean` | `true` |
| `multiple` | 是否多选 | `boolean` | `false` |
| `checkable` | 是否显示复选框 | `boolean` | `false` |
| `check-strictly` | 勾选时是否级联 | `boolean` | `false` |
| `default-expand-all` | 是否默认展开所有节点 | `boolean` | `false` |
| `show-line` | 是否显示连接线 | `boolean` | `false` |
| `show-icon` | 是否显示图标 | `boolean` | `true` |
| `draggable` | 是否可拖拽 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `filter-node-method` | 过滤函数 | `(value: string, node: TreeNode) => boolean` | — |

### TreeNode 数据结构

| 属性 | 说明 | 类型 | 必填 |
| --- | --- | --- | --- |
| `key` | 节点唯一标识 | `string` | 是 |
| `label` | 节点标题 | `string` | 是 |
| `children` | 子节点 | `TreeNode[]` | 否 |
| `disabled` | 是否禁用 | `boolean` | 否 |
| `selectable` | 是否可选择 | `boolean` | 否 |
| `checkable` | 是否可勾选 | `boolean` | 否 |
| `isLeaf` | 是否为叶子节点 | `boolean` | 否 |
| `icon` | 图标 URL | `string` | 否 |
| `data` | 自定义数据 | `any` | 否 |

### Tree Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `update:expanded-keys` | 展开/收起节点时触发 | `(keys: string[]) => void` |
| `update:selected-keys` | 选中节点时触发 | `(keys: string[]) => void` |
| `update:checked-keys` | 勾选节点时触发 | `(keys: string[]) => void` |
| `expand` | 节点展开时触发 | `(expandedKeys: string[], node: TreeNode, expanded: boolean) => void` |
| `select` | 节点选中时触发 | `(selectedKeys: string[], node: TreeNode, selected: boolean) => void` |
| `check` | 节点勾选时触发 | `(checkedKeys: string[], node: TreeNode, checked: boolean) => void` |
| `node-click` | 节点点击时触发 | `(node: TreeNode, event: MouseEvent) => void` |
| `node-contextmenu` | 节点右键点击时触发 | `(node: TreeNode, event: MouseEvent) => void` |

### Tree Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getSelectedNodes` | 获取当前选中的节点 | `() => TreeNode[]` |
| `getCheckedNodes` | 获取当前勾选的节点 | `() => TreeNode[]` |
| `getHalfCheckedNodes` | 获取半选中的节点 | `() => TreeNode[]` |
| `setSelected` | 设置某个节点的选中状态 | `(key: string, selected: boolean) => void` |
| `setChecked` | 设置某个节点的勾选状态 | `(key: string, checked: boolean) => void` |
| `setExpanded` | 设置某个节点的展开状态 | `(key: string, expanded: boolean) => void` |
| `getNode` | 获取节点 | `(key: string) => TreeNode \| null` |
| `expandAll` | 展开所有节点 | `() => void` |
| `collapseAll` | 收起所有节点 | `() => void` |
| `filter` | 过滤节点 | `(value: string) => void` |
| `getElement` | 获取组件DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签和 ARIA 属性
- 完整的键盘导航支持
- 支持屏幕阅读器
- 支持减少动画偏好设置

## 主题定制

可以通过 CSS 变量自定义树形控件样式：

```css
:root {
  --ex-tree-node-bg: var(--ex-color-bg-secondary);
  --ex-tree-node-hover-bg: var(--ex-color-bg-hover);
  --ex-tree-node-selected-bg: rgba(41, 171, 226, 0.1);
  --ex-tree-node-color: var(--ex-color-text-primary);
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
