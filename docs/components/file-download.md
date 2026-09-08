# FileDownload 文件下载

在浏览器中触发链接下载，或通过 Fetch / XHR 获取文件并报告读取进度。

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DEMO_SERVICE_PREFIX } from '../.vitepress/demo-contract'

const serviceReady = ref(false)
const serviceMessage = ref('正在检查演示服务…')
const serviceController = new AbortController()
const unknownTotal = ref(false)
const failFetch = ref(false)
const fetchStatus = ref('等待下载')
const fetchProgress = ref({ loaded: 0, total: null, percent: null })
const fetchUrl = computed(() => `${DEMO_SERVICE_PREFIX}/download?length=${unknownTotal.value ? 'unknown' : 'known'}&outcome=${failFetch.value ? 'error' : 'success'}`)
const downloader = ref()
const xhrActive = ref(false)
const xhrStatus = ref('等待下载')
const customStatus = ref('等待下载')
const onFetchStart = () => { fetchStatus.value = '正在读取响应'; fetchProgress.value = { loaded: 0, total: null, percent: null } }
const onFetchSuccess = blob => { fetchStatus.value = `响应读取完成：${blob.size} 字节，已交给浏览器下载` }
const onFetchError = error => { fetchStatus.value = error.message }
const onXhrStart = () => { xhrActive.value = true; xhrStatus.value = '正在下载，可以取消' }
const onXhrSuccess = () => { xhrActive.value = false; xhrStatus.value = '响应读取完成，已交给浏览器下载' }
const onXhrError = error => { xhrActive.value = false; xhrStatus.value = error.message }
const onXhrCancel = () => { xhrActive.value = false; xhrStatus.value = '请求已取消，可以重新下载' }
const onCustomError = error => { customStatus.value = error.message }

onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: serviceController.signal })
    if (serviceController.signal.aborted) return
    const ready = response.ok && (await response.json()).demo === true
    if (serviceController.signal.aborted) return
    serviceReady.value = ready
  } catch {
    if (serviceController.signal.aborted) return
    serviceReady.value = false
  }
  if (serviceController.signal.aborted) return
  serviceMessage.value = serviceReady.value
    ? '演示服务已连接，下载内容会分段返回，便于观察进度和取消。'
    : '演示服务不可用。请在仓库运行 npm run docs:dev 或 npm run docs:preview 后重试。'
})
onBeforeUnmount(() => serviceController.abort())

const cancelDownload = () => {
  if (!downloader.value?.cancel()) xhrStatus.value = '当前没有活动请求'
}
</script>

Link 示例使用随文档发布的 CSV 文件。其余网络示例需要仓库内的演示服务；纯静态部署需同时接入该服务，或将示例 URL 替换为自己的测试接口。

<p role="status">{{ serviceMessage }}</p>

## Link 传输

`link` 只负责创建并点击下载链接。浏览器接管后组件会触发 `trigger`，不会把未知的磁盘保存结果报告为 `success`。

::: raw
<div class="demo-container">
  <ex-file-download
    url="/demo-assets/download-sample.csv"
    filename="download-sample.csv"
    transport="link"
    button-text="下载示例表格"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-file-download
    url="/demo-assets/download-sample.csv"
    filename="download-sample.csv"
    transport="link"
    button-text="下载示例表格"
  />
