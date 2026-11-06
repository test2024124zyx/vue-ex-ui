# Form 表单示例

## 登录

<script setup>
import { reactive, ref } from 'vue'

const loginFormRef = ref(null)
const loginForm = reactive({ account: '', password: '', remember: true })
const loginStatus = ref('')
const loginRules = {
  account: [{ required: true, message: '请输入企业账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const result = await loginFormRef.value?.validate()
  loginStatus.value = result?.valid ? '登录信息校验通过' : '请先处理表单中的错误'
}

const companyFormRef = ref(null)
const companyForm = reactive({
  companyName: '',
  contact: '',
  email: '',
  scale: null,
  industry: null,
  requirement: '',
  agreement: false
})
const companyStatus = ref('')
const scaleOptions = [
  { value: '1-50', label: '1–50 人' },
  { value: '51-200', label: '51–200 人' },
  { value: '201-1000', label: '201–1000 人' },
  { value: '1000+', label: '1000 人以上' }
]
const industryOptions = [
  { value: 'manufacturing', label: '先进制造' },
  { value: 'retail', label: '零售消费' },
  { value: 'service', label: '专业服务' },
  { value: 'technology', label: '科技互联网' }
]
const companyRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入工作邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  scale: [{ required: true, message: '请选择企业规模', trigger: 'change' }],
  industry: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  agreement: [{ required: true, message: '请确认服务条款', trigger: 'change' }]
}

const handleCompanySubmit = async () => {
  const result = await companyFormRef.value?.validate()
  companyStatus.value = result?.valid ? '申请已准备就绪' : `仍有 ${result?.errors.length ?? 0} 项需要填写`
}

const filterForm = reactive({ keyword: '', department: null, status: null, owner: null })
const departmentOptions = [
  { value: 'product', label: '产品中心' },
  { value: 'engineering', label: '研发中心' },
  { value: 'sales', label: '销售中心' }
]
const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'pending', label: '待审批' },
  { value: 'closed', label: '已结束' }
]
const ownerOptions = [
  { value: 'lin', label: '林知远' },
  { value: 'zhou', label: '周予安' },
  { value: 'chen', label: '陈嘉树' }
]
const filterStatus = ref('尚未查询')
const handleFilter = () => {
  const activeFilters = Object.values(filterForm).filter(value => value !== null && value !== '').length
  filterStatus.value = `已应用 ${activeFilters} 个筛选条件`
}
const resetFilter = () => {
  Object.assign(filterForm, { keyword: '', department: null, status: null, owner: null })
  filterStatus.value = '筛选条件已重置'
}

const settingsForm = reactive({
  emailNotice: true,
  mobileNotice: false,
  weeklyReport: true,
  visibility: 'team',
  language: 'zh-CN'
})
const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' }
]
const settingsStatus = ref('')
</script>

::: raw

<div class="vp-raw form-example-shell form-example-shell--login">
  <ex-card shadow="md" aria-label="企业账号登录">
    <template #header>
      <div class="form-example-heading">
        <ex-icon icon="dashboard-line" :size="28" color="var(--ex-color-primary)" />
        <div><strong>企业工作台</strong><span>使用组织账号继续</span></div>
      </div>
    </template>
    <ex-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-placement="top"
      @submit="handleLogin"
    >
      <ex-form-item label="企业账号" prop="account">
        <ex-input v-model="loginForm.account" placeholder="name@company.com" autocomplete="username">
          <template #prefix><ex-icon icon="user-line" /></template>
        </ex-input>
      </ex-form-item>
      <ex-form-item label="密码" prop="password">
        <ex-input
          v-model="loginForm.password"
          type="password"
          show-password
          autocomplete="current-password"
          placeholder="请输入密码"
        />
      </ex-form-item>
      <ex-form-item>
        <div class="login-options">
          <ex-checkbox v-model="loginForm.remember">保持登录</ex-checkbox>
          <ex-link @click="loginStatus = '请联系组织管理员重置密码'">忘记密码</ex-link>
        </div>
      </ex-form-item>
      <ex-form-item>
        <ex-button type="primary" native-type="submit" block>登录工作台</ex-button>
      </ex-form-item>
    </ex-form>
    <ex-typography v-if="loginStatus" variant="caption" color="text-secondary">
      {{ loginStatus }}
    </ex-typography>
  </ex-card>
