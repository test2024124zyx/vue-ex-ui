/**
 * Message 全局提示组件类型定义
 * 用于全局展示操作反馈信息
 */

import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

/** 消息类型 */
export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';

/** 消息位置 */
export type MessagePosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

// ============================================================================
// Message 组件 Props
// ============================================================================

export interface ExMessageProps {
  /** 消息唯一标识 */
  id?: string;
  /** 消息类型 */
  type?: MessageType;
  /** 消息内容 */
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
  /** 距离顶部/底部的偏移量 */
  offset?: number;
  /** 是否将消息内容作为 HTML 片段处理 */
  dangerouslyUseHTMLString?: boolean;
  /** 关闭时的回调 */
  onClose?: () => void;
}

// ============================================================================
// Message 组件 Emits
// ============================================================================

export interface ExMessageEmits {
  /** 关闭事件 */
  close: [];
  /** 销毁事件 */
  destroy: [];
}

// ============================================================================
// Message 组件 Slots
// ============================================================================

export interface ExMessageSlots {
  /** 默认插槽（内容） */
  default?: () => VNode[];
  /** 图标插槽 */
  icon?: () => VNode[];
  /** 关闭按钮插槽 */
  close?: () => VNode[];
}

// ============================================================================
// Message 服务配置
// ============================================================================

export interface MessageOptions {
  /** 消息唯一标识 */
  id?: string;
  /** 消息类型 */
  type?: MessageType;
  /** 消息内容 */
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
  /** 距离顶部的偏移量 */
  offset?: number;
  /** 是否将消息内容作为 HTML 片段处理 */
  dangerouslyUseHTMLString?: boolean;
  /** 关闭时的回调 */
  onClose?: () => void;
  /** 是否合并相同内容的消息 */
  grouping?: boolean;
  /** 是否在页面切换时关闭 */
  closeOnRouteChange?: boolean;
}

// ============================================================================
// Message 实例
// ============================================================================

export interface MessageInstance {
  /** 消息唯一标识 */
  id: string;
  /** 关闭消息 */
  close: () => void;
}

// ============================================================================
// Message 服务
// ============================================================================

export interface MessageService {
  /** 显示消息 */
  (options: MessageOptions | string): MessageInstance;
  /** 显示信息消息 */
  info: (content: string | MessageOptions) => MessageInstance;
  /** 显示成功消息 */
  success: (content: string | MessageOptions) => MessageInstance;
  /** 显示警告消息 */
  warning: (content: string | MessageOptions) => MessageInstance;
  /** 显示错误消息 */
  error: (content: string | MessageOptions) => MessageInstance;
  /** 显示加载消息 */
  loading: (content: string | MessageOptions) => MessageInstance;
  /** 关闭指定消息 */
  close: (id: string) => void;
  /** 关闭所有消息 */
  closeAll: () => void;
  /** 配置默认选项 */
  config: (options: Partial<MessageGlobalConfig>) => void;
}

// ============================================================================
// Message 全局配置
// ============================================================================

export interface MessageGlobalConfig {
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
  /** 是否合并相同内容的消息 */
  grouping: boolean;
}

// ============================================================================
// 内部类型
// ============================================================================

/** 消息队列项 */
export interface MessageQueueItem {
  /** 消息唯一标识 */
  id: string;
  /** 消息配置 */
  options: MessageOptions;
  /** Vue 虚拟节点 */
  vnode: VNode;
  /** 容器元素 */
  container: HTMLElement;
  /** 关闭方法 */
  close: () => void;
}
