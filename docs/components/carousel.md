# Carousel 走马灯

用于展示轮播内容的组件，支持自动播放、手势滑动、多种切换效果。

<script setup>
import { ref } from 'vue'

const currentSlide = ref(0)

const handleChange = (current, prev) => {
  console.log('Slide changed:', current, prev)
}

const handleCopy = (code) => {
  console.log('Code copied:', code)
}
</script>

## 基础用法

最基础的轮播图用法。

<div class="demo-container">
  <ExCarousel>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h2>Slide 1</h2>
        <p>第一张幻灯片</p>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h2>Slide 2</h2>
        <p>第二张幻灯片</p>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h2>Slide 3</h2>
        <p>第三张幻灯片</p>
      </div>
    </ExCarouselItem>
  </ExCarousel>
</div>

```vue
<template>
  <ExCarousel>
    <ExCarouselItem>
      <div>Slide 1</div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div>Slide 2</div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div>Slide 3</div>
    </ExCarouselItem>
  </ExCarousel>
</template>
```

## 指示器位置

通过 `indicator-position` 属性可以设置指示器的位置。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">顶部指示器</h4>
    <ExCarousel indicator-position="top" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h3>Top Indicators</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
  
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">外部指示器</h4>
    <ExCarousel indicator-position="outside" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <h3>Outside Indicators</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
</div>

```vue
<template>
  <!-- 顶部指示器 -->
  <ExCarousel indicator-position="top">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>

  <!-- 外部指示器 -->
  <ExCarousel indicator-position="outside">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 箭头显示

通过 `arrow` 属性可以控制箭头的显示时机。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">始终显示箭头</h4>
    <ExCarousel arrow="always" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <h3>Always Show Arrows</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
  
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">不显示箭头</h4>
    <ExCarousel arrow="never" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <h3>No Arrows</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
</div>

```vue
<template>
  <!-- 始终显示 -->
  <ExCarousel arrow="always">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>

  <!-- 悬停显示（默认） -->
  <ExCarousel arrow="hover">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>

  <!-- 不显示 -->
  <ExCarousel arrow="never">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 切换效果

支持滑动和淡入淡出两种切换效果。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">滑动效果（默认）</h4>
    <ExCarousel effect="slide" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h3>Slide Effect</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <h3>Slide 3</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
  
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-secondary);">淡入淡出效果</h4>
    <ExCarousel effect="fade" :height="250">
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <h3>Fade Effect</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
          <h3>Slide 2</h3>
        </div>
      </ExCarouselItem>
      <ExCarouselItem>
        <div class="demo-slide" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <h3>Slide 3</h3>
        </div>
      </ExCarouselItem>
    </ExCarousel>
  </div>
</div>

```vue
<template>
  <!-- 滑动效果 -->
  <ExCarousel effect="slide">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>

  <!-- 淡入淡出效果 -->
  <ExCarousel effect="fade">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 垂直方向

通过 `direction` 属性可以设置垂直方向的轮播。

<div class="demo-container">
  <ExCarousel direction="vertical" :height="300">
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h3>Vertical Slide 1</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h3>Vertical Slide 2</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h3>Vertical Slide 3</h3>
      </div>
    </ExCarouselItem>
  </ExCarousel>
</div>

```vue
<template>
  <ExCarousel direction="vertical" :height="300">
    <ExCarouselItem>...</ExCarouselItem>
    <ExCarouselItem>...</ExCarouselItem>
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 自动播放

通过 `autoplay` 和 `interval` 属性可以控制自动播放。

<div class="demo-container">
  <ExCarousel :autoplay="true" :interval="2000" :height="250">
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
        <h3>Auto Play</h3>
        <p>2秒切换一次</p>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
        <h3>Slide 2</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
        <h3>Slide 3</h3>
      </div>
    </ExCarouselItem>
  </ExCarousel>
</div>

```vue
<template>
  <ExCarousel :autoplay="true" :interval="2000">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 禁用循环

设置 `loop` 为 `false` 可以禁用循环播放。

<div class="demo-container">
  <ExCarousel :loop="false" :height="250">
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h3>No Loop</h3>
        <p>到达最后一张后不会循环</p>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h3>Slide 2</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h3>Slide 3</h3>
      </div>
    </ExCarouselItem>
  </ExCarousel>
</div>

```vue
<template>
  <ExCarousel :loop="false">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>
