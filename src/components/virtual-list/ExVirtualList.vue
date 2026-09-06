<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
  >
    <div
      ref="listRef"
      class="ex-virtual-list__wrapper"
      :style="wrapperStyles"
      :tabindex="props.wrapperTabindex"
      :role="props.wrapperRole"
      @scroll.passive="handleScroll"
    >
      <!-- 占位元素 -->
      <div
        class="ex-virtual-list__spacer"
        :style="spacerStyles"
      ></div>

      <!-- 可见项目 -->
      <div
        class="ex-virtual-list__items"
        :style="{ transform: `translate3d(0, ${offsetY}px, 0)` }"
      >
        <div
          v-for="item in visibleData"
          :key="getItemKey(item)"
          :ref="el => setItemRef(el as HTMLElement, item.index)"
          class="ex-virtual-list__item"
          :class="{ 'is-last': item.index === dataSource.length - 1 }"
          :style="itemStyle()"
          :role="itemRole"
          :tabindex="getItemTabindex(item.index)"
          :aria-posinset="itemRole ? item.index + 1 : undefined"
          :aria-setsize="itemRole ? dataSource.length : undefined"
          @click="handleItemClick(item)"
          @focus="focusedIndex = item.index"
          @keydown="handleItemKeydown($event, item)"
        >
          <slot
            :item="item.data"
            :index="item.index"
          >
            {{ item.data }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, shallowRef, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
import type { ExVirtualListProps, ExVirtualListEmits } from './types';
import { logger } from '../../utils/logger';

defineOptions({
  name: 'ExVirtualList',
});

const props = withDefaults(defineProps<ExVirtualListProps>(), {
  itemHeight: 50,
  buffer: 3,
  itemKey: 'id',
  threshold: 100,
  virtual: true,
  loadMoreThreshold: 50,
  wrapperRole: 'list',
  wrapperTabindex: -1,
});

const emit = defineEmits<ExVirtualListEmits>();

// 容器引用
const listRef = ref<HTMLElement>();

// 窗口状态使用浅层引用，避免对大数据集递归转换
const startIndex = shallowRef(0);
const endIndex = shallowRef(0);
const offsetY = shallowRef(0);
const focusedIndex = shallowRef(0);

const DEFAULT_ITEM_HEIGHT_PX = 50;
const SCROLL_EDGE_TOLERANCE_PX = 1;

const normalizedFixedItemHeight = computed<number | undefined>(() => {
  if (typeof props.itemHeight === 'function') return undefined;
  if (Number.isFinite(props.itemHeight) && props.itemHeight > 0) return props.itemHeight;

  logger.warn(
    `Invalid fixed item height ${String(props.itemHeight)}, using default ${DEFAULT_ITEM_HEIGHT_PX}px`
  );
  return DEFAULT_ITEM_HEIGHT_PX;
});

// 高度缓存 - 用于动态高度优化
const heightCache = new Map<number, number>();
const offsetCache = shallowRef<number[]>([]);
// 用 shallowRef 持有总高度，保证动态高度重测后 totalHeight/spacer 能响应式更新
const cachedTotalHeight = shallowRef(0);
let cacheInitialized = false;

// 项目元素引用 - 用于测量实际高度
const itemRefs = new Map<number, HTMLElement>();
const itemIndices = new WeakMap<HTMLElement, number>();
const resizeObserver = ref<ResizeObserver | null>(null);
let disposed = false;
const pendingMeasurements = new Map<number, HTMLElement>();
let measurementScheduled = false;

// 计算属性
const containerClasses = computed(() => ['ex-virtual-list', props.className]);

const containerStyles = computed((): CSSProperties => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  ...props.style,
}));

const wrapperStyles = computed((): CSSProperties => ({
  height: '100%',
  overflow: 'auto',
  position: 'relative',
  ...props.wrapStyle,
}));

const spacerStyles = computed((): CSSProperties => ({
  height: typeof totalHeight.value === 'number' ? `${totalHeight.value}px` : totalHeight.value,
}));

const itemRole = computed(() => (props.wrapperRole === 'list' ? 'listitem' : undefined));

