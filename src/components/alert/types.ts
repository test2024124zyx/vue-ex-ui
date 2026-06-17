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
