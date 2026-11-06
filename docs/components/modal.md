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

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="visible = true">打开模态框</ExButton>
  <ExModal v-model="visible" title="基础模态框" size="medium">
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
  </ExModal>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="visible = true"
  >
    打开模态框
  </ExButton>

  <ExModal
    v-model="visible"
    title="基础模态框"
    size="medium"
  >
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
    <p>这是模态框的内容</p>
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>
```

:::

## 不同类型

通过 `type` 属性设置模态框的语义类型。

::: raw

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExButton type="primary" @click="visibleType1 = true">主要模态框</ExButton>
  <ExButton type="success" @click="visibleType2 = true">成功模态框</ExButton>
  <ExButton type="warning" @click="visibleType3 = true">警告模态框</ExButton>
  <ExButton type="danger" @click="visibleType4 = true">危险模态框</ExButton>
  <ExModal v-model="visibleType1" title="主要模态框" type="primary" size="medium">
    <template #icon>
      <img src="https://api.iconify.design/ri/information-line.svg" alt="信息" width="24" height="24" />
    </template>
    <p>这是一个主要类型的模态框。</p>
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

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleType1 = ref(false);
const visibleType2 = ref(false);
const visibleType3 = ref(false);
const visibleType4 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleType1 = true"
  >
    主要模态框
  </ExButton>
  <ExButton
    type="success"
    @click="visibleType2 = true"
  >
    成功模态框
  </ExButton>
  <ExButton
    type="warning"
    @click="visibleType3 = true"
  >
    警告模态框
  </ExButton>
  <ExButton
    type="danger"
    @click="visibleType4 = true"
  >
    危险模态框
  </ExButton>
  <ExModal
    v-model="visibleType1"
    title="主要模态框"
    type="primary"
    size="medium"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/information-line.svg"
        alt="信息"
        width="24"
        height="24"
      />
    </template>
    <p>这是一个主要类型的模态框。</p>
  </ExModal>
  <ExModal
    v-model="visibleType2"
    title="操作成功"
    type="success"
    size="medium"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/checkbox-circle-line.svg"
        alt="成功"
        width="24"
        height="24"
      />
    </template>
    <p>您的操作已成功完成！</p>
  </ExModal>
  <ExModal
    v-model="visibleType3"
    title="警告提示"
    type="warning"
    size="medium"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/alert-line.svg"
        alt="警告"
        width="24"
        height="24"
      />
    </template>
    <p>请注意：此操作可能会影响您的数据。</p>
  </ExModal>
  <ExModal
    v-model="visibleType4"
    title="危险操作"
    type="danger"
    size="medium"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/error-warning-line.svg"
        alt="危险"
        width="24"
        height="24"
      />
    </template>
    <p>警告：此操作不可撤销，请谨慎操作！</p>
  </ExModal>
</template>
```

:::

## 不同尺寸

通过 `size` 属性可以设置不同尺寸的模态框。

::: raw

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

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleSize1 = ref(false);
const visibleSize2 = ref(false);
const visibleSize3 = ref(false);
</script>

<template>
  <ExButton
    @click="visibleSize1 = true"
    size="small"
  >
    小尺寸
  </ExButton>
  <ExButton @click="visibleSize2 = true">中等尺寸</ExButton>
  <ExButton
    @click="visibleSize3 = true"
    size="large"
  >
    大尺寸
  </ExButton>
  <ExModal
    v-model="visibleSize1"
    title="小尺寸模态框"
    size="small"
  >
    <p>这是一个小尺寸的模态框（400px）。</p>
  </ExModal>
  <ExModal
    v-model="visibleSize2"
    title="中等尺寸模态框"
    size="medium"
  >
    <p>这是一个中等尺寸的模态框（520px）。</p>
  </ExModal>
  <ExModal
    v-model="visibleSize3"
    title="大尺寸模态框"
    size="large"
  >
    <p>这是一个大尺寸的模态框（720px）。</p>
  </ExModal>
</template>
```

:::

## 自定义宽度

通过 `width` 属性可以自定义模态框宽度。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="visibleWidth = true">自定义宽度</ExButton>
  <ExModal v-model="visibleWidth" title="自定义宽度" :width="800">
    <p>这个模态框的宽度是 800px。</p>
    <p>你可以通过 width 属性设置任意宽度。</p>
  </ExModal>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleWidth = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleWidth = true"
  >
    自定义宽度
  </ExButton>

  <ExModal
    v-model="visibleWidth"
    title="自定义宽度"
    :width="800"
  >
    <p>这个模态框的宽度是 800px。</p>
    <p>你可以通过 width 属性设置任意宽度。</p>
  </ExModal>
</template>
```

:::

## 居中显示

设置 `centered` 属性可以让模态框垂直居中显示。

