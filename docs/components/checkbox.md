# Checkbox 复选框

用于在多个选项中进行选择，支持单个复选框和复选框组。

<script setup>
import { ref, computed } from 'vue'

const checked = ref(false)
const checked2 = ref(true)
const checkList = ref(['Apple', 'Orange'])
const options = ['Apple', 'Pear', 'Orange']
const checkAll = ref(false)
const checkedCities = ref(['Shanghai', 'Beijing'])
const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']

const isIndeterminate = computed(() => {
  const len = checkedCities.value.length
  return len > 0 && len < cities.length
})

const handleCheckAllChange = (val) => {
  checkedCities.value = val ? cities : []
  checkAll.value = val
}

const handleCityChange = () => {
  const len = checkedCities.value.length
  checkAll.value = len === cities.length
}

// 尺寸示例
const sizeChecked = ref(true)

// 状态示例
const statusChecked = ref(true)

// CheckboxGroup 示例
const groupValue = ref(['apple', 'banana'])
const groupOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄' }
]

// 垂直布局示例
const verticalValue = ref(['option1'])

// 最小最大限制示例
const limitValue = ref(['1', '2'])

// 表单验证示例
const agreed = ref(false)
</script>

## 基础用法

简单的复选框，使用 `v-model` 绑定布尔值。

::: raw

<div class="demo-block">
  <ExCheckbox v-model="checked">同意用户协议</ExCheckbox>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExCheckbox v-model="checked">同意用户协议</ExCheckbox>
</template>

<script setup>
import { ref } from 'vue';

const checked = ref(false);
</script>
```

:::

## 禁用状态

通过 `disabled` 属性禁用复选框。

::: raw

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox :model-value="false" disabled>未选中禁用</ExCheckbox>
    <ExCheckbox :model-value="true" disabled>选中禁用</ExCheckbox>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox
      :model-value="false"
      disabled
    >
      未选中禁用
    </ExCheckbox>
    <ExCheckbox
      :model-value="true"
      disabled
    >
      选中禁用
    </ExCheckbox>
  </div>
</template>
```

:::

## 尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

::: raw

<div class="demo-block">
  <div style="display: flex; gap: 24px; align-items: center;">
    <ExCheckbox v-model="sizeChecked" size="small">小尺寸</ExCheckbox>
    <ExCheckbox v-model="sizeChecked" size="medium">中尺寸</ExCheckbox>
    <ExCheckbox v-model="sizeChecked" size="large">大尺寸</ExCheckbox>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <ExCheckbox
      v-model="sizeChecked"
      size="small"
    >
      小尺寸
    </ExCheckbox>
    <ExCheckbox
      v-model="sizeChecked"
      size="medium"
    >
      中尺寸
    </ExCheckbox>
    <ExCheckbox
      v-model="sizeChecked"
      size="large"
    >
      大尺寸
    </ExCheckbox>
  </div>
</template>
```

:::

## 圆形变体

通过 `shape="circle"` 使用圆形勾选框；CheckboxGroup 设置后会传递给组内子项，子项也可以显式覆盖。

::: raw

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox v-model="checked" shape="circle">圆形单个选项</ExCheckbox>
    <ExCheckboxGroup v-model="groupValue" shape="circle" label="圆形复选框组">
      <ExCheckbox value="apple">苹果</ExCheckbox>
      <ExCheckbox value="orange">橙子</ExCheckbox>
    </ExCheckboxGroup>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox
      v-model="checked"
      shape="circle"
    >
      圆形单个选项
    </ExCheckbox>
    <ExCheckboxGroup
      v-model="groupValue"
      shape="circle"
      label="圆形复选框组"
    >
      <ExCheckbox value="apple">苹果</ExCheckbox>
      <ExCheckbox value="orange">橙子</ExCheckbox>
    </ExCheckboxGroup>
  </div>
</template>
```

:::

## 状态

支持 `success`、`warning`、`error` 状态。

::: raw

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox v-model="statusChecked" status="default">默认状态</ExCheckbox>
    <ExCheckbox v-model="statusChecked" status="success">成功状态</ExCheckbox>
    <ExCheckbox v-model="statusChecked" status="warning">警告状态</ExCheckbox>
    <ExCheckbox v-model="statusChecked" status="error">错误状态</ExCheckbox>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox
      v-model="statusChecked"
      status="default"
    >
      默认状态
    </ExCheckbox>
    <ExCheckbox
      v-model="statusChecked"
      status="success"
    >
      成功状态
    </ExCheckbox>
    <ExCheckbox
      v-model="statusChecked"
      status="warning"
    >
      警告状态
    </ExCheckbox>
    <ExCheckbox
      v-model="statusChecked"
      status="error"
    >
      错误状态
    </ExCheckbox>
  </div>
