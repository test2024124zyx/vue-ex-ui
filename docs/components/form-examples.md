# Form 表单示例集

这里展示了各种实用的表单场景和最佳实践。

<script setup>
import { ref, reactive, computed } from 'vue'

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const loginFormRef = ref(null)

const handleLogin = async () => {
  const result = await loginFormRef.value?.validate()
  if (result.valid) {
    console.log('登录', loginForm)
  }
}

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agree: false
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
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
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  agree: [
    { required: true, message: '请阅读并同意用户协议', trigger: 'change' }
  ]
}

const registerFormRef = ref(null)

const handleRegister = async () => {
  const result = await registerFormRef.value?.validate()
  if (result.valid) {
    console.log('注册', registerForm)
  }
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  dateRange: []
})

const handleSearch = () => {
  console.log('搜索', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    status: '',
    dateRange: []
  })
}

// 设置表单
const settingsForm = reactive({
  notifications: {
    email: true,
    sms: false,
    push: true
  },
  privacy: {
    profileVisible: true,
    showEmail: false,
    showPhone: false
  },
  theme: 'dark',
  language: 'zh-CN'
})

const handleSaveSettings = () => {
  console.log('保存设置', settingsForm)
}
</script>

## 登录表单

经典的登录表单示例。

<div class="demo-container">
  <div style="max-width: 400px; margin: 0 auto;">
    <h3 style="text-align: center; color: #00f0ff; margin-bottom: 24px;">用户登录</h3>
    <ExForm ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
      <ExFormItem prop="username">
        <input 
          v-model="loginForm.username" 
          placeholder="用户名" 
          style="width: 100%; padding: 12px; background: rgba(44, 0, 62, 0.6); border: 2px solid #00f0ff; color: #fff; font-size: 14px;"
        />
      </ExFormItem>
      <ExFormItem prop="password">
        <input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="密码" 
          style="width: 100%; padding: 12px; background: rgba(44, 0, 62, 0.6); border: 2px solid #00f0ff; color: #fff; font-size: 14px;"
        />
      </ExFormItem>
      <ExFormItem>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <ExCheckbox v-model="loginForm.remember">记住我</ExCheckbox>
          <a href="#" style="color: #00f0ff; text-decoration: none;">忘记密码？</a>
        </div>
      </ExFormItem>
      <ExFormItem>
        <button 
          @click="handleLogin" 
          style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00f0ff, #00d4e6); border: none; color: #0a0a0a; font-weight: 600; cursor: pointer; font-size: 16px;"
        >
          登录
        </button>
      </ExFormItem>
      <div style="text-align: center; margin-top: 16px;">
        <span style="color: #8a8c94;">还没有账号？</span>
        <a href="#" style="color: #00f0ff; text-decoration: none; margin-left: 8px;">立即注册</a>
      </div>
    </ExForm>
  </div>
</div>


```vue
<template>
  <ExForm ref="loginFormRef" :model="loginForm" :rules="loginRules">
    <ExFormItem prop="username">
      <input v-model="loginForm.username" placeholder="用户名" />
    </ExFormItem>
    
    <ExFormItem prop="password">
      <input v-model="loginForm.password" type="password" placeholder="密码" />
    </ExFormItem>
    
    <ExFormItem>
      <ExCheckbox v-model="loginForm.remember">记住我</ExCheckbox>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleLogin">登录</button>
    </ExFormItem>
  </ExForm>
</template>

<script setup>
import { ref, reactive } from 'vue'

const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const result = await loginFormRef.value?.validate()
  if (result.valid) {
    console.log('登录', loginForm)
  }
}
</script>
```

## 注册表单

包含多种验证规则的注册表单。


