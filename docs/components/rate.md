# Rate 评分

用于评分场景，支持整星和半星评分。采用 **赛博朋克风格**设计，霓虹蓝粉双色交互。

<script setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref(3.5)
const value3 = ref(4)
const value4 = ref(0)
const value5 = ref(0)
const value6 = ref(3)
const value7 = ref(0)
const value8 = ref(4)
</script>

## 基础用法

最简单的用法。

<div class="demo-container">
  <ExRate v-model="value1" />
</div>

```vue
<template>
  <ExRate v-model="value" />
</template>

<script setup>
import { ref } from 'vue';
const value = ref(0);
</script>
```

## 半星评分

设置 `allow-half` 属性可以允许半星评分。

<div class="demo-container">
  <ExRate v-model="value2" allow-half />
</div>

```vue
<template>
  <ExRate v-model="value" allow-half />
</template>
```

## 显示分数

设置 `show-score` 属性可以在右侧显示当前分数。

<div class="demo-container">
  <ExRate v-model="value3" show-score />
</div>

```vue
<template>
  <ExRate v-model="value" show-score />
</template>
```

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ExRate v-model="value6" size="small" show-score />
    <ExRate v-model="value6" size="medium" show-score />
    <ExRate v-model="value6" size="large" show-score />
  </div>
</div>

```vue
<template>
  <ExRate v-model="value" size="small" show-score />
  <ExRate v-model="value" size="medium" show-score />
  <ExRate v-model="value" size="large" show-score />
</template>
```

## 自定义图标

通过 `icon-void` 和 `icon-active` 插槽可以自定义图标。

<div class="demo-container">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ExRate v-model="value8" show-score>
      <template #icon-void>
        <ex-icon color="#4a5568"  src="https://api.iconify.design/ri/heart-line.svg" />
      </template>
      <template #icon-active>
        <ex-icon color="#00f0ff" src="https://api.iconify.design/ri/heart-fill.svg" />
      </template>
    </ExRate>
    <ExRate v-model="value8" show-score>
      <template #icon-void>
        <ex-icon color="#4a5568" src="https://api.iconify.design/ri/thumb-up-line.svg" />
      </template>
      <template #icon-active>
        <ex-icon color="#00f0ff" src="https://api.iconify.design/ri/thumb-up-fill.svg" />
      </template>
    </ExRate>
  </div>
</div>

```vue
<template>
  <ExRate v-model="value" show-score>
    <template #icon-void>
      <ex-icon color="#4a5568" src="https://api.iconify.design/ri/heart-line.svg" />
    </template>
    <template #icon-active>
      <ex-icon color="#00f0ff" src="https://api.iconify.design/ri/heart-fill.svg" />
    </template>
  </ExRate>
</template>
```

## API

### Props

| 属性                 | 说明           | 类型                             | 默认值      |
| -------------------- | -------------- | -------------------------------- | ----------- |
| modelValue / v-model | 绑定值         | `number`                         | `0`         |
| max                  | 最大分值       | `number`                         | `5`         |
| disabled             | 是否禁用       | `boolean`                        | `false`     |
| readonly             | 是否只读       | `boolean`                        | `false`     |
| allowHalf            | 是否允许半选   | `boolean`                        | `false`     |
| showScore            | 是否显示分数   | `boolean`                        | `false`     |
| showText             | 是否显示文字   | `boolean`                        | `false`     |
| scoreTemplate        | 分数模板       | `string`                         | `'{value}'` |
| size                 | 尺寸           | `'small' \| 'medium' \| 'large'` | `'medium'`  |
| color                | 图标颜色       | `string`                         | `'#00f0ff'` |
| voidColor            | 未选中图标颜色 | `string`                         | `'#4a5568'` |
| texts                | 显示文字数组   | `string[]`                       | `[]`        |

### Events

| 事件名            | 说明         | 回调参数                  |
| ----------------- | ------------ | ------------------------- |
| update:modelValue | 值改变时触发 | `(value: number) => void` |
| change            | 值改变时触发 | `(value: number) => void` |

### Slots

| 插槽名      | 说明       | 参数                               |
| ----------- | ---------- | ---------------------------------- |
| icon-void   | 未选中图标 | `{ index: number, color: string }` |
| icon-active | 选中图标   | `{ index: number, color: string }` |

### Methods

| 方法名            | 说明       | 参数                      |
| ----------------- | ---------- | ------------------------- |
| setCurrentValue   | 设置当前值 | `(value: number) => void` |
| resetCurrentValue | 重置评分   | `() => void`              |