::: raw

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

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleCenter = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleCenter = true"
  >
    居中模态框
  </ExButton>

  <ExModal
    v-model="visibleCenter"
    title="居中显示"
    size="medium"
    centered
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/trophy-line.svg"
        alt="奖杯"
        width="24"
        height="24"
      />
    </template>
    <div style="text-align: center; padding: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <div
        style="font-size: 24px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;"
      >
        恭喜获胜！
      </div>
      <div style="color: var(--ex-color-text-secondary);">您在本场比赛中表现出色</div>
    </div>
  </ExModal>
</template>
```

:::

## 自定义按钮文字

通过 `okText` 和 `cancelText` 属性可以自定义按钮文字。

::: raw

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

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleCustomBtn = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleCustomBtn = true"
  >
    自定义按钮
  </ExButton>

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
      <img
        src="https://api.iconify.design/ri/delete-bin-line.svg"
        alt="删除"
        width="24"
        height="24"
      />
    </template>
    <p>确定要删除这条记录吗？</p>
    <p>删除后将无法恢复。</p>
  </ExModal>
</template>
```

:::

## 自定义底部

通过 `footer` 插槽可以自定义底部内容。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="visibleCustomFooter = true">自定义底部</ExButton>
  <ExModal v-model="visibleCustomFooter" title="自定义底部" size="medium">
    <p>这是一个自定义底部的模态框。</p>
    <template #footer>
      <ExButton type="default" @click="visibleCustomFooter = false">知道了</ExButton>
    </template>
  </ExModal>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleCustomFooter = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleCustomFooter = true"
  >
    自定义底部
  </ExButton>

  <ExModal
    v-model="visibleCustomFooter"
    title="自定义底部"
    size="medium"
  >
    <p>这是一个自定义底部的模态框。</p>
    <template #footer>
      <ExButton
        type="default"
        @click="visibleCustomFooter = false"
      >
        知道了
      </ExButton>
    </template>
  </ExModal>
</template>
```

:::

## 确认加载状态

通过 `confirmLoading` 属性可以让确认按钮处于加载状态。需要配合 `before-close` 属性来阻止模态框自动关闭。

::: raw

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

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="visibleLoading = true"
  >
    加载状态
  </ExButton>

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
</template>

<script setup>
import { ref } from 'vue';

const visibleLoading = ref(false);
const confirmLoading = ref(false);

const handleOk = () => {
  confirmLoading.value = true;
  // 模拟异步操作（如API请求）
  setTimeout(() => {
    confirmLoading.value = false;
    visibleLoading.value = false; // 操作完成后关闭模态框
  }, 2000);
};
</script>
```

:::

## 不可点击遮罩关闭

设置 `:mask-closable="false"` 可以禁止点击遮罩层关闭。

::: raw

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

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleMask = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleMask = true"
  >
    不可点击遮罩关闭
  </ExButton>

  <ExModal
    v-model="visibleMask"
    title="重要提示"
    size="medium"
    type="warning"
    :mask-closable="false"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/alert-line.svg"
        alt="警告"
        width="24"
        height="24"
      />
    </template>
    <p>这个模态框不能通过点击遮罩层关闭。</p>
    <p>必须点击按钮才能关闭。</p>
  </ExModal>
</template>
```

:::

## 自定义样式

通过 `bodyStyle` 属性可以自定义内容区域样式。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="visibleCustomStyle = true">自定义样式</ExButton>
  <ExModal 
    v-model="visibleCustomStyle" 
    title="自定义样式"
    size="medium"
    :body-style="{ 
      background: 'var(--ex-color-primary-alpha-10)',
      minHeight: '200px'
    }"
  >
    <div style="text-align: center; padding: 40px 0;">
      <h3 style="color: var(--ex-color-primary); margin-bottom: 16px;">
        自定义内容样式
      </h3>
      <p>这个模态框的内容区域使用了自定义样式。</p>
    </div>
  </ExModal>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const visibleCustomStyle = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visibleCustomStyle = true"
  >
    自定义样式
  </ExButton>

  <ExModal
    v-model="visibleCustomStyle"
    title="自定义样式"
    size="medium"
    :body-style="{
      background: 'var(--ex-color-primary-alpha-10)',
      minHeight: '200px',
    }"
  >
    <div style="text-align: center; padding: 40px 0;">
      <h3 style="color: var(--ex-color-primary); margin-bottom: 16px;">自定义内容样式</h3>
      <p>这个模态框的内容区域使用了自定义样式。</p>
    </div>
  </ExModal>
</template>
```

:::

## 嵌套模态框

模态框可以嵌套使用。

::: raw

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

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="visibleOuter = true"
  >
    打开外层模态框
  </ExButton>

  <ExModal
    v-model="visibleOuter"
    title="外层模态框"
    size="medium"
  >
    <p>这是外层模态框的内容。</p>
    <ExButton
      type="primary"
      @click="visibleInner = true"
    >
      打开内层模态框
    </ExButton>

    <ExModal
      v-model="visibleInner"
      title="内层模态框"
      size="small"
      :z-index="1010"
    >
      <p>这是内层模态框的内容。</p>
    </ExModal>
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';

