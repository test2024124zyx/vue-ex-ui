# Layout 布局

<script setup>
import { ref } from 'vue'

const collapsed = ref(false)
</script>

## 基础用法

::: raw

<div class="vp-raw demo-container">
  <ExLayout class="layout-demo">
    <ExHeader>Header</ExHeader>
    <ExContent>Content</ExContent>
    <ExFooter>Footer</ExFooter>
  </ExLayout>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ExLayout class="layout-demo">
      <ExHeader>Header</ExHeader>
      <ExContent>Content</ExContent>
      <ExFooter>Footer</ExFooter>
    </ExLayout>
  </div>
</template>

<script setup lang="ts">
import { ExContent, ExFooter, ExHeader, ExLayout } from 'vue-ex-ui';
</script>
```

:::

## 侧栏布局

::: raw

<div class="vp-raw demo-container">
  <ExLayout class="layout-demo">
    <ExSider
      v-model:collapsed="collapsed"
      collapsible
      breakpoint="md"
    >
      <div class="layout-demo__sider">Navigation</div>
    </ExSider>
    <ExLayout>
      <ExHeader>Header</ExHeader>
      <ExContent>Content</ExContent>
    </ExLayout>
  </ExLayout>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ExLayout class="layout-demo">
      <ExSider
        v-model:collapsed="collapsed"
        collapsible
        breakpoint="md"
      >
        <div class="layout-demo__sider">Navigation</div>
      </ExSider>
      <ExLayout>
        <ExHeader>Header</ExHeader>
        <ExContent>Content</ExContent>
      </ExLayout>
    </ExLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExContent, ExHeader, ExLayout, ExSider } from 'vue-ex-ui';

const collapsed = ref(false);
</script>
```

:::

进入 `breakpoint` 对应的小视口后，非受控 Sider 会自动收起；回到宽视口时只恢复由响应式
逻辑触发的收起状态，不会覆盖用户手动选择。小视口展开时侧栏作为模态导航：锁定页面滚动、
限制 Tab 焦点，点击遮罩或按 Escape 会以 `mask` 来源触发收起，并把焦点归还给此前元素。
受控模式仍由父组件响应 `update:collapsed` 决定最终状态。

## Header 与 Footer 插槽

具名 `center` 不存在时，默认插槽作为中间内容；未使用任何具名插槽时，默认插槽占满可用宽度。

::: raw

<div class="vp-raw demo-container layout-demo">
  <ExHeader>
    <template #left>Brand</template>
    <template #center>Navigation</template>
    <template #right>Account</template>
  </ExHeader>
  <ExFooter>
    <template #left>Status</template>
    <template #center>ExUI</template>
    <template #right>2026</template>
  </ExFooter>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container layout-demo">
    <ExHeader>
      <template #left>Brand</template>
      <template #center>Navigation</template>
      <template #right>Account</template>
    </ExHeader>
    <ExFooter>
      <template #left>Status</template>
      <template #center>ExUI</template>
      <template #right>2026</template>
    </ExFooter>
  </div>
</template>

<script setup lang="ts">
import { ExFooter, ExHeader } from 'vue-ex-ui';
</script>
```

:::

## Content 标签

::: raw

<div class="vp-raw demo-container layout-demo">
  <ExContent
    tag="section"
    aria-label="Dashboard"
    grid
    scanline
  >
    Dashboard
  </ExContent>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container layout-demo">
    <ExContent
      tag="section"
      aria-label="Dashboard"
      grid
      scanline
    >
      Dashboard
    </ExContent>
  </div>
</template>

<script setup lang="ts">
import { ExContent } from 'vue-ex-ui';
</script>
```

:::

## Container

::: raw

<div class="vp-raw demo-container">
  <ExContainer size="lg">Fixed token width</ExContainer>
  <ExContainer fluid>Fluid width</ExContainer>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ExContainer size="lg">Fixed token width</ExContainer>
    <ExContainer fluid>Fluid width</ExContainer>
  </div>
</template>

<script setup lang="ts">
import { ExContainer } from 'vue-ex-ui';
</script>
```

:::

## API

### Layout Props

| 属性      | 类型                         | 默认值                 |
| --------- | ---------------------------- | ---------------------- |
| direction | `'horizontal' \| 'vertical'` | 自动识别直系 `ExSider` |

### Header Props

| 属性        | 类型               | 默认值         |
| ----------- | ------------------ | -------------- |
| height      | `string \| number` | `64`           |
| fixed       | `boolean`          | `false`        |
| neon-border | `boolean`          | ConfigProvider |
| blur        | `boolean`          | `false`        |

### Footer Props

| 属性        | 类型               | 默认值         |
| ----------- | ------------------ | -------------- |
| height      | `string \| number` | `64`           |
| fixed       | `boolean`          | `false`        |
| neon-border | `boolean`          | ConfigProvider |
| blur        | `boolean`          | `false`        |

### Sider Props

| 属性                          | 类型                                    | 默认值         |
| ----------------------------- | --------------------------------------- | -------------- |
| width                         | `string \| number`                      | `256`          |
| collapsed-width               | `string \| number`                      | `80`           |
| collapsed / v-model:collapsed | `boolean`                               | —              |
| default-collapsed             | `boolean`                               | `false`        |
| collapsible                   | `boolean`                               | `false`        |
| trigger                       | `'top' \| 'bottom' \| null`             | `'bottom'`     |
| position                      | `'left' \| 'right'`                     | `'left'`       |
| neon-border                   | `boolean`                               | ConfigProvider |
| blur                          | `boolean`                               | `false`        |
| breakpoint                    | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | —              |
| transition-duration           | `number`                                | `300`          |
| aria-label                    | `string`                                | 本地化文本     |

### Sider Events

| 事件             | 参数                                                                |
| ---------------- | ------------------------------------------------------------------- |
| update:collapsed | `(collapsed: boolean)`                                              |
| collapse         | `(collapsed: boolean, source: 'trigger' \| 'responsive' \| 'mask')` |
| breakpoint       | `(broken: boolean)`                                                 |

### Sider Slots

| 插槽    | 参数                                      |
| ------- | ----------------------------------------- |
| default | —                                         |
| trigger | `{ collapsed: boolean; broken: boolean }` |

### Content Props

| 属性     | 类型                           | 默认值   |
| -------- | ------------------------------ | -------- |
| tag      | `'main' \| 'section' \| 'div'` | `'main'` |
| grid     | `boolean`                      | `false`  |
| scanline | `boolean`                      | `false`  |

### Container Props

| 属性  | 类型                                    | 默认值  |
| ----- | --------------------------------------- | ------- |
| fluid | `boolean`                               | `false` |
| size  | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | 响应式  |

### Container 尺寸

| size | max-width |
| ---- | --------- |
| sm   | `640px`   |
| md   | `768px`   |
| lg   | `1024px`  |
| xl   | `1280px`  |
| 2xl  | `1536px`  |

### Breakpoints

| breakpoint | broken 条件 |
| ---------- | ----------- |
| sm         | `< 480px`   |
| md         | `< 768px`   |
| lg         | `< 1024px`  |
| xl         | `< 1280px`  |
| 2xl        | `< 1536px`  |

### Expose

`ExLayout`、`ExHeader`、`ExContent`、`ExFooter`、`ExContainer` 均暴露 `getElement()`。`ExSider` 额外暴露 `toggle()`。

<style scoped>
.layout-demo {
  min-height: 300px;
  overflow: hidden;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
}

.layout-demo__sider {
  padding: 20px;
  white-space: nowrap;
}
</style>
