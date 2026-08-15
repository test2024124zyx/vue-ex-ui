# Tree Shaking

ExUI 提供可静态分析的 ESM 根入口和组件子路径。是否真正移除未使用代码，取决于消费项目
使用的构建器、生产模式以及导入方式；仓库通过真实 Vite fixture 持续验证根命名导入。

## 推荐导入方式

### 根命名导入

根入口适合希望保留简洁 API 的应用。默认插件只在 `app.use(ExUI)` 时构造完整安装图，单独
命名导入不会执行全量组件安装。

```ts
import { ExButton, ExInput, message } from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

message.success('保存成功');
```

`style.css` 是完整样式，必须显式导入。只需要组件级 CSS 时，请改用下一种方式。

### 组件子路径（JS + CSS 按需）

每个组件子路径会注入该组件自身的 CSS；基础令牌、主题和 reset 通过 `base.css` 引入一次。

```ts
import 'vue-ex-ui/base.css';
import { ExButton } from 'vue-ex-ui/es/components/button';
import { ExInput } from 'vue-ex-ui/es/components/input';
```

非组件入口使用明确的导出映射：

```ts
import { useTheme } from 'vue-ex-ui/es/composables/useTheme';
import { createLocaleProvider } from 'vue-ex-ui/es/locale';
import { deepClone } from 'vue-ex-ui/es/utils';
```

不存在样式源码 SCSS 或组件内部 SCSS 的公开入口。发布包只承诺 `package.json#exports`
中列出的 CSS 与 ESM 路径。

## 全量安装

需要全局注册全部组件时，才使用默认插件和完整样式：

```ts
import { createApp } from 'vue';
import ExUI from 'vue-ex-ui';
import 'vue-ex-ui/style.css';
import App from './App.vue';

createApp(App).use(ExUI).mount('#app');
```

不要从默认插件对象解构组件或服务；这些能力均是根入口的命名导出。

## 路由懒加载

大型页面可在路由边界延迟加载，并在懒加载模块内使用组件子路径：

```ts
import { defineAsyncComponent } from 'vue';

const AsyncTable = defineAsyncComponent(() =>
  import('vue-ex-ui/es/components/table').then(module => module.ExTable)
);
```

## Vite 配置

Vite 生产构建默认执行 Tree Shaking，无需为 ExUI 添加 `manualChunks`。强制把整个
`vue-ex-ui` 放入单一公共 chunk 会掩盖按需结果，只有在实际缓存分析证明有收益时再配置。

```ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'esbuild',
  },
});
```

## 仓库中的可复现验证

运行以下门禁：

```bash
npm run verify:tree-shaking
```

该 fixture 从根入口只命名导入 `ExButton`，使用 Vite 的 `write: false` 真实打包，并验证：

- 只产生一个组件样式资产；
- 输出不包含 `ExTable`、`ExSelect`、全量安装图或应用级全局样式标记；
- JS 和 CSS 分别受明确字节上限约束。

门禁约束用于发现回归，不是对任意业务应用体积的承诺。业务包还会受到 Vue、业务代码、
压缩器、source map 和浏览器目标影响，应在最终应用中使用构建分析器复核。

## 常见问题

### 为什么只导入一个组件仍出现完整样式？

检查是否显式导入了 `vue-ex-ui/style.css`。要让 CSS 也按需，请只引入一次
`vue-ex-ui/base.css`，组件改从 `vue-ex-ui/es/components/*` 导入。

### 为什么可选依赖出现在包中？

确认实际使用的组件。Chart、QRCode、Barcode 和农历能力会在相应组件执行时动态加载其
可选 peer 依赖；如果分析结果仍异常，请检查业务代码是否全量安装了默认插件。

### 如何验证发布包而不是源码别名？

```bash
npm run build
npm run verify:package
```

包验证器会创建真实 npm tarball，安装到临时消费者项目，并分别执行 TypeScript、Vite、
ESM 与 CommonJS 消费验证。
