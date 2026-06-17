# Tooltip 文字提示

简单的文字提示气泡框，鼠标悬停时显示。带有霓虹发光效果的赛博朋克主题提示组件。

<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

## 基础用法

最简单的用法，鼠标悬停时显示提示。

<div class="demo-container">
  <ExTooltip content="这是一条提示信息">
    <ExButton>悬停显示</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip content="这是一条提示信息">
    <ExButton>悬停显示</ExButton>
  </ExTooltip>
</template>
```

## 不同位置

通过 `placement` 属性可以设置提示的显示位置，支持 12 个方向。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div style="display: flex; justify-content: center; gap: 12px;">
    <ExTooltip content="Top Start" placement="top-start">
      <ExButton>上左</ExButton>
    </ExTooltip>
    <ExTooltip content="Top" placement="top">
      <ExButton>上边</ExButton>
    </ExTooltip>
    <ExTooltip content="Top End" placement="top-end">
      <ExButton>上右</ExButton>
    </ExTooltip>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExTooltip content="Left Start" placement="left-start">
        <ExButton>左上</ExButton>
      </ExTooltip>
      <ExTooltip content="Left" placement="left">
        <ExButton>左边</ExButton>
      </ExTooltip>
      <ExTooltip content="Left End" placement="left-end">
        <ExButton>左下</ExButton>
      </ExTooltip>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExTooltip content="Right Start" placement="right-start">
        <ExButton>右上</ExButton>
      </ExTooltip>
      <ExTooltip content="Right" placement="right">
        <ExButton>右边</ExButton>
      </ExTooltip>
      <ExTooltip content="Right End" placement="right-end">
        <ExButton>右下</ExButton>
      </ExTooltip>
    </div>
  </div>
  <div style="display: flex; justify-content: center; gap: 12px;">
    <ExTooltip content="Bottom Start" placement="bottom-start">
      <ExButton>下左</ExButton>
    </ExTooltip>
    <ExTooltip content="Bottom" placement="bottom">
      <ExButton>下边</ExButton>
    </ExTooltip>
    <ExTooltip content="Bottom End" placement="bottom-end">
      <ExButton>下右</ExButton>
    </ExTooltip>
  </div>
</div>

```vue
<template>
  <ExTooltip content="Top" placement="top">
    <ExButton>上边</ExButton>
  </ExTooltip>
  
  <ExTooltip content="Bottom" placement="bottom">
    <ExButton>下边</ExButton>
  </ExTooltip>
  
  <ExTooltip content="Left" placement="left">
    <ExButton>左边</ExButton>
  </ExTooltip>
  
  <ExTooltip content="Right" placement="right">
    <ExButton>右边</ExButton>
  </ExTooltip>
</template>
```

## 不同主题

通过 `effect` 属性可以设置不同的主题样式。

<div class="demo-container">
  <ExTooltip content="深色主题提示" effect="dark">
    <ExButton>深色主题</ExButton>
  </ExTooltip>
  <ExTooltip content="浅色主题提示" effect="light">
    <ExButton>浅色主题</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip content="深色主题提示" effect="dark">
    <ExButton>深色主题</ExButton>
  </ExTooltip>
  
  <ExTooltip content="浅色主题提示" effect="light">
    <ExButton>浅色主题</ExButton>
  </ExTooltip>
</template>
```

## 触发方式

通过 `trigger` 属性可以设置不同的触发方式。

<div class="demo-container">
  <ExTooltip content="鼠标悬停触发" trigger="hover">
    <ExButton>悬停触发</ExButton>
  </ExTooltip>
  <ExTooltip content="点击触发" trigger="click">
    <ExButton>点击触发</ExButton>
  </ExTooltip>
  <ExTooltip content="聚焦触发" trigger="focus">
    <ExButton>聚焦触发</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip content="鼠标悬停触发" trigger="hover">
    <ExButton>悬停触发</ExButton>
  </ExTooltip>
  
  <ExTooltip content="点击触发" trigger="click">
    <ExButton>点击触发</ExButton>
  </ExTooltip>
  
  <ExTooltip content="聚焦触发" trigger="focus">
    <ExButton>聚焦触发</ExButton>
  </ExTooltip>
