# Grid 栅格

24 栅格系统，快速、响应式的栅格布局。

## 何时使用

- 需要精确控制列宽和响应式布局时
- 构建复杂的页面布局结构
- 需要使用 offset、push、pull 等高级功能
- 需要基于断点的响应式设计

**Grid vs Flex**：Grid 组件适合复杂的栅格布局，如果只需要简单的对齐和间距，建议使用 [Flex 组件](/components/flex)。

<script setup>
import { ExGrid, ExGridItem } from '../../src/components/grid'
</script>

## 基础用法

使用单一的一组 `ExGrid` 和 `ExGridItem` 栅格组件，就可以创建一个基本的栅格系统，所有列（ExGridItem）必须放在 `ExGrid` 内 默认没有间距。

<div class="demo-container">
   <ExGrid>
    <ExGridItem><div style="background:rgba(41, 171, 226, 0.3);">项目1</div></ExGridItem>
    <ExGridItem><div style="background:rgba(41, 171, 226, 0.3);">项目2</div></ExGridItem>
    <ExGridItem><div style="background:rgba(41, 171, 226, 0.3);">项目3</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12"><div style="background:rgba(41, 171, 226, 0.3);">项目1</div></ExGridItem>
    <ExGridItem :span="12"><div style="background:rgba(41, 171, 226, 0.3);">项目2</div></ExGridItem>
    <ExGridItem :span="24"><div style="background:rgba(41, 171, 226, 0.3);">项目3</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid>
    <ExGridItem><div>项目1</div></ExGridItem>
    <ExGridItem><div>项目2</div></ExGridItem>
    <ExGridItem><div>项目3</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12"><div>项目1</div></ExGridItem>
    <ExGridItem :span="12"><div>项目2</div></ExGridItem>
    <ExGridItem :span="24"><div>项目3</div></ExGridItem>
  </ExGrid>
</template>
```


## 自动等宽列

设置 `span="auto"` 可以让列自动等宽分配剩余空间，类似 Bootstrap 的 `.col` 类。

<div class="demo-container">
  <ExGrid :gutter="16">
    <ExGridItem span="auto"><div class="grid-content">自动宽度</div></ExGridItem>
    <ExGridItem span="auto"><div class="grid-content">自动宽度</div></ExGridItem>
    <ExGridItem span="auto"><div class="grid-content">自动宽度</div></ExGridItem>
  </ExGrid>
  
  <ExGrid :gutter="16" style="margin-top: 16px;">
    <ExGridItem span="auto"><div class="grid-content">自动</div></ExGridItem>
    <ExGridItem :span="12"><div class="grid-content">固定12列</div></ExGridItem>
    <ExGridItem span="auto"><div class="grid-content">自动</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <!-- 三列等宽 -->
  <ExGrid :gutter="16">
    <ExGridItem span="auto"><div>自动宽度</div></ExGridItem>
    <ExGridItem span="auto"><div>自动宽度</div></ExGridItem>
    <ExGridItem span="auto"><div>自动宽度</div></ExGridItem>
  </ExGrid>

  <!-- 混合使用：固定宽度 + 自动宽度 -->
  <ExGrid :gutter="16">
    <ExGridItem span="auto"><div>自动</div></ExGridItem>
    <ExGridItem :span="12"><div>固定12列</div></ExGridItem>
    <ExGridItem span="auto"><div>自动</div></ExGridItem>
  </ExGrid>
</template>
```

<div class="demo-container">
  <ExGrid>
    <ExGridItem :span="24"><div class="grid-content">span: 24</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12"><div class="grid-content">span: 12</div></ExGridItem>
    <ExGridItem :span="12"><div class="grid-content grid-content-dark">span: 12</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="8"><div class="grid-content">span: 8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-content grid-content-dark">span: 8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-content">span: 8</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark">span: 6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid>
    <ExGridItem :span="24"><div class="grid-content">span: 24</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12"><div class="grid-content">span: 12</div></ExGridItem>
    <ExGridItem :span="12"><div class="grid-content">span: 12</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="8"><div class="grid-content">span: 8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-content">span: 8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-content">span: 8</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">span: 6</div></ExGridItem>
  </ExGrid>
