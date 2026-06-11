import type { ExtractPropTypes } from 'vue'

// 时间值类型
export type TimeValue = string | Date | null

// 时间格式类型
export type TimeFormat = 'HH:mm:ss' | 'HH:mm' | 'mm:ss' | 'HH'

// 时间选择器大小
export type TimePickerSize = 'small' | 'medium' | 'large'

// 时间选择器状态
export type TimePickerStatus = 'normal' | 'error' | 'warning' | 'success'

// 时间步长配置
export interface TimeStep {
  hour?: number
  minute?: number
  second?: number
}

// 时间范围
export interface TimeRange {
  start: TimeValue
  end: TimeValue
}

// 时间禁用配置
export interface DisabledTimeConfig {
  disabledHours?: () => number[]
  disabledMinutes?: (hour: number) => number[]
  disabledSeconds?: (hour: number, minute: number) => number[]
}

// 时间禁用函数
export type DisabledTime = (time: Date) => boolean | DisabledTimeConfig

// 时间选择器属性
export interface ExTimePickerProps {
  /** 绑定值 */
  modelValue?: TimeValue
  /** 时间格式 */
  format?: TimeFormat
  /** 值格式 */
  valueFormat?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 组件大小 */
  size?: TimePickerSize
  /** 状态 */
  status?: TimePickerStatus
  /** 时间步长 */
  step?: TimeStep
  /** 禁用时间 */
  disabledTime?: DisabledTime
  /** 是否显示当前时间 */
  showNow?: boolean
  /** 是否使用12小时制 */
  use12Hours?: boolean
  /** 弹出层类名 */
  popperClass?: string
  /** 是否在失焦时触发验证 */
  validateEvent?: boolean
  /** 输入框前缀图标 */
  prefixIcon?: string
  /** 输入框后缀图标 */
  suffixIcon?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 自定义输入框样式 */
  inputStyle?: string | Record<string, string | number>
  /** 自定义面板样式 */
  panelStyle?: string | Record<string, string | number>
}

// 时间范围选择器属性
export interface ExTimeRangePickerProps {
  /** 绑定值 */
  modelValue?: TimeRange | [TimeValue, TimeValue]
  /** 时间格式 */
  format?: TimeFormat
  /** 值格式 */
  valueFormat?: string
  /** 开始时间占位符 */
  startPlaceholder?: string
  /** 结束时间占位符 */
  endPlaceholder?: string
  /** 范围分隔符 */
  rangeSeparator?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 组件大小 */
  size?: TimePickerSize
  /** 状态 */
  status?: TimePickerStatus
  /** 时间步长 */
  step?: TimeStep
  /** 禁用时间 */
  disabledTime?: DisabledTime
  /** 是否显示当前时间 */
  showNow?: boolean
  /** 是否使用12小时制 */
  use12Hours?: boolean
  /** 弹出层类名 */
  popperClass?: string
  /** 是否在失焦时触发验证 */
  validateEvent?: boolean
  /** 是否显示边框 */
  bordered?: boolean
}

// 时间面板属性
export interface TimePanelProps {
  /** 当前时间值 */
  value?: TimeValue
  /** 时间格式 */
  format?: TimeFormat
  /** 时间步长 */
  step?: TimeStep
  /** 禁用时间 */
  disabledTime?: DisabledTime
  /** 是否显示当前时间 */
  showNow?: boolean
  /** 是否使用12小时制 */
  use12Hours?: boolean
  /** 是否可见 */
  visible?: boolean
}

// 时间列属性
export interface TimeColumnProps {
  /** 列类型 */
  type: 'hour' | 'minute' | 'second' | 'ampm'
  /** 当前值 */
  value?: number | string
  /** 选项列表 */
  options: Array<{ value: number | string; label: string; disabled?: boolean }>
  /** 步长 */
  step?: number
  /** 是否禁用 */
  disabled?: boolean
}

// 时间选项
export interface TimeOption {
  value: number | string
  label: string
  disabled?: boolean
}

// 时间变更事件参数
export interface TimeChangeEvent {
  value: TimeValue
  timeString: string
}

// 时间范围变更事件参数
export interface TimeRangeChangeEvent {
  value: TimeRange | [TimeValue, TimeValue]
  timeStrings: [string, string]
}

// 时间工具类型
export interface TimeUtils {
  /** 格式化时间 */
  formatTime: (time: Date, format: string) => string
  /** 解析时间字符串 */
  parseTime: (timeString: string, format: string) => Date | null
  /** 获取时间部分 */
  getTimeParts: (time: Date) => { hour: number; minute: number; second: number }
  /** 设置时间部分 */
  setTimeParts: (time: Date, parts: Partial<{ hour: number; minute: number; second: number }>) => Date
  /** 验证时间格式 */
  isValidTime: (timeString: string, format: string) => boolean
  /** 比较时间 */
  compareTime: (time1: Date, time2: Date) => number
}

// 导出属性类型
export type ExTimePickerPropsType = ExtractPropTypes<ExTimePickerProps>
export type ExTimeRangePickerPropsType = ExtractPropTypes<ExTimeRangePickerProps>