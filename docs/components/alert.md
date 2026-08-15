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
  <ExAlert
    type="info"
    title="信息提示"
  />
  <ExAlert
    type="success"
    title="成功提示"
  />
  <ExAlert
    type="warning"
    title="警告提示"
  />
  <ExAlert
    type="error"
    title="错误提示"
  />
</div>

```vue
<template>
  <ExAlert
    type="info"
    title="信息提示"
  />
  <ExAlert
    type="success"
    title="成功提示"
  />
  <ExAlert
    type="warning"
    title="警告提示"
  />
  <ExAlert
    type="error"
    title="错误提示"
  />
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
import { ref } from 'vue';

const visible = ref(true);
</script>
```

## 带图标

通过设置 `show-icon` 属性来显示图标。

<div class="demo-container">
  <ExAlert
    type="info"
    title="信息提示"
    show-icon
  />
  <ExAlert
    type="success"
    title="成功提示"
    show-icon
  />
  <ExAlert
    type="warning"
    title="警告提示"
    show-icon
  />
  <ExAlert
    type="error"
    title="错误提示"
    show-icon
  />
</div>

```vue
<template>
  <ExAlert
    type="info"
    title="信息提示"
    show-icon
  />
  <ExAlert
    type="success"
    title="成功提示"
    show-icon
  />
  <ExAlert
    type="warning"
    title="警告提示"
    show-icon
  />
  <ExAlert
    type="error"
    title="错误提示"
    show-icon
  />
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
  <ExAlert
    type="info"
    title="自定义图标"
  >
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
  <ExAlert
    type="info"
    title="自定义图标"
  >
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

## 不同变体

通过 `variant` 设置 `standard`（默认）、`filled`、`outlined` 三种视觉风格。

<div class="demo-container">
  <ExAlert
    type="success"
    variant="standard"
    title="standard 标准样式"
    show-icon
  />
  <ExAlert
    type="success"
    variant="filled"
    title="filled 实心样式"
    show-icon
  />
  <ExAlert
    type="success"
    variant="outlined"
    title="outlined 描边样式"
    show-icon
  />
</div>

```vue
<template>
  <ExAlert
    type="success"
    variant="standard"
    title="standard 标准样式"
    show-icon
  />
  <ExAlert
    type="success"
    variant="filled"
    title="filled 实心样式"
    show-icon
  />
  <ExAlert
    type="success"
    variant="outlined"
    title="outlined 描边样式"
    show-icon
  />
</template>
```

## 不同尺寸

通过 `size` 设置 `small` / `medium`（默认）/ `large`，未设置时跟随 `ExConfigProvider` 全局尺寸。

<div class="demo-container">
  <ExAlert
    type="info"
    size="small"
    title="小尺寸提示"
    show-icon
  />
  <ExAlert
    type="info"
    size="medium"
    title="中等尺寸提示"
    show-icon
  />
  <ExAlert
    type="info"
    size="large"
    title="大尺寸提示"
    show-icon
  />
</div>

```vue
<template>
  <ExAlert
    type="info"
    size="small"
    title="小尺寸提示"
    show-icon
  />
  <ExAlert
    type="info"
    size="medium"
    title="中等尺寸提示"
    show-icon
  />
  <ExAlert
    type="info"
    size="large"
    title="大尺寸提示"
    show-icon
  />
</template>
```

## 操作区域

通过 `action` 插槽在右侧放置操作按钮。

<div class="demo-container">
  <ExAlert type="warning" title="检测到新版本" description="建议立即更新以获取最新功能。" show-icon>
    <template #action>
      <ExButton size="small" type="primary">立即更新</ExButton>
    </template>
  </ExAlert>
</div>

```vue
<template>
  <ExAlert
    type="warning"
    title="检测到新版本"
    description="建议立即更新。"
    show-icon
  >
    <template #action>
      <ExButton
        size="small"
        type="primary"
      >
        立即更新
      </ExButton>
    </template>
  </ExAlert>
</template>
```

## 受控 / 非受控

`ExAlert` 是**非受控**组件：内部维护 `visible` 状态，点击关闭按钮或调用实例 `close()` 后即从 DOM 卸载，不接受 `v-model`。若需要重新显示，用外层 `v-if` 重新挂载：

```vue
<template>
  <ExAlert
    v-if="visible"
    type="warning"
    title="可关闭"
    closable
    @close="visible = false"
  />
  <ExButton
    v-if="!visible"
    @click="visible = true"
  >
    重新显示
  </ExButton>
