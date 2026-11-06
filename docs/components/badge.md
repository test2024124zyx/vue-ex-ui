# Badge 徽章

用于显示计数、通知红点和状态提示。默认保持组件库的硬朗切角；需要圆角或圆形数字徽章时，使用 `shape` 显式切换。

## 基础用法

`count` 为 `0` 时默认隐藏，设置 `show-zero` 后可以显示零值徽章。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5">
    <ex-button>消息</ex-button>
  </ex-badge>
  <ex-badge :count="0" show-zero>
    <ex-button>通知</ex-button>
  </ex-badge>
  <ex-badge :count="99">
    <ex-button>评论</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5">
  <ex-button>消息</ex-button>
</ex-badge>
<ex-badge :count="0" show-zero>
  <ex-button>通知</ex-button>
</ex-badge>
<ex-badge :count="99">
  <ex-button>评论</ex-button>
</ex-badge>
```

:::

## 独立使用

不包裹插槽内容时，Badge 会作为独立的计数或文本徽章渲染。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="25" />
  <ex-badge :count="4" type="primary" />
  <ex-badge :count="109" type="danger" />
  <ex-badge count="NEW" type="success" />
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="25" />
<ex-badge :count="4" type="primary" />
<ex-badge :count="109" type="danger" />
<ex-badge count="NEW" type="success" />
```

:::

## 封顶数字

超过 `overflow-count` 的数字会显示为 `${overflowCount}+`，默认封顶值为 `99`。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="99">
    <ex-button>99</ex-button>
  </ex-badge>
  <ex-badge :count="100">
    <ex-button>100</ex-button>
  </ex-badge>
  <ex-badge :count="99" :overflow-count="10">
    <ex-button>10+</ex-button>
  </ex-badge>
  <ex-badge :count="1000" :overflow-count="999">
    <ex-button>999+</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="99">
  <ex-button>99</ex-button>
</ex-badge>
<ex-badge :count="100">
  <ex-button>100</ex-button>
</ex-badge>
<ex-badge :count="99" :overflow-count="10">
  <ex-button>10+</ex-button>
</ex-badge>
<ex-badge :count="1000" :overflow-count="999">
  <ex-button>999+</ex-button>
</ex-badge>
```

:::

## 小红点

设置 `dot` 后只显示一个圆点，不再渲染计数文本。圆点尺寸仍会随 `size` 改变。

::: raw

<div class="vp-raw demo-container">
  <ex-badge dot>
    <ex-button>消息</ex-button>
  </ex-badge>
  <ex-badge dot type="success">
    <ex-button>通知</ex-button>
  </ex-badge>
  <ex-badge dot type="warning">
    <ex-button>待办</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge dot>
  <ex-button>消息</ex-button>
</ex-badge>
<ex-badge dot type="success">
  <ex-button>通知</ex-button>
</ex-badge>
<ex-badge dot type="warning">
  <ex-button>待办</ex-button>
</ex-badge>
```

:::

## 状态点

`status` 用于表示成功、处理中、默认、错误和警告状态。状态徽章建议单独使用，不要同时传入默认插槽；如果同时传入插槽，组件会按普通计数徽章处理。

::: raw

<div class="vp-raw demo-container">
  <ex-badge status="success" text="成功" />
  <ex-badge status="error" text="错误" />
  <ex-badge status="default" text="默认" />
  <ex-badge status="processing" text="进行中" />
  <ex-badge status="warning" text="警告" />
</div>

:::

::: details 查看示例代码

```vue
<ex-badge status="success" text="成功" />
<ex-badge status="error" text="错误" />
<ex-badge status="default" text="默认" />
<ex-badge status="processing" text="进行中" />
<ex-badge status="warning" text="警告" />
```

:::

## 类型

