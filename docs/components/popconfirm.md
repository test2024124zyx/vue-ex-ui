# Popconfirm 气泡确认框

点击元素，弹出气泡式的确认框。

<script setup>
import { ref } from 'vue'

const confirmLoading = ref(false)

const handleConfirm = () => {
  confirmLoading.value = true
  setTimeout(() => {
    confirmLoading.value = false
  }, 2000)
}

const beforeConfirm = () => {
  // 使用浏览器原生确认对话框进行二次确认
  if (typeof window !== 'undefined' && window.confirm) {
    return window.confirm('再次确认：真的要删除吗？')
  }
  return true
}
</script>

## 基础用法

最简单的用法。

<div class="demo-container">
  <ExPopconfirm title="确定要删除这条记录吗？">
    <ExButton type="danger">删除</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="确定要删除这条记录吗？">
    <ExButton type="danger">删除</ExButton>
  </ExPopconfirm>
</template>
```

## 不同类型

通过 `type` 属性可以设置不同类型的确认框。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExPopconfirm title="这是一个默认确认框" type="default">
    <ExButton>默认</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="这是一个主要确认框" type="primary">
    <ExButton type="primary">主要</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="确定要执行此操作吗？" type="success">
    <ExButton type="success">成功</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="此操作可能有风险" type="warning">
    <ExButton type="warning">警告</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="确定要删除吗？" type="danger">
    <ExButton type="danger">危险</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="这是一条提示信息" type="info">
    <ExButton type="info">信息</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="这是一个主要确认框" type="primary">
    <ExButton type="primary">主要</ExButton>
  </ExPopconfirm>

  <ExPopconfirm title="确定要删除吗？" type="danger">
    <ExButton type="danger">危险</ExButton>
  </ExPopconfirm>
</template>
```

## 带描述信息

通过 `description` 属性可以添加描述信息。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExPopconfirm 
    title="删除账号"
    description="删除后将无法恢复，确定要继续吗？"
    type="danger"
  >
    <ExButton type="danger">删除账号</ExButton>
  </ExPopconfirm>
  <ExPopconfirm 
    title="提交表单"
    description="提交后将发送邮件通知，是否确认提交？"
    type="primary"
  >
    <ExButton type="primary">提交</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="删除账号" description="删除后将无法恢复，确定要继续吗？" type="danger">
    <ExButton type="danger">删除账号</ExButton>
  </ExPopconfirm>
</template>
```

## 自定义按钮文字

通过 `okText` 和 `cancelText` 属性可以自定义按钮文字。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExPopconfirm 
    title="确定要退出登录吗？"
    ok-text="退出"
    cancel-text="再想想"
  >
    <ExButton>退出登录</ExButton>
  </ExPopconfirm>
  <ExPopconfirm 
    title="确定要发布文章吗？"
    ok-text="立即发布"
    cancel-text="暂不发布"
    type="primary"
  >
    <ExButton type="primary">发布文章</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="确定要退出登录吗？" ok-text="退出" cancel-text="再想想">
    <ExButton>退出登录</ExButton>
  </ExPopconfirm>
</template>
```

## 自定义图标

通过 `icon` 插槽可以自定义图标。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExPopconfirm title="确定要清空购物车吗？" type="warning">
    <template #icon>
      <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="购物车" width="20" height="20" />
    </template>
    <ExButton type="warning">清空购物车</ExButton>
  </ExPopconfirm>
  <ExPopconfirm title="确定要收藏这篇文章吗？" type="success">
    <template #icon>
      <img src="https://api.iconify.design/ri/heart-line.svg" alt="收藏" width="20" height="20" />
    </template>
    <ExButton type="success">收藏</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="确定要清空购物车吗？" type="warning">
    <template #icon>
      <img
        src="https://api.iconify.design/ri/shopping-cart-line.svg"
        alt="购物车"
        width="20"
        height="20"
      />
    </template>
    <ExButton type="warning">清空购物车</ExButton>
  </ExPopconfirm>
