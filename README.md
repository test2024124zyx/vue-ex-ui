# vue-ex-ui
一个由gemini【负责修复语法报错】,chatgpt【负责总体设计架构】,claude-code【负责编写主要代码】多个大模型进行开发的vue3 ts ui组件库，使用遇到问题可以在这个仓库提issue
<div align="center">

# 🎮 ExUI - Vue3 Cyberpunk UI Component Library

<img src="https://img.shields.io/badge/Vue-3.4+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
<img src="https://img.shields.io/badge/TypeScript-5.9+-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Vite-7.1+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/SCSS-1.92+-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="SCSS">
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">

**移动端优先的响应式 Vue3 组件库 | 赛博朋克主题风格**

[📖 在线文档](https://vue-ex-ui.netlify.app) | [🎨 设计系统](https://vue-ex-ui.netlify.app/design) | [🚀 快速开始](https://vue-ex-ui.netlify.app/#快速开始) | [🎯 组件列表](https://vue-ex-ui.netlify.app/#组件总览)

</div>

---


## ✨ 设计理念

ExUI 是一个专为赛博朋克风格应用打造的 Vue3 组件库，灵感来源于赛博朋克美学和未来科技视觉。我们致力于创造：

### 🎯 核心特色

- **🌟 赛博朋克体验** - 深色主题配合霓虹蓝紫渐变，营造沉浸式未来科技氛围
- **📱 移动端优先** - 响应式设计，完美适配手机、平板、桌面端
- **⚡ 高性能** - 基于 Vue3 Composition API，轻量化设计，支持 Tree-shaking
- **🎨 现代科技感** - 流畅动画、发光效果、渐变边框、扫描线特效
- **🔧 开发友好** - 完整的 TypeScript 支持，类型安全
- **🌍 国际化** - 内置中英文支持，易于扩展
- **♿ 无障碍** - 遵循 WCAG 标准，支持键盘导航和屏幕阅读器
- **🎭 多主题** - 4 种内置主题，支持动态切换和自定义

### 🎨 视觉风格

```scss
// 主色调系统
--ex-color-primary: #29abe2; // 霓虹蓝
--ex-color-secondary: #a86bff; // 霓虹紫
--ex-color-accent: #ff3bd1; // 强调粉

// 背景色系
--ex-color-bg-primary: #0b0f14; // 主背景
--ex-color-bg-secondary: #0f1720; // 次级背景
--ex-color-bg-tertiary: #1a2332; // 浮起背景

// 文本色系
--ex-color-text-primary: #e6f0ff; // 主文本
--ex-color-text-secondary: #8fa3b8; // 次级文本

// 渐变效果
--ex-gradient-primary: linear-gradient(135deg, #29abe2 0%, #a86bff 100%);
```

---

## 🚀 快速开始

### 安装

```bash
# npm
npm install vue-ex-ui

# yarn
yarn add vue-ex-ui

# pnpm
pnpm add vue-ex-ui
```

### 完整引入

```typescript
// main.ts
import { createApp } from 'vue';
import ExUI from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

const app = createApp(App);
app.use(ExUI);
app.mount('#app');
```

### 按需引入（推荐）

```typescript
// 只导入需要的组件，减小打包体积
import { ExButton, ExInput, message } from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

// 在组件中使用
export default {
  components: {
    ExButton,
    ExInput
  },
  methods: {
    handleClick() {
      message.success('操作成功！');
    }
  }
};
```

**使用 Composition API：**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ExButton, ExInput, message } from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

const value = ref('');

const handleSubmit = () => {
  message.success('提交成功！');
};
</script>

<template>
  <div>
    <ExInput v-model="value" placeholder="请输入" />
    <ExButton type="primary" @click="handleSubmit">提交</ExButton>
  </div>
