# Progress 进度条

用于展示操作进度，告知用户当前状态和预期。带有霓虹发光效果的赛博朋克主题进度条组件。

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const percentage = ref(0)
const customPercentage = ref(50)
const wavePercentage = ref(45)
const waveCirclePercentage = ref(65)

const increase = () => {
  percentage.value += 10
  if (percentage.value > 100) {
    percentage.value = 100
  }
}

const decrease = () => {
  percentage.value -= 10
  if (percentage.value < 0) {
    percentage.value = 0
  }
}

const customColors = [
  { color: '#ef4444', percentage: 20 },
  { color: '#f59e0b', percentage: 40 },
  { color: '#eab308', percentage: 60 },
  { color: '#84cc16', percentage: 80 },
  { color: '#10b981', percentage: 100 }
]

const customColorMethod = (percentage) => {
  if (percentage < 30) {
    return '#ef4444'
  } else if (percentage < 70) {
    return '#f59e0b'
  } else {
    return '#10b981'
  }
}

const format = (percentage) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}

// 自动演示
let autoInterval = null

onMounted(() => {
  // 自动增加进度演示
  autoInterval = setInterval(() => {
    wavePercentage.value = (wavePercentage.value + 1) % 101
    waveCirclePercentage.value = (waveCirclePercentage.value + 1) % 101
  }, 100)
})

onBeforeUnmount(() => {
  if (autoInterval) {
    clearInterval(autoInterval)
  }
})
</script>

## 基础用法

Progress 组件设置 `percentage` 属性即可，表示进度条对应的百分比。

<div class="demo-container">
  <ExProgress :percentage="50" />
  <ExProgress :percentage="100" status="success" />
  <ExProgress :percentage="80" status="warning" />
  <ExProgress :percentage="30" status="exception" />
</div>

```vue
<template>
  <ExProgress :percentage="50" />
  <ExProgress :percentage="100" status="success" />
  <ExProgress :percentage="80" status="warning" />
  <ExProgress :percentage="30" status="exception" />
</template>
```

## 百分比内显

通过 `text-inside` 属性可以将进度条文字放在进度条内部。

<div class="demo-container">
  <ExProgress :percentage="70" text-inside :stroke-width="20" />
  <ExProgress :percentage="100" text-inside :stroke-width="20" status="success" />
  <ExProgress :percentage="80" text-inside :stroke-width="20" status="warning" />
  <ExProgress :percentage="50" text-inside :stroke-width="20" status="exception" />
</div>

```vue
<template>
  <ExProgress :percentage="70" text-inside :stroke-width="20" />
  <ExProgress :percentage="100" text-inside :stroke-width="20" status="success" />
  <ExProgress :percentage="80" text-inside :stroke-width="20" status="warning" />
  <ExProgress :percentage="50" text-inside :stroke-width="20" status="exception" />
</template>
```

## 自定义颜色

可以通过 `color` 属性来设置进度条的颜色。支持字符串、函数和渐变色数组。

<div class="demo-container">
  <ExProgress :percentage="70" color="#00f0ff" />
  <ExProgress :percentage="80" color="#ff007f" />
  <ExProgress :percentage="60" :color="customColorMethod" />
  <ExProgress :percentage="100" :color="customColors" />
</div>

```vue
<script setup>
const customColors = [
  { color: '#ef4444', percentage: 20 },
  { color: '#f59e0b', percentage: 40 },
  { color: '#eab308', percentage: 60 },
  { color: '#84cc16', percentage: 80 },
  { color: '#10b981', percentage: 100 },
];

const customColorMethod = percentage => {
  if (percentage < 30) {
    return '#ef4444';
  } else if (percentage < 70) {
    return '#f59e0b';
  } else {
    return '#10b981';
  }
};
</script>

<template>
  <ExProgress :percentage="70" color="#00f0ff" />
  <ExProgress :percentage="80" color="#ff007f" />
  <ExProgress :percentage="60" :color="customColorMethod" />
  <ExProgress :percentage="100" :color="customColors" />
</template>
```

## 条纹进度条

通过 `striped` 属性可以显示条纹，`striped-flow` 属性可以让条纹流动。

<div class="demo-container">
  <ExProgress :percentage="70" striped :stroke-width="20" />
  <ExProgress :percentage="80" striped striped-flow :stroke-width="20" status="success" />
  <ExProgress :percentage="60" striped striped-flow :stroke-width="20" status="warning" />
  <ExProgress :percentage="50" striped striped-flow :stroke-width="20" status="exception" />
