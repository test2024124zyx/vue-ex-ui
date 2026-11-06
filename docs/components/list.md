# List 列表

用于连续展示结构相近的数据项。

<script setup>
const projectItems = [
  {
    key: 'aurora',
    title: 'Aurora 数据中台',
    description: '核心指标体系已完成验收',
    extra: '今天 16:20'
  },
  {
    key: 'atlas',
    title: 'Atlas 客户平台',
    description: '正在进行第二阶段灰度发布',
    extra: '昨天 11:45'
  },
  {
    key: 'nova',
    title: 'Nova 营销增长',
    description: '等待业务负责人确认排期',
    extra: '7 月 8 日'
  }
]

const memberItems = [
  { key: 'lin', title: '林知远', description: '产品负责人', status: '在线' },
  { key: 'zhou', title: '周予安', description: '交互设计师', status: '会议中' },
  { key: 'chen', title: '陈嘉树', description: '前端工程师', status: '在线' },
  { key: 'xu', title: '许清和', description: '客户成功经理', status: '外出' }
]
</script>

## 基础列表

::: raw
<div class="vp-raw demo-container">
  <ex-list :data="projectItems" item-key="key" bordered />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const projectItems = [
  {
    key: 'aurora',
    title: 'Aurora 数据中台',
    description: '核心指标体系已完成验收',
    extra: '今天 16:20',
  },
  {
    key: 'atlas',
    title: 'Atlas 客户平台',
    description: '正在进行第二阶段灰度发布',
    extra: '昨天 11:45',
  },
  {
    key: 'nova',
    title: 'Nova 营销增长',
    description: '等待业务负责人确认排期',
    extra: '7 月 8 日',
  },
];
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-list
      :data="projectItems"
      item-key="key"
      bordered
    />
  </div>
</template>
```

:::

## 可点击与自定义内容

::: raw
<div class="vp-raw demo-container">
  <ex-list :data="memberItems" item-key="key" clickable hoverable bordered>
    <template #icon="{ index }">
      <ex-avatar :text="memberItems[index].title" :size="40" />
    </template>
    <template #extra="{ item }">
      <ex-tag size="small" :type="item.status === '在线' ? 'success' : 'info'">
        {{ item.status }}
      </ex-tag>
    </template>
  </ex-list>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const memberItems = [
  { key: 'lin', title: '林知远', description: '产品负责人', status: '在线' },
  { key: 'zhou', title: '周予安', description: '交互设计师', status: '会议中' },
  { key: 'chen', title: '陈嘉树', description: '前端工程师', status: '在线' },
  { key: 'xu', title: '许清和', description: '客户成功经理', status: '外出' },
];
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-list
      :data="memberItems"
      item-key="key"
      clickable
      hoverable
      bordered
    >
      <template #icon="{ index }">
        <ex-avatar
          :text="memberItems[index].title"
          :size="40"
        />
      </template>
      <template #extra="{ item }">
        <ex-tag
          size="small"
          :type="item.status === '在线' ? 'success' : 'info'"
        >
          {{ item.status }}
        </ex-tag>
      </template>
    </ex-list>
  </div>
</template>
```

:::

## 响应式网格

::: raw
<div class="vp-raw demo-container">
  <ex-list
    :data="memberItems"
    :grid="{ gutter: 16, xs: 1, sm: 2, lg: 4 }"
    item-key="key"
    bordered
    hoverable
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const memberItems = [
  { key: 'lin', title: '林知远', description: '产品负责人', status: '在线' },
  { key: 'zhou', title: '周予安', description: '交互设计师', status: '会议中' },
  { key: 'chen', title: '陈嘉树', description: '前端工程师', status: '在线' },
  { key: 'xu', title: '许清和', description: '客户成功经理', status: '外出' },
];
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-list
      :data="memberItems"
      :grid="{ gutter: 16, xs: 1, sm: 2, lg: 4 }"
      item-key="key"
      bordered
      hoverable
    />
  </div>
</template>
```

:::

## 空状态与加载状态

::: raw
<div class="vp-raw demo-container list-state-grid">
  <ex-list :data="[]" empty-text="暂无待处理事项" bordered />
  <ex-list :data="projectItems" loading loading-text="正在同步项目" bordered />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const projectItems = [
  {
    key: 'aurora',
    title: 'Aurora 数据中台',
    description: '核心指标体系已完成验收',
    extra: '今天 16:20',
  },
  {
    key: 'atlas',
    title: 'Atlas 客户平台',
    description: '正在进行第二阶段灰度发布',
    extra: '昨天 11:45',
  },
  {
    key: 'nova',
    title: 'Nova 营销增长',
    description: '等待业务负责人确认排期',
    extra: '7 月 8 日',
  },
];
</script>

<template>
  <div class="vp-raw demo-container list-state-grid">
    <ex-list
      :data="[]"
      empty-text="暂无待处理事项"
      bordered
    />
    <ex-list
      :data="projectItems"
      loading
      loading-text="正在同步项目"
      bordered
    />
  </div>
</template>
```

:::

## API

### Props

| 参数          | 说明                               | 类型                                       | 默认值       |
| ------------- | ---------------------------------- | ------------------------------------------ | ------------ |
| `data`        | 列表数据                           | `readonly ListItem[]`                      | `[]`         |
| `size`        | 尺寸                               | `small \| medium \| large`                 | 继承全局尺寸 |
| `bordered`    | 是否显示外边框                     | `boolean`                                  | `false`      |
| `split`       | 是否显示分割线                     | `boolean`                                  | `true`       |
| `hoverable`   | 是否显示悬停反馈                   | `boolean`                                  | `false`      |
| `loading`     | 是否加载中                         | `boolean`                                  | `false`      |
| `loadingText` | 加载文案                           | `string`                                   | 本地化文案   |
| `emptyText`   | 空状态文案                         | `string`                                   | 本地化文案   |
| `itemKey`     | 唯一键字段或解析函数               | `string \| ((item, index) => PropertyKey)` | `key`        |
| `grid`        | 响应式网格配置                     | `ListGrid`                                 | —            |
| `clickable`   | 是否为每项生成同级的原生主操作按钮 | `boolean`                                  | `false`      |

`ListItem` 支持 `key`、`title`、`description`、`icon`、`avatar`、`extra`、`disabled` 和 `ariaLabel` 字段。主操作按钮优先使用 `ariaLabel`，其次使用标题或说明；插槽内的交互控件保持独立语义且不会重复触发 `item-click`。

### Events

| 事件名       | 参数                                                 |
| ------------ | ---------------------------------------------------- |
| `item-click` | `(item: ListItem, index: number, event: MouseEvent)` |

### Slots

| 名称          | 参数              |
| ------------- | ----------------- |
| `item`        | `{ item, index }` |
| `icon`        | `{ item, index }` |
| `title`       | `{ item, index }` |
| `description` | `{ item, index }` |
| `extra`       | `{ item, index }` |
| `empty`       | —                 |

### Exposes

| 方法         | 类型                           |
| ------------ | ------------------------------ |
| `getElement` | `() => HTMLDivElement \| null` |

<style scoped>
.list-state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
</style>