</template>
```

> 💡 **提示：** 现代打包工具（Vite、Webpack 5+）会自动进行 Tree Shaking，只打包使用的组件。
> 
> 📖 查看 [按需加载文档](https://vue-ex-ui.netlify.app/guide/on-demand) 了解更多优化方案。

```vue
<!-- 组件使用示例 -->
<template>
  <div class="cyberpunk-app">
    <!-- 赛博朋克风格按钮 -->
    <ex-button type="primary" size="large" :loading="loading">启动系统</ex-button>

    <!-- 用户信息卡片 -->
    <ex-card class="user-stats" type="neon" hoverable>
      <ex-avatar :src="userAvatar" size="large" />
      <ex-badge :count="99" type="primary">
        <ex-icon>
          <img src="https://api.iconify.design/ri/trophy-line.svg" />
        </ex-icon>
      </ex-badge>
    </ex-card>

    <!-- 赛博朋克布局 -->
    <ex-layout has-sider>
      <ex-sider neon-border collapsible>
        <ex-menu>
          <ex-menu-item>控制中心</ex-menu-item>
          <ex-menu-item>数据面板</ex-menu-item>
        </ex-menu>
      </ex-sider>

      <ex-layout>
        <ex-header neon-border blur>
          <template #left>
            <img src="/logo.png" alt="Logo" />
          </template>
          <template #right>
            <ex-button type="primary">登录</ex-button>
          </template>
        </ex-header>

        <ex-content grid scanline>
          <h1>欢迎来到赛博世界</h1>
        </ex-content>

        <ex-footer neon-border>
          <template #center>© 2025 ExUI Cyberpunk</template>
        </ex-footer>
      </ex-layout>
    </ex-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
const playerAvatar = ref('/avatar.jpg');
</script>
```

---

## 📦 组件总览

### 🎯 开发进度跟踪

<details open>
<summary><strong>✅ 通用基础组件 (12/12) - 100%</strong></summary>

- [x] **Typography** - 排版文本组件
- [x] **Icon** - 图标组件 (基于 Iconify API)
- [x] **Button** - 按钮组件
- [x] **Badge** - 徽标计数组件
- [x] **Image** - 图片组件
- [x] **Link** - 链接组件
- [x] **Avatar** - 头像组件
- [x] **Divider** - 分割线组件
- [x] **Space** - 间距组件
- [x] **Card** - 卡片容器
- [x] **Ellipsis** - 文本省略组件
- [x] **Watermark** - 水印组件

</details>

<details open>
<summary><strong>✅ 表单类组件 (15/15) - 100%</strong></summary>

- [x] **Input** - 文本输入框
- [x] **NumberInput** - 数字输入框
- [x] **Select** - 下拉选择器
- [x] **Cascader** - 级联选择器
- [x] **Checkbox** - 复选框
- [x] **Radio** - 单选框
- [x] **Switch** - 开关
- [x] **Slider** - 滑块
- [x] **DateTimePicker** - 日期时间选择器
- [x] **Rate** - 评分组件
- [x] **FileUpload** - 文件上传
- [x] **FileDownload** - 文件下载
- [x] **FilePreview** - 文件预览
- [x] **ImageCrop** - 图片裁剪
- [x] **ImageCompress** - 图片压缩
- [x] **FileList** - 文件列表/资源管理
- [x] **Form** - 表单容器及验证

</details>

<details open>
<summary><strong>✅ 数据展示组件 (17/17) - 100%</strong></summary>

- [x] **Tag** - 标签/标记
- [x] **List** - 列表
- [x] **Empty** - 空状态提示
- [x] **VirtualList** - 虚拟列表
- [x] **Collapse** - 折叠面板
- [x] **Carousel** - 走马灯/幻灯片
- [x] **Timeline** - 时间线
- [x] **Progress** - 进度组件
- [x] **Calendar** - 日历视图（支持农历）
- [x] **Table** - 表格
- [x] **Tree** - 树形控件
- [x] **Code** - 代码高亮组件
- [x] **QRCode** - 二维码组件
- [x] **Barcode** - 条码组件（支持 9 种格式）
- [x] **Heatmap** - 热力图
- [x] **Skeleton** - 骨架屏

</details>

<details open>
<summary><strong>✅ 导航与布局组件 (11/11) - 100%</strong></summary>

- [x] **Layout** - 布局容器（Header/Sider/Content/Footer）
- [x] **Grid** - 栅格布局
- [x] **Flex** - 弹性布局容器
- [x] **Menu** - 导航菜单
- [x] **LoadingBar** - 加载条
- [x] **Tabs** - 选项卡
- [x] **Dropdown** - 下拉菜单
- [x] **Breadcrumb** - 面包屑导航
- [x] **Steps** - 步骤条
- [x] **Anchor** - 锚点/页面内导航
- [x] **Pagination** - 分页器

</details>

<details open>
<summary><strong>✅ 反馈与交互组件 (12/12) - 100%</strong></summary>

- [x] **Dialog** - 对话框
- [x] **Modal** - 模态对话框
- [x] **Drawer** - 抽屉/侧滑层
- [x] **Tooltip** - 文字提示
- [x] **Popover** - 气泡提示
- [x] **Popconfirm** - 气泡确认框
- [x] **Message** - 全局提示/通知条
- [x] **Notification** - 系统通知
- [x] **Loading** - 加载中/Spinner
- [x] **Alert** - 警告提示
- [x] **Affix** - 固定位置
- [x] **Panel** - 面板容器

</details>

<details>
<summary><strong>🔧 全局配置组件 (1/1) - 100%</strong></summary>

- [x] **ConfigProvider** - 全局化配置（主题、国际化、尺寸）

</details>

### 📊 总体进度

```
总计组件: 68 个
已完成: 68 ✅
完成度: 100% 🎉
```

### 🎨 主题系统

- ✅ **Neon Blue** - 霓虹蓝主题（默认）
- ✅ **Neon Pink** - 玫瑰粉主题
- ✅ **Dark** - GitHub Dark 风格
- ✅ **High Contrast** - 矩阵绿黑客风格
- ✅ 支持动态主题切换
- ✅ 支持系统主题跟随
- ✅ 支持主题持久化

---

## 🎨 设计系统

### 🌈 色彩系统

```scss
// 主题色彩
--ex-color-primary: #29abe2; // 霓虹蓝
--ex-color-secondary: #a86bff; // 霓虹紫
--ex-color-accent: #ff3bd1; // 强调色

