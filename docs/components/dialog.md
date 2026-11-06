# Dialog 对话框

在保留当前页面状态的情况下，告知用户并承载相关操作。

<script setup>
import { useDialogDemos } from '../.vitepress/demos/useDialogDemos'

const {
  dialogVisible, dialogVisible2, dialogVisible3, dialogVisible4, dialogVisible5,
  dialogVisible6, dialogVisible7, dialogVisible8, dialogVisible9, dialogVisible10,
  dialogVisible11, dialogVisible12, dialogVisible13, dialogVisible14, dialogVisible15,
  outerDialogVisible, innerDialogVisible, confirmLoading, hasUnsavedChanges,
  handleConfirm, handleBeforeClose,
} = useDialogDemos()
</script>

## 基础用法

Dialog 弹出一个对话框，适合需要定制性更大的场景。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible = true">打开对话框</ExButton>

  <ExDialog v-model="dialogVisible" title="提示">
    <p>这是一段信息</p>
    <p>这是另一段信息</p>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="dialogVisible = true"
  >
    打开对话框
  </ExButton>

  <ExDialog
    v-model="dialogVisible"
    title="提示"
  >
    <p>这是一段信息</p>
    <p>这是另一段信息</p>
  </ExDialog>
</template>

<script setup>
import { ref } from 'vue';

const dialogVisible = ref(false);
</script>
```

:::

## 自定义标题

通过 `title` 插槽可以自定义标题内容。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible2 = true">自定义标题</ExButton>

  <ExDialog v-model="dialogVisible2">
    <template #title>
      <span style="color: var(--ex-color-neon-blue-500); font-size: 20px;">
        🎮 游戏设置
      </span>
    </template>
    <template #icon>
      <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="设置" width="24" height="24" />
    </template>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; justify-content: space-between;">
        <span>画质：</span>
        <span style="color: var(--ex-color-neon-blue-500);">超高</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>帧率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">144 FPS</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>分辨率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">2560x1440</span>
      </div>
    </div>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible2 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible2 = true"
  >
    自定义标题
  </ExButton>

  <ExDialog v-model="dialogVisible2">
    <template #title>
      <span style="color: var(--ex-color-neon-blue-500); font-size: 20px;">🎮 游戏设置</span>
    </template>
    <template #icon>
      <img
        src="https://api.iconify.design/ri/settings-3-line.svg"
        alt="设置"
        width="24"
        height="24"
      />
    </template>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; justify-content: space-between;">
        <span>画质：</span>
        <span style="color: var(--ex-color-neon-blue-500);">超高</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>帧率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">144 FPS</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>分辨率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">2560x1440</span>
      </div>
    </div>
  </ExDialog>
</template>
```

:::

## 不同类型

通过 `type` 属性可以设置不同类型的对话框。

::: raw

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExButton type="primary" @click="dialogVisible3 = true">主要对话框</ExButton>
  <ExButton type="success" @click="dialogVisible4 = true">成功对话框</ExButton>
  <ExButton type="warning" @click="dialogVisible5 = true">警告对话框</ExButton>
  <ExButton type="danger" @click="dialogVisible6 = true">危险对话框</ExButton>
  <ExDialog v-model="dialogVisible3" title="主要对话框" type="primary">
    <template #icon>
      <img src="https://api.iconify.design/ri/information-line.svg" alt="信息" width="24" height="24" />
    </template>
    <p>这是一个主要类型的对话框，带有霓虹蓝色边框和发光效果。</p>
  </ExDialog>
  <ExDialog v-model="dialogVisible4" title="操作成功" type="success">
    <template #icon>
      <img src="https://api.iconify.design/ri/checkbox-circle-line.svg" alt="成功" width="24" height="24" />
    </template>
    <p>您的操作已成功完成！</p>
  </ExDialog>
  <ExDialog v-model="dialogVisible5" title="警告提示" type="warning">
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>请注意：此操作可能会影响您的数据。</p>
  </ExDialog>
  <ExDialog v-model="dialogVisible6" title="危险操作" type="danger">
    <template #icon>
      <img src="https://api.iconify.design/ri/error-warning-line.svg" alt="危险" width="24" height="24" />
    </template>
    <p>警告：此操作不可撤销，请谨慎操作！</p>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible3 = ref(false);
