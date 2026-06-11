# Tag 标签

用于标记和选择。

## 基础用法
<div class="tag-group">
    <ex-tag>标签一</ex-tag>
    <ex-tag type="success">标签二</ex-tag>
    <ex-tag type="info">标签三</ex-tag>
    <ex-tag type="warning">标签四</ex-tag>
    <ex-tag type="danger">标签五</ex-tag>
  </div>


```vue
<template>
  <div class="tag-group">
    <ex-tag>标签一</ex-tag>
    <ex-tag type="success">标签二</ex-tag>
    <ex-tag type="info">标签三</ex-tag>
    <ex-tag type="warning">标签四</ex-tag>
    <ex-tag type="danger">标签五</ex-tag>
  </div>
</template>
```


## 不同主题

通过 `effect` 属性可以设置不同的主题：`dark`、`light` 和 `plain`。

 <div class="tag-group">
    <ex-tag effect="dark">Dark</ex-tag>
    <ex-tag effect="dark" type="success">Dark Success</ex-tag>
    <ex-tag effect="light">Light</ex-tag>
    <ex-tag effect="light" type="success">Light Success</ex-tag>
    <ex-tag effect="plain">Plain</ex-tag>
    <ex-tag effect="plain" type="success">Plain Success</ex-tag>
  </div>

```vue
<template>
  <div class="tag-group">
    <ex-tag effect="dark">Dark</ex-tag>
    <ex-tag effect="dark" type="success">Dark Success</ex-tag>
    <ex-tag effect="light">Light</ex-tag>
    <ex-tag effect="light" type="success">Light Success</ex-tag>
    <ex-tag effect="plain">Plain</ex-tag>
    <ex-tag effect="plain" type="success">Plain Success</ex-tag>
  </div>
</template>
```


## 自定义颜色

你可以通过 `color`、`bgColor` 和 `borderColor` 属性来自定义标签的颜色。
<div class="tag-group">
    <ex-tag color="#fff" bg-color="#f00">红色背景</ex-tag>
    <ex-tag color="#f00" border-color="#f00" effect="plain">红色边框</ex-tag>
    <ex-tag color="#00f" bg-color="#e0f" border-color="#00f">自定义组合</ex-tag>
  </div>


```vue
<template>
  <div class="tag-group">
    <ex-tag color="#fff" bg-color="#f00">红色背景</ex-tag>
    <ex-tag color="#f00" border-color="#f00" effect="plain">红色边框</ex-tag>
    <ex-tag color="#00f" bg-color="#e0f" border-color="#00f">自定义组合</ex-tag>
  </div>
</template>
```


## 动态编辑标签

结合 `ExTagInput` 组件可以实现动态添加和删除标签。

<div class="tag-group">
    <ex-tag 
      v-for="tag in dynamicTags" 
      :key="tag.name" 
      closable 
      :type="tag.type" 
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

```vue
<template>
  <div class="tag-group">
    <ex-tag 
      v-for="tag in dynamicTags" 
      :key="tag.name" 
      closable 
      :type="tag.type" 
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
import { message } from 'exui';

const dynamicTags = ref([
  { name: '标签一', type: 'primary' },
  { name: '标签二', type: 'success' },
  { name: '标签三', type: 'info' },
]);

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const handleAdd = (value) => {
  const types = ['primary', 'success', 'info', 'warning', 'danger'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  dynamicTags.value.push({ name: value, type: randomType });
};

const handleDuplicate = (value) => {
  message.warning(`标签 "${value}" 已存在`);
};
</script>
```



## 不同尺寸

支持 `large`、`medium`、`small` 三种尺寸。

<div class="tag-group" style="align-items: center;">
    <ex-tag size="large">大号标签</ex-tag>
    <ex-tag size="medium">中号标签</ex-tag>
    <ex-tag size="small">小号标签</ex-tag>
  </div>

```vue
<template>
  <div class="tag-group" style="align-items: center;">
    <ex-tag size="large">大号标签</ex-tag>
    <ex-tag size="medium">中号标签</ex-tag>
    <ex-tag size="small">小号标签</ex-tag>
  </div>
</template>
```

## 带图标的标签

使用 `prefix` 插槽可以添加前置图标。

<div class="tag-group" style="align-items: center;">
    <ex-tag size="large">
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/star-fill.svg" :size="16" />
      </template>
      大号标签
    </ex-tag>
    <ex-tag size="medium">
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/heart-fill.svg" :size="14" />
      </template>
      中号标签
    </ex-tag>
    <ex-tag size="small" round>
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/fire-fill.svg" :size="12" />
      </template>
      小号圆形
    </ex-tag>
  </div>

```vue
<template>
  <div class="tag-group" style="align-items: center;">
    <ex-tag size="large">
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/star-fill.svg" :size="16" />
      </template>
      大号标签
    </ex-tag>
    <ex-tag size="medium">
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/heart-fill.svg" :size="14" />
      </template>
      中号标签
    </ex-tag>
    <ex-tag size="small" round>
      <template #prefix>
        <ExIcon src="https://api.iconify.design/ri/fire-fill.svg" :size="12" />
      </template>
      小号圆形
    </ex-tag>
  </div>
</template>
```

## 自定义关闭图标

通过 `close` 插槽可以自定义关闭图标。

<div class="tag-group">
    <ex-tag closable type="primary">默认关闭图标</ex-tag>
    <ex-tag closable type="success">
      <template #close>
        <ExIcon src="https://api.iconify.design/ri/delete-bin-line.svg" :size="12" />
      </template>
      自定义删除图标
    </ex-tag>
    <ex-tag closable type="warning">
      <template #close>
        <ExIcon src="https://api.iconify.design/ri/close-circle-line.svg" :size="12" />
      </template>
      圆形关闭图标
    </ex-tag>
  </div>