</template>
```

## 栅格间隔

通过 `gutter` 属性设置栅格之间的间隔。支持数字、预设值（'xs', 'sm', 'md', 'lg', 'xl'）和数组。

<div class="demo-container">
  <p class="demo-label">预设值：gutter="sm" (8px)</p>
  <ExGrid gutter="sm">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">预设值：gutter="lg" (24px)</p>
  <ExGrid gutter="lg">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <!-- 使用预设值 -->
  <ExGrid gutter="sm">
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
  </ExGrid>

  <!-- 使用数字 -->
  <ExGrid :gutter="16">
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
    <ExGridItem :span="6">col-6</ExGridItem>
  </ExGrid>
</template>
```

### Gutter 预设值

| 预设值 | 像素值 | 使用场景 |
|--------|--------|---------|
| xs | 4px | 紧凑布局 |
| sm | 8px | 密集内容 |
| md | 16px | 标准间距（推荐） |
| lg | 24px | 宽松布局 |
| xl | 32px | 超大间距 |

## 自定义间隔

通过 `gutter` 属性设置栅格之间的间隔。

<div class="demo-container">
  <ExGrid :gutter="16">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid :gutter="16">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>
</template>
```

## 水平和垂直间隔

通过数组形式设置水平和垂直方向的间隔，`[水平间隔, 垂直间隔]`。

<div class="demo-container">
  <ExGrid :gutter="[16, 24]">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid :gutter="[16, 24]">
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content">col-6</div></ExGridItem>
  </ExGrid>
</template>
```

## 偏移列

通过 `offset` 属性设置栅格的偏移量，向右偏移指定的列数。

<div class="demo-container">
  <ExGrid>
    <ExGridItem :span="8"><div class="grid-content">col-8</div></ExGridItem>
    <ExGridItem :span="8" :offset="8"><div class="grid-content">col-8 offset-8</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="6" :offset="6"><div class="grid-content">col-6 offset-6</div></ExGridItem>
    <ExGridItem :span="6" :offset="6"><div class="grid-content">col-6 offset-6</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12" :offset="6"><div class="grid-content">col-12 offset-6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid>
    <ExGridItem :span="8"><div class="grid-content">col-8</div></ExGridItem>
    <ExGridItem :span="8" :offset="8"><div class="grid-content">col-8 offset-8</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="6" :offset="6"><div class="grid-content">col-6 offset-6</div></ExGridItem>
    <ExGridItem :span="6" :offset="6"><div class="grid-content">col-6 offset-6</div></ExGridItem>
  </ExGrid>
  <ExGrid>
    <ExGridItem :span="12" :offset="6"><div class="grid-content">col-12 offset-6</div></ExGridItem>
  </ExGrid>
</template>
```

## 对齐方式

通过 `justify` 和 `align` 属性设置栅格的对齐方式。

<div class="demo-container">
  <p class="demo-label">justify: start (默认)</p>
  <ExGrid justify="start">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content grid-content-dark">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">justify: center</p>
  <ExGrid justify="center">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content grid-content-dark">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">justify: end</p>
  <ExGrid justify="end">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content grid-content-dark">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">justify: space-between</p>
  <ExGrid justify="space-between">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content grid-content-dark">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">justify: space-around</p>
  <ExGrid justify="space-around">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content grid-content-dark">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid justify="start">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <ExGrid justify="center">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <ExGrid justify="end">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <ExGrid justify="space-between">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>

  <ExGrid justify="space-around">
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
    <ExGridItem :span="4"><div class="grid-content">col-4</div></ExGridItem>
  </ExGrid>
</template>
```

## 垂直对齐

通过 `align` 属性设置栅格的垂直对齐方式。

