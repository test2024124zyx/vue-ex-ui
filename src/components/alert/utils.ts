import type { VNode, Component } from 'vue'
import { formatTimestamp } from '../../utils/format'
import { deepMerge } from '../../utils'
import { isVNode, isComponent } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { formatTimestamp, deepMerge, isVNode, isComponent }

import type { 
  AlertType, 
  AlertSize, 
  AlertVariant,
  AlertServiceConfig,
  AlertGlobalConfig,
  AlertStats,
  AlertFilter,
  AlertSortOptions,
  AlertServiceInstance,
  AlertThemeConfig,
  AlertAnimationConfig,
  ExAlertProps
} from './types'

/**
 * 默认全局配置
 */
export const defaultAlertConfig: AlertGlobalConfig = {
  defaultType: 'info',
  defaultSize: 'medium',
  defaultVariant: 'standard',
  defaultDuration: 4500,
  defaultPlacement: 'top-right',
  defaultMaxCount: 5,
  defaultAnimation: 'slide',
  defaultShowIcon: true,
  defaultClosable: true,
  defaultAutoClose: true,
  iconMap: {
    info: 'ex-icon-info-circle',
    success: 'ex-icon-check-circle',
    warning: 'ex-icon-exclamation-circle',
    error: 'ex-icon-close-circle'
  },
  cssVariables: {
    '--ex-alert-info-color': '#1890ff',
    '--ex-alert-success-color': '#52c41a',
    '--ex-alert-warning-color': '#faad14',
    '--ex-alert-error-color': '#ff4d4f',
    '--ex-alert-border-radius': '6px',
    '--ex-alert-padding': '12px 16px',
    '--ex-alert-font-size': '14px'
  }
}

/**
 * 默认主题配置
 */
export const defaultThemeConfig: AlertThemeConfig = {
  colors: {
    info: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f'
  },
  backgrounds: {
    info: '#e6f7ff',
    success: '#f6ffed',
    warning: '#fffbe6',
    error: '#fff2f0'
  },
  borders: {
    info: '#91d5ff',
    success: '#b7eb8f',
    warning: '#ffe58f',
    error: '#ffccc7'
  }
}

/**
 * 默认动画配置
 */
export const defaultAnimationConfig: AlertAnimationConfig = {
  enterDuration: 300,
  leaveDuration: 200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enabled: true
}

/**
 * 获取 Alert 类名
 */
export function getAlertClasses(
  type: AlertType,
  size: AlertSize,
  variant: AlertVariant,
  showIcon: boolean,
  closable: boolean,
  collapsible: boolean,
  collapsed: boolean,
  center: boolean,
  fullWidth: boolean,
  showBorder: boolean,
  showBackground: boolean,
  rounded: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-alert',
    `ex-alert--${type}`,
    `ex-alert--${size}`,
    `ex-alert--${variant}`
  ]

  if (showIcon) {
    classes.push('ex-alert--with-icon')
  }

  if (closable) {
    classes.push('ex-alert--closable')
  }

  if (collapsible) {
    classes.push('ex-alert--collapsible')
  }

  if (collapsed) {
    classes.push('ex-alert--collapsed')
  }

  if (center) {
    classes.push('ex-alert--center')
  }

  if (fullWidth) {
    classes.push('ex-alert--full-width')
  }

  if (showBorder) {
    classes.push('ex-alert--with-border')
  }

  if (showBackground) {
    classes.push('ex-alert--with-background')
  }

  if (rounded) {
    classes.push('ex-alert--rounded')
  }

  if (className) {
    classes.push(className)
  }

  return classes
}

/**
 * 获取默认图标
 */
export function getDefaultIcon(type: AlertType): string {
  const iconMap: Record<AlertType, string> = {
    info: 'ex-icon-info-circle',
    success: 'ex-icon-check-circle',
    warning: 'ex-icon-exclamation-circle',
    error: 'ex-icon-close-circle'
  }

  return iconMap[type]
}

/**
 * 获取图标组件
 */
export function getAlertIconComponent(
  icon: VNode | Component | string | undefined,
  type: AlertType
): VNode | Component | string | null {
  if (icon) {
    return icon
  }

  return getDefaultIcon(type)
}

/**
 * 生成唯一 ID
 */
export function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取容器元素
 */
export function getContainer(container?: HTMLElement | string): HTMLElement {
  if (!container) {
    return document.body
  }

  if (typeof container === 'string') {
    const element = document.querySelector(container) as HTMLElement
    if (!element) {
      console.warn(`Alert container "${container}" not found, using document.body`)
      return document.body
    }
    return element
  }

  return container
}

/**
 * 创建 Alert 容器
 */