// 判断是否启用虚拟滚动
const shouldUseVirtual = computed(() => {
  return props.virtual !== false && props.dataSource.length >= props.threshold;
});

// 获取项目高度 - 带错误处理和缓存
const getItemHeight = (index: number): number => {
  // 检查缓存
  if (heightCache.has(index)) {
    return heightCache.get(index)!;
  }

  try {
    let height: number;

    if (typeof props.itemHeight === 'function') {
      height = props.itemHeight(index, props.dataSource[index]);

      // 验证高度值
      if (typeof height !== 'number' || height <= 0 || !isFinite(height)) {
        logger.warn(
          `Invalid height ${height} for item ${index}, using default ${DEFAULT_ITEM_HEIGHT_PX}px`
        );
        height = DEFAULT_ITEM_HEIGHT_PX;
      }
    } else {
      height = normalizedFixedItemHeight.value ?? DEFAULT_ITEM_HEIGHT_PX;
    }

    // 缓存高度
    heightCache.set(index, height);
    return height;
  } catch (error) {
    logger.error(`Error calculating height for item ${index}:`, error);
    heightCache.set(index, DEFAULT_ITEM_HEIGHT_PX);
    return DEFAULT_ITEM_HEIGHT_PX;
  }
};

// 构建偏移量缓存（前缀和数组）
const buildOffsetCache = () => {
  const cache: number[] = [0];
  let sum = 0;

  for (let i = 0; i < props.dataSource.length; i++) {
    sum += getItemHeight(i);
    cache.push(sum);
  }

  offsetCache.value = cache;
  cachedTotalHeight.value = sum;
  cacheInitialized = true;
};

// 获取偏移量 - O(1) 复杂度
const getOffset = (index: number): number => {
  const fixedItemHeight = normalizedFixedItemHeight.value;
  if (fixedItemHeight !== undefined) {
    return index * fixedItemHeight;
  }

  // 确保缓存已构建
  if (offsetCache.value.length === 0) {
    buildOffsetCache();
  }

  return offsetCache.value[index] || 0;
};

// 计算总高度 - 使用缓存
const totalHeight = computed(() => {
  if (!shouldUseVirtual.value) {
    return 'auto';
  }

  const fixedItemHeight = normalizedFixedItemHeight.value;
  if (fixedItemHeight !== undefined) {
    return props.dataSource.length * fixedItemHeight;
  }

  // 动态高度：读取响应式总高度（由 onMounted/watch/测量 维护，避免在 computed 内产生副作用）
  return cachedTotalHeight.value;
});

// 二分查找边界；起点跳过相等偏移，终点保留相等偏移。
const findOffsetIndex = (offset: number, skipEqual = false): number => {
  const cache = offsetCache.value;
  let left = 0;
  let right = cache.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = cache[mid];

    if (midValue !== undefined && (midValue < offset || (skipEqual && midValue === offset))) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
};

// 计算可见范围 - 优化版本
const updateVisibleRange = () => {
  const listEl = listRef.value;
  if (!listEl || disposed) return;
  if (props.dataSource.length === 0) {
    startIndex.value = 0;
    endIndex.value = 0;
    offsetY.value = 0;
    listEl.scrollTop = 0;
    return;
  }

  // 如果不使用虚拟滚动，渲染所有项目
  if (!shouldUseVirtual.value) {
    startIndex.value = 0;
    endIndex.value = props.dataSource.length;
    offsetY.value = 0;
    return;
  }

  const clientHeight = listEl.clientHeight;
  if (normalizedFixedItemHeight.value === undefined && !cacheInitialized) buildOffsetCache();
  const contentHeight = Number(totalHeight.value);
  const scrollTop = Math.min(
    Math.max(0, listEl.scrollTop),
    Math.max(0, contentHeight - clientHeight)
  );
  // 数据缩短或容器增高时，旧滚动位置可能已经超出有效内容。
  if (scrollTop !== listEl.scrollTop) listEl.scrollTop = scrollTop;

  let start: number;
  let end: number;

  const fixedItemHeight = normalizedFixedItemHeight.value;
  if (fixedItemHeight !== undefined) {
    // 固定高度 - O(1) 复杂度
    start = Math.floor(scrollTop / fixedItemHeight);
    end = Math.ceil((scrollTop + clientHeight) / fixedItemHeight);
  } else {
    // 动态高度 - 使用二分查找 O(log n)
    if (offsetCache.value.length === 0) {
      buildOffsetCache();
    }

    start = Math.max(0, findOffsetIndex(scrollTop, true) - 1);
    end = findOffsetIndex(scrollTop + clientHeight);
  }

  // 应用缓冲区
  const buffer = Number.isFinite(props.buffer) ? Math.max(0, Math.floor(props.buffer)) : 0;
  const bufferStart = Math.max(0, start - buffer);
  const bufferEnd = Math.min(props.dataSource.length, end + buffer);

  // 只在变化时更新
  if (startIndex.value !== bufferStart || endIndex.value !== bufferEnd) {
    startIndex.value = bufferStart;
    endIndex.value = bufferEnd;
  }
  // 高度变化时窗口索引可能不变，偏移仍必须同步更新。
  offsetY.value = getOffset(bufferStart);
};

