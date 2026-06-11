import { debounce, throttle, generateId } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle, generateId }

import type { DrawerSize, DrawerPlacement, DrawerTransition } from './types'

/**
 * 获取 Drawer 尺寸样式
 */
export function getDrawerSizeStyle(
  size: DrawerSize,
  placement: DrawerPlacement,
  customWidth?: string | number,
  customHeight?: string | number
): Record<string, string> {
  const style: Record<string, string> = {}
  
  // 如果有自定义尺寸，优先使用
  if (customWidth && (placement === 'left' || placement === 'right')) {
    style.width = typeof customWidth === 'number' ? `${customWidth}px` : customWidth
    return style
  }
  
  if (customHeight && (placement === 'top' || placement === 'bottom')) {
    style.height = typeof customHeight === 'number' ? `${customHeight}px` : customHeight
    return style
  }
  
  // 根据位置和尺寸设置默认值
  if (placement === 'left' || placement === 'right') {
    const widthMap: Record<DrawerSize, string> = {
      small: '280px',
      medium: '378px',
      large: '520px',
      'extra-large': '720px'
    }
    style.width = (widthMap[size] || widthMap.medium) as string
  } else {
    const heightMap: Record<DrawerSize, string> = {
      small: '240px',
      medium: '320px',
      large: '480px',
      'extra-large': '640px'
    }
    style.height = (heightMap[size] || heightMap.medium) as string
  }
  
  return style
}

/**
 * 获取 Drawer 位置样式
 */
export function getDrawerPlacementStyle(placement: DrawerPlacement): Record<string, string> {
  const style: Record<string, string> = {}
  
  switch (placement) {
    case 'left':
      style.left = '0'
      style.top = '0'
      style.bottom = '0'
      break
    case 'right':
      style.right = '0'
      style.top = '0'
      style.bottom = '0'
      break
    case 'top':
      style.top = '0'
      style.left = '0'
      style.right = '0'
      break
    case 'bottom':
      style.bottom = '0'
      style.left = '0'
      style.right = '0'
      break
  }
  
  return style
}

/**
 * 获取过渡动画类名
 */
export function getTransitionClass(transition: DrawerTransition, placement: DrawerPlacement): string {
  if (transition === 'slide') {
    return `ex-drawer-slide-${placement}`
  }
  return `ex-drawer-${transition}`
}

/**
 * 锁定页面滚动
 */
export function lockScroll(): void {
  const body = document.body
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
  
  if (!body.style.paddingRight) {
    body.style.paddingRight = `${scrollBarWidth}px`
  }
  
  body.style.overflow = 'hidden'
}

/**
 * 解锁页面滚动
 */
export function unlockScroll(): void {
  const body = document.body
  body.style.overflow = ''
  body.style.paddingRight = ''
}

/**
 * 焦点陷阱
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
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
  
  return () => {
    element.removeEventListener('keydown', handleKeydown)
  }
}

/**
 * 自动聚焦
 */
export function autoFocus(element: HTMLElement, selector?: string): void {
  let targetElement: HTMLElement | null = null
  
  if (selector) {
    targetElement = element.querySelector(selector) as HTMLElement
  }
  
  if (!targetElement) {
    // 查找第一个可聚焦元素
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    targetElement = focusableElements[0] || null
  }
  
  if (!targetElement) {
    // 如果没有找到可聚焦元素，聚焦到容器本身
    targetElement = element
  }
  
  targetElement?.focus()
}

/**
 * 获取下一个 z-index 值
 */
let currentZIndex = 1000
export function getNextZIndex(): number {
  return ++currentZIndex
}

/**
 * 获取容器元素
 */
export function getContainer(container?: string | HTMLElement | (() => HTMLElement)): HTMLElement {
  if (typeof container === 'string') {
    return document.querySelector(container) || document.body
  }
  
  if (typeof container === 'function') {
    return container()
  }
  
  if (container instanceof HTMLElement) {
    return container
  }
  
  return document.body
}

// generateId 已从 '../../utils' 导入并重新导出

/**
 * 确保元素在视口内
 */
export function moveElementToViewport(element: HTMLElement): void {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let x = 0
  let y = 0
  
  // 检查水平位置
  if (rect.right > viewportWidth) {
    x = viewportWidth - rect.width - 20
  }
  if (rect.left < 0) {
    x = 20
  }
  
  // 检查垂直位置
  if (rect.bottom > viewportHeight) {
    y = viewportHeight - rect.height - 20
  }
  if (rect.top < 0) {
    y = 20
  }
  
  if (x !== 0 || y !== 0) {
    element.style.transform = `translate(${x}px, ${y}px)`
  }
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出

/**
 * 推拉模式：推开页面内容
 */
export function pushPageContent(
  placement: DrawerPlacement,
  size: number,
  container?: string
): void {
  const targetContainer = container 
    ? document.querySelector(container) as HTMLElement
    : document.body
  
  if (!targetContainer) return
  
  const transform = getPageTransform(placement, size)
  targetContainer.style.transform = transform
  targetContainer.style.transition = 'transform 0.3s ease'
}

/**
 * 推拉模式：恢复页面内容
 */
export function pullPageContent(container?: string): void {
  const targetContainer = container 
    ? document.querySelector(container) as HTMLElement
    : document.body
  
  if (!targetContainer) return
  
  targetContainer.style.transform = ''
  
  // 清理过渡效果
  setTimeout(() => {
    targetContainer.style.transition = ''
  }, 300)
}

/**
 * 获取页面推拉变换
 */
function getPageTransform(placement: DrawerPlacement, size: number): string {
  switch (placement) {
    case 'left':
      return `translateX(${size}px)`
    case 'right':
      return `translateX(-${size}px)`
    case 'top':
      return `translateY(${size}px)`
    case 'bottom':
      return `translateY(-${size}px)`
    default:
      return ''
  }
}

/**
 * 获取调整大小的方向
 */
export function getResizeDirection(placement: DrawerPlacement): 'horizontal' | 'vertical' {
  return placement === 'left' || placement === 'right' ? 'horizontal' : 'vertical'
}

/**
 * 计算调整后的尺寸
 */
export function calculateResizedSize(
  placement: DrawerPlacement,
  startSize: number,
  startPosition: { x: number; y: number },
  currentPosition: { x: number; y: number },
  minSize: number = 200,
  maxSize: number = window.innerWidth * 0.8
): number {
  let delta = 0
  
  switch (placement) {
    case 'left':
      delta = currentPosition.x - startPosition.x
      break
    case 'right':
      delta = startPosition.x - currentPosition.x
      break
    case 'top':
      delta = currentPosition.y - startPosition.y
      break
    case 'bottom':
      delta = startPosition.y - currentPosition.y
      break
  }
  
  const newSize = startSize + delta
  return Math.max(minSize, Math.min(maxSize, newSize))
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取移动端安全区域
 */
export function getSafeAreaInsets(): {
  top: number
  right: number
  bottom: number
  left: number
} {
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10)
  }
}