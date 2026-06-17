# 主题 API 参考

完整的主题系统 API 文档。

## 类型定义

### Theme

主题名称类型。

```typescript
type Theme = 'neon-blue' | 'neon-pink' | 'dark' | 'high-contrast'
```

### ThemeConfig

主题配置接口。

```typescript
interface ThemeConfig {
  name: Theme
  displayName: string
  description?: string
  isDark: boolean
  isHighContrast: boolean
}
```

### ThemeVariables

主题变量接口，包含所有可用的 CSS 变量。

```typescript
interface ThemeVariables {
  '--ex-color-primary': string
  '--ex-color-secondary': string
  '--ex-color-bg-primary': string
  '--ex-color-text-primary': string
  // ... 更多变量
  [key: string]: string
}
```

## 函数 API

### setTheme

设置当前主题。

```typescript
function setTheme(theme: Theme): void
```

**示例**:

```typescript
import { setTheme } from 'vue-ex-ui'

setTheme('neon-pink')
```

### getTheme

获取当前主题。

```typescript
function getTheme(): Theme
```

**示例**:

```typescript
import { getTheme } from 'vue-ex-ui'

const current = getTheme()
console.log(current) // 'neon-blue'
```

### toggleTheme

在多个主题间循环切换。

```typescript
function toggleTheme(themes?: Theme[]): void
```

**参数**:
- `themes` - 可选的主题列表，默认在所有主题间切换

**示例**:

```typescript
import { toggleTheme } from 'vue-ex-ui'

// 在所有主题间切换
toggleTheme()

// 只在指定主题间切换
toggleTheme(['neon-blue', 'dark'])
```

### onThemeChange

监听主题变化。

```typescript
function onThemeChange(callback: (theme: Theme) => void): () => void
```

**参数**:
- `callback` - 主题变化时的回调函数

**返回**:
- 取消监听的函数

**示例**:

```typescript
import { onThemeChange } from 'vue-ex-ui'

const unsubscribe = onThemeChange((theme) => {
  console.log('主题已切换到:', theme)
})

// 取消监听
unsubscribe()
```

### saveThemeToStorage

保存主题到 localStorage。

```typescript
function saveThemeToStorage(theme: Theme): void
```

**示例**:

```typescript
import { saveThemeToStorage } from 'vue-ex-ui'

saveThemeToStorage('neon-pink')
```

### loadThemeFromStorage

从 localStorage 加载主题。

```typescript
function loadThemeFromStorage(): Theme | null
```

**返回**:
- 保存的主题名称，如果没有保存则返回 `null`

**示例**:

```typescript
import { loadThemeFromStorage } from 'vue-ex-ui'

const saved = loadThemeFromStorage()
if (saved) {
  console.log('加载保存的主题:', saved)
}
```

## Composable API

### useTheme

主题管理的组合式 API。

```typescript
function useTheme(): {
  theme: Ref<Theme>
  setTheme: (theme: Theme) => void
  toggleTheme: (themes?: Theme[]) => void
}
```

**返回**:
- `theme` - 当前主题的响应式引用
- `setTheme` - 设置主题的函数
- `toggleTheme` - 切换主题的函数

**示例**:

```vue
<script setup>
import { useTheme } from 'vue-ex-ui'

const { theme, setTheme, toggleTheme } = useTheme()
</script>

<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <ExButton @click="setTheme('neon-pink')">切换到霓虹粉</ExButton>
    <ExButton @click="toggleTheme()">循环切换</ExButton>
  </div>
</template>
```

### usePersistedTheme

带持久化的主题管理，自动保存到 localStorage。

```typescript
function usePersistedTheme(): {
  theme: Ref<Theme>
  setTheme: (theme: Theme) => void
  toggleTheme: (themes?: Theme[]) => void
}
```

**示例**:

```vue
<script setup>
import { usePersistedTheme } from 'vue-ex-ui'

// 自动从 localStorage 加载，切换时自动保存
const { theme, setTheme } = usePersistedTheme()
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

### useSystemTheme

根据系统偏好自动设置主题。

```typescript
function useSystemTheme(): () => void
```

**返回**:
- 清理函数，用于移除事件监听器

**示例**:

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSystemTheme, useTheme } from 'vue-ex-ui'

const { theme } = useTheme()
let cleanup

onMounted(() => {
  cleanup = useSystemTheme()
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<template>
  <ExConfigProvider :theme="theme">
    <App />
  </ExConfigProvider>
</template>
```

## 工具函数

### getThemeConfig

获取主题配置信息。

```typescript
function getThemeConfig(theme: Theme): ThemeConfig
```

**参数**:
- `theme: Theme` - 主题名称

**返回**:
- `ThemeConfig` - 主题配置对象

**示例**:

```typescript
import { getThemeConfig } from 'vue-ex-ui'

const config = getThemeConfig('neon-blue')
console.log(config.displayName) // 'Neon Blue'
console.log(config.isDark) // true
console.log(config.isHighContrast) // false
```

**注意**: 此函数已在 v1.0.0 中导出，可以直接使用。

### isDarkTheme

判断是否为暗色主题。

```typescript
function isDarkTheme(theme: Theme): boolean
```

**示例**:

```typescript
import { isDarkTheme } from 'vue-ex-ui'

console.log(isDarkTheme('neon-blue')) // true
console.log(isDarkTheme('dark')) // true
```

