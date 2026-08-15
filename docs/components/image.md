# Image 图片

支持响应式资源、布局占位、裁切、加载状态、错误恢复和全屏预览。

<script setup>
const demoImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#312e81"/>
        <stop offset="0.52" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#background)"/>
    <circle cx="620" cy="110" r="140" fill="white" opacity="0.12"/>
    <path d="M0 420 180 250l125 110 120-145 190 205z" fill="white" opacity="0.28"/>
    <text x="64" y="105" fill="white" font-size="36" font-family="Arial">EX BUSINESS</text>
    <text x="64" y="150" fill="white" opacity="0.78" font-size="20" font-family="Arial">Digital growth platform</text>
  </svg>
`)}`

const brokenImage = 'data:image/png;base64,invalid-image-data'
</script>

## 基础用法

::: raw

<div class="vp-raw demo-container image-row">
  <ex-image
    :src="demoImage"
    alt="蓝色商业数据平台封面"
    width="320"
    aspect-ratio="16 / 9"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const demoImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#312e81"/>
        <stop offset="0.52" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#background)"/>
    <circle cx="620" cy="110" r="140" fill="white" opacity="0.12"/>
    <path d="M0 420 180 250l125 110 120-145 190 205z" fill="white" opacity="0.28"/>
    <text x="64" y="105" fill="white" font-size="36" font-family="Arial">EX BUSINESS</text>
    <text x="64" y="150" fill="white" opacity="0.78" font-size="20" font-family="Arial">Digital growth platform</text>
  </svg>
`)}`;
</script>

<template>
  <div class="vp-raw demo-container image-row">
    <ex-image
      :src="demoImage"
      alt="蓝色商业数据平台封面"
      width="320"
      aspect-ratio="16 / 9"
    />
  </div>
</template>
```

:::

## 裁切与圆角

::: raw

<div class="vp-raw demo-container image-row">
  <ex-image :src="demoImage" alt="Cover 裁切" width="240" height="150" fit="cover" />
  <ex-image :src="demoImage" alt="Contain 裁切" width="240" height="150" fit="contain" radius="12" />
  <ex-image :src="demoImage" alt="圆形裁切" :width="150" :height="150" fit="cover" radius="50%" />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const demoImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#312e81"/>
        <stop offset="0.52" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#background)"/>
    <circle cx="620" cy="110" r="140" fill="white" opacity="0.12"/>
    <path d="M0 420 180 250l125 110 120-145 190 205z" fill="white" opacity="0.28"/>
    <text x="64" y="105" fill="white" font-size="36" font-family="Arial">EX BUSINESS</text>
    <text x="64" y="150" fill="white" opacity="0.78" font-size="20" font-family="Arial">Digital growth platform</text>
  </svg>
`)}`;
</script>

<template>
  <div class="vp-raw demo-container image-row">
    <ex-image
      :src="demoImage"
      alt="Cover 裁切"
      width="240"
      height="150"
      fit="cover"
    />
    <ex-image
      :src="demoImage"
      alt="Contain 裁切"
      width="240"
      height="150"
      fit="contain"
      radius="12"
    />
    <ex-image
      :src="demoImage"
      alt="圆形裁切"
      :width="150"
      :height="150"
      fit="cover"
      radius="50%"
    />
  </div>
</template>
```

:::

## 加载与错误状态

::: raw

<div class="vp-raw demo-container image-row">
  <ex-image
    :src="brokenImage"
    alt="无法加载的示例图片"
    width="240"
    height="150"
    retry
  >
    <template #placeholder>
      <span class="image-status">正在读取图片</span>
    </template>
    <template #error>
      <span class="image-status">图片暂时不可用</span>
    </template>
  </ex-image>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const brokenImage = 'data:image/png;base64,invalid-image-data';
</script>

<template>
  <div class="vp-raw demo-container image-row">
    <ex-image
      :src="brokenImage"
      alt="无法加载的示例图片"
      width="240"
      height="150"
      retry
    >
      <template #placeholder>
        <span class="image-status">正在读取图片</span>
      </template>
      <template #error>
        <span class="image-status">图片暂时不可用</span>
      </template>
    </ex-image>
  </div>
