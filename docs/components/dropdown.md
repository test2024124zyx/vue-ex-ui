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
  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">
      下拉菜单
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">
      下拉菜单
      <template #suffix>
        <img
          src="https://api.iconify.design/ri/arrow-down-s-line.svg"
          alt="arrow"
          width="16"
          height="16"
        />
      </template>
    </ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  { key: '1', label: '选项一' },
  { key: '2', label: '选项二' },
  { key: '3', label: '选项三' },
]);

const handleItemClick = item => {
  console.log('Item clicked:', item);
};
</script>
```

## 带图标

菜单项可以显示图标。

<div class="demo-container">
  <ExDropdown v-slot="{ triggerProps }" :items="iconItems" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">
      操作
      <template #suffix>
        <img src="https://api.iconify.design/ri/more-line.svg" alt="more" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">操作</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  {
    key: '1',
    label: '编辑',
    icon: 'https://api.iconify.design/ri/edit-line.svg',
  },
  {
    key: '2',
    label: '删除',
    icon: 'https://api.iconify.design/ri/delete-bin-line.svg',
  },
  {
    key: '3',
    label: '分享',
    icon: 'https://api.iconify.design/ri/share-line.svg',
  },
]);

const handleItemClick = item => {
  console.log('Item clicked:', item);
};
</script>
```

## 分割线

使用 `divided` 属性可以在菜单项之间添加分割线。

<div class="demo-container">
  <ExDropdown v-slot="{ triggerProps }" :items="dividedItems" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">
      文件
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">文件</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  { key: '1', label: '新建文件' },
  { key: '2', label: '新建文件夹' },
  { key: '3', label: '打开', divided: true },
  { key: '4', label: '保存' },
  { key: '5', label: '另存为', divided: true },
  { key: '6', label: '退出' },
]);
</script>
```

## 禁用选项

可以禁用某些菜单项。

<div class="demo-container">
  <ExDropdown v-slot="{ triggerProps }" :items="disabledItems" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">
      选项
      <template #suffix>
        <img src="https://api.iconify.design/ri/arrow-down-s-line.svg" alt="arrow" width="16" height="16" />
      </template>
    </ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">选项</ExButton>
  </ExDropdown>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  { key: '1', label: '可用选项' },
  { key: '2', label: '禁用选项', disabled: true },
  { key: '3', label: '可用选项' },
]);
</script>
```

## 触发方式

支持 hover、click 和 contextmenu 三种触发方式。

<div class="demo-container" style="display: flex; gap: 16px;">
  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" trigger="hover" @item-click="handleItemClick">
    <ExButton v-bind="triggerProps">悬停触发</ExButton>
  </ExDropdown>

<ExDropdown v-slot="{ triggerProps }" :items="basicItems" trigger="click" @item-click="handleItemClick">
<ExButton v-bind="triggerProps">点击触发</ExButton>
</ExDropdown>

<ExDropdown v-slot="{ triggerProps }" :items="basicItems" trigger="contextmenu" @item-click="handleItemClick">
<ExButton v-bind="triggerProps">右键触发</ExButton>
</ExDropdown>

</div>

```vue
<template>
  <div style="display: flex; gap: 16px;">
    <ExDropdown v-slot="{ triggerProps }" :items="items" trigger="hover">
      <ExButton v-bind="triggerProps">悬停触发</ExButton>
    </ExDropdown>

    <ExDropdown v-slot="{ triggerProps }" :items="items" trigger="click">
      <ExButton v-bind="triggerProps">点击触发</ExButton>
    </ExDropdown>

    <ExDropdown v-slot="{ triggerProps }" :items="items" trigger="contextmenu">
      <ExButton v-bind="triggerProps">右键触发</ExButton>
    </ExDropdown>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  { key: '1', label: '选项一' },
  { key: '2', label: '选项二' },
  { key: '3', label: '选项三' },
]);
</script>
```

## 弹出位置

支持 12 个不同的弹出位置。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="top-start">
    <ExButton v-bind="triggerProps">上左</ExButton>
  </ExDropdown>

  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="top">
    <ExButton v-bind="triggerProps">上中</ExButton>
  </ExDropdown>

  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="top-end">
    <ExButton v-bind="triggerProps">上右</ExButton>
  </ExDropdown>

  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="bottom-start">
    <ExButton v-bind="triggerProps">下左</ExButton>
  </ExDropdown>

  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="bottom">
    <ExButton v-bind="triggerProps">下中</ExButton>
  </ExDropdown>

  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" placement="bottom-end">
    <ExButton v-bind="triggerProps">下右</ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" placement="bottom-start">
    <ExButton v-bind="triggerProps">下拉菜单</ExButton>
  </ExDropdown>
