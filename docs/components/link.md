# Link 链接

## 基础用法

<div class="demo-container">
  <ex-link href="https://github.com">GitHub</ex-link>
  <ex-link href="/components/button">按钮组件</ex-link>
  <ex-link href="#link-api">Link API</ex-link>
</div>

```vue
<template>
  <ex-link href="https://github.com">GitHub</ex-link>
  <ex-link href="/components/button">按钮组件</ex-link>
</template>
```

省略 `href` 时，根元素是 `button type="button"`，适用于外观为链接的页面动作。

```vue
<template>
  <ex-link
    type="primary"
    @click="openHelp"
  >
    打开帮助
  </ex-link>
</template>
```

## Vue Router

通过 Vue Router 的 `custom` 插槽把解析后的原生地址和导航事件交给 ExLink。

```vue
<template>
  <RouterLink
    v-slot="{ href, navigate }"
    custom
    to="/account"
  >
    <ex-link
      :href="href"
      @click="navigate"
    >
      账户中心
    </ex-link>
  </RouterLink>
</template>
```

## 类型与尺寸

<div class="demo-container">
  <ex-link href="#link-api" type="default" size="small">默认链接</ex-link>
  <ex-link href="#link-api" type="primary">主要链接</ex-link>
  <ex-link href="#link-api" type="success">成功链接</ex-link>
  <ex-link href="#link-api" type="warning">警告链接</ex-link>
  <ex-link href="#link-api" type="danger">危险链接</ex-link>
  <ex-link href="#link-api" type="info" size="large">信息链接</ex-link>
</div>

```vue
<template>
  <ex-link
    href="/default"
    type="default"
    size="small"
  >
    默认链接
  </ex-link>
  <ex-link
    href="/primary"
    type="primary"
  >
    主要链接
  </ex-link>
  <ex-link
    href="/success"
    type="success"
  >
    成功链接
  </ex-link>
  <ex-link
    href="/warning"
    type="warning"
  >
    警告链接
  </ex-link>
  <ex-link
    href="/danger"
    type="danger"
  >
    危险链接
  </ex-link>
  <ex-link
    href="/info"
    type="info"
    size="large"
  >
    信息链接
  </ex-link>
</template>
```

## 禁用与下划线

<div class="demo-container">
  <ex-link href="/private" disabled>禁用导航</ex-link>
  <ex-link disabled type="primary">禁用动作</ex-link>
  <ex-link href="#link-api" :underline="false" type="info">无下划线</ex-link>
</div>

```vue
<template>
  <ex-link
    href="/private"
    disabled
  >
    禁用导航
  </ex-link>
  <ex-link
    disabled
    type="primary"
  >
    禁用动作
  </ex-link>
  <ex-link
    href="/plain"
    :underline="false"
  >
    无下划线
  </ex-link>
</template>
```

## 图标

<div class="demo-container">
  <ex-link href="#link-api" type="primary">
    <template #icon>
      <ex-icon icon="search-line" />
    </template>
    搜索
  </ex-link>
  <ex-link href="#link-api" icon-placement="right" type="success">
    <template #icon>
      <ex-icon icon="arrow-right-line" />
    </template>
    下一页
  </ex-link>
</div>

```vue
<template>
  <ex-link
    href="/search"
    type="primary"
  >
    <template #icon>
      <ex-icon icon="search-line" />
    </template>
    搜索
  </ex-link>

  <ex-link
    href="/next"
    icon-placement="right"
    type="success"
  >
    <template #icon>
      <ex-icon icon="arrow-right-line" />
    </template>
    下一页
  </ex-link>
</template>
```

## 外部地址

绝对 HTTP(S) 地址和协议相对地址默认显示外链图标。`target="_blank"` 会确保 `rel` 包含 `noopener`。

<div class="demo-container">
  <ex-link href="https://github.com" target="_blank" type="primary">GitHub</ex-link>
  <ex-link href="https://vuejs.org" :show-external-icon="false" type="success">Vue.js</ex-link>
</div>

```vue
<template>
  <ex-link
    href="https://github.com"
    target="_blank"
    rel="nofollow"
  >
    GitHub
  </ex-link>
  <ex-link
    href="https://vuejs.org"
    :show-external-icon="false"
  >
    Vue.js
  </ex-link>
</template>
```

## API {#link-api}

### Props

| 参数               | 类型                                                                     | 默认值      |
| ------------------ | ------------------------------------------------------------------------ | ----------- |
| href               | `string`                                                                 | —           |
| type               | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| size               | `'small' \| 'medium' \| 'large'`                                         | `'medium'`  |
| disabled           | `boolean`                                                                | `false`     |
| underline          | `boolean`                                                                | `true`      |
| target             | `string`                                                                 | —           |
| icon-placement     | `'left' \| 'right'`                                                      | `'left'`    |
| show-external-icon | `boolean`                                                                | `true`      |
| rel                | `string`                                                                 | —           |

原生 `class`、`style`、`aria-*`、`data-*` 等属性会透传到根元素。

### Events

| 事件名 | 回调参数              |
| ------ | --------------------- |
| click  | `(event: MouseEvent)` |
| focus  | `(event: FocusEvent)` |
| blur   | `(event: FocusEvent)` |

### Slots

| 插槽名        |
| ------------- |
| default       |
| icon          |
| prefix        |
| suffix        |
| external-icon |

### Exposes

| 方法名     | 返回值                                           |
| ---------- | ------------------------------------------------ |
| focus      | `void`                                           |
| blur       | `void`                                           |
| getElement | `HTMLAnchorElement \| HTMLButtonElement \| null` |