// 可见数据 - 使用 slice 避免重新创建数组
const visibleData = computed(() => {
  const start = startIndex.value;
  const end = endIndex.value;

  return props.dataSource.slice(start, end).map((data, i) => ({
    data,
    index: start + i,
  }));
});

// 获取项目 key
const getItemKey = (item: { index: number; data: unknown }) => {
  const { index, data } = item;

  if (typeof props.itemKey === 'function') {
    return props.itemKey(data, index);
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    typeof props.itemKey === 'string' &&
    props.itemKey in data
  ) {
    return (data as Record<string, unknown>)[props.itemKey] as string | number;
  }

  return index;
};

// 设置项目引用并测量高度
const setItemRef = (el: HTMLElement | null, index: number) => {
  if (!el) {
    // 节点移出可视区：取消观察并清理引用
    const old = itemRefs.get(index);
    if (old && resizeObserver.value) {
      resizeObserver.value.unobserve(old);
    }
    if (old) itemIndices.delete(old);
    pendingMeasurements.delete(index);
    itemRefs.delete(index);
    return;
  }

  if (itemRefs.get(index) === el) return;
  itemRefs.set(index, el);
  itemIndices.set(el, index);

  // 如果是动态高度，动态观察新出现的节点并测量实际高度
  if (typeof props.itemHeight === 'function') {
    if (resizeObserver.value) {
      resizeObserver.value.observe(el);
    }
    queueMeasurement(index, el);
  }
};

// 测量项目实际高度
const measureItemHeight = (index: number, element: HTMLElement): boolean => {
  if (itemRefs.get(index) !== element || index >= props.dataSource.length) return false;

  try {
    const actualHeight = element.offsetHeight;
    const cachedHeight = heightCache.get(index);

    // 如果实际高度与缓存高度不同，更新缓存
    if (actualHeight > 0 && actualHeight !== cachedHeight) {
      heightCache.set(index, actualHeight);
      return true;
    }
  } catch (error) {
    logger.error(`Error measuring height for item ${index}:`, error);
  }
  return false;
};

// 同一次渲染和尺寸通知合并测量，只重建一次前缀和，避免逐行触发全量扫描。
const queueMeasurement = (index: number, element: HTMLElement) => {
  pendingMeasurements.set(index, element);
  if (measurementScheduled) return;
  measurementScheduled = true;
  nextTick(() => {
    measurementScheduled = false;
    if (disposed || typeof props.itemHeight !== 'function') {
      pendingMeasurements.clear();
      return;
    }
    let changed = false;
    pendingMeasurements.forEach((element, index) => {
      changed = measureItemHeight(index, element) || changed;
    });
    pendingMeasurements.clear();
    if (changed) {
      buildOffsetCache();
      updateVisibleRange();
    }
  });
};

// 项目样式 - 动态高度时不设置固定高度
const itemStyle = (): CSSProperties => {
  const fixedItemHeight = normalizedFixedItemHeight.value;
  if (fixedItemHeight !== undefined) {
    return { height: `${fixedItemHeight}px` };
  }

  // 缓存只参与虚拟定位，不能作为最小高度阻止真实内容收缩。
  return {};
};