const dialogVisible4 = ref(false);
const dialogVisible5 = ref(false);
const dialogVisible6 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible3 = true"
  >
    主要对话框
  </ExButton>
  <ExButton
    type="success"
    @click="dialogVisible4 = true"
  >
    成功对话框
  </ExButton>
  <ExButton
    type="warning"
    @click="dialogVisible5 = true"
  >
    警告对话框
  </ExButton>
  <ExButton
    type="danger"
    @click="dialogVisible6 = true"
  >
    危险对话框
  </ExButton>
  <ExDialog
    v-model="dialogVisible3"
    title="主要对话框"
    type="primary"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/information-line.svg"
        alt="信息"
        width="24"
        height="24"
      />
    </template>
    <p>这是一个主要类型的对话框，带有霓虹蓝色边框和发光效果。</p>
  </ExDialog>
  <ExDialog
    v-model="dialogVisible4"
    title="操作成功"
    type="success"
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
  </ExDialog>
  <ExDialog
    v-model="dialogVisible5"
    title="警告提示"
    type="warning"
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
  </ExDialog>
  <ExDialog
    v-model="dialogVisible6"
    title="危险操作"
    type="danger"
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
  </ExDialog>
</template>
```

:::

## 不同尺寸

通过 `size` 属性可以设置不同尺寸的对话框。

::: raw

<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 12px;">
  <ExButton @click="dialogVisible7 = true" size="small">小尺寸</ExButton>
  <ExButton @click="dialogVisible10 = true">中等尺寸</ExButton>
  <ExButton @click="dialogVisible11 = true" size="large">大尺寸</ExButton>
  <ExDialog v-model="dialogVisible7" title="小尺寸对话框" size="small">
    <p>这是一个小尺寸的对话框（400px）。</p>
  </ExDialog>
  <ExDialog v-model="dialogVisible10" title="中等尺寸对话框" size="medium">
    <p>这是一个中等尺寸的对话框（600px）。</p>
  </ExDialog>
  <ExDialog v-model="dialogVisible11" title="大尺寸对话框" size="large">
    <p>这是一个大尺寸的对话框（800px）。</p>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible7 = ref(false);
const dialogVisible10 = ref(false);
const dialogVisible11 = ref(false);
</script>

<template>
  <ExButton
    @click="dialogVisible7 = true"
    size="small"
  >
    小尺寸
  </ExButton>
  <ExButton @click="dialogVisible10 = true">中等尺寸</ExButton>
  <ExButton
    @click="dialogVisible11 = true"
    size="large"
  >
    大尺寸
  </ExButton>
  <ExDialog
    v-model="dialogVisible7"
    title="小尺寸对话框"
    size="small"
  >
    <p>这是一个小尺寸的对话框（400px）。</p>
  </ExDialog>
  <ExDialog
    v-model="dialogVisible10"
    title="中等尺寸对话框"
    size="medium"
  >
    <p>这是一个中等尺寸的对话框（600px）。</p>
  </ExDialog>
  <ExDialog
    v-model="dialogVisible11"
    title="大尺寸对话框"
    size="large"
  >
    <p>这是一个大尺寸的对话框（800px）。</p>
  </ExDialog>
</template>
```

:::

## 自定义底部

通过 `footer` 插槽可以自定义底部内容。提交期间阻止关闭，完成后由示例更新显隐状态。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible8 = true">自定义底部</ExButton>
  <ExDialog 
    v-model="dialogVisible8" 
    title="确认操作"
    type="warning"
    :before-close="() => !confirmLoading"
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>您确定要执行此操作吗？</p>
    <p>此操作将会删除所有相关数据，且不可恢复。</p>
    <template #footer>
      <ExButton :disabled="confirmLoading" @click="dialogVisible8 = false">暂不删除</ExButton>
      <ExButton type="danger" :loading="confirmLoading" @click="handleConfirm">确认删除</ExButton>
    </template>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="dialogVisible8 = true"
  >
    自定义底部
  </ExButton>

  <ExDialog
    v-model="dialogVisible8"
    title="确认操作"
    type="warning"
    :before-close="() => !confirmLoading"
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/alert-line.svg"
        alt="警告"
        width="24"
        height="24"
      />
    </template>
    <p>您确定要执行此操作吗？</p>
    <p>此操作将会删除所有相关数据，且不可恢复。</p>
    <template #footer>
      <ExButton
        :disabled="confirmLoading"
        @click="dialogVisible8 = false"
      >
        暂不删除
      </ExButton>
      <ExButton
        type="danger"
        :loading="confirmLoading"
        @click="handleConfirm"
      >
        确认删除
      </ExButton>
    </template>
  </ExDialog>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';

