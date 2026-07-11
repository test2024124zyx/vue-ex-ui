# Image 图片

展示带加载、错误和可选全屏预览状态的原生图片。

<script setup>
const demoImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#1668dc"/><stop offset="1" stop-color="#6645c9"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#g)"/>
    <circle cx="320" cy="170" r="72" fill="none" stroke="white" stroke-width="14" opacity=".85"/>
    <path d="M205 330l90-95 65 62 45-42 70 75z" fill="white" opacity=".75"/>
  </svg>
`)}`
</script>

## 基础用法

`alt` 直接传给内部原生图片；装饰性图片应显式使用空字符串。

<div class="demo-container">
  <ExImage :src="demoImage" alt="蓝紫渐变示例图" width="320" />
</div>

```vue
<ExImage src="/cover.jpg" alt="文章封面" width="320" />
```

纯数字字符串与数字均按像素处理，因此 `width="320"` 与 `:width="320"` 语义一致。

## 尺寸与裁切

<div class="demo-grid">
  <ExImage :src="demoImage" alt="Cover 裁切" width="240" height="150" fit="cover" />
  <ExImage :src="demoImage" alt="Contain 裁切" width="240" height="150" fit="contain" radius="12" />
  <ExImage :src="demoImage" alt="圆形裁切" :width="150" :height="150" fit="cover" radius="50%" />
</div>

```vue
<ExImage src="/photo.jpg" alt="照片" width="240" height="150" fit="cover" />
<ExImage src="/photo.jpg" alt="照片" :width="240" :height="150" fit="contain" :radius="12" />
```

宽高支持 `px`、`rem`、百分比、内容尺寸关键字和 `calc()` / `var()` 等 CSS 长度。负数、非有限数值和无效声明会被忽略。

## 加载与错误内容

```vue
<ExImage src="/photo.jpg" alt="照片">
  <template #placeholder>
    <span>正在读取图片</span>
  </template>

  <template #error>
    <span>图片暂时不可用</span>
  </template>
</ExImage>
```

加载时根元素设置 `aria-busy`，占位内容使用 `role="status"`；失败内容使用 `role="alert"`。自定义错误插槽的文本会直接参与朗读。

## 图片预览

`preview` 增加覆盖图片区域的原生按钮。主图加载成功前按钮保持禁用；打开后支持 `Escape`、遮罩和关闭按钮，并在关闭时恢复触发器焦点。

<div class="demo-container">
  <ExImage
    :src="demoImage"
    :preview-src="demoImage"
    alt="可全屏预览的示例图"
    width="280"
    height="175"
    preview
  />
</div>

```vue
<ExImage
  src="/thumbnail.jpg"
  preview-src="/original.jpg"
  alt="产品细节图"
  width="280"
  height="175"
  preview
  @preview="onPreview"
/>
```

高清图有独立的加载和错误状态。主图地址变化或关闭 `preview` 时，已打开的预览会同步关闭。

## 叠加内容

默认插槽只在主图加载成功后渲染，适合非交互角标或蒙层；该层不接收指针事件。

```vue
<ExImage src="/photo.jpg" alt="照片">
  <span class="badge">NEW</span>
</ExImage>
```

## API

### Props

| 属性          | 说明                                               | 类型                                                       | 默认值       |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------- | ------------ |
| `src`         | 主图地址                                           | `string`                                                   | 必填         |
| `alt`         | 原生替代文本                                       | `string`                                                   | 必填         |
| `title`       | 显式原生提示文本                                   | `string`                                                   | —            |
| `width`       | 宽度；数字及纯数字字符串按像素处理                 | `string \| number`                                         | 图片固有宽度 |
| `height`      | 高度；数字及纯数字字符串按像素处理                 | `string \| number`                                         | 图片固有高度 |
| `fit`         | 原生 `object-fit`                                  | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'`    |
| `radius`      | 圆角；数字按像素处理                               | `string \| number`                                         | 主题基础圆角 |
| `lazy`        | 使用原生懒加载；`false` 明确写入 `loading="eager"` | `boolean`                                                  | `true`       |
| `preview`     | 显示全屏预览按钮                                   | `boolean`                                                  | `false`      |
| `preview-src` | 高清预览地址                                       | `string`                                                   | `src`        |

组件会把 `class`、`style`、`data-*` 和其他根元素 attrs 合并到状态容器。

### Events

| 事件      | 说明                 | 类型                     |
| --------- | -------------------- | ------------------------ |
| `load`    | 当前主图加载成功     | `(event: Event) => void` |
| `error`   | 当前主图加载失败     | `(event: Event) => void` |
| `preview` | 可用的预览按钮被激活 | `() => void`             |

旧 `src` 节点的迟到事件不会改变新图片状态，也不会触发当前实例的 `load` / `error`。

### Slots

| 插槽          | 说明                       |
| ------------- | -------------------------- |
| `placeholder` | 主图加载内容               |
| `error`       | 主图错误内容               |
| `default`     | 加载成功后的非交互叠加内容 |

### Exposed

| 方法         | 说明         | 类型                           |
| ------------ | ------------ | ------------------------------ |
| `getElement` | 获取状态容器 | `() => HTMLDivElement \| null` |

<style scoped>
.demo-container,
.demo-grid {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
