export type DialogSize = 'small' | 'medium' | 'large' | 'full';
export type DialogType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type DialogGuard = () => boolean | Promise<boolean>;

/** 对话框属性。 */
export interface ExDialogProps {
  /** 受控显示状态。 */
  modelValue?: boolean;
  /** 对话框标题。 */
  title?: string;
  /** 对话框尺寸。 */
  size?: DialogSize;
  /** 语义色类型。 */
  type?: DialogType;
  /** 是否显示关闭按钮。 */
  showClose?: boolean;
  /** 是否显示遮罩并启用模态焦点圈闭。 */
  modal?: boolean;
  /** 点击遮罩是否请求关闭。 */
  closeOnClickModal?: boolean;
  /** Escape 是否请求关闭。 */
  closeOnPressEscape?: boolean;
  /** 是否启用默认底部操作区。 */
  showFooter?: boolean;
  /** 确认按钮文本。 */
  confirmText?: string;
  /** 取消按钮文本。 */
  cancelText?: string;
  /** 是否显示确认按钮。 */
  showConfirm?: boolean;
  /** 是否显示取消按钮。 */
  showCancel?: boolean;
  /** 确认按钮加载状态。 */
  confirmLoading?: boolean;
  /** 确认按钮禁用状态。 */
  confirmDisabled?: boolean;
  /** 是否居中对齐内部文本与底部按钮。 */
  center?: boolean;
  /** 是否铺满视口。 */
  fullscreen?: boolean;
  /** 是否锁定页面滚动。 */
  lockScroll?: boolean;
  /** 对话框自定义类名。 */
  customClass?: string;
  /** 遮罩自定义类名。 */
  modalClass?: string;
  /** 打开前异步守卫，返回 false 时拒绝打开。 */
  beforeOpen?: DialogGuard;
  /** 关闭前异步守卫，返回 false 时拒绝关闭请求。 */
  beforeClose?: DialogGuard;
  /** 自定义层级；未设置时跟随全局层级。 */
  zIndex?: number;
  /** 是否传送到 body。 */
  appendToBody?: boolean;
  /** 关闭动画结束后是否销毁插槽内容。 */
  destroyOnClose?: boolean;
  /** 无标题时的无障碍名称。 */
  ariaLabel?: string;
}

/** 对话框事件。 */
export interface ExDialogEmits {
  'update:modelValue': [value: boolean];
  open: [];
  opened: [];
  close: [];
  closed: [];
  guardError: [error: unknown, phase: 'open' | 'close'];
  confirm: [];
  cancel: [];
}

/** 对话框公开方法。 */
export interface ExDialogExposed {
  /** 请求父级打开。 */
  open: () => void;
  /** 经 beforeClose 守卫请求父级关闭。 */
  close: () => Promise<boolean>;
  /** 获取对话框面板元素。 */
  getElement: () => HTMLDivElement | null;
}
