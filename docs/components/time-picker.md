# TimePicker 时间选择器

用于选择或输入时间的控件。

## 基础用法

最简单的用法，通过 `v-model` 绑定时间值。

```vue
<template>
  <div>
    <ex-time-picker v-model="time" placeholder="请选择时间" />
    <p>选中时间: {{ time }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time = ref('')
</script>
```

## 不同尺寸

通过 `size` 属性设置时间选择器的尺寸。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" size="small" placeholder="小尺寸" />
    <ex-time-picker v-model="time2" size="medium" placeholder="中等尺寸" />
    <ex-time-picker v-model="time3" size="large" placeholder="大尺寸" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
const time3 = ref('')
</script>
```

## 时间格式

通过 `format` 属性设置时间格式。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" format="HH:mm:ss" placeholder="时:分:秒" />
    <ex-time-picker v-model="time2" format="HH:mm" placeholder="时:分" />
    <ex-time-picker v-model="time3" format="hh:mm:ss A" placeholder="12小时制" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
const time3 = ref('')
</script>
```

## 12小时制

通过 `use12Hours` 属性启用12小时制。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker 
      v-model="time1" 
      format="hh:mm:ss A" 
      :use12Hours="true" 
      placeholder="12小时制" 
    />
    <ex-time-picker 
      v-model="time2" 
      format="hh:mm A" 
      :use12Hours="true" 
      placeholder="12小时制(无秒)" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
</script>
```

## 时间步长

通过 `step` 属性设置时间选择的步长。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker 
      v-model="time1" 
      :step="{ hour: 1, minute: 15, second: 15 }" 
      placeholder="15分钟步长" 
    />
    <ex-time-picker 
      v-model="time2" 
      :step="{ hour: 2, minute: 30, second: 30 }" 
      placeholder="30分钟步长" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
</script>
```

## 禁用时间

通过 `disabledTime` 属性禁用特定的时间。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker 
      v-model="time1" 
      :disabled-time="disabledTime1" 
      placeholder="禁用上午时间" 
    />
    <ex-time-picker 
      v-model="time2" 
      :disabled-time="disabledTime2" 
      placeholder="禁用特定分钟" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')

const disabledTime1 = {
  disabledHours: () => {
    // 禁用0-11点（上午）
    return Array.from({ length: 12 }, (_, i) => i)
  },
  disabledMinutes: () => [],
  disabledSeconds: () => []
}

const disabledTime2 = {
  disabledHours: () => [],
  disabledMinutes: (selectedHour) => {
    // 禁用0、15、30、45分钟
    return [0, 15, 30, 45]
  },
  disabledSeconds: () => []
}
</script>
```

## 禁用状态

通过 `disabled` 属性禁用时间选择器。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" placeholder="正常状态" />
    <ex-time-picker v-model="time2" disabled placeholder="禁用状态" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('14:30:45')
</script>
```

## 只读状态

通过 `readonly` 属性设置只读状态。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" placeholder="可编辑" />
    <ex-time-picker v-model="time2" readonly placeholder="只读状态" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('14:30:45')
</script>
```

## 不可清空

通过 `clearable` 属性控制是否显示清空按钮。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" placeholder="可清空" />
    <ex-time-picker v-model="time2" :clearable="false" placeholder="不可清空" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('14:30:45')
const time2 = ref('14:30:45')
</script>
```

## 状态样式

通过 `status` 属性设置不同的状态样式。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" status="normal" placeholder="正常状态" />
    <ex-time-picker v-model="time2" status="error" placeholder="错误状态" />
    <ex-time-picker v-model="time3" status="warning" placeholder="警告状态" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
const time3 = ref('')
</script>
```

## 无边框

通过 `bordered` 属性控制是否显示边框。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" placeholder="有边框" />
    <ex-time-picker v-model="time2" :bordered="false" placeholder="无边框" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
</script>
```

## 前缀图标

通过 `prefix-icon` 属性设置前缀图标。

```vue
<template>
  <div class="demo-space">
    <ex-time-picker v-model="time1" prefix-icon="clock" placeholder="带前缀图标" />
    <ex-time-picker v-model="time2" prefix-icon="time" placeholder="自定义前缀" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('')
</script>
```

