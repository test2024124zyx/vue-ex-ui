<template>
  <div
    ref="containerRef"
    :class="containerClasses"
    :style="containerStyles"
  >
    <div
      ref="listRef"
      class="ex-virtual-list__wrapper"
      :style="wrapperStyles"
      @scroll.passive="handleScroll"
    >
      <!-- 占位元素 -->
      <div
        class="ex-virtual-list__spacer"
        :style="{ height: `${totalHeight}px` }"
      />
      
      <!-- 可见项目 -->
      <div
        class="ex-virtual-list__items"
        :class="{ 'is-scrolling': isScrollingState }"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleData"
          :key="getItemKey(item)"
          :ref="(el) => setItemRef(el as HTMLElement, item.index)"
          class="ex-virtual-list__item"
          :style="itemStyle(item.index)"
          @click="handleItemClick(item)"
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
});

const emit = defineEmits<ExVirtualListEmits>();

// Refs
const containerRef = ref<HTMLElement>();
const listRef = ref<HTMLElement>();

// State - 使用 shallowRef 优化性能
const startIndex = shallowRef(0);
const endIndex = shallowRef(0);
const offsetY = shallowRef(0);
const isScrollingState = shallowRef(false);

// 高度缓存 - 用于动态高度优化
const heightCache = new Map<number, number>();
const offsetCache = shallowRef<number[]>([]);
let cachedTotalHeight = 0;
let cacheInitialized = false;

// 项目元素引用 - 用于测量实际高度
const itemRefs = new Map<number, HTMLElement>();
const resizeObserver = ref<ResizeObserver | null>(null);

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
        logger.warn(`Invalid height ${height} for item ${index}, using default 50px`);
        height = 50;
      }
    } else {
      height = props.itemHeight;
    }
    
    // 缓存高度
    heightCache.set(index, height);
    return height;
  } catch (error) {
    logger.error(`Error calculating height for item ${index}:`, error);
    const defaultHeight = 50;
    heightCache.set(index, defaultHeight);
    return defaultHeight;
  }
};

// 更新高度缓存
const updateHeightCache = (index: number, height: number) => {
  const oldHeight = heightCache.get(index) || 0;
  heightCache.set(index, height);
  
  // 更新缓存的总高度
  if (cacheInitialized) {
    cachedTotalHeight += (height - oldHeight);
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
  cachedTotalHeight = sum;
  cacheInitialized = true;
};

// 获取偏移量 - O(1) 复杂度
const getOffset = (index: number): number => {
  if (!shouldUseVirtual.value) return 0;
  
  if (typeof props.itemHeight === 'number') {
    return index * props.itemHeight;
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

  if (typeof props.itemHeight === 'number') {
    return props.dataSource.length * props.itemHeight;
  }
  
  // 使用缓存的总高度
  if (cacheInitialized) {
    return cachedTotalHeight;
  }
  
  // 首次计算
  buildOffsetCache();
  return cachedTotalHeight;
});

// 二分查找 - 查找第一个偏移量 >= scrollTop 的索引
const binarySearch = (scrollTop: number): number => {
  const cache = offsetCache.value;
  let left = 0;
  let right = cache.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = cache[mid];
    
    if (midValue !== undefined && midValue < scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  
  return Math.max(0, left - 1);
};

// 计算可见范围 - 优化版本
const updateVisibleRange = () => {
  const listEl = listRef.value;
  if (!listEl || props.dataSource.length === 0) return;

  // 如果不使用虚拟滚动，渲染所有项目
  if (!shouldUseVirtual.value) {
    startIndex.value = 0;
    endIndex.value = props.dataSource.length;
    offsetY.value = 0;
    return;
  }

  const scrollTop = listEl.scrollTop;
  const clientHeight = listEl.clientHeight;

  let start = 0;
  let end = 0;

  if (typeof props.itemHeight === 'number') {
    // 固定高度 - O(1) 复杂度
    const itemHeight = props.itemHeight;
    start = Math.floor(scrollTop / itemHeight);
    end = Math.ceil((scrollTop + clientHeight) / itemHeight);
  } else {
    // 动态高度 - 使用二分查找 O(log n)
    if (offsetCache.value.length === 0) {
      buildOffsetCache();
    }
    
    start = binarySearch(scrollTop);
    
    // 从 start 开始查找 end
    const cache = offsetCache.value;
    const scrollBottom = scrollTop + clientHeight;
    
    for (let i = start; i < cache.length - 1; i++) {
      const cacheValue = cache[i];
      if (cacheValue !== undefined && cacheValue >= scrollBottom) {
        end = i;
        break;
      }
    }
    
    if (end === 0) {
      end = props.dataSource.length;
    }
  }

  // 应用缓冲区
  const bufferStart = Math.max(0, start - props.buffer);
  const bufferEnd = Math.min(props.dataSource.length, end + props.buffer);

  // 只在变化时更新
  if (startIndex.value !== bufferStart || endIndex.value !== bufferEnd) {
    startIndex.value = bufferStart;
    endIndex.value = bufferEnd;
    
    // 使用缓存的偏移量 - O(1)
    offsetY.value = getOffset(bufferStart);
  }
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
  
  if (typeof data === 'object' && data !== null && typeof props.itemKey === 'string' && props.itemKey in data) {
    return (data as Record<string, unknown>)[props.itemKey] as string | number;
  }
  
  return index;
};

// 设置项目引用并测量高度
const setItemRef = (el: HTMLElement | null, index: number) => {
  if (!el) {
    itemRefs.delete(index);
    return;
  }
  
  itemRefs.set(index, el);
  
  // 如果是动态高度，测量实际高度
  if (typeof props.itemHeight === 'function') {
    nextTick(() => {
      measureItemHeight(index, el);
    });
  }
};

// 测量项目实际高度
const measureItemHeight = (index: number, element: HTMLElement) => {
  if (!element) return;
  
  try {
    const actualHeight = element.offsetHeight;
    const cachedHeight = heightCache.get(index);
    
    // 如果实际高度与缓存高度不同，更新缓存
    if (actualHeight > 0 && actualHeight !== cachedHeight) {
      updateHeightCache(index, actualHeight);
      
      // 重新构建偏移量缓存
      if (cacheInitialized) {
        buildOffsetCache();
      }
    }
  } catch (error) {
    logger.error(`Error measuring height for item ${index}:`, error);
  }
};

// 项目样式 - 动态高度时不设置固定高度
const itemStyle = (index: number): CSSProperties => {
  if (typeof props.itemHeight === 'number') {
    return { height: `${props.itemHeight}px` };
  }
  
  // 动态高度时，让内容自然撑开，然后测量
  const cachedHeight = heightCache.get(index);
  if (cachedHeight) {
    return { minHeight: `${cachedHeight}px` };
  }
  
  return {};
};

// 滚动处理 - 使用 passive 监听器和 RAF 优化
let rafId: number | null = null;
let scrollEndTimer: number | null = null;

const handleScroll = () => {
  const listEl = listRef.value;
  if (!listEl) return;

  // 标记正在滚动
  if (!isScrollingState.value) {
    isScrollingState.value = true;
  }

  // 清除之前的 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  // 清除滚动结束定时器
  if (scrollEndTimer !== null) {
    clearTimeout(scrollEndTimer);
  }

  rafId = requestAnimationFrame(() => {
    if (!listRef.value) {
      isScrollingState.value = false;
      return;
    }

    updateVisibleRange();

    const { scrollTop, scrollHeight, clientHeight } = listRef.value;
    
    emit('scroll', {
      scrollTop,
      scrollHeight,
      clientHeight,
      isTop: scrollTop <= 0,
      isBottom: scrollTop + clientHeight >= scrollHeight - 1,
    });

    // 到达顶部
    if (scrollTop <= 0) {
      emit('reach-top');
    }

    // 到达底部
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      emit('reach-bottom');
    }

    // 接近底部 - 触发加载更多
    if (scrollTop + clientHeight >= scrollHeight - props.loadMoreThreshold) {
      emit('load-more');
    }

    rafId = null;
  });

  // 滚动结束后 150ms 标记为非滚动状态
  scrollEndTimer = window.setTimeout(() => {
    isScrollingState.value = false;
    scrollEndTimer = null;
  }, 150);
};

// 项目点击
const handleItemClick = (item: { index: number; data: unknown }) => {
  emit('item-click', item.data, item.index);
};

// 定义 ScrollBehavior 类型
type ScrollBehavior = 'auto' | 'smooth';

// 刷新缓存 - 重新计算所有高度
const refresh = () => {
  heightCache.clear();
  offsetCache.value = [];
  cachedTotalHeight = 0;
  cacheInitialized = false;
  
  nextTick(() => {
    updateVisibleRange();
  });
};

// 公共方法
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'auto') => {
  const listEl = listRef.value;
  if (!listEl) return;

  // 使用缓存的偏移量 - O(1)
  const offset = getOffset(index);

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
    isBottom: scrollTop + clientHeight >= scrollHeight - 1,
  };
};

