# VirtualList 虚拟列表

高性能虚拟滚动列表组件，适用于大数据量场景。

<script setup>
import { ref } from 'vue'

// 基础用法数据
const basicData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Item ${i + 1}`,
    value: i
  }))
)

// 动态高度数据
const dynamicData = ref(
  Array.from({ length: 500 }, (_, i) => ({
    key: i,
    title: `Dynamic Item ${i + 1}`,
    content: i % 3 === 0 
      ? 'Short content' 
      : i % 3 === 1 
        ? 'Medium content with more text to display in the list item'
        : 'Long content with even more text to demonstrate dynamic height calculation and rendering performance in virtual scrolling scenarios'
  }))
)

const getDynamicHeight = (index, item) => {
  const baseHeight = 60
  const contentLength = item.content.length
  return baseHeight + Math.floor(contentLength / 50) * 20
}

// 滚动控制数据
const scrollData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Scroll Item ${i + 1}`
  }))
)

const virtualListRef = ref()

const scrollToTop = () => {
  virtualListRef.value?.scrollToTop()
}

const scrollToBottom = () => {
  virtualListRef.value?.scrollToBottom()
}

const scrollToIndex = (index) => {
  virtualListRef.value?.scrollToIndex(index, 'smooth')
}

const scrollToMiddle = () => {
  scrollToIndex(500)
}

// 滚动事件数据
const eventData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Event Item ${i + 1}`
  }))
)

const scrollInfo = ref({
  scrollTop: 0,
  isTop: true,
  isBottom: false
})

const visibleRange = ref({
  startIndex: 0,
  endIndex: 0,
  visibleCount: 0
})

const eventListRef = ref()

const handleScroll = (info) => {
  scrollInfo.value = {
    scrollTop: Math.round(info.scrollTop),
    isTop: info.isTop,
    isBottom: info.isBottom
  }
  
  // 获取可见范围
  if (eventListRef.value) {
    visibleRange.value = eventListRef.value.getVisibleRange()
  }
}

const handleReachTop = () => {
  console.log('Reached top!')
}

const handleReachBottom = () => {
  console.log('Reached bottom!')
}

// 自定义样式数据
const styledData = ref(
  Array.from({ length: 500 }, (_, i) => ({
    key: i,
    label: `Styled Item ${i + 1}`,
    type: ['primary', 'success', 'warning', 'danger'][i % 4]
  }))
)

const getItemColor = (type) => {
  const colors = {
    primary: 'var(--ex-color-primary)',
    success: 'var(--ex-color-success)',
    warning: 'var(--ex-color-warning)',
    danger: 'var(--ex-color-danger)'
  }
  return colors[type] || colors.primary
}

// 小数据量示例
const smallData = ref(
  Array.from({ length: 20 }, (_, i) => ({
    key: i,
    label: `Small List Item ${i + 1}`
  }))
)
</script>

## 基础用法

展示 1000 条数据的虚拟滚动列表，流畅的赛博朋克风格交互效果。

<div class="demo-container">
  <ExVirtualList
    :data-source="basicData"
    :height="400"
    :item-height="70"
  >
    <template #default="{ item, index }">
      <div style="padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 4px; height: 32px; background: linear-gradient(to bottom, var(--ex-color-neon-blue-500), var(--ex-color-secondary)); border-radius: 2px; opacity: 0.3;"></div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--ex-color-text-primary); font-family: var(--ex-font-secondary);">{{ item.label }}</div>
          <div style="font-size: 12px; color: var(--ex-color-text-tertiary); font-family: var(--ex-font-mono);">Index: {{ index }} | Value: {{ item.value }}</div>
        </div>
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <ExVirtualList
    :data-source="basicData"
    :height="400"
    :item-height="50"
  >
    <template #default="{ item, index }">
      <div style="padding: 12px 16px;">
        <div style="font-weight: 600;">{{ item.label }}</div>
        <div style="font-size: 12px;">Index: {{ index }}</div>
      </div>
    </template>
  </ExVirtualList>
</template>

<script setup>
import { ref } from 'vue'

const basicData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Item ${i + 1}`,
    value: i
  }))
)
</script>
```

## 动态高度

支持动态高度的列表项，组件会自动计算和缓存每个项目的实际高度。

<div class="demo-container">
  <ExVirtualList
    :data-source="dynamicData"
    :height="400"
    :item-height="getDynamicHeight"
  >
    <template #default="{ item }">
      <div style="padding: 16px; display: flex; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, var(--ex-color-neon-blue-alpha-20), var(--ex-color-secondary-alpha-20)); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-family: var(--ex-font-mono); font-weight: 600; color: var(--ex-color-neon-blue-500);">{{ item.key + 1 }}</span>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--ex-color-text-primary); font-family: var(--ex-font-secondary);">{{ item.title }}</div>
          <div style="color: var(--ex-color-text-secondary); line-height: 1.6; font-size: 14px;">{{ item.content }}</div>
        </div>
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <ExVirtualList
    :data-source="dynamicData"
    :height="400"
    :item-height="getDynamicHeight"
  >
    <template #default="{ item }">
      <div style="padding: 16px;">
        <div style="font-weight: 600;">{{ item.title }}</div>
        <div style="color: var(--ex-color-text-secondary);">{{ item.content }}</div>
      </div>
    </template>
  </ExVirtualList>
</template>

<script setup>
import { ref } from 'vue'

const dynamicData = ref(
  Array.from({ length: 500 }, (_, i) => ({
    key: i,
    title: `Dynamic Item ${i + 1}`,
    content: i % 3 === 0 ? 'Short' : i % 3 === 1 ? 'Medium text' : 'Long text...'
  }))
)

const getDynamicHeight = (index, item) => {
  const baseHeight = 60
  const contentLength = item.content.length
  return baseHeight + Math.floor(contentLength / 50) * 20
}
</script>
```

