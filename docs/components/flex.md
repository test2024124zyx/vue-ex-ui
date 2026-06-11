# Flex 弹性布局

弹性布局组件，基于 CSS Flexbox 实现，提供简单灵活的布局方式。

## 何时使用

- 需要快速实现元素的对齐和分布
- 组件内部的简单布局
- 不需要复杂的栅格系统
- 需要灵活的间距控制

**Flex vs Grid**：Flex 组件适合简单快速的布局，如果需要复杂的栅格系统和响应式设计，建议使用 [Grid 组件](/components/grid)。

<script setup>
import { ExFlex, ExFlexItem } from '../../src/components/flex'
import { ExButton } from '../../src/components/button'
import { ref } from 'vue'

const justify = ref('flex-start')
const align = ref('flex-start')
const direction = ref('row')
const gap = ref(16)
</script>

## 基础用法

最简单的弹性布局。

<div class="demo-container">
  <ExFlex>
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
    <div class="flex-item">Item 4</div>
  </ExFlex>
</div>

```vue
<template>
  <ExFlex>
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
    <div class="flex-item">Item 4</div>
  </ExFlex>
</template>
```

## 间隙设置

通过 `gap` 属性设置子元素之间的间隙。支持数字、预设值（'xs', 'sm', 'md', 'lg', 'xl'）和字符串。

### Gap 预设值

| 预设值 | 像素值 | 使用场景 |
|--------|--------|---------|
| xs | 4px | 紧凑布局 |
| sm | 8px | 密集内容 |
| md | 16px | 标准间距（推荐） |
| lg | 24px | 宽松布局 |
| xl | 32px | 超大间距 |

<div class="demo-container">
  <p class="demo-label">gap: 8</p>
  <ExFlex :gap="8">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <p class="demo-label">gap: 16</p>
  <ExFlex :gap="16">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <p class="demo-label">gap: 32</p>
  <ExFlex :gap="32">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <p class="demo-label">使用预设值：gap="sm"</p>
  <ExFlex gap="sm">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <p class="demo-label">使用预设值：gap="lg"</p>
  <ExFlex gap="lg">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>
</div>

```vue
<template>
  <!-- 使用数字 -->
  <ExFlex :gap="8">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <!-- 使用预设值 -->
  <ExFlex gap="md">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>

  <!-- 使用字符串 -->
  <ExFlex gap="2rem">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>
</template>
```

## 主轴对齐

通过 `justify` 属性控制主轴对齐方式。

<div class="demo-container">
  <div class="demo-controls">
    <ExButton size="small" @click="justify = 'flex-start'">flex-start</ExButton>
    <ExButton size="small" @click="justify = 'flex-end'">flex-end</ExButton>
    <ExButton size="small" @click="justify = 'center'">center</ExButton>
    <ExButton size="small" @click="justify = 'space-between'">space-between</ExButton>
    <ExButton size="small" @click="justify = 'space-around'">space-around</ExButton>
    <ExButton size="small" @click="justify = 'space-evenly'">space-evenly</ExButton>
  </div>
  
  <div class="demo-preview">
    <p class="demo-label">当前值: {{ justify }}</p>
    <ExFlex :justify="justify" class="demo-flex">
      <div class="flex-item-small">1</div>
      <div class="flex-item-small">2</div>
      <div class="flex-item-small">3</div>
    </ExFlex>
  </div>
</div>

```vue
<template>
  <ExFlex justify="flex-start">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
  </ExFlex>

  <ExFlex justify="center">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
  </ExFlex>

  <ExFlex justify="space-between">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
  </ExFlex>
</template>
```

## 交叉轴对齐

通过 `align` 属性控制交叉轴对齐方式。

<div class="demo-container">
  <div class="demo-controls">
    <ExButton size="small" @click="align = 'flex-start'">flex-start</ExButton>
    <ExButton size="small" @click="align = 'flex-end'">flex-end</ExButton>
    <ExButton size="small" @click="align = 'center'">center</ExButton>
    <ExButton size="small" @click="align = 'baseline'">baseline</ExButton>
    <ExButton size="small" @click="align = 'stretch'">stretch</ExButton>
  </div>
  
  <div class="demo-preview">
    <p class="demo-label">当前值: {{ align }}</p>
    <ExFlex :align="align" class="demo-flex-tall">
      <div class="flex-item-small">1</div>
      <div class="flex-item-small" style="height: 80px;">2</div>
      <div class="flex-item-small">3</div>
    </ExFlex>
  </div>
</div>

```vue
<template>
  <ExFlex align="flex-start">
    <div class="flex-item">1</div>
    <div class="flex-item" style="height: 80px;">2</div>
    <div class="flex-item">3</div>
  </ExFlex>

  <ExFlex align="center">
    <div class="flex-item">1</div>
    <div class="flex-item" style="height: 80px;">2</div>
    <div class="flex-item">3</div>
  </ExFlex>
</template>
```

## 垂直布局

使用 `vertical` 属性快速设置垂直布局。

