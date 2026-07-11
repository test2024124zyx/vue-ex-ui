# DateTimePicker 日期时间选择器

用于选择单个日期、日期时间或对应范围。

<script setup>
import { ref } from 'vue'

const date = ref(new Date())
const datetime = ref(null)
const dateRange = ref(null)
const datetimeRange = ref(null)

const disabledDate = (value) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return value < today
}
</script>

## 日期

<div class="demo-container">
  <ExDateTimePicker v-model="date" placeholder="请选择日期" />
</div>

```vue
<script setup>
import { ref } from 'vue';

const date = ref(null);
</script>

<template>
  <ExDateTimePicker v-model="date" />
</template>
```

## 日期时间

`time-step` 约束分钟输入，最终值会吸附到有效刻度。

<div class="demo-container">
  <ExDateTimePicker
    v-model="datetime"
    type="datetime"
    format="YYYY/MM/DD HH:mm"
    :time-step="15"
  />
</div>

```vue
<ExDateTimePicker v-model="datetime" type="datetime" format="YYYY/MM/DD HH:mm" :time-step="15" />
```

## 日期范围

<div class="demo-container">
  <ExDateTimePicker
    v-model="dateRange"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</div>

```vue
<ExDateTimePicker v-model="dateRange" type="daterange" />
```

## 日期时间范围

<div class="demo-container">
  <ExDateTimePicker v-model="datetimeRange" type="datetimerange" :time-step="5" />
</div>

```vue
<ExDateTimePicker v-model="datetimeRange" type="datetimerange" :time-step="5" />
```

## 禁用日期与状态

<div class="demo-container demo-container--row">
  <ExDateTimePicker v-model="date" :disabled-date="disabledDate" />
  <ExDateTimePicker v-model="date" readonly />
  <ExDateTimePicker v-model="date" disabled />
</div>

```vue
<ExDateTimePicker v-model="date" :disabled-date="disabledDate" />
<ExDateTimePicker v-model="date" readonly />
<ExDateTimePicker v-model="date" disabled />
```

## API

### Props

| 属性                      | 说明                                                     | 类型                                                     | 默认值       |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ------------ |
| `model-value` / `v-model` | 当前日期或日期范围                                       | `Date \| [Date, Date] \| null`                           | `null`       |
| `type`                    | 选择模式                                                 | `'date' \| 'datetime' \| 'daterange' \| 'datetimerange'` | `'date'`     |
| `size`                    | 组件尺寸                                                 | `'small' \| 'medium' \| 'large'`                         | 跟随全局配置 |
| `placeholder`             | 输入框占位文本                                           | `string`                                                 | 本地化文本   |
| `start-placeholder`       | 范围起点占位文本                                         | `string`                                                 | 本地化文本   |
| `end-placeholder`         | 范围终点占位文本                                         | `string`                                                 | 本地化文本   |
| `format`                  | 使用 `YYYY`、`MM`、`DD`、`HH`、`mm`、`ss` 标记的显示格式 | `string`                                                 | 按模式决定   |
| `disabled`                | 是否禁用全部交互                                         | `boolean`                                                | `false`      |
| `readonly`                | 是否只读并禁止打开面板                                   | `boolean`                                                | `false`      |
| `clearable`               | 是否允许清空                                             | `boolean`                                                | `true`       |
| `disabled-date`           | 判断某个本地日历日期是否不可选择                         | `(date: Date) => boolean`                                | —            |
| `show-time`               | 在日期模式中额外启用时间选择                             | `boolean`                                                | `false`      |
| `time-step`               | 分钟步长，规范范围 1～60                                 | `number`                                                 | `1`          |
| `show-today`              | 是否显示“今天”按钮                                       | `boolean`                                                | `true`       |
| `aria-label`              | 输入框无障碍名称                                         | `string`                                                 | 使用占位文本 |

### Events

| 事件名               | 说明                       | 类型                                   |
| -------------------- | -------------------------- | -------------------------------------- |
| `update:model-value` | 已确认值发生变化           | `(value: DateTimePickerValue) => void` |
| `change`             | 一次日期或时间选择正式提交 | `(value: DateTimePickerValue) => void` |
| `visible-change`     | 面板可见状态变化           | `(visible: boolean) => void`           |
| `focus` / `blur`     | 输入框焦点事件             | `(event: FocusEvent) => void`          |
| `clear`              | 当前值被清空               | `() => void`                           |

### Methods

| 方法名       | 说明           | 类型                           |
| ------------ | -------------- | ------------------------------ |
| `focus`      | 聚焦输入框     | `() => void`                   |
| `blur`       | 移除输入框焦点 | `() => void`                   |
| `getElement` | 获取组件根元素 | `() => HTMLDivElement \| null` |

### 键盘操作

| 按键                  | 行为                   |
| --------------------- | ---------------------- |
| `Enter` / `Space`     | 打开或关闭面板         |
| `ArrowDown`           | 打开面板并聚焦当前日期 |
| `Arrow`               | 按天或按周移动日期焦点 |
| `Home` / `End`        | 移动到当前周首日或末日 |
| `PageUp` / `PageDown` | 移动到上个月或下个月   |
| `Escape`              | 取消草稿并关闭面板     |

<style scoped>
.demo-container {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.demo-container--row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