`type` 提供组件库的语义色和霓虹色变体。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" type="default">
    <ex-button>默认</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="primary">
    <ex-button>主要</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="secondary">
    <ex-button>次要</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="success">
    <ex-button>成功</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="warning">
    <ex-button>警告</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="danger">
    <ex-button>危险</ex-button>
  </ex-badge>
  <ex-badge :count="5" type="info">
    <ex-button>信息</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" type="default">
  <ex-button>默认</ex-button>
</ex-badge>
<ex-badge :count="5" type="primary">
  <ex-button>主要</ex-button>
</ex-badge>
<ex-badge :count="5" type="secondary">
  <ex-button>次要</ex-button>
</ex-badge>
<ex-badge :count="5" type="success">
  <ex-button>成功</ex-button>
</ex-badge>
<ex-badge :count="5" type="warning">
  <ex-button>警告</ex-button>
</ex-badge>
<ex-badge :count="5" type="danger">
  <ex-button>危险</ex-button>
</ex-badge>
<ex-badge :count="5" type="info">
  <ex-button>信息</ex-button>
</ex-badge>
```

:::

## 尺寸

Badge 支持 `small`、`medium`（默认）和 `large` 三种尺寸。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" size="small">
    <ex-button size="small">小型</ex-button>
  </ex-badge>
  <ex-badge :count="5" size="medium">
    <ex-button>中型</ex-button>
  </ex-badge>
  <ex-badge :count="5" size="large">
    <ex-button size="large">大型</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" size="small">
  <ex-button size="small">小型</ex-button>
</ex-badge>
<ex-badge :count="5" size="medium">
  <ex-button>中型</ex-button>
</ex-badge>
<ex-badge :count="5" size="large">
  <ex-button size="large">大型</ex-button>
</ex-badge>
```

:::

## 形状

默认形状使用组件库的硬朗切角；`round` 使用胶囊形；`circle` 适合单个数字、字母或其他单个字形。`circle` 遇到多字符计数（例如 `99` 或 `99+`）时会自动退化为 `round`，保证文本不会被固定圆形尺寸裁切。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" shape="default" />
  <ex-badge :count="25" shape="round" />
  <ex-badge :count="5" shape="circle" />
  <ex-badge count="A" shape="circle" />
  <ex-badge :count="99" shape="circle" />
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" shape="default" />
<ex-badge :count="25" shape="round" />
<ex-badge :count="5" shape="circle" />
<ex-badge count="A" shape="circle" />
<ex-badge :count="99" shape="circle" />
```

:::

## 位置

带有默认插槽时，可以通过 `position` 设置徽章相对内容的角落位置。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" position="top-right">
    <ex-button>右上</ex-button>
  </ex-badge>
  <ex-badge :count="5" position="top-left">
    <ex-button>左上</ex-button>
  </ex-badge>
  <ex-badge :count="5" position="bottom-right">
    <ex-button>右下</ex-button>
  </ex-badge>
  <ex-badge :count="5" position="bottom-left">
    <ex-button>左下</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" position="top-right">
  <ex-button>右上</ex-button>
</ex-badge>
<ex-badge :count="5" position="top-left">
  <ex-button>左上</ex-button>
</ex-badge>
<ex-badge :count="5" position="bottom-right">
  <ex-button>右下</ex-button>
</ex-badge>
<ex-badge :count="5" position="bottom-left">
  <ex-button>左下</ex-button>
</ex-badge>
```

:::

## 自定义颜色

`color` 会同时覆盖徽章的填充色和边框色。自定义颜色时请确保背景与主题文字保持足够的对比度。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" color="#f50">
    <ex-button>自定义</ex-button>
  </ex-badge>
  <ex-badge :count="5" color="#2db7f5">
    <ex-button>蓝色</ex-button>
  </ex-badge>
  <ex-badge :count="5" color="#87d068">
    <ex-button>绿色</ex-button>
  </ex-badge>
  <ex-badge :count="5" color="#108ee9">
    <ex-button>青色</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" color="#f50">
  <ex-button>自定义</ex-button>
</ex-badge>
<ex-badge :count="5" color="#2db7f5">
  <ex-button>蓝色</ex-button>
