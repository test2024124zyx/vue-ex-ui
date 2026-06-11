import { debounce, throttle } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle }

import type { SliderValue, SliderMarks } from './types'

/**
 * 获取数字的精度
 */
export function getPrecision(num: number): number {
  const str = num.toString()
  const decimal = str.indexOf('.')
  return decimal === -1 ? 0 : str.length - decimal - 1
}

/**
 * 格式化数字精度
 */
export function formatNumber(num: number, precision: number): number {
  return parseFloat(num.toFixed(precision))
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 根据步长调整数值
 */
export function adjustValueByStep(value: number, min: number, step: number, precision: number): number {
  const steps = Math.round((value - min) / step)
  const adjustedValue = min + steps * step
  return formatNumber(adjustedValue, precision)
}

/**
 * 计算滑块值对应的百分比位置
 */
export function valueToPercent(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100
}

/**
 * 根据百分比位置计算滑块值
 */
export function percentToValue(percent: number, min: number, max: number): number {
  return min + (percent / 100) * (max - min)
}

/**
 * 获取鼠标或触摸事件的位置
 */
export function getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0]
    if (touch) {
      return {
        x: touch.clientX,
        y: touch.clientY
      }
    }
  } else if ('clientX' in event) {
    return {
      x: event.clientX,
      y: event.clientY
    }
  }
  return { x: 0, y: 0 }
}

/**
 * 计算滑块轨道上的位置百分比
 */
export function getPositionPercent(
  event: MouseEvent | TouchEvent,
  trackElement: HTMLElement,
  vertical: boolean = false,
  reverse: boolean = false
): number {
  const { x, y } = getEventPosition(event)
  const rect = trackElement.getBoundingClientRect()
  
  let percent: number
  
  if (vertical) {
    const trackHeight = rect.height
    const offsetY = y - rect.top
    percent = (trackHeight - offsetY) / trackHeight * 100
  } else {
    const trackWidth = rect.width
    const offsetX = x - rect.left
    percent = offsetX / trackWidth * 100
  }
  
  if (reverse) {
    percent = 100 - percent
  }
  
  return clamp(percent, 0, 100)
}

/**
 * 验证滑块值是否有效
 */
export function isValidSliderValue(value: unknown): value is SliderValue {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value)
  }
  
  if (Array.isArray(value) && value.length === 2) {
    return value.every(v => typeof v === 'number' && !isNaN(v) && isFinite(v))
  }
  
  return false
}

/**
 * 标准化滑块值
 */
export function normalizeSliderValue(
  value: SliderValue | undefined,
  min: number,
  max: number,
  range: boolean
): SliderValue {
  if (!isValidSliderValue(value)) {
    return range ? [min, min] : min
  }
  
  if (range) {
    if (typeof value === 'number') {
      return [clamp(value, min, max), clamp(value, min, max)]
    } else {
      const [start, end] = value
      const clampedStart = clamp(start, min, max)
      const clampedEnd = clamp(end, min, max)
      return [Math.min(clampedStart, clampedEnd), Math.max(clampedStart, clampedEnd)]
    }
  } else {
    if (Array.isArray(value)) {
      return clamp(value[0], min, max)
    } else {
      return clamp(value, min, max)
    }
  }
}

/**
 * 获取最接近的步长值
 */
export function getClosestStepValue(
  value: number,
  min: number,
  max: number,
  step: number,
  precision: number
): number {
  const clampedValue = clamp(value, min, max)
  const adjustedValue = adjustValueByStep(clampedValue, min, step, precision)
  return clamp(adjustedValue, min, max)
}

/**
 * 计算范围滑块中哪个按钮更接近点击位置
 */
export function getClosestButtonIndex(
  clickValue: number,
  rangeValue: [number, number]
): number {
  const [start, end] = rangeValue
  const startDistance = Math.abs(clickValue - start)
  const endDistance = Math.abs(clickValue - end)
  
  return startDistance <= endDistance ? 0 : 1
}

/**
 * 生成步长标记
 */
export function generateStops(min: number, max: number, step: number): number[] {
  const stops: number[] = []
  let current = min
  
  while (current <= max) {
    stops.push(current)
    current += step
  }
  
  // 确保包含最大值
  if (stops[stops.length - 1] !== max) {
    stops.push(max)
  }
  
  return stops
}

/**
 * 处理标记配置
 */
export function processMarks(marks: SliderMarks): Array<{ value: number; label: string; style?: Record<string, string | number> }> {
  return Object.entries(marks).map(([value, mark]) => {
    const numValue = Number(value)
    
    if (typeof mark === 'string') {
      return { value: numValue, label: mark }
    } else {
      return {
        value: numValue,
        label: mark.label || '',
        style: mark.style
      }
    }
  }).sort((a, b) => a.value - b.value)
}

/**
 * 格式化滑块值用于显示
 */
export function formatSliderValue(
  value: SliderValue,
  formatter?: (value: number) => string
): string | [string, string] {
  if (typeof value === 'number') {
    return formatter ? formatter(value) : value.toString()
  } else {
    const [start, end] = value
    if (formatter) {
      return [formatter(start), formatter(end)]
    } else {
      return [start.toString(), end.toString()]
    }
  }
}

/**
 * 检查两个滑块值是否相等
 */
export function isSliderValueEqual(a: SliderValue, b: SliderValue): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }
  
  return false
}

/**
 * 获取滑块按钮的样式位置
 */
export function getButtonStyle(
  value: number,
  min: number,
  max: number,
  vertical: boolean = false,
  reverse: boolean = false
): Record<string, string> {
  let percent = valueToPercent(value, min, max)
  
  if (reverse) {
    percent = 100 - percent
  }
  
  if (vertical) {
    return {
      bottom: `${percent}%`,
      transform: 'translateY(50%)'
    }
  } else {
    return {
      left: `${percent}%`,
      transform: 'translateX(-50%)'
    }
  }
}

/**
 * 获取滑块轨道的样式
 */
export function getTrackStyle(
  value: SliderValue,
  min: number,
  max: number,
  vertical: boolean = false,
  reverse: boolean = false
): Record<string, string> {
  if (typeof value === 'number') {
    let percent = valueToPercent(value, min, max)
    
    if (reverse) {
      percent = 100 - percent
    }
    
    if (vertical) {
      return {
        height: `${percent}%`,
        bottom: '0'
      }
    } else {
      return {
        width: `${percent}%`,
        left: '0'
      }
    }
  } else {
    const [start, end] = value
    let startPercent = valueToPercent(start, min, max)
    let endPercent = valueToPercent(end, min, max)
    
    if (reverse) {
      startPercent = 100 - startPercent
      endPercent = 100 - endPercent
      ;[startPercent, endPercent] = [endPercent, startPercent]
    }
    
    const length = endPercent - startPercent
    
    if (vertical) {
      return {
        height: `${length}%`,
        bottom: `${startPercent}%`
      }
    } else {
      return {
        width: `${length}%`,
        left: `${startPercent}%`
      }
    }
  }
}

// debounce 和 throttle 已从 '../../utils' 导入并重新导出