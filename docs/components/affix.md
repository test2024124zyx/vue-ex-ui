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

::: raw

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

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <div
      style="height: 200px; overflow: auto; border: 1px solid var(--ex-color-border); border-radius: var(--ex-radius-base); padding: 16px;"
    >
      <div
        style="height: 100px; background: var(--ex-color-bg-tertiary); margin-bottom: 16px; padding: 16px; border-radius: var(--ex-radius-base);"
      >
        滚动区域顶部
      </div>
      <ExAffix
        :offset-top="0"
        @change="handleChange"
      >
        <ExButton type="primary">
          {{ affixed ? '已固定' : '固定按钮' }}
        </ExButton>
      </ExAffix>
      <div
        style="height: 500px; background: var(--ex-color-bg-tertiary); margin-top: 16px; padding: 16px; border-radius: var(--ex-radius-base);"
      >
        向下滚动查看固定效果
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const affixed = ref(false);

const handleChange = fixed => {
  affixed.value = fixed;
  console.log('固定状态:', fixed);
};
</script>
```

:::

## 固定在顶部

距离顶部一定距离时固定。

::: raw

<div class="demo-container">
  <ExAffix :offset-top="80">
    <ExButton type="success">距离顶部 80px 固定</ExButton>
  </ExAffix>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExAffix :offset-top="80">
      <ExButton type="success">距离顶部 80px 固定</ExButton>
    </ExAffix>
  </div>
</template>
```

:::

## 固定在底部

距离底部一定距离时固定。

::: raw

<div class="demo-container">
  <ExAffix :offset-bottom="20">
    <ExButton type="warning">距离底部 20px 固定</ExButton>
  </ExAffix>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExAffix :offset-bottom="20">
      <ExButton type="warning">距离底部 20px 固定</ExButton>
    </ExAffix>
  </div>
</template>
```

:::

## 固定状态改变回调

可以获取固定状态改变的回调。

::: raw

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

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExAffix
      :offset-top="100"
      @change="handleChange"
    >
      <ExCard>
        <div style="padding: 16px;">
          <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">固定状态卡片</h4>
          <p style="margin: 0; color: var(--ex-color-text-secondary);">
            当前状态: {{ affixed ? '已固定' : '未固定' }}
          </p>
        </div>
      </ExCard>
    </ExAffix>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const affixed = ref(false);

const handleChange = fixed => {
  affixed.value = fixed;
};
</script>
```

:::

## API

### Props

| 属性          | 说明                                | 类型                        | 默认值       |
| ------------- | ----------------------------------- | --------------------------- | ------------ |
| offset-top    | 距离窗口顶部达到指定偏移量后触发    | number                      | -            |
| offset-bottom | 距离窗口底部达到指定偏移量后触发    | number                      | -            |
| target        | 设置 Affix 需要监听其滚动事件的元素 | () => HTMLElement \| Window | () => window |
| z-index       | 固定时的 z-index                    | number                      | 100          |

### Events

| 事件名 | 说明               | 类型                     |
| ------ | ------------------ | ------------------------ |
| change | 固定状态改变时触发 | (fixed: boolean) => void |

### Methods

| 方法名         | 说明         | 类型       |
| -------------- | ------------ | ---------- |
| updatePosition | 更新固定状态 | () => void |

## 常见问题

**Q：设置了 Affix 却不固定？**
必须至少设置 `offset-top` 或 `offset-bottom` 其一，否则没有触发阈值，不会固定。

**Q：在自定义滚动容器（非 window）里固定？**
把 `target` 设为返回该容器元素的函数，如 `:target="() => containerRef"`，组件会监听该容器的滚动。

**Q：固定时页面会跳动吗？**
不会。固定瞬间会插入一个等宽高的占位元素，保持文档流高度不变，避免内容抖动。

**Q：滚动时性能如何？**
滚动/缩放回调使用 `requestAnimationFrame` 节流，每帧最多计算一次位置。

## 最佳实践

- 适用于**吸顶导航、工具栏、侧边目录**等需要随滚动固定的场景。
- 自定义滚动容器务必通过 `target` 指定，否则默认监听 `window`。
- 固定内容尽量**定高**，避免固定态与正常态之间布局突变。
- 多个吸顶元素叠加时用 `z-index` 控制层级关系。

## 主题定制

Affix 是**结构性**组件，自身不引入视觉样式，仅在固定时通过 `z-index`（默认 `100`）控制层级。内容的外观完全由你放入的子元素决定，无需主题变量。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