</template>
```

:::

## 多选框组

使用多个复选框实现多选功能。

::: raw

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox 
      v-for="option in options" 
      :key="option"
      :model-value="checkList.includes(option)"
      @update:model-value="(val) => {
        if (val) {
          checkList.push(option)
        } else {
          const index = checkList.indexOf(option)
          if (index > -1) checkList.splice(index, 1)
        }
      }"
    >
      {{ option }}
    </ExCheckbox>
  </div>
  <p style="margin-top: 12px; color: var(--ex-color-text-secondary);">选中的值：{{ checkList }}</p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox
      v-for="option in options"
      :key="option"
      :model-value="checkList.includes(option)"
      @update:model-value="
        val => {
          if (val) {
            checkList.push(option);
          } else {
            const index = checkList.indexOf(option);
            if (index > -1) checkList.splice(index, 1);
          }
        }
      "
    >
      {{ option }}
    </ExCheckbox>
  </div>
  <p>选中的值：{{ checkList }}</p>
</template>

<script setup>
import { ref } from 'vue';

const checkList = ref(['Apple', 'Orange']);
const options = ['Apple', 'Pear', 'Orange'];
</script>
```

:::

## 不确定状态

`indeterminate` 属性用于表示复选框的不确定状态，常用于实现全选功能。

用户操作半选复选框后，组件会清除半选并发出 `update:indeterminate(false)`；原生 input 保留 HTML 的 `indeterminate` 语义，控制区域可通过 `aria-controls` 关联。

::: raw

<div class="demo-block">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox 
      :model-value="checkAll"
      :indeterminate="isIndeterminate"
      @update:model-value="handleCheckAllChange"
    >
      全选
    </ExCheckbox>
    <div style="margin: 8px 0; border-top: 1px solid var(--ex-color-border-primary);"></div>
    <ExCheckbox 
      v-for="city in cities" 
      :key="city"
      :model-value="checkedCities.includes(city)"
      @update:model-value="(val) => {
        if (val) {
          checkedCities.push(city)
        } else {
          const index = checkedCities.indexOf(city)
          if (index > -1) checkedCities.splice(index, 1)
        }
        handleCityChange()
      }"
    >
      {{ city }}
    </ExCheckbox>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <ExCheckbox
      :model-value="checkAll"
      :indeterminate="isIndeterminate"
      @update:model-value="handleCheckAllChange"
    >
      全选
    </ExCheckbox>
    <div style="margin: 8px 0; border-top: 1px solid var(--ex-color-border-primary);"></div>
    <ExCheckbox
      v-for="city in cities"
      :key="city"
      :model-value="checkedCities.includes(city)"
      @update:model-value="
        val => {
          if (val) {
            checkedCities.push(city);
          } else {
            const index = checkedCities.indexOf(city);
            if (index > -1) checkedCities.splice(index, 1);
          }
          handleCityChange();
        }
      "
    >
      {{ city }}
    </ExCheckbox>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const checkAll = ref(false);
const checkedCities = ref(['Shanghai', 'Beijing']);
const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'];

const isIndeterminate = computed(() => {
  const len = checkedCities.value.length;
  return len > 0 && len < cities.length;
});

const handleCheckAllChange = val => {
  checkedCities.value = val ? cities : [];
  checkAll.value = val;
};

const handleCityChange = () => {
  const len = checkedCities.value.length;
  checkAll.value = len === cities.length;
};
</script>
```

:::

## CheckboxGroup 组件

使用 `ExCheckboxGroup` 组件管理多个复选框。

::: raw

<div class="demo-block">
  <ExCheckboxGroup v-model="groupValue" label="选择你喜欢的水果">
    <ExCheckbox 
      v-for="option in groupOptions" 
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </ExCheckbox>
  </ExCheckboxGroup>
  <p style="margin-top: 12px; color: var(--ex-color-text-secondary);">选中的值：{{ groupValue }}</p>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExCheckboxGroup
    v-model="groupValue"
    label="选择你喜欢的水果"
  >
    <ExCheckbox
      v-for="option in groupOptions"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </ExCheckbox>
  </ExCheckboxGroup>
</template>

<script setup>
import { ref } from 'vue';

const groupValue = ref(['apple', 'banana']);
const groupOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄' },
];
</script>
```