<div class="demo-container">
  <p class="demo-label">align: top (默认)</p>
  <ExGrid align="top">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">align: middle</p>
  <ExGrid align="middle">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>

  <p class="demo-label">align: bottom</p>
  <ExGrid align="bottom">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content grid-content-dark" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid align="top">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>

  <ExGrid align="middle">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>

  <ExGrid align="bottom">
    <ExGridItem :span="6"><div class="grid-content" style="height: 80px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 40px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 100px">col-6</div></ExGridItem>
    <ExGridItem :span="6"><div class="grid-content" style="height: 60px">col-6</div></ExGridItem>
  </ExGrid>
</template>
```

## 左右偏移

通过 `push` 和 `pull` 属性改变栅格的位置。`push` 向右移动，`pull` 向左移动。

<div class="demo-container">
  <ExGrid>
    <ExGridItem :span="8" :push="8"><div class="grid-content">col-8 push-8</div></ExGridItem>
    <ExGridItem :span="8" :pull="8"><div class="grid-content grid-content-dark">col-8 pull-8</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid>
    <ExGridItem :span="8" :push="8"><div class="grid-content">col-8 push-8</div></ExGridItem>
    <ExGridItem :span="8" :pull="8"><div class="grid-content">col-8 pull-8</div></ExGridItem>
  </ExGrid>
</template>
```

## 排序

通过 `order` 属性改变栅格的排列顺序。

<div class="demo-container">
  <ExGrid>
    <ExGridItem :span="6" :order="4"><div class="grid-content">1 | order: 4</div></ExGridItem>
    <ExGridItem :span="6" :order="3"><div class="grid-content grid-content-dark">2 | order: 3</div></ExGridItem>
    <ExGridItem :span="6" :order="2"><div class="grid-content">3 | order: 2</div></ExGridItem>
    <ExGridItem :span="6" :order="1"><div class="grid-content grid-content-dark">4 | order: 1</div></ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid>
    <ExGridItem :span="6" :order="4"><div class="grid-content">1 | order: 4</div></ExGridItem>
    <ExGridItem :span="6" :order="3"><div class="grid-content">2 | order: 3</div></ExGridItem>
    <ExGridItem :span="6" :order="2"><div class="grid-content">3 | order: 2</div></ExGridItem>
    <ExGridItem :span="6" :order="1"><div class="grid-content">4 | order: 1</div></ExGridItem>
  </ExGrid>
</template>
```

## 响应式布局

参照 Bootstrap 的响应式设计，预设六个响应尺寸：`xs`、`sm`、`md`、`lg`、`xl` 和 `xxl`。

<div class="demo-container">
  <ExGrid :gutter="16">
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content grid-content-dark">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content grid-content-dark">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content grid-content-dark">响应式</div>
    </ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid :gutter="16">
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
    <ExGridItem :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <div class="grid-content">响应式</div>
    </ExGridItem>
  </ExGrid>
</template>
```

## 响应式配置对象

也可以使用对象的形式同时设置 `span`、`offset` 和 `order`。

<div class="demo-container">
  <ExGrid :gutter="16">
    <ExGridItem :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 8, offset: 8 }" :lg="{ span: 6, offset: 2 }">
      <div class="grid-content">响应式配置</div>
    </ExGridItem>
    <ExGridItem :xs="{ span: 24 }" :sm="{ span: 12 }" :md="{ span: 8 }" :lg="{ span: 6, offset: 2 }">
      <div class="grid-content grid-content-dark">响应式配置</div>
    </ExGridItem>
  </ExGrid>
</div>

```vue
<template>
  <ExGrid :gutter="16">
    <ExGridItem 
      :xs="{ span: 24 }" 
      :sm="{ span: 12 }" 
      :md="{ span: 8, offset: 8 }" 
      :lg="{ span: 6, offset: 2 }"
    >
      <div class="grid-content">响应式配置</div>
    </ExGridItem>
    <ExGridItem 
      :xs="{ span: 24 }" 
      :sm="{ span: 12 }" 
      :md="{ span: 8 }" 
      :lg="{ span: 6, offset: 2 }"
    >
      <div class="grid-content">响应式配置</div>
    </ExGridItem>
  </ExGrid>
</template>
```

## API

