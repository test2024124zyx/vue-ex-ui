# List 列表

通用的列表组件，用于展示玩家列表、装备列表、任务列表等数据。

<script setup>
import { ref } from 'vue'

// 玩家列表数据
const players = ref([
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
    title: 'Player001',
    description: '等级 50 · 战力 9850',
    extra: '在线',
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
    title: 'Player002',
    description: '等级 48 · 战力 9520',
    extra: '在线',
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3',
    title: 'Player003',
    description: '等级 45 · 战力 9180',
    extra: '离线',
  },
  {
    key: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4',
    title: 'Player004',
    description: '等级 42 · 战力 8950',
    extra: '离线',
  },
])

// 装备列表数据
const equipment = ref([
  {
    key: 1,
    icon: 'https://api.iconify.design/ri/sword-line.svg',
    title: '烈焰之剑',
    description: '传说级武器 · 攻击力 +850',
    extra: '已装备',
  },
  {
    key: 2,
    icon: 'https://api.iconify.design/ri/shield-line.svg',
    title: '龙鳞护甲',
    description: '史诗级护甲 · 防御力 +920',
    extra: '已装备',
  },
  {
    key: 3,
    icon: 'https://api.iconify.design/ri/footprint-line.svg',
    title: '疾风之靴',
    description: '稀有级鞋子 · 速度 +120',
    extra: '未装备',
  },
])

// 任务列表数据
const tasks = ref([
  {
    key: 1,
    title: '击败终极Boss',
    description: '在地下城深处击败终极Boss',
    extra: '进行中',
  },
  {
    key: 2,
    title: '收集10个宝石',
    description: '在各个关卡中收集稀有宝石',
    extra: '已完成',
  },
  {
    key: 3,
    title: '达到50级',
    description: '将角色等级提升至50级',
    extra: '已完成',
  },
])

const loading = ref(false)

const handleItemClick = (item, index) => {
  console.log('点击了列表项:', item, index)
}
</script>

## 基础用法

最基础的列表用法。

<div class="demo-container">
  <ExList :data="tasks" @item-click="handleItemClick" />
</div>

```vue
<script setup>
import { ref } from 'vue'

const tasks = ref([
  {
    key: 1,
    title: '击败终极Boss',
    description: '在地下城深处击败终极Boss',
    extra: '进行中',
  },
  {
    key: 2,
    title: '收集10个宝石',
    description: '在各个关卡中收集稀有宝石',
    extra: '已完成',
  },
])

const handleItemClick = (item, index) => {
  console.log('点击了列表项:', item, index)
}
</script>

<template>
  <ExList :data="tasks" @item-click="handleItemClick" />
</template>
```

## 带图标

通过 `icon` 字段可以为列表项添加图标。

<div class="demo-container">
  <ExList :data="equipment" />
</div>

```vue
<script setup>
import { ref } from 'vue'

const equipment = ref([
  {
    key: 1,
    icon: 'https://api.iconify.design/ri/sword-line.svg',
    title: '烈焰之剑',
    description: '传说级武器 · 攻击力 +850',
    extra: '已装备',
  },
  {
    key: 2,
    icon: 'https://api.iconify.design/ri/shield-line.svg',
    title: '龙鳞护甲',
    description: '史诗级护甲 · 防御力 +920',
    extra: '已装备',
  },
])
</script>

<template>
  <ExList :data="equipment" />
</template>
```

## 带头像

通过 `avatar` 字段可以为列表项添加头像，适合展示玩家列表。

<div class="demo-container">
  <ExList :data="players" />
</div>

```vue
<script setup>
import { ref } from 'vue'

const players = ref([
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
    title: 'Player001',
    description: '等级 50 · 战力 9850',
    extra: '在线',
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2',
    title: 'Player002',
    description: '等级 48 · 战力 9520',
    extra: '在线',
  },
])
</script>

<template>
  <ExList :data="players" />
</template>
```

## 不同尺寸

通过 `size` 属性可以设置列表的尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Small</h4>
    <ExList :data="tasks.slice(0, 2)" size="small" bordered />
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Medium</h4>
    <ExList :data="tasks.slice(0, 2)" size="medium" bordered />
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">Large</h4>
    <ExList :data="tasks.slice(0, 2)" size="large" bordered />
  </div>
</div>

```vue
<template>
  <ExList :data="tasks" size="small" />
  <ExList :data="tasks" size="medium" />
  <ExList :data="tasks" size="large" />
</template>
```

## 带边框

通过 `bordered` 属性可以显示列表边框。

<div class="demo-container">
  <ExList :data="equipment" bordered />
</div>

```vue
<template>
  <ExList :data="equipment" bordered />
</template>
```

## 无分割线

设置 `split` 为 `false` 可以移除列表项之间的分割线。

<div class="demo-container">
  <ExList :data="tasks" :split="false" bordered />
</div>

```vue
<template>
  <ExList :data="tasks" :split="false" bordered />
</template>
```

## 禁用悬停效果

设置 `hoverable` 为 `false` 可以禁用悬停效果。

<div class="demo-container">
  <ExList :data="tasks" :hoverable="false" bordered />
</div>

```vue
<template>
  <ExList :data="tasks" :hoverable="false" bordered />
</template>
```

## 禁用状态

通过设置列表项的 `disabled` 属性可以禁用该项。

