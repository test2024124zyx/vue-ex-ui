import { debounce, throttle, generateId, deepClone } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle, generateId, deepClone }

import type { 
  VirtualListItem, 
  VirtualItem, 
  HeightCache, 
  RenderRange, 
  ScrollInfo,
  VisibleRange,
  ItemPosition,
  ScrollState
} from './types'

/**
 * 创建高度缓存
 */
export function createHeightCache(): HeightCache {
  return {
    heights: new Map(),
    totalHeight: 0,
    averageHeight: 50,
    initialized: false
  }
}

/**
 * 计算项目高度
 */
export function getItemHeight(
  index: number,
  item: VirtualListItem,
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): number {
  // 优先使用缓存
  if (cache.heights.has(index)) {
    return cache.heights.get(index)!
  }
  
  // 使用项目自身的高度
  if (item.height !== undefined) {
    cache.heights.set(index, item.height)
    return item.height
  }
  
  // 计算高度
  let height: number
  if (typeof itemHeight === 'function') {
    height = itemHeight(index, item)
  } else {
    height = itemHeight
  }
  
  // 缓存高度
  cache.heights.set(index, height)
  return height
}

/**
 * 更新高度缓存
 */
export function updateHeightCache(
  cache: HeightCache,
  index: number,
  height: number
): void {
  const oldHeight = cache.heights.get(index) || cache.averageHeight
  cache.heights.set(index, height)
  
  // 更新总高度
  cache.totalHeight += height - oldHeight
  
  // 更新平均高度
  if (cache.heights.size > 0) {
    cache.averageHeight = cache.totalHeight / cache.heights.size
  }
}

/**
 * 计算总高度
 */
export function calculateTotalHeight(
  dataSource: VirtualListItem[],
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): number {
  if (typeof itemHeight === 'number') {
    return dataSource.length * itemHeight
  }
  
  let total = 0
  for (let i = 0; i < dataSource.length; i++) {
    const item = dataSource[i]
    if (item) {
      total += getItemHeight(i, item, itemHeight, cache)
    }
  }
  
  cache.totalHeight = total
  return total
}

/**
 * 计算项目位置
 */
export function calculateItemPosition(
  index: number,
  dataSource: VirtualListItem[],
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): ItemPosition {
  let top = 0
  
  // 计算前面所有项目的高度
  for (let i = 0; i < index; i++) {
    const item = dataSource[i]
    if (item) {
      top += getItemHeight(i, item, itemHeight, cache)
    }
  }
  
  const currentItem = dataSource[index]
  if (!currentItem) {
    return { index, top: 0, bottom: 0, height: 0 }
  }
  
  const height = getItemHeight(index, currentItem, itemHeight, cache)
  const bottom = top + height
  
  return {
    index,
    top,
    bottom,
    height
  }
}

/**
 * 计算渲染范围
 */
export function calculateRenderRange(
  scrollTop: number,
  containerHeight: number,
  dataSource: VirtualListItem[],
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  buffer: number,
  cache: HeightCache
): RenderRange {
  if (dataSource.length === 0) {
    return {
      start: 0,
      end: 0,
      offsetTop: 0,
      startIndex: 0,
      endIndex: 0,
      startOffset: 0,
      endOffset: 0
    }
  }
  
  let startIndex = 0
  let endIndex = 0
  let startOffset = 0
  let endOffset = 0
  
  if (typeof itemHeight === 'number') {
    // 固定高度计算
    startIndex = Math.floor(scrollTop / itemHeight)
    endIndex = Math.min(
      dataSource.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )
    
    startOffset = startIndex * itemHeight
    endOffset = (endIndex + 1) * itemHeight
  } else {
    // 动态高度计算
    let currentTop = 0
    let found = false
    
    // 找到开始索引
    for (let i = 0; i < dataSource.length; i++) {
      const item = dataSource[i]
      if (!item) continue
      
      const height = getItemHeight(i, item, itemHeight, cache)
      
      if (currentTop + height > scrollTop && !found) {
        startIndex = i
        startOffset = currentTop
        found = true
      }
      
      if (currentTop > scrollTop + containerHeight) {
        endIndex = i - 1
        endOffset = currentTop
        break
      }
      
      currentTop += height
    }
    
    if (!found) {
      startIndex = 0
      startOffset = 0
    }
    
    if (endIndex === 0) {
      endIndex = dataSource.length - 1
      endOffset = currentTop
    }
  }
  
  // 应用缓冲区
  startIndex = Math.max(0, startIndex - buffer)
  endIndex = Math.min(dataSource.length - 1, endIndex + buffer)
  
  return {
    start: startIndex,
    end: endIndex,
    offsetTop: startOffset,
    startIndex,
    endIndex,
    startOffset,
    endOffset
  }
}

