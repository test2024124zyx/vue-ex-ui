# BackTop 回到顶部

返回页面顶部的操作按钮。滚动超过一定距离后出现，点击平滑回到顶部。底层是原生 `<button>`，开箱即用支持键盘与屏幕阅读器。

<script setup>
// 用 id 解析各演示的滚动容器（onMounted 时元素已就绪）
const box1 = () => (typeof document !== 'undefined' ? document.getElementById('bt-box-1') : null)
const box2 = () => (typeof document !== 'undefined' ? document.getElementById('bt-box-2') : null)
const box3 = () => (typeof document !== 'undefined' ? document.getElementById('bt-box-3') : null)
const box4 = () => (typeof document !== 'undefined' ? document.getElementById('bt-box-4') : null)
</script>

## 基础用法

默认监听整个页面，滚动超过 `visibility-height`（默认 200px）后在右下角出现。下面在一个独立滚动容器内演示，按钮固定在视口角落。

<div class="demo-container">
  <div id="bt-box-1" class="bt-scroll">
    <div class="bt-filler">↓ 向下滚动这个区域，超过 120px 后视口右下角会出现「回到顶部」按钮</div>
  </div>
  <ExBackTop :target="box1" :visibility-height="120" />
</div>

```vue
<template>
  <!-- 监听整个页面：滚动超过 200px 后显示 -->
  <ExBackTop />

  <!-- 监听指定滚动容器 -->
  <ExBackTop :target="() => containerEl" :visibility-height="120" />
</template>
```

## 显示滚动进度

`show-progress` 显示滚动进度，`progress-type` 支持环形（`circle`）与线形（`line`），`show-percent` 额外显示百分比文字。

<div class="demo-container">
  <div id="bt-box-2" class="bt-scroll">
    <div class="bt-filler">↓ 滚动此区域，左下角出现带环形进度 + 百分比的按钮</div>
  </div>
  <ExBackTop
    :target="box2"
    :visibility-height="80"
    show-progress
    progress-type="circle"
    show-percent
    position="bottom-left"
  />
</div>

```vue
<template>
  <ExBackTop show-progress progress-type="circle" show-percent />
  <ExBackTop show-progress progress-type="line" />
</template>
```

## 文字按钮

设置 `text` 后按钮变为图标 + 文字的纵向布局。

<div class="demo-container">
  <div id="bt-box-3" class="bt-scroll">
    <div class="bt-filler">↓ 滚动此区域，右上角出现带「顶部」文字的按钮</div>
  </div>
  <ExBackTop :target="box3" :visibility-height="80" text="顶部" position="top-right" />
</div>

```vue
<template>
  <ExBackTop text="顶部" />
</template>
```

## 形状与尺寸

`shape` 支持 `circle` / `square` / `rounded`，`size` 支持 `small` / `medium` / `large`。

```vue
<template>
  <ExBackTop shape="circle" size="small" />
  <ExBackTop shape="rounded" size="medium" />
  <ExBackTop shape="square" size="large" />
</template>
```

## 自定义图标 / 内容

通过 `icon` 传入内置图标名（推荐）、组件或 VNode；也可以用默认插槽完全自定义内容。

<div class="demo-container">
  <div id="bt-box-4" class="bt-scroll">
    <div class="bt-filler">↓ 滚动此区域，右下角出现使用自定义图标的按钮</div>
  </div>
  <ExBackTop :target="box4" :visibility-height="80" icon="arrow-up-s-line" />
</div>

