# ImageCrop 图片裁剪

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const demoSource = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#0f4c81" />
        <stop offset="1" stop-color="#22a699" />
      </linearGradient>
    </defs>
    <rect width="960" height="640" fill="url(#background)" />
    <circle cx="480" cy="280" r="150" fill="#f7d060" />
    <path d="M0 560L260 330L430 490L620 300L960 570V640H0Z" fill="#173f5f" opacity=".78" />
  </svg>
`)}`

const latestResult = ref(null)
const handleCrop = result => {
  latestResult.value = result
}

const ratioResult = ref(null)
const circleResult = ref(null)
const handleRatioCrop = result => {
  if (ratioResult.value) URL.revokeObjectURL(ratioResult.value.url)
  ratioResult.value = { ...result, url: URL.createObjectURL(result.blob) }
}
const handleCircleCrop = result => {
  if (circleResult.value) URL.revokeObjectURL(circleResult.value.url)
  circleResult.value = { ...result, url: URL.createObjectURL(result.blob) }
}
onBeforeUnmount(() => {
  if (ratioResult.value) URL.revokeObjectURL(ratioResult.value.url)
  if (circleResult.value) URL.revokeObjectURL(circleResult.value.url)
})
</script>

## 基础用法

::: raw
<div class="crop-demo">
  <ex-image-crop :src="demoSource" @crop="handleCrop" />
  <output v-if="latestResult" class="crop-result">
    输出：{{ latestResult.outputSize.width }} × {{ latestResult.outputSize.height }}，
    {{ latestResult.blob.type }}，{{ latestResult.blob.size }} B
  </output>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { CropResult } from 'vue-ex-ui';

const demoSource = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#0f4c81" />
        <stop offset="1" stop-color="#22a699" />
      </linearGradient>
    </defs>
    <rect width="960" height="640" fill="url(#background)" />
    <circle cx="480" cy="280" r="150" fill="#f7d060" />
    <path d="M0 560L260 330L430 490L620 300L960 570V640H0Z" fill="#173f5f" opacity=".78" />
  </svg>
`)}`;

const latestResult = ref<CropResult | null>(null);
const handleCrop = (result: CropResult) => {
  latestResult.value = result;
};
</script>

<template>
  <div class="crop-demo">
    <ex-image-crop
      :src="demoSource"
      @crop="handleCrop"
    />
    <output
      v-if="latestResult"
      class="crop-result"
    >
      输出：{{ latestResult.outputSize.width }} × {{ latestResult.outputSize.height }}，
      {{ latestResult.blob.type }}，{{ latestResult.blob.size }} B
    </output>
  </div>
</template>
```

:::

## 固定比例

拖动选区或调整大小时保持 16:9。点击“确认裁剪”可查看实际输出及像素尺寸。

::: raw
<div class="crop-demo">
  <ex-image-crop :src="demoSource" :aspect-ratio="16 / 9" @crop="handleRatioCrop" />
  <template v-if="ratioResult">
    <img class="cropped-preview" :src="ratioResult.url" alt="16:9 裁剪结果" />
    <output class="crop-result" aria-live="polite">
      输出：{{ ratioResult.outputSize.width }} × {{ ratioResult.outputSize.height }}，{{ ratioResult.blob.size }} B
    </output>
  </template>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { CropResult } from 'vue-ex-ui';

const demoSource = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#0f4c81" />
        <stop offset="1" stop-color="#22a699" />
      </linearGradient>
    </defs>
    <rect width="960" height="640" fill="url(#background)" />
    <circle cx="480" cy="280" r="150" fill="#f7d060" />
    <path d="M0 560L260 330L430 490L620 300L960 570V640H0Z" fill="#173f5f" opacity=".78" />
  </svg>
`)}`;

const ratioResult = ref<(CropResult & { url: string }) | null>(null);
const handleRatioCrop = (result: CropResult) => {
  if (ratioResult.value) URL.revokeObjectURL(ratioResult.value.url);
  ratioResult.value = { ...result, url: URL.createObjectURL(result.blob) };
};
onBeforeUnmount(() => {
  if (ratioResult.value) URL.revokeObjectURL(ratioResult.value.url);
});
</script>

<template>
  <div class="crop-demo">
    <ex-image-crop
      :src="demoSource"
      :aspect-ratio="16 / 9"
      @crop="handleRatioCrop"
    />
    <template v-if="ratioResult">
      <img
        class="cropped-preview"
        :src="ratioResult.url"
        alt="16:9 裁剪结果"
      />
      <output
        class="crop-result"
        aria-live="polite"
      >
        输出：{{ ratioResult.outputSize.width }} × {{ ratioResult.outputSize.height }}，{{
          ratioResult.blob.size
        }}
        B
      </output>
    </template>
  </div>
</template>

<style scoped>
.crop-demo {
  display: grid;
  gap: 12px;
}
.cropped-preview {
  width: 100%;
  max-width: 320px;
  height: auto;
}
</style>
```

:::

## 圆形裁剪

圆形选区始终为 1:1，PNG 输出保留圆外透明区域。下方预览展示真实输出图片，连续裁剪会释放上一次的预览地址。

::: raw
<div class="crop-demo">
  <ex-image-crop :src="demoSource" shape="circle" output-type="image/png" @crop="handleCircleCrop" />
  <template v-if="circleResult">
    <img class="cropped-preview" :src="circleResult.url" alt="圆形 PNG 裁剪结果" />
    <output class="crop-result" aria-live="polite">
      输出：{{ circleResult.outputSize.width }} × {{ circleResult.outputSize.height }}，{{ circleResult.blob.type }}
    </output>
  </template>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { CropResult } from 'vue-ex-ui';

