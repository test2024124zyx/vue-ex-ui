/**
 * 抽屉位置
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * 抽屉尺寸
 */
export type DrawerSize = 'small' | 'medium' | 'large' | 'extra-large' | string | number;

/**
 * 抽屉过渡动画
 */
export type DrawerTransition = 'slide' | 'fade';

/**
 * 抽屉组件属性
 */
export interface ExDrawerProps {
  /** 是否显示抽屉 */
  modelValue: boolean;
  /** 抽屉标题 */
  title?: string;
  /** 抽屉位置 */
  placement?: DrawerPlacement;
  /** 抽屉尺寸 */
  size?: DrawerSize;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 是否显示遮罩层 */
  mask?: boolean;
  /** 点击遮罩层是否关闭 */
  maskClosable?: boolean;
  /** 是否在关闭时销毁子元素 */
  destroyOnClose?: boolean;
  /** 是否显示底部操作栏 */
  showFooter?: boolean;
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮类型 */
  okType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 确认按钮是否加载中 */
  okLoading?: boolean;
  /** 是否禁用确认按钮 */
  okDisabled?: boolean;
  /** 是否禁用取消按钮 */
  cancelDisabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: string | Record<string, string | number>;
  /** 层级 */
  zIndex?: number;
  /** 是否锁定滚动 */
  lockScroll?: boolean;
  /** 打开前的回调 */
  beforeOpen?: () => boolean | Promise<boolean>;
  /** 关闭前的回调 */
  beforeClose?: () => boolean | Promise<boolean>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 抽屉组件事件
 */
export interface ExDrawerEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean];
  /** 打开事件 */
  open: [];
  /** 打开后事件 */
  opened: [];
  /** 关闭事件 */
  close: [];
  /** 关闭后事件 */
  closed: [];
  /** 确认事件 */
  ok: [];
  /** 取消事件 */
  cancel: [];
}

/**
 * 抽屉组件暴露的方法
 */
export interface ExDrawerExposed {
  /** 打开抽屉 */
  open: () => void;
  /** 关闭抽屉 */
  close: () => void;
  /** 获取抽屉DOM元素 */
  getElement: () => HTMLDivElement | null;
}
