# Space 间距

用于对多个元素进行间距与排布控制，支持方向、换行与对齐。

## 基础用法

<div class="demo-container">
  <ex-space>
    <ex-button>按钮1</ex-button>
    <ex-button>按钮2</ex-button>
    <ex-button>按钮3</ex-button>
  </ex-space>
</div>

```vue
<template>
  <ex-space>
    <ex-button>按钮1</ex-button>
    <ex-button>按钮2</ex-button>
    <ex-button>按钮3</ex-button>
  </ex-space>
</template>
```

## 方向与尺寸

<div class="demo-container">
  <ex-space direction="horizontal" size="small">
    <ex-button>small</ex-button><ex-button>small</ex-button>
  </ex-space>
  <ex-space direction="horizontal" size="large" style="margin-top: 12px;">
    <ex-button>large</ex-button><ex-button>large</ex-button>
  </ex-space>
  <ex-space direction="vertical" size="medium" style="margin-top: 12px;">
    <ex-button>vertical A</ex-button><ex-button>vertical B</ex-button>
  </ex-space>
</div>

```vue
<template>
  <ex-space direction="horizontal" size="small">
    <ex-button>small</ex-button><ex-button>small</ex-button>
  </ex-space>
  <ex-space direction="horizontal" size="large">
    <ex-button>large</ex-button><ex-button>large</ex-button>
  </ex-space>
  <ex-space direction="vertical" size="medium">
    <ex-button>vertical A</ex-button><ex-button>vertical B</ex-button>
  </ex-space>
</template>
```

## 换行与对齐

<div class="demo-container">
  <ex-space wrap justify="space-between" align="center" style="max-width: 360px;">
    <ex-button>1</ex-button><ex-button>2</ex-button><ex-button>3</ex-button>
    <ex-button>4</ex-button><ex-button>5</ex-button>
  </ex-space>
</div>

```vue
<template>
  <ex-space wrap justify="space-between" align="center" style="max-width: 360px;">
    <ex-button>1</ex-button><ex-button>2</ex-button><ex-button>3</ex-button>
    <ex-button>4</ex-button><ex-button>5</ex-button>
  </ex-space>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| size | 间距 | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| wrap | 是否换行 | `boolean` | `false` |
| align | 交叉轴对齐 | `'start' \| 'center' \| 'end'` | `'start'` |
| justify | 主轴对齐 | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `'start'` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 子元素 |

### Exposes

| 方法名 | 说明 |
| --- | --- |
| getElement | 获取根元素 |

## 主题定制

```css
:root {
  --ex-space-gap-small: 8px;
  --ex-space-gap-medium: 12px;
  --ex-space-gap-large: 16px;
}
```

## 无障碍与国际化

- Space 作为布局容器无语义，必要时请为内部元素提供合理 aria 属性与键盘可用性。