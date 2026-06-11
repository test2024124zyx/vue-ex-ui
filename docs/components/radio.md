# Radio 单选框

在一组选项中进行单选。

<script setup>
import { ref } from 'vue'

const selected = ref('1')
const selected2 = ref('apple')
const selected3 = ref('medium')
const selected4 = ref('default')
const selected5 = ref('option1')
const selected6 = ref('')
const selected7 = ref('option1')
</script>

## 基础用法

单选框不能单独使用，必须配合 RadioGroup 或者多个 Radio 组成一组。

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio v-model="selected" value="1">选项 1</ExRadio>
    <ExRadio v-model="selected" value="2">选项 2</ExRadio>
    <ExRadio v-model="selected" value="3">选项 3</ExRadio>
  </div>
  <p style="margin-top: 12px; color: var(--ex-color-text-secondary);">选中的值：{{ selected }}</p>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio v-model="selected" value="1">选项 1</ExRadio>
    <ExRadio v-model="selected" value="2">选项 2</ExRadio>
    <ExRadio v-model="selected" value="3">选项 3</ExRadio>
  </div>
  <p>选中的值：{{ selected }}</p>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('1')
</script>
```

## 禁用状态

通过 `disabled` 属性禁用单选框。

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio :model-value="false" disabled>未选中禁用</ExRadio>
    <ExRadio :model-value="true" disabled>选中禁用</ExRadio>
  </div>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio :model-value="false" disabled>未选中禁用</ExRadio>
    <ExRadio :model-value="true" disabled>选中禁用</ExRadio>
  </div>
</template>
```

## 尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-block">
  <div style="display: flex; gap: 24px; align-items: center;">
    <ExRadio v-model="selected3" value="small" size="small">小尺寸</ExRadio>
    <ExRadio v-model="selected3" value="medium" size="medium">中尺寸</ExRadio>
    <ExRadio v-model="selected3" value="large" size="large">大尺寸</ExRadio>
  </div>
</div>

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <ExRadio v-model="selected" value="small" size="small">小尺寸</ExRadio>
    <ExRadio v-model="selected" value="medium" size="medium">中尺寸</ExRadio>
    <ExRadio v-model="selected" value="large" size="large">大尺寸</ExRadio>
  </div>
</template>
```

## 状态

支持 `success`、`warning`、`error` 状态。

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio v-model="selected4" value="default" status="default">默认状态</ExRadio>
    <ExRadio v-model="selected4" value="success" status="success">成功状态</ExRadio>
    <ExRadio v-model="selected4" value="warning" status="warning">警告状态</ExRadio>
    <ExRadio v-model="selected4" value="error" status="error">错误状态</ExRadio>
  </div>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExRadio v-model="selected" value="default" status="default">默认状态</ExRadio>
    <ExRadio v-model="selected" value="success" status="success">成功状态</ExRadio>
    <ExRadio v-model="selected" value="warning" status="warning">警告状态</ExRadio>
    <ExRadio v-model="selected" value="error" status="error">错误状态</ExRadio>
  </div>
</template>
```

## RadioGroup 组件

使用 `ExRadioGroup` 组件管理多个单选框。

<div class="demo-block">
  <ExRadioGroup v-model="selected2" label="选择你喜欢的水果">
    <ExRadio value="apple">苹果</ExRadio>
    <ExRadio value="banana">香蕉</ExRadio>
    <ExRadio value="orange">橙子</ExRadio>
    <ExRadio value="grape">葡萄</ExRadio>
  </ExRadioGroup>
  <p style="margin-top: 12px; color: var(--ex-color-text-secondary);">选中的值：{{ selected2 }}</p>
</div>

```vue
<template>
  <ExRadioGroup v-model="selected" label="选择你喜欢的水果">
    <ExRadio value="apple">苹果</ExRadio>
    <ExRadio value="banana">香蕉</ExRadio>
    <ExRadio value="orange">橙子</ExRadio>
    <ExRadio value="grape">葡萄</ExRadio>
  </ExRadioGroup>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('apple')
</script>
```

## 垂直布局

通过 `vertical` 属性设置垂直布局。

<div class="demo-block">
  <ExRadioGroup v-model="selected5" vertical label="垂直布局">
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</div>

```vue
<template>
  <ExRadioGroup v-model="selected" vertical label="垂直布局">
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</template>
```

## 禁用整组

通过 RadioGroup 的 `disabled` 属性禁用整组单选框。

<div class="demo-block">
  <ExRadioGroup v-model="selected6" disabled label="禁用整组">
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</div>

```vue
<template>
  <ExRadioGroup v-model="selected" disabled label="禁用整组">
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</template>
```

## 表单验证

通过 `rules` 属性添加验证规则。

<div class="demo-block">
  <ExRadioGroup
    v-model="selected7"
    :rules="[
      (value) => !!value || '请选择一个选项',
    ]"
    required
    label="必选项"
  >
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</div>

```vue
<template>
  <ExRadioGroup
    v-model="selected"
    :rules="[
      (value) => !!value || '请选择一个选项',
    ]"
    required
    label="必选项"
  >
    <ExRadio value="option1">选项 1</ExRadio>
    <ExRadio value="option2">选项 2</ExRadio>
    <ExRadio value="option3">选项 3</ExRadio>
  </ExRadioGroup>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('')
</script>
```

## API

### ExRadio Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | `string \| number \| boolean` | - |
| value | 单选框的值 | `string \| number \| boolean` | - |
| name | 单选框名称 | `string` | - |
| label | 单选框标签 | `string` | - |
| size | 组件大小 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 组件状态 | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| helpText | 帮助文本 | `string` | - |
| errorMessage | 错误信息 | `string` | - |
| rules | 表单验证规则 | `Array<(value) => boolean \| string>` | - |
| customClass | 自定义类名 | `string` | - |
| customStyle | 自定义样式 | `Record<string, string>` | - |

### ExRadio Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number \| boolean) => void` |
| change | 值变化时触发 | `(value: string \| number \| boolean, event: Event) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |

### ExRadio Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
| help | 帮助文本插槽 |
| error | 错误信息插槽 |

### ExRadio Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使单选框获得焦点 | - |
| blur | 使单选框失去焦点 | - |
| getRadioElement | 获取单选框元素 | - |

### ExRadioGroup Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | `string \| number \| boolean` | - |
| name | 表单域 name 属性 | `string` | - |
| size | 组件大小 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 组件状态 | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| vertical | 是否垂直排列 | `boolean` | `false` |
| label | 标签文本 | `string` | - |
| required | 是否必填 | `boolean` | `false` |
| helpText | 帮助文本 | `string` | - |
| errorMessage | 错误信息 | `string` | - |
| rules | 表单验证规则 | `Array<(value) => boolean \| string>` | - |
| customClass | 自定义类名 | `string` | - |
| customStyle | 自定义样式 | `Record<string, string>` | - |

### ExRadioGroup Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number \| boolean) => void` |
| change | 值变化时触发 | `(value: string \| number \| boolean) => void` |

### ExRadioGroup Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| getValue | 获取当前选中的值 | - |
| setValue | 设置选中的值 | `(value: string \| number \| boolean) => void` |
| getRadioGroupElement | 获取单选框组元素 | - |

<style scoped>
.demo-block {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
  margin: 16px 0;
}
</style>
