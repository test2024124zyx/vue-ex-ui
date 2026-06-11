# Image 图片

用于展示图片，支持懒加载、裁切模式、宽高与圆角。

## 基础用法

<div class="demo-container">
  <ex-image src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=922&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="示例图片" />
</div>

```vue
<template>
  <ex-image src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=922&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="示例图片" />
</template>
```

## 宽高与裁切模式

<div class="demo-container">
  <ex-image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHwy" alt="Cover" fit="cover" width="300" height="200" />
  <ex-image src="https://images.unsplash.com/photo-1654110455429-cf322b40a906?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXZhdGFyfGVufDB8fDB8fHwy" alt="Contain" fit="contain" width="300" height="200" />
</div>

```vue
<template>
  <ex-image
    src="https://via.placeholder.com/300x200/722ed1/ffffff?text=Cover"
    alt="Cover" fit="cover" width="300" height="200" />
  <ex-image
    src="https://via.placeholder.com/300x200/52c41a/ffffff?text=Contain"
    alt="Contain" fit="contain" width="300" height="200" />
</template>
```

## 圆角与懒加载

<div class="demo-container">
  <ex-image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Radius" radius="12px" />
  <ex-image src="https://images.unsplash.com/photo-1701615004837-40d8573b6652?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGF2YXRhcnxlbnwwfHwwfHx8Mg%3D%3D" alt="Lazy" lazy />
</div>

```vue
<template>
  <ex-image src="https://via.placeholder.com/200x200/1890ff/ffffff?text=Radius" alt="Radius" radius="12px" />
  <ex-image src="https://via.placeholder.com/200x120/ff4d4f/ffffff?text=Lazy" alt="Lazy" lazy />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片地址 | `string` | - |
| alt | 替代文本（a11y 必填） | `string` | - |
| title | 标题（tooltip） | `string` | - |
| width | 宽度 | `string \| number` | - |
| height | 高度 | `string \| number` | - |
| fit | 裁切模式 | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'none'` |
| radius | 圆角 | `string` | - |
| lazy | 原生懒加载 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| load | 加载成功 | `(ev: Event)` |
| error | 加载失败 | `(ev: Event)` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 覆盖内部内容（如叠加图标/蒙层） |

### Exposes

| 方法名 | 说明 |
| --- | --- |
| getElement | 获取根元素 |

## 主题定制

```css
:root {
  --ex-image-radius: 8px;
  --ex-image-border: 1px solid var(--ex-color-border);
}
```

## 无障碍与国际化

- alt 必填，确保屏幕阅读器可理解图片语义。
- 文本与提示需使用 i18n 文案。