</div>

```vue
<template>
  <ExProgress :percentage="70" striped :stroke-width="20" />
  <ExProgress :percentage="80" striped striped-flow :stroke-width="20" status="success" />
  <ExProgress :percentage="60" striped striped-flow :stroke-width="20" status="warning" />
  <ExProgress :percentage="50" striped striped-flow :stroke-width="20" status="exception" />
</template>
```

## 自定义文字格式

通过 `format` 属性可以自定义文字格式。

<div class="demo-container">
  <ExProgress :percentage="100" :format="format" />
  <ExProgress :percentage="100" :format="(percentage) => `已完成 ${percentage}%`" />
</div>

```vue
<script setup>
const format = percentage => {
  return percentage === 100 ? '完成' : `${percentage}%`;
};
</script>

<template>
  <ExProgress :percentage="100" :format="format" />
  <ExProgress :percentage="100" :format="percentage => `已完成 ${percentage}%`" />
</template>
```

## 不显示文字

通过 `show-text` 属性可以隐藏进度文字。

<div class="demo-container">
  <ExProgress :percentage="50" :show-text="false" />
  <ExProgress :percentage="100" :show-text="false" status="success" />
</div>

```vue
<template>
  <ExProgress :percentage="50" :show-text="false" />
  <ExProgress :percentage="100" :show-text="false" status="success" />
</template>
```

## 不显示图标

通过 `show-icon` 属性可以隐藏状态图标。

<div class="demo-container">
  <ExProgress :percentage="100" status="success" :show-icon="false" />
  <ExProgress :percentage="50" status="exception" :show-icon="false" />
</div>

```vue
<template>
  <ExProgress :percentage="100" status="success" :show-icon="false" />
  <ExProgress :percentage="50" status="exception" :show-icon="false" />
</template>
```

## 动态控制

通过按钮控制进度条的进度。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <ExProgress :percentage="percentage" />
  <div style="display: flex; gap: 12px;">
    <ExButton @click="decrease">-</ExButton>
    <ExButton @click="increase">+</ExButton>
  </div>
</div>

```vue
<script setup>
import { ref } from 'vue';

const percentage = ref(0);

const increase = () => {
  percentage.value += 10;
  if (percentage.value > 100) {
    percentage.value = 100;
  }
};

const decrease = () => {
  percentage.value -= 10;
  if (percentage.value < 0) {
    percentage.value = 0;
  }
};
</script>

<template>
  <ExProgress :percentage="percentage" />
  <div>
    <ExButton @click="decrease">-</ExButton>
    <ExButton @click="increase">+</ExButton>
  </div>
</template>
```

## 不同尺寸

通过 `stroke-width` 属性可以设置进度条的高度。

<div class="demo-container">
  <ExProgress :percentage="50" :stroke-width="6" />
  <ExProgress :percentage="50" :stroke-width="8" />
  <ExProgress :percentage="50" :stroke-width="12" />
  <ExProgress :percentage="50" :stroke-width="16" />
</div>

```vue
<template>
  <ExProgress :percentage="50" :stroke-width="6" />
  <ExProgress :percentage="50" :stroke-width="8" />
  <ExProgress :percentage="50" :stroke-width="12" />
  <ExProgress :percentage="50" :stroke-width="16" />
</template>
```

## 赛博朋克主题示例

展示赛博朋克场景中的进度条应用。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 20px;">
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/heart-fill.svg" alt="生命值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #ef4444);" />
      生命值
    </div>
    <ExProgress :percentage="85" color="#ef4444" :stroke-width="16" text-inside striped striped-flow />
  </div>
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/flashlight-fill.svg" alt="能量值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #3b82f6);" />
      能量值
    </div>
    <ExProgress :percentage="60" color="#3b82f6" :stroke-width="16" text-inside striped striped-flow />
  </div>
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/shield-fill.svg" alt="护盾值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #10b981);" />
      护盾值
    </div>
    <ExProgress :percentage="40" color="#10b981" :stroke-width="16" text-inside striped striped-flow />
  </div>
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/star-fill.svg" alt="经验值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #f59e0b);" />
      经验值 (等级 50)
    </div>
    <ExProgress :percentage="75" :color="customColors" :stroke-width="16" text-inside striped striped-flow />
  </div>
</div>

