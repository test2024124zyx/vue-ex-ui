# Modal 模态框

模态对话框，在当前页面打开一个浮层，承载相关操作。

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const visibleType1 = ref(false)
const visibleType2 = ref(false)
const visibleType3 = ref(false)
const visibleType4 = ref(false)
const visibleSize1 = ref(false)
const visibleSize2 = ref(false)
const visibleSize3 = ref(false)
const visibleWidth = ref(false)
const visibleCenter = ref(false)
const visibleCustomBtn = ref(false)
const visibleCustomFooter = ref(false)
const visibleLoading = ref(false)
const visibleMask = ref(false)
const visibleCustomStyle = ref(false)
const visibleOuter = ref(false)
const visibleInner = ref(false)
const confirmLoading = ref(false)

const showModal = () => {
  visible.value = true
}

const handleOk = () => {
  confirmLoading.value = true
  // 模拟异步操作（如API请求）
  setTimeout(() => {
    confirmLoading.value = false
    visibleLoading.value = false  // 操作完成后关闭模态框
  }, 2000)
}
</script>

## 基础用法

最简单的用法。默认为中等尺寸（520px）。

<div class="demo-container">
  <ExButton type="primary" @click="visible = true">打开模态框</ExButton>
  <ExModal v-model="visible" title="基础模态框" size="medium">
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">打开模态框</ExButton>

  <ExModal v-model="visible" title="基础模态框">
    <p>这是模态框的内容</p>
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>
```

## 不同类型

通过 `type` 属性可以设置不同类型的模态框，不同类型会有不同的边框颜色和发光效果。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExButton type="primary" @click="visibleType1 = true">主要模态框</ExButton>
  <ExButton type="success" @click="visibleType2 = true">成功模态框</ExButton>
  <ExButton type="warning" @click="visibleType3 = true">警告模态框</ExButton>
  <ExButton type="danger" @click="visibleType4 = true">危险模态框</ExButton>
  <ExModal v-model="visibleType1" title="主要模态框" type="primary" size="medium">
    <template #icon>
      <img src="https://api.iconify.design/ri/information-line.svg" alt="信息" width="24" height="24" />
    </template>
    <p>这是一个主要类型的模态框，带有霓虹蓝色边框和发光效果。</p>
  </ExModal>
  <ExModal v-model="visibleType2" title="操作成功" type="success" size="medium">
    <template #icon>
      <img src="https://api.iconify.design/ri/checkbox-circle-line.svg" alt="成功" width="24" height="24" />
    </template>
    <p>您的操作已成功完成！</p>
  </ExModal>
  <ExModal v-model="visibleType3" title="警告提示" type="warning" size="medium">
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>请注意：此操作可能会影响您的数据。</p>
  </ExModal>
  <ExModal v-model="visibleType4" title="危险操作" type="danger" size="medium">
    <template #icon>
      <img src="https://api.iconify.design/ri/error-warning-line.svg" alt="危险" width="24" height="24" />
    </template>
    <p>警告：此操作不可撤销，请谨慎操作！</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">主要模态框</ExButton>

  <ExModal v-model="visible" title="主要模态框" type="primary" size="medium">
    <template #icon>
      <img
        src="https://api.iconify.design/ri/information-line.svg"
        alt="信息"
        width="24"
        height="24"
      />
    </template>
    <p>这是一个主要类型的模态框，带有霓虹蓝色边框和发光效果。</p>
  </ExModal>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同尺寸的模态框。

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExButton @click="visibleSize1 = true" size="small">小尺寸</ExButton>
  <ExButton @click="visibleSize2 = true">中等尺寸</ExButton>
  <ExButton @click="visibleSize3 = true" size="large">大尺寸</ExButton>
  <ExModal v-model="visibleSize1" title="小尺寸模态框" size="small">
    <p>这是一个小尺寸的模态框（400px）。</p>
  </ExModal>
  <ExModal v-model="visibleSize2" title="中等尺寸模态框" size="medium">
    <p>这是一个中等尺寸的模态框（520px）。</p>
  </ExModal>
  <ExModal v-model="visibleSize3" title="大尺寸模态框" size="large">
    <p>这是一个大尺寸的模态框（720px）。</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton @click="visible = true">小尺寸</ExButton>

  <ExModal v-model="visible" title="小尺寸模态框" size="small">
    <p>这是一个小尺寸的模态框。</p>
  </ExModal>
</template>
```

## 自定义宽度

通过 `width` 属性可以自定义模态框宽度。

<div class="demo-container">
  <ExButton type="primary" @click="visibleWidth = true">自定义宽度</ExButton>
  <ExModal v-model="visibleWidth" title="自定义宽度" :width="800">
    <p>这个模态框的宽度是 800px。</p>
    <p>你可以通过 width 属性设置任意宽度。</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">自定义宽度</ExButton>

  <ExModal v-model="visibleWidth" title="自定义宽度" :width="800">
    <p>这个模态框的宽度是 800px。</p>
  </ExModal>
