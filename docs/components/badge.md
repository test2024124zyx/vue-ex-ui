# Badge 徽章

用于显示计数、通知红点和状态提示。默认是非交互徽章，需要触发点击事件时请显式设置 `clickable`。

## 基础用法

简单的徽章展示，当 `count` 为 `0` 时，默认不显示，但是可以使用 `showZero` 修改为显示。

<script setup>
const handleClick = (event) => {
  console.log('Badge clicked:', event)
}

const handleDotClick = (event) => {
  console.log('Dot badge clicked:', event)
}
</script>

<div class="vp-raw demo-container">
  <ExBadge :count="5">
    <ExButton>消息</ExButton>
  </ExBadge>
  <ExBadge :count="0" showZero>
    <ExButton>通知</ExButton>
  </ExBadge>
  <ExBadge :count="99">
    <ExButton>评论</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge :count="5">
    <ExButton>消息</ExButton>
  </ExBadge>
  <ExBadge
    :count="0"
    showZero
  >
    <ExButton>通知</ExButton>
  </ExBadge>
  <ExBadge :count="99">
    <ExButton>评论</ExButton>
  </ExBadge>
</template>
```

## 独立使用

不包裹任何元素即是独立使用，可自定样式展现。

<div class="vp-raw demo-container">
  <ExBadge :count="25" />
  <ExBadge :count="4" type="primary" />
  <ExBadge :count="109" type="danger" />
  <ExBadge count="NEW" type="success" />
</div>

```vue
<template>
  <ExBadge :count="25" />
  <ExBadge
    :count="4"
    type="primary"
  />
  <ExBadge
    :count="109"
    type="danger"
  />
  <ExBadge
    count="NEW"
    type="success"
  />
</template>
```

## 封顶数字

超过 `overflowCount` 的会显示为 `${overflowCount}+`，默认的 `overflowCount` 为 `99`。

<div class="vp-raw demo-container">
  <ExBadge :count="99">
    <ExButton>99</ExButton>
  </ExBadge>
  <ExBadge :count="100">
    <ExButton>100</ExButton>
  </ExBadge>
  <ExBadge :count="99" :overflowCount="10">
    <ExButton>10+</ExButton>
  </ExBadge>
  <ExBadge :count="1000" :overflowCount="999">
    <ExButton>999+</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge :count="99">
    <ExButton>99</ExButton>
  </ExBadge>
  <ExBadge :count="100">
    <ExButton>100</ExButton>
  </ExBadge>
  <ExBadge
    :count="99"
    :overflowCount="10"
  >
    <ExButton>10+</ExButton>
  </ExBadge>
  <ExBadge
    :count="1000"
    :overflowCount="999"
  >
    <ExButton>999+</ExButton>
  </ExBadge>
</template>
```

## 小红点

没有具体的数字，只有一个小红点。

<div class="vp-raw demo-container">
  <ExBadge dot>
    <ExButton>消息</ExButton>
  </ExBadge>
  <ExBadge dot type="success">
    <ExButton>通知</ExButton>
  </ExBadge>
  <ExBadge dot type="warning">
    <ExButton>待办</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge dot>
    <ExButton>消息</ExButton>
  </ExBadge>
  <ExBadge
    dot
    type="success"
  >
    <ExButton>通知</ExButton>
  </ExBadge>
  <ExBadge
    dot
    type="warning"
  >
    <ExButton>待办</ExButton>
  </ExBadge>
</template>
```

## 状态点

用于表示状态的小圆点。

状态模式建议单独使用，不要同时传入默认插槽；如果同时传入插槽，组件会按普通计数徽章处理。

<div class="vp-raw demo-container">
  <ExBadge status="success" text="成功" />
  <ExBadge status="error" text="错误" />
  <ExBadge status="default" text="默认" />
  <ExBadge status="processing" text="进行中" />
  <ExBadge status="warning" text="警告" />
</div>

```vue
<template>
  <ExBadge
    status="success"
    text="成功"
  />
  <ExBadge
    status="error"
    text="错误"
  />
  <ExBadge
    status="default"
    text="默认"
  />
  <ExBadge
    status="processing"
    text="进行中"
  />
  <ExBadge
    status="warning"
    text="警告"
  />
