# ExUI 双主题色彩参考

ExUI 的全局主题只有以下两个值：`neon-blue` 与 `light`。组件应优先使用语义化变量，让同一套结构在两个主题下保持一致。

## 赛博暗色：`neon-blue`

| 语义             | 值        | 用途                   |
| ---------------- | --------- | ---------------------- |
| primary          | `#29abe2` | 主操作、焦点、信息状态 |
| secondary        | `#a86bff` | 次级操作、渐变层次     |
| accent           | `#ff3bd1` | 重点装饰、强调状态     |
| bg-primary       | `#0b0f14` | 页面背景               |
| bg-secondary     | `#0f1720` | 控件和卡片背景         |
| bg-tertiary      | `#1a2332` | 浮层、悬停和选中背景   |
| text-primary     | `#e6f0ff` | 正文和标题             |
| text-secondary   | `#8fa3b8` | 辅助说明               |
| text-tertiary    | `#6b7d91` | 次要提示               |
| border-primary   | `#243447` | 默认边框               |
| border-secondary | `#2d4058` | 强调边框               |

## 赛博亮色：`light`

| 语义             | 值        | 用途                   |
| ---------------- | --------- | ---------------------- |
| primary          | `#1668dc` | 主操作、焦点、信息状态 |
| secondary        | `#6645c9` | 次级操作、渐变层次     |
| accent           | `#c2298a` | 重点装饰、强调状态     |
| bg-primary       | `#ffffff` | 页面背景               |
| bg-secondary     | `#f5f7fa` | 控件和卡片背景         |
| bg-tertiary      | `#eef1f5` | 浮层、悬停和选中背景   |
| text-primary     | `#1a2332` | 正文和标题             |
| text-secondary   | `#5a6b7d` | 辅助说明               |
| text-tertiary    | `#64748b` | 次要提示               |
| border-primary   | `#d9e0e8` | 默认边框               |
| border-secondary | `#c4cdd8` | 强调边框               |

## 使用语义变量

```scss
.panel {
  background: var(--ex-color-bg-elevated);
  color: var(--ex-color-text-primary);
  border: 1px solid var(--ex-color-border-primary);
}

.panel__hint {
  color: var(--ex-color-text-secondary);
}
```

不要在组件中直接写 `#0b0f14` 或 `#ffffff` 作为背景，因为这会使主题切换失去作用。

## 赛博纹理变量

```scss
.ex-app {
  background-image: var(--ex-gradient-bg);
}
```

暗色主题默认使用低透明度网格与扫描线；亮色主题保留更低强度的纹理。可通过以下变量在局部作用域微调：

```scss
.quiet-surface {
  --ex-cyber-grid-opacity: 0.015;
  --ex-cyber-scanline-opacity: 0;
}
```

## 状态颜色

状态颜色在两个主题中都使用同名变量：

```scss
--ex-color-success
--ex-color-warning
--ex-color-error
--ex-color-info
```

状态不能只通过颜色表达。表单错误、成功和警告还应提供文本、图标、边框或 `aria-invalid` 等辅助信息。

## 对比度与动效

- 正文和交互文字至少按 WCAG AA 目标检查；亮色主题的 tertiary 文本使用 `#64748b`，避免浅灰不可读。
- `prefers-contrast: more` 增强边框和焦点，不切换到第三个主题。
- `prefers-reduced-motion: reduce` 关闭扫描线、脉冲、闪烁和非必要过渡。
- 发光是装饰层，不应替代焦点环、选中状态或错误提示。
