# Table 表格

用于展示行列数据，适合游戏排行榜、玩家数据、装备列表等场景。

<script setup>
import { ref } from 'vue'

// 基础数据
const columns = [
  { key: 'rank', title: '排名', width: 80, align: 'center' },
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'score', title: '分数', dataIndex: 'score', sortable: true, align: 'right' },
  { key: 'kd', title: 'K/D', dataIndex: 'kd', sortable: true, align: 'center' },
  { key: 'winRate', title: '胜率', dataIndex: 'winRate', sortable: true, align: 'center' },
]

const data = [
  { key: 1, rank: '🥇', player: 'Player001', score: 9850, kd: '3.2', winRate: '68%' },
  { key: 2, rank: '🥈', player: 'Player002', score: 9520, kd: '2.8', winRate: '65%' },
  { key: 3, rank: '🥉', player: 'Player003', score: 9180, kd: '2.5', winRate: '62%' },
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
]

// 装备数据
const equipmentColumns = [
  { key: 'name', title: '装备名称', dataIndex: 'name', width: 200 },
  { key: 'type', title: '类型', dataIndex: 'type', align: 'center' },
  { key: 'level', title: '等级', dataIndex: 'level', sortable: true, align: 'center' },
  { key: 'attack', title: '攻击力', dataIndex: 'attack', sortable: true, align: 'right' },
  { key: 'defense', title: '防御力', dataIndex: 'defense', sortable: true, align: 'right' },
  { key: 'status', title: '状态', dataIndex: 'status', align: 'center' },
]

const equipmentData = [
  { key: 1, name: '烈焰之剑', type: '武器', level: 50, attack: 850, defense: 0, status: '已装备' },
  { key: 2, name: '龙鳞护甲', type: '护甲', level: 48, attack: 0, defense: 920, status: '已装备' },
  { key: 3, name: '疾风之靴', type: '鞋子', level: 45, attack: 120, defense: 380, status: '未装备' },
  { key: 4, name: '暗影斗篷', type: '披风', level: 42, attack: 80, defense: 450, status: '未装备' },
]

const loading = ref(false)
</script>

## 基础用法

最基础的表格用法，展示游戏排行榜数据。

<div class="demo-container">
  <ExTable :columns="columns" :data="data" />
</div>

```vue
<script setup>
import { ref } from 'vue';

const columns = [
  { key: 'rank', title: '排名', width: 80, align: 'center' },
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'score', title: '分数', dataIndex: 'score', sortable: true, align: 'right' },
  { key: 'kd', title: 'K/D', dataIndex: 'kd', sortable: true, align: 'center' },
  { key: 'winRate', title: '胜率', dataIndex: 'winRate', sortable: true, align: 'center' },
];

const data = [
  { key: 1, rank: '🥇', player: 'Player001', score: 9850, kd: '3.2', winRate: '68%' },
  { key: 2, rank: '🥈', player: 'Player002', score: 9520, kd: '2.8', winRate: '65%' },
  { key: 3, rank: '🥉', player: 'Player003', score: 9180, kd: '2.5', winRate: '62%' },
];
</script>

<template>
  <ExTable :columns="columns" :data="data" />
</template>
```

## 带边框

通过 `bordered` 属性可以显示表格边框。

<div class="demo-container">
  <ExTable :columns="columns" :data="data" bordered />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" bordered />
</template>
```

## 斑马纹

通过 `striped` 属性可以显示斑马纹样式。

<div class="demo-container">
  <ExTable :columns="columns" :data="data" striped />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" striped />
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同的表格尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">小尺寸</h4>
    <ExTable :columns="columns" :data="data.slice(0, 3)" size="small" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">中等尺寸（默认）</h4>
    <ExTable :columns="columns" :data="data.slice(0, 3)" size="medium" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">大尺寸</h4>
    <ExTable :columns="columns" :data="data.slice(0, 3)" size="large" />
  </div>
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" size="small" />
  <ExTable :columns="columns" :data="data" size="medium" />
  <ExTable :columns="columns" :data="data" size="large" />
</template>
```

## 可排序

通过在列配置中设置 `sortable: true` 可以让列支持排序。

<div class="demo-container">
  <ExTable :columns="columns" :data="data" bordered hoverable />
