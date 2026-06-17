# Message 全局提示

常用于主动操作后的反馈提示。

<script setup>
import { ref } from 'vue'
import { message } from '../../src/components/message'

const showInfo = () => {
  message.info('这是一条信息提示')
}

const showSuccess = () => {
  message.success('操作成功！')
}

const showWarning = () => {
  message.warning('警告：请注意操作')
}

const showError = () => {
  message.error('操作失败，请重试')
}

const showLoading = () => {
  const instance = message.loading('加载中...')
  setTimeout(() => {
    instance.close()
    message.success('加载完成！')
  }, 2000)
}

const showClosable = () => {
  message.info({
    content: '这是一条可关闭的消息',
    closable: true,
    duration: 0,
  })
}

const showCustomDuration = () => {
  message.info({
    content: '这条消息将在 5 秒后关闭',
    duration: 5000,
  })
}

const showHtml = () => {
  message.info({
    content: '<strong>加粗文本</strong> 和 <em>斜体文本</em>',
    dangerouslyUseHTMLString: true,
  })
}

const closeAll = () => {
  message.closeAll()
}
</script>

## 基础用法

从顶部出现，3 秒后自动消失。

<div class="demo-container">
  <ex-button @click="showInfo">信息提示</ex-button>
</div>

```vue
<template>
  <ex-button @click="showInfo">信息提示</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showInfo = () => {
  message.info('这是一条信息提示')
}
</script>
```

## 不同类型

用来显示「成功、警告、消息、错误」类的操作反馈。

<div class="demo-container">
  <ex-button @click="showInfo">信息</ex-button>
  <ex-button type="success" @click="showSuccess">成功</ex-button>
  <ex-button type="warning" @click="showWarning">警告</ex-button>
  <ex-button type="danger" @click="showError">错误</ex-button>
</div>

```vue
<template>
  <ex-button @click="showInfo">信息</ex-button>
  <ex-button type="success" @click="showSuccess">成功</ex-button>
  <ex-button type="warning" @click="showWarning">警告</ex-button>
  <ex-button type="danger" @click="showError">错误</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showInfo = () => {
  message.info('这是一条信息提示')
}

const showSuccess = () => {
  message.success('操作成功！')
}

const showWarning = () => {
  message.warning('警告：请注意操作')
}

const showError = () => {
  message.error('操作失败，请重试')
}
</script>
```

## 加载中

显示加载状态，异步操作完成后手动关闭。

<div class="demo-container">
  <ex-button @click="showLoading">加载中</ex-button>
</div>

```vue
<template>
  <ex-button @click="showLoading">加载中</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showLoading = () => {
  const instance = message.loading('加载中...')
  
  // 模拟异步操作
  setTimeout(() => {
    instance.close()
    message.success('加载完成！')
  }, 2000)
}
</script>
```

## 可关闭

显示关闭按钮，可手动关闭消息。

<div class="demo-container">
  <ex-button @click="showClosable">可关闭的消息</ex-button>
</div>

```vue
<template>
  <ex-button @click="showClosable">可关闭的消息</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showClosable = () => {
  message.info({
    content: '这是一条可关闭的消息',
    closable: true,
    duration: 0, // 不自动关闭
  })
}
</script>
```

## 自定义时长

自定义消息显示时长。

<div class="demo-container">
  <ex-button @click="showCustomDuration">5 秒后关闭</ex-button>
</div>

```vue
<template>
  <ex-button @click="showCustomDuration">5 秒后关闭</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showCustomDuration = () => {
  message.info({
    content: '这条消息将在 5 秒后关闭',
    duration: 5000,
  })
}
</script>
```

## HTML 内容

支持渲染 HTML 字符串。

<div class="demo-container">
  <ex-button @click="showHtml">HTML 内容</ex-button>
</div>

```vue
<template>
  <ex-button @click="showHtml">HTML 内容</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showHtml = () => {
  message.info({
    content: '<strong>加粗文本</strong> 和 <em>斜体文本</em>',
    dangerouslyUseHTMLString: true,
  })
}
</script>
```

::: warning 安全提示
`dangerouslyUseHTMLString` 属性会将 `content` 作为 HTML 片段处理，这可能会导致 XSS 攻击。请确保 `content` 的内容是可信的，不要将用户输入直接作为 `content`。
:::

## 关闭所有

一次性关闭所有消息。

<div class="demo-container">
  <ex-button @click="showInfo">显示消息</ex-button>
  <ex-button @click="showSuccess">显示消息</ex-button>
  <ex-button @click="showWarning">显示消息</ex-button>
  <ex-button type="danger" @click="closeAll">关闭所有</ex-button>
</div>

```vue
<template>
  <ex-button @click="showInfo">显示消息</ex-button>
  <ex-button type="danger" @click="closeAll">关闭所有</ex-button>
</template>

<script setup>
import { message } from 'vue-ex-ui'

const showInfo = () => {
  message.info('这是一条信息提示')
}

const closeAll = () => {
  message.closeAll()
}
</script>
```

## 全局配置

可以通过 `message.config` 方法配置全局默认选项。

