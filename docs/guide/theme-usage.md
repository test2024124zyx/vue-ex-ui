# 主题使用指南

ExUI 提供了完整的主题系统，支持多种预设主题和自定义主题。

## 预设主题

ExUI 内置了 4 种赛博朋克风格主题：

### Neon Blue（霓虹蓝）- 默认主题

赛博朋克风格，霓虹蓝主导，适合大多数未来科技应用。

<div class="theme-preview" data-theme="neon-blue">
  <div class="preview-card">
    <ExButton type="primary">主要按钮</ExButton>
    <ExButton type="secondary">次要按钮</ExButton>
    <ExCard>
      <template #header>霓虹蓝主题</template>
      <p>深色背景配合霓虹蓝紫渐变，营造沉浸式氛围</p>
    </ExCard>
  </div>
</div>

### Neon Pink（霓虹粉）

赛博朋克风格，霓虹粉主导，更加炫酷动感。

<div class="theme-preview" data-theme="neon-pink">
  <div class="preview-card">
    <ExButton type="primary">主要按钮</ExButton>
    <ExButton type="secondary">次要按钮</ExButton>
    <ExCard>
      <template #header>霓虹粉主题</template>
      <p>霓虹粉色主导，适合需要更强视觉冲击的场景</p>
    </ExCard>
  </div>
</div>

### Dark（暗黑）

纯暗黑主题，无霓虹效果，适合长时间使用。

<div class="theme-preview" data-theme="dark">
  <div class="preview-card">
    <ExButton type="primary">主要按钮</ExButton>
    <ExButton type="secondary">次要按钮</ExButton>
    <ExCard>
      <template #header>暗黑主题</template>
      <p>纯黑背景，降低视觉疲劳，适合长时间使用</p>
    </ExCard>
  </div>
</div>

### High Contrast（高对比度）

高对比度主题，无障碍友好，适合视力障碍用户。

<div class="theme-preview" data-theme="high-contrast">
  <div class="preview-card">
    <ExButton type="primary">主要按钮</ExButton>
    <ExButton type="secondary">次要按钮</ExButton>
    <ExCard>
      <template #header>高对比度主题</template>
      <p>纯色高对比，符合 WCAG 无障碍标准</p>
    </ExCard>
  </div>
</div>

## 基础使用

### 方式一：使用 ConfigProvider

推荐在应用根组件使用 `ExConfigProvider` 设置全局主题：

```vue
<script setup>
import { ref } from 'vue';
import { ExConfigProvider } from 'vue-ex-ui';

const theme = ref('neon-blue');
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

### 方式二：使用 Composable API

使用 `useTheme` 组合式 API 进行主题切换：

```vue
<script setup>
import { useTheme } from 'vue-ex-ui';

const { theme, setTheme, toggleTheme } = useTheme();

// 切换到指定主题
const switchToNeonPink = () => {
  setTheme('neon-pink');
};

// 在多个主题间循环切换
const cycleTheme = () => {
  toggleTheme(['neon-blue', 'neon-pink', 'dark']);
};
</script>

<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <ExButton @click="switchToNeonPink">切换到霓虹粉</ExButton>
    <ExButton @click="cycleTheme">循环切换主题</ExButton>
  </div>
</template>
```

## 高级功能

### 持久化主题

使用 `usePersistedTheme` 自动保存用户的主题选择：

```vue
<script setup>
import { usePersistedTheme } from 'vue-ex-ui';

// 自动从 localStorage 加载主题，并在切换时保存
const { theme, setTheme } = usePersistedTheme();
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

### 跟随系统主题

使用 `useSystemTheme` 自动跟随系统的暗色模式设置：

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useSystemTheme, useTheme } from 'vue-ex-ui';

const { theme } = useTheme();
let cleanup;

onMounted(() => {
  // 根据系统偏好自动设置主题
  cleanup = useSystemTheme();
});

onUnmounted(() => {
  // 清理监听器
  if (cleanup) cleanup();
});
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

### 监听主题变化

使用 `onThemeChange` 监听主题切换事件：

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { onThemeChange } from 'vue-ex-ui';

let unsubscribe;

onMounted(() => {
  // 监听主题变化
  unsubscribe = onThemeChange(newTheme => {
    console.log('主题已切换到:', newTheme);
    // 执行自定义逻辑，如上报分析数据
    analytics.track('theme_changed', { theme: newTheme });
  });
});

onUnmounted(() => {
  // 取消监听
  if (unsubscribe) unsubscribe();
});
</script>
```

### 使用原生事件监听

也可以使用原生 DOM 事件监听主题变化：

```typescript
document.addEventListener('ex-theme-change', event => {
  const { oldTheme, newTheme, timestamp } = event.detail;
  console.log(`主题从 ${oldTheme} 切换到 ${newTheme}`);
});
```

## 主题切换器组件

创建一个主题切换器组件：

```vue
<script setup>
import { useTheme } from 'vue-ex-ui';

const { theme, setTheme } = useTheme();

