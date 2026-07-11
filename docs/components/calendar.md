# Calendar 日历

用于展示日期、日程管理、签到等场景的日历组件，支持日、周、月、年四种视图模式。

<script setup>
import { ref } from 'vue'

const selectedDate = ref(new Date())
const mode = ref('month')

// 日程事件
const events = ref([
  {
    id: 1,
    title: '团队会议',
    date: new Date(2025, 9, 23),
    type: 'primary',
    description: '讨论Q1计划'
  },
  {
    id: 2,
    title: '项目截止',
    date: new Date(2025, 9, 22),
    type: 'danger',
    description: '提交最终版本'
  },
  {
    id: 3,
    title: '培训课程',
    date: new Date(2025, 9, 25),
    type: 'success',
    description: 'Vue 3 进阶'
  },
  {
    id: 4,
    title: '代码审查',
    date: new Date(2025, 9, 24),
    type: 'warning',
    description: '审查新功能代码'
  },
])

// 签到日期
const checkedInDates = ref([
  new Date(2025, 9, 1),
  new Date(2025, 9, 2),
  new Date(2025, 9, 3),
  new Date(2025, 9, 5),
  new Date(2025, 9, 8),
  new Date(2025, 9, 10),
])

const handleDateClick = (date, cell) => {
  console.log('日期点击:', date, cell)
}

const handleEventClick = (event, date) => {
  console.log('事件点击:', event, date)
}

const handleModeChange = (newMode) => {
  mode.value = newMode
  console.log('视图模式切换:', newMode)
}

// 自定义节假日
const holidays = ref([
  { name: '元旦', date: '01-01', type: 'holiday' },
  { name: '劳动节', date: '05-01', type: 'holiday' },
  { name: '国庆节', date: '10-01', type: 'holiday' },
  { name: '公司周年庆', date: '06-15', type: 'custom' },
])

</script>

## 基础用法

最简单的日历使用方式。

<div class="demo-container">
  <ExCalendar v-model="selectedDate" />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
</script>
```

## 视图模式

日历支持四种视图模式：日视图、周视图、月视图（默认）和年视图。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :mode="mode"
    @mode-change="handleModeChange"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :mode="mode" @mode-change="handleModeChange" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
const mode = ref('month');

const handleModeChange = newMode => {
  mode.value = newMode;
  console.log('视图模式切换:', newMode);
};
</script>
```

## 日视图

日视图显示单日的详细信息和事件列表。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    mode="day"
    :events="events"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" mode="day" :events="events" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
const events = ref([
  {
    id: 1,
    title: '团队会议',
    date: new Date(),
    type: 'primary',
    description: '讨论Q1计划',
  },
]);
</script>
```

## 周视图

周视图显示一周的日期和事件。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    mode="week"
    :events="events"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" mode="week" :events="events" />
</template>
```

## 月视图

月视图是默认视图，显示整月的日期和事件。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    mode="month"
    :events="events"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" mode="month" :events="events" />
</template>
```

## 年视图

年视图显示全年12个月的概览。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    mode="year"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" mode="year" />
</template>
```

## 显示事件

可以在日历上显示事件，支持不同类型的事件样式。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :events="events"
    @event-click="handleEventClick"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :events="events" @event-click="handleEventClick" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
const events = ref([
  {
    id: 1,
    title: '团队会议',
    date: new Date(2025, 9, 23),
    type: 'primary',
    description: '讨论Q1计划',
  },
  {
    id: 2,
    title: '项目截止',
    date: new Date(2025, 9, 22),
    type: 'danger',
    description: '提交最终版本',
  },
]);

const handleEventClick = (event, date) => {
  console.log('事件点击:', event, date);
};
</script>
```

## 签到功能

可以标记签到日期，显示签到状态。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :checked-in-dates="checkedInDates"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :checked-in-dates="checkedInDates" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
const checkedInDates = ref([new Date(2025, 9, 1), new Date(2025, 9, 2), new Date(2025, 9, 3)]);
</script>
```

## 显示农历

可以显示农历日期信息。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :show-lunar="true"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :show-lunar="true" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
</script>
```

## 显示节气

可以显示二十四节气信息。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :show-lunar="true"
    :show-solar-term="true"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :show-lunar="true" :show-solar-term="true" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
</script>
```

## 自定义节假日

可以自定义节假日显示。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :show-lunar="true"
    :holidays="holidays"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :show-lunar="true" :holidays="holidays" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());