// 背景色彩
--ex-color-bg-primary: #0b0f14; // 主背景
--ex-color-bg-secondary: #0f1720; // 次级背景
--ex-color-bg-tertiary: #1a2332; // 浮起背景

// 文本色彩
--ex-color-text-primary: #e6f0ff; // 主文本
--ex-color-text-secondary: #8fa3b8; // 次级文本
--ex-color-text-disabled: #4a5568; // 禁用文本

// 状态色彩
--ex-color-success: #52c41a; // 成功
--ex-color-warning: #faad14; // 警告
--ex-color-error: #ff4d4f; // 错误
--ex-color-info: #1890ff; // 信息

// 透明度变量（支持主题切换）
--ex-color-primary-alpha-10: rgba(主色, 0.1);
--ex-color-primary-alpha-20: rgba(主色, 0.2);
--ex-color-primary-alpha-30: rgba(主色, 0.3);
// ... 更多透明度级别
```

### 📏 间距系统

```scss
--ex-space-xs: 4px; // 极小间距
--ex-space-sm: 8px; // 小间距
--ex-space-md: 16px; // 中等间距
--ex-space-lg: 24px; // 大间距
--ex-space-xl: 32px; // 超大间距
--ex-space-xxl: 48px; // 巨大间距
```

### 🎭 动画系统

```scss
// 缓动函数
--ex-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ex-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ex-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

// 持续时间
--ex-duration-fast: 150ms;
--ex-duration-normal: 300ms;
--ex-duration-slow: 500ms;
```

### 🎯 主题切换

```typescript
import { setTheme, useTheme, usePersistedTheme } from 'vue-ex-ui';

// 手动切换主题
setTheme('neon-pink');

// 使用主题 Hook
const { theme, setTheme, toggleTheme } = useTheme();

// 持久化主题（自动保存到 localStorage）
const { theme } = usePersistedTheme();
```

---

## 📱 移动端优先

ExUI 采用移动端优先的响应式设计策略：

### 📐 断点系统

```scss
$breakpoints: (
  xs: 0px,
  // 手机竖屏 (< 576px)
  sm: 576px,
  // 手机横屏 (≥ 576px)
  md: 768px,
  // 平板竖屏 (≥ 768px)
  lg: 992px,
  // 平板横屏/小桌面 (≥ 992px)
  xl: 1200px,
  // 桌面 (≥ 1200px)
  xxl: 1400px, // 大桌面 (≥ 1400px)
);
```

### 🎯 移动端特性

- **触摸友好** - 44px 最小点击区域，符合人体工程学
- **手势支持** - 滑动、长按、双击等手势操作
- **性能优化** - 懒加载、虚拟滚动、按需加载
- **自适应布局** - 流式布局，自动适配屏幕尺寸
- **高清适配** - 支持 Retina 屏幕
- **离线支持** - PWA 兼容，可离线使用

### 📱 响应式示例

```vue
<template>
  <!-- 在移动端自动调整布局 -->
  <ex-layout has-sider>
    <ex-sider :collapsed="isMobile" :breakpoint="768" @breakpoint="handleBreakpoint">
      侧边栏内容
    </ex-sider>
    <ex-content>主要内容</ex-content>
  </ex-layout>