export function createAlertContainer(
  placement: AlertServiceConfig['placement'] = 'top-right',
  zIndex?: number
): HTMLElement {
  const container = document.createElement('div')
  container.className = `ex-alert-container ex-alert-container--${placement}`

  if (zIndex !== undefined) {
    container.style.zIndex = String(zIndex)
  }

  // 设置容器样式
  Object.assign(container.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: String(zIndex || 1000)
  })

  // 根据位置设置样式
  switch (placement) {
    case 'top':
      Object.assign(container.style, {
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)'
      })
      break
    case 'top-left':
      Object.assign(container.style, {
        top: '16px',
        left: '16px'
      })
      break
    case 'top-right':
      Object.assign(container.style, {
        top: '16px',
        right: '16px'
      })
      break
    case 'bottom':
      Object.assign(container.style, {
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)'
      })
      break
    case 'bottom-left':
      Object.assign(container.style, {
        bottom: '16px',
        left: '16px'
      })
      break
    case 'bottom-right':
      Object.assign(container.style, {
        bottom: '16px',
        right: '16px'
      })
      break
  }

  document.body.appendChild(container)
  return container
}

/**
 * 销毁 Alert 容器
 */
export function destroyAlertContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/**
 * 检查是否应该移除旧的 Alert
 */
export function shouldRemoveOldAlert(
  container: HTMLElement,
  maxCount: number
): boolean {
  const alertElements = container.querySelectorAll('.ex-alert')
  return alertElements.length >= maxCount
}

/**
 * 移除最旧的 Alert
 */
export function removeOldestAlert(container: HTMLElement): void {
  const alertElements = container.querySelectorAll('.ex-alert')
  if (alertElements.length > 0) {
    const oldestAlert = alertElements[0] as HTMLElement
    const closeButton = oldestAlert.querySelector('.ex-alert__close') as HTMLElement
    if (closeButton) {
      closeButton.click()
    }
  }
}

/**
 * 创建 Alert 配置
 */
export function createAlertConfig(
  options: string | Partial<AlertServiceConfig>,
  type?: AlertType,
  globalConfig: AlertGlobalConfig = defaultAlertConfig
): AlertServiceConfig {
  const baseConfig: AlertServiceConfig = {
    type: type || globalConfig.defaultType || 'info',
    size: globalConfig.defaultSize || 'medium',
    variant: globalConfig.defaultVariant || 'standard',
    duration: globalConfig.defaultDuration || 4500,
    autoClose: globalConfig.defaultAutoClose !== undefined ? globalConfig.defaultAutoClose : true,
    placement: globalConfig.defaultPlacement || 'top-right',
    maxCount: globalConfig.defaultMaxCount || 5,
    animation: globalConfig.defaultAnimation || 'slide',
    showIcon: globalConfig.defaultShowIcon !== undefined ? globalConfig.defaultShowIcon : true,
    closable: globalConfig.defaultClosable !== undefined ? globalConfig.defaultClosable : true,
    zIndex: 1000,
    stackable: true,
    stackGap: 8
  }

  if (typeof options === 'string') {
    return {
      ...baseConfig,
      message: options
    }
  }

  return {
    ...baseConfig,
    ...options
  }
}

// formatTimestamp 已从 '../../utils/format' 导入

/**
 * 获取相对时间
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else {
    return `${Math.floor(diff / day)}天前`
  }
}

// deepMerge 已从 '../../utils' 导入

/**
 * 过滤 Alert
 */
export function filterAlerts(
  alerts: AlertServiceInstance[],
  filter: AlertFilter
): AlertServiceInstance[] {
  return alerts.filter(alert => {
    // 类型过滤
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type]
      const alertConfig = (alert as unknown as { _config?: { type?: AlertType } })._config
      if (!alertConfig?.type || !types.includes(alertConfig.type)) {
        return false
      }
    }

    // 尺寸过滤
    if (filter.size) {
      const sizes = Array.isArray(filter.size) ? filter.size : [filter.size]
      const alertConfig = (alert as unknown as { _config?: { size?: AlertSize } })._config
      if (!alertConfig?.size || !sizes.includes(alertConfig.size)) {
        return false
      }
    }

    // 变体过滤
    if (filter.variant) {
      const variants = Array.isArray(filter.variant) ? filter.variant : [filter.variant]
      const alertConfig = (alert as unknown as { _config?: { variant?: AlertVariant } })._config
      if (!alertConfig?.variant || !variants.includes(alertConfig.variant)) {
        return false
      }
    }

    // 可关闭过滤
    if (filter.closable !== undefined) {
      const alertConfig = (alert as unknown as { _config?: { closable?: boolean } })._config
      if (alertConfig?.closable !== filter.closable) {
        return false
      }
    }

    // 显示图标过滤
    if (filter.showIcon !== undefined) {
      const alertConfig = (alert as unknown as { _config?: { showIcon?: boolean } })._config
      if (alertConfig?.showIcon !== filter.showIcon) {
        return false
      }
    }

    // 自定义过滤
    if (filter.custom && !filter.custom(alert)) {
      return false
    }

    return true
  })
}