</div>
:::

::: details 查看示例代码

```vue
<ex-card shadow="md" aria-label="企业账号登录">
  <template #header>
    <div class="form-example-heading">
      <ex-icon icon="dashboard-line" :size="28" color="var(--ex-color-primary)" />
      <div><strong>企业工作台</strong><span>使用组织账号继续</span></div>
    </div>
  </template>
  <ex-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginRules"
    label-placement="top"
    @submit="handleLogin"
  >
    <ex-form-item label="企业账号" prop="account">
      <ex-input v-model="loginForm.account" placeholder="name@company.com" autocomplete="username">
        <template #prefix><ex-icon icon="user-line" /></template>
      </ex-input>
    </ex-form-item>
    <ex-form-item label="密码" prop="password">
      <ex-input
        v-model="loginForm.password"
        type="password"
        show-password
        autocomplete="current-password"
        placeholder="请输入密码"
      />
    </ex-form-item>
    <ex-form-item>
      <div class="login-options">
        <ex-checkbox v-model="loginForm.remember">保持登录</ex-checkbox>
        <ex-link @click="loginStatus = '请联系组织管理员重置密码'">忘记密码</ex-link>
      </div>
    </ex-form-item>
    <ex-form-item>
      <ex-button type="primary" native-type="submit" block>登录工作台</ex-button>
    </ex-form-item>
  </ex-form>
  <ex-typography v-if="loginStatus" variant="caption" color="text-secondary">
    {{ loginStatus }}
  </ex-typography>
</ex-card>
```

:::

## 企业试用申请

::: raw

<div class="vp-raw form-example-shell">
  <ex-card shadow="md">
    <template #header>
      <div class="form-example-heading">
        <ex-icon icon="user-add-line" :size="26" color="var(--ex-color-primary)" />
        <div><strong>申请企业试用</strong><span>顾问将在一个工作日内联系</span></div>
      </div>
    </template>
    <ex-form
      ref="companyFormRef"
      :model="companyForm"
      :rules="companyRules"
      label-width="104px"
      has-feedback
      @submit="handleCompanySubmit"
    >
      <div class="company-form-grid">
        <ex-form-item label="企业名称" prop="companyName">
          <ex-input v-model="companyForm.companyName" placeholder="请输入企业全称" clearable />
        </ex-form-item>
        <ex-form-item label="联系人" prop="contact">
          <ex-input v-model="companyForm.contact" placeholder="请输入联系人姓名" clearable />
        </ex-form-item>
        <ex-form-item label="工作邮箱" prop="email">
          <ex-input v-model="companyForm.email" type="email" placeholder="name@company.com" clearable />
        </ex-form-item>
        <ex-form-item label="企业规模" prop="scale">
          <ex-select v-model="companyForm.scale" :options="scaleOptions" placeholder="请选择规模" />
        </ex-form-item>
        <ex-form-item label="所属行业" prop="industry">
          <ex-select v-model="companyForm.industry" :options="industryOptions" placeholder="请选择行业" />
        </ex-form-item>
      </div>
      <ex-form-item label="核心需求" prop="requirement">
        <ex-input
          v-model="companyForm.requirement"
          type="textarea"
          :rows="3"
          :maxlength="200"
          show-word-limit
          placeholder="简要描述希望解决的业务问题"
        />
      </ex-form-item>
      <ex-form-item prop="agreement">
        <ex-checkbox v-model="companyForm.agreement">我已确认企业服务条款与隐私说明</ex-checkbox>
      </ex-form-item>
      <ex-form-item>
        <ex-space wrap>
          <ex-button type="primary" native-type="submit">提交申请</ex-button>
          <ex-button type="default" native-type="reset">清空内容</ex-button>
        </ex-space>
      </ex-form-item>
    </ex-form>
    <ex-typography v-if="companyStatus" variant="caption" color="text-secondary">
      {{ companyStatus }}
    </ex-typography>
  </ex-card>