## 滚动控制

提供多种滚动控制方法，支持滚动到指定位置或索引。

<div class="demo-container">
  <div style="margin-bottom: 16px; display: flex; gap: 8px;">
    <ExButton @click="scrollToTop">滚动到顶部</ExButton>
    <ExButton @click="scrollToMiddle">滚动到中间</ExButton>
    <ExButton @click="scrollToBottom">滚动到底部</ExButton>
  </div>
  <ExVirtualList
    ref="virtualListRef"
    :data-source="scrollData"
    :height="300"
    :item-height="70"
  >
    <template #default="{ item, index }">
      <div style="padding: 12px 16px;">
        {{ item.label }}
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <div>
    <div style="margin-bottom: 16px;">
      <ExButton @click="scrollToTop">滚动到顶部</ExButton>
      <ExButton @click="scrollToMiddle">滚动到中间</ExButton>
      <ExButton @click="scrollToBottom">滚动到底部</ExButton>
    </div>
    <ExVirtualList
      ref="virtualListRef"
      :data-source="scrollData"
      :height="300"
      :item-height="50"
    >
      <template #default="{ item }">
        <div style="padding: 12px 16px;">{{ item.label }}</div>
      </template>
    </ExVirtualList>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const scrollData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Scroll Item ${i + 1}`
  }))
)

const virtualListRef = ref()

const scrollToTop = () => {
  virtualListRef.value?.scrollToTop()
}

const scrollToBottom = () => {
  virtualListRef.value?.scrollToBottom()
}

const scrollToMiddle = () => {
  virtualListRef.value?.scrollToIndex(500, 'center')
}
</script>
```

## 滚动事件

监听滚动事件，获取滚动信息和可见范围。

<div class="demo-container">
  <div style="margin-bottom: 16px; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: 8px;">
    <div style="margin-bottom: 8px;">
      <strong>滚动位置:</strong> {{ scrollInfo.scrollTop }}px
      <span v-if="scrollInfo.isTop" style="margin-left: 8px; color: var(--ex-color-success);">● 顶部</span>
      <span v-if="scrollInfo.isBottom" style="margin-left: 8px; color: var(--ex-color-warning);">● 底部</span>
    </div>
    <div>
      <strong>可见范围:</strong> {{ visibleRange.startIndex }} - {{ visibleRange.endIndex }} 
      (共 {{ visibleRange.visibleCount }} 项)
    </div>
  </div>
  <ExVirtualList
    ref="eventListRef"
    :data-source="eventData"
    :height="300"
    :item-height="50"
    @scroll="handleScroll"
    @reach-top="handleReachTop"
    @reach-bottom="handleReachBottom"
  >
    <template #default="{ item }">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--ex-color-border-secondary);">
        {{ item.label }}
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <div>
    <div style="margin-bottom: 16px;">
      <div>滚动位置: {{ scrollInfo.scrollTop }}px</div>
      <div>可见范围: {{ visibleRange.startIndex }} - {{ visibleRange.endIndex }}</div>
    </div>
    <ExVirtualList
      :data-source="eventData"
      :height="300"
      :item-height="50"
      ref="eventListRef"
      @scroll="handleScroll"
      @reach-top="handleReachTop"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ item }">
        <div style="padding: 12px 16px;">{{ item.label }}</div>
      </template>
    </ExVirtualList>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const eventData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    key: i,
    label: `Event Item ${i + 1}`
  }))
)