</template>

<script setup>
import { ref } from 'vue';

const isMobile = ref(window.innerWidth < 768);

const handleBreakpoint = broken => {
  isMobile.value = broken;
};
</script>
```

---

## 🛠️ 技术栈

| 技术                 | 版本  | 说明                     |
| -------------------- | ----- | ------------------------ |
| **Vue**              | 3.4+  | 渐进式 JavaScript 框架   |
| **TypeScript**       | 5.9+  | 类型安全的 JavaScript    |
| **Vite**             | 7.1+  | 下一代前端构建工具       |
| **SCSS**             | 1.92+ | CSS 预处理器             |
| **Iconify**          | API   | 图标解决方案（无需安装） |
| **Vitest**           | 3.2+  | 单元测试框架             |
| **VitePress**        | 1.6+  | 文档生成工具             |
| **Vue I18n**         | 11.1+ | 国际化支持               |
| **JsBarcode**        | 3.12+ | 条码生成库               |
| **QRCode**           | 1.5+  | 二维码生成库             |
| **Lunar JavaScript** | 1.7+  | 农历支持                 |

---

## 🌃 赛博朋克特性

### ✨ 视觉效果

- **霓虹发光** - 按钮、边框、卡片霓虹发光效果
- **渐变动画** - 流畅的颜色过渡和主题切换
- **扫描线** - 经典赛博朋克扫描线动画
- **网格背景** - 未来科技感网格背景
- **毛玻璃** - 现代模糊背景效果
- **动态主题** - 4 种赛博朋克主题实时切换

### 🎨 特色组件效果

```vue
<!-- 霓虹边框布局 -->
<ex-layout>
  <ex-header neon-border blur />
  <ex-content grid scanline />
  <ex-footer neon-border />
</ex-layout>

<!-- 赛博朋克风格条码 -->
<ex-barcode value="CYBER2077" type="neon" />

<!-- 霓虹卡片 -->
<ex-card type="neon" hoverable />

<!-- 渐变按钮 -->
<ex-button type="primary" gradient />
```

---

## 🌍 国际化支持

ExUI 内置中英文语言包，支持全局配置和局部覆盖。

```typescript
import { createApp } from 'vue';
import ExUI from 'vue-ex-ui';
import { zhCN, enUS } from 'vue-ex-ui/locale';

const app = createApp(App);

// 全局配置语言
app.use(ExUI, {
  locale: zhCN, // 或 enUS
});

// 或使用 ConfigProvider 局部配置
```

```vue
<template>
  <ex-config-provider :locale="locale">
    <your-app />
  </ex-config-provider>
</template>

<script setup>
import { ref } from 'vue';
import { zhCN, enUS } from 'vue-ex-ui/locale';

const locale = ref(zhCN);

const switchLanguage = () => {
  locale.value = locale.value === zhCN ? enUS : zhCN;
};
</script>
```

### 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 英文 (en-US)

### 自定义语言包

```typescript
import type { Locale } from 'vue-ex-ui';

const customLocale: Locale = {
  name: 'ja-JP',
  button: {
    confirm: '確認',
    cancel: 'キャンセル',
    // ...
  },
  // ...
};
```

---

## 🔧 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-org/vue-ex-ui.git
cd vue-ex-ui

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动文档服务器
pnpm docs:dev

# 构建组件库
pnpm build

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm typecheck

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

### 项目结构

```
vue-ex-ui/
├── src/                    # 源代码
│   ├── components/         # 组件目录
│   │   ├── button/        # 按钮组件
│   │   │   ├── ExButton.vue
│   │   │   ├── ExButton.scss
│   │   │   ├── types.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   └── ...
│   ├── composables/       # 组合式 API
│   ├── directives/        # 自定义指令
│   ├── locale/            # 国际化
│   ├── styles/            # 全局样式
│   │   ├── themes/        # 主题文件
│   │   └── index.scss
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   └── index.ts           # 入口文件
├── docs/                  # 文档
│   ├── .vitepress/        # VitePress 配置
│   ├── components/        # 组件文档
│   ├── design/            # 设计系统文档
│   └── guide/             # 指南文档
├── tests/                 # 测试文件
├── examples/              # 示例
└── public/                # 静态资源
```

### 组件开发规范

1. **命名规范** - 所有组件以 `Ex` 前缀命名，使用时以 `ex-` 前缀
2. **TypeScript** - 完整的类型定义，导出所有类型
3. **测试覆盖** - 每个组件必须有单元测试
4. **文档完善** - API 文档 + 使用示例 + 最佳实践
5. **无障碍** - ARIA 支持，键盘导航，语义化 HTML
6. **主题适配** - 使用 CSS 变量，支持所有主题
7. **国际化** - 所有文本通过 locale 配置
8. **响应式** - 移动端优先，适配所有屏幕尺寸

### 组件开发流程

```bash
# 1. 创建组件目录
mkdir -p src/components/my-component

