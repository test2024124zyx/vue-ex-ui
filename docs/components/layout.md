# Layout 布局

用于页面整体布局的组件，提供 Header、Sider、Content、Footer 等子组件。

<script setup>
import { ref } from 'vue';

const collapsed = ref(false);
</script>

## 基础用法

最基本的页面布局结构。

<div class="demo-container">
  <ex-layout style="min-height: 300px;">
    <ex-header style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Header</ex-header>
    <ex-content style="background: var(--ex-color-bg-secondary); display: flex; align-items: center; justify-content: center;">Content</ex-content>
    <ex-footer style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Footer</ex-footer>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout>
    <ex-header>Header</ex-header>
    <ex-content>Content</ex-content>
    <ex-footer>Footer</ex-footer>
  </ex-layout>
</template>
```

## 带侧边栏

经典的侧边栏布局，侧边栏可以在左侧或右侧。

<div class="demo-container">
  <ex-layout has-sider style="min-height: 300px;">
    <ex-sider style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Sider</ex-sider>
    <ex-layout>
      <ex-header style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Header</ex-header>
      <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">Content</ex-content>
      <ex-footer style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Footer</ex-footer>
    </ex-layout>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout has-sider>
    <ex-sider>Sider</ex-sider>
    <ex-layout>
      <ex-header>Header</ex-header>
      <ex-content>Content</ex-content>
      <ex-footer>Footer</ex-footer>
    </ex-layout>
  </ex-layout>
</template>
```

## 可收起侧边栏

侧边栏支持收起功能，适合需要更多内容空间的场景。

<div class="demo-container">
  <ex-layout has-sider style="min-height: 300px;">
    <ex-sider 
      v-model:collapsed="collapsed"
      :width="256"
      :collapsed-width="80"
      collapsible
      style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary);"
    >
      <div style="padding: 20px; text-align: center;">
        <p v-if="!collapsed">侧边栏内容</p>
        <p v-if="!collapsed" style="font-size: 12px; color: var(--ex-color-text-secondary);">点击底部按钮收起</p>
        <p v-else style="font-size: 12px;">☰</p>
      </div>
    </ex-sider>
    <ex-layout>
      <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">Content</ex-content>
    </ex-layout>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout has-sider>
    <ex-sider
      v-model:collapsed="collapsed"
      :width="256"
      :collapsed-width="80"
      collapsible
    >
      <div v-if="!collapsed">完整菜单</div>
      <div v-else>图标</div>
    </ex-sider>
    <ex-layout>
      <ex-header>Header</ex-header>
      <ex-content>Content</ex-content>
      <ex-footer>Footer</ex-footer>
    </ex-layout>
  </ex-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const collapsed = ref(false);
</script>
```

## 霓虹边框效果

为 Header、Sider、Footer 添加霓虹发光边框，增强游戏科技感。

<div class="demo-container">
  <ex-layout has-sider style="min-height: 300px;">
    <ex-sider neon-border style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Sider</ex-sider>
    <ex-layout>
      <ex-header neon-border style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Header</ex-header>
      <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">Content</ex-content>
      <ex-footer neon-border style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Footer</ex-footer>
    </ex-layout>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout has-sider>
    <ex-sider neon-border>Sider</ex-sider>
    <ex-layout>
      <ex-header neon-border>Header</ex-header>
      <ex-content>Content</ex-content>
      <ex-footer neon-border>Footer</ex-footer>
    </ex-layout>
  </ex-layout>
</template>
```

## 赛博朋克风格内容区

Content 组件支持背景网格和扫描线效果，营造赛博朋克氛围。

<div class="demo-container">
  <ex-layout style="min-height: 300px;">
    <ex-header style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Header</ex-header>
    <ex-content grid scanline style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
      <h3 style="margin: 0; color: var(--ex-color-primary);">游戏内容区</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">带有网格背景和扫描线效果</p>
    </ex-content>
    <ex-footer style="background: var(--ex-color-bg-secondary); color: var(--ex-color-text-primary); display: flex; align-items: center; justify-content: center;">Footer</ex-footer>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout>
    <ex-header>Header</ex-header>
    <ex-content grid scanline>
      <h1>游戏内容区</h1>
      <p>带有网格背景和扫描线效果</p>
    </ex-content>
    <ex-footer>Footer</ex-footer>
  </ex-layout>
