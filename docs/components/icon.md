# Icon 图标

用于展示内置 SVG、图片、字体图标或自定义插槽内容。图标默认继承父级颜色；交互图标使用原生按钮语义、统一触控尺寸和组件库动效。

<script setup>
import { ref } from 'vue'

const iconClicks = ref(0)
const maskIcon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="M12 2 15 9l7 .8-5.2 4.8 1.5 7.1L12 17l-6.3 3.7 1.5-7.1L2 9.8 9 9z"/></svg>'
)}`
</script>

## 内置图标

`icon` 使用组件内冻结的 SVG 注册表；未知名称不会伪造替代图形。

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

::: details 查看示例代码

```vue
<ex-icon icon="search-line" :size="24" />
<ex-icon icon="user-line" :size="24" />
<ex-icon icon="calendar-line" :size="24" />
<ex-icon icon="folder-line" :size="24" />
<ex-icon icon="dashboard-line" :size="24" />
<ex-icon icon="notification-line" :size="24" />
```

:::

## 尺寸、颜色与旋转

`size` 支持数字和 CSS 长度；`color` 推荐使用组件库语义 token；`rotate` 只改变静态角度，`spin` 用于持续旋转。

::: raw

<div class="vp-raw demo-container icon-row">
  <ex-icon icon="star-fill" :size="16" color="var(--ex-color-warning)" />
  <ex-icon icon="star-fill" :size="24" color="var(--ex-color-secondary)" />
  <ex-icon icon="arrow-right-line" :size="28" :rotate="90" color="var(--ex-color-primary)" />
  <ex-icon icon="loader-4-line" :size="28" spin color="var(--ex-color-success)" />
</div>
:::

::: details 查看示例代码

```vue
<ex-icon icon="star-fill" :size="16" color="var(--ex-color-warning)" />
<ex-icon icon="star-fill" :size="24" color="var(--ex-color-secondary)" />
<ex-icon icon="arrow-right-line" :size="28" :rotate="90" color="var(--ex-color-primary)" />
<ex-icon icon="loader-4-line" :size="28" spin color="var(--ex-color-success)" />
```

:::

## 图片蒙版与自定义 SVG

为图片地址同时设置 `color` 时，图片按单色蒙版渲染；默认插槽内容优先于其他图标来源。

::: raw

<div class="vp-raw demo-container icon-row">
  <ex-icon :src="maskIcon" color="var(--ex-color-primary)" :size="30" alt="主色星标" />
  <ex-icon :size="30" color="var(--ex-color-accent)" aria-label="强调色菱形">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2 22 12 12 22 2 12z" />
    </svg>
  </ex-icon>
</div>
:::

::: details 查看示例代码

```vue
<ex-icon :src="maskIcon" color="var(--ex-color-primary)" :size="30" alt="主色星标" />
<ex-icon :size="30" color="var(--ex-color-accent)" aria-label="强调色菱形">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2 22 12 12 22 2 12z" />
  </svg>
</ex-icon>
```

:::

## 交互图标

`clickable` 将根元素渲染为原生 `button`，默认提供不小于 44px 的触控区域；交互图标应始终提供 `aria-label`、`alt` 或可识别的 `icon` / `name`。

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

::: details 查看示例代码

```vue
<ex-icon icon="add-line" :size="24" clickable aria-label="新增记录" @click="iconClicks += 1" />
<ex-icon icon="delete-bin-line" :size="24" clickable disabled aria-label="删除记录" />
<span class="icon-counter">已点击 {{ iconClicks }} 次</span>
```

:::

## 字体图标

`name` 和 `prefix` 只组合字体类名，不会发起网络请求。字体样式表由应用自行加载，下面的示例假设应用已经加载 Font Awesome。

::: raw

<div class="vp-raw demo-container icon-row">
  <ex-icon name="fa-user" prefix="fas" aria-label="用户" />
  <span class="icon-font-label">由应用加载的字体图标</span>
</div>
:::

::: details 查看示例代码

```vue
<ex-icon name="fa-user" prefix="fas" aria-label="用户" />
<span class="icon-font-label">由应用加载的字体图标</span>
```

:::

## 行为约定

- 来源优先级为：默认插槽、内置 SVG、图片地址、字体图标。
- 非交互且没有可访问名称的图标会自动标记为装饰性内容；信息图标应提供 `aria-label`。
- `disabled` 只对 `clickable` 图标生效，禁用按钮不会发出 `click` 事件。
- `alt`、`ariaLabel` 和外部 `aria-label` 都可用于提供根元素的可访问名称。

## API

### Props

| 参数          | 说明                              | 类型               | 默认值         |
| ------------- | --------------------------------- | ------------------ | -------------- |
| `icon`        | 内置 SVG 注册名                   | `string`           | —              |
| `name`        | 字体图标类名                      | `string`           | —              |
| `prefix`      | 字体图标前缀                      | `string`           | —              |
| `src`         | 图片地址                          | `string`           | —              |
| `alt`         | 图片或交互图标的可访问文本        | `string`           | —              |
| `ariaLabel`   | 根元素的可访问名称                | `string`           | —              |
| `size`        | 图标尺寸                          | `number \| string` | `16`           |
| `color`       | 图标颜色；与 `src` 同用时启用蒙版 | `string`           | `currentColor` |
| `rotate`      | 静态旋转角度                      | `number`           | `0`            |
| `spin`        | 是否持续旋转                      | `boolean`          | `false`        |
| `clickable`   | 是否使用原生按钮                  | `boolean`          | `false`        |
| `disabled`    | 是否禁用交互按钮                  | `boolean`          | `false`        |
| `customClass` | 兼容性附加类名                    | `string`           | —              |

### Events

| 事件名  | 参数                  |
| ------- | --------------------- |
| `click` | `(event: MouseEvent)` |

### Slots

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 自定义图标内容 |

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: var(--ex-spacing-5);
}

.icon-item {
  display: grid;
  gap: var(--ex-spacing-2);
  place-items: center;
  padding: var(--ex-spacing-4);
  border: 1px solid var(--ex-color-border-secondary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}

.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ex-spacing-6);
  align-items: center;
  padding: var(--ex-spacing-4);
  border: 1px solid var(--ex-color-border-secondary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
}

.icon-counter,
.icon-font-label {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}
</style>
