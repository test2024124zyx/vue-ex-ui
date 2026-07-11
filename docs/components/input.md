# Input 输入框

<script setup>
import { ref } from 'vue'

const basic = ref('')
const clearable = ref('可清空内容')
const password = ref('')
const limited = ref('')
const textarea = ref('')
const formatted = ref('1234567')
const email = ref('')

const formatThousands = value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const parseThousands = value => value.replaceAll(',', '')
const emailRules = [
  value => Boolean(value) || '邮箱不能为空',
  value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '邮箱格式不正确',
]
</script>

## 基础用法

<div class="demo-container">
  <ex-input v-model="basic" placeholder="请输入内容" />
  <ex-input v-model="basic" size="small" placeholder="小尺寸" />
  <ex-input v-model="basic" size="large" placeholder="大尺寸" />
</div>

```vue
<template>
  <ExInput
    v-model="value"
    placeholder="请输入内容"
  />
  <ExInput
    v-model="value"
    size="small"
    placeholder="小尺寸"
  />
  <ExInput
    v-model="value"
    size="large"
    placeholder="大尺寸"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExInput } from 'vue-ex-ui';

const value = ref('');
</script>
```

## 变体与状态

<div class="demo-container">
  <ex-input v-model="basic" variant="neon" placeholder="Neon" />
  <ex-input v-model="basic" variant="ghost" placeholder="Ghost" />
  <ex-input v-model="basic" variant="filled" placeholder="Filled" />
  <ex-input v-model="basic" status="success" placeholder="成功状态" />
  <ex-input v-model="basic" status="warning" placeholder="警告状态" />
  <ex-input
    v-model="basic"
    status="error"
    error-message="输入内容无效"
    placeholder="错误状态"
  />
</div>

## 清空与密码

<div class="demo-container">
  <ex-input v-model="clearable" clearable placeholder="可清空" />
  <ex-input v-model="password" type="password" show-password placeholder="请输入密码" />
  <ex-input v-model="clearable" disabled clearable placeholder="禁用" />
  <ex-input v-model="clearable" readonly clearable placeholder="只读" />
</div>

```vue
<ExInput v-model="value" clearable />
<ExInput v-model="password" type="password" show-password />
```

## 前后缀与字数统计

<div class="demo-container">
  <ex-input v-model="basic" prepend="https://" append=".com" placeholder="域名" />
  <ex-input v-model="limited" :maxlength="20" show-word-limit placeholder="最多 20 个字符">
    <template #prefix>
      <ex-icon icon="search-line" aria-hidden="true" />
    </template>
  </ex-input>
</div>

```vue
<ExInput v-model="domain" prepend="https://" append=".com" />

<ExInput v-model="keyword" :maxlength="20" show-word-limit>
  <template #prefix>
    <ExIcon icon="search-line" aria-hidden="true" />
  </template>
</ExInput>
```

## 文本域

<div class="demo-container">
  <ex-input
    v-model="textarea"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 6 }"
    placeholder="请输入多行内容"
  />
</div>

```vue
<ExInput v-model="content" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
```

## 格式化

<div class="demo-container">
  <ex-input
    v-model="formatted"
    :formatter="formatThousands"
    :parser="parseThousands"
    inputmode="numeric"
  />
  <div class="demo-value">模型值：{{ formatted }}</div>
</div>

```vue
<template>
  <ExInput
    v-model="amount"
    :formatter="formatThousands"
    :parser="parseThousands"
    inputmode="numeric"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExInput, formatThousands, parseThousands } from 'vue-ex-ui';

const amount = ref('1234567');
</script>
```

## 标签、提示与校验

<div class="demo-container">
  <ex-input
    v-model="email"
    id="email-example"
    label="邮箱"
    required
    help-text="用于接收通知"
    :rules="emailRules"
    placeholder="name@example.com"
  />
</div>

```vue
<template>
  <ExInput
    ref="inputRef"
    v-model="email"
    id="email"
    label="邮箱"
    required
    :rules="emailRules"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExInput, type ExInputExposed, type ValidationRule } from 'vue-ex-ui';

const inputRef = ref<ExInputExposed>();
const email = ref('');
const emailRules: ValidationRule[] = [
  value => Boolean(value) || '邮箱不能为空',
  value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '邮箱格式不正确',
];
</script>
```

## Props

| 参数                  | 类型                                                                    | 默认值     |
| --------------------- | ----------------------------------------------------------------------- | ---------- |
| model-value / v-model | string \| number                                                        | —          |
| id                    | string                                                                  | 自动生成   |
| type                  | text \| password \| email \| number \| tel \| url \| search \| textarea | text       |
| size                  | small \| medium \| large                                                | medium     |
| variant               | neon \| ghost \| filled                                                 | neon       |
| status                | default \| success \| warning \| error                                  | default    |
| placeholder           | string                                                                  | —          |
| disabled              | boolean                                                                 | false      |
| readonly              | boolean                                                                 | false      |
| clearable             | boolean                                                                 | false      |
| show-password         | boolean                                                                 | false      |
| minlength             | number                                                                  | —          |
| maxlength             | number                                                                  | —          |
| show-word-limit       | boolean                                                                 | false      |
| prepend               | string                                                                  | —          |
| append                | string                                                                  | —          |
| autofocus             | boolean                                                                 | false      |
| autocomplete          | string                                                                  | 浏览器默认 |
| label                 | string                                                                  | —          |
| required              | boolean                                                                 | false      |
| help-text             | string                                                                  | —          |
| error-message         | string                                                                  | —          |
| rules                 | ValidationRule[]                                                        | —          |
| rows                  | number                                                                  | 3          |
| autosize              | boolean \| { minRows?: number; maxRows?: number }                       | false      |
| formatter             | (value: string) => string                                               | —          |
| parser                | (value: string) => string                                               | —          |

<code>class</code> 和 <code>style</code> 应用于组件根节点；其余未声明的原生属性与监听器转发到真实的 <code>input</code> 或 <code>textarea</code>。

## Events

| 事件               | 参数                          |
| ------------------ | ----------------------------- |
| update:model-value | (value: string)               |
| input              | (value: string, event: Event) |
| change             | (value: string, event: Event) |
| focus              | (event: FocusEvent)           |
| blur               | (event: FocusEvent)           |
| clear              | ()                            |
| keydown            | (event: KeyboardEvent)        |
| keyup              | (event: KeyboardEvent)        |
| enter              | (event: KeyboardEvent)        |
| validation-error   | (error: string)               |

## Slots

| 名称    | 内容           |
| ------- | -------------- |
| prefix  | 控件内前缀     |
| suffix  | 控件内后缀     |
| prepend | 控件外前置内容 |
| append  | 控件外后置内容 |
| label   | 标签           |
| help    | 帮助信息       |
| error   | 错误信息       |

## Exposes

| 方法            | 类型                                                  |
| --------------- | ----------------------------------------------------- |
| focus           | (options?: FocusOptions) => void                      |
| blur            | () => void                                            |
| select          | () => void                                            |
| clear           | () => void                                            |
| validate        | () => boolean                                         |
| getInputElement | () => HTMLInputElement \| HTMLTextAreaElement \| null |

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 440px;
  margin: 16px 0;
  padding: 24px;
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
}

.demo-value {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}
</style>
