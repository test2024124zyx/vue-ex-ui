# Loading 加载

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { createLoadingService, destroyLoading, hideLoading, showLoading } from '../../src/components/loading'

const visible = ref(false)
const closeCount = ref(0)
const busy = ref(false)
const syncing = ref(false)
const serviceTarget = ref()
const serviceStatus = ref('尚未创建实例')
const imageLoading = createLoadingService({ type: 'pulse' })
let request
const startLocal = () => {
  if (!serviceTarget.value) return
  request?.destroy()
  request = imageLoading.show({ target: serviceTarget.value, text: '刷新内容' })
  serviceStatus.value = '局部实例已显示'
}
const updateLocal = () => {
  if (!request) return
  request.updateConfig({ type: 'dots', text: '正在同步最新内容' })
  serviceStatus.value = '配置已更新'
}
const hideLocal = () => { if (!request) return; request.hide(); serviceStatus.value = '局部实例已隐藏' }
const resumeLocal = () => { if (!request) return; request.show(); serviceStatus.value = '局部实例已恢复' }
const destroyLocal = () => {
  imageLoading.destroyAll()
  request = undefined
  serviceStatus.value = '局部实例已销毁'
}
const showSingleton = () => showLoading({ text: '提交中，点击遮罩关闭', maskClosable: true })
onBeforeUnmount(() => { imageLoading.destroyAll(); destroyLoading() })
</script>

## 局部加载

目标容器会在浮层显示期间自动获得定位上下文。

::: raw
<div id="loading-basic" style="height: 180px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"></div>
<ex-loading target="#loading-basic" text="正在加载数据" />
:::

::: details 查看示例代码

```vue
<template>
  <div
    id="loading-basic"
    style="height: 180px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);"
  ></div>
  <ex-loading
    target="#loading-basic"
    text="正在加载数据"
  />
</template>
```

:::

## 动画类型

::: raw
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
  <div id="loading-spinner" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-dots" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-pulse" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-bars" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
  <div id="loading-neon" style="height: 120px; background: var(--ex-color-bg-tertiary);"></div>
</div>

<ex-loading target="#loading-spinner" type="spinner" text="Spinner" />
<ex-loading target="#loading-dots" type="dots" text="Dots" />
<ex-loading target="#loading-pulse" type="pulse" text="Pulse" />
<ex-loading target="#loading-bars" type="bars" text="Bars" />
<ex-loading target="#loading-neon" type="neon" text="Neon" />
:::

::: details 查看示例代码

```vue
<template>
  <div
    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;"
  >
    <div
      id="loading-spinner"
      style="height: 120px; background: var(--ex-color-bg-tertiary);"
    ></div>
    <div
      id="loading-dots"
      style="height: 120px; background: var(--ex-color-bg-tertiary);"
    ></div>
    <div
      id="loading-pulse"
      style="height: 120px; background: var(--ex-color-bg-tertiary);"
    ></div>
    <div
      id="loading-bars"
      style="height: 120px; background: var(--ex-color-bg-tertiary);"
    ></div>
    <div
      id="loading-neon"
      style="height: 120px; background: var(--ex-color-bg-tertiary);"
    ></div>
  </div>
  <ex-loading
    target="#loading-spinner"
    type="spinner"
    text="Spinner"
  />
  <ex-loading
    target="#loading-dots"
    type="dots"
    text="Dots"
  />
  <ex-loading
    target="#loading-pulse"
    type="pulse"
    text="Pulse"
  />
  <ex-loading
    target="#loading-bars"
    type="bars"
    text="Bars"
  />
  <ex-loading
    target="#loading-neon"
    type="neon"
    text="Neon"
  />
</template>
```

:::

## 尺寸与颜色

::: raw
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
  <div id="loading-small" style="height: 140px;"></div>
  <div id="loading-medium" style="height: 140px;"></div>
  <div id="loading-large" style="height: 140px;"></div>
</div>
<ex-loading target="#loading-small" size="small" color="#29abe2" text="小号蓝色" />
<ex-loading target="#loading-medium" size="medium" color="#ff3bd1" text="中号粉色" />
<ex-loading target="#loading-large" size="large" text="大号主题色" />
:::

::: details 查看示例代码

```vue
<template>
  <div
    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;"
  >
    <div
      id="loading-small"
      style="height: 140px;"
    ></div>
    <div
      id="loading-medium"
      style="height: 140px;"
    ></div>
    <div
      id="loading-large"
      style="height: 140px;"
    ></div>
  </div>
  <ex-loading
    target="#loading-small"
    size="small"
    color="#29abe2"
    text="小号蓝色"
  />
  <ex-loading
    target="#loading-medium"
    size="medium"
    color="#ff3bd1"
    text="中号粉色"
  />
  <ex-loading
    target="#loading-large"
    size="large"
    text="大号主题色"
  />
</template>
```

:::

## 受控全屏加载

点击按钮打开全屏加载，点击遮罩关闭。

::: raw
<ex-button @click="visible = true">开始处理</ex-button>
<ex-loading v-model:visible="visible" fullscreen mask-closable type="neon" text="正在处理，点击遮罩关闭" @close="closeCount++" />
<p role="status">用户已关闭 {{ closeCount }} 次</p>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="visible = true">开始处理</ex-button>
  <ex-loading
    v-model:visible="visible"
    fullscreen
    mask-closable
    type="neon"
    text="正在处理，点击遮罩关闭"
    @close="closeCount++"
  />
  <p role="status">用户已关闭 {{ closeCount }} 次</p>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const closeCount = ref(0);
