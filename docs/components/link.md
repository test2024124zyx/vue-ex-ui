# Link 链接

用于页面间导航的文字链接组件，支持普通链接和路由链接。

## 基础用法

最简单的链接用法。

<div class="demo-container">
    <ex-link href="https://github.com">GitHub</ex-link>
    <ex-link to="/components/button">按钮组件</ex-link>
    <ex-link>默认链接</ex-link>
</div>


```vue
<template>
  <div>
    <ex-link href="https://github.com">GitHub</ex-link>
    <ex-link to="/components/button">按钮组件</ex-link>
    <ex-link>默认链接</ex-link>
  </div>
</template>
```

## 链接类型

不同类型的链接用于不同的场景。

<div class="demo-container">
    <ex-link type="default">默认链接</ex-link>
    <ex-link type="primary">主要链接</ex-link>
    <ex-link type="success">成功链接</ex-link>
    <ex-link type="warning">警告链接</ex-link>
    <ex-link type="danger">危险链接</ex-link>
    <ex-link type="info">信息链接</ex-link>
</div>


```vue
<template>
  <div>
    <ex-link type="default">默认链接</ex-link>
    <ex-link type="primary">主要链接</ex-link>
    <ex-link type="success">成功链接</ex-link>
    <ex-link type="warning">警告链接</ex-link>
    <ex-link type="danger">危险链接</ex-link>
    <ex-link type="info">信息链接</ex-link>
  </div>
</template>
```

## 链接尺寸

提供三种不同的链接尺寸。

<div class="demo-container">
    <ex-link size="small" type="primary">小型链接</ex-link>
    <ex-link size="medium" type="primary">中型链接</ex-link>
    <ex-link size="large" type="primary">大型链接</ex-link>
</div>


```vue
<template>
  <div>
    <ex-link size="small" type="primary">小型链接</ex-link>
    <ex-link size="medium" type="primary">中型链接</ex-link>
    <ex-link size="large" type="primary">大型链接</ex-link>
  </div>
</template>
```

## 禁用状态

链接的禁用状态。

<div class="demo-container">
    <ex-link disabled>禁用链接</ex-link>
    <ex-link disabled type="primary">禁用主要链接</ex-link>
    <ex-link disabled href="https://github.com">禁用外部链接</ex-link>
</div>


```vue
<template>
  <div>
    <ex-link disabled>禁用链接</ex-link>
    <ex-link disabled type="primary">禁用主要链接</ex-link>
    <ex-link disabled href="https://github.com">禁用外部链接</ex-link>
  </div>
</template>
```

## 下划线

控制链接是否显示下划线。

<div class="demo-container">
    <ex-link :underline="true" type="primary">显示下划线</ex-link>
    <ex-link :underline="false" type="primary">隐藏下划线</ex-link>
</div>


```vue
<template>
  <div>
    <ex-link :underline="true" type="primary">显示下划线</ex-link>
    <ex-link :underline="false" type="primary">隐藏下划线</ex-link>
  </div>
</template>
```

## 图标链接

通过插槽为链接添加图标，支持 Iconify API 图标。

<div class="demo-container">
    <ex-link type="primary">
      <template #icon>
        <ex-icon icon="search-line" />
      </template>
      搜索
    </ex-link>
    <ex-link icon-placement="right" type="success">
      <template #icon>
        <ex-icon icon="external-link-line" />
      </template>
      用户中心
    </ex-link>
    <ex-link type="info">
      <template #prefix>
        <ex-icon icon="file-line" />
      </template>
      文档
    </ex-link>
</div>


```vue
<template>
  <div>
    <!-- 推荐：内置图标，离线可用、随主题着色 -->
    <ex-link type="primary">
      <template #icon>
        <ex-icon icon="search-line" />
      </template>
      搜索
    </ex-link>
    <ex-link icon-placement="right" type="success">
      <template #icon>
        <ex-icon icon="external-link-line" />
      </template>
      用户中心
    </ex-link>
    <ex-link type="info">
      <template #prefix>
        <ex-icon icon="file-line" />
      </template>
      文档
    </ex-link>
  </div>
</template>
```

## 外部链接

外部链接会自动显示外部链接图标。

<div class="demo-container">
    <ex-link href="https://github.com" type="primary">GitHub</ex-link>
    <ex-link href="https://vue.js.org" type="success">Vue.js</ex-link>
    <ex-link href="https://vitejs.dev" :show-external-icon="false" type="info">
      Vite (无图标)
    </ex-link>
</div>


