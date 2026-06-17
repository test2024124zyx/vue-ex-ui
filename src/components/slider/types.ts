/**
 * 滑块值类型
 */
export type SliderValue = number | [number, number];

/**
 * 滑块标记
 */
export interface SliderMark {
  /** 标记值 */
  value: number;
  /** 标记标签 */
  label?: string;
  /** 自定义样式 */
  style?: Record<string, string>;
}

/**
 * 滑块标记集合
 */
export type SliderMarks = Record<number, string | SliderMark>;

/**
 * 滑块尺寸
 */
export type SliderSize = 'small' | 'medium' | 'large';

/**
 * 滑块方向
 */
export type SliderDirection = 'horizontal' | 'vertical';

/**
 * 滑块提示显示时机
 */
export type SliderTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * 滑块组件属性接口
 */
export interface ExSliderProps {
  /** 绑定值 */
  modelValue?: number | [number, number];
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为范围选择 */
  range?: boolean;
  /** 是否显示输入框 */
  showInput?: boolean;
  /** 是否显示步进按钮 */
  showStops?: boolean;
  /** 是否显示提示信息 */
  showTooltip?: boolean;
  /** 提示信息显示位置 */
  tooltipPlacement?: SliderTooltipPlacement;
  /** 格式化提示信息 */
  formatTooltip?: (value: number) => string;
  /** 标记 */
  marks?: Record<number, string | SliderMark>;
  /** 尺寸 */
  size?: SliderSize;
  /** 方向 */
  direction?: SliderDirection;
  /** 高度（垂直模式） */
  height?: string;
  /** 是否反向 */
  reverse?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 无障碍描述 */
  ariaDescription?: string;
}

/**
 * 滑块组件事件接口
 */
export interface ExSliderEmits {
  /** 值改变事件 */
  'update:modelValue': [value: number | [number, number]];
  /** 值改变事件（拖动过程中） */
  change: [value: number | [number, number]];
  /** 输入事件（拖动过程中） */
  input: [value: number | [number, number]];
}

/**
 * 滑块组件暴露的方法接口
 */
export interface ExSliderExposed {
  /** 获取滑块DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 重置滑块 */
  reset: () => void;
  /** 聚焦滑块手柄 */
  focus: () => void;
  /** 取消聚焦 */
  blur: () => void;
}
