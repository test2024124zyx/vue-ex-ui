import { debounce, throttle } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle }

import type { 
  TooltipPlacement, 
  TooltipPosition, 
  TooltipBounds, 
  TooltipTriggerInfo
} from './types'

/**
 * 获取元素的边界矩形信息
 */
export function getElementBounds(element: HTMLElement): TooltipBounds {
  const rect = element.getBoundingClientRect()
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取视口边界信息
 */
export function getViewportBounds(): TooltipBounds {
  return {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  }
}

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: HTMLElement, margin = 0): boolean {
  const rect = element.getBoundingClientRect()
  const viewport = getViewportBounds()
  
  return (
    rect.left >= -margin &&
    rect.top >= -margin &&
    rect.right <= viewport.width + margin &&
    rect.bottom <= viewport.height + margin
  )
}

/**
 * 检查元素是否可见
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element || !element.offsetParent) return false
  
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  )
}

/**
 * 获取触发元素信息
 */
export function getTriggerInfo(element: HTMLElement): TooltipTriggerInfo {
  const rect = element.getBoundingClientRect()
  const visible = isElementVisible(element)
  const inViewport = isElementInViewport(element)
  
  return {
    element,
    rect,
    visible,
    inViewport
  }
}

/**
 * 计算 tooltip 位置
 */
export function calculateTooltipPosition(
  triggerElement: HTMLElement,
  tooltipElement: HTMLElement,
  placement: TooltipPlacement,
  offset = 8,
  keepInViewport = true,
  viewportMargin = 8
): TooltipPosition {
  const triggerBounds = getElementBounds(triggerElement)
  const tooltipBounds = getElementBounds(tooltipElement)
  const viewport = getViewportBounds()
  
  let x = 0
  let y = 0
  let finalPlacement = placement
  
  // 根据位置计算初始坐标
  switch (placement) {
    case 'top':
      x = triggerBounds.left + (triggerBounds.width - tooltipBounds.width) / 2
      y = triggerBounds.top - tooltipBounds.height - offset
      break
    case 'top-start':
      x = triggerBounds.left
      y = triggerBounds.top - tooltipBounds.height - offset
      break
    case 'top-end':
      x = triggerBounds.right - tooltipBounds.width
      y = triggerBounds.top - tooltipBounds.height - offset
      break
    case 'bottom':
      x = triggerBounds.left + (triggerBounds.width - tooltipBounds.width) / 2
      y = triggerBounds.bottom + offset
      break
    case 'bottom-start':
      x = triggerBounds.left
      y = triggerBounds.bottom + offset
      break
    case 'bottom-end':
      x = triggerBounds.right - tooltipBounds.width
      y = triggerBounds.bottom + offset
      break
    case 'left':
      x = triggerBounds.left - tooltipBounds.width - offset
      y = triggerBounds.top + (triggerBounds.height - tooltipBounds.height) / 2
      break
    case 'left-start':
      x = triggerBounds.left - tooltipBounds.width - offset
      y = triggerBounds.top
      break
    case 'left-end':
      x = triggerBounds.left - tooltipBounds.width - offset
      y = triggerBounds.bottom - tooltipBounds.height
      break
    case 'right':
      x = triggerBounds.right + offset
      y = triggerBounds.top + (triggerBounds.height - tooltipBounds.height) / 2
      break
    case 'right-start':
      x = triggerBounds.right + offset
      y = triggerBounds.top
      break
    case 'right-end':
      x = triggerBounds.right + offset
      y = triggerBounds.bottom - tooltipBounds.height
      break
  }
  
  // 如果需要保持在视口内，进行边界检查和调整
  if (keepInViewport) {
    const result = adjustPositionForViewport(
      { x, y, placement: finalPlacement, top: y, left: x },
      tooltipBounds,
      viewport,
      viewportMargin,
      triggerBounds,
      offset
    )
    x = result.x
    y = result.y
    finalPlacement = result.placement
  }
  
  // 计算箭头位置
  const arrow = calculateArrowPosition(
    { x, y, placement: finalPlacement, top: y, left: x },
    triggerBounds,
    tooltipBounds
  )
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    top: Math.round(y),
    left: Math.round(x),
    placement: finalPlacement,
    arrow
  }
}

