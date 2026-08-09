# Tag 标签

用于状态标记、标签展示和触发与标签相关的动作。

<script setup lang="ts">
import { ref } from 'vue';
import { message } from '../../src/components/message';
import type { TagType } from '../../src/components/tag/types';

interface DemoTag {
  name: string;
  type: TagType;
}

const dynamicTags = ref<DemoTag[]>([
  { name: '标签一', type: 'primary' },
  { name: '标签二', type: 'success' },
  { name: '标签三', type: 'info' },
]);

const handleClick = () => {
  message.info('标签已激活');
};

const handleClose = (tag: DemoTag) => {
  const index = dynamicTags.value.indexOf(tag);
  if (index > -1) {
    dynamicTags.value.splice(index, 1);
  }
};

const handleAdd = (value: string) => {
  const types: TagType[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const nextType = types[dynamicTags.value.length % types.length] ?? 'primary';
  dynamicTags.value.push({ name: value, type: nextType });
};

const handleDuplicate = (value: string) => {
  message.warning(`标签 "${value}" 已存在`);
};
</script>

## 基础用法

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag>标签一</ex-tag>
  <ex-tag type="success">标签二</ex-tag>
  <ex-tag type="info">标签三</ex-tag>
  <ex-tag type="warning">标签四</ex-tag>
  <ex-tag type="danger">标签五</ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag>标签一</ex-tag>
<ex-tag type="success">标签二</ex-tag>
<ex-tag type="info">标签三</ex-tag>
<ex-tag type="warning">标签四</ex-tag>
<ex-tag type="danger">标签五</ex-tag>
```

:::

## 不同主题

通过 `effect` 属性可以设置不同的主题：`dark`、`light` 和 `plain`。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag effect="dark">Dark</ex-tag>
  <ex-tag effect="dark" type="success">Dark Success</ex-tag>
  <ex-tag effect="light">Light</ex-tag>
  <ex-tag effect="light" type="success">Light Success</ex-tag>
  <ex-tag effect="plain">Plain</ex-tag>
  <ex-tag effect="plain" type="success">Plain Success</ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag effect="dark">Dark</ex-tag>
<ex-tag effect="dark" type="success">Dark Success</ex-tag>
<ex-tag effect="light">Light</ex-tag>
<ex-tag effect="light" type="success">Light Success</ex-tag>
<ex-tag effect="plain">Plain</ex-tag>
<ex-tag effect="plain" type="success">Plain Success</ex-tag>
```

:::

## 可交互标签

设置 `clickable` 后，标签会获得键盘可操作的按钮语义；鼠标点击仍会触发 `click` 事件。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag clickable @click="handleClick">可键盘操作</ex-tag>
  <ex-tag clickable closable close-aria-label="移除可关闭标签">带关闭操作</ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag clickable @click="handleClick">可键盘操作</ex-tag>
<ex-tag clickable closable close-aria-label="移除可关闭标签">带关闭操作</ex-tag>
```

:::

## 自定义颜色

你可以通过 `color`、`bgColor` 和 `borderColor` 属性来自定义标签的颜色。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag color="#e6f0ff" bg-color="#0f1720" border-color="#29abe2">霓虹蓝标签</ex-tag>
  <ex-tag color="#ffcf70" border-color="#f59e0b" effect="plain">警告边框</ex-tag>
  <ex-tag color="#8ff0c0" bg-color="#062218" border-color="#10b981">自定义组合</ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag color="#e6f0ff" bg-color="#0f1720" border-color="#29abe2">霓虹蓝标签</ex-tag>
<ex-tag color="#ffcf70" border-color="#f59e0b" effect="plain">警告边框</ex-tag>
<ex-tag color="#8ff0c0" bg-color="#062218" border-color="#10b981">自定义组合</ex-tag>
```

:::

## 动态编辑标签

结合 `ExTagInput` 组件可以实现动态添加和删除标签。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag
    v-for="tag in dynamicTags"
    :key="tag.name"
    closable
    :type="tag.type"
    :close-aria-label="'移除 ' + tag.name"
    @close="handleClose(tag)"
  >
    {{ tag.name }}
  </ex-tag>
  <ExTagInput
    :existing-tags="dynamicTags.map(t => t.name)"
    @confirm="handleAdd"
    @duplicate="handleDuplicate"
  />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div>
    <ex-tag
      v-for="tag in dynamicTags"
      :key="tag.name"
      closable
      :type="tag.type"
      :close-aria-label="'移除 ' + tag.name"
      @close="handleClose(tag)"
    >
      {{ tag.name }}
    </ex-tag>
    <ExTagInput
      :existing-tags="dynamicTags.map(t => t.name)"
      @confirm="handleAdd"
      @duplicate="handleDuplicate"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'vue-ex-ui';

const dynamicTags = ref([
  { name: '标签一', type: 'primary' },
  { name: '标签二', type: 'success' },
  { name: '标签三', type: 'info' },
]);

const handleClose = tag => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const handleAdd = value => {
  const types = ['primary', 'success', 'info', 'warning', 'danger'];
  const nextType = types[dynamicTags.value.length % types.length] || 'primary';
  dynamicTags.value.push({ name: value, type: nextType });
};

const handleDuplicate = value => {
  message.warning(`标签 "${value}" 已存在`);
};
</script>
```

:::

## 不同尺寸

支持 `large`、`medium`、`small` 三种尺寸。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag size="large">大号标签</ex-tag>
  <ex-tag size="medium">中号标签</ex-tag>
  <ex-tag size="small">小号标签</ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag size="large">大号标签</ex-tag>
<ex-tag size="medium">中号标签</ex-tag>
<ex-tag size="small">小号标签</ex-tag>
```

:::

## 带图标的标签

使用 `prefix` 插槽可以添加前置图标。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag size="large">
    <template #prefix>
      <ExIcon icon="star-fill" :size="16" />
    </template>
    大号标签
  </ex-tag>
  <ex-tag size="medium">
    <template #prefix>
      <ExIcon icon="star-line" :size="14" />
    </template>
    中号标签
  </ex-tag>
  <ex-tag size="small" round>
    <template #prefix>
      <ExIcon icon="checkbox-circle-fill" :size="12" />
    </template>
    小号圆形
  </ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag size="large">
  <template #prefix>
    <ExIcon icon="star-fill" :size="16" />
  </template>
  大号标签
</ex-tag>
<ex-tag size="medium">
  <template #prefix>
    <ExIcon icon="star-line" :size="14" />
  </template>
  中号标签
</ex-tag>
<ex-tag size="small" round>
  <template #prefix>
    <ExIcon icon="checkbox-circle-fill" :size="12" />
  </template>
  小号圆形
</ex-tag>
```

:::

## 自定义关闭图标

通过 `close` 插槽可以自定义关闭图标。

::: raw

<div class="vp-raw demo-container tag-demo">
  <ex-tag closable type="primary">默认关闭图标</ex-tag>
  <ex-tag closable type="success">
    <template #close>
      <ExIcon icon="delete-bin-line" :size="12" />
    </template>
    自定义删除图标
  </ex-tag>
  <ex-tag closable type="warning">
    <template #close>
      <ExIcon icon="close-circle-line" :size="12" />
    </template>
    圆形关闭图标
  </ex-tag>
</div>

:::

::: details 查看示例代码

```vue
<ex-tag closable type="primary">默认关闭图标</ex-tag>
<ex-tag closable type="success">
  <template #close>
    <ExIcon icon="delete-bin-line" :size="12" />
  </template>
  自定义删除图标
</ex-tag>
<ex-tag closable type="warning">
  <template #close>
    <ExIcon icon="close-circle-line" :size="12" />
  </template>
  圆形关闭图标
</ex-tag>
```

:::

## Tag API

### Tag Props

| 属性             | 说明                  | 类型      | 可选值                                        | 默认值                   |
| ---------------- | --------------------- | --------- | --------------------------------------------- | ------------------------ |
| type             | 类型                  | `string`  | `primary / success / warning / danger / info` | `primary`                |
| effect           | 主题                  | `string`  | `dark / light / plain`                        | `light`                  |
| closable         | 是否可关闭            | `boolean` | —                                             | `false`                  |
| clickable        | 是否启用键盘/按钮语义 | `boolean` | —                                             | `false`                  |
| aria-label       | 交互标签的无障碍名称  | `string`  | —                                             | —                        |
| close-aria-label | 关闭按钮的无障碍名称  | `string`  | —                                             | 当前语言的“移除标签”文案 |
| round            | 是否为圆形            | `boolean` | —                                             | `false`                  |
| size             | 尺寸                  | `string`  | `large / medium / small`                      | `medium`                 |
| color            | 自定义文本颜色        | `string`  | —                                             | —                        |
| bg-color         | 自定义背景颜色        | `string`  | —                                             | —                        |
| border-color     | 自定义边框颜色        | `string`  | —                                             | —                        |

### Tag Events

| 事件名 | 说明                            | 回调参数                               |
| ------ | ------------------------------- | -------------------------------------- |
| click  | 点击或键盘激活 Tag 时触发的事件 | `(event: MouseEvent \| KeyboardEvent)` |
| close  | 关闭 Tag 时触发的事件           | `(event: MouseEvent)`                  |

### Tag Slots

| 名称    | 说明                                                     |
| ------- | -------------------------------------------------------- |
| default | 自定义默认内容                                           |
| prefix  | 标签前置内容，通常用于放置图标，建议使用 `<ExIcon>` 组件 |
| close   | 自定义关闭图标，默认使用 `<ExIcon icon="close-line">`    |

## TagInput 组件说明

`ExTagInput` 组件用于动态添加新标签，它有两种状态：

1. **按钮状态**：显示一个带加号图标的按钮，点击后进入编辑状态
2. **编辑状态**：显示输入框和两个操作图标
   - ✓ 确认图标（绿色）：点击或按 Enter 确认添加
   - ✕ 取消图标（灰色）：点击或按 ESC 取消添加

## TagInput API

### TagInput Props

| 属性               | 说明             | 类型       | 默认值                     |
| ------------------ | ---------------- | ---------- | -------------------------- |
| button-text        | 按钮文本         | `string`   | 当前语言的新增标签文案     |
| placeholder        | 输入框占位符     | `string`   | 当前语言的标签名称占位文案 |
| size               | 尺寸             | `string`   | `'medium'`                 |
| maxlength          | 最大长度         | `number`   | `20`                       |
| existing-tags      | 已存在的标签列表 | `string[]` | `[]`                       |
| validate-duplicate | 是否验证重复     | `boolean`  | `true`                     |

### TagInput Events

| 事件名    | 说明                                             | 回调参数          |
| --------- | ------------------------------------------------ | ----------------- |
| confirm   | 确认添加标签                                     | `(value: string)` |
| cancel    | 取消添加                                         | `()`              |
| duplicate | 标签重复时触发，并显示可被辅助技术播报的重复提示 | `(value: string)` |

### TagInput Slots

| 名称 | 说明           |
| ---- | -------------- |
| icon | 自定义按钮图标 |

## 使用建议

### 图标使用规范

Tag 组件中的所有图标都应该使用插槽形式，推荐使用 `ExIcon` 组件：

::: details 查看示例代码

```vue
<!-- ✅ 推荐：使用 ExIcon 组件 + 插槽 -->
<ex-tag>
  <template #prefix>
    <ExIcon icon="star-fill" :size="14" />
  </template>
  标签文本
</ex-tag>

<!-- ✅ 推荐：自定义关闭图标 -->
<ex-tag closable>
  <template #close>
    <ExIcon icon="close-circle-line" :size="12" />
  </template>
  可关闭标签
</ex-tag>

<!-- ❌ 不推荐：不支持 icon 属性 -->
<ex-tag icon="star">标签</ex-tag>
```

:::

### 动态标签最佳实践

使用 `ExTagInput` 组件时的建议：

1. **验证重复**：传入 `existing-tags` 属性，按去除首尾空白后的字符串进行精确匹配
2. **错误提示**：监听 `duplicate` 事件，给用户友好的提示
3. **尺寸统一**：TagInput 的 `size` 控制文字、图标和输入宽度；操作按钮保留 44px 触控目标
4. **数据管理**：使用响应式数据管理标签列表

::: details 查看示例代码

```vue
<template>
  <div>
    <ex-tag
      v-for="tag in tags"
      :key="tag"
      closable
      :close-aria-label="'移除 ' + tag"
      @close="removeTag(tag)"
    >
      {{ tag }}
    </ex-tag>
    <ExTagInput
      :existing-tags="tags"
      @confirm="addTag"
      @duplicate="handleDuplicate"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tags = ref(['标签1', '标签2']);

const addTag = value => {
  tags.value.push(value);
};

const removeTag = tag => {
  const index = tags.value.indexOf(tag);
  if (index > -1) {
    tags.value.splice(index, 1);
  }
};

const handleDuplicate = value => {
  // 提示用户标签已存在
  console.warn(`标签 "${value}" 已存在`);
};
</script>
```

:::

## 无障碍与布局约定

- 标签的状态语义应同时通过文字或图标表达，不要只依赖颜色。
- 当前 Tag 不内置 `selected` 选择态；如果业务需要筛选或选择语义，应由上层状态组件承担并提供对应的选择控件语义。
- 可关闭标签建议使用 `close-aria-label` 指明具体标签名称，避免多个“移除标签”按钮无法区分。
- `TagInput` 的确认和取消按钮保留 44px 触控目标；Tag 关闭按钮至少保留 24px 目标区域；`size` 调整内容比例、图标和输入宽度。
- 标签之间的间距由父级布局容器通过 `gap` 或 `ExSpace` 管理，Tag 本身不再自动添加兄弟间距。

<style scoped>
.tag-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ex-spacing-2);
}
</style>