</div>
:::

::: details 查看示例代码

```vue
<ex-card shadow="md">
  <template #header>
    <div class="form-example-heading">
      <ex-icon icon="user-add-line" :size="26" color="var(--ex-color-primary)" />
      <div><strong>申请企业试用</strong><span>顾问将在一个工作日内联系</span></div>
    </div>
  </template>
  <ex-form
    ref="companyFormRef"
    :model="companyForm"
    :rules="companyRules"
    label-width="104px"
    has-feedback
    @submit="handleCompanySubmit"
  >
    <div class="company-form-grid">
      <ex-form-item label="企业名称" prop="companyName">
        <ex-input v-model="companyForm.companyName" placeholder="请输入企业全称" clearable />
      </ex-form-item>
      <ex-form-item label="联系人" prop="contact">
        <ex-input v-model="companyForm.contact" placeholder="请输入联系人姓名" clearable />
      </ex-form-item>
      <ex-form-item label="工作邮箱" prop="email">
        <ex-input v-model="companyForm.email" type="email" placeholder="name@company.com" clearable />
      </ex-form-item>
      <ex-form-item label="企业规模" prop="scale">
        <ex-select v-model="companyForm.scale" :options="scaleOptions" placeholder="请选择规模" />
      </ex-form-item>
      <ex-form-item label="所属行业" prop="industry">
        <ex-select v-model="companyForm.industry" :options="industryOptions" placeholder="请选择行业" />
      </ex-form-item>
    </div>
    <ex-form-item label="核心需求" prop="requirement">
      <ex-input
        v-model="companyForm.requirement"
        type="textarea"
        :rows="3"
        :maxlength="200"
        show-word-limit
        placeholder="简要描述希望解决的业务问题"
      />
    </ex-form-item>
    <ex-form-item prop="agreement">
      <ex-checkbox v-model="companyForm.agreement">我已确认企业服务条款与隐私说明</ex-checkbox>
    </ex-form-item>
    <ex-form-item>
      <ex-space wrap>
        <ex-button type="primary" native-type="submit">提交申请</ex-button>
        <ex-button type="default" native-type="reset">清空内容</ex-button>
      </ex-space>
    </ex-form-item>
  </ex-form>
  <ex-typography v-if="companyStatus" variant="caption" color="text-secondary">
    {{ companyStatus }}
  </ex-typography>
</ex-card>
```

:::

## 业务筛选

::: raw

<div class="vp-raw form-example-shell">
  <ex-form :model="filterForm" layout="inline" class="filter-form">
    <ex-form-item label="关键词">
      <ex-input v-model="filterForm.keyword" type="search" placeholder="客户或项目名称" clearable />
    </ex-form-item>
    <ex-form-item label="部门">
      <ex-select v-model="filterForm.department" :options="departmentOptions" placeholder="全部部门" clearable />
    </ex-form-item>
    <ex-form-item label="状态">
      <ex-select v-model="filterForm.status" :options="statusOptions" placeholder="全部状态" clearable />
    </ex-form-item>
    <ex-form-item label="负责人">
      <ex-select v-model="filterForm.owner" :options="ownerOptions" placeholder="全部负责人" clearable searchable />
    </ex-form-item>
    <ex-form-item>
      <ex-space>
        <ex-button type="primary" @click="handleFilter">查询</ex-button>
        <ex-button type="default" :glow="false" @click="resetFilter">重置</ex-button>
      </ex-space>
    </ex-form-item>
  </ex-form>
  <ex-typography variant="caption" color="text-secondary">{{ filterStatus }}</ex-typography>
</div>
:::

::: details 查看示例代码

