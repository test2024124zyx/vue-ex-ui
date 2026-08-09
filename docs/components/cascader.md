# Cascader 级联选择器

用于从层级数据中选择一条路径。

<script setup>
import { ref } from 'vue'

const inlineValue = ref([])
const blockValue = ref(['north', 'beijing', 'chaoyang'])
const searchableValue = ref([])

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

```vue
<ex-cascader v-model="value" :options="options" placeholder="请选择服务区域" clearable />
```

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

```vue
<ex-cascader v-model="value" :options="options" style="width: 100%" />
```

## 搜索与触发方式

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

## API

### Props

| 参数             | 说明                    | 类型                       | 默认值   |
| ---------------- | ----------------------- | -------------------------- | -------- |
| `modelValue`     | 当前选中路径            | `(string \| number)[]`     | `[]`     |
| `id`             | 真实输入控件的标识      | `string`                   | -        |
| `options`        | 层级选项                | `CascaderOption[]`         | `[]`     |
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

| 事件名              | 参数                            |
| ------------------- | ------------------------------- |
| `update:modelValue` | `(value: (string \| number)[])` |
| `change`            | `(value, selectedOptions)`      |
| `visible-change`    | `(visible: boolean)`            |
| `clear`             | `()`                            |
| `focus`             | `(event: FocusEvent)`           |
| `blur`              | `(event: FocusEvent)`           |

### Exposes

| 方法              | 类型                           |
| ----------------- | ------------------------------ |
| `getCheckedNodes` | `() => CascaderOption[]`       |
| `getElement`      | `() => HTMLDivElement \| null` |
| `focus`           | `() => void`                   |
| `blur`            | `() => void`                   |
| `show`            | `() => void`                   |
| `hide`            | `() => void`                   |

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