# 2. 创建组件文件
# - MyComponent.vue (组件实现)
# - MyComponent.scss (样式)
# - types.ts (类型定义)
# - locale.ts (国际化)
# - index.ts (导出)
# - __tests__/MyComponent.test.ts (测试)

# 3. 在 src/index.ts 中导出组件

# 4. 创建文档 docs/components/my-component.md

# 5. 在 docs/.vitepress/config.ts 中添加菜单

# 6. 运行测试
pnpm test

# 7. 提交代码
git add .
git commit -m "feat: add MyComponent"
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 🐛 报告问题

- [提交 Bug](https://github.com/your-org/vue-ex-ui/issues/new?template=bug_report.md)
- [功能请求](https://github.com/your-org/vue-ex-ui/issues/new?template=feature_request.md)

### 💻 代码贡献

1. Fork 项目到你的 GitHub 账号
2. 克隆到本地：`git clone https://github.com/your-username/vue-ex-ui.git`
3. 创建特性分支：`git checkout -b feature/AmazingFeature`
4. 安装依赖：`pnpm install`
5. 进行开发和测试
6. 提交更改：`git commit -m 'feat: add some AmazingFeature'`
7. 推送到分支：`git push origin feature/AmazingFeature`
8. 开启 Pull Request

### 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

### ✅ Pull Request 检查清单

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 类型检查
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 遵循了组件开发规范

---

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源协议。

---

## 🙏 致谢

- **设计灵感** - 赛博朋克美学与未来科技视觉
- **图标支持** - [Iconify](https://iconify.design) - 10 万+ 开源图标
- **技术栈** - [Vue.js](https://vuejs.org) 生态系统
- **构建工具** - [Vite](https://vitejs.dev) - 极速开发体验
- **文档工具** - [VitePress](https://vitepress.dev) - 静态站点生成
- **测试框架** - [Vitest](https://vitest.dev) - 单元测试
- **条码生成** - [JsBarcode](https://github.com/lindell/JsBarcode)
- **二维码生成** - [QRCode](https://github.com/soldair/node-qrcode)
- **农历支持** - [Lunar JavaScript](https://github.com/6tail/lunar-javascript)

---

## 📊 项目统计

- **组件数量**: 68 个
- **测试覆盖**: 87+ 测试用例
- **主题数量**: 4 个内置主题
- **语言支持**: 中文、英文
- **文档页面**: 70+ 页
- **代码质量**: ESLint + TypeScript + Prettier
- **构建工具**: Vite 7.1+
- **包大小**: 轻量级，支持 Tree-shaking

---

## 🔗 相关链接

- [📖 在线文档](./docs)
- [🎨 设计系统](./docs/design)
- [🚀 快速开始](./docs/guide)
- [📦 NPM 包](https://www.npmjs.com/package/vue-ex-ui)
- [🐛 问题反馈](https://github.com/your-org/vue-ex-ui/issues)
- [💬 讨论区](https://github.com/your-org/vue-ex-ui/discussions)
- [📝 更新日志](./CHANGELOG.md)

---

## 🌟 特别感谢

感谢所有为 ExUI 做出贡献的开发者！

---

<div align="center">

**� 让我们一一起打造最酷的赛博朋克 UI 组件库！**

Made with ❤️ by ExUI Team

[⭐ Star](https://github.com/your-org/vue-ex-ui) | [🐛 Issues](https://github.com/your-org/vue-ex-ui/issues) | [💬 Discussions](https://github.com/your-org/vue-ex-ui/discussions)

</div>
