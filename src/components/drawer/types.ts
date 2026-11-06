import type { CSSProperties } from 'vue';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerPresetSize = 'small' | 'medium' | 'large' | 'extra-large';
export type DrawerSize = DrawerPresetSize | string | number;
export type DrawerGuard = () => boolean | Promise<boolean>;

/** 抽屉属性。 */
export interface ExDrawerProps {
  /** 受控显示状态。 */
  modelValue?: boolean;
  /** 抽屉标题。 */
  title?: string;
  /** 抽屉出现方向。 */
  placement?: DrawerPlacement;
  /** 预设尺寸、自定义 CSS 长度或正数像素值。 */
  size?: DrawerSize;
  /** 是否显示关闭按钮。 */
  closable?: boolean;
  /** 是否显示遮罩并启用模态焦点圈闭。 */
  mask?: boolean;
  /** 点击遮罩是否请求关闭。 */
  maskClosable?: boolean;
  /** Escape 是否请求关闭。 */
  closeOnPressEscape?: boolean;
  /** 关闭动画结束后是否销毁插槽内容。 */
  destroyOnClose?: boolean;
  /** 是否显示默认底部操作区。 */
  showFooter?: boolean;
  /** 确认按钮文本。 */
  okText?: string;
  /** 取消按钮文本。 */
  cancelText?: string;
  /** 确认按钮类型。 */
  okType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 确认按钮是否处于加载状态。 */
  okLoading?: boolean;
  /** 是否禁用确认按钮。 */
  okDisabled?: boolean;
  /** 是否禁用取消按钮。 */
  cancelDisabled?: boolean;
  /** 面板自定义类名。 */
  customClass?: string;
  /** 面板自定义样式。 */
  customStyle?: string | CSSProperties;
  /** 自定义层级；未设置时跟随全局层级。 */
  zIndex?: number;
  /** 模态状态下是否锁定页面滚动。 */
  lockScroll?: boolean;
  /** 打开前异步守卫，返回 false 时拒绝打开。 */
  beforeOpen?: DrawerGuard;
  /** 关闭前异步守卫，返回 false 时拒绝关闭请求。 */
  beforeClose?: DrawerGuard;
  /** 无标题时的无障碍名称。 */
  ariaLabel?: string;
}

/** 抽屉事件。 */
export interface ExDrawerEmits {
  'update:modelValue': [value: boolean];
  open: [];
  opened: [];
  close: [];
  closed: [];
  guardError: [error: unknown, phase: 'open' | 'close'];
  ok: [];
  cancel: [];
}

/** 抽屉公开方法。 */
export interface ExDrawerExposed {
  /** 请求父级打开。 */
  open: () => void;
  /** 经 beforeClose 守卫请求父级关闭。 */
  close: () => Promise<boolean>;
  /** 获取抽屉面板元素。 */
  getElement: () => HTMLDivElement | null;
}