</template>
```

## 延迟显示/隐藏

通过 `open-delay` 和 `close-delay` 属性可以设置延迟时间。

<div class="demo-container">
  <ExTooltip content="延迟 500ms 显示" :open-delay="500">
    <ExButton>延迟显示</ExButton>
  </ExTooltip>
  <ExTooltip content="延迟 500ms 隐藏" :close-delay="500">
    <ExButton>延迟隐藏</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip content="延迟 500ms 显示" :open-delay="500">
    <ExButton>延迟显示</ExButton>
  </ExTooltip>
  
  <ExTooltip content="延迟 500ms 隐藏" :close-delay="500">
    <ExButton>延迟隐藏</ExButton>
  </ExTooltip>
</template>
```

## 禁用状态

通过 `disabled` 属性可以禁用提示。

<div class="demo-container">
  <ExTooltip content="这是一条提示" :disabled="false">
    <ExButton>启用提示</ExButton>
  </ExTooltip>
  <ExTooltip content="这是一条提示" :disabled="true">
    <ExButton>禁用提示</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip content="这是一条提示" :disabled="false">
    <ExButton>启用提示</ExButton>
  </ExTooltip>
  
  <ExTooltip content="这是一条提示" :disabled="true">
    <ExButton>禁用提示</ExButton>
  </ExTooltip>
</template>
```

## 手动控制

通过 `v-model` 可以手动控制提示的显示和隐藏。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <div style="display: flex; gap: 12px;">
    <ExButton @click="visible = true">显示</ExButton>
    <ExButton @click="visible = false">隐藏</ExButton>
  </div>
  <ExTooltip content="手动控制的提示" v-model="visible">
    <ExButton>目标元素</ExButton>
  </ExTooltip>
</div>

```vue
<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <ExButton @click="visible = true">显示</ExButton>
  <ExButton @click="visible = false">隐藏</ExButton>
  
  <ExTooltip content="手动控制的提示" v-model="visible">
    <ExButton>目标元素</ExButton>
  </ExTooltip>
</template>
```

## 自定义内容

通过 `content` 插槽可以自定义提示内容。

<div class="demo-container">
  <ExTooltip>
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-weight: bold; color: var(--ex-color-primary);">自定义标题</div>
        <div>这是自定义的提示内容</div>
        <div style="font-size: 12px; color: var(--ex-color-text-tertiary);">可以包含任意 HTML</div>
      </div>
    </template>
    <ExButton>自定义内容</ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip>
    <template #content>
      <div>
        <div style="font-weight: bold;">自定义标题</div>
        <div>这是自定义的提示内容</div>
      </div>
    </template>
    <ExButton>自定义内容</ExButton>
  </ExTooltip>
</template>
```

## 赛博朋克主题示例

展示赛博朋克场景中的提示应用。

<div class="demo-container" style="display: flex; gap: 12px; flex-wrap: wrap;">
  <ExTooltip placement="top">
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-weight: bold; color: var(--ex-color-primary);">⚔️ 传说之剑</div>
        <div style="font-size: 12px;">攻击力: +150</div>
        <div style="font-size: 12px;">暴击率: +25%</div>
        <div style="font-size: 12px; color: var(--ex-color-warning);">稀有度: 传说</div>
      </div>
    </template>
    <ExButton type="primary">
      <template #prefix>
        <img src="https://api.iconify.design/ri/sword-line.svg" alt="武器" width="16" height="16" />
      </template>
      武器
    </ExButton>
  </ExTooltip>
  <ExTooltip placement="top">
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-weight: bold; color: var(--ex-color-success);">🛡️ 龙鳞护甲</div>
        <div style="font-size: 12px;">防御力: +200</div>
        <div style="font-size: 12px;">生命值: +500</div>
        <div style="font-size: 12px; color: var(--ex-color-success);">稀有度: 史诗</div>
      </div>
    </template>
    <ExButton type="success">
      <template #prefix>
        <img src="https://api.iconify.design/ri/shield-line.svg" alt="护甲" width="16" height="16" />
      </template>
      护甲
    </ExButton>
  </ExTooltip>
  <ExTooltip placement="top">
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-weight: bold; color: var(--ex-color-warning);">⚡ 闪电之靴</div>
        <div style="font-size: 12px;">移动速度: +30%</div>
        <div style="font-size: 12px;">闪避率: +15%</div>
        <div style="font-size: 12px; color: var(--ex-color-info);">稀有度: 稀有</div>
      </div>
    </template>
    <ExButton type="warning">
      <template #prefix>
        <img src="https://api.iconify.design/ri/footprint-line.svg" alt="鞋子" width="16" height="16" />
      </template>
      鞋子
    </ExButton>
  </ExTooltip>
  <ExTooltip placement="top">
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-weight: bold; color: var(--ex-color-danger);">💎 生命宝石</div>
        <div style="font-size: 12px;">生命恢复: +50/秒</div>
        <div style="font-size: 12px;">最大生命: +300</div>
        <div style="font-size: 12px; color: var(--ex-color-danger);">稀有度: 传说</div>
      </div>
    </template>
    <ExButton type="danger">
      <template #prefix>
        <img src="https://api.iconify.design/ri/heart-line.svg" alt="饰品" width="16" height="16" />
      </template>
      饰品
    </ExButton>
  </ExTooltip>
