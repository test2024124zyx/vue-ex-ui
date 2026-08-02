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

::: details 查看示例代码

```vue
<ex-button type="default">默认操作</ex-button>
<ex-button type="primary">主要操作</ex-button>
<ex-button type="secondary">次要操作</ex-button>
```

:::

## 类型与状态

不同 `type` 用于表达操作优先级、结果状态或弱强调交互。`ghost` 保留半透明底色、切角和可见边框，适合次级但仍需明确边界的操作；`text` 不绘制边框，只提供文字级悬停与按下反馈，适合工具栏或低干扰操作。

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

::: details 查看示例代码

```vue
<ex-button type="success">通过</ex-button>
<ex-button type="warning">待确认</ex-button>
<ex-button type="danger">删除</ex-button>
<ex-button type="info">详情</ex-button>
<ex-button type="ghost">幽灵按钮</ex-button>
<ex-button type="text">文本按钮</ex-button>
<ex-button type="link">链接按钮</ex-button>
```

:::

## 光效

主按钮和状态按钮默认使用发光反馈；`default`、`secondary`、`ghost`、`text`、`link` 保持克制。设置 `:glow="true"` 可对任意变体显式启用，设置 `:glow="false"` 可关闭。桌面悬停发光按钮时，会由伪元素复制当前可见文字，再通过 `clip-path: inset(...)` 分片、青/洋红色差和离散位移完成一次性撕裂；它不是持续抖动，也不会改变按钮真实内容。

在 `ExConfigProvider` 中设置 `neonEffect="false"` 会统一关闭按钮发光、扫光与撕裂层；设置 `animation="false"` 会关闭悬停位移、撕裂、扫光过渡和加载旋转。系统启用 `prefers-reduced-motion` 或高对比度模式时，也会自动隐藏撕裂层。

::: raw

<div class="vp-raw demo-container button-row">
  <ex-button type="primary">主按钮默认光效</ex-button>
  <ex-button type="primary" :glow="false">主按钮关闭光效</ex-button>
  <ex-button type="secondary">次要按钮无默认光效</ex-button>
  <ex-button type="secondary" :glow="true">次要按钮显式发光</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<ex-button type="primary">主按钮默认光效</ex-button>
<ex-button type="primary" :glow="false">主按钮关闭光效</ex-button>
<ex-button type="secondary">次要按钮无默认光效</ex-button>
<ex-button type="secondary" :glow="true">次要按钮显式发光</ex-button>
```

:::

## 赛博朋克边框形态

`default` 使用现有的左上/右下切角；`slice`、`slant`、`bracket`、`hex` 和 `notched` 提供不同的切面、括号、六边形与侧边凹口轮廓。它们只改变边框形态，不改变 `type` 的语义和发光策略。

::: raw

<div class="vp-raw demo-container button-row">
  <ex-button type="primary" shape="default">默认切角</ex-button>
  <ex-button type="primary" shape="slice">单侧斜切</ex-button>
  <ex-button type="secondary" shape="slant">平行斜面</ex-button>
  <ex-button type="success" shape="bracket">括号八边形</ex-button>
  <ex-button type="warning" shape="hex">六边形</ex-button>
  <ex-button type="danger" shape="notched">两侧凹口</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<ex-button type="primary" shape="default">默认切角</ex-button>
<ex-button type="primary" shape="slice">单侧斜切</ex-button>
<ex-button type="secondary" shape="slant">平行斜面</ex-button>
<ex-button type="success" shape="bracket">括号八边形</ex-button>
<ex-button type="warning" shape="hex">六边形</ex-button>
<ex-button type="danger" shape="notched">两侧凹口</ex-button>
```

:::

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

::: details 查看示例代码

```vue
<ex-button type="primary" plain>主要</ex-button>
<ex-button type="secondary" plain>次要</ex-button>
<ex-button type="success" plain>成功</ex-button>
<ex-button type="warning" plain>警告</ex-button>
<ex-button type="danger" plain>危险</ex-button>
```

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
  <ex-button shape="circle" ariaLabel="搜索">
    <ex-icon icon="search-line" />
  </ex-button>
