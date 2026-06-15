# Input 输入框

通过鼠标或键盘输入字符。

<script setup>
import { ref } from 'vue'
import { formatThousands, parseThousands, formatPhone, parsePhone, formatCurrency, parseCurrency } from '../../src/utils/formatters'

const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
const input4 = ref('')
const input5 = ref('示例文本')
const input6 = ref('可以清空我')
const password = ref('')
const input7 = ref('')
const input8 = ref('')
const input9 = ref('')
const input10 = ref('')
const input11 = ref('')
const textarea = ref('')
const textarea2 = ref('')
const email = ref('')
const amount = ref('')
const phone = ref('')
const number = ref('')
</script>

## 基础用法

基础的输入框用法。

<div class="demo-container">
  <ex-input v-model="input1" placeholder="请输入内容" />
</div>

```vue
<template>
  <ex-input v-model="input" placeholder="请输入内容" />
</template>

<script setup>
import { ref } from 'vue';

const input = ref('');
</script>
```

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <ex-input v-model="input2" size="small" placeholder="小尺寸" />
  <ex-input v-model="input2" size="medium" placeholder="中等尺寸" />
  <ex-input v-model="input2" size="large" placeholder="大尺寸" />
</div>

```vue
<template>
  <ex-input v-model="input" size="small" placeholder="小尺寸" />
  <ex-input v-model="input" size="medium" placeholder="中等尺寸" />
  <ex-input v-model="input" size="large" placeholder="大尺寸" />
</template>
```

## 赛博朋克风格变体

提供三种赛博朋克风格变体：`neon`（霓虹）、`ghost`（幽灵）、`filled`（填充）。

<div class="demo-container">
  <ex-input v-model="input3" variant="neon" placeholder="霓虹变体（默认）" />
  <ex-input v-model="input3" variant="ghost" placeholder="幽灵变体" />
  <ex-input v-model="input3" variant="filled" placeholder="填充变体" />
</div>

```vue
<template>
  <ex-input v-model="input" variant="neon" placeholder="霓虹变体" />
  <ex-input v-model="input" variant="ghost" placeholder="幽灵变体" />
  <ex-input v-model="input" variant="filled" placeholder="填充变体" />
</template>
```

## 状态

输入框的不同状态：成功、警告、错误。

<div class="demo-container">
  <ex-input v-model="input4" status="success" placeholder="成功状态" />
  <ex-input v-model="input4" status="warning" placeholder="警告状态" />
  <ex-input v-model="input4" status="error" placeholder="错误状态" />
</div>

```vue
<template>
  <ex-input v-model="input" status="success" placeholder="成功状态" />
  <ex-input v-model="input" status="warning" placeholder="警告状态" />
  <ex-input v-model="input" status="error" placeholder="错误状态" />
</template>
```

## 禁用和只读

<div class="demo-container">
  <ex-input v-model="input5" disabled placeholder="禁用状态" />
  <ex-input v-model="input5" readonly placeholder="只读状态" />
</div>

```vue
<template>
  <ex-input v-model="input" disabled placeholder="禁用状态" />
  <ex-input v-model="input" readonly placeholder="只读状态" />
</template>
```

## 可清空

使用 `clearable` 属性即可得到一个可清空的输入框。

<div class="demo-container">
  <ex-input v-model="input6" clearable placeholder="可清空的输入框" />
</div>

```vue
<template>
  <ex-input v-model="input" clearable placeholder="可清空的输入框" />
</template>
```

## 密码输入

使用 `show-password` 属性即可得到一个可切换显示隐藏的密码框。

<div class="demo-container">
  <ex-input 
    v-model="password" 
    type="password" 
    show-password 
    placeholder="请输入密码" 
  />
</div>

```vue
<template>
  <ex-input v-model="password" type="password" show-password placeholder="请输入密码" />
</template>
```

## 带图标

可以通过 `prefix` 和 `suffix` 插槽来在输入框中添加图标。

<div class="demo-container">
  <ex-input v-model="input7" placeholder="搜索">
    <template #prefix>
      <ex-icon icon="search-line" />
    </template>
  </ex-input>
  
  <ex-input v-model="input7" placeholder="用户名">
    <template #suffix>
      <ex-icon icon="information-line" />
    </template>
  </ex-input>
</div>

```vue
<template>
  <ex-input v-model="input" placeholder="搜索">
    <template #prefix>
      <ex-icon icon="search-line" />
    </template>
  </ex-input>

  <ex-input v-model="input" placeholder="用户名">
    <template #suffix>
      <ex-icon icon="information-line" />
    </template>
  </ex-input>
</template>
```

## 前置/后置内容

可通过 `prepend` 和 `append` 属性或插槽来在输入框前后添加内容。

<div class="demo-container">
  <ex-input v-model="input8" prepend="https://" placeholder="网址" />
  <ex-input v-model="input8" append=".com" placeholder="域名" />
</div>