<div class="demo-container">
  <ExList 
    :data="[
      { key: 1, title: '正常项', description: '可以点击' },
      { key: 2, title: '禁用项', description: '无法点击', disabled: true },
      { key: 3, title: '正常项', description: '可以点击' },
    ]" 
    bordered 
  />
</div>

```vue
<template>
  <ExList 
    :data="[
      { key: 1, title: '正常项', description: '可以点击' },
      { key: 2, title: '禁用项', description: '无法点击', disabled: true },
    ]" 
    bordered 
  />
</template>
```

## 自定义插槽

可以通过插槽自定义列表项的各个部分。

<div class="demo-container">
  <ExList :data="players" bordered>
    <template #icon="{ item }">
      <img :src="item.avatar" alt="" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--ex-color-neon-blue-500);" />
    </template>
    <template #title="{ item }">
      <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">{{ item.title }}</span>
    </template>
    <template #extra="{ item }">
      <ExBadge 
        :count="item.extra" 
        :type="item.extra === '在线' ? 'success' : 'default'" 
      />
    </template>
  </ExList>
</div>

```vue
<template>
  <ExList :data="players" bordered>
    <template #icon="{ item }">
      <img :src="item.avatar" alt="" style="width: 48px; height: 48px; border-radius: 50%;" />
    </template>
    <template #title="{ item }">
      <span style="color: var(--ex-color-neon-blue-500);">{{ item.title }}</span>
    </template>
    <template #extra="{ item }">
      <ExBadge :count="item.extra" :type="item.extra === '在线' ? 'success' : 'default'" />
    </template>
  </ExList>
</template>
```

## 空数据

当列表数据为空时，会显示空状态。

<div class="demo-container">
  <ExList :data="[]" bordered />
</div>

```vue
<template>
  <ExList :data="[]" bordered />
</template>
```

## 自定义空状态

可以通过 `empty` 插槽自定义空状态。

<div class="demo-container">
  <ExList :data="[]" bordered>
    <template #empty>
      <div style="text-align: center; padding: 40px;">
        <img 
          src="https://api.iconify.design/ri/ghost-line.svg" 
          alt="空" 
          width="64" 
          height="64"
          style="opacity: 0.3; margin-bottom: 16px;"
        />
        <p style="margin: 0; color: var(--ex-color-text-tertiary);">没有找到任何数据</p>
      </div>
    </template>
  </ExList>
</div>

```vue
<template>
  <ExList :data="[]" bordered>
    <template #empty>
      <div style="text-align: center; padding: 40px;">
        <img src="..." alt="空" width="64" height="64" />
        <p>没有找到任何数据</p>
      </div>
    </template>
  </ExList>
</template>
```

## 加载状态

通过 `loading` 属性可以显示加载状态。

<div class="demo-container">
  <ExList :data="tasks" :loading="loading" bordered />
  <div style="margin-top: 16px;">
    <ExButton type="primary" @click="loading = !loading">
      {{ loading ? '停止加载' : '开始加载' }}
    </ExButton>
  </div>
</div>

```vue
<script setup>
import { ref } from 'vue'

const loading = ref(false)
const tasks = ref([...])
</script>

<template>
  <ExList :data="tasks" :loading="loading" bordered />
  <ExButton type="primary" @click="loading = !loading">
    {{ loading ? '停止加载' : '开始加载' }}
  </ExButton>
</template>
```

## 响应式设计

List 组件完全支持响应式设计，在移动端会自动调整间距和字体大小。

<div class="demo-container">
  <ExList :data="players" bordered />
</div>

::: tip 提示
- 在移动端，列表项的内边距和字体会自动缩小
- 头像大小会根据屏幕尺寸自动调整
- 建议在移动端使用 `small` 或 `medium` 尺寸
:::

## API

### List Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 列表数据 | `ListItem[]` | `[]` |
| `size` | 列表尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `bordered` | 是否显示边框 | `boolean` | `false` |
| `split` | 是否显示分割线 | `boolean` | `true` |
| `hoverable` | 是否可悬停 | `boolean` | `true` |
| `loading` | 是否加载中 | `boolean` | `false` |
| `empty-text` | 空数据文本 | `string` | `'暂无数据'` |
| `item-key` | 列表项的 key 字段名 | `string` | `'key'` |

### ListItem 数据结构

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `key` | 唯一标识 | `string \| number` | - |
| `title` | 标题 | `string` | - |
| `description` | 描述 | `string` | - |
| `icon` | 图标 URL | `string` | - |
| `avatar` | 头像 URL | `string` | - |
| `extra` | 额外内容 | `string` | - |
| `disabled` | 是否禁用 | `boolean` | `false` |

### List Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `item-click` | 列表项点击事件 | `(item: ListItem, index: number, event: MouseEvent) => void` |

### List Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `icon` | 自定义图标/头像 | `{ item: ListItem, index: number }` |
| `title` | 自定义标题 | `{ item: ListItem, index: number }` |
| `description` | 自定义描述 | `{ item: ListItem, index: number }` |
| `extra` | 自定义额外内容 | `{ item: ListItem, index: number }` |
| `empty` | 自定义空状态 | - |

### List Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取列表DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 支持键盘导航
- 支持屏幕阅读器
- 支持 `prefers-reduced-motion` 减少动画
- 支持高对比度模式

## 使用场景

- **玩家列表**：展示在线玩家、好友列表、排行榜等
- **装备列表**：展示背包物品、装备清单等
- **任务列表**：展示任务进度、成就列表等
- **消息列表**：展示聊天记录、系统通知等

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
