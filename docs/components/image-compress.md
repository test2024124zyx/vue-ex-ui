# ImageCompress 图片压缩

智能图片压缩，支持质量、大小、尺寸三种压缩模式。

<script setup>
import { ref } from 'vue'

const handleCompress = (result) => {
  console.log('压缩结果:', result)
  console.log('压缩率:', result.compressionRatio + '%')
  console.log('原始大小:', result.originalSize)
  console.log('压缩后大小:', result.compressedSize)
}
</script>

## 基础用法

基础的图片压缩功能。

<div class="demo-container">
  <ExImageCompress
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    mode="quality"
    :quality="0.8"
    :show-preview="true"
    @compress="handleCompress"
  />
</div>

```vue
<template>
  <ExImageCompress
    src="https://example.com/large-image.jpg"
    mode="quality"
    :quality="0.8"
    :show-preview="true"
    @compress="handleCompress"
  />
</template>

<script setup>
const handleCompress = (result) => {
  console.log('压缩结果:', result)
  console.log('压缩率:', result.compressionRatio + '%')
}
</script>
```

## 质量压缩

通过调整图片质量来压缩文件大小。

<div class="demo-container">
  <ExImageCompress
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    mode="quality"
    :quality="0.7"
    :show-preview="true"
    :show-comparison="true"
    @compress="handleCompress"
  />
</div>

```vue
<template>
  <ExImageCompress
    src="https://example.com/image.jpg"
    mode="quality"
    :quality="0.8"
    @compress="handleCompress"
  />
</template>
```

## 大小压缩

压缩到指定的文件大小。使用 NumberInput 组件提供更好的数值输入体验，支持键盘上下箭头调整、最小值/最大值限制。

<div class="demo-container">
  <ExImageCompress
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    mode="size"
    :target-size="500"
    :show-preview="true"
    :show-comparison="true"
    @compress="handleCompress"
  />
</div>

```vue
<template>
  <ExImageCompress
    src="https://example.com/large-image.jpg"
    mode="size"
    :target-size="500"
    @compress="handleCompress"
  />
</template>
```

::: tip 数值输入优化
组件内部使用 `ExNumberInput` 组件，提供以下优势：
- ✅ 自动限制最小值/最大值范围
- ✅ 支持键盘上下箭头快速调整
- ✅ 增加/减少按钮便于精确控制
- ✅ 步长设置（目标大小步长 10KB，尺寸步长 10px）
:::

## 尺寸压缩

通过缩小图片尺寸来压缩文件大小。

<div class="demo-container">
  <ExImageCompress
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=2400"
    mode="dimension"
    :max-width="1920"
    :max-height="1080"
    :show-preview="true"
    :show-comparison="true"
    @compress="handleCompress"
  />
</div>

```vue
<template>
  <ExImageCompress
    src="https://example.com/huge-image.jpg"
    mode="dimension"
    :max-width="1920"
    :max-height="1080"
    @compress="handleCompress"
  />
</template>
```

## 对比预览

显示压缩前后的对比效果。

<div class="demo-container">
  <ExImageCompress
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    mode="quality"
    :quality="0.7"
    :show-preview="true"
    :show-comparison="true"
    @compress="handleCompress"
  />
</div>

```vue
<template>
  <ExImageCompress
    src="https://example.com/image.jpg"
    mode="quality"
    :quality="0.7"
    :show-preview="true"
    :show-comparison="true"
    @compress="handleCompress"
  />
</template>
```

## 输出格式

支持多种输出格式：JPEG、PNG、WebP。

<div class="demo-container">
  <ExSpace direction="vertical" :size="16">
    <div>
      <div style="color: var(--ex-color-text-secondary); font-size: 14px; margin-bottom: 8px;">
        输出为 JPEG（文件小，有损压缩）
      </div>
      <ExImageCompress
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
        mode="quality"
        :quality="0.8"
        output-type="image/jpeg"
        :show-preview="true"
        @compress="handleCompress"
      />
    </div>
  </ExSpace>
</div>