/**
 * 创建虚拟项目
 */
export function createVirtualItems(
  dataSource: VirtualListItem[],
  renderRange: RenderRange,
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): VirtualItem[] {
  const items: VirtualItem[] = []
  let currentTop = renderRange.startOffset
  
  for (let i = renderRange.startIndex; i <= renderRange.endIndex; i++) {
    if (i >= dataSource.length) break
    
    const item = dataSource[i]
    if (!item) continue
    
    const height = getItemHeight(i, item, itemHeight, cache)
    
    items.push({
      index: i,
      data: item,
      height,
      top: currentTop,
      bottom: currentTop + height,
      visible: true
    })
    
    currentTop += height
  }
  
  return items
}

/**
 * 计算滚动信息
 */
export function calculateScrollInfo(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): ScrollInfo {
  const isTop = scrollTop <= 0
  const isBottom = scrollTop + clientHeight >= scrollHeight - 1
  
  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    isTop,
    isBottom
  }
}

/**
 * 计算可见范围
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  dataSource: VirtualListItem[],
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): VisibleRange {
  const renderRange = calculateRenderRange(
    scrollTop,
    containerHeight,
    dataSource,
    itemHeight,
    0, // 不使用缓冲区
    cache
  )
  
  return {
    startIndex: renderRange.startIndex,
    endIndex: renderRange.endIndex,
    visibleCount: renderRange.endIndex - renderRange.startIndex + 1
  }
}

/**
 * 获取项目键值
 */
export function getItemKey(
  item: VirtualListItem,
  index: number,
  itemKey?: string | ((item: VirtualListItem, index: number) => string | number)
): string | number {
  if (typeof itemKey === 'function') {
    return itemKey(item, index)
  }
  
  if (typeof itemKey === 'string') {
    const value = (item as unknown as Record<string, unknown>)[itemKey]
    return (typeof value === 'string' || typeof value === 'number') ? value : index
  }
  
  const key = (item as { key?: string | number }).key
  return (typeof key === 'string' || typeof key === 'number') ? key : index
}

/**
 * 计算滚动到指定索引的位置
 */
export function calculateScrollToIndex(
  index: number,
  align: 'start' | 'center' | 'end' | 'auto',
  containerHeight: number,
  dataSource: VirtualListItem[],
  itemHeight: number | ((index: number, item: VirtualListItem) => number),
  cache: HeightCache
): number {
  if (index < 0 || index >= dataSource.length) {
    return 0
  }
  
  const position = calculateItemPosition(index, dataSource, itemHeight, cache)
  
  switch (align) {
    case 'start':
      return position.top
    
    case 'center':
      return position.top - (containerHeight - position.height) / 2
    
    case 'end':
      return position.bottom - containerHeight
    
    case 'auto':
    default:
      // 自动选择最佳对齐方式
      if (position.top < 0) {
        return position.top
      } else if (position.bottom > containerHeight) {
        return position.bottom - containerHeight
      }
      return 0
  }
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出

/**
 * 创建滚动状态
 */
export function createScrollState(): ScrollState {
  return {
    scrollTop: 0,
    direction: 'none',
    isScrolling: false,
    lastScrollTime: 0
  }
}

/**
 * 更新滚动状态
 */
export function updateScrollState(
  state: ScrollState,
  scrollTop: number
): ScrollState {
  const now = Date.now()
  const direction = scrollTop > state.scrollTop ? 'down' : 
                   scrollTop < state.scrollTop ? 'up' : 'none'
  
  return {
    scrollTop,
    direction,
    isScrolling: true,
    lastScrollTime: now
  }
}

/**
 * 检查是否应该启用虚拟滚动
 */
export function shouldEnableVirtual(
  dataLength: number,
  threshold: number,
  virtual: boolean
): boolean {
  return virtual && dataLength > threshold
}

/**
 * 格式化高度值
 */
export function formatHeight(height: number | string): string {
  if (typeof height === 'number') {
    return `${height}px`
  }
  return height
}

// generateId 和 deepClone 已从 '../../utils' 导入并重新导出