/**
 * 排序 Alert
 */
export function sortAlerts(
  alerts: AlertServiceInstance[],
  options: AlertSortOptions
): AlertServiceInstance[] {
  return [...alerts].sort((a, b) => {
    const aConfig = (a as unknown as { _config?: Record<string, unknown> })._config
    const bConfig = (b as unknown as { _config?: Record<string, unknown> })._config
    
    let aValue: string | number
    let bValue: string | number

    switch (options.field) {
      case 'type':
        aValue = (aConfig?.type as string) || ''
        bValue = (bConfig?.type as string) || ''
        break
      case 'size':
        aValue = (aConfig?.size as string) || ''
        bValue = (bConfig?.size as string) || ''
        break
      case 'timestamp':
        aValue = (a as unknown as { _timestamp?: number })._timestamp || 0
        bValue = (b as unknown as { _timestamp?: number })._timestamp || 0
        break
      case 'priority': {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
        aValue = priorityOrder[aConfig?.priority as keyof typeof priorityOrder] || 0
        bValue = priorityOrder[bConfig?.priority as keyof typeof priorityOrder] || 0
        break
      }
      default:
        return 0
    }

    if (aValue < bValue) {
      return options.order === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return options.order === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * 获取 Alert 统计信息
 */
export function getAlertStats(alerts: AlertServiceInstance[]): AlertStats {
  const stats: AlertStats = {
    total: alerts.length,
    activeCount: alerts.length,
    totalCount: alerts.length,
    typeCount: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0
    },
    byType: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0
    },
    byPlacement: {},
    averageDuration: 0,
    averageDisplayTime: 0
  }

  let totalDisplayTime = 0
  let displayTimeCount = 0

  alerts.forEach(alert => {
    const config = (alert as unknown as { _config?: Record<string, unknown> })._config
    const timestamp = (alert as unknown as { _timestamp?: number })._timestamp
    
    // 统计类型
    if (config?.type) {
      if (stats.typeCount && typeof config.type === 'string' && Object.prototype.hasOwnProperty.call(stats.typeCount, config.type)) {
        stats.typeCount[config.type as AlertType]++
      }
      stats.byType[config.type as AlertType]++
    }

    // 计算显示时间
    if (timestamp) {
      const displayTime = Date.now() - timestamp
      totalDisplayTime += displayTime
      displayTimeCount++
    }
  })

  if (displayTimeCount > 0) {
    stats.averageDisplayTime = totalDisplayTime / displayTimeCount
  }

  return stats
}

/**
 * 检查是否支持动画
 */
export function supportsAnimation(): boolean {
  return typeof window !== 'undefined' && 
         'requestAnimationFrame' in window &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 获取动画配置
 */
export function getAnimationConfig(
  animation: AlertServiceConfig['animation'],
  customConfig?: Partial<AlertAnimationConfig>
): AlertAnimationConfig {
  const baseConfig = { ...defaultAnimationConfig }
  
  // 根据动画类型调整配置
  switch (animation) {
    case 'slide':
      baseConfig.enterDuration = 300
      baseConfig.leaveDuration = 200
      break
    case 'fade':
      baseConfig.enterDuration = 200
      baseConfig.leaveDuration = 150
      break
    case 'zoom':
      baseConfig.enterDuration = 250
      baseConfig.leaveDuration = 200
      break
    case 'bounce':
      baseConfig.enterDuration = 400
      baseConfig.leaveDuration = 200
      baseConfig.easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      break
  }

  return { ...baseConfig, ...customConfig }
}

/**
 * 验证 Alert 配置
 */
export function validateAlertConfig(config: Partial<ExAlertProps>): boolean {
  // 验证持续时间
  if (config.progress !== undefined) {
    if (config.progress < 0 || config.progress > 100) {
      console.warn('Alert progress must be between 0 and 100')
      return false
    }
  }

  // 验证计数器
  if (config.counter !== undefined && config.counter < 0) {
    console.warn('Alert counter must be greater than or equal to 0')
    return false
  }

  if (
    config.counter !== undefined &&
    config.maxCounter !== undefined &&
    config.counter > config.maxCounter
  ) {
    console.warn('Alert counter must be less than or equal to maxCounter')
    return false
  }

  return true
}

/**
 * 获取优先级权重
 */
export function getPriorityWeight(priority: string): number {
  const weights: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4
  }
  
  return weights[priority] || 0
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#faad14',
    processing: '#1890ff',
    completed: '#52c41a',
    failed: '#ff4d4f'
  }
  
  return colors[status] || '#666666'
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * 转义 HTML
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// isVNode 和 isComponent 已从 '../../utils' 导入