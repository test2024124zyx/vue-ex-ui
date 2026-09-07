# Heatmap 热力图

按本地日历日展示连续日期数据。

<script setup>
const activity = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 0, index + 1))
  const weekday = date.getUTCDay()
  const cycle = (index * 7 + Math.floor(index / 13) * 3) % 18
  return {
    date: date.toISOString().slice(0, 10),
    value: weekday === 0 || weekday === 6 ? Math.max(0, cycle - 8) : cycle,
    orders: cycle * 4
  }
})

const quarterActivity = activity.filter(item => item.date <= '2025-03-31')
</script>

## 年度数据

::: raw
<div class="vp-raw demo-container heatmap-panel">
  <ex-heatmap
    :data="activity"
    start-date="2025-01-01"
    end-date="2025-12-31"
    size="small"
    aria-label="2025 年客户活跃度"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const activity = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 0, index + 1));
  const weekday = date.getUTCDay();
  const cycle = (index * 7 + Math.floor(index / 13) * 3) % 18;
  return {
    date: date.toISOString().slice(0, 10),
    value: weekday === 0 || weekday === 6 ? Math.max(0, cycle - 8) : cycle,
    orders: cycle * 4,
  };
});
</script>

<template>
  <div class="vp-raw demo-container heatmap-panel">
    <ex-heatmap
      :data="activity"
      start-date="2025-01-01"
      end-date="2025-12-31"
      size="small"
      aria-label="2025 年客户活跃度"
    />
  </div>
</template>
```

:::

## 尺寸与色阶

::: raw
<div class="vp-raw demo-container heatmap-stack">
  <ex-heatmap
    :data="quarterActivity"
    start-date="2025-01-01"
    end-date="2025-03-31"
    theme="green"
    size="small"
    :gap="2"
    :radius="3"
  />
  <ex-heatmap
    :data="quarterActivity"
    start-date="2025-01-01"
    end-date="2025-03-31"
    theme="purple"
    size="large"
    :gap="3"
    :radius="2"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const activity = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 0, index + 1));
  const weekday = date.getUTCDay();
  const cycle = (index * 7 + Math.floor(index / 13) * 3) % 18;
  return {
    date: date.toISOString().slice(0, 10),
    value: weekday === 0 || weekday === 6 ? Math.max(0, cycle - 8) : cycle,
  };
});
const quarterActivity = activity.filter(item => item.date <= '2025-03-31');
</script>

<template>
  <div class="vp-raw demo-container heatmap-stack">
    <ex-heatmap
      :data="quarterActivity"
      start-date="2025-01-01"
      end-date="2025-03-31"
      theme="green"
      size="small"
      :gap="2"
      :radius="3"
    />
    <ex-heatmap
      :data="quarterActivity"
      start-date="2025-01-01"
      end-date="2025-03-31"
      theme="purple"
      size="large"
      :gap="3"
      :radius="2"
    />
  </div>
</template>
```

:::

## 标签与空状态

::: raw
<div class="vp-raw demo-container heatmap-stack">
  <ex-heatmap
    :data="quarterActivity"
    start-date="2025-01-01"
    end-date="2025-03-31"
    :show-month-labels="false"
    :show-week-labels="false"
    :show-tooltip="false"
    theme="blue"
  />
  <ex-heatmap :data="[]" empty-text="暂无活跃度数据">
    <template #empty>
      <ex-empty description="暂无活跃度数据" type="no-data" />
    </template>
  </ex-heatmap>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const activity = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 0, index + 1));
  const weekday = date.getUTCDay();
  const cycle = (index * 7 + Math.floor(index / 13) * 3) % 18;
  return {
    date: date.toISOString().slice(0, 10),
    value: weekday === 0 || weekday === 6 ? Math.max(0, cycle - 8) : cycle,
  };
});
const quarterActivity = activity.filter(item => item.date <= '2025-03-31');
</script>

<template>
  <div class="vp-raw demo-container heatmap-stack">
    <ex-heatmap
      :data="quarterActivity"
      start-date="2025-01-01"
      end-date="2025-03-31"
      :show-month-labels="false"
      :show-week-labels="false"
      :show-tooltip="false"
      theme="blue"
    />
    <ex-heatmap
      :data="[]"
      empty-text="暂无活跃度数据"
    >
      <template #empty>
        <ex-empty
          description="暂无活跃度数据"
          type="no-data"
        />
      </template>
    </ex-heatmap>
  </div>
</template>
```

:::

## API

### Props

| 参数              | 说明                            | 类型                                                | 默认值          |
| ----------------- | ------------------------------- | --------------------------------------------------- | --------------- |
| `data`            | 日期数据                        | `readonly HeatmapDataItem[]`                        | 必填            |
| `startDate`       | 开始日期，格式为 `YYYY-MM-DD`   | `string`                                            | 结束日前 364 天 |
| `endDate`         | 结束日期，格式为 `YYYY-MM-DD`   | `string`                                            | 今天            |
| `size`            | 单元格尺寸（24 / 28 / 32 像素） | `small \| medium \| large`                          | `medium`        |
| `theme`           | 色阶主题                        | `default \| blue \| green \| purple \| red \| neon` | `neon`          |
| `showMonthLabels` | 是否显示月份                    | `boolean`                                           | `true`          |
| `showWeekLabels`  | 是否显示星期                    | `boolean`                                           | `true`          |
| `showTooltip`     | 是否显示悬停或聚焦提示          | `boolean`                                           | `true`          |
| `gap`             | 单元格间距，限制在 0–64 像素    | `number`                                            | `4`             |
| `radius`          | 单元格圆角                      | `number`                                            | `2`             |
| `maxValue`        | 正数色阶上限                    | `number`                                            | 可见数据最大值  |
| `emptyText`       | 空状态文案                      | `string`                                            | 本地化文案      |
| `ariaLabel`       | 根元素无障碍名称                | `string`                                            | 本地化名称      |

日期范围最长 366 天。无效、倒置或超长范围会显示范围错误。

### HeatmapDataItem

| 字段    | 说明                              | 类型     |
| ------- | --------------------------------- | -------- |
| `date`  | 本地日历日期，格式为 `YYYY-MM-DD` | `string` |
| `value` | 非负有限数值                      | `number` |

### Events

| 事件名       | 参数                                         |
| ------------ | -------------------------------------------- |
| `cell-click` | `(data: HeatmapDataItem, event: MouseEvent)` |
| `cell-hover` | `(data: HeatmapDataItem \| null)`            |

### Slots

| 名称    | 说明         |
| ------- | ------------ |
| `empty` | 自定义空状态 |

### Exposes

| 方法         | 类型                           |
| ------------ | ------------------------------ |
| `getElement` | `() => HTMLDivElement \| null` |

## 键盘操作

| 按键                                 | 行为              |
| ------------------------------------ | ----------------- |
| `ArrowLeft` / `ArrowRight`           | 上一周 / 下一周   |
| `ArrowUp` / `ArrowDown`              | 前一天 / 后一天   |
| `Home` / `End`                       | 当前周首日 / 末日 |
| `Ctrl` 或 `Command` + `Home` / `End` | 范围首日 / 末日   |
| `Enter` / `Space`                    | 激活当前日期      |
| `Escape`                             | 关闭提示          |

<style scoped>
.heatmap-panel,
.heatmap-stack {
  overflow-x: auto;
}

.heatmap-stack {
  display: grid;
  gap: 28px;
}
</style>