</ex-badge>
<ex-badge :count="5" color="#87d068">
  <ex-button>绿色</ex-button>
</ex-badge>
<ex-badge :count="5" color="#108ee9">
  <ex-button>青色</ex-button>
</ex-badge>
```

:::

## 偏移量

`offset` 以 `[x, y]` 形式设置徽章相对插槽内容的偏移量，数字值按像素处理。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" :offset="[10, 10]">
    <ex-button>偏移</ex-button>
  </ex-badge>
  <ex-badge :count="5" :offset="[-10, -10]">
    <ex-button>负偏移</ex-button>
  </ex-badge>
  <ex-badge dot :offset="[0, 0]">
    <ex-button>无偏移</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="5" :offset="[10, 10]">
  <ex-button>偏移</ex-button>
</ex-badge>
<ex-badge :count="5" :offset="[-10, -10]">
  <ex-button>负偏移</ex-button>
</ex-badge>
<ex-badge dot :offset="[0, 0]">
  <ex-button>无偏移</ex-button>
</ex-badge>
```

:::

## 与头像组合

Badge 可以与 Avatar 组件组合使用。位置默认挂在内容右上角，也可以使用 `position` 调整。

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="1">
    <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
  </ex-badge>
  <ex-badge dot>
    <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" />
  </ex-badge>
  <ex-badge :count="99" shape="circle">
    <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" />
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<ex-badge :count="1">
  <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
</ex-badge>
<ex-badge dot>
  <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" />
</ex-badge>
<ex-badge :count="99" shape="circle">
  <ex-avatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" />
</ex-badge>
```

:::

## 点击事件

Badge 默认是静态展示。设置 `clickable` 后，徽章本体使用原生 `button` 语义，支持鼠标点击、键盘激活和可见焦点反馈。

<script setup>
const handleClick = event => {
  console.log('Badge clicked:', event)
}

const handleDotClick = event => {
  console.log('Dot badge clicked:', event)
}
</script>

::: raw

<div class="vp-raw demo-container">
  <ex-badge :count="5" clickable @click="handleClick">
    <ex-button>可点击</ex-button>
  </ex-badge>
  <ex-badge dot clickable @click="handleDotClick">
    <ex-button>点击小红点</ex-button>
  </ex-badge>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
const handleClick = event => {
  console.log('Badge clicked:', event);
};

const handleDotClick = event => {
  console.log('Dot badge clicked:', event);
};
</script>

<template>
  <ex-badge
    :count="5"
    clickable
    @click="handleClick"
  >
    <ex-button>可点击</ex-button>
  </ex-badge>
  <ex-badge
    dot
    clickable
    @click="handleDotClick"
  >
    <ex-button>点击小红点</ex-button>
  </ex-badge>
</template>
```

:::

## 无障碍

非交互徽章使用 `span`，不会占用键盘焦点；设置 `clickable` 后会使用原生 `button` 语义。没有可见文本的红点或状态点会提供默认的无障碍名称，也可以用 `aria-label` 覆盖。

::: raw

<div class="vp-raw demo-container">
  <ex-badge dot aria-label="有未读消息" />
  <ex-badge status="processing" aria-label="正在同步" />
  <ex-badge :count="5" clickable aria-label="打开消息列表" />
</div>

:::

::: details 查看示例代码

```vue
<ex-badge dot aria-label="有未读消息" />
<ex-badge status="processing" aria-label="正在同步" />
<ex-badge :count="5" clickable aria-label="打开消息列表" />
```

:::

## API

### Props

