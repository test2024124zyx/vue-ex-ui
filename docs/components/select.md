# Select 选择器

当选项过多时，使用下拉菜单展示并选择内容。

## 基础用法

基础的选择器用法。

<div class="demo-container">
  <ExSelect
    v-model="value1"
    :options="basicOptions"
    placeholder="请选择"
  />
</div>

```vue
<template>
  <ExSelect v-model="value" :options="options" placeholder="请选择" />
</template>

<script setup>
import { ref } from 'vue';

const value = ref('');
const options = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' },
  { value: 'option4', label: '选项四' },
];
</script>
```

## 不同尺寸

提供三种尺寸：small、medium（默认）、large。

<div class="demo-container">
  <ExSelect
    v-model="value2"
    :options="basicOptions"
    size="small"
    placeholder="小型选择器"
  />
  <ExSelect
    v-model="value3"
    :options="basicOptions"
    size="medium"
    placeholder="中型选择器"
  />
  <ExSelect
    v-model="value4"
    :options="basicOptions"
    size="large"
    placeholder="大型选择器"
  />
</div>

```vue
<template>
  <ExSelect size="small" placeholder="小型" />
  <ExSelect size="medium" placeholder="中型" />
  <ExSelect size="large" placeholder="大型" />
</template>
```

## 可清空

包含清空按钮，可将选择器清空为初始状态。

<div class="demo-container">
  <ExSelect
    v-model="value5"
    :options="basicOptions"
    clearable
    placeholder="可清空的选择器"
  />
</div>

```vue
<template>
  <ExSelect v-model="value" :options="options" clearable placeholder="可清空的选择器" />
</template>
```

## 可搜索

可以利用搜索功能快速查找选项。

<div class="demo-container">
  <ExSelect
    v-model="value6"
    :options="searchOptions"
    searchable
    placeholder="可搜索的选择器"
  />
</div>

```vue
<template>
  <ExSelect v-model="value" :options="searchOptions" searchable placeholder="可搜索的选择器" />
</template>
```

## 分组

使用分组把选项进行分类。

<div class="demo-container">
  <ExSelect
    v-model="value7"
    :options="groupOptions"
    placeholder="分组选择器"
  />
</div>

```vue
<template>
  <ExSelect v-model="value" :options="groupOptions" placeholder="分组选择器" />
</template>
```

## 禁用状态

禁用整个选择器或单个选项。

<div class="demo-container">
  <ExSelect
    v-model="value8"
    :options="basicOptions"
    disabled
    placeholder="禁用的选择器"
  />
  <ExSelect
    v-model="value9"
    :options="disabledOptions"
    placeholder="部分选项禁用"
  />
</div>

```vue
<template>
  <!-- 禁用整个选择器 -->
  <ExSelect disabled placeholder="禁用的选择器" />

  <!-- 禁用部分选项 -->
  <ExSelect v-model="value" :options="disabledOptions" placeholder="部分选项禁用" />
</template>
```

## 多选

设置 `multiple` 开启多选，此时绑定值为数组。选中项以可移除标签的形式展示，
下拉中已选项右侧显示对勾，选择后下拉保持打开。

```vue
<script setup lang="ts">
import { ref } from 'vue';
const value = ref<Array<string | number>>(['option1']);
const options = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' },
];
</script>

<template>
  <ExSelect v-model="value" :options="options" multiple clearable />
</template>
```

- `multiple-limit` 限制最多可选数量（`0` 不限制）。
- `collapse-tags` 仅展示第一个标签，其余折叠为 `+N`。
- 多选支持搜索：同时设置 `searchable` 即可。

## 远程搜索

设置 `remote` 并配合 `searchable`，输入时会（防抖后）调用 `remote-method`，由你在
回调里请求接口并更新 `options`；组件不再做本地过滤。用 `loading` 控制加载态。

```vue
<script setup lang="ts">
import { ref } from 'vue';
const value = ref<string | number | null>(null);
const options = ref<{ value: number; label: string }[]>([]);
const loading = ref(false);

const remoteSearch = async (query: string) => {
  if (!query) {
    options.value = [];
    return;
  }
  loading.value = true;
  try {
    // 用你的接口替换：const res = await api.search(query)
    await new Promise(r => setTimeout(r, 300));
    options.value = Array.from({ length: 5 }, (_, i) => ({
      value: i,
      label: `${query} - 结果 ${i + 1}`,
    }));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <ExSelect
    v-model="value"
    :options="options"
    :loading="loading"
    :remote-method="remoteSearch"
    remote
    searchable
    clearable
    placeholder="输入以远程搜索"
  />
</template>
```

