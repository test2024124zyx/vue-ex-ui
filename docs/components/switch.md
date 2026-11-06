# Switch 开关

表示两种相互对立的状态间的切换，多用于触发「开/关」。

<script setup>
import { ref } from 'vue'

const value1 = ref(true)
const value2 = ref(false)
const value3 = ref(true)
const value4 = ref(false)
const value5 = ref('100')
const value6 = ref(1)
const value7 = ref(false)
</script>

## 基础用法

::: raw

<div class="demo-container">
  <ExSwitch v-model="value1" />
  <ExSwitch v-model="value2" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch v-model="value1" />
    <ExSwitch v-model="value2" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(true);
const value2 = ref(false);
</script>
```

:::

## 文字描述

使用 `active-text` 属性与 `inactive-text` 属性来设置开关的文字描述。

::: raw

<div class="demo-container">
  <ExSwitch v-model="value3" active-text="按月付费" inactive-text="按年付费" />
  <ExSwitch v-model="value4" active-text="开启" inactive-text="关闭" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch
      v-model="value3"
      active-text="按月付费"
      inactive-text="按年付费"
    />
    <ExSwitch
      v-model="value4"
      active-text="开启"
      inactive-text="关闭"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value3 = ref(true);
const value4 = ref(false);
</script>
```

:::

## 扩展的 value 类型

设置 `active-value` 和 `inactive-value` 属性，接受 `Boolean`, `String` 或 `Number` 类型的值。

::: raw

<div class="demo-container">
  <ExSwitch
    v-model="value5"
    active-value="100"
    inactive-value="0"
  />
  <ExSwitch
    v-model="value6"
    :active-value="1"
    :inactive-value="0"
  />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch
      v-model="value5"
      active-value="100"
      inactive-value="0"
    />
    <ExSwitch
      v-model="value6"
      :active-value="1"
      :inactive-value="0"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value5 = ref('100');
const value6 = ref(1);
</script>
```

:::

## 禁用状态

设置 `disabled` 属性，接受一个 `Boolean`，设置 `true` 即可禁用。

::: raw

<div class="demo-container">
  <ExSwitch v-model="value1" disabled />
  <ExSwitch v-model="value2" disabled />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch
      v-model="value1"
      disabled
    />
    <ExSwitch
      v-model="value2"
      disabled
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(true);
const value2 = ref(false);
</script>
```

:::

## 加载中

设置 `loading` 属性，接受一个 `Boolean`，设置 `true` 即可显示加载中状态。

::: raw

<div class="demo-container">
  <ExSwitch v-model="value7" loading />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch
      v-model="value7"
      loading
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value7 = ref(false);
</script>
```

:::

## 不同尺寸

::: raw

<div class="demo-container">
  <ExSwitch v-model="value1" size="large" />
  <ExSwitch v-model="value1" />
  <ExSwitch v-model="value1" size="small" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExSwitch
      v-model="value1"
      size="large"
    />
    <ExSwitch v-model="value1" />
    <ExSwitch
      v-model="value1"
      size="small"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const value1 = ref(true);
</script>
```

:::

## API

### Props

| 参数                  | 说明                     | 类型                              | 默认值      |
| --------------------- | ------------------------ | --------------------------------- | ----------- |
| model-value / v-model | 绑定值                   | `boolean \| string \| number`     | `false`     |
| disabled              | 是否禁用                 | `boolean`                         | `false`     |
| loading               | 是否显示加载中           | `boolean`                         | `false`     |
| size                  | switch 的大小            | `'large' \| 'default' \| 'small'` | `'default'` |
| width                 | switch 的宽度（像素）    | `number`                          | -           |
| active-text           | switch 打开时的文字描述  | `string`                          | -           |
| inactive-text         | switch 关闭时的文字描述  | `string`                          | -           |
| active-value          | switch 打开时的值        | `boolean \| string \| number`     | `true`      |
| inactive-value        | switch 关闭时的值        | `boolean \| string \| number`     | `false`     |
| name                  | switch 对应的 name 属性  | `string`                          | -           |
| validate-event        | 输入时是否触发表单的校验 | `boolean`                         | `true`      |

### Events

| 事件名             | 说明                            | 回调参数                                       |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| update:model-value | 值变化时触发（配合 `v-model`）  | `(value: boolean \| string \| number) => void` |
| change             | switch 状态发生变化时的回调函数 | `(value: boolean \| string \| number) => void` |
| focus              | 获得焦点时触发                  | `(event: FocusEvent) => void`                  |
| blur               | 失去焦点时触发                  | `(event: FocusEvent) => void`                  |
| keydown            | 键盘按下时触发                  | `(event: KeyboardEvent) => void`               |

### Slots

| 名称     | 说明               |
| -------- | ------------------ |
| active   | 自定义打开时的内容 |
| inactive | 自定义关闭时的内容 |

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