</template>
```

:::

## Fetch 与进度

Fetch 和 XHR 会在响应读取完成后创建 Blob 下载。服务端未提供 `Content-Length` 时，`percent` 与 `total` 为 `null`，组件只显示已读取字节。

::: raw
<div class="demo-container">
  <label><input v-model="unknownTotal" type="checkbox" /> 不提供总大小</label>
  <label><input v-model="failFetch" type="checkbox" /> 演示 HTTP 503 错误</label>
  <ex-file-download
    :url="fetchUrl"
    :disabled="!serviceReady"
    filename="fetch-report.csv"
    transport="fetch"
    @start="onFetchStart"
    @progress="fetchProgress = $event"
    @success="onFetchSuccess"
    @error="onFetchError"
  />
  <output aria-live="polite">{{ fetchStatus }}</output>
  <output>已读取 {{ fetchProgress.loaded }} 字节；{{ fetchProgress.total === null ? '总大小未知' : `总大小 ${fetchProgress.total} 字节` }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const serviceReady = ref(false);
const unknownTotal = ref(false);
const failFetch = ref(false);
const fetchStatus = ref('等待下载');
const fetchProgress = ref({ loaded: 0, total: null, percent: null });
const fetchUrl = computed(
  () =>
    `${DEMO_SERVICE_PREFIX}/download?length=${unknownTotal.value ? 'unknown' : 'known'}&outcome=${failFetch.value ? 'error' : 'success'}`
);
const onFetchStart = () => {
  fetchStatus.value = '正在读取响应';
  fetchProgress.value = { loaded: 0, total: null, percent: null };
};
const onFetchSuccess = blob => {
  fetchStatus.value = `响应读取完成：${blob.size} 字节，已交给浏览器下载`;
};
const onFetchError = error => {
  fetchStatus.value = error.message;
};
const controller = new AbortController();
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    if (controller.signal.aborted) return;
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) fetchStatus.value = '演示服务不可用';
  } catch {
    if (!controller.signal.aborted) fetchStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
</script>

<template>
  <div class="demo-container">
    <label>
      <input
        v-model="unknownTotal"
        type="checkbox"
      />
      不提供总大小
    </label>
    <label>
      <input
        v-model="failFetch"
        type="checkbox"
      />
      演示 HTTP 503 错误
    </label>
    <ex-file-download
      :url="fetchUrl"
      :disabled="!serviceReady"
      filename="fetch-report.csv"
      transport="fetch"
      @start="onFetchStart"
      @progress="fetchProgress = $event"
      @success="onFetchSuccess"
      @error="onFetchError"
    />
    <output aria-live="polite">{{ fetchStatus }}</output>
    <output>
      已读取 {{ fetchProgress.loaded }} 字节；{{
        fetchProgress.total === null ? '总大小未知' : `总大小 ${fetchProgress.total} 字节`
      }}
    </output>
  </div>
</template>
```

:::

显式 `filename` 的优先级高于响应的 `Content-Disposition` 和 URL 路径文件名。

## 取消请求

`cancel()` 只会在存在活动 Fetch / XHR 请求时返回 `true` 并触发 `cancel`。Link 已由浏览器接管，不能取消。

