import { generateId } from '../../utils'
import { debounce, throttle } from '../../utils'
import type { ModalSize, ModalPlacement, ModalTransition } from './types'

// 重新导出工具函数，保持向后兼容
export { generateId, debounce, throttle }

/**
 * 获取下一个 z-index 值
 */
let currentZIndex = 2000
export function getNextZIndex(): number {
  return ++currentZIndex
}

/**
 * 重置 z-index 计数器
 */
export function resetZIndex(baseZIndex = 2000): void {
  currentZIndex = baseZIndex
}

/**
 * 获取容器元素
 */
export function getContainer(container?: string | HTMLElement): HTMLElement {
  if (typeof container === 'string') {
    const element = document.querySelector(container)
    return element as HTMLElement || document.body
  }
  if (container instanceof HTMLElement) {
    return container
  }
  return document.body
}

/**
 * 锁定页面滚动
 */
let scrollBarWidth = 0
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''

export function lockScroll(): void {
  if (typeof window === 'undefined') return

  const body = document.body
  const html = document.documentElement

  // 计算滚动条宽度
  if (scrollBarWidth === 0) {
    const scrollDiv = document.createElement('div')
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'
    body.appendChild(scrollDiv)
    scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    body.removeChild(scrollDiv)
  }

  // 保存原始样式
  originalBodyOverflow = body.style.overflow
  originalBodyPaddingRight = body.style.paddingRight

  // 检查是否有滚动条
  const hasScrollbar = html.scrollHeight > html.clientHeight

  if (hasScrollbar) {
    body.style.paddingRight = `${scrollBarWidth}px`
  }

  body.style.overflow = 'hidden'
}

/**
 * 解锁页面滚动
 */
export function unlockScroll(): void {
  if (typeof window === 'undefined') return

  const body = document.body
  body.style.overflow = originalBodyOverflow
  body.style.paddingRight = originalBodyPaddingRight
}

/**
 * 焦点陷阱
 */
export function trapFocus(element: HTMLElement): () => void {
  if (typeof window === 'undefined') return () => {}

  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>

  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        event.preventDefault()
        lastFocusableElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault()
        firstFocusableElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * 自动聚焦
 */
export function autoFocus(element: HTMLElement, selector?: string): void {
  if (typeof window === 'undefined') return

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
    // 如果没有找到可聚焦元素，聚焦容器本身
    targetElement = element
  }

  // 延迟聚焦，确保元素已渲染
  setTimeout(() => {
    targetElement?.focus()
  }, 100)
}

/**
 * 获取 Modal 尺寸样式
 */
export function getModalSizeStyle(
  size: ModalSize,
  customWidth?: string | number,
  customHeight?: string | number
): Record<string, string> {
  const style: Record<string, string> = {}

  // 自定义尺寸优先
  if (customWidth) {
    style.width = typeof customWidth === 'number' ? `${customWidth}px` : customWidth
  } else {
    // 预设尺寸
    const sizeMap = {
      small: '400px',
      medium: '520px',
      large: '720px',
      'extra-large': '960px'
    }
    style.width = sizeMap[size]
  }

  if (customHeight) {
    style.height = typeof customHeight === 'number' ? `${customHeight}px` : customHeight
  }

  return style
}

/**
 * 获取 Modal 位置样式
 */
export function getModalPlacementStyle(
  placement: ModalPlacement,
  centered: boolean
): Record<string, string> {
  const style: Record<string, string> = {}

  if (centered) {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  switch (placement) {
    case 'center':
      style.display = 'flex'
      style.alignItems = 'center'
      style.justifyContent = 'center'
      break
    case 'top':
      style.display = 'flex'
      style.alignItems = 'flex-start'
      style.justifyContent = 'center'
      style.paddingTop = 'var(--ex-spacing-xl)'
      break
    case 'bottom':
      style.display = 'flex'
      style.alignItems = 'flex-end'
      style.justifyContent = 'center'
      style.paddingBottom = 'var(--ex-spacing-xl)'
      break
    case 'left':
      style.display = 'flex'
      style.alignItems = 'center'
      style.justifyContent = 'flex-start'
      style.paddingLeft = 'var(--ex-spacing-xl)'
      break
    case 'right':
      style.display = 'flex'
      style.alignItems = 'center'
      style.justifyContent = 'flex-end'
      style.paddingRight = 'var(--ex-spacing-xl)'
      break
    case 'top-left':
      style.display = 'flex'
      style.alignItems = 'flex-start'
      style.justifyContent = 'flex-start'
      style.padding = 'var(--ex-spacing-xl)'
      break
    case 'top-right':
      style.display = 'flex'
      style.alignItems = 'flex-start'
      style.justifyContent = 'flex-end'
      style.padding = 'var(--ex-spacing-xl)'
      break
    case 'bottom-left':
      style.display = 'flex'
      style.alignItems = 'flex-end'
      style.justifyContent = 'flex-start'
      style.padding = 'var(--ex-spacing-xl)'
      break
    case 'bottom-right':
      style.display = 'flex'
      style.alignItems = 'flex-end'
      style.justifyContent = 'flex-end'
      style.padding = 'var(--ex-spacing-xl)'
      break
  }

  return style
}

/**
 * 获取过渡动画类名
 */
export function getTransitionClass(transition: ModalTransition): string {
  return `ex-modal-${transition}`
}

/**
 * 移动元素到视口内
 */
export function moveElementToViewport(element: HTMLElement): void {
  if (typeof window === 'undefined') return

  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = 0
  let y = 0

  // 检查水平位置
  if (rect.left < 0) {
    x = -rect.left + 20
  } else if (rect.right > viewportWidth) {
    x = viewportWidth - rect.right - 20
  }

  // 检查垂直位置
  if (rect.top < 0) {
    y = -rect.top + 20
  } else if (rect.bottom > viewportHeight) {
    y = viewportHeight - rect.bottom - 20
  }

  if (x !== 0 || y !== 0) {
    const currentTransform = element.style.transform || ''
    const translateMatch = currentTransform.match(/translate\(([^)]+)\)/)
    
    if (translateMatch) {
      element.style.transform = currentTransform.replace(
        /translate\([^)]+\)/,
        `translate(${x}px, ${y}px)`
      )
    } else {
      element.style.transform = `${currentTransform} translate(${x}px, ${y}px)`.trim()
    }
  }
}

// debounce 和 throttle 已从 '../../utils' 导入

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: HTMLElement): boolean {
  if (typeof window === 'undefined') return true

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

/**
 * 获取元素的计算样式
 */
export function getComputedStyle(element: HTMLElement, property: string): string {
  if (typeof window === 'undefined') return ''
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * 设置元素样式
 */
export function setElementStyle(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

/**
 * 添加事件监听器
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options)
  return () => element.removeEventListener(type, listener, options)
}

/**
 * 检查是否支持某个 CSS 属性
 */
export function supportsCSSProperty(property: string): boolean {
  if (typeof window === 'undefined') return false
  return property in document.documentElement.style
}

/**
 * 获取滚动条宽度
 */
export function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0

  if (scrollBarWidth > 0) return scrollBarWidth

  const scrollDiv = document.createElement('div')
  scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'
  document.body.appendChild(scrollDiv)
  scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)

  return scrollBarWidth
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * 检查是否为暗色主题
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 检查是否启用了减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}