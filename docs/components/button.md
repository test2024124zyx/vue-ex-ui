# Button 按钮

按钮用于触发一个操作，如提交表单。

## 基础用法

基础的按钮用法。

<script setup>
</script>

<div class="demo-container">
  <ExButton>默认按钮</ExButton>
  <ExButton type="primary">主要按钮</ExButton>
  <ExButton type="secondary">次要按钮</ExButton>
  <ExButton type="success">成功按钮</ExButton>
  <ExButton type="warning">警告按钮</ExButton>
  <ExButton type="danger">危险按钮</ExButton>
  <ExButton type="info">信息按钮</ExButton>
  <ExButton circle>用户</ExButton>
</div>

```vue
<template>
  <ExButton>默认按钮</ExButton>
  <ExButton type="primary">主要按钮</ExButton>
  <ExButton type="secondary">次要按钮</ExButton>
  <ExButton type="success">成功按钮</ExButton>
  <ExButton type="warning">警告按钮</ExButton>
  <ExButton type="danger">危险按钮</ExButton>
  <ExButton type="info">信息按钮</ExButton>
</template>
```

## 朴素按钮

设置 `plain` 属性可得到朴素按钮：默认以浅色/透明底 + 主题色描边与文字呈现；悬停时填充为对应主题色作为强调。适合在深色界面中作次级操作按钮。

<div class="demo-container">
  <ExButton plain>朴素按钮</ExButton>
  <ExButton type="primary" plain>主要按钮</ExButton>
  <ExButton type="success" plain>成功按钮</ExButton>
  <ExButton type="warning" plain>警告按钮</ExButton>
  <ExButton type="danger" plain>危险按钮</ExButton>
  <ExButton type="info" plain>信息按钮</ExButton>
</div>

```vue
<template>
  <ExButton plain>朴素按钮</ExButton>
  <ExButton type="primary" plain>主要按钮</ExButton>
  <ExButton type="success" plain>成功按钮</ExButton>
  <ExButton type="warning" plain>警告按钮</ExButton>
  <ExButton type="danger" plain>危险按钮</ExButton>
  <ExButton type="info" plain>信息按钮</ExButton>
</template>
```

## 圆角按钮

<div class="demo-container">
  <ExButton round>圆角按钮</ExButton>
  <ExButton type="primary" round>主要按钮</ExButton>
  <ExButton type="success" round>成功按钮</ExButton>
  <ExButton type="warning" round>警告按钮</ExButton>
  <ExButton type="danger" round>危险按钮</ExButton>
  <ExButton type="info" round>信息按钮</ExButton>
</div>

```vue
<template>
  <ExButton round>圆角按钮</ExButton>
  <ExButton type="primary" round>主要按钮</ExButton>
  <ExButton type="success" round>成功按钮</ExButton>
  <ExButton type="warning" round>警告按钮</ExButton>
  <ExButton type="danger" round>危险按钮</ExButton>
  <ExButton type="info" round>信息按钮</ExButton>
</template>
```

## 圆形按钮

圆形按钮优先显示图标，如果没有图标则显示文字的第一个字符（大写）。

<div class="demo-container">
  <!-- 圆形按钮 - 图标优先显示 -->
  <ExButton circle type="primary">
    <template #prefix>
      <ex-icon icon="star-line" />
    </template>
  </ExButton>
  <ExButton circle type="success">
    <template #prefix>
      <ex-icon icon="star-line" />
    </template>
  </ExButton>
  <ExButton circle type="warning">
    <template #prefix>
      <ex-icon icon="star-line" />
    </template>
  </ExButton>
  <ExButton circle type="danger">
    <template #prefix>
      <ex-icon icon="delete-bin-line" />
    </template>
  </ExButton>
  
  <!-- 圆形按钮 - 文字显示第一个字符 -->
  <ExButton circle type="primary">用户</ExButton>
  <ExButton circle type="success">管理员</ExButton>
  <ExButton circle type="warning">游客</ExButton>
  <ExButton circle type="danger">删除</ExButton>
</div>

```vue
<template>
  <!-- 圆形按钮 - 图标优先显示 -->
  <ExButton circle type="primary">
    <template #prefix>
      <ex-icon icon="star-line" />
    </template>
  </ExButton>
  <ExButton circle type="success">
    <template #prefix>
      <ex-icon icon="star-line" />
    </template>
  </ExButton>

  <!-- 圆形按钮 - 文字显示第一个字符 -->
  <ExButton circle type="primary">用户</ExButton>
  <ExButton circle type="success">管理员</ExButton>
</template>
```

## 图标按钮

带图标的按钮可增强辨识度（有文字）或节省空间（无文字）。使用插槽方式添加 Iconify API 图标。

<div class="demo-container">
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="search-line" />
    </template>
    搜索
  </ExButton>
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="file-copy-line" />
    </template>
    编辑
  </ExButton>
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="check-line" />
    </template>
    确认
  </ExButton>
  <ExButton type="primary">
    <template #suffix>
      <ex-icon icon="information-line" />
    </template>
    消息
  </ExButton>
  <ExButton type="danger">
    <template #prefix>
      <ex-icon icon="delete-bin-line" />
    </template>
    删除
  </ExButton>
</div>

