# Heatmap 热力图

用于展示时间序列数据的热力图组件，适合展示玩家活跃度、游戏数据统计等场景。

<script setup>
import { ref } from 'vue'

// 生成模拟数据
const generateData = (days = 365) => {
  const data = []
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // 随机生成数据，周末活跃度更高
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const value = isWeekend 
      ? Math.floor(Math.random() * 50) + 30
      : Math.floor(Math.random() * 30)
    
    if (value > 5) { // 只添加有活跃度的数据
      data.push({ date: dateStr, value })
    }
  }
  
  return data
}

const playerActivity = ref(generateData(365))
const gameStats = ref(generateData(180))
const shortTermData = ref(generateData(90))

const handleCellClick = (data, event) => {
  console.log('点击了单元格:', data)
}

const handleCellHover = (data) => {
  if (data) {
    console.log('悬停在:', data.date, data.value)
  }
}
</script>

## 基础用法

最基础的热力图用法，展示一年的数据。

<div class="demo-container">
  <ExHeatmap 
    :data="playerActivity" 
    @cell-click="handleCellClick"
    @cell-hover="handleCellHover"
  />
</div>

```vue
<script setup>
import { ref } from 'vue'

const playerActivity = ref([
  { date: '2024-01-01', value: 10 },
  { date: '2024-01-02', value: 25 },
  { date: '2024-01-03', value: 15 },
  // ... 更多数据
])

const handleCellClick = (data, event) => {
  console.log('点击了单元格:', data)
}
</script>

<template>
  <ExHeatmap 
    :data="playerActivity" 
    @cell-click="handleCellClick"
  />
</template>
```

## 不同主题

通过 `theme` 属性可以设置不同的颜色主题。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Neon（霓虹蓝）</h4>
    <ExHeatmap :data="shortTermData" theme="neon" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Blue（蓝色）</h4>
    <ExHeatmap :data="shortTermData" theme="blue" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Green（绿色）</h4>
    <ExHeatmap :data="shortTermData" theme="green" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Purple（紫色）</h4>
    <ExHeatmap :data="shortTermData" theme="purple" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Red（红色）</h4>
    <ExHeatmap :data="shortTermData" theme="red" />
  </div>
</div>

```vue
<template>
  <ExHeatmap :data="data" theme="neon" />
  <ExHeatmap :data="data" theme="blue" />
  <ExHeatmap :data="data" theme="green" />
  <ExHeatmap :data="data" theme="purple" />
  <ExHeatmap :data="data" theme="red" />
</template>
```

## 不同尺寸

通过 `size` 属性可以设置热力图的尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Small</h4>
    <ExHeatmap :data="shortTermData" size="small" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Medium</h4>
    <ExHeatmap :data="shortTermData" size="medium" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Large</h4>
    <ExHeatmap :data="shortTermData" size="large" />
  </div>
</div>

```vue
<template>
  <ExHeatmap :data="data" size="small" />
  <ExHeatmap :data="data" size="medium" />
  <ExHeatmap :data="data" size="large" />
</template>
```

## 自定义日期范围

通过 `start-date` 和 `end-date` 属性可以自定义显示的日期范围。

<div class="demo-container">
  <ExHeatmap 
    :data="gameStats" 
    start-date="2024-06-01"
    end-date="2024-12-31"
    theme="green"
  />
</div>

```vue
<template>
  <ExHeatmap 
    :data="data" 
    start-date="2024-06-01"
    end-date="2024-12-31"
  />
</template>
```

## 隐藏标签

可以通过 `show-month-labels` 和 `show-week-labels` 属性控制标签的显示。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">隐藏月份标签</h4>
    <ExHeatmap :data="shortTermData" :show-month-labels="false" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">隐藏星期标签</h4>
    <ExHeatmap :data="shortTermData" :show-week-labels="false" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">隐藏所有标签</h4>
    <ExHeatmap :data="shortTermData" :show-month-labels="false" :show-week-labels="false" />
  </div>
</div>

```vue
<template>
  <ExHeatmap :data="data" :show-month-labels="false" />
  <ExHeatmap :data="data" :show-week-labels="false" />
</template>
```

## 自定义单元格样式

可以通过 `gap` 和 `radius` 属性自定义单元格的间距和圆角。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">无间距，圆角</h4>
    <ExHeatmap :data="shortTermData" :gap="0" :radius="4" theme="purple" />
  </div>
  
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">大间距，无圆角</h4>
    <ExHeatmap :data="shortTermData" :gap="6" :radius="0" theme="blue" />
  </div>
</div>

```vue
<template>
  <ExHeatmap :data="data" :gap="0" :radius="4" />
  <ExHeatmap :data="data" :gap="6" :radius="0" />
</template>
```

