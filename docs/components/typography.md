# Typography 排版

用于标题、正文、说明文字及独立文本效果。

## 文本层级

`variant` 决定文本的语义层级和默认排版；如果只需要改变字号，可单独使用 `size`。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography variant="display">智能运营中心</ex-typography>
  <ex-typography variant="heading">本月业务概览</ex-typography>
  <ex-typography variant="title">增长趋势</ex-typography>
  <ex-typography variant="body">统一展示业务数据、项目进度和客户动态。</ex-typography>
  <ex-typography variant="caption">数据更新于 2 分钟前</ex-typography>
  <ex-typography variant="overline">BUSINESS INSIGHT</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography variant="display">智能运营中心</ex-typography>
<ex-typography variant="heading">本月业务概览</ex-typography>
<ex-typography variant="title">增长趋势</ex-typography>
<ex-typography variant="body">统一展示业务数据、项目进度和客户动态。</ex-typography>
<ex-typography variant="caption">数据更新于 2 分钟前</ex-typography>
<ex-typography variant="overline">BUSINESS INSIGHT</ex-typography>
```

:::

## 文本来源

组件支持通过 `text` 属性或默认插槽提供内容；默认插槽的优先级高于 `text`。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography variant="body" text="通过 text 属性传入文本"></ex-typography>
  <ex-typography variant="body">通过默认插槽传入文本</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography variant="body" text="通过 text 属性传入文本"></ex-typography>
<ex-typography variant="body">通过默认插槽传入文本</ex-typography>
```

:::

## 渐变文本效果

`gradient` 是独立文本效果，默认使用从左到右的静态渐变，可应用于任意文本层级和 HTML 标签。静态模式展示完整渐变色带；需要让色带持续位移时，再显式添加 `gradient-animated`。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography
    variant="heading"
    gradient
    :custom-style="{ '--ex-typography-gradient': 'linear-gradient(90deg, #00d4ff 0%, #a86bff 50%, #ff3bd1 100%)' }"
  >
    静态渐变：跨区域业务增长 28.6%
  </ex-typography>
  <ex-typography
    variant="heading"
    gradient
    gradient-animated
    :custom-style="{ '--ex-typography-gradient': 'linear-gradient(90deg, #00ff88 0%, #00d4ff 35%, #ff00ff 100%)' }"
  >
    动态渐变：实时数据流
  </ex-typography>
  <ex-typography variant="body" gradient>正文同样可以使用渐变效果</ex-typography>
  <ex-typography variant="caption" gradient>渐变说明文字</ex-typography>
  <ex-typography
    tag="span"
    variant="body"
    gradient
    :custom-style="{ '--ex-typography-gradient': 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)' }"
  >
    自定义渐变色
  </ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography
  variant="heading"
  gradient
  :custom-style="{
    '--ex-typography-gradient': 'linear-gradient(90deg, #00d4ff 0%, #a86bff 50%, #ff3bd1 100%)',
  }"
>
  静态渐变：跨区域业务增长 28.6%
</ex-typography>
<ex-typography
  variant="heading"
  gradient
  gradient-animated
  :custom-style="{
    '--ex-typography-gradient': 'linear-gradient(90deg, #00ff88 0%, #00d4ff 35%, #ff00ff 100%)',
  }"
>
  动态渐变：实时数据流
</ex-typography>
<ex-typography variant="body" gradient>正文同样可以使用渐变效果</ex-typography>
<ex-typography variant="caption" gradient>渐变说明文字</ex-typography>
<ex-typography
  tag="span"
  variant="body"
  gradient
  :custom-style="{ '--ex-typography-gradient': 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)' }"
>
  自定义渐变色
</ex-typography>
```

:::

## 赛博朋克文字风格

`cyberpunk` 提供品牌展示字体、青紫色差和轻量霓虹阴影，不会默认引入持续闪烁；`display` 和 `heading` 即使不启用该属性，也会保留极轻的静态色差作为基础风格。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography variant="display" cyberpunk gradient>NEON COMMAND CENTER</ex-typography>
  <ex-typography variant="heading" cyberpunk>系统状态：ONLINE</ex-typography>
  <ex-typography variant="body" cyberpunk>终端链路已建立，等待下一条指令。</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography variant="display" cyberpunk gradient>NEON COMMAND CENTER</ex-typography>
<ex-typography variant="heading" cyberpunk>系统状态：ONLINE</ex-typography>
<ex-typography variant="body" cyberpunk>终端链路已建立，等待下一条指令。</ex-typography>
```

:::

## 尺寸与修饰

`size` 会覆盖变体的默认字号；`bold`、`italic`、`underline`、`glow` 和 `center` 可以独立组合使用。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography size="xs">Extra Small</ex-typography>
  <ex-typography size="sm">Small</ex-typography>
  <ex-typography size="md" bold>Medium Bold</ex-typography>
  <ex-typography size="lg" italic>Large Italic</ex-typography>
  <ex-typography size="xl" underline>Extra Large Underline</ex-typography>
  <ex-typography size="2xl" glow color="primary">2X Large Glow</ex-typography>
  <ex-typography size="3xl">3X Large</ex-typography>
  <ex-typography size="4xl">4X Large</ex-typography>
  <ex-typography center>Centered Text</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography size="xs">Extra Small</ex-typography>
