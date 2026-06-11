import { debounce as utilDebounce, throttle as utilThrottle } from '../../utils'

import type {
  AffixPosition,
  AffixTarget,
  AffixOffset,
  AffixBounds,
  AffixState,
  AffixConfig,
  AffixGlobalConfig,
  AffixPerformanceMonitor,
  AffixPerformanceReport,
  AffixDebugInfo,
  AffixUtils,
  ExAffixInstance
} from './types'

/**
 * 节流函数 - 包装以匹配组件类型定义
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  return utilThrottle(func, delay) as T
}

/**
 * 防抖函数 - 包装以匹配组件类型定义
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  return utilDebounce(func, delay) as T
}

/**
 * 默认全局配置
 */
export const defaultAffixConfig: AffixGlobalConfig = {
  defaultPosition: 'top',
  defaultOffsetTop: 0,
  defaultOffsetBottom: 0,
  defaultZIndex: 1000,
  defaultAnimationDuration: 200,
  defaultThrottleDelay: 16,
  defaultEnabled: true,
  defaultShowPlaceholder: true,
  defaultUseTransform: true,
  defaultListenResize: true,
  defaultCheckOnMount: true,
  defaultKeepWidth: true,
  defaultKeepHeight: false,
  cssVariables: {
    '--ex-affix-z-index': '1000',
    '--ex-affix-transition-duration': '200ms',
    '--ex-affix-transition-timing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ex-affix-placeholder-bg': 'transparent',
    '--ex-affix-placeholder-border': '1px dashed #d9d9d9'
  }
}

/**
 * 获取目标元素
 */
export function getTarget(target: AffixTarget): HTMLElement | Window {
  if (typeof target === 'function') {
    return target()
  }
  
  if (target instanceof HTMLElement) {
    return target
  }
  
  // 检查是否为 window 对象
  if (target === window) {
    return window
  }
  
  return window
}

/**
 * 获取滚动容器
 */
export function getScrollContainer(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement
  
  while (parent) {
    const { overflow, overflowY } = window.getComputedStyle(parent)
    
    if (/(auto|scroll|overlay)/.test(overflow + overflowY)) {
      return parent
    }
    
    parent = parent.parentElement
  }
  
  return window
}

/**
 * 获取元素边界信息
 */
export function getElementBounds(
  element: HTMLElement,
  container?: HTMLElement | Window
): DOMRect {
  const rect = element.getBoundingClientRect()
  
  if (!container || container === window) {
    return rect
  }
  
  const containerRect = (container as HTMLElement).getBoundingClientRect()
  
  return new DOMRect(
    rect.left - containerRect.left,
    rect.top - containerRect.top,
    rect.width,
    rect.height
  )
}

/**
 * 获取容器滚动信息
 */
export function getScrollInfo(container: HTMLElement | Window): {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
} {
  if (container === window) {
    return {
      scrollTop: window.pageYOffset || document.documentElement.scrollTop,
      scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientHeight: window.innerHeight,
      clientWidth: window.innerWidth
    }
  }
  
  const element = container as HTMLElement
  return {
    scrollTop: element.scrollTop,
    scrollLeft: element.scrollLeft,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth
  }
}

/**
 * 计算偏移量
 */
export function calculateOffset(
  element: HTMLElement,
  container: HTMLElement | Window,
  position: AffixPosition,
  offset: number
): AffixOffset {
  const elementRect = getElementBounds(element, container)
  
  const result: AffixOffset = {}
  
  if (position === 'top') {
    result.top = offset
    result.left = elementRect.left
  } else if (position === 'bottom') {
    result.bottom = offset
    result.left = elementRect.left
  }
  
  return result
}

/**
 * 检查是否需要固定
 */