</template>
```

## Header 插槽布局

Header 支持左中右三栏布局。

<div class="demo-container">
  <ex-layout style="min-height: 200px;">
    <ex-header style="background: var(--ex-color-bg-secondary);">
      <template #left>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: var(--ex-color-primary); border-radius: 4px;"></div>
          <span style="color: var(--ex-color-text-primary); font-weight: 600;">ExUI</span>
        </div>
      </template>
      <template #center>
        <nav style="display: flex; gap: 24px; color: var(--ex-color-text-secondary);">
          <a href="#" style="color: inherit; text-decoration: none;">首页</a>
          <a href="#" style="color: inherit; text-decoration: none;">组件</a>
          <a href="#" style="color: inherit; text-decoration: none;">文档</a>
        </nav>
      </template>
      <template #right>
        <ex-button type="primary" size="small">登录</ex-button>
      </template>
    </ex-header>
    <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">Content</ex-content>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout>
    <ex-header>
      <template #left>
        <img src="/logo.png" alt="Logo" />
        <span>ExUI</span>
      </template>
      
      <template #center>
        <nav>
          <a href="#">首页</a>
          <a href="#">组件</a>
          <a href="#">文档</a>
        </nav>
      </template>
      
      <template #right>
        <ex-button type="primary">登录</ex-button>
      </template>
    </ex-header>
    <ex-content>Content</ex-content>
  </ex-layout>
</template>
```

## 响应式断点

Sider 组件支持响应式断点，当屏幕宽度小于指定断点时自动收起侧边栏，并显示遮罩层。

<div class="demo-container">
  <ex-layout has-sider style="min-height: 300px;">
    <ex-sider 
      v-model:collapsed="collapsed"
      collapsible
      breakpoint="md"
      style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary);"
    >
      <div style="padding: 20px; text-align: center;">
        <p>侧边栏内容</p>
        <p style="font-size: 12px; color: var(--ex-color-text-secondary);">调整浏览器窗口大小试试</p>
      </div>
    </ex-sider>
    <ex-layout>
      <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <p>当屏幕宽度小于 992px 时</p>
          <p>侧边栏会自动收起并显示遮罩层</p>
        </div>
      </ex-content>
    </ex-layout>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout has-sider>
    <ex-sider
      v-model:collapsed="collapsed"
      collapsible
      breakpoint="md"
      @breakpoint="handleBreakpoint"
    >
      侧边栏内容
    </ex-sider>
    <ex-layout>
      <ex-content>Content</ex-content>
    </ex-layout>
  </ex-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const collapsed = ref(false);

const handleBreakpoint = (broken: boolean) => {
  console.log('断点触发:', broken);
};
</script>
```

### 断点说明

| 断点 | 说明 | 触发条件 |
| --- | --- | --- |
| xs | 超小屏幕 | 屏幕宽度 < 480px |
| sm | 小屏幕 | 屏幕宽度 < 768px |
| md | 中等屏幕 | 屏幕宽度 < 1024px |
| lg | 大屏幕 | 屏幕宽度 < 1280px |
| xl | 超大屏幕 | 屏幕宽度 < 1536px |
| 2xl | 极大屏幕 | 屏幕宽度 < 1920px |

## Container 容器

Container 组件用于限制内容宽度，提供响应式的容器布局。

<div class="demo-container">
  <ex-container style="background: var(--ex-color-bg-tertiary); padding: 20px; text-align: center;">
    <p style="color: var(--ex-color-text-primary);">响应式容器</p>
    <p style="color: var(--ex-color-text-secondary); font-size: 12px;">容器宽度会根据屏幕大小自动调整</p>
  </ex-container>
</div>

```vue
<template>
  <ex-container>
    <ex-layout>
      <ex-header>Header</ex-header>
      <ex-content>Content</ex-content>
      <ex-footer>Footer</ex-footer>
    </ex-layout>
  </ex-container>
