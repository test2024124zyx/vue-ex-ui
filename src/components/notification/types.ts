/**
 * Notification 通知提醒组件类型定义
 * 用于全局展示通知提醒信息
 */

import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

/** 通知类型 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** 通知位置 */
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

// ============================================================================
// Notification 组件 Props
// ============================================================================

export interface ExNotificationProps {
  /** 通知唯一标识 */
  id?: string;
  /** 通知类型 */
  type?: NotificationType;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 显示时长（毫秒），设为 0 则不自动关闭 */
  duration?: number;
  /** 自定义 CSS 类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
  /** 层级 */
  zIndex?: number;
  /** 距离边缘的偏移量 */
  offset?: number;
  /** 显示位置 */
  position?: NotificationPosition;
  /** 是否将内容作为 HTML 片段处理 */
  dangerouslyUseHTMLString?: boolean;
  /** 关闭时的回调 */
  onClose?: () => void;
  /** 点击时的回调 */
  onClick?: () => void;
}

// ============================================================================
// Notification 组件 Emits
// ============================================================================

export interface ExNotificationEmits {
  /** 关闭事件 */
  close: [];
  /** 销毁事件 */
  destroy: [];
  /** 点击事件 */
  click: [];
}

// ============================================================================
// Notification 组件 Slots
// ============================================================================

export interface ExNotificationSlots {
  /** 默认插槽（内容） */
  default?: () => VNode[];
  /** 标题插槽 */
  title?: () => VNode[];
  /** 图标插槽 */
  icon?: () => VNode[];
  /** 关闭按钮插槽 */
  close?: () => VNode[];
}

// ============================================================================
// Notification 服务配置
// ============================================================================

export interface NotificationOptions {
  /** 通知唯一标识 */
  id?: string;
  /** 通知类型 */
  type?: NotificationType;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string | VNode;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 显示时长（毫秒），设为 0 则不自动关闭 */
  duration?: number;
  /** 自定义 CSS 类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
  /** 层级 */
  zIndex?: number;
  /** 距离边缘的偏移量 */
  offset?: number;
  /** 显示位置 */
  position?: NotificationPosition;
  /** 是否将内容作为 HTML 片段处理 */
  dangerouslyUseHTMLString?: boolean;
  /** 关闭时的回调 */
  onClose?: () => void;
  /** 点击时的回调 */
  onClick?: () => void;
}

// ============================================================================
// Notification 实例
// ============================================================================

export interface NotificationInstance {
  /** 通知唯一标识 */
  id: string;
  /** 关闭通知 */
  close: () => void;
}

// ============================================================================
// Notification 服务
// ============================================================================

export interface NotificationService {
  /** 显示通知 */
  (options: NotificationOptions): NotificationInstance;
  /** 显示信息通知 */
  info: (options: NotificationOptions) => NotificationInstance;
  /** 显示成功通知 */
  success: (options: NotificationOptions) => NotificationInstance;
  /** 显示警告通知 */
  warning: (options: NotificationOptions) => NotificationInstance;
  /** 显示错误通知 */
  error: (options: NotificationOptions) => NotificationInstance;
  /** 关闭指定通知 */
  close: (id: string) => void;
  /** 关闭所有通知 */
  closeAll: () => void;
  /** 配置默认选项 */
  config: (options: Partial<NotificationGlobalConfig>) => void;
}

// ============================================================================
// Notification 全局配置
// ============================================================================

export interface NotificationGlobalConfig {
  /** 默认显示时长 */
  duration: number;
  /** 默认偏移量 */
  offset: number;
  /** 默认层级 */
  zIndex: number;
  /** 最大显示数量 */
  maxCount: number;
  /** 是否显示图标 */
  showIcon: boolean;
  /** 是否可关闭 */
  closable: boolean;
  /** 默认位置 */
  position: NotificationPosition;
}

// ============================================================================
// 内部类型
// ============================================================================

/** 通知队列项 */
export interface NotificationQueueItem {
  /** 通知唯一标识 */
  id: string;
  /** 通知配置 */
  options: NotificationOptions;
  /** Vue 虚拟节点 */
  vnode: VNode;
  /** 容器元素 */
  container: HTMLElement;
  /** 关闭方法 */
  close: () => void;
  /** 位置 */
  position: NotificationPosition;
}
