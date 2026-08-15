# NumberInput 数字输入框

通过鼠标或键盘输入数字的输入框组件。

<script setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref(10)
const value3 = ref(5)
const value4 = ref(50)
const value5 = ref(1.5)
const value6 = ref(100)
</script>

## 基础用法

基础的数字输入框用法。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value1" placeholder="请输入数字" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    当前值：{{ value1 }}
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value1"
      placeholder="请输入数字"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">当前值：{{ value1 }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 步长

通过 `step` 属性设置步长。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value2" :step="5" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    当前值：{{ value2 }}（步长：5）
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value2"
      :step="5"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      当前值：{{ value2 }}（步长：5）
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value2 = ref(10);
</script>
```

:::

## 最小值和最大值

通过 `min` 和 `max` 属性限制输入范围。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value3" :min="0" :max="10" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    当前值：{{ value3 }}（范围：0-10）
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value3"
      :min="0"
      :max="10"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      当前值：{{ value3 }}（范围：0-10）
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value3 = ref(5);
</script>
```

:::

## 精度

通过 `precision` 属性设置数值精度（小数位数）。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value5" :precision="2" :step="0.1" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    当前值：{{ value5 }}（精度：2位小数）
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value5"
      :precision="2"
      :step="0.1"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      当前值：{{ value5 }}（精度：2位小数）
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value5 = ref(1.5);
</script>
```

:::

## 不同尺寸

通过 `size` 属性设置不同的尺寸。

::: raw

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <ExNumberInput v-model="value1" size="small" placeholder="小尺寸" style="width: 200px;" />
  <ExNumberInput v-model="value1" size="medium" placeholder="中等尺寸" style="width: 200px;" />
  <ExNumberInput v-model="value1" size="large" placeholder="大尺寸" style="width: 200px;" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div
    class="demo-container"
    style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
  >
    <ExNumberInput
      v-model="value1"
      size="small"
      placeholder="小尺寸"
      style="width: 200px;"
    />
    <ExNumberInput
      v-model="value1"
      size="medium"
      placeholder="中等尺寸"
      style="width: 200px;"
    />
    <ExNumberInput
      v-model="value1"
      size="large"
      placeholder="大尺寸"
      style="width: 200px;"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 控制按钮位置

通过 `controls-position` 属性设置控制按钮的位置。

::: raw

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">右侧（默认）</div>
    <ExNumberInput v-model="value4" controls-position="right" style="width: 200px;" />
  </div>
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">两侧</div>
    <ExNumberInput v-model="value4" controls-position="both" style="width: 200px;" />
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div
    class="demo-container"
    style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
  >
    <div>
      <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">右侧（默认）</div>
      <ExNumberInput
        v-model="value4"
        controls-position="right"
        style="width: 200px;"
      />
    </div>
    <div>
      <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary);">两侧</div>
      <ExNumberInput
        v-model="value4"
        controls-position="both"
        style="width: 200px;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value4 = ref(50);
</script>
```

:::

## 无控制按钮

设置 `controls` 为 `false` 可以隐藏控制按钮。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value1" :controls="false" placeholder="无控制按钮" style="width: 200px;" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value1"
      :controls="false"
      placeholder="无控制按钮"
      style="width: 200px;"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 禁用状态

通过 `disabled` 属性禁用输入框。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value6" disabled style="width: 200px;" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value6"
      disabled
      style="width: 200px;"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value6 = ref(100);
</script>
```

:::

## 只读状态

通过 `readonly` 属性设置只读状态。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value6" readonly style="width: 200px;" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value6"
      readonly
      style="width: 200px;"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value6 = ref(100);
</script>
```

:::

## 严格步长

设置 `strict-step` 为 `true` 时，只能输入步长的倍数。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value2" :step="5" :strict-step="true" style="width: 200px;" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    当前值：{{ value2 }}（只能输入5的倍数）
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value2"
      :step="5"
      :strict-step="true"
      style="width: 200px;"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      当前值：{{ value2 }}（只能输入5的倍数）
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value2 = ref(10);
</script>
```

:::

## 键盘操作

支持丰富的键盘快捷键操作。

::: raw

<div class="demo-container">
  <ExNumberInput v-model="value1" placeholder="使用键盘快捷键调整" style="width: 250px;" />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    <div>• ↑/↓ 箭头键：增减数值</div>
    <div>• Shift + ↑/↓：大步长调整（10倍步长）</div>
    <div>• PageUp/PageDown：快速调整（10倍步长）</div>
    <div>• Home/End：跳转到最小/最大值</div>
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value1"
      placeholder="使用键盘快捷键调整"
      style="width: 250px;"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      <div>• ↑/↓ 箭头键：增减数值</div>
      <div>• Shift + ↑/↓：大步长调整（10倍步长）</div>
      <div>• PageUp/PageDown：快速调整（10倍步长）</div>
      <div>• Home/End：跳转到最小/最大值</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 自定义图标

通过插槽自定义控制按钮的图标。

::: raw

<div class="demo-container" style="display: flex; gap: 16px; align-items: flex-start;">
  <ExNumberInput v-model="value1" style="width: 200px;">
    <template #increase-icon>
      <span style="font-size: 18px;">➕</span>
    </template>
    <template #decrease-icon>
      <span style="font-size: 18px;">➖</span>
    </template>
  </ExNumberInput>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div
    class="demo-container"
    style="display: flex; gap: 16px; align-items: flex-start;"
  >
    <ExNumberInput
      v-model="value1"
      style="width: 200px;"
    >
      <template #increase-icon>
        <span style="font-size: 18px;">➕</span>
      </template>
      <template #decrease-icon>
        <span style="font-size: 18px;">➖</span>
      </template>
    </ExNumberInput>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 输入防抖

设置 `debounce-delay` 属性可以对输入事件进行防抖处理，适用于需要频繁触发计算的场景。

::: raw

<div class="demo-container">
  <ExNumberInput
    v-model="value1"
    :debounce-delay="500"
    @input="(val) => console.log('input:', val)"
    style="width: 200px;"
  />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    输入事件将延迟 500ms 触发
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value1"
      :debounce-delay="500"
      @input="val => console.log('input:', val)"
      style="width: 200px;"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      输入事件将延迟 500ms 触发
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## 事件监听

监听数值变化事件。

::: raw

<div class="demo-container">
  <ExNumberInput
    v-model="value1"
    @change="(val, oldVal) => console.log('change:', val, oldVal)"
    @increase="(val) => console.log('increase:', val)"
    @decrease="(val) => console.log('decrease:', val)"
    style="width: 200px;"
  />
  <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    打开控制台查看事件输出
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExNumberInput
      v-model="value1"
      @change="(val, oldVal) => console.log('change:', val, oldVal)"
      @increase="val => console.log('increase:', val)"
      @decrease="val => console.log('decrease:', val)"
      style="width: 200px;"
    />
    <div style="margin-top: 12px; color: var(--ex-color-text-secondary);">
      打开控制台查看事件输出
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(0);
</script>
```

