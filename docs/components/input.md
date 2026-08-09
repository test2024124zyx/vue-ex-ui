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

::: raw

<div class="vp-raw demo-container">
  <ex-input v-model="basic" placeholder="请输入内容" />
  <ex-input v-model="basic" size="small" placeholder="小尺寸" />
  <ex-input v-model="basic" size="large" placeholder="大尺寸" />
</div>
:::

::: details 查看示例代码

```vue
<ex-input v-model="basic" placeholder="请输入内容" />
<ex-input v-model="basic" size="small" placeholder="小尺寸" />
<ex-input v-model="basic" size="large" placeholder="大尺寸" />
```

:::

## 变体与状态

::: raw

<div class="vp-raw demo-container">
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
:::

::: details 查看示例代码

```vue
<ex-input v-model="basic" variant="neon" placeholder="Neon" />
<ex-input v-model="basic" variant="ghost" placeholder="Ghost" />
<ex-input v-model="basic" variant="filled" placeholder="Filled" />
<ex-input v-model="basic" status="success" placeholder="成功状态" />
<ex-input v-model="basic" status="warning" placeholder="警告状态" />
<ex-input v-model="basic" status="error" error-message="输入内容无效" placeholder="错误状态" />
```

:::

## 终端提示符控制

霓虹输入框默认显示 `>` 提示符。可以通过 `prompt` 修改提示符文本，或通过 `show-prompt` 隐藏提示符；`prefix` 插槽存在时会优先使用插槽内容。

::: raw

<div class="vp-raw demo-container">
  <ex-input v-model="basic" prompt="$" placeholder="自定义提示符" />
  <ex-input v-model="basic" :show-prompt="false" placeholder="隐藏提示符" />
</div>
:::

::: details 查看示例代码

```vue
<ex-input v-model="basic" prompt="$" placeholder="自定义提示符" />
<ex-input v-model="basic" :show-prompt="false" placeholder="隐藏提示符" />
```

:::

## 清空与密码

::: raw

<div class="vp-raw demo-container">
  <ex-input v-model="clearable" clearable placeholder="可清空" />
  <ex-input v-model="password" type="password" show-password placeholder="请输入密码" />
  <ex-input v-model="clearable" disabled clearable placeholder="禁用" />
  <ex-input v-model="clearable" readonly clearable placeholder="只读" />
</div>
:::

::: details 查看示例代码

```vue
<ex-input v-model="clearable" clearable placeholder="可清空" />
<ex-input v-model="password" type="password" show-password placeholder="请输入密码" />
<ex-input v-model="clearable" disabled clearable placeholder="禁用" />
<ex-input v-model="clearable" readonly clearable placeholder="只读" />
```

:::

## 前后缀与字数统计

::: raw

<div class="vp-raw demo-container">
  <ex-input v-model="basic" prepend="https://" append=".com" placeholder="域名" />
  <ex-input v-model="limited" :maxlength="20" show-word-limit placeholder="最多 20 个字符">
    <template #prefix>
      <ex-icon icon="search-line" aria-hidden="true" />
    </template>
  </ex-input>
</div>
:::

::: details 查看示例代码

```vue
<ex-input v-model="basic" prepend="https://" append=".com" placeholder="域名" />
<ex-input v-model="limited" :maxlength="20" show-word-limit placeholder="最多 20 个字符">
  <template #prefix>
    <ex-icon icon="search-line" aria-hidden="true" />
  </template>
</ex-input>
```

:::

## 文本域

::: raw

<div class="vp-raw demo-container">
  <ex-input
    v-model="textarea"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 6 }"
    placeholder="请输入多行内容"
  />
</div>
:::

::: details 查看示例代码

```vue
<ex-input
  v-model="textarea"
  type="textarea"
  :autosize="{ minRows: 2, maxRows: 6 }"
  placeholder="请输入多行内容"
/>
```

:::

## 格式化

::: raw

<div class="vp-raw demo-container">
  <ex-input
    v-model="formatted"
    :formatter="formatThousands"
    :parser="parseThousands"
    inputmode="numeric"
  />
  <div class="demo-value">模型值：{{ formatted }}</div>
</div>
:::

::: details 查看示例代码

```vue
<ex-input
  v-model="formatted"
  :formatter="formatThousands"
  :parser="parseThousands"
  inputmode="numeric"
/>
<div class="demo-value">模型值：{{ formatted }}</div>
```

:::

## 标签、提示与校验

独立使用时，请通过 `label`、`label` 插槽或 `aria-label` / `aria-labelledby` 提供可访问名称。`rules` 默认在失焦时校验，只有需要边输入边反馈时才配置 `validate-trigger="input"`；也可以使用 `change` 或 `manual`（仅由 `validate()` 触发）。组件同时支持 `v-model.trim`、`v-model.number` 与 `v-model.lazy`。

::: raw

<div class="vp-raw demo-container">
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
:::

::: details 查看示例代码

```vue
<ex-input
  v-model="email"
  id="email-example"
  label="邮箱"
  required
  help-text="用于接收通知"
  :rules="emailRules"
  placeholder="name@example.com"
/>
```

:::

## Props

| 参数                  | 类型                                                                    | 默认值     |
| --------------------- | ----------------------------------------------------------------------- | ---------- |
| model-value / v-model | string \| number                                                        | —          |
| v-model 修饰符        | trim \| number \| lazy                                                  | —          |
| id                    | string                                                                  | 自动生成   |
| type                  | text \| password \| email \| number \| tel \| url \| search \| textarea | text       |
| size                  | small \| medium \| large                                                | medium     |
| variant               | neon \| ghost \| filled                                                 | neon       |
| status                | default \| success \| warning \| error                                  | default    |
| prompt                | string                                                                  | >          |
| show-prompt           | boolean                                                                 | true       |
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
| validate-trigger      | input \| change \| blur \| manual \| Array                              | blur       |
| rows                  | number                                                                  | 3          |
| autosize              | boolean \| { minRows?: number; maxRows?: number }                       | false      |
| formatter             | (value: string) => string                                               | —          |
| parser                | (value: string) => string                                               | —          |

<code>class</code> 和 <code>style</code> 应用于组件根节点；其余未声明的原生属性与监听器转发到真实的 <code>input</code> 或 <code>textarea</code>。

## Events

| 事件               | 参数                                    |
| ------------------ | --------------------------------------- |
| update:model-value | (value: string \| number)               |
| input              | (value: string \| number, event: Event) |
| change             | (value: string \| number, event: Event) |
| focus              | (event: FocusEvent)                     |
| blur               | (event: FocusEvent)                     |
| clear              | ()                                      |
| keydown            | (event: KeyboardEvent)                  |
| keyup              | (event: KeyboardEvent)                  |
| enter              | (event: KeyboardEvent)                  |
| validation-error   | (error: string)                         |

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
