/**
 * 模态框尺寸
 */
export type ModalSize = 'small' | 'medium' | 'large';

/**
 * 模态框类型
 */
export type ModalType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 模态框位置
 */
export type ModalPlacement =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * 模态框过渡动画
 */
export type ModalTransition = 'fade' | 'zoom' | 'slide-down' | 'slide-up';

/**
 * 模态框组件属性
 */
export interface ExModalProps {
  /** 是否显示模态框 */
  modelValue?: boolean;
  /** 模态框标题 */
  title?: string;
  /** 模态框尺寸 */
  size?: ModalSize;
  /** 模态框类型 */
  type?: ModalType;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 是否显示遮罩层 */
  mask?: boolean;
  /** 是否在点击遮罩层时关闭 */
  maskClosable?: boolean;
  /** 是否在按下 ESC 键时关闭 */
  keyboard?: boolean;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮类型 */
  okType?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 确认按钮加载状态 */
  confirmLoading?: boolean;
  /** 是否居中显示 */
  centered?: boolean;
  /** 宽度 */
  width?: string | number;
  /** 层级 */
  zIndex?: number;
  /** 是否追加到 body */
  appendToBody?: boolean;
  /** 是否销毁关闭时的内容 */
  destroyOnClose?: boolean;
  /** 是否显示默认底部按钮区（传入 footer 插槽时以插槽为准） */
  showFooter?: boolean;
  /** 自定义类名 */
  wrapClassName?: string;
  /** 自定义样式 */
  bodyStyle?: Record<string, string | number>;
  /** 模态框关闭前的回调 */
  beforeClose?: () => boolean | Promise<boolean>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 模态框组件事件
 */
export interface ExModalEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean];
  /** 确认事件 */
  ok: [];
  /** 取消事件 */
  cancel: [];
  /** 关闭后的回调 */
  afterClose: [];
}

/**
 * 模态框组件暴露的方法
 */
export interface ExModalExposed {
  /** 获取模态框 DOM 元素 */
  getElement: () => HTMLDivElement | null;
}