export function shouldAffix(
  elementRect: DOMRect,
  containerRect: DOMRect,
  position: AffixPosition,
  offset: number,
  bounds?: AffixBounds
): boolean {
  // 检查边界限制
  if (bounds) {
    if (bounds.top !== undefined && elementRect.top < bounds.top) {
      return false
    }
    if (bounds.bottom !== undefined && elementRect.bottom > bounds.bottom) {
      return false
    }
    if (bounds.left !== undefined && elementRect.left < bounds.left) {
      return false
    }
    if (bounds.right !== undefined && elementRect.right > bounds.right) {
      return false
    }
  }
  
  if (position === 'top') {
    return elementRect.top <= offset
  } else if (position === 'bottom') {
    const containerHeight = containerRect.height || window.innerHeight
    return elementRect.bottom >= containerHeight - offset
  }
  
  return false
}

/**
 * 获取固定位置样式
 */
export function getAffixedStyles(
  position: AffixPosition,
  offset: AffixOffset,
  zIndex: number,
  useTransform: boolean,
  originalRect: DOMRect
): Record<string, string> {
  const styles: Record<string, string> = {
    position: 'fixed',
    zIndex: String(zIndex)
  }
  
  if (position === 'top') {
    styles.top = `${offset.top || 0}px`
    if (offset.left !== undefined) {
      if (useTransform) {
        styles.transform = `translateX(${offset.left}px)`
      } else {
        styles.left = `${offset.left}px`
      }
    }
  } else if (position === 'bottom') {
    styles.bottom = `${offset.bottom || 0}px`
    if (offset.left !== undefined) {
      if (useTransform) {
        styles.transform = `translateX(${offset.left}px)`
      } else {
        styles.left = `${offset.left}px`
      }
    }
  }
  
  // 保持原始宽度
  if (originalRect) {
    styles.width = `${originalRect.width}px`
  }
  
  return styles
}

/**
 * 获取占位元素样式
 */