</template>
```

## 居中显示

设置 `centered` 属性可以让模态框垂直居中显示。

<div class="demo-container">
  <ExButton type="primary" @click="visibleCenter = true">居中模态框</ExButton>
  <ExModal v-model="visibleCenter" title="居中显示" size="medium" centered>
    <template #icon>
      <img src="https://api.iconify.design/ri/trophy-line.svg" alt="奖杯" width="24" height="24" />
    </template>
    <div style="text-align: center; padding: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <div style="font-size: 24px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">
        恭喜获胜！
      </div>
      <div style="color: var(--ex-color-text-secondary);">
        您在本场比赛中表现出色
      </div>
    </div>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">居中模态框</ExButton>

  <ExModal v-model="visibleCenter" title="居中显示" size="medium" centered>
    <div style="text-align: center;">
      <div style="font-size: 48px;">🏆</div>
      <div>恭喜获胜！</div>
    </div>
  </ExModal>
</template>
```

## 自定义按钮文字

通过 `okText` 和 `cancelText` 属性可以自定义按钮文字。

<div class="demo-container">
  <ExButton type="primary" @click="visibleCustomBtn = true">自定义按钮</ExButton>
  <ExModal 
    v-model="visibleCustomBtn" 
    title="删除确认"
    size="medium"
    type="danger"
    ok-text="删除"
    cancel-text="我再想想"
    ok-type="danger"
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/delete-bin-line.svg" alt="删除" width="24" height="24" />
    </template>
    <p>确定要删除这条记录吗？</p>
    <p>删除后将无法恢复。</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">自定义按钮</ExButton>

  <ExModal
    v-model="visible"
    title="删除确认"
    ok-text="删除"
    cancel-text="我再想想"
    ok-type="danger"
  >
    <p>确定要删除这条记录吗？</p>
  </ExModal>
</template>
```

## 自定义底部

通过 `footer` 插槽可以自定义底部内容。

<div class="demo-container">
  <ExButton type="primary" @click="visibleCustomFooter = true">自定义底部</ExButton>
  <ExModal v-model="visibleCustomFooter" title="自定义底部" size="medium">
    <p>这是一个自定义底部的模态框。</p>
    <template #footer>
      <ExButton type="default" @click="visibleCustomFooter = false">知道了</ExButton>
    </template>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">自定义底部</ExButton>

  <ExModal v-model="visibleCustomFooter" title="自定义底部" size="medium">
    <p>这是一个自定义底部的模态框。</p>
    <template #footer>
      <ExButton type="default" @click="visibleCustomFooter = false">知道了</ExButton>
    </template>
  </ExModal>
</template>
```

## 确认加载状态

通过 `confirmLoading` 属性可以让确认按钮处于加载状态。需要配合 `before-close` 属性来阻止模态框自动关闭。

<div class="demo-container">
  <ExButton type="primary" @click="visibleLoading = true">加载状态</ExButton>
  <ExModal 
    v-model="visibleLoading" 
    title="提交表单"
    size="medium"
    :confirm-loading="confirmLoading"
    :before-close="() => !confirmLoading"
    @ok="handleOk"
  >
    <p>点击确定按钮后，按钮会显示加载状态。</p>
    <p>2秒后自动关闭。</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">加载状态</ExButton>

  <ExModal 
    v-model="visible" 
    title="提交表单" 
    :confirm-loading="confirmLoading"
    :before-close="() => !confirmLoading"
    @ok="handleOk"
  >
    <p>点击确定按钮后，按钮会显示加载状态。</p>
    <p>2秒后自动关闭。</p>
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const confirmLoading = ref(false);

const handleOk = () => {
  confirmLoading.value = true;
  // 模拟异步操作（如API请求）
  setTimeout(() => {
    confirmLoading.value = false;
    visible.value = false;  // 操作完成后关闭模态框
  }, 2000);
};
</script>
```

## 不可点击遮罩关闭

设置 `:mask-closable="false"` 可以禁止点击遮罩层关闭。

<div class="demo-container">
  <ExButton type="primary" @click="visibleMask = true">不可点击遮罩关闭</ExButton>
  <ExModal 
    v-model="visibleMask" 
    title="重要提示"
    size="medium"
    type="warning"
    :mask-closable="false"
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>这个模态框不能通过点击遮罩层关闭。</p>
    <p>必须点击按钮才能关闭。</p>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">不可点击遮罩关闭</ExButton>

  <ExModal v-model="visible" title="重要提示" :mask-closable="false">
    <p>这个模态框不能通过点击遮罩层关闭。</p>
  </ExModal>
</template>
```

## 自定义样式

通过 `bodyStyle` 属性可以自定义内容区域样式。

<div class="demo-container">
  <ExButton type="primary" @click="visibleCustomStyle = true">自定义样式</ExButton>
  <ExModal 
    v-model="visibleCustomStyle" 
    title="自定义样式"
    size="medium"
    :body-style="{ 
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(255, 0, 127, 0.1))',
      minHeight: '200px'
    }"
  >
    <div style="text-align: center; padding: 40px 0;">
      <h3 style="color: var(--ex-color-neon-blue-500); margin-bottom: 16px;">
        自定义内容样式
      </h3>
      <p>这个模态框的内容区域使用了自定义样式。</p>
    </div>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="visible = true">自定义样式</ExButton>

  <ExModal
    v-model="visible"
    title="自定义样式"
    :body-style="{
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(255, 0, 127, 0.1))',
      minHeight: '200px',
    }"
  >
    <div>自定义内容样式</div>
  </ExModal>
