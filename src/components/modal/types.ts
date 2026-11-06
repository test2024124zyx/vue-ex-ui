import type { CSSProperties, VNodeChild } from 'vue';

export type ModalSize = 'small' | 'medium' | 'large';
export type ModalType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ModalOkType = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type ModalGuard = () => boolean | Promise<boolean>;

/** 模态框属性。 */
export interface ExModalProps {
  /** 受控显示状态。 */
  modelValue?: boolean;
  /** 模态框标题。 */
  title?: string;
  /** 模态框尺寸。 */
  size?: ModalSize;
  /** 语义色类型。 */
  type?: ModalType;
  /** 是否显示关闭按钮。 */
  showClose?: boolean;
  /** 是否显示遮罩并启用模态焦点圈闭。 */
  mask?: boolean;
  /** 点击遮罩或遮罩空白区是否请求关闭。 */
  maskClosable?: boolean;
  /** Escape 是否请求关闭。 */
  keyboard?: boolean;
  /** 确认按钮文本。 */
  okText?: string;
  /** 取消按钮文本。 */
  cancelText?: string;
  /** 确认按钮类型。 */
  okType?: ModalOkType;
  /** 确认按钮加载状态。 */
  confirmLoading?: boolean;
  /** 是否在视口中垂直居中。 */
  centered?: boolean;
  /** 自定义宽度或正数像素值。 */
  width?: string | number;
  /** 自定义层级；未设置时跟随全局层级。 */
  zIndex?: number;
  /** 是否传送到 body。 */
  appendToBody?: boolean;
  /** 关闭动画结束后是否销毁插槽内容。 */
  destroyOnClose?: boolean;
  /** 是否显示默认底部按钮区。 */
  showFooter?: boolean;
  /** 包装器自定义类名。 */
  wrapClassName?: string;
  /** 正文区域自定义样式。 */
  bodyStyle?: CSSProperties;
  /** 模态状态下是否锁定页面滚动。 */
  lockScroll?: boolean;
  /** 打开前异步守卫，返回 false 时拒绝打开。 */
  beforeOpen?: ModalGuard;
  /** 关闭前异步守卫，返回 false 时拒绝关闭请求。 */
  beforeClose?: ModalGuard;
}

/** 模态框事件。 */
export interface ExModalEmits {
  'update:modelValue': [value: boolean];
  open: [];
  close: [];
  ok: [];
  cancel: [];
  afterClose: [];
  guardError: [error: unknown, phase: 'open' | 'close'];
}

/** 模态框插槽。 */
export interface ExModalSlots {
  default?: () => VNodeChild;
  title?: () => VNodeChild;
  icon?: () => VNodeChild;
  footer?: () => VNodeChild;
  closeIcon?: () => VNodeChild;
}

/** 模态框公开方法。 */
export interface ExModalExposed {
  /** 请求父级打开；已经打开时不重复发出更新。 */
  open: () => void;
  /** 经 beforeClose 守卫请求父级关闭；未打开或任务失效时返回 false。 */
  close: () => Promise<boolean>;
  /** 获取模态框面板元素。 */
  getElement: () => HTMLDivElement | null;
}
