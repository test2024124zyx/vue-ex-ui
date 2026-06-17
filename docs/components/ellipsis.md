# Ellipsis 省略

用于单行或多行文本的截断显示，支持展开/收起与原生 tooltip。

## 基础用法

<div class="demo-container" style="max-width: 360px;">
  <ex-ellipsis>
    这是一段很长的文本，用于演示省略效果。当文本超过容器宽度或指定行数时，将显示省略号以保持界面整洁。
  </ex-ellipsis>
</div>

```vue
<template>
  <ex-ellipsis>
    这是一段很长的文本，用于演示省略效果。当文本超过容器宽度或指定行数时，将显示省略号以保持界面整洁。
  </ex-ellipsis>
</template>
```

## 多行省略

<div class="demo-container" style="max-width: 360px;">
  <ex-ellipsis :lines="2">
    多行省略示例：支持设置显示的最大行数，多余内容以省略号结尾。当文本超过容器宽度或指定行数时，将显示省略号以保持界面整洁。
  </ex-ellipsis>
</div>

```vue
<template>
  <ex-ellipsis :lines="2">
    多行省略示例...
  </ex-ellipsis>
</template>
```

## 展开/收起

<div class="demo-container" style="max-width: 360px;">
  <ex-ellipsis :lines="2" expandable>
    可展开/收起的省略文本，适用于较长段落的分段阅读体验。当文本超过容器宽度或指定行数时，将显示省略号以保持界面整洁。
  </ex-ellipsis>
</div>

```vue
<template>
  <ex-ellipsis :lines="2" expandable>
    可展开/收起的省略文本...
  </ex-ellipsis>
</template>
```

## Tooltip

<div class="demo-container" style="max-width: 360px;">
  <ex-ellipsis tooltip>
    开启 tooltip 后，hover 时显示完整内容的浏览器原生提示。
  </ex-ellipsis>
</div>

```vue
<template>
  <ex-ellipsis tooltip>内容...</ex-ellipsis>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| lines | 省略的行数 | `number` | `1` |
| expandable | 是否可展开/收起 | `boolean` | `false` |
| tooltip | hover 显示原生提示 | `boolean` | `true` |
| ariaLabel | 无障碍标签 | `string` | `''` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 文本内容 |

### Exposes

| 方法名 | 说明 |
| --- | --- |
| getElement | 获取根元素 |

## 主题定制

Ellipsis 跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

## 无障碍与国际化

- 对纯装饰省略不建议作为唯一的信息传递，应提供查看完整内容的交互（expandable）。
- 文本内容应走 i18n，不写死。