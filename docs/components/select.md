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
const managedRemoteValue = ref(null)
const failNextRemote = ref(false)
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

const loadRemoteOptions = async (query, { signal }) => {
  const parameters = new URLSearchParams({ query })
  if (failNextRemote.value) {
    parameters.set('outcome', 'error')
    failNextRemote.value = false
  }
  const response = await fetch(`/__exui_demo__/select-options?${parameters}`, { signal })
  if (!response.ok) throw new Error(`查询失败：HTTP ${response.status}`)
  return response.json()
}

const virtualOptions = Array.from({ length: 1000 }, (_, index) => ({
  value: index,
  label: `客户档案 ${String(index + 1).padStart(4, '0')}`
}))
</script>

## 基础选择

清空按钮只在存在有效选中项时显示。

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

::: details 查看示例代码

```vue
<ex-select v-model="department" :options="departmentOptions" placeholder="选择所属部门" />
<ex-select v-model="selectedStatus" :options="statusOptions" placeholder="选择状态" clearable />
```

:::

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

::: details 查看示例代码

```vue
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
```

:::

## 多选

多选标签在触发器内横向滚动，滚动条不会占用可视布局，也不会因标签数量或长文本溢出覆盖其他控件。关闭标签是可键盘聚焦的按钮；`collapse-tags` 适合需要保持触发器紧凑的场景。

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

::: details 查看示例代码

```vue
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
```

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

::: details 查看示例代码

```vue
<ex-select
  v-model="longValue"
  :options="longOptions"
  searchable
  clearable
  placeholder="选择服务区域"
/>
```

:::

## 远程搜索

传统 `remoteMethod(query)` 模式由父组件控制 `options` 和 `loading`，适用于已有请求状态管理的页面。组件缓存已经见过的选项，当前值不在最新查询结果中时仍能显示正确标签。以下示例展示这一兼容接口，筛选数据在页面内维护。

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

::: details 查看示例代码

```vue
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
```

:::

## 托管异步查询

`remoteLoader(query, { signal })` 返回本次查询的完整选项数组。组件负责防抖、加载、失败重试，以及新查询、关闭、禁用、只读或卸载时的取消；即使请求客户端没有遵守 `signal`，过期结果也不会覆盖当前列表。输入法合成期间暂停查询，提交后查询完整文字。

本例通过文档服务发出真实 HTTP 请求并在服务端筛选。点击“让下一次查询失败”后再打开或输入，可以检查错误状态和重试恢复。该服务随 `npm run docs:dev` 和 `npm run docs:preview` 启动；部署为纯静态站点时需要提供对应服务。

::: raw

<div class="vp-raw demo-container select-column">
  <ex-select
    v-model="managedRemoteValue"
    remote
    searchable
    clearable
    :remote-loader="loadRemoteOptions"
    placeholder="远程搜索城市或中心"
  />
  <ex-button :disabled="failNextRemote" @click="failNextRemote = true">
    {{ failNextRemote ? '下一次查询将失败' : '让下一次查询失败' }}
  </ex-button>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const managedRemoteValue = ref(null);
const failNextRemote = ref(false);
const loadRemoteOptions = async (query, { signal }) => {
  const parameters = new URLSearchParams({ query });
  if (failNextRemote.value) {
    parameters.set('outcome', 'error');
    failNextRemote.value = false;
  }
  const response = await fetch(`/__exui_demo__/select-options?${parameters}`, { signal });
  if (!response.ok) throw new Error(`查询失败：HTTP ${response.status}`);
  return response.json();
};
</script>

<template>
  <ex-select
    v-model="managedRemoteValue"
    remote
    searchable
    clearable
    :remote-loader="loadRemoteOptions"
    placeholder="远程搜索城市或中心"
  />
  <ex-button
    :disabled="failNextRemote"
    @click="failNextRemote = true"
  >
    {{ failNextRemote ? '下一次查询将失败' : '让下一次查询失败' }}
  </ex-button>
</template>
```

:::

托管模式每次打开都会查询当前搜索词，空字符串也是合法查询。输入新词时立即移除旧结果，等待当前结果返回后再允许选择；已选标签会保留。多选完成一次选择后清空查询词并重新加载，单选完成或清空则关闭并取消请求。`options` 可提供初始已选项的标签；首次请求以后列表由 `remoteLoader` 的结果管理，`modelValue` 始终受控。

同时传入 `remoteLoader` 和 `remoteMethod` 时只调用前者。组件不会展示原始错误内容；业务可以监听 `remote-error`，或通过 `error` 插槽获得 `{ error, retry }` 定制恢复入口。按 `Enter` 可重试，`Tab` 可进入默认重试按钮，`Shift+Tab` 返回输入框。

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

::: details 查看示例代码

```vue
<ex-select
  v-model="virtualValue"
  :options="virtualOptions"
  virtual
  searchable
  clearable
  placeholder="在 1000 条档案中选择"
