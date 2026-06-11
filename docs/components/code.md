# Code 代码

用于展示代码片段的组件，支持语法高亮、行号、复制等功能。

<ExCode language="python" code="def hello(name):
    print(f'Hello, {name}!')" show-language line-numbers :highlight-lines="[1]"/>

## API

### Code Props

| 属性              | 说明             | 类型                          | 默认值        |
| ----------------- | ---------------- | ----------------------------- | ------------- |
| `code`            | 代码内容         | `string`                      | `''`          |
| `language`        | 代码语言         | `CodeLanguage`                | `'plaintext'` |
| `theme`           | 代码主题         | `'dark' \| 'light' \| 'neon'` | `'neon'`      |
| `line-numbers`    | 是否显示行号     | `boolean`                     | `false`       |
| `highlight-lines` | 高亮的行号       | `string \| number[]`          | `undefined`   |
| `start-line`      | 起始行号         | `number`                      | `1`           |
| `copyable`        | 是否可复制       | `boolean`                     | `true`        |
| `show-language`   | 是否显示语言标签 | `boolean`                     | `true`        |
| `filename`        | 文件名           | `string`                      | `undefined`   |
| `max-height`      | 最大高度         | `string \| number`            | `undefined`   |
| `wrap`            | 是否自动换行     | `boolean`                     | `false`       |
| `readonly`        | 是否只读         | `boolean`                     | `false`       |

### Code Events

| 事件名 | 说明           | 类型                     |
| ------ | -------------- | ------------------------ |
| `copy` | 复制成功时触发 | `(code: string) => void` |

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

可以通过 CSS 变量自定义代码组件样式：

```css
:root {
  --ex-code-bg: var(--ex-color-bg-secondary);
  --ex-code-border-color: var(--ex-color-border-primary);
  --ex-code-text-color: var(--ex-color-text-primary);
  --ex-code-line-number-color: var(--ex-color-text-tertiary);
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
