# 🎮 ExUI - Vue3 Cyberpunk UI Component Library

<img src="https://img.shields.io/badge/Vue-3.5+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
<img src="https://img.shields.io/badge/TypeScript-5.9+-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Vite-8.2+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/Sass-1.102+-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="Sass">
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">

**移动端优先的响应式 Vue3 组件库 | 赛博朋克主题风格**

[📖 在线文档](https://vue-ex-ui.netlify.app) | [🎨 设计系统](https://vue-ex-ui.netlify.app/design) | [🚀 快速开始](https://vue-ex-ui.netlify.app/#快速开始) | [🎯 组件列表](https://vue-ex-ui.netlify.app/#组件总览)

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
- **🎭 双主题** - 赛博暗色与赛博亮色两种内置主题，支持动态切换和自定义

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

> **📦 依赖说明**：以下依赖均为**可选 peer 依赖**，只有在使用对应组件时才需要安装：
>
> - `echarts` - 图表组件（ExChart）：`npm i echarts`
> - `qrcode` - 二维码组件（ExQRCode）：`npm i qrcode`
> - `jsbarcode` - 条码组件（ExBarcode）：`npm i jsbarcode`
> - `lunar-javascript` - 日历组件的农历支持（ExCalendar）：`npm i lunar-javascript`
> - `vue-i18n` - 国际化（不安装时组件库使用内置的轻量回退实现）
>
> 不使用这些组件时无需安装对应依赖，也不会被打包进你的应用。
> 所有图标均为内置 SVG，**无任何运行时网络请求**。

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
    ExInput,
  },
  methods: {
    handleClick() {
      message.success('操作成功！');
    },
  },
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
    <ExInput
      v-model="value"
      placeholder="请输入"
    />
    <ExButton
      type="primary"
      @click="handleSubmit"
    >
      提交
    </ExButton>
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
    <ex-button
      type="primary"
      size="large"
      :loading="loading"
    >
      启动系统
    </ex-button>

    <!-- 用户信息卡片 -->
    <ex-card
      class="user-stats"
      type="neon"
      hoverable
    >
      <ex-avatar
        :src="userAvatar"
        size="large"
      />
      <ex-badge
        :count="99"
        type="primary"
      >
        <!-- 内置图标：icon 属性引用注册表中的图标名 -->
        <ex-icon
          icon="star-fill"
          :size="20"
        />
      </ex-badge>
    </ex-card>

    <!-- 赛博朋克布局 -->
    <ex-layout has-sider>
      <ex-sider
        neon-border
        collapsible
      >
        <ex-menu>
          <ex-menu-item>控制中心</ex-menu-item>
          <ex-menu-item>数据面板</ex-menu-item>
        </ex-menu>
      </ex-sider>

      <ex-layout>
        <ex-header
          neon-border
          blur
        >
          <template #left>
            <img
              src="/logo.png"
              alt="Logo"
            />
          </template>
          <template #right>
            <ex-button type="primary">登录</ex-button>
          </template>
        </ex-header>

        <ex-content
          grid
          scanline
        >
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
<summary><strong>通用基础组件（12 个模块）</strong></summary>

- [x] **Typography** - 排版文本组件
- [x] **Icon** - 图标组件（内置 SVG 图标注册表，无网络依赖）
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
<summary><strong>表单类组件（15 个模块）</strong></summary>

- [x] **Input** - 文本输入框
- [x] **NumberInput** - 数字输入框
- [x] **Select** - 下拉选择器
- [x] **Cascader** - 级联选择器
- [x] **Checkbox** - 复选框
- [x] **Radio** - 单选框
- [x] **Switch** - 开关
- [x] **Slider** - 滑块
- [x] **DateTimePicker** - 日期时间选择器
- [x] **TimePicker** - 时间及时间范围选择器
- [x] **ColorPicker** - 颜色选择器
- [x] **TreeSelect** - 树选择器，支持异步加载和虚拟滚动
- [x] **VerificationCode** - 验证码输入
- [x] **Rate** - 评分组件
- [x] **Form** - 表单容器及验证

</details>

<details open>
<summary><strong>文件管理组件（6 个模块）</strong></summary>

- [x] **FileUpload** - 文件上传
- [x] **FileDownload** - 文件下载
- [x] **FilePreview** - 文件预览
- [x] **ImageCrop** - 图片裁剪
- [x] **ImageCompress** - 图片压缩
- [x] **FileList** - 文件列表/资源管理

</details>

<details open>
<summary><strong>数据展示组件（18 个模块）</strong></summary>