```vue
<ex-form :model="filterForm" layout="inline" class="filter-form">
  <ex-form-item label="关键词">
    <ex-input v-model="filterForm.keyword" type="search" placeholder="客户或项目名称" clearable />
  </ex-form-item>
  <ex-form-item label="部门">
    <ex-select v-model="filterForm.department" :options="departmentOptions" placeholder="全部部门" clearable />
  </ex-form-item>
  <ex-form-item label="状态">
    <ex-select v-model="filterForm.status" :options="statusOptions" placeholder="全部状态" clearable />
  </ex-form-item>
  <ex-form-item label="负责人">
    <ex-select
      v-model="filterForm.owner"
      :options="ownerOptions"
      placeholder="全部负责人"
      clearable
      searchable
    />
  </ex-form-item>
  <ex-form-item>
    <ex-space>
      <ex-button type="primary" @click="handleFilter">查询</ex-button>
      <ex-button type="default" :glow="false" @click="resetFilter">重置</ex-button>
    </ex-space>
  </ex-form-item>
</ex-form>
<ex-typography variant="caption" color="text-secondary">{{ filterStatus }}</ex-typography>
```

:::

## 通知与隐私设置

::: raw

<div class="vp-raw form-example-shell form-example-shell--settings">
  <ex-card shadow="sm">
    <ex-form :model="settingsForm" label-width="132px">
      <ex-form-item label="邮件通知"><ex-switch v-model="settingsForm.emailNotice" /></ex-form-item>
      <ex-form-item label="移动端通知"><ex-switch v-model="settingsForm.mobileNotice" /></ex-form-item>
      <ex-form-item label="每周经营报告"><ex-switch v-model="settingsForm.weeklyReport" /></ex-form-item>
      <ex-form-item label="资料可见范围">
        <ex-radio-group v-model="settingsForm.visibility">
          <ex-radio value="private">仅自己</ex-radio>
          <ex-radio value="team">团队成员</ex-radio>
          <ex-radio value="company">全公司</ex-radio>
        </ex-radio-group>
      </ex-form-item>
      <ex-form-item label="界面语言">
        <ex-select v-model="settingsForm.language" :options="languageOptions" />
      </ex-form-item>
      <ex-form-item>
        <ex-button type="primary" @click="settingsStatus = '设置已保存'">保存设置</ex-button>
      </ex-form-item>
    </ex-form>
    <ex-typography v-if="settingsStatus" variant="caption" color="success">
      {{ settingsStatus }}
    </ex-typography>
  </ex-card>
</div>
:::

::: details 查看示例代码

```vue
<ex-card shadow="sm">
  <ex-form :model="settingsForm" label-width="132px">
    <ex-form-item label="邮件通知"><ex-switch v-model="settingsForm.emailNotice" /></ex-form-item>
    <ex-form-item label="移动端通知"><ex-switch v-model="settingsForm.mobileNotice" /></ex-form-item>
    <ex-form-item label="每周经营报告"><ex-switch v-model="settingsForm.weeklyReport" /></ex-form-item>
    <ex-form-item label="资料可见范围">
      <ex-radio-group v-model="settingsForm.visibility">
        <ex-radio value="private">仅自己</ex-radio>
        <ex-radio value="team">团队成员</ex-radio>
        <ex-radio value="company">全公司</ex-radio>
      </ex-radio-group>
    </ex-form-item>
    <ex-form-item label="界面语言">
      <ex-select v-model="settingsForm.language" :options="languageOptions" />
    </ex-form-item>
    <ex-form-item>
      <ex-button type="primary" @click="settingsStatus = '设置已保存'">保存设置</ex-button>
    </ex-form-item>
  </ex-form>
  <ex-typography v-if="settingsStatus" variant="caption" color="success">
    {{ settingsStatus }}
  </ex-typography>
</ex-card>
```

:::

<style scoped>
.form-example-shell {
  margin: 20px 0;
}

.form-example-shell--login {
  max-width: 430px;
  margin-inline: auto;
}

.form-example-shell--settings {
  max-width: 720px;
}

.form-example-heading {
  display: flex;
  gap: 12px;
  align-items: center;
}

.form-example-heading div {
  display: grid;
  gap: 4px;
}

.form-example-heading span {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
  font-weight: var(--ex-font-normal);
}

.login-options {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  width: 100%;
}

.company-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;
}

.company-form-grid :deep(.ex-select),
.form-example-shell--settings :deep(.ex-select) {
  width: 100%;
}

.filter-form {
  margin-bottom: 12px;
}

@media (max-width: 720px) {
  .company-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
