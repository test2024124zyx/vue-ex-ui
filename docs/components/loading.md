# Loading 加载

## 局部加载

目标容器会在浮层显示期间自动获得定位上下文。

<div id="loading-basic" style="height: 180px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
<ExLoading target="#loading-basic" text="正在加载数据" />

```vue
<template>
  <section
    ref="target"
    class="content"
  ></section>
  <ExLoading
    :target="target"
    text="正在加载数据"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const target = ref<HTMLElement>();
</script>
```

## 动画类型

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
  <div id="loading-spinner" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-dots" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-pulse" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-bars" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-neon" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
</div>

<ExLoading target="#loading-spinner" type="spinner" text="Spinner" />
<ExLoading target="#loading-dots" type="dots" text="Dots" />
<ExLoading target="#loading-pulse" type="pulse" text="Pulse" />
<ExLoading target="#loading-bars" type="bars" text="Bars" />
<ExLoading target="#loading-neon" type="neon" text="Neon" />

```vue
<ExLoading type="spinner" />
<ExLoading type="dots" />
<ExLoading type="pulse" />
<ExLoading type="bars" />
<ExLoading type="neon" />
```

## 尺寸与颜色

```vue
<ExLoading size="small" color="#29abe2" />
<ExLoading size="medium" color="#ff3bd1" />
<ExLoading size="large" />
```

## 受控全屏加载

```vue
<template>
  <ExButton @click="visible = true">开始处理</ExButton>
  <ExLoading
    v-model:visible="visible"
    fullscreen
    mask-closable
    type="neon"
    text="正在处理"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const handleClose = () => {
  // 记录由用户发起的关闭。
};
</script>
```

`mask="false"` 时浮层不拦截底层交互，也不会锁定页面滚动。

## 自定义内容

```vue
<ExLoading text="资源加载中">
  <template #spinner>
    <ExIcon icon="loader-4-line" :size="40" />
  </template>
  正在准备资源
</ExLoading>
```

## 服务

未提供 `target` 时创建全屏实例；局部实例必须提供当前文档中的目标元素或有效选择器。

```ts
import {
  createLoadingService,
  destroyLoading,
  hideLoading,
  loadingService,
  showLoading,
} from 'vue-ex-ui';

const request = loadingService.show({ text: '请求中' });
request.updateConfig({ type: 'dots', text: '仍在处理' });
request.hide();
request.show();
request.close();

const local = loadingService.show({ target: '#content', text: '刷新内容' });
local.destroy();

// 单例会复用当前实例并同步最新配置。
showLoading({ text: '提交中' });
showLoading({ type: 'bars', text: '正在确认' });
hideLoading();
destroyLoading();

// 独立服务拥有独立的实例集合与默认值。
const imageLoading = createLoadingService({ type: 'pulse', mask: false });
imageLoading.show({ target: '#gallery' });
imageLoading.hideAll();
imageLoading.destroyAll();
```

## v-loading

完整安装组件库后可使用指令。对象绑定会在更新时同步配置。

```vue
<template>
  <section v-loading="busy"></section>
  <section
    v-loading="{
      loading: syncing,
      config: { type: 'dots', text: '同步中', mask: true },
    }"
  ></section>
</template>
```

## API

### Props

| 参数          | 类型                                                 | 默认值      |
| ------------- | ---------------------------------------------------- | ----------- |
| visible       | `boolean`                                            | `true`      |
| type          | `'spinner' \| 'dots' \| 'pulse' \| 'bars' \| 'neon'` | `'spinner'` |
| size          | `'small' \| 'medium' \| 'large'`                     | `'medium'`  |
| text          | `string`                                             | —           |
| color         | `string`                                             | —           |
| fullscreen    | `boolean`                                            | `false`     |
| mask          | `boolean`                                            | `true`      |
| mask-closable | `boolean`                                            | `false`     |
| target        | `string \| HTMLElement`                              | —           |
| z-index       | `number`                                             | —           |
| lock-scroll   | `boolean`                                            | `true`      |

原生 `class`、`style`、`aria-*` 与 `data-*` 属性会透传到真实浮层。

### Events

| 事件名         | 参数                         |
| -------------- | ---------------------------- |
| update:visible | `(visible: boolean) => void` |
| close          | `() => void`                 |

### Slots

| 插槽名  |
| ------- |
| default |
| spinner |

### Exposes

| 方法名     | 返回值                   |
| ---------- | ------------------------ |
| getElement | `HTMLDivElement \| null` |
| close      | `void`                   |

### LoadingServiceInstance

| 方法         | 类型                                              |
| ------------ | ------------------------------------------------- |
| show         | `() => void`                                      |
| hide         | `() => void`                                      |
| close        | `() => void`                                      |
| destroy      | `() => void`                                      |
| updateConfig | `(config: Partial<LoadingServiceConfig>) => void` |