</template>
```

## 不同类型

徽章支持多种类型，展现不同的主题风格。

<div class="vp-raw demo-container">
  <ExBadge :count="5" type="default">
    <ExButton>默认</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="primary">
    <ExButton>主要</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="secondary">
    <ExButton>次要</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="success">
    <ExButton>成功</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="warning">
    <ExButton>警告</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="danger">
    <ExButton>危险</ExButton>
  </ExBadge>
  <ExBadge :count="5" type="info">
    <ExButton>信息</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge
    :count="5"
    type="default"
  >
    <ExButton>默认</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="primary"
  >
    <ExButton>主要</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="secondary"
  >
    <ExButton>次要</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="success"
  >
    <ExButton>成功</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="warning"
  >
    <ExButton>警告</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="danger"
  >
    <ExButton>危险</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    type="info"
  >
    <ExButton>信息</ExButton>
  </ExBadge>
</template>
```

## 不同尺寸

徽章支持三种尺寸：`small`、`medium`（默认）、`large`。

<div class="vp-raw demo-container">
  <ExBadge :count="5" size="small">
    <ExButton size="small">小型</ExButton>
  </ExBadge>
  <ExBadge :count="5" size="medium">
    <ExButton>中型</ExButton>
  </ExBadge>
  <ExBadge :count="5" size="large">
    <ExButton size="large">大型</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge
    :count="5"
    size="small"
  >
    <ExButton size="small">小型</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    size="medium"
  >
    <ExButton>中型</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    size="large"
  >
    <ExButton size="large">大型</ExButton>
  </ExBadge>
</template>
```

## 不同位置

徽章可以显示在不同的位置。

<div class="vp-raw demo-container">
  <ExBadge :count="5" position="top-right">
    <ExButton>右上</ExButton>
  </ExBadge>
  <ExBadge :count="5" position="top-left">
    <ExButton>左上</ExButton>
  </ExBadge>
  <ExBadge :count="5" position="bottom-right">
    <ExButton>右下</ExButton>
  </ExBadge>
  <ExBadge :count="5" position="bottom-left">
    <ExButton>左下</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge
    :count="5"
    position="top-right"
  >
    <ExButton>右上</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    position="top-left"
  >
    <ExButton>左上</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    position="bottom-right"
  >
    <ExButton>右下</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    position="bottom-left"
  >
    <ExButton>左下</ExButton>
  </ExBadge>
</template>
```

## 自定义颜色

可以通过 `color` 自定义徽章的填充色，组件会同步更新边框颜色。

<div class="vp-raw demo-container">
  <ExBadge :count="5" color="#f50">
    <ExButton>自定义</ExButton>
  </ExBadge>
  <ExBadge :count="5" color="#2db7f5">
    <ExButton>蓝色</ExButton>
  </ExBadge>
  <ExBadge :count="5" color="#87d068">
    <ExButton>绿色</ExButton>
  </ExBadge>
  <ExBadge :count="5" color="#108ee9">
    <ExButton>青色</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge
    :count="5"
    color="#f50"
  >
    <ExButton>自定义</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    color="#2db7f5"
  >
    <ExButton>蓝色</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    color="#87d068"
  >
    <ExButton>绿色</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    color="#108ee9"
  >
    <ExButton>青色</ExButton>
  </ExBadge>
</template>
```

## 偏移量

设置徽章的偏移量，格式为 `[x, y]`。

<div class="vp-raw demo-container">
  <ExBadge :count="5" :offset="[10, 10]">
    <ExButton>偏移</ExButton>
  </ExBadge>
  <ExBadge :count="5" :offset="[-10, -10]">
    <ExButton>负偏移</ExButton>
  </ExBadge>
  <ExBadge dot :offset="[0, 0]">
    <ExButton>无偏移</ExButton>
  </ExBadge>
</div>

```vue
<template>
  <ExBadge
    :count="5"
    :offset="[10, 10]"
  >
    <ExButton>偏移</ExButton>
  </ExBadge>
  <ExBadge
    :count="5"
    :offset="[-10, -10]"
  >
    <ExButton>负偏移</ExButton>
  </ExBadge>
  <ExBadge
    dot
    :offset="[0, 0]"
  >
    <ExButton>无偏移</ExButton>
  </ExBadge>
</template>
```

## 与头像组合

徽章可以与头像组件组合使用。

<div class="vp-raw demo-container">
  <ExBadge :count="1">
    <ExAvatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
  </ExBadge>
  <ExBadge dot>
    <ExAvatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" />
  </ExBadge>
  <ExBadge :count="99">
    <ExAvatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" />
  </ExBadge>
</div>

```vue
<template>
  <ExBadge :count="1">
    <ExAvatar
      shape="square"
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=1"
    />
  </ExBadge>
  <ExBadge dot>
    <ExAvatar
      shape="square"
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=2"
    />
  </ExBadge>
  <ExBadge :count="99">
    <ExAvatar
      shape="square"
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    />
  </ExBadge>