<div class="demo-container">
  <ExFlex vertical :gap="16">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>
</div>

```vue
<template>
  <ExFlex vertical :gap="16">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </ExFlex>
</template>
```

## 换行

通过 `wrap` 属性控制是否换行。

<div class="demo-container">
  <p class="demo-label">wrap: nowrap (默认)</p>
  <ExFlex wrap="nowrap" :gap="8" class="demo-flex-wrap">
    <div class="flex-item-small" v-for="i in 10" :key="i">{{ i }}</div>
  </ExFlex>

  <p class="demo-label">wrap: wrap</p>
  <ExFlex wrap="wrap" :gap="8" class="demo-flex-wrap">
    <div class="flex-item-small" v-for="i in 10" :key="i">{{ i }}</div>
  </ExFlex>
</div>

```vue
<template>
  <ExFlex wrap="nowrap" :gap="8">
    <div class="flex-item" v-for="i in 10" :key="i">{{ i }}</div>
  </ExFlex>

  <ExFlex wrap="wrap" :gap="8">
    <div class="flex-item" v-for="i in 10" :key="i">{{ i }}</div>
  </ExFlex>
</template>
```

## 方向

通过 `direction` 属性控制 flex 方向。

<div class="demo-container">
  <div class="demo-controls">
    <ExButton size="small" @click="direction = 'row'">row</ExButton>
    <ExButton size="small" @click="direction = 'row-reverse'">row-reverse</ExButton>
    <ExButton size="small" @click="direction = 'column'">column</ExButton>
    <ExButton size="small" @click="direction = 'column-reverse'">column-reverse</ExButton>
  </div>
  
  <div class="demo-preview">
    <p class="demo-label">当前值: {{ direction }}</p>
    <ExFlex :direction="direction" :gap="8" class="demo-flex-direction">
      <div class="flex-item-small">1</div>
      <div class="flex-item-small">2</div>
      <div class="flex-item-small">3</div>
      <div class="flex-item-small">4</div>
    </ExFlex>
  </div>
</div>

```vue
<template>
  <ExFlex direction="row" :gap="8">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
  </ExFlex>

  <ExFlex direction="column" :gap="8">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
  </ExFlex>
</template>
```

## FlexItem 组件

使用 `ExFlexItem` 组件可以更精确地控制 flex 项目的属性。

<div class="demo-container">
  <p class="demo-label">使用 flex 属性</p>
  <ExFlex :gap="16">
    <ExFlexItem :flex="1">
      <div class="flex-item">flex: 1</div>
    </ExFlexItem>
    <ExFlexItem :flex="2">
      <div class="flex-item">flex: 2</div>
    </ExFlexItem>
    <ExFlexItem :flex="1">
      <div class="flex-item">flex: 1</div>
    </ExFlexItem>
  </ExFlex>

  <p class="demo-label">固定宽度 + 自适应</p>
  <ExFlex :gap="16">
    <ExFlexItem :basis="100" :shrink="0">
      <div class="flex-item">100px</div>
    </ExFlexItem>
    <ExFlexItem :flex="1">
      <div class="flex-item">自适应</div>
    </ExFlexItem>
    <ExFlexItem :basis="150" :shrink="0">
      <div class="flex-item">150px</div>
    </ExFlexItem>
  </ExFlex>

  <p class="demo-label">使用 order 调整顺序</p>
  <ExFlex :gap="16">
    <ExFlexItem :order="3">
      <div class="flex-item">1 (order: 3)</div>
    </ExFlexItem>
    <ExFlexItem :order="1">
      <div class="flex-item">2 (order: 1)</div>
    </ExFlexItem>
    <ExFlexItem :order="2">
      <div class="flex-item">3 (order: 2)</div>
    </ExFlexItem>
  </ExFlex>
</div>

```vue
<template>
  <!-- 使用 flex 属性 -->
  <ExFlex :gap="16">
    <ExFlexItem :flex="1">
      <div class="flex-item">flex: 1</div>
    </ExFlexItem>
    <ExFlexItem :flex="2">
      <div class="flex-item">flex: 2</div>
    </ExFlexItem>
    <ExFlexItem :flex="1">
      <div class="flex-item">flex: 1</div>
    </ExFlexItem>
  </ExFlex>

  <!-- 固定宽度 + 自适应 -->
  <ExFlex :gap="16">
    <ExFlexItem :basis="100" :shrink="0">
      <div class="flex-item">100px</div>
    </ExFlexItem>
    <ExFlexItem :flex="1">
      <div class="flex-item">自适应</div>
    </ExFlexItem>
    <ExFlexItem :basis="150" :shrink="0">
      <div class="flex-item">150px</div>
    </ExFlexItem>
  </ExFlex>

  <!-- 使用 order 调整顺序 -->
  <ExFlex :gap="16">
    <ExFlexItem :order="3">
      <div class="flex-item">1 (order: 3)</div>
    </ExFlexItem>
    <ExFlexItem :order="1">
      <div class="flex-item">2 (order: 1)</div>
    </ExFlexItem>
    <ExFlexItem :order="2">
      <div class="flex-item">3 (order: 2)</div>
    </ExFlexItem>
  </ExFlex>
</template>
```

