import { generateId, deepClone } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { generateId, deepClone }

import type { ListItem, ListGrid, VirtualScrollConfig } from './types'

/**
 * 生成列表项的唯一键
 */
export function getListItemKey(
  item: ListItem,
  index: number,
  rowKey?: string | ((item: ListItem) => string | number)
): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(item)
  }
  
  if (typeof rowKey === 'string') {
    const value = item[rowKey]
    return (typeof value === 'string' || typeof value === 'number') ? value : index
  }
  
  const key = item.key
  return (typeof key === 'string' || typeof key === 'number') ? key : index
}

/**
 * 计算网格列数
 */
export function getGridColumns(grid: ListGrid, containerWidth: number): number {
  if (!grid) return 1
  
  // 响应式断点（与项目标准一致）
  const breakpoints = {
    xxl: 1536,  // 2xl
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 480,
    xs: 0
  }
  
  // 按断点从大到小检查
  for (const [breakpoint, width] of Object.entries(breakpoints)) {
    if (containerWidth >= width && grid[breakpoint as keyof ListGrid]) {
      return grid[breakpoint as keyof ListGrid] as number
    }
  }
  
  return grid.column || 1
}

/**
 * 计算网格间隔
 */
export function getGridGutter(grid: ListGrid): [number, number] {
  if (!grid?.gutter) return [0, 0]
  
  if (Array.isArray(grid.gutter)) {
    const [h, v] = grid.gutter
    return [h ?? 0, v ?? 0]
  }
  
  return [grid.gutter, grid.gutter]
}

/**
 * 计算网格项样式
 */
export function getGridItemStyle(
  grid: ListGrid,
  containerWidth: number,
  index: number
): Record<string, string> {
  if (!grid) return {}
  
  const columns = getGridColumns(grid, containerWidth)
  const [gutterX, gutterY] = getGridGutter(grid)
  
  const width = `calc(${100 / columns}% - ${gutterX * (columns - 1) / columns}px)`
  const marginRight = (index + 1) % columns === 0 ? '0' : `${gutterX}px`
  const marginBottom = `${gutterY}px`
  
  return {
    width,
    marginRight,
    marginBottom,
    display: 'inline-block',
    verticalAlign: 'top'
  }
}

/**
 * 分页数据处理
 */
export function paginateData<T>(
  data: T[],
  current: number,
  pageSize: number
): T[] {
  const start = (current - 1) * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

/**
 * 计算分页信息
 */
export function getPaginationInfo(
  total: number,
  current: number,
  pageSize: number
): {
  totalPages: number
  startIndex: number
  endIndex: number
  hasNext: boolean
  hasPrev: boolean
} {
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (current - 1) * pageSize + 1
  const endIndex = Math.min(current * pageSize, total)
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNext: current < totalPages,
    hasPrev: current > 1
  }
}

/**
 * 虚拟滚动计算
 */
export function calculateVirtualItems(
  config: VirtualScrollConfig,
  scrollTop: number,
  containerHeight: number,
  totalItems: number
): {
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
} {
  const { itemHeight = 50, buffer = 5 } = config
  
  let startIndex: number
  let endIndex: number
  let offsetY: number
  let totalHeight: number
  
  if (typeof itemHeight === 'function') {
    // 动态高度计算（简化版本）
    let currentHeight = 0
    startIndex = 0
    
    // 找到开始索引
    for (let i = 0; i < totalItems; i++) {
      const height = itemHeight(i)
      if (currentHeight + height > scrollTop) {
        startIndex = Math.max(0, i - buffer)
        break
      }
      currentHeight += height
    }
    
    // 计算偏移量
    offsetY = 0
    for (let i = 0; i < startIndex; i++) {
      offsetY += itemHeight(i)
    }
    
    // 找到结束索引
    currentHeight = offsetY
    endIndex = startIndex
    for (let i = startIndex; i < totalItems; i++) {
      const height = itemHeight(i)
      currentHeight += height
      if (currentHeight > scrollTop + containerHeight) {
        endIndex = Math.min(totalItems - 1, i + buffer)
        break
      }
    }
    
    // 计算总高度
    totalHeight = 0
    for (let i = 0; i < totalItems; i++) {
      totalHeight += itemHeight(i)
    }
  } else {
    // 固定高度计算
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    endIndex = Math.min(totalItems - 1, startIndex + visibleCount + buffer * 2)
    offsetY = startIndex * itemHeight
    totalHeight = totalItems * itemHeight
  }
  
  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight
  }
}

// debounce 和 throttle 已从 '../../utils' 导入

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 滚动到指定元素
 */
export function scrollToElement(
  _container: Element,
  target: Element,
  options: ScrollIntoViewOptions = {}
): void {
  const defaultOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest'
  }
  
  target.scrollIntoView({ ...defaultOptions, ...options })
}

// generateId 和 deepClone 已从 '../../utils' 导入并在文件开头重新导出