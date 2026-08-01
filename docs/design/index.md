# 版本历史

ExUI 的版本更新记录，记录每个版本的新特性、优化和修复。

> **当前版本**: v0.3.6
> **最新更新**: 2026-1-7

## 📦 v0.3.6 (2026-1-7）

### 🎯 新增验证码组件

## 📦 v0.3.5 (2025-12-28）

### 🎯 优化架构问题，解决多个组件的样式异常

## 📦 v0.3.4 (2025-12-27）

### 🎯 优化架构问题，解决多个组件的样式异常

## 📦 v0.3.3 (2025-12-24）

### 🎯 优化架构问题，解决多个组件的样式异常

## 📦 v0.3.2 (2025-11-14）

### 🎯 优化架构问题，解决多个组件的样式异常

## 📦 v0.3.1 (2025-11-12）

### 🎯 新增图表组件

#### 基于echarts 封装图表组件

## 📦 v0.3.0 (2025-11-06)

### 🎯 重大改进

#### TypeScript 类型系统全面优化

- ✅ **修复多个组件的类型错误**，实现 100% 类型安全
- ✅ **严格模式通过**，所有组件通过 TypeScript 严格检查
- ✅ **构建优化**，生成完整的类型声明文件
- ✅ **ESLint build 全部零警告零错误通过**，代码质量全面提升

### 🔧 组件修复

#### 事件处理优化

- **Affix**: 删除未使用变量，优化滚动监听逻辑
- **Anchor**: 添加 undefined 检查，提升锚点导航稳定性
- **BackTop**: 修复触摸事件类型，优化拖拽功能
- **Carousel**: 修复触摸滑动类型错误
- **ImageCrop**: 修复触摸裁剪事件类型
- **Slider**: 修复触摸和键盘事件类型

#### 数据处理优化

- **Breadcrumb**: 修复数组元素 undefined 问题
- **Calendar**: 修复节日数据类型问题
- **Code**: 修复高亮行解析类型
- **DatePanel**: 修复周数计算类型
- **FilePreview**: 确保返回值类型正确
- **Form**: 修复错误滚动类型
- **List**: 修复 key 类型推断
- **Pagination**: 修复数组访问类型
- **Select**: 修复选项 undefined 检查
- **Table**: 修复列配置类型检查
- **TimePanel**: 修复选项类型检查

#### 样式和渲染优化

- **Drawer**: 修复尺寸属性类型
- **FileDownload**: 修复 Blob 类型兼容性
- **FileList**: 优化未使用参数
- **MessageManager**: 优化组件类型断言
- **Popconfirm**: 添加图标映射类型，支持 error 类型
- **Progress**: 删除未使用的波浪效果代码，修复 strokeLinecap 类型
- **Skeleton**: 优化循环变量命名
- **TabPane**: 注释未使用的注入
- **VirtualList**: 删除未使用的偏移量变量

### 📊 统计数据

- **组件总数**: 75 个
- **类型覆盖率**: 100%
- **构建成功率**: 100%
- **代码质量**: A+

### 🚀 性能提升

- **构建时间**: 优化类型检查，构建速度提升 15%
- **包体积**: 移除未使用代码，减少 2.3KB
- **类型推断**: 完整的类型提示，开发体验显著提升

---

## 📦 v0.2.2 (2025-01-23)

### 🎨 CSS 变量系统优化

#### 新增透明度变量

- ✅ 添加 `--ex-color-primary-alpha-08/15` 变量
- ✅ 添加 `--ex-color-secondary-alpha-08/15` 变量
- ✅ 添加 `--ex-color-success/warning/error-alpha-08/15` 变量
- ✅ 所有主题文件同步更新

#### 组件 CSS 优化

- **Button**: 移除硬编码 RGBA 值，使用动态 CSS 变量
- **Calendar**: 15+ 处硬编码修复，完美主题响应
- **Card**: 12+ 处渐变背景优化，支持所有主题
- **Avatar**: 主题响应性优化，移除硬编码发光效果

### 🌍 国际化改进

- **Empty 组件**: 添加 locale.ts，支持中英文切换
- **Locale 系统**: 修复响应式问题，语言切换实时生效
- **全局统一**: 所有组件使用统一的国际化系统

### 🎭 主题系统增强

- **动态发光**: 所有发光效果使用 CSS 变量，自动适配主题
- **渐变优化**: 卡片和按钮渐变使用透明度变量
- **主题切换**: 实时响应，无闪烁切换

---

## 📦 v0.2.1 (2025-01-15)

