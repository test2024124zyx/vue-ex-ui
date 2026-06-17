# ColorPicker 颜色选择器

用于选择颜色，支持饱和度/明度面板、色相、透明度与预定义色板。

<script setup>
import { ref } from 'vue'

const color1 = ref('#29abe2')
const color2 = ref('rgba(255, 45, 120, 0.6)')
const color3 = ref('#7c4dff')
const color4 = ref('')
const predefine = [
  '#29abe2', '#ff2d78', '#7c4dff', '#00d68f',
  '#ffaa00', '#ff5630', '#1f2a37', '#ffffff'
]
</script>

## 基础用法

绑定 `v-model`，拖动面板实时取色，点击「确定」关闭。

<div class="demo-container">
  <ExColorPicker v-model="color1" />
  <span style="color: var(--ex-color-text-secondary);">当前值：{{ color1 || '（空）' }}</span>
</div>

```vue
<template>
  <ExColorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#29abe2')
</script>
```

## 支持透明度

设置 `show-alpha` 显示透明度滑块。

<div class="demo-container">
  <ExColorPicker v-model="color2" show-alpha format="rgb" />
  <span style="color: var(--ex-color-text-secondary);">{{ color2 }}</span>
</div>

```vue
<template>
  <ExColorPicker v-model="color" show-alpha format="rgb" />
</template>
```

## 预定义颜色

通过 `predefine` 传入常用色板。

<div class="demo-container">
  <ExColorPicker v-model="color3" :predefine="predefine" />
</div>

```vue
<template>
  <ExColorPicker v-model="color" :predefine="predefine" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#7c4dff')
const predefine = ['#29abe2', '#ff2d78', '#7c4dff', '#00d68f', '#ffaa00']
</script>
```

## 不同尺寸

通过 `size` 设置 `small` / `medium`（默认）/ `large`。

<div class="demo-container">
  <ExColorPicker v-model="color1" size="small" />
  <ExColorPicker v-model="color1" size="medium" />
  <ExColorPicker v-model="color1" size="large" />
</div>

```vue
<template>
  <ExColorPicker v-model="color" size="small" />
  <ExColorPicker v-model="color" size="medium" />
  <ExColorPicker v-model="color" size="large" />
</template>
```

## 输出格式与清空

`format` 控制输出为 `hex`（默认）或 `rgb`；`clearable`（默认开启）允许清空。

<div class="demo-container">
  <ExColorPicker v-model="color4" :predefine="predefine" />
  <span style="color: var(--ex-color-text-secondary);">{{ color4 || '未选择' }}</span>
</div>

```vue
<template>
  <ExColorPicker v-model="color" format="rgb" clearable />
</template>
```

## 禁用状态

<div class="demo-container">
  <ExColorPicker v-model="color1" disabled />
</div>

```vue
<template>
  <ExColorPicker v-model="color" disabled />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 绑定值（hex 或 rgb(a) 字符串） | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | 跟随全局配置 |
| show-alpha | 是否支持透明度 | `boolean` | `false` |
| format | 输出格式 | `'hex' \| 'rgb'` | `'hex'` |
| predefine | 预定义颜色 | `string[]` | — |
| clearable | 是否可清空 | `boolean` | `true` |
| teleported | 弹层是否传送到 body | `boolean` | `true` |
| popper-class | 弹层自定义类名 | `string` | — |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| update:model-value | 值更新（拖动过程实时） | `(value: string) => void` |
| change | 提交时触发（确定 / 预定义 / 输入 / 清空） | `(value: string) => void` |
| active-change | 拖动选择过程中实时触发 | `(value: string) => void` |
| focus / blur | 焦点事件 | `(e: FocusEvent) => void` |
| clear | 清空 | `() => void` |
| visible-change | 面板显隐变化 | `(visible: boolean) => void` |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| focus / blur | 聚焦 / 失焦 | `() => void` |

## 主题定制

ColorPicker 消费 ExUI 全局设计令牌：

```css
:root {
  --ex-color-bg-secondary: #11151c;   /* 触发器背景 */
  --ex-color-bg-elevated: #0d1117;    /* 面板背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-color-primary: #29abe2;        /* 强调色 */
}
```

## 常见问题

**Q：输出值是什么格式？**
由 `format` 决定：`hex`（含透明度时为 8 位 `#rrggbbaa`）或 `rgb`（含透明度时为 `rgba()`）。`show-alpha` 关闭时不输出透明度。

**Q：`change` 和 `active-change` 有什么区别？**
拖动过程中持续触发 `active-change`（并实时更新 v-model）；释放鼠标、点击预定义、输入提交或确定时触发 `change`。

**Q：可以输入颜色值吗？**
可以，面板内的 HEX 输入框支持手动输入 hex 或 rgb(a)，回车或失焦时解析生效，非法值会被还原。

## 最佳实践

- **主题/标注类配置**用 ColorPicker 配合 `predefine` 提供品牌色板，减少自由选色带来的不一致。
- 需要透明度（如蒙层、描边）时开启 `show-alpha` 并用 `format="rgb"` 输出。
- 表单中放入 `ExFormItem` 即可参与校验。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
