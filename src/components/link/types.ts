/** 链接视觉类型。 */
export type LinkType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

/** 链接尺寸。 */
export type LinkSize = 'small' | 'medium' | 'large';

/** 原生浏览上下文名称，并保留常用目标值的类型提示。 */
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top' | (string & Record<never, never>);

/** 链接组件属性。 */
export interface ExLinkProps {
  /** 导航地址；省略时组件渲染为动作按钮。 */
  href?: string;
  /** 链接视觉类型。 */
  type?: LinkType;
  /** 链接尺寸。 */
  size?: LinkSize;
  /** 是否禁用交互。 */
  disabled?: boolean;
  /** 是否显示文本下划线。 */
  underline?: boolean;
  /** 原生链接目标浏览上下文。 */
  target?: LinkTarget;
  /** 通用 icon 插槽的位置。 */
  iconPlacement?: 'left' | 'right';
  /** 绝对网络地址是否显示外链图标。 */
  showExternalIcon?: boolean;
  /** 原生 rel 令牌。target 为 _blank 时会强制补充 noopener。 */
  rel?: string;
}

/** 链接组件事件。 */
export interface ExLinkEmits {
  /** 有效链接或动作按钮的点击事件。 */
  click: [event: MouseEvent];
  /** 有效链接或动作按钮的聚焦事件。 */
  focus: [event: FocusEvent];
  /** 有效链接或动作按钮的失焦事件。 */
  blur: [event: FocusEvent];
}

/** 链接组件暴露方法。 */
export interface ExLinkExposed {
  /** 聚焦有效根元素。 */
  focus: () => void;
  /** 移除根元素焦点。 */
  blur: () => void;
  /** 获取真实锚点或按钮元素。 */
  getElement: () => HTMLAnchorElement | HTMLButtonElement | null;
}