</script>
```

:::

`:mask="false"` 时浮层不拦截底层交互，也不会锁定页面滚动。

## 自定义内容

::: raw
<div id="loading-custom" style="height: 180px;"></div>
<ex-loading target="#loading-custom" text="资源加载中">
  <template #spinner>
    <ex-icon icon="loader-4-line" :size="40" />
  </template>
  正在准备资源
</ex-loading>
:::

::: details 查看示例代码

```vue
<template>
  <div
    id="loading-custom"
    style="height: 180px;"
  ></div>
  <ex-loading
    target="#loading-custom"
    text="资源加载中"
  >
    <template #spinner>
      <ex-icon
        icon="loader-4-line"
        :size="40"
      />
    </template>
    正在准备资源
  </ex-loading>
</template>
```

:::

## 服务

未提供 `target` 时创建全屏实例；局部实例必须提供当前文档中的目标元素或有效选择器。

::: raw
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <ex-button @click="startLocal">创建局部实例</ex-button>
  <ex-button @click="updateLocal">更新配置</ex-button>
  <ex-button @click="hideLocal">隐藏</ex-button>
  <ex-button @click="resumeLocal">恢复</ex-button>
  <ex-button @click="destroyLocal">销毁局部实例</ex-button>
  <ex-button @click="showSingleton">显示全屏单例</ex-button>
  <ex-button @click="hideLoading">隐藏单例</ex-button>
</div>
<div ref="serviceTarget" style="height: 180px; margin-top: 12px;">局部服务目标区域</div>
<p role="status">{{ serviceStatus }}</p>
:::

::: details 查看示例代码

```vue
<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { createLoadingService, destroyLoading, hideLoading, showLoading } from 'vue-ex-ui';

const serviceTarget = ref();
const serviceStatus = ref('尚未创建实例');
const imageLoading = createLoadingService({ type: 'pulse' });
let request;
const startLocal = () => {
  if (!serviceTarget.value) return;
  request?.destroy();
  request = imageLoading.show({ target: serviceTarget.value, text: '刷新内容' });
  serviceStatus.value = '局部实例已显示';
};
const updateLocal = () => {
  if (!request) return;
  request.updateConfig({ type: 'dots', text: '正在同步最新内容' });
  serviceStatus.value = '配置已更新';
};
const hideLocal = () => {
  if (!request) return;
  request.hide();
  serviceStatus.value = '局部实例已隐藏';
};
const resumeLocal = () => {
  if (!request) return;
  request.show();
  serviceStatus.value = '局部实例已恢复';
};
const destroyLocal = () => {
  imageLoading.destroyAll();
  request = undefined;
  serviceStatus.value = '局部实例已销毁';
};
const showSingleton = () => showLoading({ text: '提交中，点击遮罩关闭', maskClosable: true });
onBeforeUnmount(() => {
  imageLoading.destroyAll();
  destroyLoading();
});
</script>

<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <ex-button @click="startLocal">创建局部实例</ex-button>
    <ex-button @click="updateLocal">更新配置</ex-button>
    <ex-button @click="hideLocal">隐藏</ex-button>
    <ex-button @click="resumeLocal">恢复</ex-button>
    <ex-button @click="destroyLocal">销毁局部实例</ex-button>
    <ex-button @click="showSingleton">显示全屏单例</ex-button>
    <ex-button @click="hideLoading">隐藏单例</ex-button>
  </div>
  <div
    ref="serviceTarget"
    style="height: 180px; margin-top: 12px;"
  >
    局部服务目标区域
  </div>
  <p role="status">{{ serviceStatus }}</p>
</template>
```

:::

在 ConfigProvider 子树的 `setup()` 中调用 `useLoadingService()`，实例会继承最近的语言、
主题与 z-index，并随 Provider 卸载清理。直接导入的 `loadingService` 是模块级便捷单例；
完整安装组件库后，`this.$loading` 则绑定当前 Vue App 的上下文。

## v-loading

完整安装组件库后可使用指令。对象绑定会在更新时同步配置。

::: raw
<ex-button @click="busy = !busy">{{ busy ? '停止加载' : '布尔绑定加载' }}</ex-button>
<ex-button @click="syncing = !syncing">{{ syncing ? '停止同步' : '对象绑定同步' }}</ex-button>
<section v-loading="busy" style="height: 140px; margin-top: 12px;">布尔绑定目标</section>
<section v-loading="{ loading: syncing, config: { type: 'dots', text: '同步中', mask: true } }" style="height: 140px; margin-top: 12px;">对象绑定目标</section>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const busy = ref(false);
const syncing = ref(false);
</script>

<template>
  <ex-button @click="busy = !busy">{{ busy ? '停止加载' : '布尔绑定加载' }}</ex-button>
  <ex-button @click="syncing = !syncing">{{ syncing ? '停止同步' : '对象绑定同步' }}</ex-button>
  <section
    v-loading="busy"
    style="height: 140px; margin-top: 12px;"
  >
    布尔绑定目标
  </section>
  <section
    v-loading="{ loading: syncing, config: { type: 'dots', text: '同步中', mask: true } }"
    style="height: 140px; margin-top: 12px;"
  >
    对象绑定目标
  </section>
</template>
```

:::

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