</template>
```

## 手动控制

通过 `v-model` 可以手动控制当前显示的幻灯片。

<div class="demo-container">
  <ExCarousel v-model="currentSlide" :height="250" @change="handleChange">
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h3>Slide 1</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h3>Slide 2</h3>
      </div>
    </ExCarouselItem>
    <ExCarouselItem>
      <div class="demo-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h3>Slide 3</h3>
      </div>
    </ExCarouselItem>
  </ExCarousel>
  <div style="margin-top: 16px; text-align: center;">
    <p style="color: var(--ex-color-text-secondary); margin-bottom: 12px;">
      当前幻灯片: {{ currentSlide + 1 }}
    </p>
    <ExSpace>
      <ExButton size="small" @click="currentSlide = 0">第1张</ExButton>
      <ExButton size="small" @click="currentSlide = 1">第2张</ExButton>
      <ExButton size="small" @click="currentSlide = 2">第3张</ExButton>
    </ExSpace>
  </div>
</div>

```vue
<script setup>
import { ref } from 'vue';

const currentSlide = ref(0);

const handleChange = (current, prev) => {
  console.log('Slide changed:', current, prev);
};
</script>

<template>
  <ExCarousel v-model="currentSlide" @change="handleChange">
    <ExCarouselItem>...</ExCarouselItem>
  </ExCarousel>

  <div>当前幻灯片: {{ currentSlide + 1 }}</div>
  <ExButton @click="currentSlide = 0">第1张</ExButton>
</template>
```

## API

### Carousel Props

| 属性                    | 说明                   | 类型                                                  | 默认值         |
| ----------------------- | ---------------------- | ----------------------------------------------------- | -------------- |
| `model-value / v-model` | 当前激活的索引         | `number`                                              | `0`            |
| `height`                | 轮播高度               | `string \| number`                                    | `'400px'`      |
| `autoplay`              | 是否自动播放           | `boolean`                                             | `true`         |
| `interval`              | 自动播放间隔（毫秒）   | `number`                                              | `3000`         |
| `loop`                  | 是否循环播放           | `boolean`                                             | `true`         |
| `arrow`                 | 箭头显示时机           | `'always' \| 'hover' \| 'never'`                      | `'hover'`      |
| `indicator-position`    | 指示器位置             | `'top' \| 'bottom' \| 'left' \| 'right' \| 'outside'` | `'bottom'`     |
| `show-indicators`       | 是否显示指示器         | `boolean`                                             | `true`         |
| `pause-on-hover`        | 鼠标悬停时暂停自动播放 | `boolean`                                             | `true`         |
| `direction`             | 轮播方向               | `'horizontal' \| 'vertical'`                          | `'horizontal'` |
| `effect`                | 切换效果               | `'slide' \| 'fade'`                                   | `'slide'`      |
| `aria-label`            | 无障碍标签             | `string`                                              | `undefined`    |

### Carousel Events

| 事件名               | 说明                   | 类型                                      |
| -------------------- | ---------------------- | ----------------------------------------- |
| `update:model-value` | 当前激活索引变化时触发 | `(index: number) => void`                 |
| `change`             | 切换时触发             | `(current: number, prev: number) => void` |

### Carousel Slots

| 插槽名       | 说明             |
| ------------ | ---------------- |
| `default`    | 轮播项内容       |
| `arrow-prev` | 自定义前一个箭头 |
| `arrow-next` | 自定义下一个箭头 |

### Carousel Methods

| 方法名       | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `next`       | 切换到下一张    | `() => void`                   |
| `prev`       | 切换到上一张    | `() => void`                   |
| `goTo`       | 切换到指定索引  | `(index: number) => void`      |
| `getElement` | 获取组件DOM元素 | `() => HTMLDivElement \| null` |

### CarouselItem Props

| 属性    | 说明          | 类型                                            | 默认值      |
| ------- | ------------- | ----------------------------------------------- | ----------- |
| `class` | 自定义CSS类名 | `string \| string[] \| Record<string, boolean>` | `undefined` |
| `style` | 自定义样式    | `string \| Record<string, string \| number>`    | `undefined` |

### CarouselItem Slots

| 插槽名    | 说明       |
| --------- | ---------- |
| `default` | 轮播项内容 |

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持屏幕阅读器
- 支持键盘导航
- 支持减少动画偏好设置

## 主题定制

可以通过 CSS 变量自定义轮播组件样式：

```css
:root {
  --ex-carousel-bg: var(--ex-color-bg-secondary);
  --ex-carousel-border-color: var(--ex-color-border-primary);
  --ex-carousel-arrow-bg: rgba(15, 23, 32, 0.8);
  --ex-carousel-indicator-color: rgba(255, 255, 255, 0.3);
  --ex-carousel-indicator-active-color: var(--ex-color-neon-blue-500);
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

.demo-slide {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 24px;
}

.demo-slide h2,
.demo-slide h3 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.demo-slide p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.demo-slide h4 {
  color: var(--ex-color-text-secondary);
}
</style>
