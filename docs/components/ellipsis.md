# Ellipsis 文本省略

用于单行或多行文本截断，并在真实溢出时提供展开控制。

## 基础省略

::: raw
<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis>
    这是一段较长的业务摘要，内容超过容器宽度后会显示省略号，以保持列表和卡片布局整齐。
  </ex-ellipsis>
  <ex-ellipsis :lines="2" tooltip>
    多行文本可指定折叠状态下保留的行数。启用 tooltip 后，只有内容真实溢出时才会提供浏览器原生完整内容提示。
  </ex-ellipsis>
</div>
:::

```vue
<ex-ellipsis :lines="2" tooltip>较长的业务摘要……</ex-ellipsis>
```

## 底部按钮

::: raw
<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis :lines="2" expandable expand-control="button">
    本季度新增企业客户 126 家，核心行业覆盖制造、零售与专业服务。续约率保持稳定，重点客户的交付节点均按计划推进。展开后可查看完整内容，再次操作即可收起。
  </ex-ellipsis>
</div>
:::

```vue
<ex-ellipsis :lines="2" expandable expand-control="button">
  可展开的长文本内容
</ex-ellipsis>
```

## 行尾动态图标

行内模式将控制图标放在折叠文本最后一行末端，并随展开状态旋转。

::: raw
<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis :lines="2" expandable expand-control="inline" aria-label="查看完整项目说明">
    项目已完成需求评审和技术验证，当前进入分阶段交付。首批功能预计本周发布，其余模块将在完成验收后依次上线，风险项和负责人已同步至项目工作台。
  </ex-ellipsis>
</div>
:::

```vue
<ex-ellipsis :lines="2" expandable expand-control="inline">
  可展开的长文本内容
</ex-ellipsis>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `lines` | 折叠状态保留的完整行数 | `number` | `1` |
| `expandable` | 是否允许展开和收起 | `boolean` | `false` |
| `expandControl` | 展开控制样式 | `button \| inline` | `button` |
| `tooltip` | 真实溢出时是否设置原生 `title` | `boolean` | `true` |
| `ariaLabel` | 根分组的无障碍名称 | `string` | — |
| `expanded` | 受控展开状态 | `boolean` | — |
| `defaultExpanded` | 非受控初始展开状态 | `boolean` | `false` |

### Events

| 事件名 | 参数 |
| --- | --- |
| `update:expanded` | `(expanded: boolean)` |
| `expand` | `()` |
| `collapse` | `()` |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 文本内容 |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `getElement` | `() => HTMLElement \| null` |
| `checkOverflow` | `() => void` |
| `expand` | `() => void` |
| `collapse` | `() => void` |
| `toggle` | `() => void` |
| `isExpanded` | `() => boolean` |

<style scoped>
.ellipsis-demo {
  display: grid;
  gap: 24px;
  max-width: 520px;
}
</style>
