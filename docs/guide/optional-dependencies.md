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
- **已安装**并通过 `createLocaleProvider()` 初始化后，该函数会为**每个 Vue App**动态创建
  ExUI 私有的独立 vue-i18n composer，组件库内部翻译只代理到当前 App 的 composer。一个页面中的
  多个 App 不会覆盖彼此，也不会改写 `setLocale()` 使用的模块级轻量翻译状态。
- 也就是说：只有「主动调用 `createLocaleProvider()`」这一条路径会触碰 `vue-i18n`，
  其余所有用法都走内置实现。

`createLocaleProvider()` 会先同步提供轻量 composer，再异步增强为 vue-i18n composer；它
**不会异步调用 `app.use()`**，因此不会在 App 已挂载后修改插件图。应用自行安装的 vue-i18n
实例也不会被组件库隐式接管；如需覆盖组件库文案，请通过 `createLocaleProvider({ messages })`
传入覆盖内容。这个私有 composer 不能让宿主直接调用 `vue-i18n` 的 `useI18n()`；宿主业务需要
vue-i18n 时，仍须自行 `createI18n()`、`app.use(i18n)`，并让其 `locale` 与
`ExConfigProvider.locale` 读取同一个响应式状态。

## 图标说明

ExUI 的所有图标均为**内置 SVG**（见 `ExIcon` 的 `icon` 属性），
不依赖任何图标库或网络请求，无需额外安装。