// 滚动处理 - 使用 passive 监听器和 RAF 优化
let rafId: number | null = null;
// 边沿检测：避免 reach-top/reach-bottom/load-more 每帧重复 emit
let prevAtTop = false;
let prevAtBottom = false;
let prevNearBottom = false;

const handleScroll = () => {
  const listEl = listRef.value;
  if (!listEl) return;

  // 清除之前的 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    if (!listRef.value) {
      rafId = null;
      return;
    }

    updateVisibleRange();

    const { scrollTop, scrollHeight, clientHeight } = listRef.value;

    emit('scroll', {
      scrollTop,
      scrollHeight,
      clientHeight,
      isTop: scrollTop <= 0,
      isBottom: scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_TOLERANCE_PX,
    });

    // 边沿触发：仅在「进入」对应区域的那一刻 emit 一次，避免每帧重复
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_TOLERANCE_PX;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - props.loadMoreThreshold;

    if (atTop && !prevAtTop) {
      emit('reach-top');
    }
    if (atBottom && !prevAtBottom) {
      emit('reach-bottom');
    }
    if (nearBottom && !prevNearBottom) {
      emit('load-more');
    }

    prevAtTop = atTop;
    prevAtBottom = atBottom;
    prevNearBottom = nearBottom;

    rafId = null;
  });
};

// 项目点击
const handleItemClick = (item: { index: number; data: unknown }) => {
  emit('item-click', item.data, item.index);
};

const getItemTabindex = (index: number): number | undefined => {
  if (!itemRole.value) return undefined;

  const focusedItemVisible =
    focusedIndex.value >= startIndex.value && focusedIndex.value < endIndex.value;
  return focusedIndex.value === index || (!focusedItemVisible && index === startIndex.value)
    ? 0
    : -1;
};

const focusItem = (index: number) => {
  const boundedIndex = Math.min(Math.max(index, 0), Math.max(props.dataSource.length - 1, 0));
  focusedIndex.value = boundedIndex;
  const isRendered = boundedIndex >= startIndex.value && boundedIndex < endIndex.value;
  if (!isRendered) {
    scrollToIndex(boundedIndex);
    // scrollTo 会同步更新 auto 滚动位置；立即重算窗口后，下一帧才能聚焦新节点。
    updateVisibleRange();
  }
  nextTick(() => itemRefs.get(boundedIndex)?.focus());
};

// 列表项采用 roving tabindex，避免大量数据同时进入 Tab 顺序。
const handleItemKeydown = (event: KeyboardEvent, item: { index: number; data: unknown }) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleItemClick(item);
    return;
  }

  let targetIndex: number | null = null;
  switch (event.key) {
    case 'ArrowDown':
      targetIndex = item.index + 1;
      break;
    case 'ArrowUp':
      targetIndex = item.index - 1;
      break;
    case 'Home':
      targetIndex = 0;
      break;
    case 'End':
      targetIndex = props.dataSource.length - 1;
      break;
  }

  if (targetIndex === null) return;
  event.preventDefault();
  focusItem(targetIndex);
};

const checkInitialLoadMore = () => {
  const listEl = listRef.value;
  if (!listEl || props.dataSource.length === 0 || listEl.clientHeight <= 0) return;

  const nearBottom =
    listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - props.loadMoreThreshold;
  if (nearBottom && !prevNearBottom) emit('load-more');
  prevNearBottom = nearBottom;
};

// 定义 ScrollBehavior 类型
type ScrollBehavior = 'auto' | 'smooth';

// 刷新缓存 - 重新计算所有高度
const refresh = () => {
  heightCache.clear();
  offsetCache.value = [];
  cachedTotalHeight.value = 0;
  cacheInitialized = false;

  nextTick(() => {
    if (disposed) return;
    if (typeof props.itemHeight === 'function') buildOffsetCache();
    updateVisibleRange();
    if (typeof props.itemHeight === 'function') {
      itemRefs.forEach((element, index) => queueMeasurement(index, element));
    }
  });
};