const SUBMIT_DELAY_MS = 2000;
const dialogVisible8 = ref(false);
const confirmLoading = ref(false);
let submitTimer;

const handleConfirm = () => {
  if (confirmLoading.value) return;
  confirmLoading.value = true;
  // 模拟异步提交；自定义底部负责在完成后关闭对话框。
  submitTimer = setTimeout(() => {
    submitTimer = undefined;
    confirmLoading.value = false;
    dialogVisible8.value = false;
  }, SUBMIT_DELAY_MS);
};
onBeforeUnmount(() => clearTimeout(submitTimer));
</script>
```

:::

## 居中显示

设置 `center` 属性可以让对话框内容居中显示。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible9 = true">居中对话框</ExButton>
  <ExDialog v-model="dialogVisible9" title="居中显示" center>
    <template #icon>
      <img src="https://api.iconify.design/ri/trophy-line.svg" alt="奖杯" width="24" height="24" />
    </template>
    <div style="padding: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <div style="font-size: 24px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">
        恭喜获胜！
      </div>
      <div style="color: var(--ex-color-text-secondary);">
        您在本场比赛中表现出色
      </div>
    </div>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible9 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible9 = true"
  >
    居中对话框
  </ExButton>

  <ExDialog
    v-model="dialogVisible9"
    title="居中显示"
    center
  >
    <template #icon>
      <img
        src="https://api.iconify.design/ri/trophy-line.svg"
        alt="奖杯"
        width="24"
        height="24"
      />
    </template>
    <div style="padding: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
      <div
        style="font-size: 24px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;"
      >
        恭喜获胜！
      </div>
      <div style="color: var(--ex-color-text-secondary);">您在本场比赛中表现出色</div>
    </div>
  </ExDialog>
</template>
```

:::

## 全屏对话框

设置 `fullscreen` 属性可以让对话框全屏显示。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible12 = true">全屏对话框</ExButton>
  <ExDialog v-model="dialogVisible12" title="全屏对话框" fullscreen>
    <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h2 style="color: var(--ex-color-neon-blue-500); margin-bottom: 16px;">全屏内容展示</h2>
        <p>这是一个全屏对话框，适合展示大量内容或复杂的交互界面。</p>
      </div>
    </div>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible12 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible12 = true"
  >
    全屏对话框
  </ExButton>

  <ExDialog
    v-model="dialogVisible12"
    title="全屏对话框"
    fullscreen
  >
    <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h2 style="color: var(--ex-color-neon-blue-500); margin-bottom: 16px;">全屏内容展示</h2>
        <p>这是一个全屏对话框，适合展示大量内容或复杂的交互界面。</p>
      </div>
    </div>
  </ExDialog>
</template>
```

:::

## 嵌套对话框

对话框可以嵌套使用。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="outerDialogVisible = true">打开外层对话框</ExButton>
  <ExDialog v-model="outerDialogVisible" title="外层对话框">
    <p>这是外层对话框的内容。</p>
    <ExButton type="primary" @click="innerDialogVisible = true">打开内层对话框</ExButton>
    <ExDialog v-model="innerDialogVisible" title="内层对话框">
      <p>这是内层对话框的内容。</p>
    </ExDialog>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <ExButton
    type="primary"
    @click="outerDialogVisible = true"
  >
    打开外层对话框
  </ExButton>

  <ExDialog
    v-model="outerDialogVisible"
    title="外层对话框"
  >
    <p>这是外层对话框的内容。</p>
    <ExButton
      type="primary"
      @click="innerDialogVisible = true"
    >
      打开内层对话框
    </ExButton>

    <ExDialog
      v-model="innerDialogVisible"
      title="内层对话框"
    >
      <p>这是内层对话框的内容。</p>
    </ExDialog>
  </ExDialog>
</template>

<script setup>
import { ref } from 'vue';

const outerDialogVisible = ref(false);
const innerDialogVisible = ref(false);
</script>
```

