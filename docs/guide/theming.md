# 主题定制

ExUI 提供了灵活的主题系统，让你可以轻松定制组件的外观以匹配你的品牌风格。

## 默认主题

ExUI 内置了多个主题：

- **neon-blue** - 霓虹蓝主题（默认，赛博朋克）
- **neon-pink** - 霓虹粉主题（赛博朋克）
- **dark** - 纯黑暗主题（冷蓝灰，无霓虹）
- **matrix** - 矩阵绿黑客风主题（纯黑底 + 荧光绿，极高对比）。旧名 `high-contrast`
  仍作为兼容别名生效，但建议使用 `matrix`；`high-contrast` 名称保留给未来的无障碍主题
- **light** - 明亮主题（白底深字，发光收敛为柔和投影，适合后台/文档场景）

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
      <button @click="theme = 'neon-blue'">霓虹蓝</button>
      <button @click="theme = 'neon-pink'">霓虹粉</button>
      <button @click="theme = 'dark'">暗黑</button>
      <button @click="theme = 'matrix'">矩阵绿</button>
      <button @click="theme = 'light'">明亮</button>
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

const theme = useTheme();

// 获取当前主题
console.log(theme.value); // 'neon-blue'

// 切换主题（需要在 ConfigProvider 内部）
const switchTheme = newTheme => {
  // 通过更新 ConfigProvider 的 theme prop 来切换
};
</script>
```

## 自定义主题

### CSS 变量覆盖

你可以通过覆盖 CSS 变量来自定义主题：

```css
:root {
  /* 主色调 */
  --ex-primary: #ff6b35;
  --ex-secondary: #f7931e;

  /* 背景色 */
  --ex-bg-primary: #1a1a2e;
  --ex-bg-secondary: #16213e;

  /* 文本色 */
  --ex-text-primary: #ffffff;
  --ex-text-secondary: #b8b8b8;
}
```

### SCSS 主题文件

创建自定义主题文件：

```scss
// themes/custom.scss
:root[data-theme='custom'] {
  --ex-primary: #ff6b35;
  --ex-primary-hover: #ff5722;
  --ex-primary-active: #e64a19;

  --ex-secondary: #f7931e;
  --ex-accent: #4caf50;

  --ex-bg-primary: #1a1a2e;
  --ex-bg-secondary: #16213e;
  --ex-bg-elevated: #0f3460;

  --ex-text-primary: #ffffff;
  --ex-text-secondary: #b8b8b8;
  --ex-text-disabled: #666666;

  --ex-border: #333333;
  --ex-shadow: rgba(255, 107, 53, 0.2);
}
```

然后在应用中引入：

```typescript
import './themes/custom.scss';

// 使用自定义主题
setTheme('custom');
```

## 主题变量参考

### 颜色变量

```scss
// 主色调
--ex-primary: #29abe2;
--ex-primary-hover: #1e8bb8;
--ex-primary-active: #1a7ba3;

--ex-secondary: #a86bff;
--ex-accent: #ff3bd1;

// 背景色
--ex-bg-primary: #0b0f14;
--ex-bg-secondary: #0f1720;
--ex-bg-elevated: #1a2332;

// 文本色
--ex-text-primary: #e6f0ff;
--ex-text-secondary: #8fa3b8;
--ex-text-disabled: #4a5568;

// 边框和阴影
--ex-border: #2d3748;
--ex-shadow: rgba(41, 171, 226, 0.15);
```

### 间距变量

```scss
--ex-space-xs: 4px;
--ex-space-sm: 8px;
--ex-space-md: 16px;
--ex-space-lg: 24px;
--ex-space-xl: 32px;
--ex-space-xxl: 48px;
```

### 字体变量

```scss
--ex-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--ex-font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

--ex-font-size-xs: 12px;
--ex-font-size-sm: 14px;
--ex-font-size-md: 16px;
--ex-font-size-lg: 18px;
--ex-font-size-xl: 20px;
```

### 动画变量

```scss
--ex-duration-fast: 150ms;
--ex-duration-normal: 300ms;
--ex-duration-slow: 500ms;

--ex-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ex-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ex-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 响应式主题

ExUI 支持基于屏幕尺寸的响应式主题：

```scss
// 移动端主题调整
@media (max-width: 768px) {
  :root {
    --ex-font-size-md: 14px;
    --ex-space-md: 12px;
  }
}

// 大屏幕主题调整
@media (min-width: 1200px) {
  :root {
    --ex-font-size-md: 18px;
    --ex-space-md: 20px;
  }
}
```

## 暗色模式

ExUI 自动支持系统暗色模式：

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --ex-bg-primary: #000000;
    --ex-text-primary: #ffffff;
  }
}
```

你也可以使用 ConfigProvider 手动控制暗色模式：

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { ExConfigProvider } from 'vue-ex-ui';

const theme = ref('neon-blue');

// 检测系统暗色模式偏好
onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    theme.value = 'dark';
  }

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    theme.value = e.matches ? 'dark' : 'neon-blue';
  });
});
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

## 持久化主题

将用户选择的主题保存到 localStorage：

```vue
<script setup>
import { ref, watch, onMounted } from 'vue';
import { ExConfigProvider } from 'vue-ex-ui';

const theme = ref('neon-blue');

// 从 localStorage 恢复主题
onMounted(() => {
  const savedTheme = localStorage.getItem('ex-ui-theme');
  if (savedTheme) {
    theme.value = savedTheme;
  }
});

// 保存主题到 localStorage
watch(theme, newTheme => {
  localStorage.setItem('ex-ui-theme', newTheme);
});
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

## 更多配置

查看 [ConfigProvider 文档](/components/config-provider) 了解更多全局配置选项，包括：

- 语言切换
- 全局尺寸
- 霓虹效果控制
- 动画控制
- 命名空间自定义
- z-index 管理
