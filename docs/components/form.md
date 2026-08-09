# Form 表单

用于组织数据录入、字段校验和提交操作。

当 `ExFormItem` 包裹 `ExInput` 时，标签、帮助/错误消息会自动与真实输入控件建立可访问性关联；`Form` 的 `size`、`disabled` 与 `readonly` 也会同步到输入框的原生语义。

<script setup>
import { reactive, ref } from 'vue'

const departmentOptions = [
  { value: 'product', label: '产品中心' },
  { value: 'engineering', label: '研发中心' },
  { value: 'sales', label: '销售中心' }
]

const profile = reactive({
  name: '',
  email: '',
  department: null,
  role: 'member',
  notice: true
})

const validationFormRef = ref(null)
const validationForm = reactive({
  account: '',
  email: '',
  password: '',
  department: null,
  agreement: false
})
const validationMessage = ref('')

const validationRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度应为 3–20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' }
  ],
  department: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  agreement: [{ required: true, message: '请确认服务条款', trigger: 'change' }]
}

const handleValidationSubmit = async () => {
  const result = await validationFormRef.value?.validate()
  validationMessage.value = result?.valid ? '校验通过，可以提交' : `还有 ${result?.errors.length ?? 0} 个字段需要处理`
}

const handleValidationReset = () => {
  validationFormRef.value?.resetFields()
  validationMessage.value = ''
}

const layoutForm = reactive({ keyword: '', status: null })
const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'closed', label: '已结束' }
]
</script>

## 基础用法

::: raw
<div class="vp-raw demo-container form-demo-narrow">
  <ex-form :model="profile" label-width="96px">
    <ex-form-item label="姓名" prop="name">
      <ex-input v-model="profile.name" placeholder="请输入姓名" clearable />
    </ex-form-item>
    <ex-form-item label="邮箱" prop="email">
      <ex-input v-model="profile.email" type="email" placeholder="name@company.com" clearable />
    </ex-form-item>
    <ex-form-item label="所属部门" prop="department">
      <ex-select
        v-model="profile.department"
        :options="departmentOptions"
        placeholder="请选择部门"
        clearable
        style="width: 100%"
      />
    </ex-form-item>
    <ex-form-item label="成员角色" prop="role">
      <ex-radio-group v-model="profile.role">
        <ex-radio value="member">普通成员</ex-radio>
        <ex-radio value="manager">管理员</ex-radio>
      </ex-radio-group>
    </ex-form-item>
    <ex-form-item label="邮件通知" prop="notice">
      <ex-switch v-model="profile.notice" />
    </ex-form-item>
    <ex-form-item>
      <ex-space>
        <ex-button type="primary" native-type="submit">保存资料</ex-button>
        <ex-button type="default" native-type="reset">重置</ex-button>
      </ex-space>
    </ex-form-item>
  </ex-form>
</div>
:::

```vue
<ex-form :model="profile" label-width="96px">
  <ex-form-item label="姓名" prop="name">
    <ex-input v-model="profile.name" />
  </ex-form-item>
  <ex-form-item label="所属部门" prop="department">
    <ex-select v-model="profile.department" :options="departmentOptions" style="width: 100%" />
  </ex-form-item>
  <ex-form-item>
    <ex-button native-type="submit">保存资料</ex-button>
  </ex-form-item>
</ex-form>
```

## 表单校验

::: raw
<div class="vp-raw demo-container form-demo-narrow">
  <ex-form
    ref="validationFormRef"
    :model="validationForm"
    :rules="validationRules"
    label-width="100px"
    has-feedback
    @submit="handleValidationSubmit"
  >
    <ex-form-item label="账号" prop="account">
      <ex-input v-model="validationForm.account" placeholder="3–20 个字符" clearable />
    </ex-form-item>
    <ex-form-item label="邮箱" prop="email">
      <ex-input v-model="validationForm.email" type="email" placeholder="name@company.com" clearable />
    </ex-form-item>
    <ex-form-item label="密码" prop="password" help="至少 8 个字符">
      <ex-input v-model="validationForm.password" type="password" show-password />
    </ex-form-item>
    <ex-form-item label="部门" prop="department">
      <ex-select
        v-model="validationForm.department"
        :options="departmentOptions"
        placeholder="请选择部门"
        style="width: 100%"
      />
    </ex-form-item>
    <ex-form-item prop="agreement">
      <ex-checkbox v-model="validationForm.agreement">我已确认服务条款</ex-checkbox>
    </ex-form-item>
    <ex-form-item>
      <ex-space wrap>
        <ex-button type="primary" native-type="submit">提交校验</ex-button>
        <ex-button type="default" @click="handleValidationReset">重置字段</ex-button>
      </ex-space>
    </ex-form-item>
  </ex-form>
  <ex-typography v-if="validationMessage" variant="caption" color="text-secondary">
    {{ validationMessage }}
  </ex-typography>
</div>
:::

## 布局