export function getPlaceholderStyles(
  originalRect: DOMRect,
  visible: boolean
): Record<string, string> {
  return {
    width: `${originalRect.width}px`,
    height: `${originalRect.height}px`,
    visibility: visible ? 'visible' : 'hidden',
    pointerEvents: 'none'
  }
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出

/**
 * 获取计算样式
 */
export function getComputedStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * 设置样式
 */
export function setStyle(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

/**
 * 添加类名
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className)
}

/**
 * 移除类名
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className)
}

/**
 * 切换类名
 */
export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): void {
  if (force !== undefined) {
    element.classList.toggle(className, force)
  } else {
    element.classList.toggle(className)
  }
}

/**
 * 检查是否有类名
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 创建 Affix 配置
 */
export function createAffixConfig(
  options: Partial<AffixConfig>,
  globalConfig: AffixGlobalConfig = defaultAffixConfig
): AffixConfig {
  return {
    position: options.position || globalConfig.defaultPosition,
    offset: options.offset || (
      options.position === 'bottom' 
        ? globalConfig.defaultOffsetBottom 
        : globalConfig.defaultOffsetTop
    ),
    offsetTop: options.offsetTop || globalConfig.defaultOffsetTop,
    offsetBottom: options.offsetBottom || globalConfig.defaultOffsetBottom,
    target: options.target || window,
    bounds: options.bounds,
    enabled: options.enabled !== undefined ? options.enabled : globalConfig.defaultEnabled,
    zIndex: options.zIndex || globalConfig.defaultZIndex,
    animationDuration: options.animationDuration || globalConfig.defaultAnimationDuration,
    throttleDelay: options.throttleDelay || globalConfig.defaultThrottleDelay
  }
}

/**
 * 创建初始状态
 */
export function createInitialState(): AffixState {
  return {
    affixed: false,
    position: null,
    offset: {},
    originalRect: null,
    currentOffset: {},
    placeholderSize: {
      width: 0,
      height: 0
    }
  }
}

/**
 * 检查浏览器支持
 */
export function checkBrowserSupport(): {
  transform: boolean
  position: boolean
  getBoundingClientRect: boolean
  requestAnimationFrame: boolean
} {
  const testElement = document.createElement('div')
  
  return {
    transform: 'transform' in testElement.style,
    position: 'position' in testElement.style,
    getBoundingClientRect: typeof testElement.getBoundingClientRect === 'function',
    requestAnimationFrame: typeof window.requestAnimationFrame === 'function'
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  hasTouch: boolean
  pixelRatio: number
} {
  const userAgent = navigator.userAgent.toLowerCase()
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  return {
    isMobile: /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent),
    isTablet: /tablet|ipad/.test(userAgent),
    isDesktop: !/mobile|tablet|android|iphone|ipod|ipad|blackberry|iemobile|opera mini/.test(userAgent),
    hasTouch,
    pixelRatio: window.devicePixelRatio || 1
  }
}

/**
 * 性能监控器
 */
export function createPerformanceMonitor(): AffixPerformanceMonitor {
  let startTime = 0
  let scrollEventCount = 0
  let resizeEventCount = 0
  let positionUpdateCount = 0
  let totalUpdateTime = 0
  let maxUpdateTime = 0
  let minUpdateTime = Infinity
  
  return {
    get scrollEventCount() { return scrollEventCount },
    get resizeEventCount() { return resizeEventCount },
    get positionUpdateCount() { return positionUpdateCount },
    get averageUpdateTime() { 
      return positionUpdateCount > 0 ? totalUpdateTime / positionUpdateCount : 0 
    },
    get maxUpdateTime() { return maxUpdateTime },
    get minUpdateTime() { return minUpdateTime === Infinity ? 0 : minUpdateTime },
    
    start() {
      startTime = performance.now()
      scrollEventCount = 0
      resizeEventCount = 0
      positionUpdateCount = 0
      totalUpdateTime = 0
      maxUpdateTime = 0
      minUpdateTime = Infinity
    },
    
    stop() {
      // 停止监控
    },
    
    reset() {
      this.start()
    },
    
    getReport(): AffixPerformanceReport {
      const duration = performance.now() - startTime
      
      return {
        duration,
        events: {
          scroll: scrollEventCount,
          resize: resizeEventCount,
          positionUpdate: positionUpdateCount
        },
        performance: {
          averageUpdateTime: this.averageUpdateTime,
          maxUpdateTime,
          minUpdateTime: minUpdateTime === Infinity ? 0 : minUpdateTime,
          totalUpdateTime
        },
        memory: (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory ? {
          used: (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory.usedJSHeapSize,
          total: (performance as unknown as { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize
        } : undefined
      }
    }
  }
}

/**
 * 记录滚动事件
 */
export function recordScrollEvent(monitor: AffixPerformanceMonitor): void {
  (monitor as unknown as { scrollEventCount: number }).scrollEventCount++
}

/**
 * 记录窗口大小改变事件
 */
export function recordResizeEvent(monitor: AffixPerformanceMonitor): void {
  (monitor as unknown as { resizeEventCount: number }).resizeEventCount++
}

/**
 * 记录位置更新
 */
export function recordPositionUpdate(monitor: AffixPerformanceMonitor, updateTime: number): void {
  const m = monitor as unknown as { 
    positionUpdateCount: number
    totalUpdateTime: number
    maxUpdateTime: number
    minUpdateTime: number
  }
  m.positionUpdateCount++
  m.totalUpdateTime += updateTime
  m.maxUpdateTime = Math.max(m.maxUpdateTime, updateTime)
  m.minUpdateTime = Math.min(m.minUpdateTime, updateTime)
}

/**
 * 获取调试信息
 */
export function getDebugInfo(
  id: string,
  instance: ExAffixInstance,
  config: AffixConfig,
  monitor: AffixPerformanceMonitor
): AffixDebugInfo {
  const target = getTarget(config.target)
  const scrollInfo = getScrollInfo(target)
  
  return {
    id,
    state: instance.state,
    config,
    target: {
      type: target === window ? 'window' : 'element',
      scrollTop: scrollInfo.scrollTop,
      scrollHeight: scrollInfo.scrollHeight,
      clientHeight: scrollInfo.clientHeight
    },
    element: {
      width: instance.state.width || 0,
      height: instance.state.height || 0,
      top: instance.state.offset.top || 0,
      left: instance.state.offset.left || 0
    },
    performance: monitor.getReport()
  }
}

/**
 * 验证配置
 */
export function validateConfig(config: Partial<AffixConfig>): boolean {
  // 验证位置
  if (config.position && !['top', 'bottom'].includes(config.position)) {
    console.warn('Invalid affix position:', config.position)
    return false
  }
  
  // 验证偏移量
  if (config.offset !== undefined && (typeof config.offset !== 'number' || config.offset < 0)) {
    console.warn('Invalid affix offset:', config.offset)
    return false
  }
  
  // 验证 z-index
  if (config.zIndex !== undefined && (typeof config.zIndex !== 'number' || config.zIndex < 0)) {
    console.warn('Invalid affix zIndex:', config.zIndex)
    return false
  }
  
  // 验证动画持续时间
  if (config.animationDuration !== undefined && (typeof config.animationDuration !== 'number' || config.animationDuration < 0)) {
    console.warn('Invalid affix animationDuration:', config.animationDuration)
    return false
  }
  
  // 验证节流延迟
  if (config.throttleDelay !== undefined && (typeof config.throttleDelay !== 'number' || config.throttleDelay < 0)) {
    console.warn('Invalid affix throttleDelay:', config.throttleDelay)
    return false
  }
  
  return true
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
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

/**
 * 工具函数集合
 */
export const affixUtils: AffixUtils = {
  getTarget,
  getScrollContainer,
  getElementBounds,
  calculateOffset,
  shouldAffix,
  throttle,
  debounce,
  getComputedStyle,
  setStyle,
  addClass,
  removeClass,
  toggleClass,
  hasClass
}

/**
 * 检查是否在视口内
 */
export function isInViewport(element: HTMLElement, container?: HTMLElement | Window): boolean {
  const rect = getElementBounds(element, container)
  const containerInfo = getScrollInfo(container || window)
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= containerInfo.clientHeight &&
    rect.right <= containerInfo.clientWidth
  )
}

/**
 * 获取元素相对于容器的位置
 */
export function getRelativePosition(
  element: HTMLElement,
  container: HTMLElement | Window
): { top: number; left: number } {
  const elementRect = element.getBoundingClientRect()
  
  if (container === window) {
    return {
      top: elementRect.top + window.pageYOffset,
      left: elementRect.left + window.pageXOffset
    }
  }
  
  const containerRect = (container as HTMLElement).getBoundingClientRect()
  const scrollInfo = getScrollInfo(container)
  
  return {
    top: elementRect.top - containerRect.top + scrollInfo.scrollTop,
    left: elementRect.left - containerRect.left + scrollInfo.scrollLeft
  }
}

/**
 * 计算最佳 z-index
 */
export function calculateOptimalZIndex(element: HTMLElement): number {
  let maxZIndex = 0
  let current = element.parentElement
  
  while (current) {
    const zIndex = parseInt(getComputedStyle(current, 'z-index'), 10)
    if (!isNaN(zIndex) && zIndex > maxZIndex) {
      maxZIndex = zIndex
    }
    current = current.parentElement
  }
  
  return maxZIndex + 1
}

/**
 * 检查元素是否可见
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  )
}

/**
 * 获取最近的定位祖先
 */
export function getPositionedAncestor(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement
  
  while (parent) {
    const position = getComputedStyle(parent, 'position')
    if (['relative', 'absolute', 'fixed', 'sticky'].includes(position)) {
      return parent
    }
    parent = parent.parentElement
  }
  
  return null
}