/**
 * 对话框尺寸
 */
export type DialogSize = 'small' | 'medium' | 'large' | 'full' | 'fullscreen';

/**
 * 对话框类型
 */
export type DialogType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 对话框位置
 */
export type DialogPlacement = 'center' | 'top' | 'bottom';

/**
 * 对话框过渡动画
 */
export type DialogTransition = 'fade' | 'zoom' | 'slide-down' | 'slide-up';

/**
 * 对话框组件属性
 */
export interface ExDialogProps {
  /** 是否显示对话框 */
  modelValue?: boolean;
  /** 对话框标题 */
  title?: string;
  /** 对话框尺寸 */
  size?: DialogSize;
  /** 对话框类型 */
  type?: DialogType;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 是否显示遮罩层 */
  modal?: boolean;
  /** 是否在点击遮罩层时关闭对话框 */
  closeOnClickModal?: boolean;
  /** 是否在按下 ESC 键时关闭对话框 */
  closeOnPressEscape?: boolean;
  /** 是否显示底部操作栏 */
  showFooter?: boolean;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 确认按钮加载状态 */
  confirmLoading?: boolean;
  /** 确认按钮禁用状态 */
  confirmDisabled?: boolean;
  /** 是否居中显示 */
  center?: boolean;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 是否锁定滚动 */
  lockScroll?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 遮罩层自定义类名 */
  modalClass?: string;
  /** 对话框打开前的回调 */
  beforeOpen?: () => boolean | Promise<boolean>;
  /** 对话框关闭前的回调 */
  beforeClose?: () => boolean | Promise<boolean>;
  /** 层级 */
  zIndex?: number;
  /** 是否追加到 body */
  appendToBody?: boolean;
  /** 是否销毁关闭时的内容 */
  destroyOnClose?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 对话框组件事件
 */
export interface ExDialogEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean];
  /** 打开事件 */
  open: [];
  /** 打开动画结束事件 */
  opened: [];
  /** 关闭事件 */
  close: [];
  /** 关闭动画结束事件 */
  closed: [];
  /** 确认事件 */
  confirm: [];
  /** 取消事件 */
  cancel: [];
}

/**
 * 对话框组件暴露的方法
 */
export interface ExDialogExposed {
  /** 打开对话框 */
  open: () => void;
  /** 关闭对话框 */
  close: () => void;
  /** 获取对话框 DOM 元素 */
  getElement: () => HTMLDivElement | null;
}
