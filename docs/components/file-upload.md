# FileUpload 文件上传

`ExFileUpload` 提供文件选择、拖拽校验、列表状态和可中止的 XHR multipart 上传。上传结果会区分成功、失败、中止和未启动。

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { compressImage } from '../../src/components/image-compress'
import { DEMO_SERVICE_PREFIX } from '../.vitepress/demo-contract'

const files = ref([])
const uploadRef = ref()
const manualFiles = ref([])
const autoFiles = ref([])
const dynamicFiles = ref([])
const dynamicRef = ref()
const serviceReady = ref(false)
const serviceMessage = ref('正在检查演示服务…')
const serviceController = new AbortController()
const conversionController = new AbortController()
const rejectAuto = ref(false)
const autoAction = computed(() => `${DEMO_SERVICE_PREFIX}/upload${rejectAuto.value ? '?outcome=error' : ''}`)
const autoStatus = ref('选择文件后自动发送。')
const manualStatus = ref('选择文件后点击开始上传。')
const dynamicStatus = ref('选择文件后先解析上传配置，可在解析或传输期间中止。')
const tickets = new WeakMap()

onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: serviceController.signal })
    const ready = response.ok && (await response.json()).demo === true
    if (serviceController.signal.aborted) return
    serviceReady.value = ready
  } catch {
    if (serviceController.signal.aborted) return
    serviceReady.value = false
  }
  serviceMessage.value = serviceReady.value
    ? '演示服务已连接。仅接收测试文件并返回大小与摘要，不保存文件。'
    : '演示服务不可用。请在仓库运行 npm run docs:dev 或 npm run docs:preview 后重试。'
})
onBeforeUnmount(() => { serviceController.abort(); conversionController.abort() })

const getTicket = signal => {
  if (!tickets.has(signal)) {
    tickets.set(signal, fetch(`${DEMO_SERVICE_PREFIX}/ticket`, { signal }).then(response => {
      if (!response.ok) throw new Error(`配置解析失败：HTTP ${response.status}`)
      return response.json()
    }))
  }
  return tickets.get(signal)
}
const resolveAction = async (_file, { signal }) => (await getTicket(signal)).action
const resolveHeaders = async (_file, { signal }) => (await getTicket(signal)).headers
const resolveData = async file => ({ filename: file.name })
const cancelDynamic = () => { dynamicStatus.value = `已中止 ${dynamicRef.value?.abort() ?? 0} 个任务` }
const cancelManual = () => { manualStatus.value = `已中止 ${uploadRef.value?.abort() ?? 0} 个任务` }
const pictureFiles = ref([])
const pictureVisible = ref(false)
const previewFile = ref()
const convertedFiles = ref([])
const conversionStatus = ref('选择图片后先转换为 WebP，再加入列表。')
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 800
const OUTPUT_QUALITY = 0.8

const previewPicture = file => {
  previewFile.value = file.raw
  pictureVisible.value = Boolean(file.raw)
}
const removePicture = file => {
  pictureFiles.value = pictureFiles.value.filter(item => item.uid !== file.uid)
}
const convertImage = async file => {
  const result = await compressImage(file, {
    mode: 'dimension', maxWidth: MAX_IMAGE_DIMENSION, maxHeight: MAX_IMAGE_DIMENSION,
    outputType: 'image/webp', quality: OUTPUT_QUALITY, signal: conversionController.signal,
  })
  return new File([result.blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })
}
const reportConversion = file => {
  conversionStatus.value = `${file.name} · ${file.type} · ${file.size} 字节`
}
const reportConversionError = rejection => {
  conversionStatus.value = `未加入文件：${rejection.code}`
}

const submit = async () => {
  const results = await uploadRef.value?.submit()
  if (serviceController.signal.aborted) return
  manualStatus.value = results?.length ? results.map(result => `${result.outcome}${result.reason ? `：${result.reason}` : ''}`).join('；') : '没有可提交的文件'
}
</script>

网络示例使用随仓库提供的同源演示服务；分段处理用于观察进度和中止。纯静态部署需同时接入该服务，或将示例地址替换为自己的测试接口。

<p role="status">{{ serviceMessage }}</p>

