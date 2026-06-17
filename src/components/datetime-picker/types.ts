/**
 * 日期时间选择器类型
 */
export type DateTimePickerType = 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year';

/**
 * 日期时间选择器尺寸
 */
export type DateTimePickerSize = 'small' | 'medium' | 'large';

/**
 * 日期格式化类型
 */
export type DateFormat = string;

/**
 * 禁用日期函数
 */
export type DisabledDateFn = (date: Date) => boolean;

/**
 * 日期时间选择器组件属性接口
 */
export interface ExDateTimePickerProps {
  /** 绑定值 */
  modelValue?: Date | [Date, Date] | null;
  /** 选择器类型 */
  type?: DateTimePickerType;
  /** 尺寸 */
  size?: DateTimePickerSize;
  /** 占位符 */
  placeholder?: string;
  /** 范围选择时的开始占位符 */
  startPlaceholder?: string;
  /** 范围选择时的结束占位符 */
  endPlaceholder?: string;
  /** 日期格式 */
  format?: DateFormat;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn;
  /** 是否显示时间 */
  showTime?: boolean;
  /** 时间步长（分钟） */
  timeStep?: number;
  /** 是否显示今天按钮 */
  showToday?: boolean;
  /** 是否显示清除按钮 */
  showClear?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 日期时间选择器组件事件接口
 */
export interface ExDateTimePickerEmits {
  /** 值改变事件 */
  'update:modelValue': [value: Date | [Date, Date] | null];
  /** 值改变事件 */
  change: [value: Date | [Date, Date] | null];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
  /** 清空事件 */
  clear: [];
}

/**
 * 日期时间选择器组件暴露的方法接口
 */
export interface ExDateTimePickerExposed {
  /** 聚焦输入框 */
  focus: () => void;
  /** 失焦输入框 */
  blur: () => void;
  /** 获取输入框DOM元素 */
  getElement: () => HTMLDivElement | null;
}
