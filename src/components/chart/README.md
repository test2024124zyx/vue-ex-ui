# ExChart 图表组件

基于 ECharts 的专业图表组件，支持所有 ECharts 图表类型，提供赛博朋克风格的霓虹发光效果。

## 特性

- ✅ **完整的 ECharts 支持** - 支持所有 ECharts 图表类型（折线图、柱状图、饼图、散点图、雷达图、仪表盘等）
- ✅ **赛博朋克风格** - 内置霓虹蓝、霓虹粉等主题，支持霓虹发光效果
- ✅ **响应式设计** - 自动调整大小，支持 ResizeObserver
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **国际化** - 中英文双语支持
- ✅ **加载状态** - 内置加载动画和空状态
- ✅ **事件系统** - 完整的 ECharts 事件支持
- ✅ **无障碍** - ARIA 支持，键盘导航
- ✅ **性能优化** - 防抖调整大小，硬件加速

## 基础用法

```vue
<template>
  <ex-chart :option="chartOption" height="400px" />
</template>

<script setup>
import { ref } from 'vue';

const chartOption = ref({
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
      smooth: true,
    },
  ],
});
</script>
```

## 支持的图表类型

- **折线图** (line) - 展示趋势数据
- **柱状图** (bar) - 展示对比数据
- **饼图** (pie) - 展示占比数据
- **散点图** (scatter) - 展示分布数据
- **雷达图** (radar) - 展示多维数据
- **仪表盘** (gauge) - 展示进度数据
- **漏斗图** (funnel) - 展示流程数据
- **K线图** (candlestick) - 展示金融数据
- **热力图** (heatmap) - 展示密度数据
- **树图** (tree) - 展示层级数据
- **矩形树图** (treemap) - 展示层级占比
- **旭日图** (sunburst) - 展示层级占比
- **关系图** (graph) - 展示网络关系
- **桑基图** (sankey) - 展示流向数据
- **箱线图** (boxplot) - 展示统计数据
- **平行坐标** (parallel) - 展示多维数据
- **自定义图表** (custom) - 自定义渲染

## 主题系统

图表组件使用全局主题配置，通过 `ConfigProvider` 设置：

```vue
<template>
  <ex-config-provider theme="neon-pink" :neon-effect="true">
    <ex-chart :option="chartOption" />
  </ex-config-provider>
</template>
```

支持的主题：

- **neon-blue** - 霓虹蓝主题（默认）
- **neon-pink** - 霓虹粉主题
- **dark** - 暗黑主题
- **light** - 明亮主题

霓虹发光效果由全局配置 `neonEffect` 控制。

## 响应式

自动调整大小，支持防抖延迟：

```vue
<ex-chart :option="chartOption" :auto-resize="true" :resize-delay="300" />
```

## 加载状态

显示加载动画：

```vue
<ex-chart :option="chartOption" :loading="true" loading-text="数据加载中..." />
```

## 空状态

自定义空状态：

```vue
<ex-chart :option="emptyOption">
  <template #empty>
    <div>暂无数据</div>
  </template>
</ex-chart>
```

## 事件处理

监听图表事件：

```vue
<ex-chart :option="chartOption" @click="handleClick" @finished="handleFinished" />
```

## 方法调用

通过 ref 调用图表方法：

```vue
<template>
  <ex-chart ref="chartRef" :option="chartOption" />
</template>

<script setup>
import { ref } from 'vue';

const chartRef = ref();

// 获取 ECharts 实例
const instance = chartRef.value?.getInstance();

// 调整大小
chartRef.value?.resize();

// 清空图表
chartRef.value?.clear();

// 导出图片
const dataURL = chartRef.value?.getDataURL();
</script>
```

## 工具函数

提供了一系列工具函数：

```typescript
import {
  getChartTheme,
  applyNeonGlow,
  createGradientColor,
  formatNumber,
  createDefaultToolbox,
  createDefaultDataZoom,
  createDefaultLegend,
  createDefaultTooltip,
  createDefaultGrid,
} from 'vue-ex-ui';

// 获取主题配置
const theme = getChartTheme('neon-blue');

// 应用霓虹发光
const glowingOption = applyNeonGlow(option, 'neon-blue');

// 创建渐变色
const gradient = createGradientColor('#00f0ff', '#ff007f');

// 格式化数字
const formatted = formatNumber(1234567); // "1.23M"
```

## 性能优化

- 使用 `shallowRef` 存储 ECharts 实例，避免深度响应
- 防抖调整大小，避免频繁重绘
- 支持 Canvas 和 SVG 渲染器
- 支持硬件加速

## 无障碍

- 支持 ARIA 标签
- 支持键盘导航
- 支持屏幕阅读器

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 依赖

- Vue 3.4+
- ECharts 6.0+

## 许可证

MIT
