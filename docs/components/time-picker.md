# TimePicker 时间选择器

用于选择或输入时间（时 / 分 / 秒）。

<script setup>
import { ref } from 'vue'

const time1 = ref('')
const time2 = ref('09:30:00')
const time3 = ref('')
const time4 = ref('')
const time5 = ref('14:00:00')
</script>

## 基础用法

绑定 `v-model`，默认格式为 `HH:mm:ss`。

::: raw

<div class="demo-container">
  <ExTimePicker v-model="time1" />
  <span style="color: var(--ex-color-text-secondary);">当前值：{{ time1 || '（空）' }}</span>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTimePicker v-model="time1" />
    <span style="color: var(--ex-color-text-secondary);">当前值：{{ time1 || '（空）' }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const time1 = ref('');
</script>
```

:::

## 不同尺寸

通过 `size` 设置 `small` / `medium`（默认）/ `large`。

::: raw

<div class="demo-container">
  <ExTimePicker v-model="time2" size="small" />
  <ExTimePicker v-model="time2" size="medium" />
  <ExTimePicker v-model="time2" size="large" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTimePicker
      v-model="time2"
      size="small"
    />
    <ExTimePicker
      v-model="time2"
      size="medium"
    />
    <ExTimePicker
      v-model="time2"
      size="large"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const time2 = ref('09:30:00');
</script>
```

:::

## 时分格式

通过 `format` 控制显示的时间单位，例如只选时分。

::: raw

<div class="demo-container">
  <ExTimePicker v-model="time3" format="HH:mm" placeholder="选择时分" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTimePicker
      v-model="time3"
      format="HH:mm"
      placeholder="选择时分"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const time3 = ref('');
</script>
```

:::

## 步进间隔

通过 `hour-step` / `minute-step` / `second-step` 设置步进。

::: raw

<div class="demo-container">
  <ExTimePicker v-model="time4" :minute-step="15" :second-step="15" placeholder="每 15 分钟" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTimePicker
      v-model="time4"
      :minute-step="15"
      :second-step="15"
      placeholder="每 15 分钟"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const time4 = ref('');
</script>
```

:::

## 禁用状态

设置 `disabled` 禁用整个选择器。

::: raw

<div class="demo-container">
  <ExTimePicker v-model="time5" disabled />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExTimePicker
      v-model="time5"
      disabled
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const time5 = ref('14:00:00');
</script>
```

:::

## 受控 / 非受控

TimePicker 通过 `v-model` 受控。每次点选时分秒都会实时更新绑定值，点击「此刻」填入当前时间，「确定」关闭面板。

```vue
<template>
  <ExTimePicker
    v-model="time"
    @change="onChange"
  />
</template>

<script setup>
import { ref } from 'vue';
const time = ref('');
const onChange = val => console.log('changed:', val);
</script>
```

## API

### Props

| 属性                                  | 说明                                          | 类型                             | 默认值           |
| ------------------------------------- | --------------------------------------------- | -------------------------------- | ---------------- |
| model-value / v-model                 | 绑定值，格式与 `format` 一致                  | `string`                         | `''`             |
| format                                | 时间格式（支持 `HH` / `mm` / `ss`，冒号分隔） | `string`                         | `'HH:mm:ss'`     |
| placeholder                           | 占位文本                                      | `string`                         | 内置「选择时间」 |
| disabled                              | 是否禁用                                      | `boolean`                        | `false`          |
| clearable                             | 是否可清空                                    | `boolean`                        | `true`           |
| size                                  | 尺寸                                          | `'small' \| 'medium' \| 'large'` | 跟随全局配置     |
| hour-step / minute-step / second-step | 步进间隔                                      | `number`                         | `1`              |
| disabled-hours                        | 返回禁用的小时数组                            | `() => number[]`                 | —                |
| disabled-minutes                      | 返回禁用的分钟数组                            | `(hour: number) => number[]`     | —                |
| disabled-seconds                      | 返回禁用的秒数组                              | `(hour, minute) => number[]`     | —                |
| teleported                            | 面板是否传送到 body                           | `boolean`                        | `true`           |
| popper-class                          | 弹层自定义类名                                | `string`                         | —                |
| id                                    | 输入框 ID                                     | `string`                         | —                |
| aria-label                            | 输入框无障碍名称                              | `string`                         | 使用占位文本     |
| aria-describedby                      | 关联描述元素 ID                               | `string`                         | —                |

### Events

| 事件名             | 说明         | 类型                         |
| ------------------ | ------------ | ---------------------------- |
| update:model-value | 值更新       | `(value: string) => void`    |
| change             | 值变化       | `(value: string) => void`    |
| focus / blur       | 焦点事件     | `(e: FocusEvent) => void`    |
| clear              | 清空         | `() => void`                 |
| visible-change     | 面板显隐变化 | `(visible: boolean) => void` |

### Methods

| 方法名       | 说明        | 类型         |
| ------------ | ----------- | ------------ |
| focus / blur | 聚焦 / 失焦 | `() => void` |

## 主题定制

TimePicker 消费 ExUI 全局设计令牌：

```css
:root {
  --ex-color-bg-secondary: #11151c; /* 触发器背景 */
  --ex-color-bg-elevated: #0d1117; /* 面板背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-color-primary: #29abe2; /* 选中态高亮 */
}
```

## 常见问题

**Q：绑定值是什么类型？**
字符串，格式与 `format` 完全一致（如 `'09:30:00'`）。空字符串表示未选择。

**Q：如何只选小时和分钟？**
设置 `format="HH:mm"`，面板会只显示时、分两列。

**Q：怎样限制可选时间范围？**
用 `disabled-hours` / `disabled-minutes` / `disabled-seconds` 返回需禁用的数值数组，被禁用的项不可点击。

## 最佳实践

- **与日期联动**时，配合 [DateTimePicker](/components/datetime-picker) 或表单使用，保持值格式一致。
- 用 `minute-step` 约束粒度（如预约场景每 15 / 30 分钟），减少无效选择。
- 表单中放入 `ExFormItem` 即可自动参与校验（change / blur 触发）。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
