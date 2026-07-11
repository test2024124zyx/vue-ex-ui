import type { CSSProperties } from 'vue';

/** 已实现并保持完整语义的选择模式。 */
export type DateTimePickerType = 'date' | 'datetime' | 'daterange' | 'datetimerange';

export type DateTimePickerSize = 'small' | 'medium' | 'large';
export type DateTimePickerRange = [Date, Date];
export type DateTimePickerValue = Date | DateTimePickerRange | null;
export type DisabledDateFn = (date: Date) => boolean;

/** 日期时间选择器属性。 */
export interface ExDateTimePickerProps {
  /** 当前日期或日期范围。 */
  modelValue?: DateTimePickerValue;
  /** 日期与时间选择模式。 */
  type?: DateTimePickerType;
  /** 组件尺寸。 */
  size?: DateTimePickerSize;
  /** 输入框占位文本。 */
  placeholder?: string;
  /** 范围起点占位文本。 */
  startPlaceholder?: string;
  /** 范围终点占位文本。 */
  endPlaceholder?: string;
  /** 使用 YYYY、MM、DD、HH、mm、ss 标记的显示格式。 */
  format?: string;
  /** 是否禁用全部交互。 */
  disabled?: boolean;
  /** 是否只读并禁止打开面板。 */
  readonly?: boolean;
  /** 是否允许清空。 */
  clearable?: boolean;
  /** 判断某个本地日历日期是否不可选择。 */
  disabledDate?: DisabledDateFn;
  /** 在 date 或 daterange 模式中额外启用时间选择。 */
  showTime?: boolean;
  /** 分钟输入步长，规范范围为 1～60。 */
  timeStep?: number;
  /** 是否显示“今天”按钮。 */
  showToday?: boolean;
  /** 输入框无障碍名称。 */
  ariaLabel?: string;
  /** 根元素自定义类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素自定义样式。 */
  style?: string | CSSProperties;
}

/** 日期时间选择器事件。 */
export interface ExDateTimePickerEmits {
  /** 已确认值发生变化。 */
  'update:modelValue': [value: DateTimePickerValue];
  /** 一次日期或时间选择正式提交。 */
  change: [value: DateTimePickerValue];
  /** 输入框获得焦点。 */
  focus: [event: FocusEvent];
  /** 输入框失去焦点。 */
  blur: [event: FocusEvent];
  /** 当前值被清空。 */
  clear: [];
  /** 面板可见状态发生变化。 */
  'visible-change': [visible: boolean];
}

/** 日期时间选择器公开方法。 */
export interface ExDateTimePickerExposed {
  /** 聚焦输入框。 */
  focus: () => void;
  /** 移除输入框焦点。 */
  blur: () => void;
  /** 获取组件根元素。 */
  getElement: () => HTMLDivElement | null;
}
