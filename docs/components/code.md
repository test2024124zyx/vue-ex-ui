# Code 代码块

用于安全展示或编辑代码，内置同步语法高亮、行号、指定行高亮与复制功能。

<script setup>
import { ref } from 'vue'

const code = ref(`function greet(name) {
  return \`Hello, \${name}!\`
}`)

const longCode = Array.from(
  { length: 24 },
  (_, index) => `const item${index + 1} = createItem(${index + 1})`
).join('\n')
</script>

## 基础用法

::: raw

<div class="vp-raw demo-container">
  <ex-code :code="code" language="javascript" />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const code = ref(`function greet(name) {
  return \`Hello, \${name}!\`
}`);
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-code
      :code="code"
      language="javascript"
    />
  </div>
</template>
```

:::

## 行号与行高亮

`highlight-lines` 接收行号数组或 `1,3-5` 格式的字符串，行号以 `start-line` 为基准。

::: raw

<div class="vp-raw demo-container">
  <ex-code
    :code="code"
    language="javascript"
    line-numbers
    :start-line="10"
    highlight-lines="10,12"
  />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const code = ref(`function greet(name) {
  return \`Hello, \${name}!\`
}`);
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-code
      :code="code"
      language="javascript"
      line-numbers
      :start-line="10"
      highlight-lines="10,12"
    />
  </div>
</template>
```

:::

## 原位编辑

编辑模式支持 `v-model:code`、Tab 缩进、Shift+Tab 反缩进和多行选区。按 Escape 后，下一次 Tab 或 Shift+Tab 会按浏览器原生焦点顺序离开编辑区；重新聚焦后恢复缩进操作。只读模式始终保留原生 Tab。在对话框内，第一次 Escape 进入退出状态，再次 Escape 交给父浮层处理。

传入 `code`（包括空字符串）时为严格受控模式：输入及缩进只发出更新请求，父级回写后才提交显示值；拒绝时恢复原生输入框和选区。未传 `code` 时内部维护内容，初始为空字符串。输入法组合期间保留临时草稿，结束后再请求提交；复制和 `getCode()` 始终读取已确认内容。

::: raw

<div class="vp-raw demo-container">
  <ex-code v-model:code="code" language="javascript" line-numbers editable :tab-size="2" />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const code = ref(`function greet(name) {
  return \`Hello, \${name}!\`
}`);
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-code
      v-model:code="code"
      language="javascript"
      line-numbers
      editable
      :tab-size="2"
    />
  </div>
</template>
```

:::

## 高度与换行

::: raw

<div class="vp-raw demo-container">
  <ex-code :code="longCode" language="javascript" line-numbers max-height="200px" wrap />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
const longCode = Array.from(
  { length: 24 },
  (_, index) => `const item${index + 1} = createItem(${index + 1})`
).join('\n');
</script>

<template>
  <div class="vp-raw demo-container">
    <ex-code
      :code="longCode"
      language="javascript"
      line-numbers
      max-height="200px"
      wrap
    />
  </div>
</template>
```

:::

## 文件名与自定义操作

```vue
<ExCode :code="code" language="typescript" filename="example.ts">
  <template #icon>
    <ExIcon icon="file-text-line" />
  </template>
  <template #actions>
    <button type="button">运行</button>
  </template>
</ExCode>
```

## API

### Props

| 属性              | 说明                                   | 类型                          | 默认值        |
| ----------------- | -------------------------------------- | ----------------------------- | ------------- |
| `code`            | 受控代码内容，支持 `v-model:code`      | `string`                      | `undefined`   |
| `language`        | 内置语法高亮语言                       | `CodeLanguage`                | `'plaintext'` |
| `theme`           | 代码块主题                             | `'dark' \| 'light' \| 'neon'` | `'neon'`      |
| `line-numbers`    | 是否显示行号                           | `boolean`                     | `false`       |
| `highlight-lines` | 高亮行号                               | `string \| readonly number[]` | —             |
| `start-line`      | 第一行显示的行号                       | `number`                      | `1`           |
| `copyable`        | 是否显示复制按钮                       | `boolean`                     | `true`        |
| `show-language`   | 是否显示语言标签                       | `boolean`                     | `true`        |
| `filename`        | 文件名                                 | `string`                      | —             |
| `max-height`      | 内容区最大高度                         | `string \| number`            | —             |
| `wrap`            | 是否自动换行                           | `boolean`                     | `false`       |
| `editable`        | 是否启用原位编辑                       | `boolean`                     | `false`       |
| `readonly`        | 编辑模式是否只读                       | `boolean`                     | `false`       |
| `tab-size`        | Tab 插入空格数及制表符宽度，范围 1～16 | `number`                      | `2`           |

### Events

| 事件名        | 说明                               | 类型                     |
| ------------- | ---------------------------------- | ------------------------ |
| `copy`        | 复制成功，参数为实际写入的代码快照 | `(code: string) => void` |
| `copy-error`  | 剪贴板写入失败                     | `(error: Error) => void` |
| `update:code` | 编辑内容实时更新                   | `(code: string) => void` |
| `change`      | 编辑内容发生变化                   | `(code: string) => void` |

### Slots

| 插槽名    | 说明               |
| --------- | ------------------ |
| `icon`    | 文件图标           |
| `actions` | 完整替换默认操作区 |

### Methods

| 方法名       | 说明                       | 类型                           |
| ------------ | -------------------------- | ------------------------------ |
| `getCode`    | 获取当前代码内容           | `() => string`                 |
| `copy`       | 复制当前代码并返回是否成功 | `() => Promise<boolean>`       |
| `getElement` | 获取根元素                 | `() => HTMLDivElement \| null` |

### CodeLanguage

`javascript`、`typescript`、`vue`、`html`、`xml`、`css`、`scss`、`json`、`bash`、`shell`、`python`、`java`、`cpp`、`csharp`、`go`、`rust`、`sql`、`markdown`、`yaml`、`plaintext`。

<style scoped>
.demo-container {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
