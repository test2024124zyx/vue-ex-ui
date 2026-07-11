# FilePreview 文件预览

`ExFilePreview` 可预览图片、视频、音频、PDF、文本和代码文件。组件接受 URL 描述、`Blob` 或 `File`，并提供受控导航与图片变换状态。

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const currentIndex = ref(0)
const scale = ref(1)
const rotate = ref(0)
const files = [
  {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    name: 'arena.jpg',
    type: 'image',
  },
  {
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    name: 'console.jpg',
    type: 'image',
  },
]

const handleDownloadRequest = file => {
  console.log('download request', file)
}
</script>

## 基础用法

<div class="demo-container">
  <ExButton @click="visible = true">打开预览</ExButton>
  <ExFilePreview
    v-model:visible="visible"
    v-model:current-index="currentIndex"
    v-model:scale="scale"
    v-model:rotate="rotate"
    :files="files"
    @download-request="handleDownloadRequest"
  />
</div>

```vue
<template>
  <ExButton @click="visible = true">打开预览</ExButton>
  <ExFilePreview
    v-model:visible="visible"
    v-model:current-index="currentIndex"
    v-model:scale="scale"
    v-model:rotate="rotate"
    :files="files"
    @download-request="handleDownloadRequest"
    @error="handlePreviewError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PreviewFile } from 'vue-ex-ui';

const visible = ref(false);
const currentIndex = ref(0);
const scale = ref(1);
const rotate = ref(0);
const files: PreviewFile[] = [
  { url: '/files/photo-a.webp', name: 'photo-a.webp' },
  { url: '/files/photo-b.webp', name: 'photo-b.webp' },
];

const handleDownloadRequest = (file: PreviewFile) => {
  console.log('交给业务下载服务处理', file);
};

const handlePreviewError = (error: Error) => {
  console.error(error);
};
</script>
```

`visible`、`currentIndex`、`scale` 和 `rotate` 传入后均为受控状态。用户操作只发出对应更新事件，父级同步前，组件不会提前改变可见状态。只需要内部状态时，可使用 `default-current-index`、`default-scale` 和 `default-rotate`。

## Blob 与 File

```vue
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const selectedFile = ref<File>();

const handleChange = (event: Event) => {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0];
  visible.value = Boolean(selectedFile.value);
};
</script>

<template>
  <input
    type="file"
    @change="handleChange"
  />
  <ExFilePreview
    v-model:visible="visible"
    :file="selectedFile"
  />
</template>
```

组件会为 `Blob`/`File` 创建对象地址，并在来源替换或组件卸载时释放。文件的 `type` 会作为 MIME 类型参与预览类型识别。

## 文本与代码

文本和代码通过 `fetch` 读取，并受 `max-text-bytes` 限制。非 2xx 响应、读取失败或内容超限都会触发结构化 `error` 事件；切换文件会中止旧请求。

```vue
<ExFilePreview
  v-model:visible="visible"
  :file="{ url: '/logs/latest.log', name: 'latest.log', type: 'text' }"
  :max-text-bytes="512 * 1024"
/>
```

代码预览提供逐行行号，不声明语法高亮能力。需要语法高亮时，请使用 `ExCode` 组件。

## 下载请求

内置下载按钮只触发 `download-request`。鉴权、文件名、错误提示和下载结果均由业务下载服务处理。

```vue
<ExFilePreview v-model:visible="visible" :file="file" @download-request="downloadService.request" />
```

## 键盘操作

| 按键      | 条件与行为                        |
| --------- | --------------------------------- |
| `Escape`  | `close-on-escape` 开启时请求关闭  |
| `←` / `→` | 焦点位于预览层时请求切换文件      |
| `+` / `=` | 图片可缩放且未到上限时请求放大    |
| `-`       | 图片可缩放且未到下限时请求缩小    |
| `0`       | 图片可缩放时请求重置到有效的 100% |

媒体控件、表单控件和可编辑内容不会被图片快捷键接管。多个浮层同时存在时，`Escape` 只作用于最上层浮层。

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
  margin: 16px 0;
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
