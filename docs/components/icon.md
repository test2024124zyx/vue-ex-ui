# Icon 图标

支持内置 SVG、图片地址、字体图标和自定义插槽。

<script setup>
import { ref } from 'vue'

const iconClicks = ref(0)
const maskIcon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="M12 2 15 9l7 .8-5.2 4.8 1.5 7.1L12 17l-6.3 3.7 1.5-7.1L2 9.8 9 9z"/></svg>'
)}`
</script>

## 内置图标

::: raw
<div class="vp-raw demo-container icon-grid">
  <span class="icon-item"><ex-icon icon="search-line" :size="24" /><span>搜索</span></span>
  <span class="icon-item"><ex-icon icon="user-line" :size="24" /><span>用户</span></span>
  <span class="icon-item"><ex-icon icon="calendar-line" :size="24" /><span>日历</span></span>
  <span class="icon-item"><ex-icon icon="folder-line" :size="24" /><span>文件夹</span></span>
  <span class="icon-item"><ex-icon icon="dashboard-line" :size="24" /><span>工作台</span></span>
  <span class="icon-item"><ex-icon icon="notification-line" :size="24" /><span>通知</span></span>
</div>
:::

```vue
<ex-icon icon="search-line" :size="24" />
<ex-icon icon="user-line" :size="24" />
<ex-icon icon="calendar-line" :size="24" />
```

## 尺寸、颜色与旋转

::: raw
<div class="vp-raw demo-container icon-row">
  <ex-icon icon="star-fill" :size="16" color="#f59e0b" />
  <ex-icon icon="star-fill" :size="24" color="#8b5cf6" />
  <ex-icon icon="arrow-right-line" :size="28" :rotate="90" color="var(--ex-color-primary)" />
  <ex-icon icon="loader-4-line" :size="28" spin color="var(--ex-color-success)" />
</div>
:::

## 图片蒙版与自定义 SVG

为图片地址同时设置 `color` 时，图片按单色蒙版渲染。

::: raw
<div class="vp-raw demo-container icon-row">
  <ex-icon :src="maskIcon" color="#06b6d4" :size="30" alt="青色星标" />
  <ex-icon :size="30" color="#ec4899" aria-label="自定义菱形">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2 22 12 12 22 2 12z" />
    </svg>
  </ex-icon>
</div>
:::

```vue
<ex-icon src="/icons/star.svg" color="#06b6d4" :size="30" alt="青色星标" />
<ex-icon :size="30" color="#ec4899" aria-label="自定义菱形">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2 22 12 12 22 2 12z" />
  </svg>
</ex-icon>
```

## 交互图标

`clickable` 使用原生按钮语义；禁用状态不会触发点击事件。

::: raw
<div class="vp-raw demo-container icon-row">
  <ex-icon
    icon="add-line"
    :size="24"
    clickable
    aria-label="新增记录"
    @click="iconClicks += 1"
  />
  <ex-icon icon="delete-bin-line" :size="24" clickable disabled aria-label="删除记录" />
  <span class="icon-counter">已点击 {{ iconClicks }} 次</span>
</div>
:::

## 字体图标

```vue
<ex-icon name="fa-user" prefix="fas" aria-label="用户" />
```

字体样式表由应用自行加载。`name` 和 `prefix` 只组合类名，不会发起网络请求。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `icon` | 内置 SVG 注册名 | `string` | — |
| `name` | 字体图标类名 | `string` | — |
| `prefix` | 字体图标前缀 | `string` | — |
| `src` | 图片地址 | `string` | — |
| `alt` | 图片或交互图标的可访问文本 | `string` | — |
| `ariaLabel` | 根元素的可访问名称 | `string` | — |
| `size` | 图标尺寸 | `number \| string` | `16` |
| `color` | 图标颜色；与 `src` 同用时启用蒙版 | `string` | `currentColor` |
| `rotate` | 静态旋转角度 | `number` | `0` |
| `spin` | 是否持续旋转 | `boolean` | `false` |
| `clickable` | 是否使用原生按钮 | `boolean` | `false` |
| `disabled` | 是否禁用交互按钮 | `boolean` | `false` |
| `customClass` | 兼容性附加类名 | `string` | — |

### Events

| 事件名 | 参数 |
| --- | --- |
| `click` | `(event: MouseEvent)` |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 自定义图标内容 |

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 20px;
}

.icon-item {
  display: grid;
  gap: 8px;
  place-items: center;
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}

.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.icon-counter {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}
</style>
