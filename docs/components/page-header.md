# PageHeader 页头

页面顶部的标题区域，集成返回按钮、面包屑、标签与头像展示。

## 基础用法

```vue
<template>
  <ExPageHeader title="页面标题" subtitle="副标题说明" show-back @back="handleBack" />
</template>

<script setup>
const handleBack = () => {
  history.back();
};
</script>
```

## 带面包屑

```vue
<template>
  <ExPageHeader
    title="详情页"
    :breadcrumb="[
      { title: '首页', path: '/' },
      { title: '列表', path: '/list' },
      { title: '详情' },
    ]"
  />
</template>
```

## 带标签与头像

```vue
<template>
  <ExPageHeader
    title="用户中心"
    :tags="[{ text: '运行中', type: 'success' }]"
    :avatar="{ src: '/avatar.png', size: 'medium' }"
  />
</template>
```

## 固定页头

```vue
<template>
  <ExPageHeader title="固定页头" fixed :z-index="1000" />
</template>
```

## API

### Props

| 属性          | 说明           | 类型                                                                    | 默认值  |
| ------------- | -------------- | ----------------------------------------------------------------------- | ------- |
| `title`       | 页面标题       | `string`                                                                | -       |
| `subtitle`    | 副标题         | `string`                                                                | -       |
| `showBack`    | 显示返回按钮   | `boolean`                                                               | `false` |
| `backText`    | 返回按钮文本   | `string`                                                                | -       |
| `backIcon`    | 返回按钮图标   | `string`                                                                | -       |
| `breadcrumb`  | 面包屑数据     | `Array<{ title: string; path?: string }>`                               | -       |
| `tags`        | 标签列表       | `Array<{ text: string; type?: string; color?: string }>`                | -       |
| `avatar`      | 头像信息       | `{ src?: string; alt?: string; size?: 'small' \| 'medium' \| 'large' }` | -       |
| `showDivider` | 显示底部分割线 | `boolean`                                                               | `true`  |
| `height`      | 页头高度       | `string \| number`                                                      | -       |
| `fixed`       | 是否固定在顶部 | `boolean`                                                               | `false` |
| `zIndex`      | 固定时的层级   | `number`                                                                | `1000`  |

### Events

| 事件   | 说明               |
| ------ | ------------------ |
| `back` | 点击返回按钮时触发 |

### Slots

| 插槽      | 说明                 |
| --------- | -------------------- |
| `default` | 标题下方的自定义内容 |
| `extra`   | 右侧操作区           |
| `footer`  | 底部内容（如选项卡） |
