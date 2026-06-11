# DateTimePicker 日期时间选择器

用于选择日期或日期时间的组件。

<script setup>
import { ref } from 'vue'

const date1 = ref(null)
const date2 = ref(new Date())
const date3 = ref(null)
const date4 = ref(null)
const dateRange1 = ref(null)
const dateRange2 = ref([new Date(2024, 0, 1), new Date(2024, 0, 7)])
const dateRange3 = ref(null)
const datetime1 = ref(null)
const datetime2 = ref(new Date())
const datetimeRange1 = ref(null)

const disabledDate = (date) => {
  // 禁用今天之前的日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const handleChange = (value) => {
  console.log('Date changed:', value)
}
</script>

## 基础用法

最基础的日期选择器用法。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date1"
    placeholder="请选择日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const date = ref(null);
</script>

<template>
  <ExDateTimePicker v-model="date" placeholder="请选择日期" />
</template>
```

## 默认值

可以设置默认选中的日期。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date2"
    placeholder="请选择日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const date = ref(new Date());
</script>

<template>
  <ExDateTimePicker v-model="date" placeholder="请选择日期" />
</template>
```

## 不同尺寸

提供三种尺寸的日期选择器。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <ExDateTimePicker
    v-model="date1"
    size="small"
    placeholder="小尺寸"
  />
  <ExDateTimePicker
    v-model="date1"
    size="medium"
    placeholder="中等尺寸"
  />
  <ExDateTimePicker
    v-model="date1"
    size="large"
    placeholder="大尺寸"
  />
</div>

```vue
<template>
  <ExDateTimePicker v-model="date" size="small" placeholder="小尺寸" />

  <ExDateTimePicker v-model="date" size="medium" placeholder="中等尺寸" />

  <ExDateTimePicker v-model="date" size="large" placeholder="大尺寸" />
</template>
```

## 禁用日期

可以通过 `disabledDate` 函数禁用特定日期。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date3"
    :disabled-date="disabledDate"
    placeholder="只能选择今天及以后的日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const date = ref(null);