- [x] **Tag** - 标签/标记
- [x] **Descriptions** - 描述列表
- [x] **Chart** - 图表与数据导航
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
<summary><strong>导航与布局组件（13 个模块）</strong></summary>

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
- [x] **BackTop** - 回到顶部
- [x] **PageHeader** - 页头

</details>

<details open>
<summary><strong>反馈与交互组件（12 个模块）</strong></summary>

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
<summary><strong>全局配置（1 个模块）</strong></summary>

- [x] **ConfigProvider** - 全局化配置（主题、国际化、尺寸）

</details>

### 验证与组件统计

当前提供 77 个组件模块、100 个公开组件（包含附属组件）。日期选择统一由
`ExDateTimePicker` 提供，没有独立的 `ExDatePicker` 导出。

`npm run test:coverage` 同时检查整体和每个组件模块的语句、分支、函数、行覆盖率，
每项均要求至少 80%。`npm run test:browser` 在 Chromium、Firefox、WebKit 中验证
全部组件的双主题渲染，以及键盘、窄屏、异步选择和 tus 上传流程。
当前验证结果以 CI 和本地命令输出为准。

### 🎨 双主题系统

- ✅ **Cyber Dark (`neon-blue`)** - 赛博暗色主题（默认）
- ✅ **Cyber Light (`light`)** - 赛博亮色主题
- ✅ **Dark** - GitHub Dark 风格
- ✅ **可访问性增强** - 通过 `prefers-contrast` 和 `forced-colors` 增强边界，不创建第三个主题
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
--ex-spacing-1: 4px;
--ex-spacing-2: 8px;
--ex-spacing-3: 12px;
--ex-spacing-4: 16px;
--ex-spacing-5: 20px;
--ex-spacing-6: 24px;
--ex-spacing-8: 32px;
--ex-spacing-12: 48px;
```

`Space`、`Flex` 和 `Grid` 共用上述数字刻度；Space 的 `small`、`medium`、`large` 分别对应 `8px`、`16px`、`24px`。

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
setTheme('light');

// 使用主题 Hook
const { theme, setTheme, toggleTheme } = useTheme();

// 持久化主题（自动保存到 localStorage）
const { theme } = usePersistedTheme();
```

---

## 🌍 国际化（i18n）

ExUI 拥有独立的语言状态与翻译器。`createLocaleProvider()` 只为 ExUI 组件和从
`vue-ex-ui` 导出的 `useI18n()` / `useLocale()` 提供 App 级隔离；它不会为宿主业务安装
`vue-i18n`，也不会让宿主直接使用 `vue-i18n` 的 `useI18n()`。

### 一、只配置 ExUI

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createLocaleProvider } from 'vue-ex-ui';

const app = createApp(App);

const i18nProvider = createLocaleProvider({
  locale: 'zh-CN', // 或 'en-US'
  messages: {
    // 可选：合并/覆盖默认文案
    // menu: { search: '查找菜单' }
  },
});

app.use(i18nProvider);
app.mount('#app');
```

即使项目没有安装 `vue-i18n`，ExUI 也会使用内置中英文翻译。若已安装，
`createLocaleProvider()` 可以在自己的隔离作用域内增强翻译，但不会注册宿主插件。

### 二、宿主业务同时使用 vue-i18n

宿主必须自行创建并同步安装 `vue-i18n`；ExUI 与宿主的消息表也分别配置：

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import { createLocaleProvider, enUS, zhCN } from 'vue-ex-ui';

const app = createApp(App);

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
});
const exLocale = createLocaleProvider({ locale: 'zh-CN' });

app.use(i18n);
app.use(exLocale);
app.mount('#app');
```

切换语言时，应让宿主 `vue-i18n` 的 `locale` 与 `ExConfigProvider` 的 `locale` 读取
同一个响应式语言状态；这样 ExUI 会保留 `createLocaleProvider({ messages })` 的自定义文案，
同时只覆盖当前 Provider 子树选择的语言，不会修改其他 App。

### 组件中使用

```ts
// ExUI 翻译器：只依赖 createLocaleProvider 或内置回退
import { useI18n as useExI18n, useLocale } from 'vue-ex-ui';
const exI18n = useExI18n();
const { t: tm } = useLocale('menu');

// 宿主翻译器：仅在 main.ts 已执行 app.use(i18n) 后可用
import { useI18n as useHostI18n } from 'vue-i18n';
const hostI18n = useHostI18n();

// 示例
tm('search'); // => '搜索菜单'
```

### 依赖与外部化