:::

## 自定义关闭按钮

通过 `close` 插槽可以自定义关闭按钮。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible13 = true">自定义关闭按钮</ExButton>
  <ExDialog v-model="dialogVisible13" title="自定义关闭">
    <template #close>
      <img src="https://api.iconify.design/ri/close-circle-line.svg" alt="关闭" width="20" height="20" />
    </template>
    <p>这个对话框使用了自定义的关闭按钮图标。</p>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible13 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible13 = true"
  >
    自定义关闭按钮
  </ExButton>

  <ExDialog
    v-model="dialogVisible13"
    title="自定义关闭"
  >
    <template #close>
      <img
        src="https://api.iconify.design/ri/close-circle-line.svg"
        alt="关闭"
        width="20"
        height="20"
      />
    </template>
    <p>这个对话框使用了自定义的关闭按钮图标。</p>
  </ExDialog>
</template>
```

:::

## 不显示底部

设置 `:show-footer="false"` 可以隐藏底部操作栏。

::: raw

<div class="demo-container">
  <ExButton type="primary" @click="dialogVisible14 = true">无底部对话框</ExButton>
  <ExDialog v-model="dialogVisible14" title="纯内容展示" :show-footer="false">
    <div style="text-align: center; padding: 20px 0;">
      <img src="https://api.iconify.design/ri/information-line.svg" alt="信息" width="64" height="64" style="margin-bottom: 16px;" />
      <h3 style="color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">温馨提示</h3>
      <p>这是一个纯内容展示的对话框，没有底部操作按钮。</p>
    </div>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const dialogVisible14 = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="dialogVisible14 = true"
  >
    无底部对话框
  </ExButton>

  <ExDialog
    v-model="dialogVisible14"
    title="纯内容展示"
    :show-footer="false"
  >
    <div style="text-align: center; padding: 20px 0;">
      <img
        src="https://api.iconify.design/ri/information-line.svg"
        alt="信息"
        width="64"
        height="64"
        style="margin-bottom: 16px;"
      />
      <h3 style="color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">温馨提示</h3>
      <p>这是一个纯内容展示的对话框，没有底部操作按钮。</p>
    </div>
  </ExDialog>
</template>
```

:::

## 关闭前回调

通过 `before-close` 属性可以在关闭前执行回调，返回 `false` 可以阻止关闭。

::: raw

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton type="primary" @click="dialogVisible15 = true">打开对话框</ExButton>
    <ExButton @click="hasUnsavedChanges = !hasUnsavedChanges" style="margin-left: 12px;">
      {{ hasUnsavedChanges ? '允许关闭' : '阻止关闭' }}
    </ExButton>
    <span style="margin-left: 12px; color: var(--ex-color-text-secondary);">
      当前状态: {{ hasUnsavedChanges ? '有未保存内容（阻止关闭）' : '无未保存内容（允许关闭）' }}
    </span>
  </div>
  <ExDialog 
    v-model="dialogVisible15" 
    title="编辑内容"
    :before-close="handleBeforeClose"
  >
    <p>尝试点击关闭按钮或遮罩层关闭对话框。</p>
    <p style="color: var(--ex-color-warning);">
      当有未保存内容时，关闭操作会被阻止（控制台会输出提示）。
    </p>
    <p>点击上方按钮切换状态来测试关闭行为。</p>
  </ExDialog>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div style="margin-bottom: 16px;">
    <ExButton
      type="primary"
      @click="dialogVisible15 = true"
    >
      打开对话框
    </ExButton>
    <ExButton
      @click="hasUnsavedChanges = !hasUnsavedChanges"
      style="margin-left: 12px;"
    >
      {{ hasUnsavedChanges ? '允许关闭' : '阻止关闭' }}
    </ExButton>
    <span style="margin-left: 12px; color: var(--ex-color-text-secondary);">
      当前状态: {{ hasUnsavedChanges ? '有未保存内容（阻止关闭）' : '无未保存内容（允许关闭）' }}
    </span>
  </div>

  <ExDialog
    v-model="dialogVisible15"
    title="编辑内容"
    :before-close="handleBeforeClose"
  >
    <p>尝试点击关闭按钮或遮罩层关闭对话框。</p>
    <p style="color: var(--ex-color-warning);">
      当有未保存内容时，关闭操作会被阻止（控制台会输出提示）。
    </p>
    <p>点击上方按钮切换状态来测试关闭行为。</p>
  </ExDialog>
