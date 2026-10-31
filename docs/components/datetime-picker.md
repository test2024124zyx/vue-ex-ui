# DateTimePicker 日期时间选择器

用于选择日期、日期时间、年、月、ISO 周或对应范围。

<script setup>
import { ref } from 'vue'

const date = ref(new Date())
const datetime = ref(null)
const dateRange = ref(null)
const datetimeRange = ref(null)
const year = ref(null)
const month = ref(null)
const week = ref(null)
const monthRange = ref(null)
const appointment = ref(null)
const businessHours = () => ({
  disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23],
  disabledMinutes: (hour) => hour === 19 ? [30, 45] : [],
})

const disabledDate = (value) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return value < today
}
</script>

## 日期

::: raw

<div class="demo-container">
  <ExDateTimePicker v-model="date" placeholder="请选择日期" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const date = ref(new Date());
</script>

<template>
  <div class="demo-container">
    <ExDateTimePicker
      v-model="date"
      placeholder="请选择日期"
    />
  </div>
</template>
```

:::

## 日期时间

`time-step` 约束分钟输入，最终值会吸附到有效刻度。

::: raw

<div class="demo-container">
  <ExDateTimePicker
    v-model="datetime"
    type="datetime"
    format="YYYY/MM/DD HH:mm"
    :time-step="15"
  />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const datetime = ref(null);
</script>

<template>
  <div class="demo-container">
    <ExDateTimePicker
      v-model="datetime"
      type="datetime"
      format="YYYY/MM/DD HH:mm"
      :time-step="15"
    />
  </div>
</template>
```

:::

## 日期范围

::: raw

<div class="demo-container">
  <ExDateTimePicker
    v-model="dateRange"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dateRange = ref(null);
</script>

<template>
  <div class="demo-container">
    <ExDateTimePicker
      v-model="dateRange"
      type="daterange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
  </div>
</template>
```

:::

## 日期时间范围

::: raw

<div class="demo-container">
  <ExDateTimePicker v-model="datetimeRange" type="datetimerange" :time-step="5" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const datetimeRange = ref(null);
</script>

<template>
  <div class="demo-container">
    <ExDateTimePicker
      v-model="datetimeRange"
      type="datetimerange"
      :time-step="5"
    />
  </div>
</template>
```

:::

## 禁用日期与状态

::: raw

<div class="demo-container demo-container--row">
  <ExDateTimePicker v-model="date" :disabled-date="disabledDate" />
  <ExDateTimePicker v-model="date" readonly />
  <ExDateTimePicker v-model="date" disabled />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const date = ref(new Date());

const disabledDate = value => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value < today;
};
</script>

<template>
  <div class="demo-container demo-container--row">
    <ExDateTimePicker
      v-model="date"
      :disabled-date="disabledDate"
    />
    <ExDateTimePicker
      v-model="date"
      readonly
    />
    <ExDateTimePicker
      v-model="date"
      disabled
    />
  </div>
</template>
```

:::

## 年、月与 ISO 周

`year`、`month`、`week` 分别选择完整周期，范围模式为 `yearrange`、`monthrange`、`weekrange`。
年值返回当年 1 月 1 日，月值返回当月 1 日，周值返回 ISO 周一，均为本地零点。
ISO 周以周一开始，包含周四的年份作为周年；例如 2021 年 1 月 1 日属于 `2020-W53`，值为 2020 年 12 月 28 日。
周的默认格式为 `GGGG-[W]WW`，`GGGG` 表示 ISO 周年，`WW` 表示两位周数，方括号用于转义文字。

::: raw

<div class="demo-container demo-container--row">
  <ExDateTimePicker v-model="year" type="year" aria-label="选择年份" />
  <ExDateTimePicker v-model="month" type="month" aria-label="选择月份" />
  <ExDateTimePicker v-model="week" type="week" aria-label="选择 ISO 周" />
  <ExDateTimePicker v-model="monthRange" type="monthrange" aria-label="选择月份范围" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const year = ref(null);
const month = ref(null);
const week = ref(null);
const monthRange = ref(null);
</script>

<template>
  <div class="demo-container demo-container--row">
    <ExDateTimePicker
      v-model="year"
      type="year"
      aria-label="选择年份"
    />
    <ExDateTimePicker
      v-model="month"
      type="month"
      aria-label="选择月份"
    />
    <ExDateTimePicker
      v-model="week"
      type="week"
      aria-label="选择 ISO 周"
    />
    <ExDateTimePicker
      v-model="monthRange"
      type="monthrange"
      aria-label="选择月份范围"
    />
  </div>
</template>
```

