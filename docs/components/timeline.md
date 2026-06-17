# Timeline 时间轴

垂直或水平展示时间流信息。

<script setup>
import { ref } from 'vue'
</script>

## 基础用法

最基础的时间轴用法。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem timestamp="2024-01-15 09:00">
      创建项目
    </ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-16 14:30">
      完成需求分析
    </ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-18 16:45">
      开发完成
    </ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-20 10:00">
      测试通过
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem timestamp="2024-01-15 09:00">创建项目</ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-16 14:30">完成需求分析</ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-18 16:45">开发完成</ExTimelineItem>
    <ExTimelineItem timestamp="2024-01-20 10:00">测试通过</ExTimelineItem>
  </ExTimeline>
</template>
```

## 不同类型

通过 `type` 属性可以设置不同的节点类型。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      项目启动
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      开发完成
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-19">
      发现问题
    </ExTimelineItem>
    <ExTimelineItem type="danger" timestamp="2024-01-20">
      紧急修复
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-21">
      版本发布
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">项目启动</ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">开发完成</ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-19">发现问题</ExTimelineItem>
    <ExTimelineItem type="danger" timestamp="2024-01-20">紧急修复</ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-21">版本发布</ExTimelineItem>
  </ExTimeline>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同的节点尺寸。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem size="small" timestamp="2024-01-15">
      小尺寸节点
    </ExTimelineItem>
    <ExTimelineItem size="medium" timestamp="2024-01-16">
      中等尺寸节点（默认）
    </ExTimelineItem>
    <ExTimelineItem size="large" timestamp="2024-01-17">
      大尺寸节点
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem size="small" timestamp="2024-01-15">小尺寸节点</ExTimelineItem>
    <ExTimelineItem size="medium" timestamp="2024-01-16">中等尺寸节点（默认）</ExTimelineItem>
    <ExTimelineItem size="large" timestamp="2024-01-17">大尺寸节点</ExTimelineItem>
  </ExTimeline>
</template>
```

## 空心节点

通过 `hollow` 属性可以设置空心节点。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem type="primary" hollow timestamp="2024-01-15">
      空心主要节点
    </ExTimelineItem>
    <ExTimelineItem type="success" hollow timestamp="2024-01-16">
      空心成功节点
    </ExTimelineItem>
    <ExTimelineItem type="warning" hollow timestamp="2024-01-17">
      空心警告节点
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem type="primary" hollow timestamp="2024-01-15">空心主要节点</ExTimelineItem>
    <ExTimelineItem type="success" hollow timestamp="2024-01-16">空心成功节点</ExTimelineItem>
    <ExTimelineItem type="warning" hollow timestamp="2024-01-17">空心警告节点</ExTimelineItem>
  </ExTimeline>
</template>
```

## 自定义颜色

通过 `color` 属性可以自定义节点颜色。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem color="#ff3bd1" timestamp="2024-01-15">
      自定义粉色节点
    </ExTimelineItem>
    <ExTimelineItem color="#00f0ff" timestamp="2024-01-16">
      自定义青色节点
    </ExTimelineItem>
    <ExTimelineItem color="#a86bff" timestamp="2024-01-17">
      自定义紫色节点
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem color="#ff3bd1" timestamp="2024-01-15">自定义粉色节点</ExTimelineItem>
    <ExTimelineItem color="#00f0ff" timestamp="2024-01-16">自定义青色节点</ExTimelineItem>
    <ExTimelineItem color="#a86bff" timestamp="2024-01-17">自定义紫色节点</ExTimelineItem>
  </ExTimeline>
</template>
```

## 交替模式

通过 `mode="alternate"` 可以设置交替展示模式。

<div class="demo-container">
  <ExTimeline mode="alternate">
    <ExTimelineItem type="primary" timestamp="2024-01-15 09:00">
      <h4 style="margin: 0 0 8px 0; color: var(--ex-color-neon-blue-500);">项目启动</h4>
      <p style="margin: 0;">召开项目启动会议，确定项目目标和时间表。</p>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18 14:30">
      <h4 style="margin: 0 0 8px 0; color: var(--ex-color-success);">需求完成</h4>
      <p style="margin: 0;">完成所有需求文档的编写和评审。</p>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-20 16:00">
      <h4 style="margin: 0 0 8px 0; color: var(--ex-color-warning);">设计评审</h4>
      <p style="margin: 0;">进行UI/UX设计评审，收集反馈意见。</p>
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-25 10:00">
      <h4 style="margin: 0 0 8px 0; color: var(--ex-color-info);">开发完成</h4>
      <p style="margin: 0;">所有功能开发完成，进入测试阶段。</p>
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline mode="alternate">
    <ExTimelineItem type="primary" timestamp="2024-01-15 09:00">
      <h4>项目启动</h4>
      <p>召开项目启动会议，确定项目目标和时间表。</p>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18 14:30">
      <h4>需求完成</h4>
      <p>完成所有需求文档的编写和评审。</p>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-20 16:00">
      <h4>设计评审</h4>
      <p>进行UI/UX设计评审，收集反馈意见。</p>
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-25 10:00">
      <h4>开发完成</h4>
      <p>所有功能开发完成，进入测试阶段。</p>
    </ExTimelineItem>
  </ExTimeline>
