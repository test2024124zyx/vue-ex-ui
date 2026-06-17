# Menu 菜单

为页面和功能提供导航的菜单列表。采用赛博朋克风格设计，支持垂直、水平和内联模式，带有霓虹发光效果、流畅动画和完整的交互反馈。

<script setup>
import { ref } from 'vue'

const activeKey = ref('1')
const openKeys = ref(['sub1'])

const menuItems = [
  {
    key: '1',
    label: '首页',
    icon: 'https://api.iconify.design/ri/home-line.svg',
  },
  {
    key: 'sub1',
    label: '游戏中心',
    icon: 'https://api.iconify.design/ri/gamepad-line.svg',
    children: [
      { key: '2', label: '战术射击', icon: 'https://api.iconify.design/ri/crosshair-line.svg' },
      { key: '3', label: '赛车竞速', icon: 'https://api.iconify.design/ri/steering-2-line.svg' },
      { key: '4', label: '角色扮演', icon: 'https://api.iconify.design/ri/sword-line.svg' },
    ],
  },
  {
    key: 'sub2',
    label: '社区',
    icon: 'https://api.iconify.design/ri/team-line.svg',
    children: [
      { key: '5', label: '论坛', icon: 'https://api.iconify.design/ri/chat-3-line.svg' },
      { key: '6', label: '排行榜', icon: 'https://api.iconify.design/ri/trophy-line.svg' },
      { key: '7', label: '活动', icon: 'https://api.iconify.design/ri/calendar-event-line.svg' },
    ],
  },
  {
    key: '8',
    label: '商城',
    icon: 'https://api.iconify.design/ri/shopping-cart-line.svg',
  },
  {
    key: '9',
    label: '设置',
    icon: 'https://api.iconify.design/ri/settings-3-line.svg',
  },
]

const handleSelect = (key, item) => {
  console.log('Selected:', key, item)
}

const handleSearch = (query) => {
  console.log('Search:', query)
}
</script>

## 基础用法

最基础的垂直菜单。

<div class="demo-container">
  <ExMenu v-model:active-key="activeKey" @select="handleSelect">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心
    </ExMenuItem>
    <ExMenuItem item-key="3">
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      社区
    </ExMenuItem>
    <ExMenuItem item-key="4">
      <template #icon>
        <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="商城" width="20" height="20" />
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu v-model:active-key="activeKey" @select="handleSelect">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心
    </ExMenuItem>
    <ExMenuItem item-key="3">
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      社区
    </ExMenuItem>
    <ExMenuItem item-key="4">
      <template #icon>
        <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="商城" width="20" height="20" />
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
</template>

<script setup>
import { ref } from 'vue'

const activeKey = ref('1')

const handleSelect = (key, item) => {
  console.log('Selected:', key, item)
}
</script>
```

## 子菜单

带有子菜单的垂直菜单。

<div class="demo-container">
  <ExMenu v-model:active-key="activeKey" v-model:open-keys="openKeys">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExSubMenu item-key="sub1" title="游戏中心">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      <ExMenuItem item-key="2">
        <template #icon>
          <img src="https://api.iconify.design/ri/crosshair-line.svg" alt="射击" width="18" height="18" />
        </template>
        战术射击
      </ExMenuItem>
      <ExMenuItem item-key="3">
        <template #icon>
          <img src="https://api.iconify.design/ri/steering-2-line.svg" alt="赛车" width="18" height="18" />
        </template>
        赛车竞速
      </ExMenuItem>
      <ExMenuItem item-key="4">
        <template #icon>
          <img src="https://api.iconify.design/ri/sword-line.svg" alt="RPG" width="18" height="18" />
        </template>
        角色扮演
      </ExMenuItem>
    </ExSubMenu>
    <ExSubMenu item-key="sub2" title="社区">
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      <ExMenuItem item-key="5">
        <template #icon>
          <img src="https://api.iconify.design/ri/chat-3-line.svg" alt="论坛" width="18" height="18" />
        </template>
        论坛
      </ExMenuItem>
      <ExMenuItem item-key="6">
        <template #icon>
          <img src="https://api.iconify.design/ri/trophy-line.svg" alt="排行榜" width="18" height="18" />
        </template>
        排行榜
      </ExMenuItem>
    </ExSubMenu>
    <ExMenuItem item-key="8">
      <template #icon>
        <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="商城" width="20" height="20" />
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu v-model:active-key="activeKey" v-model:open-keys="openKeys">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExSubMenu item-key="sub1" title="游戏中心">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      <ExMenuItem item-key="2">战术射击</ExMenuItem>
      <ExMenuItem item-key="3">赛车竞速</ExMenuItem>
      <ExMenuItem item-key="4">角色扮演</ExMenuItem>
    </ExSubMenu>
  </ExMenu>
</template>
```