</div>

```vue
<script setup>
const columns = [
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'score', title: '分数', dataIndex: 'score', sortable: true, align: 'right' },
  { key: 'kd', title: 'K/D', dataIndex: 'kd', sortable: true, align: 'center' },
];
</script>

<template>
  <ExTable :columns="columns" :data="data" />
</template>
```

## 装备列表示例

展示游戏装备列表，包含装备信息和状态。

<div class="demo-container">
  <ExTable :columns="equipmentColumns" :data="equipmentData" bordered hoverable>
    <template #cell-name="{ value }">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img 
          src="https://api.iconify.design/ri/sword-line.svg" 
          alt="装备" 
          width="20" 
          height="20"
          style="color: var(--ex-color-neon-blue-500);"
        />
        <span style="color: var(--ex-color-text-primary); font-weight: 600;">{{ value }}</span>
      </div>
    </template>
    
    <template #cell-type="{ value }">
      <ExTag 
        :type="value === '武器' ? 'danger' : value === '护甲' ? 'primary' : 'success'" 
        size="small"
      >
        {{ value }}
      </ExTag>
    </template>
    
    <template #cell-level="{ value }">
      <span style="color: var(--ex-color-warning); font-weight: bold;">Lv.{{ value }}</span>
    </template>
    
    <template #cell-attack="{ value }">
      <span :style="{ color: value > 0 ? 'var(--ex-color-danger)' : 'var(--ex-color-text-tertiary)' }">
        {{ value > 0 ? `+${value}` : '-' }}
      </span>
    </template>
    
    <template #cell-defense="{ value }">
      <span :style="{ color: value > 0 ? 'var(--ex-color-primary)' : 'var(--ex-color-text-tertiary)' }">
        {{ value > 0 ? `+${value}` : '-' }}
      </span>
    </template>
    
    <template #cell-status="{ value }">
      <ExBadge 
        :count="value" 
        :type="value === '已装备' ? 'success' : 'info'"
      />
    </template>
  </ExTable>
</div>

```vue
<script setup>
const equipmentColumns = [
  { key: 'name', title: '装备名称', dataIndex: 'name', width: 200 },
  { key: 'type', title: '类型', dataIndex: 'type', align: 'center' },
  { key: 'level', title: '等级', dataIndex: 'level', sortable: true, align: 'center' },
  { key: 'attack', title: '攻击力', dataIndex: 'attack', sortable: true, align: 'right' },
  { key: 'defense', title: '防御力', dataIndex: 'defense', sortable: true, align: 'right' },
  { key: 'status', title: '状态', dataIndex: 'status', align: 'center' },
];

const equipmentData = [
  { key: 1, name: '烈焰之剑', type: '武器', level: 50, attack: 850, defense: 0, status: '已装备' },
  { key: 2, name: '龙鳞护甲', type: '护甲', level: 48, attack: 0, defense: 920, status: '已装备' },
];
</script>

<template>
  <ExTable :columns="equipmentColumns" :data="equipmentData" bordered hoverable>
    <template #cell-name="{ value }">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="https://api.iconify.design/ri/sword-line.svg" alt="装备" width="20" height="20" />
        <span>{{ value }}</span>
      </div>
    </template>

    <template #cell-status="{ value }">
      <ExBadge :count="value" :type="value === '已装备' ? 'success' : 'info'" />
    </template>
  </ExTable>
</template>
```

## 空数据

当表格没有数据时，会显示空状态提示。

<div class="demo-container">
  <ExTable :columns="columns" :data="[]" />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="[]" />
</template>
```

## 加载状态

通过 `loading` 属性可以显示加载状态。

<div class="demo-container">
  <ExTable :columns="columns" :data="data" :loading="loading" />
  <div style="margin-top: 16px; text-align: center;">
    <ExButton type="primary" @click="loading = !loading">
      {{ loading ? '停止加载' : '开始加载' }}
    </ExButton>
  </div>
</div>

```vue
<script setup>
import { ref } from 'vue';

const loading = ref(false);
</script>

<template>
  <ExTable :columns="columns" :data="data" :loading="loading" />
  <ExButton type="primary" @click="loading = !loading">
    {{ loading ? '停止加载' : '开始加载' }}
  </ExButton>
