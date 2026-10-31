# ColorPicker 颜色选择器

用于选择十六进制或 RGB 颜色，支持透明度、预设颜色和键盘操作。

<script setup>
import { ref } from 'vue'

const color = ref('#29abe2')
const alphaColor = ref('rgba(255, 45, 120, 0.6)')
const emptyColor = ref('')
const predefine = ['#29abe2', '#ff2d78', '#7c4dff', '#00d68f', '#ffaa00']
</script>

## 基础用法

::: raw

<div class="demo-container">
  <ExColorPicker v-model="color" />
  <span>{{ color }}</span>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const color = ref('#29abe2');
</script>

<template>
  <div class="demo-container">
    <ExColorPicker v-model="color" />
    <span>{{ color }}</span>
  </div>
</template>
```

:::

## 透明度

启用 `show-alpha` 后，十六进制格式固定输出 `#rrggbbaa`，RGB 格式固定输出 `rgba()`。

::: raw

<div class="demo-container">
  <ExColorPicker v-model="alphaColor" show-alpha format="rgb" />
  <span>{{ alphaColor }}</span>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const alphaColor = ref('rgba(255, 45, 120, 0.6)');
</script>

<template>
  <div class="demo-container">
    <ExColorPicker
      v-model="alphaColor"
      show-alpha
      format="rgb"
    />
    <span>{{ alphaColor }}</span>
  </div>
</template>
```

:::

## 预设颜色与清空

::: raw

<div class="demo-container">
  <ExColorPicker v-model="emptyColor" :predefine="predefine" clearable />
  <span>{{ emptyColor || '未选择' }}</span>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const emptyColor = ref('');
const predefine = ['#29abe2', '#ff2d78', '#7c4dff', '#00d68f', '#ffaa00'];
</script>

<template>
  <div class="demo-container">
    <ExColorPicker
      v-model="emptyColor"
      :predefine="predefine"
      clearable
    />
    <span>{{ emptyColor || '未选择' }}</span>
  </div>
</template>
```

:::

## 尺寸与禁用

::: raw

<div class="demo-container">
  <ExColorPicker v-model="color" size="small" />
  <ExColorPicker v-model="color" size="medium" />
  <ExColorPicker v-model="color" size="large" />
  <ExColorPicker v-model="color" disabled />
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const color = ref('#29abe2');
</script>

<template>
  <div class="demo-container">
    <ExColorPicker
      v-model="color"
      size="small"
    />
    <ExColorPicker
      v-model="color"
      size="medium"
    />
    <ExColorPicker
      v-model="color"
      size="large"
    />
    <ExColorPicker
      v-model="color"
      disabled
    />
  </div>
</template>
```

:::

## API

传入 `model-value` 时，触发器只显示父级已确认的颜色；调整面板会发出更新请求，父级拒绝或转换该请求后，关闭再打开面板会恢复已确认值。省略 `model-value` 时由组件保存颜色。

### Props

| 属性                      | 说明                          | 类型                             | 默认值       |
| ------------------------- | ----------------------------- | -------------------------------- | ------------ |
| `model-value` / `v-model` | 当前颜色，支持 hex、rgb、rgba | `string`                         | `''`         |
| `disabled`                | 是否禁用全部交互              | `boolean`                        | `false`      |
| `size`                    | 组件尺寸                      | `'small' \| 'medium' \| 'large'` | 跟随全局配置 |
| `show-alpha`              | 是否展示并输出透明度          | `boolean`                        | `false`      |
| `format`                  | 输出格式                      | `'hex' \| 'rgb'`                 | `'hex'`      |
| `predefine`               | 预设颜色列表                  | `readonly string[]`              | —            |
| `clearable`               | 是否显示清空按钮              | `boolean`                        | `true`       |
| `teleported`              | 面板是否传送到 `body`         | `boolean`                        | `true`       |
| `popper-class`            | 面板自定义类名                | `string`                         | —            |

### Events

| 事件名               | 说明                               | 类型                          |
| -------------------- | ---------------------------------- | ----------------------------- |
| `update:model-value` | 颜色实时变化                       | `(value: string) => void`     |
| `active-change`      | 用户正在调整颜色                   | `(value: string) => void`     |
| `change`             | 输入、选择、键盘调整或拖拽正式提交 | `(value: string) => void`     |
| `visible-change`     | 面板可见状态变化                   | `(visible: boolean) => void`  |
| `focus` / `blur`     | 触发器焦点事件                     | `(event: FocusEvent) => void` |
| `clear`              | 颜色被清空                         | `() => void`                  |

### Methods

| 方法名  | 说明           | 类型         |
| ------- | -------------- | ------------ |
| `focus` | 聚焦触发器     | `() => void` |
| `blur`  | 移除触发器焦点 | `() => void` |

### 键盘操作

| 按键              | 行为                           |
| ----------------- | ------------------------------ |
| `Enter` / `Space` | 打开或关闭面板                 |
| `ArrowDown`       | 打开面板                       |
| `Escape`          | 关闭面板并返回触发器           |
| `Arrow`           | 调整色相、透明度、饱和度或明度 |
| `Home` / `End`    | 移动到滑块边界                 |

<style scoped>
.demo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
