# 快速开始

## 安装

::: code-group

```bash [npm]
npm install vue-ex-ui
```

```bash [yarn]
yarn add vue-ex-ui
```

```bash [pnpm]
pnpm add vue-ex-ui
```

:::

## 完整引入

在 `main.ts` 中引入所有组件：

```typescript
import { createApp } from 'vue'
import ExUI from 'vue-ex-ui'
import 'vue-ex-ui/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ExUI)
app.mount('#app')
```

## 按需引入（推荐）

为了减小包体积，推荐只引入需要的组件：

### 方式一：全局注册

```typescript
import { createApp } from 'vue'
import { ExButton, ExInput, ExTable } from 'vue-ex-ui'
import 'vue-ex-ui/style.css'
import App from './App.vue'

const app = createApp(App)

// 全局注册组件
app.component('ExButton', ExButton)
app.component('ExInput', ExInput)
app.component('ExTable', ExTable)

app.mount('#app')
```

### 方式二：局部注册（推荐）

```vue
<script setup lang="ts">
import { ExButton, ExInput } from 'vue-ex-ui'
import 'vue-ex-ui/style.css'

const handleClick = () => {
  console.log('Button clicked')
}
</script>

<template>
  <div>
    <ExInput placeholder="请输入内容" />
    <ExButton type="primary" @click="handleClick">
      提交
    </ExButton>
  </div>
</template>
```

::: tip 提示
现代打包工具（Vite、Webpack 5+）会自动进行 Tree Shaking，只打包使用的组件。查看 [按需加载文档](./on-demand) 了解更多优化方案。
:::

## 使用组件

现在你可以在模板中使用ExUI组件了：

```vue
<template>
  <div class="app">
    <ex-typography variant="h1" class="title">
      🎮 欢迎使用 ExUI
    </ex-typography>
    
    <ex-typography variant="body1" class="description">
      专为赛博朋克风格应用打造的Vue3组件库
    </ex-typography>
    
    <ex-button type="primary" size="large">
      开始游戏
    </ex-button>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  text-align: center;
}

.title {
  margin-bottom: 16px;
}

.description {
  margin-bottom: 24px;
  opacity: 0.8;
}
</style>
```

## 全局配置

使用 `ExConfigProvider` 组件为应用提供全局配置：

```vue
<script setup lang="ts">
import { ExConfigProvider } from 'vue-ex-ui'
import zhCN from 'vue-ex-ui/locale/zh-CN'
import 'vue-ex-ui/style.css'
</script>

<template>
  <ExConfigProvider 
    theme="neon-blue" 
    :locale="zhCN"
    size="medium"
    :neon-effect="true"
    :animation="true"
  >
    <App />
  </ExConfigProvider>
</template>
```

### 配置选项

- `theme`: 主题 (`'neon-blue'` | `'neon-pink'` | `'dark'` | `'high-contrast'`)
- `locale`: 语言 (`'zh-CN'` | `'en-US'`)
- `size`: 全局组件尺寸 (`'small'` | `'medium'` | `'large'`)
- `neon-effect`: 是否启用霓虹效果 (默认 `true`)
- `animation`: 是否启用动画 (默认 `true`)
- `namespace`: CSS 类名前缀 (默认 `'ex'`)
- `z-index`: z-index 基础值 (默认 `1000`)

查看 [ConfigProvider 文档](/components/config-provider) 了解更多配置选项。

## 下一步

- 查看 [组件文档](/components/typography) 了解所有可用组件
- 学习 [主题定制](./theming) 来个性化你的应用
- 查看 [设计系统](../design/) 了解设计原则