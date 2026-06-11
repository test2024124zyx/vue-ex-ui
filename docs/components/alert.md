# Alert 警告提示

用于页面中展示重要的提示信息。

<script setup>
import { ref } from 'vue'

const visible1 = ref(true)
const visible2 = ref(true)
</script>

## 基础用法

Alert 组件提供四种类型，由 `type` 属性指定。

<div class="demo-container">
  <ExAlert type="info" title="信息提示" />
  <ExAlert type="success" title="成功提示" />
  <ExAlert type="warning" title="警告提示" />
  <ExAlert type="error" title="错误提示" />
</div>

```vue
<template>
  <ExAlert type="info" title="信息提示" />
  <ExAlert type="success" title="成功提示" />
  <ExAlert type="warning" title="警告提示" />
  <ExAlert type="error" title="错误提示" />
</template>
```

## 带描述信息

包含标题和详细描述的警告提示。

<div class="demo-container">
  <ExAlert
    type="info"
    title="信息提示的标题"
    description="这是一段详细的信息描述，可以告诉用户更多的信息内容。"
  />
  <ExAlert
    type="success"
    title="成功提示的标题"
    description="恭喜你，操作已经成功完成！所有数据已经保存。"
  />
</div>

```vue
<template>
  <ExAlert
    type="info"
    title="信息提示的标题"
    description="这是一段详细的信息描述。"
  />
</template>
```

## 可关闭

可以添加关闭按钮。

<div class="demo-container">
  <ExAlert
    v-if="visible1"
    type="warning"
    title="可关闭的警告"
    description="点击右侧的关闭按钮可以关闭这个提示。"
    closable
    @close="visible1 = false"
  />
  <ExButton v-if="!visible1" @click="visible1 = true">重新显示</ExButton>
</div>

```vue
<template>
  <ExAlert
    v-if="visible"
    type="warning"
    title="可关闭的警告"
    closable
    @close="visible = false"
  />
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(true)
</script>
```

## 带图标

通过设置 `show-icon` 属性来显示图标。

<div class="demo-container">
  <ExAlert type="info" title="信息提示" show-icon />
  <ExAlert type="success" title="成功提示" show-icon />
  <ExAlert type="warning" title="警告提示" show-icon />
  <ExAlert type="error" title="错误提示" show-icon />
</div>

```vue
<template>
  <ExAlert type="info" title="信息提示" show-icon />
  <ExAlert type="success" title="成功提示" show-icon />
  <ExAlert type="warning" title="警告提示" show-icon />
  <ExAlert type="error" title="错误提示" show-icon />
</template>
```

## 居中显示

使用 `center` 属性让文字水平居中。

<div class="demo-container">
  <ExAlert
    type="success"
    title="居中显示的提示"
    description="这是一段居中显示的描述文字。"
    center
    show-icon
  />
</div>

```vue
<template>
  <ExAlert
    type="success"
    title="居中显示的提示"
    center
    show-icon
  />
</template>
```

## 自定义图标

通过插槽自定义图标。

<div class="demo-container">
  <ExAlert type="primary" title="自定义图标">
    <template #icon>
      <img
        src="https://api.iconify.design/ri/rocket-line.svg"
        alt="火箭"
        width="20"
        height="20"
      />
    </template>
  </ExAlert>
</div>

```vue
<template>
  <ExAlert type="primary" title="自定义图标">
    <template #icon>
      <img
        src="https://api.iconify.design/ri/rocket-line.svg"
        alt="火箭"
        width="20"
        height="20"
      />
    </template>
  </ExAlert>
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 类型 | 'info' \| 'success' \| 'warning' \| 'error' \| 'primary' | 'info' |
| title | 标题 | string | - |
| description | 描述 | string | - |
| closable | 是否可关闭 | boolean | false |
| show-icon | 是否显示图标 | boolean | false |
| center | 是否居中 | boolean | false |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| close | 关闭时触发 | () => void |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 自定义内容 |
| title | 自定义标题 |
| icon | 自定义图标 |

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