const getVisibleRange = () => {
  return {
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    visibleCount: endIndex.value - startIndex.value,
  };
};

// 设置 ResizeObserver 监听项目尺寸变化
const setupResizeObserver = () => {
  if (typeof ResizeObserver === 'undefined') {
    logger.warn('ResizeObserver is not available');
    return;
  }
  
  // 只在动态高度时使用 ResizeObserver
  if (typeof props.itemHeight !== 'function') {
    return;
  }
  
  resizeObserver.value = new ResizeObserver((entries) => {
    let needsUpdate = false;
    
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      const index = Array.from(itemRefs.entries()).find(([, el]) => el === element)?.[0];
      
      if (index !== undefined) {
        const newHeight = entry.contentRect.height;
        const cachedHeight = heightCache.get(index);
        
        if (newHeight > 0 && newHeight !== cachedHeight) {
          updateHeightCache(index, newHeight);
          needsUpdate = true;
        }
      }
    }
    
    if (needsUpdate && cacheInitialized) {
      buildOffsetCache();
      updateVisibleRange();
    }
  });
  
  // 观察所有已渲染的项目
  itemRefs.forEach((el) => {
    resizeObserver.value?.observe(el);
  });
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
    updateVisibleRange();
    setupResizeObserver();
  });
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  
  if (scrollEndTimer !== null) {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = null;
  }
  
  // 清理 ResizeObserver
  cleanupResizeObserver();
  
  // 清理缓存
  heightCache.clear();
  offsetCache.value = [];
  itemRefs.clear();
});

// 监听数据变化
watch(() => props.dataSource.length, (newLen, oldLen) => {
  // 数据长度变化时，重新构建缓存
  if (newLen !== oldLen) {
    refresh();
  }
});

watch(() => props.itemHeight, () => {
  // itemHeight 变化时，清除缓存并重新计算
  refresh();
});

// 监听数据源变化（深度监听可能影响性能，仅在必要时使用）
watch(() => props.dataSource, () => {
  // 数据内容变化时，可能需要重新测量高度
  if (typeof props.itemHeight === 'function') {
    refresh();
  }
}, { deep: false });

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
