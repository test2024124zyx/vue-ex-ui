# 组件总览

<script setup>
import { componentDirectories } from '../../src/resolver/component-map';

const moduleCount = new Set(componentDirectories.values()).size;
const publicComponentCount = componentDirectories.size;
</script>

ExUI 提供了丰富的组件库，涵盖了现代赛博朋克风格应用开发的各种需求。

### 通用基础组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./typography">Typography</a></h3>
    <p>排版文本组件，支持多种文本样式和赛博朋克主题效果</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Icon</h3>
    <p>内置 SVG 图标注册表，支持自定义图片来源，无运行时图标网络依赖</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./button">Button</a></h3>
    <p>按钮组件，支持多种类型和游戏化交互效果，完美主题响应</p>
    <div class="status">✅ 已完成 + CSS优化</div>
  </div>

  <div class="component-card completed">
    <h3>Badge</h3>
    <p>徽标计数组件，用于显示数字或状态标记</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Image</h3>
    <p>图片组件，支持懒加载和错误处理</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Link</h3>
    <p>链接组件，支持内部和外部链接</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./avatar">Avatar</a></h3>
    <p>头像组件，支持图片、文字和图标头像，主题响应式</p>
    <div class="status">✅ 已完成 + 主题优化</div>
  </div>

  <div class="component-card completed">
    <h3>Divider</h3>
    <p>分割线组件，用于内容分隔</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Space</h3>
    <p>间距组件，用于元素间距控制</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./card">Card</a></h3>
    <p>卡片容器，支持赛博朋克主题样式，动态渐变背景</p>
    <div class="status">✅ 已完成 + CSS优化</div>
  </div>

  <div class="component-card completed">
    <h3>Ellipsis</h3>
    <p>文本省略组件，支持多行省略</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Watermark</h3>
    <p>水印组件，用于内容保护</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

### 表单类组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./input">Input</a></h3>
    <p>文本输入框，支持多种输入类型和验证</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./number-input">NumberInput</a></h3>
    <p>数字输入框，支持步进器和范围限制</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./select">Select</a></h3>
    <p>下拉选择器，支持单选和多选</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./cascader">Cascader</a></h3>
    <p>级联选择器，支持多级选择</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./checkbox">Checkbox</a></h3>
    <p>复选框，支持全选和半选状态</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./radio">Radio</a></h3>
    <p>单选框，支持组合使用</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./switch">Switch</a></h3>
    <p>开关组件，支持游戏化切换效果</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./slider">Slider</a></h3>
    <p>滑块组件，支持范围选择</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./datetime-picker">DateTimePicker</a></h3>
    <p>日期时间选择器，组合日期和时间选择</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./rate">Rate</a></h3>
    <p>评分组件，支持半星和自定义图标</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./upload">Upload</a></h3>
    <p>文件上传组件，支持拖拽上传</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./file-upload">FileUpload</a></h3>
    <p>高级文件上传，支持多文件和预览</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./image-crop">ImageCrop</a></h3>
    <p>图片裁剪组件，支持自由裁剪</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./form">Form</a></h3>
    <p>表单容器，支持验证和布局</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

### 数据展示组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./tag">Tag</a></h3>
    <p>标签组件，支持多种颜色和样式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./list">List</a></h3>
    <p>列表组件，支持多种布局</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./empty">Empty</a></h3>
    <p>空状态组件，用于无数据展示</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./virtual-list">VirtualList</a></h3>
    <p>虚拟列表，支持大数据量渲染</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./collapse">Collapse</a></h3>
    <p>折叠面板，支持手风琴模式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./carousel">Carousel</a></h3>
    <p>走马灯组件，支持自动播放</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./timeline">Timeline</a></h3>
    <p>时间轴组件，展示时间流程</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./progress">Progress</a></h3>
    <p>进度条组件，支持多种样式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./calendar">Calendar</a></h3>
    <p>日历组件，支持事件标记</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./table">Table</a></h3>
    <p>表格组件，支持排序和筛选</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./tree">Tree</a></h3>
    <p>树形组件，支持展开折叠</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./code">Code</a></h3>
    <p>代码展示组件，支持语法高亮</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./qrcode">QRCode</a></h3>
    <p>二维码组件，支持自定义样式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./barcode">Barcode</a></h3>
    <p>条形码组件，支持多种格式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./heatmap">Heatmap</a></h3>
    <p>热力图组件，数据可视化</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./skeleton">Skeleton</a></h3>
    <p>骨架屏，优化加载体验</p>
    <div class="status">✅ 已完成</div>
  </div>
  <div class="component-card completed">
    <h3><a href="./chart">chart</a></h3>
    <p>图表组件，封装echarts</p>
    <div class="status">✅ 已完成</div>
  </div>
  <div class="component-card completed">
    <h3><a href="./file-list">FileList</a></h3>
    <p>文件列表组件，展示文件信息</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

