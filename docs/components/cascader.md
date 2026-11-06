# Cascader 级联选择器

用于从层级数据中选择一条或多条完整路径，支持异步加载子项。

<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'

const inlineValue = ref([])
const blockValue = ref(['north', 'beijing', 'chaoyang'])
const searchableValue = ref([])
const multiplePaths = ref([])
const asyncPaths = ref([])
const lazyRoots = [
  { value: 'north', label: '华北', isLeaf: false },
  { value: 'east', label: '华东', isLeaf: false },
]
const loadRegionNodes = async (option, { signal }) => {
  const response = await fetch(withBase('/demo-assets/hierarchical-options.json'), { signal })
  if (!response.ok) throw new Error(`加载失败：HTTP ${response.status}`)
  const branches = await response.json()
  return branches[option.value] ?? []
}

const regionOptions = [
  {
    value: 'north',
    label: '华北',
    children: [
      {
        value: 'beijing',
        label: '北京市',
        children: [
          { value: 'chaoyang', label: '朝阳区' },
          { value: 'haidian', label: '海淀区' }
        ]
      },
      {
        value: 'tianjin',
        label: '天津市',
        children: [
          { value: 'heping', label: '和平区' },
          { value: 'nankai', label: '南开区' }
        ]
      }
    ]
  },
  {
    value: 'east',
    label: '华东',
    children: [
      {
        value: 'shanghai',
        label: '上海市',
        children: [
          { value: 'pudong', label: '浦东新区' },
          { value: 'xuhui', label: '徐汇区' }
        ]
      },
      {
        value: 'zhejiang',
        label: '浙江省',
        children: [
          { value: 'hangzhou', label: '杭州市' },
          { value: 'ningbo', label: '宁波市', disabled: true }
        ]
      }
    ]
  }
]
</script>

## 默认行内宽度

::: raw

<div class="vp-raw demo-container">
  <ex-cascader
    v-model="inlineValue"
    :options="regionOptions"
    placeholder="请选择服务区域"
    clearable
  />
</div>
:::

::: details 查看示例代码

```vue
<ex-cascader
  v-model="inlineValue"
  :options="regionOptions"
  placeholder="请选择服务区域"
  clearable
/>
```

:::

## 块级宽度

需要占满表单容器时显式设置宽度。

::: raw

<div class="vp-raw demo-container cascader-block-demo">
  <ex-cascader
    v-model="blockValue"
    :options="regionOptions"
    style="width: 100%"
    clearable
  />
</div>
:::

::: details 查看示例代码

```vue
<ex-cascader v-model="blockValue" :options="regionOptions" style="width: 100%" clearable />
```

:::

## 搜索、点击展开与触发方式

组件默认通过点击展开子级；只有显式设置 `trigger="hover"` 时才使用悬停展开。移动端面板会自动切换为单列下钻，并可通过当前路径返回上级。

::: raw

<div class="vp-raw demo-container cascader-row">
  <ex-cascader
    v-model="searchableValue"
    :options="regionOptions"
    filterable
    placeholder="搜索区域"
  />
  <ex-cascader
    :options="regionOptions"
    trigger="hover"
    placeholder="悬停展开"
  />
  <ex-cascader :options="regionOptions" disabled placeholder="不可选择" />
</div>
:::

::: details 查看示例代码

```vue
<ex-cascader v-model="searchableValue" :options="regionOptions" filterable placeholder="搜索区域" />
<ex-cascader :options="regionOptions" trigger="hover" placeholder="悬停展开" />
<ex-cascader :options="regionOptions" disabled placeholder="不可选择" />
```

:::

## 多选完整路径

多选使用独立的 `v-model:selectedPaths`，单选 `modelValue` 和 `change` 事件类型保持不变。
选择叶子后面板保持打开，再次点击同一路径可以取消；标签可逐项移除，清空时保留禁用路径。

::: raw

<div class="vp-raw demo-container">
  <ExCascader v-model:selectedPaths="multiplePaths" :options="regionOptions" multiple filterable collapse-tags />
  <p role="status">已选路径：{{ JSON.stringify(multiplePaths) }}</p>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="vp-raw demo-container">
    <ExCascader
      v-model:selectedPaths="multiplePaths"
      :options="regionOptions"
      multiple
      filterable
      collapse-tags
    />
    <p role="status">已选路径：{{ JSON.stringify(multiplePaths) }}</p>
  </div>
