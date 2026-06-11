import { debounce as utilDebounce, throttle as utilThrottle } from '../../utils'

import type {
  BackTopPosition,
  BackTopTarget,
  BackTopOffset,
  BackTopTrigger,
  BackTopScrollInfo,
  BackTopScrollBehavior,
  BackTopGlobalConfig,
  BackTopThemeConfig,
  BackTopAnimationConfig,
  BackTopPerformanceMonitor,
  BackTopPerformanceReport,
  BackTopDragState,
  BackTopUtils
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
import type { CSSProperties } from 'vue'

/**
 * 默认主题配置
 */
export const defaultThemeConfig: BackTopThemeConfig = {
  backgroundColor: '#ffffff',
  textColor: '#666666',
  borderColor: '#d9d9d9',
  hoverBackgroundColor: '#1890ff',
  hoverTextColor: '#ffffff',
  hoverBorderColor: '#1890ff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  hoverBoxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
}

/**
 * 默认动画配置
 */
export const defaultAnimationConfig: BackTopAnimationConfig = {
  enterDuration: 300,
  leaveDuration: 200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enabled: true,
  scrollDuration: 500,
  scrollEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}

/**
 * 默认全局配置
 */
export const defaultBackTopConfig: BackTopGlobalConfig = {
  defaultPosition: 'bottom-right',
  defaultShape: 'circle',
  defaultSize: 'medium',
  defaultVisibilityHeight: 400,
  defaultScrollBehavior: 'smooth',
  defaultScrollDuration: 500,
  defaultAnimation: 'fade',
  defaultZIndex: 1000,
  defaultThrottleDelay: 16,
  defaultEnabled: true,
  defaultShowOnMobile: true,
  defaultMobileBreakpoint: 768,
  defaultTheme: defaultThemeConfig,
  defaultAnimationConfig: defaultAnimationConfig,
  cssVariables: {
    '--ex-back-top-bg': '#ffffff',
    '--ex-back-top-color': '#666666',
    '--ex-back-top-border': '#d9d9d9',
    '--ex-back-top-hover-bg': '#1890ff',
    '--ex-back-top-hover-color': '#ffffff',
    '--ex-back-top-hover-border': '#1890ff',
    '--ex-back-top-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
    '--ex-back-top-hover-shadow': '0 4px 12px rgba(24, 144, 255, 0.3)',
    '--ex-back-top-z-index': '1000',
    '--ex-back-top-transition': '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '--ex-back-top-size-small': '36px',
    '--ex-back-top-size-medium': '48px',
    '--ex-back-top-size-large': '60px'
  }
}

/**
 * 获取目标元素
 */
export function getTarget(target: BackTopTarget): HTMLElement | Window {
  if (typeof target === 'function') {
    return target()
  }
  
  if (typeof target === 'string') {
    const element = document.querySelector(target) as HTMLElement
    return element || window
  }
  
  if (target instanceof HTMLElement) {
    return target
  }
  
  return window
}

/**
 * 获取滚动信息
 */
export function getScrollInfo(target: HTMLElement | Window): BackTopScrollInfo {
  let scrollTop: number
  let scrollHeight: number
  let clientHeight: number
  
  if (target === window) {
    scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    clientHeight = window.innerHeight
  } else {
    const element = target as HTMLElement
    scrollTop = element.scrollTop
    scrollHeight = element.scrollHeight
    clientHeight = element.clientHeight
  }
  
  const scrollPercent = scrollHeight > clientHeight 
    ? Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100))
    : 0
  
  // 计算滚动速度（简化版本）
  const scrollSpeed = Math.abs(scrollTop - ((getScrollInfo as unknown as { lastScrollTop?: number }).lastScrollTop || 0))
  ;(getScrollInfo as unknown as { lastScrollTop: number }).lastScrollTop = scrollTop
  
  // 判断滚动方向
  const scrollingDown = scrollTop > ((getScrollInfo as unknown as { prevScrollTop?: number }).prevScrollTop || 0)
  ;(getScrollInfo as unknown as { prevScrollTop: number }).prevScrollTop = scrollTop
  
  return {
    scrollTop,
    scrollPercent,
    scrollHeight,
    clientHeight,
    scrollingDown,
    scrollSpeed
  }
}

