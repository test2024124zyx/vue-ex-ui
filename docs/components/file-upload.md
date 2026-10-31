# FileUpload 文件上传

`ExFileUpload` 提供文件选择、拖拽校验、文件并发调度和可中止的上传。默认使用 XHR multipart；显式设置 `transport="tus"` 后支持 tus 1.0.0 分片、暂停、断点续传及服务端资源取消。

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
const tusEndpoint = ref('')
const tusScope = ref('')
const tusFiles = ref([])
const tusStatus = ref('填写自己的 tus 服务端地址后选择测试文件，点击文件下方的上传按钮。')
const TUS_CHUNK_BYTES = 4 * 1024 * 1024
const tusOptions = computed(() => ({ chunkSize: TUS_CHUNK_BYTES, resumeKey: tusScope.value }))
const tusBusy = computed(() => tusFiles.value.some(file => ['queued', 'uploading', 'cancelling'].includes(file.status)))
const reportTusCancellation = result => {
  tusStatus.value = result.terminated ? '服务端已确认删除上传资源。' : '本地任务已取消，尚无已知服务端资源地址。'
}
const reportTusStorage = () => {
  tusStatus.value = '浏览器续传记录不可用；本次上传继续，但不能依赖跨会话恢复。'
}

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

没有 `action`、缺少原始 `File` 或文件不处于 `ready`、`paused`、`error` 状态时，`submit()` 返回 `ignored`，不会伪装为已上传。失败文件可以通过列表中的重试按钮重新提交。

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

## tus 分片、断点续传与并发