:::

## API

### NumberInput Props

| 属性                      | 说明                 | 类型                             | 默认值      |
| ------------------------- | -------------------- | -------------------------------- | ----------- |
| `model-value` / `v-model` | 绑定值               | `number \| null`                 | `null`      |
| `min`                     | 最小值               | `number`                         | `-Infinity` |
| `max`                     | 最大值               | `number`                         | `Infinity`  |
| `step`                    | 步长                 | `number`                         | `1`         |
| `precision`               | 精度（小数位数）     | `number`                         | `undefined` |
| `size`                    | 尺寸                 | `'small' \| 'medium' \| 'large'` | `'medium'`  |
| `disabled`                | 是否禁用             | `boolean`                        | `false`     |
| `readonly`                | 是否只读             | `boolean`                        | `false`     |
| `placeholder`             | 占位符               | `string`                         | `''`        |
| `controls`                | 是否显示控制按钮     | `boolean`                        | `true`      |
| `controls-position`       | 控制按钮位置         | `'right' \| 'both'`              | `'right'`   |
| `strict-step`             | 是否严格步长         | `boolean`                        | `false`     |
| `name`                    | 输入框名称           | `string`                         | `undefined` |
| `aria-label`              | 无障碍标签           | `string`                         | `undefined` |
| `debounce-delay`          | 输入防抖延迟（毫秒） | `number`                         | `0`         |

### NumberInput Events

| 事件名               | 说明                         | 回调参数                                            |
| -------------------- | ---------------------------- | --------------------------------------------------- |
| `update:model-value` | 值变化时触发                 | `(value: number \| null)`                           |
| `change`             | 值变化时触发（在输入完成后） | `(value: number \| null, oldValue: number \| null)` |
| `input`              | 输入时触发（实时）           | `(value: number \| null)`                           |
| `focus`              | 聚焦时触发                   | `(event: FocusEvent)`                               |
| `blur`               | 失焦时触发                   | `(event: FocusEvent)`                               |
| `increase`           | 增加按钮点击时触发           | `(value: number \| null)`                           |
| `decrease`           | 减少按钮点击时触发           | `(value: number \| null)`                           |

### NumberInput Slots

| 插槽名          | 说明               |
| --------------- | ------------------ |
| `increase-icon` | 自定义增加按钮图标 |
| `decrease-icon` | 自定义减少按钮图标 |

### NumberInput Methods

| 方法名       | 说明              | 参数                           |
| ------------ | ----------------- | ------------------------------ |
| `focus`      | 聚焦输入框        | `()`                           |
| `blur`       | 失焦输入框        | `()`                           |
| `select`     | 选中输入框内容    | `()`                           |
| `increase`   | 增加值            | `()`                           |
| `decrease`   | 减少值            | `()`                           |
| `getElement` | 获取输入框DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 完整的键盘导航支持
  - 上下箭头键：增减数值
  - Shift + 箭头键：大步长调整
  - PageUp/PageDown：快速调整
  - Home/End：跳转到最小/最大值
- ARIA 属性支持（`role="spinbutton"`、`aria-valuemin`、`aria-valuemax`、`aria-valuenow`）
- 禁用按钮自动设置 `tabindex="-1"`
- 支持屏幕阅读器
- 支持高对比度模式
- 支持减少动画模式

## 移动端优化

- 自动检测移动设备，使用 `type="number"` 和 `inputmode="decimal"` 调起数字键盘
- 触摸区域符合移动端最小 44px 标准
- 响应式尺寸调整，移动端自动增大触摸区域

## 主题定制

可以通过 CSS 变量自定义数字输入框样式：

```css
:root {
  --ex-number-input-bg: var(--ex-color-bg-secondary);
  --ex-number-input-border-color: var(--ex-color-border-primary);
  --ex-number-input-border-focus-color: var(--ex-color-primary);
  --ex-number-input-text-color: var(--ex-color-text-primary);
  --ex-number-input-button-bg: transparent;
  --ex-number-input-button-hover-bg: var(--ex-color-primary-alpha-10);
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
