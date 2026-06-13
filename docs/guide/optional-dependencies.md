# 可选依赖

ExUI 将体积较大的第三方库声明为**可选 peer 依赖**（`peerDependenciesMeta.optional`）。
安装 `vue-ex-ui` 时不会自动安装它们，只有在使用对应组件时才需要手动安装。

## 依赖一览

| 依赖               | 使用它的组件             | 安装命令                 |
| ------------------ | ------------------------ | ------------------------ |
| `echarts`          | `ExChart`                | `npm i echarts`          |
| `qrcode`           | `ExQRCode`               | `npm i qrcode`           |
| `jsbarcode`        | `ExBarcode`              | `npm i jsbarcode`        |
| `lunar-javascript` | `ExCalendar`（农历显示） | `npm i lunar-javascript` |
| `vue-i18n`         | 国际化（可选）           | `npm i vue-i18n`         |

## 工作原理

- 这些依赖在构建时被标记为 `external`，不会被打包进 `vue-ex-ui` 的产物。
- 它们在源码中均通过**运行时动态 `import()`** 按需加载（`echarts`、`qrcode`、
  `jsbarcode`、`lunar-javascript`、`vue-i18n` 皆是如此），**不存在顶层静态
  `import ... from '...'`**。这一点很关键：顶层静态导入会被 Vite 的依赖预扫描
  在 **dev 阶段**直接解析，未安装就报错；而动态 `import()` 只在真正用到对应
  组件、代码执行到那一行时才去解析。
- 因此，如果你的应用**没有使用**对应组件，Tree Shaking 会把该组件连同它的
  动态 `import()` 一起裁掉，**不安装这些依赖也不会导致构建或开发服务器失败**。
- 一旦你**实际使用**了对应组件（如挂载 `ExChart`），运行/构建时才会去解析
  `echarts`，此时若未安装会得到清晰的"模块未找到"报错——按上表安装即可。

## 关于 vue-i18n

`vue-i18n` 同样是可选的，且**默认根本不会被导入**：

- **未安装 / 未启用**时，组件库使用内置的轻量翻译实现（支持 `setLocale` 切换
  中英文、`{param}` 插值）。此时代码中不存在对 `vue-i18n` 的任何运行时引用。
- **已安装**并通过 `createLocaleProvider()` 初始化后，该函数会动态加载 `vue-i18n`，
  组件库内部的翻译随即自动代理到 vue-i18n，与你应用的其余文案统一管理。
- 也就是说：只有「主动调用 `createLocaleProvider()`」这一条路径会触碰 `vue-i18n`，
  其余所有用法都走内置实现。

## 图标说明

ExUI 的所有图标均为**内置 SVG**（见 `ExIcon` 的 `icon` 属性），
不依赖任何图标库或网络请求，无需额外安装。