```vue
<template>
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="search-line" />
    </template>
    搜索
  </ExButton>
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="file-copy-line" />
    </template>
    编辑
  </ExButton>
  <ExButton type="primary">
    <template #prefix>
      <ex-icon icon="check-line" />
    </template>
    确认
  </ExButton>
  <ExButton type="primary">
    <template #suffix>
      <ex-icon icon="information-line" />
    </template>
    消息
  </ExButton>
  <ExButton type="danger">
    <template #prefix>
      <ex-icon icon="delete-bin-line" />
    </template>
    删除
  </ExButton>
</template>
```

## 禁用状态

按钮不可用状态。

<div class="demo-container">
  <ExButton disabled>默认按钮</ExButton>
  <ExButton type="primary" disabled>主要按钮</ExButton>
  <ExButton type="success" disabled>成功按钮</ExButton>
  <ExButton type="warning" disabled>警告按钮</ExButton>
  <ExButton type="danger" disabled>危险按钮</ExButton>
  <ExButton type="info" disabled>信息按钮</ExButton>
</div>

```vue
<template>
  <ExButton disabled>默认按钮</ExButton>
  <ExButton type="primary" disabled>主要按钮</ExButton>
  <ExButton type="success" disabled>成功按钮</ExButton>
  <ExButton type="warning" disabled>警告按钮</ExButton>
  <ExButton type="danger" disabled>危险按钮</ExButton>
  <ExButton type="info" disabled>信息按钮</ExButton>
</template>
```

## 文字按钮

没有边框和背景色的按钮。

<div class="demo-container">
  <ExButton type="text">文字按钮</ExButton>
  <ExButton type="text" disabled>文字按钮</ExButton>
</div>

```vue
<template>
  <ExButton type="text">文字按钮</ExButton>
  <ExButton type="text" disabled>文字按钮</ExButton>
</template>
```

## 链接按钮

链接样式的按钮。

<div class="demo-container">
  <ExButton type="link">链接按钮</ExButton>
  <ExButton type="link" disabled>链接按钮</ExButton>
</div>

```vue
<template>
  <ExButton type="link">链接按钮</ExButton>
  <ExButton type="link" disabled>链接按钮</ExButton>
</template>
```

## 不同尺寸

Button 组件提供除了默认值以外的三种尺寸，可以在不同场景下选择合适的按钮尺寸。

<div class="demo-container">
  <ExButton size="large">大型按钮</ExButton>
  <ExButton>默认按钮</ExButton>
  <ExButton size="small">小型按钮</ExButton>
</div>

```vue
<template>
  <ExButton size="large">大型按钮</ExButton>
  <ExButton>默认按钮</ExButton>
  <ExButton size="small">小型按钮</ExButton>
</template>
```

## 加载中

点击按钮后进行数据加载操作，在按钮上显示加载状态。

<div class="demo-container">
  <ExButton type="primary" loading>加载中</ExButton>
  <ExButton type="primary" loading>
    <template #loading>
      <ex-icon icon="loader-4-line" spin />
    </template>
    自定义加载图标
  </ExButton>
</div>

```vue
<template>
  <ExButton type="primary" loading>加载中</ExButton>
  <ExButton type="primary" loading>
    <template #loading>
      <ex-icon icon="loader-4-line" spin />
    </template>
    自定义加载图标
  </ExButton>
</template>
```

## 块级按钮

`block` 属性将使按钮适合其父宽度。

<div class="demo-container">
  <ExButton type="primary" block>块级按钮</ExButton>
</div>

```vue
<template>
  <ExButton type="primary" block>块级按钮</ExButton>
</template>
```

## API

### Props

| 参数        | 说明                                                                           | 类型    | 可选值                                                                | 默认值  |
| ----------- | ------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------- | ------- |
| type        | 类型                                                                           | string  | primary / secondary / success / warning / danger / info / text / link | primary |
| size        | 尺寸                                                                           | string  | large / medium / small                                                | medium  |
| shape       | 形状（与下方 `round`/`circle` 布尔等价，三者任一生效即可；同时设置时圆形优先） | string  | default / round / circle                                              | default |
| plain       | 是否朴素按钮                                                                   | boolean | —                                                                     | false   |
| round       | 是否圆角按钮                                                                   | boolean | —                                                                     | false   |
| circle      | 是否圆形按钮                                                                   | boolean | —                                                                     | false   |
| loading     | 是否加载中状态                                                                 | boolean | —                                                                     | false   |
| disabled    | 是否禁用状态                                                                   | boolean | —                                                                     | false   |
| autofocus   | 是否默认聚焦                                                                   | boolean | —                                                                     | false   |
| native-type | 原生 type 属性                                                                 | string  | button / submit / reset                                               | button  |
| block       | 是否为块级按钮                                                                 | boolean | —                                                                     | false   |
| aria-label  | 无障碍标签                                                                     | string  | —                                                                     | —       |

### Events

| 事件名 | 说明       | 回调参数            |
| ------ | ---------- | ------------------- |
| click  | 点击时触发 | (event: MouseEvent) |
| focus  | 聚焦时触发 | (event: FocusEvent) |
| blur   | 失焦时触发 | (event: FocusEvent) |

### Methods

| 方法名 | 说明           | 参数 |
| ------ | -------------- | ---- |
| focus  | 使按钮获取焦点 | —    |
| blur   | 使按钮失去焦点 | —    |

### Slots

| 插槽名  | 说明             |
| ------- | ---------------- |
| default | 按钮内容         |
| prefix  | 前缀图标         |
| suffix  | 后缀图标         |
| loading | 自定义加载中图标 |

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo-container .ex-button {
  margin: 0;
}
</style>
