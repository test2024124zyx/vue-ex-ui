# Menu 菜单

支持数据递归渲染与组合式插槽，提供水平、垂直和内联三种布局。

<script setup>
import { ref } from 'vue'

const activeKey = ref('overview')
const openKeys = ref(['workspace'])

const items = [
  { key: 'overview', label: '概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '工作区',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目' },
      {
        key: 'resources',
        label: '资源',
        children: [
          { key: 'documents', label: '文档' },
          { key: 'assets', label: '素材' }
        ]
      }
    ]
  },
  {
    key: 'guide',
    label: '开发指南',
    icon: 'book-line',
    href: 'https://example.com/guide',
    target: '_blank'
  },
  { key: 'disabled', label: '不可用', disabled: true }
]
</script>

## 数据菜单

`children` 可递归到任意深度。叶节点的 `href` 使用原生锚点导航；`target="_blank"` 会自动补充安全的 `rel`。

<div class="demo-block">
  <ExMenu
    v-model:active-key="activeKey"
    v-model:open-keys="openKeys"
    :items="items"
  />
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { MenuItem } from 'vue-ex-ui';

const activeKey = ref('overview');
const openKeys = ref(['workspace']);
const items: MenuItem[] = [
  { key: 'overview', label: '概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '工作区',
    children: [
      { key: 'projects', label: '项目' },
      {
        key: 'resources',
        label: '资源',
        children: [{ key: 'documents', label: '文档' }],
      },
    ],
  },
  {
    key: 'guide',
    label: '开发指南',
    href: 'https://example.com/guide',
    target: '_blank',
  },
];
</script>

<template>
  <ExMenu
    v-model:active-key="activeKey"
    v-model:open-keys="openKeys"
    :items="items"
  />
</template>
```

## 水平菜单

水平模式的子菜单通过浮层显示，左右方向键在顶层菜单项间移动。

<div class="demo-block demo-block--wide">
  <ExMenu
    v-model:active-key="activeKey"
    v-model:open-keys="openKeys"
    mode="horizontal"
    :items="items"
  />
</div>

```vue
<ExMenu
  v-model:active-key="activeKey"
  v-model:open-keys="openKeys"
  mode="horizontal"
  :items="items"
/>
```

## 搜索

数据模式会保留命中节点的祖先链；`search` 事件同步返回查询文本。

<div class="demo-block">
  <ExMenu
    v-model:active-key="activeKey"
    v-model:open-keys="openKeys"
    :items="items"
    searchable
  />
</div>

```vue
<ExMenu :items="items" searchable @search="query => trackMenuSearch(query)" />
```

## 组合式用法

<div class="demo-block">
  <ExMenu
    v-model:active-key="activeKey"
    v-model:open-keys="openKeys"
    mode="inline"
  >
    <ExMenuItem item-key="overview">
      <template #icon><ExIcon icon="dashboard-line" /></template>
      概览
    </ExMenuItem>

    <ExSubMenu item-key="workspace" title="工作区">
      <template #icon><ExIcon icon="folder-line" /></template>
      <ExMenuItem item-key="projects">项目</ExMenuItem>
      <ExMenuItem item-key="documents">文档</ExMenuItem>
    </ExSubMenu>

    <ExMenuItem
      item-key="guide"
      href="https://example.com/guide"
      target="_blank"
    >
      开发指南
    </ExMenuItem>

  </ExMenu>
</div>

```vue
<ExMenu v-model:active-key="activeKey" v-model:open-keys="openKeys" mode="inline">
  <ExMenuItem item-key="overview">概览</ExMenuItem>
  <ExSubMenu item-key="workspace" title="工作区">
    <ExMenuItem item-key="projects">项目</ExMenuItem>
    <ExMenuItem item-key="documents">文档</ExMenuItem>
  </ExSubMenu>
  <ExMenuItem
    item-key="guide"
    href="https://example.com/guide"
    target="_blank"
  >
    开发指南
  </ExMenuItem>
