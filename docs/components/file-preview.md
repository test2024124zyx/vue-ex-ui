# FilePreview 文件预览

`ExFilePreview` 可预览图片、视频、音频、PDF、文本和代码文件。组件接受 URL 描述、`Blob` 或 `File`，并提供受控导航与图片变换状态。

<script setup>
import { nextTick, ref, shallowRef } from 'vue'

const visible = ref(false)
const currentIndex = ref(0)
const scale = ref(1)
const rotate = ref(0)
const files = ['#0f4c81', '#287c6f'].map((color, index) => ({
  url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="${color}"/><circle cx="320" cy="180" r="100" fill="#f7d060"/><text x="320" y="340" text-anchor="middle" fill="white" font-size="32">Preview ${index + 1}</text></svg>`)}`,
  name: `preview-${index + 1}.svg`,
  type: 'image',
}))

const blobVisible = ref(false)
const selectedFile = shallowRef()
const openBlobPreview = () => {
  selectedFile.value = new Blob(['这是在浏览器中创建的 Blob。\n替换为本地文件时，组件会释放旧的对象地址。'], { type: 'text/plain' })
  blobVisible.value = true
}
const handleFileChange = event => {
  const file = event.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  blobVisible.value = true
  event.target.value = ''
}

const textVisible = ref(false)
const textIndex = ref(0)
const textFiles = shallowRef([])
const maxTextBytes = 512 * 1024
const openTextPreview = () => {
  textFiles.value = [
    new File(['文件预览演示\n\n这是一份在浏览器内生成的文本。\n使用左右按钮切换到 TypeScript 代码。'], 'readme.txt', { type: 'text/plain' }),
    new File(['interface User {\n  name: string;\n}\n\nconst greet = (user: User) => `你好，${user.name}`;\n'], 'greeting.ts', { type: 'text/typescript' }),
  ]
  textIndex.value = 0
  textVisible.value = true
}

const downloadVisible = ref(false)
const downloadSource = shallowRef()
const downloadFile = shallowRef()
const downloadRef = ref()
const downloadStatus = ref('打开预览后，点击工具栏下载按钮。')
const openDownloadPreview = () => {
  downloadSource.value = new File(['这是可下载的本地演示文件。\n文件在浏览器内创建，无需外部下载服务。'], 'preview-download.txt', { type: 'text/plain' })
  downloadVisible.value = true
}
const handleDownloadRequest = async file => {
  downloadFile.value = file
  await nextTick()
  const result = await downloadRef.value.download()
  downloadStatus.value = result.outcome === 'triggered'
    ? `已将 ${file.name} 的下载交给浏览器，请查看浏览器下载记录。`
    : result.outcome === 'error'
      ? `下载失败：${result.error.message}`
      : `下载状态：${result.outcome}`
}
</script>

## 基础用法

::: raw
<div class="demo-container">
  <ex-button @click="visible = true">打开预览</ex-button>
  <ex-file-preview
    v-model:visible="visible"
    v-model:current-index="currentIndex"
    v-model:scale="scale"
    v-model:rotate="rotate"
    :files="files"
    :show-download="false"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { PreviewFile } from 'vue-ex-ui';

const visible = ref(false);
const currentIndex = ref(0);
const scale = ref(1);
const rotate = ref(0);
const files: PreviewFile[] = ['#0f4c81', '#287c6f'].map((color, index) => ({
  url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="${color}"/><circle cx="320" cy="180" r="100" fill="#f7d060"/><text x="320" y="340" text-anchor="middle" fill="white" font-size="32">Preview ${index + 1}</text></svg>`)}`,
  name: `preview-${index + 1}.svg`,
  type: 'image',
}));
</script>

<template>
  <div class="demo-container">
    <ex-button @click="visible = true">打开预览</ex-button>
    <ex-file-preview
      v-model:visible="visible"
      v-model:current-index="currentIndex"
      v-model:scale="scale"
      v-model:rotate="rotate"
      :files="files"
      :show-download="false"
    />
  </div>
</template>
```

:::

`visible`、`currentIndex`、`scale` 和 `rotate` 传入后均为受控状态。用户操作只发出对应更新事件，父级同步前，组件不会提前改变可见状态。只需要内部状态时，可使用 `default-current-index`、`default-scale` 和 `default-rotate`。

## Blob 与 File

直接预览浏览器生成的 `Blob`，或选择自己的本地文件。文件仅在当前浏览器读取。

::: raw
<div class="demo-container">
  <ex-button @click="openBlobPreview">预览 Blob 文本</ex-button>
  <label class="file-input-label">
    选择本地文件
    <input type="file" accept="image/*,video/*,audio/*,application/pdf,text/*,.json,.ts,.js" @change="handleFileChange" />
  </label>
  <ex-file-preview v-model:visible="blobVisible" :file="selectedFile" :show-download="false" />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';

const blobVisible = ref(false);
const selectedFile = shallowRef<Blob>();

const openBlobPreview = () => {
  selectedFile.value = new Blob(
    ['这是在浏览器中创建的 Blob。\n替换为本地文件时，组件会释放旧的对象地址。'],
    { type: 'text/plain' }
  );
  blobVisible.value = true;
};
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  blobVisible.value = true;
  input.value = '';
};
</script>

<template>
  <ex-button @click="openBlobPreview">预览 Blob 文本</ex-button>
  <label class="file-input-label">
    选择本地文件
    <input
      type="file"
      accept="image/*,video/*,audio/*,application/pdf,text/*,.json,.ts,.js"
      @change="handleFileChange"
    />
  </label>
  <ex-file-preview
    v-model:visible="blobVisible"
    :file="selectedFile"
    :show-download="false"
  />
</template>
```