</template>
```

## 右侧模式

通过 `mode="right"` 可以设置右侧展示模式。

<div class="demo-container">
  <ExTimeline mode="right">
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      项目启动
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      开发完成
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">
      测试通过
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline mode="right">
    <ExTimelineItem type="primary" timestamp="2024-01-15">项目启动</ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">开发完成</ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">测试通过</ExTimelineItem>
  </ExTimeline>
</template>
```

## 水平时间轴

通过 `direction="horizontal"` 可以设置水平时间轴。

<div class="demo-container">
  <ExTimeline direction="horizontal">
    <ExTimelineItem type="primary" timestamp="Q1 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第一季度</h4>
        <p style="margin: 0; font-size: 14px;">项目启动与规划</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="Q2 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第二季度</h4>
        <p style="margin: 0; font-size: 14px;">核心功能开发</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="Q3 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第三季度</h4>
        <p style="margin: 0; font-size: 14px;">测试与优化</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="Q4 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第四季度</h4>
        <p style="margin: 0; font-size: 14px;">正式发布</p>
      </div>
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline direction="horizontal">
    <ExTimelineItem type="primary" timestamp="Q1 2024">
      <div>
        <h4>第一季度</h4>
        <p>项目启动与规划</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="Q2 2024">
      <div>
        <h4>第二季度</h4>
        <p>核心功能开发</p>
      </div>
    </ExTimelineItem>
  </ExTimeline>
</template>
```

## 水平交替时间轴

水平方向下设置 `mode="alternate"`，内容会在轴线上下交替排布，节点对齐在同一中线上。

<div class="demo-container">
  <ExTimeline direction="horizontal" mode="alternate">
    <ExTimelineItem type="primary" timestamp="Q1 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第一季度</h4>
        <p style="margin: 0; font-size: 14px;">项目启动与规划</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="Q2 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第二季度</h4>
        <p style="margin: 0; font-size: 14px;">核心功能开发</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="Q3 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第三季度</h4>
        <p style="margin: 0; font-size: 14px;">测试与优化</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="Q4 2024">
      <div style="min-width: 150px;">
        <h4 style="margin: 0 0 8px 0;">第四季度</h4>
        <p style="margin: 0; font-size: 14px;">正式发布</p>
      </div>
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline direction="horizontal" mode="alternate">
    <ExTimelineItem type="primary" timestamp="Q1 2024">
      <div>
        <h4>第一季度</h4>
        <p>项目启动与规划</p>
      </div>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="Q2 2024">
      <div>
        <h4>第二季度</h4>
        <p>核心功能开发</p>
      </div>
    </ExTimelineItem>
    <!-- 更多 ExTimelineItem ... -->
  </ExTimeline>
</template>
```

## 自定义节点

通过 `dot` 插槽可以自定义节点内容。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      <template #dot>
        <img src="https://api.iconify.design/ri/rocket-line.svg" 
             alt="启动" width="16" height="16" 
             style="filter: brightness(0) saturate(100%) invert(100%);" />
      </template>
      项目启动
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      <template #dot>
        <img src="https://api.iconify.design/ri/code-line.svg" 
             alt="开发" width="16" height="16" 
             style="filter: brightness(0) saturate(100%) invert(100%);" />
      </template>
      开发完成
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-20">
      <template #dot>
        <img src="https://api.iconify.design/ri/bug-line.svg" 
             alt="测试" width="16" height="16" 
             style="filter: brightness(0) saturate(100%) invert(100%);" />
      </template>
      测试阶段
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-25">
      <template #dot>
        <img src="https://api.iconify.design/ri/checkbox-circle-line.svg" 
             alt="完成" width="16" height="16" 
             style="filter: brightness(0) saturate(100%) invert(100%);" />
      </template>
      项目完成
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      <template #dot>
        <img
          src="https://api.iconify.design/ri/rocket-line.svg"
          alt="启动"
          width="16"
          height="16"
        />
      </template>
      项目启动
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      <template #dot>
        <img src="https://api.iconify.design/ri/code-line.svg" alt="开发" width="16" height="16" />
      </template>
      开发完成
    </ExTimelineItem>
  </ExTimeline>
</template>
```

## 时间戳位置

通过 `timestamp-position` 属性可以设置时间戳的位置。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15 09:00" timestamp-position="top">
      时间戳在顶部
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-16 14:30" timestamp-position="bottom">
      时间戳在底部（默认）
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15 09:00" timestamp-position="top">
      时间戳在顶部
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-16 14:30" timestamp-position="bottom">
      时间戳在底部（默认）
    </ExTimelineItem>
  </ExTimeline>
</template>
```

## 可变高度内容

时间轴支持内容高度可变，自动适应不同高度的内容。

