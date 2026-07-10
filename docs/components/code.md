# Code 代码

用于展示代码片段的组件，支持语法高亮、行号、行高亮、复制、原位编辑等功能。语法高亮由**内置的零依赖高亮引擎**实现，无需安装任何第三方库，开箱即用、同步渲染、无异步加载闪烁。

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

内置高亮引擎对关键字、字符串、数字、注释、函数等不同 token 着色，配色已对接主题变量。指定受支持的 `language` 即可获得稳定高亮，省略时按 `plaintext` 纯文本展示。高亮为**同步渲染**，不会出现「先纯文本后高亮」的闪烁。

<div class="demo-container">
  <ExCode :code="highlightDemo" language="javascript" line-numbers />
</div>

```vue
<template>
  <ExCode :code="code" language="javascript" line-numbers />
</template>
```

::: tip 安全性
高亮通过「分词 + 文本节点渲染」实现，代码内容始终被转义后输出，**绝不会把用户代码当作真实 HTML 执行**，从根上杜绝 XSS。组件不使用 `v-html`，也无需任何消毒库。
:::

支持的语言：`javascript`、`typescript`、`vue`、`html`、`xml`、`css`、`scss`、`json`、`bash`、`shell`、`python`、`java`、`cpp`、`csharp`、`go`、`rust`、`sql`、`markdown`、`yaml`、`plaintext`，并可识别 `js`/`ts`/`py`/`yml`/`md`/`c++`/`c#` 等常见别名。

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

默认超长行横向滚动（行号横向滚动时吸附在左侧）；设置 `wrap` 可自动换行。换行后**行号仍与代码逐行对齐**——每一行的行号与代码同处一行栅格，整行随内容增高。

<div class="demo-container">
  <ExCode
    code="const veryLongLine = 'this is a very long single line of code that would normally overflow horizontally and require scrolling to read'"
    language="javascript"
    line-numbers
    wrap
  />
</div>

```vue
<template>
  <ExCode :code="longLine" language="javascript" line-numbers wrap />
</template>
```

## 可编辑

设置 `editable` 开启原位编辑，支持 `v-model:code`。编辑时下方高亮层会实时跟随更新（透明 textarea 叠加在语法高亮之上，兼得「可编辑」与「高亮」）。按 <kbd>Tab</kbd> 缩进、<kbd>Shift</kbd>+<kbd>Tab</kbd> 反缩进，多行选区可整体增减缩进，缩进宽度由 `tab-size` 控制。

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
- 编辑态恒为软换行（不横向滚动），即使开启 `line-numbers` 也能保持行号与代码对齐。
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
| `tab-size`        | 编辑模式下 Tab 键插入的空格数       | `number`                      | `2`           |

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

- 根节点为 `role="group"`，并带有随当前语言变化的本地化 `aria-label`（跟随 `ConfigProvider` 语言）
- 复制按钮、编辑区均有本地化 `aria-label`；行号节点 `aria-hidden`，不干扰朗读
- 复制按钮、编辑区支持键盘聚焦与 `:focus-visible` 焦点环
- 遵循 `prefers-reduced-motion`（减少动画）与 `prefers-contrast: high`（高对比度）偏好

## 主题定制

代码组件跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，内置 `neon` / `dark` / `light` 三套代码主题。语法高亮由零依赖内置引擎实现，token 配色全部对接主题变量，无需任何第三方高亮库。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
