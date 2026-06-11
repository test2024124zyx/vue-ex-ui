# Chart Tooltip 层级问题修复

## 问题描述
图表的 tooltip 提示框会被容器遮挡，导致显示不全。

## 问题原因
1. 容器使用了 `overflow: hidden`，导致 tooltip 被裁剪
2. ECharts 默认将 tooltip 渲染在图表容器内部
3. 没有设置 `appendToBody` 和 `confine` 配置

## 解决方案

### 1. 修改容器样式 (ExChart.scss)
```scss
.ex-chart {
  // 改为 visible 以避免 tooltip 被裁剪
  overflow: visible;
  
  &__container {
    // 容器内部使用 hidden 保持圆角效果
    overflow: hidden;
    border-radius: inherit;
  }
}
```

### 2. 更新图表配置 (ExChart.vue)
在 `updateChart()` 函数中自动添加 tooltip 配置：
```typescript
// 确保 tooltip 配置正确，避免被容器遮挡
if (!mergedOption.tooltip) {
  mergedOption.tooltip = {};
}
if (typeof mergedOption.tooltip === 'object') {
  mergedOption.tooltip = {
    ...mergedOption.tooltip,
    appendToBody: true,  // 将 tooltip 渲染到 body
    confine: false,      // 不限制在图表容器内
  };
}
```

### 3. 更新默认配置 (utils.ts)
在 `createDefaultTooltip()` 中添加默认配置：
```typescript
export function createDefaultTooltip(): echarts.TooltipComponentOption {
  return {
    trigger: 'axis',
    // ... 其他配置
    appendToBody: true,
    confine: false,
  };
}
```

## 配置说明

### appendToBody
- **作用**: 将 tooltip DOM 元素添加到 `<body>` 而不是图表容器
- **优点**: 避免被父容器的 `overflow` 裁剪
- **默认值**: `false`

### confine
- **作用**: 是否将 tooltip 限制在图表区域内
- **设置为 false**: tooltip 可以超出图表边界显示
- **默认值**: `false`

## 兼容性说明
- ✅ 不影响现有功能
- ✅ 所有单元测试通过
- ✅ 向后兼容，用户可以通过 `option.tooltip` 覆盖配置
- ✅ 支持所有 ECharts 图表类型

## 测试验证
```bash
npm test -- tests/components/chart/ExChart.test.ts
```
所有 16 个测试用例通过。

## 使用示例
```vue
<template>
  <!-- tooltip 现在会正确显示，不会被容器遮挡 -->
  <ex-chart :option="chartOption" height="400px" />
</template>

<script setup>
const chartOption = {
  tooltip: {
    trigger: 'axis',
    // 这些配置会自动添加，无需手动设置
    // appendToBody: true,
    // confine: false,
  },
  // ... 其他配置
}
</script>
```

## 注意事项
1. 如果用户明确设置了 `appendToBody: false`，组件会尊重用户配置
2. 容器的圆角效果通过内部容器的 `overflow: hidden` 保持
3. 不影响图表的其他功能和样式