<div class="demo-container">
  <ExTimeline mode="alternate">
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      <h4 style="margin: 0 0 8px 0;">短内容</h4>
      <p style="margin: 0;">这是一段简短的内容。</p>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      <h4 style="margin: 0 0 8px 0;">中等长度内容</h4>
      <p style="margin: 0;">这是一段中等长度的内容，包含更多的描述信息。可以看到时间轴会自动适应不同的内容高度。</p>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-20">
      <h4 style="margin: 0 0 8px 0;">较长内容</h4>
      <p style="margin: 0 0 8px 0;">这是一段较长的内容，包含了大量的详细描述信息。时间轴组件能够很好地处理不同高度的内容，确保布局的美观和可读性。</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>支持任意高度的内容</li>
        <li>自动调整连接线长度</li>
        <li>保持视觉平衡</li>
      </ul>
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-25">
      <h4 style="margin: 0 0 8px 0;">超长内容示例</h4>
      <p style="margin: 0 0 8px 0;">这是一个包含大量信息的时间轴项。在实际应用中，你可能需要展示详细的项目进展、会议记录、或者其他复杂的内容。</p>
      <div style="background: rgba(0, 240, 255, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <strong>关键指标：</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>完成度：95%</li>
          <li>质量评分：A+</li>
          <li>团队满意度：98%</li>
        </ul>
      </div>
      <p style="margin: 0;">时间轴组件会自动处理这些不同高度的内容，确保整体布局的协调性。</p>
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline mode="alternate">
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      <h4>短内容</h4>
      <p>这是一段简短的内容。</p>
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      <h4>中等长度内容</h4>
      <p>这是一段中等长度的内容，包含更多的描述信息。</p>
    </ExTimelineItem>
    <ExTimelineItem type="warning" timestamp="2024-01-20">
      <h4>较长内容</h4>
      <p>包含大量详细信息...</p>
      <ul>
        <li>支持任意高度的内容</li>
        <li>自动调整连接线长度</li>
      </ul>
    </ExTimelineItem>
  </ExTimeline>
</template>
```

## 反转顺序

通过 `reverse` 属性可以反转时间轴的顺序。

<div class="demo-container">
  <ExTimeline reverse>
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      第一项（显示在底部）
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">
      第二项
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">
      第三项（显示在顶部）
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline reverse>
    <ExTimelineItem type="primary" timestamp="2024-01-15">第一项（显示在底部）</ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18">第二项</ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">第三项（显示在顶部）</ExTimelineItem>
  </ExTimeline>
</template>
```

## 隐藏连接线

通过 `hide-line` 属性可以隐藏单个项的连接线。

<div class="demo-container">
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">
      有连接线
    </ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18" hide-line>
      无连接线
    </ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">
      有连接线
    </ExTimelineItem>
  </ExTimeline>
</div>

```vue
<template>
  <ExTimeline>
    <ExTimelineItem type="primary" timestamp="2024-01-15">有连接线</ExTimelineItem>
    <ExTimelineItem type="success" timestamp="2024-01-18" hide-line>无连接线</ExTimelineItem>
    <ExTimelineItem type="info" timestamp="2024-01-20">有连接线</ExTimelineItem>
  </ExTimeline>
</template>
```

## API

### Timeline Props

| 属性        | 说明                         | 类型                               | 默认值       |
| ----------- | ---------------------------- | ---------------------------------- | ------------ |
| `direction` | 时间轴方向                   | `'vertical' \| 'horizontal'`       | `'vertical'` |
| `mode`      | 时间轴模式（仅垂直方向有效） | `'left' \| 'right' \| 'alternate'` | `'left'`     |
| `show-line` | 是否显示连接线               | `boolean`                          | `true`       |
| `reverse`   | 是否反转顺序                 | `boolean`                          | `false`      |

### Timeline Methods

| 方法名       | 说明              | 类型                           |
| ------------ | ----------------- | ------------------------------ |
| `getElement` | 获取时间轴DOM元素 | `() => HTMLDivElement \| null` |

### TimelineItem Props

| 属性                 | 说明                         | 类型                                                                     | 默认值      |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------ | ----------- |
| `timestamp`          | 时间戳或时间文本             | `string`                                                                 | `undefined` |
| `timestamp-position` | 时间戳位置（仅垂直方向有效） | `'top' \| 'bottom'`                                                      | `'bottom'`  |
| `type`               | 节点类型                     | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size`               | 节点尺寸                     | `'small' \| 'medium' \| 'large'`                                         | `'medium'`  |
| `color`              | 节点颜色（自定义颜色）       | `string`                                                                 | `undefined` |
| `hollow`             | 是否为空心节点               | `boolean`                                                                | `false`     |
| `hide-line`          | 是否隐藏连接线               | `boolean`                                                                | `false`     |

### TimelineItem Events

| 事件名  | 说明       | 类型                          |
| ------- | ---------- | ----------------------------- |
| `click` | 点击时触发 | `(event: MouseEvent) => void` |

### TimelineItem Slots

| 插槽名      | 说明             |
| ----------- | ---------------- |
| `default`   | 时间轴项内容     |
| `dot`       | 自定义节点内容   |
| `timestamp` | 自定义时间戳内容 |

### TimelineItem Methods

| 方法名       | 说明                | 类型                           |
| ------------ | ------------------- | ------------------------------ |
| `getElement` | 获取时间轴项DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持屏幕阅读器
- 支持键盘导航

## 主题定制

时间轴跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
