# ExSkeleton 骨架屏组件

## 概述

ExSkeleton 是一个功能强大的骨架屏组件，用于在内容加载时提供占位符，提升用户体验。组件采用游戏主题的霓虹风格设计，支持多种动画效果和预设变体。

## 特性

✅ **多种动画效果**：脉冲、波浪、无动画
✅ **丰富的预设变体**：文本、头像、标题、段落、图片、按钮、卡片等
✅ **高度可定制**：支持自定义尺寸、形状、宽度等
✅ **列表支持**：通过 count 属性轻松创建列表骨架屏
✅ **游戏主题**：霓虹蓝/粉渐变背景，发光边框效果
✅ **响应式设计**：移动端优化
✅ **无障碍支持**：完整的 ARIA 属性和屏幕阅读器支持
✅ **TypeScript**：完整的类型定义

## 文件结构

```
src/components/skeleton/
├── ExSkeleton.vue       # 组件实现
├── ExSkeleton.scss      # 组件样式
├── types.ts             # TypeScript 类型定义
├── index.ts             # 导出文件
└── README.md            # 组件说明（本文件）
```

## 快速开始

```vue
<template>
  <!-- 基础用法 -->
  <ExSkeleton />

  <!-- 复杂组合 -->
  <ExSkeleton
    avatar
    :title="true"
    :rows="4"
  />

  <!-- 显示真实内容 -->
  <ExSkeleton
    :loading="loading"
    avatar
    :title="true"
    :rows="3"
  >
    <template #content>
      <div>真实内容</div>
    </template>
  </ExSkeleton>
</template>

<script setup>
import { ref } from 'vue';
import { ExSkeleton } from 'vue-ex-ui';

const loading = ref(true);
</script>
```

## 主要属性

| 属性      | 说明             | 类型                        | 默认值  |
| --------- | ---------------- | --------------------------- | ------- |
| loading   | 是否显示加载状态 | boolean                     | true    |
| animation | 动画类型         | 'pulse' \| 'wave' \| 'none' | 'pulse' |
| variant   | 变体类型         | string                      | 'text'  |
| avatar    | 是否显示头像     | boolean                     | false   |
| title     | 是否显示标题     | boolean                     | false   |
| rows      | 段落行数         | number                      | 3       |
| count     | 重复次数         | number                      | 1       |

## 设计特点

### 游戏主题风格

- **霓虹渐变背景**：使用 `rgba(0, 240, 255, 0.1)` 到 `rgba(255, 0, 127, 0.1)` 的渐变
- **发光边框**：`rgba(0, 240, 255, 0.2)` 的霓虹蓝边框
- **动画效果**：脉冲动画带有霓虹发光效果

### 动画实现

- **脉冲动画**：透明度和阴影变化，营造呼吸感
- **波浪动画**：渐变光带从左到右扫过，模拟加载进度

### 响应式设计

- 移动端自动调整头像和文本尺寸
- 支持 `prefers-reduced-motion` 减少动画
- 高对比度模式增强边框

## 使用场景

1. **列表加载**：使用 count 属性创建多个骨架屏
2. **卡片加载**：使用 variant="card" 快速创建卡片占位符
3. **用户信息**：使用 avatar + title + rows 组合
4. **文章内容**：使用 variant="article" 预设
5. **自定义布局**：使用 variant="custom" 完全自定义

## 注意事项

1. 骨架屏应该尽可能接近真实内容的布局
2. 使用 loading 属性控制显示/隐藏
3. 真实内容应放在 content 插槽中
4. 列表场景建议使用 count 属性而不是手动循环

## 相关组件

- **ExLoading**：全局加载指示器
- **ExLoadingBar**：顶部加载条
- **ExEmpty**：空状态提示

## 文档

完整文档请查看：`docs/components/skeleton.md`