const disabledDate = (date) => {
  // 禁用今天之前的日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
</script>

<template>
  <ExDateTimePicker
    v-model="date"
    :disabled-date="disabledDate"
    placeholder="只能选择今天及以后的日期"
  />
</template>
```

## 不可清空

设置 `clearable` 为 `false` 可以禁用清空功能。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date2"
    :clearable="false"
    placeholder="不可清空"
  />
</div>

```vue
<template>
  <ExDateTimePicker v-model="date" :clearable="false" placeholder="不可清空" />
</template>
```

## 禁用状态

禁用日期选择器。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date2"
    disabled
    placeholder="禁用状态"
  />
</div>

```vue
<template>
  <ExDateTimePicker v-model="date" disabled placeholder="禁用状态" />
</template>
```

## 只读状态

只读状态的日期选择器。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date2"
    readonly
    placeholder="只读状态"
  />
</div>

```vue
<template>
  <ExDateTimePicker v-model="date" readonly placeholder="只读状态" />
</template>
```

## 自定义格式

可以通过 `format` 属性自定义日期格式。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <ExDateTimePicker
    v-model="date2"
    format="YYYY-MM-DD"
    placeholder="YYYY-MM-DD"
  />
  <ExDateTimePicker
    v-model="date2"
    format="YYYY/MM/DD"
    placeholder="YYYY/MM/DD"
  />
  <ExDateTimePicker
    v-model="date2"
    format="DD-MM-YYYY"
    placeholder="DD-MM-YYYY"
  />
</div>

```vue
<template>
  <ExDateTimePicker v-model="date" format="YYYY-MM-DD" placeholder="YYYY-MM-DD" />

  <ExDateTimePicker v-model="date" format="YYYY/MM/DD" placeholder="YYYY/MM/DD" />

  <ExDateTimePicker v-model="date" format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
</template>
```

## 事件监听

监听日期选择器的各种事件。

<div class="demo-container">
  <ExDateTimePicker
    v-model="date4"
    placeholder="选择日期查看事件"
    @change="handleChange"
    @clear="() => console.log('Cleared')"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const date = ref(null);

const handleChange = (value) => {
  console.log('Date changed:', value);
};
</script>

<template>
  <ExDateTimePicker
    v-model="date"
    placeholder="选择日期查看事件"
    @change="handleChange"
    @clear="() => console.log('Cleared')"
  />
</template>
```

## 日期范围选择

通过设置 `type="daterange"` 可以选择日期范围。

<div class="demo-container">
  <ExDateTimePicker
    v-model="dateRange1"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const dateRange = ref(null);
</script>

<template>
  <ExDateTimePicker
    v-model="dateRange"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>
```

## 默认日期范围

可以设置默认的日期范围。

<div class="demo-container">
  <ExDateTimePicker
    v-model="dateRange2"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const dateRange = ref([new Date(2024, 0, 1), new Date(2024, 0, 7)]);
</script>

<template>
  <ExDateTimePicker
    v-model="dateRange"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>
```

## 限制日期范围

可以通过 `disabledDate` 函数限制可选择的日期范围。

<div class="demo-container">
  <ExDateTimePicker
    v-model="dateRange3"
    type="daterange"
    :disabled-date="disabledDate"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const dateRange = ref(null);

const disabledDate = (date) => {
  // 禁用今天之前的日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
</script>

<template>
  <ExDateTimePicker
    v-model="dateRange"
    type="daterange"
    :disabled-date="disabledDate"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>
```

## 日期时间选择

通过设置 `type="datetime"` 可以同时选择日期和时间。

<div class="demo-container">
  <ExDateTimePicker
    v-model="datetime1"
    type="datetime"
    placeholder="请选择日期时间"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const datetime = ref(null);
</script>

<template>
  <ExDateTimePicker v-model="datetime" type="datetime" placeholder="请选择日期时间" />
</template>
```

## 默认日期时间

可以设置默认的日期时间值。

<div class="demo-container">
  <ExDateTimePicker
    v-model="datetime2"
    type="datetime"
    placeholder="请选择日期时间"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const datetime = ref(new Date());
</script>

<template>
  <ExDateTimePicker v-model="datetime" type="datetime" placeholder="请选择日期时间" />
</template>
```

## 日期时间范围选择

通过设置 `type="datetimerange"` 可以选择日期时间范围。

<div class="demo-container">
  <ExDateTimePicker
    v-model="datetimeRange1"
    type="datetimerange"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const datetimeRange = ref(null);
</script>

<template>
  <ExDateTimePicker
    v-model="datetimeRange"
    type="datetimerange"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
  />
</template>
```

## 主题示例

展示风格的日期选择器应用场景。

<div class="demo-container" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(255, 0, 127, 0.05)); padding: 32px;">
  <div style="max-width: 400px;">
    <h3 style="margin: 0 0 24px; color: var(--ex-color-neon-blue-500); font-family: var(--ex-font-primary); text-transform: uppercase;">
      活动报名
    </h3>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <label style="display: block; margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
          选择参赛日期
        </label>
        <ExDateTimePicker
          v-model="date1"
          size="large"
          placeholder="请选择参赛日期"
          :disabled-date="disabledDate"
        />
      </div>
      <div style="padding: 16px; background: var(--ex-color-bg-secondary); border: 1px solid var(--ex-color-border-primary); border-radius: var(--ex-radius-base);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--ex-color-text-secondary);">选中日期：</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: 600;">
            {{ date1 ? new Date(date1).toLocaleDateString('zh-CN') : '未选择' }}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--ex-color-text-secondary);">报名状态：</span>
          <span :style="{ color: date1 ? 'var(--ex-color-success)' : 'var(--ex-color-text-tertiary)' }">
            {{ date1 ? '✓ 已选择' : '待选择' }}
          </span>
        </div>
      </div>
      <div style="margin-top: 24px;">
        <label style="display: block; margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
          选择活动周期
        </label>
        <ExDateTimePicker
          v-model="dateRange1"
          type="daterange"
          size="large"
          start-placeholder="活动开始"
          end-placeholder="活动结束"
          :disabled-date="disabledDate"
        />
      </div>
      <div v-if="dateRange1 && dateRange1.length === 2" style="margin-top: 16px; padding: 16px; background: var(--ex-color-bg-secondary); border: 1px solid var(--ex-color-border-primary); border-radius: var(--ex-radius-base);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--ex-color-text-secondary);">活动开始：</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: 600;">
            {{ new Date(dateRange1[0]).toLocaleDateString('zh-CN') }}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--ex-color-text-secondary);">活动结束：</span>
          <span style="color: var(--ex-color-neon-pink-500); font-weight: 600;">
            {{ new Date(dateRange1[1]).toLocaleDateString('zh-CN') }}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--ex-color-text-secondary);">活动天数：</span>
          <span style="color: var(--ex-color-success); font-weight: 600;">
            {{ Math.ceil((dateRange1[1] - dateRange1[0]) / (1000 * 60 * 60 * 24)) + 1 }} 天
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