## 水平菜单

水平排列的菜单，适合顶部导航栏。

<div class="demo-container">
  <ExMenu mode="horizontal" v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心
    </ExMenuItem>
    <ExMenuItem item-key="3">
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      社区
    </ExMenuItem>
    <ExMenuItem item-key="4">
      <template #icon>
        <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="商城" width="20" height="20" />
      </template>
      商城
    </ExMenuItem>
    <ExMenuItem item-key="5">
      <template #icon>
        <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="设置" width="20" height="20" />
      </template>
      设置
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu mode="horizontal" v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2">游戏中心</ExMenuItem>
    <ExMenuItem item-key="3">社区</ExMenuItem>
    <ExMenuItem item-key="4">商城</ExMenuItem>
  </ExMenu>
</template>
```

## 水平子菜单（悬浮 Dropdown）

水平模式下，子菜单以悬浮弹层的形式显示，内容通过 Teleport 渲染到 body，避免被父容器裁切。层级跟随全局 z-index 策略（var(--ex-z-dropdown) + base 偏移）。

<div class="demo-container">
  <ExMenu mode="horizontal" v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExSubMenu item-key="more" title="更多">
      <ExMenuItem item-key="a">A</ExMenuItem>
      <ExMenuItem item-key="b">B</ExMenuItem>
      <ExMenuItem item-key="c">C</ExMenuItem>
    </ExSubMenu>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu mode="horizontal" v-model:active-key="activeKey">
    <ExSubMenu item-key="more" title="更多">
      <ExMenuItem item-key="a">A</ExMenuItem>
      <ExMenuItem item-key="b">B</ExMenuItem>
      <ExMenuItem item-key="c">C</ExMenuItem>
    </ExSubMenu>
  </ExMenu>
</template>
```

- 键盘交互（水平模式）：
  - Down / Right：打开子菜单并将焦点移动到第一个子项
  - Left / Esc：关闭子菜单并把焦点还给触发按钮
- 层级策略：
  - 使用 `z-index: calc(var(--ex-z-dropdown) - 1000 + var(--ex-z-index-base, 1000))`
  - 可通过 `ExConfigProvider` 的 `zIndex` 统一抬升所有弹层

```vue
<!-- 统一抬升弹层层级的示例 -->
<template>
  <ExConfigProvider :z-index="3000">
    <ExMenu mode="horizontal">
      <ExSubMenu item-key="more" title="更多">
        <ExMenuItem item-key="a">A</ExMenuItem>
        <ExMenuItem item-key="b">B</ExMenuItem>
      </ExSubMenu>
    </ExMenu>
  </ExConfigProvider>
</template>
```

## 使用数据驱动

通过 `items` 属性传入菜单数据。

<div class="demo-container">
  <ExMenu 
    v-model:active-key="activeKey" 
    v-model:open-keys="openKeys"
    :items="menuItems"
    @select="handleSelect"
  />
</div>

```vue
<template>
  <ExMenu 
    v-model:active-key="activeKey" 
    v-model:open-keys="openKeys"
    :items="menuItems"
    @select="handleSelect"
  />
</template>

<script setup>
import { ref } from 'vue'

const activeKey = ref('1')
const openKeys = ref(['sub1'])

const menuItems = [
  {
    key: '1',
    label: '首页',
    icon: 'https://api.iconify.design/ri/home-line.svg',
  },
  {
    key: 'sub1',
    label: '游戏中心',
    icon: 'https://api.iconify.design/ri/gamepad-line.svg',
    children: [
      { key: '2', label: '战术射击' },
      { key: '3', label: '赛车竞速' },
      { key: '4', label: '角色扮演' },
    ],
  },
  {
    key: '8',
    label: '商城',
    icon: 'https://api.iconify.design/ri/shopping-cart-line.svg',
  },
]

const handleSelect = (key, item) => {
  console.log('Selected:', key, item)
}
</script>
```