const eventListRef = ref()
const scrollInfo = ref({ scrollTop: 0, isTop: true, isBottom: false })
const visibleRange = ref({ startIndex: 0, endIndex: 0, visibleCount: 0 })

const handleScroll = (info) => {
  scrollInfo.value = info
  
  // 获取可见范围
  if (eventListRef.value) {
    visibleRange.value = eventListRef.value.getVisibleRange()
  }
}
</script>
```

## 自定义样式

通过 `wrapStyle` 自定义滚动容器样式，展示不同状态的列表项。

<div class="demo-container">
  <ExVirtualList
    :data-source="styledData"
    :height="400"
    :item-height="68"
  >
    <template #default="{ item }">
      <div style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div 
          :style="{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${getItemColor(item.type)}20, ${getItemColor(item.type)}10)`,
            border: `2px solid ${getItemColor(item.type)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 10px ${getItemColor(item.type)}30`
          }"
        >
          <span :style="{ fontSize: '20px', fontWeight: 'bold', color: getItemColor(item.type) }">
            {{ item.type.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--ex-color-text-primary); font-family: var(--ex-font-secondary); margin-bottom: 4px;">
            {{ item.label }}
          </div>
          <div 
            :style="{ 
              fontSize: '12px', 
              color: getItemColor(item.type),
              textTransform: 'uppercase',
              fontFamily: 'var(--ex-font-mono)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }"
          >
            {{ item.type }}
          </div>
        </div>
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <ExVirtualList
    :data-source="styledData"
    :height="400"
    :item-height="60"
    :wrap-style="{ 
      background: 'var(--ex-color-bg-tertiary)',
      borderRadius: '12px'
    }"
  >
    <template #default="{ item }">
      <div style="padding: 16px; display: flex; align-items: center; gap: 12px;">
        <div :style="{ width: '4px', height: '40px', background: getItemColor(item.type) }" />
        <div>
          <div style="font-weight: 600;">{{ item.label }}</div>
          <div style="font-size: 12px;">{{ item.type }}</div>
        </div>
      </div>
    </template>
  </ExVirtualList>
</template>

<script setup>
import { ref } from 'vue'

const styledData = ref(
  Array.from({ length: 500 }, (_, i) => ({
    key: i,
    label: `Styled Item ${i + 1}`,
    type: ['primary', 'success', 'warning', 'danger'][i % 4]
  }))
)

