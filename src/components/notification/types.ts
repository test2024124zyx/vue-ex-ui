import type { VNode, VNodeChild } from 'vue';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/** 声明式 Notification 组件属性。 */
export interface ExNotificationProps {
  id?: string;
  type?: NotificationType;
  title?: string;
  /** 声明式组件只接收文本；VNode 请通过默认插槽传入。 */
  content?: string;
  showIcon?: boolean;
  closable?: boolean;
  duration?: number;
  customClass?: string;
  customStyle?: Record<string, string>;
  zIndex?: number;
  offset?: number;
  position?: NotificationPosition;
  dangerouslyUseHTMLString?: boolean;
}

export interface ExNotificationEmits {
  close: [];
  destroy: [];
  click: [];
}

export interface ExNotificationSlots {
  default?: () => VNodeChild;
  title?: () => VNodeChild;
  icon?: () => VNodeChild;
  close?: () => VNodeChild;
}

export interface ExNotificationExposed {
  close: () => boolean;
  isVisible: () => boolean;
  getElement: () => HTMLElement | null;
}

/** 编程式服务允许文本或真实 VNode 内容。 */
export interface NotificationOptions {
  id?: string;
  type?: NotificationType;
  title?: string;
  content?: string | VNode;
  showIcon?: boolean;
  closable?: boolean;
  duration?: number;
  customClass?: string;
  customStyle?: Record<string, string>;
  zIndex?: number;
  offset?: number;
  position?: NotificationPosition;
  dangerouslyUseHTMLString?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

/** 类型快捷方法不接受会被静默覆盖的 type 字段。 */
export type NotificationTypedOptions = Omit<NotificationOptions, 'type'>;

export interface NotificationInstance {
  readonly id: string;
  /** 返回本次调用是否真正发起关闭。 */
  close: () => boolean;
}

export interface NotificationService {
  (options: NotificationOptions): NotificationInstance;
  info: (options: NotificationTypedOptions) => NotificationInstance;
  success: (options: NotificationTypedOptions) => NotificationInstance;
  warning: (options: NotificationTypedOptions) => NotificationInstance;
  error: (options: NotificationTypedOptions) => NotificationInstance;
  close: (id: string) => boolean;
  closeAll: () => void;
  config: (options: Partial<NotificationGlobalConfig>) => void;
}

export interface NotificationGlobalConfig {
  duration: number;
  offset: number;
  zIndex: number;
  maxCount: number;
  showIcon: boolean;
  closable: boolean;
  position: NotificationPosition;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 当前应用安装的 Notification 服务。 */
    $notification: NotificationService;
  }
}
