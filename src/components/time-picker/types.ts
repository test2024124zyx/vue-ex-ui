/** 时间选择器尺寸 */
export type TimePickerSize = 'small' | 'medium' | 'large';

/**
 * TimePicker 组件属性
 */
export interface ExTimePickerProps {
  /** 绑定值，格式与 format 一致 */
  modelValue?: string;
  /** 时间格式，支持 HH / mm / ss（冒号分隔） */
  format?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 尺寸 */
  size?: TimePickerSize;
  /** 小时步进 */
  hourStep?: number;
  /** 分钟步进 */
  minuteStep?: number;
  /** 秒步进 */
  secondStep?: number;
  /** 返回禁用的小时数组 */
  disabledHours?: () => number[];
  /** 返回禁用的分钟数组 */
  disabledMinutes?: (hour: number) => number[];
  /** 返回禁用的秒数组 */
  disabledSeconds?: (hour: number, minute: number) => number[];
  /** 下拉面板是否传送到 body */
  teleported?: boolean;
  /** 弹层自定义类名 */
  popperClass?: string;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * TimePicker 组件事件
 */
export interface ExTimePickerEmits {
  /** 更新绑定值 */
  'update:modelValue': [value: string];
  /** 值变化 */
  change: [value: string];
  /** 获得焦点 */
  focus: [event: FocusEvent];
  /** 失去焦点 */
  blur: [event: FocusEvent];
  /** 清空 */
  clear: [];
  /** 面板显隐变化 */
  'visible-change': [visible: boolean];
}

/**
 * TimePicker 暴露方法
 */
export interface ExTimePickerExposed {
  /** 聚焦 */
  focus: () => void;
  /** 失焦 */
  blur: () => void;
}