</template>
```

## 禁用状态

整个下拉菜单可以被禁用。

<div class="demo-container">
  <ExDropdown v-slot="{ triggerProps }" :items="basicItems" :disabled="true">
    <ExButton v-bind="triggerProps" disabled>禁用的下拉菜单</ExButton>
  </ExDropdown>
</div>

```vue
<template>
  <ExDropdown v-slot="{ triggerProps }" :items="items" :disabled="true">
    <ExButton v-bind="triggerProps" disabled>禁用的下拉菜单</ExButton>
  </ExDropdown>
</template>
```

## API

### Dropdown Props

| 属性                | 说明                                   | 类型                                  | 默认值           |
| ------------------- | -------------------------------------- | ------------------------------------- | ---------------- |
| items               | 数据驱动菜单项                         | `DropdownItemData[]`                  | `[]`             |
| trigger             | 触发方式                               | `'hover' \| 'click' \| 'contextmenu'` | `'hover'`        |
| placement           | 首选弹出位置                           | `DropdownPlacement`                   | `'bottom-start'` |
| disabled            | 是否禁用打开请求                       | `boolean`                             | `false`          |
| visible             | 受控显示状态；未传入时内部管理         | `boolean`                             | -                |
| aria-label          | 菜单的显式无障碍名称                   | `string`                              | -                |
| offset              | 弹层间距，单位像素                     | `number`                              | `8`              |
| match-trigger-width | 是否精确匹配触发器宽度                 | `boolean`                             | `false`          |
| flip                | 首选方向空间不足时是否翻转             | `boolean`                             | `true`           |
| viewport-padding    | 浮层与视口边缘的安全距离               | `number`                              | `8`              |
| show-delay          | hover 打开延迟，单位毫秒               | `number`                              | `0`              |
| hide-delay          | hover 关闭延迟，单位毫秒               | `number`                              | `150`            |
| hide-on-click       | 选择菜单项后是否关闭                   | `boolean`                             | `true`           |
| z-index             | 自定义层级；未设置时跟随全局配置       | `number`                              | 全局层级 + 20    |

### Dropdown Events

| 事件名         | 说明               | 类型                               |
| -------------- | ------------------ | ---------------------------------- |
| item-click     | 菜单项点击时触发   | `(item: DropdownItemData) => void` |
| update:visible | 显示状态改变时触发 | `(visible: boolean) => void`       |
| show           | 状态真正变为显示时触发 | `() => void`                    |
| hide           | 状态真正变为隐藏时触发 | `() => void`                    |

### Dropdown Methods

| 方法名         | 说明                 | 类型                           |
| -------------- | -------------------- | ------------------------------ |
| show           | 请求显示下拉菜单     | `() => void`                   |
| hide           | 请求隐藏下拉菜单     | `() => void`                   |
| updatePosition | 立即重新计算浮层位置 | `() => void`                   |
| getElement     | 获取根元素           | `() => HTMLDivElement \| null` |

### Dropdown Slots

| 名称    | 说明                                                     |
| ------- | -------------------------------------------------------- |
| default | 触发控件；提供 `open`、`disabled` 和 `triggerProps` 参数 |
| menu    | 自定义菜单项内容                                         |

实际触发控件应绑定 `v-bind="triggerProps"`，保证 `aria-expanded`、`aria-controls` 与禁用语义落在唯一的交互元素上。

### DropdownItem Props

| 属性     | 说明           | 类型      | 默认值  |
| -------- | -------------- | --------- | ------- |
| label    | 标签文本       | `string`  | -       |
| icon     | 图标URL        | `string`  | -       |
| disabled | 是否禁用       | `boolean` | `false` |
| divided  | 是否显示分割线 | `boolean` | `false` |
| id       | 菜单项元素 id  | `string`  | 自动生成 |

### Types

#### DropdownItemData

```typescript
interface DropdownItemData {
  /** 唯一标识 */
  key: string | number;
  /** 标签文本 */
  label: string;
  /** 图标URL */
  icon?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否分割线 */
  divided?: boolean;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}
```

#### DropdownPlacement

```typescript
type DropdownPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
```

#### DropdownTrigger

```typescript
type DropdownTrigger = 'hover' | 'click' | 'contextmenu';
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