const holidays = ref([
  { name: '元旦', date: '01-01', type: 'holiday' },
  { name: '劳动节', date: '05-01', type: 'holiday' },
  { name: '国庆节', date: '10-01', type: 'holiday' },
  { name: '公司周年庆', date: '06-15', type: 'custom' },
]);
</script>
```

## 禁用日期

可以通过 `disabledDate` 函数禁用特定日期。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :disabled-date="(date) => date.getDay() === 0 || date.getDay() === 6"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :disabled-date="disabledDate" />
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(new Date());

// 禁用周末
const disabledDate = date => {
  return date.getDay() === 0 || date.getDay() === 6;
};
</script>
```

## 全屏模式

日历可以全屏显示。

<div class="demo-container">
  <ExCalendar 
    v-model="selectedDate" 
    :fullscreen="true"
    :events="events"
  />
</div>

```vue
<template>
  <ExCalendar v-model="selectedDate" :fullscreen="true" :events="events" />
</template>
```

## API

### Props

| 属性           | 说明             | 类型                                            | 默认值    |
| -------------- | ---------------- | ----------------------------------------------- | --------- |
| modelValue     | 当前选中日期     | `Date`                                          | -         |
| mode           | 视图模式         | `'day' \| 'week' \| 'month' \| 'year'`          | `'month'` |
| events         | 事件列表         | `CalendarEvent[]`                               | `[]`      |
| disabledDate   | 禁用日期函数     | `(date: Date) => boolean`                       | -         |
| showToday      | 是否显示今天按钮 | `boolean`                                       | `true`    |
| fullscreen     | 是否全屏显示     | `boolean`                                       | `false`   |
| checkedInDates | 签到日期列表     | `(Date \| string)[]`                            | `[]`      |
| showLunar      | 是否显示农历     | `boolean`                                       | `false`   |
| showSolarTerm  | 是否显示节气     | `boolean`                                       | `true`    |
| holidays       | 自定义节假日列表 | `Holiday[]`                                     | `[]`      |
| ariaLabel      | 无障碍标签       | `string`                                        | -         |
| class          | 自定义CSS类名    | `string \| string[] \| Record<string, boolean>` | -         |
| style          | 自定义样式       | `string \| Record<string, string \| number>`    | -         |

### Events

| 事件名            | 说明               | 参数                                   |
| ----------------- | ------------------ | -------------------------------------- |
| update:modelValue | 值改变事件         | `(value: Date)`                        |
| select            | 日期选择事件       | `(date: Date, cell: CalendarDateCell)` |
| month-change      | 月份改变事件       | `(year: number, month: number)`        |
| year-change       | 年份改变事件       | `(year: number)`                       |
| mode-change       | 视图模式改变事件   | `(mode: CalendarMode)`                 |
| date-click        | 日期单元格点击事件 | `(date: Date, cell: CalendarDateCell)` |
| event-click       | 事件点击事件       | `(event: CalendarEvent, date: Date)`   |

### Methods

| 方法名     | 说明        | 参数           |
| ---------- | ----------- | -------------- |
| selectDate | 选择日期    | `(date: Date)` |
| goToday    | 跳转到今天  | -              |
| prevMonth  | 上一个月    | -              |
| nextMonth  | 下一个月    | -              |
| prevYear   | 上一年      | -              |
| nextYear   | 下一年      | -              |
| getElement | 获取DOM元素 | -              |

### Types

#### CalendarEvent

```typescript
interface CalendarEvent {
  /** 事件ID */
  id: string | number;
  /** 事件标题 */
  title: string;
  /** 事件日期 */
  date: Date | string;
  /** 事件类型 */
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  /** 事件描述 */
  description?: string;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}
```

#### CalendarDateCell

```typescript
interface CalendarDateCell {
  /** 日期 */
  date: Date;
  /** 日期数字 */
  day: number;
  /** 是否当前月 */
  isCurrentMonth: boolean;
  /** 是否今天 */
  isToday: boolean;
  /** 是否选中 */
  /** 是否禁用 */
  disabled: boolean;
  /** 该日期的事件列表 */
  events: CalendarEvent[];
  /** 签到状态 */
  checkedIn?: boolean;
  /** 农历日期 */
  lunar?: string;
  /** 节气 */
  solarTerm?: string;
  /** 节假日 */
  holiday?: string;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}
```

#### Holiday

```typescript
interface Holiday {
  /** 节假日名称 */
  name: string;
  /** 节假日日期（月-日格式，如 "01-01" 表示1月1日） */
  date: string;
  /** 节假日类型 */
  type?: 'festival' | 'holiday' | 'custom';
}
```

#### CalendarMode

```typescript
type CalendarMode = 'day' | 'week' | 'month' | 'year';
```

## 无障碍支持

- 支持键盘导航
- 提供 ARIA 标签
- 支持屏幕阅读器
- 支持高对比度模式
- 支持减少动画模式

## 主题定制

日历跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。
