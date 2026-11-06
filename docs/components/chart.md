# Chart 图表

基于 ECharts 的专业图表组件，支持所有 ECharts 图表类型，提供赛博朋克风格的霓虹发光效果。

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 折线图配置
const lineOption = ref({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yAxis: { type: 'value' },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'line',
    smooth: true
  }]
})

// 柱状图配置
const barOption = ref({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yAxis: { type: 'value' },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'bar'
  }]
})

// 饼图配置
const pieOption = ref({
  series: [{
    type: 'pie',
    radius: '50%',
    data: [
      { value: 1048, name: 'Search Engine' },
      { value: 735, name: 'Direct' },
      { value: 580, name: 'Email' },
      { value: 484, name: 'Union Ads' },
      { value: 300, name: 'Video Ads' }
    ]
  }]
})

// 散点图配置
const scatterOption = ref({
  xAxis: {},
  yAxis: {},
  series: [{
    type: 'scatter',
    data: [
      [10, 8.04],
      [8, 6.95],
      [13, 7.58],
      [9, 8.81],
      [11, 8.33],
      [14, 9.96],
      [6, 7.24],
      [4, 4.26],
      [12, 10.84],
      [7, 4.82],
      [5, 5.68]
    ]
  }]
})

// 雷达图配置
const radarOption = ref({
  tooltip: { trigger: 'item' },
  legend: { data: ['预算分配', '实际支出'], bottom: 0 },
  radar: {
    indicator: [
      { name: '销售', max: 100 },
      { name: '行政', max: 100 },
      { name: '信息技术', max: 100 },
      { name: '客户支持', max: 100 },
      { name: '研发', max: 100 },
      { name: '市场', max: 100 }
    ],
    axisName: { color: 'var(--ex-color-text-secondary)' },
    splitLine: { lineStyle: { color: 'var(--ex-color-border-primary)' } },
    splitArea: { show: true }
  },
  series: [{
    type: 'radar',
    data: [
      { value: [42, 30, 20, 35, 50, 98], name: '预算分配', areaStyle: { opacity: 0.3 } },
      { value: [50, 14, 28, 26, 42, 21], name: '实际支出', areaStyle: { opacity: 0.3 } }
    ]
  }]
})

// 仪表盘配置
const gaugeOption = ref({
  series: [{
    type: 'gauge',
    progress: {
      show: true
    },
    detail: {
      valueAnimation: true,
      formatter: '{value}%'
    },
    data: [{ value: 75, name: 'Progress' }]
  }]
})

// 完整配置示例
const fullOption = ref({
  title: {
    text: '销售数据统计',
    subtext: '2024年度',
    left: 'center',
    top: 10,
    textStyle: { fontSize: 18, fontWeight: 'bold' },
    subtextStyle: { fontSize: 14 }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
  },
  legend: { data: ['销售额', '利润'], bottom: 5, left: 'center' },
  toolbox: {
    show: true,
    right: 20,
    top: 10,
    feature: {
      saveAsImage: { title: '保存为图片', pixelRatio: 2 },
      dataView: { title: '数据视图', readOnly: false, lang: ['数据视图', '关闭', '刷新'] },
      restore: { title: '还原' },
      dataZoom: { title: { zoom: '区域缩放', back: '还原缩放' } },
      magicType: {
        title: { line: '切换为折线图', bar: '切换为柱状图' },
        type: ['line', 'bar']
      }
    }
  },
  grid: { left: 80, right: 40, bottom: 80, top: 80, containLabel: false },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    name: '月份',
    nameLocation: 'center',
    nameGap: 35,
    nameTextStyle: { fontSize: 14, fontWeight: 'bold' },
    axisLabel: { fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    name: '金额（万元）',
    nameLocation: 'center',
    nameGap: 60,
    nameTextStyle: { fontSize: 14, fontWeight: 'bold' },
    axisLabel: { fontSize: 12, formatter: '{value}' }
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      emphasis: { focus: 'series' }
    },
    {
      name: '利润',
      type: 'line',
      data: [60, 100, 75, 40, 35, 55],
      smooth: true,
      emphasis: { focus: 'series' }
    }
  ]
})

// 平滑面积图（弧形折线 + 渐变填充）
const areaLineOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: { type: 'value' },
  series: [{
    name: '活跃用户',
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: { width: 3 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(41, 171, 226, 0.55)' },
          { offset: 1, color: 'rgba(41, 171, 226, 0.02)' }
        ]
      }
    }
  }]
})

