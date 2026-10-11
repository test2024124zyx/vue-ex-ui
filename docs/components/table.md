# Table 表格

用于展示行列数据，适合游戏排行榜、玩家数据、装备列表等场景。

树形数据、详情展开、行级编辑、单元格合并、列宽调整、列重排和分页联动，参见 [Table 高级能力](./table-advanced)。该页面包含可交互示例、受控状态协议和组合约束。

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

const scrollGroupCount = 3
const scrollData = Array.from({ length: scrollGroupCount }, (_, group) =>
  data.map(row => ({ ...row, key: `${group}-${row.key}` }))
).flat()

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

// 行选择演示
const selectedKeys = ref([1, 3])
const radioKeys = ref([])
const disabledKeys = ref([])
const selectionColumns = [
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'role', title: '职业', dataIndex: 'role' },
]
const selectionData = [
  { key: 1, player: 'Player001', role: '战士' },
  { key: 2, player: 'Player002', role: '法师' },
  { key: 3, player: 'Player003', role: '游侠' },
]
const onSelectionChange = (keys, rows) => {
  console.log('已选 key：', keys, '已选行：', rows)
}
</script>

## 基础用法

最基础的表格用法，展示游戏排行榜数据。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="data" />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="data"
  />
</template>
```

:::

## 带边框

通过 `bordered` 属性可以显示表格边框。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="data" bordered />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="data"
    bordered
  />
</template>
```

:::

## 斑马纹

通过 `striped` 属性可以显示斑马纹样式。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="data" striped />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="data"
    striped
  />
</template>
```

:::

## 不同尺寸

通过 `size` 属性可以设置不同的表格尺寸。

::: raw
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
:::

::: details 查看示例代码

```vue
<script setup>
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
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">小尺寸</h4>
    <ExTable
      :columns="columns"
      :data="data.slice(0, 3)"
      size="small"
    />
  </div>

  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">中等尺寸（默认）</h4>
    <ExTable
      :columns="columns"
      :data="data.slice(0, 3)"
      size="medium"
    />
  </div>

  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">大尺寸</h4>
    <ExTable
      :columns="columns"
      :data="data.slice(0, 3)"
      size="large"
    />
  </div>
</template>
```

:::

## 可排序

通过在列配置中设置 `sortable: true` 可以让列支持排序。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="data" bordered hoverable />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="data"
    bordered
    hoverable
  />
</template>
```

:::

## 装备列表示例

展示游戏装备列表，包含装备信息和状态。

::: raw
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
:::

::: details 查看示例代码

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
  {
    key: 3,
    name: '疾风之靴',
    type: '鞋子',
    level: 45,
    attack: 120,
    defense: 380,
    status: '未装备',
  },
  { key: 4, name: '暗影斗篷', type: '披风', level: 42, attack: 80, defense: 450, status: '未装备' },
];
</script>

<template>
  <ExTable
    :columns="equipmentColumns"
    :data="equipmentData"
    bordered
    hoverable
  >
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
      <span
        :style="{ color: value > 0 ? 'var(--ex-color-danger)' : 'var(--ex-color-text-tertiary)' }"
      >
        {{ value > 0 ? `+${value}` : '-' }}
      </span>
    </template>

    <template #cell-defense="{ value }">
      <span
        :style="{ color: value > 0 ? 'var(--ex-color-primary)' : 'var(--ex-color-text-tertiary)' }"
      >
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
</template>
```

:::

## 空数据

当表格没有数据时，会显示空状态提示。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="[]" />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
const columns = [
  { key: 'rank', title: '排名', width: 80, align: 'center' },
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'score', title: '分数', dataIndex: 'score', sortable: true, align: 'right' },
  { key: 'kd', title: 'K/D', dataIndex: 'kd', sortable: true, align: 'center' },
  { key: 'winRate', title: '胜率', dataIndex: 'winRate', sortable: true, align: 'center' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="[]"
  />
</template>
```

:::

## 加载状态

通过 `loading` 属性可以显示加载状态。

::: raw
<div class="demo-container">
  <ExTable :columns="columns" :data="data" :loading="loading" />
  <div style="margin-top: 16px; text-align: center;">
    <ExButton type="primary" @click="loading = !loading">
      {{ loading ? '停止加载' : '开始加载' }}
    </ExButton>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const loading = ref(false);
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
</script>

<template>
  <ExTable
    :columns="columns"
    :data="data"
    :loading="loading"
  />
  <div style="margin-top: 16px; text-align: center;">
    <ExButton
      type="primary"
      @click="loading = !loading"
    >
      {{ loading ? '停止加载' : '开始加载' }}
    </ExButton>
  </div>
</template>
```

:::

## 最大高度

通过 `max-height` 属性可以设置表格的最大高度，超出部分显示滚动条。

::: raw
<div class="demo-container">
  <ExTable
    :columns="columns"
    :data="scrollData"
    :max-height="300"
    bordered
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
];
const scrollGroupCount = 3;
const scrollData = Array.from({ length: scrollGroupCount }, (_, group) =>
  data.map(row => ({ ...row, key: `${group}-${row.key}` }))
).flat();
</script>

<template>
  <ExTable
    :columns="columns"
    :data="scrollData"
    :max-height="300"
    bordered
  />
</template>
```

