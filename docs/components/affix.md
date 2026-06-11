# Affix 固定位置

<script setup>
import { ref } from 'vue'

const affixed = ref(false)

const handleChange = (fixed) => {
  affixed.value = fixed
  console.log('固定状态:', fixed)
}
</script>

将页面元素钉在可视范围。

## 基础用法

最简单的用法。

<div class="demo-container">
  <div style="height: 200px; overflow: auto; border: 1px solid var(--ex-color-border); border-radius: var(--ex-radius-base); padding: 16px;">
    <div style="height: 100px; background: var(--ex-color-bg-tertiary); margin-bottom: 16px; padding: 16px; border-radius: var(--ex-radius-base);">
      滚动区域顶部
    </div>
    <ExAffix :offset-top="0" @change="handleChange">
      <ExButton type="primary">
        {{ affixed ? '已固定' : '固定按钮' }}
      </ExButton>
    </ExAffix>
    <div style="height: 500px; background: var(--ex-color-bg-tertiary); margin-top: 16px; padding: 16px; border-radius: var(--ex-radius-base);">
      向下滚动查看固定效果
    </div>
  </div>
</div>

```vue
<template>
  <ExAffix :offset-top="0" @change="handleChange">
    <ExButton type="primary">固定按钮</ExButton>
  </ExAffix>
</template>

<script setup>
const handleChange = (fixed) => {
  console.log('固定状态:', fixed)
}
</script>
```

## 固定在顶部

距离顶部一定距离时固定。

<div class="demo-container">
  <ExAffix :offset-top="80">
    <ExButton type="success">距离顶部 80px 固定</ExButton>
  </ExAffix>
</div>

```vue
<template>
  <ExAffix :offset-top="80">
    <ExButton type="success">距离顶部 80px 固定</ExButton>
  </ExAffix>
</template>
```

## 固定在底部

距离底部一定距离时固定。

<div class="demo-container">
  <ExAffix :offset-bottom="20">
    <ExButton type="warning">距离底部 20px 固定</ExButton>
  </ExAffix>
</div>

```vue
<template>
  <ExAffix :offset-bottom="20">
    <ExButton type="warning">距离底部 20px 固定</ExButton>
  </ExAffix>
</template>
```

## 固定状态改变回调

可以获取固定状态改变的回调。

<div class="demo-container">
  <ExAffix :offset-top="100" @change="handleChange">
    <ExCard>
      <div style="padding: 16px;">
        <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">
          固定状态卡片
        </h4>
        <p style="margin: 0; color: var(--ex-color-text-secondary);">
          当前状态: {{ affixed ? '已固定' : '未固定' }}
        </p>
      </div>
    </ExCard>
  </ExAffix>
</div>

```vue
<template>
  <ExAffix :offset-top="100" @change="handleChange">
    <ExCard>
      固定状态: {{ affixed ? '已固定' : '未固定' }}
    </ExCard>
  </ExAffix>
</template>

<script setup>
import { ref } from 'vue'

const affixed = ref(false)

const handleChange = (fixed) => {
  affixed.value = fixed
}
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| offset-top | 距离窗口顶部达到指定偏移量后触发 | number | - |
| offset-bottom | 距离窗口底部达到指定偏移量后触发 | number | - |
| target | 设置 Affix 需要监听其滚动事件的元素 | () => HTMLElement \| Window | () => window |
| z-index | 固定时的 z-index | number | 100 |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| change | 固定状态改变时触发 | (fixed: boolean) => void |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| updatePosition | 更新固定状态 | () => void |

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
