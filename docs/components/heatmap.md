# Heatmap 热力图

按本地日历日展示连续日期数据，适用于活跃度、提交次数和每日事件量等场景。

<script setup>
const activity = [
  { date: '2024-01-01', value: 2 },
  { date: '2024-01-02', value: 5 },
  { date: '2024-01-03', value: 10 },
  { date: '2024-01-05', value: 7 }
]

const handleCellClick = (item) => {
  console.log(item.date, item.value)
}
</script>

## 基础用法

日期范围包含开始日和结束日。未提供范围时，默认展示截至今天的 365 天。

<div class="demo-container">
  <ExHeatmap
    :data="activity"
    start-date="2024-01-01"
    end-date="2024-01-14"
    @cell-click="handleCellClick"
  />
</div>

```vue
<script setup lang="ts">
const activity = [
  { date: '2024-01-01', value: 2 },
  { date: '2024-01-02', value: 5 },
  { date: '2024-01-03', value: 10 },
];
</script>

<template>
  <ExHeatmap
    :data="activity"
    start-date="2024-01-01"
    end-date="2024-01-14"
    @cell-click="item => console.log(item)"
  />
</template>
```

## 外观

`theme` 控制色阶，`size` 控制单元格尺寸。`gap` 的有效范围为 0～64，`radius` 最大取当前单元格尺寸的一半。

<div class="demo-stack">
  <ExHeatmap
    :data="activity"
    start-date="2024-01-01"
    end-date="2024-01-14"
    theme="green"
    size="small"
    :gap="2"
    :radius="4"
  />
  <ExHeatmap
    :data="activity"
    start-date="2024-01-01"
    end-date="2024-01-14"
    theme="purple"
    size="large"
    :gap="6"
    :radius="0"
  />
</div>

```vue
<ExHeatmap :data="data" theme="green" size="small" :gap="2" :radius="4" />
<ExHeatmap :data="data" theme="purple" size="large" :gap="6" :radius="0" />
```

## 标签与提示

月份标签、星期标签和浮层提示可以独立关闭。热力图宽度超过容器时可横向滚动。

```vue
<ExHeatmap
  :data="data"
  :show-month-labels="false"
  :show-week-labels="false"
  :show-tooltip="false"
/>
```

## 空状态

```vue
<ExHeatmap :data="[]">
  <template #empty>
    <p>暂无活跃数据</p>
  </template>
</ExHeatmap>
```

## API

### Props

| 属性                | 说明                          | 类型                                                            | 默认值               |
| ------------------- | ----------------------------- | --------------------------------------------------------------- | -------------------- |
| `data`              | 日期数据                      | `readonly HeatmapDataItem[]`                                    | 必填                 |
| `start-date`        | 开始日期，格式为 `YYYY-MM-DD` | `string`                                                        | 结束日前 364 天      |
| `end-date`          | 结束日期，格式为 `YYYY-MM-DD` | `string`                                                        | 今天                 |
| `size`              | 单元格尺寸                    | `'small' \| 'medium' \| 'large'`                                | `'medium'`           |
| `theme`             | 色阶主题                      | `'default' \| 'blue' \| 'green' \| 'purple' \| 'red' \| 'neon'` | `'neon'`             |
| `show-month-labels` | 显示月份标签                  | `boolean`                                                       | `true`               |
| `show-week-labels`  | 显示星期标签                  | `boolean`                                                       | `true`               |
| `show-tooltip`      | 显示悬停或聚焦提示            | `boolean`                                                       | `true`               |
| `gap`               | 单元格间距，单位像素          | `number`                                                        | `4`                  |
| `radius`            | 单元格圆角，单位像素          | `number`                                                        | `2`                  |
| `max-value`         | 正数色阶上限                  | `number`                                                        | 可见数据最大值       |
| `empty-text`        | 空数据文本                    | `string`                                                        | 当前语言的空状态文本 |
| `aria-label`        | 根元素的无障碍名称            | `string`                                                        | 当前语言的热力图名称 |

日期范围最长为 366 天。无效、倒置或超长范围会显示范围错误，不会生成空白网格。

### HeatmapDataItem

| 属性    | 说明                              | 类型     | 必填 |
| ------- | --------------------------------- | -------- | ---- |
| `date`  | 本地日历日期，格式为 `YYYY-MM-DD` | `string` | 是   |
| `value` | 非负有限数值                      | `number` | 是   |

非法日期会被忽略；重复日期以后出现的项为准；负数、`NaN` 和无穷值按 `0` 处理。业务扩展字段会随事件返回。

### Events

| 事件         | 说明                                          | 类型                                                 |
| ------------ | --------------------------------------------- | ---------------------------------------------------- |
| `cell-click` | 日期按钮被鼠标、触控或键盘激活                | `(data: HeatmapDataItem, event: MouseEvent) => void` |
| `cell-hover` | 指针进入日期按钮时返回数据，离开时返回 `null` | `(data: HeatmapDataItem \| null) => void`            |

### Slots

| 插槽    | 说明             |
| ------- | ---------------- |
| `empty` | 自定义空数据内容 |

### Exposed

| 方法         | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `getElement` | 获取根 DOM 元素 | `() => HTMLDivElement \| null` |

## 键盘操作

| 按键                      | 行为                   |
| ------------------------- | ---------------------- |
| `Tab`                     | 进入当前日期单元格     |
| `↑` / `↓`                 | 移动到前一天或后一天   |
| `←` / `→`                 | 移动到上一周或下一周   |
| `Home` / `End`            | 移动到当前周首日或末日 |
| `Ctrl/Command + Home/End` | 移动到范围首日或末日   |
| `Enter` / `Space`         | 激活日期按钮           |
| `Escape`                  | 关闭当前提示           |

<style scoped>
.demo-container,
.demo-stack {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.demo-stack {
  display: grid;
  gap: 24px;
}
</style>