:::

## 响应式布局（移动端优先）

Table 组件完全支持响应式设计。在移动端，可以使用 `layout="card"` 属性将表格转换为卡片式布局，提供更好的移动端体验。

### 默认表格布局

在移动端，表格会自动启用横向滚动，并显示滚动提示阴影。

::: raw
<div class="demo-container">
  <ExTable :columns="equipmentColumns" :data="equipmentData" bordered />
</div>
:::

::: details 查看示例代码

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
  {
    key: 3,
    name: '疾风之靴',
    type: '鞋子',
    level: 45,
    attack: 120,
    defense: 380,
    status: '未装备',
  },
  { key: 4, name: '暗影斗篷', type: '披风', level: 42, attack: 80, defense: 450, status: '未装备' },
];
</script>

<template>
  <ExTable
    :columns="equipmentColumns"
    :data="equipmentData"
    bordered
  />
</template>
```

:::

### 卡片式布局（移动端友好）

在移动端（屏幕宽度 < 768px），卡片式布局会将每一行数据显示为一个卡片，每个字段垂直排列，更易于阅读。

::: raw
<div class="demo-container">
  <ExTable :columns="equipmentColumns" :data="equipmentData" layout="card" />
</div>
:::

::: details 查看示例代码

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
  {
    key: 3,
    name: '疾风之靴',
    type: '鞋子',
    level: 45,
    attack: 120,
    defense: 380,
    status: '未装备',
  },
  { key: 4, name: '暗影斗篷', type: '披风', level: 42, attack: 80, defense: 450, status: '未装备' },
];
</script>

<template>
  <ExTable
    :columns="equipmentColumns"
    :data="equipmentData"
    layout="card"
  />
</template>
```

:::

::: tip 提示

- 默认 `layout="table"` 适合桌面端，在移动端会启用横向滚动
- `layout="card"` 在移动端会自动转换为卡片布局，在桌面端仍显示为表格
- 卡片布局会在每个字段前显示列标题，无需表头
- 建议数据较多时使用表格布局，数据较少时使用卡片布局
  :::

## 行选择

设置 `selectable` 开启选择列。配合 `v-model:selectedRowKeys` 获取/控制选中项，
`selection-change` 事件可拿到选中的 key 列表与对应行数据。

::: raw
<div class="demo-container">
  <ExTable
    v-model:selectedRowKeys="selectedKeys"
    :columns="columns"
    :data="data"
    row-key="key"
    selectable
    bordered
    @selection-change="onSelectionChange"
  />
  <p style="margin: 12px 0 0; color: var(--ex-color-text-secondary);">
    已选 {{ selectedKeys.length }} 项：{{ selectedKeys.join(', ') }}
  </p>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TableDataItem } from 'vue-ex-ui';

const selectedKeys = ref<Array<string | number>>([1, 3]);

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
  { key: 4, rank: '4', player: 'Player004', score: 8950, kd: '2.3', winRate: '60%' },
  { key: 5, rank: '5', player: 'Player005', score: 8720, kd: '2.1', winRate: '58%' },
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
    bordered
    @selection-change="onSelectionChange"
  />
  <p style="margin: 12px 0 0; color: var(--ex-color-text-secondary);">
    已选 {{ selectedKeys.length }} 项：{{ selectedKeys.join(', ') }}
  </p>
</template>
```

:::

### 单选模式

设置 `selection-type="radio"` 切换为单选（表头不再显示全选框）。

::: raw
<div class="demo-container">
  <ex-table v-model:selected-row-keys="radioKeys" :columns="selectionColumns" :data="selectionData" selectable selection-type="radio" />
  <p role="status">当前单选：{{ radioKeys.join(', ') || '未选择' }}</p>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const radioKeys = ref([]);
const selectionColumns = [
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'role', title: '职业', dataIndex: 'role' },
];
const selectionData = [
  { key: 1, player: 'Player001', role: '战士' },
  { key: 2, player: 'Player002', role: '法师' },
  { key: 3, player: 'Player003', role: '游侠' },
];
</script>

<template>
  <div class="demo-container">
    <ex-table
      v-model:selected-row-keys="radioKeys"
      :columns="selectionColumns"
      :data="selectionData"
      selectable
      selection-type="radio"
    />
    <p role="status">当前单选：{{ radioKeys.join(', ') || '未选择' }}</p>
  </div>
</template>
```

:::

### 禁用某些行的选择

通过 `is-row-selectable` 返回 `false` 来禁用指定行的选择。此处的法师行不可选，全选也会跳过它；选择状态与上方单选演示独立。

::: raw
<div class="demo-container">
  <ex-table v-model:selected-row-keys="disabledKeys" :columns="selectionColumns" :data="selectionData" selectable :is-row-selectable="record => record.role !== '法师'" />
  <p role="status">已选：{{ disabledKeys.join(', ') || '未选择' }}</p>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const disabledKeys = ref([]);