## 事件处理

时间选择器支持多种事件。

```vue
<template>
  <div>
    <ex-time-picker 
      v-model="time" 
      placeholder="选择时间"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
    />
    <div class="event-log">
      <p v-for="log in logs" :key="log.id">{{ log.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const time = ref('')
const logs = ref([])
let logId = 0

const addLog = (message) => {
  logs.value.unshift({
    id: ++logId,
    message: `${new Date().toLocaleTimeString()}: ${message}`
  })
  if (logs.value.length > 5) {
    logs.value.pop()
  }
}

const handleChange = (event) => {
  addLog(`时间变更: ${event.timeString}`)
}

const handleFocus = () => {
  addLog('获得焦点')
}

const handleBlur = () => {
  addLog('失去焦点')
}

const handleClear = () => {
  addLog('清空时间')
}
</script>

<style scoped>
.event-log {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `TimeValue` | - |
| format | 时间格式 | `TimeFormat` | `'HH:mm:ss'` |
| placeholder | 占位符 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `true` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 状态 | `'normal' \| 'error' \| 'warning'` | `'normal'` |
| step | 时间步长 | `TimeStep` | `{ hour: 1, minute: 1, second: 1 }` |
| disabledTime | 禁用时间 | `DisabledTime` | - |
| showNow | 是否显示"此刻"按钮 | `boolean` | `true` |
| use12Hours | 是否使用12小时制 | `boolean` | `false` |
| validateEvent | 是否触发表单验证 | `boolean` | `true` |
| bordered | 是否显示边框 | `boolean` | `true` |
| prefixIcon | 前缀图标 | `string` | - |
| suffixIcon | 后缀图标 | `string` | `'clock'` |
| popperClass | 弹出层类名 | `string` | - |
| name | 原生name属性 | `string` | - |
| id | 原生id属性 | `string` | - |
| tabindex | 原生tabindex属性 | `string \| number` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 值变化时触发 | `(value: TimeValue) => void` |
| change | 时间改变时触发 | `(event: TimeChangeEvent) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| clear | 清空时触发 | `() => void` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| focus | 使输入框获得焦点 | - |
| blur | 使输入框失去焦点 | - |
| showPanel | 显示时间面板 | - |
| hidePanel | 隐藏时间面板 | - |

### Types

```typescript
// 时间值类型
type TimeValue = string | Date | null

// 时间格式类型
type TimeFormat = 'HH:mm:ss' | 'HH:mm' | 'hh:mm:ss A' | 'hh:mm A'

// 时间步长类型
interface TimeStep {
  hour?: number
  minute?: number
  second?: number
}

// 禁用时间类型
interface DisabledTime {
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
}

// 时间变更事件类型
interface TimeChangeEvent {
  value: TimeValue
  timeString: string
}
```

## 样式变量

组件提供了以下CSS变量用于自定义样式：

```css
:root {
  /* 时间选择器 */
  --ex-time-picker-height: 32px;
  --ex-time-picker-padding: 4px 11px;
  --ex-time-picker-font-size: 14px;
  --ex-time-picker-border-color: #d9d9d9;
  --ex-time-picker-border-radius: 6px;
  --ex-time-picker-bg-color: #ffffff;
  
  /* 时间面板 */
  --ex-time-panel-width: 280px;
  --ex-time-panel-bg-color: #ffffff;
  --ex-time-panel-border-color: #d9d9d9;
  --ex-time-panel-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  
  /* 时间选项 */
  --ex-time-option-height: 32px;
  --ex-time-option-hover-bg: #f5f5f5;
  --ex-time-option-selected-bg: #e6f7ff;
  --ex-time-option-selected-color: #1890ff;
}
```

## 无障碍

- 支持键盘导航（Tab、Enter、Escape、方向键）
- 提供适当的 ARIA 属性
- 支持屏幕阅读器
- 遵循 WAI-ARIA 规范

## 注意事项

1. 时间值可以是 `Date` 对象、时间字符串或 `null`
2. 时间格式必须与 `format` 属性保持一致
3. 12小时制需要同时设置 `use12Hours` 和相应的 `format`
4. 禁用时间函数会在每次面板打开时调用
5. 组件会自动处理时间的验证和格式化