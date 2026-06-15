# BackTop 回到顶部

页面滚动超过一定距离后显示的"回到顶部"按钮，支持滚动进度展示与拖拽定位。

## 基础用法

滚动超过 `visibilityHeight`（默认 400px）后显示。

<div class="demo-container">
  <p style="margin:0">👇 向下滚动本页面，右下角会出现"回到顶部"按钮（此处触发距离设为 200px 以便演示）。</p>
  <ExBackTop :visibility-height="200" />
</div>

```vue
<template>
  <ExBackTop />
</template>
```

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary, #e5e7eb);
  border-radius: 8px;
  background: var(--ex-color-bg-secondary, transparent);
  margin: 16px 0;
}
</style>

## 显示滚动进度

通过 `show-progress` 显示当前滚动进度，`progress-type` 支持环形（`circle`）与线形（`line`）。

```vue
<template>
  <ExBackTop show-progress progress-type="circle" show-percent />
</template>
```

## 自定义触发距离与目标容器

```vue
<template>
  <!-- 监听指定滚动容器，滚动超过 200px 显示 -->
  <ExBackTop :visibility-height="200" :target="() => containerRef" />
</template>
```

## 文字与图标

```vue
<template>
  <ExBackTop show-text text="顶部" />
</template>
```

## 可拖拽

```vue
<template>
  <!-- 允许用户拖动按钮位置，并记住位置 -->
  <ExBackTop draggable remember-position storage-key="my-backtop" />
</template>
```

## API

### Props

| 属性                | 说明                         | 类型                                                           | 默认值           |
| ------------------- | ---------------------------- | -------------------------------------------------------------- | ---------------- |
| `position`          | 显示位置                     | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` |
| `shape`             | 形状                         | `'circle' \| 'square' \| 'pill'`                               | `'circle'`       |
| `size`              | 尺寸                         | `'small' \| 'medium' \| 'large'`                               | `'medium'`       |
| `visibilityHeight`  | 触发显示的滚动距离（px）     | `number`                                                       | `400`            |
| `visibilityPercent` | 触发显示的滚动百分比         | `number`                                                       | -                |
| `target`            | 滚动监听的目标容器           | `() => HTMLElement \| Window`                                  | `window`         |
| `scrollBehavior`    | 滚动行为                     | `'smooth' \| 'auto'`                                           | `'smooth'`       |
| `scrollDuration`    | 滚动动画时长（ms）           | `number`                                                       | -                |
| `scrollTo`          | 点击后滚动到的位置           | `number`                                                       | `0`              |
| `showText` / `text` | 显示文字及内容               | `boolean` / `string`                                           | `false` / -      |
| `icon`              | 自定义图标                   | `VNode \| Component \| string`                                 | -                |
| `showProgress`      | 显示滚动进度                 | `boolean`                                                      | `false`          |
| `progressType`      | 进度样式                     | `'circle' \| 'line'`                                           | `'circle'`       |
| `showPercent`       | 显示百分比文字               | `boolean`                                                      | `false`          |
| `draggable`         | 是否可拖拽                   | `boolean`                                                      | `false`          |
| `rememberPosition`  | 记住拖拽位置（localStorage） | `boolean`                                                      | `false`          |
| `storageKey`        | 拖拽位置的存储键名           | `string`                                                       | -                |
| `throttleDelay`     | 滚动监听节流（ms）           | `number`                                                       | `16`             |
| `showOnMobile`      | 是否在移动端显示             | `boolean`                                                      | `true`           |
| `zIndex`            | 层级                         | `number`                                                       | -                |

### Events

| 事件                          | 说明                  | 回调参数              |
| ----------------------------- | --------------------- | --------------------- |
| `click`                       | 点击按钮              | `(event: MouseEvent)` |
| `scroll-start` / `scroll-end` | 回到顶部滚动开始/结束 | -                     |