const selectionColumns = [
  { key: 'player', title: '玩家', dataIndex: 'player' },
  { key: 'role', title: '职业', dataIndex: 'role' },
];
const selectionData = [
  { key: 1, player: 'Player001', role: '战士' },
  { key: 2, player: 'Player002', role: '法师' },
  { key: 3, player: 'Player003', role: '游侠' },
];
</script>

<template>
  <div class="demo-container">
    <ex-table
      v-model:selected-row-keys="disabledKeys"
      :columns="selectionColumns"
      :data="selectionData"
      selectable
      :is-row-selectable="record => record.role !== '法师'"
    />
    <p role="status">已选：{{ disabledKeys.join(', ') || '未选择' }}</p>
  </div>
</template>
```

:::

## API

### Table Props

| 属性                | 说明                                                   | 类型                             | 默认值       |
| ------------------- | ------------------------------------------------------ | -------------------------------- | ------------ |
| `columns`           | 表格列配置                                             | `TableColumn[]`                  | `[]`         |
| `data`              | 表格数据                                               | `TableDataItem[]`                | `[]`         |
| `size`              | 表格尺寸                                               | `'small' \| 'medium' \| 'large'` | `'medium'`   |
| `bordered`          | 是否显示边框                                           | `boolean`                        | `false`      |
| `striped`           | 是否显示斑马纹                                         | `boolean`                        | `false`      |
| `hoverable`         | 是否可悬停                                             | `boolean`                        | `true`       |
| `loading`           | 是否加载中                                             | `boolean`                        | `false`      |
| `empty-text`        | 空数据文本                                             | `string`                         | `'暂无数据'` |
| `show-header`       | 是否显示表头                                           | `boolean`                        | `true`       |
| `row-key`           | 行的 key 字段名                                        | `string`                         | `'key'`      |
| `selectable`        | 是否开启行选择列                                       | `boolean`                        | `false`      |
| `selection-type`    | 选择类型（多选/单选）                                  | `'checkbox' \| 'radio'`          | `'checkbox'` |
| `selectedRowKeys`   | 已选行 key 列表（支持 `v-model:selectedRowKeys`）      | `Array<string \| number>`        | `[]`         |
| `is-row-selectable` | 判断某行是否可选                                       | `(record, index) => boolean`     | `undefined`  |
| `max-height`        | 最大高度                                               | `string \| number`               | `undefined`  |
| `layout`            | 布局模式（移动端友好）                                 | `'table' \| 'card'`              | `'table'`    |
| `remote-sort`       | 远程/受控排序：禁用内置本地排序，仅派发 `sort-change`  | `boolean`                        | `false`      |
| `virtual`           | 是否启用行虚拟滚动（大数据量，需固定 `row-height`）    | `boolean`                        | `false`      |
| `row-height`        | 虚拟滚动行高（像素）                                   | `number`                         | `48`         |
| `virtual-height`    | 虚拟滚动视口高度（像素，回退 `max-height` 再回退 400） | `number`                         | `undefined`  |
| `virtual-buffer`    | 虚拟滚动上下缓冲行数                                   | `number`                         | `6`          |

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

| 属性              | 说明                            | 类型                            | 默认值      |
| ----------------- | ------------------------------- | ------------------------------- | ----------- |
| `key`             | 列的唯一标识                    | `string`                        | -           |
| `title`           | 列标题                          | `string`                        | `undefined` |
| `dataIndex`       | 数据字段名                      | `string`                        | `undefined` |
| `width`           | 列宽度                          | `string \| number`              | `undefined` |
| `minWidth`        | 最小宽度                        | `string \| number`              | `undefined` |
| `align`           | 对齐方式                        | `'left' \| 'center' \| 'right'` | `'left'`    |
| `fixed`           | 固定列方向；`true` 等同左侧固定 | `'left' \| 'right' \| boolean`  | `undefined` |
| `sortable`        | 是否可排序                      | `boolean`                       | `false`     |
| `render`          | 自定义渲染函数                  | `(value, record, index) => any` | `undefined` |
| `slot`            | 自定义插槽名称                  | `string`                        | `undefined` |
| `ellipsis`        | 单行省略并提供原始值标题        | `boolean`                       | `false`     |
| `className`       | 表体单元格类名                  | `string`                        | `undefined` |
| `headerClassName` | 表头单元格类名                  | `string`                        | `undefined` |
| `children`        | 子列；存在时生成分组表头        | `TableColumn[]`                 | `undefined` |
| `onFilter`        | 本地过滤断言                    | `(value, record) => boolean`    | `undefined` |
| `filteredValue`   | 当前生效的过滤值                | `readonly unknown[]`            | `undefined` |

固定列使用 `position: sticky`。连续固定列应提供 `width` 或 `minWidth`，组件据此计算累计偏移；缺少稳定列宽时浏览器无法可靠确定相邻固定列的位置。

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

表格跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
