# Slider 滑块

滑块组件用于在一个区间内选择数值，支持单值和范围选择。

<script setup>
import { ref } from 'vue'

const value1 = ref(30)
const value2 = ref(50)
const value3 = ref([20, 60])
const value4 = ref(40)
const value5 = ref(25)
const value6 = ref(70)
const value7 = ref(50)
const value8 = ref([30, 70])
const value9 = ref(60)

const formatTooltip = (value) => `${value}%`
const formatPrice = (value) => `$${value}`
</script>

## 基础用法

最简单的滑块用法。

<div class="demo-container">
  <ExSlider v-model="value1" />
  <p style="margin-top: 16px; color: var(--ex-color-text-secondary);">当前值: {{ value1 }}</p>
</div>

```vue
<template>
  <ExSlider v-model="value" />
  <p>当前值: {{ value }}</p>
</template>

<script setup>
import { ref } from 'vue';
const value = ref(30);
</script>
```

## 离散值

通过设置 `step` 属性可以改变步长，默认为 1。

<div class="demo-container">
  <ExSlider v-model="value2" :step="10" show-stops />
  <p style="margin-top: 16px; color: var(--ex-color-text-secondary);">当前值: {{ value2 }}</p>
</div>

```vue
<template>
  <ExSlider v-model="value" :step="10" show-stops />
</template>

<script setup>
import { ref } from 'vue';
const value = ref(50);
</script>
```

## 范围选择

设置 `range` 属性可以开启范围选择模式。

<div class="demo-container">
  <ExSlider v-model="value3" range />
  <p style="margin-top: 16px; color: var(--ex-color-text-secondary);">当前范围: {{ value3[0] }} - {{ value3[1] }}</p>
</div>

```vue
<template>
  <ExSlider v-model="value" range />
  <p>当前范围: {{ value[0] }} - {{ value[1] }}</p>
</template>

<script setup>
import { ref } from 'vue';
const value = ref([20, 60]);
</script>
```

## 带输入框

通过设置 `show-input` 属性可以显示输入框，方便精确输入。

<div class="demo-container">
  <ExSlider v-model="value4" show-input />
</div>

```vue
<template>
  <ExSlider v-model="value" show-input />
</template>

<script setup>
import { ref } from 'vue';
const value = ref(40);
</script>
```

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">Small</p>
    <ExSlider v-model="value5" size="small" />
  </div>
  <div>
    <p style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">Medium (默认)</p>
    <ExSlider v-model="value6" size="medium" />
  </div>
  <div>
    <p style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">Large</p>
    <ExSlider v-model="value7" size="large" />
  </div>
</div>

```vue
<template>
  <ExSlider v-model="value1" size="small" />
  <ExSlider v-model="value2" size="medium" />
  <ExSlider v-model="value3" size="large" />
</template>
```

## 自定义提示

通过 `format-tooltip` 属性可以自定义提示信息的格式。

<div class="demo-container">
  <ExSlider v-model="value9" :format-tooltip="formatTooltip" />
  <p style="margin-top: 16px; color: var(--ex-color-text-secondary);">当前值: {{ value9 }}%</p>
</div>

```vue
<template>
  <ExSlider v-model="value" :format-tooltip="formatTooltip" />
</template>

<script setup>
import { ref } from 'vue';
const value = ref(60);
const formatTooltip = value => `${value}%`;
</script>
```

## 标记

通过 `marks` 属性可以在滑块上添加标记。

<div class="demo-container">
  <ExSlider 
    v-model="value8" 
    range
    :marks="{
      0: '0°C',
      25: '25°C',
      50: '50°C',
      75: '75°C',
      100: '100°C'
    }"
  />
</div>

```vue
<template>
  <ExSlider
    v-model="value"
    range
    :marks="{
      0: '0°C',
      25: '25°C',
      50: '50°C',
      75: '75°C',
      100: '100°C',
    }"
  />
</template>

<script setup>
import { ref } from 'vue';
const value = ref([30, 70]);
</script>
```