- `remote-debounce` 调整防抖间隔（毫秒，默认 `300`）。
- 远程模式下本地过滤被关闭，`options` 即为下拉展示内容。

## API

### Props

| 参数                 | 说明                         | 类型                    | 可选值                 | 默认值     |
| -------------------- | ---------------------------- | ----------------------- | ---------------------- | ---------- |
| modelValue / v-model | 绑定值（多选时为数组）       | string / number / array | —                      | —          |
| options              | 选项数据                     | SelectOptions           | —                      | []         |
| placeholder          | 占位文本                     | string                  | —                      | '请选择'   |
| size                 | 尺寸                         | SelectSize              | small / medium / large | medium     |
| disabled             | 是否禁用                     | boolean                 | —                      | false      |
| clearable            | 是否可清空                   | boolean                 | —                      | false      |
| searchable           | 是否可搜索                   | boolean                 | —                      | false      |
| remote               | 是否远程搜索（关闭本地过滤） | boolean                 | —                      | false      |
| remote-method        | 远程搜索回调                 | (query: string) => void | —                      | —          |
| loading              | 加载中（远程时由父级控制）   | boolean                 | —                      | false      |
| remote-debounce      | 远程搜索防抖（毫秒）         | number                  | —                      | 300        |
| multiple             | 是否多选                     | boolean                 | —                      | false      |
| multiple-limit       | 多选时最多可选数量（0 不限） | number                  | —                      | 0          |
| collapse-tags        | 多选时折叠多余标签为 +N      | boolean                 | —                      | false      |
| searchPlaceholder    | 搜索框占位文本               | string                  | —                      | '搜索...'  |
| noDataText           | 无数据时的文本               | string                  | —                      | '暂无数据' |
| popperClass          | 下拉框的类名                 | string                  | —                      | —          |

### Events

| 事件名            | 说明                  | 回调参数                           |
| ----------------- | --------------------- | ---------------------------------- |
| update:modelValue | 值变化时触发          | (value: string \| number \| array) |
| change            | 选中值发生变化时触发  | (value, option \| options)         |
| remove-tag        | 多选时移除标签触发    | (value: string \| number)          |
| visible-change    | 下拉框出现/隐藏时触发 | (visible: boolean)                 |
| clear             | 点击清空按钮时触发    | —                                  |
| blur              | 失去焦点时触发        | (event: FocusEvent)                |
| focus             | 获得焦点时触发        | (event: FocusEvent)                |

### Exposes

| 方法名 | 说明             | 参数 |
| ------ | ---------------- | ---- |
| focus  | 使选择器获得焦点 | —    |
| blur   | 使选择器失去焦点 | —    |

### Types

```typescript
type SelectSize = 'small' | 'medium' | 'large';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  keywords?: string[];
}

interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

type SelectOptions = (SelectOption | SelectOptionGroup)[];
```

<script setup>
import { ref } from 'vue';

// 基础选项
const basicOptions = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' },
  { value: 'option4', label: '选项四' },
  { value: 'option5', label: '选项五' },
];

// 搜索选项
const searchOptions = [
  { value: 'beijing', label: '北京', keywords: ['BJ', 'Beijing', 'Capital'] },
  { value: 'shanghai', label: '上海', keywords: ['SH', 'Shanghai'] },
  { value: 'guangzhou', label: '广州', keywords: ['GZ', 'Guangzhou'] },
  { value: 'shenzhen', label: '深圳', keywords: ['SZ', 'Shenzhen'] },
  { value: 'chengdu', label: '成都', keywords: ['CD', 'Chengdu'] },
  { value: 'hangzhou', label: '杭州', keywords: ['HZ', 'Hangzhou'] },
];

// 分组选项
const groupOptions = [
  {
    label: '热门城市',
    options: [
      { value: 'beijing', label: '北京' },
      { value: 'shanghai', label: '上海' },
      { value: 'guangzhou', label: '广州' },
      { value: 'shenzhen', label: '深圳' },
    ],
  },
  {
    label: '其他城市',
    options: [
      { value: 'chengdu', label: '成都' },
      { value: 'hangzhou', label: '杭州' },
      { value: 'wuhan', label: '武汉' },
      { value: 'xian', label: '西安' },
    ],
  },
];

// 禁用选项
const disabledOptions = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二（禁用）', disabled: true },
  { value: 'option3', label: '选项三' },
  { value: 'option4', label: '选项四（禁用）', disabled: true },
  { value: 'option5', label: '选项五' },
];

// 绑定值
const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const value5 = ref('');
const value6 = ref('');
const value7 = ref('');
const value8 = ref('option1');
const value9 = ref('');
</script>

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