::: raw
<div class="demo-container">
  <ex-file-download
    ref="downloader"
    :url="`${DEMO_SERVICE_PREFIX}/download`"
    :disabled="!serviceReady"
    transport="xhr"
    @start="onXhrStart"
    @success="onXhrSuccess"
    @error="onXhrError"
    @cancel="onXhrCancel"
  />
  <ex-button :disabled="!xhrActive" @click="cancelDownload">取消下载</ex-button>
  <output aria-live="polite">{{ xhrStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const serviceReady = ref(false);
const downloader = ref();
const xhrActive = ref(false);
const xhrStatus = ref('等待下载');
const onXhrStart = () => {
  xhrActive.value = true;
  xhrStatus.value = '正在下载，可以取消';
};
const onXhrSuccess = () => {
  xhrActive.value = false;
  xhrStatus.value = '响应读取完成，已交给浏览器下载';
};
const onXhrError = error => {
  xhrActive.value = false;
  xhrStatus.value = error.message;
};
const onXhrCancel = () => {
  xhrActive.value = false;
  xhrStatus.value = '请求已取消，可以重新下载';
};
const controller = new AbortController();
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    if (controller.signal.aborted) return;
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) xhrStatus.value = '演示服务不可用';
  } catch {
    if (!controller.signal.aborted) xhrStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
const cancelDownload = () => {
  if (!downloader.value?.cancel()) xhrStatus.value = '当前没有活动请求';
};
</script>

<template>
  <div class="demo-container">
    <ex-file-download
      ref="downloader"
      :url="`${DEMO_SERVICE_PREFIX}/download`"
      :disabled="!serviceReady"
      transport="xhr"
      @start="onXhrStart"
      @success="onXhrSuccess"
      @error="onXhrError"
      @cancel="onXhrCancel"
    />
    <ex-button
      :disabled="!xhrActive"
      @click="cancelDownload"
    >
      取消下载
    </ex-button>
    <output aria-live="polite">{{ xhrStatus }}</output>
  </div>
</template>
```

:::

## 自定义触发器和进度

默认插槽替换触发器，`progress` 插槽只替换活动请求的进度视图。

::: raw
<div class="demo-container">
  <ex-file-download
    :url="`${DEMO_SERVICE_PREFIX}/download?length=unknown`"
    :disabled="!serviceReady"
    transport="fetch"
    @start="customStatus = '正在获取'"
    @success="customStatus = '响应读取完成，已交给浏览器下载'"
    @error="onCustomError"
    @cancel="customStatus = '已取消'"
  >
    <template #default="{ download, cancel, status, disabled }">
      <ex-button :disabled="disabled" @click="download">{{ status === 'downloading' ? '正在获取' : '获取文件' }}</ex-button>
      <ex-button v-if="status === 'downloading'" @click="cancel">取消</ex-button>
    </template>
    <template #progress="{ progress }">
      <output>已读取 {{ progress.loaded }} 字节</output>
    </template>
  </ex-file-download>
  <output aria-live="polite">{{ customStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const serviceReady = ref(false);
const customStatus = ref('等待下载');
const onCustomError = error => {
  customStatus.value = error.message;
};
const controller = new AbortController();
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    if (controller.signal.aborted) return;
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) customStatus.value = '演示服务不可用';
  } catch {
    if (!controller.signal.aborted) customStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
</script>

<template>
  <div class="demo-container">
    <ex-file-download
      :url="`${DEMO_SERVICE_PREFIX}/download?length=unknown`"
      :disabled="!serviceReady"
      transport="fetch"
      @start="customStatus = '正在获取'"
      @success="customStatus = '响应读取完成，已交给浏览器下载'"
      @error="onCustomError"
      @cancel="customStatus = '已取消'"
    >
      <template #default="{ download, cancel, status, disabled }">
        <ex-button
          :disabled="disabled"
          @click="download"
        >
          {{ status === 'downloading' ? '正在获取' : '获取文件' }}
        </ex-button>
        <ex-button
          v-if="status === 'downloading'"
          @click="cancel"
        >
          取消
        </ex-button>
      </template>
      <template #progress="{ progress }">
        <output>已读取 {{ progress.loaded }} 字节</output>
      </template>
    </ex-file-download>
    <output aria-live="polite">{{ customStatus }}</output>
  </div>
</template>
```

:::

## API

### Props

| 参数             | 说明                             | 类型                         | 默认值      |
| ---------------- | -------------------------------- | ---------------------------- | ----------- |
| url              | HTTP、HTTPS、Blob 或相对下载地址 | `string`                     | 必填        |
| filename         | 建议文件名                       | `string`                     | 响应或 URL  |
| transport        | 下载传输方式                     | `'link' \| 'fetch' \| 'xhr'` | `'link'`    |
| show-progress    | 活动 Fetch / XHR 是否显示进度    | `boolean`                    | `true`      |
| headers          | Fetch / XHR 请求头               | `Record<string, string>`     | -           |
| max-bytes        | Fetch / XHR 最大缓冲字节数       | `number`                     | `536870912` |
| with-credentials | Fetch 使用 include，XHR 携带凭证 | `boolean`                    | `false`     |
| button-text      | 固定按钮文案                     | `string`                     | 按状态翻译  |
| button-type      | 默认按钮类型                     | `ButtonType`                 | `'primary'` |
| button-size      | 默认按钮尺寸                     | `ButtonSize`                 | `'medium'`  |
| disabled         | 是否禁用                         | `boolean`                    | `false`     |

### Events

| 事件名   | 说明                                       | 类型                                           |
| -------- | ------------------------------------------ | ---------------------------------------------- |
| start    | 有效下载开始处理                           | `(transport: ExFileDownloadTransport) => void` |
| progress | Fetch / XHR 已读取数据                     | `(progress: ExFileDownloadProgress) => void`   |
| trigger  | Link 已交给浏览器；不表示文件保存成功      | `(url: string, filename: string) => void`      |
| success  | Fetch / XHR 响应读取完成并已创建 Blob 下载 | `(blob: Blob, filename: string) => void`       |
| error    | 输入、协议、HTTP、网络或浏览器能力错误     | `(error: ExFileDownloadError) => void`         |
| cancel   | 活动 Fetch / XHR 已被调用方取消            | `() => void`                                   |

### Slots

| 名称     | 说明           | 作用域参数                             |
| -------- | -------------- | -------------------------------------- |
| default  | 自定义触发器   | `ExFileDownloadSlotProps`              |
| progress | 自定义进度视图 | `{ progress: ExFileDownloadProgress }` |

### Exposes

| 方法名     | 说明                           | 类型                                  |
| ---------- | ------------------------------ | ------------------------------------- |
| download   | 下载并返回所有路径的可判别结果 | `() => Promise<ExFileDownloadResult>` |
| cancel     | 是否实际取消了活动请求         | `() => boolean`                       |
| getElement | 获取根元素                     | `() => HTMLDivElement \| null`        |

`download()` 不会用空 Blob 模拟 Link 成功，也不会因业务失败产生未处理 Promise rejection。调用方可通过 `outcome` 区分 `triggered`、`success`、`cancelled`、`ignored` 和 `error`。

## 安全与无障碍

- 下载地址拒绝 `javascript:`、`data:` 与 `file:` 协议。
- 文件名会移除路径、控制字符和跨平台保留字符。
- 默认触发器使用原生按钮语义；进度条提供确定或不确定的 ARIA 进度状态。
- Fetch / XHR 仍受浏览器同源策略和服务端 CORS 配置约束。

<style scoped>
.demo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
}

output {
  flex-basis: 100%;
  overflow-wrap: anywhere;
}
</style>
