# Loading 加载

用于页面和区块的加载中状态。

<script setup>
import { ref, watch } from 'vue'

const loading1 = ref(false)
const loading2 = ref(false)
const loading3 = ref(false)
const loading4 = ref(false)

// 自动关闭加载状态
watch(loading1, (val) => {
  if (val) {
    setTimeout(() => {
      loading1.value = false
    }, 3000)
  }
})

watch(loading3, (val) => {
  console.log('loading3 changed to:', val)
  if (val) {
    setTimeout(() => {
      loading3.value = false
      console.log('loading3 auto closed')
    }, 3000)
  }
})
</script>

## 基础用法

最简单的加载用法。

<div class="demo-container">
  <div id="basic-loading-container" style="height: 200px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
  </div>
  <ExLoading :visible="true" :fullscreen="false" target="#basic-loading-container" />
</div>

```vue
<template>
  <div style="position: relative; height: 200px;">
    <ExLoading :visible="true" :fullscreen="false" />
  </div>
</template>
```

## 不同类型

提供多种加载动画类型。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
  <div id="type-spinner" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="type-dots" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="type-pulse" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="type-bars" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="type-neon" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
</div>

<ExLoading :visible="true" :fullscreen="false" target="#type-spinner" type="spinner" text="Spinner" />
<ExLoading :visible="true" :fullscreen="false" target="#type-dots" type="dots" text="Dots" />
<ExLoading :visible="true" :fullscreen="false" target="#type-pulse" type="pulse" text="Pulse" />
<ExLoading :visible="true" :fullscreen="false" target="#type-bars" type="bars" text="Bars" />
<ExLoading :visible="true" :fullscreen="false" target="#type-neon" type="neon" text="Neon" />

```vue
<template>
  <ExLoading :visible="true" type="spinner" text="Spinner" />
  <ExLoading :visible="true" type="dots" text="Dots" />
  <ExLoading :visible="true" type="pulse" text="Pulse" />
  <ExLoading :visible="true" type="bars" text="Bars" />
  <ExLoading :visible="true" type="neon" text="Neon" />
</template>
```

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
  <div id="size-small" style="height: 120px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="size-medium" style="height: 150px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <div id="size-large" style="height: 180px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
</div>

<ExLoading :visible="true" :fullscreen="false" target="#size-small" size="small" text="Small" />
<ExLoading :visible="true" :fullscreen="false" target="#size-medium" size="medium" text="Medium" />
<ExLoading :visible="true" :fullscreen="false" target="#size-large" size="large" text="Large" />

```vue
<template>
  <ExLoading :visible="true" size="small" text="Small" />
  <ExLoading :visible="true" size="medium" text="Medium" />
  <ExLoading :visible="true" size="large" text="Large" />
</template>
```

## 加载文本

通过 `text` 属性或默认插槽可以设置加载文本。

<div class="demo-container">
  <div id="custom-text-container" style="height: 200px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <ExLoading :visible="true" :fullscreen="false" target="#custom-text-container" type="neon" text="正在加载游戏资源..." />
</div>

```vue
<template>
  <ExLoading :visible="true" text="正在加载游戏资源..." />
</template>
```

## 自定义加载动画

通过 `spinner` 插槽可以自定义加载动画。

<div class="demo-container">
  <div id="custom-spinner-container" style="height: 200px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
  <ExLoading :visible="true" :fullscreen="false" target="#custom-spinner-container" text="自定义加载动画">
    <template #spinner>
      <div style="width: 48px; height: 48px;">
        <img 
          src="https://api.iconify.design/ri/loader-4-line.svg" 
          alt="加载中" 
          style="width: 100%; height: 100%; animation: spin 1s linear infinite; filter: drop-shadow(0 0 8px #00f0ff);"
        />
      </div>
    </template>
  </ExLoading>
</div>

```vue
<template>
  <ExLoading :visible="true" text="自定义加载动画">
    <template #spinner>
      <div style="width: 48px; height: 48px;">
        <img 
          src="https://api.iconify.design/ri/loader-4-line.svg" 
          alt="加载中" 
          style="width: 100%; height: 100%; animation: spin 1s linear infinite;"
        />
      </div>
    </template>
  </ExLoading>
</template>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## 全屏加载

设置 `fullscreen` 为 `true` 可以全屏显示加载。

<div class="demo-container">
  <ExButton type="primary" @click="loading1 = true">
    显示全屏加载
  </ExButton>
  <ExLoading v-model:visible="loading1" fullscreen type="neon" text="正在加载中..." />
</div>

```vue
<template>
  <ExButton type="primary" @click="showLoading">
    显示全屏加载
  </ExButton>
  <ExLoading v-model:visible="loading" fullscreen type="neon" text="正在加载中..." />
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const showLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 3000)
}
</script>
```

## 无遮罩

设置 `mask` 为 `false` 可以不显示遮罩层。

<div class="demo-container">
  <div id="no-mask-container" style="height: 200px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base); display: flex; align-items: center; justify-content: center;">
    <p style="color: var(--ex-color-text-secondary);">这是背景内容</p>
  </div>
  <ExLoading :visible="true" :fullscreen="false" target="#no-mask-container" :mask="false" type="neon" />
</div>

```vue
<template>
  <div >
    <p>这是背景内容</p>
    <ExLoading :visible="true" :mask="false" />
  </div>