| 参数            | 说明                                                                | 类型                                         | 默认值      |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| `count`         | 展示的数字或文本，大于 `overflowCount` 时显示为 `${overflowCount}+` | `number \| string`                           | —           |
| `dot`           | 只显示圆点，不渲染计数文本                                          | `boolean`                                    | `false`     |
| `clickable`     | 使用原生 `button` 语义并启用键盘交互                                | `boolean`                                    | `false`     |
| `type`          | 徽章类型                                                            | `BadgeType`                                  | `primary`   |
| `size`          | 徽章尺寸                                                            | `BadgeSize`                                  | `medium`    |
| `shape`         | 数字/文本徽章形状；`circle` 仅在单字符内容下保持圆形                | `BadgeShape`                                 | `default`   |
| `status`        | 状态点类型                                                          | `BadgeStatus`                                | —           |
| `text`          | 状态点旁显示的文本                                                  | `string`                                     | —           |
| `overflowCount` | 数字显示的封顶值                                                    | `number`                                     | `99`        |
| `showZero`      | 是否显示数值为 `0` 的徽章                                           | `boolean`                                    | `false`     |
| `offset`        | 相对插槽内容的 `[x, y]` 偏移                                        | `[number \| string, number \| string]`       | —           |
| `color`         | 自定义填充色，并同步设置边框颜色                                    | `string`                                     | —           |
| `position`      | 插槽内容上的定位位置                                                | `BadgePosition`                              | `top-right` |
| `title`         | 徽章的原生 `title` 文本                                             | `string`                                     | —           |
| `ariaLabel`     | 徽章的无障碍名称，模板中也可以使用 `aria-label`                     | `string`                                     | —           |
| `badgeStyle`    | 应用到徽章本体的样式                                                | `string \| Record<string, string \| number>` | —           |

在 Vue 模板中，驼峰属性使用 kebab-case：`overflow-count`、`show-zero`、`aria-label` 和 `badge-style`。`shape` 只影响数字/文本模式；`dot` 和 `status` 分别固定为圆点和状态点样式。

### Events

| 事件名  | 说明                     | 回调参数              |
| ------- | ------------------------ | --------------------- |
| `click` | 点击或键盘激活徽章时触发 | `(event: MouseEvent)` |

### Methods

| 方法名       | 说明                   | 返回值                |
| ------------ | ---------------------- | --------------------- |
| `getElement` | 获取 Badge 根 DOM 元素 | `HTMLElement \| null` |

### Slots

| 插槽名    | 说明                                             |
| --------- | ------------------------------------------------ |
| `default` | 自定义内容；存在可渲染内容时，Badge 会相对它定位 |

## 主题定制

Badge 使用以下 CSS 变量，可以在主题中覆盖。`round` 形状复用全局 `--ex-radius-full`，`circle` 使用当前尺寸的宽高保持等比。

```css
:root {
  /* 徽章基础样式 */
  --ex-badge-z-index: 10;
  --ex-badge-font-weight: 500;
  --ex-badge-transition:
    background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease,
    transform 0.2s ease, box-shadow 0.2s ease;

  /* 徽章尺寸 - 中等 */
  --ex-badge-height: 18px;
  --ex-badge-min-width: 18px;
  --ex-badge-padding-x: 6px;
  --ex-badge-border-radius: 0;
  --ex-badge-font-size: 12px;
  --ex-badge-border-width: 2px;

  /* 徽章尺寸 - 小型 */
  --ex-badge-sm-height: 14px;
  --ex-badge-sm-min-width: 14px;
  --ex-badge-sm-padding-x: 4px;
  --ex-badge-sm-border-radius: 0;
  --ex-badge-sm-font-size: 12px;

  /* 徽章尺寸 - 大型 */
  --ex-badge-lg-height: 22px;
  --ex-badge-lg-min-width: 22px;
  --ex-badge-lg-padding-x: 8px;
  --ex-badge-lg-border-radius: 0;
  --ex-badge-lg-font-size: 14px;

  /* 点状徽章尺寸 */
  --ex-badge-dot-size: 10px;
  --ex-badge-sm-dot-size: 8px;
  --ex-badge-lg-dot-size: 12px;
  --ex-badge-status-dot-size: 6px;
  --ex-badge-status-dot-ring-width: 1px;
}
```
