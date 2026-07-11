# Layout 布局

<script setup>
import { ref } from 'vue'

const collapsed = ref(false)
</script>

## 基础用法

<ExLayout class="layout-demo">
  <ExHeader>Header</ExHeader>
  <ExContent>Content</ExContent>
  <ExFooter>Footer</ExFooter>
</ExLayout>

```vue
<template>
  <ExLayout>
    <ExHeader>Header</ExHeader>
    <ExContent>Content</ExContent>
    <ExFooter>Footer</ExFooter>
  </ExLayout>
</template>

<script setup lang="ts">
import { ExContent, ExFooter, ExHeader, ExLayout } from 'vue-ex-ui';
</script>
```

## 侧栏布局

<ExLayout class="layout-demo">
  <ExSider v-model:collapsed="collapsed" collapsible>
    <div class="layout-demo__sider">Navigation</div>
  </ExSider>
  <ExLayout>
    <ExHeader>Header</ExHeader>
    <ExContent>Content</ExContent>
  </ExLayout>
</ExLayout>

```vue
<template>
  <ExLayout>
    <ExSider
      v-model:collapsed="collapsed"
      collapsible
      breakpoint="md"
    >
      Navigation
    </ExSider>
    <ExLayout>
      <ExHeader>Header</ExHeader>
      <ExContent>Content</ExContent>
    </ExLayout>
  </ExLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExContent, ExHeader, ExLayout, ExSider } from 'vue-ex-ui';

const collapsed = ref(false);
</script>
```

## Header 与 Footer 插槽

```vue
<template>
  <ExHeader>
    <template #left>Brand</template>
    <template #center>Navigation</template>
    <template #right>Account</template>
  </ExHeader>
</template>
```

具名 `center` 不存在时，默认插槽作为中间内容；未使用任何具名插槽时，默认插槽占满可用宽度。

## Content 标签

```vue
<template>
  <ExContent
    tag="section"
    aria-label="Dashboard"
    grid
    scanline
  >
    Dashboard
  </ExContent>
</template>
```

## Container

```vue
<template>
  <ExContainer size="lg">Fixed token width</ExContainer>
  <ExContainer fluid>Fluid width</ExContainer>
</template>
```

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
