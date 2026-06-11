import type { VNode, Component } from 'vue'
import { h, isVNode } from 'vue'
import { deepClone } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { deepClone }

import type{ 
  PopconfirmConfig,
  PopconfirmButton,
  PopconfirmButtonType,
  PopconfirmType,
  PopconfirmContent,
  PopconfirmButtons,
  PopconfirmThemeConfig,
  PopconfirmPresetConfig,
  PopconfirmAsyncResult
} from './types'

/**
 * 默认配置
 */
export const defaultPopconfirmConfig: PopconfirmConfig = {
  placement: 'top',
  trigger: 'click',
  okText: '确定',
  cancelText: '取消',
  okType: 'primary',
  cancelType: 'default',
  icon: 'question-circle',
  showIcon: true,
  showCancel: true,
  arrow: true,
  offset: [0, 8],
  zIndex: 1000,
  autoAdjustOverflow: true,
  autoClose: true
}

/**
 * 图标映射
 */
export const iconMap: Record<PopconfirmType, string> = {
  default: 'question-circle',
  primary: 'info-circle',
  success: 'check-circle',
  warning: 'exclamation-circle',
  danger: 'exclamation-triangle',
  info: 'info-circle',
  error: 'close-circle'
}

/**
 * 图标颜色映射
 */
export const iconColorMap: Record<PopconfirmType, string> = {
  default: 'var(--ex-color-text-tertiary)',
  primary: 'var(--ex-color-primary)',
  success: 'var(--ex-color-success)',
  warning: 'var(--ex-color-warning)',
  danger: 'var(--ex-color-error)',
  info: 'var(--ex-color-info)',
  error: 'var(--ex-color-error)'
}

/**
 * 获取图标组件
 */
export function getPopconfirmIconComponent(
  icon: string | VNode | Component,
  type: PopconfirmType = 'default'
): VNode {
  if (isVNode(icon)) {
    return icon
  }
  
  if (typeof icon === 'string') {
    // 这里应该根据实际的图标组件库来实现
    return h('i', { 
      class: `ex-icon ex-icon-${icon}`,
      style: { color: iconColorMap[type] }
    })
  }
  
  if (typeof icon === 'object' && icon) {
    return h(icon as Component, {
      style: { color: iconColorMap[type] }
    })
  }
  
  // 默认图标
  return h('i', { 
    class: `ex-icon ex-icon-${iconMap[type]}`,
    style: { color: iconColorMap[type] }
  })
}

/**
 * 获取按钮配置
 */
export function getPopconfirmButtonConfig(
  text?: string,
  type: PopconfirmButtonType = 'default',
  props?: Record<string, unknown>
): PopconfirmButton {
  return {
    text: text || (type === 'primary' ? '确定' : '取消'),
    type,
    props: props || {},
    visible: true,
    loading: false,
    disabled: false
  }
}

/**
 * 生成确认框类名
 */