```vue
<template>
  <div>
    <div>生命值</div>
    <ExProgress
      :percentage="85"
      color="#ef4444"
      :stroke-width="16"
      text-inside
      striped
      striped-flow
    />
  </div>

  <div>
    <div>能量值</div>
    <ExProgress
      :percentage="60"
      color="#3b82f6"
      :stroke-width="16"
      text-inside
      striped
      striped-flow
    />
  </div>

  <div>
    <div>护盾值</div>
    <ExProgress
      :percentage="40"
      color="#10b981"
      :stroke-width="16"
      text-inside
      striped
      striped-flow
    />
  </div>

  <div>
    <div>经验值</div>
    <ExProgress
      :percentage="75"
      :color="customColors"
      :stroke-width="16"
      text-inside
      striped
      striped-flow
    />
  </div>
</template>
```

## 环形进度条

使用 `type="circle"` 可以显示环形进度条，支持渐变色和霓虹发光效果。

<div class="demo-container" style="display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap;">
  <ExProgress type="circle" :percentage="75" />
  <ExProgress type="circle" :percentage="100" status="success" />
  <ExProgress type="circle" :percentage="80" status="warning" />
  <ExProgress type="circle" :percentage="50" status="exception" />
  <ExProgress type="circle" :percentage="60" color="#00f0ff" :width="140" :stroke-width="10" />
</div>

```vue
<template>
  <ExProgress type="circle" :percentage="75" />
  <ExProgress type="circle" :percentage="100" status="success" />
  <ExProgress type="circle" :percentage="80" status="warning" />
  <ExProgress type="circle" :percentage="50" status="exception" />
  <ExProgress type="circle" :percentage="60" color="#00f0ff" :width="140" :stroke-width="10" />
</template>
```

## 波浪进度条（矩形）

使用 `type="wave"` 可以显示流动的波浪效果进度条，营造动态科技感。波浪会自动流动，展现真实的液体效果。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <ExProgress type="wave" :percentage="wavePercentage" />
  <ExProgress type="wave" :percentage="75" />
  <ExProgress type="wave" :percentage="100" status="success" />
  <ExProgress type="wave" :percentage="60" status="warning" />
  <ExProgress type="wave" :percentage="40" status="exception" />
  <ExProgress type="wave" :percentage="85" color="#00f0ff" />
</div>

```vue
<template>
  <ExProgress type="wave" :percentage="75" />
  <ExProgress type="wave" :percentage="100" status="success" />
  <ExProgress type="wave" :percentage="60" status="warning" />
  <ExProgress type="wave" :percentage="40" status="exception" />
  <ExProgress type="wave" :percentage="85" color="#00f0ff" />
</template>
```

## 波浪进度条（圆形）

使用 `type="wave-circle"` 可以显示圆形波浪效果进度条，更具视觉冲击力。波浪在圆形容器中流动，营造出液体充盈的效果。

<div class="demo-container" style="display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap;">
  <ExProgress type="wave-circle" :percentage="waveCirclePercentage" />
  <ExProgress type="wave-circle" :percentage="75" />
  <ExProgress type="wave-circle" :percentage="100" status="success" />
  <ExProgress type="wave-circle" :percentage="60" status="warning" :width="140" />
  <ExProgress type="wave-circle" :percentage="40" status="exception" :width="140" />
  <ExProgress type="wave-circle" :percentage="85" color="#ff007f" :width="160" />
</div>

```vue
<template>
  <ExProgress type="wave-circle" :percentage="75" />
  <ExProgress type="wave-circle" :percentage="100" status="success" />
  <ExProgress type="wave-circle" :percentage="60" status="warning" :width="140" />
  <ExProgress type="wave-circle" :percentage="40" status="exception" :width="140" />
  <ExProgress type="wave-circle" :percentage="85" color="#ff007f" :width="160" />
</template>
```

## 波浪效果对比

展示不同振幅的波浪效果（速度固定为 0.02）。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 20px;">
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      标准波浪（振幅: 10px）
    </div>
    <ExProgress type="wave" :percentage="65" />
  </div>
  
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      平缓波浪（振幅: 5px）
    </div>
    <ExProgress type="wave" :percentage="65" :wave-amplitude="5" color="#10b981" />
  </div>
  
  <div>
    <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
      激烈波浪（振幅: 15px）
    </div>
    <ExProgress type="wave" :percentage="65" :wave-amplitude="15" color="#f59e0b" />
  </div>
</div>

```vue
<template>
  <!-- 标准波浪 -->
  <ExProgress type="wave" :percentage="65" />

  <!-- 平缓波浪 -->
  <ExProgress type="wave" :percentage="65" :wave-amplitude="5" />

  <!-- 激烈波浪 -->
  <ExProgress type="wave" :percentage="65" :wave-amplitude="15" />
</template>
```

