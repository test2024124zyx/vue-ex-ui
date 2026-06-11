# FileUpload 文件上传

支持拖拽上传、多文件上传、进度显示等功能的文件上传组件。

<script setup>
import { ref } from 'vue'

const fileList = ref([])
const fileList2 = ref([])
const fileList3 = ref([])

const handleChange = (file, list) => {
  console.log('文件变化:', file, list)
}

const handleSuccess = (response, file, list) => {
  console.log('上传成功:', response, file)
}

const handleError = (error, file, list) => {
  console.error('上传失败:', error, file)
}

const handlePreview = (file) => {
  console.log('预览文件:', file)
}
</script>

## 基础用法

最基础的文件上传功能。

<div class="demo-container">
  <ExFileUpload
    :auto-upload="false"
    :file-list="fileList"
    @update:file-list="fileList = $event"
    @change="handleChange"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        提示：由于是演示环境，文件不会真实上传到服务器
      </div>
    </template>
  </ExFileUpload>
</div>

```vue
<template>
  <ExFileUpload
    action="/api/upload"
    :file-list="fileList"
    @update:file-list="fileList = $event"
    @change="handleChange"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'

const fileList = ref([])

const handleChange = (file, list) => {
  console.log('文件变化:', file, list)
}

const handleSuccess = (response, file, list) => {
  console.log('上传成功:', response, file)
}
</script>
```

## 拖拽上传

设置 `drag` 属性启用拖拽上传功能。

<div class="demo-container">
  <ExFileUpload
    drag
    :auto-upload="false"
    :file-list="fileList2"
    @update:file-list="fileList2 = $event"
    accept="image/*"
    :max-size="5"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        只能上传图片文件，且不超过 5MB
      </div>
    </template>
  </ExFileUpload>
</div>

```vue
<template>
  <ExFileUpload
    drag
    action="/api/upload"
    :file-list="fileList"
    @update:file-list="fileList = $event"
    accept="image/*"
    :max-size="5"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        只能上传图片文件，且不超过 5MB
      </div>
    </template>
  </ExFileUpload>
</template>
```

## 图片卡片列表

使用 `list-type="picture-card"` 展示图片卡片列表，支持点击加号图标上传。

<div class="demo-container">
  <ExFileUpload
    :auto-upload="false"
    list-type="picture-card"
    :file-list="fileList3"
    @update:file-list="fileList3 = $event"
    accept="image/*"
    :limit="9"
    @preview="handlePreview"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px;">
        点击加号图标或拖拽图片到此处上传，最多 9 张
      </div>
    </template>
  </ExFileUpload>
</div>

```vue
<template>
  <ExFileUpload
    action="/api/upload"
    list-type="picture-card"
    :file-list="fileList"
    @update:file-list="fileList = $event"
    accept="image/*"
    :limit="9"
    @preview="handlePreview"
  />
</template>

<script setup>
import { ref } from 'vue'

const fileList = ref([])

const handlePreview = (file) => {
  console.log('预览文件:', file)
}
</script>
```

## 卡片拖拽上传

在 `picture-card` 模式下，可以直接拖拽图片到加号区域上传。

<div class="demo-container">
  <ExFileUpload
    :auto-upload="false"
    list-type="picture-card"
    multiple
    :file-list="fileList3"
    @update:file-list="fileList3 = $event"
    accept="image/*"
    :limit="6"
    @preview="handlePreview"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px;">
        💡 提示：可以直接拖拽图片到加号区域上传
      </div>
    </template>
  </ExFileUpload>
</div>

```vue
<template>
  <ExFileUpload
    action="/api/upload"
    list-type="picture-card"
    multiple
    :file-list="fileList"
    @update:file-list="fileList = $event"
    accept="image/*"
    :limit="6"
  />
</template>
```

## 多文件上传

设置 `multiple` 属性允许同时选择多个文件。