// 公共方法
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'auto') => {
  const listEl = listRef.value;
  if (!listEl) return;

  const lastIndex = Math.max(props.dataSource.length - 1, 0);
  const normalizedIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  const boundedIndex = Math.min(Math.max(normalizedIndex, 0), lastIndex);
  // 使用缓存的偏移量 - O(1)
  const offset = getOffset(boundedIndex);

  listEl.scrollTo({
    top: offset,
    behavior,
  });
};

const scrollTo = (offset: number, behavior: ScrollBehavior = 'auto') => {
  const listEl = listRef.value;
  if (!listEl) return;

  listEl.scrollTo({
    top: offset,
    behavior,
  });
};

const scrollToTop = (behavior: ScrollBehavior = 'auto') => {
  scrollTo(0, behavior);
};

const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
  const listEl = listRef.value;
  if (!listEl) return;

  listEl.scrollTo({
    top: listEl.scrollHeight,
    behavior,
  });
};

const getScrollInfo = () => {
  const listEl = listRef.value;
  if (!listEl) {
    return {
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
      isTop: true,
      isBottom: true,
    };
  }

  const { scrollTop, scrollHeight, clientHeight } = listEl;
  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    isTop: scrollTop <= 0,
    isBottom: scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_TOLERANCE_PX,
  };
};

const getVisibleRange = () => {
  return {
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    visibleCount: endIndex.value - startIndex.value,
  };
};

// 同时监听视口和动态项目，百分比高度及父布局变化无需依赖滚动事件。
const setupResizeObserver = () => {
  if (typeof ResizeObserver === 'undefined') {
    logger.warn('ResizeObserver is not available');
    return;
  }

  resizeObserver.value = new ResizeObserver(entries => {
    if (disposed) return;
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      if (element === listRef.value) {
        updateVisibleRange();
        checkInitialLoadMore();
        continue;
      }
      const index = itemIndices.get(element);
      if (index !== undefined && typeof props.itemHeight === 'function') {
        // offsetHeight 与首次测量使用同一边框盒口径，避免分隔线累积误差。
        queueMeasurement(index, element);
      }
    }
  });

  if (listRef.value) resizeObserver.value.observe(listRef.value);
  if (typeof props.itemHeight === 'function') {
    itemRefs.forEach(el => resizeObserver.value?.observe(el));
  }
};

// 清理 ResizeObserver
const cleanupResizeObserver = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
};

// 生命周期
onMounted(() => {
  nextTick(() => {
    if (disposed) return;
    // 动态高度：先构建偏移缓存，使 totalHeight/spacer 初始即正确
    if (typeof props.itemHeight === 'function' && shouldUseVirtual.value) {
      buildOffsetCache();
    }
    updateVisibleRange();
    setupResizeObserver();
    checkInitialLoadMore();
  });
});

onBeforeUnmount(() => {
  disposed = true;
  pendingMeasurements.clear();
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // 清理 ResizeObserver
  cleanupResizeObserver();

  // 清理缓存
  heightCache.clear();
  offsetCache.value = [];
  itemRefs.clear();
});

// 监听数据变化
watch(
  () => props.dataSource.length,
  (newLen, oldLen) => {
    // 数据长度变化时，重新构建缓存
    if (newLen !== oldLen) {
      focusedIndex.value = Math.min(focusedIndex.value, Math.max(newLen - 1, 0));
      prevNearBottom = false;
      refresh();
      nextTick(checkInitialLoadMore);
    }
  }
);

watch(
  () => props.itemHeight,
  () => {
    // itemHeight 变化时，清除缓存并重新计算
    refresh();
    cleanupResizeObserver();
    setupResizeObserver();
  },
  { flush: 'post' }
);

watch(
  () => [props.height, props.virtual, props.threshold, props.buffer],
  () => {
    updateVisibleRange();
    checkInitialLoadMore();
  },
  { flush: 'post' }
);

// 监听数据源变化（深度监听可能影响性能，仅在必要时使用）
watch(
  () => props.dataSource,
  () => {
    // 数据内容变化时，可能需要重新测量高度
    if (typeof props.itemHeight === 'function') {
      refresh();
    }
  },
  { deep: false }
);

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollTo,
  scrollToTop,
  scrollToBottom,
  getScrollInfo,
  getVisibleRange,
  refresh,
});
</script>

<style lang="scss" scoped src="./ExVirtualList.scss"></style>
