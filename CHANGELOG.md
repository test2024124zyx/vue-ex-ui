# 更新日志 (Changelog)

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布] (Unreleased)

### 新增 (Added)

- **Select 远程搜索**：新增 `remote` / `remote-method` / `loading` / `remote-debounce`。
  开启后输入防抖触发回调由父级拉取选项，关闭本地过滤，并提供加载态展示。

- **切角设计语言（chamfer）**：新增 `--ex-chamfer-sm/md/lg` 令牌与 `chamfer()` /
  `chamfer-glow()` 两个 SCSS mixin（斜切「左上 + 右下」两角，赛博朋克标志性轮廓；
  发光改用 `filter: drop-shadow` 以贴合 clip-path 形状）。已默认应用于按钮（默认形状）、
  标签、弹窗（Dialog/Modal 面板）与 Alert 等标志性「填充面」组件。
  > 说明：切角刻意不铺到全部组件——输入框/下拉/表格/提示等以 box-shadow 立体感与
  > 圆角可读性为主，统一切角会裁掉阴影、留下无边的斜切并损害易读性。需要时可在自定义
  > 样式中 `@include chamfer()` 自行扩展。
- **明亮主题（light）**：新增白底深字的 `light` 主题，霓虹发光收敛为中性柔和投影，
  品牌色/状态色改用深饱和值以保证白底上文字对比度达 WCAG AA；填充按钮在该主题下
  自动改用白色墨色。通过 `ExConfigProvider :theme="'light'"`、`setTheme('light')`
  或 `data-theme="light"` 启用。适合后台/文档等场景。
- **组件级按需（CSS 也按需）**：新增保留目录结构的 ESM 产物 `vue-ex-ui/es/*` 与
  子路径导出。每个组件 JS 自动 `import` 自己的 scoped CSS，配合入口处一次性引入的
  `vue-ex-ui/base.css`（全局令牌/主题/reset），即可做到「导入一个组件 = 只加载该
  组件的 JS 与 CSS」，不再被迫加载整包 `style.css`。原 `vue-ex-ui` + `style.css`
  的整包用法保持不变。
- **Table 行选择**：新增 `selectable` 选择列，支持 `v-model:selectedRowKeys`、
  多选（checkbox，含表头全选/半选）与单选（radio）、`is-row-selectable` 禁用指定行，
  并提供 `selection-change` / `select` / `select-all` 事件与
  `clearSelection` / `toggleRowSelection` / `toggleAllSelection` 方法。
- **Select 多选**：新增 `multiple`，绑定值为数组，选中项以可移除标签展示；
  支持 `multiple-limit` 上限、`collapse-tags` 折叠为 `+N`、多选 + 搜索组合，
  并新增 `remove-tag` 事件。

### 重大变更 (Breaking Changes)

- **通用工具类移出默认产物**：无前缀的颜色/间距/排版/特效/布局工具类（如 `.bg-error`、
  `.text-primary`、`.animate-spin`、`.glow-blue`、`.flex`、`.m-2`）会与 Tailwind 等
  原子化框架的同名类冲突，且组件本身并不依赖它们，因此默认 `style.css` 不再包含。
  组件的视觉表现不受影响。
- **全局样式不再侵入宿主页面**：默认样式不再给 `body` 设置背景渐变、`overflow-x: hidden`、
  `scroll-behavior`，也不再注入全屏 `body::before` 光晕遮罩与全局 `::selection`。
  赛博朋克氛围背景改为可选——给根元素加 `ex-app` 类即可启用。这样组件库可被
  渐进式引入到既有项目。
- CommonJS 产物文件名由 `ex-ui.umd.cjs` 更正为 `ex-ui.cjs`（产物本就是 CJS 而非 UMD）。

### 重构 (Refactor)

- **`high-contrast` 主题更名为 `matrix`**：原「矩阵绿黑客风」高对比主题正式名改为
  `matrix`。`high-contrast` 保留为**兼容别名**（`data-theme`、`setTheme`、`THEME_CONFIGS`
  仍可用），不破坏既有用法；`high-contrast` 名称保留给未来「真正的无障碍高对比主题」。