</template>
```

## 最大高度

通过 `max-height` 属性可以设置表格的最大高度，超出部分显示滚动条。

<div class="demo-container">
  <ExTable 
    :columns="columns" 
    :data="[...data, ...data, ...data]" 
    :max-height="300"
    bordered
  />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" :max-height="300" bordered />
</template>
```

## 响应式布局（移动端优先）

Table 组件完全支持响应式设计。在移动端，可以使用 `layout="card"` 属性将表格转换为卡片式布局，提供更好的移动端体验。

### 默认表格布局

在移动端，表格会自动启用横向滚动，并显示滚动提示阴影。

<div class="demo-container">
  <ExTable :columns="equipmentColumns" :data="equipmentData" bordered />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" bordered />
</template>
```

### 卡片式布局（移动端友好）

在移动端（屏幕宽度 < 768px），卡片式布局会将每一行数据显示为一个卡片，每个字段垂直排列，更易于阅读。

<div class="demo-container">
  <ExTable :columns="equipmentColumns" :data="equipmentData" layout="card" />
</div>

```vue
<template>
  <ExTable :columns="columns" :data="data" layout="card" />
</template>
```

::: tip 提示

- 默认 `layout="table"` 适合桌面端，在移动端会启用横向滚动
- `layout="card"` 在移动端会自动转换为卡片布局，在桌面端仍显示为表格
- 卡片布局会在每个字段前显示列标题，无需表头
- 建议数据较多时使用表格布局，数据较少时使用卡片布局
  :::

## 行选择

设置 `selectable` 开启选择列。配合 `v-model:selectedRowKeys` 获取/控制选中项，
`selection-change` 事件可拿到选中的 key 列表与对应行数据。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TableDataItem } from 'vue-ex-ui';

const selectedKeys = ref<Array<string | number>>([]);

const columns = [
  { key: 'name', title: '名称', dataIndex: 'name' },
  { key: 'role', title: '职业', dataIndex: 'role' },
];
const data = [
  { key: 1, name: 'Player1', role: '战士' },
  { key: 2, name: 'Player2', role: '法师' },
  { key: 3, name: 'Player3', role: '弓箭手' },
];

const onSelectionChange = (keys, rows: TableDataItem[]) => {
  console.log('已选 key：', keys, '已选行：', rows);
};
</script>

<template>
  <ExTable
    v-model:selectedRowKeys="selectedKeys"
    :columns="columns"
    :data="data"
    row-key="key"
    selectable
    @selection-change="onSelectionChange"
  />
  <p>已选 {{ selectedKeys.length }} 项</p>
</template>
```

### 单选模式

设置 `selection-type="radio"` 切换为单选（表头不再显示全选框）。

```vue
<ExTable :columns="columns" :data="data" selectable selection-type="radio" />
```

### 禁用某些行的选择

通过 `is-row-selectable` 返回 `false` 来禁用指定行的选择（全选也会跳过这些行）。

```vue
<ExTable
  :columns="columns"
  :data="data"
  selectable
  :is-row-selectable="record => record.role !== '法师'"
/>
```

## API

### Table Props

| 属性                | 说明                                              | 类型                             | 默认值       |
| ------------------- | ------------------------------------------------- | -------------------------------- | ------------ |
| `columns`           | 表格列配置                                        | `TableColumn[]`                  | `[]`         |
| `data`              | 表格数据                                          | `TableDataItem[]`                | `[]`         |
| `size`              | 表格尺寸                                          | `'small' \| 'medium' \| 'large'` | `'medium'`   |
| `bordered`          | 是否显示边框                                      | `boolean`                        | `false`      |
| `striped`           | 是否显示斑马纹                                    | `boolean`                        | `false`      |
| `hoverable`         | 是否可悬停                                        | `boolean`                        | `true`       |
| `loading`           | 是否加载中                                        | `boolean`                        | `false`      |
| `empty-text`        | 空数据文本                                        | `string`                         | `'暂无数据'` |
| `show-header`       | 是否显示表头                                      | `boolean`                        | `true`       |
| `row-key`           | 行的 key 字段名                                   | `string`                         | `'key'`      |
| `selectable`        | 是否开启行选择列                                  | `boolean`                        | `false`      |
| `selection-type`    | 选择类型（多选/单选）                             | `'checkbox' \| 'radio'`          | `'checkbox'` |
| `selectedRowKeys`   | 已选行 key 列表（支持 `v-model:selectedRowKeys`） | `Array<string \| number>`        | `[]`         |
| `is-row-selectable` | 判断某行是否可选                                  | `(record, index) => boolean`     | `undefined`  |
| `max-height`        | 最大高度                                          | `string \| number`               | `undefined`  |
| `layout`            | 布局模式（移动端友好）                            | `'table' \| 'card'`              | `'table'`    |

