import { debounce, throttle } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle }

import type { 
  ProgressStatus, 
  ProgressType, 
  ProgressSize,
  ProgressGradient,
  ProgressColorMap,
  CircleProgressConfig,
  DashboardProgressConfig,
  StepProgressConfig,
  GapPosition,

  ProgressThemeConfig,
  ProgressSizeConfig,
  ProgressRenderInfo
} from './types'

/**
 * 默认主题配置
 */
export const defaultTheme: ProgressThemeConfig = {
  primaryColor: '#1890ff',
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  trailColor: '#f5f5f5',
  textColor: '#000000d9'
}

/**
 * 默认尺寸配置
 */
export const defaultSizes: Record<ProgressSize, ProgressSizeConfig> = {
  small: {
    strokeWidth: 6,
    lineHeight: 6,
    circleWidth: 80,
    fontSize: 12,
    iconSize: 12
  },
  default: {
    strokeWidth: 8,
    lineHeight: 8,
    circleWidth: 120,
    fontSize: 14,
    iconSize: 14
  },
  large: {
    strokeWidth: 10,
    lineHeight: 10,
    circleWidth: 160,
    fontSize: 16,
    iconSize: 16
  }
}

/**
 * 获取进度状态对应的颜色
 */
export function getStatusColor(
  status: ProgressStatus,
  strokeColor?: string | ProgressGradient | ProgressColorMap,
  theme: ProgressThemeConfig = defaultTheme
): string {
  // 优先使用自定义颜色
  if (typeof strokeColor === 'string') {
    return strokeColor
  }
  
  if (strokeColor && typeof strokeColor === 'object' && 'normal' in strokeColor) {
    const colorMap = strokeColor as ProgressColorMap
    return colorMap[status] || colorMap.normal || theme.primaryColor
  }
  
  // 使用主题颜色
  switch (status) {
    case 'success':
      return theme.successColor
    case 'exception':
      return theme.errorColor
    case 'warning':
      return theme.warningColor
    case 'active':
    case 'normal':
    default:
      return theme.primaryColor
  }
}

/**
 * 创建渐变样式
 */
export function createGradientStyle(gradient: ProgressGradient): string {
  const { direction = 'to right', from, to, stops } = gradient
  
  if (stops && stops.length > 0) {
    const stopStrings = stops.map(stop => `${stop.color} ${stop.offset}`)
    return `linear-gradient(${direction}, ${stopStrings.join(', ')})`
  }
  
  return `linear-gradient(${direction}, ${from}, ${to})`
}

/**
 * 获取进度条样式
 */
export function getProgressStyle(
  percent: number,
  strokeColor?: string | ProgressGradient | ProgressColorMap,
  status: ProgressStatus = 'normal'
): Record<string, string> {
  const width = `${Math.max(0, Math.min(100, percent))}%`
  
  let background: string
  
  if (typeof strokeColor === 'object' && 'from' in strokeColor) {
    background = createGradientStyle(strokeColor as ProgressGradient)
  } else {
    background = getStatusColor(status, strokeColor)
  }
  
  return {
    width,
    background,
    transition: 'width 0.3s ease, background 0.3s ease'
  }
}

/**
 * 计算圆形进度条配置
 */
export function calculateCircleConfig(
  width: number,
  strokeWidth: number
): CircleProgressConfig {
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  
  return {
    width,
    strokeWidth,
    radius,
    circumference,
    strokeLinecap: 'round' as const
  }
}

/**
 * 计算仪表盘进度条配置
 */
export function calculateDashboardConfig(
  width: number,
  strokeWidth: number,
  gapDegree: number = 75,
  gapPosition: GapPosition = 'bottom'
): DashboardProgressConfig {
  const baseConfig = calculateCircleConfig(width, strokeWidth)
  
  // 计算起始和结束角度
  let startAngle: number
  let endAngle: number
  
  switch (gapPosition) {
    case 'top':
      startAngle = -90 + gapDegree / 2
      endAngle = -90 - gapDegree / 2
      break
    case 'right':
      startAngle = 0 + gapDegree / 2
      endAngle = 0 - gapDegree / 2
      break
    case 'left':
      startAngle = 180 + gapDegree / 2
      endAngle = 180 - gapDegree / 2
      break
    case 'bottom':
    default:
      startAngle = 90 + gapDegree / 2
      endAngle = 90 - gapDegree / 2
      break
  }
  
  return {
    ...baseConfig,
    gapDegree,
    gapPosition,
    startAngle,
    endAngle
  }
}

/**
 * 计算步骤进度条配置
 */
export function calculateStepConfig(
  steps: number,
  current: number,
  direction: 'horizontal' | 'vertical' = 'horizontal',
  containerSize: number = 100
): StepProgressConfig {
  const stepGap = 8
  const availableSize = containerSize - (steps - 1) * stepGap
  const stepWidth = Math.max(0, availableSize / steps)
  
  return {
    steps,
    current: Math.max(0, Math.min(steps, current)),
    stepWidth,
    stepGap,
    direction
  }
}

