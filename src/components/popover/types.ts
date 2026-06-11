/**
 * Popover 位置
 */
export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

/**
 * Popover 触发方式
 */
export type PopoverTrigger = 'hover' | 'click' | 'focus' | 'manual' | 'contextmenu';

/**
 * Popover 位置信息
 */
export interface PopoverPosition {
  top: number;
  left: number;
  right: number;
  bottom: number;
  x: number;
  y: number;
  placement: PopoverPlacement;
  arrowX?: number;
  arrowY?: number;
}

/**
 * Popover 边界检查
 */
export interface PopoverBoundaryCheck {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/**
 * Popover 配置
 */
export interface PopoverConfig {
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger;
  offset?: number | [number, number];
  showArrow?: boolean;
  disabled?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
}

/**
 * Popover 组件属性
 */
export interface ExPopoverProps {
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 出现位置 */
  placement?: PopoverPlacement;
  /** 触发方式 */
  trigger?: PopoverTrigger;
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 偏移量 */
  offset?: number;
  /** 宽度 */
  width?: string | number;
  /** 过渡动画名称 */
  transition?: string;
  /** 延迟显示（毫秒） */
  openDelay?: number;
  /** 延迟隐藏（毫秒） */
  closeDelay?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 层级 */
  zIndex?: number;
  /** 手动控制显示（v-model） */
  modelValue?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * Popover 组件事件
 */
export interface ExPopoverEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean];
  /** 显示时触发 */
  show: [];
  /** 隐藏时触发 */
  hide: [];
}

/**
 * Popover 组件暴露的方法
 */
export interface ExPopoverExposed {
  /** 显示 Popover */
  show: () => void;
  /** 隐藏 Popover */
  hide: () => void;
  /** 更新位置 */
  updatePosition: () => void;
}