</template>
```

:::

未提供 `error` 插槽时，`retry` 会在错误区域显示内置重试按钮；自定义错误插槽也会保留该按钮。

## 预览与叠加内容

::: raw

<div class="vp-raw demo-container image-row">
  <ex-image
    :src="demoImage"
    :preview-src="demoImage"
    alt="可全屏预览的商业平台封面"
    width="300"
    height="188"
    preview
  />
  <ex-image :src="demoImage" alt="带状态标记的封面" width="300" height="188">
    <span class="image-badge">已发布</span>
  </ex-image>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const demoImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#312e81"/>
        <stop offset="0.52" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#background)"/>
    <circle cx="620" cy="110" r="140" fill="white" opacity="0.12"/>
    <path d="M0 420 180 250l125 110 120-145 190 205z" fill="white" opacity="0.28"/>
    <text x="64" y="105" fill="white" font-size="36" font-family="Arial">EX BUSINESS</text>
    <text x="64" y="150" fill="white" opacity="0.78" font-size="20" font-family="Arial">Digital growth platform</text>
  </svg>
`)}`;
</script>

<template>
  <div class="vp-raw demo-container image-row">
    <ex-image
      :src="demoImage"
      :preview-src="demoImage"
      alt="可全屏预览的商业平台封面"
      width="300"
      height="188"
      preview
    />
    <ex-image
      :src="demoImage"
      alt="带状态标记的封面"
      width="300"
      height="188"
    >
      <span class="image-badge">已发布</span>
    </ex-image>
  </div>
</template>
```

:::

预览触发器在主图加载成功后才可用，并会显示缩放提示；预览图命中浏览器缓存时也会自动完成状态同步。

## API

### Props

| 参数            | 说明                                | 类型                                             | 默认值       |
| --------------- | ----------------------------------- | ------------------------------------------------ | ------------ |
| `src`           | 图片地址                            | `string`                                         | 必填         |
| `alt`           | 原生替代文本                        | `string`                                         | 必填         |
| `title`         | 原生提示文本                        | `string`                                         | —            |
| `srcset`        | 响应式候选图片地址                  | `string`                                         | —            |
| `sizes`         | 响应式候选图片尺寸提示              | `string`                                         | —            |
| `fetchPriority` | 原生资源调度优先级                  | `'high' \| 'low' \| 'auto'`                      | —            |
| `width`         | 宽度；数字和纯数字字符串按像素处理  | `string \| number`                               | 图片固有宽度 |
| `height`        | 高度；数字和纯数字字符串按像素处理  | `string \| number`                               | 图片固有高度 |
| `aspectRatio`   | 预留布局空间的宽高比，例如 `16 / 9` | `string \| number`                               | —            |
| `fit`           | 原生 `object-fit`                   | `contain \| cover \| fill \| none \| scale-down` | `cover`      |
| `radius`        | 圆角；数字按像素处理                | `string \| number`                               | 主题圆角     |
| `lazy`          | 是否使用原生懒加载                  | `boolean`                                        | `true`       |
| `preview`       | 是否启用全屏预览                    | `boolean`                                        | `false`      |
| `previewSrc`    | 高清预览地址                        | `string`                                         | `src`        |
| `retry`         | 主图失败后显示内置重试按钮          | `boolean`                                        | `false`      |

### Events

| 事件名         | 参数             |
| -------------- | ---------------- |
| `load`         | `(event: Event)` |
| `error`        | `(event: Event)` |
| `preview`      | `()`             |
| `previewLoad`  | `(event: Event)` |
| `previewError` | `(event: Event)` |
| `retry`        | `()`             |

### Slots

| 名称          | 说明                       |
| ------------- | -------------------------- |
| `placeholder` | 加载中内容                 |
| `error`       | 加载失败内容               |
| `default`     | 加载成功后的非交互叠加内容 |

### Exposes

| 方法         | 类型                           |
| ------------ | ------------------------------ |
| `getElement` | `() => HTMLDivElement \| null` |
| `reload`     | `() => void`                   |

`reload` 会重新创建主图节点并重新发起加载；无论是调用该方法还是点击内置重试按钮，都会触发 `retry` 事件。

<style scoped>
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.image-status {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}

.image-badge {
  position: absolute;
  top: var(--ex-spacing-3);
  right: var(--ex-spacing-3);
  padding: var(--ex-spacing-1) var(--ex-spacing-2);
  border-radius: var(--ex-radius-full);
  color: var(--ex-color-white);
  font-size: var(--ex-text-xs);
  background: var(--ex-color-black-alpha-70);
}
</style>