```vue
<template>
  <div>
    <ex-link href="https://github.com" type="primary">GitHub</ex-link>
    <ex-link href="https://vue.js.org" type="success">Vue.js</ex-link>
    <ex-link href="https://vitejs.dev" :show-external-icon="false" type="info">
      Vite (无图标)
    </ex-link>
  </div>
</template>
```

## 文本中的链接

在文本段落中使用链接。

<div class="demo-container">
  <div class="demo-preview">
    <p style="line-height: 1.6; color: var(--ex-color-text-primary); max-width: 400px;">
      这是一段包含
      <ex-link href="https://github.com" type="primary">GitHub</ex-link>
      链接的文本，还有一个
      <ex-link to="/components/button" type="success">内部链接</ex-link>
      指向按钮组件页面。
    </p>
  </div>
  
  <details class="demo-code">
    <summary>查看代码</summary>
    
```vue
<template>
  <p>
    这是一段包含
    <ex-link href="https://github.com" type="primary">GitHub</ex-link>
    链接的文本，还有一个
    <ex-link to="/components/button" type="success">内部链接</ex-link>
    指向按钮组件页面。
  </p>
</template>
```
  </details>
</div>

## API

### Props

| 参数               | 说明                   | 类型                           | 可选值                                                            | 默认值    |
| ------------------ | ---------------------- | ------------------------------ | ----------------------------------------------------------------- | --------- |
| href               | 链接地址               | `string`                       | —                                                                 | —         |
| to                 | 路由地址（Vue Router） | `string \| object`             | —                                                                 | —         |
| type               | 链接类型               | `string`                       | `default` / `primary` / `success` / `warning` / `danger` / `info` | `default` |
| size               | 链接尺寸               | `string`                       | `small` / `medium` / `large`                                      | `medium`  |
| disabled           | 是否禁用               | `boolean`                      | —                                                                 | `false`   |
| underline          | 是否显示下划线         | `boolean`                      | —                                                                 | `true`    |
| target             | 链接目标               | `string`                       | `_self` / `_blank` / `_parent` / `_top`                           | `_self`   |
| icon-placement     | 图标位置               | `string`                       | `left` / `right`                                                  | `left`    |
| show-external-icon | 是否显示外部链接图标   | `boolean`                      | —                                                                 | `true`    |
| class              | 自定义CSS类名          | `string \| string[] \| object` | —                                                                 | —         |
| style              | 自定义样式             | `string \| object`             | —                                                                 | —         |
| aria-label         | 无障碍标签             | `string`                       | —                                                                 | —         |
| rel                | rel 属性               | `string`                       | —                                                                 | —         |

### Events

| 事件名 | 说明               | 回调参数              |
| ------ | ------------------ | --------------------- |
| click  | 点击链接时触发     | `(event: MouseEvent)` |
| focus  | 链接获得焦点时触发 | `(event: FocusEvent)` |
| blur   | 链接失去焦点时触发 | `(event: FocusEvent)` |

### Slots

| 插槽名        | 说明                                     |
| ------------- | ---------------------------------------- |
| default       | 链接内容                                 |
| icon          | 图标内容（根据 icon-placement 决定位置） |
| prefix        | 左侧图标内容                             |
| suffix        | 右侧图标内容                             |
| external-icon | 外部链接图标内容                         |

### Exposes

| 方法名     | 说明            | 参数 |
| ---------- | --------------- | ---- |
| focus      | 使链接获得焦点  | —    |
| blur       | 使链接失去焦点  | —    |
| getElement | 获取链接DOM元素 | —    |

## 主题定制

### CSS 变量

组件使用以下 CSS 变量，可以进行主题定制：

```css
:root {
  /* 颜色 */
  --ex-color-primary: #29abe2;
  --ex-color-success: #00d4aa;
  --ex-color-warning: #ff9500;
  --ex-color-danger: #ff3b30;
  --ex-color-info: #007aff;

  /* 文本颜色 */
  --ex-color-text-primary: #e6f0ff;
  --ex-color-text-disabled: #666;

  /* 间距 */
  --ex-spacing-xs: 4px;
  --ex-spacing-sm: 8px;

  /* 字体 */
  --ex-font-size-sm: 14px;
  --ex-font-size-base: 16px;
  --ex-font-size-lg: 18px;
  --ex-font-weight-medium: 500;

  /* 圆角 */
  --ex-radius-sm: 4px;

  /* 动画 */
  --ex-transition-base: 0.2s;
  --ex-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### SCSS 变量

```scss
// 可以通过 SCSS 变量进一步定制
$link-hover-transform: translateY(-1px);
$link-focus-outline-width: 2px;
$link-underline-height: 1px;
```
