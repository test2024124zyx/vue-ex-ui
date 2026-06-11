# Typography 排版

Typography 组件用于展示各种文本内容，支持多种变体、尺寸和样式修饰符。

## 基础用法

最简单的文字展示。

::: raw
<div class="vp-raw demo-container">
  <ex-typography>这是默认的正文文本</ex-typography>
  <ex-typography class="vp-raw" variant="heading">这是标题文本</ex-typography>
  <ex-typography variant="caption">这是说明文本</ex-typography>
</div>
:::

```vue
<template>
  <ex-typography>这是默认的正文文本</ex-typography>
  <ex-typography variant="heading">这是标题文本</ex-typography>
  <ex-typography variant="caption">这是说明文本</ex-typography>
</template>
```

## 文本变体

Typography 支持多种文本变体，适用于不同的使用场景。


<div class="vp-raw demo-container">
  <ex-typography variant="display" class="demo-item">Display - 展示文本</ex-typography>
  <ex-typography variant="heading" class="demo-item">Heading - 标题文本</ex-typography>
  <ex-typography variant="title" class="demo-item">Title - 副标题文本</ex-typography>
  <ex-typography variant="body" class="demo-item">Body - 正文文本</ex-typography>
  <ex-typography variant="caption" class="demo-item">Caption - 说明文本</ex-typography>
  <ex-typography variant="overline" class="demo-item">OVERLINE - 上标文本</ex-typography>
</div>


```vue
<template>
  <ex-typography variant="display">Display - 展示文本</ex-typography>
  <ex-typography variant="heading">Heading - 标题文本</ex-typography>
  <ex-typography variant="title">Title - 副标题文本</ex-typography>
  <ex-typography variant="body">Body - 正文文本</ex-typography>
  <ex-typography variant="caption">Caption - 说明文本</ex-typography>
  <ex-typography variant="overline">OVERLINE - 上标文本</ex-typography>
</template>
```

## 文本尺寸

支持多种尺寸规格，从 xs 到 4xl。



  
<div class="vp-raw demo-container">
    <ex-typography size="xs" class="demo-item">Extra Small (xs)</ex-typography>
    <ex-typography size="sm" class="demo-item">Small (sm)</ex-typography>
    <ex-typography size="md" class="demo-item">Medium (md)</ex-typography>
    <ex-typography size="lg" class="demo-item">Large (lg)</ex-typography>
    <ex-typography size="xl" class="demo-item">Extra Large (xl)</ex-typography>
    <ex-typography size="2xl" class="demo-item">2X Large (2xl)</ex-typography>
    <ex-typography size="3xl" class="demo-item">3X Large (3xl)</ex-typography>
    <ex-typography size="4xl" class="demo-item">4X Large (4xl)</ex-typography>
</div>



```vue
<template>
  <ex-typography size="xs">Extra Small (xs)</ex-typography>
  <ex-typography size="sm">Small (sm)</ex-typography>
  <ex-typography size="md">Medium (md)</ex-typography>
  <ex-typography size="lg">Large (lg)</ex-typography>
  <ex-typography size="xl">Extra Large (xl)</ex-typography>
  <ex-typography size="2xl">2X Large (2xl)</ex-typography>
  <ex-typography size="3xl">3X Large (3xl)</ex-typography>
  <ex-typography size="4xl">4X Large (4xl)</ex-typography>
</template>
```

## 赛博朋克化效果

支持渐变色彩和发光效果，营造赛博氛围。



  <div class="demo-container dark-bg">
    <ex-typography variant="display" gradient glow class="demo-item">
      渐变发光文本
    </ex-typography>
    <ex-typography variant="heading" gradient class="demo-item">
      渐变文本
    </ex-typography>
    <ex-typography variant="title" glow class="demo-item">
      发光文本
    </ex-typography>
    <ex-typography variant="body" color="primary" class="demo-item">
      主色调文本
    </ex-typography>
  </div>


```vue
<template>
  <ex-typography variant="display" gradient glow>
    渐变发光文本
  </ex-typography>
  <ex-typography variant="heading" gradient>
    渐变文本
  </ex-typography>
  <ex-typography variant="title" glow>
    发光文本
  </ex-typography>
  <ex-typography variant="body" color="primary">
    主色调文本
  </ex-typography>
</template>
```

## 文本修饰

支持多种文本修饰效果。