```vue
<template>
  <!-- 内置图标名 -->
  <ExBackTop icon="arrow-up-s-line" />

  <!-- 完全自定义内容 -->
  <ExBackTop #default="{ percent }">
    <span>{{ Math.round(percent) }}%</span>
  </ExBackTop>
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `position` | 显示位置 | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' \| 'bottom-center' \| 'top-center'` | `'bottom-right'` |
| `shape` | 形状 | `'circle' \| 'square' \| 'rounded'` | `'circle'` |
| `size` | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `visibility-height` | 滚动超过该距离（px）后显示 | `number` | `200` |
| `visibility-percent` | 滚动超过该百分比（0-100）后显示，设置后优先于 `visibility-height` | `number` | - |
| `target` | 滚动监听目标，默认监听 `window` | `HTMLElement \| Window \| string \| (() => HTMLElement \| Window \| string)` | `window` |
| `scroll-behavior` | 点击后的滚动行为 | `'smooth' \| 'auto' \| 'instant'` | `'smooth'` |
| `scroll-duration` | 平滑滚动时长（ms），`scroll-behavior='smooth'` 时生效 | `number` | `400` |
| `scroll-to` | 点击后滚动到的位置（px） | `number` | `0` |
| `offset` | 位置偏移（默认四周 24px） | `{ top?, right?, bottom?, left?: number \| string }` | - |
| `animation` | 出现/消失动画 | `'fade' \| 'slide' \| 'zoom' \| 'none'` | `'fade'` |
| `text` | 按钮文字 | `string` | - |
| `icon` | 自定义图标（内置图标名 / 组件 / VNode / 字体类名） | `string \| Component \| VNode` | `'arrow-up-line'` |
| `show-progress` | 是否显示滚动进度 | `boolean` | `false` |
| `progress-type` | 进度类型 | `'circle' \| 'line'` | `'circle'` |
| `show-percent` | 是否显示百分比文字 | `boolean` | `false` |
| `z-index` | 层级 | `number` | `var(--ex-z-sticky)` |
| `show-on-mobile` | 是否在移动端显示 | `boolean` | `true` |
| `mobile-breakpoint` | 移动端断点（px） | `number` | `768` |
| `aria-label` | 无障碍标签 | `string` | `text` 或 `'Back to top'` |
| `class` / `style` | 自定义类名 / 样式 | `string \| string[] \| object` / `CSSProperties \| string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `click` | 点击按钮时触发 | `(event: MouseEvent)` |
| `scroll-start` | 回到顶部滚动开始 | - |
| `scroll-end` | 回到顶部滚动结束 | - |
| `visibility-change` | 显示状态变化 | `(visible: boolean)` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 完全自定义按钮内容 | `{ percent: number }` |
| `icon` | 自定义图标 | - |

### 方法（通过 ref 调用）

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `scrollToTop` | 滚动到目标位置 | `() => Promise<void>` |
| `show` / `hide` | 强制显示 / 隐藏 | `() => void` |
| `getElement` | 获取按钮 DOM | `() => HTMLElement \| null` |

## 无障碍

- 使用原生 `<button>`：默认可聚焦，`Enter` / `Space` 即可触发，无需额外配置。
- 提供 `aria-label`（默认取 `text` 或 `'Back to top'`）。
- 进度图形标记 `aria-hidden`，不干扰屏幕阅读器。
- 遵循 `prefers-reduced-motion`：用户偏好减少动画时关闭过渡。

## 从旧版本迁移

为提升质量与可维护性，本组件做了精简。**已移除**以下非标准能力：`draggable` / `drag-bounds` / `remember-position` / `storage-key`（拖拽与位置记忆）、内置性能监控、`theme` 主题对象、`enabled`、`show-text`、`throttle-delay`、`bounce` 动画，以及 `onClick`/`onScrollStart` 等 prop 形式回调（请改用事件）。

迁移要点：
- `show-text` + `text` → 直接用 `text`（设置即显示）。
- `:enabled="false"` → 用 `v-if` 控制是否渲染。
- `@click` 等请用事件监听（`onClick` prop 已移除）。
- 主题定制改用全局 CSS 令牌（见下）。

## 主题

组件跟随全局主题令牌，可覆盖以下变量微调：

```css
:root {
  --ex-color-bg-secondary: #0f1720;   /* 按钮背景 */
  --ex-color-border-primary: #243447;  /* 按钮边框 */
  --ex-color-primary: #29abe2;         /* 悬停 / 进度色 */
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
.bt-scroll {
  width: 100%;
  height: 260px;
  overflow-y: auto;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
}
.bt-filler {
  height: 1000px;
  padding: 16px;
  background: linear-gradient(180deg, var(--ex-color-bg-tertiary), var(--ex-color-bg-secondary));
  color: var(--ex-color-text-secondary);
}
</style>
