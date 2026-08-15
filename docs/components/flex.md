# Flex 弹性布局

`ExFlex` 管理 Flex 容器方向、换行、对齐和间距；`ExFlexItem` 管理子项伸缩、基准尺寸、对齐和顺序。

## 基础用法

::: raw

<div class="vp-raw demo-container">
  <ex-flex gap="md" justify="space-between" align="center">
    <div class="flex-block">A</div>
    <div class="flex-block">B</div>
    <div class="flex-block">C</div>
  </ex-flex>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-flex
      gap="md"
      justify="space-between"
      align="center"
    >
      <div class="flex-block">A</div>
      <div class="flex-block">B</div>
      <div class="flex-block">C</div>
    </ex-flex>
  </div>
</template>
```

:::

## 垂直与换行

`vertical` 是 `direction="column"` 的便捷写法；两者同时传入时，`vertical` 优先。`align-content` 只在 `wrap` 不是 `nowrap` 时写入。

::: raw

<div class="vp-raw demo-container">
  <ex-flex
    vertical
    gap="sm"
  >
    <div class="flex-block">第一行</div>
    <div class="flex-block">第二行</div>
  </ex-flex>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-flex
      vertical
      gap="sm"
    >
      <div class="flex-block">第一行</div>
      <div class="flex-block">第二行</div>
    </ex-flex>
  </div>
</template>
```

:::

::: raw

<div class="vp-raw demo-container">
  <ex-flex
    wrap="wrap"
    :row-gap="16"
    :column-gap="24"
    align-content="space-between"
  >
    <div class="flex-block flex-block--half">第一项</div>
    <div class="flex-block flex-block--half">第二项</div>
    <div class="flex-block flex-block--half">第三项</div>
    <div class="flex-block flex-block--half">第四项</div>
  </ex-flex>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-flex
      wrap="wrap"
      :row-gap="16"
      :column-gap="24"
      align-content="space-between"
    >
      <div class="flex-block flex-block--half">第一项</div>
      <div class="flex-block flex-block--half">第二项</div>
      <div class="flex-block flex-block--half">第三项</div>
      <div class="flex-block flex-block--half">第四项</div>
    </ex-flex>
  </div>
</template>
```

:::

## 子项伸缩

显式 `flex` 优先于 `grow`、`shrink` 和 `basis`。数字 `basis` 按像素处理；负数会收敛到 0。`grow`、`shrink` 和数字 `flex` 不接受负值。

::: raw

<div class="vp-raw demo-container">
  <ex-flex gap="sm">
    <ex-flex-item :flex="1"><div class="flex-block">平分</div></ex-flex-item>
    <ex-flex-item
      :grow="2"
      :shrink="0"
      basis="160px"
    ><div class="flex-block">双倍增长</div></ex-flex-item>
    <ex-flex-item
      align-self="center"
      :order="-1"
    ><div class="flex-block">优先显示</div></ex-flex-item>
  </ex-flex>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-flex gap="sm">
      <ex-flex-item :flex="1"><div class="flex-block">平分</div></ex-flex-item>
      <ex-flex-item
        :grow="2"
        :shrink="0"
        basis="160px"
      >
        <div class="flex-block">双倍增长</div>
      </ex-flex-item>
      <ex-flex-item
        align-self="center"
        :order="-1"
      >
        <div class="flex-block">优先显示</div>
      </ex-flex-item>
    </ex-flex>
  </div>
</template>
```

:::

## 间距

`gap`、`row-gap` 和 `column-gap` 接受非负数字、CSS 长度或预设值。

| 预设 | 值   |
| ---- | ---- |
| `xs` | 4px  |
| `sm` | 8px  |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |

::: raw

<div class="vp-raw demo-container">
  <ex-flex gap="calc(1rem + 2px)">
    <div class="flex-block">自定义 CSS 长度间距</div>
    <div class="flex-block">第二项</div>
  </ex-flex>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-flex gap="calc(1rem + 2px)">
      <div class="flex-block">自定义 CSS 长度间距</div>
      <div class="flex-block">第二项</div>
    </ex-flex>
  </div>
</template>
```

:::

## API

### Flex Props

| 属性            | 类型                                                                                            | 默认值         |
| --------------- | ----------------------------------------------------------------------------------------------- | -------------- |
| `direction`     | `'row' \| 'row-reverse' \| 'column' \| 'column-reverse'`                                        | `'row'`        |
| `wrap`          | `'nowrap' \| 'wrap' \| 'wrap-reverse'`                                                          | `'nowrap'`     |
| `justify`       | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'flex-start'` |
| `align`         | `'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| 'stretch'`                             | `'flex-start'` |
| `align-content` | `FlexAlignContent`                                                                              | `'stretch'`    |
| `gap`           | `number \| string`                                                                              | —              |
| `row-gap`       | `number \| string`                                                                              | —              |
| `column-gap`    | `number \| string`                                                                              | —              |
| `inline`        | `boolean`                                                                                       | `false`        |
| `vertical`      | `boolean`                                                                                       | `false`        |

### FlexItem Props

| 属性         | 类型               | 默认值   |
| ------------ | ------------------ | -------- |
| `grow`       | `number`           | `0`      |
| `shrink`     | `number`           | `1`      |
| `basis`      | `number \| string` | `'auto'` |
| `flex`       | `number \| string` | —        |
| `align-self` | `FlexAlignSelf`    | `'auto'` |
| `order`      | `number`           | `0`      |

两个组件都提供默认插槽，并把未声明的原生属性传递到根 `div`。

<style scoped>
.demo-container {
  margin: 16px 0;
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
}

.flex-block {
  padding: 12px 20px;
  color: var(--ex-color-text-primary);
  background: var(--ex-color-primary-alpha-20);
  border: 1px solid var(--ex-color-primary);
  border-radius: var(--ex-radius-sm);
}

.flex-block--half {
  flex: 0 0 calc(50% - 12px);
}
</style>