## 垂直模式

设置 `direction="vertical"` 可以使用垂直滑块。

<div class="demo-container" style="display: flex; gap: 32px; height: 300px;">
  <ExSlider v-model="value1" direction="vertical" height="250px" />
  <ExSlider v-model="value3" direction="vertical" height="250px" range />
  <ExSlider v-model="value4" direction="vertical" height="250px" show-input />
</div>

```vue
<template>
  <div style="display: flex; gap: 32px; height: 300px;">
    <ExSlider v-model="value1" direction="vertical" height="250px" />
    <ExSlider v-model="value2" direction="vertical" height="250px" range />
    <ExSlider v-model="value3" direction="vertical" height="250px" show-input />
  </div>
</template>
```

## 禁用状态

通过 `disabled` 属性可以禁用滑块。

<div class="demo-container">
  <ExSlider v-model="value1" disabled />
</div>

```vue
<template>
  <ExSlider v-model="value" disabled />
</template>
```

## 反向模式

设置 `reverse` 属性可以反转滑块方向。

<div class="demo-container">
  <ExSlider v-model="value1" reverse />
</div>

```vue
<template>
  <ExSlider v-model="value" reverse />
</template>
```

## API

### Slider Props

| 属性                      | 说明             | 类型                                     | 默认值         |
| ------------------------- | ---------------- | ---------------------------------------- | -------------- |
| `model-value` / `v-model` | 绑定值           | `number \| [number, number]`             | `0`            |
| `min`                     | 最小值           | `number`                                 | `0`            |
| `max`                     | 最大值           | `number`                                 | `100`          |
| `step`                    | 步长             | `number`                                 | `1`            |
| `disabled`                | 是否禁用         | `boolean`                                | `false`        |
| `range`                   | 是否为范围选择   | `boolean`                                | `false`        |
| `show-input`              | 是否显示输入框   | `boolean`                                | `false`        |
| `show-stops`              | 是否显示步进点   | `boolean`                                | `false`        |
| `show-tooltip`            | 是否显示提示信息 | `boolean`                                | `true`         |
| `tooltip-placement`       | 提示信息显示位置 | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`        |
| `format-tooltip`          | 格式化提示信息   | `(value: number) => string`              | `undefined`    |
| `marks`                   | 标记             | `Record<number, string \| SliderMark>`   | `undefined`    |
| `size`                    | 尺寸             | `'small' \| 'medium' \| 'large'`         | `'medium'`     |
| `direction`               | 方向             | `'horizontal' \| 'vertical'`             | `'horizontal'` |
| `height`                  | 高度（垂直模式） | `string`                                 | `'200px'`      |
| `reverse`                 | 是否反向         | `boolean`                                | `false`        |
| `aria-label`              | 无障碍标签       | `string`                                 | `undefined`    |
| `aria-description`        | 无障碍描述       | `string`                                 | `undefined`    |

### Slider Events

| 事件名               | 说明                       | 类型                                          |
| -------------------- | -------------------------- | --------------------------------------------- |
| `update:model-value` | 值改变时触发               | `(value: number \| [number, number]) => void` |
| `change`             | 值改变时触发（拖动过程中） | `(value: number \| [number, number]) => void` |
| `input`              | 输入事件（拖动过程中）     | `(value: number \| [number, number]) => void` |

### Slider Methods

| 方法名       | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `getElement` | 获取滑块DOM元素 | `() => HTMLDivElement \| null` |
| `reset`      | 重置滑块        | `() => void`                   |

### SliderMark 类型

```typescript
interface SliderMark {
  value: number;
  label?: string;
  style?: Record<string, string>;
}
```

## 无障碍支持

- 支持键盘导航：
  - `←/↓` 减小值
  - `→/↑` 增大值
  - `Home` 跳到最小值
  - `End` 跳到最大值
  - `PageUp` 增大 10 步
  - `PageDown` 减小 10 步
- 完整的 ARIA 属性支持
- 支持屏幕阅读器

## 主题定制

滑块跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