</div>
:::

::: details 查看示例代码

```vue
<ex-button size="small">小型</ex-button>
<ex-button size="medium">中型</ex-button>
<ex-button size="large">大型</ex-button>
<ex-button shape="round">圆角按钮</ex-button>
<ex-button shape="circle">发</ex-button>
<ex-button shape="circle">审批</ex-button>
<ex-button shape="circle" ariaLabel="搜索">
  <ex-icon icon="search-line" />
</ex-button>
```

:::

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

::: details 查看示例代码

```vue
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
```

:::

## 块级按钮

::: raw

<div class="vp-raw demo-container button-block-demo">
  <ex-button type="primary" block>保存并继续</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<ex-button type="primary" block>保存并继续</ex-button>
```

:::

## 无障碍与交互约定

- 按钮始终使用原生 `<button>`，`nativeType` 默认值为 `button`；需要页面跳转时应使用 `ExLink`，不要用 `type="link"` 代替真实链接。
- 所有尺寸的按钮都保留至少 `44px` 的触控高度；圆形按钮保持 `44px × 44px`，`size` 只影响其中的文字和图标比例。
- 所有仅包含图标或没有内容的按钮都必须提供 `ariaLabel`；模板中也可以使用标准属性 `aria-label`。前置和后置插槽被视为装饰性图标，不承担按钮名称。
- 开发环境会提示缺少可访问名称的图标按钮；生产环境不会增加额外运行时开销。
- `loading` 会同时设置原生 `disabled` 和 `aria-busy="true"`，并保留按钮原有内容布局，避免加载图标切换造成尺寸跳动。图标按钮进入 loading 时请继续提供 `ariaLabel`。
- `class` 与 `style` 支持直接传入自定义类名和内联样式；组件仍会保留自己的状态类名。

## API

### Props

| 参数                       | 说明                                       | 类型                                                                                                        | 默认值       |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------ |
| `type`                     | 按钮类型                                   | `default \| primary \| secondary \| success \| warning \| danger \| error \| info \| text \| link \| ghost` | `default`    |
| `size`                     | 尺寸                                       | `small \| medium \| large`                                                                                  | 继承全局尺寸 |
| `shape`                    | 形态                                       | `default \| round \| circle \| slice \| slant \| bracket \| hex \| notched`                                 | `default`    |
| `plain`                    | 是否使用朴素样式                           | `boolean`                                                                                                   | `false`      |
| `glow`                     | 是否启用强调发光（显式传值可覆盖默认策略） | `boolean`                                                                                                   | 按变体策略   |
| `disabled`                 | 是否禁用                                   | `boolean`                                                                                                   | `false`      |
| `loading`                  | 是否加载中                                 | `boolean`                                                                                                   | `false`      |
| `block`                    | 是否占满父容器宽度                         | `boolean`                                                                                                   | `false`      |
| `nativeType`               | 原生按钮类型                               | `button \| submit \| reset`                                                                                 | `button`     |
| `autofocus`                | 是否自动聚焦                               | `boolean`                                                                                                   | `false`      |
| `ariaLabel` / `aria-label` | 无障碍名称；图标按钮或空按钮必须提供       | `string`                                                                                                    | —            |

### 其他属性

`class`、`style` 是组件公开属性，类型分别为 `string | string[] | Record<string, boolean>` 和 `string | Record<string, string | number>`。

### Events

| 事件名  | 参数                  |
| ------- | --------------------- |
| `click` | `(event: MouseEvent)` |
| `focus` | `(event: FocusEvent)` |
| `blur`  | `(event: FocusEvent)` |

### Slots

| 名称      | 说明           |
| --------- | -------------- |
| `default` | 按钮内容       |
| `prefix`  | 前置图标       |
| `suffix`  | 后置图标       |
| `loading` | 自定义加载图标 |

### Exposes

| 方法         | 类型                              |
| ------------ | --------------------------------- |
| `focus`      | `() => void`                      |
| `blur`       | `() => void`                      |
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
