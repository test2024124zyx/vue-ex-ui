# Form 表单

用于数据录入、校验，支持多种布局和验证规则。

<script setup>
import { ref, reactive } from 'vue'

const formData = reactive({
  username: '',
  email: '',
  password: '',
  age: '',
  gender: '',
  agree: false,
  description: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const formRef = ref(null)

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const result = await formRef.value.validate()
  if (result.valid) {
    console.log('表单验证通过', formData)
  } else {
    console.log('表单验证失败', result.errors)
  }
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

const dynamicItems = ref([
  { key: Date.now(), value: '' }
])

const addItem = () => {
  dynamicItems.value.push({
    key: Date.now(),
    value: ''
  })
}

const removeItem = (index) => {
  dynamicItems.value.splice(index, 1)
}
</script>

## 基础用法

最基础的表单包括各种输入控件，如 input、select、radio、checkbox 等。

<div class="demo-container">
  <ExForm :model="formData" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    <ExFormItem>
      <button type="submit">提交</button>
      <button type="reset" style="margin-left: 10px;">重置</button>
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm :model="formData" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    <ExFormItem>
      <button type="submit">提交</button>
      <button type="reset">重置</button>
    </ExFormItem>
  </ExForm>
</template>

<script setup>
import { reactive } from 'vue'

const formData = reactive({
  username: '',
  email: '',
  password: ''
})
</script>
```

## 表单验证

通过 `rules` 属性传入验证规则，并在 FormItem 中设置 `prop` 属性。

<div class="demo-container">
  <ExForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    <ExFormItem>
      <button @click="handleSubmit">提交</button>
      <button @click="handleReset" style="margin-left: 10px;">重置</button>
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" />
    </ExFormItem>
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" />
    </ExFormItem>
    <ExFormItem>
      <button @click="handleSubmit">提交</button>
      <button @click="handleReset">重置</button>
    </ExFormItem>
  </ExForm>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)
const formData = reactive({
  username: '',
  email: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  const result = await formRef.value.validate()
  if (result.valid) {
    console.log('提交', formData)
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>
```

## 表单布局

通过 `layout` 属性设置表单布局，支持 `vertical`（垂直）、`horizontal`（水平）、`inline`（内联）三种布局。

<div class="demo-container">
  <h4>垂直布局</h4>
  <ExForm :model="formData" layout="vertical">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>

  <h4 style="margin-top: 24px;">水平布局</h4>
  <ExForm :model="formData" layout="horizontal" label-width="80px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>

  <h4 style="margin-top: 24px;">内联布局</h4>
  <ExForm :model="formData" layout="inline">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" style="width: 150px;" />
    </ExFormItem>
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" style="width: 150px;" />
    </ExFormItem>
    <ExFormItem>
      <button>搜索</button>
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <!-- 垂直布局 -->
  <ExForm :model="formData" layout="vertical">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <!-- 水平布局 -->
  <ExForm :model="formData" layout="horizontal" label-width="80px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <!-- 内联布局 -->
  <ExForm :model="formData" layout="inline">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem>
      <button>搜索</button>
    </ExFormItem>
  </ExForm>
</template>
```

## 表单尺寸

通过 `size` 属性设置表单尺寸，支持 `small`、`medium`、`large` 三种尺寸。

<div class="demo-container">
  <ExForm :model="formData" size="small" label-width="80px">
    <ExFormItem label="Small">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <ExForm :model="formData" size="medium" label-width="80px" style="margin-top: 16px;">
    <ExFormItem label="Medium">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <ExForm :model="formData" size="large" label-width="80px" style="margin-top: 16px;">
    <ExFormItem label="Large">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm :model="formData" size="small" label-width="80px">
    <ExFormItem label="Small">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <ExForm :model="formData" size="medium" label-width="80px">
    <ExFormItem label="Medium">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <ExForm :model="formData" size="large" label-width="80px">
    <ExFormItem label="Large">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>
</template>
```

## 标签对齐

通过 `label-align` 属性设置标签对齐方式。当设置了 `label-width` 时，`right` 对齐可以让标签更整齐。

<div class="demo-container">
  <h4>左对齐（默认）</h4>
  <ExForm :model="formData" label-width="100px" label-align="left">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱地址">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>

  <h4 style="margin-top: 24px;">右对齐</h4>
  <ExForm :model="formData" label-width="100px" label-align="right">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱地址">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <!-- 左对齐 -->
  <ExForm :model="formData" label-width="100px" label-align="left">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>

  <!-- 右对齐 -->
  <ExForm :model="formData" label-width="100px" label-align="right">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
  </ExForm>
</template>
```

## 禁用状态

通过 `disabled` 属性禁用整个表单。

<div class="demo-container">
  <ExForm :model="formData" disabled label-width="80px">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm :model="formData" disabled label-width="80px">
    <ExFormItem label="用户名">
      <input v-model="formData.username" />
    </ExFormItem>
    <ExFormItem label="邮箱">
      <input v-model="formData.email" />
    </ExFormItem>
  </ExForm>
</template>
```

## 复杂表单示例

一个包含多种表单控件的完整示例。

<div class="demo-container">
  <ExForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </ExFormItem>
    
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    
    <ExFormItem label="年龄" prop="age">
      <input v-model.number="formData.age" type="number" placeholder="请输入年龄" />
    </ExFormItem>
    
    <ExFormItem label="性别" prop="gender">
      <ExRadioGroup v-model="formData.gender">
        <ExRadio value="male">男</ExRadio>
        <ExRadio value="female">女</ExRadio>
      </ExRadioGroup>
    </ExFormItem>
    
    <ExFormItem label="同意协议" prop="agree">
      <ExCheckbox v-model="formData.agree">我已阅读并同意用户协议</ExCheckbox>
    </ExFormItem>
    
    <ExFormItem label="简介" prop="description">
      <textarea v-model="formData.description" rows="4" placeholder="请输入个人简介" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff; font-family: inherit;"></textarea>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleSubmit" style="margin-right: 10px;">提交</button>
      <button @click="handleReset">重置</button>
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </ExFormItem>
    
    <ExFormItem label="邮箱" prop="email">
      <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    
    <ExFormItem label="密码" prop="password">
      <input v-model="formData.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    
    <ExFormItem label="年龄" prop="age">
      <input v-model.number="formData.age" type="number" placeholder="请输入年龄" />
    </ExFormItem>
    
    <ExFormItem label="性别" prop="gender">
      <ExRadioGroup v-model="formData.gender">
        <ExRadio value="male">男</ExRadio>
        <ExRadio value="female">女</ExRadio>
      </ExRadioGroup>
    </ExFormItem>
    
    <ExFormItem label="同意协议" prop="agree">
      <ExCheckbox v-model="formData.agree">我已阅读并同意用户协议</ExCheckbox>
    </ExFormItem>
    
    <ExFormItem label="简介" prop="description">
      <textarea v-model="formData.description" rows="4" placeholder="请输入个人简介"></textarea>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleSubmit">提交</button>
      <button @click="handleReset">重置</button>
    </ExFormItem>
  </ExForm>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)
const formData = reactive({
  username: '',
  email: '',
  password: '',
  age: '',
  gender: '',
  agree: false,
  description: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  const result = await formRef.value.validate()
  if (result.valid) {
    console.log('提交', formData)
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>
```

## 动态表单

动态添加和删除表单项。

<div class="demo-container">
  <ExForm :model="{ items: dynamicItems }" label-width="100px">
    <ExFormItem 
      v-for="(item, index) in dynamicItems" 
      :key="item.key"
      :label="`项目 ${index + 1}`"
    >
      <div style="display: flex; gap: 8px; align-items: center;">
        <input v-model="item.value" placeholder="请输入内容" style="flex: 1; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
        <button @click="removeItem(index)" style="padding: 8px 16px;">删除</button>
      </div>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="addItem">添加项目</button>
    </ExFormItem>
  </ExForm>
</div>

```vue
<template>
  <ExForm :model="{ items: dynamicItems }" label-width="100px">
    <ExFormItem 
      v-for="(item, index) in dynamicItems" 
      :key="item.key"
      :label="`项目 ${index + 1}`"
    >
      <div style="display: flex; gap: 8px;">
        <input v-model="item.value" placeholder="请输入内容" />
        <button @click="removeItem(index)">删除</button>
      </div>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="addItem">添加项目</button>
    </ExFormItem>
  </ExForm>
</template>

<script setup>
import { ref } from 'vue'

const dynamicItems = ref([
  { key: Date.now(), value: '' }
])

const addItem = () => {
  dynamicItems.value.push({
    key: Date.now(),
    value: ''
  })
}

const removeItem = (index) => {
  dynamicItems.value.splice(index, 1)
}
</script>
```

## API

### Form Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model | 表单数据对象 | `Record<string, unknown>` | - |
| rules | 表单验证规则 | `Record<string, FormRule \| FormRule[]>` | - |
| layout | 表单布局 | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` |
| size | 表单尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| labelWidth | 标签宽度 | `string \| number` | - |
| labelAlign | 标签对齐方式 | `'left' \| 'right' \| 'top'` | `'left'` |
| labelPlacement | 标签位置 | `'left' \| 'top'` | `'left'` |
| showColon | 是否显示冒号 | `boolean` | `true` |
| hasFeedback | 是否显示验证反馈图标 | `boolean` | `false` |
| disabled | 是否禁用表单 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| name | 表单名称 | `string` | - |
| validateOnRuleChange | 是否在规则改变后立即触发验证 | `boolean` | `true` |
| scrollToError | 是否滚动到第一个错误字段 | `boolean` | `true` |
| customClass | 自定义类名 | `string` | - |
| customStyle | 自定义样式 | `Record<string, string>` | - |

### Form Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| submit | 表单提交事件 | `(event: Event) => void` |
| reset | 表单重置事件 | `(event: Event) => void` |
| field-change | 字段值改变事件 | `(field: string, value: unknown) => void` |
| field-validate | 字段验证事件 | `(field: string, result: FormValidateResult) => void` |

### Form Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 验证整个表单 | `(callback?: (valid: boolean, errors?: FormValidateError[]) => void) => Promise<FormValidateResult>` |
| validateField | 验证指定字段 | `(props: string \| string[], callback?: (valid: boolean, errors?: FormValidateError[]) => void) => Promise<FormValidateResult>` |
| resetFields | 重置整个表单 | `(props?: string \| string[]) => void` |
| clearValidate | 清除验证结果 | `(props?: string \| string[]) => void` |
| scrollToField | 滚动到指定字段 | `(prop: string) => void` |
| getFieldValue | 获取字段值 | `(prop: string) => unknown` |
| setFieldValue | 设置字段值 | `(prop: string, value: unknown) => void` |
| getFieldsValue | 获取所有字段值 | `(props?: string[]) => Record<string, unknown>` |
| setFieldsValue | 设置多个字段值 | `(values: Record<string, unknown>) => void` |

### FormItem Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 字段名 | `string` | - |
| label | 标签文本 | `string` | - |
| labelWidth | 标签宽度 | `string \| number` | - |
| labelAlign | 标签对齐方式 | `'left' \| 'right' \| 'top'` | `'left'` |
| labelPlacement | 标签位置 | `'left' \| 'top'` | `'left'` |
| required | 是否必填 | `boolean` | `false` |
| rules | 验证规则 | `FormRule \| FormRule[]` | - |
| validateStatus | 验证状态 | `'success' \| 'warning' \| 'error' \| 'validating'` | - |
| help | 帮助文本 | `string` | - |
| error | 错误消息 | `string` | - |
| hasFeedback | 是否显示验证反馈图标 | `boolean` | `false` |
| showColon | 是否显示冒号 | `boolean` | `true` |
| size | 表单项尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| customClass | 自定义类名 | `string` | - |
| customStyle | 自定义样式 | `Record<string, string>` | - |

### FormItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| validate-status-change | 验证状态改变事件 | `(status: FormValidateStatus, error?: string) => void` |

### FormItem Slots

| 插槽名 | 说明 |
|--------|------|
| default | 表单控件 |
| label | 标签内容 |

### FormItem Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 验证字段 | `(trigger?: string) => Promise<{ valid: boolean; error?: string }>` |
| resetField | 重置字段 | `() => void` |
| clearValidate | 清除验证结果 | `() => void` |

<style scoped>
.demo-container {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
  margin: 16px 0;
}

.demo-container h4 {
  margin: 0 0 16px 0;
  color: var(--ex-color-text-primary);
  font-size: var(--ex-text-base);
  font-weight: var(--ex-font-medium);
}

.demo-container input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 2px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
  background: transparent;
  color: var(--ex-color-text-primary);
  font-family: var(--ex-font-secondary);
  font-size: var(--ex-text-base);
  outline: none;
  transition: all 0.2s;
}

.demo-container input:focus {
  border-color: var(--ex-color-neon-blue-500);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.demo-container button {
  height: 40px;
  padding: 0 24px;
  border: 2px solid var(--ex-color-neon-blue-500);
  border-radius: var(--ex-radius-base);
  background: linear-gradient(135deg, var(--ex-color-neon-blue-500), var(--ex-color-neon-blue-600));
  color: var(--ex-color-white);
  font-family: var(--ex-font-secondary);
  font-size: var(--ex-text-base);
  font-weight: var(--ex-font-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-container button:hover {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
  transform: translateY(-2px);
}
</style>
