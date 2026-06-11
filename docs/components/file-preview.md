# FilePreview 文件预览

支持图片、视频、音频、PDF、文本等多种文件类型的预览组件。

<script setup>
import { ref } from 'vue'

const imageVisible = ref(false)
const videoVisible = ref(false)
const pdfVisible = ref(false)
</script>

## 基础用法

预览图片文件。

<div class="demo-container">
  <ExButton @click="imageVisible = true">预览图片</ExButton>
  <ExFilePreview
    v-model:visible="imageVisible"
    file="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    type="image"
    :zoomable="true"
    :rotatable="true"
  />
</div>

```vue
<template>
  <ExButton @click="visible = true">预览图片</ExButton>
  <ExFilePreview
    v-model:visible="visible"
    file="https://example.com/image.jpg"
    type="image"
    :zoomable="true"
    :rotatable="true"
  />
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
```

## 预览视频

支持视频文件预览。

<div class="demo-container">
  <ExButton type="success" @click="videoVisible = true">预览视频</ExButton>
  <ExFilePreview
    v-model:visible="videoVisible"
    file="https://www.w3schools.com/html/mov_bbb.mp4"
    type="video"
  />
</div>

```vue
<template>
  <ExButton @click="visible = true">预览视频</ExButton>
  <ExFilePreview
    v-model:visible="visible"
    file="https://example.com/video.mp4"
    type="video"
  />
</template>
```

## 预览 PDF

支持 PDF 文件预览。

<div class="demo-container">
  <ExButton type="warning" @click="pdfVisible = true">预览 PDF</ExButton>
  <ExFilePreview
    v-model:visible="pdfVisible"
    file="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    type="pdf"
  />
</div>

```vue
<template>
  <ExButton @click="visible = true">预览 PDF</ExButton>
  <ExFilePreview
    v-model:visible="visible"
    file="https://example.com/document.pdf"
    type="pdf"
  />
</template>
```

## 图片操作

图片预览支持缩放、旋转等操作。

<div class="demo-container">
  <ExSpace>
    <ExButton @click="imageVisible = true">
      <template #prefix>
        <img src="https://api.iconify.design/ri/zoom-in-line.svg" alt="缩放" width="16" height="16" />
      </template>
      可缩放
    </ExButton>
    <ExButton type="success" @click="imageVisible = true">
      <template #prefix>
        <img src="https://api.iconify.design/ri/rotate-lock-line.svg" alt="旋转" width="16" height="16" />
      </template>
      可旋转
    </ExButton>
  </ExSpace>
  <ExFilePreview
    v-model:visible="imageVisible"
    file="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    type="image"
    :zoomable="true"
    :rotatable="true"
    :show-toolbar="true"
  />
</div>

```vue
<template>
  <ExFilePreview
    v-model:visible="visible"
    file="https://example.com/image.jpg"
    type="image"
    :zoomable="true"
    :rotatable="true"
    :show-toolbar="true"
  />
</template>
```

## 多文件预览

支持预览多个文件，可以切换查看。

<div class="demo-container">
  <ExButton @click="imageVisible = true">预览图片集</ExButton>
  <ExFilePreview
    v-model:visible="imageVisible"
    :files="[
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    ]"
    type="image"
    :initial-index="0"
  />
</div>

```vue
<template>
  <ExFilePreview
    v-model:visible="visible"
    :files="imageList"
    type="image"
    :initial-index="0"
  />
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const imageList = ref([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
])
</script>
```

## 自定义工具栏

可以自定义预览工具栏的内容。

<div class="demo-container">
  <ExButton @click="imageVisible = true">自定义工具栏</ExButton>
  <ExFilePreview
    v-model:visible="imageVisible"
    file="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"
    type="image"
    :show-toolbar="true"
  >
    <template #toolbar>
      <ExSpace>
        <ExButton size="small" type="text">
          <img src="https://api.iconify.design/ri/download-line.svg" alt="下载" width="18" height="18" />
        </ExButton>
        <ExButton size="small" type="text">
          <img src="https://api.iconify.design/ri/share-line.svg" alt="分享" width="18" height="18" />
        </ExButton>
      </ExSpace>
    </template>
  </ExFilePreview>
</div>

```vue
<template>
  <ExFilePreview
    v-model:visible="visible"
    file="https://example.com/image.jpg"
    type="image"
  >
    <template #toolbar>
      <ExButton size="small" @click="handleDownload">下载</ExButton>
      <ExButton size="small" @click="handleShare">分享</ExButton>
    </template>
  </ExFilePreview>
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible / v-model:visible | 是否显示预览 | boolean | false |
| file | 单个文件URL或对象 | string \| PreviewFile | - |
| files | 多个文件列表 | (string \| PreviewFile)[] | - |
| type | 文件类型 | PreviewType | - |
| initial-index | 初始显示的文件索引 | number | 0 |
| zoomable | 是否可缩放（图片） | boolean | true |
| rotatable | 是否可旋转（图片） | boolean | true |
| show-toolbar | 是否显示工具栏 | boolean | true |
| mask-closable | 点击遮罩是否关闭 | boolean | true |
| keyboard | 是否支持键盘操作 | boolean | true |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| update:visible | 显示状态改变时触发 | (visible: boolean) => void |
| close | 关闭预览时触发 | () => void |
| change | 切换文件时触发 | (index: number) => void |
| zoom | 缩放时触发 | (scale: number) => void |
| rotate | 旋转时触发 | (angle: number) => void |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| toolbar | 自定义工具栏内容 |
| footer | 自定义底部内容 |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| prev | 上一个文件 | () => void |
| next | 下一个文件 | () => void |
| zoomIn | 放大 | () => void |
| zoomOut | 缩小 | () => void |
| rotateLeft | 逆时针旋转 | () => void |
| rotateRight | 顺时针旋转 | () => void |
| reset | 重置 | () => void |

## 类型定义

```typescript
type PreviewType = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'unknown'

interface PreviewFile {
  url: string
  name?: string
  type?: PreviewType
  size?: number
}
```

## 无障碍支持

- 完整的键盘导航支持（方向键、ESC等）
- ARIA 属性标注
- 屏幕阅读器友好
- 焦点管理

## 主题定制

```css
:root {
  --ex-preview-bg: rgba(0, 0, 0, 0.9);
  --ex-preview-toolbar-bg: rgba(0, 0, 0, 0.7);
  --ex-preview-toolbar-color: var(--ex-color-text-primary);
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