<div class="demo-container">
  <div style="max-width: 500px; margin: 0 auto;">
    <h3 style="text-align: center; color: #00f0ff; margin-bottom: 24px;">用户注册</h3>
    <ExForm ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="100px">
      <ExFormItem label="用户名" prop="username">
        <input v-model="registerForm.username" placeholder="请输入用户名" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
      </ExFormItem>
      <ExFormItem label="邮箱" prop="email">
        <input v-model="registerForm.email" type="email" placeholder="请输入邮箱" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
      </ExFormItem> 
      <ExFormItem label="手机号" prop="phone">
        <input v-model="registerForm.phone" placeholder="请输入手机号" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
      </ExFormItem>
      <ExFormItem label="密码" prop="password">
        <input v-model="registerForm.password" type="password" placeholder="请输入密码" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
      </ExFormItem>  
      <ExFormItem label="确认密码" prop="confirmPassword">
        <input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" style="width: 100%; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
      </ExFormItem>
      <ExFormItem prop="agree">
        <ExCheckbox v-model="registerForm.agree">
          我已阅读并同意<a href="#" style="color: #00f0ff;">《用户协议》</a>和<a href="#" style="color: #00f0ff;">《隐私政策》</a>
        </ExCheckbox>
      </ExFormItem>
      <ExFormItem>
        <button @click="handleRegister" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00f0ff, #00d4e6); border: none; color: #0a0a0a; font-weight: 600; cursor: pointer;">
          注册
        </button>
      </ExFormItem>
    </ExForm>
  </div>
</div>



```vue
<template>
  <ExForm ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="100px">
    <ExFormItem label="用户名" prop="username">
      <input v-model="registerForm.username" placeholder="请输入用户名" />
    </ExFormItem>
    
    <ExFormItem label="邮箱" prop="email">
      <input v-model="registerForm.email" type="email" placeholder="请输入邮箱" />
    </ExFormItem>
    
    <ExFormItem label="手机号" prop="phone">
      <input v-model="registerForm.phone" placeholder="请输入手机号" />
    </ExFormItem>
    
    <ExFormItem label="密码" prop="password">
      <input v-model="registerForm.password" type="password" placeholder="请输入密码" />
    </ExFormItem>
    
    <ExFormItem label="确认密码" prop="confirmPassword">
      <input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
    </ExFormItem>
    
    <ExFormItem prop="agree">
      <ExCheckbox v-model="registerForm.agree">
        我已阅读并同意用户协议
      </ExCheckbox>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleRegister">注册</button>
    </ExFormItem>
  </ExForm>
</template>
```

## 搜索表单

内联布局的搜索表单。


<div class="demo-container">
  <ExForm :model="searchForm" layout="inline">
    <ExFormItem label="关键词">
      <input v-model="searchForm.keyword" placeholder="搜索..." style="width: 200px; padding: 8px; background: transparent; border: 2px solid #00f0ff; color: #fff;" />
    </ExFormItem>
    <ExFormItem label="分类">
      <ExSelect v-model="searchForm.category" placeholder="选择分类" style="width: 150px;">
        <option value="">全部</option>
        <option value="tech">技术</option>
        <option value="design">设计</option>
        <option value="product">产品</option>
      </ExSelect>
    </ExFormItem>
    <ExFormItem label="状态">
      <ExSelect v-model="searchForm.status" placeholder="选择状态" style="width: 150px;">
        <option value="">全部</option>
        <option value="active">活跃</option>
        <option value="inactive">未活跃</option>
      </ExSelect>
    </ExFormItem>
    <ExFormItem>
      <button @click="handleSearch" style="padding: 8px 24px; background: linear-gradient(135deg, #00f0ff, #00d4e6); border: none; color: #0a0a0a; font-weight: 600; cursor: pointer; margin-right: 8px;">
        搜索
      </button>
      <button @click="handleReset" style="padding: 8px 24px; background: transparent; border: 2px solid #00f0ff; color: #00f0ff; cursor: pointer;">
        重置
      </button>
    </ExFormItem>
  </ExForm>
</div>


```vue
<template>
  <ExForm :model="searchForm" layout="inline">
    <ExFormItem label="关键词">
      <input v-model="searchForm.keyword" placeholder="搜索..." />
    </ExFormItem>
    
    <ExFormItem label="分类">
      <ExSelect v-model="searchForm.category" placeholder="选择分类">
        <option value="">全部</option>
        <option value="tech">技术</option>
        <option value="design">设计</option>
      </ExSelect>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleSearch">搜索</button>
      <button @click="handleReset">重置</button>
    </ExFormItem>
  </ExForm>
</template>
```

## 设置表单

分组的设置表单。


