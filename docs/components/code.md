# Code 代码

用于展示代码片段的组件，支持语法高亮、行号、行高亮、复制等功能。语法高亮基于可选依赖 `highlight.js`（按需动态加载，未安装时自动降级为纯文本）。

<script setup>
import { ref } from 'vue'

const jsCode = `function greet(name) {
  // 友好地问候
  const message = 'Hello, ' + name + '!'
  console.log(message)
  return message
}`

const tsCode = `interface User {
  id: number
  name: string
}

const users: User[] = [{ id: 1, name: 'Ada' }]
const findUser = (id: number): User | undefined =>
  users.find(u => u.id === id)`

const cssCode = `.ex-button {
  display: inline-flex;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--ex-color-primary);
}`

const bashCode = `# 安装依赖
npm install vue-ex-ui

# 启动开发服务
npm run dev`

const jsonCode = `{
  "name": "vue-ex-ui",
  "version": "1.0.0",
  "type": "module"
}`

const longCode = Array.from(
  { length: 24 },
  (_, i) => 'const item' + (i + 1) + ' = createItem(' + (i + 1) + ')'
).join('\n')

// 可编辑示例
const editableCode = ref(`function sum(a, b) {
  return a + b
}

console.log(sum(2, 3))`)

// 语法高亮展示（含关键字/字符串/数字/注释/函数等多种 token）
const highlightDemo = `// 用户服务：演示关键字、字符串、数字、注释的高亮
import { reactive } from 'vue'

class UserService {
  private users = reactive([])

  async fetch(id) {
    const res = await fetch(\`/api/users/\${id}\`)
    if (!res.ok) throw new Error('请求失败')
    const data = await res.json()
    this.users.push({ ...data, active: true, score: 99.5 })
    return data
  }
}`
</script>

## 基础用法

最简单的代码展示，默认带复制按钮与语言标签。

<div class="demo-container">
  <ExCode :code="jsCode" language="javascript" />
</div>

```vue
<template>
  <ExCode :code="jsCode" language="javascript" />
</template>
```

## 语法高亮

基于 `highlight.js` 自动着色：关键字、字符串、数字、注释、函数等不同 token 使用不同颜色，配色已对接主题变量。指定受支持的 `language` 可获得稳定高亮，省略时按 `plaintext` 纯文本展示。

<div class="demo-container">
  <ExCode :code="highlightDemo" language="javascript" line-numbers />
</div>

```vue
<template>
  <ExCode :code="code" language="javascript" line-numbers />
</template>
```

::: tip
语法高亮依赖可选依赖 `highlight.js`。请确保已安装：`npm i highlight.js`；未安装时组件会自动降级为纯文本展示（不报错）。
:::

## 显示行号

通过 `line-numbers` 显示行号，`start-line` 可设置起始行号。

<div class="demo-container">
  <ExCode :code="tsCode" language="typescript" line-numbers />
</div>

```vue
<template>
  <ExCode :code="tsCode" language="typescript" line-numbers />
</template>
```

## 行高亮

通过 `highlight-lines` 高亮指定行，支持数组或 `'1,3-5'` 形式的字符串。

<div class="demo-container">
  <ExCode :code="tsCode" language="typescript" line-numbers :highlight-lines="[1, 2, 3]" />
</div>

```vue
<template>
  <ExCode :code="code" language="typescript" line-numbers :highlight-lines="[1, 2, 3]" />
  <!-- 或字符串形式 -->
  <ExCode :code="code" line-numbers highlight-lines="1,3-5" />
</template>
```

## 带文件名

设置 `filename` 在头部显示文件名，可配合 `icon` 插槽自定义图标。

<div class="demo-container">
  <ExCode :code="cssCode" language="css" filename="button.css">
    <template #icon>
      <ExIcon icon="file-text-line" :size="14" />
    </template>
  </ExCode>
</div>

```vue
<template>
  <ExCode :code="cssCode" language="css" filename="button.css">
    <template #icon>
      <ExIcon icon="file-text-line" :size="14" />
    </template>
  </ExCode>
</template>
```

## 多语言

支持 JavaScript / TypeScript / CSS / Bash / JSON / Python 等多种语言。

<div class="demo-container">
  <ExCode :code="bashCode" language="bash" />
  <ExCode :code="jsonCode" language="json" />
</div>

```vue
<template>
  <ExCode :code="bashCode" language="bash" />
  <ExCode :code="jsonCode" language="json" />
</template>
```

## 最大高度与滚动

代码较长时用 `max-height` 限制高度，超出部分滚动。