### 导航布局组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./layout">Layout</a></h3>
    <p>布局容器，支持经典布局结构</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./grid">Grid</a></h3>
    <p>栅格系统，响应式布局</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./flex">Flex</a></h3>
    <p>弹性布局容器，快速布局</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./menu">Menu</a></h3>
    <p>导航菜单，支持多级菜单</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./tabs">Tabs</a></h3>
    <p>标签页组件，内容切换</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./dropdown">Dropdown</a></h3>
    <p>下拉菜单，支持多级下拉</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./breadcrumb">Breadcrumb</a></h3>
    <p>面包屑导航，显示当前位置</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./steps">Steps</a></h3>
    <p>步骤条组件，引导流程</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./anchor">Anchor</a></h3>
    <p>锚点组件，页面内导航</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./pagination">Pagination</a></h3>
    <p>分页组件，数据分页展示</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./page-header">PageHeader</a></h3>
    <p>页头组件，页面标题和操作</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./affix">Affix</a></h3>
    <p>固钉组件，固定元素位置</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./back-top">BackTop</a></h3>
    <p>回到顶部，快速返回页面顶部</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

### 反馈与交互组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./dialog">Dialog</a></h3>
    <p>对话框组件，支持多种交互模式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./modal">Modal</a></h3>
    <p>模态对话框，支持赛博朋克主题</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./drawer">Drawer</a></h3>
    <p>抽屉组件，侧边滑出面板</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./tooltip">Tooltip</a></h3>
    <p>文字提示组件，支持多方向</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./popover">Popover</a></h3>
    <p>气泡卡片，支持丰富内容</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./popconfirm">Popconfirm</a></h3>
    <p>气泡确认框，用于二次确认</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./message">Message</a></h3>
    <p>消息提示组件，轻量级反馈</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./notification">Notification</a></h3>
    <p>通知组件，支持多方向显示</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./loading">Loading</a></h3>
    <p>加载组件，支持多种动画</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./loading-bar">LoadingBar</a></h3>
    <p>加载条组件，顶部进度指示</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./alert">Alert</a></h3>
    <p>警告提示，展示重要信息</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./panel">Panel</a></h3>
    <p>面板组件，内容容器</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./file-preview">FilePreview</a></h3>
    <p>文件预览组件，支持多种格式</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./file-download">FileDownload</a></h3>
    <p>文件下载组件，支持进度显示</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

### 其他组件

<div class="component-grid">
  <div class="component-card completed">
    <h3><a href="./config-provider">ConfigProvider</a></h3>
    <p>全局配置组件，统一配置主题和语言</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3><a href="./image-compress">ImageCompress</a></h3>
    <p>图片压缩组件，优化图片大小</p>
    <div class="status">✅ 已完成</div>
  </div>

  <div class="component-card completed">
    <h3>Upload (别名)</h3>
    <p>文件上传组件别名，指向 FileUpload</p>
    <div class="status">✅ 已完成</div>
  </div>
</div>

## 组件统计与验收

统计由公开组件映射生成，模块数与包含附属组件的公开导出数分别计数。
功能与兼容性由持续集成验证，不以静态百分比代替验收结果。

<div class="progress-summary">
  <div class="progress-item">
    <div class="progress-label">组件模块</div>
    <div class="progress-value">{{ moduleCount }}</div>
  </div>

  <div class="progress-item">
    <div class="progress-label">公开组件（含附属组件）</div>
    <div class="progress-value completed">{{ publicComponentCount }}</div>
  </div>

  <div class="progress-item">
    <div class="progress-label">每模块四项覆盖率门禁</div>
    <div class="progress-value">≥ 80%</div>
  </div>

  <div class="progress-item">
    <div class="progress-label">浏览器引擎</div>
    <div class="progress-value">3</div>
  </div>

</div>

运行 `npm run test:coverage` 检查各组件覆盖率，运行 `npm run test:browser`
检查双主题、真实绘制、键盘、窄屏和异步操作。完整发布检查为 `npm run verify:release`。

<style scoped>
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.component-card {
  padding: 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}

.component-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.component-card h3 a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.component-card h3 a:hover {
  text-decoration: underline;
}

.component-card p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.completed .status {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.developing .status {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.pending .status {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.progress-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 24px 0;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.progress-item {
  text-align: center;
}

.progress-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.progress-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.progress-value.completed {
  color: #22c55e;
}

.progress-value.developing {
  color: #f97316;
}

.progress-value.pending {
  color: #6b7280;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #29ABE2, #a86bff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 深色模式适配 */
html.dark .component-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