::: raw
<div class="vp-raw demo-container form-layout-stack">
  <section>
    <ex-typography variant="title">垂直布局</ex-typography>
    <ex-form :model="layoutForm" layout="vertical">
      <ex-form-item label="关键词"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
      <ex-form-item label="状态">
        <ex-select v-model="layoutForm.status" :options="statusOptions" style="width: 100%" />
      </ex-form-item>
    </ex-form>
  </section>
  <section>
    <ex-typography variant="title">水平布局</ex-typography>
    <ex-form :model="layoutForm" layout="horizontal" label-width="80px">
      <ex-form-item label="关键词"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
      <ex-form-item label="状态">
        <ex-select v-model="layoutForm.status" :options="statusOptions" style="width: 100%" />
      </ex-form-item>
    </ex-form>
  </section>
  <section>
    <ex-typography variant="title">内联布局</ex-typography>
    <ex-form :model="layoutForm" layout="inline">
      <ex-form-item label="关键词">
        <ex-input v-model="layoutForm.keyword" placeholder="搜索项目" />
      </ex-form-item>
      <ex-form-item label="状态">
        <ex-select v-model="layoutForm.status" :options="statusOptions" placeholder="全部状态" />
      </ex-form-item>
      <ex-form-item><ex-button type="primary">查询</ex-button></ex-form-item>
    </ex-form>
  </section>
</div>
:::

## 尺寸与状态

::: raw
<div class="vp-raw demo-container form-size-grid">
  <ex-form :model="layoutForm" size="small" label-placement="top">
    <ex-form-item label="小型"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
  </ex-form>
  <ex-form :model="layoutForm" size="medium" label-placement="top">
    <ex-form-item label="中型"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
  </ex-form>
  <ex-form :model="layoutForm" size="large" label-placement="top">
    <ex-form-item label="大型"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
  </ex-form>
  <ex-form :model="layoutForm" disabled label-placement="top">
    <ex-form-item label="禁用表单"><ex-input v-model="layoutForm.keyword" /></ex-form-item>
  </ex-form>
</div>
:::

## Form API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model` | 表单数据对象 | `Record<string, unknown>` | `{}` |
| `rules` | 字段校验规则 | `Record<string, FormRule \| FormRule[]>` | `{}` |
| `layout` | 布局 | `horizontal \| vertical \| inline` | `vertical` |
| `size` | 尺寸 | `small \| medium \| large` | `medium` |
| `labelWidth` | 标签宽度 | `string \| number` | — |
| `labelAlign` | 标签对齐 | `left \| right \| top` | `left` |
| `labelPlacement` | 标签位置 | `left \| top` | `left` |
| `showColon` | 是否显示冒号 | `boolean` | `true` |
| `hasFeedback` | 是否显示校验反馈图标 | `boolean` | `false` |
| `disabled` | 是否禁用整表交互 | `boolean` | `false` |
| `readonly` | 是否只读 | `boolean` | `false` |
| `name` | 原生表单名称 | `string` | — |
| `validateOnRuleChange` | 规则变化后是否校验 | `boolean` | `true` |
| `scrollToError` | 是否滚动到首个错误字段 | `boolean` | `true` |

### Events

| 事件名 | 参数 |
| --- | --- |
| `submit` | `(event: Event)` |
| `reset` | `(event: Event)` |
| `field-change` | `(field: string, value: unknown)` |
| `field-validate` | `(field: string, result: FormValidateResult)` |

### Methods

| 方法 | 类型 |
| --- | --- |
| `validate` | `(callback?) => Promise<FormValidateResult>` |
| `validateField` | `(props: string \| string[], callback?) => Promise<FormValidateResult>` |
| `resetFields` | `(props?: string \| string[]) => void` |
| `clearValidate` | `(props?: string \| string[]) => void` |
| `scrollToField` | `(prop: string) => void` |
| `getFieldValue` | `(prop: string) => unknown` |
| `setFieldValue` | `(prop: string, value: unknown) => void` |
| `getFieldsValue` | `(props?: string[]) => Record<string, unknown>` |
| `setFieldsValue` | `(values: Record<string, unknown>) => void` |

## FormItem API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `prop` | 字段路径 | `string` | — |
| `label` | 标签文本 | `string` | — |
| `labelWidth` | 标签宽度 | `string \| number` | 继承 Form |
| `labelAlign` | 标签对齐 | `left \| right \| top` | 继承 Form |
| `labelPlacement` | 标签位置 | `left \| top` | 继承 Form |
| `required` | 是否显示必填标记 | `boolean` | 从规则推导 |
| `rules` | 局部校验规则 | `FormRule \| FormRule[]` | — |
| `validateStatus` | 手动校验状态 | `success \| warning \| error \| validating \| ''` | `''` |
| `help` | 帮助文本 | `string` | — |
| `error` | 手动错误文本 | `string` | — |
| `hasFeedback` | 是否显示反馈图标 | `boolean` | 继承 Form |
| `showColon` | 是否显示冒号 | `boolean` | 继承 Form |
| `size` | 尺寸 | `small \| medium \| large` | 继承 Form |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 表单控件 |
| `label` | 自定义标签 |

### Methods

| 方法 | 类型 |
| --- | --- |
| `validate` | `(trigger?: string) => Promise<{ valid: boolean; error?: string }>` |
| `resetField` | `() => void` |
| `clearValidate` | `() => void` |

<style scoped>
.form-demo-narrow {
  max-width: 620px;
}

.form-layout-stack {
  display: grid;
  gap: 30px;
}

.form-layout-stack section {
  display: grid;
  gap: 14px;
}

.form-size-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 22px;
  align-items: start;
}
</style>