## 选择文件

::: raw
<div class="demo-container">
  <ex-file-upload
    v-model:file-list="files"
    :auto-upload="false"
    accept="image/*,.pdf"
    :max-file-size="5 * 1024 * 1024"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFile } from 'vue-ex-ui';

const files = ref<UploadFile[]>([]);
</script>

<template>
  <div class="demo-container">
    <ex-file-upload
      v-model:file-list="files"
      :auto-upload="false"
      accept="image/*,.pdf"
      :max-file-size="5 * 1024 * 1024"
    />
  </div>
</template>
```

:::

传入 `file-list` 后列表为受控状态。组件只发出新快照，父级同步 `update:fileList` 前不会提前改变界面；不需要受控时使用 `default-file-list`。

## 自动上传

::: raw
<div class="demo-container">
  <label><input v-model="rejectAuto" type="checkbox" /> 演示服务端拒绝（HTTP 422）</label>
  <ex-file-upload
    v-model:file-list="autoFiles"
    :action="autoAction"
    :disabled="!serviceReady"
    :max-file-size="MAX_IMAGE_BYTES"
    @progress="file => (autoStatus = `上传进度：${file.percent}%`)"
    @success="response => (autoStatus = JSON.stringify(response))"
    @error="error => (autoStatus = error.message)"
  />
  <output aria-live="polite">{{ autoStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const autoFiles = ref([]);
const rejectAuto = ref(false);
const autoStatus = ref('选择文件后自动发送。');
const serviceReady = ref(false);
const controller = new AbortController();
const autoAction = computed(
  () => `${DEMO_SERVICE_PREFIX}/upload${rejectAuto.value ? '?outcome=error' : ''}`
);
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) autoStatus.value = '演示服务不可用';
  } catch {
    if (controller.signal.aborted) return;
    autoStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
</script>

<template>
  <div class="demo-container">
    <label>
      <input
        v-model="rejectAuto"
        type="checkbox"
      />
      演示服务端拒绝（HTTP 422）
    </label>
    <ex-file-upload
      v-model:file-list="autoFiles"
      :action="autoAction"
      :disabled="!serviceReady"
      :max-file-size="MAX_IMAGE_BYTES"
      @progress="file => (autoStatus = `上传进度：${file.percent}%`)"
      @success="response => (autoStatus = JSON.stringify(response))"
      @error="error => (autoStatus = error.message)"
    />
    <output aria-live="polite">{{ autoStatus }}</output>
  </div>
</template>
```

:::

只有 HTTP 2xx 响应会触发 `success`。HTTP 状态错误、网络错误、超时、配置错误和响应解析错误都会产生 `ExFileUploadError`。

## 手动上传与结果