</template>
```

## 不同位置

通过 `placement` 属性可以设置弹出位置。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
  <div style="display: flex; gap: 12px;">
    <ExPopconfirm title="确定要删除吗？" placement="top-start">
      <ExButton>上左</ExButton>
    </ExPopconfirm>
    <ExPopconfirm title="确定要删除吗？" placement="top">
      <ExButton>上边</ExButton>
    </ExPopconfirm>
    <ExPopconfirm title="确定要删除吗？" placement="top-end">
      <ExButton>上右</ExButton>
    </ExPopconfirm>
  </div>
  <div style="display: flex; gap: 12px; width: 100%; justify-content: space-between;">
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExPopconfirm title="确定要删除吗？" placement="left-start">
        <ExButton>左上</ExButton>
      </ExPopconfirm>
      <ExPopconfirm title="确定要删除吗？" placement="left">
        <ExButton>左边</ExButton>
      </ExPopconfirm>
      <ExPopconfirm title="确定要删除吗？" placement="left-end">
        <ExButton>左下</ExButton>
      </ExPopconfirm>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExPopconfirm title="确定要删除吗？" placement="right-start">
        <ExButton>右上</ExButton>
      </ExPopconfirm>
      <ExPopconfirm title="确定要删除吗？" placement="right">
        <ExButton>右边</ExButton>
      </ExPopconfirm>
      <ExPopconfirm title="确定要删除吗？" placement="right-end">
        <ExButton>右下</ExButton>
      </ExPopconfirm>
    </div>
  </div>
  <div style="display: flex; gap: 12px;">
    <ExPopconfirm title="确定要删除吗？" placement="bottom-start">
      <ExButton>下左</ExButton>
    </ExPopconfirm>
    <ExPopconfirm title="确定要删除吗？" placement="bottom">
      <ExButton>下边</ExButton>
    </ExPopconfirm>
    <ExPopconfirm title="确定要删除吗？" placement="bottom-end">
      <ExButton>下右</ExButton>
    </ExPopconfirm>
  </div>
</div>

```vue
<template>
  <ExPopconfirm title="确定要删除吗？" placement="top">
    <ExButton>上边</ExButton>
  </ExPopconfirm>

  <ExPopconfirm title="确定要删除吗？" placement="bottom">
    <ExButton>下边</ExButton>
  </ExPopconfirm>
</template>
```

## 确认加载状态

通过 `confirmLoading` 属性可以让确认按钮处于加载状态。

<div class="demo-container">
  <ExPopconfirm 
    title="确定要提交吗？"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
  >
    <ExButton type="primary">提交</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="确定要提交吗？" :confirm-loading="confirmLoading" @confirm="handleConfirm">
    <ExButton type="primary">提交</ExButton>
  </ExPopconfirm>
</template>

<script setup>
import { ref } from 'vue';

const confirmLoading = ref(false);

const handleConfirm = () => {
  confirmLoading.value = true;
  setTimeout(() => {
    confirmLoading.value = false;
  }, 2000);
};
</script>
```

## 隐藏取消按钮

设置 `:show-cancel="false"` 可以隐藏取消按钮。

<div class="demo-container">
  <ExPopconfirm 
    title="这是一条提示信息"
    :show-cancel="false"
    type="info"
  >
    <ExButton type="info">查看提示</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="这是一条提示信息" :show-cancel="false" type="info">
    <ExButton type="info">查看提示</ExButton>
  </ExPopconfirm>
</template>
```

## 事件处理

可以监听 `confirm` 和 `cancel` 事件。

<div class="demo-container">
  <ExPopconfirm 
    title="确定要删除这条记录吗？"
    type="danger"
    @confirm="() => console.log('确认删除')"
    @cancel="() => console.log('取消删除')"
  >
    <ExButton type="danger">删除记录</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm
    title="确定要删除这条记录吗？"
    type="danger"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <ExButton type="danger">删除记录</ExButton>
  </ExPopconfirm>
</template>

<script setup>
const handleConfirm = () => {
  console.log('确认删除');
  // 执行删除操作
};

const handleCancel = () => {
  console.log('取消删除');
};
</script>
```