/**
 * 计算 SVG 路径偏移
 */
export function calculateStrokeDasharray(
  circumference: number,
  percent: number,
  gapDegree?: number
): { strokeDasharray: string; strokeDashoffset: string } {
  const actualCircumference = gapDegree 
    ? circumference * (360 - gapDegree) / 360
    : circumference
  
  const offset = actualCircumference * (1 - percent / 100)
  
  return {
    strokeDasharray: `${actualCircumference} ${circumference}`,
    strokeDashoffset: `${offset}`
  }
}

/**
 * 格式化进度文本
 */
export function formatProgressText(
  percent: number,
  successPercent?: number,
  customFormat?: (percent: number, successPercent?: number) => string
): string {
  if (customFormat) {
    return customFormat(percent, successPercent)
  }
  
  if (successPercent !== undefined) {
    return `${Math.round(percent)}% / ${Math.round(successPercent)}%`
  }
  
  return `${Math.round(percent)}%`
}

/**
 * 获取进度状态
 */
export function getProgressStatus(
  percent: number,
  successPercent?: number,
  customStatus?: ProgressStatus
): ProgressStatus {
  if (customStatus) {
    return customStatus
  }
  
  if (percent >= 100) {
    return 'success'
  }
  
  if (successPercent !== undefined && successPercent >= 100) {
    return 'success'
  }
  
  return 'normal'
}

/**
 * 验证进度值
 */
export function validatePercent(percent: number): number {
  return Math.max(0, Math.min(100, percent))
}

/**
 * 生成进度条类名
 */
export function getProgressClasses(
  type: ProgressType,
  size: ProgressSize,
  status: ProgressStatus,
  showInfo: boolean,
  disabled: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-progress',
    `ex-progress--${type}`,
    `ex-progress--${size}`,
    `ex-progress--${status}`
  ]
  
  if (showInfo) {
    classes.push('ex-progress--show-info')
  }
  
  if (disabled) {
    classes.push('ex-progress--disabled')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 创建动画关键帧
 */
export function createProgressAnimation(
  fromPercent: number,
  toPercent: number,
  duration: number = 300,
  easing: string = 'ease'
): KeyframeEffect {
  return new KeyframeEffect(
    null,
    [
      { width: `${fromPercent}%` },
      { width: `${toPercent}%` }
    ],
    {
      duration,
      easing,
      fill: 'forwards'
    }
  )
}

/**
 * 计算步骤状态
 */
export function getStepStatus(
  stepIndex: number,
  current: number,
  status: ProgressStatus
): ProgressStatus {
  if (stepIndex < current) {
    return 'success'
  } else if (stepIndex === current) {
    return status === 'exception' ? 'exception' : 'active'
  } else {
    return 'normal'
  }
}

/**
 * 生成唯一 ID
 */
export function generateProgressId(): string {
  return `ex-progress-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 计算文本位置
 */
export function calculateTextPosition(
  type: ProgressType,
  width: number,
  height: number
): { x: number; y: number } {
  switch (type) {
    case 'circle':
    case 'dashboard':
      return {
        x: width / 2,
        y: height / 2
      }
    case 'line':
    default:
      return {
        x: 0,
        y: height / 2
      }
  }
}

/**
 * 创建渐变定义
 */
export function createGradientDefs(
  id: string,
  gradient: ProgressGradient
): string {
  const { from, to, stops } = gradient
  
  let gradientStops: string
  
  if (stops && stops.length > 0) {
    gradientStops = stops
      .map(stop => `<stop offset="${stop.offset}" stop-color="${stop.color}" />`)
      .join('')
  } else {
    gradientStops = `
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    `
  }
  
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
        ${gradientStops}
      </linearGradient>
    </defs>
  `
}

// debounce 和 throttle 已从 '../../utils' 导入

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
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * 创建进度条渲染信息
 */
export function createProgressRenderInfo(
  percent: number,
  status: ProgressStatus,
  strokeColor?: string | ProgressGradient | ProgressColorMap,
  trailColor?: string,
  showInfo: boolean = true,
  format?: (percent: number, successPercent?: number) => string,
  successPercent?: number
): ProgressRenderInfo {
  const validPercent = validatePercent(percent)
  const validSuccessPercent = successPercent !== undefined ? validatePercent(successPercent) : undefined
  const color = getStatusColor(status, strokeColor)
  const trail = trailColor || defaultTheme.trailColor
  const text = format ? format(validPercent, validSuccessPercent) : formatProgressText(validPercent, validSuccessPercent)
  
  return {
    percent: validPercent,
    successPercent: validSuccessPercent,
    status,
    color,
    trailColor: trail,
    showInfo,
    text
  }
}