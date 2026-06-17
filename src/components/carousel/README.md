# ExCarousel 组件

用于展示轮播内容的组件，支持自动播放、手势滑动、多种切换效果。

## 特性

✅ **自动播放** - 支持自动轮播
✅ **手势滑动** - 支持触摸滑动切换
✅ **多种效果** - 滑动、淡入淡出
✅ **双向轮播** - 水平、垂直方向
✅ **循环播放** - 可选的循环模式
✅ **指示器** - 多位置指示器
✅ **箭头导航** - 可配置的箭头显示
✅ **响应式** - 移动端优化
✅ **无障碍** - ARIA 支持

## 快速开始

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

## 文件结构

```
src/components/carousel/
├── ExCarousel.vue          # 主组件
├── ExCarouselItem.vue      # 轮播项组件
├── ExCarousel.scss         # 组件样式
├── types.ts                # TypeScript 类型定义
├── index.ts                # 导出文件
├── locale.ts               # 多语言
└── README.md               # 组件说明
```

## 主要功能

### 1. 自动播放
- 可配置播放间隔
- 悬停暂停
- 手动控制

### 2. 切换效果
- 滑动效果（默认）
- 淡入淡出效果

### 3. 方向控制
- 水平轮播（默认）
- 垂直轮播

### 4. 指示器
- 多位置选择（顶部、底部、左侧、右侧、外部）
- 可隐藏

### 5. 箭头导航
- 始终显示
- 悬停显示（默认）
- 不显示

## 使用示例

查看 `docs/components/carousel.md` 获取完整的使用示例和 API 文档。

## 测试

```bash
npm run test -- carousel.test.ts
```