</ExMenu>
```

## 路由控制

需要由 Vue Router 决定导航时，不设置 `href`，在 `item-click` 中根据键调用路由器。

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MenuSelectInfo } from 'vue-ex-ui';

const router = useRouter();
const routes: Record<string, string> = {
  overview: '/overview',
  projects: '/projects',
};

const handleItemClick = ({ key }: MenuSelectInfo) => {
  const target = routes[key];
  if (target) router.push(target);
};
</script>

<template>
  <ExMenu
    :items="items"
    @item-click="handleItemClick"
  />
</template>
```

## ExMenu API

| 属性               | 说明                              | 类型                               | 默认值     |
| ------------------ | --------------------------------- | ---------------------------------- | ---------- |
| `mode`             | 布局模式                          | `horizontal \| vertical \| inline` | `vertical` |
| `activeKey`        | 受控激活键，支持 `v-model`        | `string`                           | —          |
| `defaultActiveKey` | 非受控初始激活键                  | `string`                           | —          |
| `openKeys`         | 受控展开键，支持 `v-model`        | `string[]`                         | —          |
| `defaultOpenKeys`  | 非受控初始展开键                  | `string[]`                         | `[]`       |
| `collapsed`        | 折叠内联菜单                      | `boolean`                          | `false`    |
| `selectable`       | 点击是否更新激活项并发出 `select` | `boolean`                          | `true`     |
| `items`            | 递归菜单数据                      | `MenuItem[]`                       | `[]`       |
| `searchable`       | 显示搜索输入并过滤数据            | `boolean`                          | `false`    |

### ExMenu 事件

| 事件名             | 参数                     |
| ------------------ | ------------------------ |
| `update:activeKey` | `(key: string)`          |
| `update:openKeys`  | `(keys: string[])`       |
| `select`           | `(info: MenuSelectInfo)` |
| `item-click`       | `(info: MenuSelectInfo)` |
| `open-change`      | `(keys: string[])`       |
| `search`           | `(query: string)`        |

`item-click` 无论 `selectable` 是否启用都会触发；`select` 仅在可选择时触发。

### ExMenu 暴露方法

| 方法名         | 类型                        |
| -------------- | --------------------------- |
| `getActiveKey` | `() => string \| undefined` |
| `getOpenKeys`  | `() => string[]`            |
| `setActiveKey` | `(key: string) => void`     |
| `setOpenKeys`  | `(keys: string[]) => void`  |
| `getElement`   | `() => HTMLElement \| null` |

## MenuItem 数据

| 字段             | 说明                    | 类型                |
| ---------------- | ----------------------- | ------------------- |
| `key`            | 全树唯一非空键          | `string`            |
| `label`          | 非空可访问标签          | `string`            |
| `icon`           | ExIcon 图标名或图片地址 | `string`            |
| `disabled`       | 是否禁用                | `boolean`           |
| `children`       | 子节点                  | `MenuItem[]`        |
| `href`           | 叶节点原生导航地址      | `string`            |
| `target`         | 原生浏览上下文          | `string`            |
| `rel`            | 原生链接关系            | `string`            |
| `popupPlacement` | 横向子菜单浮层位置      | `DropdownPlacement` |

含有非空 `children` 的节点不能同时声明链接字段；重复键、循环引用和空标签会在渲染前抛出 `TypeError`。

## ExMenuItem API

| 属性       | 类型      | 默认值  |
| ---------- | --------- | ------- |
| `itemKey`  | `string`  | 必填    |
| `disabled` | `boolean` | `false` |
| `href`     | `string`  | —       |
| `target`   | `string`  | —       |
| `rel`      | `string`  | —       |

插槽：`default`、`icon`。点击事件参数为 `(key: string, event: MouseEvent)`。

## ExSubMenu API

| 属性             | 类型                | 默认值         |
| ---------------- | ------------------- | -------------- |
| `itemKey`        | `string`            | 必填           |
| `title`          | `string`            | 必填           |
| `disabled`       | `boolean`           | `false`        |
| `popupPlacement` | `DropdownPlacement` | `bottom-start` |

事件：`title-click(key, event)`、`open-change(open)`。插槽：`default`、`icon`、`title`。

<style scoped>
.demo-block {
  padding: 16px;
  overflow: auto;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.demo-block--wide {
  min-height: 88px;
}
</style>
