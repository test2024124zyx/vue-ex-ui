# ImageCompress 图片压缩

<script setup>
import { ref } from 'vue'

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">',
  '<defs><linearGradient id="g"><stop stop-color="#1677ff"/><stop offset="1" stop-color="#ff4d8d"/></linearGradient></defs>',
  '<rect width="800" height="450" fill="url(#g)"/>',
  '<circle cx="400" cy="225" r="120" fill="none" stroke="white" stroke-width="24"/>',
  '</svg>',
].join('')
const demoSource = ref('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
const lastResult = ref(null)

const handleFile = event => {
  const file = event.target.files?.[0]
  if (file) demoSource.value = file
}
</script>

## 基础用法

<div class="demo-container">
  <label class="file-picker">
    <span>选择图片</span>
    <input type="file" accept="image/*" @change="handleFile" />
  </label>
  <ExImageCompress
    :src="demoSource"
    mode="quality"
    :quality="0.8"
    @compress="lastResult = $event"
  />
</div>

```vue
<template>
  <ExImageCompress
    :src="file"
    mode="quality"
    :quality="0.8"
    output-type="image/jpeg"
    @compress="handleCompress"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExImageCompress, type CompressResult, type ExImageCompressExposed } from 'vue-ex-ui';

const file = ref<File>();
const compressor = ref<ExImageCompressExposed>();

const handleCompress = (result: CompressResult) => {
  compressor.value?.download('compressed.jpg');
};

const handleError = (error: Error) => {
  // 在业务层展示错误。
};
</script>
```

## 模式

<div class="demo-grid">
  <ExImageCompress
    :src="demoSource"
    mode="size"
    :target-size="20"
    output-type="image/webp"
  />
  <ExImageCompress
    :src="demoSource"
    mode="dimension"
    :max-width="400"
    :max-height="225"
    output-type="image/png"
  />
</div>

```vue
<ExImageCompress :src="file" mode="size" :target-size="500" output-type="image/webp" />

<ExImageCompress
  :src="file"
  mode="dimension"
  :max-width="1920"
  :max-height="1080"
  :keep-aspect-ratio="true"
/>
```

## Props

| 参数              | 类型                                  | 默认值     |
| ----------------- | ------------------------------------- | ---------- |
| src               | string \| Blob                        | 必填       |
| mode              | quality \| size \| dimension          | quality    |
| quality           | number（0.01–1）                      | 0.8        |
| target-size       | number（KB）                          | 500        |
| max-width         | number                                | 1920       |
| max-height        | number                                | 1080       |
| output-type       | image/jpeg \| image/png \| image/webp | image/jpeg |
| keep-aspect-ratio | boolean                               | true       |
| background-color  | string                                | #ffffff    |
| auto-compress     | boolean                               | false      |
| show-preview      | boolean                               | true       |
| show-comparison   | boolean                               | true       |

PNG 为无损格式，不提供质量模式；目标大小模式会在必要时缩小尺寸，若 1×1 像素仍无法达到目标则拒绝 Promise。

## Events

| 事件     | 参数                            |
| -------- | ------------------------------- |
| load     | (info: ImageCompressSourceInfo) |
| start    | ()                              |
| compress | (result: CompressResult)        |
| error    | (error: Error)                  |

## Exposes

| 方法       | 类型                                |
| ---------- | ----------------------------------- |
| compress   | () => Promise&lt;CompressResult&gt; |
| download   | (filename?: string) => void         |
| getResult  | () => CompressResult \| null        |
| reset      | () => void                          |
| getElement | () => HTMLDivElement \| null        |

## 工具函数

```ts
import { compressImage, compressImages, downloadCompressedImage, formatBytes } from 'vue-ex-ui';

const result = await compressImage(file, {
  mode: 'size',
  targetSize: 500,
  outputType: 'image/webp',
});

console.log(formatBytes(result.compressedSize));
downloadCompressedImage(result.blob, 'compressed.webp');

const results = await compressImages([fileA, fileB], {
  mode: 'dimension',
  maxWidth: 1920,
  maxHeight: 1080,
});
```

### CompressOptions

```ts
interface CompressOptions {
  mode?: 'quality' | 'size' | 'dimension';
  quality?: number;
  targetSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  keepAspectRatio?: boolean;
  backgroundColor?: string;
  signal?: AbortSignal;
}
```

### CompressResult

```ts
interface CompressResult {
  blob: Blob;
  originalSize: number;
  originalType: string;
  compressedSize: number;
  compressionRatio: number;
  originalDimension: { width: number; height: number };
  compressedDimension: { width: number; height: number };
  outputType: 'image/png' | 'image/jpeg' | 'image/webp';
  qualityUsed: number | null;
  mode: 'quality' | 'size' | 'dimension';
}
```

<style scoped>
.demo-container,
.demo-grid {
  display: grid;
  gap: 16px;
  margin: 16px 0;
}

.file-picker {
  display: inline-flex;
  width: fit-content;
  min-height: 40px;
  align-items: center;
  padding: 0 16px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-md);
  color: var(--ex-color-text-primary);
  cursor: pointer;
}

.file-picker input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (min-width: 1200px) {
  .demo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