```vue
<template>
  <div>
    <h3>活动报名</h3>

    <div>
      <label>选择参赛日期</label>
      <ExDateTimePicker
        v-model="date"
        size="large"
        placeholder="请选择参赛日期"
        :disabled-date="disabledDate"
      />
    </div>

    <div>
      <div>选中日期：{{ date ? new Date(date).toLocaleDateString('zh-CN') : '未选择' }}</div>
      <div>报名状态：{{ date ? '✓ 已选择' : '待选择' }}</div>
    </div>
  </div>
</template>
```

## API

### DateTimePicker Props

| 属性                      | 说明                   | 类型                                                                          | 默认值         |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------- | -------------- |
| `model-value` / `v-model` | 绑定值                 | `Date \| [Date, Date] \| null`                                                | `null`         |
| `type`                    | 选择器类型             | `'date' \| 'datetime' \| 'daterange' \| 'datetimerange' \| 'month' \| 'year'` | `'date'`       |
| `size`                    | 尺寸                   | `'small' \| 'medium' \| 'large'`                                              | `'medium'`     |
| `placeholder`             | 占位符                 | `string`                                                                      | `''`           |
| `start-placeholder`       | 范围选择时的开始占位符 | `string`                                                                      | `'开始日期'`   |
| `end-placeholder`         | 范围选择时的结束占位符 | `string`                                                                      | `'结束日期'`   |
| `format`                  | 日期格式               | `string`                                                                      | `'YYYY-MM-DD'` |
| `disabled`                | 是否禁用               | `boolean`                                                                     | `false`        |
| `readonly`                | 是否只读               | `boolean`                                                                     | `false`        |
| `clearable`               | 是否可清空             | `boolean`                                                                     | `true`         |
| `disabled-date`           | 禁用日期函数           | `(date: Date) => boolean`                                                     | —              |
| `show-today`              | 是否显示今天按钮       | `boolean`                                                                     | `true`         |
| `aria-label`              | 无障碍标签             | `string`                                                                      | —              |

### DateTimePicker Events

| 事件名               | 说明         | 类型                                            |
| -------------------- | ------------ | ----------------------------------------------- |
| `update:model-value` | 值改变时触发 | `(value: Date \| [Date, Date] \| null) => void` |
| `change`             | 值改变时触发 | `(value: Date \| [Date, Date] \| null) => void` |
| `focus`              | 聚焦时触发   | `(event: FocusEvent) => void`                   |
| `blur`               | 失焦时触发   | `(event: FocusEvent) => void`                   |
| `clear`              | 清空时触发   | `() => void`                                    |

### DateTimePicker Methods

| 方法名       | 说明             | 类型                           |
| ------------ | ---------------- | ------------------------------ |
| `focus`      | 使输入框获取焦点 | `() => void`                   |
| `blur`       | 使输入框失去焦点 | `() => void`                   |
| `getElement` | 获取组件DOM元素  | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签和 ARIA 属性
- 完整的键盘导航支持
- 支持屏幕阅读器
- 所有按钮都有明确的 `aria-label`
- 支持减少动画偏好设置

## 主题定制

可以通过 CSS 变量自定义日期选择器样式：

```css
:root {
  --ex-datetime-picker-bg: var(--ex-color-bg-secondary);
  --ex-datetime-picker-border: var(--ex-color-border-primary);
  --ex-datetime-picker-color: var(--ex-color-text-primary);
  --ex-datetime-picker-hover-bg: rgba(0, 240, 255, 0.1);
  --ex-datetime-picker-selected-bg: linear-gradient(
    135deg,
    var(--ex-color-neon-blue-500),
    var(--ex-color-neon-pink-500)
  );
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
