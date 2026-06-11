# 按需加载

ExUI 支持两种导入方式：全局导入和按需导入。按需导入可以有效减少打包体积，推荐在生产环境使用。

## 全局导入

全局导入会引入所有组件和样式，适合快速开发和原型设计。

```typescript
// main.ts
import { createApp } from 'vue'
import ExUI from 'vue-ex-ui'
import 'vue-ex-ui/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ExUI)
app.mount('#app')
```

**优点：**
- 使用简单，一次性引入所有组件
- 适合快速开发和原型设计

**缺点：**
- 打包体积较大（约 1MB gzipped）
- 包含未使用的组件代码

## 按需导入（推荐）

按需导入只引入使用的组件，可以有效减少打包体积。

### 方式一：从主包按需导入

这是最简单的按需导入方式，从主包中导入需要的组件。

```typescript
// 在组件文件中
import { ExButton, ExInput, ExMessage } from 'vue-ex-ui'
import 'vue-ex-ui/style.css' // 仍需引入全部样式

export default {
  components: {
    ExButton,
    ExInput
  },
  methods: {
    handleClick() {
      ExMessage.success('操作成功！')
    }
  }
}
```

**使用 Composition API：**

```vue
<script setup lang="ts">
import { ExButton, ExInput, message } from 'vue-ex-ui'
import 'vue-ex-ui/style.css'

const handleClick = () => {
  message.success('操作成功！')
}
</script>

<template>
  <div>
    <ExInput v-model="value" placeholder="请输入" />
    <ExButton type="primary" @click="handleClick">提交</ExButton>
  </div>
</template>
```

**优点：**
- 代码简洁，易于使用
- 现代打包工具（Vite、Webpack 5）会自动进行 Tree Shaking
- 只打包使用的组件代码

**缺点：**
- 仍需引入全部样式文件

### 方式二：使用子路径导入（最小体积）

通过子路径导入可以实现最小的打包体积，包括样式也可以按需引入。

```typescript
// 导入单个组件
import ExButton from 'vue-ex-ui/es/components/button'
import ExInput from 'vue-ex-ui/es/components/input'

// 导入工具函数
import { message } from 'vue-ex-ui/es/components/message'

// 按需引入样式（可选）
import 'vue-ex-ui/es/components/button/ExButton.scss'
import 'vue-ex-ui/es/components/input/ExInput.scss'
```

**完整示例：**

```vue
<script setup lang="ts">
// 导入组件
import ExButton from 'vue-ex-ui/es/components/button'
import ExInput from 'vue-ex-ui/es/components/input'
import { message } from 'vue-ex-ui/es/components/message'

// 导入样式
import 'vue-ex-ui/es/components/button/ExButton.scss'
import 'vue-ex-ui/es/components/input/ExInput.scss'
import 'vue-ex-ui/es/components/message/ExMessage.scss'

// 导入基础样式（必需）
import 'vue-ex-ui/es/styles/base.scss'

const value = ref('')

const handleSubmit = () => {
  message.success('提交成功！')
}
</script>

<template>
  <div>
    <ExInput v-model="value" placeholder="请输入内容" />
    <ExButton type="primary" @click="handleSubmit">提交</ExButton>
  </div>
</template>
```

**优点：**
- 打包体积最小
- 样式也可以按需引入
- 完全控制引入的内容

**缺点：**
- 导入路径较长
- 需要手动管理样式依赖

### 方式三：使用 unplugin-vue-components（自动按需导入）

使用 `unplugin-vue-components` 插件可以实现自动按需导入，无需手动 import。

**1. 安装插件：**

::: code-group

```bash [npm]
npm install -D unplugin-vue-components
```

```bash [yarn]
yarn add -D unplugin-vue-components
```

```bash [pnpm]
pnpm add -D unplugin-vue-components
```

:::

**2. 配置 Vite：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        // ExUI 组件解析器
        (componentName) => {
          if (componentName.startsWith('Ex')) {
            return {
              name: componentName,
              from: 'vue-ex-ui'
            }
          }
        }
      ]
    })
  ]
})
```

**3. 直接在模板中使用，无需 import：**

```vue
<script setup lang="ts">
// 无需 import，直接使用
const handleClick = () => {
  console.log('clicked')
}
</script>

<template>
  <div>
    <!-- 组件会自动按需导入 -->
    <ExButton type="primary" @click="handleClick">
      点击我
    </ExButton>
    <ExInput placeholder="请输入" />
  </div>
</template>
```

**注意：** 仍需在 `main.ts` 中引入样式：

```typescript
import 'vue-ex-ui/style.css'
```

## 导入工具函数和 Composables

ExUI 还提供了工具函数和组合式 API，也支持按需导入。

### 导入工具函数

```typescript
// 从主包导入
import { debounce, throttle, generateId } from 'vue-ex-ui'

// 或从子路径导入
import { debounce, throttle } from 'vue-ex-ui/utils'
```

### 导入 Composables

```typescript
// 导入主题相关
import { useTheme, setTheme } from 'vue-ex-ui'

// 或从子路径导入
import { useTheme } from 'vue-ex-ui/composables'
```

### 导入国际化

```typescript
// 导入语言包
import zhCN from 'vue-ex-ui/locale/zh-CN'
import enUS from 'vue-ex-ui/locale/en-US'

// 使用
import { ExConfigProvider } from 'vue-ex-ui'

<ExConfigProvider :locale="zhCN">
  <App />
</ExConfigProvider>
```

## 打包体积对比

| 导入方式 | 打包体积（gzipped） | 适用场景 |
|---------|-------------------|---------|
| 全局导入 | ~230 KB | 快速开发、原型设计 |
| 按需导入（方式一） | ~50-100 KB | 生产环境（推荐） |
| 子路径导入（方式二） | ~30-80 KB | 对体积要求极高的场景 |
| 自动按需导入（方式三） | ~50-100 KB | 追求开发体验 |

## 最佳实践

### 开发环境

使用全局导入或自动按需导入，提高开发效率：

```typescript
// main.ts
import ExUI from 'vue-ex-ui'
import 'vue-ex-ui/style.css'

app.use(ExUI)
```

### 生产环境

使用按需导入，减小打包体积：

```typescript
// 只导入使用的组件
import { ExButton, ExInput, ExTable } from 'vue-ex-ui'
import 'vue-ex-ui/style.css'
```

### TypeScript 支持

所有导入方式都完全支持 TypeScript：

```typescript
import type { ExButtonProps, MessageOptions } from 'vue-ex-ui'
import { ExButton, message } from 'vue-ex-ui'

const buttonProps: ExButtonProps = {
  type: 'primary',
  size: 'large'
}

const messageOptions: MessageOptions = {
  message: '操作成功',
  type: 'success',
  duration: 3000
}

message(messageOptions)
```

## 常见问题

### Q: 为什么按需导入后打包体积还是很大？

A: 请确保：
1. 使用的是现代打包工具（Vite 或 Webpack 5+）
2. 打包工具已启用 Tree Shaking
3. `package.json` 中 `sideEffects` 设置正确
4. 检查是否意外引入了全部样式

### Q: 如何只引入需要的样式？

A: 使用子路径导入方式（方式二），手动引入每个组件的样式文件。

### Q: unplugin-vue-components 不工作？

A: 请确保：
1. 插件版本兼容
2. 配置正确
3. 重启开发服务器
4. 检查组件名称是否以 `Ex` 开头

## 下一步

- 查看 [快速开始](./quickstart) 了解基础用法
- 查看 [主题定制](./theming) 学习如何定制主题
- 查看 [组件文档](/components/) 了解所有可用组件