</template>

<script setup>
import { ref } from 'vue';

const dialogVisible15 = ref(false);
const hasUnsavedChanges = ref(true);

const handleBeforeClose = async () => {
  // 如果有未保存的更改，阻止关闭
  if (hasUnsavedChanges.value) {
    console.log('有未保存的内容，阻止关闭');
    return false;
  }
  return true;
};
</script>
```

:::

## API

省略 `size` 时继承最近的 `ExConfigProvider`；未配置全局尺寸时使用下表默认值。显式设置的尺寸优先。

### Dialog Props

| 属性                    | 说明                        | 类型                                                                     | 默认值        |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------ | ------------- |
| `model-value / v-model` | 是否显示对话框              | `boolean`                                                                | `false`       |
| `title`                 | 对话框标题                  | `string`                                                                 | `''`          |
| `size`                  | 对话框尺寸                  | `'small' \| 'medium' \| 'large' \| 'full'`                               | `'medium'`    |
| `type`                  | 对话框类型                  | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'`   |
| `show-close`            | 是否显示关闭按钮            | `boolean`                                                                | `true`        |
| `modal`                 | 是否显示遮罩层              | `boolean`                                                                | `true`        |
| `close-on-click-modal`  | 是否可以通过点击遮罩层关闭  | `boolean`                                                                | `true`        |
| `close-on-press-escape` | 是否可以通过按下 ESC 键关闭 | `boolean`                                                                | `true`        |
| `show-footer`           | 是否显示底部操作栏          | `boolean`                                                                | `true`        |
| `confirm-text`          | 确认按钮文本                | `string`                                                                 | `'确认'`      |
| `cancel-text`           | 取消按钮文本                | `string`                                                                 | `'取消'`      |
| `show-confirm`          | 是否显示确认按钮            | `boolean`                                                                | `true`        |
| `show-cancel`           | 是否显示取消按钮            | `boolean`                                                                | `true`        |
| `confirm-loading`       | 确认按钮加载状态            | `boolean`                                                                | `false`       |
| `confirm-disabled`      | 确认按钮禁用状态            | `boolean`                                                                | `false`       |
| `center`                | 是否居中显示                | `boolean`                                                                | `false`       |
| `fullscreen`            | 是否全屏显示                | `boolean`                                                                | `false`       |
| `lock-scroll`           | 是否锁定滚动                | `boolean`                                                                | `true`        |
| `custom-class`          | 自定义类名                  | `string`                                                                 | `''`          |
| `modal-class`           | 遮罩层自定义类名            | `string`                                                                 | `''`          |
| `before-open`           | 对话框打开前的回调          | `() => boolean \| Promise<boolean>`                                      | `undefined`   |
| `before-close`          | 对话框关闭前的回调          | `() => boolean \| Promise<boolean>`                                      | `undefined`   |
| `z-index`               | 层级                        | `number`                                                                 | 全局层级 + 50 |
| `append-to-body`        | 是否追加到 body             | `boolean`                                                                | `true`        |
| `destroy-on-close`      | 关闭动画结束后是否销毁内容  | `boolean`                                                                | `false`       |
| `aria-label`            | 无障碍标签                  | `string`                                                                 | `undefined`   |

### Dialog Events

