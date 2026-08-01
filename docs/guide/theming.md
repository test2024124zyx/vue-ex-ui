# 主题定制

ExUI 提供了灵活的主题系统，让你可以轻松定制组件的外观以匹配你的品牌风格。

## 默认主题

ExUI 内置两个赛博朋克主题：

- **neon-blue** - 赛博暗色主题（默认，霓虹蓝紫）
- **light** - 赛博亮色主题（白底深字，纹理和发光效果收敛）

## 切换主题

### 使用 ConfigProvider

推荐使用 `ExConfigProvider` 组件来配置主题：

```vue
<script setup>
import { ref } from 'vue';
import { ExConfigProvider } from 'vue-ex-ui';

const theme = ref('neon-blue');
</script>

<template>
  <ExConfigProvider :theme="theme">
    <div class="theme-switcher">
      <button @click="theme = 'neon-blue'">赛博暗色</button>
      <button @click="theme = 'light'">赛博亮色</button>
    </div>

    <App />
  </ExConfigProvider>
</template>
```

### 使用组合式 API

在组件中使用 `useTheme` 获取和切换主题：

```vue
<script setup>
import { useTheme } from 'vue-ex-ui';

const { theme, setTheme } = useTheme();

// 获取当前主题
console.log(theme.value); // 'neon-blue'

// 切换主题
setTheme('light');
</script>
```

## 局部品牌覆盖

全局主题集合保持为两个值。品牌需要调整颜色时，应在应用容器或业务模块内覆盖语义变量，不要注册第三个 `Theme` 值。

### CSS 变量覆盖

```css
.app-brand-scope {
  /* 主色调 */
  --ex-color-primary: #ff6b35;
  --ex-color-secondary: #f7931e;

  /* 背景色 */
  --ex-color-bg-primary: #1a1a2e;
  --ex-color-bg-secondary: #16213e;

  /* 文本色 */
  --ex-color-text-primary: #ffffff;
  --ex-color-text-secondary: #b8b8b8;
}
```

覆盖变量时应同时检查暗色和亮色场景的可读性；组件内部仍然只使用 `--ex-color-*` 等语义变量。

## 主题变量参考

### 颜色变量

```scss
// 主色调
--ex-color-primary: #29abe2;
--ex-color-primary-hover: #1e8bb8;
--ex-color-primary-active: #1a7ba3;

--ex-color-secondary: #a86bff;
--ex-color-accent: #ff3bd1;

// 背景色
--ex-color-bg-primary: #0b0f14;
--ex-color-bg-secondary: #0f1720;
--ex-color-bg-elevated: #1a2332;

// 文本色
--ex-color-text-primary: #e6f0ff;
--ex-color-text-secondary: #8fa3b8;
--ex-color-text-disabled: #4a5568;

// 边框
--ex-color-border: #2d3748;
```

### 间距变量

间距使用基于 4px 栅格的数字刻度：

```scss
--ex-spacing-1: 4px;
--ex-spacing-2: 8px;
--ex-spacing-3: 12px;
--ex-spacing-4: 16px;
--ex-spacing-5: 20px;
--ex-spacing-6: 24px;
--ex-spacing-8: 32px;
--ex-spacing-12: 48px;
/* 继续到 --ex-spacing-64（256px） */
```

### 字体变量

```scss
--ex-font-primary: 'Orbitron', 'Audiowide', 'Rajdhani', sans-serif;
--ex-font-secondary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--ex-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

--ex-text-xs: 12px;
--ex-text-sm: 14px;
--ex-text-base: 16px;
--ex-text-lg: 18px;
--ex-text-xl: 20px;
```

### 动画变量

```scss
--ex-motion-duration-fast: 120ms;
--ex-motion-duration-base: 200ms;
--ex-motion-duration-medium: 320ms;
--ex-motion-duration-slow: 480ms;

--ex-motion-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ex-motion-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ex-motion-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 响应式主题

ExUI 支持基于屏幕尺寸的响应式主题：

```scss
// 移动端主题调整
@media (max-width: 768px) {
  :root {
    --ex-text-base: 14px;
    --ex-spacing-4: 12px;
  }
}

// 大屏幕主题调整
@media (min-width: 1200px) {
  :root {
    --ex-text-base: 18px;
    --ex-spacing-4: 20px;
  }
}
```

## 跟随系统明暗偏好

系统暗色偏好映射到 `neon-blue`，亮色偏好映射到 `light`。使用 `useSystemTheme` 监听并清理媒体查询，不要在根节点额外覆盖背景变量：

```vue
<script setup lang="ts">
import { useSystemTheme } from 'vue-ex-ui';

useSystemTheme();
</script>

<template>
  <App />
</template>
```

## 持久化主题

将用户选择的主题保存到 localStorage：

```ts
import { usePersistedTheme } from 'vue-ex-ui';

const { theme, setTheme } = usePersistedTheme();
setTheme('light');
```

## 更多配置

查看 [ConfigProvider 文档](/components/config-provider) 了解更多全局配置选项，包括：

- 语言切换
- 全局尺寸
- 霓虹效果控制
- 动画控制
- z-index 管理
