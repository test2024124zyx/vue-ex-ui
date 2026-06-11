import type { PopoverPlacement, PopoverTrigger } from '../popover/types';

/**
 * 气泡确认框类型
 */
export type PopconfirmType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'error';

/**
 * 气泡确认框按钮类型
 */
export type PopconfirmButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * 气泡确认框配置
 */
export interface PopconfirmConfig {
  title?: string;
  description?: string;
  type?: PopconfirmType;
  okText?: string;
  cancelText?: string;
  okType?: PopconfirmButtonType;
  showCancel?: boolean;
  icon?: string;
  showIcon?: boolean;
  placement?: PopoverPlacement;
  arrow?: boolean;
  zIndex?: number;
  offset?: [number, number];
  trigger?: PopoverTrigger;
  cancelType?: PopconfirmButtonType;
  autoAdjustOverflow?: boolean;
  autoClose?: boolean;
}

/**
 * 气泡确认框按钮
 */
export interface PopconfirmButton {
  text: string;
  type: PopconfirmButtonType;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  props?: Record<string, unknown>;
  visible?: boolean;
}

/**
 * 气泡确认框内容
 */
export interface PopconfirmContent {
  title?: string | unknown;
  description?: string | unknown;
  icon?: string | unknown;
  iconColor?: string;
}

/**
 * 气泡确认框按钮组
 */
export interface PopconfirmButtons {
  ok: PopconfirmButton;
  cancel?: PopconfirmButton;
}

/**
 * 气泡确认框主题
 */
export type PopconfirmTheme = 'light' | 'dark';

/**
 * 气泡确认框预设
 */
export type PopconfirmPresets = 'delete' | 'warning' | 'info';

/**
 * 气泡确认框主题配置
 */
export interface PopconfirmThemeConfig {
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  borderColor: string;
  boxShadow: string;
  borderRadius: string;
  iconColors: Record<PopconfirmType, string>;
}

/**
 * 气泡确认框预设配置
 */
export interface PopconfirmPresetConfig {
  delete: PopconfirmConfig & { iconColor: string };
  save: PopconfirmConfig & { iconColor: string };
  submit: PopconfirmConfig & { iconColor: string };
  reset: PopconfirmConfig & { iconColor: string };
  exit: PopconfirmConfig & { iconColor: string };
}

/**
 * 气泡确认框异步结果
 */
export interface PopconfirmAsyncResult {
  success: boolean;
  error?: Error | string;
  data?: unknown;
}

/**
 * 气泡确认框组件属性
 */
export interface ExPopconfirmProps {
  /** 确认框标题 */
  title?: string;
  /** 确认框描述 */
  description?: string;
  /** 确认框类型 */
  type?: PopconfirmType;
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮类型 */
  okType?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 确认按钮加载状态 */
  confirmLoading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 弹出位置 */
  placement?: PopoverPlacement;
  /** 触发方式 */
  trigger?: PopoverTrigger;
  /** 图标 */
  icon?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  popupClass?: string;
  /** 自定义样式 */
  popupStyle?: Record<string, string | number>;
  /** 确认前的回调 */
  beforeConfirm?: () => boolean | Promise<boolean>;
}

/**
 * 气泡确认框组件事件
 */
export interface ExPopconfirmEmits {
  /** 确认事件 */
  confirm: [];
  /** 取消事件 */
  cancel: [];
  /** 显示状态变化 */
  'update:visible': [visible: boolean];
}

/**
 * 气泡确认框组件暴露的方法
 */
export interface ExPopconfirmExposed {
  /** 显示确认框 */
  show: () => void;
  /** 隐藏确认框 */
  hide: () => void;
}