```vue
<template>
  <div>
    <ExImageCompress
      src="https://example.com/image.jpg"
      output-type="image/jpeg"
      @compress="handleCompress"
    />
    
    <ExImageCompress
      src="https://example.com/image.png"
      output-type="image/png"
      @compress="handleCompress"
    />
    
    <ExImageCompress
      src="https://example.com/image.jpg"
      output-type="image/webp"
      @compress="handleCompress"
    />
  </div>
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片源 | string \| File | - |
| mode | 压缩模式 | 'quality' \| 'size' \| 'dimension' | 'quality' |
| quality | 压缩质量 (0-1) | number | 0.8 |
| target-size | 目标大小(KB) | number | 500 |
| max-width | 最大宽度 | number | 1920 |
| max-height | 最大高度 | number | 1080 |
| output-type | 输出格式 | 'image/png' \| 'image/jpeg' \| 'image/webp' | 'image/jpeg' |
| show-preview | 是否显示预览 | boolean | true |
| show-comparison | 是否显示对比 | boolean | true |
| auto-compress | 是否自动压缩 | boolean | false |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| compress | 压缩完成时触发 | (result: CompressResult) => void |
| progress | 压缩进度更新时触发 | (percent: number) => void |
| error | 压缩失败时触发 | (error: Error) => void |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| compress | 执行压缩 | () => Promise\<CompressResult\> |
| reset | 重置 | () => void |
| download | 下载压缩后的图片 | (filename?: string) => void |

## 工具函数

对于不需要 UI 界面的场景，可以直接使用工具函数进行后台压缩。

### compressImage

压缩单张图片。

```typescript
import { compressImage } from 'exui'

// 压缩图片
const result = await compressImage(file, {
  mode: 'quality',
  quality: 0.8,
  outputType: 'image/jpeg'
})

console.log('压缩完成:', result)
```

### compressImages

批量压缩多张图片。

```typescript
import { compressImages } from 'exui'

// 批量压缩
const results = await compressImages([file1, file2, file3], {
  mode: 'size',
  targetSize: 500, // 500KB
  outputType: 'image/jpeg'
})

results.forEach((result, index) => {
  console.log(`图片 ${index + 1} 压缩完成:`, result)
})
```

### formatBytes

格式化字节大小为可读字符串。

```typescript
import { formatBytes } from 'exui'

console.log(formatBytes(1024)) // "1.00 KB"
console.log(formatBytes(1048576)) // "1.00 MB"
```

### downloadCompressedImage

下载压缩后的图片。

```typescript
import { downloadCompressedImage } from 'exui'

// 下载图片
downloadCompressedImage(blob, 'my-image.jpg', 'image/jpeg')
```

### 工具函数选项

```typescript
interface CompressOptions {
  mode?: 'quality' | 'size' | 'dimension'
  quality?: number // 0-1
  targetSize?: number // KB
  maxWidth?: number
  maxHeight?: number
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp'
  keepAspectRatio?: boolean
}
```

### 完整示例

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" accept="image/*" />
    <div v-if="compressing">压缩中...</div>
    <div v-if="result">
      <p>原始大小: {{ formatBytes(result.originalSize) }}</p>
      <p>压缩后大小: {{ formatBytes(result.compressedSize) }}</p>
      <p>压缩率: {{ result.compressionRatio }}%</p>
      <button @click="download">下载</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { compressImage, formatBytes, downloadCompressedImage } from 'exui'

const compressing = ref(false)
const result = ref(null)

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  compressing.value = true
  try {
    result.value = await compressImage(file, {
      mode: 'quality',
      quality: 0.8,
      outputType: 'image/jpeg'
    })
  } catch (error) {
    console.error('压缩失败:', error)
  } finally {
    compressing.value = false
  }
}

const download = () => {
  if (result.value) {
    downloadCompressedImage(
      result.value.blob,
      'compressed-image.jpg',
      'image/jpeg'
    )
  }
}
</script>
```

## 类型定义

```typescript
interface CompressResult {
  blob: Blob
  dataUrl: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  width: number
  height: number
  type: string
}
```

## 无障碍支持

- 完整的键盘导航支持
- ARIA 属性标注
- 屏幕阅读器友好

## 主题定制

```css
:root {
  --ex-compress-preview-bg: var(--ex-color-bg-secondary);
  --ex-compress-border-color: var(--ex-color-border-primary);
  --ex-compress-info-color: var(--ex-color-text-secondary);
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
