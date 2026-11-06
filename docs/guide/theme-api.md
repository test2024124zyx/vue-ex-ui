# 主题 API 参考

ExUI 的全局主题契约只有两个值：`neon-blue`（赛博暗色）和 `light`（赛博亮色）。

导入根入口、导入 `useTheme` 或只读取 `getTheme()` 都不会修改宿主页面；只有显式调用
`setTheme()`、`toggleTheme()` 或带初始化语义的持久化/系统主题 API 才会写入根节点。

## 类型

```ts
type Theme = 'neon-blue' | 'light';

interface ThemeConfig {
  name: Theme;
  displayName: string;
  description?: string;
  isDark: boolean;
}
```

`ThemeVariables` 包含语义化 CSS 变量，并允许以 `--ex-` 开头的组件专用变量。全局主题不再包含 `neon-pink`、`dark`、`matrix` 或 `high-contrast`。

## 主题配置

```ts
import { THEME_CONFIGS, THEME_NAMES, getThemeConfig, isDarkTheme } from 'vue-ex-ui';

console.log(THEME_NAMES); // ['neon-blue', 'light']
console.log(getThemeConfig('neon-blue'));
console.log(isDarkTheme('neon-blue')); // true
console.log(THEME_CONFIGS.light.displayName);
```

`THEME_NAMES` 是主题选择器的唯一候选列表。`ThemeConfig` 不再包含高对比度主题字段；高对比度偏好由 CSS 媒体查询处理。

## 全局函数

### `setTheme`

```ts
function setTheme(theme: Theme): void;
```

设置主题并同步：

- `document.documentElement[data-theme]`；
- 根节点的 `color-scheme`；
- `ex-theme-loaded` 标记；
- `ex-theme-change` 自定义事件。

```ts
import { setTheme } from 'vue-ex-ui';

setTheme('light');
```

在服务端渲染环境中，函数只更新内存状态，不访问 DOM。

### `getTheme`

```ts
function getTheme(): Theme;
```

获取当前主题。

### `toggleTheme`

```ts
function toggleTheme(themes?: readonly Theme[]): void;
```

默认在两个主题之间切换，也可以传入两个主题的子集：

```ts
toggleTheme();
toggleTheme(['neon-blue', 'light']);
```

### `onThemeChange`

```ts
function onThemeChange(callback: (theme: Theme) => void): () => void;
```

注册主题变化回调并返回取消订阅函数。若在 Vue 组合式作用域中同步调用，组件卸载时会自动清理。

### 存储 API

```ts
function saveThemeToStorage(theme: Theme): void;
function loadThemeFromStorage(): Theme | null;
```

存储键为 `ex-ui-theme`。无效旧值会被忽略，不会进入新的双主题状态。

## 组合式 API

### `useTheme`

```ts
function useTheme(): {
  theme: Readonly<Ref<Theme>>;
  setTheme: typeof setTheme;
  toggleTheme: typeof toggleTheme;
};
```

```vue
<script setup lang="ts">
import { useTheme } from 'vue-ex-ui';

const { theme, setTheme } = useTheme();
</script>

<template>
  <button
    type="button"
    @click="setTheme(theme === 'light' ? 'neon-blue' : 'light')"
  >
    当前：{{ theme }}
  </button>
</template>
```

### `usePersistedTheme`

```ts
const { theme, setTheme } = usePersistedTheme();
```

创建时读取 `localStorage`，主题变化时自动保存。存储权限或配额异常会静默降级。

### `useSystemTheme`

```ts
function useSystemTheme(): () => void;
```

监听 `prefers-color-scheme: dark`：暗色映射到 `neon-blue`，亮色映射到 `light`。返回值用于手动停止监听。

### `getPreferredSystemTheme`

```ts
function getPreferredSystemTheme(): Theme;
```

读取当前系统颜色偏好；无法访问 `matchMedia` 时返回默认的 `neon-blue`。

## ConfigProvider

```ts
interface ExConfigProviderProps {
  theme?: Theme;
  locale?: 'zh-CN' | 'en-US';
  size?: 'small' | 'medium' | 'large';
  neonEffect?: boolean;
  animation?: boolean;
  zIndex?: number;
}
```

`ExConfigProvider` 的主题通过本地 `data-theme` 属性作用于子树，不会覆盖文档根节点。`neonEffect` 和 `animation` 的禁用规则只匹配 ExUI 命名空间，避免污染插槽中的业务组件。

## 事件

```ts
interface ThemeChangeEvent {
  oldTheme: Theme;
  newTheme: Theme;
  timestamp: number;
}
```

```ts
document.addEventListener('ex-theme-change', event => {
  const detail = (event as CustomEvent<ThemeChangeEvent>).detail;
  console.log(detail.oldTheme, detail.newTheme);
});
```

## CSS 变量约定

```scss
.app-panel {
  background: var(--ex-color-bg-elevated);
  color: var(--ex-color-text-primary);
  border-color: var(--ex-color-border-primary);
}
```

业务侧可以在自己的作用域覆盖语义变量，但不应通过新增 `data-theme` 值伪造全局预设主题。更多变量参见 [CSS 变量命名规范](./css-variables-naming.md)。

## 无障碍与动效

- `prefers-reduced-motion: reduce` 会关闭扫描线、脉冲和非必要过渡。
- `prefers-contrast: more` 会增强 ExUI 控件边界，不产生第三个主题。
- 主题切换器应使用原生按钮，并提供文本、焦点样式和键盘操作。
- 主题切换只修改 CSS 变量与根节点属性，不应重新挂载整个应用。