</div>

```vue
<template>
  <ExTooltip placement="top">
    <template #content>
      <div>
        <div style="font-weight: bold;">⚔️ 传说之剑</div>
        <div>攻击力: +150</div>
        <div>暴击率: +25%</div>
        <div>稀有度: 传说</div>
      </div>
    </template>
    <ExButton type="primary">武器</ExButton>
  </ExTooltip>
</template>
```

## API

### Tooltip Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `content` | 显示的内容 | `string` | — |
| `placement` | 出现位置 | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end' \| 'right' \| 'right-start' \| 'right-end'` | `'top'` |
| `trigger` | 触发方式 | `'hover' \| 'click' \| 'focus' \| 'hover-focus'` | `'hover'` |
| `effect` | 主题 | `'dark' \| 'light'` | `'dark'` |
| `show-arrow` | 是否显示箭头 | `boolean` | `true` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `offset` | 偏移量（像素） | `number` | `12` |
| `transition` | 过渡动画名称 | `string` | `'ex-tooltip-fade'` |
| `open-delay` | 延迟显示（毫秒） | `number` | `0` |
| `close-delay` | 延迟隐藏（毫秒） | `number` | `200` |
| `custom-class` | 自定义类名 | `string` | — |
| `z-index` | 层级 | `number` | `2000` |
| `v-model` | 手动控制显示 | `boolean` | — |
| `aria-label` | 无障碍标签 | `string` | — |

### Tooltip Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `show` | 显示时触发 | `() => void` |
| `hide` | 隐藏时触发 | `() => void` |

### Tooltip Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 触发元素 |
| `content` | 自定义提示内容 |

### Tooltip Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `show` | 显示提示 | `() => void` |
| `hide` | 隐藏提示 | `() => void` |
| `updatePosition` | 更新位置 | `() => void` |

## 无障碍支持

- 使用 `role="tooltip"` 标记提示内容
- 完整的 ARIA 属性支持
- 支持键盘导航（focus 触发）
- 支持屏幕阅读器

## 受控 / 非受控

默认由 `trigger`（hover / click / focus / hover-focus）非受控地控制显隐。也可用 `v-model` 手动控制：

```vue
<template>
  <ExTooltip v-model="show" content="手动控制的提示">
    <ExButton>目标元素</ExButton>
  </ExTooltip>
  <ExButton @click="show = !show">切换</ExButton>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>
```

## 常见问题

**Q：`trigger="focus"` 不生效？**
已修复。组件监听 `focusin/focusout`（会冒泡），聚焦插槽内的可聚焦元素（如 `<button>`、`<input>`）即可触发。请确保触发元素本身可获得焦点。

**Q：提示被遮挡或超出屏幕边缘？**
内置主轴翻转（flip）与视口夹取：当前方向空间不足时自动翻到对侧，并在边缘处收拢，无需手动处理。

**Q：移动端没有 hover 怎么办？**
触屏设备没有 hover，请改用 `trigger="click"`。

**Q：需要在提示里放按钮 / 表单？**
Tooltip 仅用于简短文字。承载可交互的复杂内容请用 [Popover](/components/popover)。

## 最佳实践

- **只放简短说明文字**；复杂或可交互内容用 Popover。
- **触发元素应可聚焦**（`<button>`、`<a>` 或加 `tabindex`），以同时支持鼠标、键盘与读屏。
- **触屏/移动端**改用 `click` 触发。
- 用 `open-delay` / `close-delay` 避免快速划过时提示闪烁。

## 主题定制

Tooltip 不定义独立的组件级变量，深浅样式由 `effect="dark" | "light"` 切换。定制方式：

- **单个实例**：用 `custom-class` 添加类名后覆盖 `.ex-tooltip__popper` 的背景与文字色。
- **全局**：覆盖其消费的全局令牌：

```css
:root {
  --ex-color-text-primary: #e6f1ff;   /* 文字色 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5); /* 投影 */
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