/**
 * 检查是否应该显示
 */
export function shouldShow(scrollInfo: BackTopScrollInfo, trigger: BackTopTrigger): boolean {
  // 自定义触发条件
  if (trigger.custom) {
    return trigger.custom(scrollInfo)
  }
  
  // 滚动距离触发
  if (trigger.scrollTop !== undefined) {
    return scrollInfo.scrollTop >= trigger.scrollTop
  }
  
  // 滚动百分比触发
  if (trigger.scrollPercent !== undefined) {
    return scrollInfo.scrollPercent >= trigger.scrollPercent
  }
  
  return false
}

/**
 * 滚动到指定位置
 */
export function scrollToPosition(
  target: HTMLElement | Window,
  position: number,
  options: {
    behavior: BackTopScrollBehavior
    duration: number
  }
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now()
    const startPosition = getScrollInfo(target).scrollTop
    const distance = position - startPosition
    
    if (options.behavior === 'instant' || options.duration <= 0) {
      // 立即滚动
      if (target === window) {
        window.scrollTo(0, position)
      } else {
        ;(target as HTMLElement).scrollTop = position
      }
      resolve()
      return
    }
    
    if (options.behavior === 'smooth' && 'scrollTo' in target && typeof target.scrollTo === 'function') {
      // 使用原生平滑滚动
      try {
        if (target === window) {
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          })
        } else {
          ;(target as HTMLElement).scrollTo({
            top: position,
            behavior: 'smooth'
          })
        }
        
        // 监听滚动结束
        let timeoutId: number
        const checkScrollEnd = () => {
          clearTimeout(timeoutId)
          timeoutId = window.setTimeout(() => {
            resolve()
          }, 100)
        }
        
        target.addEventListener('scroll', checkScrollEnd, { passive: true })
        setTimeout(() => {
          target.removeEventListener('scroll', checkScrollEnd)
          resolve()
        }, options.duration + 100)
        
        return
      } catch (_error) {
        // 降级到自定义动画
      }
    }
    
    // 自定义动画滚动
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / options.duration, 1)
      const easedProgress = easeOutCubic(progress)
      const currentPosition = startPosition + distance * easedProgress
      
      if (target === window) {
        window.scrollTo(0, currentPosition)
      } else {
        ;(target as HTMLElement).scrollTop = currentPosition
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }
    
    requestAnimationFrame(animate)
  })
}

/**
 * 获取位置样式
 */
export function getPositionStyles(
  position: BackTopPosition,
  offset: BackTopOffset
): CSSProperties {
  const styles: CSSProperties = {
    position: 'fixed'
  }
  
  const defaultOffset = getDefaultOffset(position)
  const finalOffset = { ...defaultOffset, ...offset }
  
  switch (position) {
    case 'bottom-right':
      styles.bottom = typeof finalOffset.bottom === 'number' 
        ? `${finalOffset.bottom}px` 
        : finalOffset.bottom
      styles.right = typeof finalOffset.right === 'number' 
        ? `${finalOffset.right}px` 
        : finalOffset.right
      break
    case 'bottom-left':
      styles.bottom = typeof finalOffset.bottom === 'number' 
        ? `${finalOffset.bottom}px` 
        : finalOffset.bottom
      styles.left = typeof finalOffset.left === 'number' 
        ? `${finalOffset.left}px` 
        : finalOffset.left
      break
    case 'top-right':
      styles.top = typeof finalOffset.top === 'number' 
        ? `${finalOffset.top}px` 
        : finalOffset.top
      styles.right = typeof finalOffset.right === 'number' 
        ? `${finalOffset.right}px` 
        : finalOffset.right
      break
    case 'top-left':
      styles.top = typeof finalOffset.top === 'number' 
        ? `${finalOffset.top}px` 
        : finalOffset.top
      styles.left = typeof finalOffset.left === 'number' 
        ? `${finalOffset.left}px` 
        : finalOffset.left
      break
    case 'bottom-center':
      styles.bottom = typeof finalOffset.bottom === 'number' 
        ? `${finalOffset.bottom}px` 
        : finalOffset.bottom
      styles.left = '50%'
      styles.transform = 'translateX(-50%)'
      break
    case 'top-center':
      styles.top = typeof finalOffset.top === 'number' 
        ? `${finalOffset.top}px` 
        : finalOffset.top
      styles.left = '50%'
      styles.transform = 'translateX(-50%)'
      break
  }
  
  return styles
}

