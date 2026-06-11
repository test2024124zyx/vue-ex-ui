# DatePicker 日期选择器

用于选择或输入日期的控件。

## 基础用法

最简单的用法，通过 `v-model` 绑定选中的日期。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker v-model="date" placeholder="选择日期" />
    <p>选中的日期：{{ date }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(null)
</script>
```

## 不同类型

通过 `type` 属性可以设置不同的选择器类型。

```vue
<template>
  <div class="demo-space">
    <div class="demo-row">
      <label>日期选择：</label>
      <ex-date-picker v-model="date1" type="date" />
    </div>
    
    <div class="demo-row">
      <label>日期时间选择：</label>
      <ex-date-picker v-model="date2" type="datetime" />
    </div>
    
    <div class="demo-row">
      <label>月份选择：</label>
      <ex-date-picker v-model="date3" type="month" />
    </div>
    
    <div class="demo-row">
      <label>年份选择：</label>
      <ex-date-picker v-model="date4" type="year" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date1 = ref(null)
const date2 = ref(null)
const date3 = ref(null)
const date4 = ref(null)
</script>
```

## 范围选择

通过设置 `type` 为 `daterange` 或 `datetimerange` 可以选择日期范围。

```vue
<template>
  <div class="demo-space">
    <div class="demo-row">
      <label>日期范围：</label>
      <ex-date-picker 
        v-model="dateRange1" 
        type="daterange"
        range-separator=" 至 "
      />
    </div>
    
    <div class="demo-row">
      <label>日期时间范围：</label>
      <ex-date-picker 
        v-model="dateRange2" 
        type="datetimerange"
      />
    </div>
    
    <p>日期范围：{{ dateRange1 }}</p>
    <p>日期时间范围：{{ dateRange2 }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dateRange1 = ref([])
const dateRange2 = ref([])
</script>
```

## 不同尺寸

通过 `size` 属性设置不同的尺寸。

```vue
<template>
  <div class="demo-space">
    <div class="demo-row">
      <ex-date-picker v-model="date1" size="small" placeholder="小尺寸" />
    </div>
    
    <div class="demo-row">
      <ex-date-picker v-model="date2" size="medium" placeholder="中等尺寸" />
    </div>
    
    <div class="demo-row">
      <ex-date-picker v-model="date3" size="large" placeholder="大尺寸" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date1 = ref(null)
const date2 = ref(null)
const date3 = ref(null)
</script>
```

## 禁用状态

通过 `disabled` 属性禁用日期选择器。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      disabled 
      placeholder="禁用状态" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(new Date())
</script>
```

## 只读状态

通过 `readonly` 属性设置只读状态。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      readonly 
      placeholder="只读状态" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(new Date())
</script>
```

## 自定义格式

通过 `format` 属性自定义日期格式。

```vue
<template>
  <div class="demo-space">
    <div class="demo-row">
      <label>默认格式：</label>
      <ex-date-picker v-model="date1" />
    </div>
    
    <div class="demo-row">
      <label>自定义格式：</label>
      <ex-date-picker v-model="date2" format="DD/MM/YYYY" />
    </div>
    
    <div class="demo-row">
      <label>中文格式：</label>
      <ex-date-picker v-model="date3" format="YYYY年MM月DD日" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date1 = ref(null)
const date2 = ref(null)
const date3 = ref(null)
</script>
```

## 禁用日期

通过 `disabled-date` 函数禁用特定日期。

```vue
<template>
  <div class="demo-space">
    <div class="demo-row">
      <label>禁用今天之前的日期：</label>
      <ex-date-picker 
        v-model="date1" 
        :disabled-date="disabledBeforeToday"
      />
    </div>
    
    <div class="demo-row">
      <label>禁用周末：</label>
      <ex-date-picker 
        v-model="date2" 
        :disabled-date="disabledWeekends"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date1 = ref(null)
const date2 = ref(null)

const disabledBeforeToday = (date) => {
  return date < new Date().setHours(0, 0, 0, 0)
}

const disabledWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // 周日和周六
}
</script>
```

## 快捷选项

通过 `shortcuts` 属性添加快捷选择选项。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      type="daterange"
      :shortcuts="shortcuts"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref([])

const shortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  }
]
</script>
```

## 12小时制

通过 `use12-hours` 属性启用12小时制时间选择。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      type="datetime"
      use12-hours
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(null)
</script>
```

## 时间步长

通过 `hour-step`、`minute-step`、`second-step` 属性设置时间选择的步长。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      type="datetime"
      :hour-step="2"
      :minute-step="15"
      :second-step="30"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(null)
</script>
```

## 事件处理

日期选择器支持多种事件。

```vue
<template>
  <div class="demo-space">
    <ex-date-picker 
      v-model="date" 
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      @panel-change="handlePanelChange"
    />
    
    <div class="event-log">
      <h4>事件日志：</h4>
      <ul>
        <li v-for="(log, index) in eventLogs" :key="index">
          {{ log }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(null)
const eventLogs = ref([])

const addLog = (message) => {
  eventLogs.value.unshift(`${new Date().toLocaleTimeString()}: ${message}`)
  if (eventLogs.value.length > 5) {
    eventLogs.value.pop()
  }
}

const handleChange = (value, dateString) => {
  addLog(`日期改变: ${dateString}`)
}

const handleFocus = () => {
  addLog('获得焦点')
}

const handleBlur = () => {
  addLog('失去焦点')
}

const handleClear = () => {
  addLog('清空日期')
}

const handlePanelChange = (value, mode) => {
  addLog(`面板切换: ${mode}`)
}
</script>

<style scoped>
.event-log {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.event-log ul {
  margin: 0;
  padding-left: 20px;
}

.event-log li {
  margin: 4px 0;
  font-size: 14px;
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value / v-model | 绑定值 | Date / string / Array | — | — |
| type | 显示类型 | string | date/datetime/daterange/datetimerange/month/year | date |
| size | 输入框尺寸 | string | small/medium/large | medium |
| placeholder | 占位文本 | string | — | — |
| end-placeholder | 范围选择时结束日期的占位内容 | string | — | — |
| format | 显示在输入框中的格式 | string | — | YYYY-MM-DD |
| disabled | 禁用 | boolean | — | false |
| readonly | 只读 | boolean | — | false |
| editable | 文本框可输入 | boolean | — | true |
| clearable | 是否显示清除按钮 | boolean | — | true |
| range-separator | 选择范围时的分隔符 | string | — | ' - ' |
| disabled-date | 设置禁用状态，参数为当前日期 | function | — | — |
| shortcuts | 设置快捷选项 | Array | — | — |
| first-day-of-week | 周起始日 | number | 0-6 | 0 |
| show-week-number | 是否显示周数 | boolean | — | false |
| use12-hours | 使用12小时制 | boolean | — | false |
| hour-step | 小时选项间隔 | number | — | 1 |
| minute-step | 分钟选项间隔 | number | — | 1 |
| second-step | 秒选项间隔 | number | — | 1 |
| disabled-hours | 禁用小时函数 | function | — | — |
| disabled-minutes | 禁用分钟函数 | function | — | — |
| disabled-seconds | 禁用秒函数 | function | — | — |
| placement | 弹出位置 | string | top/bottom/left/right | bottom-start |
| locale | 语言 | string | zh/en | zh |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 用户确认选定的值时触发 | (value: Date \| Array, dateString: string \| Array) |
| focus | 输入框获得焦点时触发 | (event: FocusEvent) |
| blur | 输入框失去焦点时触发 | (event: FocusEvent) |
| clear | 点击清除按钮时触发 | — |
| panel-change | 日期面板变化时触发 | (value: Date, mode: string) |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使输入框获取焦点 | — |
| blur | 使输入框失去焦点 | — |

## 主题定制

### CSS 变量

```css
:root {
  /* 日期选择器变量 */
  --ex-date-picker-bg: var(--color-bg);
  --ex-date-picker-border: var(--color-border);
  --ex-date-picker-border-hover: var(--color-border-hover);
  --ex-date-picker-border-focus: var(--color-primary);
  --ex-date-picker-text: var(--color-text);
  --ex-date-picker-placeholder: var(--color-text-placeholder);
  --ex-date-picker-disabled-bg: var(--color-bg-disabled);
  --ex-date-picker-disabled-text: var(--color-text-disabled);
  
  /* 面板变量 */
  --ex-date-panel-bg: var(--color-bg);
  --ex-date-panel-border: var(--color-border);
  --ex-date-panel-shadow: var(--shadow-lg);
  --ex-date-panel-item-hover: var(--color-bg-hover);
  --ex-date-panel-item-selected: var(--color-primary);
  --ex-date-panel-item-selected-text: var(--color-white);
  --ex-date-panel-item-disabled: var(--color-text-disabled);
}
```

### 自定义样式

```css
/* 自定义输入框样式 */
.custom-date-picker .ex-date-picker__input {
  border-radius: 8px;
  font-weight: 500;
}

/* 自定义面板样式 */
.custom-date-picker .ex-date-picker__popover {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 自定义日期项样式 */
.custom-date-picker .ex-date-panel__date {
  border-radius: 50%;
}

.custom-date-picker .ex-date-panel__date.is-selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 无障碍

DatePicker 组件遵循 WAI-ARIA 规范：

- 支持键盘导航（Tab、Enter、Escape、方向键）
- 提供适当的 ARIA 标签和角色
- 支持屏幕阅读器
- 具有良好的焦点管理

### 键盘交互

- `Tab` - 移动焦点
- `Enter` - 打开/关闭面板，确认选择
- `Escape` - 关闭面板
- `方向键` - 在日期面板中导航
- `Space` - 选择当前日期

## 最佳实践

1. **合理选择类型**：根据业务需求选择合适的日期选择器类型
2. **提供清晰的占位符**：帮助用户理解期望的日期格式
3. **设置合理的禁用规则**：避免用户选择无效的日期
4. **使用快捷选项**：为常用的日期范围提供快捷选择
5. **考虑国际化**：为不同地区提供合适的日期格式和语言
6. **响应式设计**：确保在移动设备上有良好的体验