```typescript
import { message } from 'vue-ex-ui'

// 配置全局默认选项
message.config({
  duration: 5000,      // 默认显示时长
  offset: 30,          // 距离顶部的偏移量
  maxCount: 3,         // 最大显示数量
  showIcon: true,      // 是否显示图标
  closable: false,     // 是否可关闭
  grouping: false,     // 是否合并相同消息
})
```

## API

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| message(options) | 显示消息 | `string \| MessageOptions` | `MessageInstance` |
| message.info(options) | 显示信息消息 | `string \| MessageOptions` | `MessageInstance` |
| message.success(options) | 显示成功消息 | `string \| MessageOptions` | `MessageInstance` |
| message.warning(options) | 显示警告消息 | `string \| MessageOptions` | `MessageInstance` |
| message.error(options) | 显示错误消息 | `string \| MessageOptions` | `MessageInstance` |
| message.loading(options) | 显示加载消息 | `string \| MessageOptions` | `MessageInstance` |
| message.close(id) | 关闭指定消息 | `string` | — |
| message.closeAll() | 关闭所有消息 | — | — |
| message.config(options) | 配置全局选项 | `MessageGlobalConfig` | — |

### MessageOptions

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| id | 消息唯一标识 | string | — | 自动生成 |
| type | 消息类型 | string | info / success / warning / error / loading | info |
| content | 消息内容 | string | — | — |
| showIcon | 是否显示图标 | boolean | — | true |
| closable | 是否可关闭 | boolean | — | false |
| duration | 显示时长（毫秒），设为 0 则不自动关闭 | number | — | 3000 |
| customClass | 自定义 CSS 类名 | string | — | — |
| customStyle | 自定义样式 | object | — | — |
| zIndex | 层级 | number | — | 2000 |
| offset | 距离顶部的偏移量 | number | — | 20 |
| dangerouslyUseHTMLString | 是否将内容作为 HTML 处理 | boolean | — | false |
| onClose | 关闭时的回调 | () => void | — | — |
| grouping | 是否合并相同内容的消息 | boolean | — | false |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 消息内容 |
| icon | 自定义图标 |
| close | 自定义关闭按钮 |

### MessageInstance

| 属性/方法 | 说明 | 类型 |
| --- | --- | --- |
| id | 消息唯一标识 | string |
| close | 关闭消息 | () => void |

### MessageGlobalConfig

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| duration | 默认显示时长 | number | 3000 |
| offset | 默认偏移量 | number | 20 |
| zIndex | 默认层级 | number | 2000 |
| maxCount | 最大显示数量 | number | 5 |
| showIcon | 是否显示图标 | boolean | true |
| closable | 是否可关闭 | boolean | false |
| grouping | 是否合并相同消息 | boolean | false |

## 最佳实践

### 使用场景

- **info**：用于普通的信息提示
- **success**：用于操作成功后的反馈
- **warning**：用于警告用户注意某些事项
- **error**：用于操作失败后的错误提示
- **loading**：用于异步操作的加载状态

### 异步操作反馈

```typescript
const handleSubmit = async () => {
  const loading = message.loading('提交中...')
  
  try {
    await submitForm()
    loading.close()
    message.success('提交成功！')
  } catch (error) {
    loading.close()
    message.error('提交失败，请重试')
  }
}
```

### 消息合并

当需要避免重复消息时，可以启用消息合并：

```typescript
message.config({
  grouping: true,
})

// 多次调用只会显示一条消息
message.info('相同的消息')
message.info('相同的消息')
message.info('相同的消息')
```

### 无障碍

- 消息组件使用 `role="alert"` 属性，屏幕阅读器会自动朗读消息内容
- 错误消息使用 `aria-live="assertive"`，会立即打断当前朗读
- 其他类型消息使用 `aria-live="polite"`，会等待当前朗读完成
- 关闭按钮支持键盘操作（Enter 和 Space 键）

## 常见问题

**Q：鼠标悬停时消息会消失吗？**
不会。鼠标移入消息时自动暂停倒计时，移出后按剩余时长继续，便于阅读较长内容。

**Q：`message.loading` 不会自动关闭？**
是的，loading 消息默认 `duration: 0`（不自动关闭），需保存返回的实例并手动 `instance.close()`。

**Q：短时间内重复弹出相同消息刷屏？**
开启合并：`message.config({ grouping: true })` 或单条传 `{ grouping: true }`，相同 `type + content` 只显示一条；也可用 `maxCount` 限制最大数量。

**Q：HTML 内容安全吗？**
`dangerouslyUseHTMLString` 开启后内容会先经内置 `sanitizeHtml` 消毒再渲染，可防御常见 XSS，但仍建议只对可信内容使用。

## 主题定制

Message 由服务创建、固定在页面顶部居中，不定义独立的组件级变量。定制方式：

- **单条**：通过 `customClass` / `customStyle` 选项定制。
- **全局**：覆盖各类型所消费的全局色彩令牌：

```css
:root {
  --ex-color-success: #00d68f;       /* success */
  --ex-color-warning: #ffaa00;       /* warning */
  --ex-color-neon-blue-500: #29abe2; /* info */
  --ex-color-neon-pink-500: #ff2d78; /* error */
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