### isHighContrastTheme

判断是否为高对比度主题。

```typescript
function isHighContrastTheme(theme: Theme): boolean
```

**示例**:

```typescript
import { isHighContrastTheme } from 'vue-ex-ui'

console.log(isHighContrastTheme('high-contrast')) // true
console.log(isHighContrastTheme('neon-blue')) // false
```

## 事件

### ex-theme-change

主题切换时触发的自定义事件。

**事件详情**:

```typescript
interface ThemeChangeEvent {
  oldTheme: Theme
  newTheme: Theme
  timestamp: number
}
```

**监听示例**:

```typescript
document.addEventListener('ex-theme-change', (event) => {
  const { oldTheme, newTheme, timestamp } = event.detail
  console.log(`主题从 ${oldTheme} 切换到 ${newTheme}`)
  
  // 执行自定义逻辑
  analytics.track('theme_changed', { theme: newTheme })
})
```

## CSS 变量

所有主题都提供以下 CSS 变量，可以在自定义样式中使用：

### 主色调

```css
var(--ex-color-primary)
var(--ex-color-primary-hover)
var(--ex-color-primary-active)
var(--ex-color-secondary)
var(--ex-color-secondary-hover)
var(--ex-color-secondary-active)
var(--ex-color-accent)
```

### 背景色

```css
var(--ex-color-bg-primary)
var(--ex-color-bg-secondary)
var(--ex-color-bg-tertiary)
var(--ex-color-bg-elevated)
var(--ex-color-bg-hover)
var(--ex-color-bg-active)
```

### 文本色

```css
var(--ex-color-text-primary)
var(--ex-color-text-secondary)
var(--ex-color-text-tertiary)
var(--ex-color-text-disabled)
```

### 状态色

```css
var(--ex-color-success)
var(--ex-color-warning)
var(--ex-color-error)
var(--ex-color-info)
```

### 渐变

```css
var(--ex-gradient-primary)
var(--ex-gradient-secondary)
var(--ex-gradient-bg)
```

### 透明度变量

每种颜色都提供了多个透明度级别：

```css
var(--ex-color-primary-alpha-05)  /* 5% 透明度 */
var(--ex-color-primary-alpha-10)  /* 10% 透明度 */
var(--ex-color-primary-alpha-20)  /* 20% 透明度 */
var(--ex-color-primary-alpha-30)  /* 30% 透明度 */
var(--ex-color-primary-alpha-40)  /* 40% 透明度 */
var(--ex-color-primary-alpha-50)  /* 50% 透明度 */
var(--ex-color-primary-alpha-60)  /* 60% 透明度 */
var(--ex-color-primary-alpha-80)  /* 80% 透明度 */
```

## 完整示例

### 带主题切换的应用

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { 
  ExConfigProvider, 
  usePersistedTheme, 
  onThemeChange 
} from 'vue-ex-ui'
import 'vue-ex-ui/dist/style.css'

const { theme, setTheme } = usePersistedTheme()
const showThemeSwitcher = ref(false)

onMounted(() => {
  // 监听主题变化
  onThemeChange((newTheme) => {
    console.log('主题已切换:', newTheme)
    
    // 更新页面标题
    document.title = `ExUI - ${newTheme} 主题`
  })
})

const themes = [
  { value: 'neon-blue', label: '霓虹蓝' },
  { value: 'neon-pink', label: '霓虹粉' },
  { value: 'dark', label: '暗黑' },
  { value: 'high-contrast', label: '高对比度' },
]
</script>

<template>
  <ExConfigProvider 
    :theme="theme"
    locale="zh-CN"
    size="medium"
    :neon-effect="true"
    :animation="true"
  >
    <div class="app">
      <!-- 导航栏 -->
      <header class="app-header">
        <h1>ExUI Demo</h1>
        
        <!-- 主题切换器 -->
        <div class="theme-switcher">
          <ExButton @click="showThemeSwitcher = !showThemeSwitcher">
            🎨 切换主题
          </ExButton>
          
          <div v-if="showThemeSwitcher" class="theme-menu">
            <ExButton
              v-for="t in themes"
              :key="t.value"
              :type="theme === t.value ? 'primary' : 'secondary'"
              @click="setTheme(t.value); showThemeSwitcher = false"
            >
              {{ t.label }}
            </ExButton>
          </div>
        </div>
      </header>
      
      <!-- 应用内容 -->
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </ExConfigProvider>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--ex-color-bg-primary);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--ex-color-bg-secondary);
  border-bottom: 1px solid var(--ex-color-border-primary);
}

.theme-switcher {
  position: relative;
}

.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px;
  background: var(--ex-color-bg-elevated);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
  box-shadow: 0 8px 24px var(--ex-color-black-alpha-30);
}

.app-content {
  padding: 24px;
}
</style>
```

## 注意事项

1. **主题切换是全局的** - 一次只能应用一个主题
2. **自动保存** - 使用 `usePersistedTheme` 会自动保存用户选择
3. **性能优化** - 主题切换基于 CSS 变量，性能开销极小
4. **无障碍支持** - 所有主题都支持 `prefers-reduced-motion` 和 `prefers-contrast`
5. **SSR 兼容** - 主题系统完全支持服务端渲染