</template>
```

:::

每条路径独立选择，默认仅选择叶子；`change-on-select` 开启后允许直接选择任意级。
不同分支允许出现相同的 `value`，同级 `value` 须唯一。切换单多选模式时，两份绑定值各自保留。
受控模式只有父级回写后才更新标签；省略 `selectedPaths` 时由组件内部管理多选值。

## 异步子项与多选组合

::: raw

<div class="vp-raw demo-container">
  <ExCascader v-model:selectedPaths="asyncPaths" :options="lazyRoots" :load-data="loadRegionNodes" multiple filterable />
  <p role="status">异步已选路径：{{ JSON.stringify(asyncPaths) }}</p>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';
import { withBase } from 'vitepress';

const asyncPaths = ref([]);
const lazyRoots = [
  { value: 'north', label: '华北', isLeaf: false },
  { value: 'east', label: '华东', isLeaf: false },
];
const loadRegionNodes = async (option, { signal }) => {
  const response = await fetch(withBase('/demo-assets/hierarchical-options.json'), { signal });
  if (!response.ok) throw new Error(`加载失败：HTTP ${response.status}`);
  const branches = await response.json();
  return branches[option.value] ?? [];
};
</script>

<template>
  <div class="vp-raw demo-container">
    <ExCascader
      v-model:selectedPaths="asyncPaths"
      :options="lazyRoots"
      :load-data="loadRegionNodes"
      multiple
      filterable
    />
    <p role="status">异步已选路径：{{ JSON.stringify(asyncPaths) }}</p>
  </div>
</template>
```

:::

此示例真实请求同源地区数据。`isLeaf: false` 表示尚未加载的分支；展开调用
`loadData(option, { signal, path })`，返回 `Promise<CascaderOption[]>`。
加载失败显示重试入口，空数组表示已确认的叶子。缓存、取消和重载均使用完整路径区分节点。
离开分支、关闭面板、禁用或卸载会中止自动请求；晚到结果不会覆盖新路径，输入数组不会被修改。
搜索仅包含当前已加载的完整叶子路径。业务接口可依据 `context.path` 请求对应分支。

## API

### Props

| 参数             | 说明                    | 类型                       | 默认值   |
| ---------------- | ----------------------- | -------------------------- | -------- |
| `modelValue`     | 当前选中路径            | `(string \| number)[]`     | `[]`     |
| `id`             | 真实输入控件的标识      | `string`                   | -        |
| `options`        | 层级选项                | `CascaderOption[]`         | `[]`     |
| `loadData`       | 异步子项加载器          | `CascaderLoadData`         | —        |
| `multiple`       | 开启多选                | `boolean`                  | `false`  |
| `selectedPaths`  | 多选完整路径集合        | `CascaderPath[]`           | 内部管理 |
| `collapseTags`   | 折叠多选标签            | `boolean`                  | `false`  |
| `placeholder`    | 占位文本                | `string`                   | `''`     |
| `disabled`       | 是否禁用                | `boolean`                  | `false`  |
| `readonly`       | 是否只读                | `boolean`                  | `false`  |
| `clearable`      | 是否可清空              | `boolean`                  | `true`   |
| `filterable`     | 是否可搜索              | `boolean`                  | `false`  |
| `trigger`        | 子级展开方式            | `click \| hover`           | `click`  |
| `size`           | 尺寸                    | `small \| medium \| large` | `medium` |
| `separator`      | 路径分隔符              | `string`                   | `' / '`  |
| `showAllLevels`  | 是否显示完整路径        | `boolean`                  | `true`   |
| `changeOnSelect` | 是否允许选择非叶节点    | `boolean`                  | `false`  |
| `teleported`     | 是否将面板传送到 `body` | `boolean`                  | `true`   |

### Events

| 事件名                 | 参数                                                   |
| ---------------------- | ------------------------------------------------------ |
| `update:modelValue`    | `(value: (string \| number)[])`                        |
| `change`               | `(value, selectedOptions)`                             |
| `visible-change`       | `(visible: boolean)`                                   |
| `clear`                | `()`                                                   |
| `focus`                | `(event: FocusEvent)`                                  |
| `blur`                 | `(event: FocusEvent)`                                  |
| `update:selectedPaths` | `(paths: CascaderPath[])`                              |
| `selection-change`     | `(paths: CascaderPath[], options: CascaderOption[][])` |
| `load`                 | `(option, children, path)`                             |
| `load-error`           | `(error, option, path)`                                |

### Exposes

| 方法               | 类型                                        |
| ------------------ | ------------------------------------------- |
| `getCheckedNodes`  | `() => CascaderOption[]`                    |
| `getElement`       | `() => HTMLDivElement \| null`              |
| `focus`            | `() => void`                                |
| `blur`             | `() => void`                                |
| `show`             | `() => void`                                |
| `hide`             | `() => void`                                |
| `getCheckedPaths`  | `() => CascaderPath[]`，返回独立多选快照    |
| `reloadNode`       | `(path: CascaderPath) => Promise<boolean>`  |
| `cancelNodeLoad`   | `(path: CascaderPath) => boolean`           |
| `getNodeLoadState` | `(path: CascaderPath) => CascaderLoadState` |

`getCheckedNodes()` 在单选模式返回完整选项路径，在多选模式返回各条路径的末级节点。
`CascaderLoadState.status` 为 `idle`、`loading`、`loaded` 或 `error`；错误态同时包含 `error`。

<style scoped>
.cascader-block-demo {
  max-width: 620px;
}

.cascader-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