:::

## 垂直布局

通过 `vertical` 属性设置垂直布局。

::: raw

<div class="demo-block">
  <ExCheckboxGroup v-model="verticalValue" vertical label="垂直布局">
    <ExCheckbox value="option1">选项 1</ExCheckbox>
    <ExCheckbox value="option2">选项 2</ExCheckbox>
    <ExCheckbox value="option3">选项 3</ExCheckbox>
  </ExCheckboxGroup>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExCheckboxGroup
    v-model="verticalValue"
    vertical
    label="垂直布局"
  >
    <ExCheckbox value="option1">选项 1</ExCheckbox>
    <ExCheckbox value="option2">选项 2</ExCheckbox>
    <ExCheckbox value="option3">选项 3</ExCheckbox>
  </ExCheckboxGroup>
</template>
```

:::

## 最小/最大限制

通过 `min` 和 `max` 属性限制选择数量。

::: raw

<div class="demo-block">
  <ExCheckboxGroup 
    v-model="limitValue"
    :min="1" 
    :max="2"
    label="最少选 1 个，最多选 2 个"
  >
    <ExCheckbox value="1">选项 1</ExCheckbox>
    <ExCheckbox value="2">选项 2</ExCheckbox>
    <ExCheckbox value="3">选项 3</ExCheckbox>
    <ExCheckbox value="4">选项 4</ExCheckbox>
  </ExCheckboxGroup>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExCheckboxGroup
    v-model="limitValue"
    :min="1"
    :max="2"
    label="最少选 1 个，最多选 2 个"
  >
    <ExCheckbox value="1">选项 1</ExCheckbox>
    <ExCheckbox value="2">选项 2</ExCheckbox>
    <ExCheckbox value="3">选项 3</ExCheckbox>
    <ExCheckbox value="4">选项 4</ExCheckbox>
  </ExCheckboxGroup>
</template>
```

:::

## 表单验证

通过 `rules` 属性添加验证规则。

::: raw

<div class="demo-block">
  <ExCheckbox
    v-model="agreed"
    :rules="[
      (value) => value === true || '请同意用户协议',
    ]"
    required
  >
    我已阅读并同意用户协议
  </ExCheckbox>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExCheckbox
    v-model="agreed"
    :rules="[value => value === true || '请同意用户协议']"
    required
  >
    我已阅读并同意用户协议
  </ExCheckbox>
</template>

<script setup>
import { ref } from 'vue';

