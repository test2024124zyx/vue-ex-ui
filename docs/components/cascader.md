# Cascader 级联选择器

当一个数据集合有清晰的层级结构时，可通过级联选择器逐级查看并选择。

<script setup>
import { ref } from 'vue'

const value1 = ref([])
const value2 = ref(['zhejiang', 'hangzhou', 'xihu'])

const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'binjiang', label: '滨江' },
          { value: 'yuhang', label: '余杭' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'haishu', label: '海曙' },
          { value: 'jiangbei', label: '江北' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          { value: 'xuanwu', label: '玄武' },
          { value: 'qinhuai', label: '秦淮' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州',
        children: [
          { value: 'gusu', label: '姑苏' },
          { value: 'kunshan', label: '昆山' },
        ],
      },
    ],
  },
]

const handleChange = (value, selectedOptions) => {
  console.log('Selected:', value, selectedOptions)
}
</script>

## 基础用法

最基础的级联选择器用法。

<div class="demo-container">
  <ExCascader
    v-model="value1"
    :options="options"
    placeholder="请选择地区"
    @change="handleChange"
  />
  <p style="margin-top: 12px; color: var(--ex-color-text-secondary);">
    选中值: {{ value1.join(' / ') || '未选择' }}
  </p>
</div>

```vue
<script setup>
import { ref } from 'vue';

const value = ref([]);

const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [{ value: 'xihu', label: '西湖' }],
      },
    ],
  },
];
</script>

<template>
  <ExCascader v-model="value" :options="options" placeholder="请选择地区" />
</template>
```

## 默认值

通过 `v-model` 设置默认选中值。

<div class="demo-container">
  <ExCascader
    v-model="value2"
    :options="options"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const value = ref(['zhejiang', 'hangzhou', 'xihu']);
</script>

<template>
  <ExCascader v-model="value" :options="options" />
</template>
```

## API

### Cascader Props

| 属性                    | 说明       | 类型                             | 默认值     |
| ----------------------- | ---------- | -------------------------------- | ---------- |
| `model-value / v-model` | 选中值     | `(string \| number)[]`           | `[]`       |
| `options`               | 选项数据   | `CascaderOption[]`               | `[]`       |
| `placeholder`           | 占位文本   | `string`                         | `'请选择'` |
| `disabled`              | 是否禁用   | `boolean`                        | `false`    |
| `clearable`             | 是否可清空 | `boolean`                        | `true`     |
| `size`                  | 尺寸       | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `separator`             | 分隔符     | `string`                         | `' / '`    |

### Cascader Events

| 事件名               | 说明                    | 类型                                    |
| -------------------- | ----------------------- | --------------------------------------- |
| `update:model-value` | 值变化时触发            | `(value: (string \| number)[]) => void` |
| `change`             | 选择变化时触发          | `(value, selectedOptions) => void`      |
| `visible-change`     | 下拉面板显示/隐藏时触发 | `(visible: boolean) => void`            |
| `clear`              | 清空时触发              | `() => void`                            |

### Cascader Methods

| 方法名            | 说明            | 类型                           |
| ----------------- | --------------- | ------------------------------ |
| `getCheckedNodes` | 获取选中的选项  | `() => CascaderOption[]`       |
| `getElement`      | 获取组件DOM元素 | `() => HTMLDivElement \| null` |

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
