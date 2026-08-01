# 主题使用指南

ExUI 的全局主题固定为两个赛博朋克主题：

- `neon-blue`：赛博暗色主题，使用深色背景、霓虹蓝紫渐变和有限的发光效果。
- `light`：赛博亮色主题，使用深色文字、浅色背景和低对比度的科技纹理。

主题名称由 `Theme` 类型、`THEME_CONFIGS` 和 CSS 选择器共同约束。应用层不应再使用
`neon-pink`、`dark`、`matrix` 或 `high-contrast` 作为全局主题值。

## 使用 ConfigProvider

推荐在应用根部使用 `ExConfigProvider`，让组件树继承统一的主题、尺寸和动效配置：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ExConfigProvider } from 'vue-ex-ui';
import type { Theme } from 'vue-ex-ui';

const theme = ref<Theme>('neon-blue');
</script>

<template>
  <ExConfigProvider :theme="theme">
    <nav
      class="theme-switcher"
      aria-label="主题切换"
    >
      <button
        type="button"
        @click="theme = 'neon-blue'"
      >
        赛博暗色
      </button>
      <button
        type="button"
        @click="theme = 'light'"
      >
        赛博亮色
      </button>
    </nav>
    <App />
  </ExConfigProvider>
</template>
```

`ConfigProvider` 的主题只作用于它的组件树，不会覆盖宿主页面根节点的主题属性。需要控制整页主题时，使用下面的全局主题 API。

## 全局主题 API

```ts
import {
  getTheme,
  setTheme,
  toggleTheme,
  useTheme,
  usePersistedTheme,
  useSystemTheme,
} from 'vue-ex-ui';

setTheme('light');
console.log(getTheme());

// 默认只在 neon-blue 与 light 之间循环。
toggleTheme();

const { theme, setTheme: changeTheme } = useTheme();
changeTheme(theme.value === 'light' ? 'neon-blue' : 'light');
```

`setTheme` 会同步 `document.documentElement[data-theme]`、`color-scheme` 和
`ex-theme-change` 事件。服务端渲染时不会访问 DOM。

### 持久化主题

```ts
import { usePersistedTheme } from 'vue-ex-ui';

const { theme, setTheme } = usePersistedTheme();
setTheme('light');
```

持久化键为 `ex-ui-theme`。存储不可用时会静默降级，不会阻断主题切换。

### 跟随系统偏好

```ts
import { useSystemTheme } from 'vue-ex-ui';

const stop = useSystemTheme();
// 组件卸载时在组合式作用域中自动清理；也可以手动调用 stop()。
```

系统暗色偏好映射为 `neon-blue`，亮色偏好映射为 `light`。高对比度与减少动效由 CSS 媒体查询处理，不会增加第三个全局主题。

### 监听主题变化

```ts
import { onThemeChange } from 'vue-ex-ui';

const stop = onThemeChange(theme => {
  document.title = `ExUI - ${theme}`;
});
stop();
```

也可以监听原生事件：

```ts
document.addEventListener('ex-theme-change', event => {
  const { oldTheme, newTheme } = (event as CustomEvent).detail;
  console.log(oldTheme, newTheme);
});
```

## 主题变量

组件使用语义化 CSS 变量，不应在业务组件中写死暗色或亮色背景：

```scss
.app-panel {
  background: var(--ex-color-bg-elevated);
  color: var(--ex-color-text-primary);
  border: 1px solid var(--ex-color-border-primary);
  box-shadow: var(--ex-shadow-neon-sm);
}
```

主要变量包括：

- 颜色：`--ex-color-primary`、`--ex-color-secondary`、`--ex-color-accent`。
- 背景：`--ex-color-bg-primary`、`--ex-color-bg-secondary`、`--ex-color-bg-elevated`。
- 文字：`--ex-color-text-primary`、`--ex-color-text-secondary`、`--ex-color-text-tertiary`。
- 状态：`--ex-color-success`、`--ex-color-warning`、`--ex-color-error`、`--ex-color-info`。
- 赛博纹理：`--ex-cyber-grid-opacity`、`--ex-cyber-scanline-opacity` 和 `--ex-cyber-grid-size`。

业务侧可以在应用容器内覆盖语义变量，而不创建第三套主题：

```scss
.app-brand-scope {
  --ex-color-primary: #1677ff;
  --ex-color-primary-hover: #0958d9;
}
```

## 动效和无障碍

- `neonEffect="false"` 只关闭 ExUI 组件的阴影、文字阴影和滤镜，不会修改插槽内容或宿主页面的任意元素。
- `animation="false"` 只关闭 ExUI 组件的过渡与动画。
- `prefers-reduced-motion: reduce` 会关闭扫描线、复杂发光和组件动画。
- `prefers-contrast: high` 会增强 ExUI 控件边界；它不是单独的主题名称。
- 主题切换器应使用原生 `button`，提供可见文本、焦点状态和键盘操作。

## API 速查

| API                       | 作用                         |
| ------------------------- | ---------------------------- |
| `setTheme(theme)`         | 设置 `neon-blue` 或 `light`  |
| `getTheme()`              | 获取当前主题                 |
| `toggleTheme()`           | 在两个主题间切换             |
| `useTheme()`              | 获取响应式主题引用           |
| `usePersistedTheme()`     | 读取并保存用户主题           |
| `useSystemTheme()`        | 监听系统明暗偏好             |
| `onThemeChange(callback)` | 监听主题变化                 |
| `getThemeConfig(theme)`   | 获取显示名称、描述和暗色标记 |
| `isDarkTheme(theme)`      | 判断是否为赛博暗色主题       |
