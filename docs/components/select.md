# Select 下拉选择器

用于从选项集合中选择一个或多个值。

<script setup>
import { ref } from 'vue'

const department = ref(null)
const selectedStatus = ref('active')
const members = ref(['lin', 'zhou'])
const searchable = ref(null)
const longValue = ref(null)
const remoteValue = ref(null)
const virtualValue = ref(null)

const departmentOptions = [
  { value: 'product', label: '产品中心', keywords: ['chanpin'] },
  { value: 'design', label: '设计中心', keywords: ['sheji'] },
  { value: 'engineering', label: '研发中心', keywords: ['yanfa'] },
  { value: 'sales', label: '销售中心', keywords: ['xiaoshou'] },
  { value: 'finance', label: '财务中心', disabled: true }
]

const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'pending', label: '待审核' },
  { value: 'closed', label: '已结束' }
]

const memberOptions = [
  { value: 'lin', label: '林知远' },
  { value: 'zhou', label: '周予安' },
  { value: 'chen', label: '陈嘉树' },
  { value: 'xu', label: '许清和' },
  { value: 'song', label: '宋时雨' }
]

const longOptions = Array.from({ length: 36 }, (_, index) => ({
  value: index + 1,
  label: `第 ${String(index + 1).padStart(2, '0')} 个服务区域`
}))

const remoteSource = [
  { value: 'shanghai', label: '上海客户成功中心' },
  { value: 'shenzhen', label: '深圳交付中心' },
  { value: 'hangzhou', label: '杭州研发中心' },
  { value: 'chengdu', label: '成都运营中心' }
]
const remoteOptions = ref(remoteSource)
const handleRemoteSearch = query => {
  const keyword = query.trim().toLowerCase()
  remoteOptions.value = keyword
    ? remoteSource.filter(option => option.label.toLowerCase().includes(keyword))
    : remoteSource
}

const virtualOptions = Array.from({ length: 1000 }, (_, index) => ({
  value: index,
  label: `客户档案 ${String(index + 1).padStart(4, '0')}`
}))
</script>

## 基础选择

::: raw
<div class="vp-raw demo-container select-row">
  <ex-select
    v-model="department"
    :options="departmentOptions"
    placeholder="选择所属部门"
  />
  <ex-select
    v-model="selectedStatus"
    :options="statusOptions"
    placeholder="选择状态"
    clearable
  />
</div>
:::

清空按钮只在存在有效选中项时显示。

```vue
<ex-select v-model="department" :options="departmentOptions" placeholder="选择所属部门" />
<ex-select v-model="status" :options="statusOptions" clearable />
```

## 搜索与尺寸

::: raw
<div class="vp-raw demo-container select-row select-row--center">
  <ex-select
    v-model="searchable"
    :options="departmentOptions"
    searchable
    clearable
    placeholder="输入部门名称"
  />
  <ex-select :options="statusOptions" size="small" placeholder="小型" />
  <ex-select :options="statusOptions" size="large" placeholder="大型" />
  <ex-select :options="statusOptions" disabled placeholder="不可选择" />
</div>
:::

## 多选

::: raw
<div class="vp-raw demo-container select-column">
  <ex-select
    v-model="members"
    :options="memberOptions"
    multiple
    clearable
    placeholder="选择项目成员"
  />
  <ex-select
    v-model="members"
    :options="memberOptions"
    multiple
    collapse-tags
    :multiple-limit="4"
    placeholder="最多选择四人"
  />
</div>
:::

## 长列表滚动

横向内容被限制在下拉面板内；纵向滚动条只在选项超过可视区域时出现。

::: raw
<div class="vp-raw demo-container">
  <ex-select
    v-model="longValue"
    :options="longOptions"
    searchable
    clearable
    placeholder="选择服务区域"
  />
</div>
:::

## 远程搜索

::: raw
<div class="vp-raw demo-container">
  <ex-select
    v-model="remoteValue"
    :options="remoteOptions"
    remote
    searchable
    clearable
    :remote-method="handleRemoteSearch"
    :remote-debounce="150"
    placeholder="搜索交付中心"
  />
</div>
:::

```vue
<ex-select
  v-model="value"
  :options="remoteOptions"
  remote
  searchable
  :remote-method="searchOptions"
/>
```

## 虚拟滚动

::: raw
<div class="vp-raw demo-container">
  <ex-select
    v-model="virtualValue"
    :options="virtualOptions"
    virtual
    searchable
    clearable
    placeholder="在 1000 条档案中选择"
  />
</div>
:::

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` | 单选值或多选值数组 | `string \| number \| null \| (string \| number)[]` | `null` |
| `options` | 选项或选项分组 | `SelectOptions` | `[]` |
| `placeholder` | 占位文本 | `string` | `''` |
| `size` | 尺寸 | `small \| medium \| large` | 继承全局尺寸 |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `clearable` | 是否可清空 | `boolean` | `false` |
| `searchable` | 是否可搜索 | `boolean` | `false` |
| `remote` | 是否关闭本地过滤并启用远程搜索 | `boolean` | `false` |
| `remoteMethod` | 远程查询回调 | `(query: string) => void` | — |
| `loading` | 是否显示加载状态 | `boolean` | `false` |
| `remoteDebounce` | 远程查询防抖时间 | `number` | `300` |
| `multiple` | 是否多选 | `boolean` | `false` |
| `multipleLimit` | 多选数量上限，`0` 表示不限 | `number` | `0` |
| `collapseTags` | 是否折叠多选标签 | `boolean` | `false` |
| `virtual` | 是否启用扁平选项虚拟滚动 | `boolean` | `false` |
| `optionHeight` | 虚拟选项固定高度 | `number` | `34` |

### Events

| 事件名 | 参数 |
| --- | --- |
| `update:modelValue` | `(value: SelectValue)` |
| `change` | `(value: SelectValue, option: SelectOption \| SelectOption[] \| null)` |
| `remove-tag` | `(value: string \| number)` |
| `clear` | `()` |
| `focus` | `(event: FocusEvent)` |
| `blur` | `(event: FocusEvent)` |
| `visible-change` | `(visible: boolean)` |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `focus` | `() => void` |
| `blur` | `() => void` |
| `showDropdown` | `() => void` |
| `hideDropdown` | `() => void` |

<style scoped>
.select-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.select-row--center {
  align-items: center;
}

.select-column {
  display: grid;
  gap: 16px;
  max-width: 520px;
}
</style>
