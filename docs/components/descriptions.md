# Descriptions 描述列表

成组展示多个只读字段，常用于详情页的信息陈列。

## 基础用法

用 `ExDescriptions` 包裹若干 `ExDescriptionsItem`，每项通过 `label` 指定标签。

<div class="demo-container">
  <ExDescriptions title="用户信息">
    <ExDescriptionsItem label="用户名">Cyber_Edge</ExDescriptionsItem>
    <ExDescriptionsItem label="手机号">138-0000-0000</ExDescriptionsItem>
    <ExDescriptionsItem label="居住地">Neo Tokyo</ExDescriptionsItem>
    <ExDescriptionsItem label="备注">霓虹城核心区</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions title="用户信息">
    <ExDescriptionsItem label="用户名">Cyber_Edge</ExDescriptionsItem>
    <ExDescriptionsItem label="手机号">138-0000-0000</ExDescriptionsItem>
    <ExDescriptionsItem label="居住地">Neo Tokyo</ExDescriptionsItem>
    <ExDescriptionsItem label="备注">霓虹城核心区</ExDescriptionsItem>
  </ExDescriptions>
</template>
```

## 带边框

设置 `border` 显示边框，标签与内容会以表格单元格形式呈现。

<div class="demo-container">
  <ExDescriptions title="设备状态" border>
    <ExDescriptionsItem label="设备名">Spectre-01</ExDescriptionsItem>
    <ExDescriptionsItem label="状态">在线</ExDescriptionsItem>
    <ExDescriptionsItem label="IP">10.0.13.7</ExDescriptionsItem>
    <ExDescriptionsItem label="负载">42%</ExDescriptionsItem>
    <ExDescriptionsItem label="描述" :span="2">主控节点，承载核心调度服务。</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions title="设备状态" border>
    <ExDescriptionsItem label="设备名">Spectre-01</ExDescriptionsItem>
    <ExDescriptionsItem label="状态">在线</ExDescriptionsItem>
    <ExDescriptionsItem label="IP">10.0.13.7</ExDescriptionsItem>
    <ExDescriptionsItem label="负载">42%</ExDescriptionsItem>
    <ExDescriptionsItem label="描述" :span="2">主控节点，承载核心调度服务。</ExDescriptionsItem>
  </ExDescriptions>
</template>
```

## 垂直排列

设置 `direction="vertical"`，标签在上、内容在下。

<div class="demo-container">
  <ExDescriptions title="订单信息" border direction="vertical" :column="4">
    <ExDescriptionsItem label="订单号">EX-20260617-001</ExDescriptionsItem>
    <ExDescriptionsItem label="金额">¥1,299</ExDescriptionsItem>
    <ExDescriptionsItem label="支付方式">数字钱包</ExDescriptionsItem>
    <ExDescriptionsItem label="状态">已支付</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions border direction="vertical" :column="4">
    <ExDescriptionsItem label="订单号">EX-20260617-001</ExDescriptionsItem>
    <ExDescriptionsItem label="金额">¥1,299</ExDescriptionsItem>
    <ExDescriptionsItem label="支付方式">数字钱包</ExDescriptionsItem>
    <ExDescriptionsItem label="状态">已支付</ExDescriptionsItem>
  </ExDescriptions>
</template>
```

## 不同尺寸

通过 `size` 设置 `small` / `medium`（默认）/ `large`。

<div class="demo-container" style="flex-direction: column; align-items: stretch; gap: 16px;">
  <ExDescriptions border size="small">
    <ExDescriptionsItem label="尺寸">small</ExDescriptionsItem>
    <ExDescriptionsItem label="说明">紧凑信息密度</ExDescriptionsItem>
  </ExDescriptions>
  <ExDescriptions border size="large">
    <ExDescriptionsItem label="尺寸">large</ExDescriptionsItem>
    <ExDescriptionsItem label="说明">宽松易读</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions border size="small">...</ExDescriptions>
  <ExDescriptions border size="large">...</ExDescriptions>
</template>
```

## 自定义列数与跨列

`column` 控制每行列数，`span` 控制单项占据的列数。每行最后一项会自动填满剩余空间。

<div class="demo-container">
  <ExDescriptions title="服务器配置" border :column="3">
    <ExDescriptionsItem label="CPU">16 vCPU</ExDescriptionsItem>
    <ExDescriptionsItem label="内存">64 GB</ExDescriptionsItem>
    <ExDescriptionsItem label="磁盘">2 TB SSD</ExDescriptionsItem>
    <ExDescriptionsItem label="网络" :span="3">双线 BGP，峰值 10 Gbps</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions border :column="3">
    <ExDescriptionsItem label="CPU">16 vCPU</ExDescriptionsItem>
    <ExDescriptionsItem label="内存">64 GB</ExDescriptionsItem>
    <ExDescriptionsItem label="磁盘">2 TB SSD</ExDescriptionsItem>
    <ExDescriptionsItem label="网络" :span="3">双线 BGP，峰值 10 Gbps</ExDescriptionsItem>
  </ExDescriptions>