### Grid Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| gutter | 栅格间隔，支持数字、预设值或数组 [水平间隔, 垂直间隔]<br>预设值：'xs'(4px), 'sm'(8px), 'md'(16px), 'lg'(24px), 'xl'(32px) | `number \| [number, number] \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `0` |
| justify | 水平对齐方式 | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` |
| align | 垂直对齐方式 | `'top' \| 'middle' \| 'bottom' \| 'stretch'` | `'top'` |
| wrap | 是否自动换行 | `boolean` | `true` |

### GridItem Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| span | 栅格占位格数，为 0 时相当于 display: none<br>设置为 'auto' 时自动等宽分配剩余空间 | `number \| 'auto'` | `24` |
| offset | 栅格左侧的间隔格数，间隔内不可以有栅格 | `number` | `0` |
| push | 栅格向右移动格数 | `number` | `0` |
| pull | 栅格向左移动格数 | `number` | `0` |
| order | 栅格顺序，使用 flex order 属性 | `number` | `0` |
| xs | `<480px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |
| sm | `≥480px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |
| md | `≥768px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |
| lg | `≥1024px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |
| xl | `≥1280px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |
| xxl | `≥1536px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | `number \| ResponsiveValue` | - |

### ResponsiveValue

响应式栅格配置对象：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| span | 栅格占位格数 | `number` |
| offset | 栅格左侧的间隔格数 | `number` |
| push | 栅格向右移动格数 | `number` |
| pull | 栅格向左移动格数 | `number` |
| order | 栅格顺序 | `number` |

**示例：**

```vue
<ExGridItem :md="{ span: 12, offset: 6, push: 2, pull: 0, order: 1 }">
  内容
</ExGridItem>
```

### 使用建议

1. **常用栅格值**：偶数栅格（2, 4, 6, 8...）和特殊值（1, 24）会使用预生成的 CSS 类，性能最优
2. **非常用值**：奇数栅格（3, 5, 7...）会使用内联样式 + CSS 变量，性能略低但仍然很好
3. **响应式栅格**：建议使用 4 的倍数（4, 8, 12, 16, 20, 24）以获得最佳性能

```vue
<!-- 推荐：使用常用值 -->
<ExGridItem :span="12" :md="8" :sm="6">
  高性能
</ExGridItem>

<!-- 可用：非常用值会自动优化 -->
<ExGridItem :span="7" :md="5">
  自动使用 CSS 变量
</ExGridItem>
```

## 最佳实践

1. **移动端优先**：从小屏幕开始设计，逐步适配大屏幕
2. **合理使用 gutter**：保持一致的间距系统（8px、16px、24px）
3. **避免过度嵌套**：Grid 嵌套层级不要超过 3 层
4. **响应式断点**：根据内容而非设备选择断点
5. **性能考虑**：大量栅格项时，优先使用常用栅格值

## 注意事项

1. **24 栅格系统**：总共 24 列，span 总和不应超过 24
2. **响应式优先级**：小断点的设置会被大断点覆盖
3. **offset 计算**：offset 会占用栅格空间，需要计入总宽度
4. **push/pull 区别**：push/pull 使用相对定位，不影响其他元素布局；offset 使用 margin，会影响布局
5. **浏览器兼容性**：
   - 基于 Flexbox 实现，支持所有现代浏览器
   - gap 属性在旧浏览器中自动降级为 margin/padding 方案
   - CSS 变量需要浏览器支持（IE 11+ 不支持，已提供降级方案）
6. **性能优化**：使用常用栅格值（偶数、1、24）可获得最佳性能

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
}

.demo-container .ex-grid {
  margin-bottom: 16px;
}

.demo-container .ex-grid:last-child {
  margin-bottom: 0;
}

.demo-label {
  margin: 16px 0 8px;
  font-size: 14px;
  color: var(--ex-color-text-secondary);
}

.demo-label:first-child {
  margin-top: 0;
}

.grid-content {
  padding: 16px 0;
  background: rgba(41, 171, 226, 0.3);
  color: var(--ex-color-text-primary);
  text-align: center;
  border-radius: 4px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-content-dark {
  background: rgba(41, 171, 226, 0.5);
}
</style>