```vue
<template>
  <div class="tag-group">
    <ex-tag closable type="primary">默认关闭图标</ex-tag>
    <ex-tag closable type="success">
      <template #close>
        <ExIcon src="https://api.iconify.design/ri/delete-bin-line.svg" :size="12" />
      </template>
      自定义删除图标
    </ex-tag>
    <ex-tag closable type="warning">
      <template #close>
        <ExIcon src="https://api.iconify.design/ri/close-circle-line.svg" :size="12" />
      </template>
      圆形关闭图标
    </ex-tag>
  </div>
</template>
```



## Tag API

### Tag Props

| 属性          | 说明                                      | 类型      | 可选值                                      | 默认值    |
| ------------- | ----------------------------------------- | --------- | ------------------------------------------- | --------- |
| type          | 类型                                      | `string`  | `primary / success / warning / danger / info` | `primary` |
| effect        | 主题                                      | `string`  | `dark / light / plain`                      | `light`   |
| closable      | 是否可关闭                                | `boolean` | —                                           | `false`   |
| round         | 是否为圆形                                | `boolean` | —                                           | `false`   |
| size          | 尺寸                                      | `string`  | `large / default / small`                   | `default` |
| color         | 自定义文本颜色                            | `string`  | —                                           | —         |
| bg-color      | 自定义背景颜色                            | `string`  | —                                           | —         |
| border-color  | 自定义边框颜色                            | `string`  | —                                           | —         |

### Tag Events

| 事件名 | 说明                | 回调参数              |
| ------ | ------------------- | --------------------- |
| click  | 点击 Tag 时触发的事件 | `(event: MouseEvent)` |
| close  | 关闭 Tag 时触发的事件 | `(event: MouseEvent)` |

### Tag Slots

| 名称    | 说明                                                                 |
| ------- | -------------------------------------------------------------------- |
| default | 自定义默认内容                                                       |
| prefix  | 标签前置内容，通常用于放置图标，建议使用 `<ExIcon>` 组件            |
| close   | 自定义关闭图标，默认使用 `<ExIcon src="...">` 形式的关闭图标        |

## TagInput 组件说明

`ExTagInput` 组件用于动态添加新标签，它有两种状态：

1. **按钮状态**：显示一个带加号图标的按钮，点击后进入编辑状态
2. **编辑状态**：显示输入框和两个操作图标
   - ✓ 确认图标（绿色）：点击或按 Enter 确认添加
   - ✕ 取消图标（灰色）：点击或按 ESC 取消添加

## TagInput API

### TagInput Props

| 属性               | 说明                     | 类型       | 默认值       |
| ------------------ | ------------------------ | ---------- | ------------ |
| button-text        | 按钮文本                 | `string`   | `'+ 新标签'` |
| placeholder        | 输入框占位符             | `string`   | `'请输入标签名称'` |
| size               | 尺寸                     | `string`   | `'medium'`   |
| maxlength          | 最大长度                 | `number`   | `20`         |
| existing-tags      | 已存在的标签列表         | `string[]` | `[]`         |
| validate-duplicate | 是否验证重复             | `boolean`  | `true`       |

### TagInput Events

| 事件名    | 说明             | 回调参数            |
| --------- | ---------------- | ------------------- |
| confirm   | 确认添加标签     | `(value: string)`   |
| cancel    | 取消添加         | `()`                |
| duplicate | 标签重复时触发   | `(value: string)`   |

### TagInput Slots

| 名称 | 说明           |
| ---- | -------------- |
| icon | 自定义按钮图标 |

## 使用建议

### 图标使用规范

Tag 组件中的所有图标都应该使用插槽形式，推荐使用 `ExIcon` 组件：

```vue
<!-- ✅ 推荐：使用 ExIcon 组件 + 插槽 -->
<ex-tag>
  <template #prefix>
    <ExIcon src="https://api.iconify.design/ri/star-fill.svg" :size="14" />
  </template>
  标签文本
</ex-tag>

<!-- ✅ 推荐：自定义关闭图标 -->
<ex-tag closable>
  <template #close>
    <ExIcon src="https://api.iconify.design/ri/close-circle-line.svg" :size="12" />
  </template>
  可关闭标签
</ex-tag>

<!-- ❌ 不推荐：不支持 icon 属性 -->
<ex-tag icon="star">标签</ex-tag>
```

### 动态标签最佳实践

使用 `ExTagInput` 组件时的建议：

1. **验证重复**：传入 `existing-tags` 属性，自动验证重复标签
2. **错误提示**：监听 `duplicate` 事件，给用户友好的提示
3. **尺寸统一**：TagInput 的 `size` 应与 Tag 保持一致
4. **数据管理**：使用响应式数据管理标签列表

```vue
<template>
  <div class="tag-group">
    <ex-tag 
      v-for="tag in tags" 
      :key="tag" 
      closable 
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

const addTag = (value) => {
  tags.value.push(value);
};

const removeTag = (tag) => {
  const index = tags.value.indexOf(tag);
  if (index > -1) {
    tags.value.splice(index, 1);
  }
};

const handleDuplicate = (value) => {
  // 提示用户标签已存在
  console.warn(`标签 "${value}" 已存在`);
};
</script>
```


<script setup>
import { ref } from 'vue';

const dynamicTags = ref([
  { name: '标签一', type: 'primary' },
  { name: '标签二', type: 'success' },
  { name: '标签三', type: 'info' },
]);

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const handleAdd = (value) => {
  const types = ['primary', 'success', 'info', 'warning', 'danger'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  dynamicTags.value.push({ name: value, type: randomType });
};

const handleDuplicate = (value) => {
  console.log(`标签 "${value}" 已存在`);
};
</script>