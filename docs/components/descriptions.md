# Descriptions 描述列表

用于按标签与内容成组展示只读信息。

## 基础用法

::: raw

<div class="vp-raw demo-container">
  <ex-descriptions title="用户信息">
    <ex-descriptions-item label="用户名">Cyber_Edge</ex-descriptions-item>
    <ex-descriptions-item label="手机号">138-0000-0000</ex-descriptions-item>
    <ex-descriptions-item label="居住地">Neo Tokyo</ex-descriptions-item>
  </ex-descriptions>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-descriptions title="用户信息">
      <ex-descriptions-item label="用户名">Cyber_Edge</ex-descriptions-item>
      <ex-descriptions-item label="手机号">138-0000-0000</ex-descriptions-item>
      <ex-descriptions-item label="居住地">Neo Tokyo</ex-descriptions-item>
    </ex-descriptions>
  </div>
</template>
```

:::

## 边框与跨列

`column` 控制每行逻辑列数，`span` 控制当前项占据的列数。每行最后一项自动填充剩余空间。

::: raw

<div class="vp-raw demo-container">
  <ex-descriptions title="设备状态" border :column="3">
    <ex-descriptions-item label="设备名">Spectre-01</ex-descriptions-item>
    <ex-descriptions-item label="状态">在线</ex-descriptions-item>
    <ex-descriptions-item label="IP">10.0.13.7</ex-descriptions-item>
    <ex-descriptions-item label="描述" :span="3">主控节点，承载核心调度服务。</ex-descriptions-item>
  </ex-descriptions>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-descriptions
      title="设备状态"
      border
      :column="3"
    >
      <ex-descriptions-item label="设备名">Spectre-01</ex-descriptions-item>
      <ex-descriptions-item label="状态">在线</ex-descriptions-item>
      <ex-descriptions-item label="IP">10.0.13.7</ex-descriptions-item>
      <ex-descriptions-item
        label="描述"
        :span="3"
      >
        主控节点，承载核心调度服务。
      </ex-descriptions-item>
    </ex-descriptions>
  </div>
</template>
```

:::

## 垂直排列

::: raw

<div class="vp-raw demo-container">
  <ex-descriptions title="订单信息" border direction="vertical" :column="4">
    <ex-descriptions-item label="订单号">EX-20260711-001</ex-descriptions-item>
    <ex-descriptions-item label="金额">¥1,299</ex-descriptions-item>
    <ex-descriptions-item label="支付方式">数字钱包</ex-descriptions-item>
    <ex-descriptions-item label="状态">已支付</ex-descriptions-item>
  </ex-descriptions>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-descriptions
      title="订单信息"
      border
      direction="vertical"
      :column="4"
    >
      <ex-descriptions-item label="订单号">EX-20260711-001</ex-descriptions-item>
      <ex-descriptions-item label="金额">¥1,299</ex-descriptions-item>
      <ex-descriptions-item label="支付方式">数字钱包</ex-descriptions-item>
      <ex-descriptions-item label="状态">已支付</ex-descriptions-item>
    </ex-descriptions>
  </div>
</template>
```

:::

## 自定义标签与操作区

::: raw

<div class="vp-raw demo-container">
  <ex-descriptions border>
    <template #title>账户详情</template>
    <template #extra>
      <ex-button size="small" type="primary">编辑</ex-button>
    </template>
    <ex-descriptions-item>
      <template #label><strong>会员等级</strong></template>
      白金会员
    </ex-descriptions-item>
    <ex-descriptions-item label="积分">8,860</ex-descriptions-item>
  </ex-descriptions>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ex-descriptions border>
      <template #title>账户详情</template>
      <template #extra>
        <ex-button
          size="small"
          type="primary"
        >
          编辑
        </ex-button>
      </template>
      <ex-descriptions-item>
        <template #label><strong>会员等级</strong></template>
        白金会员
      </ex-descriptions-item>
      <ex-descriptions-item label="积分">8,860</ex-descriptions-item>
    </ex-descriptions>
  </div>
</template>
```

:::

## API

### Descriptions Props

| 属性            | 说明                                | 类型                             | 默认值         |
| --------------- | ----------------------------------- | -------------------------------- | -------------- |
| `title`         | 标题                                | `string`                         | —              |
| `column`        | 每行逻辑列数，规范为 1～1000 的整数 | `number`                         | `3`            |
| `border`        | 是否显示单元格边框                  | `boolean`                        | `false`        |
| `size`          | 组件尺寸                            | `'small' \| 'medium' \| 'large'` | 跟随全局配置   |
| `direction`     | 标签与内容排列方向                  | `'horizontal' \| 'vertical'`     | `'horizontal'` |
| `label-align`   | 全局标签对齐方式                    | `'left' \| 'center' \| 'right'`  | `'left'`       |
| `content-align` | 全局内容对齐方式                    | `'left' \| 'center' \| 'right'`  | `'left'`       |
| `colon`         | 无边框模式是否在非空标签后显示冒号  | `boolean`                        | `true`         |
| `label-style`   | 全局标签样式                        | `CSSProperties`                  | —              |
| `content-style` | 全局内容样式                        | `CSSProperties`                  | —              |

### Descriptions Slots

| 插槽名    | 说明                              |
| --------- | --------------------------------- |
| `default` | 放置直接子级 `ExDescriptionsItem` |
| `title`   | 自定义标题                        |
| `extra`   | 标题行右侧操作区                  |

### DescriptionsItem Props

| 属性            | 说明             | 类型                            | 默认值   |
| --------------- | ---------------- | ------------------------------- | -------- |
| `label`         | 标签文本         | `string`                        | —        |
| `span`          | 占据的逻辑列数   | `number`                        | `1`      |
| `label-align`   | 当前标签对齐方式 | `'left' \| 'center' \| 'right'` | 继承父级 |
| `content-align` | 当前内容对齐方式 | `'left' \| 'center' \| 'right'` | 继承父级 |
| `label-class`   | 当前标签类名     | `DescriptionsClass`             | —        |
| `content-class` | 当前内容类名     | `DescriptionsClass`             | —        |
| `label-style`   | 当前标签样式     | `CSSProperties`                 | —        |
| `content-style` | 当前内容样式     | `CSSProperties`                 | —        |

### DescriptionsItem Slots

| 插槽名    | 说明       |
| --------- | ---------- |
| `default` | 字段内容   |
| `label`   | 自定义标签 |

`ExDescriptionsItem` 是父组件解析的配置节点，必须作为 `ExDescriptions` 的直接子项使用。

<style scoped>
.demo-container {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
