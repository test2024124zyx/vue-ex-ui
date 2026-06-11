# LoadingBar 加载条

全局加载进度条，用于页面顶部显示加载进度。带有霓虹发光效果的赛博朋克主题加载条组件。

<script setup>
import { loadingBar } from '../../src/components/loading-bar/loading-bar'

const startLoading = () => {
  loadingBar.start()
}

const finishLoading = () => {
  loadingBar.finish()
}

const errorLoading = () => {
  loadingBar.error()
}

const updateLoading = (value) => {
  loadingBar.update(value)
}

const simulateLoading = () => {
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.update(30)
  }, 500)
  
  setTimeout(() => {
    loadingBar.update(60)
  }, 1000)
  
  setTimeout(() => {
    loadingBar.update(90)
  }, 1500)
  
  setTimeout(() => {
    loadingBar.finish()
  }, 2000)
}

const simulateError = () => {
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.update(50)
  }, 500)
  
  setTimeout(() => {
    loadingBar.error()
  }, 1000)
}

const customColor = () => {
  loadingBar.config({
    color: '#ff007f',
    height: 4
  })
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.finish()
  }, 2000)
}

const gradientColor = () => {
  loadingBar.config({
    color: (percentage) => {
      if (percentage < 30) return '#ef4444'
      if (percentage < 70) return '#f59e0b'
      return '#10b981'
    },
    height: 5
  })
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.finish()
  }, 3000)
}
</script>

## 基础用法

通过调用 `loadingBar.start()` 开始加载，`loadingBar.finish()` 完成加载。

<div class="demo-container">
  <ExButton type="primary" @click="startLoading">开始加载</ExButton>
  <ExButton type="success" @click="finishLoading">完成加载</ExButton>
  <ExButton type="danger" @click="errorLoading">加载失败</ExButton>
</div>

```vue
<script setup>
import { loadingBar } from 'vue-ex-ui'

const startLoading = () => {
  loadingBar.start()
}

const finishLoading = () => {
  loadingBar.finish()
}

const errorLoading = () => {
  loadingBar.error()
}
</script>

<template>
  <ExButton type="primary" @click="startLoading">开始加载</ExButton>
  <ExButton type="success" @click="finishLoading">完成加载</ExButton>
  <ExButton type="danger" @click="errorLoading">加载失败</ExButton>
</template>
```

## 更新进度

通过 `loadingBar.update(percentage)` 可以手动更新进度。

<div class="demo-container">
  <ExButton @click="() => updateLoading(0)">0%</ExButton>
  <ExButton @click="() => updateLoading(25)">25%</ExButton>
  <ExButton @click="() => updateLoading(50)">50%</ExButton>
  <ExButton @click="() => updateLoading(75)">75%</ExButton>
  <ExButton @click="() => updateLoading(100)">100%</ExButton>
</div>

```vue
<script setup>
import { loadingBar } from 'vue-ex-ui'

const updateLoading = (value) => {
  loadingBar.update(value)
}
</script>

<template>
  <ExButton @click="() => updateLoading(0)">0%</ExButton>
  <ExButton @click="() => updateLoading(50)">50%</ExButton>
  <ExButton @click="() => updateLoading(100)">100%</ExButton>
</template>
```

## 模拟加载过程

模拟一个完整的加载过程。

<div class="demo-container">
  <ExButton type="primary" @click="simulateLoading">模拟加载成功</ExButton>
  <ExButton type="danger" @click="simulateError">模拟加载失败</ExButton>
</div>

```vue
<script setup>
import { loadingBar } from 'vue-ex-ui'

const simulateLoading = () => {
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.update(30)
  }, 500)
  
  setTimeout(() => {
    loadingBar.update(60)
  }, 1000)
  
  setTimeout(() => {
    loadingBar.update(90)
  }, 1500)
  
  setTimeout(() => {
    loadingBar.finish()
  }, 2000)
}

const simulateError = () => {
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.update(50)
  }, 500)
  
  setTimeout(() => {
    loadingBar.error()
  }, 1000)
}
</script>

<template>
  <ExButton type="primary" @click="simulateLoading">模拟加载成功</ExButton>
  <ExButton type="danger" @click="simulateError">模拟加载失败</ExButton>
</template>
```

