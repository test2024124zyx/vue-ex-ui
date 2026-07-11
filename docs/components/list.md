# List 列表

<script setup lang="ts">
import { ref } from 'vue'

const selected = ref('')
const loading = ref(false)
const records = [
  { key: 1, title: '任务中心', description: '查看当前任务', extra: '3 项' },
  { key: 2, title: '角色仓库', description: '管理角色与装备', extra: '12 件' },
  { key: 3, title: '赛季奖励', description: '完成排位后领取', disabled: true },
]

const selectRecord = (item: { title?: string }) => {
  selected.value = item.title ?? ''
}
</script>

## 基础用法

<ExList :data="records" bordered />

```vue
<template>
  <ExList
    :data="records"
    bordered
  />
</template>

<script setup lang="ts">
const records = [
  { key: 1, title: '任务中心', description: '查看当前任务', extra: '3 项' },
  { key: 2, title: '角色仓库', description: '管理角色与装备', extra: '12 件' },
];
</script>
```

## 可点击列表

`clickable` 开启后，每项使用原生 `button type="button"`。禁用项不会发送事件。

<ExList
:data="records"
clickable
hoverable
bordered
@item-click="selectRecord"
/>

<p v-if="selected">当前选择：{{ selected }}</p>

```vue
<ExList :data="records" clickable hoverable @item-click="handleItemClick" />
```

可点击项的内容不应包含嵌套按钮或链接；需要独立操作控件时保持 `clickable="false"` 并使用 `item` 插槽。

## 尺寸与外观

```vue
<ExList :data="records" size="small" />
<ExList :data="records" size="medium" bordered />
<ExList :data="records" size="large" :split="false" />
```

## 响应式网格

<ExList
  :data="records"
  :grid="{ gutter: 12, column: 3, xs: 1, sm: 2, lg: 3 }"
  bordered
/>

```vue
<ExList
  :data="records"
  :grid="{
    gutter: 16,
    column: 4,
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  }"
/>
```

## 自定义内容

```vue
<ExList :data="records">
  <template #icon="{ item }">
    <ExAvatar :text="item.title?.slice(0, 1)" />
  </template>
  <template #title="{ item }">
    <strong>{{ item.title }}</strong>
  </template>
  <template #extra="{ item, index }">
    {{ index + 1 }} · {{ item.extra }}
  </template>
</ExList>
```

`item` 插槽会完整替换单项的内置内容。

```vue
<ExList :data="records">
  <template #item="{ item }">
    <article>{{ item.title }}</article>
  </template>
</ExList>
```

## 空态与加载态

```vue
<ExList :data="[]" empty-text="没有匹配记录" />

<ExList :data="records" :loading="loading" loading-text="刷新列表" />

<ExList :data="[]">
  <template #empty>
    <ExEmpty description="当前分类为空" />
  </template>
</ExList>
```

大数据窗口化使用独立的 `ExVirtualList`。

## API

### Props

| 参数         | 类型                                               | 默认值     |
| ------------ | -------------------------------------------------- | ---------- |
| data         | `readonly ListItem[]`                              | `[]`       |
| size         | `'small' \| 'medium' \| 'large'`                   | 全局尺寸   |
| bordered     | `boolean`                                          | `false`    |
| split        | `boolean`                                          | `true`     |
| hoverable    | `boolean`                                          | `false`    |
| loading      | `boolean`                                          | `false`    |
| loading-text | `string`                                           | 本地化文案 |
| empty-text   | `string`                                           | 本地化文案 |
| item-key     | `string \| ((item, index) => PropertyKey \| null)` | `'key'`    |
| grid         | `ListGrid`                                         | —          |
| clickable    | `boolean`                                          | `false`    |

原生 `class`、`style`、`aria-*` 与 `data-*` 属性会透传到根元素。

### ListGrid

| 字段                         | 类型     | 默认值       |
| ---------------------------- | -------- | ------------ |
| gutter                       | `number` | `0`          |
| column                       | `number` | `4`          |
| xs / sm / md / lg / xl / xxl | `number` | 继承较小断点 |

列数规范为 1 至 24 的整数；非法断点继承最近有效列数。

### ListItem

| 字段        | 类型          |
| ----------- | ------------- |
| key         | `PropertyKey` |
| title       | `string`      |
| description | `string`      |
| icon        | `string`      |
| avatar      | `string`      |
| extra       | `string`      |
| disabled    | `boolean`     |

### Events

| 事件名     | 参数                                                         |
| ---------- | ------------------------------------------------------------ |
| item-click | `(item: ListItem, index: number, event: MouseEvent) => void` |

### Slots

| 插槽名      | 参数                                |
| ----------- | ----------------------------------- |
| item        | `{ item: ListItem, index: number }` |
| icon        | `{ item: ListItem, index: number }` |
| title       | `{ item: ListItem, index: number }` |
| description | `{ item: ListItem, index: number }` |
| extra       | `{ item: ListItem, index: number }` |
| empty       | —                                   |

### Exposes

| 方法名     | 返回值                   |
| ---------- | ------------------------ |
| getElement | `HTMLDivElement \| null` |