const themes = [
  { value: 'neon-blue', label: '霓虹蓝', icon: '🔵' },
  { value: 'neon-pink', label: '霓虹粉', icon: '🟣' },
  { value: 'dark', label: '暗黑', icon: '⚫' },
  { value: 'high-contrast', label: '高对比度', icon: '⚪' },
];
</script>

<template>
  <div class="theme-switcher">
    <ExDropdown>
      <ExButton>
        {{ themes.find(t => t.value === theme)?.icon }}
        切换主题
      </ExButton>
      <template #menu>
        <ExDropdownItem
          v-for="t in themes"
          :key="t.value"
          :label="`${t.icon} ${t.label}`"
          :class="{ active: theme === t.value }"
          @click="setTheme(t.value)"
        />
      </template>
    </ExDropdown>
  </div>
</template>

<style scoped>
.theme-switcher {
  display: inline-block;
}

.active {
  background: var(--ex-color-primary-alpha-10);
  color: var(--ex-color-primary);
}
</style>
```

## 防止闪烁 (FOUC)

为了防止页面加载时出现无样式内容闪烁（Flash of Unstyled Content），ExUI 提供了两种初始化方案。

### 方案一：内联脚本（推荐）

在 HTML 的 `<head>` 中直接内联初始化脚本，这是最快的方式：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExUI App</title>

    <!-- 关键 CSS - 防止 FOUC -->
    <style>
      :root {
        --ex-color-bg-primary: #0b0f14;
        --ex-color-text-primary: #e6f0ff;
        color-scheme: dark;
        background-color: var(--ex-color-bg-primary);
        color: var(--ex-color-text-primary);
      }
      html:not(.ex-theme-loaded) body {
        visibility: hidden;
      }
      html.ex-theme-loaded body {
        visibility: visible;
      }
    </style>

    <!-- 主题初始化脚本（内联） -->
    <script>
      (function () {
        'use strict';

        // 从 localStorage 读取保存的主题
        function getSavedTheme() {
          try {
            return localStorage.getItem('ex-ui-theme');
          } catch (e) {
            return null;
          }
        }

        // 检测系统主题偏好
        function getSystemTheme() {
          if (typeof window === 'undefined' || !window.matchMedia) {
            return 'neon-blue';
          }

          const highContrast = window.matchMedia('(prefers-contrast: high)');
          const darkMode = window.matchMedia('(prefers-color-scheme: dark)');

          if (highContrast.matches) {
            return 'high-contrast';
          } else if (darkMode.matches) {
            return 'dark';
          } else {
            return 'neon-blue';
          }
        }

        // 验证主题名称
        function isValidTheme(theme) {
          return ['neon-blue', 'neon-pink', 'dark', 'high-contrast'].includes(theme);
        }

        // 应用主题
        function applyTheme(theme) {
          if (!isValidTheme(theme)) {
            theme = 'neon-blue';
          }
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.style.colorScheme = 'dark';
        }

        // 初始化主题
        const savedTheme = getSavedTheme();
        const theme = savedTheme && isValidTheme(savedTheme) ? savedTheme : getSystemTheme();
        applyTheme(theme);

        // 添加已加载标记
        document.documentElement.classList.add('ex-theme-loaded');
      })();
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**优点**:

- ✅ 最快的加载速度，无需额外的 HTTP 请求
- ✅ 在页面渲染前就应用主题
- ✅ 完全避免 FOUC

**缺点**:

- ❌ 增加 HTML 文件大小
- ❌ 修改脚本需要更新所有 HTML 文件

### 方案二：外部脚本文件

使用 ExUI 提供的 `theme-init.js` 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExUI App</title>

    <!-- 关键 CSS -->
    <style>
      :root {
        --ex-color-bg-primary: #0b0f14;
        --ex-color-text-primary: #e6f0ff;
        color-scheme: dark;
        background-color: var(--ex-color-bg-primary);
        color: var(--ex-color-text-primary);
      }
      html:not(.ex-theme-loaded) body {
        visibility: hidden;
      }
      html.ex-theme-loaded body {
        visibility: visible;
      }
    </style>

    <!-- 主题初始化脚本（外部文件） -->
    <script src="/theme-init.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**优点**:

- ✅ 代码可复用，易于维护
- ✅ 可以被浏览器缓存
- ✅ HTML 文件更简洁

**缺点**:

- ❌ 需要额外的 HTTP 请求
- ❌ 可能有轻微的延迟

### 选择建议

- **生产环境**: 推荐使用方案一（内联脚本），获得最佳性能
- **开发环境**: 可以使用方案二（外部文件），便于调试和修改
- **静态站点**: 使用方案一
- **SPA 应用**: 两种方案都可以，建议方案一

### Vite 项目配置

如果使用 Vite，可以在 `index.html` 中这样配置：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExUI App</title>

    <!-- 关键 CSS -->
    <style>
      :root {
        --ex-color-bg-primary: #0b0f14;
        --ex-color-text-primary: #e6f0ff;
        color-scheme: dark;
        background-color: var(--ex-color-bg-primary);
        color: var(--ex-color-text-primary);
      }
      html:not(.ex-theme-loaded) body {
        visibility: hidden;
      }
      html.ex-theme-loaded body {
        visibility: visible;
      }
    </style>

    <!-- 主题初始化脚本 -->
    <script type="module" src="/src/theme-init.ts"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 验证主题初始化

打开浏览器开发者工具，检查：

1. `<html>` 标签是否有 `data-theme` 属性
2. `<html>` 标签是否有 `ex-theme-loaded` 类
3. 页面是否有闪烁现象

```javascript
// 在控制台运行
console.log('当前主题:', document.documentElement.getAttribute('data-theme'));
console.log('是否已加载:', document.documentElement.classList.contains('ex-theme-loaded'));
```

## API 参考

### setTheme(theme)

设置当前主题。

- **参数**:
  - `theme: Theme` - 主题名称 (`'neon-blue'` | `'neon-pink'` | `'dark'` | `'high-contrast'`)
- **返回**: `void`

```typescript
import { setTheme } from 'vue-ex-ui';