// 动态实时折线（每秒推入一个新数据点）
const genPoint = (i) => Math.round(60 + Math.sin(i / 3) * 30 + Math.random() * 20)
const dynamicSeed = Array.from({ length: 20 }, (_, i) => genPoint(i))
const dynamicTime = Array.from({ length: 20 }, (_, i) => `${i}s`)
let dynamicCursor = 20
const buildDynamicOption = () => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', boundaryGap: false, data: [...dynamicTime] },
  yAxis: { type: 'value', max: 140 },
  series: [{
    name: '实时吞吐',
    type: 'line',
    smooth: true,
    showSymbol: false,
    data: [...dynamicSeed],
    lineStyle: { width: 2 },
    areaStyle: { opacity: 0.15 }
  }]
})
const dynamicLineOption = ref(buildDynamicOption())
let dynamicTimer
onMounted(() => {
  dynamicTimer = setInterval(() => {
    dynamicSeed.shift()
    dynamicSeed.push(genPoint(dynamicCursor))
    dynamicTime.shift()
    dynamicTime.push(`${dynamicCursor}s`)
    dynamicCursor += 1
    // 替换整个 option 引用以触发图表更新
    dynamicLineOption.value = buildDynamicOption()
  }, 1000)
})
onUnmounted(() => clearInterval(dynamicTimer))

// 加载状态（注意：这个示例会在2秒后自动隐藏加载状态）
const loading = ref(false)

// 空状态
const emptyOption = ref({
  series: []
})

// 事件处理
const handleClick = (params) => {
  console.log('Chart clicked:', params)
}

const handleFinished = () => {
  console.log('Chart render finished')
}
</script>

## 基础用法

最简单的图表用法。

::: raw
<div class="demo-container">
  <ex-chart :option="lineOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="lineOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const lineOption = ref({
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

:::

## 柱状图

使用柱状图展示数据。

::: raw
<div class="demo-container">
  <ex-chart :option="barOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="barOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const barOption = ref({
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
      type: 'bar',
    },
  ],
});
</script>
```

:::

## 饼图

使用饼图展示占比数据。

::: raw
<div class="demo-container">
  <ex-chart :option="pieOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="pieOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const pieOption = ref({
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' },
      ],
    },
  ],
});
</script>
```

:::

## 散点图

使用散点图展示分布数据。

::: raw
<div class="demo-container">
  <ex-chart :option="scatterOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="scatterOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const scatterOption = ref({
  xAxis: {},
  yAxis: {},
  series: [
    {
      type: 'scatter',
      data: [
        [10, 8.04],
        [8, 6.95],
        [13, 7.58],
        [9, 8.81],
        [11, 8.33],
        [14, 9.96],
        [6, 7.24],
        [4, 4.26],
        [12, 10.84],
        [7, 4.82],
        [5, 5.68],
      ],
    },
  ],
});
</script>
```

:::

## 雷达图

使用雷达图展示多维数据。

::: raw
<div class="demo-container">
  <ex-chart :option="radarOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="radarOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const radarOption = ref({
  tooltip: {
    trigger: 'item',
  },
  legend: {
    data: ['预算分配', '实际支出'],
    bottom: 0,
  },
  radar: {
    indicator: [
      { name: '销售', max: 7000 },
      { name: '行政', max: 16000 },
      { name: '信息技术', max: 30000 },
      { name: '客户支持', max: 40000 },
      { name: '研发', max: 55000 },
      { name: '市场', max: 25000 },
    ],
    splitNumber: 5,
    // 禁用 alignTicks 避免刻度不可读警告
    alignTicks: false,
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: '预算分配',
          areaStyle: { opacity: 0.3 },
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: '实际支出',
          areaStyle: { opacity: 0.3 },
        },
      ],
    },
  ],
});
</script>
```

:::

## 平滑面积图

弧形折线配合渐变填充，常用于趋势展示。