/**
 * 调整位置以保持在视口内
 */
function adjustPositionForViewport(
  position: TooltipPosition,
  tooltipBounds: TooltipBounds,
  viewport: TooltipBounds,
  margin: number,
  triggerBounds: TooltipBounds,
  offset: number
): TooltipPosition {
  let { x, y, placement } = position
  
  // 检查是否超出视口边界
  const overflowLeft = x < margin
  const overflowRight = x + tooltipBounds.width > viewport.width - margin
  const overflowTop = y < margin
  const overflowBottom = y + tooltipBounds.height > viewport.height - margin
  
  // 如果当前位置会溢出，尝试翻转到对面
  if (placement.startsWith('top') && overflowTop) {
    const newPlacement = placement.replace('top', 'bottom') as TooltipPlacement
    const newY = triggerBounds.bottom + offset
    if (newY + tooltipBounds.height <= viewport.height - margin) {
      placement = newPlacement
      y = newY
    }
  } else if (placement.startsWith('bottom') && overflowBottom) {
    const newPlacement = placement.replace('bottom', 'top') as TooltipPlacement
    const newY = triggerBounds.top - tooltipBounds.height - offset
    if (newY >= margin) {
      placement = newPlacement
      y = newY
    }
  } else if (placement.startsWith('left') && overflowLeft) {
    const newPlacement = placement.replace('left', 'right') as TooltipPlacement
    const newX = triggerBounds.right + offset
    if (newX + tooltipBounds.width <= viewport.width - margin) {
      placement = newPlacement
      x = newX
    }
  } else if (placement.startsWith('right') && overflowRight) {
    const newPlacement = placement.replace('right', 'left') as TooltipPlacement
    const newX = triggerBounds.left - tooltipBounds.width - offset
    if (newX >= margin) {
      placement = newPlacement
      x = newX
    }
  }
  
  // 微调位置以确保完全在视口内
  if (x < margin) {
    x = margin
  } else if (x + tooltipBounds.width > viewport.width - margin) {
    x = viewport.width - tooltipBounds.width - margin
  }
  
  if (y < margin) {
    y = margin
  } else if (y + tooltipBounds.height > viewport.height - margin) {
    y = viewport.height - tooltipBounds.height - margin
  }
  
  return { x, y, placement, top: y, left: x }
}

/**
 * 计算箭头位置
 */
