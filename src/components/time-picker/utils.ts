import type { TimeValue, TimeFormat, TimeStep, TimeOption, TimeUtils } from './types'

/**
 * 默认时间格式
 */
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss'

/**
 * 时间格式正则表达式
 */
export const TIME_FORMAT_REGEX = {
  'HH:mm:ss': /^([01]?\d|2[0-3]):([0-5]?\d):([0-5]?\d)$/,
  'HH:mm': /^([01]?\d|2[0-3]):([0-5]?\d)$/,
  'mm:ss': /^([0-5]?\d):([0-5]?\d)$/,
  'HH': /^([01]?\d|2[0-3])$/
}

/**
 * 12小时制时间格式正则表达式
 */
export const TIME_12H_FORMAT_REGEX = {
  'hh:mm:ss A': /^(0?[1-9]|1[0-2]):([0-5]?\d):([0-5]?\d)\s?(AM|PM)$/i,
  'hh:mm A': /^(0?[1-9]|1[0-2]):([0-5]?\d)\s?(AM|PM)$/i
}

/**
 * 补零函数
 */
export function padZero(num: number, length = 2): string {
  return num.toString().padStart(length, '0')
}

/**
 * 格式化时间
 */
export function formatTime(time: Date, format: string = DEFAULT_TIME_FORMAT): string {
  if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
    return ''
  }

  const hour = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()

  // 12小时制处理
  if (format.includes('A') || format.includes('a')) {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    
    return format
      .replace(/hh/g, padZero(hour12))
      .replace(/h/g, hour12.toString())
      .replace(/mm/g, padZero(minute))
      .replace(/m/g, minute.toString())
      .replace(/ss/g, padZero(second))
      .replace(/s/g, second.toString())
      .replace(/A/g, ampm)
      .replace(/a/g, ampm.toLowerCase())
  }

  // 24小时制处理
  return format
    .replace(/HH/g, padZero(hour))
    .replace(/H/g, hour.toString())
    .replace(/mm/g, padZero(minute))
    .replace(/m/g, minute.toString())
    .replace(/ss/g, padZero(second))
    .replace(/s/g, second.toString())
}

/**
 * 解析时间字符串
 */
export function parseTime(timeString: string, format: string = DEFAULT_TIME_FORMAT): Date | null {
  if (!timeString || typeof timeString !== 'string') {
    return null
  }

  const trimmedTime = timeString.trim()
  if (!trimmedTime) {
    return null
  }

  // 12小时制解析
  if (format.includes('A') || format.includes('a')) {
    const match12h = trimmedTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)$/i)
    if (match12h) {
      let hour = parseInt(match12h[1] || '0', 10)
      const minute = parseInt(match12h[2] || '0', 10)
      const second = match12h[3] ? parseInt(match12h[3], 10) : 0
      const ampm = match12h[4]?.toUpperCase() || 'AM'

      if (ampm === 'PM' && hour !== 12) {
        hour += 12
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0
      }

      const date = new Date()
      date.setHours(hour, minute, second, 0)
      return date
    }
    return null
  }

  // 24小时制解析
  const formatParts = format.split(/[^\w]/)
  const timeParts = trimmedTime.split(/[^\d]/)

  if (formatParts.length !== timeParts.length) {
    return null
  }

  let hour = 0
  let minute = 0
  let second = 0

  formatParts.forEach((part, index) => {
    const timePartValue = timeParts[index]
    if (!timePartValue) return
    
    const value = parseInt(timePartValue, 10)
    if (isNaN(value)) return

    if (part.includes('H')) {
      hour = value
    } else if (part.includes('m')) {
      minute = value
    } else if (part.includes('s')) {
      second = value
    }
  })

  // 验证时间有效性
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null
  }

  const date = new Date()
  date.setHours(hour, minute, second, 0)
  return date
}

/**
 * 验证时间格式
 */
export function isValidTime(timeString: string, format: TimeFormat): boolean {
  if (!timeString || typeof timeString !== 'string') {
    return false
  }

  const regex = TIME_FORMAT_REGEX[format]
  if (!regex) {
    return false
  }

  return regex.test(timeString.trim())
}

/**
 * 获取时间部分
 */
export function getTimeParts(time: Date): { hour: number; minute: number; second: number } {
  if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
    return { hour: 0, minute: 0, second: 0 }
  }

  return {
    hour: time.getHours(),
    minute: time.getMinutes(),
    second: time.getSeconds()
  }
}

/**
 * 设置时间部分
 */
export function setTimeParts(
  time: Date, 
  parts: Partial<{ hour: number; minute: number; second: number }>
): Date {
  const newTime = new Date(time)
  
  if (parts.hour !== undefined) {
    newTime.setHours(parts.hour)
  }
  if (parts.minute !== undefined) {
    newTime.setMinutes(parts.minute)
  }
  if (parts.second !== undefined) {
    newTime.setSeconds(parts.second)
  }
  
  return newTime
}

/**
 * 比较时间
 */
export function compareTime(time1: Date, time2: Date): number {
  if (!time1 || !time2) {
    return 0
  }

  const t1 = time1.getHours() * 3600 + time1.getMinutes() * 60 + time1.getSeconds()
  const t2 = time2.getHours() * 3600 + time2.getMinutes() * 60 + time2.getSeconds()

  return t1 - t2
}

