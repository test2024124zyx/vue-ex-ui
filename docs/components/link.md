# Link 链接

支持原生导航链接和无 `href` 的页面动作。

<script setup>
import { ref } from 'vue'

const actionCount = ref(0)
</script>

## 基础用法

::: raw

<div class="vp-raw demo-container link-row">
  <ex-link href="/components/button">Button 组件</ex-link>
  <ex-link href="/components/form" type="primary">Form 组件</ex-link>
  <ex-link href="#link-api" type="info">查看 API</ex-link>
</div>
:::

::: details 查看示例代码

```vue
<ex-link href="/components/button">Button 组件</ex-link>
<ex-link href="/components/form" type="primary">Form 组件</ex-link>
<ex-link href="#link-api" type="info">查看 API</ex-link>
```

:::

## 页面动作

省略 `href` 时渲染为 `button type="button"`，保留链接视觉和完整键盘语义。

::: raw

<div class="vp-raw demo-container link-row">
  <ex-link type="primary" @click="actionCount += 1">刷新数据</ex-link>
  <ex-typography variant="caption" color="text-secondary">已执行 {{ actionCount }} 次</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-link type="primary" @click="actionCount += 1">刷新数据</ex-link>
```

:::

## 类型与尺寸

::: raw

<div class="vp-raw demo-container link-row link-row--center">
  <ex-link href="#link-api" type="default" size="small">默认</ex-link>
  <ex-link href="#link-api" type="primary">主要</ex-link>
  <ex-link href="#link-api" type="success">成功</ex-link>
  <ex-link href="#link-api" type="warning">警告</ex-link>
  <ex-link href="#link-api" type="danger">危险</ex-link>
  <ex-link href="#link-api" type="info" size="large">信息</ex-link>
</div>
:::

::: details 查看示例代码

```vue
<ex-link href="#link-api" type="default" size="small">默认</ex-link>
<ex-link href="#link-api" type="primary">主要</ex-link>
<ex-link href="#link-api" type="success">成功</ex-link>
<ex-link href="#link-api" type="warning">警告</ex-link>
<ex-link href="#link-api" type="danger">危险</ex-link>
<ex-link href="#link-api" type="info" size="large">信息</ex-link>
```

:::

## 禁用与下划线

::: raw

<div class="vp-raw demo-container link-row">
  <ex-link href="/private" disabled>禁用导航</ex-link>
  <ex-link disabled type="primary">禁用动作</ex-link>
  <ex-link href="#link-api" :underline="false" type="info">无下划线</ex-link>
</div>
:::

::: details 查看示例代码

```vue
<ex-link href="/private" disabled>禁用导航</ex-link>
<ex-link disabled type="primary">禁用动作</ex-link>
<ex-link href="#link-api" :underline="false" type="info">无下划线</ex-link>
```

:::

## 图标

::: raw

<div class="vp-raw demo-container link-row">
  <ex-link href="/components/select" type="primary">
    <template #icon><ex-icon icon="search-line" /></template>
    查找组件
  </ex-link>
  <ex-link href="/components/form" icon-placement="right" type="success">
    <template #icon><ex-icon icon="arrow-right-line" /></template>
    下一页
  </ex-link>
</div>
:::

::: details 查看示例代码

```vue
<ex-link href="/components/select" type="primary">
  <template #icon><ex-icon icon="search-line" /></template>
  查找组件
</ex-link>
<ex-link href="/components/form" icon-placement="right" type="success">
  <template #icon><ex-icon icon="arrow-right-line" /></template>
  下一页
</ex-link>
```

:::

## 外部地址

::: raw

<div class="vp-raw demo-container link-row">
  <ex-link href="https://github.com" target="_blank" rel="nofollow" type="primary">GitHub</ex-link>
  <ex-link href="https://vuejs.org" target="_blank" :show-external-icon="false" type="success">
    Vue.js（隐藏外链图标）
  </ex-link>
</div>
:::

::: details 查看示例代码

```vue
<ex-link href="https://github.com" target="_blank" rel="nofollow" type="primary">GitHub</ex-link>
<ex-link href="https://vuejs.org" target="_blank" :show-external-icon="false" type="success">
  Vue.js（隐藏外链图标）
</ex-link>
```

:::

`target="_blank"` 会确保 `rel` 包含 `noopener`。外链状态还会提供本地化的屏幕阅读器提示；`external-icon` 插槽始终作为装饰内容隐藏。

## Vue Router 集成

```vue
<RouterLink v-slot="{ href, navigate }" custom to="/account">
  <ex-link :href="href" @click="navigate">账户中心</ex-link>
</RouterLink>
```

## API {#link-api}

### Props

| 参数               | 说明                                      | 类型                                                         | 默认值    |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------ | --------- |
| `href`             | 导航地址；省略时渲染动作按钮              | `string`                                                     | —         |
| `type`             | 视觉类型                                  | `default \| primary \| success \| warning \| danger \| info` | `default` |
| `size`             | 尺寸；未显式设置时继承 `ExConfigProvider` | `small \| medium \| large`                                   | `medium`  |
| `disabled`         | 是否禁用交互                              | `boolean`                                                    | `false`   |
| `underline`        | 是否显示下划线                            | `boolean`                                                    | `true`    |
| `target`           | 原生浏览上下文                            | `string`                                                     | —         |
| `iconPlacement`    | 通用图标位置                              | `left \| right`                                              | `left`    |
| `showExternalIcon` | 外部地址是否显示图标                      | `boolean`                                                    | `true`    |
| `rel`              | 原生链接关系                              | `string`                                                     | —         |

无 `href` 时组件渲染为动作按钮，并保留至少 `44px` 的触控目标；有 `href` 的正文内联链接保持紧凑尺寸。

### Events

| 事件名  | 参数                  |
| ------- | --------------------- |
| `click` | `(event: MouseEvent)` |
| `focus` | `(event: FocusEvent)` |
| `blur`  | `(event: FocusEvent)` |

### Slots

| 名称            | 说明           |
| --------------- | -------------- |
| `default`       | 链接文本       |
| `icon`          | 通用图标       |
| `prefix`        | 前置内容       |
| `suffix`        | 后置内容       |
| `external-icon` | 自定义外链图标 |

### Exposes

| 方法         | 类型                                                   |
| ------------ | ------------------------------------------------------ |
| `focus`      | `() => void`                                           |
| `blur`       | `() => void`                                           |
| `getElement` | `() => HTMLAnchorElement \| HTMLButtonElement \| null` |

<style scoped>
.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.link-row--center {
  align-items: center;
}
</style>