## 折叠菜单

内联模式下可以折叠菜单，只显示图标。

<div class="demo-container" style="display: flex; gap: 24px;">
  <ExMenu mode="inline" v-model:active-key="activeKey" v-model:open-keys="openKeys">
    <ExMenuItem item-key="1">
      <template #icon>
        <ex-icon src="https://api.iconify.design/ri/home-line.svg" color="#ffffff"/>
      </template>
      首页
    </ExMenuItem>
    <ExSubMenu item-key="sub1" title="游戏中心">
      <template #icon>
      <ex-icon src="https://api.iconify.design/ri/gamepad-line.svg" color="#ffffff"/>
      </template>
      <ExMenuItem item-key="2">战术射击</ExMenuItem>
      <ExMenuItem item-key="3">赛车竞速</ExMenuItem>
    </ExSubMenu>
    <ExMenuItem item-key="8">
      <template #icon>
      <ex-icon src="https://api.iconify.design/ri/shopping-cart-line.svg" color="#ffffff"/>
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
  <ExMenu mode="inline" collapsed v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
      <ex-icon src="https://api.iconify.design/ri/home-line.svg" color="#ffffff"/>
      </template>
      首页
    </ExMenuItem>
    <ExSubMenu item-key="sub1" title="游戏中心">
      <template #icon>
      <ex-icon src="https://api.iconify.design/ri/gamepad-line.svg" color="#ffffff"/>
      </template>
      <ExMenuItem item-key="2">战术射击</ExMenuItem>
      <ExMenuItem item-key="3">赛车竞速</ExMenuItem>
    </ExSubMenu>
    <ExMenuItem item-key="8">
      <template #icon>
      <ex-icon src="https://api.iconify.design/ri/shopping-cart-line.svg" color="#ffffff"/>
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <!-- 展开状态 -->
  <ExMenu mode="inline" v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
  </ExMenu>
  
  <!-- 折叠状态 -->
  <ExMenu mode="inline" collapsed v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
  </ExMenu>
</template>
```

## 禁用菜单项

禁用某些菜单项。

<div class="demo-container">
  <ExMenu v-model:active-key="activeKey">
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2" disabled>
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心（维护中）
    </ExMenuItem>
    <ExSubMenu item-key="sub1" title="社区" disabled>
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      <ExMenuItem item-key="3">论坛</ExMenuItem>
      <ExMenuItem item-key="4">排行榜</ExMenuItem>
    </ExSubMenu>
    <ExMenuItem item-key="5">
      <template #icon>
        <img src="https://api.iconify.design/ri/shopping-cart-line.svg" alt="商城" width="20" height="20" />
      </template>
      商城
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu v-model:active-key="activeKey">
    <ExMenuItem item-key="1">首页</ExMenuItem>
    <ExMenuItem item-key="2" disabled>游戏中心（维护中）</ExMenuItem>
    <ExSubMenu item-key="sub1" title="社区" disabled>
      <ExMenuItem item-key="3">论坛</ExMenuItem>
      <ExMenuItem item-key="4">排行榜</ExMenuItem>
    </ExSubMenu>
  </ExMenu>
</template>
```

## 搜索菜单

支持搜索功能，快速定位菜单项。

<div class="demo-container">
  <ExMenu 
    searchable
    v-model:active-key="activeKey"
    :items="menuItems"
    @search="handleSearch"
  />
</div>

```vue
<template>
  <ExMenu 
    searchable
    v-model:active-key="activeKey"
    :items="menuItems"
    @search="handleSearch"
  />
</template>

<script setup>
import { ref } from 'vue'

const activeKey = ref('1')
const menuItems = [
  { key: '1', label: '首页', icon: 'https://api.iconify.design/ri/home-line.svg' },
  { key: '2', label: '游戏中心', icon: 'https://api.iconify.design/ri/gamepad-line.svg' },
  { key: '3', label: '社区', icon: 'https://api.iconify.design/ri/team-line.svg' },
]

const handleSearch = (query) => {
  console.log('Search:', query)
  // 可以在这里实现自定义搜索逻辑
}
</script>
```

## 路由集成

菜单支持路由跳转，可以与 Vue Router 无缝集成。