## 禁用工具提示

设置 `show-tooltip` 为 `false` 可以禁用悬停工具提示。

<div class="demo-container">
  <ExHeatmap :data="shortTermData" :show-tooltip="false" />
</div>

```vue
<template>
  <ExHeatmap :data="data" :show-tooltip="false" />
</template>
```

## 空数据

当没有数据时，会显示空状态。

<div class="demo-container">
  <ExHeatmap :data="[]" />
</div>

```vue
<template>
  <ExHeatmap :data="[]" />
</template>
```

## 自定义空状态

可以通过 `empty` 插槽自定义空状态。

<div class="demo-container">
  <ExHeatmap :data="[]">
    <template #empty>
      <div style="text-align: center; padding: 60px 20px;">
        <img 
          src="https://api.iconify.design/ri/bar-chart-line.svg" 
          alt="空" 
          width="64" 
          height="64"
          style="opacity: 0.3; margin-bottom: 16px;"
        />
        <p style="margin: 0; color: var(--ex-color-text-tertiary); font-size: 14px;">
          暂无活跃数据
        </p>
      </div>
    </template>
  </ExHeatmap>
</div>

```vue
<template>
  <ExHeatmap :data="[]">
    <template #empty>
      <div style="text-align: center; padding: 60px 20px;">
        <img src="..." alt="空" width="64" height="64" />
        <p>暂无活跃数据</p>
      </div>
    </template>
  </ExHeatmap>
</template>
```

## 响应式设计

Heatmap 组件完全支持响应式设计，在移动端会自动调整尺寸和间距。

<div class="demo-container">
  <ExHeatmap :data="gameStats" theme="neon" />
</div>

::: tip 提示
- 在移动端，热力图会自动缩小单元格尺寸
- 标签字体会自动调整
- 支持横向滚动查看完整数据
- 建议在移动端使用 `small` 尺寸
:::

## 使用场景

### 玩家活跃度统计

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">玩家活跃度热力图</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary); font-size: 14px;">
      展示过去一年的玩家登录活跃度
    </p>
  </div>
  <ExHeatmap :data="playerActivity" theme="neon" />
</div>

### 游戏数据统计

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">游戏对局统计</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary); font-size: 14px;">
      展示过去半年的游戏对局数量
    </p>
  </div>
  <ExHeatmap :data="gameStats" theme="green" />
</div>

## API

### Heatmap Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 热力图数据 | `HeatmapDataItem[]` | `[]` |
| `start-date` | 开始日期（YYYY-MM-DD） | `string` | 一年前 |
| `end-date` | 结束日期（YYYY-MM-DD） | `string` | 今天 |
| `size` | 单元格尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `theme` | 主题 | `'default' \| 'blue' \| 'green' \| 'purple' \| 'red' \| 'neon'` | `'neon'` |
| `show-month-labels` | 是否显示月份标签 | `boolean` | `true` |
| `show-week-labels` | 是否显示星期标签 | `boolean` | `true` |
| `show-tooltip` | 是否显示工具提示 | `boolean` | `true` |
| `gap` | 单元格间距 | `number` | `4` |
| `radius` | 单元格圆角 | `number` | `2` |
| `max-value` | 最大值（用于计算颜色深度） | `number` | 自动计算 |
| `empty-text` | 空数据文本 | `string` | `'暂无数据'` |

### HeatmapDataItem 数据结构

| 属性 | 说明 | 类型 | 必填 |
| --- | --- | --- | --- |
| `date` | 日期（YYYY-MM-DD 格式） | `string` | 是 |
| `value` | 数值 | `number` | 是 |

### Heatmap Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `cell-click` | 单元格点击事件 | `(data: HeatmapDataItem, event: MouseEvent) => void` |
| `cell-hover` | 单元格悬停事件 | `(data: HeatmapDataItem \| null) => void` |

### Heatmap Slots

| 插槽名 | 说明 |
| --- | --- |
| `empty` | 自定义空状态 |

### Heatmap Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取热力图DOM元素 | `() => HTMLDivElement \| null` |
| `refresh` | 刷新热力图 | `() => void` |

## 无障碍支持

- 每个单元格都有 `title` 属性，显示日期和数值
- 支持键盘导航
- 支持 `prefers-reduced-motion` 减少动画
- 支持高对比度模式

## 注意事项

1. 数据格式必须为 `YYYY-MM-DD` 格式
2. 数据会自动按日期排序和填充
3. 没有数据的日期会显示为最浅的颜色
4. 颜色深度根据数值自动计算（0-4 个等级）
5. 建议数据量不超过一年，以保证性能

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