## 赛博朋克游戏场景

展示不同类型进度条在游戏场景中的应用。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
  <div style="text-align: center;">
    <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/user-fill.svg" alt="玩家等级" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
      玩家等级
    </div>
    <ExProgress type="circle" :percentage="85" color="#00f0ff" :width="120" />
  </div>
  
  <div style="text-align: center;">
    <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/trophy-fill.svg" alt="成就进度" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
      成就进度
    </div>
    <ExProgress type="circle" :percentage="60" status="warning" :width="120" />
  </div>
  
  <div style="text-align: center;">
    <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/battery-fill.svg" alt="能量储备" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
      能量储备
    </div>
    <ExProgress type="wave-circle" :percentage="75" color="#3b82f6" :width="120" />
  </div>
  
  <div style="text-align: center;">
    <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
      <img src="https://api.iconify.design/ri/download-cloud-fill.svg" alt="下载进度" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
      下载进度
    </div>
    <ExProgress type="wave-circle" :percentage="45" status="success" :width="120" />
  </div>
</div>

```vue
<template>
  <div>
    <div>玩家等级</div>
    <ExProgress type="circle" :percentage="85" color="#00f0ff" :width="120" />
  </div>

  <div>
    <div>成就进度</div>
    <ExProgress type="circle" :percentage="60" status="warning" :width="120" />
  </div>

  <div>
    <div>能量储备</div>
    <ExProgress type="wave-circle" :percentage="75" color="#3b82f6" :width="120" />
  </div>

  <div>
    <div>下载进度</div>
    <ExProgress type="wave-circle" :percentage="45" status="success" :width="120" />
  </div>
</template>
```

## API

### Progress Props

| 参数             | 说明                                         | 类型                                                            | 默认值   |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------- | -------- |
| `percentage`     | 百分比（0-100）                              | `number`                                                        | `0`      |
| `type`           | 进度条类型                                   | `'line' \| 'circle' \| 'wave' \| 'wave-circle'`                 | `'line'` |
| `stroke-width`   | 进度条线宽                                   | `number`                                                        | `8`      |
| `show-text`      | 是否显示进度文字                             | `boolean`                                                       | `true`   |
| `text-inside`    | 进度文字是否在进度条内部（仅 line 类型）     | `boolean`                                                       | `false`  |
| `status`         | 进度条状态                                   | `'success' \| 'exception' \| 'warning'`                         | —        |
| `color`          | 进度条颜色                                   | `string \| ProgressColor[] \| ((percentage: number) => string)` | —        |
| `striped`        | 是否显示条纹（仅 line 类型）                 | `boolean`                                                       | `false`  |
| `striped-flow`   | 条纹是否流动（仅 line 类型）                 | `boolean`                                                       | `false`  |
| `show-icon`      | 是否显示状态图标                             | `boolean`                                                       | `true`   |
| `format`         | 自定义文字格式化函数                         | `(percentage: number) => string`                                | —        |
| `width`          | 圆形进度条宽度（circle、wave-circle 类型）   | `number`                                                        | `120`    |
| `wave-speed`     | 波浪动画速度（wave 和 wave-circle 类型）     | `number`                                                        | `0.02`   |
| `wave-amplitude` | 波浪振幅（wave 和 wave-circle 类型）         | `number`                                                        | `10`     |
| `wave-animated`  | 是否显示波浪动画（wave 和 wave-circle 类型） | `boolean`                                                       | `true`   |
| `aria-label`     | 无障碍标签                                   | `string`                                                        | —        |

### ProgressColor

| 参数         | 说明   | 类型     |
| ------------ | ------ | -------- |
| `color`      | 颜色值 | `string` |
| `percentage` | 百分比 | `number` |

### Progress Slots

| 插槽名 | 说明           |
| ------ | -------------- |
| `text` | 自定义进度文字 |
| `icon` | 自定义状态图标 |

### Progress Methods

| 方法名       | 说明              | 类型                           |
| ------------ | ----------------- | ------------------------------ |
| `getElement` | 获取进度条DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="progressbar"` 标记进度条
- 完整的 ARIA 属性支持（`aria-valuenow`、`aria-valuemin`、`aria-valuemax`）
- 支持屏幕阅读器
- 支持减少动画偏好设置

## 主题定制

进度条跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配；颜色亦可通过 `color` 属性传入字符串、回调函数或分段渐变数组自定义。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