<div class="demo-container">
  <ExMenu v-model:active-key="activeKey">
    <ExMenuItem item-key="1" path="/home">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2" path="/games">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心
    </ExMenuItem>
    <ExMenuItem item-key="3" path="https://github.com">
      <template #icon>
        <img src="https://api.iconify.design/ri/github-line.svg" alt="GitHub" width="20" height="20" />
      </template>
      GitHub（外部链接）
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu v-model:active-key="activeKey">
    <!-- 内部路由 -->
    <ExMenuItem item-key="1" path="/home">首页</ExMenuItem>
    <ExMenuItem item-key="2" path="/games">游戏中心</ExMenuItem>
    
    <!-- 外部链接（自动在新窗口打开） -->
    <ExMenuItem item-key="3" path="https://github.com">GitHub</ExMenuItem>
  </ExMenu>
</template>

<script setup>
import { ref } from 'vue'

const activeKey = ref('1')
</script>
```

### 与 Vue Router 集成

如果你使用 Vue Router，可以这样集成：

```vue
<template>
  <ExMenu v-model:active-key="activeKey" @select="handleSelect">
    <ExMenuItem item-key="home" path="/home">首页</ExMenuItem>
    <ExMenuItem item-key="about" path="/about">关于</ExMenuItem>
    <ExSubMenu item-key="products" title="产品">
      <ExMenuItem item-key="product-1" path="/products/1">产品 1</ExMenuItem>
      <ExMenuItem item-key="product-2" path="/products/2">产品 2</ExMenuItem>
    </ExSubMenu>
  </ExMenu>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeKey = ref('home')

// 根据当前路由设置激活项
watch(() => route.path, (path) => {
  // 根据路径匹配对应的 key
  if (path === '/home') activeKey.value = 'home'
  else if (path === '/about') activeKey.value = 'about'
  else if (path.startsWith('/products/')) {
    activeKey.value = path === '/products/1' ? 'product-1' : 'product-2'
  }
}, { immediate: true })

const handleSelect = (key, item) => {
  // 使用 router.push 进行路由跳转
  if (item.path && !item.path.startsWith('http')) {
    router.push(item.path)
  }
}
</script>
```

## 响应式菜单

菜单支持响应式布局，在移动端自动适配。

<div class="demo-container">
  <ExMenu 
    mode="vertical" 
    responsive 
    :breakpoint="768"
    v-model:active-key="activeKey"
  >
    <ExMenuItem item-key="1">
      <template #icon>
        <img src="https://api.iconify.design/ri/home-line.svg" alt="首页" width="20" height="20" />
      </template>
      首页
    </ExMenuItem>
    <ExMenuItem item-key="2">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="20" height="20" />
      </template>
      游戏中心
    </ExMenuItem>
    <ExMenuItem item-key="3">
      <template #icon>
        <img src="https://api.iconify.design/ri/team-line.svg" alt="社区" width="20" height="20" />
      </template>
      社区
    </ExMenuItem>
  </ExMenu>
</div>

```vue
<template>
  <ExMenu 
    mode="vertical" 
    responsive 
    :breakpoint="768"
    v-model:active-key="activeKey"
  >
    <ExMenuItem item-key="1">首页</ExMenuItem>
    <ExMenuItem item-key="2">游戏中心</ExMenuItem>
    <ExMenuItem item-key="3">社区</ExMenuItem>
  </ExMenu>
</template>
```

## API

### Menu Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `mode` | 菜单模式 | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` |
| `active-key` | 当前激活的菜单项 key (v-model) | `string` | `undefined` |
| `default-active-key` | 默认激活的菜单项 key | `string` | `undefined` |
| `open-keys` | 当前展开的子菜单 key 数组 (v-model) | `string[]` | `[]` |
| `default-open-keys` | 默认展开的子菜单 key 数组 | `string[]` | `[]` |
| `collapsed` | 是否折叠（仅 inline 模式有效） | `boolean` | `false` |
| `selectable` | 是否可选择 | `boolean` | `true` |
| `responsive` | 是否响应式（移动端自动适配） | `boolean` | `false` |
| `breakpoint` | 响应式断点（像素） | `number` | `768` |
| `searchable` | 是否显示搜索框 | `boolean` | `false` |
| `items` | 菜单数据 | `MenuItem[]` | `undefined` |

