# Avatar 头像

用来代表用户或事物，支持图片、图标或字符展示。

<script setup>
import { ref } from 'vue'
const avatarSrc = ref('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face')
const showBadge = ref(true)
</script>

## 基础用法

头像有三种尺寸，两种形状可选。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar size="large" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
  <ExAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face" />
  <ExAvatar size="small" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face" />
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar
      size="large"
      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    />
    <ExAvatar
      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    />
    <ExAvatar
      size="small"
      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face"
    />
  </div>
</template>
```

## 自定义尺寸

除了预设的三种尺寸，还可以使用数字自定义头像大小。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar :size="24" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face" />
  <ExAvatar :size="36" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=36&h=36&fit=crop&crop=face" />
  <ExAvatar :size="56" src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=56&h=56&fit=crop&crop=face" />
  <ExAvatar :size="72" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=72&h=72&fit=crop&crop=face" />
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar :size="24" src="https://example.com/avatar-24.jpg" />
    <ExAvatar :size="36" src="https://example.com/avatar-36.jpg" />
    <ExAvatar :size="56" src="https://example.com/avatar-56.jpg" />
    <ExAvatar :size="72" src="https://example.com/avatar-72.jpg" />
  </div>
</template>
```

## 不同形状

支持两种形状：`circle`（圆形）和 `square`（方形）。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar shape="circle" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
  <ExAvatar shape="square" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face" />
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar
      shape="circle"
      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    />
    <ExAvatar
      shape="square"
      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face"
    />
  </div>
</template>
```

## 类型

支持三种类型：图片、Icon 以及字符，其中 Icon 和字符型可以自定义图标颜色及背景色。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=64&h=64&fit=crop&crop=face" />
  <ExAvatar>
    <template #icon><ex-icon icon="star-line" /></template>
  </ExAvatar>
  <ExAvatar text="USER" />
  <ExAvatar>AB</ExAvatar>
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar
      src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=64&h=64&fit=crop&crop=face"
    />
    <ExAvatar>
      <template #icon><ex-icon icon="star-line" /></template>
    </ExAvatar>
    <ExAvatar text="USER" />
    <ExAvatar>AB</ExAvatar>
  </div>
</template>
```

## 自定义颜色

可以自定义背景色和文字颜色。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar text="A" background-color="#f56565" text-color="#ffffff" />
  <ExAvatar text="B" background-color="#48bb78" text-color="#ffffff" />
  <ExAvatar text="C" background-color="#ed8936" text-color="#ffffff" />
  <ExAvatar text="D" background-color="#9f7aea" text-color="#ffffff" />
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar text="A" background-color="#f56565" text-color="#ffffff" />
    <ExAvatar text="B" background-color="#48bb78" text-color="#ffffff" />
    <ExAvatar text="C" background-color="#ed8936" text-color="#ffffff" />
    <ExAvatar text="D" background-color="#9f7aea" text-color="#ffffff" />
  </div>
</template>
```

## 带徽标

使用 ExBadge 组件包裹头像来实现徽标功能，支持在线状态、消息提示或认证标识。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExBadge dot type="success">
    <ExAvatar src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&crop=face" />
  </ExBadge>
  <ExBadge :count="3" type="danger">
    <ExAvatar src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face" />
  </ExBadge>
  <ExBadge count="✓" type="warning">
    <ExAvatar text="VIP" />
  </ExBadge>
  <ExBadge :count="99" type="primary">
    <ExAvatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" />
  </ExBadge>
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <!-- 在线状态点 -->
    <ExBadge dot type="success">
      <ExAvatar src="https://example.com/avatar1.jpg" />
    </ExBadge>

    <!-- 消息数量 -->
    <ExBadge :count="3" type="danger">
      <ExAvatar src="https://example.com/avatar2.jpg" />
    </ExBadge>

    <!-- 认证标识 -->
    <ExBadge count="✓" type="warning">
      <ExAvatar text="VIP" />
    </ExBadge>

    <!-- 大数量显示 -->
    <ExBadge :count="99" type="primary">
      <ExAvatar src="https://example.com/avatar4.jpg" />
    </ExBadge>
  </div>
</template>
```

## 头像组

使用 `ExAvatarGroup` 可以展示一组头像，支持设置最大显示数量。

<div style="margin: 20px 0;">
  <h3>基础头像组</h3>
  <ExAvatarGroup style="margin: 10px 0;">
    <ExAvatar src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
  </ExAvatarGroup>
</div>

<div style="margin: 20px 0;">
  <h3>限制显示数量</h3>
  <ExAvatarGroup :max-count="3" style="margin: 10px 0;">
    <ExAvatar src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" />
    <ExAvatar src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face" />
  </ExAvatarGroup>
</div>

<div style="margin: 20px 0;">
  <h3>不同尺寸的头像组</h3>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ExAvatarGroup size="small">
      <ExAvatar src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
      <ExAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" />
      <ExAvatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" />
    </ExAvatarGroup>
    <ExAvatarGroup size="large">
      <ExAvatar src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face" />
      <ExAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" />
      <ExAvatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face" />
    </ExAvatarGroup>
  </div>