### Table Events

| 事件名                   | 说明                         | 类型                                                                        |
| ------------------------ | ---------------------------- | --------------------------------------------------------------------------- |
| `row-click`              | 行点击事件                   | `(record: TableDataItem, index: number, event: MouseEvent) => void`         |
| `sort-change`            | 排序变化事件                 | `(sortInfo: TableSortInfo) => void`                                         |
| `update:selectedRowKeys` | 选中 key 列表更新（v-model） | `(keys: Array<string \| number>) => void`                                   |
| `selection-change`       | 选择变化                     | `(keys: Array<string \| number>, rows: TableDataItem[]) => void`            |
| `select`                 | 单行选择切换                 | `(record: TableDataItem, selected: boolean, rows: TableDataItem[]) => void` |
| `select-all`             | 全选 / 取消全选              | `(selected: boolean, rows: TableDataItem[]) => void`                        |

### Table Slots

| 插槽名         | 说明             | 参数                               |
| -------------- | ---------------- | ---------------------------------- |
| `header-{key}` | 自定义表头单元格 | `{ column }`                       |
| `cell-{key}`   | 自定义表体单元格 | `{ value, record, index, column }` |
| `empty`        | 自定义空数据内容 | -                                  |

### Table Methods

| 方法名               | 说明                       | 类型                                                  |
| -------------------- | -------------------------- | ----------------------------------------------------- |
| `getElement`         | 获取表格DOM元素            | `() => HTMLDivElement \| null`                        |
| `clearSort`          | 清除排序                   | `() => void`                                          |
| `clearSelection`     | 清空选择                   | `() => void`                                          |
| `toggleRowSelection` | 切换某行选中（不传则取反） | `(record: TableDataItem, selected?: boolean) => void` |
| `toggleAllSelection` | 切换全选                   | `() => void`                                          |

### TableColumn

| 属性        | 说明           | 类型                            | 默认值      |
| ----------- | -------------- | ------------------------------- | ----------- |
| `key`       | 列的唯一标识   | `string`                        | -           |
| `title`     | 列标题         | `string`                        | `undefined` |
| `dataIndex` | 数据字段名     | `string`                        | `undefined` |
| `width`     | 列宽度         | `string \| number`              | `undefined` |
| `minWidth`  | 最小宽度       | `string \| number`              | `undefined` |
| `align`     | 对齐方式       | `'left' \| 'center' \| 'right'` | `'left'`    |
| `fixed`     | 是否固定列     | `'left' \| 'right'`             | `undefined` |
| `sortable`  | 是否可排序     | `boolean`                       | `false`     |
| `render`    | 自定义渲染函数 | `(value, record, index) => any` | `undefined` |
| `slot`      | 自定义插槽名称 | `string`                        | `undefined` |

### TableSortInfo

| 属性    | 说明     | 类型                      |
| ------- | -------- | ------------------------- |
| `key`   | 排序字段 | `string`                  |
| `order` | 排序方向 | `'asc' \| 'desc' \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持键盘导航
- 支持屏幕阅读器
- 支持减少动画偏好设置

## 主题定制

可以通过 CSS 变量自定义表格样式：

```css
:root {
  --ex-table-bg: var(--ex-color-bg-secondary);
  --ex-table-header-bg: var(--ex-color-bg-elevated);
  --ex-table-header-border: var(--ex-color-neon-blue-500);
  --ex-table-border-color: var(--ex-color-border-primary);
  --ex-table-hover-bg: var(--ex-color-bg-hover);
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