:::

组件会为 `Blob`/`File` 创建对象地址，并在来源替换或组件卸载时释放。文件的 `type` 会作为 MIME 类型参与预览类型识别。

## 文本与代码

文本和代码通过 `fetch` 读取，并受 `max-text-bytes` 限制。非 2xx 响应、读取失败或内容超限都会触发结构化 `error` 事件；切换文件会中止旧请求。

::: raw
<div class="demo-container">
  <ex-button @click="openTextPreview">预览文本与代码</ex-button>
  <ex-file-preview
    v-model:visible="textVisible"
    v-model:current-index="textIndex"
    :files="textFiles"
    :max-text-bytes="maxTextBytes"
    :show-download="false"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';

const textVisible = ref(false);
const textIndex = ref(0);
const textFiles = shallowRef<File[]>([]);
const maxTextBytes = 512 * 1024;
const openTextPreview = () => {
  textFiles.value = [
    new File(
      ['文件预览演示\n\n这是一份在浏览器内生成的文本。\n使用左右按钮切换到 TypeScript 代码。'],
      'readme.txt',
      { type: 'text/plain' }
    ),
    new File(
      [
        'interface User {\n  name: string;\n}\n\nconst greet = (user: User) => `你好，${user.name}`;\n',
      ],
      'greeting.ts',
      { type: 'text/typescript' }
    ),
  ];
  textIndex.value = 0;
  textVisible.value = true;
};
</script>

<template>
  <ex-button @click="openTextPreview">预览文本与代码</ex-button>
  <ex-file-preview
    v-model:visible="textVisible"
    v-model:current-index="textIndex"
    :files="textFiles"
    :max-text-bytes="maxTextBytes"
    :show-download="false"
  />
</template>
```

:::

代码预览提供逐行行号，不声明语法高亮能力。需要语法高亮时，请使用 `ExCode` 组件。

## 下载请求

内置下载按钮只触发 `download-request`。鉴权、文件名、错误提示和下载结果均由业务下载服务处理。

下面把请求接入 `ExFileDownload`。文本文件在浏览器中生成，点击预览工具栏的下载按钮后会创建真实下载，并在页面显示交接结果。

::: raw
<div class="demo-container">
  <ex-button @click="openDownloadPreview">打开可下载预览</ex-button>
  <ex-file-preview
    v-model:visible="downloadVisible"
    :file="downloadSource"
    @download-request="handleDownloadRequest"
  />
  <ex-file-download
    v-show="false"
    ref="downloadRef"
    :url="downloadFile?.url || ''"
    :filename="downloadFile?.name"
    transport="link"
  />
  <output aria-live="polite">{{ downloadStatus }}</output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { nextTick, ref, shallowRef } from 'vue';
import type { ExFileDownloadExposed, PreviewFile } from 'vue-ex-ui';

const downloadVisible = ref(false);
const downloadSource = shallowRef<File>();
const downloadFile = shallowRef<PreviewFile>();
const downloadRef = ref<ExFileDownloadExposed>();
const downloadStatus = ref('打开预览后，点击工具栏下载按钮。');
const openDownloadPreview = () => {
  downloadSource.value = new File(
    ['这是可下载的本地演示文件。\n文件在浏览器内创建，无需外部下载服务。'],
    'preview-download.txt',
    { type: 'text/plain' }
  );
  downloadVisible.value = true;
};
const handleDownloadRequest = async (file: PreviewFile) => {
  downloadFile.value = file;
  await nextTick();
  const result = await downloadRef.value!.download();
  downloadStatus.value =
    result.outcome === 'triggered'
      ? `已将 ${file.name} 的下载交给浏览器，请查看浏览器下载记录。`
      : result.outcome === 'error'
        ? `下载失败：${result.error.message}`
        : `下载状态：${result.outcome}`;
};
</script>

<template>
  <ex-button @click="openDownloadPreview">打开可下载预览</ex-button>
  <ex-file-preview
    v-model:visible="downloadVisible"
    :file="downloadSource"
    @download-request="handleDownloadRequest"
  />
  <ex-file-download
    v-show="false"
    ref="downloadRef"
    :url="downloadFile?.url || ''"
    :filename="downloadFile?.name"
    transport="link"
  />
  <output aria-live="polite">{{ downloadStatus }}</output>
</template>
```

:::

`triggered` 表示浏览器已经接管链接，不表示文件已保存成功。`Blob` 对象地址由预览组件持有，在更换来源或卸载时释放。

## 键盘操作