</div>

```vue
<template>
  <div>
    <!-- 基础头像组 -->
    <ExAvatarGroup>
      <ExAvatar src="https://example.com/avatar1.jpg" />
      <ExAvatar src="https://example.com/avatar2.jpg" />
      <ExAvatar src="https://example.com/avatar3.jpg" />
      <ExAvatar src="https://example.com/avatar4.jpg" />
    </ExAvatarGroup>

    <!-- 限制显示数量 -->
    <ExAvatarGroup :max-count="3">
      <ExAvatar src="https://example.com/avatar1.jpg" />
      <ExAvatar src="https://example.com/avatar2.jpg" />
      <ExAvatar src="https://example.com/avatar3.jpg" />
      <ExAvatar src="https://example.com/avatar4.jpg" />
      <ExAvatar src="https://example.com/avatar5.jpg" />
      <ExAvatar src="https://example.com/avatar6.jpg" />
    </ExAvatarGroup>

    <!-- 不同尺寸 -->
    <ExAvatarGroup size="small">
      <ExAvatar src="https://example.com/avatar1.jpg" />
      <ExAvatar src="https://example.com/avatar2.jpg" />
      <ExAvatar src="https://example.com/avatar3.jpg" />
    </ExAvatarGroup>
  </div>
</template>
```

## 错误处理

当图片加载失败时，会显示错误提示，点击可重新加载。

<div style="display: flex; gap: 16px; align-items: center; margin: 20px 0;">
  <ExAvatar src="https://invalid-url.com/avatar.jpg" alt="加载失败的头像" />
  <ExAvatar src="https://example.com/not-found.jpg" alt="不存在的图片" />
</div>

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ExAvatar src="https://invalid-url.com/avatar.jpg" alt="加载失败的头像" />
    <ExAvatar src="https://example.com/not-found.jpg" alt="不存在的图片" />
  </div>
</template>
```

## API

### ExAvatar Props

| 参数            | 说明                     | 类型                                       | 默认值     |
| --------------- | ------------------------ | ------------------------------------------ | ---------- |
| shape           | 指定头像的形状           | `'circle' \| 'square'`                     | `'circle'` |
| size            | 设置头像的大小           | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| src             | 图片头像的资源地址       | `string`                                   | -          |
| srcset          | 图片的 srcset 属性       | `string`                                   | -          |
| alt             | 图像无法显示时的替代文本 | `string`                                   | -          |
| text            | 文字头像的内容           | `string`                                   | -          |
| backgroundColor | 自定义背景颜色           | `string`                                   | -          |
| textColor       | 自定义文字颜色           | `string`                                   | -          |
| draggable       | 是否可拖拽               | `boolean`                                  | `false`    |
| crossOrigin     | 跨域设置                 | `'anonymous' \| 'use-credentials' \| ''`   | -          |
| gap             | 文字间距                 | `number`                                   | `4`        |
| ariaLabel       | 无障碍标签               | `string`                                   | -          |
| title           | 鼠标悬停提示             | `string`                                   | -          |

### ExAvatar Events

| 事件名 | 说明               | 回调参数                  |
| ------ | ------------------ | ------------------------- |
| error  | 图片加载失败的事件 | `(e: Event) => void`      |
| load   | 图片加载成功的事件 | `(e: Event) => void`      |
| click  | 点击事件           | `(e: MouseEvent) => void` |

### ExAvatar Slots

| 名称    | 说明               |
| ------- | ------------------ |
| default | 自定义头像展示内容 |
| icon    | 自定义图标内容     |
| error   | 自定义错误状态内容 |

### ExAvatar Methods

| 方法名     | 说明            | 参数 |
| ---------- | --------------- | ---- |
| getElement | 获取头像DOM元素 | -    |
| reload     | 重新加载图片    | -    |

### ExAvatarGroup Props

| 参数     | 说明           | 类型                                       | 默认值  |
| -------- | -------------- | ------------------------------------------ | ------- |
| maxCount | 最大显示数量   | `number`                                   | -       |
| maxStyle | 超出数量的样式 | `Record<string, string \| number>`         | -       |
| size     | 头像尺寸       | `'small' \| 'medium' \| 'large' \| number` | -       |
| shape    | 头像形状       | `'circle' \| 'square'`                     | -       |
| spacing  | 头像间距       | `number \| string`                         | `'8px'` |

### ExAvatarGroup Events

| 事件名        | 说明               | 回调参数                  |
| ------------- | ------------------ | ------------------------- |
| overflowClick | 点击超出数量时触发 | `(count: number) => void` |

### ExAvatarGroup Slots

| 名称    | 说明           | 参数                                       |
| ------- | -------------- | ------------------------------------------ |
| default | 头像列表       | -                                          |
| avatar  | 自定义头像渲染 | `{ avatar: ExAvatarProps, index: number }` |