### Menu Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `update:activeKey` | 激活菜单项变化时触发 | `(key: string) => void` |
| `update:openKeys` | 展开的子菜单变化时触发 | `(keys: string[]) => void` |
| `select` | 选择菜单项时触发 | `(key: string, item: MenuItem) => void` |
| `click` | 点击菜单项时触发 | `(key: string, item: MenuItem) => void` |
| `openChange` | 子菜单展开/收起时触发 | `(openKeys: string[]) => void` |
| `search` | 搜索框输入时触发 | `(query: string) => void` |

### Menu Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getActiveKey` | 获取当前激活的菜单项 key | `() => string \| undefined` |
| `getOpenKeys` | 获取当前展开的子菜单 key 数组 | `() => string[]` |
| `setActiveKey` | 设置激活的菜单项 key | `(key: string) => void` |
| `setOpenKeys` | 设置展开的子菜单 key 数组 | `(keys: string[]) => void` |
| `getElement` | 获取菜单 DOM 元素 | `() => HTMLElement \| null` |

### Menu Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 菜单内容 |

### MenuItem Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `item-key` | 菜单项唯一标识 | `string` | - |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `path` | 路径（用于路由） | `string` | `undefined` |

### MenuItem Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `click` | 点击菜单项时触发 | `(key: string) => void` |

### MenuItem Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 菜单项内容 |
| `icon` | 菜单项图标 |

### SubMenu Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `item-key` | 子菜单唯一标识 | `string` | - |
| `title` | 子菜单标题 | `string` | - |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `popup-placement` | 弹出位置（horizontal 模式下有效） | `DropdownPlacement`（`'bottom-start'`、`'right-start'` 等 12 种） | `'bottom-start'` |

### SubMenu Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `titleClick` | 点击子菜单标题时触发 | `(key: string) => void` |
| `openChange` | 展开/收起时触发 | `(open: boolean) => void` |

### SubMenu Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 子菜单内容 |
| `title` | 子菜单标题 |
| `icon` | 子菜单图标 |

### MenuItem 数据类型

```typescript
interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: MenuItem[];
  path?: string;
  [key: string]: unknown;
}
```

## 特性说明

### 图标颜色自适应

菜单组件会自动将图标转换为主题色，无需手动设置图标颜色：

- **默认状态**：淡蓝灰色
- **悬停状态**：霓虹蓝色增强
- **激活状态**：强烈霓虹蓝色发光

### 键盘导航

支持完整的键盘导航：

- **Enter / Space**：选择菜单项
- **ArrowUp / ArrowDown**：在菜单项间导航
- **Home**：跳转到第一项
- **End**：跳转到最后一项

### 路由支持

MenuItem 支持 `path` 属性，自动处理路由跳转：

- **外部链接**（http/https）：自动在新窗口打开
- **内部路由**：使用 hash 导航（可配合 Vue Router）
- **相对路径**：支持相对路径跳转

```vue
<!-- 内部路由 -->
<ExMenuItem item-key="1" path="/home">首页</ExMenuItem>
<ExMenuItem item-key="2" path="/about">关于</ExMenuItem>

<!-- 外部链接 -->
<ExMenuItem item-key="3" path="https://example.com">外部链接</ExMenuItem>

<!-- 相对路径 -->
<ExMenuItem item-key="4" path="./detail">详情</ExMenuItem>
```

**路由跳转逻辑：**
1. 检测到 `http://` 或 `https://` 开头的链接，使用 `window.open()` 在新窗口打开
2. 其他路径使用 `window.location.hash` 进行 hash 导航
3. 可以监听 `select` 事件自定义路由跳转逻辑（如使用 Vue Router）

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持完整键盘导航
- 支持屏幕阅读器
- 支持减少动画偏好设置
- 禁止文字选中，提升交互体验

## 主题定制

菜单组件使用全局主题系统，会自动跟随全局主题变化。可以通过 CSS 变量进一步自定义：

```css
:root {
  /* 菜单背景和边框 */
  --ex-color-bg-primary: #0b0f14;
  --ex-color-neon-blue-alpha-30: rgba(41, 171, 226, 0.3);
  
  /* 菜单项颜色 */
  --ex-color-white-alpha-70: rgba(255, 255, 255, 0.7);
  --ex-color-neon-blue-500: #29abe2;
  
  /* 悬停和激活效果 */
  --ex-color-neon-blue-alpha-15: rgba(41, 171, 226, 0.15);
  --ex-color-neon-pink-alpha-10: rgba(255, 59, 209, 0.1);
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