<div class="demo-container">
  <ExCode :code="longCode" language="javascript" line-numbers max-height="200px" />
</div>

```vue
<template>
  <ExCode :code="longCode" language="javascript" line-numbers max-height="200px" />
</template>
```

## 自动换行

默认超长行横向滚动，设置 `wrap` 可自动换行。

<div class="demo-container">
  <ExCode
    code="const veryLongLine = 'this is a very long single line of code that would normally overflow horizontally and require scrolling to read'"
    language="javascript"
    wrap
  />
</div>

```vue
<template>
  <ExCode :code="longLine" language="javascript" wrap />
</template>
```

## 可编辑

设置 `editable` 开启原位编辑，支持 `v-model:code`。编辑时下方高亮层会实时跟随更新（透明 textarea 叠加在语法高亮之上，兼得「可编辑」与「高亮」）。

<div class="demo-container">
  <ExCode v-model:code="editableCode" language="javascript" line-numbers editable />
  <p style="margin: 12px 0 0; color: var(--ex-color-text-secondary); font-size: 13px;">
    当前 {{ editableCode.split('\n').length }} 行 / {{ editableCode.length }} 字符
  </p>
</div>

```vue
<script setup>
import { ref } from 'vue';

const editableCode = ref(`function sum(a, b) {
  return a + b
}`);
</script>

<template>
  <!-- v-model:code 双向绑定，editable 开启编辑 -->
  <ExCode v-model:code="editableCode" language="javascript" line-numbers editable />
</template>
```

::: tip

- 编辑区是叠加在语法高亮层之上的透明 `textarea`，因此**边输入边高亮**。
- 只读展示但仍想用编辑器外观时，可同时设置 `editable` 与 `readonly`。
  :::

## 精简模式

关闭语言标签与复制按钮，仅展示代码。

<div class="demo-container">
  <ExCode :code="cssCode" language="css" :show-language="false" :copyable="false" />
</div>

```vue
<template>
  <ExCode :code="code" :show-language="false" :copyable="false" />
</template>
```

## API

### Code Props

| 属性              | 说明                                | 类型                          | 默认值        |
| ----------------- | ----------------------------------- | ----------------------------- | ------------- |
| `code`            | 代码内容                            | `string`                      | `''`          |
| `language`        | 代码语言                            | `CodeLanguage`                | `'plaintext'` |
| `theme`           | 代码主题                            | `'dark' \| 'light' \| 'neon'` | `'neon'`      |
| `line-numbers`    | 是否显示行号                        | `boolean`                     | `false`       |
| `highlight-lines` | 高亮的行号                          | `string \| number[]`          | `undefined`   |
| `start-line`      | 起始行号                            | `number`                      | `1`           |
| `copyable`        | 是否可复制                          | `boolean`                     | `true`        |
| `show-language`   | 是否显示语言标签                    | `boolean`                     | `true`        |
| `filename`        | 文件名                              | `string`                      | `undefined`   |
| `max-height`      | 最大高度                            | `string \| number`            | `undefined`   |
| `wrap`            | 是否自动换行                        | `boolean`                     | `false`       |
| `editable`        | 是否可编辑（支持 `v-model:code`）   | `boolean`                     | `false`       |
| `readonly`        | 是否只读（`editable` 时仍禁止修改） | `boolean`                     | `false`       |

### Code Events

| 事件名        | 说明                           | 类型                     |
| ------------- | ------------------------------ | ------------------------ |
| `copy`        | 复制成功时触发                 | `(code: string) => void` |
| `update:code` | 代码内容更新（`v-model:code`） | `(code: string) => void` |
| `change`      | 代码内容变化                   | `(code: string) => void` |

### Code Slots

| 插槽名    | 说明           |
| --------- | -------------- |
| `icon`    | 文件图标       |
| `actions` | 自定义操作按钮 |

### Code Methods

| 方法名       | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `getCode`    | 获取代码内容    | `() => string`                 |
| `copy`       | 复制代码        | `() => Promise<void>`          |
| `getElement` | 获取组件DOM元素 | `() => HTMLDivElement \| null` |

### CodeLanguage 类型

```typescript
type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'vue'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'bash'
  | 'shell'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'sql'
  | 'markdown'
  | 'yaml'
  | 'xml'
  | 'plaintext';
```

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持屏幕阅读器
- 支持键盘导航
- 支持减少动画偏好设置

## 主题定制

代码组件跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配。语法高亮基于可选依赖 `highlight.js`（按需动态加载，未安装时降级为纯文本展示），token 配色已对接主题变量。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
