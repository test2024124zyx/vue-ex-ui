# Menu 导航菜单

支持垂直、内联、水平和折叠导航。

<script setup>
import { ref } from 'vue'

const verticalActive = ref('overview')
const verticalOpen = ref(['workspace'])
const horizontalActive = ref('overview')
const horizontalOpen = ref([])
const composedActive = ref('projects')
const composedOpen = ref(['workspace'])
const collapsed = ref(false)
const collapsedActive = ref('overview')
const collapsedOpen = ref(['workspace'])

const items = [
  { key: 'overview', label: '经营概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '业务工作台',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目管理', icon: 'file-text-line' },
      {
        key: 'resources',
        label: '资源中心',
        icon: 'grid-line',
        children: [
          { key: 'documents', label: '企业文档' },
          { key: 'assets', label: '品牌资产' }
        ]
      }
    ]
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: 'user-line',
    children: [
      { key: 'accounts', label: '客户档案' },
      { key: 'opportunities', label: '销售机会' }
    ]
  },
  { key: 'reports', label: '数据报表', icon: 'table-line' },
  { key: 'disabled', label: '权限配置', disabled: true }
]
</script>

## 垂直菜单

::: raw
<div class="vp-raw demo-container menu-vertical-stage">
  <ex-menu
    v-model:active-key="verticalActive"
    v-model:open-keys="verticalOpen"
    :items="items"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-menu
    v-model:active-key="verticalActive"
    v-model:open-keys="verticalOpen"
    :items="items"
  />
</template>

<script setup>
import { ref } from 'vue';

const verticalActive = ref('overview');
const verticalOpen = ref(['workspace']);
const items = [
  { key: 'overview', label: '经营概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '业务工作台',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目管理', icon: 'file-text-line' },
      {
        key: 'resources',
        label: '资源中心',
        icon: 'grid-line',
        children: [
          { key: 'documents', label: '企业文档' },
          { key: 'assets', label: '品牌资产' },
        ],
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: 'user-line',
    children: [
      { key: 'accounts', label: '客户档案' },
      { key: 'opportunities', label: '销售机会' },
    ],
  },
  { key: 'reports', label: '数据报表', icon: 'table-line' },
  { key: 'disabled', label: '权限配置', disabled: true },
];
</script>
```

:::

父级箭头可重复展开和关闭；只有含有非空子项的节点显示箭头。

## 水平菜单

::: raw
<div class="vp-raw demo-container menu-horizontal-stage">
  <ex-menu
    v-model:active-key="horizontalActive"
    v-model:open-keys="horizontalOpen"
    mode="horizontal"
    :items="items"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-menu
    v-model:active-key="horizontalActive"
    v-model:open-keys="horizontalOpen"
    mode="horizontal"
    :items="items"
  />
</template>

<script setup>
import { ref } from 'vue';

const horizontalActive = ref('overview');
const horizontalOpen = ref([]);
const items = [
  { key: 'overview', label: '经营概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '业务工作台',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目管理', icon: 'file-text-line' },
      {
        key: 'resources',
        label: '资源中心',
        icon: 'grid-line',
        children: [
          { key: 'documents', label: '企业文档' },
          { key: 'assets', label: '品牌资产' },
        ],
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: 'user-line',
    children: [
      { key: 'accounts', label: '客户档案' },
      { key: 'opportunities', label: '销售机会' },
    ],
  },
  { key: 'reports', label: '数据报表', icon: 'table-line' },
  { key: 'disabled', label: '权限配置', disabled: true },
];
</script>
```

:::

## 组合式菜单

::: raw
<div class="vp-raw demo-container menu-vertical-stage">
  <ex-menu
    v-model:active-key="composedActive"
    v-model:open-keys="composedOpen"
    mode="inline"
  >
    <ex-menu-item item-key="overview">
      <template #icon><ex-icon icon="dashboard-line" /></template>
      经营概览
    </ex-menu-item>
    <ex-sub-menu item-key="workspace" title="业务工作台">
      <template #icon><ex-icon icon="folder-line" /></template>
      <ex-menu-item item-key="projects">项目管理</ex-menu-item>
      <ex-menu-item item-key="documents">企业文档</ex-menu-item>
    </ex-sub-menu>
    <ex-menu-item item-key="reports">数据报表</ex-menu-item>
  </ex-menu>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-menu
    v-model:active-key="composedActive"
    v-model:open-keys="composedOpen"
    mode="inline"
  >
    <ex-menu-item item-key="overview">
      <template #icon><ex-icon icon="dashboard-line" /></template>
      经营概览
    </ex-menu-item>
    <ex-sub-menu
      item-key="workspace"
      title="业务工作台"
    >
      <template #icon><ex-icon icon="folder-line" /></template>
      <ex-menu-item item-key="projects">项目管理</ex-menu-item>
      <ex-menu-item item-key="documents">企业文档</ex-menu-item>
    </ex-sub-menu>
    <ex-menu-item item-key="reports">数据报表</ex-menu-item>
  </ex-menu>
</template>

<script setup>
import { ref } from 'vue';

