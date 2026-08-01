# Dropdown 下拉菜单

用于在触发控件附近展示一组操作。

<script setup>
const createDataIcon = path => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="${path}"/></svg>`
)}`

const editIcon = createDataIcon('M4 17.3V20h2.7L17.8 8.9l-2.7-2.7L4 17.3zm15.9-10.5a1 1 0 0 0 0-1.4l-1.3-1.3a1 1 0 0 0-1.4 0l-1.1 1.1 2.7 2.7 1.1-1.1z')
const copyIcon = createDataIcon('M8 8V3h13v13h-5v5H3V8h5zm2 0h6v6h3V5h-9v3zm4 2H5v9h9v-9z')
const archiveIcon = createDataIcon('M3 4h18v5h-1v11H4V9H3V4zm3 5v9h12V9H6zm-1-3v1h14V6H5zm4 6h6v2H9v-2z')
const deleteIcon = createDataIcon('M8 4V2h8v2h5v2H3V4h5zm-2 4h12l-1 14H7L6 8zm4 2v9h2v-9h-2zm4 0v9h2v-9h-2z')

const actionItems = [
  { key: 'edit', label: '编辑客户', icon: editIcon },
  { key: 'copy', label: '复制链接', icon: copyIcon },
  { key: 'archive', label: '归档记录', icon: archiveIcon, divided: true },
  { key: 'delete', label: '删除记录', icon: deleteIcon }
]

const placements = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end'
]
</script>

## 数据菜单

图标使用当前菜单文字颜色，在不同主题下保持可见。

::: raw
<div class="vp-raw demo-container dropdown-row">
  <ex-dropdown :items="actionItems" trigger="click" placement="bottom-start" aria-label="客户操作">
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="primary">
        客户操作
        <template #suffix><ex-icon icon="arrow-down-s-line" /></template>
      </ex-button>
    </template>
  </ex-dropdown>
</div>
:::

```vue
<ex-dropdown :items="items" trigger="click" @item-click="handleAction">
  <template #default="{ triggerProps }">
    <ex-button v-bind="triggerProps">客户操作</ex-button>
  </template>
</ex-dropdown>
```

## 触发方式

::: raw
<div class="vp-raw demo-container dropdown-row">
  <ex-dropdown :items="actionItems" trigger="hover">
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="default">悬停打开</ex-button>
    </template>
  </ex-dropdown>
  <ex-dropdown :items="actionItems" trigger="click">
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="secondary">点击打开</ex-button>
    </template>
  </ex-dropdown>
  <ex-dropdown :items="actionItems" trigger="contextmenu">
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="default">右键打开</ex-button>
    </template>
  </ex-dropdown>
</div>
:::

## 自定义菜单

::: raw
<div class="vp-raw demo-container dropdown-row">
  <ex-dropdown trigger="click" placement="bottom-end" :hide-on-click="false">
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="secondary">筛选条件</ex-button>
    </template>
    <template #menu>
      <ex-dropdown-item label="仅看进行中" />
      <ex-dropdown-item label="仅看我负责" />
      <ex-dropdown-item label="包含已归档" divided />
    </template>
  </ex-dropdown>
</div>
:::

## 弹出位置

此演示关闭自动翻转，因此标签与实际弹出方向保持一致。

::: raw
<div class="vp-raw demo-container dropdown-placement-stage">
  <ex-dropdown
    v-for="placement in placements"
    :key="placement"
    :items="actionItems.slice(0, 2)"
    trigger="click"
    :placement="placement"
    :flip="false"
    :hide-delay="0"
  >
    <template #default="{ triggerProps }">
      <ex-button v-bind="triggerProps" type="default" size="small">{{ placement }}</ex-button>
    </template>
  </ex-dropdown>
</div>
:::

```vue
<ex-dropdown placement="top-start" :flip="false">...</ex-dropdown>
<ex-dropdown placement="right-end" :flip="false">...</ex-dropdown>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `items` | 数据菜单项 | `DropdownItemData[]` | `[]` |
| `trigger` | 触发方式 | `hover \| click \| contextmenu` | `hover` |
| `placement` | 首选弹出位置 | `DropdownPlacement` | `bottom-start` |
| `disabled` | 是否禁止打开 | `boolean` | `false` |
| `visible` | 受控显示状态 | `boolean` | — |
| `ariaLabel` | 菜单无障碍名称 | `string` | — |
| `offset` | 弹层与触发器间距 | `number` | `8` |
| `matchTriggerWidth` | 是否匹配触发器宽度 | `boolean` | `false` |
| `flip` | 空间不足时是否自动翻转 | `boolean` | `true` |
| `viewportPadding` | 弹层与视口边缘安全距离 | `number` | `8` |
| `showDelay` | 悬停打开延迟 | `number` | `0` |
| `hideDelay` | 悬停关闭延迟 | `number` | `150` |
| `hideOnClick` | 选择菜单项后是否关闭 | `boolean` | `true` |
| `zIndex` | 自定义层级 | `number` | 全局层级 |

### DropdownItemData

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 唯一标识 | `string \| number` |
| `label` | 菜单项文本 | `string` |
| `icon` | 装饰图标地址 | `string` |
| `disabled` | 是否禁用 | `boolean` |
| `divided` | 是否显示上方分割线 | `boolean` |
| `data` | 随事件返回的业务数据 | `Record<string, unknown>` |

### Events

| 事件名 | 参数 |
| --- | --- |
| `item-click` | `(item: DropdownItemData)` |
| `update:visible` | `(visible: boolean)` |
| `show` | `()` |
| `hide` | `()` |

### Slots

| 名称 | 参数 |
| --- | --- |
| `default` | `{ open, disabled, triggerProps }` |
| `menu` | — |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `show` | `() => void` |
| `hide` | `() => void` |
| `updatePosition` | `() => void` |
| `getElement` | `() => HTMLDivElement \| null` |

<style scoped>
.dropdown-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.dropdown-placement-stage {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 92px 70px;
  padding: 150px 120px;
  overflow: visible;
}

@media (max-width: 760px) {
  .dropdown-placement-stage {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
    gap: 84px 48px;
    padding: 140px 80px;
  }
}
</style>