</template>
```

## 点击遮罩关闭

设置 `mask-closable` 为 `true` 可以点击遮罩关闭加载。

<div class="demo-container">
  <ExButton type="primary" @click="loading2 = true">
    显示可关闭加载
  </ExButton>
  <ExLoading 
    v-model:visible="loading2" 
    fullscreen 
    mask-closable 
    type="pulse" 
    text="点击遮罩关闭" 
  />
</div>

```vue
<template>
  <ExButton type="primary" @click="showLoading">
    显示可关闭加载
  </ExButton>
  <ExLoading 
    v-model:visible="loading" 
    fullscreen 
    mask-closable 
    text="点击遮罩关闭" 
  />
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const showLoading = () => {
  loading.value = true
}
</script>
```

## 容器内加载

在容器内显示加载状态。

<div class="demo-container">
  <ExButton type="primary" @click="loading3 = true">
    加载数据
  </ExButton>
  
  <div id="data-container" style="margin-top: 16px; padding: 24px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base); min-height: 200px;">
    <h3 style="margin: 0 0 16px; color: var(--ex-color-text-primary);">数据列表</h3>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="padding: 12px; background: var(--ex-color-bg-secondary); border-radius: var(--ex-radius-base);">
        数据项 1
      </div>
      <div style="padding: 12px; background: var(--ex-color-bg-secondary); border-radius: var(--ex-radius-base);">
        数据项 2
      </div>
      <div style="padding: 12px; background: var(--ex-color-bg-secondary); border-radius: var(--ex-radius-base);">
        数据项 3
      </div>
    </div>
  </div>
  
  <ExLoading 
    :visible="loading3" 
    :fullscreen="false" 
    target="#data-container"
    type="bars" 
    text="加载中..." 
  />
</div>

```vue
<template>
  <div style="position: relative;">
    <h3>数据列表</h3>
    <div>数据内容...</div>
    
    <ExLoading 
      v-model:visible="loading" 
      :fullscreen="false" 
      type="bars" 
      text="加载中..." 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>
```

## API

### Loading Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `visible` / `v-model:visible` | 是否显示 | `boolean` | `true` |
| `type` | 加载动画类型 | `'spinner' \| 'dots' \| 'pulse' \| 'bars' \| 'neon'` | `'spinner'` |
| `size` | 加载尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `text` | 加载文本 | `string` | `undefined` |
| `fullscreen` | 是否全屏显示 | `boolean` | `false` |
| `mask` | 是否显示遮罩 | `boolean` | `true` |
| `mask-closable` | 点击遮罩是否关闭 | `boolean` | `false` |
| `aria-label` | 无障碍标签 | `string` | `undefined` |

### Loading Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `update:visible` | 显示状态改变时触发 | `(visible: boolean) => void` |
| `close` | 关闭时触发 | `() => void` |

### Loading Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 加载文本 |
| `spinner` | 自定义加载动画 |

### Loading Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取加载DOM元素 | `() => HTMLDivElement \| null` |
| `close` | 关闭加载 | `() => void` |

## 加载类型说明

| 类型 | 说明 | 适用场景 |
| --- | --- | --- |
| `spinner` | 旋转圆环 | 通用场景，默认类型 |
| `dots` | 跳动点 | 轻量级加载提示 |
| `pulse` | 脉冲波纹 | 数据刷新、同步 |
| `bars` | 跳动条形 | 音频、视频加载 |
| `neon` | 霓虹双环 | 游戏场景，科技感强 |

## 无障碍支持

- 使用 `role="alert"` 标记
- 支持 `aria-live="polite"` 实时通知
- 支持 `aria-label` 属性
- 提供加载状态提示

## 注意事项

1. 全屏加载会阻止页面交互，请谨慎使用
2. 建议设置合理的超时时间，避免长时间加载
3. 容器内加载需要父元素设置 `position: relative`
4. 加载文本应简洁明了，告知用户当前状态

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