function calculateArrowPosition(
  position: TooltipPosition,
  triggerBounds: TooltipBounds,
  tooltipBounds: TooltipBounds
): TooltipPosition['arrow'] {
  const { x, y, placement } = position
  const arrowSize = 6 // 箭头大小
  
  let arrowX = 0
  let arrowY = 0
  
  if (placement.startsWith('top')) {
    arrowY = y + tooltipBounds.height
    
    if (placement === 'top') {
      arrowX = x + tooltipBounds.width / 2 - arrowSize / 2
    } else if (placement === 'top-start') {
      arrowX = Math.min(x + 12, triggerBounds.left + triggerBounds.width / 2 - arrowSize / 2)
    } else if (placement === 'top-end') {
      arrowX = Math.max(x + tooltipBounds.width - 12 - arrowSize, triggerBounds.left + triggerBounds.width / 2 - arrowSize / 2)
    }
  } else if (placement.startsWith('bottom')) {
    arrowY = y - arrowSize
    
    if (placement === 'bottom') {
      arrowX = x + tooltipBounds.width / 2 - arrowSize / 2
    } else if (placement === 'bottom-start') {
      arrowX = Math.min(x + 12, triggerBounds.left + triggerBounds.width / 2 - arrowSize / 2)
    } else if (placement === 'bottom-end') {
      arrowX = Math.max(x + tooltipBounds.width - 12 - arrowSize, triggerBounds.left + triggerBounds.width / 2 - arrowSize / 2)
    }
  } else if (placement.startsWith('left')) {
    arrowX = x + tooltipBounds.width
    
    if (placement === 'left') {
      arrowY = y + tooltipBounds.height / 2 - arrowSize / 2
    } else if (placement === 'left-start') {
      arrowY = Math.min(y + 12, triggerBounds.top + triggerBounds.height / 2 - arrowSize / 2)
    } else if (placement === 'left-end') {
      arrowY = Math.max(y + tooltipBounds.height - 12 - arrowSize, triggerBounds.top + triggerBounds.height / 2 - arrowSize / 2)
    }
  } else if (placement.startsWith('right')) {
    arrowX = x - arrowSize
    
    if (placement === 'right') {
      arrowY = y + tooltipBounds.height / 2 - arrowSize / 2
    } else if (placement === 'right-start') {
      arrowY = Math.min(y + 12, triggerBounds.top + triggerBounds.height / 2 - arrowSize / 2)
    } else if (placement === 'right-end') {
      arrowY = Math.max(y + tooltipBounds.height - 12 - arrowSize, triggerBounds.top + triggerBounds.height / 2 - arrowSize / 2)
    }
  }
  
  return {
    x: Math.round(arrowX),
    y: Math.round(arrowY)
  }
}

/**
 * 跟随鼠标计算位置
 */
export function calculateMouseFollowPosition(
  mouseEvent: MouseEvent,
  tooltipElement: HTMLElement,
  offset = { x: 10, y: 10 },
  keepInViewport = true,
  viewportMargin = 8
): { x: number; y: number } {
  const tooltipBounds = getElementBounds(tooltipElement)
  const viewport = getViewportBounds()
  
  let x = mouseEvent.clientX + offset.x
  let y = mouseEvent.clientY + offset.y
  
  if (keepInViewport) {
    // 确保不超出视口右边界
    if (x + tooltipBounds.width > viewport.width - viewportMargin) {
      x = mouseEvent.clientX - tooltipBounds.width - offset.x
    }
    
    // 确保不超出视口下边界
    if (y + tooltipBounds.height > viewport.height - viewportMargin) {
      y = mouseEvent.clientY - tooltipBounds.height - offset.y
    }
    
    // 确保不超出视口左边界
    if (x < viewportMargin) {
      x = viewportMargin
    }
    
    // 确保不超出视口上边界
    if (y < viewportMargin) {
      y = viewportMargin
    }
  }
  
  return { x: Math.round(x), y: Math.round(y) }
}

/**
 * 获取最佳位置
 */
export function getBestPlacement(
  triggerElement: HTMLElement,
  tooltipElement: HTMLElement,
  preferredPlacements: TooltipPlacement[],
  offset = 8,
  viewportMargin = 8
): TooltipPlacement {
  const viewport = getViewportBounds()
  
  for (const placement of preferredPlacements) {
    const position = calculateTooltipPosition(
      triggerElement,
      tooltipElement,
      placement,
      offset,
      false // 不自动调整，只计算原始位置
    )
    
    // 检查这个位置是否完全在视口内
    const inViewport = (
      position.x !== undefined &&
      position.y !== undefined &&
      position.x >= viewportMargin &&
      position.y >= viewportMargin &&
      position.x + tooltipElement.offsetWidth <= viewport.width - viewportMargin &&
      position.y + tooltipElement.offsetHeight <= viewport.height - viewportMargin
    )
    
    if (inViewport) {
      return placement
    }
  }
  
  // 如果没有完全合适的位置，返回第一个
  return preferredPlacements[0] || 'top'
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出

/**
 * 获取滚动父元素
 */
export function getScrollParents(element: HTMLElement): HTMLElement[] {
  const scrollParents: HTMLElement[] = []
  let parent = element.parentElement
  
  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent)
    const overflow = style.overflow + style.overflowX + style.overflowY
    
    if (/(auto|scroll)/.test(overflow)) {
      scrollParents.push(parent)
    }
    
    parent = parent.parentElement
  }
  
  // 总是包含 window
  scrollParents.push(document.documentElement)
  
  return scrollParents
}

