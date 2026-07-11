# FileUpload 文件上传

`ExFileUpload` 提供文件选择、拖拽校验、列表状态和可中止的 XHR multipart 上传。上传结果会区分成功、失败、中止和未启动。

<script setup>
import { ref } from 'vue'

const files = ref([])
const uploadRef = ref()

const submit = async () => {
  const results = await uploadRef.value?.submit()
  console.log(results)
}
</script>

## 选择文件

<div class="demo-container">
  <ExFileUpload
    v-model:file-list="files"
    :auto-upload="false"
    accept="image/*,.pdf"
    :max-file-size="5 * 1024 * 1024"
  />
</div>

```vue
<template>
  <ExFileUpload
    v-model:file-list="files"
    :auto-upload="false"
    accept="image/*,.pdf"
    :max-file-size="5 * 1024 * 1024"
    @rejected="handleRejected"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFile, UploadRejection } from 'vue-ex-ui';

const files = ref<UploadFile[]>([]);

const handleRejected = (rejection: UploadRejection) => {
  console.warn(rejection.code, rejection.file.name);
};
</script>
```

传入 `file-list` 后列表为受控状态。组件只发出新快照，父级同步 `update:fileList` 前不会提前改变界面；不需要受控时使用 `default-file-list`。

## 自动上传

```vue
<ExFileUpload
  v-model:file-list="files"
  action="/api/files"
  method="POST"
  :headers="{ Authorization: token }"
  :data="{ folderId }"
  :timeout="30_000"
  @progress="handleProgress"
  @success="handleSuccess"
  @error="handleError"
/>
```

只有 HTTP 2xx 响应会触发 `success`。HTTP 状态错误、网络错误、超时、配置错误和响应解析错误都会产生 `ExFileUploadError`。

## 手动上传与结果

```vue
<template>
  <ExFileUpload
    ref="uploadRef"
    v-model:file-list="files"
    action="/api/files"
    :auto-upload="false"
    multiple
  />
  <ExButton @click="submit">开始上传</ExButton>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ExFileUploadExposed, UploadFile } from 'vue-ex-ui';

const uploadRef = ref<ExFileUploadExposed>();
const files = ref<UploadFile[]>([]);

const submit = async () => {
  const results = await uploadRef.value?.submit();
  for (const result of results ?? []) {
    if (result.outcome === 'error') console.error(result.error);
  }
};
</script>
```

没有 `action`、缺少原始 `File` 或文件不是 `ready` 状态时，`submit()` 返回 `ignored`，不会伪装为已上传。

## 动态上传配置与中止

`action`、`headers` 和 `data` 都可按文件异步解析。解析器会收到与 XHR 共用的 `AbortSignal`。

```vue
<ExFileUpload v-model:file-list="files" :action="resolveAction" :headers="resolveHeaders" />
```

```ts
const resolveAction = async (file, { signal }) => {
  const response = await fetch(`/api/upload-ticket?name=${encodeURIComponent(file.name)}`, {
    signal,
  });
  return (await response.json()).uploadUrl;
};

const resolveHeaders = async (_file, { signal }) => {
  const token = await getUploadToken({ signal });
  return { Authorization: `Bearer ${token}` };
};
```

调用 `abort(fileOrUid)` 可在动态配置解析或 XHR 传输阶段中止任务，并返回真实中止数量。中止后的文件恢复为 `ready`，可以再次提交。

## 拖拽和图片列表

```vue
<ExFileUpload
  v-model:file-list="files"
  drag
  multiple
  list-type="picture-card"
  accept="image/*"
  :limit="8"
  @preview-request="handlePreviewRequest"
  @remove-request="handleRemoveRequest"
/>
```

本地图片缩略图使用对象地址；文件移除、来源替换或组件卸载时会自动释放，不会把 base64 内容写入公开列表。

## 加入前转换

`before-add` 在文件加入列表前运行。返回 `false` 会产生 `before-add` 拒绝；返回新 `File` 后，组件会对替换文件重新执行 `accept` 和大小校验；异常会保留在 `before-add-error.cause`。

```vue
<ExFileUpload v-model:file-list="files" :before-add="compressImage" accept="image/*" />
```

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
  margin: 16px 0;
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
