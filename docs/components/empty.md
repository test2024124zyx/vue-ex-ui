# Empty 空状态

用于呈现无数据、无搜索结果、错误或网络异常状态。

<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'

const imageUrl = ref(withBase('/images/empty-cart.svg'))
const imageFailed = ref(false)
const filtered = ref(true)
const browsing = ref(false)
const changeImage = broken => {
  const nextUrl = broken ? 'data:image/png;base64,invalid' : withBase('/images/empty-cart.svg')
  if (nextUrl === imageUrl.value) return
  imageFailed.value = false
  imageUrl.value = nextUrl
}
</script>

## 基础用法

::: raw
<div class="demo-container">
  <ex-empty />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ex-empty />
  </div>
</template>
```

:::

## 场景文案

未传入 `description` 时，`type` 会选择当前语言下的内置文案。

::: raw
<div class="demo-grid">
  <ex-empty
    type="no-result"
    image-size="small"
  />
  <ex-empty
    type="network-error"
    image-size="small"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-grid">
    <ex-empty
      type="no-result"
      image-size="small"
    />
    <ex-empty
      type="network-error"
      image-size="small"
    />
  </div>
</template>
```

:::

## 描述与操作

`description` 覆盖内置文案；传入空字符串可隐藏描述。默认插槽用于放置操作。

::: raw
<div class="demo-container">
  <ex-empty v-if="filtered" description="当前筛选条件下没有数据">
    <ex-button type="primary" @click="filtered = false">清除筛选</ex-button>
  </ex-empty>
  <div v-else>
    <ul><li>设计文档</li><li>验收记录</li></ul>
    <ex-button @click="filtered = true">恢复无结果筛选</ex-button>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const filtered = ref(true);
</script>

<template>
  <div class="demo-container">
    <ex-empty
      v-if="filtered"
      description="当前筛选条件下没有数据"
    >
      <ex-button
        type="primary"
        @click="filtered = false"
      >
        清除筛选
      </ex-button>
    </ex-empty>
    <div v-else>
      <ul>
        <li>设计文档</li>
        <li>验收记录</li>
      </ul>
      <ex-button @click="filtered = true">恢复无结果筛选</ex-button>
    </div>
  </div>
</template>
```

:::

## 图片

可以传入图片地址或使用 `image` 插槽。外部图片默认按装饰处理；只有图片包含描述之外的独立信息时才应设置 `image-alt`。

::: raw
<div class="demo-container">
  <ex-empty :image="imageUrl" image-alt="空购物车" description="购物车里还没有商品" @image-error="imageFailed = true" />
  <ex-button @click="changeImage(true)">切换损坏图片</ex-button>
  <ex-button @click="changeImage(false)">恢复有效图片</ex-button>
  <p role="status">{{ imageFailed ? '图片加载失败，已回退到内置插图' : '正在展示购物车图片' }}</p>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

// 将本页使用的 empty-cart.svg 放入应用的 public/images 目录。
const imageUrl = ref('/images/empty-cart.svg');
const imageFailed = ref(false);
const changeImage = broken => {
  const nextUrl = broken ? 'data:image/png;base64,invalid' : '/images/empty-cart.svg';
  if (nextUrl === imageUrl.value) return;
  imageFailed.value = false;
  imageUrl.value = nextUrl;
};
</script>

<template>
  <div class="demo-container">
    <ex-empty
      :image="imageUrl"
      image-alt="空购物车"
      description="购物车里还没有商品"
      @image-error="imageFailed = true"
    />
    <ex-button @click="changeImage(true)">切换损坏图片</ex-button>
    <ex-button @click="changeImage(false)">恢复有效图片</ex-button>
    <p role="status">{{ imageFailed ? '图片加载失败，已回退到内置插图' : '正在展示购物车图片' }}</p>
  </div>
</template>
```

:::

有效图片来自文档自带的[购物车 SVG](/images/empty-cart.svg)，切换损坏图片使用无效图片数据触发失败回退，不依赖外部服务。

图片加载失败时组件会触发 `image-error`，并自动回退到内置插图。设置 `:show-image="false"` 会隐藏图片属性、内置图片和图片插槽的整个布局区域。

## 自定义图片与描述

::: raw
<div class="demo-container">
  <ex-empty v-if="!browsing" :image-size="96">
    <template #image>
      <span
        aria-hidden="true"
        class="custom-empty-icon"
      >
        ◇
      </span>
    </template>
    <template #description>
      <span>还没有收藏内容</span>
    </template>
    <ex-button @click="browsing = true">浏览内容</ex-button>
  </ex-empty>
  <div v-else>
    <ul><li>组件设计入门</li><li>无障碍交互指南</li></ul>
    <ex-button @click="browsing = false">返回收藏</ex-button>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const browsing = ref(false);
</script>

<template>
  <div class="demo-container">
    <ex-empty
      v-if="!browsing"
      :image-size="96"
    >
      <template #image>
        <span
          aria-hidden="true"
          class="custom-empty-icon"
        >
          ◇
        </span>
      </template>
      <template #description>
        <span>还没有收藏内容</span>
      </template>
      <ex-button @click="browsing = true">浏览内容</ex-button>
    </ex-empty>
    <div v-else>
      <ul>
        <li>组件设计入门</li>
        <li>无障碍交互指南</li>
      </ul>
      <ex-button @click="browsing = false">返回收藏</ex-button>
    </div>
  </div>
</template>
```

:::

## API

### Props

| 参数        | 说明                           | 类型                                                                  | 默认值       |
| ----------- | ------------------------------ | --------------------------------------------------------------------- | ------------ |
| image       | 外部图片地址；空白地址会被忽略 | `string`                                                              | -            |
| image-alt   | 外部图片的可访问名称           | `string`                                                              | -            |
| image-size  | 图片预设尺寸或正数像素值       | `'small' \| 'medium' \| 'large' \| number`                            | `'medium'`   |
| description | 描述文字；空字符串隐藏描述     | `string`                                                              | 对应场景文案 |
| show-image  | 是否显示整个图片区域           | `boolean`                                                             | `true`       |
| type        | 内置文案场景                   | `'default' \| 'no-data' \| 'no-result' \| 'error' \| 'network-error'` | `'default'`  |

### Events

| 事件名      | 说明               | 类型                     |
| ----------- | ------------------ | ------------------------ |
| image-error | 外部图片加载失败时 | `(event: Event) => void` |

### Slots

| 名称        | 说明       |
| ----------- | ---------- |
| image       | 自定义图片 |
| description | 自定义描述 |
| default     | 操作区域   |

## 无障碍

- 内置插图和未设置 `image-alt` 的外部图片不会产生重复朗读。
- 描述区域使用礼貌级状态播报。
- 图片插槽和操作插槽中的内容由调用方提供对应的可访问名称与键盘行为。

<style scoped>
.demo-container {
  margin: 16px 0;
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.custom-empty-icon {
  color: var(--ex-color-text-disabled);
  font-size: 72px;
  line-height: 1;
}
</style>
