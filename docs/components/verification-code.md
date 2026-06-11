# VerificationCode 验证码输入

专业的 OTP/验证码输入组件，采用分离式输入格子设计，每个字符独立显示。

<script setup>
import { ref } from 'vue'

const code1 = ref('')
const code2 = ref('')
const code3 = ref('')
const code4 = ref('')
const code5 = ref('')
const code6 = ref('')
const code7 = ref('')
const code8 = ref('')
const code9 = ref('')
const code10 = ref('')
const code11 = ref('')
const code12 = ref('123456')
const code13 = ref('123456')
const code14 = ref('123456')
const code15 = ref('123456')
const code16 = ref('123456')
const code17 = ref('')
const code18 = ref('')
const codeRef = ref(null)

const handleComplete = (value) => {
  console.log('验证码输入完成:', value)
}

const handleSubmit = (value) => {
  console.log('自动提交:', value)
}

const handleFocus = () => {
  codeRef.value?.focus()
}

const handleClear = () => {
  codeRef.value?.clear()
}

const handleSetValue = () => {
  codeRef.value?.setValue('123456')
}
</script>

## 基础用法

基础的验证码输入，默认 6 位数字。

<div class="demo-container">
  <ex-verification-code v-model="code1" @complete="handleComplete" />
</div>

```vue
<template>
  <ex-verification-code v-model="code" @complete="handleComplete" />
</template>

<script setup>
import { ref } from 'vue'

const code = ref('')

const handleComplete = (value) => {
  console.log('验证码输入完成:', value)
}
</script>
```

## 不同长度

通过 `length` 属性设置验证码长度。

<div class="demo-container">
  <ex-verification-code v-model="code2" :length="4" placeholder="•" />
  <ex-verification-code v-model="code3" :length="6" placeholder="•" />
  <ex-verification-code v-model="code4" :length="8" placeholder="•" />
</div>

```vue
<template>
  <ex-verification-code v-model="code4" :length="4" />
  <ex-verification-code v-model="code6" :length="6" />
  <ex-verification-code v-model="code8" :length="8" />
</template>
```

## 输入模式

支持纯数字和字母数字两种输入模式。

<div class="demo-container">
  <p style="color: var(--ex-color-text-secondary); margin-bottom: 8px;">纯数字模式（默认）</p>
  <ex-verification-code v-model="code5" input-mode="numeric" />
  <p style="color: var(--ex-color-text-secondary); margin: 16px 0 8px;">字母数字模式</p>
  <ex-verification-code v-model="code6" input-mode="alphanumeric" />
</div>

```vue
<template>
  <ex-verification-code v-model="numericCode" input-mode="numeric" />
  <ex-verification-code v-model="alphanumericCode" input-mode="alphanumeric" />
</template>
```


## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <ex-verification-code v-model="code7" size="small" :length="4" />
  <ex-verification-code v-model="code8" size="medium" :length="4" />
  <ex-verification-code v-model="code9" size="large" :length="4" />
</div>

```vue
<template>
  <ex-verification-code v-model="code" size="small" />
  <ex-verification-code v-model="code" size="medium" />
  <ex-verification-code v-model="code" size="large" />
</template>
```

## 赛博朋克风格变体

提供三种赛博朋克风格变体：`neon`（霓虹）、`ghost`（幽灵）、`filled`（填充）。

<div class="demo-container">
  <ex-verification-code v-model="code10" variant="neon" :length="4" />
  <ex-verification-code v-model="code10" variant="ghost" :length="4" />
  <ex-verification-code v-model="code10" variant="filled" :length="4" />
</div>

```vue
<template>
  <ex-verification-code v-model="code" variant="neon" />
  <ex-verification-code v-model="code" variant="ghost" />
  <ex-verification-code v-model="code" variant="filled" />
</template>
```

## 密码遮罩

启用 `mask` 属性可以隐藏输入的字符，适用于敏感验证码场景。使用 `show-mask-toggle` 显示切换按钮。

<div class="demo-container">
  <ex-verification-code 
    v-model="code11" 
    mask 
    :mask-delay="300"
    show-mask-toggle
  />
</div>

```vue
<template>
  <ex-verification-code 
    v-model="code" 
    mask 
    :mask-delay="300"
    show-mask-toggle
  />
</template>
```

## 自动提交

启用 `auto-submit` 属性，输入完成后自动触发提交事件。

<div class="demo-container">
  <ex-verification-code 
    v-model="code17" 
    auto-submit 
    :auto-submit-delay="500"
    @submit="handleSubmit"
  />
</div>

```vue
<template>
  <ex-verification-code 
    v-model="code" 
    auto-submit 
    :auto-submit-delay="500"
    @submit="handleSubmit"
  />
</template>

<script setup>
const handleSubmit = (value) => {
  console.log('自动提交:', value)
}
</script>
```

## 分隔符

使用 `separator-positions` 属性在指定位置显示分隔符，常用于银行卡号、手机号等格式。

<div class="demo-container">
  <ex-verification-code 
    v-model="code18" 
    :separator-positions="[3]"
    separator="-"
  />
</div>

```vue
<template>
  <ex-verification-code 
    v-model="code" 
    :separator-positions="[3]"
    separator="-"
  />
</template>
```

## 状态

支持多种状态：禁用、只读、错误、成功、警告、加载中。

