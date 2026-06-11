export type DateValue = Date | string | number | null | undefined
export type DateRangeValue = [DateValue, DateValue] | DateValue[]
export type DatePickerType = 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year'
export type DatePickerSize = 'small' | 'medium' | 'large'
export type DatePickerPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'

export interface DatePickerShortcut {
  text: string
  label: string
  value: DateValue | DateValue[] | (() => DateValue | DateValue[])
}

// 类型别名，保持向后兼容
export type DateShortcut = DatePickerShortcut

export interface DatePickerDisabledDate {
  (date: Date): boolean
}

export interface ExDatePickerProps {
  /** 绑定值 */
  modelValue?: DateValue | DateValue[]
  /** 类型 */
  type?: DatePickerType
  /** 尺寸 */
  size?: DatePickerSize
  /** 占位符 */
  placeholder?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 格式化 */
  format?: string
  /** 值格式化 */
  valueFormat?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 弹出位置 */
  placement?: DatePickerPlacement
  /** 快捷选项 */
  shortcuts?: DatePickerShortcut[]
  /** 禁用日期 */
  disabledDate?: DatePickerDisabledDate
  /** 默认显示的时间 */
  defaultTime?: Date | Date[]
  /** 默认显示的月份 */
  defaultValue?: DateValue | DateValue[]
  /** 范围分隔符 */
  rangeSeparator?: string
  /** 是否显示时间选择 */
  showTime?: boolean
  /** 时间格式 */
  timeFormat?: string
  /** 是否显示今天按钮 */
  showToday?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否在选择日期后关闭弹窗 */
  closeOnSelect?: boolean
  /** 输入框前缀图标 */
  prefixIcon?: string
  /** 输入框后缀图标 */
  suffixIcon?: string
  /** 自定义类名 */
  popupClass?: string
  /** 自定义样式 */
  popupStyle?: Record<string, string | number>
  /** 是否将弹窗插入到 body */
  appendToBody?: boolean
  /** z-index */
  zIndex?: number
  /** 是否可输入 */
  editable?: boolean
  /** 输入时是否触发表单验证 */
  validateEvent?: boolean
  /** 原生 name 属性 */
  name?: string
  /** 原生 id 属性 */
  id?: string
  /** 原生 autocomplete 属性 */
  autocomplete?: string
  /** 原生 tabindex 属性 */
  tabindex?: string | number
  /** 语言环境 */
  locale?: string
  /** 一周的第一天 */
  firstDayOfWeek?: number
  /** 是否显示周数 */
  showWeekNumber?: boolean
  /** 禁用的小时 */
  disabledHours?: () => number[]
  /** 禁用的分钟 */
  disabledMinutes?: (hour: number) => number[]
  /** 禁用的秒 */
  disabledSeconds?: (hour: number, minute: number) => number[]
  /** 小时步长 */
  hourStep?: number
  /** 分钟步长 */
  minuteStep?: number
  /** 秒步长 */
  secondStep?: number
  /** 是否使用12小时制 */
  use12Hours?: boolean
}

export interface ExDatePickerEmits {
  'update:modelValue': [value: DateValue | DateValue[]]
  'change': [value: DateValue | DateValue[]]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'visible-change': [visible: boolean]
  'panel-change': [date: Date, mode: string]
  'calendar-change': [date: Date[]]
}

export interface DatePickerPanelProps {
  modelValue?: DateValue | DateValue[]
  type?: DatePickerType
  format?: string
  showTime?: boolean
  timeFormat?: string
  disabledDate?: DatePickerDisabledDate
  shortcuts?: DatePickerShortcut[]
  defaultValue?: DateValue | DateValue[]
  rangeSeparator?: string
  showToday?: boolean
  showConfirm?: boolean
}

export interface DatePickerCalendarProps {
  modelValue?: Date
  type?: 'date' | 'month' | 'year'
  disabledDate?: DatePickerDisabledDate
  showToday?: boolean
}

export interface DatePickerTimeProps {
  modelValue?: Date
  format?: string
  disabled?: boolean
}

export interface DisabledTime {
  disabledHours?: () => number[]
  disabledMinutes?: (hour: number) => number[]
  disabledSeconds?: (hour: number, minute: number) => number[]
}

export interface TimePanelProps {
  /** 当前时间值 */
  modelValue?: Date
  /** 当前时间值（别名） */
  value?: Date
  /** 时间格式 */
  format?: string
  /** 小时步长 */
  hourStep?: number
  /** 分钟步长 */
  minuteStep?: number
  /** 秒步长 */
  secondStep?: number
  /** 是否使用12小时制 */
  use12Hours?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用时间 */
  disabledTime?: DisabledTime
  /** 禁用的小时 */
  disabledHours?: () => number[]
  /** 禁用的分钟 */
  disabledMinutes?: (hour: number) => number[]
  /** 禁用的秒 */
  disabledSeconds?: (hour: number, minute: number) => number[]
}

export interface DatePanelProps {
  /** 当前日期值 */
  modelValue?: Date | Date[]
  /** 当前日期值（别名） */
  value?: Date | Date[]
  /** 面板类型 */
  type?: 'date' | 'month' | 'year'
  /** 一周的第一天 */
  firstDayOfWeek?: number
  /** 语言环境 */
  locale?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用日期函数 */
  disabledDate?: DatePickerDisabledDate
  /** 是否显示今天按钮 */
  showToday?: boolean
  /** 是否显示周数 */
  showWeekNumber?: boolean
  /** 日期格式 */
  format?: string
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
}

// 日期工具类型
export interface DateUtils {
  format: (date: Date, format: string) => string
  parse: (dateString: string, format: string) => Date | null
  isValid: (date: unknown) => boolean
  isSame: (date1: Date, date2: Date, unit?: string) => boolean
  isAfter: (date1: Date, date2: Date) => boolean
  isBefore: (date1: Date, date2: Date) => boolean
  startOf: (date: Date, unit: string) => Date
  endOf: (date: Date, unit: string) => Date
  add: (date: Date, amount: number, unit: string) => Date
  subtract: (date: Date, amount: number, unit: string) => Date
  getWeekday: (date: Date) => number
  getDaysInMonth: (date: Date) => number
  getMonthName: (date: Date, locale?: string) => string
  getWeekdayName: (date: Date, locale?: string) => string
}