<div class="vp-raw demo-container">
    <ex-typography bold class="demo-item">粗体文本</ex-typography>
    <ex-typography italic class="demo-item">斜体文本</ex-typography>
    <ex-typography underline class="demo-item">下划线文本</ex-typography>
    <ex-typography center class="demo-item">居中文本</ex-typography>
    <ex-typography truncate class="demo-item" style="width: 200px;">
      这是一段很长的文本，会被截断显示省略号
    </ex-typography>
  </div>


```vue
<template>
  <ex-typography bold>粗体文本</ex-typography>
  <ex-typography italic>斜体文本</ex-typography>
  <ex-typography underline>下划线文本</ex-typography>
  <ex-typography center>居中文本</ex-typography>
  <ex-typography truncate style="width: 200px;">
    这是一段很长的文本，会被截断显示省略号
  </ex-typography>
</template>
```

## 多行截断

支持多行文本截断。



<div class="vp-raw demo-container">
    <ex-typography 
      truncate 
      :max-lines="3" 
      class="demo-item"
      style="width: 300px;"
    >
      这是一段很长的文本内容，用来演示多行截断的效果。当文本超过指定的行数时，会显示省略号。这个功能在卡片布局和列表项中特别有用，可以保持界面的整洁和一致性。
    </ex-typography>
  </div>


```vue
<template>
  <ex-typography 
    truncate 
    :max-lines="3" 
    style="width: 300px;"
  >
    这是一段很长的文本内容，用来演示多行截断的效果...
  </ex-typography>
</template>
```

## HTML 标签

可以指定渲染的 HTML 标签。



<div class="vp-raw demo-container">
    <ex-typography tag="h1" class="demo-item">H1 标签</ex-typography>
    <ex-typography tag="h2" class="demo-item">H2 标签</ex-typography>
    <ex-typography tag="p" class="demo-item">P 标签</ex-typography>
    <ex-typography tag="span" class="demo-item">Span 标签</ex-typography>
    <ex-typography tag="div" class="demo-item">Div 标签</ex-typography>
  </div>


```vue
<template>
  <ex-typography tag="h1">H1 标签</ex-typography>
  <ex-typography tag="h2">H2 标签</ex-typography>
  <ex-typography tag="p">P 标签</ex-typography>
  <ex-typography tag="span">Span 标签</ex-typography>
  <ex-typography tag="div">Div 标签</ex-typography>
</template>
```

## 自定义样式

支持自定义样式和颜色。



<div class="vp-raw demo-container">
    <ex-typography 
      :custom-style="{ fontSize: '24px', fontWeight: 'bold' }"
      class="demo-item"
    >
      自定义字体大小和粗细
    </ex-typography>
    <ex-typography 
      color="secondary"
      class="demo-item"
    >
      次要颜色文本
    </ex-typography>
    <ex-typography 
      :custom-style="{ color: '#ff6b6b' }"
      class="demo-item"
    >
      自定义颜色文本
    </ex-typography>
  </div>


```vue
<template>
  <ex-typography 
    :custom-style="{ fontSize: '24px', fontWeight: 'bold' }"
  >
    自定义字体大小和粗细
  </ex-typography>
  <ex-typography color="secondary">
    次要颜色文本
  </ex-typography>
  <ex-typography :custom-style="{ color: '#ff6b6b' }">
    自定义颜色文本
  </ex-typography>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variant | 文本变体 | `'display' \| 'heading' \| 'title' \| 'body' \| 'caption' \| 'overline'` | `'body'` |
| size | 文本尺寸 | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'` | `'md'` |
| tag | HTML 标签 | `string` | 根据 variant 自动选择 |
| text | 文本内容 | `string` | - |
| color | 文本颜色 | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | - |
| truncate | 是否截断 | `boolean` | `false` |
| maxLines | 最大行数（truncate 为 true 时有效） | `number` | `1` |
| gradient | 是否使用渐变色 | `boolean` | `false` |
| glow | 是否使用发光效果 | `boolean` | `false` |
| center | 是否居中对齐 | `boolean` | `false` |
| bold | 是否粗体 | `boolean` | `false` |
| italic | 是否斜体 | `boolean` | `false` |
| underline | 是否下划线 | `boolean` | `false` |
| customStyle | 自定义样式 | `CSSProperties` | - |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 文本内容 |

### 默认标签映射

| Variant | 默认标签 |
| --- | --- |
| display | h1 |
| heading | h2 |
| title | h3 |
| body | p |
| caption | span |
| overline | span |