## 确认前回调

通过 `beforeConfirm` 属性可以在确认前执行回调，返回 `false` 可以阻止确认。

<div class="demo-container">
  <ExPopconfirm 
    title="确定要删除吗？"
    :before-confirm="beforeConfirm"
    type="danger"
  >
    <ExButton type="danger">二次确认</ExButton>
  </ExPopconfirm>
</div>

```vue
<template>
  <ExPopconfirm title="确定要删除吗？" :before-confirm="beforeConfirm" type="danger">
    <ExButton type="danger">二次确认</ExButton>
  </ExPopconfirm>
</template>

<script setup>
const beforeConfirm = () => {
  // 返回 false 可以阻止确认
  // 这里可以执行异步验证、显示自定义对话框等
  return confirm('再次确认：真的要删除吗？');
};
</script>
```

## API

### Popconfirm Props

| 属性              | 说明             | 类型                                                                     | 默认值      |
| ----------------- | ---------------- | ------------------------------------------------------------------------ | ----------- |
| `title`           | 确认框标题       | `string`                                                                 | `''`        |
| `description`     | 确认框描述       | `string`                                                                 | `''`        |
| `type`            | 确认框类型       | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'warning'` |
| `ok-text`         | 确认按钮文字     | `string`                                                                 | `'确定'`    |
| `cancel-text`     | 取消按钮文字     | `string`                                                                 | `'取消'`    |
| `ok-type`         | 确认按钮类型     | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'`           | `'primary'` |
| `show-cancel`     | 是否显示取消按钮 | `boolean`                                                                | `true`      |
| `confirm-loading` | 确认按钮加载状态 | `boolean`                                                                | `false`     |
| `disabled`        | 是否禁用         | `boolean`                                                                | `false`     |
| `placement`       | 弹出位置         | `PopoverPlacement`                                                       | `'top'`     |
| `trigger`         | 触发方式         | `'hover' \| 'click' \| 'focus' \| 'contextmenu'`                         | `'click'`   |
| `icon`            | 自定义图标 URL   | `string`                                                                 | `undefined` |
| `show-icon`       | 是否显示图标     | `boolean`                                                                | `true`      |
| `popup-class`     | 自定义类名       | `string`                                                                 | `''`        |
| `popup-style`     | 自定义样式       | `Record<string, string \| number>`                                       | `undefined` |
| `before-confirm`  | 确认前的回调     | `() => boolean \| Promise<boolean>`                                      | `undefined` |

### Popconfirm Events

| 事件名           | 说明               | 类型                         |
| ---------------- | ------------------ | ---------------------------- |
| `confirm`        | 点击确认按钮时触发 | `() => void`                 |
| `cancel`         | 点击取消按钮时触发 | `() => void`                 |
| `update:visible` | 显示状态变化时触发 | `(visible: boolean) => void` |

### Popconfirm Slots

| 插槽名        | 说明       |
| ------------- | ---------- |
| `default`     | 触发元素   |
| `title`       | 自定义标题 |
| `description` | 自定义描述 |
| `icon`        | 自定义图标 |

### Popconfirm Methods

| 方法名 | 说明       | 类型         |
| ------ | ---------- | ------------ |
| `show` | 显示确认框 | `() => void` |
| `hide` | 隐藏确认框 | `() => void` |

## 无障碍支持

- 完整的键盘导航支持
- 支持 ESC 键关闭
- 完整的 ARIA 属性支持
- 支持屏幕阅读器

## 主题定制

可以通过 CSS 变量自定义气泡确认框样式：

```css
:root {
  --ex-popconfirm-bg: var(--ex-color-bg-surface);
  --ex-popconfirm-border-color: var(--ex-color-border-primary);
  --ex-popconfirm-shadow: var(--ex-shadow-lg);
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