- `vue-i18n` 是可选 peer 依赖；只使用 ExUI 内置翻译时无需安装。
- 宿主业务需要其 API 时执行 `npm i vue-i18n`，并自行 `createI18n()` 与 `app.use(i18n)`。
- `createLocaleProvider({ messages })` 只覆盖 ExUI 文案，不会写入宿主 `vue-i18n` 的消息表。

---

## 📱 移动端优先

ExUI 采用移动端优先的响应式设计策略：

### 📐 断点系统

```scss
$breakpoints: (
  xs: 0px,
  micro: 375px,
  // 小屏手机内容边界
  sm: 480px,
  // 手机横屏
  compact: 640px,
  // 紧凑桌面内容边界
  md: 768px,
  // 平板竖屏
  lg: 1024px,
  // 平板横屏/小屏桌面
  xl: 1280px,
  // 桌面
  wide: 1400px,
  // 宽屏桌面
  2xl: 1536px, // 大屏桌面
);
```

### 🎯 移动端特性

- **触摸友好** - 移动端可点击元素保证 44px 最小触达区域
- **手势支持** - Carousel 支持触摸滑动切换
- **性能优化** - 图片懒加载、虚拟滚动
- **自适应布局** - 流式布局，自动适配屏幕尺寸
- **离线可用** - 图标内置，品牌字体和简体中文 Noto Sans SC 字体资源随完整 `style.css` 或按需 `font.css` 提供，无运行时网络请求

### 📱 响应式示例

```vue
<template>
  <!-- 在移动端自动调整布局 -->
  <ex-layout has-sider>
    <ex-sider
      :collapsed="isMobile"
      :breakpoint="768"
      @breakpoint="handleBreakpoint"
    >
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

| 技术                 | 版本   | 说明                     |
| -------------------- | ------ | ------------------------ |
| **Vue**              | 3.5+   | 渐进式 JavaScript 框架   |
| **TypeScript**       | 5.9+   | 类型安全的 JavaScript    |
| **Vite**             | 8.2+   | 下一代前端构建工具       |
| **SCSS**             | 1.102+ | CSS 预处理器             |
| **内置 SVG 图标**    | -      | 60+ 内联图标，零网络依赖 |
| **Vitest**           | 4.1+   | 单元测试框架             |
| **VitePress**        | 1.6+   | 文档生成工具             |
| **Vue I18n**         | 11.4+  | 国际化支持               |
| **JsBarcode**        | 3.12+  | 条码生成库               |
| **QRCode**           | 1.5+   | 二维码生成库             |
| **Lunar JavaScript** | 1.7+   | 农历支持                 |

---

## 🌃 赛博朋克特性

### ✨ 视觉效果

- **霓虹发光** - 按钮、边框、卡片霓虹发光效果
- **渐变动画** - 流畅的颜色过渡和主题切换
- **扫描线** - 经典赛博朋克扫描线动画
- **网格背景** - 未来科技感网格背景
- **毛玻璃** - 现代模糊背景效果
- **动态主题** - 两种赛博朋克主题实时切换

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

<!-- 主按钮与光效开关 -->
<ex-button type="primary" :glow="false">执行操作</ex-button>
```

---

## 🌍 国际化支持

ExUI 内置中英文语言包。语言包从主入口导出，语言切换通过 `setLocale` / `ConfigProvider` 完成：

```typescript
import { createApp } from 'vue';
import ExUI, { setLocale, zhCN, enUS } from 'vue-ex-ui';

const app = createApp(App);
app.use(ExUI);

// 全局切换语言（'zh-CN' | 'en-US'）
setLocale('zh-CN');
```

```vue
<template>
  <!-- ConfigProvider 的 locale 接收语言代码字符串 -->
  <ex-config-provider :locale="locale">
    <your-app />
  </ex-config-provider>
</template>

<script setup>
import { ref } from 'vue';

const locale = ref('zh-CN');

const switchLanguage = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
};
</script>
```

### 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 英文 (en-US)

### 覆盖默认文案

通过 `createLocaleProvider` 在初始化时合并自定义文案（详见上文"国际化（i18n）"一节）。

---

---

<div align="center">

**让我们一起打造最酷的赛博朋克 UI 组件库！**

Made with ❤️ by ExUI Team

[⭐ Star](https://github.com/zhuhanxin0308/vue-ex-ui) | [🐛 Issues](https://github.com/zhuhanxin0308/vue-ex-ui/issues) | [💬 Discussions](https://github.com/zhuhanxin0308/vue-ex-ui/discussions)

</div>