```vue
<template>
  <ex-input v-model="input" prepend="https://" placeholder="网址" />
  <ex-input v-model="input" append=".com" placeholder="域名" />
</template>
```

## 字数统计

使用 `show-word-limit` 和 `maxlength` 属性，可以显示字数统计。

<div class="demo-container">
  <ex-input 
    v-model="input9" 
    show-word-limit 
    :maxlength="20" 
    placeholder="最多输入20个字符" 
  />
</div>

```vue
<template>
  <ex-input v-model="input" show-word-limit :maxlength="20" placeholder="最多输入20个字符" />
</template>
```

## 带标签

使用 `label` 属性可以为输入框添加标签，`required` 属性显示必填标记。

<div class="demo-container">
  <ex-input 
    v-model="input10" 
    label="用户名" 
    required 
    placeholder="请输入用户名" 
  />
</div>

```vue
<template>
  <ex-input v-model="input" label="用户名" required placeholder="请输入用户名" />
</template>
```

## 帮助文本和错误信息

使用 `help-text` 显示帮助信息，使用 `error-message` 配合 `status="error"` 显示错误信息。

<div class="demo-container">
  <ex-input 
    v-model="input11" 
    help-text="请输入6-20位字符" 
    placeholder="用户名" 
  />
  
  <ex-input 
    v-model="input11" 
    status="error" 
    error-message="用户名不能为空" 
    placeholder="用户名" 
  />
</div>

```vue
<template>
  <ex-input v-model="input" help-text="请输入6-20位字符" placeholder="用户名" />

  <ex-input v-model="input" status="error" error-message="用户名不能为空" placeholder="用户名" />
</template>
```

## 文本域

用于输入多行文本信息，通过将 `type` 属性的值指定为 `textarea`。

<div class="demo-container">
  <ex-input 
    v-model="textarea" 
    type="textarea" 
    :rows="4" 
    placeholder="请输入多行文本" 
  />
</div>

```vue
<template>
  <ex-input v-model="textarea" type="textarea" :rows="4" placeholder="请输入多行文本" />
</template>
```

## 自动调整大小

设置 `autosize` 属性可以使文本域自动调整高度。

<div class="demo-container">
  <ex-input 
    v-model="textarea2" 
    type="textarea" 
    :autosize="{ minRows: 2, maxRows: 6 }" 
    placeholder="自动调整高度（最小2行，最大6行）" 
  />
</div>

```vue
<template>
  <ex-input
    v-model="textarea"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 6 }"
    placeholder="自动调整高度"
  />
</template>
```

## 输入格式化

使用 `formatter` 和 `parser` 属性可以格式化输入内容。项目提供了常用的格式化工具函数。

<div class="demo-container">
  <ex-input 
    v-model="amount" 
    placeholder="输入金额" 
    :formatter="formatCurrency"
    :parser="parseCurrency"
  />
  
  <ex-input 
    v-model="phone" 
    placeholder="输入手机号" 
    :formatter="formatPhone"
    :parser="parsePhone"
  />
  
  <ex-input 
    v-model="number" 
    placeholder="输入数字（千分位）" 
    :formatter="formatThousands"
    :parser="parseThousands"
  />
</div>

```vue
<template>
  <ex-input
    v-model="amount"
    placeholder="输入金额"
    :formatter="formatCurrency"
    :parser="parseCurrency"
  />

  <ex-input
    v-model="phone"
    placeholder="输入手机号"
    :formatter="formatPhone"
    :parser="parsePhone"
  />

  <ex-input
    v-model="number"
    placeholder="输入数字（千分位）"
    :formatter="formatThousands"
    :parser="parseThousands"
  />
</template>

<script setup>
import { ref } from 'vue';
import {
  formatCurrency,
  parseCurrency,
  formatPhone,
  parsePhone,
  formatThousands,
  parseThousands,
} from '../../src/utils/formatters';

const amount = ref('');
const phone = ref('');
const number = ref('');
</script>
```

## 表单验证

使用 `rules` 属性可以添加验证规则，支持手动调用 `validate` 方法进行验证。

<div class="demo-container">
  <ex-input 
    v-model="email" 
    label="邮箱"
    placeholder="请输入邮箱"
    :rules="[
      (value) => !!value || '邮箱不能为空',
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '邮箱格式不正确'
    ]"
  />
</div>

```vue
<template>
  <ex-input
    ref="inputRef"
    v-model="email"
    label="邮箱"
    placeholder="请输入邮箱"
    :rules="emailRules"
    @validation-error="handleValidationError"
  />

  <ex-button @click="handleSubmit">提交</ex-button>
</template>

<script setup>
import { ref } from 'vue';

const inputRef = ref();
const email = ref('');

const emailRules = [
  value => !!value || '邮箱不能为空',
  value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '邮箱格式不正确',
];

const handleValidationError = error => {
  console.log('验证失败:', error);
};

const handleSubmit = () => {
  if (inputRef.value.validate()) {
    console.log('验证通过，提交表单');
  }
};
</script>
```

## API

### Props

