/** 时间选择器尺寸 */
export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerEndpoint = 'start' | 'end';
export type TimePickerRange = [string, string];

/**
 * TimePicker 组件属性
 */
export interface ExTimePickerProps {
  /** 绑定值，格式与 format 一致 */
  modelValue?: string;
  /** 开启独立范围模式，使用 rangeValue，保留原单值事件的字符串类型。 */
  range?: boolean;
  /** 时间范围；undefined 为非受控，null 为明确的受控空值。 */
  rangeValue?: TimePickerRange | null;
  /** 时间格式，支持 HH / mm / ss（冒号分隔） */
  format?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 触发器原生 ID */
  id?: string;
  /** 触发器无障碍名称 */
  ariaLabel?: string;
  /** 触发器无障碍描述元素 ID */
  ariaDescribedby?: string;
  /** 尺寸 */
  size?: TimePickerSize;
  /** 小时步进 */
  hourStep?: number;
  /** 分钟步进 */
  minuteStep?: number;
  /** 秒步进 */
  secondStep?: number;
  /** 返回禁用的小时数组 */
  disabledHours?: (endpoint?: TimePickerEndpoint) => number[];
  /** 返回禁用的分钟数组 */
  disabledMinutes?: (hour: number, endpoint?: TimePickerEndpoint) => number[];
  /** 返回禁用的秒数组 */
  disabledSeconds?: (hour: number, minute: number, endpoint?: TimePickerEndpoint) => number[];
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
  /** 范围模式确认后请求更新；清空时为 null。 */
  'update:rangeValue': [value: TimePickerRange | null];
  /** 范围模式的完整提交，不影响单值 change 的类型。 */
  'range-change': [value: TimePickerRange | null];
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