::: raw
<div class="demo-container">
  <ex-chart :option="areaLineOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="areaLineOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const areaLineOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      lineStyle: { width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(41, 171, 226, 0.55)' },
            { offset: 1, color: 'rgba(41, 171, 226, 0.02)' },
          ],
        },
      },
    },
  ],
});
</script>
```

:::

## 动态实时折线

通过定时替换 `option` 实现实时数据流动效果（每秒推入一个新数据点）。

::: raw
<div class="demo-container">
  <ex-chart :option="dynamicLineOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="dynamicLineOption"
    height="300px"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const data = Array.from({ length: 20 }, (_, i) => Math.round(60 + Math.sin(i / 3) * 30));
const time = Array.from({ length: 20 }, (_, i) => `${i}s`);
let cursor = 20;

const build = () => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', boundaryGap: false, data: [...time] },
  yAxis: { type: 'value', max: 140 },
  series: [
    {
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: [...data],
      areaStyle: { opacity: 0.15 },
    },
  ],
});

const dynamicLineOption = ref(build());
let timer;
onMounted(() => {
  timer = setInterval(() => {
    data.shift();
    data.push(Math.round(60 + Math.sin(cursor / 3) * 30 + Math.random() * 20));
    time.shift();
    time.push(`${cursor}s`);
    cursor++;
    dynamicLineOption.value = build(); // 替换引用触发更新
  }, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>
```

:::

## 仪表盘

使用仪表盘展示进度数据。

::: raw
<div class="demo-container">
  <ex-chart :option="gaugeOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="gaugeOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const gaugeOption = ref({
  series: [
    {
      type: 'gauge',
      progress: {
        show: true,
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
      },
      data: [{ value: 75, name: 'Progress' }],
    },
  ],
});
</script>
```

:::

## 完整配置

展示包含标题、图例、工具栏、提示框的完整图表。

::: raw
<div class="demo-container">
  <ex-chart :option="fullOption" height="400px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="fullOption"
    height="400px"
  />
</template>

<script setup>
import { ref } from 'vue';

const fullOption = ref({
  title: {
    text: '销售数据统计',
    subtext: '2024年度',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  legend: {
    data: ['销售额', '利润'],
    bottom: 10,
  },
  toolbox: {
    show: true,
    feature: {
      saveAsImage: { title: '保存为图片' },
      dataView: { title: '数据视图', readOnly: false },
      restore: { title: '还原' },
      dataZoom: { title: { zoom: '区域缩放', back: '还原缩放' } },
      magicType: {
        title: { line: '切换为折线图', bar: '切换为柱状图' },
        type: ['line', 'bar'],
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    name: '月份',
    nameLocation: 'middle',
    nameGap: 30,
  },
  yAxis: {
    type: 'value',
    name: '金额（万元）',
    nameLocation: 'middle',
    nameGap: 50,
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
    },
    {
      name: '利润',
      type: 'line',
      data: [60, 100, 75, 40, 35, 55],
      smooth: true,
    },
  ],
});
</script>
```

:::

## 加载状态

显示图表加载动画。

::: raw
<div class="demo-container">
  <ex-space direction="vertical" style="width: 100%">
    <ex-button @click="loading = !loading">
      {{ loading ? '隐藏加载' : '显示加载' }}
    </ex-button>
    <ex-chart :option="lineOption" :loading="loading" loading-text="数据加载中..." height="300px" />
  </ex-space>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-space
    direction="vertical"
    style="width: 100%"
  >
    <ex-button @click="loading = !loading">
      {{ loading ? '隐藏加载' : '显示加载' }}
    </ex-button>
    <ex-chart
      :option="lineOption"
      :loading="loading"
      loading-text="数据加载中..."
      height="300px"
    />
  </ex-space>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);