| 参数                  | 说明                             | 类型                      | 可选值                                                           | 默认值  |
| --------------------- | -------------------------------- | ------------------------- | ---------------------------------------------------------------- | ------- |
| model-value / v-model | 绑定值                           | string / number           | —                                                                | —       |
| type                  | 输入框类型                       | string                    | text / password / email / number / tel / url / search / textarea | text    |
| size                  | 输入框尺寸                       | string                    | small / medium / large                                           | medium  |
| variant               | 输入框变体                       | string                    | neon / ghost / filled                                            | neon    |
| status                | 输入框状态                       | string                    | default / success / warning / error                              | default |
| placeholder           | 占位符文本                       | string                    | —                                                                | —       |
| disabled              | 是否禁用                         | boolean                   | —                                                                | false   |
| readonly              | 是否只读                         | boolean                   | —                                                                | false   |
| clearable             | 是否显示清除按钮（有内容时显示） | boolean                   | —                                                                | false   |
| show-password         | 是否显示密码切换按钮             | boolean                   | —                                                                | false   |
| formatter             | 格式化显示值                     | (value: string) => string | —                                                                | —       |
| parser                | 解析实际值                       | (value: string) => string | —                                                                | —       |
| maxlength             | 最大长度                         | number                    | —                                                                | —       |
| minlength             | 最小长度                         | number                    | —                                                                | —       |
| show-word-limit       | 是否显示字数统计                 | boolean                   | —                                                                | false   |
| prepend               | 前置内容                         | string                    | —                                                                | —       |
| append                | 后置内容                         | string                    | —                                                                | —       |
| autofocus             | 是否自动聚焦                     | boolean                   | —                                                                | false   |
| autocomplete          | 自动完成                         | string                    | —                                                                | off     |
| rules                 | 验证规则                         | Array                     | —                                                                | —       |
| error-message         | 错误信息                         | string                    | —                                                                | —       |
| help-text             | 帮助文本                         | string                    | —                                                                | —       |
| label                 | 标签文本                         | string                    | —                                                                | —       |
| required              | 是否必填                         | boolean                   | —                                                                | false   |
| rows                  | 文本域行数                       | number                    | —                                                                | 3       |
| autosize              | 是否自适应高度                   | boolean / object          | —                                                                | false   |
| custom-class          | 自定义类名                       | string                    | —                                                                | —       |
| custom-style          | 自定义样式                       | object                    | —                                                                | —       |

### Events

| 事件名             | 说明               | 回调参数                                |
| ------------------ | ------------------ | --------------------------------------- |
| update:model-value | 值变化时触发       | (value: string \| number)               |
| input              | 输入时触发         | (value: string \| number, event: Event) |
| change             | 值改变时触发       | (value: string \| number, event: Event) |
| focus              | 获得焦点时触发     | (event: FocusEvent)                     |
| blur               | 失去焦点时触发     | (event: FocusEvent)                     |
| clear              | 点击清除按钮时触发 | —                                       |
| keydown            | 按键按下时触发     | (event: KeyboardEvent)                  |
| keyup              | 按键抬起时触发     | (event: KeyboardEvent)                  |
| enter              | 按下回车键时触发   | (event: KeyboardEvent)                  |
| validation-error   | 验证失败时触发     | (error: string)                         |

### Slots

| 插槽名  | 说明     |
| ------- | -------- |
| prefix  | 前缀内容 |
| suffix  | 后缀内容 |
| prepend | 前置内容 |
| append  | 后置内容 |
| label   | 标签内容 |
| help    | 帮助文本 |
| error   | 错误信息 |

### Exposes

| 方法名          | 说明             | 参数 | 返回值                                          |
| --------------- | ---------------- | ---- | ----------------------------------------------- |
| focus           | 使输入框获得焦点 | —    | —                                               |
| blur            | 使输入框失去焦点 | —    | —                                               |
| select          | 选中输入框内容   | —    | —                                               |
| clear           | 清空输入框内容   | —    | —                                               |
| validate        | 手动触发验证     | —    | boolean                                         |
| getInputElement | 获取输入框元素   | —    | HTMLInputElement \| HTMLTextAreaElement \| null |

## 最佳实践

### 输入法支持

组件已内置输入法支持，在使用中文、日文等输入法时，会自动暂停验证和格式化，直到输入法完成输入。

### 移动端优化

- 自动调整字体大小，防止 iOS 自动缩放
- 扩大触摸区域，清除按钮和密码切换按钮在移动端有更大的触摸区域（44x44px）
- 优化内边距，提升触摸体验

### 性能优化

- 文本域高度调整使用防抖和 RAF 优化
- 高端设备的特效动画仅在悬停或聚焦时激活
- 支持 `prefers-reduced-motion` 媒体查询，尊重用户的动画偏好

### 无障碍

- 完整的 ARIA 属性支持
- 键盘导航友好
- 高对比度模式支持
- 屏幕阅读器友好

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

.demo-container .ex-input {
  max-width: 400px;
}
</style>