</template>
```

## 标题与操作区

使用 `title` 属性或 `#title` 插槽设置标题，`#extra` 插槽放置右上角操作。

<div class="demo-container">
  <ExDescriptions border>
    <template #title>账户详情</template>
    <template #extra>
      <ExButton size="small" type="primary">编辑</ExButton>
    </template>
    <ExDescriptionsItem label="等级">白金会员</ExDescriptionsItem>
    <ExDescriptionsItem label="积分">8,860</ExDescriptionsItem>
  </ExDescriptions>
</div>

```vue
<template>
  <ExDescriptions border>
    <template #title>账户详情</template>
    <template #extra>
      <ExButton size="small" type="primary">编辑</ExButton>
    </template>
    <ExDescriptionsItem label="等级">白金会员</ExDescriptionsItem>
    <ExDescriptionsItem label="积分">8,860</ExDescriptionsItem>
  </ExDescriptions>
</template>
```

## API

### Descriptions Props

| 属性          | 说明                       | 类型                             | 默认值         |
| ------------- | -------------------------- | -------------------------------- | -------------- |
| title         | 标题                       | `string`                         | —              |
| column        | 一行的列数                 | `number`                         | `3`            |
| border        | 是否带边框                 | `boolean`                        | `false`        |
| size          | 尺寸                       | `'small' \| 'medium' \| 'large'` | 跟随全局配置   |
| direction     | 排列方向                   | `'horizontal' \| 'vertical'`     | `'horizontal'` |
| label-align   | 标签对齐                   | `'left' \| 'center' \| 'right'`  | `'left'`       |
| content-align | 内容对齐                   | `'left' \| 'center' \| 'right'`  | `'left'`       |
| colon         | 无边框时标签后是否显示冒号 | `boolean`                        | `true`         |
| label-style   | 统一标签样式               | `CSSProperties`                  | —              |
| content-style | 统一内容样式               | `CSSProperties`                  | —              |

### Descriptions Slots

| 插槽名  | 说明                      |
| ------- | ------------------------- |
| default | 放置 `ExDescriptionsItem` |
| title   | 自定义标题                |
| extra   | 右上角操作区              |

### DescriptionsItem Props

| 属性                        | 说明                  | 类型                            | 默认值 |
| --------------------------- | --------------------- | ------------------------------- | ------ |
| label                       | 标签文本              | `string`                        | —      |
| span                        | 占据的列数            | `number`                        | `1`    |
| label-align                 | 标签对齐（覆盖父级）  | `'left' \| 'center' \| 'right'` | —      |
| content-align               | 内容对齐（覆盖父级）  | `'left' \| 'center' \| 'right'` | —      |
| label-class / content-class | 标签 / 内容自定义类名 | `string`                        | —      |
| label-style / content-style | 标签 / 内容自定义样式 | `CSSProperties`                 | —      |

### DescriptionsItem Slots

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 内容       |
| label   | 自定义标签 |

## 主题定制

Descriptions 消费 ExUI 全局设计令牌，可覆盖以下令牌：

```css
:root {
  --ex-color-bg-secondary: #11151c; /* 边框模式标签底色 */
  --ex-color-bg-elevated: #0d1117; /* 边框模式内容底色 */
  --ex-color-border-primary: #1f2a37; /* 边框颜色 */
  --ex-color-text-secondary: #93a4b8; /* 标签文字色 */
}
```

## 常见问题

**Q：为什么 `ExDescriptionsItem` 单独使用没有表格样式？**
`ExDescriptionsItem` 只是数据占位，真正的布局由父级 `ExDescriptions` 收集后统一渲染。必须放在 `ExDescriptions` 内使用。

**Q：`span` 超过 `column` 会怎样？**
会被自动截断为 `column`（不会跨多行）。

**Q：内容里可以放任意组件吗？**
可以。`ExDescriptionsItem` 的默认插槽支持任意内容（标签、按钮、链接等）。

## 最佳实践

- **详情陈列优先用 Descriptions**，比手写表格更语义化、对齐更稳定。
- **字段较多时用 `border` + 合适的 `column`**，移动端可减小 `column` 或改 `direction="vertical"`。
- 用 `span` 让长文本（如备注、描述）独占整行，避免换行错位。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
