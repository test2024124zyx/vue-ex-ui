import type { HTMLAttributes, StyleValue, VNodeChild } from 'vue';

/** 消息状态类型。 */
export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface ExMessageProps {
  type?: MessageType;
  /** 默认插槽为空时显示的纯文本内容。 */
  content?: string;
  showIcon?: boolean;
  closable?: boolean;
  /** 自动关闭时长；0 表示持续显示。 */
  duration?: number;
  /** 显式启用后，字符串会先消毒再作为 HTML 渲染。 */
  dangerouslyUseHTMLString?: boolean;
}

export interface ExMessageEmits {
  /** 开始关闭且可见状态真正变化时触发。 */
  close: [];
  /** 离场动画结束后触发。 */
  destroy: [];
}

export interface ExMessageSlots {
  default?: () => VNodeChild;
  icon?: () => VNodeChild;
  close?: () => VNodeChild;
}

export interface ExMessageExposed {
  close: () => boolean;
  isVisible: () => boolean;
  getElement: () => HTMLElement | null;
}

export interface MessageOptions {
  content: string;
  type?: MessageType;
  showIcon?: boolean;
  closable?: boolean;
  duration?: number;
  class?: HTMLAttributes['class'];
  style?: StyleValue;
  dangerouslyUseHTMLString?: boolean;
  onClose?: () => void;
  /** 合并当前仍处于活动状态的同类型同内容消息。 */
  grouping?: boolean;
}

/** 类型快捷方法不接受会被静默覆盖的 type 字段。 */
export type MessageTypedOptions = Omit<MessageOptions, 'type'>;
export type MessageInput = string | MessageOptions;
export type MessageTypedInput = string | MessageTypedOptions;

export interface MessageInstance {
  readonly id: string;
  /** 返回本次调用是否真正发起了关闭。 */
  close: () => boolean;
}

export interface MessageService {
  (input: MessageInput): MessageInstance;
  info: (input: MessageTypedInput) => MessageInstance;
  success: (input: MessageTypedInput) => MessageInstance;
  warning: (input: MessageTypedInput) => MessageInstance;
  error: (input: MessageTypedInput) => MessageInstance;
  loading: (input: MessageTypedInput) => MessageInstance;
  /** 返回是否找到并关闭了对应活动消息。 */
  close: (id: string) => boolean;
  closeAll: () => void;
  config: (options: Partial<MessageGlobalConfig>) => void;
}

export interface MessageGlobalConfig {
  duration: number;
  offset: number;
  zIndex: number;
  maxCount: number;
  showIcon: boolean;
  closable: boolean;
  grouping: boolean;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 当前应用安装的 Message 服务。 */
    $message: MessageService;
  }
}
