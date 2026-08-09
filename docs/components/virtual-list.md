# VirtualList 虚拟列表

用于高效渲染大量连续列表数据。

<script setup>
import { ref } from 'vue'

const listRef = ref(null)
const scrollInfo = ref({ scrollTop: 0, isTop: true, isBottom: false })

const records = Array.from({ length: 2000 }, (_, index) => ({
  id: index + 1,
  name: `客户档案 ${String(index + 1).padStart(4, '0')}`,
  owner: ['林知远', '周予安', '陈嘉树', '许清和'][index % 4],
  status: ['跟进中', '待确认', '已成交'][index % 3]
}))

const dynamicRecords = Array.from({ length: 600 }, (_, index) => ({
  id: index + 1,
  title: `项目动态 ${index + 1}`,
  content:
    index % 3 === 0
      ? '已完成节点确认。'
      : index % 3 === 1
        ? '交付团队已同步本周计划，当前风险处于可控范围。'
        : '客户已确认阶段成果，下一步将进入灰度发布和业务验收，负责人会持续更新处理进度。'
}))

const getDynamicHeight = (_index, item) => (item.content.length > 45 ? 104 : item.content.length > 18 ? 82 : 64)

const handleScroll = info => {
  scrollInfo.value = {
    scrollTop: Math.round(info.scrollTop),
    isTop: info.isTop,
    isBottom: info.isBottom
  }
}
</script>

## 固定高度

::: raw

<div class="vp-raw demo-container">
  <ex-virtual-list
    ref="listRef"
    :data-source="records"
    :height="360"
    :item-height="64"
    item-key="id"
    :buffer="5"
    @scroll="handleScroll"
  >
    <template #default="{ item, index }">
      <div class="virtual-record">
        <div class="virtual-index">{{ String(index + 1).padStart(4, '0') }}</div>
        <div class="virtual-body">
          <strong>{{ item.name }}</strong>
          <span>负责人：{{ item.owner }}</span>
        </div>
        <ex-tag size="small" :type="item.status === '已成交' ? 'success' : 'info'">
          {{ item.status }}
        </ex-tag>
      </div>
    </template>
  </ex-virtual-list>
  <div class="virtual-status">
    scrollTop: {{ scrollInfo.scrollTop }} · 顶部: {{ scrollInfo.isTop }} · 底部: {{ scrollInfo.isBottom }}
  </div>
</div>
:::

```vue
<ex-virtual-list :data-source="records" :height="360" :item-height="64" item-key="id">
  <template #default="{ item }">{{ item.name }}</template>
</ex-virtual-list>
```

快速滚动时渲染窗口使用稳定的三维位移，分隔线只在真实数据末项结束。

## 动态高度

::: raw

<div class="vp-raw demo-container">
  <ex-virtual-list
    :data-source="dynamicRecords"
    :height="360"
    :item-height="getDynamicHeight"
    item-key="id"
    :buffer="6"
  >
    <template #default="{ item }">
      <div class="virtual-dynamic-record">
        <strong>{{ item.title }}</strong>
        <span>{{ item.content }}</span>
      </div>
    </template>
  </ex-virtual-list>
</div>
:::

## 滚动控制

::: raw

<div class="vp-raw demo-container virtual-controls">
  <ex-space wrap>
    <ex-button size="small" type="default" @click="listRef?.scrollToTop('smooth')">回到顶部</ex-button>
    <ex-button size="small" type="default" @click="listRef?.scrollToIndex(999, 'smooth')">第 1000 项</ex-button>
    <ex-button size="small" type="default" @click="listRef?.scrollToBottom('smooth')">滚动到底部</ex-button>
  </ex-space>
</div>
:::

## API

### Props

| 参数                | 说明                       | 类型                                            | 默认值 |
| ------------------- | -------------------------- | ----------------------------------------------- | ------ |
| `dataSource`        | 数据源                     | `unknown[]`                                     | 必填   |
| `height`            | 滚动容器高度               | `number \| string`                              | 必填   |
| `itemHeight`        | 固定高度或高度计算函数     | `number \| ((index, item) => number)`           | 必填   |
| `buffer`            | 可视区上下额外渲染项数     | `number`                                        | `3`    |
| `itemKey`           | 唯一键字段或解析函数       | `string \| ((item, index) => string \| number)` | —      |
| `className`         | 附加类名                   | `string`                                        | —      |
| `style`             | 根元素样式                 | `CSSProperties`                                 | —      |
| `wrapStyle`         | 滚动容器样式               | `CSSProperties`                                 | —      |
| `threshold`         | 启用虚拟滚动的最小数据量   | `number`                                        | `100`  |
| `virtual`           | 是否启用虚拟滚动           | `boolean`                                       | `true` |
| `loadMoreThreshold` | 距底部多少像素触发加载更多 | `number`                                        | `50`   |
| `wrapperRole`       | 滚动包装器的 ARIA role     | `string`                                        | `list` |
| `wrapperTabindex`   | 滚动包装器的键盘焦点顺序   | `number \| string`                              | `0`    |

### Events

| 事件名         | 参数                             |
| -------------- | -------------------------------- |
| `scroll`       | `(info: ScrollInfo)`             |
| `item-click`   | `(item: unknown, index: number)` |
| `reach-top`    | `()`                             |
| `reach-bottom` | `()`                             |
| `load-more`    | `()`                             |

### Slots

| 名称      | 参数              |
| --------- | ----------------- |
| `default` | `{ item, index }` |

### Exposes

| 方法              | 类型                                                  |
| ----------------- | ----------------------------------------------------- |
| `scrollToIndex`   | `(index: number, behavior?: ScrollBehavior) => void`  |
| `scrollTo`        | `(offset: number, behavior?: ScrollBehavior) => void` |
| `scrollToTop`     | `(behavior?: ScrollBehavior) => void`                 |
| `scrollToBottom`  | `(behavior?: ScrollBehavior) => void`                 |
| `getScrollInfo`   | `() => ScrollInfo`                                    |
| `getVisibleRange` | `() => VisibleRange`                                  |
| `refresh`         | `() => void`                                          |

<style scoped>
.virtual-record {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  min-height: 64px;
  padding: 0 16px;
}

.virtual-index,
.virtual-body span,
.virtual-status,
.virtual-dynamic-record span {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}

.virtual-body,
.virtual-dynamic-record {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.virtual-body strong,
.virtual-body span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.virtual-status {
  margin-top: 12px;
}

.virtual-dynamic-record {
  padding: 12px 16px;
  line-height: var(--ex-leading-relaxed);
}

.virtual-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