</template>

<script setup>
import { ref } from 'vue';
const visible = ref(true);
</script>
```

> 需要在一段时间后自动消失的瞬时反馈，请使用 [Message](/components/message) 或 [Notification](/components/notification)，而不是 Alert。

## API

### Props

| 属性         | 说明                         | 类型                                          | 默认值       |
| ------------ | ---------------------------- | --------------------------------------------- | ------------ |
| type         | 类型                         | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'`     |
| size         | 尺寸                         | `'small' \| 'medium' \| 'large'`              | 跟随全局配置 |
| variant      | 视觉变体                     | `'standard' \| 'filled' \| 'outlined'`        | `'standard'` |
| title        | 标题                         | `string`                                      | —            |
| description  | 描述文本                     | `string`                                      | —            |
| show-icon    | 是否显示图标                 | `boolean`                                     | `true`       |
| closable     | 是否可关闭                   | `boolean`                                     | `false`      |
| close-text   | 关闭按钮文本（替代关闭图标） | `string`                                      | —            |
| center       | 文字是否居中                 | `boolean`                                     | `false`      |
| bordered     | 是否显示边框                 | `boolean`                                     | `true`       |
| icon         | 自定义图标图片 URL           | `string`                                      | —            |
| close-icon   | 自定义关闭图标图片 URL       | `string`                                      | —            |
| custom-class | 自定义类名                   | `string`                                      | —            |
| custom-style | 自定义内联样式               | `Record<string, string>`                      | —            |

### Events

| 事件名     | 说明               | 类型                          |
| ---------- | ------------------ | ----------------------------- |
| close      | 点击关闭按钮时触发 | `(event: MouseEvent) => void` |
| afterClose | 关闭动画结束后触发 | `() => void`                  |

### Slots

| 插槽名  | 说明                             |
| ------- | -------------------------------- |
| default | 自定义内容（覆盖 `description`） |
| title   | 自定义标题                       |
| icon    | 自定义图标                       |
| close   | 自定义关闭按钮内容               |
| action  | 右侧操作区域                     |

### 方法

通过模板引用（`ref`）调用：

| 方法名 | 说明     | 类型         |
| ------ | -------- | ------------ |
| close  | 关闭警告 | `() => void` |

## 主题定制

Alert 不定义独立的组件级 CSS 变量，而是直接消费 ExUI 全局设计令牌。定制有两种方式：

1. **覆盖全局令牌**（影响全站对应类型的颜色）：

```css
:root {
  --ex-color-success: #00d68f; /* success 类型主色 */
  --ex-color-warning: #ffaa00; /* warning 类型主色 */
  --ex-color-neon-blue-500: #29abe2; /* info 类型主色 */
  --ex-color-neon-pink-500: #ff2d78; /* error 类型主色 */
}
```

2. **局部定制**（只影响单个实例）：使用 `custom-class` / `custom-style`：

```vue
<ExAlert
  type="info"
  title="自定义"
  :custom-style="{ borderRadius: '12px' }"
  custom-class="my-alert"
/>
```

## 常见问题

**Q：为什么没有 `primary` 类型？**
`type` 仅支持 `info / success / warning / error`。需要品牌强调色时，使用 `variant="filled"` 配合 `custom-style` 自定义背景。

**Q：Alert 会自动消失吗？**
不会。Alert 用于页面中**常驻**、与上下文强相关的提示。需要几秒后自动消失的瞬时反馈，请用 [Message](/components/message) / [Notification](/components/notification)。

**Q：关闭后如何再次显示？**
组件关闭即从 DOM 卸载（非受控）。用外层 `v-if` 控制重新挂载，参见「受控 / 非受控」。

**Q：`close-text` 和 `close-icon` 能同时用吗？**
设置了 `close-text` 时显示文本、不再显示关闭图标；两者二选一。

## 最佳实践

- **选对反馈组件**：常驻提示用 Alert；瞬时反馈用 Message/Notification；需要用户确认才能继续用 [Dialog](/components/dialog) / [Popconfirm](/components/popconfirm)。
- **类型语义化**：`error/warning` 用于需要用户关注或处理的问题，`success/info` 用于结果反馈与说明，避免颜色误导。
- **变体节制**：`filled` 视觉权重高，整页只在最重要的一条上使用；信息密集场景优先 `standard` / `outlined`。
- **可关闭的提示务必处理 `close` 事件**，否则关闭后无法再次显示。

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