<div class="demo-container">
  <ExFileUpload
    :auto-upload="false"
    multiple
    :file-list="fileList"
    @update:file-list="fileList = $event"
    :limit="10"
  >
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        最多可上传 10 个文件
      </div>
    </template>
  </ExFileUpload>
</div>

```vue
<template>
  <ExFileUpload
    action="/api/upload"
    multiple
    :file-list="fileList"
    @update:file-list="fileList = $event"
    :limit="10"
  />
</template>
```

## 手动上传

设置 `auto-upload` 为 `false` 后，需要手动触发上传。

<div class="demo-container">
  <ExFileUpload
    :auto-upload="false"
    :file-list="fileList"
    @update:file-list="fileList = $event"
  >
    <template #trigger>
      <ExButton type="primary">选择文件</ExButton>
    </template>
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        选择文件后，点击上传按钮开始上传
      </div>
    </template>
  </ExFileUpload>
  <ExButton 
    type="success" 
    style="margin-top: 12px;"
    :disabled="fileList.length === 0"
  >
    开始上传
  </ExButton>
</div>

```vue
<template>
  <ExFileUpload
    ref="uploadRef"
    :auto-upload="false"
    :file-list="fileList"
    @update:file-list="fileList = $event"
  />
  <ExButton @click="handleUpload">开始上传</ExButton>
</template>

<script setup>
import { ref } from 'vue'

const uploadRef = ref()
const fileList = ref([])

const handleUpload = () => {
  uploadRef.value?.submit()
}
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| action | 上传地址 | string | - |
| headers | 上传请求头 | Record<string, string> | - |
| data | 上传附带参数 | Record<string, unknown> | - |
| name | 文件字段名 | string | 'file' |
| multiple | 是否多选 | boolean | false |
| drag | 是否拖拽上传 | boolean | false |
| accept | 接受的文件类型 | string | - |
| file-list | 文件列表 | UploadFile[] | [] |
| limit | 最大上传数量 | number | - |
| max-size | 文件大小限制(MB) | number | - |
| auto-upload | 是否自动上传 | boolean | true |
| show-file-list | 是否显示文件列表 | boolean | true |
| list-type | 文件列表类型 | 'text' \| 'picture' \| 'picture-card' | 'text' |
| disabled | 是否禁用 | boolean | false |
| with-credentials | 是否携带cookie | boolean | false |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| change | 文件状态改变时触发 | (file: UploadFile, fileList: UploadFile[]) => void |
| success | 文件上传成功时触发 | (response: any, file: UploadFile, fileList: UploadFile[]) => void |
| error | 文件上传失败时触发 | (error: Error, file: UploadFile, fileList: UploadFile[]) => void |
| progress | 文件上传进度更新时触发 | (event: ProgressEvent, file: UploadFile, fileList: UploadFile[]) => void |
| preview | 点击文件预览时触发 | (file: UploadFile) => void |
| remove | 文件移除时触发 | (file: UploadFile, fileList: UploadFile[]) => void |
| exceed | 文件超出数量限制时触发 | (files: File[], fileList: UploadFile[]) => void |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 默认内容 |
| trigger | 触发文件选择的内容 |
| tip | 提示信息 |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| submit | 手动上传文件列表 | () => void |
| clearFiles | 清空文件列表 | () => void |
| abort | 取消上传请求 | (file?: UploadFile) => void |

## 类型定义

```typescript
interface UploadFile {
  uid: string
  name: string
  size?: number
  type?: string
  url?: string
  status?: 'ready' | 'uploading' | 'success' | 'error'
  percent?: number
  raw?: File
  response?: any
  error?: Error
}
```

## 无障碍支持

- 完整的键盘导航支持
- ARIA 属性标注
- 屏幕阅读器友好

## 主题定制

```css
:root {
  --ex-upload-border-color: var(--ex-color-border-primary);
  --ex-upload-hover-color: var(--ex-color-neon-blue-500);
  --ex-upload-bg: var(--ex-color-bg-secondary);
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