</template>
```

### 流式容器

使用 `fluid` 属性创建 100% 宽度的容器。

<div class="demo-container">
  <ex-container fluid style="background: var(--ex-color-bg-tertiary); padding: 20px; text-align: center;">
    <p style="color: var(--ex-color-text-primary);">流式容器（100%宽度）</p>
  </ex-container>
</div>

```vue
<template>
  <ex-container fluid>
    <ex-layout>
      <!-- 内容会占满整个宽度 -->
    </ex-layout>
  </ex-container>
</template>
```

### 固定尺寸容器

使用 `size` 属性设置固定的容器尺寸。

<div class="demo-container">
  <ex-container size="md" style="background: var(--ex-color-bg-tertiary); padding: 20px; text-align: center;">
    <p style="color: var(--ex-color-text-primary);">中等尺寸容器 (max-width: 720px)</p>
  </ex-container>
</div>

```vue
<template>
  <!-- 小容器 -->
  <ex-container size="sm">
    <ex-layout>...</ex-layout>
  </ex-container>

  <!-- 中等容器 -->
  <ex-container size="md">
    <ex-layout>...</ex-layout>
  </ex-container>

  <!-- 大容器 -->
  <ex-container size="lg">
    <ex-layout>...</ex-layout>
  </ex-container>
</template>
```

### Container 尺寸对照表

| 尺寸 | 最大宽度 | 适用场景 |
| --- | --- | --- |
| sm | 448px | 窄内容，如登录表单 |
| md | 720px | 中等内容，如文章阅读 |
| lg | 960px | 标准内容，如后台管理 |
| xl | 1216px | 宽内容，如数据展示 |
| 2xl | 1472px | 超宽内容，如大屏应用 |

## 动画配置

Sider 组件支持自定义动画过渡时长。

<div class="demo-container">
  <ex-layout has-sider style="min-height: 300px;">
    <ex-sider 
      v-model:collapsed="collapsed"
      :transition-duration="500"
      collapsible
      style="background: var(--ex-color-bg-tertiary); color: var(--ex-color-text-primary);"
    >
      <div style="padding: 20px; text-align: center;">
        <p>慢速动画</p>
        <p style="font-size: 12px; color: var(--ex-color-text-secondary);">过渡时长: 500ms</p>
      </div>
    </ex-sider>
    <ex-layout>
      <ex-content style="background: var(--ex-color-bg-primary); display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <p>点击侧边栏底部按钮</p>
          <p style="font-size: 12px; color: var(--ex-color-text-secondary);">体验慢速动画效果</p>
        </div>
      </ex-content>
    </ex-layout>
  </ex-layout>
</div>

```vue
<template>
  <ex-layout has-sider>
    <!-- 快速动画 (200ms) -->
    <ex-sider :transition-duration="200" collapsible>
      Menu
    </ex-sider>

    <!-- 默认动画 (300ms) -->
    <ex-sider collapsible>
      Menu
    </ex-sider>

    <!-- 慢速动画 (500ms) -->
    <ex-sider :transition-duration="500" collapsible>
      Menu
    </ex-sider>

    <!-- 无动画 -->
    <ex-sider :transition-duration="0" collapsible>
      Menu
    </ex-sider>
  </ex-layout>
</template>
```

## 全局配置支持

Layout 组件支持通过 ConfigProvider 进行全局配置。

```vue
<template>
  <ex-config-provider :neon-effect="true" :animation="true">
    <ex-layout has-sider>
      <!-- 当 neon-effect 为 true 时，所有组件默认显示霓虹边框 -->
      <ex-sider>Sider</ex-sider>
      <ex-layout>
        <ex-header>Header</ex-header>
        <ex-content>Content</ex-content>
        <ex-footer>Footer</ex-footer>
      </ex-layout>
    </ex-layout>
  </ex-config-provider>