<ex-typography size="sm">Small</ex-typography>
<ex-typography size="md" bold>Medium Bold</ex-typography>
<ex-typography size="lg" italic>Large Italic</ex-typography>
<ex-typography size="xl" underline>Extra Large Underline</ex-typography>
<ex-typography size="2xl" glow color="primary">2X Large Glow</ex-typography>
<ex-typography size="3xl">3X Large</ex-typography>
<ex-typography size="4xl">4X Large</ex-typography>
<ex-typography center>Centered Text</ex-typography>
```

:::

## 文本截断

::: raw

<div class="vp-raw demo-container typography-truncate">
  <ex-typography truncate>
    单行内容过长时显示省略号，并保持当前容器布局稳定。
  </ex-typography>
  <ex-typography truncate :max-lines="2">
    多行文本可通过 max-lines 指定保留行数。组件在达到限制后截断剩余内容，适合列表摘要、卡片说明和搜索结果等紧凑场景。
  </ex-typography>
  <ex-typography
    text="使用 text 属性传入完整文本，截断后会自动提供 title 提示。"
    truncate
  />
</div>
:::

::: details 查看示例代码

```vue
<ex-typography truncate>
  单行内容过长时显示省略号，并保持当前容器布局稳定。
</ex-typography>
<ex-typography truncate :max-lines="2">
  多行文本可通过 max-lines 指定保留行数。组件在达到限制后截断剩余内容，适合列表摘要、卡片说明和搜索结果等紧凑场景。
</ex-typography>
<ex-typography text="使用 text 属性传入完整文本，截断后会自动提供 title 提示。" truncate />
```

:::

通过 `text` 属性传入内容并启用截断时，组件会自动将完整文本放入 `title` 提示；使用默认插槽时，请按需自行传入 `title` 或 `aria-label`。

## 标签与颜色

`tag` 控制最终渲染的 HTML 标签，`color` 既支持已注册的语义色，也支持原始 CSS 颜色值。

::: raw

<div class="vp-raw demo-container typography-stack">
  <ex-typography tag="h2" variant="title">语义化 H2 标题</ex-typography>
  <ex-typography tag="span" color="success">已完成</ex-typography>
  <ex-typography tag="span" color="#8b5cf6">自定义 CSS 颜色</ex-typography>
  <ex-typography tag="label" color="text-secondary">表单说明标签</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-typography tag="h2" variant="title">语义化 H2 标题</ex-typography>
<ex-typography tag="span" color="success">已完成</ex-typography>
<ex-typography tag="span" color="#8b5cf6">自定义 CSS 颜色</ex-typography>
<ex-typography tag="label" color="text-secondary">表单说明标签</ex-typography>
```

:::

## API

### Props

| 参数               | 说明                                        | 类型                                                            | 默认值              |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------- | ------------------- |
| `text`             | 无默认插槽时显示的文本                      | `string`                                                        | —                   |
| `tag`              | HTML 标签                                   | `h1 \| h2 \| h3 \| h4 \| h5 \| h6 \| p \| span \| div \| label` | 根据 `variant` 推导 |
| `variant`          | 文本层级                                    | `display \| heading \| title \| body \| caption \| overline`    | `body`              |
| `size`             | 字号                                        | `xs \| sm \| md \| lg \| xl \| 2xl \| 3xl \| 4xl`               | `md`                |
| `color`            | 主题色名或有效 CSS 颜色                     | `TypographyColor \| string`                                     | `text-primary`      |
| `truncate`         | 是否截断文本                                | `boolean`                                                       | `false`             |
| `maxLines`         | 截断时保留的最大行数，非整数会向下取整      | `number`                                                        | `1`                 |
| `gradient`         | 是否启用渐变文本效果                        | `boolean`                                                       | `false`             |
| `gradientAnimated` | 是否启用渐变背景动态位移（需要 `gradient`） | `boolean`                                                       | `false`             |
| `cyberpunk`        | 是否启用赛博朋克文字风格                    | `boolean`                                                       | `false`             |
| `glow`             | 是否启用发光效果                            | `boolean`                                                       | `false`             |
| `center`           | 是否居中                                    | `boolean`                                                       | `false`             |
| `bold`             | 是否加粗                                    | `boolean`                                                       | `false`             |
| `italic`           | 是否斜体                                    | `boolean`                                                       | `false`             |
| `underline`        | 是否显示下划线                              | `boolean`                                                       | `false`             |
| `customStyle`      | 合并到根元素的样式                          | `CSSProperties`                                                 | —                   |

在 Vue 模板中，驼峰属性使用 kebab-case：`max-lines`、`gradient-animated` 和 `custom-style`。

### Slots

| 名称      | 说明                        |
| --------- | --------------------------- |
| `default` | 文本内容，优先级高于 `text` |

<style scoped>
.typography-stack {
  display: grid;
  gap: 12px;
}

.typography-truncate {
  display: grid;
  gap: 18px;
  max-width: 520px;
}
</style>