## 自定义配置

通过 `loadingBar.config()` 可以自定义加载条的样式。

<div class="demo-container">
  <ExButton type="primary" @click="customColor">自定义颜色</ExButton>
  <ExButton type="success" @click="gradientColor">渐变颜色</ExButton>
</div>

```vue
<script setup>
import { loadingBar } from 'vue-ex-ui'

const customColor = () => {
  loadingBar.config({
    color: '#ff007f',
    height: 4
  })
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.finish()
  }, 2000)
}

const gradientColor = () => {
  loadingBar.config({
    color: (percentage) => {
      if (percentage < 30) return '#ef4444'
      if (percentage < 70) return '#f59e0b'
      return '#10b981'
    },
    height: 5
  })
  loadingBar.start()
  
  setTimeout(() => {
    loadingBar.finish()
  }, 3000)
}
</script>

<template>
  <ExButton type="primary" @click="customColor">自定义颜色</ExButton>
  <ExButton type="success" @click="gradientColor">渐变颜色</ExButton>
</template>
```

## 路由集成

可以与 Vue Router 集成，在路由切换时显示加载条。

```typescript
import { createRouter } from 'vue-router'
import { loadingBar } from 'vue-ex-ui'

const router = createRouter({
  // ...
})

router.beforeEach((to, from, next) => {
  loadingBar.start()
  next()
})

router.afterEach(() => {
  loadingBar.finish()
})

router.onError(() => {
  loadingBar.error()
})

export default router
```

## API 请求集成

可以与 Axios 等 HTTP 库集成，在请求时显示加载条。

```typescript
import axios from 'axios'
import { loadingBar } from 'vue-ex-ui'

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    loadingBar.start()
    return config
  },
  (error) => {
    loadingBar.error()
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    loadingBar.finish()
    return response
  },
  (error) => {
    loadingBar.error()
    return Promise.reject(error)
  }
)
```

## API

### LoadingBar 方法

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `loadingBar.start` | 开始加载 | `() => void` |
| `loadingBar.finish` | 完成加载 | `() => void` |
| `loadingBar.error` | 加载失败 | `() => void` |
| `loadingBar.update` | 更新进度 | `(percentage: number) => void` |
| `loadingBar.config` | 配置加载条 | `(options: LoadingBarOptions) => void` |

### LoadingBarOptions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `color` | 进度条颜色 | `string \| ((percentage: number) => string)` | — |
| `height` | 进度条高度（像素） | `number` | `3` |
| `duration` | 动画持续时间（毫秒） | `number` | `3000` |
| `zIndex` | 层级 | `number` | `9999` |

## 全局配置

可以在 Vue 应用中全局使用：

```typescript
import { createApp } from 'vue'
import { loadingBar } from 'vue-ex-ui'
import App from './App.vue'

const app = createApp(App)

// 挂载到全局属性
app.config.globalProperties.$loadingBar = loadingBar

// 全局配置
loadingBar.config({
  color: '#00f0ff',
  height: 3,
  duration: 3000,
  zIndex: 9999
})

app.mount('#app')
```

然后在组件中使用：

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const loadingBar = instance?.appContext.config.globalProperties.$loadingBar

const startLoading = () => {
  loadingBar.start()
}
</script>
```

## 特性

- 🌃 赛博朋克主题设计，带有霓虹发光效果
- 🌈 支持自定义颜色和渐变色
- 📊 自动模拟进度增长
- 🎯 支持手动控制进度
- ⚡ 流畅的动画效果
- 🔧 灵活的配置选项
- 📱 响应式设计

## 主题定制

可以通过 CSS 变量自定义加载条样式：

```css
:root {
  --ex-loading-bar-color: linear-gradient(90deg, var(--ex-color-primary) 0%, var(--ex-color-secondary) 100%);
  --ex-loading-bar-shadow: 0 0 10px rgba(41, 171, 226, 0.6);
  --ex-loading-bar-height: 3px;
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