</template>
```

### 支持的全局配置

- **neon-effect**: 全局霓虹效果开关，当设置为 `true` 时，Header、Sider、Footer 默认显示霓虹边框
- **animation**: 全局动画开关，当设置为 `false` 时，禁用所有过渡动画
- **locale**: 国际化语言设置，支持 `zh-CN` 和 `en-US`

## 键盘导航

Sider 组件的触发器支持完整的键盘导航。

### 键盘快捷键

| 按键 | 功能 |
| --- | --- |
| Tab | 聚焦到触发器按钮 |
| Enter | 切换侧边栏收起状态 |
| Space | 切换侧边栏收起状态 |

## 无障碍支持

Layout 组件完全支持无障碍访问（WCAG 2.1 AA 标准）：

- ✅ 使用语义化 HTML 标签（`<header>`, `<aside>`, `<main>`, `<footer>`）
- ✅ 提供完整的 ARIA 属性（`role`, `aria-label`, `tabindex`）
- ✅ 支持键盘导航
- ✅ 支持屏幕阅读器
- ✅ 国际化的无障碍标签

## API

### Layout Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| has-sider | 是否包含侧边栏 | boolean | false |
| direction | 布局方向 | 'horizontal' / 'vertical' | 'vertical' |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Layout Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

### Header Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| height | 高度 | string / number | 64 |
| fixed | 是否固定定位 | boolean | false |
| neon-border | 是否显示霓虹边框（未设置时使用全局配置） | boolean | undefined |
| blur | 是否显示背景模糊 | boolean | false |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Header Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 头部内容（当没有使用具名插槽时显示） |
| left | 左侧内容 |
| center | 中间内容 |
| right | 右侧内容 |

### Header Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

### Sider Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| width | 宽度 | string / number | 256 |
| collapsed-width | 收起时的宽度 | string / number | 80 |
| collapsed / v-model:collapsed | 是否收起 | boolean | false |
| collapsible | 是否可收起 | boolean | false |
| trigger | 触发器位置 | 'top' / 'bottom' / null | 'bottom' |
| position | 侧边栏位置 | 'left' / 'right' | 'left' |
| neon-border | 是否显示霓虹边框（未设置时使用全局配置） | boolean | undefined |
| blur | 是否显示背景模糊 | boolean | false |
| breakpoint | 响应式断点 | 'xs' / 'sm' / 'md' / 'lg' / 'xl' / '2xl' | — |
| transition-duration | 动画过渡时长（毫秒） | number | 300 |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Sider Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:collapsed | 收起状态变化 | (value: boolean) |
| collapse | 收起状态变化（兼容） | (collapsed: boolean, type: 'clickTrigger' / 'responsive') |
| breakpoint | 断点触发 | (broken: boolean) |

### Sider Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| default | 侧边栏内容 | — |
| trigger | 自定义触发器 | { collapsed: boolean } |

### Sider Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| toggle | 切换收起状态 | — | void |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

### Content Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| grid | 是否显示背景网格 | boolean | false |
| scanline | 是否显示扫描线效果 | boolean | false |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Content Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

### Footer Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| height | 高度 | string / number | 64 |
| fixed | 是否固定定位 | boolean | false |
| neon-border | 是否显示霓虹边框（未设置时使用全局配置） | boolean | undefined |
| blur | 是否显示背景模糊 | boolean | false |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Footer Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 底部内容（当没有使用具名插槽时显示） |
| left | 左侧内容 |
| center | 中间内容 |
| right | 右侧内容 |

### Footer Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

### Container Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fluid | 是否为流式容器（100%宽度） | boolean | false |
| size | 固定尺寸 | 'sm' / 'md' / 'lg' / 'xl' / '2xl' | — |
| class | 自定义类名 | string / string[] / object | — |
| style | 自定义样式 | CSSProperties / string | — |

### Container Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| getElement | 获取 DOM 元素 | — | HTMLElement \| null |

## 性能优化

Layout 组件已进行多项性能优化：

### 1. 响应式断点防抖

Sider 组件的响应式断点监听使用了 150ms 防抖，避免窗口调整时频繁触发：

```typescript
// 自动防抖优化，无需手动配置
<ex-sider breakpoint="md" collapsible>
  Menu
</ex-sider>
```

### 2. 事件监听器自动清理

所有事件监听器在组件卸载时自动清理，防止内存泄漏。

### 3. 计算属性缓存

使用 Vue 的 computed 缓存计算结果，避免不必要的重复计算。

### 4. CSS 变量动画

使用 CSS 变量控制动画时长，性能优于 JavaScript 动画：

```scss
transition: all var(--ex-sider-transition-duration, 300ms);
```

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
}

.demo-container .ex-layout {
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
  overflow: hidden;
}
</style>
