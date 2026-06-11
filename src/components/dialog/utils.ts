import { debounce, throttle, generateId } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle, generateId }

import type { DialogSize, DialogPlacement, DialogTransition } from './types'

/**
 * 获取对话框尺寸样式
 */
export function getDialogSizeStyle(size: DialogSize, width?: string | number, height?: string | number) {
  const sizeMap: Record<DialogSize, { width: string; height?: string; minHeight?: string }> = {
    small: { width: '400px', minHeight: '200px' },
    medium: { width: '600px', minHeight: '300px' },
    large: { width: '800px', minHeight: '400px' },
    full: { width: '100vw', height: '100vh' },
    fullscreen: { width: '100vw', height: '100vh' }
  }

  const baseStyle = sizeMap[size] || sizeMap.medium

  return {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : baseStyle.width,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : baseStyle.height,
    minHeight: baseStyle.minHeight
  }
}

/**
 * 获取对话框位置样式
 */
export function getDialogPlacementStyle(placement: DialogPlacement, centered: boolean = false) {
  if (centered) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  const placementMap = {
    center: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    top: {
      top: '10%',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    bottom: {
      bottom: '10%',
      left: '50%',
      transform: 'translateX(-50%)'
    }
  }

  return placementMap[placement] || placementMap.center
}

/**
 * 获取动画类名
 */
export function getTransitionClass(transition: DialogTransition) {
  return `ex-dialog-${transition}`
}

/**
 * 锁定页面滚动
 */
export function lockScroll() {
  const body = document.body
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
  
  body.style.overflow = 'hidden'
  body.style.paddingRight = `${scrollBarWidth}px`
}

/**
 * 解锁页面滚动
 */
export function unlockScroll() {
  const body = document.body
  
  body.style.overflow = ''
  body.style.paddingRight = ''
}

/**
 * 获取可聚焦元素
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

/**
 * 焦点陷阱
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  
  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeydown)

  // 返回清理函数
  return () => {
    container.removeEventListener('keydown', handleKeydown)
  }
}

/**
 * 自动聚焦
 */
export function autoFocus(container: HTMLElement, selector?: string) {
  let targetElement: HTMLElement | null = null

  if (selector) {
    targetElement = container.querySelector(selector)
  }

  if (!targetElement) {
    const focusableElements = getFocusableElements(container)
    targetElement = focusableElements[0] || container
  }

  if (targetElement) {
    // 延迟聚焦，确保元素已渲染
    setTimeout(() => {
      targetElement!.focus()
    }, 100)
  }
}

/**
 * 获取 z-index
 */
let zIndexCounter = 2000

export function getNextZIndex(): number {
  return ++zIndexCounter
}

export function setZIndexBase(base: number): void {
  zIndexCounter = base
}

/**
 * 创建遮罩层
 */
export function createMask(zIndex: number, backgroundColor?: string): HTMLElement {
  const mask = document.createElement('div')
  mask.className = 'ex-dialog-mask'
  mask.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${backgroundColor || 'rgba(0, 0, 0, 0.5)'};
    z-index: ${zIndex};
    opacity: 0;
    transition: opacity var(--ex-transition-duration-base) var(--ex-transition-timing-function-standard);
  `
  
  return mask
}

/**
 * 显示遮罩层
 */
export function showMask(mask: HTMLElement): void {
  requestAnimationFrame(() => {
    mask.style.opacity = '1'
  })
}

/**
 * 隐藏遮罩层
 */
export function hideMask(mask: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    mask.style.opacity = '0'
    
    const handleTransitionEnd = () => {
      mask.removeEventListener('transitionend', handleTransitionEnd)
      resolve()
    }
    
    mask.addEventListener('transitionend', handleTransitionEnd)
    
    // 备用超时
    setTimeout(resolve, 300)
  })
}

/**
 * 获取挂载容器
 */
export function getContainer(container?: string | HTMLElement): HTMLElement {
  if (typeof container === 'string') {
    const element = document.querySelector(container)
    return element as HTMLElement || document.body
  }
  
  return container || document.body
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 获取视口尺寸
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

/**
 * 限制对话框尺寸
 */
export function constrainDialogSize(
  width: number,
  height: number,
  minWidth: number = 300,
  minHeight: number = 200,
  maxWidth?: number,
  maxHeight?: number
) {
  const viewport = getViewportSize()
  const padding = 40 // 视口边距

  const constrainedWidth = Math.max(
    minWidth,
    Math.min(
      width,
      maxWidth || viewport.width - padding,
      viewport.width - padding
    )
  )

  const constrainedHeight = Math.max(
    minHeight,
    Math.min(
      height,
      maxHeight || viewport.height - padding,
      viewport.height - padding
    )
  )

  return {
    width: constrainedWidth,
    height: constrainedHeight
  }
}

// debounce, throttle 和 generateId 已从 '../../utils' 导入并重新导出

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const viewport = getViewportSize()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  )
}

/**
 * 将元素移动到视口内
 */
export function moveElementToViewport(element: HTMLElement): void {
  const rect = element.getBoundingClientRect()
  const viewport = getViewportSize()
  const padding = 20

  let { left, top } = rect

  // 检查右边界
  if (rect.right > viewport.width) {
    left = viewport.width - rect.width - padding
  }

  // 检查左边界
  if (left < 0) {
    left = padding
  }

  // 检查下边界
  if (rect.bottom > viewport.height) {
    top = viewport.height - rect.height - padding
  }

  // 检查上边界
  if (top < 0) {
    top = padding
  }

  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>) as T[Extract<keyof T, string>]
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}