setTheme('neon-pink');
```

### getTheme()

获取当前主题。

- **返回**: `Theme` - 当前主题名称

```typescript
import { getTheme } from 'vue-ex-ui';

const currentTheme = getTheme();
console.log(currentTheme); // 'neon-blue'
```

### toggleTheme(themes?)

在多个主题间循环切换。

- **参数**:
  - `themes?: Theme[]` - 可选的主题列表，默认在所有主题间切换
- **返回**: `void`

```typescript
import { toggleTheme } from 'vue-ex-ui';

// 在所有主题间切换
toggleTheme();

// 只在指定主题间切换
toggleTheme(['neon-blue', 'dark']);
```

### onThemeChange(callback)

监听主题变化。

- **参数**:
  - `callback: (theme: Theme) => void` - 主题变化时的回调函数
- **返回**: `() => void` - 取消监听的函数

```typescript
import { onThemeChange } from 'vue-ex-ui';

const unsubscribe = onThemeChange(theme => {
  console.log('新主题:', theme);
});

// 取消监听
unsubscribe();
```

### useTheme()

主题管理的组合式 API。

- **返回**:
  ```typescript
  {
    theme: Ref<Theme>
    setTheme: (theme: Theme) => void
    toggleTheme: (themes?: Theme[]) => void
  }
  ```

```typescript
import { useTheme } from 'vue-ex-ui';

const { theme, setTheme, toggleTheme } = useTheme();
```

### usePersistedTheme()

带持久化的主题管理。

- **返回**: 与 `useTheme()` 相同

```typescript
import { usePersistedTheme } from 'vue-ex-ui';

const { theme, setTheme } = usePersistedTheme();
```

### useSystemTheme()

根据系统偏好自动设置主题。

- **返回**: `() => void` - 清理函数

```typescript
import { useSystemTheme } from 'vue-ex-ui';

const cleanup = useSystemTheme();

// 清理监听器
cleanup();
```

## 最佳实践

### 1. 提供主题切换入口

在应用的导航栏或设置页面提供明显的主题切换入口，让用户可以轻松切换主题。

### 2. 记住用户选择

使用 `usePersistedTheme` 保存用户的主题偏好，提升用户体验。

### 3. 尊重系统偏好

对于首次访问的用户，使用 `useSystemTheme` 根据系统设置自动选择合适的主题。

### 4. 平滑过渡

主题切换时会自动应用 0.3s 的过渡动画，无需额外配置。如果需要禁用动画：

```vue
<ExConfigProvider :theme="theme" :animation="false">
  <App />
</ExConfigProvider>
```

### 5. 无障碍支持

为视力障碍用户提供高对比度主题选项，并确保主题切换器可以通过键盘操作。

### 6. 性能优化

- 使用关键 CSS 防止 FOUC
- 避免在主题切换时重新渲染整个应用
- 使用 CSS 变量而不是重新加载样式表

## 常见问题

### 主题切换后样式没有更新？

确保你的组件使用了 CSS 变量而不是硬编码的颜色值：

```scss
// ✅ 正确 - 使用 CSS 变量
.my-component {
  background: var(--ex-color-bg-primary);
  color: var(--ex-color-text-primary);
}

// ❌ 错误 - 硬编码颜色
.my-component {
  background: #0b0f14;
  color: #e6f0ff;
}
```

### 如何禁用主题切换动画？

在 ConfigProvider 中设置 `animation` 为 `false`：

```vue
<ExConfigProvider :theme="theme" :animation="false">
  <App />
</ExConfigProvider>
```

### 如何创建自定义主题？

目前 ExUI 支持 4 种预设主题。自定义主题功能正在开发中，敬请期待。

### 主题切换会影响性能吗？

不会。ExUI 的主题切换基于 CSS 变量，只需要更新 `data-theme` 属性，浏览器会自动应用新的样式，不会触发重新渲染。

<style scoped>
.theme-preview {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--ex-color-border-primary);
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
