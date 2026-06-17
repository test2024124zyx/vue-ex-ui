# Dropdown 下拉菜单

向下弹出的列表菜单，用于展示操作选项。

<script setup>
import { ref } from 'vue'

const basicItems = ref([
  { key: '1', label: '选项一' },
  { key: '2', label: '选项二' },
  { key: '3', label: '选项三' },
])

const iconItems = ref([
  { 
    key: '1', 
    label: '编辑', 
    icon: 'https://api.iconify.design/ri/edit-line.svg' 
  },
  { 
    key: '2', 
    label: '删除', 
    icon: 'https://api.iconify.design/ri/delete-bin-line.svg' 
  },
  { 
    key: '3', 
    label: '分享', 
    icon: 'https://api.iconify.design/ri/share-line.svg' 
  },
])

const dividedItems = ref([
  { key: '1', label: '新建文件' },
  { key: '2', label: '新建文件夹' },
  { key: '3', label: '打开', divided: true },
  { key: '4', label: '保存' },
  { key: '5', label: '另存为', divided: true },
  { key: '6', label: '退出' },
])

const disabledItems = ref([
  { key: '1', label: '可用选项' },
  { key: '2', label: '禁用选项', disabled: true },
  { key: '3', label: '可用选项' },
])

const handleItemClick = (item) => {
  console.log('Item clicked:', item)
}
</script>

## 基础用法

最基础的下拉菜单用法。

<div class="demo-container">
  <ExDropdown :items="basicItems" @item-click="handleItemClick">
    <ExButton>
      下拉菜单
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" @item-click="handleItemClick">
    <ExButton>
      下拉菜单
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { key: '1', label: '选项一' },
  { key: '2', label: '选项二' },
  { key: '3', label: '选项三' },
])

const handleItemClick = (item) => {
  console.log('Item clicked:', item)
}
</script>
```

## 带图标

菜单项可以显示图标。

<div class="demo-container">
  <ExDropdown :items="iconItems" @item-click="handleItemClick">
    <ExButton>
      操作
      <template #suffix>
        <img src="https://api.iconify.design/ri/more-line.svg" alt="more" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" @item-click="handleItemClick">
    <ExButton>操作</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { 
    key: '1', 
    label: '编辑', 
    icon: 'https://api.iconify.design/ri/edit-line.svg' 
  },
  { 
    key: '2', 
    label: '删除', 
    icon: 'https://api.iconify.design/ri/delete-bin-line.svg' 
  },
  { 
    key: '3', 
    label: '分享', 
    icon: 'https://api.iconify.design/ri/share-line.svg' 
  },
])

const handleItemClick = (item) => {
  console.log('Item clicked:', item)
}
</script>
```

## 分割线

使用 `divided` 属性可以在菜单项之间添加分割线。

<div class="demo-container">
  <ExDropdown :items="dividedItems" @item-click="handleItemClick">
    <ExButton>
      文件
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" @item-click="handleItemClick">
    <ExButton>文件</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { key: '1', label: '新建文件' },
  { key: '2', label: '新建文件夹' },
  { key: '3', label: '打开', divided: true },
  { key: '4', label: '保存' },
  { key: '5', label: '另存为', divided: true },
  { key: '6', label: '退出' },
])
</script>
```

## 禁用选项

可以禁用某些菜单项。

<div class="demo-container">
  <ExDropdown :items="disabledItems" @item-click="handleItemClick">
    <ExButton>
      选项
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" @item-click="handleItemClick">
    <ExButton>选项</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { key: '1', label: '可用选项' },
  { key: '2', label: '禁用选项', disabled: true },
  { key: '3', label: '可用选项' },
])
</script>
```

## 触发方式

支持 hover、click 和 contextmenu 三种触发方式。

<div class="demo-container" style="display: flex; gap: 16px;">
  <ExDropdown :items="basicItems" trigger="hover" @item-click="handleItemClick">
    <ExButton>悬停触发</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" trigger="click" @item-click="handleItemClick">
    <ExButton>点击触发</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" trigger="contextmenu" @item-click="handleItemClick">
    <ExButton>右键触发</ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <div style="display: flex; gap: 16px;">
    <ExDropdown :items="items" trigger="hover">
      <ExButton>悬停触发</ExButton>
    </ExDropdown>

    <ExDropdown :items="items" trigger="click">
      <ExButton>点击触发</ExButton>
    </ExDropdown>

    <ExDropdown :items="items" trigger="contextmenu">
      <ExButton>右键触发</ExButton>
    </ExDropdown>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { key: '1', label: '选项一' },
  { key: '2', label: '选项二' },
  { key: '3', label: '选项三' },
])
</script>
```

## 弹出位置

支持 12 个不同的弹出位置。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <ExDropdown :items="basicItems" placement="top-start">
    <ExButton>上左</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" placement="top">
    <ExButton>上中</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" placement="top-end">
    <ExButton>上右</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" placement="bottom-start">
    <ExButton>下左</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" placement="bottom">
    <ExButton>下中</ExButton>
  </ExDropdown>

  <ExDropdown :items="basicItems" placement="bottom-end">
    <ExButton>下右</ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" placement="bottom-start">
    <ExButton>下拉菜单</ExButton>
  </ExDropdown>
</template>
```

## 禁用状态

整个下拉菜单可以被禁用。

<div class="demo-container">
  <ExDropdown :items="basicItems" :disabled="true">
    <ExButton disabled>禁用的下拉菜单</ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown :items="items" :disabled="true">
    <ExButton disabled>禁用的下拉菜单</ExButton>
  </ExDropdown>
</template>
```

## API

### Dropdown Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 下拉菜单项列表 | `DropdownItemData[]` | `[]` |
| trigger | 触发方式 | `'hover' \| 'click' \| 'contextmenu'` | `'hover'` |
| placement | 弹出位置 | `DropdownPlacement` | `'bottom-start'` |
| disabled | 是否禁用 | `boolean` | `false` |
| visible | 菜单是否显示 | `boolean` | - |
| aria-label | 无障碍标签 | `string` | - |
| class | 自定义CSS类名 | `string \| string[] \| Record<string, boolean>` | - |
| style | 自定义样式 | `string \| Record<string, string \| number>` | - |

### Dropdown Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| item-click | 菜单项点击时触发 | `(item: DropdownItemData) => void` |
| update:visible | 显示状态改变时触发 | `(visible: boolean) => void` |
| show | 显示时触发 | `() => void` |
| hide | 隐藏时触发 | `() => void` |

### Dropdown Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| show | 显示下拉菜单 | - |
| hide | 隐藏下拉菜单 | - |
| getElement | 获取DOM元素 | - |

### DropdownItem Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 标签文本 | `string` | - |
| icon | 图标URL | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| divided | 是否显示分割线 | `boolean` | `false` |

### Types

#### DropdownItemData

```typescript
interface DropdownItemData {
  /** 唯一标识 */
  key: string | number
  /** 标签文本 */
  label: string
  /** 图标URL */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否分割线 */
  divided?: boolean
  /** 子菜单 */
  children?: DropdownItemData[]
  /** 自定义数据 */
  data?: Record<string, unknown>
}
```

#### DropdownPlacement

```typescript
type DropdownPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
```

#### DropdownTrigger

```typescript
type DropdownTrigger = 'hover' | 'click' | 'contextmenu'
```

## 无障碍支持

- 支持键盘导航
- 提供 ARIA 标签
- 支持屏幕阅读器
- 支持高对比度模式
- 支持减少动画模式

## 主题定制

下拉菜单跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
