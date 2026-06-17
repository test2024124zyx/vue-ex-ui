# PageHeader 页头

页面顶部的标题区域，集成返回按钮、面包屑、标签、头像与操作区，并提供丰富的插槽用于深度自定义。

<script setup>
import { ref } from 'vue'

const tab = ref(0)
const onBack = () => { /* 演示用，实际可调用 history.back() */ }
const onCrumb = (path, index) => console.log('breadcrumb:', path, index)

const breadcrumb = [
  { title: '首页', path: '/' },
  { title: '列表', path: '/list' },
  { title: '详情' },
]
const tags = [
  { text: '运行中', type: 'success' },
  { text: '高优先级', type: 'danger' },
]
const avatar = { alt: 'U', size: 'medium' }
</script>

## 基础用法

最简单的标题 + 副标题，可选返回按钮。

<div class="demo-container">
  <ExPageHeader title="页面标题" subtitle="副标题说明" show-back @back="onBack" />
</div>

```vue
<template>
  <ExPageHeader title="页面标题" subtitle="副标题说明" show-back @back="handleBack" />
</template>

<script setup>
const handleBack = () => history.back()
</script>
```

## 面包屑

通过 `breadcrumb` 传入数据；带 `path` 的项可点击并触发 `breadcrumb-click`。也可用 `#breadcrumb` 插槽完全自定义。

<div class="demo-container">
  <ExPageHeader title="详情页" :breadcrumb="breadcrumb" @breadcrumb-click="onCrumb" />
</div>

```vue
<template>
  <ExPageHeader
    title="详情页"
    :breadcrumb="[
      { title: '首页', path: '/' },
      { title: '列表', path: '/list' },
      { title: '详情' },
    ]"
    @breadcrumb-click="(path, index) => router.push(path)"
  />
</template>
```

## 标签与头像

`tags` 渲染为标签（基于 `ExTag`），`type` 支持 `primary` / `success` / `warning` / `danger` / `info`，也可用 `color` 自定义背景色。`avatar` 展示头像。

<div class="demo-container">
  <ExPageHeader title="用户中心" subtitle="account@example.com" :tags="tags" :avatar="avatar" />
</div>

```vue
<template>
  <ExPageHeader
    title="用户中心"
    :tags="[
      { text: '运行中', type: 'success' },
      { text: '高优先级', type: 'danger' },
    ]"
    :avatar="{ src: '/avatar.png', size: 'medium' }"
  />
</template>
```

## 操作区

`#extra` 插槽用于放置右侧操作按钮。

<div class="demo-container">
  <ExPageHeader title="订单 #1024" subtitle="2026-06-17 创建" show-back @back="onBack">
    <template #extra>
      <ExButton size="small">编辑</ExButton>
      <ExButton size="small" type="primary">导出</ExButton>
    </template>
  </ExPageHeader>
</div>

```vue
<template>
  <ExPageHeader title="订单 #1024" subtitle="2026-06-17 创建" show-back>
    <template #extra>
      <ExButton size="small">编辑</ExButton>
      <ExButton size="small" type="primary">导出</ExButton>
    </template>
  </ExPageHeader>
</template>
```

## 内容与底部

默认插槽渲染在标题区下方，`#footer` 渲染在最底部（常用于放选项卡）。

<div class="demo-container">
  <ExPageHeader title="项目概览" :breadcrumb="breadcrumb">
    <template #extra>
      <ExButton size="small" type="primary">新建</ExButton>
    </template>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">
      这里是位于标题下方的补充描述内容，可放置统计信息、说明文字等。
    </p>
    <template #footer>
      <ExTabs v-model="tab">
        <ExTabPane :name="0" label="详情" />
        <ExTabPane :name="1" label="成员" />
        <ExTabPane :name="2" label="设置" />
      </ExTabs>
    </template>
  </ExPageHeader>
</div>

```vue
<template>
  <ExPageHeader title="项目概览" :breadcrumb="breadcrumb">
    <p>位于标题下方的补充描述内容。</p>
    <template #footer>
      <ExTabs v-model="activeTab">
        <ExTabPane :name="0" label="详情" />
        <ExTabPane :name="1" label="成员" />
      </ExTabs>
    </template>
  </ExPageHeader>
</template>
```

## 自定义标题与返回按钮

`#title` / `#subtitle` / `#back` / `#avatar` / `#tags` 插槽用于覆盖默认渲染。

<div class="demo-container">
  <ExPageHeader>
    <template #back>
      <ExButton size="small" type="text">← 返回列表</ExButton>
    </template>
    <template #title>
      <span style="color: var(--ex-color-primary);">自定义标题</span>
    </template>
    <template #subtitle>
      <span>带有自定义渲染的副标题</span>
    </template>
  </ExPageHeader>
</div>

```vue
<template>
  <ExPageHeader>
    <template #back>
      <ExButton type="text" @click="goBack">← 返回列表</ExButton>
    </template>
    <template #title>
      <span class="my-title">自定义标题</span>
    </template>
  </ExPageHeader>
</template>
```

## 固定页头

`fixed` 让页头固定在视口顶部，配合 `z-index` 控制层级。

```vue
<template>
  <ExPageHeader title="固定页头" fixed :z-index="1000" />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` | 页面标题 | `string` | - |
| `subtitle` | 副标题 | `string` | - |
| `show-back` | 是否显示返回按钮 | `boolean` | `false` |
| `back-text` | 返回按钮文字 | `string` | - |
| `back-icon` | 返回按钮图标（内置图标名） | `string` | `'arrow-left-s-line'` |
| `breadcrumb` | 面包屑数据 | `Array<{ title: string; path?: string }>` | - |
| `tags` | 标签列表 | `Array<{ text: string; type?: 'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'error' \| 'info'; color?: string }>` | - |
| `avatar` | 头像信息 | `{ src?: string; alt?: string; size?: 'small' \| 'medium' \| 'large' }` | - |
| `show-divider` | 是否显示底部分割线 | `boolean` | `true` |
| `height` | 页头高度 | `string \| number` | - |
| `fixed` | 是否固定在顶部 | `boolean` | `false` |
| `z-index` | 固定时的层级 | `number` | `1000` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `back` | 点击返回按钮时触发 | - |
| `breadcrumb-click` | 点击可点击面包屑项时触发 | `(path: string, index: number)` |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 标题区下方的内容 |
| `title` | 自定义标题 |
| `subtitle` | 自定义副标题 |
| `breadcrumb` | 自定义面包屑 |
| `back` | 自定义返回按钮 |
| `avatar` | 自定义头像 |
| `tags` | 自定义标签区 |
| `extra` | 右侧操作区 |
| `footer` | 底部区域（如选项卡） |

## 无障碍

- 根元素为 `<header>`；面包屑使用 `<nav>` + `aria-label`，当前页项标记 `aria-current="page"`。
- 返回按钮与可点击面包屑均为原生 `<button>`，支持键盘聚焦与激活。
- 分隔符标记 `aria-hidden`。

## 从旧版本迁移

- 标签渲染由 `ExBadge` 改为 `ExTag`：`type` 取值对齐 `ExTag`（`error` 会自动映射为 `danger`，`default` 表示无类型）；自定义颜色由原 `style.backgroundColor` 改为 `ExTag` 的 `bg-color`（通过 `tags[].color` 传入，行为不变）。
- 新增 `title` / `subtitle` / `breadcrumb` / `back` / `avatar` / `tags` 插槽；默认插槽现在渲染在标题区下方（原 `#content` 内容请改用默认插槽）。

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-primary);
  margin: 16px 0;
}
</style>
