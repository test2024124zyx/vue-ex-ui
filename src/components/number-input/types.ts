/**
 * 数字输入框尺寸
 */
export type NumberInputSize = 'small' | 'medium' | 'large';

/**
 * 控制按钮位置
 */
export type NumberInputControlsPosition = 'right' | 'both';

/**
 * 数字输入框组件属性
 */
export interface ExNumberInputProps {
  /** 绑定值 */
  modelValue?: number | null;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 精度（小数位数） */
  precision?: number;
  /** 尺寸 */
  size?: NumberInputSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 是否显示控制按钮 */
  controls?: boolean;
  /** 控制按钮位置 */
  controlsPosition?: NumberInputControlsPosition;
  /** 是否严格步长（只能输入步长的倍数） */
  strictStep?: boolean;
  /** 输入框名称 */
  name?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 输入防抖延迟（毫秒），0 表示不防抖 */
  debounceDelay?: number;
}

/**
 * 数字输入框组件事件
 */
export interface ExNumberInputEmits {
  /** 值变化事件 */
  'update:modelValue': [value: number | null];
  /** 值变化事件（在输入完成后触发） */
  change: [value: number | null, oldValue: number | null];
  /** 输入事件（实时触发） */
  input: [value: number | null];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
  /** 增加按钮点击事件 */
  increase: [value: number | null];
  /** 减少按钮点击事件 */
  decrease: [value: number | null];
}

/**
 * 数字输入框组件暴露的方法
 */
export interface ExNumberInputExposed {
  /** 聚焦输入框 */
  focus: () => void;
  /** 失焦输入框 */
  blur: () => void;
  /** 选中输入框内容 */
  select: () => void;
  /** 增加值 */
  increase: () => void;
  /** 减少值 */
  decrease: () => void;
  /** 获取输入框DOM元素 */
  getElement: () => HTMLDivElement | null;
}
