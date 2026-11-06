# Divider 分割线

区隔内容的分割线。

## 基础用法

对不同章节的文本段落进行分割。

::: raw
<div class="demo-container">
  <p>
    Steven Paul Jobs (February 24, 1955 – October 5, 2011) was an American entrepreneur, business magnate, inventor, and industrial designer. He was the chairman, chief executive officer (CEO), and co-founder of Apple Inc.
  </p>
  <ex-divider />
  <p>
    He was born in San Francisco, California, and put up for adoption. Jobs was adopted by Clara and Paul Jobs, and grew up in Mountain View, California, which was part of the Santa Clara Valley that would later become known as Silicon Valley.
  </p>
  <ex-divider />
  <p>
    In late 1973, Jobs took a job as a technician at Atari, Inc. in Los Gatos, California. He traveled to India in mid-1974 to visit Neem Karoli Baba at his Kainchi Dham ashram with his Reed friend Dan Kottke, searching for spiritual enlightenment.
  </p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>
      Steven Paul Jobs (February 24, 1955 – October 5, 2011) was an American entrepreneur, business
      magnate, inventor, and industrial designer. He was the chairman, chief executive officer
      (CEO), and co-founder of Apple Inc.
    </p>
    <ex-divider />
    <p>
      He was born in San Francisco, California, and put up for adoption. Jobs was adopted by Clara
      and Paul Jobs, and grew up in Mountain View, California, which was part of the Santa Clara
      Valley that would later become known as Silicon Valley.
    </p>
    <ex-divider />
    <p>
      In late 1973, Jobs took a job as a technician at Atari, Inc. in Los Gatos, California. He
      traveled to India in mid-1974 to visit Neem Karoli Baba at his Kainchi Dham ashram with his
      Reed friend Dan Kottke, searching for spiritual enlightenment.
    </p>
  </div>
</template>
```

:::

## 带文字的分割线

分割线中带有文字，可以用 `orientation` 指定文字位置。

::: raw
<div class="demo-container">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
  <ex-divider>Text</ex-divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
  <ex-divider orientation="left">Left Text</ex-divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
  <ex-divider orientation="right">Right Text</ex-divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
    <ex-divider>Text</ex-divider>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
    <ex-divider orientation="left">Left Text</ex-divider>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
    <ex-divider orientation="right">Right Text</ex-divider>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
  </div>
</template>
```

:::

## 垂直分割线

使用 `type="vertical"` 设置为行内的垂直分割线。

::: raw
<div class="demo-container">
  <span>Text</span>
  <ex-divider type="vertical" />
  <a href="#">Link</a>
  <ex-divider type="vertical" />
  <a href="#">Link</a>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <span>Text</span>
    <ex-divider type="vertical" />
    <a href="#">Link</a>
    <ex-divider type="vertical" />
    <a href="#">Link</a>
  </div>
</template>
```

:::

## 分割线样式

使用 `dashed` 可以设置为虚线。

::: raw
<div class="demo-container">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
  <ex-divider dashed />
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
  <ex-divider dashed>With Text</ex-divider>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.
  </p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
    <ex-divider dashed />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
    <ex-divider dashed>With Text</ex-divider>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
      probare, quae sunt a te dicta? Refert tamen, quo modo.
    </p>
  </div>
</template>
```

:::

## 分割线颜色

自定义分割线颜色。

::: raw
<div class="demo-container">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <ex-divider color="#7cb305" />
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <ex-divider color="#7cb305">Green Text</ex-divider>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <ex-divider color="#00f0ff">Neon Blue</ex-divider>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <ex-divider color="#ff007f" dashed>Neon Pink Dashed</ex-divider>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <ex-divider color="#7cb305" />
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <ex-divider color="#7cb305">Green Text</ex-divider>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <ex-divider color="#00f0ff">Neon Blue</ex-divider>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <ex-divider
      color="#ff007f"
      dashed
    >
      Neon Pink Dashed
    </ex-divider>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  </div>
</template>
```

:::

## 分割线尺寸

通过 `size` 属性设置分割线的粗细。

::: raw
<div class="demo-container">
  <p>Default size</p>
  <ex-divider />
  <p>Small size</p>
  <ex-divider size="small" />
  <p>Large size</p>
  <ex-divider size="large" />
  <p>Custom size</p>
  <ex-divider :size="5" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>Default size</p>
    <ex-divider />
    <p>Small size</p>
    <ex-divider size="small" />
    <p>Large size</p>
    <ex-divider size="large" />
    <p>Custom size</p>
    <ex-divider :size="5" />
  </div>
</template>
```

:::

## 分割线间距

通过 `margin` 属性设置分割线的上下间距。

::: raw
<div class="demo-container">
  <p>Default margin</p>
  <ex-divider />
  <p>Small margin</p>
  <ex-divider margin="8px" />
  <p>Large margin</p>
  <ex-divider margin="32px" />
  <p>No margin</p>
  <ex-divider margin="0" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <p>Default margin</p>
    <ex-divider />
    <p>Small margin</p>
    <ex-divider margin="8px" />
    <p>Large margin</p>
    <ex-divider margin="32px" />
    <p>No margin</p>
    <ex-divider margin="0" />
  </div>
</template>
```

:::

## API

### Divider Props

| 参数               | 说明                                                   | 类型                                        | 默认值         |
| ------------------ | ------------------------------------------------------ | ------------------------------------------- | -------------- |
| type               | 分割线方向                                             | `'horizontal' \| 'vertical'`                | `'horizontal'` |
| orientation        | 水平标题的位置                                         | `'left' \| 'center' \| 'right'`             | `'center'`     |
| orientation-margin | 标题与最近一侧线段的距离，仅 left/right 且有标题时生效 | `string \| number`                          | -              |
| dashed             | 是否使用虚线                                           | `boolean`                                   | `false`        |
| size               | 预设粗细或正数像素值                                   | `'small' \| 'default' \| 'large' \| number` | `'default'`    |
| margin             | 水平线的上下间距或垂直线的左右间距                     | `string \| number`                          | -              |
| plain              | 标题是否使用普通正文权重，仅有标题时生效               | `boolean`                                   | `false`        |
| color              | 分割线颜色                                             | `string`                                    | -              |
| aria-label         | 可选的无障碍名称；普通装饰性分隔线无需设置             | `string`                                    | -              |

### Divider Slots

| 名称    | 说明                               |
| ------- | ---------------------------------- |
| default | 水平分割线标题；垂直模式忽略该插槽 |

### Divider CSS Variables

> 这些变量由对应 props 自动写入（`color` / `margin` / `size` / `orientationMargin`），通常无需手动设置；颜色默认取主题 `--ex-color-border-primary`，而非固定值。

| 变量名                            | 对应 prop           | 说明                                                  | 默认（回退）值                   |
| --------------------------------- | ------------------- | ----------------------------------------------------- | -------------------------------- |
| `--ex-divider-color`              | `color`             | 分割线颜色                                            | 主题 `--ex-color-border-primary` |
| `--ex-divider-margin`             | `margin`            | 主轴间距（水平为上下、垂直为左右）                    | 水平 `24px 0` / 垂直 `0 8px`     |
| `--ex-divider-size`               | `size`（数值时）    | 分割线粗细                                            | `1px`                            |
| `--ex-divider-orientation-margin` | `orientationMargin` | 标题侧短线占比/距离（仅 `orientation` 为 left/right） | `5%`                             |