const getItemColor = (type) => {
  const colors = {
    primary: 'var(--ex-color-primary)',
    success: 'var(--ex-color-success)',
    warning: 'var(--ex-color-warning)',
    danger: 'var(--ex-color-danger)'
  }
  return colors[type]
}
</script>
```

## 性能说明

虚拟列表组件经过高度优化，可以流畅处理超大数据量：

### 核心优化

- ✅ **10 万条数据** - 流畅滚动，无卡顿
- ✅ **固定高度** - O(1) 时间复杂度计算
- ✅ **动态高度** - 二分查找 O(log n) + 前缀和缓存
- ✅ **RAF 优化** - 使用 requestAnimationFrame 优化滚动
- ✅ **Passive 监听** - 使用 passive 事件监听器提升性能
- ✅ **ShallowRef** - 使用 shallowRef 减少响应式开销
- ✅ **高度缓存** - Map 缓存 + 前缀和数组，避免重复计算
- ✅ **实际测量** - ResizeObserver 自动测量实际高度
- ✅ **智能虚拟化** - 小数据量自动禁用虚拟滚动
- ✅ **动态 will-change** - 仅在滚动时启用，节省资源

### 性能对比

| 场景 | 数据量 | 滚动性能 | 内存占用 |
|------|--------|---------|---------|
| 固定高度 | 10 万条 | 60 FPS | 低 |
| 动态高度 | 10 万条 | 60 FPS | 中 |
| 固定高度 | 100 万条 | 60 FPS | 低 |
| 动态高度 | 100 万条 | 55+ FPS | 中 |

**性能优化技巧：**
1. 优先使用固定高度（`itemHeight` 为数字）- 性能最佳
2. 合理设置缓冲区大小（默认 3 已足够）
3. 避免在插槽中使用复杂计算
4. 使用 `itemKey` 提供稳定的 key 值
5. 小数据量（< 100 条）会自动禁用虚拟滚动
6. 动态高度会自动测量和缓存，无需手动管理

## 智能虚拟化

组件会根据数据量自动启用/禁用虚拟滚动：

- 数据量 < 100 条：自动禁用虚拟滚动，直接渲染所有项目
- 数据量 ≥ 100 条：自动启用虚拟滚动，优化性能

你也可以手动控制：

<div class="demo-container">
  <ExVirtualList
    :data-source="smallData"
    :height="300"
    :item-height="50"
    :virtual="false"
    :threshold="50"
  >
    <template #default="{ item }">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--ex-color-border-secondary);">
        {{ item.label }}
      </div>
    </template>
  </ExVirtualList>
</div>

```vue
<template>
  <ExVirtualList
    :data-source="smallData"
    :height="300"
    :item-height="50"
    :virtual="false"
    :threshold="50"
  >
    <template #default="{ item }">
      <div style="padding: 12px 16px;">{{ item.label }}</div>
    </template>
  </ExVirtualList>
</template>

<script setup>
import { ref } from 'vue'

const smallData = ref(
  Array.from({ length: 20 }, (_, i) => ({
    key: i,
    label: `Small List Item ${i + 1}`
  }))
)
</script>
```

## 加载更多

支持无限滚动加载，当接近底部时自动触发加载更多：

```vue
<template>
  <ExVirtualList
    :data-source="listData"
    :height="400"
    :item-height="50"
    :load-more-threshold="100"
    @load-more="handleLoadMore"
  >
    <template #default="{ item }">
      <div style="padding: 12px 16px;">{{ item.label }}</div>
    </template>
  </ExVirtualList>
</template>

<script setup>
import { ref } from 'vue'

const listData = ref([...])
const loading = ref(false)

const handleLoadMore = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    // 加载更多数据
    const newData = await fetchMoreData()
    listData.value.push(...newData)
  } finally {
    loading.value = false
  }
}
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `unknown[]` | `[]` |
| height | 容器高度 | `number \| string` | - |
| itemHeight | 项目高度（固定值或函数） | `number \| ((index: number, item: unknown) => number)` | `50` |
| buffer | 缓冲区大小（上下额外渲染的项目数） | `number` | `3` |
| threshold | 启用虚拟滚动的阈值（数据量小于此值时不使用虚拟滚动） | `number` | `100` |
| itemKey | 项目唯一键（字段名或函数） | `string \| ((item: unknown, index: number) => string \| number)` | `'id'` |
| virtual | 是否启用虚拟滚动 | `boolean` | `true` |
| loadMoreThreshold | 触发加载更多的距离阈值（距离底部多少像素时触发） | `number` | `50` |
| wrapStyle | 滚动容器的自定义样式 | `CSSProperties` | - |
| className | 组件根元素的自定义类名 | `string` | - |
| style | 组件根元素的自定义样式 | `CSSProperties` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| scroll | 滚动时触发 | `(scrollInfo: ScrollInfo) => void` |
| item-click | 点击列表项时触发 | `(item: unknown, index: number) => void` |
| reach-top | 滚动到顶部时触发 | `() => void` |
| reach-bottom | 滚动到底部时触发 | `() => void` |
| load-more | 接近底部时触发（用于无限滚动） | `() => void` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| scrollToIndex | 滚动到指定索引 | `(index: number, behavior?: 'auto' \| 'smooth') => void` |
| scrollTo | 滚动到指定位置 | `(offset: number, behavior?: 'auto' \| 'smooth') => void` |
| scrollToTop | 滚动到顶部 | `(behavior?: 'auto' \| 'smooth') => void` |
| scrollToBottom | 滚动到底部 | `(behavior?: 'auto' \| 'smooth') => void` |
| getScrollInfo | 获取当前滚动信息 | `() => ScrollInfo` |
| getVisibleRange | 获取当前可见范围 | `() => VisibleRange` |
| refresh | 刷新虚拟列表（清除缓存并重新计算） | `() => void` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| default | 自定义列表项内容 | `{ item: any, index: number }` |