业务服务端需要提供 [tus 1.0.0](https://tus.io/protocols/resumable-upload) 接口，支持 Creation 扩展。单个文件的分片顺序发送，服务器通过 `Upload-Offset` 确认已接收字节；`concurrency` 控制不同文件的并发数量，不要求 Concatenation 扩展。

此运行区使用你填写的真实服务端，不会向公共演示服务上传文件。跨域接口必须正确配置 CORS，允许 `POST`、`HEAD`、`PATCH`、`DELETE` 及 tus 请求头，并暴露 `Location`、`Upload-Offset`、`Upload-Length`、`Tus-Resumable`。认证可使用 `headers` 动态解析器；它会在每次请求前重新执行，暂停/继续期间可以刷新凭证。

::: raw
<div class="demo-container">
  <ExInput v-model="tusEndpoint" label="tus 服务端地址" :disabled="tusBusy" />
  <ExInput v-model="tusScope" label="账户或业务续传作用域" :disabled="tusBusy" />
  <ex-file-upload
    v-model:file-list="tusFiles"
    transport="tus"
    :action="tusEndpoint"
    :tus="tusOptions"
    :concurrency="2"
    :auto-upload="false"
    :disabled="!tusEndpoint.trim()"
    multiple
    @paused="file => (tusStatus = `${file.name} 已暂停，继续时将查询服务器偏移。`)"
    @success="response => (tusStatus = `上传完成：${response.uploadUrl}`)"
    @error="error => (tusStatus = error.message)"
    @cancelled="reportTusCancellation"
    @resume-unavailable="reportTusStorage"
  />
  <output role="status">{{ tusStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadCancelResult, UploadFile } from 'vue-ex-ui';

const tusEndpoint = ref('');
const tusScope = ref('');
const tusFiles = ref<UploadFile[]>([]);
const tusStatus = ref('填写自己的 tus 服务端地址后选择测试文件，点击文件下方的上传按钮。');
const TUS_CHUNK_BYTES = 4 * 1024 * 1024;
const tusOptions = computed(() => ({ chunkSize: TUS_CHUNK_BYTES, resumeKey: tusScope.value }));
const tusBusy = computed(() =>
  tusFiles.value.some(file => ['queued', 'uploading', 'cancelling'].includes(file.status))
);
const reportTusCancellation = (result: UploadCancelResult) => {
  tusStatus.value = result.terminated
    ? '服务端已确认删除上传资源。'
    : '本地任务已取消，尚无已知服务端资源地址。';
};
const reportTusStorage = () => {
  tusStatus.value = '浏览器续传记录不可用；本次上传继续，但不能依赖跨会话恢复。';
};
</script>

<template>
  <ExInput
    v-model="tusEndpoint"
    label="tus 服务端地址"
    :disabled="tusBusy"
  />
  <ExInput
    v-model="tusScope"
    label="账户或业务续传作用域"
    :disabled="tusBusy"
  />
  <ex-file-upload
    v-model:file-list="tusFiles"
    transport="tus"
    :action="tusEndpoint"
    :tus="tusOptions"
    :concurrency="2"
    :auto-upload="false"
    :disabled="!tusEndpoint.trim()"
    multiple
    @paused="file => (tusStatus = `${file.name} 已暂停，继续时将查询服务器偏移。`)"
    @success="response => (tusStatus = `上传完成：${response.uploadUrl}`)"
    @error="error => (tusStatus = error.message)"
    @cancelled="reportTusCancellation"
    @resume-unavailable="reportTusStorage"
  />
  <output role="status">{{ tusStatus }}</output>
</template>
```

:::

- `pause()` 保留已确认的资源地址和进度；`resume()` 使用 `HEAD` 获取真实断点，再继续 `PATCH`。
- 浏览器允许本地存储时，重新打开页面并重新选择相同文件也可续传。浏览器不会替应用保存原始 `File`；成功上传后移除本地断点记录。
- 续传身份包含端点、`resumeKey`、文件名、类型、大小和修改时间。多账户应用应提供账户专属 `resumeKey`，业务服务端仍须验证每个资源的访问权限。
- `cancel()` 使用 Termination 扩展删除服务端上传资源。服务端不支持或请求失败时返回 `cancelled: false` 并发出 `error`，保留地址以便重试；`terminated: true` 才表示服务端确认删除。
- `abort()`、移除列表、清空与组件卸载只中止本地传输，保留服务器断点。创建请求中断且尚未收到 `Location` 时，客户端无法确认未知资源是否存在，服务端应配置过期清理。
- tus 成功响应为 `{ uploadUrl }`，不会把协议资源地址伪装为可下载地址。业务需要下载地址时应使用自己的文件查询接口。
- `chunkSize` 省略时沿用客户端默认；仅在代理或服务端请求体限制需要时设置有限大小。`method`、`name`、`data` 属于 multipart 模式，tus 创建元数据使用 `tus.metadata`。

## API

### Props

| 属性                | 类型                                                   | 默认值   |
| ------------------- | ------------------------------------------------------ | -------- |
| `transport`         | `'xhr' \| 'tus'`                                       | `'xhr'`  |
| `concurrency`       | `number`，文件并发数，支持 `Infinity`                  | `3`      |
| `tus`               | `UploadTusOptions`                                     | —        |
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

`UploadTusOptions` 支持 `chunkSize`、`retryDelays`、`metadata`、`resume`、`resumeKey`、`allowedOrigins`。重试间隔默认为 `[0, 1000, 3000, 5000]`，`resume` 默认为 `true`。额外来源必须显式加入 `allowedOrigins`；默认拒绝向端点以外来源发送上传请求和认证信息。自定义请求头不得覆盖 `Tus-*`、`Upload-*` 和内容长度/类型等协议头。

文件状态为 `ready`、`queued`、`uploading`、`paused`、`cancelling`、`success`、`error`。`UploadFile.tusUploadUrl` 是 tus 资源地址，`url` 继续只表示业务提供的文件地址。

### Events

| 事件                 | 参数                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `update:fileList`    | `(fileList: UploadFile[])`                                               |
| `added`              | `(file: UploadFile, fileList: UploadFile[])`                             |
| `rejected`           | `(rejection: UploadRejection, fileList: UploadFile[])`                   |
| `progress`           | `(file: UploadFile, fileList: UploadFile[])`                             |
| `success`            | `(response: unknown, file: UploadFile, fileList: UploadFile[])`          |
| `error`              | `(error: ExFileUploadError, file: UploadFile, fileList: UploadFile[])`   |
| `aborted`            | `(file: UploadFile, fileList: UploadFile[], reason: UploadAbortReason)`  |
| `paused`             | `(file: UploadFile, fileList: UploadFile[])`                             |
| `resumed`            | `(file: UploadFile, fileList: UploadFile[])`                             |
| `cancelled`          | `(result: UploadCancelResult, file: UploadFile, fileList: UploadFile[])` |
| `resume-unavailable` | `(error: unknown, file: UploadFile)`                                     |
| `remove-request`     | `(file: UploadFile)`                                                     |
| `preview-request`    | `(file: UploadFile)`                                                     |

`UploadRejection.code` 为 `accept`、`size`、`limit`、`multiple`、`before-add` 或 `before-add-error`。

`ExFileUploadError.code` 为 `configuration-error`、`request-error`、`http-error`、`timeout`、`response-error`、`unsupported` 或 `termination-error`。

### Slots

| 插槽        | 作用域                                                 |
| ----------- | ------------------------------------------------------ |
| `trigger`   | `{ disabled: boolean, openFileDialog: () => boolean }` |
| `drag-icon` | —                                                      |
| `tip`       | —                                                      |

### Exposed

| 方法             | 类型                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `openFileDialog` | `() => boolean`                                                  |
| `submit`         | `(file?: UploadFile \| string) => Promise<UploadResult[]>`       |
| `abort`          | `(file?: UploadFile \| string) => number`                        |
| `pause`          | `(file?: UploadFile \| string) => number`                        |
| `resume`         | `(file?: UploadFile \| string) => Promise<UploadResult[]>`       |
| `cancel`         | `(file?: UploadFile \| string) => Promise<UploadCancelResult[]>` |
| `requestClear`   | `() => number`                                                   |
| `getFiles`       | `() => UploadFile[]`                                             |
| `getElement`     | `() => HTMLDivElement \| null`                                   |

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
