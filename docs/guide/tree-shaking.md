# Tree Shaking 优化指南

ExUI 完全支持 Tree Shaking，可以有效减少打包体积。本指南将帮助你配置项目以获得最佳的打包效果。

## 什么是 Tree Shaking？

Tree Shaking 是一种通过静态分析消除未使用代码的优化技术。当你只导入部分组件时，打包工具会自动移除未使用的代码。

## 前置条件

确保你的项目满足以下条件：

1. **使用 ES Module 格式**
   - 使用 `import/export` 而不是 `require/module.exports`
   - `package.json` 中设置 `"type": "module"`

2. **使用现代打包工具**
   - Vite 2.0+（推荐）
   - Webpack 5.0+
   - Rollup 2.0+

3. **生产模式构建**
   - 确保使用 `NODE_ENV=production`
   - 启用代码压缩

## Vite 配置

Vite 默认支持 Tree Shaking，无需额外配置。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Vite 默认启用 Tree Shaking
    minify: 'terser', // 或 'esbuild'
    rollupOptions: {
      output: {
        manualChunks: {
          // 可选：将 ExUI 单独打包
          'ex-ui': ['vue-ex-ui']
        }
      }
    }
  }
})
```

## Webpack 配置

Webpack 5 默认支持 Tree Shaking，但需要确保配置正确。

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // 必须是 production 模式
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true,    // 启用代码压缩
    sideEffects: true  // 使用 package.json 的 sideEffects 字段
  }
}
```

## 验证 Tree Shaking 效果

### 方法一：使用打包分析工具

**Vite：**

```bash
# 安装 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer

# 在 vite.config.ts 中添加
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

**Webpack：**

```bash
# 安装 webpack-bundle-analyzer
npm install -D webpack-bundle-analyzer

# 在 webpack.config.js 中添加
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

### 方法二：检查打包输出

构建后检查 `dist` 目录的文件大小：

```bash
npm run build

# 查看文件大小
ls -lh dist/
```

## 最佳实践

### 1. 使用命名导入

✅ **推荐：**

```typescript
import { ExButton, ExInput } from 'vue-ex-ui'
```

❌ **不推荐：**

```typescript
import ExUI from 'vue-ex-ui'
const { ExButton, ExInput } = ExUI
```

### 2. 避免导入整个库

✅ **推荐：**

```typescript
import { message } from 'vue-ex-ui'
message.success('成功')
```

❌ **不推荐：**

```typescript
import ExUI from 'vue-ex-ui'
ExUI.message.success('成功')
```

### 3. 按需导入样式

如果对体积要求极高，可以只导入使用的组件样式：

```typescript
// 导入基础样式（必需）
import 'vue-ex-ui/es/styles/base.scss'

// 只导入使用的组件样式
import 'vue-ex-ui/es/components/button/ExButton.scss'
import 'vue-ex-ui/es/components/input/ExInput.scss'
```

### 4. 使用动态导入

对于大型组件，可以使用动态导入：

```typescript
// 路由懒加载
const TableDemo = () => import('./views/TableDemo.vue')

// 组件懒加载
const ExTable = defineAsyncComponent(() => 
  import('vue-ex-ui').then(m => m.ExTable)
)
```

## 打包体积对比

以下是不同导入方式的打包体积对比（gzipped）：

| 导入方式 | 组件数量 | 打包体积 | 说明 |
|---------|---------|---------|------|
| 全局导入 | 68 个 | ~230 KB | 包含所有组件 |
| 按需导入 5 个组件 | 5 个 | ~50 KB | Button, Input, Table, Message, Dialog |
| 按需导入 10 个组件 | 10 个 | ~80 KB | 常用组件 |
| 按需导入 20 个组件 | 20 个 | ~120 KB | 大部分组件 |

## 常见问题

### Q: 为什么按需导入后体积还是很大？

可能的原因：

1. **样式文件全量引入**
   - 解决：使用子路径导入单个组件样式

2. **依赖项未优化**
   - 检查 `jsbarcode`、`qrcode` 等第三方库
   - 这些库只在使用相关组件时才会被打包

3. **打包工具配置问题**
   - 确保使用 production 模式
   - 检查 Tree Shaking 配置

### Q: 如何查看哪些代码被打包了？

使用打包分析工具：

```bash
# Vite
npm run build -- --mode analyze

# Webpack
npm run build -- --analyze
```

### Q: 某些组件无法 Tree Shake？

检查以下几点：

1. 组件是否有副作用（side effects）
2. 是否使用了动态导入
3. 是否正确使用了 ES Module 导入

## 性能优化建议

### 1. 代码分割

将 ExUI 组件分割到单独的 chunk：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ex-ui-base': ['vue-ex-ui/es/components/button', 'vue-ex-ui/es/components/input'],
          'ex-ui-data': ['vue-ex-ui/es/components/table', 'vue-ex-ui/es/components/list'],
          'ex-ui-feedback': ['vue-ex-ui/es/components/message', 'vue-ex-ui/es/components/dialog']
        }
      }
    }
  }
})
```

### 2. 使用 CDN

对于不常变化的组件库，可以使用 CDN：

```html
<!-- 在 index.html 中 -->
<link rel="stylesheet" href="https://unpkg.com/vue-ex-ui/dist/style.css">
<script src="https://unpkg.com/vue-ex-ui"></script>
```

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue-ex-ui'],
      output: {
        globals: {
          'vue-ex-ui': 'ExUI'
        }
      }
    }
  }
})
```

### 3. 预加载关键组件

对于首屏需要的组件，使用预加载：

```html
<link rel="modulepreload" href="/assets/ex-ui-base.js">
```

## 监控打包体积

在 CI/CD 中监控打包体积变化：

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite build --mode analyze",
    "size": "size-limit"
  },
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "250 KB"
    }
  ]
}
```

## 总结

通过正确配置 Tree Shaking，你可以：

- ✅ 减少 60-80% 的打包体积
- ✅ 提升应用加载速度
- ✅ 改善用户体验
- ✅ 降低带宽成本

记住：**只导入你需要的组件**，让打包工具自动优化其余部分。
