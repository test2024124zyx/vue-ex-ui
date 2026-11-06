# 介绍

ExUI 是一个专为赛博朋克风格应用打造的Vue3组件库，灵感来源于赛博朋克美学和未来科技视觉。

## 特性

- 🎮 **赛博化体验** - 深色主题配合霓虹蓝紫渐变，营造沉浸式氛围
- 📱 **移动端优先** - 响应式设计，完美适配手机、平板、桌面端
- ⚡ **高性能** - 基于Vue3 Composition API，轻量化设计
- 🎨 **现代科技感** - 流畅动画、发光效果、渐变边框
- 🔧 **开发友好** - TypeScript支持，完整的类型定义

## 设计理念

ExUI 致力于为赛博朋克风格应用提供一套完整的UI解决方案，我们相信：

- **用户体验至上** - 每个组件都经过精心设计，确保最佳的用户体验
- **开发效率** - 提供丰富的组件和工具，让开发者专注于业务逻辑
- **可定制性** - 灵活的主题系统，满足不同项目的个性化需求
- **可访问性** - 遵循无障碍设计原则，让所有用户都能使用

## 浏览器支持

ExUI 的最低浏览器版本如下（移动端需使用对应版本或更新的浏览器内核）：

- Chrome >= 108
- Firefox >= 121
- Safari >= 16（含 iOS / iPadOS Safari）
- Edge >= 108

该下限依据组件实际使用的 [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)、[`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has)、[动态视口单位](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)和[容器查询](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@container)确定。构建使用相同的 JavaScript 与 CSS 浏览器目标；库不注入全局 API polyfill。宿主应用的可选依赖和嵌入式 WebView 也需满足相应运行时要求。

## 版本

当前版本：`v3.0.0`

查看 [更新日志](https://github.com/zhuhanxin0308/vue-ex-ui/releases) 了解版本变化。
