# Grid 栅格布局

`ExGrid` 与 `ExGridItem` 提供 24 列响应式布局。每个断点都支持任意 0 至 24 的整数列数、偏移、推拉和安全整数顺序。

## 基础用法

<div class="demo-container">
  <ExGrid :gutter="16">
    <ExGridItem :span="8"><div class="grid-block">8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-block grid-block--strong">8</div></ExGridItem>
    <ExGridItem :span="8"><div class="grid-block">8</div></ExGridItem>
  </ExGrid>
</div>

```vue
<ExGrid :gutter="16">
  <ExGridItem :span="8">8</ExGridItem>
  <ExGridItem :span="8">8</ExGridItem>
  <ExGridItem :span="8">8</ExGridItem>
</ExGrid>
```

## 水平与垂直间距

```vue
<ExGrid :gutter="[16, 24]">
  <ExGridItem :span="12">A</ExGridItem>
  <ExGridItem :span="12">B</ExGridItem>
</ExGrid>
```

`gutter` 数组顺序为 `[水平, 垂直]`，也可使用 `xs`、`sm`、`md`、`lg`、`xl`，分别对应 4、8、16、24、32px。负数收敛到 0。嵌套 Grid 会显式重置自己的 gutter，不继承外层间距。

## 偏移、推拉与顺序

```vue
<ExGrid>
  <ExGridItem :span="7" :offset="3" :push="2" :order="2">A</ExGridItem>
  <ExGridItem :span="7" :pull="1" :order="1">B</ExGridItem>
</ExGrid>
```

- `offset` 占用布局空间。
- `push` 和 `pull` 使用相对定位，不改变其他栅格项占位。
- `order` 接受安全整数。
- `span="auto"` 平分剩余空间；`span="0"` 隐藏当前断点的栅格项。

## 响应式布局

```vue
<ExGrid :gutter="16">
  <ExGridItem
    :xs="24"
    :sm="12"
    :md="{ span: 7, offset: 1 }"
    :lg="{ span: 5, push: 1, order: -1 }"
  >
    响应式内容
  </ExGridItem>
</ExGrid>
```

| 属性  | 生效范围   |
| ----- | ---------- |
| `xs`  | `< 480px`  |
| `sm`  | `≥ 480px`  |
| `md`  | `≥ 768px`  |
| `lg`  | `≥ 1024px` |
| `xl`  | `≥ 1280px` |
| `xxl` | `≥ 1536px` |

断点值可以是 `span`，也可以是 `ResponsiveValue`。对象中未声明的字段会继承上一个较小断点，因此可以只覆盖需要变化的属性。所有断点配置都通过完整 CSS 变量生效，不要求使用特定倍数。

## 对齐与换行

```vue
<ExGrid justify="space-between" align="middle" :wrap="false">
  <ExGridItem :span="6">A</ExGridItem>
  <ExGridItem :span="6">B</ExGridItem>
</ExGrid>
```

## API

### Grid Props

| 属性      | 类型                                                                                  | 默认值    |
| --------- | ------------------------------------------------------------------------------------- | --------- |
| `gutter`  | `number \| [number, number] \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                  | `0`       |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` |
| `align`   | `'top' \| 'middle' \| 'bottom' \| 'stretch'`                                          | `'top'`   |
| `wrap`    | `boolean`                                                                             | `true`    |

### GridItem Props

| 属性     | 类型                          | 默认值 |
| -------- | ----------------------------- | ------ |
| `span`   | `number \| 'auto'`            | `24`   |
| `offset` | `number`                      | `0`    |
| `push`   | `number`                      | `0`    |
| `pull`   | `number`                      | `0`    |
| `order`  | `number`                      | `0`    |
| `xs`     | `GridSpan \| ResponsiveValue` | —      |
| `sm`     | `GridSpan \| ResponsiveValue` | —      |
| `md`     | `GridSpan \| ResponsiveValue` | —      |
| `lg`     | `GridSpan \| ResponsiveValue` | —      |
| `xl`     | `GridSpan \| ResponsiveValue` | —      |
| `xxl`    | `GridSpan \| ResponsiveValue` | —      |

### ResponsiveValue

```ts
interface ResponsiveValue {
  span?: number | 'auto';
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
}
```

`span`、`offset`、`push` 和 `pull` 会收敛到 0 至 24 的整数。非法 `span` 回退为 24，其他非法位置值回退为 0。两个组件都提供默认插槽，并把未声明的原生属性传递到根 `div`。

<style scoped>
.demo-container {
  margin: 16px 0;
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
}

.grid-block {
  padding: 16px 0;
  color: var(--ex-color-text-primary);
  text-align: center;
  background: var(--ex-color-primary-alpha-20);
  border-radius: var(--ex-radius-sm);
}

.grid-block--strong {
  background: var(--ex-color-primary-alpha-40);
}
</style>
