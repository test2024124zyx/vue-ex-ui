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

<div class="demo-container">
  <ExCode :code="code" language="javascript" />
</div>

```vue
<ExCode :code="code" language="javascript" />
```

## 行号与行高亮

`highlight-lines` 接收行号数组或 `1,3-5` 格式的字符串，行号以 `start-line` 为基准。

<div class="demo-container">
  <ExCode
    :code="code"
    language="javascript"
    line-numbers
    :start-line="10"
    highlight-lines="10,12"
  />
</div>

```vue
<ExCode :code="code" language="javascript" line-numbers :start-line="10" highlight-lines="10,12" />
```

## 原位编辑

编辑模式支持 `v-model:code`、Tab 缩进、Shift+Tab 反缩进和多行选区。

<div class="demo-container">
  <ExCode v-model:code="code" language="javascript" line-numbers editable :tab-size="2" />
</div>

```vue
<ExCode v-model:code="code" language="javascript" line-numbers editable :tab-size="2" />
```

## 高度与换行

<div class="demo-container">
  <ExCode :code="longCode" language="javascript" line-numbers max-height="200px" wrap />
</div>

```vue
<ExCode :code="code" line-numbers max-height="200px" wrap />
```

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
| `code`            | 代码内容，支持 `v-model:code`          | `string`                      | `''`          |
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