const demoSource = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#0f4c81" />
        <stop offset="1" stop-color="#22a699" />
      </linearGradient>
    </defs>
    <rect width="960" height="640" fill="url(#background)" />
    <circle cx="480" cy="280" r="150" fill="#f7d060" />
    <path d="M0 560L260 330L430 490L620 300L960 570V640H0Z" fill="#173f5f" opacity=".78" />
  </svg>
`)}`;

const circleResult = ref<(CropResult & { url: string }) | null>(null);
const handleCircleCrop = (result: CropResult) => {
  if (circleResult.value) URL.revokeObjectURL(circleResult.value.url);
  circleResult.value = { ...result, url: URL.createObjectURL(result.blob) };
};
onBeforeUnmount(() => {
  if (circleResult.value) URL.revokeObjectURL(circleResult.value.url);
});
</script>

<template>
  <div class="crop-demo">
    <ex-image-crop
      :src="demoSource"
      shape="circle"
      output-type="image/png"
      @crop="handleCircleCrop"
    />
    <template v-if="circleResult">
      <img
        class="cropped-preview"
        :src="circleResult.url"
        alt="圆形 PNG 裁剪结果"
      />
      <output
        class="crop-result"
        aria-live="polite"
      >
        输出：{{ circleResult.outputSize.width }} × {{ circleResult.outputSize.height }}，{{
          circleResult.blob.type
        }}
      </output>
    </template>
  </div>
</template>

<style scoped>
.crop-demo {
  display: grid;
  gap: 12px;
}
.cropped-preview {
  width: 100%;
  max-width: 320px;
  height: auto;
}
</style>
```

:::

## API

### Props

| 属性                    | 类型                                          | 默认值        |
| ----------------------- | --------------------------------------------- | ------------- |
| src                     | `string \| Blob`                              | —             |
| shape                   | `'rect' \| 'circle'`                          | `'rect'`      |
| aspect-ratio            | `number`                                      | —             |
| initial-area            | `CropArea`                                    | —             |
| min-width               | `number`                                      | `48`          |
| min-height              | `number`                                      | `48`          |
| max-width               | `number`                                      | —             |
| max-height              | `number`                                      | —             |
| quality                 | `number`                                      | `0.9`         |
| output-type             | `'image/png' \| 'image/jpeg' \| 'image/webp'` | `'image/png'` |
| output-background-color | `string`                                      | `'#ffffff'`   |
| show-grid               | `boolean`                                     | `true`        |
| grid-rows               | `number`                                      | `3`           |
| grid-cols               | `number`                                      | `3`           |
| zoomable                | `boolean`                                     | `true`        |
| rotatable               | `boolean`                                     | `true`        |
| zoom-step               | `number`                                      | `0.1`         |
| min-zoom                | `number`                                      | `0.5`         |
| max-zoom                | `number`                                      | `4`           |
| background-color        | `string`                                      | `'#111827'`   |
| show-toolbar            | `boolean`                                     | `true`        |
| toolbar-position        | `'top' \| 'bottom'`                           | `'bottom'`    |
| aria-label              | `string`                                      | 本地化文本    |

`quality` 仅传递给 JPEG 与 WebP 编码器。圆形裁剪固定为 1:1，并覆盖 `aspect-ratio`。

输入图片限制为 64 MiB、3200 万像素且单边不超过 32768 像素。预览与导出 Canvas 会在分配像素缓冲区前执行同一预算检查，超限时通过 `error` 返回 `INVALID_DIMENSION`。

### Events

| 事件   | 参数                             |
| ------ | -------------------------------- |
| change | `(area: CropArea)`               |
| crop   | `(result: CropResult)`           |
| cancel | `()`                             |
| load   | `(size: CropSize)`               |
| error  | `(error: ExImageCropError)`      |
| zoom   | `(scale: number)`                |
| rotate | `(angle: 0 \| 90 \| 180 \| 270)` |

### Expose

| 方法        | 类型                           |
| ----------- | ------------------------------ |
| crop        | `() => Promise<CropResult>`    |
| reset       | `() => void`                   |
| zoomIn      | `() => void`                   |
| zoomOut     | `() => void`                   |
| rotateLeft  | `() => void`                   |
| rotateRight | `() => void`                   |
| setArea     | `(area: CropArea) => void`     |
| getArea     | `() => CropArea`               |
| getElement  | `() => HTMLDivElement \| null` |

### Types

```ts
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropResult {
  blob: Blob;
  previewArea: CropArea;
  sourceArea: CropArea;
  originalSize: { width: number; height: number };
  outputSize: { width: number; height: number };
  outputType: 'image/png' | 'image/jpeg' | 'image/webp';
  rotation: 0 | 90 | 180 | 270;
  zoom: number;
}
```

### Error codes

`INVALID_SOURCE`、`SOURCE_FETCH_FAILED`、`LOAD_FAILED`、`INVALID_DIMENSION`、`INVALID_CONFIGURATION`、`NOT_READY`、`INVALID_AREA`、`CANVAS_UNAVAILABLE`、`ENCODE_FAILED`、`UNSUPPORTED_OUTPUT`、`ABORTED`、`DOM_UNAVAILABLE`。

<style scoped>
.crop-demo {
  display: grid;
  gap: 12px;
}

.crop-result {
  color: var(--ex-color-text-secondary);
  font-size: 14px;
}

.cropped-preview {
  width: 100%;
  max-width: 320px;
  height: auto;
}
</style>
