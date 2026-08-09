# Ellipsis 文本省略

用于单行或多行文本截断，并在真实溢出时提供展开控制或完整内容提示。组件是块级容器，适合列表摘要、卡片说明和表格辅助文本。

## 基础省略

::: raw

<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis>
    这是一段较长的业务摘要，内容超过容器宽度后会显示省略号，以保持列表和卡片布局整齐。
  </ex-ellipsis>
  <ex-ellipsis :lines="2" tooltip>
    多行文本可指定折叠状态下保留的行数。启用 tooltip 后，只有内容真实溢出时才会提供可悬停、可聚焦的完整内容提示。
  </ex-ellipsis>
</div>

:::

::: details 查看示例代码

```vue
<ex-ellipsis>
  这是一段较长的业务摘要，内容超过容器宽度后会显示省略号，以保持列表和卡片布局整齐。
</ex-ellipsis>
<ex-ellipsis :lines="2" tooltip>
  多行文本可指定折叠状态下保留的行数。启用 tooltip 后，只有内容真实溢出时才会提供可悬停、可聚焦的完整内容提示。
</ex-ellipsis>
```

:::

## 底部按钮

按钮模式在文本下方提供明确的展开/收起操作，适合需要较强操作提示的卡片和列表。

::: raw

<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis :lines="2" expandable expand-control="button">
    本季度新增企业客户 126 家，核心行业覆盖制造、零售与专业服务。续约率保持稳定，重点客户的交付节点均按计划推进。展开后可查看完整内容，再次操作即可收起。
  </ex-ellipsis>
</div>

:::

::: details 查看示例代码

```vue
<ex-ellipsis :lines="2" expandable expand-control="button">
  本季度新增企业客户 126 家，核心行业覆盖制造、零售与专业服务。续约率保持稳定，重点客户的交付节点均按计划推进。展开后可查看完整内容，再次操作即可收起。
</ex-ellipsis>
```

:::

## 行尾动态图标

行内模式将控制图标放在折叠文本末端，并随展开状态旋转。控件保留完整触控命中区，适合空间紧凑的摘要区域。

::: raw

<div class="vp-raw demo-container ellipsis-demo">
  <ex-ellipsis :lines="2" expandable expand-control="inline" aria-label="查看完整项目说明">
    项目已完成需求评审和技术验证，当前进入分阶段交付。首批功能预计本周发布，其余模块将在完成验收后依次上线，风险项和负责人已同步至项目工作台。
  </ex-ellipsis>
</div>

:::

::: details 查看示例代码

```vue
<ex-ellipsis :lines="2" expandable expand-control="inline" aria-label="查看完整项目说明">
  项目已完成需求评审和技术验证，当前进入分阶段交付。首批功能预计本周发布，其余模块将在完成验收后依次上线，风险项和负责人已同步至项目工作台。
</ex-ellipsis>
```

:::

## API

### Props

| 参数              | 说明                                               | 类型               | 默认值   |
| ----------------- | -------------------------------------------------- | ------------------ | -------- |
| `lines`           | 折叠状态保留的正整数行数，非法值回退为 `1`         | `number`           | `1`      |
| `expandable`      | 是否允许展开和收起                                 | `boolean`          | `false`  |
| `expandControl`   | 展开控制样式                                       | `button \| inline` | `button` |
| `tooltip`         | 真实溢出时是否启用可悬停、可聚焦的完整内容 Tooltip | `boolean`          | `true`   |
| `ariaLabel`       | 根分组的无障碍名称                                 | `string`           | —        |
| `expanded`        | 受控展开状态                                       | `boolean`          | —        |
| `defaultExpanded` | 非受控初始展开状态                                 | `boolean`          | `false`  |

`tooltip` 开启且发生真实溢出时，组件会为提示触发区域提供键盘焦点入口；可展开模式还会提供独立的原生按钮。动态插槽内容在更新后会自动重新测量，极少数外部布局变化也可以调用 `checkOverflow()` 主动复测。

组件默认使用项目的次级字体，可通过 `--ex-ellipsis-font-family` 覆盖字体族。组件根节点是块级分组，不建议直接嵌套在 `<p>` 或标题元素内部。

### Events

| 事件名            | 参数                  |
| ----------------- | --------------------- |
| `update:expanded` | `(expanded: boolean)` |
| `expand`          | `()`                  |
| `collapse`        | `()`                  |

### Slots

| 名称      | 说明     |
| --------- | -------- |
| `default` | 文本内容 |

### Exposes

| 方法            | 类型                        |
| --------------- | --------------------------- |
| `getElement`    | `() => HTMLElement \| null` |
| `checkOverflow` | `() => void`                |
| `expand`        | `() => void`                |
| `collapse`      | `() => void`                |
| `toggle`        | `() => void`                |
| `isExpanded`    | `() => boolean`             |

<style scoped>
.ellipsis-demo {
  display: grid;
  gap: 24px;
  max-width: 520px;
}
</style>