### Types

```typescript
interface ScrollInfo {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
  isTop: boolean
  isBottom: boolean
}

interface VisibleRange {
  startIndex: number
  endIndex: number
  visibleCount: number
}
```

## 无障碍支持

- 支持键盘导航（上下箭头键滚动）
- 支持屏幕阅读器
- 支持 `prefers-reduced-motion` 媒体查询，减少动画效果
- 支持高对比度模式

## 主题定制

组件使用 CSS 变量进行主题定制：

```scss
.ex-virtual-list {
  --ex-virtual-list-bg: var(--ex-color-bg-secondary);
  --ex-virtual-list-border: var(--ex-color-border-primary);
  --ex-virtual-list-item-hover-bg: var(--ex-color-bg-hover);
  --ex-virtual-list-scrollbar-bg: rgba(0, 0, 0, 0.1);
  --ex-virtual-list-scrollbar-thumb: rgba(0, 0, 0, 0.3);
}
```

## 性能优化详解

### 核心优化技术

1. **高度缓存系统**
   - Map 缓存每个项目的高度
   - 前缀和数组实现 O(1) 偏移量查询
   - 自动测量实际渲染高度

2. **二分查找算法**
   - 动态高度场景使用二分查找
   - 时间复杂度从 O(n) 降至 O(log n)
   - 大数据量下性能提升显著

3. **RAF 滚动优化**
   - 使用 `requestAnimationFrame` 优化滚动
   - Passive 事件监听器提升性能
   - 智能防抖，避免过度渲染

4. **动态 will-change**
   - 仅在滚动时启用 `will-change: transform`
   - 滚动结束后自动移除，节省 GPU 资源
   - 避免长期占用合成层

5. **ResizeObserver 监听**
   - 自动监听项目尺寸变化
   - 动态更新高度缓存
   - 支持响应式内容

6. **智能虚拟化**
   - 小数据量自动禁用虚拟滚动
   - 避免不必要的性能开销
   - 简化小列表的渲染逻辑

### 内存优化

- 使用 `shallowRef` 减少响应式开销
- Map 数据结构高效存储缓存
- 及时清理不再使用的引用
- 组件卸载时清理所有缓存

## 最佳实践

### 性能最佳实践

1. **固定高度优先**
   - 如果列表项高度固定，使用数字类型的 `itemHeight`
   - 固定高度性能最佳，时间复杂度 O(1)

2. **合理设置缓冲区**
   - 默认 `buffer: 3` 已足够大多数场景
   - 快速滚动场景可增加到 5-10
   - 过大的缓冲区会增加内存占用

3. **提供稳定的 key**
   - 使用唯一且稳定的 `itemKey`
   - 避免使用索引作为 key（数据变化时会导致重渲染）
   - 推荐使用数据的 id 字段

4. **优化插槽内容**
   - 避免在插槽中使用复杂计算
   - 使用 `computed` 预计算数据
   - 避免深层嵌套组件

5. **动态高度优化**
   - 提供尽可能准确的高度估算函数
   - 组件会自动测量和缓存实际高度
   - 避免频繁改变项目高度

6. **数据更新策略**
   - 大数据量场景下，使用增量更新而非全量替换
   - 使用 `push`、`unshift` 等方法添加数据
   - 避免频繁重新赋值整个数组

### 常见问题

**Q: 动态高度时滚动位置跳动？**
A: 组件会自动测量实际高度并更新缓存，初次渲染可能有轻微跳动，后续滚动会很流畅。

**Q: 如何重置缓存？**
A: 调用 `refresh()` 方法清除所有缓存并重新计算。

**Q: 支持横向虚拟滚动吗？**
A: 当前版本仅支持纵向滚动，横向滚动将在后续版本支持。

**Q: 如何实现无限滚动？**
A: 监听 `load-more` 事件，在回调中加载更多数据并追加到 `dataSource`。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border-radius: 8px;
  border: 1px solid var(--ex-color-border-primary);
}
</style>
