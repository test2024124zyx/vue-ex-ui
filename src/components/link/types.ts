/**
 * 链接类型
 */
export type LinkType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

/**
 * 链接尺寸
 */
export type LinkSize = 'small' | 'medium' | 'large';

/**
 * 链接目标
 */
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top';

/**
 * 链接组件属性接口
 */
export interface ExLinkProps {
  /** 链接地址 */
  href?: string;
  /** 路由地址（Vue Router） */
  to?: string | object;
  /** 链接类型 */
  type?: LinkType;
  /** 链接尺寸 */
  size?: LinkSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示下划线 */
  underline?: boolean;
  /** 链接目标 */
  target?: LinkTarget;
  /** 图标位置 */
  iconPlacement?: 'left' | 'right';
  /** 是否显示外部链接图标 */
  showExternalIcon?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** rel 属性 */
  rel?: string;
}

/**
 * 链接组件事件接口
 */
export interface ExLinkEmits {
  /** 点击事件 */
  click: [event: MouseEvent];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
}

/**
 * 链接组件暴露的方法接口
 */
export interface ExLinkExposed {
  /** 聚焦链接 */
  focus: () => void;
  /** 失焦链接 */
  blur: () => void;
  /** 获取链接DOM元素 */
  getElement: () => HTMLElement | null;
}