/**
 * 获取默认偏移
 */
export function getDefaultOffset(position: BackTopPosition): BackTopOffset {
  const defaultValue = 24
  
  switch (position) {
    case 'bottom-right':
      return { bottom: defaultValue, right: defaultValue }
    case 'bottom-left':
      return { bottom: defaultValue, left: defaultValue }
    case 'top-right':
      return { top: defaultValue, right: defaultValue }
    case 'top-left':
      return { top: defaultValue, left: defaultValue }
    case 'bottom-center':
      return { bottom: defaultValue }
    case 'top-center':
      return { top: defaultValue }
    default:
      return { bottom: defaultValue, right: defaultValue }
  }
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出

/**
 * 检查是否为移动设备
 */
export function isMobile(breakpoint: number = 768): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return window.innerWidth <= breakpoint
}

/**
 * 保存位置到存储
 */
export function savePosition(key: string, position: { x: number; y: number }): void {
  try {
    localStorage.setItem(key, JSON.stringify(position))
  } catch (error) {
    console.warn('Failed to save position to localStorage:', error)
  }
}

/**
 * 从存储加载位置
 */
export function loadPosition(key: string): { x: number; y: number } | null {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load position from localStorage:', error)
    return null
  }
}

/**
 * 计算拖拽边界
 */
