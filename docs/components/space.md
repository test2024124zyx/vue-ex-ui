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

Space 的预设与 Flex/Grid 共用同一套间距刻度。未显式传入 `size` 时，会继承最近一层 `ExConfigProvider` 的全局尺寸；没有配置时使用 `medium`。

| 预设     | 间距 Token       | 实际间距 |
| -------- | ---------------- | -------- |
| `small`  | `--ex-spacing-2` | `8px`    |
| `medium` | `--ex-spacing-4` | `16px`   |
| `large`  | `--ex-spacing-6` | `24px`   |

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

`wrap` 会同时使用相同的行间距和列间距；如果同时使用 `justify="space-between"`，剩余空间还会在每一行继续分配，因此实际项间距可能大于 `size`。

## 自定义间距

`size` 也接受非负数字（按像素处理）和 CSS 长度，例如 Token、`rem` 或 `clamp()`：

```vue
<ex-space size="var(--ex-spacing-4)">
  <ex-button>保存</ex-button>
  <ex-button type="default">取消</ex-button>
</ex-space>
```

## API

### Props

| 参数        | 说明                            | 类型                                                                      | 默认值       |
| ----------- | ------------------------------- | ------------------------------------------------------------------------- | ------------ |
| `direction` | 排列方向                        | `horizontal \| vertical`                                                  | `horizontal` |
| `size`      | 间距预设、非负像素值或 CSS 长度 | `small \| medium \| large \| number \| string`                            | `medium`     |
| `wrap`      | 是否换行                        | `boolean`                                                                 | `false`      |
| `align`     | 交叉轴对齐                      | `start \| center \| end`                                                  | `start`      |
| `justify`   | 主轴对齐                        | `start \| center \| end \| space-between \| space-around \| space-evenly` | `start`      |

非法数字会回退到默认间距；负数会收敛到 `0px`。当子项高度不一致时，建议使用 `align="center"`；需要基线对齐、独立行列间距或更复杂 Flex 能力时，请使用 `ExFlex`。

### Slots

| 名称      | 说明   |
| --------- | ------ |
| `default` | 子元素 |

### Exposes

| 方法         | 类型                        |
| ------------ | --------------------------- |
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