| 事件名               | 说明                     | 类型                                                 |
| -------------------- | ------------------------ | ---------------------------------------------------- |
| `update:model-value` | 更新 modelValue          | `(value: boolean) => void`                           |
| `open`               | 对话框打开时触发         | `() => void`                                         |
| `opened`             | 对话框打开动画结束时触发 | `() => void`                                         |
| `close`              | 对话框关闭时触发         | `() => void`                                         |
| `closed`             | 对话框关闭动画结束时触发 | `() => void`                                         |
| `guard-error`        | 打开或关闭守卫发生异常   | `(error: unknown, phase: 'open' \| 'close') => void` |
| `confirm`            | 点击确认按钮时触发       | `() => void`                                         |
| `cancel`             | 点击取消按钮时触发       | `() => void`                                         |

### Dialog Slots

| 插槽名    | 说明           |
| --------- | -------------- |
| `default` | 对话框内容     |
| `title`   | 自定义标题     |
| `icon`    | 自定义图标     |
| `close`   | 自定义关闭按钮 |
| `footer`  | 自定义底部内容 |

### Dialog Methods

| 方法名       | 说明                | 类型                           |
| ------------ | ------------------- | ------------------------------ |
| `open`       | 打开对话框          | `() => void`                   |
| `close`      | 经关闭守卫请求关闭  | `() => Promise<boolean>`       |
| `getElement` | 获取对话框 DOM 元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="dialog"`；仅模态状态声明 `aria-modal="true"`
- 支持 ESC 键关闭
- 完整的 ARIA 标签支持
- 支持屏幕阅读器
- 自动锁定焦点在对话框内

## 受控 / 非受控

Dialog 通过 `v-model`（`modelValue`）受控，父级是唯一事实来源：

```vue
<template>
  <ExButton @click="visible = true">打开</ExButton>
  <ExDialog
    v-model="visible"
    title="标题"
  >
    内容
  </ExDialog>
</template>

<script setup>
import { ref } from 'vue';
const visible = ref(false);
</script>
```

- **确认不自动关闭**：`confirm` 事件触发后对话框保持打开，便于做异步校验或显示 `confirm-loading`；校验通过后由你设置 `v-model = false` 关闭。
- **拦截关闭**：`before-close` 返回 `false` 可阻止关闭（点击遮罩、ESC、关闭按钮都会经过它）。

```vue
<ExDialog
  v-model="visible"
  :confirm-loading="loading"
  :before-close="onBeforeClose"
  @confirm="submit"
/>
```

## 常见问题

**Q：点了确认按钮对话框没关闭？**
这是预期行为——`confirm` 不会自动关闭，方便异步提交。在 `@confirm` 回调里 `visible.value = false`，或在提交成功后关闭。

**Q：如何禁止点击遮罩 / ESC 关闭？**
设置 `:close-on-click-modal="false"` 和 `:close-on-press-escape="false"`，或用 `before-close` 统一拦截。

**Q：多个对话框叠加时滚动条乱跳 / 关不干净？**
已内置引用计数的滚动锁与浮层栈：叠加时滚动只锁一次，ESC 只关闭最顶层，全部关闭后才恢复滚动。

**Q：对话框里的表单每次打开都被重置？**
对话框内容随关闭从 DOM 卸载（每次打开重新渲染）。需要跨开关保留状态时，把状态提升到父组件维护。

## 最佳实践

- **危险/不可逆操作**配合 `type="danger"` + `before-close` 做二次确认，或直接使用 [Popconfirm](/components/popconfirm)。
- **表单提交**用 `confirm-loading` 表达加载态，提交成功后再关闭，失败则保持打开并提示。
- **内容较多**时用 `size="large"` 或 `fullscreen`，避免内部出现双滚动条。
- 始终提供 `title` 或 `aria-label`，保证屏幕阅读器可识别对话框用途。

## 主题定制

Dialog 不定义独立的组件级变量，而是消费 ExUI 全局设计令牌。定制方式：

- **单个实例**：用 `custom-class` / `modal-class` 添加类名后覆盖样式。
- **全局**：覆盖对话框所消费的全局令牌：

```css
:root {
  --ex-color-bg-surface: #11151c; /* 对话框背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 / 分割线 */
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