:::

年月网格支持方向键、Home / End 和 PageUp / PageDown；禁用周期会被跳过。
`disabled-date` 在这些模式下按**周期起点**判定，不扫描周期中的每一天。反向选择范围时按周期起点排序。
`show-time` 只对日历日期模式生效，年月周模式不会附加时间。

## 独立限制时间

`disabled-time(date, endpoint)` 返回时、分、秒的禁用规则。单值端点为 `start`，范围端点为 `start` / `end`。
回调收到独立日期副本。禁用时间会显示反馈并阻止确认；规则运行时变化、日期变化或另一个时间维度变化都会重新校验。

::: raw

<div class="demo-container">
  <ExDateTimePicker v-model="appointment" type="datetime" :time-step="15" :disabled-time="businessHours" aria-label="预约营业时间" />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const appointment = ref(null);
const businessHours = () => ({
  disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23],
  disabledMinutes: hour => (hour === 19 ? [30, 45] : []),
});
</script>

<template>
  <div class="demo-container">
    <ExDateTimePicker
      v-model="appointment"
      type="datetime"
      :time-step="15"
      :disabled-time="businessHours"
      aria-label="预约营业时间"
    />
  </div>
</template>
```

:::

```ts
const disabledTime = (date: Date, endpoint: 'start' | 'end') => ({
  disabledHours: () => (endpoint === 'start' ? [0, 1, 2, 3, 4, 5, 6, 7] : []),
  disabledMinutes: (hour: number) => (hour === 19 ? [30, 45] : []),
  disabledSeconds: (hour: number, minute: number) =>
    date.getDay() === 0 && hour === 19 && minute === 15 ? [30] : [],
});
```

## 确认值与受控状态

提供 `model-value` 后，输入框只显示父级已确认的值；父级拒绝更新时不会显示被拒绝的草稿。
省略 `model-value` 使用内部状态，重新打开面板保留最后一次确认。显式 `null` 是受控空值。
日期时间在确认前、范围只选第一个端点时都不会更新输入框；Escape、外部点击或禁用控件会丢弃未确认草稿。

## API

### Props

| 属性                      | 说明                                                    | 类型                             | 默认值       |
| ------------------------- | ------------------------------------------------------- | -------------------------------- | ------------ |
| `model-value` / `v-model` | 当前日期或日期范围                                      | `Date \| [Date, Date] \| null`   | `null`       |
| `type`                    | 选择模式，包含上述十种模式                              | `DateTimePickerType`             | `'date'`     |
| `id`                      | 原生输入框 ID，支持外部 label 关联                      | `string`                         | —            |
| `size`                    | 组件尺寸                                                | `'small' \| 'medium' \| 'large'` | 跟随全局配置 |
| `placeholder`             | 输入框占位文本                                          | `string`                         | 本地化文本   |
| `start-placeholder`       | 范围起点占位文本                                        | `string`                         | 本地化文本   |
| `end-placeholder`         | 范围终点占位文本                                        | `string`                         | 本地化文本   |
| `format`                  | 日期时间格式；另支持 ISO `GGGG` / `WW` 和 `[文字]` 转义 | `string`                         | 按模式决定   |
| `disabled`                | 是否禁用全部交互                                        | `boolean`                        | `false`      |
| `readonly`                | 是否只读并禁止打开面板                                  | `boolean`                        | `false`      |
| `clearable`               | 是否允许清空                                            | `boolean`                        | `true`       |
| `disabled-date`           | 判断某个本地日历日期是否不可选择                        | `(date: Date) => boolean`        | —            |
| `disabled-time`           | 日期时间端点的时分秒禁用规则                            | `DisabledTimeFn`                 | —            |
| `show-time`               | 在日期模式中额外启用时间选择                            | `boolean`                        | `false`      |
| `time-step`               | 分钟步长，规范范围 1～60                                | `number`                         | `1`          |
| `show-today`              | 是否显示“今天”按钮                                      | `boolean`                        | `true`       |
| `teleported`              | 是否将面板传送到 body，避免祖先 overflow 裁剪           | `boolean`                        | `true`       |
| `aria-label`              | 输入框无障碍名称                                        | `string`                         | 使用占位文本 |

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