export function calculateDragBounds(
  element: HTMLElement,
  bounds?: Partial<BackTopDragState['bounds']>
): BackTopDragState['bounds'] {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  return {
    top: bounds?.top ?? 0,
    right: bounds?.right ?? viewportWidth - rect.width,
    bottom: bounds?.bottom ?? viewportHeight - rect.height,
    left: bounds?.left ?? 0
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(): BackTopPerformanceMonitor {
  let startTime = 0
  let scrollEventCount = 0
  let clickEventCount = 0
  let scrollAnimationCount = 0
  let totalScrollTime = 0
  let maxScrollTime = 0
  let minScrollTime = Infinity
  
  return {
    get scrollEventCount() { return scrollEventCount },
    get clickEventCount() { return clickEventCount },
    get scrollAnimationCount() { return scrollAnimationCount },
    get averageScrollTime() {
      return scrollAnimationCount > 0 ? totalScrollTime / scrollAnimationCount : 0
    },
    get maxScrollTime() { return maxScrollTime },
    get minScrollTime() { return minScrollTime === Infinity ? 0 : minScrollTime },
    
    start() {
      startTime = performance.now()
      scrollEventCount = 0
      clickEventCount = 0
      scrollAnimationCount = 0
      totalScrollTime = 0
      maxScrollTime = 0
      minScrollTime = Infinity
    },
    
    stop() {
      // 停止监控
    },
    
    reset() {
      this.start()
    },
    
    getReport(): BackTopPerformanceReport {
      const duration = performance.now() - startTime
      
      return {
        duration,
        events: {
          scroll: scrollEventCount,
          click: clickEventCount,
          scrollAnimation: scrollAnimationCount
        },
        performance: {
          averageScrollTime: this.averageScrollTime,
          maxScrollTime,
          minScrollTime: minScrollTime === Infinity ? 0 : minScrollTime,
          totalScrollTime
        },
        memory: (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory ? {
          used: (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize,
          total: (performance as unknown as { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize
        } : undefined
      }
    }
  }
}

/**
 * 记录滚动事件
 */
export function recordScrollEvent(monitor: BackTopPerformanceMonitor): void {
  ;(monitor as unknown as { scrollEventCount: number }).scrollEventCount++
}

/**
 * 记录点击事件
 */
export function recordClickEvent(monitor: BackTopPerformanceMonitor): void {
  ;(monitor as unknown as { clickEventCount: number }).clickEventCount++
}

/**
 * 记录滚动动画
 */
export function recordScrollAnimation(monitor: BackTopPerformanceMonitor, scrollTime: number): void {
  const m = monitor as unknown as {
    scrollAnimationCount: number
    totalScrollTime: number
    maxScrollTime: number
    minScrollTime: number
  }
  m.scrollAnimationCount++
  m.totalScrollTime += scrollTime
  m.maxScrollTime = Math.max(m.maxScrollTime, scrollTime)
  m.minScrollTime = Math.min(m.minScrollTime, scrollTime)
}

/**
 * 获取默认图标
 */
export function getDefaultIcon(): string {
  return 'ex-icon-arrow-up'
}

/**
 * 创建触发条件
 */
export function createTrigger(
  visibilityHeight?: number,
  visibilityPercent?: number,
  custom?: (scrollInfo: BackTopScrollInfo) => boolean
): BackTopTrigger {
  return {
    scrollTop: visibilityHeight,
    scrollPercent: visibilityPercent,
    custom
  }
}

/**
 * 获取尺寸样式
 */
export function getSizeStyles(size: string): CSSProperties {
  const sizeMap: Record<string, string> = {
    small: 'var(--ex-back-top-size-small, 36px)',
    medium: 'var(--ex-back-top-size-medium, 48px)',
    large: 'var(--ex-back-top-size-large, 60px)'
  }
  
  const sizeValue = sizeMap[size] || sizeMap.medium
  
  return {
    width: sizeValue,
    height: sizeValue
  }
}

/**
 * 获取形状样式
 */
export function getShapeStyles(shape: string): CSSProperties {
  switch (shape) {
    case 'circle':
      return {
        borderRadius: '50%'
      }
    case 'square':
      return {
        borderRadius: '0'
      }
    case 'rounded':
      return {
        borderRadius: 'var(--ex-radius-base, 6px)'
      }
    default:
      return {
        borderRadius: '50%'
      }
  }
}

/**
 * 获取主题样式
 */
export function getThemeStyles(theme: BackTopThemeConfig): CSSProperties {
  return {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderColor: theme.borderColor,
    boxShadow: theme.boxShadow
  }
}

/**
 * 获取悬停主题样式
 */
export function getHoverThemeStyles(theme: BackTopThemeConfig): Record<string, string> {
  return {
    '--hover-bg': theme.hoverBackgroundColor,
    '--hover-color': theme.hoverTextColor,
    '--hover-border': theme.hoverBorderColor,
    '--hover-shadow': theme.hoverBoxShadow
  }
}

/**
 * 检查浏览器支持
 */
export function checkBrowserSupport(): {
  smoothScroll: boolean
  requestAnimationFrame: boolean
  localStorage: boolean
  transform: boolean
} {
  return {
    smoothScroll: 'scrollBehavior' in document.documentElement.style,
    requestAnimationFrame: typeof requestAnimationFrame === 'function',
    localStorage: typeof Storage !== 'undefined',
    transform: 'transform' in document.documentElement.style
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
export const backTopUtils: BackTopUtils = {
  getTarget,
  getScrollInfo,
  shouldShow,
  scrollToPosition,
  getPositionStyles,
  throttle,
  debounce,
  isMobile,
  savePosition,
  loadPosition,
  getDefaultOffset,
  calculateDragBounds
}

/**
 * 验证配置
 */
export function validateConfig(config: Record<string, unknown>): boolean {
  // 验证触发高度
  if (config.visibilityHeight !== undefined && (typeof config.visibilityHeight !== 'number' || config.visibilityHeight < 0)) {
    console.warn('Invalid visibilityHeight:', config.visibilityHeight)
    return false
  }
  
  // 验证滚动持续时间
  if (config.scrollDuration !== undefined && (typeof config.scrollDuration !== 'number' || config.scrollDuration < 0)) {
    console.warn('Invalid scrollDuration:', config.scrollDuration)
    return false
  }
  
  // 验证 z-index
  if (config.zIndex !== undefined && (typeof config.zIndex !== 'number' || config.zIndex < 0)) {
    console.warn('Invalid zIndex:', config.zIndex)
    return false
  }
  
  return true
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, precision: number = 0): string {
  return num.toFixed(precision)
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

/**
 * 缓动函数
 */
export const easingFunctions = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * 获取缓动函数
 */
export function getEasingFunction(easing: string): (t: number) => number {
  return easingFunctions[easing as keyof typeof easingFunctions] || easingFunctions.easeOutCubic
}