/>
```

:::

## 键盘与无障碍

非搜索模式的触发器支持 `Tab`、`Enter`、`Space`、方向键、`Home`、`End` 与 `Escape`。搜索模式将 `role="combobox"` 放在实际输入框上，单选已有值时输入框不会卸载；下拉列表使用 `listbox/option` 语义并暴露禁用状态。

`id` 会绑定到实际交互节点；可通过 `aria-label`、`aria-labelledby` 和 `aria-describedby` 传入可访问名称与描述。放在 `ExFormItem` 中时会自动关联标签、帮助/错误消息，并继承表单的尺寸、禁用和只读状态。

## API

### Props

| 参数             | 说明                                                           | 类型                                               | 默认值       |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------- | ------------ |
| `modelValue`     | 单选值或多选值数组                                             | `string \| number \| null \| (string \| number)[]` | `null`       |
| `options`        | 选项或选项分组                                                 | `SelectOptions`                                    | `[]`         |
| `placeholder`    | 占位文本                                                       | `string`                                           | `''`         |
| `id`             | 交互节点的 HTML 标识                                           | `string`                                           | 自动生成     |
| `size`           | 尺寸                                                           | `small \| medium \| large`                         | 继承全局尺寸 |
| `disabled`       | 是否禁用                                                       | `boolean`                                          | `false`      |
| `readonly`       | 是否只读；可聚焦但不能打开或修改                               | `boolean`                                          | `false`      |
| `clearable`      | 是否可清空                                                     | `boolean`                                          | `false`      |
| `searchable`     | 是否可搜索                                                     | `boolean`                                          | `false`      |
| `remote`         | 是否关闭本地过滤并启用远程搜索                                 | `boolean`                                          | `false`      |
| `remoteMethod`   | 远程查询回调                                                   | `(query: string) => void`                          | —            |
| `remoteLoader`   | 托管异步查询；优先于 `remoteMethod`                            | `SelectRemoteLoader`                               | —            |
| `loading`        | 外部加载状态，与托管请求状态合并                               | `boolean`                                          | `false`      |
| `remoteDebounce` | 远程查询防抖时间                                               | `number`                                           | `300`        |
| `multiple`       | 是否多选                                                       | `boolean`                                          | `false`      |
| `multipleLimit`  | 多选数量上限，`0` 表示不限                                     | `number`                                           | `0`          |
| `collapseTags`   | 是否折叠多选标签                                               | `boolean`                                          | `false`      |
| `virtual`        | 是否启用普通或分组选项虚拟滚动                                 | `boolean`                                          | `false`      |
| `optionHeight`   | 虚拟选项固定高度；必须与自定义行样式一致，且不小于触摸目标高度 | `number`                                           | `44`         |

### Events

| 事件名              | 参数                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `(value: SelectValue)`                                                                                                     |
| `change`            | `(value: SelectValue, option: SelectOption \| SelectOption[] \| null)`；多选时 `option` 为当前已选选项数组，清空时为空数组 |
| `remove-tag`        | `(value: string \| number)`                                                                                                |
| `clear`             | `()`                                                                                                                       |
| `focus`             | `(event: FocusEvent)`                                                                                                      |
| `blur`              | `(event: FocusEvent)`                                                                                                      |
| `visible-change`    | `(visible: boolean)`                                                                                                       |
| `remote-error`      | `(error: unknown, query: string)`；取消和过期请求不触发                                                                    |

### Slots

| 名称      | 参数                          | 说明                                        |
| --------- | ----------------------------- | ------------------------------------------- |
| `option`  | `{ option, index, selected }` | 选项内容，普通和虚拟列表共享                |
| `group`   | `{ group }`                   | 分组标题                                    |
| `label`   | `{ option }`                  | 非搜索单选的选中内容                        |
| `tag`     | `{ option }`                  | 多选标签内容                                |
| `loading` | —                             | 加载内容                                    |
| `empty`   | —                             | 空列表内容                                  |
| `error`   | `{ error, retry }`            | 托管查询失败内容，重试入口位于 `listbox` 外 |

### Remote Types

```ts
interface SelectRemoteContext {
  signal: AbortSignal;
}

type SelectRemoteLoader = (query: string, context: SelectRemoteContext) => Promise<SelectOptions>;
```

### Exposes

| 方法           | 类型                                           |
| -------------- | ---------------------------------------------- |
| `focus`        | `() => void`                                   |
| `blur`         | `() => void`                                   |
| `showDropdown` | `() => void`                                   |
| `hideDropdown` | `() => void`                                   |
| `retryRemote`  | `() => void`，下拉打开且存在失败查询时立即重试 |

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