::: raw
<div class="demo-container">
  <ex-file-upload
    ref="uploadRef"
    v-model:file-list="manualFiles"
    :action="`${DEMO_SERVICE_PREFIX}/upload`"
    :disabled="!serviceReady"
    :auto-upload="false"
    :max-file-size="MAX_IMAGE_BYTES"
    multiple
  />
  <ex-button :disabled="!serviceReady" @click="submit">开始上传</ex-button>
  <ex-button :disabled="!serviceReady" @click="cancelManual">中止上传</ex-button>
  <output aria-live="polite">{{ manualStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const uploadRef = ref();
const manualFiles = ref([]);
const manualStatus = ref('选择文件后点击开始上传。');
const serviceReady = ref(false);
const controller = new AbortController();
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) manualStatus.value = '演示服务不可用';
  } catch {
    if (controller.signal.aborted) return;
    manualStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
const submit = async () => {
  const results = await uploadRef.value?.submit();
  if (controller.signal.aborted) return;
  manualStatus.value = results?.length
    ? results
        .map(result => `${result.outcome}${result.reason ? `：${result.reason}` : ''}`)
        .join('；')
    : '没有可提交的文件';
};
const cancelManual = () => {
  manualStatus.value = `已中止 ${uploadRef.value?.abort() ?? 0} 个任务`;
};
</script>

<template>
  <div class="demo-container">
    <ex-file-upload
      ref="uploadRef"
      v-model:file-list="manualFiles"
      :action="`${DEMO_SERVICE_PREFIX}/upload`"
      :disabled="!serviceReady"
      :auto-upload="false"
      :max-file-size="MAX_IMAGE_BYTES"
      multiple
    />
    <ex-button
      :disabled="!serviceReady"
      @click="submit"
    >
      开始上传
    </ex-button>
    <ex-button
      :disabled="!serviceReady"
      @click="cancelManual"
    >
      中止上传
    </ex-button>
    <output aria-live="polite">{{ manualStatus }}</output>
  </div>
</template>
```

:::

没有 `action`、缺少原始 `File` 或文件不是 `ready` 状态时，`submit()` 返回 `ignored`，不会伪装为已上传。

`disabled` 与 `readonly` 也继承所在 Form 的状态。禁用或只读时，程序化 `submit()` 不会发起新任务，结果为 `ignored`，原因分别为 `disabled` 或 `readonly`；`requestClear()` 不修改列表并返回 `0`。只读仍可预览已有附件。

状态切换会中止尚在解析上传配置的任务，`aborted` 事件携带对应的 `disabled` 或 `readonly` 原因。已经发出的请求继续执行，仍可通过 `abort()` 显式中止。

## 动态上传配置与中止

`action`、`headers` 和 `data` 都可按文件异步解析。解析器会收到与 XHR 共用的 `AbortSignal`。

::: raw
<div class="demo-container">
  <ex-file-upload
    ref="dynamicRef"
    v-model:file-list="dynamicFiles"
    :disabled="!serviceReady"
    :action="resolveAction"
    :headers="resolveHeaders"
    :data="resolveData"
    :max-file-size="MAX_IMAGE_BYTES"
    @success="response => (dynamicStatus = JSON.stringify(response))"
    @error="error => (dynamicStatus = error.message)"
  />
  <ex-button :disabled="!serviceReady" @click="cancelDynamic">中止配置解析或传输</ex-button>
  <output aria-live="polite">{{ dynamicStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const DEMO_SERVICE_PREFIX = '/__exui_demo__';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const dynamicFiles = ref([]);
const dynamicRef = ref();
const dynamicStatus = ref('选择文件后先解析上传配置，可在解析或传输期间中止。');
const serviceReady = ref(false);
const controller = new AbortController();
const tickets = new WeakMap();
onMounted(async () => {
  try {
    const response = await fetch(`${DEMO_SERVICE_PREFIX}/health`, { signal: controller.signal });
    const ready = response.ok && (await response.json()).demo === true;
    if (controller.signal.aborted) return;
    serviceReady.value = ready;
    if (!serviceReady.value) dynamicStatus.value = '演示服务不可用';
  } catch {
    if (controller.signal.aborted) return;
    dynamicStatus.value = '演示服务不可用';
  }
});
onBeforeUnmount(() => controller.abort());
const getTicket = signal => {
  if (!tickets.has(signal)) {
    tickets.set(
      signal,
      fetch(`${DEMO_SERVICE_PREFIX}/ticket`, { signal }).then(response => {
        if (!response.ok) throw new Error(`配置解析失败：HTTP ${response.status}`);
        return response.json();
      })
    );
  }
  return tickets.get(signal);
};
const resolveAction = async (_file, { signal }) => (await getTicket(signal)).action;
const resolveHeaders = async (_file, { signal }) => (await getTicket(signal)).headers;
const resolveData = async file => ({ filename: file.name });
const cancelDynamic = () => {
  dynamicStatus.value = `已中止 ${dynamicRef.value?.abort() ?? 0} 个任务`;
};
</script>

<template>
  <div class="demo-container">
    <ex-file-upload
      ref="dynamicRef"
      v-model:file-list="dynamicFiles"
      :disabled="!serviceReady"
      :action="resolveAction"
      :headers="resolveHeaders"
      :data="resolveData"
      :max-file-size="MAX_IMAGE_BYTES"
      @success="response => (dynamicStatus = JSON.stringify(response))"
      @error="error => (dynamicStatus = error.message)"
    />
    <ex-button
      :disabled="!serviceReady"
      @click="cancelDynamic"
    >
      中止配置解析或传输
    </ex-button>
    <output aria-live="polite">{{ dynamicStatus }}</output>
  </div>
</template>
```

:::

调用 `abort(fileOrUid)` 可在动态配置解析或 XHR 传输阶段中止任务，并返回真实中止数量。中止后的文件恢复为 `ready`，可以再次提交。

## 拖拽和图片列表

这些图片仅在当前页面选择、预览和移除，不发起上传。各示例使用独立列表。

::: raw
<div class="demo-container">
  <ex-file-upload
    v-model:file-list="pictureFiles"
    :auto-upload="false"
    drag
    multiple
    list-type="picture-card"
    accept="image/*"
    :limit="8"
    :max-file-size="MAX_IMAGE_BYTES"
    @preview-request="previewPicture"
    @remove-request="removePicture"
  />
  <ex-file-preview v-model:visible="pictureVisible" :file="previewFile" :show-download="false" />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const pictureFiles = ref([]);
const pictureVisible = ref(false);
const previewFile = ref();
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const previewPicture = file => {
  previewFile.value = file.raw;
  pictureVisible.value = Boolean(file.raw);
};
const removePicture = file => {
  pictureFiles.value = pictureFiles.value.filter(item => item.uid !== file.uid);
};
</script>

<template>
  <div class="demo-container">
    <ex-file-upload
      v-model:file-list="pictureFiles"
      :auto-upload="false"
      drag
      multiple
      list-type="picture-card"
      accept="image/*"
      :limit="8"
      :max-file-size="MAX_IMAGE_BYTES"
      @preview-request="previewPicture"
      @remove-request="removePicture"
    />
    <ex-file-preview
      v-model:visible="pictureVisible"
      :file="previewFile"
      :show-download="false"
    />
  </div>
</template>
```

:::

本地图片缩略图使用对象地址；文件移除、来源替换或组件卸载时会自动释放，不会把 base64 内容写入公开列表。

## 加入前转换

`before-add` 在文件加入列表前运行。返回 `false` 会产生 `before-add` 拒绝；返回新 `File` 后，组件会对替换文件重新执行 `accept` 和大小校验；异常会保留在 `before-add-error.cause`。

::: raw
<div class="demo-container">
  <ex-file-upload
    v-model:file-list="convertedFiles"
    :auto-upload="false"
    :before-add="convertImage"
    accept="image/*"
    :max-file-size="MAX_IMAGE_BYTES"
    @added="reportConversion"
    @rejected="reportConversionError"
  />
  <output aria-live="polite">{{ conversionStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { compressImage } from 'vue-ex-ui';

const convertedFiles = ref([]);
const conversionStatus = ref('选择图片后先转换为 WebP，再加入列表。');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 800;
const OUTPUT_QUALITY = 0.8;
const conversionController = new AbortController();
onBeforeUnmount(() => conversionController.abort());
const convertImage = async file => {
  const result = await compressImage(file, {
    mode: 'dimension',
    maxWidth: MAX_IMAGE_DIMENSION,
    maxHeight: MAX_IMAGE_DIMENSION,
    outputType: 'image/webp',
    quality: OUTPUT_QUALITY,
    signal: conversionController.signal,
  });
  return new File([result.blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, {
    type: 'image/webp',
  });
};
const reportConversion = file => {
  conversionStatus.value = `${file.name} · ${file.type} · ${file.size} 字节`;
};
const reportConversionError = rejection => {
  conversionStatus.value = `未加入文件：${rejection.code}`;
};
</script>

<template>
  <div class="demo-container">
    <ex-file-upload
      v-model:file-list="convertedFiles"
      :auto-upload="false"
      :before-add="convertImage"
      accept="image/*"
      :max-file-size="MAX_IMAGE_BYTES"
      @added="reportConversion"
      @rejected="reportConversionError"
    />
    <output aria-live="polite">{{ conversionStatus }}</output>
  </div>
</template>
```

:::

## API

### Props

| 属性                | 类型                                                   | 默认值   |
| ------------------- | ------------------------------------------------------ | -------- |
| `action`            | `string \| UploadActionResolver`                       | —        |
| `method`            | `'POST' \| 'PUT' \| 'PATCH'`                           | `'POST'` |
| `headers`           | `UploadHeaders \| UploadConfigResolver<UploadHeaders>` | —        |
| `data`              | `UploadData \| UploadConfigResolver<UploadData>`       | —        |
| `name`              | `string`                                               | `'file'` |
| `multiple`          | `boolean`                                              | `false`  |
| `drag`              | `boolean`                                              | `false`  |
| `accept`            | `string`                                               | —        |
| `file-list`         | `UploadFile[]`                                         | —        |
| `default-file-list` | `UploadFile[]`                                         | `[]`     |
| `limit`             | `number`                                               | —        |
| `max-file-size`     | `number`，字节                                         | —        |
| `auto-upload`       | `boolean`                                              | `true`   |
| `show-file-list`    | `boolean`                                              | `true`   |
| `list-type`         | `'text' \| 'picture' \| 'picture-card'`                | `'text'` |
| `disabled`          | `boolean`                                              | `false`  |
| `readonly`          | `boolean`                                              | `false`  |
| `with-credentials`  | `boolean`                                              | `false`  |
| `timeout`           | `number`，毫秒                                         | `0`      |
| `tip`               | `string`                                               | —        |
| `button-text`       | `string`                                               | —        |
| `drag-text`         | `string`                                               | —        |
| `drag-description`  | `string`                                               | —        |
| `before-add`        | `BeforeAdd`                                            | —        |
| `aria-label`        | `string`                                               | 文件上传 |

附加数据支持 `string`、`number`、`boolean` 和 `Blob`；`null` 与 `undefined` 会被忽略。组件负责 multipart 边界，不能在 `headers` 中手动设置 `Content-Type`。

### Events

| 事件              | 参数                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| `update:fileList` | `(fileList: UploadFile[])`                                              |
| `added`           | `(file: UploadFile, fileList: UploadFile[])`                            |
| `rejected`        | `(rejection: UploadRejection, fileList: UploadFile[])`                  |
| `progress`        | `(file: UploadFile, fileList: UploadFile[])`                            |
| `success`         | `(response: unknown, file: UploadFile, fileList: UploadFile[])`         |
| `error`           | `(error: ExFileUploadError, file: UploadFile, fileList: UploadFile[])`  |
| `aborted`         | `(file: UploadFile, fileList: UploadFile[], reason: UploadAbortReason)` |
| `remove-request`  | `(file: UploadFile)`                                                    |
| `preview-request` | `(file: UploadFile)`                                                    |

`UploadRejection.code` 为 `accept`、`size`、`limit`、`multiple`、`before-add` 或 `before-add-error`。

`ExFileUploadError.code` 为 `configuration-error`、`request-error`、`http-error`、`timeout` 或 `response-error`。

### Slots

| 插槽        | 作用域                                                 |
| ----------- | ------------------------------------------------------ |
| `trigger`   | `{ disabled: boolean, openFileDialog: () => boolean }` |
| `drag-icon` | —                                                      |
| `tip`       | —                                                      |

### Exposed

| 方法             | 类型                                                       |
| ---------------- | ---------------------------------------------------------- |
| `openFileDialog` | `() => boolean`                                            |
| `submit`         | `(file?: UploadFile \| string) => Promise<UploadResult[]>` |
| `abort`          | `(file?: UploadFile \| string) => number`                  |
| `requestClear`   | `() => number`                                             |
| `getFiles`       | `() => UploadFile[]`                                       |
| `getElement`     | `() => HTMLDivElement \| null`                             |

`requestClear()` 会真实中止活动任务并请求空列表；受控模式下仍需父级同步列表，方法不会提前清空受控界面。

## 无障碍

- 拖拽区具备按钮语义，可使用 Enter 或 Space 打开文件选择器。
- 预览和移除操作使用有名称的原生按钮。
- 上传进度使用 `progressbar` 语义，并提供当前文件名和数值。
- 禁用状态同时阻止选择、拖拽、预览和移除。

<style scoped>
.demo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

output {
  flex-basis: 100%;
  overflow-wrap: anywhere;
}
</style>