<div class="demo-container">
  <p style="color: var(--ex-color-text-secondary); margin-bottom: 8px;">禁用状态</p>
  <ex-verification-code v-model="code12" disabled :length="4" />
  <p style="color: var(--ex-color-text-secondary); margin: 16px 0 8px;">只读状态</p>
  <ex-verification-code v-model="code13" readonly :length="4" />
  <p style="color: var(--ex-color-text-secondary); margin: 16px 0 8px;">错误状态</p>
  <ex-verification-code v-model="code14" status="error" error-message="验证码错误" :length="4" />
  <p style="color: var(--ex-color-text-secondary); margin: 16px 0 8px;">成功状态</p>
  <ex-verification-code v-model="code15" status="success" :length="4" />
  <p style="color: var(--ex-color-text-secondary); margin: 16px 0 8px;">警告状态</p>
  <ex-verification-code v-model="code16" status="warning" :length="4" />
</div>

```vue
<template>
  <ex-verification-code v-model="code" disabled />
  <ex-verification-code v-model="code" readonly />
  <ex-verification-code v-model="code" status="error" error-message="验证码错误" />
  <ex-verification-code v-model="code" status="success" />
  <ex-verification-code v-model="code" status="warning" />
</template>
```


## 编程式控制

通过 ref 获取组件实例，调用暴露的方法进行编程式控制。

<div class="demo-container">
  <ex-verification-code ref="codeRef" v-model="code1" />
  <div style="display: flex; gap: 8px; margin-top: 16px;">
    <ex-button size="small" @click="handleFocus">聚焦</ex-button>
    <ex-button size="small" @click="handleClear">清空</ex-button>
    <ex-button size="small" @click="handleSetValue">设置值</ex-button>
  </div>
</div>

```vue
<template>
  <ex-verification-code ref="codeRef" v-model="code" />
  <ex-button @click="handleFocus">聚焦</ex-button>
  <ex-button @click="handleClear">清空</ex-button>
  <ex-button @click="handleSetValue">设置值</ex-button>
</template>

<script setup>
import { ref } from 'vue'

const code = ref('')
const codeRef = ref(null)

const handleFocus = () => {
  codeRef.value?.focus()
}

const handleClear = () => {
  codeRef.value?.clear()
}

const handleSetValue = () => {
  codeRef.value?.setValue('123456')
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| model-value / v-model | 绑定值 | string | — | '' |
| length | 验证码长度 | number | 1-12 | 6 |
| input-mode | 输入模式 | string | numeric / alphanumeric | numeric |
| size | 尺寸 | string | small / medium / large | medium |
| variant | 样式变体 | string | neon / ghost / filled | neon |
| disabled | 是否禁用 | boolean | — | false |
| readonly | 是否只读 | boolean | — | false |
| status | 状态 | string | default / success / warning / error | default |
| mask | 是否启用密码遮罩 | boolean | — | false |
| show-mask-toggle | 是否显示遮罩切换按钮 | boolean | — | false |
| mask-delay | 遮罩延迟（毫秒） | number | — | 300 |
| auto-submit | 是否自动提交 | boolean | — | false |
| auto-submit-delay | 自动提交延迟（毫秒） | number | — | 500 |
| autofocus | 是否自动聚焦 | boolean | — | false |
| separator-positions | 分隔符位置 | number[] | — | [] |
| separator | 分隔符字符 | string | — | '-' |
| placeholder | 占位符 | string | — | '' |
| label | 标签文本 | string | — | '' |
| required | 是否必填 | boolean | — | false |
| help-text | 帮助文本 | string | — | '' |
| error-message | 错误信息 | string | — | '' |
| loading | 是否加载中 | boolean | — | false |
| cell-width | 格子宽度 | string / number | — | — |
| cell-gap | 格子间距 | string / number | — | — |
| custom-class | 自定义类名 | string | — | '' |
| custom-style | 自定义样式 | object | — | — |
| aria-label | 无障碍标签 | string | — | '' |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:model-value | 值变化时触发 | (value: string) |
| input | 输入时触发 | (value: string) |
| change | 值改变时触发 | (value: string) |
| complete | 所有格子填满时触发 | (value: string) |
| submit | 提交时触发 | (value: string) |
| focus | 聚焦时触发 | (event: FocusEvent, index: number) |
| blur | 失焦时触发 | (event: FocusEvent) |
| clear | 清空时触发 | — |

### Exposes

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| focus | 聚焦到第一个空格子 | — | — |
| blur | 失焦 | — | — |
| clear | 清空所有格子 | — | — |
| setValue | 设置值 | (value: string) | — |
| getValue | 获取当前值 | — | string |
| getElement | 获取容器元素 | — | HTMLDivElement \| null |
| submit | 手动触发提交 | — | — |

## 键盘操作

| 按键 | 说明 |
| --- | --- |
| 0-9 / a-z | 输入字符 |
| Backspace | 删除当前格子内容或移动到前一个格子 |
| Delete | 删除当前格子内容并左移后续内容 |
| ArrowLeft | 移动到前一个格子 |
| ArrowRight | 移动到后一个格子 |
| Home | 移动到第一个格子 |
| End | 移动到最后一个填充的格子 |

## 最佳实践

### 短信验证码场景

使用默认的 6 位数字模式，启用自动提交功能，提升用户体验。

### 敏感验证码

启用 `mask` 模式保护用户隐私，可配合 `show-mask-toggle` 让用户自行切换显示。

### 移动端优化

- 组件自动使用数字键盘（`inputmode="numeric"`）
- 支持 OTP 自动填充（`autocomplete="one-time-code"`）
- 触摸目标尺寸符合无障碍标准（最小 44x44px）

### 无障碍

- 完整的 ARIA 属性支持
- 键盘导航友好
- 屏幕阅读器友好
- 支持 `prefers-reduced-motion` 媒体查询

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