/**
 * 生成时间选项
 */
export function generateTimeOptions(
  type: 'hour' | 'minute' | 'second' | 'ampm',
  step: number = 1,
  use12Hours: boolean = false
): TimeOption[] {
  const options: TimeOption[] = []

  switch (type) {
    case 'hour': {
      const maxHour = use12Hours ? 12 : 23
      const startHour = use12Hours ? 1 : 0
      
      for (let i = startHour; i <= maxHour; i += step) {
        options.push({
          value: use12Hours ? i : i,
          label: padZero(i)
        })
      }
      break
    }

    case 'minute':
    case 'second':
      for (let i = 0; i < 60; i += step) {
        options.push({
          value: i,
          label: padZero(i)
        })
      }
      break

    case 'ampm':
      options.push(
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' }
      )
      break
  }

  return options
}

/**
 * 获取当前时间
 */
export function getCurrentTime(): Date {
  return new Date()
}

/**
 * 创建时间对象
 */
export function createTime(hour: number = 0, minute: number = 0, second: number = 0): Date {
  const date = new Date()
  date.setHours(hour, minute, second, 0)
  return date
}

/**
 * 时间转换为字符串
 */
export function timeToString(time: TimeValue, format: string = DEFAULT_TIME_FORMAT): string {
  if (!time) {
    return ''
  }

  if (typeof time === 'string') {
    const parsed = parseTime(time, format)
    return parsed ? formatTime(parsed, format) : time
  }

  if (time instanceof Date) {
    return formatTime(time, format)
  }

  return ''
}

/**
 * 字符串转换为时间
 */
export function stringToTime(timeString: string, format: string = DEFAULT_TIME_FORMAT): Date | null {
  return parseTime(timeString, format)
}

/**
 * 获取时间格式的显示部分
 */
export function getFormatParts(format: TimeFormat): Array<'hour' | 'minute' | 'second'> {
  const parts: Array<'hour' | 'minute' | 'second'> = []

  if (format.includes('H') || format.includes('h')) {
    parts.push('hour')
  }
  if (format.includes('m')) {
    parts.push('minute')
  }
  if (format.includes('s')) {
    parts.push('second')
  }

  return parts
}

/**
 * 检查时间是否在范围内
 */
export function isTimeInRange(time: Date, start?: Date, end?: Date): boolean {
  if (!time) return false

  const timeValue = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds()

  if (start) {
    const startValue = start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds()
    if (timeValue < startValue) return false
  }

  if (end) {
    const endValue = end.getHours() * 3600 + end.getMinutes() * 60 + end.getSeconds()
    if (timeValue > endValue) return false
  }

  return true
}

/**
 * 获取最近的有效时间
 */
export function getNearestValidTime(
  time: Date,
  step: TimeStep = {},
  disabledTime?: (time: Date) => boolean
): Date {
  const { hour: hourStep = 1, minute: minuteStep = 1, second: secondStep = 1 } = step
  
  const nearestTime = new Date(time)
  
  // 调整到最近的步长
  const hour = Math.round(nearestTime.getHours() / hourStep) * hourStep
  const minute = Math.round(nearestTime.getMinutes() / minuteStep) * minuteStep
  const second = Math.round(nearestTime.getSeconds() / secondStep) * secondStep
  
  nearestTime.setHours(Math.min(23, hour))
  nearestTime.setMinutes(Math.min(59, minute))
  nearestTime.setSeconds(Math.min(59, second))
  
  // 检查是否被禁用
  if (disabledTime && disabledTime(nearestTime)) {
    // 尝试找到下一个可用时间
    for (let i = 1; i <= 60; i++) {
      const nextTime = new Date(nearestTime)
      nextTime.setMinutes(nextTime.getMinutes() + i * minuteStep)
      
      if (!disabledTime(nextTime)) {
        return nextTime
      }
    }
  }
  
  return nearestTime
}

/**
 * 时间工具对象
 */
export const timeUtils: TimeUtils = {
  formatTime,
  parseTime,
  getTimeParts,
  setTimeParts,
  isValidTime: (timeString: string, format: string) => {
    return isValidTime(timeString, format as TimeFormat)
  },
  compareTime
}

/**
 * 默认时间步长
 */
export const DEFAULT_TIME_STEP: TimeStep = {
  hour: 1,
  minute: 1,
  second: 1
}

/**
 * 将24小时制转换为12小时制
 * @param hour24 24小时制的小时数 (0-23)
 * @returns 12小时制的小时数和AM/PM标识
 */
export function getHour12(hour24: number): { hour: number; period: 'AM' | 'PM' } {
  if (hour24 === 0) {
    return { hour: 12, period: 'AM' }
  } else if (hour24 < 12) {
    return { hour: hour24, period: 'AM' }
  } else if (hour24 === 12) {
    return { hour: 12, period: 'PM' }
  } else {
    return { hour: hour24 - 12, period: 'PM' }
  }
}

/**
 * 将12小时制转换为24小时制
 * @param hour12 12小时制的小时数 (1-12)
 * @param period AM或PM标识
 * @returns 24小时制的小时数 (0-23)
 */
export function getHour24(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') {
    return hour12 === 12 ? 0 : hour12
  } else {
    return hour12 === 12 ? 12 : hour12 + 12
  }
}