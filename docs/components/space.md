# Space 间距

用于排列一组同级元素。

## 基础用法

::: raw
<div class="vp-raw demo-container">
  <ex-space>
    <ex-button>新建</ex-button>
    <ex-button type="secondary">导入</ex-button>
    <ex-button type="default">更多</ex-button>
  </ex-space>
</div>
:::

```vue
<ex-space>
  <ex-button>新建</ex-button>
  <ex-button type="secondary">导入</ex-button>
  <ex-button type="default">更多</ex-button>
</ex-space>
```

## 方向与尺寸

每个水平示例中的四个按钮使用相同交叉轴对齐方式。

::: raw
<div class="vp-raw demo-container space-size-demo">
  <div class="space-row">
    <span class="space-label">small</span>
    <ex-space direction="horizontal" size="small" align="center">
      <ex-button size="small">概览</ex-button>
      <ex-button size="small">客户</ex-button>
      <ex-button size="small">订单</ex-button>
      <ex-button size="small">报表</ex-button>
    </ex-space>
  </div>
  <div class="space-row">
    <span class="space-label">medium</span>
    <ex-space direction="horizontal" size="medium" align="center">
      <ex-button>概览</ex-button>
      <ex-button>客户</ex-button>
      <ex-button>订单</ex-button>
      <ex-button>报表</ex-button>
    </ex-space>
  </div>
  <div class="space-row">
    <span class="space-label">large</span>
    <ex-space direction="horizontal" size="large" align="center">
      <ex-button size="large">概览</ex-button>
      <ex-button size="large">客户</ex-button>
      <ex-button size="large">订单</ex-button>
      <ex-button size="large">报表</ex-button>
    </ex-space>
  </div>
  <div class="space-row space-row--vertical">
    <span class="space-label">vertical</span>
    <ex-space direction="vertical" size="small">
      <ex-button type="secondary">审核通过</ex-button>
      <ex-button type="default">退回修改</ex-button>
    </ex-space>
  </div>
</div>
:::

## 换行与对齐

::: raw
<div class="vp-raw demo-container space-wrap-demo">
  <ex-space wrap justify="space-between" align="center" :size="12">
    <ex-button type="default">北京</ex-button>
    <ex-button type="default">上海</ex-button>
    <ex-button type="default">深圳</ex-button>
    <ex-button type="default">杭州</ex-button>
    <ex-button type="default">成都</ex-button>
  </ex-space>
</div>
:::

```vue
<ex-space wrap justify="space-between" align="center" :size="12">
  <ex-button v-for="city in cities" :key="city">{{ city }}</ex-button>
</ex-space>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `direction` | 排列方向 | `horizontal \| vertical` | `horizontal` |
| `size` | 间距预设或像素值 | `small \| medium \| large \| number` | `medium` |
| `wrap` | 是否换行 | `boolean` | `false` |
| `align` | 交叉轴对齐 | `start \| center \| end` | `start` |
| `justify` | 主轴对齐 | `start \| center \| end \| space-between \| space-around \| space-evenly` | `start` |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 子元素 |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `getElement` | `() => HTMLElement \| null` |

<style scoped>
.space-size-demo {
  display: grid;
  gap: 18px;
  overflow-x: auto;
}

.space-row {
  display: grid;
  grid-template-columns: 72px minmax(max-content, 1fr);
  gap: 16px;
  align-items: center;
}

.space-row--vertical {
  align-items: start;
}

.space-label {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}

.space-wrap-demo {
  max-width: 520px;
}
</style>