const lineOption = ref({
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

:::

## 空状态

当没有数据时显示空状态。

::: raw
<div class="demo-container">
  <ex-chart :option="emptyOption" height="300px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="emptyOption"
    height="300px"
  />
</template>

<script setup>
import { ref } from 'vue';

const emptyOption = ref({
  series: [],
});
</script>
```

:::

## 不同尺寸

提供三种尺寸的图表。

::: raw
<div class="demo-container">
  <ex-chart :option="lineOption" size="small" height="200px" />
  <ex-chart :option="lineOption" size="medium" height="300px" />
  <ex-chart :option="lineOption" size="large" height="400px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="lineOption"
    size="small"
    height="200px"
  />
  <ex-chart
    :option="lineOption"
    size="medium"
    height="300px"
  />
  <ex-chart
    :option="lineOption"
    size="large"
    height="400px"
  />
</template>
```

:::

## 事件处理

监听图表事件。

::: raw
<div class="demo-container">
  <ex-chart 
    :option="lineOption" 
    height="300px"
    @click="handleClick"
    @finished="handleFinished"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-chart
    :option="lineOption"
    height="300px"
    @click="handleClick"
    @finished="handleFinished"
  />
</template>

<script setup>
const handleClick = params => {
  console.log('Chart clicked:', params);
};

const handleFinished = () => {
  console.log('Chart render finished');
};
</script>
```

:::

## API

### Props

| 参数               | 说明                     | 类型            | 可选值                 | 默认值 |
| ------------------ | ------------------------ | --------------- | ---------------------- | ------ |
| option             | ECharts 配置选项         | EChartsOption   | —                      | —      |
| size               | 图表尺寸                 | string          | small / medium / large | medium |
| width              | 图表宽度                 | string / number | —                      | 100%   |
| height             | 图表高度                 | string / number | —                      | 400px  |
| loading            | 是否显示加载动画         | boolean         | —                      | false  |
| loading-text       | 加载文本                 | string          | —                      | —      |
| auto-resize        | 是否自动调整大小         | boolean         | —                      | true   |
| resize-delay       | 调整大小防抖延迟（毫秒） | number          | —                      | 300    |
| show-toolbox       | 是否显示工具栏           | boolean         | —                      | false  |
| show-data-zoom     | 是否显示数据缩放         | boolean         | —                      | false  |
| show-legend        | 是否显示图例             | boolean         | —                      | true   |
| show-tooltip       | 是否显示提示框           | boolean         | —                      | true   |
| animation-duration | 动画时长（毫秒）         | number          | —                      | 1000   |
| renderer           | 图表渲染器               | string          | canvas / svg           | canvas |
| init-options       | 初始化配置               | EChartsInitOpts | —                      | —      |
| aria-label         | 无障碍标签               | string          | —                      | —      |

`show-tooltip` 控制提示框总开关；`option.tooltip` 中显式提供的 `appendToBody` 与 `confine` 会被保留。系统启用“减少动态效果”时，组件会关闭 ECharts 动画并监听偏好变化。

### Events

| 事件名              | 说明                 | 回调参数                 |
| ------------------- | -------------------- | ------------------------ |
| init                | 图表初始化完成       | (instance: ECharts)      |
| click               | 图表点击事件         | (params: ECElementEvent) |
| dblclick            | 图表双击事件         | (params: ECElementEvent) |
| mouseover           | 图表鼠标移入事件     | (params: ECElementEvent) |
| mouseout            | 图表鼠标移出事件     | (params: ECElementEvent) |
| mousemove           | 图表鼠标移动事件     | (params: ECElementEvent) |
| datazoom            | 图表数据缩放事件     | (params: ECElementEvent) |
| legendselectchanged | 图表图例选择改变事件 | (params: ECElementEvent) |
| finished            | 图表渲染完成事件     | —                        |
| updated             | 图表更新完成事件     | —                        |
| error               | 图表错误事件         | (error: Error)           |

### Methods

| 方法名           | 说明                                           | 参数                                          |
| ---------------- | ---------------------------------------------- | --------------------------------------------- |
| getInstance      | 获取 ECharts 实例                              | —                                             |
| getElement       | 获取图表 DOM 元素                              | —                                             |
| resize           | 手动调整图表大小                               | (opts?: ResizeOpts)                           |
| clear            | 清空图表                                       | —                                             |
| dispose          | 销毁图表实例                                   | —                                             |
| setOption        | 设置图表配置                                   | (option: EChartsOption, opts?: SetOptionOpts) |
| showLoading      | 显示加载动画                                   | (type?: string, opts?: object)                |
| hideLoading      | 隐藏加载动画                                   | —                                             |
| getDataURL       | 获取图表数据 URL                               | (opts?: object)                               |
| getSvgDataURL    | 获取当前图表 SVG 数据 URL（Canvas/SVG 均支持） | —                                             |
| convertToPixel   | 转换坐标                                       | (finder: ConvertFinder, value: unknown)       |
| convertFromPixel | 转换坐标                                       | (finder: ConvertFinder, value: unknown)       |

### Slots

| 插槽名 | 说明             |
| ------ | ---------------- |
| empty  | 自定义空状态内容 |

### 键盘导航

普通折线、柱状、饼图、散点等可从 `series.data` 或直接 `dataset.source` 解析的数据，会提供单一 Tab 入口。方向键移动数据点，Home/End 跳到首尾，Enter/Space 触发当前数据点的 `click`，Escape 清除高亮和提示，Tab/Shift+Tab 离开图表。

解析会保留系列与数据的真实索引、当前图例隐藏状态、分类轴绑定、`encode` 和按行组织的数据集。自定义、层级及其他特殊系列，以及依赖 `dataset.transform` 的数据，目前不提供自动键盘导航；渲染和原有鼠标交互不受影响。

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