/**
 * 添加滚动监听器
 */
export function addScrollListeners(
  element: HTMLElement,
  callback: () => void,
  options: { passive?: boolean; capture?: boolean } = {}
): () => void {
  const scrollParents = getScrollParents(element)
  const listeners: Array<{ element: HTMLElement | Window; handler: () => void }> = []
  
  // 添加滚动监听
  scrollParents.forEach(parent => {
    const target = parent === document.documentElement ? window : parent
    const handler = throttle(callback, 16) // 60fps
    
    target.addEventListener('scroll', handler, options)
    listeners.push({ element: target, handler })
  })
  
  // 添加窗口大小变化监听
  const resizeHandler = throttle(callback, 16)
  window.addEventListener('resize', resizeHandler, options)
  listeners.push({ element: window, handler: resizeHandler })
  
  // 返回清理函数
  return () => {
    listeners.forEach(({ element, handler }) => {
      element.removeEventListener('scroll', handler)
      if (element === window) {
        element.removeEventListener('resize', handler)
      }
    })
  }
}

/**
 * 获取 z-index
 */
export function getZIndex(baseZIndex = 1000): number {
  const elements = Array.from(document.querySelectorAll('*'))
  let maxZIndex = baseZIndex
  
  elements.forEach(el => {
    const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10)
    if (!isNaN(zIndex) && zIndex > maxZIndex) {
      maxZIndex = zIndex
    }
  })
  
  return maxZIndex + 1
}

/**
 * 创建遮罩层
 */
export function createOverlay(zIndex: number, onClick?: () => void): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'ex-tooltip-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${zIndex - 1};
    background: transparent;
    pointer-events: auto;
  `
  
  if (onClick) {
    overlay.addEventListener('click', onClick)
  }
  
  document.body.appendChild(overlay)
  
  return overlay
}

/**
 * 移除遮罩层
 */
export function removeOverlay(overlay: HTMLElement): void {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay)
  }
}

/**
 * 检查是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取触摸事件坐标
 */
export function getTouchCoordinates(event: TouchEvent): { x: number; y: number } {
  const touch = event.touches[0] || event.changedTouches[0]
  if (touch) {
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }
  return { x: 0, y: 0 }
}

/**
 * 格式化尺寸值
 */
export function formatSize(size: string | number): string {
  if (typeof size === 'number') {
    return `${size}px`
  }
  return size
}

/**
 * 解析偏移量
 */
export function parseOffset(offset: number | [number, number]): { x: number; y: number } {
  if (Array.isArray(offset)) {
    return { x: offset[0], y: offset[1] }
  }
  return { x: offset, y: offset }
}

/**
 * 获取容器元素
 */
export function getContainer(
  container: string | HTMLElement | (() => HTMLElement) | undefined
): HTMLElement {
  if (!container) {
    return document.body
  }
  
  if (typeof container === 'string') {
    const element = document.querySelector(container) as HTMLElement
    return element || document.body
  }
  
  if (typeof container === 'function') {
    return container() || document.body
  }
  
  return container
}

/**
 * 检查元素是否为后代
 */
export function isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
  return parent.contains(child)
}

/**
 * 获取元素的可聚焦子元素
 */
export function getFocusableElements(element: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')
  
  return Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[]
}

/**
 * 设置焦点陷阱
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = getFocusableElements(element)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }
  
  element.addEventListener('keydown', handleKeydown)
  
  // 返回清理函数
  return () => {
    element.removeEventListener('keydown', handleKeydown)
  }
}