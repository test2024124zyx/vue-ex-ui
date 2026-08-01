# Button 按钮

用于触发即时操作或提交表单。

## 按钮层级

默认、主要和次要按钮具有明确的视觉层级，悬停时保持文字对比度。

::: raw
<div class="vp-raw demo-container button-row">
  <ex-button type="default">默认操作</ex-button>
  <ex-button type="primary">主要操作</ex-button>
  <ex-button type="secondary">次要操作</ex-button>
</div>
:::

```vue
<ex-button type="default">默认操作</ex-button>
<ex-button type="primary">主要操作</ex-button>
<ex-button type="secondary">次要操作</ex-button>
```

## 状态类型

::: raw
<div class="vp-raw demo-container button-row">
  <ex-button type="success">通过</ex-button>
  <ex-button type="warning">待确认</ex-button>
  <ex-button type="danger">删除</ex-button>
  <ex-button type="info">详情</ex-button>
  <ex-button type="ghost">幽灵按钮</ex-button>
  <ex-button type="text">文本按钮</ex-button>
  <ex-button type="link">链接按钮</ex-button>
</div>
:::

## 光效

光效默认开启。设置 `:glow="false"` 后，悬停只保留颜色和位移反馈。

::: raw
<div class="vp-raw demo-container button-row">
  <ex-button type="primary">默认光效</ex-button>
  <ex-button type="primary" :glow="false">关闭光效</ex-button>
  <ex-button type="secondary">次要按钮光效</ex-button>
  <ex-button type="secondary" :glow="false">次要按钮无光效</ex-button>
</div>
:::

```vue
<ex-button type="primary">默认光效</ex-button>
<ex-button type="primary" :glow="false">关闭光效</ex-button>
```

## 朴素按钮

::: raw
<div class="vp-raw demo-container button-row">
  <ex-button type="primary" plain>主要</ex-button>
  <ex-button type="secondary" plain>次要</ex-button>
  <ex-button type="success" plain>成功</ex-button>
  <ex-button type="warning" plain>警告</ex-button>
  <ex-button type="danger" plain>危险</ex-button>
</div>
:::

## 尺寸与形状

圆形按钮只展示默认插槽纯文本的第一个完整字形，并使用完整文本作为无障碍名称。

::: raw
<div class="vp-raw demo-container button-row button-row--center">
  <ex-button size="small">小型</ex-button>
  <ex-button size="medium">中型</ex-button>
  <ex-button size="large">大型</ex-button>
  <ex-button shape="round">圆角按钮</ex-button>
  <ex-button shape="circle">发</ex-button>
  <ex-button shape="circle">审批</ex-button>
  <ex-button shape="circle" aria-label="搜索">
    <ex-icon icon="search-line" />
  </ex-button>
</div>
:::

```vue
<ex-button shape="circle">审批</ex-button>
<ex-button shape="circle" aria-label="搜索">
  <ex-icon icon="search-line" />
</ex-button>
```

## 图标、加载与禁用

::: raw
<div class="vp-raw demo-container button-row">
  <ex-button type="primary">
    <template #prefix><ex-icon icon="add-line" /></template>
    新建客户
  </ex-button>
  <ex-button type="secondary">
    导出报表
    <template #suffix><ex-icon icon="download-2-line" /></template>
  </ex-button>
  <ex-button loading>正在提交</ex-button>
  <ex-button disabled>不可操作</ex-button>
</div>
:::

## 块级按钮

::: raw
<div class="vp-raw demo-container button-block-demo">
  <ex-button type="primary" block>保存并继续</ex-button>
</div>
:::

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 按钮类型 | `default \| primary \| secondary \| success \| warning \| danger \| error \| info \| text \| link \| ghost` | `default` |
| `size` | 尺寸 | `small \| medium \| large` | 继承全局尺寸 |
| `shape` | 形状 | `default \| round \| circle` | `default` |
| `plain` | 是否使用朴素样式 | `boolean` | `false` |
| `glow` | 是否启用统一光效 | `boolean` | `true` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `loading` | 是否加载中 | `boolean` | `false` |
| `block` | 是否占满父容器宽度 | `boolean` | `false` |
| `nativeType` | 原生按钮类型 | `button \| submit \| reset` | `button` |
| `autofocus` | 是否自动聚焦 | `boolean` | `false` |
| `ariaLabel` | 无障碍名称 | `string` | — |

### Events

| 事件名 | 参数 |
| --- | --- |
| `click` | `(event: MouseEvent)` |
| `focus` | `(event: FocusEvent)` |
| `blur` | `(event: FocusEvent)` |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 按钮内容 |
| `prefix` | 前置图标 |
| `suffix` | 后置图标 |
| `loading` | 自定义加载图标 |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `focus` | `() => void` |
| `blur` | `() => void` |
| `getElement` | `() => HTMLButtonElement \| null` |

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.button-row--center {
  align-items: center;
}

.button-block-demo {
  max-width: 480px;
}
</style>
