import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

export type AlertType = 'success' | 'info' | 'warning' | 'error';
export type AlertSize = 'small' | 'medium' | 'large';
export type AlertVariant = 'standard' | 'filled' | 'outlined';

// ============================================================================
// Alert 组件 Props
// ============================================================================

export interface ExAlertProps {
  /** 警告类型 */
  type?: AlertType;
  /** 组件尺寸 */
  size?: AlertSize;
  /** 变体样式 */
  variant?: AlertVariant;
  /** 标题 */
  title?: string;
  /** 描述文本 */
  description?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭按钮文本 */
  closeText?: string;
  /** 是否居中 */
  center?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 自定义图标 */
  icon?: string;
  /** 自定义关闭图标 */
  closeIcon?: string;
  /** 自定义CSS类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
  /** 进度值 (0-100) */
  progress?: number;
  /** 计数器值 */
  counter?: number;
  /** 最大计数器值 */
  maxCounter?: number;
  /** 自定义渲染函数 */
  render?: (props: ExAlertProps) => VNode;
}

// ============================================================================
// Alert 组件 Emits
// ============================================================================

export interface ExAlertEmits {
  /** 关闭事件 */
  close: [event: MouseEvent];
  /** 关闭后的回调 */
  afterClose: [];
}

// ============================================================================
// Alert 组件 Slots
// ============================================================================

export interface ExAlertSlots {
  /** 默认插槽（内容） */
  default?: () => VNode[];
  /** 标题插槽 */
  title?: () => VNode[];
  /** 图标插槽 */
  icon?: () => VNode[];
  /** 关闭按钮插槽 */
  close?: () => VNode[];
  /** 操作区域插槽 */
  action?: () => VNode[];
}

// ============================================================================
// Alert 组件实例
// ============================================================================

export interface ExAlertInstance {
  /** 关闭警告 */
  close: () => void;
}

/**
 * Alert 操作按钮
 */
export interface AlertAction {
  text: string;
  onClick?: (event: MouseEvent) => void;
  type?: 'primary' | 'default' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Alert 服务配置
 */
export interface AlertServiceConfig {
  id?: string;
  type: AlertType;
  size: AlertSize;
  variant: AlertVariant;
  title?: string;
  message?: string;
  description?: string;
  showIcon?: boolean;
  closable?: boolean;
  closeText?: string;
  duration?: number;
  autoClose?: boolean;
  maxCount?: number;
  stackable?: boolean;
  stackGap?: number;
  placement?: 'top' | 'bottom' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  offset?: number;
  zIndex?: number;
  animation?: 'slide' | 'fade' | 'zoom' | 'bounce' | 'none';
  customClass?: string;
  customStyle?: Record<string, string>;
  icon?: string | VNode;
  closeIcon?: string | VNode;
  actions?: AlertAction[];
  onClose?: () => void;
  onAfterClose?: () => void;
  onClick?: (event: MouseEvent) => void;
  render?: (props: ExAlertProps) => VNode;
  progress?: number;
  counter?: number;
  maxCounter?: number;
}

/**
 * Alert 全局配置
 */
export interface AlertGlobalConfig {
  defaultType: AlertType;
  defaultSize: AlertSize;
  defaultVariant: AlertVariant;
  defaultDuration: number;
  defaultPlacement: AlertServiceConfig['placement'];
  defaultMaxCount: number;
  defaultAnimation: AlertServiceConfig['animation'];
  defaultShowIcon: boolean;
  defaultClosable: boolean;
  defaultAutoClose: boolean;
  iconMap: Record<AlertType, string>;
  cssVariables: Record<string, string>;
}

/**
 * Alert 统计信息
 */
export interface AlertStats {
  total: number;
  activeCount: number;
  totalCount: number;
  typeCount?: Record<AlertType, number>;
  byType: Record<AlertType, number>;
  byPlacement: Record<string, number>;
  averageDuration: number;
  averageDisplayTime?: number;
}

/**
 * Alert 过滤器
 */
export interface AlertFilter {
  type?: AlertType | AlertType[];
  size?: AlertSize | AlertSize[];
  variant?: AlertVariant | AlertVariant[];
  placement?: AlertServiceConfig['placement'] | AlertServiceConfig['placement'][];
  closable?: boolean;
  showIcon?: boolean;
  custom?: (alert: AlertServiceInstance) => boolean;
}

/**
 * Alert 排序选项
 */
export interface AlertSortOptions {
  by: 'createdAt' | 'type' | 'duration' | 'custom';
  field?: string;
  order: 'asc' | 'desc';
  custom?: (a: AlertServiceInstance, b: AlertServiceInstance) => number;
}

/**
 * Alert 服务实例
 */
export interface AlertServiceInstance {
  id: string;
  close: () => void;
  update: (config: Partial<AlertServiceConfig>) => void;
  destroy: () => void;
}

/**
 * Alert 主题配置
 */
export interface AlertThemeConfig {
  colors: Record<AlertType, string>;
  backgrounds?: Record<AlertType, string>;
  borders?: Record<AlertType, string>;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  iconSize?: string;
  boxShadow?: string;
}

/**
 * Alert 动画配置
 */
export interface AlertAnimationConfig {
  enterDuration: number;
  leaveDuration: number;
  easing: string;
  enabled: boolean;
}