- **抽出 `normalizeCustomClass`**：把 45 个组件里重复粘贴的 `class`（字符串/数组/对象）
  归一化逻辑收敛为单一组合式函数，消除模板代码重复。
- **Modal / Dialog 共用浮层内核**：抽出 `useOverlay` 组合式函数，统一两者的滚动锁定、
  自动聚焦、Tab 焦点陷阱、Esc 关闭、焦点归还与卸载清理逻辑，消除组件间的重复实现。
  `ExModal` 与 `ExDialog` 的公开 API 保持不变；并为此前缺测试的 `ExDialog` 补充了
  打开/关闭/Esc/守卫等用例。

### 修复 (Fixed)

- **统一色板（彻底）**：删除 `_tokens.scss` 中与运行时主题不一致的旧霓虹色板
  （`#00f0ff` / `#ff007f`），全部对齐默认主题（`#29abe2` / `#ff3bd1` / `#a86bff`）。
  并进一步把 ~15 个组件 SCSS 中约 110 处**硬编码颜色**（旧霓虹 rgba、白色高光、
  状态色、badge/alert 渐变 hex）迁移为 `rgba(var(--ex-color-*-rgb), a)` / 语义变量，
  使其随主题自适应——这也让 **light 主题真正可用**（此前这些硬编码会在白底上渲染出
  发虚的蓝光晕、不可见的白高光与旧调色板错色）。新增各色族 `--ex-color-*-rgb` 通道变量。
- **对比度达标 WCAG AA**：主按钮渐变加深以让白字达标；成功/警告/危险/信息等
  语义按钮改用深色文字（霓虹「灯管」式），全部满足 4.5:1。
- **可选依赖真正可选**：`echarts`、`lunar-javascript` 改为运行时动态 `import()`，
  不再作为顶层静态依赖被打进产物——未使用 `ExChart`/`ExCalendar` 农历的用户
  即使未安装这些库也不会在 dev 阶段报错。
- 统一圆角语言：交互元件（按钮/输入/选择器/标签）、容器（卡片）、浮层（弹窗/抽屉）
  分三档，消除「按钮 0px、输入框 8px、弹窗 12px」的割裂。
- 按钮 hover 不再整体上浮（`translateY`），次级按钮默认熄灭发光，落实「发光预算」。

### 文档 (Docs)

- 更正 `optional-dependencies.md` 中关于「未安装可选依赖也不会构建失败」的失实描述。
- 移除 README 中并未实现的「扫描线特效」宣传，修正与代码不符的色值。
- 移除组件文档中残留的 iconify 远程图标引用（图标已全部内置 SVG）。

### 测试 (Tests)

- 为此前缺少测试的组件补充用例：`ExEmpty`、`ExBreadcrumb`、`ExPagination`、
  `ExCollapse`、`ExSteps`、`ExTimeline`、`ExPanel`（共 35 个用例），并新增 Select
  远程搜索用例。全量测试 1267 通过。

### 工程 (Chore)

- 新增 GitHub Actions CI（lint + typecheck + test + build + docs build）。
- 新增 `.gitattributes` 统一换行符为 LF，消除 Windows 下的 CRLF 噪音。

---

## [1.0.1] - 2026-08-15

### 修复 (Fixed)

- 修复 Notification 回调重复触发、批量关闭遗漏回调，以及 VNode 内容、偏移量和层级未兑现的问题。
- 修复浮层焦点管理、滚动锁定、服务生命周期和 z-index 继承在嵌套场景下的失配。
- 加固图片、下载、预览、二维码、条码和水印资源处理的大小、URL、生命周期与错误边界。
- 补齐公共类型导出、Locale 深层键校验、可选依赖加载和组件按需产物的消费契约。

### 工程 (Engineering)

- 恢复源码与测试类型门禁，补充交互、数据和服务边界测试，覆盖率分支达到 80% 以上。
- 清理全仓 Prettier 格式差异，确保类型检查、Lint、构建、文档构建和发布包校验一致通过。

---

## [0.3.6]

- 见 git 历史。
