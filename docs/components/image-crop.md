# ImageCrop 图片裁剪

强大的图片裁剪功能，支持自由裁剪和固定比例裁剪。

<script setup>
import { ref } from 'vue'

const cropResult = ref(null)

const handleCrop = (result) => {
  console.log('裁剪结果:', result)
  console.log('Blob:', result.blob)
  console.log('DataURL:', result.dataUrl)
  cropResult.value = result
  
  // 显示提示
  alert(`裁剪成功！\n原始尺寸: ${result.originalSize.width}x${result.originalSize.height}\n裁剪尺寸: ${result.croppedSize.width}x${result.croppedSize.height}`)
}
</script>

## 基础用法

基础的图片裁剪功能。调整裁剪框后，点击"确认裁剪"按钮完成裁剪。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="rect"
    :show-grid="true"
    @crop="handleCrop"
  />
  <div v-if="cropResult" style="margin-top: 16px; padding: 12px; background: var(--ex-color-bg-elevated); border-radius: var(--ex-radius-base);">
    <div style="color: var(--ex-color-success); font-weight: 600; margin-bottom: 8px;">✓ 裁剪成功</div>
    <div style="color: var(--ex-color-text-secondary); font-size: 14px;">
      原始尺寸: {{ cropResult.originalSize.width }}x{{ cropResult.originalSize.height }}<br>
      裁剪尺寸: {{ cropResult.croppedSize.width }}x{{ cropResult.croppedSize.height }}
    </div>
  </div>
</div>

```vue
<template>
  <ExImageCrop
    src="https://example.com/image.jpg"
    shape="rect"
    :show-grid="true"
    @crop="handleCrop"
  />
</template>

<script setup>
const handleCrop = (result) => {
  console.log('裁剪结果:', result);
};
</script>
```

## 固定比例裁剪

设置 `aspect-ratio` 属性可以固定裁剪比例。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="rect"
    :aspect-ratio="16/9"
    :show-grid="true"
    @crop="handleCrop"
  />
</div>

```vue
<template>
  <ExImageCrop
    src="https://example.com/image.jpg"
    shape="rect"
    :aspect-ratio="16 / 9"
    @crop="handleCrop"
  />
</template>
```

## 圆形裁剪

设置 `shape="circle"` 可以进行圆形裁剪，适合头像等场景。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="circle"
    :show-grid="false"
    @crop="handleCrop"
  />
</div>

```vue
<template>
  <ExImageCrop src="https://example.com/avatar.jpg" shape="circle" @crop="handleCrop" />
</template>
```

## 自由裁剪

不设置 `aspect-ratio` 时，可以自由调整裁剪区域的宽高比。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="rect"
    mode="free"
    :show-grid="true"
    @crop="handleCrop"
  />
</div>

```vue
<template>
  <ExImageCrop src="https://example.com/image.jpg" shape="rect" mode="free" @crop="handleCrop" />
</template>
```

## 裁剪质量

可以设置裁剪输出的图片质量。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="rect"
    :aspect-ratio="16/9"
    :quality="0.9"
    @crop="handleCrop"
  />
</div>

```vue
<template>
  <ExImageCrop src="https://example.com/image.jpg" shape="rect" :quality="0.9" @crop="handleCrop" />
</template>
```

## 缩放和旋转

支持图片的缩放和旋转操作。

<div class="demo-container">
  <ExImageCrop
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    shape="rect"
    :aspect-ratio="16/9"
    :zoomable="true"
    :rotatable="true"
    :show-grid="true"
    @crop="handleCrop"
  />
</div>

```vue
<template>
  <ExImageCrop
    src="https://example.com/image.jpg"
    shape="rect"
    :zoomable="true"
    :rotatable="true"
    @crop="handleCrop"
  />
</template>
```

## API

### Props

| 属性              | 说明           | 类型                                        | 默认值       |
| ----------------- | -------------- | ------------------------------------------- | ------------ |
| src               | 图片源         | string \| File                              | -            |
| shape             | 裁剪形状       | 'rect' \| 'circle'                          | 'rect'       |
| mode              | 裁剪模式       | 'free' \| 'fixed'                           | 'free'       |
| aspect-ratio      | 固定宽高比     | number                                      | -            |
| quality           | 输出质量 (0-1) | number                                      | 0.9          |
| output-type       | 输出格式       | 'image/png' \| 'image/jpeg' \| 'image/webp' | 'image/jpeg' |
| show-grid         | 是否显示网格   | boolean                                     | true         |
| zoomable          | 是否可缩放     | boolean                                     | true         |
| rotatable         | 是否可旋转     | boolean                                     | true         |
| min-crop-width    | 最小裁剪宽度   | number                                      | 50           |
| min-crop-height   | 最小裁剪高度   | number                                      | 50           |
| initial-crop-area | 初始裁剪区域   | CropArea                                    | -            |

### Events

| 事件名 | 说明               | 类型                         |
| ------ | ------------------ | ---------------------------- |
| crop   | 裁剪完成时触发     | (result: CropResult) => void |
| change | 裁剪区域改变时触发 | (area: CropArea) => void     |
| zoom   | 缩放时触发         | (scale: number) => void      |
| rotate | 旋转时触发         | (angle: number) => void      |

### Methods

| 方法名      | 说明           | 类型                        |
| ----------- | -------------- | --------------------------- |
| crop        | 执行裁剪       | () => Promise\<CropResult\> |
| reset       | 重置裁剪区域   | () => void                  |
| zoomIn      | 放大           | () => void                  |
| zoomOut     | 缩小           | () => void                  |
| rotateLeft  | 逆时针旋转90度 | () => void                  |
| rotateRight | 顺时针旋转90度 | () => void                  |
| setZoom     | 设置缩放比例   | (scale: number) => void     |
| setRotate   | 设置旋转角度   | (angle: number) => void     |

## 类型定义

```typescript
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}
```

## 无障碍支持

- 完整的键盘导航支持
- ARIA 属性标注
- 屏幕阅读器友好

## 主题定制

```css
:root {
  --ex-crop-border-color: var(--ex-color-neon-blue-500);
  --ex-crop-grid-color: rgba(255, 255, 255, 0.3);
  --ex-crop-mask-color: rgba(0, 0, 0, 0.5);
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
