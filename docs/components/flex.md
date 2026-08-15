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

```vue
<ExFlex vertical gap="sm">
  <div>第一行</div>
  <div>第二行</div>
</ExFlex>

<ExFlex wrap="wrap" :row-gap="16" :column-gap="24" align-content="space-between">
  <div v-for="item in items" :key="item.id">{{ item.label }}</div>
</ExFlex>
```

`vertical` 是 `direction="column"` 的便捷写法；两者同时传入时，`vertical` 优先。`align-content` 只在 `wrap` 不是 `nowrap` 时写入。

## 子项伸缩

```vue
<ExFlex gap="sm">
  <ExFlexItem :flex="1">平分</ExFlexItem>
  <ExFlexItem :grow="2" :shrink="0" basis="160px">双倍增长</ExFlexItem>
  <ExFlexItem align-self="center" :order="-1">优先显示</ExFlexItem>
</ExFlex>
```

显式 `flex` 优先于 `grow`、`shrink` 和 `basis`。数字 `basis` 按像素处理；负数会收敛到 0。`grow`、`shrink` 和数字 `flex` 不接受负值。

## 间距

`gap`、`row-gap` 和 `column-gap` 接受非负数字、CSS 长度或预设值。

| 预设 | 值   |
| ---- | ---- |
| `xs` | 4px  |
| `sm` | 8px  |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |

```vue
<ExFlex gap="calc(1rem + 2px)">...</ExFlex>
```

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
</style>