</template>
```

## 点击事件

徽章支持点击事件。

<div class="vp-raw demo-container">
  <ExBadge :count="5" clickable @click="handleClick">
    <ExButton>可点击</ExButton>
  </ExBadge>
  <ExBadge dot clickable @click="handleDotClick">
    <ExButton>点击小红点</ExButton>
  </ExBadge>
</div>

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
  <ExBadge
    :count="5"
    clickable
    @click="handleClick"
  >
    <ExButton>可点击</ExButton>
  </ExBadge>
  <ExBadge
    dot
    clickable
    @click="handleDotClick"
  >
    <ExButton>点击小红点</ExButton>
  </ExBadge>
</template>
```

## 无障碍

默认徽章使用非交互元素，不会占用键盘焦点。设置 `clickable` 后会使用原生 `button` 语义，并支持键盘激活。

对于没有可见文本的红点或状态点，组件会提供默认的无障碍名称；业务场景需要更明确的描述时，可传入 `aria-label`。

## API

### Props

| 参数          | 说明                                                                     | 类型                                 | 可选值                                                            | 默认值    |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------- | --------- |
| count         | 展示的数字，大于 overflowCount 时显示为 `${overflowCount}+`，为 0 时隐藏 | number \| string                     | —                                                                 | —         |
| dot           | 不展示数字，只有一个小红点                                               | boolean                              | —                                                                 | false     |
| type          | 徽章类型                                                                 | string                               | default / primary / secondary / success / warning / danger / info | primary   |
| size          | 徽章尺寸                                                                 | string                               | small / medium / large                                            | medium    |
| status        | 设置 Badge 为状态点                                                      | string                               | success / processing / default / error / warning                  | —         |
| text          | 在设置了 status 的前提下有效，设置状态点的文本                           | string                               | —                                                                 | —         |
| overflowCount | 展示封顶的数字值                                                         | number                               | —                                                                 | 99        |
| showZero      | 当数值为 0 时，是否展示 Badge                                            | boolean                              | —                                                                 | false     |
| offset        | 设置状态点的位置偏移，格式为 [x, y]                                      | [number \| string, number \| string] | —                                                                 | —         |
| color         | 自定义小圆点的颜色                                                       | string                               | —                                                                 | —         |
| position      | 徽章位置                                                                 | string                               | top-right / top-left / bottom-right / bottom-left                 | top-right |
| title         | 设置鼠标放在状态点上时显示的文字                                         | string                               | —                                                                 | —         |
| badgeStyle    | 设置徽章的样式                                                           | string \| object                     | —                                                                 | —         |

### Events

| 事件名 | 说明           | 回调参数            |
| ------ | -------------- | ------------------- |
| click  | 点击徽章时触发 | (event: MouseEvent) |

### Methods

| 方法名     | 说明            | 参数 |
| ---------- | --------------- | ---- |
| getElement | 获取徽章DOM元素 | —    |

### Slots

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 自定义内容 |

## 主题定制

Badge 组件使用以下 CSS 变量，可以进行主题定制：

```css
:root {
  /* 徽章基础样式 */
  --ex-badge-z-index: 10;
  --ex-badge-font-weight: 500;
  --ex-badge-transition: all 0.2s ease;

  /* 徽章尺寸 - 中等 */
  --ex-badge-height: 20px;
  --ex-badge-min-width: 20px;
  --ex-badge-padding-x: 6px;
  --ex-badge-border-radius: 10px;
  --ex-badge-font-size: 12px;
  --ex-badge-border-width: 1px;

  /* 徽章尺寸 - 小型 */
  --ex-badge-sm-height: 16px;
  --ex-badge-sm-min-width: 16px;
  --ex-badge-sm-padding-x: 4px;
  --ex-badge-sm-border-radius: 8px;
  --ex-badge-sm-font-size: 10px;

  /* 徽章尺寸 - 大型 */
  --ex-badge-lg-height: 24px;
  --ex-badge-lg-min-width: 24px;
  --ex-badge-lg-padding-x: 8px;
  --ex-badge-lg-border-radius: 12px;
  --ex-badge-lg-font-size: 14px;

  /* 点状徽章尺寸 */
  --ex-badge-sm-dot-size: 6px;
  --ex-badge-md-dot-size: 8px;
  --ex-badge-lg-dot-size: 10px;
}
```

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.demo-container .ex-badge {
  margin: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .demo-container {
    gap: 12px;
  }
}
</style>