## 内联 Flex

使用 `inline` 属性创建内联 flex 容器。

<div class="demo-container">
  <p>
    这是一段文字，
    <ExFlex inline :gap="8">
      <span class="inline-item">内联</span>
      <span class="inline-item">Flex</span>
      <span class="inline-item">容器</span>
    </ExFlex>
    ，继续文字内容。
  </p>
</div>

```vue
<template>
  <p>
    这是一段文字，
    <ExFlex inline :gap="8">
      <span class="inline-item">内联</span>
      <span class="inline-item">Flex</span>
      <span class="inline-item">容器</span>
    </ExFlex>
    ，继续文字内容。
  </p>
</template>
```

## API

### Flex Props

| 参数          | 说明                                               | 类型                                                                                            | 默认值         |
| ------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------- |
| direction     | flex-direction 的值                                | `'row' \| 'row-reverse' \| 'column' \| 'column-reverse'`                                        | `'row'`        |
| wrap          | flex-wrap 的值                                     | `'nowrap' \| 'wrap' \| 'wrap-reverse'`                                                          | `'nowrap'`     |
| justify       | justify-content 的值                               | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'flex-start'` |
| align         | align-items 的值                                   | `'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| 'stretch'`                             | `'flex-start'` |
| align-content | align-content 的值（仅在 wrap 不为 nowrap 时生效） | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'stretch'`      | `'stretch'`    |
| gap           | 间隙大小，支持数字、预设值或字符串<br>预设值：'xs'(4px), 'sm'(8px), 'md'(16px), 'lg'(24px), 'xl'(32px)    | `string \| number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                              | -              |
| row-gap       | 行间隙，优先级高于 gap，支持预设值                             | `string \| number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                              | -              |
| column-gap    | 列间隙，优先级高于 gap，支持预设值                             | `string \| number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                              | -              |
| inline        | 是否为内联 flex（display: inline-flex）            | `boolean`                                                                                       | `false`        |
| vertical      | 是否垂直布局（等同于 direction="column"）          | `boolean`                                                                                       | `false`        |

### FlexItem Props

| 参数       | 说明                                            | 类型                                                                          | 默认值   |
| ---------- | ----------------------------------------------- | ----------------------------------------------------------------------------- | -------- |
| flex       | flex 简写属性，设置后会覆盖 grow、shrink、basis | `string \| number`                                                            | -        |
| grow       | flex-grow 的值，元素的放大比例                  | `number`                                                                      | `0`      |
| shrink     | flex-shrink 的值，元素的缩小比例                | `number`                                                                      | `1`      |
| basis      | flex-basis 的值，元素的基础大小                 | `string \| number`                                                            | `'auto'` |
| align-self | align-self 的值，单独设置该项的对齐方式         | `'auto' \| 'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| 'stretch'` | `'auto'` |
| order      | order 的值，调整元素的显示顺序                  | `number`                                                                      | `0`      |

### Flex Slots

| 名称    | 说明                  |
| ------- | --------------------- |
| default | 默认插槽，flex 子元素 |

### FlexItem Slots

| 名称    | 说明                    |
| ------- | ----------------------- |
| default | 默认插槽，flex 项目内容 |

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.demo-preview {
  margin-top: 16px;
}

.demo-label {
  margin: 16px 0 8px;
  font-size: 14px;
  color: var(--ex-color-text-secondary);
}

.demo-label:first-child {
  margin-top: 0;
}

.demo-flex {
  min-height: 80px;
  background: rgba(15, 23, 32, 0.5);
  border: 1px dashed var(--ex-color-border-primary);
  border-radius: 4px;
  padding: 16px;
}

.demo-flex-tall {
  min-height: 120px;
  background: rgba(15, 23, 32, 0.5);
  border: 1px dashed var(--ex-color-border-primary);
  border-radius: 4px;
  padding: 16px;
}

.demo-flex-wrap {
  width: 100%;
  max-width: 400px;
  background: rgba(15, 23, 32, 0.5);
  border: 1px dashed var(--ex-color-border-primary);
  border-radius: 4px;
  padding: 16px;
}

.demo-flex-direction {
  min-height: 120px;
  background: rgba(15, 23, 32, 0.5);
  border: 1px dashed var(--ex-color-border-primary);
  border-radius: 4px;
  padding: 16px;
}

.flex-item {
  padding: 16px;
  background: rgba(41, 171, 226, 0.3);
  color: var(--ex-color-text-primary);
  text-align: center;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-item-small {
  width: 60px;
  height: 60px;
  background: rgba(41, 171, 226, 0.3);
  color: var(--ex-color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.inline-item {
  padding: 4px 8px;
  background: rgba(41, 171, 226, 0.3);
  border: 1px solid rgba(41, 171, 226, 0.5);
  border-radius: 4px;
  font-size: 12px;
}
</style>