</template>
```

## 嵌套模态框

模态框可以嵌套使用。

<div class="demo-container">
  <ExButton type="primary" @click="visibleOuter = true">打开外层模态框</ExButton>
  <ExModal v-model="visibleOuter" title="外层模态框" size="medium">
    <p>这是外层模态框的内容。</p>
    <ExButton type="primary" @click="visibleInner = true">打开内层模态框</ExButton>
    <ExModal v-model="visibleInner" title="内层模态框" size="small" :z-index="1010">
      <p>这是内层模态框的内容。</p>
    </ExModal>
  </ExModal>
</div>

```vue
<template>
  <ExButton type="primary" @click="outerVisible = true">打开外层模态框</ExButton>

  <ExModal v-model="outerVisible" title="外层模态框">
    <p>这是外层模态框的内容。</p>
    <ExButton type="primary" @click="innerVisible = true">打开内层模态框</ExButton>

    <ExModal v-model="innerVisible" title="内层模态框" :z-index="1010">
      <p>这是内层模态框的内容。</p>
    </ExModal>
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';

const outerVisible = ref(false);
const innerVisible = ref(false);
</script>
```

## API

### Modal Props

| 属性                    | 说明                        | 类型                                                                     | 默认值      |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------ | ----------- |
| `model-value / v-model` | 是否显示模态框              | `boolean`                                                                | `false`     |
| `title`                 | 模态框标题                  | `string`                                                                 | `''`        |
| `size`                  | 模态框尺寸                  | `'small' \| 'medium' \| 'large'`                                         | `'medium'`  |
| `type`                  | 模态框类型                  | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `show-close`            | 是否显示关闭按钮            | `boolean`                                                                | `true`      |
| `mask`                  | 是否显示遮罩层              | `boolean`                                                                | `true`      |
| `mask-closable`         | 是否可以通过点击遮罩层关闭  | `boolean`                                                                | `true`      |
| `keyboard`              | 是否可以通过按下 ESC 键关闭 | `boolean`                                                                | `true`      |
| `ok-text`               | 确认按钮文本                | `string`                                                                 | `'确定'`    |
| `cancel-text`           | 取消按钮文本                | `string`                                                                 | `'取消'`    |
| `ok-type`               | 确认按钮类型                | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'`           | `'primary'` |
| `confirm-loading`       | 确认按钮加载状态            | `boolean`                                                                | `false`     |
| `centered`              | 是否居中显示                | `boolean`                                                                | `false`     |
| `width`                 | 宽度                        | `string \| number`                                                       | `undefined` |
| `z-index`               | 层级                        | `number`                                                                 | `1000`      |
| `append-to-body`        | 是否追加到 body             | `boolean`                                                                | `true`      |
| `destroy-on-close`      | 是否在关闭时销毁内容        | `boolean`                                                                | `false`     |
| `wrap-class-name`       | 包装器自定义类名            | `string`                                                                 | `''`        |
| `body-style`            | 内容区域自定义样式          | `Record<string, string \| number>`                                       | `undefined` |
| `before-close`          | 模态框关闭前的回调          | `() => boolean \| Promise<boolean>`                                      | `undefined` |
| `aria-label`            | 无障碍标签                  | `string`                                                                 | `undefined` |

### Modal Events

| 事件名               | 说明                     | 类型                       |
| -------------------- | ------------------------ | -------------------------- |
| `update:model-value` | 更新 modelValue          | `(value: boolean) => void` |
| `ok`                 | 点击确定按钮时触发       | `() => void`               |
| `cancel`             | 点击取消按钮时触发       | `() => void`               |
| `after-close`        | 模态框关闭动画结束后触发 | `() => void`               |

### Modal Slots

| 插槽名      | 说明               |
| ----------- | ------------------ |
| `default`   | 模态框内容         |
| `title`     | 自定义标题         |
| `icon`      | 自定义图标         |
| `footer`    | 自定义底部内容     |
| `closeIcon` | 自定义关闭按钮图标 |

### Modal Methods

| 方法名       | 说明                | 类型                           |
| ------------ | ------------------- | ------------------------------ |
| `getElement` | 获取模态框 DOM 元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="dialog"` 和 `aria-modal` 属性
- 支持 ESC 键关闭
- 完整的 ARIA 标签支持
- 支持屏幕阅读器
- 自动锁定焦点在模态框内

## 主题定制

可以通过 CSS 变量自定义模态框样式：

```css
:root {
  --ex-modal-bg: var(--ex-color-bg-surface);
  --ex-modal-border-color: var(--ex-color-border-primary);
  --ex-modal-shadow: var(--ex-shadow-2xl);
  --ex-modal-mask-bg: rgba(0, 0, 0, 0.75);
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