export function getPopconfirmClasses(
  type: PopconfirmType = 'default',
  showIcon: boolean = true,
  className?: string
): string[] {
  const classes = [
    'ex-popconfirm',
    `ex-popconfirm--${type}`
  ]
  
  if (showIcon) {
    classes.push('ex-popconfirm--with-icon')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 生成内容配置
 */
export function getPopconfirmContent(
  title?: string | VNode,
  description?: string | VNode,
  icon?: string | VNode | Component,
  iconColor?: string,
  type: PopconfirmType = 'default'
): PopconfirmContent {
  return {
    title,
    description,
    icon: icon || iconMap[type],
    iconColor: iconColor || iconColorMap[type]
  }
}

/**
 * 生成按钮配置
 */
export function getPopconfirmButtons(
  okText?: string,
  cancelText?: string,
  okType: PopconfirmButtonType = 'primary',
  cancelType: PopconfirmButtonType = 'default',
  okButtonProps?: Record<string, unknown>,
  cancelButtonProps?: Record<string, unknown>,
  showCancel: boolean = true
): PopconfirmButtons {
  return {
    ok: getPopconfirmButtonConfig(okText || '确定', okType, okButtonProps),
    cancel: {
      ...getPopconfirmButtonConfig(cancelText || '取消', cancelType, cancelButtonProps),
      visible: showCancel
    }
  }
}

/**
 * 获取确认框主题
 */
export function getPopconfirmTheme(): PopconfirmThemeConfig {
  return {
    backgroundColor: 'var(--ex-color-bg-primary)',
    textColor: 'var(--ex-color-text-primary)',
    titleColor: 'var(--ex-color-text-primary)',
    borderColor: 'var(--ex-color-border-primary)',
    boxShadow: 'var(--ex-shadow-lg)',
    borderRadius: 'var(--ex-radius-base)',
    iconColors: iconColorMap
  }
}

/**
 * 创建预设配置
 */
export function createPopconfirmPresets(): PopconfirmPresetConfig {
  return {
    delete: {
      title: '确定删除吗？',
      description: '删除后无法恢复',
      okText: '删除',
      okType: 'danger',
      icon: 'delete',
      iconColor: 'var(--ex-color-error)'
    },
    
    save: {
      title: '确定保存吗？',
      description: '保存后将覆盖原有数据',
      okText: '保存',
      okType: 'primary',
      icon: 'save',
      iconColor: 'var(--ex-color-primary)'
    },
    
    submit: {
      title: '确定提交吗？',
      description: '提交后无法修改',
      okText: '提交',
      okType: 'primary',
      icon: 'upload',
      iconColor: 'var(--ex-color-primary)'
    },
    
    reset: {
      title: '确定重置吗？',
      description: '重置后将清空所有数据',
      okText: '重置',
      okType: 'warning',
      icon: 'refresh',
      iconColor: 'var(--ex-color-warning)'
    },
    
    exit: {
      title: '确定退出吗？',
      description: '未保存的数据将丢失',
      okText: '退出',
      okType: 'danger',
      icon: 'logout',
      iconColor: 'var(--ex-color-error)'
    }
  }
}

/**
 * 处理异步确认操作
 */
export async function handleAsyncConfirm(
  asyncFn: () => Promise<PopconfirmAsyncResult>,
  onSuccess?: (data: unknown) => void,
  onError?: (error: string) => void,
  onFinally?: () => void
): Promise<boolean> {
  try {
    const result = await asyncFn()
    
    if (result.success) {
      onSuccess?.(result.data)
      return true
    } else {
      onError?.(result.error instanceof Error ? result.error.message : (result.error || '操作失败'))
      return false
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    onError?.(errorMessage)
    return false
  } finally {
    onFinally?.()
  }
}

/**
 * 生成唯一 ID
 */
export function generatePopconfirmId(): string {
  return `ex-popconfirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取按钮样式类名
 */
export function getButtonClasses(type: PopconfirmButtonType): string[] {
  const classes = ['ex-button']
  
  switch (type) {
    case 'primary':
      classes.push('ex-button--primary')
      break
    case 'danger':
      classes.push('ex-button--danger')
      break
    case 'warning':
      classes.push('ex-button--warning')
      break
    case 'success':
      classes.push('ex-button--success')
      break

    case 'default':
    default:
      classes.push('ex-button--default')
      break
  }
  
  return classes
}

/**
 * 检查是否为异步函数
 */
export function isAsyncFunction(fn: unknown): boolean {
  return Boolean(fn && typeof fn === 'function' && (fn as { constructor: { name: string } }).constructor.name === 'AsyncFunction')
}

/**
 * 检查是否为 Promise
 */
export function isPromise(obj: unknown): obj is Promise<unknown> {
  return Boolean(obj && typeof obj === 'object' && typeof (obj as { then?: unknown }).then === 'function')
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 安全执行函数
 */
export async function safeExecute<T>(
  fn: () => T | Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    const result = fn()
    return isPromise(result) ? await result : result
  } catch (error) {
    console.error('Popconfirm execution error:', error)
    return fallback
  }
}

/**
 * 合并配置
 */
export function mergePopconfirmConfig<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      if (sourceValue !== undefined) {
        result[key] = sourceValue
      }
    }
  }
  
  return result
}

// deepClone 已从 '../../utils' 导入

/**
 * 获取键盘事件处理器
 */
export function getKeyboardHandler(
  confirmKey: string = 'Enter',
  cancelKey: string = 'Escape',
  onConfirm: () => void,
  onCancel: () => void,
  preventDefault: boolean = true
) {
  return (event: KeyboardEvent) => {
    if (preventDefault) {
      event.preventDefault()
    }
    
    switch (event.key) {
      case confirmKey:
        onConfirm()
        break
      case cancelKey:
        onCancel()
        break
    }
  }
}

/**
 * 设置焦点
 */
export function setFocus(
  container: HTMLElement,
  selector: string = '.ex-button--primary'
): void {
  const focusElement = container.querySelector(selector) as HTMLElement
  
  if (focusElement && typeof focusElement.focus === 'function') {
    // 延迟聚焦，确保元素已渲染
    setTimeout(() => {
      focusElement.focus()
    }, 100)
  }
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
    '[tabindex]:not([tabindex="-1"])'
  ]
  
  const elements = container.querySelectorAll(focusableSelectors.join(','))
  return Array.from(elements) as HTMLElement[]
}

/**
 * 管理焦点循环
 */
export function manageFocusTrap(
  container: HTMLElement,
  event: KeyboardEvent
): void {
  if (event.key !== 'Tab') return
  
  const focusableElements = getFocusableElements(container)
  
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
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

/**
 * 验证配置
 */
export function validatePopconfirmConfig(config: Partial<PopconfirmConfig>): boolean {
  // 基本验证
  if (config.zIndex && (config.zIndex < 0 || config.zIndex > 9999)) {
    console.warn('Popconfirm: zIndex should be between 0 and 9999')
    return false
  }
  
  if (config.offset && (!Array.isArray(config.offset) || config.offset.length !== 2)) {
    console.warn('Popconfirm: offset should be an array with 2 numbers')
    return false
  }
  
  return true
}

/**
 * 格式化错误信息
 */
export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (error && typeof error === 'object' && (error as { message?: string }).message) {
    return (error as { message: string }).message
  }
  
  return '未知错误'
}