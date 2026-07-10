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
import { ref } from 'vue';

const visible = ref(false);
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
  <ExFilePreview v-model:visible="visible" file="https://example.com/video.mp4" type="video" />
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
  <ExFilePreview v-model:visible="visible" file="https://example.com/document.pdf" type="pdf" />
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
  <ExFilePreview v-model:visible="visible" :files="imageList" type="image" :initial-index="0" />
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const imageList = ref([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
]);
</script>
```

## 自定义工具栏

通过 `#toolbar` 插槽可在工具栏中追加自定义操作（内置的缩放、旋转、下载、关闭按钮仍会保留）。插槽提供 `file` 和 `index` 作用域参数。

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
  <ExFilePreview v-model:visible="visible" file="https://example.com/image.jpg" type="image">
    <template #toolbar>
      <ExButton size="small" @click="handleDownload">下载</ExButton>
      <ExButton size="small" @click="handleShare">分享</ExButton>
    </template>
  </ExFilePreview>
</template>
```

## 键盘快捷键

预览打开后支持以下快捷键（焦点会自动锁定在预览层内）：

| 按键      | 功能                                     |
| --------- | ---------------------------------------- |
| `Esc`     | 关闭预览（需 `mask-closable` 为 `true`） |
| `←` / `→` | 多文件预览时切换上一个 / 下一个          |
| `+` / `=` | 放大（需 `zoomable`）                    |
| `-`       | 缩小（需 `zoomable`）                    |
| `0`       | 重置缩放                                 |

## API

### Props

| 属性                      | 说明                               | 类型                        | 默认值                 |
| ------------------------- | ---------------------------------- | --------------------------- | ---------------------- |
| visible / v-model:visible | 是否显示预览                       | `boolean`                   | `false`                |
| file                      | 单个文件 URL 或对象                | `string \| PreviewFile`     | -                      |
| files                     | 多个文件列表                       | `(string \| PreviewFile)[]` | -                      |
| initial-index             | 初始显示的文件索引（多文件时）     | `number`                    | `0`                    |
| type                      | 强制指定文件类型（不传则自动检测） | `PreviewType`               | -                      |
| show-toolbar              | 是否显示工具栏                     | `boolean`                   | `true`                 |
| show-download             | 是否显示下载按钮                   | `boolean`                   | `true`                 |
| show-close                | 是否显示关闭按钮                   | `boolean`                   | `true`                 |
| zoomable                  | 是否可缩放（图片）                 | `boolean`                   | `true`                 |
| rotatable                 | 是否可旋转（图片）                 | `boolean`                   | `true`                 |
| scale / v-model:scale     | 图片缩放比例                       | `number`                    | `1`                    |
| rotate / v-model:rotate   | 图片旋转角度                       | `number`                    | `0`                    |
| min-scale                 | 最小缩放比例                       | `number`                    | `0.1`                  |
| max-scale                 | 最大缩放比例                       | `number`                    | `5`                    |
| scale-step                | 缩放步长                           | `number`                    | `0.1`                  |
| rotate-step               | 旋转步长（度）                     | `number`                    | `90`                   |
| mask-background           | 遮罩层背景色                       | `string`                    | `'rgba(0, 0, 0, 0.9)'` |
| mask-closable             | 点击遮罩 / 按 Esc 是否关闭         | `boolean`                   | `true`                 |
| language                  | 代码语言（用于代码预览）           | `string`                    | -                      |
| show-line-numbers         | 是否显示行号（文本/代码预览）      | `boolean`                   | `true`                 |

### Events

| 事件名         | 说明                   | 类型                          |
| -------------- | ---------------------- | ----------------------------- |
| update:visible | 显示状态改变时触发     | `(visible: boolean) => void`  |
| update:scale   | 缩放比例改变时触发     | `(scale: number) => void`     |
| update:rotate  | 旋转角度改变时触发     | `(rotate: number) => void`    |
| close          | 关闭预览时触发         | `() => void`                  |
| download       | 点击下载时触发         | `(file: PreviewFile) => void` |
| load           | 当前文件加载完成时触发 | `() => void`                  |
| error          | 当前文件加载失败时触发 | `(error: Error) => void`      |

### Slots

| 插槽名  | 说明                                                          | 作用域参数                             |
| ------- | ------------------------------------------------------------- | -------------------------------------- |
| toolbar | 在工具栏内追加自定义操作（内置缩放/旋转/下载/关闭按钮仍保留） | `{ file: PreviewFile, index: number }` |
| footer  | 自定义底部内容区域                                            | `{ file: PreviewFile, index: number }` |

### Methods

通过模板 ref 调用：

| 方法名      | 说明                | 类型                           |
| ----------- | ------------------- | ------------------------------ |
| prev        | 上一个文件          | `() => void`                   |
| next        | 下一个文件          | `() => void`                   |
| zoomIn      | 放大                | `() => void`                   |
| zoomOut     | 缩小                | `() => void`                   |
| resetZoom   | 重置缩放            | `() => void`                   |
| rotateLeft  | 逆时针旋转          | `() => void`                   |
| rotateRight | 顺时针旋转          | `() => void`                   |
| resetRotate | 重置旋转            | `() => void`                   |
| download    | 下载当前文件        | `() => void`                   |
| close       | 关闭预览            | `() => void`                   |
| getElement  | 获取组件根 DOM 元素 | `() => HTMLDivElement \| null` |

## 类型定义

```typescript
type PreviewType = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'code' | 'unknown';

interface PreviewFile {
  /** 文件 URL */
  url: string;
  /** 文件名 */
  name?: string;
  /** 文件类型（不传则按 mimeType / 扩展名自动检测） */
  type?: PreviewType;
  /** MIME 类型 */
  mimeType?: string;
}
```

## 无障碍支持

- 预览层为 `role="dialog"` + `aria-modal="true"`，打开后自动聚焦并锁定 Tab 焦点陷阱，关闭后焦点归还触发元素。
- 支持键盘操作：`Esc` 关闭、`←/→` 切换、`+/-/0` 缩放（详见上方[键盘快捷键](#键盘快捷键)）。
- 多个预览层叠加时，`Esc` 只关闭最顶层（基于浮层栈），页面滚动锁定使用引用计数，互不干扰。

## 常见问题

**Q：文本 / 代码文件无法预览？**
组件通过 `fetch(file.url)` 拉取文本内容，请确保该 URL 允许跨域（CORS）访问，且与页面同源或服务端已配置 `Access-Control-Allow-Origin`。

**Q：切换多文件时文本内容没更新？**
已修复——切换文件时会按当前 URL + 类型重新加载文本内容，无需额外处理。

**Q：PDF 预览空白？**
PDF 通过 `<iframe>` 加载，部分站点会通过 `X-Frame-Options` 禁止被内嵌；此时建议改为下载或使用专门的 PDF 渲染库。

## 主题定制

文件预览跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配。遮罩背景可通过 `mask-background` 属性单独覆盖：

```vue
<ExFilePreview v-model:visible="visible" file="..." mask-background="rgba(0,0,0,0.95)" />
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
