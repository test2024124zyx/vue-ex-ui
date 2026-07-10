# FileUpload 文件上传

支持拖拽上传、多文件上传、进度显示等功能的文件上传组件。

<script setup>
import { ref } from 'vue'

const fileList = ref([])
const fileList2 = ref([])
const fileList3 = ref([])
const manualList = ref([])
const uploadRef = ref()

const handleManualSubmit = () => {
  uploadRef.value?.submit()
}

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
import { ref } from 'vue';

const fileList = ref([]);

const handleChange = (file, list) => {
  console.log('文件变化:', file, list);
};

const handleSuccess = (response, file, list) => {
  console.log('上传成功:', response, file);
};
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
import { ref } from 'vue';

const fileList = ref([]);

const handlePreview = file => {
  console.log('预览文件:', file);
};
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
    ref="uploadRef"
    :auto-upload="false"
    :file-list="manualList"
    @update:file-list="manualList = $event"
  >
    <template #trigger>
      <ExButton type="primary">选择文件</ExButton>
    </template>
    <template #tip>
      <div style="color: var(--ex-color-text-secondary); font-size: 12px; margin-top: 8px;">
        选择文件后，点击上传按钮开始上传（演示环境未配置 action，不会真实上传）
      </div>
    </template>
  </ExFileUpload>
  <ExButton 
    type="success" 
    style="margin-top: 12px;"
    :disabled="manualList.length === 0"
    @click="handleManualSubmit"
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
import { ref } from 'vue';

const uploadRef = ref();
const fileList = ref([]);

const handleUpload = () => {
  uploadRef.value?.submit();
};
</script>
```

## API

### Props

| 属性                          | 说明                                                                         | 类型                                                          | 默认值   |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- | -------- |
| action                        | 上传地址（未配置时不会自动上传）                                             | `string`                                                      | -        |
| headers                       | 上传请求头                                                                   | `Record<string, string>`                                      | -        |
| data                          | 上传附带的额外参数                                                           | `Record<string, unknown>`                                     | -        |
| name                          | 文件字段名                                                                   | `string`                                                      | `'file'` |
| multiple                      | 是否多选                                                                     | `boolean`                                                     | `false`  |
| drag                          | 是否拖拽上传                                                                 | `boolean`                                                     | `false`  |
| accept                        | 接受的文件类型（拖拽时也会校验，不匹配触发 `type-mismatch`）                 | `string`                                                      | -        |
| file-list / v-model:file-list | 文件列表                                                                     | `UploadFile[]`                                                | `[]`     |
| limit                         | 最大上传数量                                                                 | `number`                                                      | -        |
| max-size                      | 文件大小限制（MB），超出触发 `oversize`                                      | `number`                                                      | -        |
| auto-upload                   | 是否自动上传（需同时配置 `action`）                                          | `boolean`                                                     | `true`   |
| show-file-list                | 是否显示文件列表                                                             | `boolean`                                                     | `true`   |
| list-type                     | 文件列表类型                                                                 | `'text' \| 'picture' \| 'picture-card'`                       | `'text'` |
| disabled                      | 是否禁用                                                                     | `boolean`                                                     | `false`  |
| with-credentials              | 是否携带 cookie                                                              | `boolean`                                                     | `false`  |
| tip                           | 提示文本                                                                     | `string`                                                      | -        |
| button-text                   | 上传按钮文本                                                                 | `string`                                                      | -        |
| drag-text                     | 拖拽区域提示文本                                                             | `string`                                                      | -        |
| drag-description              | 拖拽区域描述文本                                                             | `string`                                                      | -        |
| before-upload                 | 上传前钩子。返回 `false` 阻止上传；返回 `File`（或其 Promise）替换待上传文件 | `(file: File) => boolean \| File \| Promise<boolean \| File>` | -        |

### Events

| 事件名           | 说明                           | 类型                                                                    |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------- |
| update:file-list | 文件列表变化时触发             | `(fileList: UploadFile[]) => void`                                      |
| change           | 文件加入列表后触发             | `(file: UploadFile, fileList: UploadFile[]) => void`                    |
| progress         | 上传进度更新时触发             | `(percent: number, file: UploadFile) => void`                           |
| success          | 上传成功时触发                 | `(response: unknown, file: UploadFile, fileList: UploadFile[]) => void` |
| error            | 上传失败时触发                 | `(error: Error, file: UploadFile, fileList: UploadFile[]) => void`      |
| remove           | 文件移除时触发                 | `(file: UploadFile, fileList: UploadFile[]) => void`                    |
| preview          | 点击文件预览时触发             | `(file: UploadFile) => void`                                            |
| exceed           | 超出 `limit` 数量限制时触发    | `(files: File[], fileList: UploadFile[]) => void`                       |
| oversize         | 文件超出 `max-size` 限制时触发 | `(file: File, maxSize: number) => void`                                 |
| type-mismatch    | 文件类型不匹配 `accept` 时触发 | `(file: File, accept: string) => void`                                  |

### Slots

| 插槽名    | 说明                                                           |
| --------- | -------------------------------------------------------------- |
| trigger   | 自定义触发文件选择的内容（非 `picture-card` / 非 `drag` 模式） |
| drag-icon | 自定义拖拽区域图标（`drag` 模式）                              |
| tip       | 提示信息                                                       |

### Methods

通过模板 ref 调用：

| 方法名     | 说明                                | 类型                           |
| ---------- | ----------------------------------- | ------------------------------ |
| submit     | 手动上传列表中状态为 `ready` 的文件 | `() => void`                   |
| clearFiles | 清空文件列表（并中止进行中的上传）  | `() => void`                   |
| abort      | 中止上传（不传则中止全部）          | `(file?: UploadFile) => void`  |
| getElement | 获取组件根 DOM 元素                 | `() => HTMLDivElement \| null` |

## 类型定义

```typescript
type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

interface UploadFile {
  /** 文件唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件 MIME 类型 */
  type: string;
  /** 上传状态 */
  status: UploadStatus;
  /** 上传进度 0-100 */
  percent?: number;
  /** 原始文件对象 */
  raw?: File;
  /** 文件 URL（上传成功后） */
  url?: string;
  /** 缩略图 URL */
  thumbUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 响应数据 */
  response?: unknown;
}
```

## 无障碍支持

- 上传触发器使用 `ExButton`，原生支持键盘聚焦与 Enter / Space 触发。
- 根容器带有 `aria-label`，拖拽区图标标注 `aria-hidden`，对屏幕阅读器友好。

## 常见问题

**Q：为什么选了文件却没有上传？**
自动上传需要同时满足 `auto-upload`（默认 `true`）和配置了 `action`。未配置 `action` 时文件只会进入列表，可通过 ref 调用 `submit()` 手动触发。

**Q：拖拽上传时 `accept` 不生效？**
原生 `<input>` 的 `accept` 只约束点击选择的对话框；拖拽进来的文件由组件手动按 `accept` 校验，不匹配会触发 `type-mismatch` 事件而不是静默丢弃。

**Q：如何在上传前压缩 / 重命名文件？**
使用 `before-upload` 钩子，返回一个新的 `File`（或其 Promise）即可替换待上传文件；返回 `false` 则取消该文件上传。

## 最佳实践

- 始终监听 `oversize` / `type-mismatch` / `exceed` 给用户明确反馈，而非依赖静默过滤。
- 配合 `v-model:file-list` 受控管理列表，便于在外部做提交校验与回显。
- 移动端建议使用 `list-type="picture-card"` 并设置合理 `limit`，避免列表过长。

## 主题定制

文件上传跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