const visibleOuter = ref(false);
const visibleInner = ref(false);
</script>
```

:::

## API

省略 `size` 时继承最近的 `ExConfigProvider`；未配置全局尺寸时使用下表默认值。显式设置的尺寸优先。

### Modal Props

| 属性                    | 说明                        | 类型                                                                     | 默认值      |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------ | ----------- |
| `model-value / v-model` | 是否显示模态框              | `boolean`                                                                | `false`     |
| `title`                 | 模态框标题                  | `string`                                                                 | —           |
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
| `z-index`               | 层级                        | `number`                                                                 | 全局层级    |
| `append-to-body`        | 是否追加到 body             | `boolean`                                                                | `true`      |
| `destroy-on-close`      | 关闭动画结束后是否销毁内容  | `boolean`                                                                | `false`     |
| `show-footer`           | 是否显示默认底部按钮区      | `boolean`                                                                | `true`      |
| `wrap-class-name`       | 包装器自定义类名            | `string`                                                                 | `''`        |
| `body-style`            | 内容区域自定义样式          | `CSSProperties`                                                          | `undefined` |
| `lock-scroll`           | 模态状态下是否锁定页面滚动  | `boolean`                                                                | `true`      |
| `before-open`           | 模态框打开前的守卫          | `() => boolean \| Promise<boolean>`                                      | `undefined` |
| `before-close`          | 模态框关闭前的回调          | `() => boolean \| Promise<boolean>`                                      | `undefined` |

### Modal Events

| 事件名               | 说明                     | 类型                                                 |
| -------------------- | ------------------------ | ---------------------------------------------------- |
| `update:model-value` | 更新 modelValue          | `(value: boolean) => void`                           |
| `open`               | 打开守卫通过后触发       | `() => void`                                         |
| `close`              | 外部状态真正关闭时触发   | `() => void`                                         |
| `ok`                 | 点击确定按钮时触发       | `() => void`                                         |
| `cancel`             | 点击取消按钮时触发       | `() => void`                                         |
| `after-close`        | 模态框关闭动画结束后触发 | `() => void`                                         |
| `guard-error`        | 打开或关闭守卫发生异常   | `(error: unknown, phase: 'open' \| 'close') => void` |

### Modal Slots

| 插槽名      | 说明               |
| ----------- | ------------------ |
| `default`   | 模态框内容         |
| `title`     | 自定义标题         |
| `icon`      | 自定义图标         |
| `footer`    | 自定义底部内容     |
| `closeIcon` | 自定义关闭按钮图标 |

### Modal Methods

| 方法名       | 说明                                     | 类型                           |
| ------------ | ---------------------------------------- | ------------------------------ |
| `open`       | 请求父级打开                             | `() => void`                   |
| `close`      | 经关闭守卫请求关闭；无效任务返回 `false` | `() => Promise<boolean>`       |
| `getElement` | 获取模态框 DOM 元素                      | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="dialog"`；仅有遮罩时声明 `aria-modal="true"`
- 支持 ESC 键关闭
- 原生 `aria-label` 与 `aria-labelledby` 会应用到对话框面板
- 支持屏幕阅读器
- 自动锁定焦点在模态框内

## 受控 / 非受控

Modal 通过 `v-model`（`modelValue`）受控：

```vue
<template>
  <ExModal
    v-model="visible"
    title="标题"
    @ok="onOk"
    @cancel="onCancel"
  >
    内容
  </ExModal>
</template>

<script setup>
import { ref } from 'vue';
const visible = ref(false);
</script>
```

- 点击确定先触发 `ok`，再经 `before-close` 校验，通过后自动关闭；点击取消/遮罩/ESC 触发 `cancel`。
- 异步提交时用 `:confirm-loading="true"` 锁定确定按钮，并用 `before-close` 在校验未过时返回 `false` 阻止关闭。

> Modal 与 [Dialog](/components/dialog) 功能相近：Modal 偏 Ant Design 风格（`ok/cancel`、`mask`、`keyboard`），Dialog 偏 Element 风格（`confirm/cancel`、`modal`、`close-on-press-escape`）。同一项目建议只选其一以保持一致。

## 常见问题

**Q：`ok` 和 `cancel` 与 `before-close` 的执行顺序？**
先 emit `ok`/`cancel`，再执行 `before-close`；`before-close` 返回 `false` 时不更新 `modelValue`，模态框保持打开。

**Q：如何禁止 ESC / 点击遮罩关闭？**
设置 `:keyboard="false"` 与 `:mask-closable="false"`。

**Q：多个模态框叠加？**
支持叠加：滚动锁引用计数、ESC 只关最顶层、关闭后焦点归还触发元素。

## 最佳实践

- **二次确认/表单提交**用 `confirm-loading` + `before-close`，提交成功后关闭。
- **危险操作**用 `ok-type="danger"` 强化视觉警示。
- 需要业务名称时设置 `title`、原生 `aria-label` 或 `aria-labelledby`。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