const composedActive = ref('projects');
const composedOpen = ref(['workspace']);
</script>
```

:::

## 折叠菜单

::: raw
<div class="vp-raw demo-container menu-collapse-demo">
  <ex-button type="secondary" size="small" @click="collapsed = !collapsed">
    {{ collapsed ? '展开菜单' : '折叠菜单' }}
  </ex-button>
  <div class="menu-collapse-stage">
    <ex-menu
      v-model:active-key="collapsedActive"
      v-model:open-keys="collapsedOpen"
      mode="inline"
      :items="items"
      :collapsed="collapsed"
    />
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button
    type="secondary"
    size="small"
    @click="collapsed = !collapsed"
  >
    {{ collapsed ? '展开菜单' : '折叠菜单' }}
  </ex-button>
  <div class="menu-collapse-stage">
    <ex-menu
      v-model:active-key="collapsedActive"
      v-model:open-keys="collapsedOpen"
      mode="inline"
      :items="items"
      :collapsed="collapsed"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const collapsed = ref(false);
const collapsedActive = ref('overview');
const collapsedOpen = ref(['workspace']);
const items = [
  { key: 'overview', label: '经营概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '业务工作台',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目管理', icon: 'file-text-line' },
      {
        key: 'resources',
        label: '资源中心',
        icon: 'grid-line',
        children: [
          { key: 'documents', label: '企业文档' },
          { key: 'assets', label: '品牌资产' },
        ],
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: 'user-line',
    children: [
      { key: 'accounts', label: '客户档案' },
      { key: 'opportunities', label: '销售机会' },
    ],
  },
  { key: 'reports', label: '数据报表', icon: 'table-line' },
  { key: 'disabled', label: '权限配置', disabled: true },
];
</script>
```

:::

## 搜索

::: raw
<div class="vp-raw demo-container menu-vertical-stage">
  <ex-menu
    v-model:active-key="verticalActive"
    v-model:open-keys="verticalOpen"
    :items="items"
    searchable
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-menu
    v-model:active-key="verticalActive"
    v-model:open-keys="verticalOpen"
    :items="items"
    searchable
  />
</template>

<script setup>
import { ref } from 'vue';

const verticalActive = ref('overview');
const verticalOpen = ref(['workspace']);
const items = [
  { key: 'overview', label: '经营概览', icon: 'dashboard-line' },
  {
    key: 'workspace',
    label: '业务工作台',
    icon: 'folder-line',
    children: [
      { key: 'projects', label: '项目管理', icon: 'file-text-line' },
      {
        key: 'resources',
        label: '资源中心',
        icon: 'grid-line',
        children: [
          { key: 'documents', label: '企业文档' },
          { key: 'assets', label: '品牌资产' },
        ],
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: 'user-line',
    children: [
      { key: 'accounts', label: '客户档案' },
      { key: 'opportunities', label: '销售机会' },
    ],
  },
  { key: 'reports', label: '数据报表', icon: 'table-line' },
  { key: 'disabled', label: '权限配置', disabled: true },
];
</script>
```

:::

## ExMenu API

### Props

| 参数               | 说明                          | 类型                               | 默认值     |
| ------------------ | ----------------------------- | ---------------------------------- | ---------- |
| `mode`             | 布局模式                      | `horizontal \| vertical \| inline` | `vertical` |
| `activeKey`        | 受控激活键，支持 `v-model`    | `string`                           | —          |
| `defaultActiveKey` | 非受控初始激活键              | `string`                           | —          |
| `openKeys`         | 受控展开键，支持 `v-model`    | `string[]`                         | —          |
| `defaultOpenKeys`  | 非受控初始展开键              | `string[]`                         | `[]`       |
| `collapsed`        | 是否折叠内联菜单              | `boolean`                          | `false`    |
| `selectable`       | 是否更新激活项并触发 `select` | `boolean`                          | `true`     |
| `items`            | 递归菜单数据                  | `MenuItem[]`                       | `[]`       |
| `searchable`       | 是否显示搜索输入              | `boolean`                          | `false`    |

### Events

| 事件名             | 参数                     |
| ------------------ | ------------------------ |
| `update:activeKey` | `(key: string)`          |
| `update:openKeys`  | `(keys: string[])`       |
| `select`           | `(info: MenuSelectInfo)` |
| `item-click`       | `(info: MenuSelectInfo)` |
| `open-change`      | `(keys: string[])`       |
| `search`           | `(query: string)`        |

### Exposes

| 方法           | 类型                        |
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
| `label`          | 可访问标签              | `string`            |
| `icon`           | ExIcon 内置名或图片地址 | `string`            |
| `disabled`       | 是否禁用                | `boolean`           |
| `children`       | 子节点                  | `MenuItem[]`        |
| `href`           | 叶节点原生导航地址      | `string`            |
| `target`         | 原生浏览上下文          | `string`            |
| `rel`            | 原生链接关系            | `string`            |
| `popupPlacement` | 水平子菜单浮层位置      | `DropdownPlacement` |

含有非空 `children` 的节点不能同时声明链接字段；重复键、循环引用和空标签会抛出 `TypeError`。

## ExMenuItem API

| 参数       | 类型      | 默认值  |
| ---------- | --------- | ------- |
| `itemKey`  | `string`  | 必填    |
| `disabled` | `boolean` | `false` |
| `href`     | `string`  | —       |
| `target`   | `string`  | —       |
| `rel`      | `string`  | —       |

插槽：`default`、`icon`。事件：`click(key, event)`。

## ExSubMenu API

| 参数             | 类型                | 默认值         |
| ---------------- | ------------------- | -------------- |
| `itemKey`        | `string`            | 必填           |
| `title`          | `string`            | 必填           |
| `disabled`       | `boolean`           | `false`        |
| `popupPlacement` | `DropdownPlacement` | `bottom-start` |

事件：`title-click(key, event)`、`open-change(open)`。插槽：`default`、`icon`、`title`。

<style scoped>
.menu-vertical-stage {
  max-width: 320px;
}

.menu-horizontal-stage {
  min-height: 220px;
  overflow: visible;
}

.menu-collapse-demo {
  display: grid;
  gap: 16px;
  justify-items: start;
}

.menu-collapse-stage {
  width: 300px;
}
</style>
