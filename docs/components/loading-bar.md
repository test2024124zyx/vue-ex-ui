# LoadingBar 加载条

用于路由切换、异步请求等全局进度反馈。命令式服务默认挂载到 `document.body`，声明式组件留在当前 Vue 渲染树中。

<script setup>
import { onBeforeUnmount } from 'vue'
import { loadingBar } from '../../src/components/loading-bar'

const start = () => loadingBar.start()
const finish = () => loadingBar.finish()
const fail = () => loadingBar.error()
const warn = () => loadingBar.warning()
const update = percentage => loadingBar.update(percentage)

const useCustomAppearance = () => {
  loadingBar.config({ color: '#ff007f', height: 5, zIndex: 1200 })
  loadingBar.start()
}

const resetAppearance = () => {
  loadingBar.config({ color: undefined, height: 3, zIndex: undefined })
  loadingBar.destroy()
}

onBeforeUnmount(() => loadingBar.destroy())
</script>

## 全局服务

`start()` 会自动推进到 90% 以内；调用 `finish()`、`error()` 或 `warning()` 后，加载条展示对应终态并自动清理。

::: raw
<div class="demo-container">
  <ExButton type="primary" @click="start">开始</ExButton>
  <ExButton type="success" @click="finish">完成</ExButton>
  <ExButton type="danger" @click="fail">失败</ExButton>
  <ExButton type="warning" @click="warn">警告</ExButton>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { loadingBar } from 'vue-ex-ui';

const load = async () => {
  loadingBar.start();
  try {
    await fetchData();
    loadingBar.finish();
  } catch (error) {
    loadingBar.error();
    throw error;
  }
};
</script>
```

:::

## 手动进度

`update()` 会显示加载条并切换为手动进度。输入会限制在 0-100；传入 `100` 等同于进入成功终态，`NaN` 与无限值会抛出 `TypeError`。

::: raw
<div class="demo-container">
  <ExButton @click="update(0)">0%</ExButton>
  <ExButton @click="update(25)">25%</ExButton>
  <ExButton @click="update(50)">50%</ExButton>
  <ExButton @click="update(75)">75%</ExButton>
  <ExButton @click="update(100)">100%</ExButton>
</div>
:::

::: details 查看示例代码

```vue
import { loadingBar } from 'vue-ex-ui'; loadingBar.update(35); loadingBar.update(80);
loadingBar.update(100);
```

:::

## 视觉配置

::: raw
<div class="demo-container">
  <ExButton type="primary" @click="useCustomAppearance">应用配置并开始</ExButton>
  <ExButton @click="resetAppearance">恢复默认并清理</ExButton>
</div>
:::

::: details 查看示例代码

```vue
import { loadingBar } from 'vue-ex-ui'; loadingBar.config({ height: 5, zIndex: 1200, color:
percentage => (percentage < 50 ? '#29abe2' : '#10b981'), });
```

:::

高度必须在 1-16 之间，层级必须为非负有限值，字符串颜色不能为空。非法配置会抛出异常并保留此前有效配置。

## 独立服务

需要隔离多个应用或微前端的状态时，使用 `createLoadingBar()`。销毁后同一服务仍可重新使用。

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createLoadingBar } from 'vue-ex-ui';

const routeLoadingBar = createLoadingBar({ height: 2 });

onBeforeUnmount(() => routeLoadingBar.destroy());
</script>
```

安装 `ExLoadingBar` 或完整组件库后，每个 Vue App 会获得独立的 `this.$loadingBar`。在
ConfigProvider 子树的 `setup()` 中使用 `useLoadingBarService()` 可继承主题和 z-index，
并在 Provider 卸载时自动销毁；直接导入的 `loadingBar` 是 setup 外的模块级便捷单例。

## 声明式组件

```vue
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(true);
const percentage = ref(40);
</script>

<template>
  <ExLoadingBar
    :visible="visible"
    :percentage="percentage"
    status="loading"
    aria-label="数据同步进度"
  />
</template>
```

## 路由集成

```ts
import { loadingBar } from 'vue-ex-ui';

router.beforeEach(() => {
  loadingBar.start();
});

router.afterEach(() => {
  loadingBar.finish();
});

router.onError(() => {
  loadingBar.error();
});
```

## 组件 API

| 属性         | 说明                         | 类型                                         | 默认值       |
| ------------ | ---------------------------- | -------------------------------------------- | ------------ |
| `visible`    | 是否渲染                     | `boolean`                                    | `true`       |
| `percentage` | 当前进度，限制在 0-100       | `number`                                     | `0`          |
| `status`     | 当前状态                     | `loading \| success \| error \| warning`     | `loading`    |
| `height`     | 高度，限制在 1-16 像素       | `number`                                     | `3`          |
| `color`      | 固定颜色或按百分比计算的颜色 | `string \| ((percentage: number) => string)` | 主题状态色   |
| `zIndex`     | 非负层级                     | `number`                                     | 全局层级令牌 |

组件保留 `class`、`style`、`aria-*` 和 `data-*` 等原生属性；进度角色和值由组件维护。

## 服务 API

| 方法      | 类型                                   | 说明                       |
| --------- | -------------------------------------- | -------------------------- |
| `config`  | `(options: LoadingBarOptions) => void` | 更新视觉配置               |
| `start`   | `() => void`                           | 开始并自动推进             |
| `update`  | `(percentage: number) => void`         | 显示指定手动进度           |
| `finish`  | `() => void`                           | 显示成功终态               |
| `error`   | `() => void`                           | 显示失败终态               |
| `warning` | `() => void`                           | 显示警告终态               |
| `destroy` | `() => void`                           | 清理 DOM、状态与全部计时器 |

### LoadingBarOptions

| 属性     | 类型                                         | 默认值       |
| -------- | -------------------------------------------- | ------------ |
| `color`  | `string \| ((percentage: number) => string)` | 主题状态色   |
| `height` | `number`                                     | `3`          |
| `zIndex` | `number`                                     | 全局层级令牌 |

<style scoped>
.demo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