const agreed = ref(false);
</script>
```

:::

## API

### ExCheckbox Props

| 属性                 | 说明                                  | 类型                                             | 默认值      |
| -------------------- | ------------------------------------- | ------------------------------------------------ | ----------- |
| modelValue / v-model | 绑定值                                | `boolean \| string \| number`                    | `false`     |
| trueValue            | 选中状态的值                          | `boolean \| string \| number`                    | `true`      |
| falseValue           | 未选中状态的值                        | `boolean \| string \| number`                    | `false`     |
| value                | 复选框的值（在 CheckboxGroup 中使用） | `string \| number`                               | -           |
| name                 | 原生复选框的 `name`                   | `string`                                         | -           |
| id                   | 原生复选框的 `id`                     | `string`                                         | 自动生成    |
| tabindex             | 原生复选框的键盘顺序                  | `string \| number`                               | -           |
| label                | 复选框标签                            | `string`                                         | -           |
| aria-label           | 无可见标签时的无障碍名称              | `string`                                         | -           |
| aria-labelledby      | 外部无障碍标签 ID 列表                | `string`                                         | -           |
| aria-describedby     | 外部无障碍描述 ID 列表                | `string`                                         | -           |
| aria-controls        | 半选状态控制的内容区域 ID             | `string`                                         | -           |
| size                 | 组件大小                              | `'small' \| 'medium' \| 'large'`                 | `'medium'`  |
| shape                | 复选框外观形状                        | `'square' \| 'circle'`                           | `'square'`  |
| status               | 组件状态                              | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| disabled             | 是否禁用                              | `boolean`                                        | `false`     |
| readonly             | 是否只读                              | `boolean`                                        | `false`     |
| indeterminate        | 是否为中间状态                        | `boolean`                                        | `false`     |
| required             | 是否必填                              | `boolean`                                        | `false`     |
| helpText             | 帮助文本                              | `string`                                         | -           |
| errorMessage         | 错误信息                              | `string`                                         | -           |
| rules                | 表单验证规则                          | `Array<(value) => boolean \| string>`            | -           |
| customClass          | 自定义类名                            | `string`                                         | -           |
| customStyle          | 自定义样式                            | `Record<string, string>`                         | -           |

### ExCheckbox Events

| 事件名               | 说明                       | 回调参数                                                     |
| -------------------- | -------------------------- | ------------------------------------------------------------ |
| update:modelValue    | 值变化时触发               | `(value: boolean \| string \| number) => void`               |
| update:indeterminate | 用户操作清除半选状态时触发 | `(value: boolean) => void`                                   |
| change               | 值变化时触发               | `(value: boolean \| string \| number, event: Event) => void` |
| focus                | 获得焦点时触发             | `(event: FocusEvent) => void`                                |
| blur                 | 失去焦点时触发             | `(event: FocusEvent) => void`                                |

### ExCheckbox Slots

| 插槽名  | 说明         |
| ------- | ------------ |
| default | 标签内容     |
| label   | 标签插槽     |
| help    | 帮助文本插槽 |
| error   | 错误信息插槽 |

### ExCheckbox Methods

| 方法名             | 说明             | 参数 |
| ------------------ | ---------------- | ---- |
| focus              | 使复选框获得焦点 | -    |
| blur               | 使复选框失去焦点 | -    |
| getCheckboxElement | 获取复选框元素   | -    |

### ExCheckboxGroup Props

| 属性                 | 说明                     | 类型                                             | 默认值      |
| -------------------- | ------------------------ | ------------------------------------------------ | ----------- |
| modelValue / v-model | 绑定值                   | `Array<string \| number>`                        | `[]`        |
| id                   | 复选框组根节点的 `id`    | `string`                                         | 自动生成    |
| options              | 选项列表                 | `CheckboxOption[]`                               | -           |
| name                 | 表单域 name 属性         | `string`                                         | -           |
| size                 | 组件大小                 | `'small' \| 'medium' \| 'large'`                 | `'medium'`  |
| shape                | 复选框外观形状           | `'square' \| 'circle'`                           | `'square'`  |
| status               | 组件状态                 | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| disabled             | 是否禁用                 | `boolean`                                        | `false`     |
| readonly             | 是否只读                 | `boolean`                                        | `false`     |
| min                  | 最小选择数量             | `number`                                         | -           |
| max                  | 最大选择数量             | `number`                                         | -           |
| vertical             | 是否垂直排列             | `boolean`                                        | `false`     |
| label                | 标签文本                 | `string`                                         | -           |
| aria-label           | 无可见标签时的无障碍名称 | `string`                                         | -           |
| aria-labelledby      | 外部无障碍标签 ID 列表   | `string`                                         | -           |
| aria-describedby     | 外部无障碍描述 ID 列表   | `string`                                         | -           |
| required             | 是否必填                 | `boolean`                                        | `false`     |
| helpText             | 帮助文本                 | `string`                                         | -           |
| errorMessage         | 错误信息                 | `string`                                         | -           |
| rules                | 表单验证规则             | `Array<(value) => boolean \| string>`            | -           |
| customClass          | 自定义类名               | `string`                                         | -           |
| customStyle          | 自定义样式               | `Record<string, string>`                         | -           |

### ExCheckboxGroup Events

| 事件名            | 说明         | 回调参数                                   |
| ----------------- | ------------ | ------------------------------------------ |
| update:modelValue | 值变化时触发 | `(value: Array<string \| number>) => void` |
| change            | 值变化时触发 | `(value: Array<string \| number>) => void` |

### ExCheckboxGroup Methods

| 方法名                  | 说明             | 参数 |
| ----------------------- | ---------------- | ---- |
| checkAll                | 全选             | -    |
| uncheckAll              | 取消全选         | -    |
| toggleAll               | 反选             | -    |
| getCheckboxGroupElement | 获取复选框组元素 | -    |

<style scoped>
.demo-block {
  padding: 24px;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  background: var(--ex-color-bg-secondary);
  margin: 16px 0;
}
</style>