<div class="demo-container">
  <div style="max-width: 600px;">
    <ExForm :model="settingsForm" label-width="120px">
      <h4 style="color: #00f0ff; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(0, 240, 255, 0.3);">通知设置</h4>
      <ExFormItem label="邮件通知">
        <ExSwitch v-model="settingsForm.notifications.email" />
      </ExFormItem>
      <ExFormItem label="短信通知">
        <ExSwitch v-model="settingsForm.notifications.sms" />
      </ExFormItem>
      <ExFormItem label="推送通知">
        <ExSwitch v-model="settingsForm.notifications.push" />
      </ExFormItem>
      <h4 style="color: #00f0ff; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(0, 240, 255, 0.3);">隐私设置</h4>
      <ExFormItem label="公开资料">
        <ExSwitch v-model="settingsForm.privacy.profileVisible" />
      </ExFormItem>
      <ExFormItem label="显示邮箱">
        <ExSwitch v-model="settingsForm.privacy.showEmail" />
      </ExFormItem>
      <ExFormItem label="显示手机">
        <ExSwitch v-model="settingsForm.privacy.showPhone" />
      </ExFormItem>
      <h4 style="color: #00f0ff; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid rgba(0, 240, 255, 0.3);">偏好设置</h4>
      <ExFormItem label="主题">
        <ExRadioGroup v-model="settingsForm.theme">
          <ExRadio value="light">浅色</ExRadio>
          <ExRadio value="dark">深色</ExRadio>
          <ExRadio value="auto">自动</ExRadio>
        </ExRadioGroup>
      </ExFormItem>
      <ExFormItem label="语言">
        <ExSelect v-model="settingsForm.language" style="width: 200px;">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </ExSelect>
      </ExFormItem>
      <ExFormItem>
        <button @click="handleSaveSettings" style="padding: 10px 32px; background: linear-gradient(135deg, #00f0ff, #00d4e6); border: none; color: #0a0a0a; font-weight: 600; cursor: pointer;">
          保存设置
        </button>
      </ExFormItem>
    </ExForm>
  </div>
</div>


```vue
<template>
  <ExForm :model="settingsForm" label-width="120px">
    <h4>通知设置</h4>
    <ExFormItem label="邮件通知">
      <ExSwitch v-model="settingsForm.notifications.email" />
    </ExFormItem>
    
    <h4>隐私设置</h4>
    <ExFormItem label="公开资料">
      <ExSwitch v-model="settingsForm.privacy.profileVisible" />
    </ExFormItem>
    
    <h4>偏好设置</h4>
    <ExFormItem label="主题">
      <ExRadioGroup v-model="settingsForm.theme">
        <ExRadio value="light">浅色</ExRadio>
        <ExRadio value="dark">深色</ExRadio>
      </ExRadioGroup>
    </ExFormItem>
    
    <ExFormItem>
      <button @click="handleSaveSettings">保存设置</button>
    </ExFormItem>
  </ExForm>
</template>
```

<style scoped>
.demo-container {
  padding: 32px;
  border: 2px solid #00f0ff;
  border-radius: 0;
  background: rgba(44, 0, 62, 0.3);
  margin: 24px 0;
  transition: all 0.9s ease-in-out;
}

.demo-container:hover {
  border-color: #ff007f;
  box-shadow: 
    0 0 20px rgba(255, 0, 127, 0.3),
    0 0 30px rgba(255, 0, 127, 0.2);
}

.demo-container h3 {
  font-size: 24px;
  font-weight: 600;
}

.demo-container h4 {
  font-size: 18px;
  font-weight: 600;
}

.demo-container input,
.demo-container select,
.demo-container textarea {
  font-family: var(--ex-font-secondary);
  outline: none;
  transition: all 0.3s;
}

.demo-container input:focus,
.demo-container select:focus,
.demo-container textarea:focus {
  border-color: #ff007f;
  box-shadow: 0 0 10px rgba(255, 0, 127, 0.3);
}

.demo-container button {
  font-family: var(--ex-font-secondary);
  transition: all 0.3s;
}

.demo-container button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
}

.demo-container a {
  transition: all 0.3s;
}

.demo-container a:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.8);
}
</style>
