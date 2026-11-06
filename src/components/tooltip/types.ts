/**
 * Tooltip 位置
 */
export type TooltipPlacement =
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
  | 'right-end';

/**
 * Tooltip 触发方式
 */
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'hover-focus';

/**
 * Tooltip 主题
 */
export type TooltipEffect = 'dark' | 'light';

/**
 * Tooltip 位置信息
 */
export interface TooltipPosition {
  top: number;
  left: number;
  x: number;
  y: number;
  placement: TooltipPlacement;
  arrow?: {
    x: number;
    y: number;
  };
}

/**
 * Tooltip 边界
 */
export interface TooltipBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Tooltip 触发信息
 */
export interface TooltipTriggerInfo {
  element: HTMLElement;
  rect: DOMRect;
  visible: boolean;
  inViewport: boolean;
}

/**
 * Tooltip 组件属性
 */
export interface ExTooltipProps {
  /** 显示的内容 */
  content?: string;
  /** 出现位置 */
  placement?: TooltipPlacement;
  /** 触发方式 */
  trigger?: TooltipTrigger;
  /** 主题 */
  effect?: TooltipEffect;
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 偏移量 */
  offset?: number;
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
 * Tooltip 组件事件
 */
export interface ExTooltipEmits {
  /** 请求更新受控显示状态 */
  'update:modelValue': [visible: boolean];
  /** 显示时触发 */
  show: [];
  /** 隐藏时触发 */
  hide: [];
}

/**
 * Tooltip 组件暴露的方法
 */
export interface ExTooltipExposed {
  /** 显示 Tooltip */
  show: () => void;
  /** 隐藏 Tooltip */
  hide: () => void;
  /** 更新位置 */
  updatePosition: () => void;
}
