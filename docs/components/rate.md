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

::: raw

<div class="demo-container">
  <ExRate v-model="value1" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExRate v-model="value1" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
const value1 = ref(0);
</script>
```

:::

## 半星评分

设置 `allow-half` 属性可以允许半星评分。

::: raw

<div class="demo-container">
  <ExRate v-model="value2" allow-half />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExRate
      v-model="value2"
      allow-half
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value2 = ref(3.5);
</script>
```

:::

## 显示分数

设置 `show-score` 属性可以在右侧显示当前分数。

::: raw

<div class="demo-container">
  <ExRate v-model="value3" show-score />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExRate
      v-model="value3"
      show-score
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value3 = ref(4);
</script>
```

:::

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

::: raw

<div class="demo-container">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ExRate v-model="value6" size="small" show-score />
    <ExRate v-model="value6" size="medium" show-score />
    <ExRate v-model="value6" size="large" show-score />
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ExRate
        v-model="value6"
        size="small"
        show-score
      />
      <ExRate
        v-model="value6"
        size="medium"
        show-score
      />
      <ExRate
        v-model="value6"
        size="large"
        show-score
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value6 = ref(3);
</script>
```

:::

## 自定义图标

通过 `icon-void` 和 `icon-active` 插槽可以自定义图标。

::: raw

<div class="demo-container">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ExRate v-model="value8" show-score>
      <template #icon-void>
        <ex-icon color="#4a5568" src="https://api.iconify.design/ri/heart-line.svg" />
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

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ExRate
        v-model="value8"
        show-score
      >
        <template #icon-void>
          <ex-icon
            color="#4a5568"
            src="https://api.iconify.design/ri/heart-line.svg"
          />
        </template>
        <template #icon-active>
          <ex-icon
            color="#00f0ff"
            src="https://api.iconify.design/ri/heart-fill.svg"
          />
        </template>
      </ExRate>
      <ExRate
        v-model="value8"
        show-score
      >
        <template #icon-void>
          <ex-icon
            color="#4a5568"
            src="https://api.iconify.design/ri/thumb-up-line.svg"
          />
        </template>
        <template #icon-active>
          <ex-icon
            color="#00f0ff"
            src="https://api.iconify.design/ri/thumb-up-fill.svg"
          />
        </template>
      </ExRate>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value8 = ref(4);
</script>
```

:::

## API

### Props

显式传入 `modelValue` 后，点击、键盘和公开写方法只发出更新请求，父级回写才改变评分；未传入时由组件内部管理。

`iconClasses` 按星位索引替换选中图标，例如 `['first-star', 'second-star']` 分别用于前两颗星，空项回退内置图标。`voidIconClass` 和 `disabledVoidIconClass` 分别用于普通和禁用状态的空星；对应图标插槽优先于类名。`textColor` 设置分数或文字的颜色。

| 属性                 | 说明               | 类型                             | 默认值      |
| -------------------- | ------------------ | -------------------------------- | ----------- |
| modelValue / v-model | 绑定值             | `number`                         | `0`         |
| max                  | 最大分值           | `number`                         | `5`         |
| disabled             | 是否禁用           | `boolean`                        | `false`     |
| readonly             | 是否只读           | `boolean`                        | `false`     |
| allowHalf            | 是否允许半选       | `boolean`                        | `false`     |
| showScore            | 是否显示分数       | `boolean`                        | `false`     |
| showText             | 是否显示文字       | `boolean`                        | `false`     |
| scoreTemplate        | 分数模板           | `string`                         | `'{value}'` |
| size                 | 尺寸               | `'small' \| 'medium' \| 'large'` | `'medium'`  |
| color                | 图标颜色           | `string`                         | `'#00f0ff'` |
| voidColor            | 未选中图标颜色     | `string`                         | `'#4a5568'` |
| texts                | 显示文字数组       | `string[]`                       | `[]`        |
| id                   | 根元素 ID          | `string`                         | —           |
| ariaLabel            | 评分控件无障碍名称 | `string`                         | 内置文案    |
| ariaDescribedby      | 关联描述元素 ID    | `string`                         | —           |

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