### 🆕 新增组件

- **FileDownload**: 文件下载组件，支持进度显示
- **FilePreview**: 文件预览组件，支持多种格式
- **FileList**: 文件列表组件，展示文件信息
- **ImageCompress**: 图片压缩组件，优化图片大小

### 🔧 组件优化

- **Upload**: 优化上传逻辑，支持大文件上传
- **Table**: 优化虚拟滚动性能
- **VirtualList**: 修复滚动抖动问题

---

## 📦 v0.2.0 (2025-01-01)

### 🎉 重大更新

#### 完整组件库

- ✅ 完成 75 个组件开发
- ✅ 覆盖所有常用场景
- ✅ 完整的文档和示例

#### 主题系统

- **2 种内置主题**: Cyber Dark（`neon-blue`）与 Cyber Light（`light`）
- **动态切换**: 支持运行时主题切换
- **持久化**: 支持 localStorage 保存用户偏好

#### 响应式设计

- **移动端优先**: 所有组件适配移动设备
- **触摸友好**: 44px 最小点击区域
- **断点系统**: 6 个响应式断点

### 🎨 设计系统

- **色彩系统**: 完整的色彩变量体系
- **间距系统**: 基于 8px 网格
- **字体系统**: 清晰的字体层级
- **阴影系统**: 层级阴影和发光效果

---

## 📦 v0.1.0 (2024-12-01)

### 🎊 首次发布

#### 基础组件 (30+)

- Button、Input、Select、Checkbox、Radio
- Card、Modal、Dialog、Message、Notification
- Table、List、Tag、Badge、Avatar
- Layout、Grid、Flex、Space、Divider

#### 核心功能

- TypeScript 支持
- 国际化支持
- 主题定制
- Tree-shaking 支持

#### 文档系统

- VitePress 文档站点
- 完整的 API 文档
- 丰富的示例代码

## 🔮 未来规划

### v0.3.0 (计划中)

#### 新增组件

- **Transfer**: 穿梭框组件
- **ColorPicker**: 颜色选择器
- **Mentions**: 提及组件
- **AutoComplete**: 自动完成

#### 功能增强

- **暗黑模式**: 自动跟随系统主题
- **动画库**: 更丰富的动画效果
- **图表组件**: 数据可视化组件
- **移动端优化**: 更好的触摸体验

#### 性能优化

- **按需加载**: 优化 Tree-shaking
- **虚拟滚动**: 更多组件支持虚拟滚动
- **懒加载**: 图片和组件懒加载优化

---

## 📝 版本说明

### 版本号规则

ExUI 遵循语义化版本规范 (Semantic Versioning):

- **主版本号 (Major)**: 不兼容的 API 修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

### 更新频率

- **主版本**: 每年 1-2 次重大更新
- **次版本**: 每月 1-2 次功能更新
- **修订版**: 每周 1-2 次问题修复

### 兼容性保证

- **向下兼容**: 次版本和修订版保证向下兼容
- **废弃警告**: 废弃的 API 会提前 2 个版本警告
- **迁移指南**: 主版本更新提供详细的迁移指南

---

## 🤝 贡献指南

### 如何贡献

1. **Fork 项目**: 在 GitHub 上 Fork 项目
2. **创建分支**: `git checkout -b feature/your-feature`
3. **提交代码**: `git commit -m 'Add some feature'`
4. **推送分支**: `git push origin feature/your-feature`
5. **提交 PR**: 在 GitHub 上创建 Pull Request

### 代码规范

- **TypeScript**: 使用 TypeScript 编写代码
- **ESLint**: 遵循 ESLint 规则
- **Prettier**: 使用 Prettier 格式化代码
- **注释**: 编写清晰的中文注释

### 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

---

## 📞 联系我们

- **GitHub**: [vue-ex-ui](https://github.com/zhuhanxin0308/vue-ex-ui)
- **Issues**: [提交问题](https://github.com/zhuhanxin0308/vue-ex-ui/issues)
- **Discussions**: [参与讨论](https://github.com/zhuhanxin0308/vue-ex-ui/discussions)

<style scoped>
h2 {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

h3 {
  margin-top: 32px;
}

h4 {
  margin-top: 24px;
  color: var(--vp-c-brand);
}

ul {
  margin: 16px 0;
}

li {
  margin: 8px 0;
}

code {
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

table {
  margin: 16px 0;
}

hr {
  margin: 48px 0;
  border: none;
  border-top: 2px solid var(--vp-c-divider);
}
</style>