| 按键      | 条件与行为                        |
| --------- | --------------------------------- |
| `Escape`  | `close-on-escape` 开启时请求关闭  |
| `←` / `→` | 焦点位于预览层时请求切换文件      |
| `+` / `=` | 图片可缩放且未到上限时请求放大    |
| `-`       | 图片可缩放且未到下限时请求缩小    |
| `0`       | 图片可缩放时请求重置到有效的 100% |

媒体控件、表单控件和可编辑内容不会被图片快捷键接管。多个浮层同时存在时，`Escape` 只作用于最上层浮层。

`show-close` 独立于 `show-toolbar`：隐藏工具栏后仍可保留关闭按钮。远程文本必须提供可流式读取的响应体，组件会在读取过程中执行 `max-text-bytes` 上限；无法流式读取时会拒绝加载，避免先把未知大小内容完整缓冲到内存。

## API

### Props

| 属性                          | 类型              | 默认值               |
| ----------------------------- | ----------------- | -------------------- |
| `visible` / `v-model:visible` | `boolean`         | `false`              |
| `file`                        | `PreviewSource`   | —                    |
| `files`                       | `PreviewSource[]` | —                    |
| `current-index`               | `number`          | —                    |
| `default-current-index`       | `number`          | `0`                  |
| `type`                        | `PreviewType`     | 自动识别             |
| `show-toolbar`                | `boolean`         | `true`               |
| `show-download`               | `boolean`         | `true`               |
| `show-close`                  | `boolean`         | `true`               |
| `scale` / `v-model:scale`     | `number`          | —                    |
| `default-scale`               | `number`          | `1`                  |
| `rotate` / `v-model:rotate`   | `number`          | —                    |
| `default-rotate`              | `number`          | `0`                  |
| `zoomable`                    | `boolean`         | `true`               |
| `rotatable`                   | `boolean`         | `true`               |
| `min-scale`                   | `number`          | `0.1`                |
| `max-scale`                   | `number`          | `5`                  |
| `scale-step`                  | `number`          | `0.1`                |
| `rotate-step`                 | `number`          | `90`                 |
| `max-text-bytes`              | `number`          | `1048576`            |
| `mask-background`             | `string`          | `rgba(0, 0, 0, 0.9)` |
| `mask-closable`               | `boolean`         | `true`               |
| `close-on-escape`             | `boolean`         | `true`               |
| `lock-scroll`                 | `boolean`         | `true`               |
| `show-line-numbers`           | `boolean`         | `true`               |
| `z-index`                     | `number`          | 全局层级 + 50        |
| `aria-label`                  | `string`          | 当前文件名或“预览”   |

`files` 非空时优先于 `file`。文件自身的 `type` 优先于组件级 `type`；之后依次按 MIME 类型和扩展名识别。没有 MIME 信息时，含义不明确的 `.ogg` 不会被猜测为音频或视频。

### Events

| 事件                  | 参数                                                            |
| --------------------- | --------------------------------------------------------------- |
| `update:visible`      | `(visible: boolean)`                                            |
| `close-request`       | `()`                                                            |
| `download-request`    | `(file: PreviewFile)`                                           |
| `update:currentIndex` | `(index: number)`                                               |
| `navigation-request`  | `(index: number, file: PreviewFile)`                            |
| `update:scale`        | `(scale: number)`                                               |
| `update:rotate`       | `(rotate: number)`                                              |
| `ready`               | `(file: PreviewFile, index: number)`                            |
| `error`               | `(error: ExFilePreviewError, file: PreviewFile, index: number)` |

`ExFilePreviewError.code` 为 `invalid-source`、`http-error`、`text-too-large` 或 `load-failed`。HTTP 错误还提供 `status`。

### Slots

| 插槽      | 作用域参数                             |
| --------- | -------------------------------------- |
| `toolbar` | `{ file: PreviewFile, index: number }` |
| `footer`  | `{ file: PreviewFile, index: number }` |

### Exposed

| 方法                            | 类型                           |
| ------------------------------- | ------------------------------ |
| `requestPrevious`               | `() => void`                   |
| `requestNext`                   | `() => void`                   |
| `requestZoomIn`                 | `() => void`                   |
| `requestZoomOut`                | `() => void`                   |
| `requestResetZoom`              | `() => void`                   |
| `requestRotateClockwise`        | `() => void`                   |
| `requestRotateCounterclockwise` | `() => void`                   |
| `requestResetRotation`          | `() => void`                   |
| `requestDownload`               | `() => void`                   |
| `requestClose`                  | `() => void`                   |
| `getElement`                    | `() => HTMLDivElement \| null` |

这些方法与界面操作使用同一请求语义。受控属性只有在父级同步后才会真正生效。

## 地址限制

组件接受相对地址、HTTP(S)、Blob，以及与当前预览类型匹配的安全 data 地址。`javascript:`、`file:`、控制字符地址和类型不匹配的 data 地址会被拒绝并触发 `invalid-source`。PDF 使用受限 iframe；目标服务仍需允许被嵌入。

<style scoped>
.demo-container {
  display: grid;
  gap: 16px;
  margin: 16px 0;
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.file-input-label {
  display: grid;
  gap: 8px;
}
</style>
