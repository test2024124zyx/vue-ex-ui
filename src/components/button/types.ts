/**
 * 按钮类型
 */
export type ButtonType =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'text'
  | 'link'
  | 'ghost';

/**
 * 按钮尺寸
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * 按钮形态
 *
 * default/round/circle 保留基础形态；其余形态用于组件库的赛博朋克边框语言。
 */
export type ButtonShape =
  'default' | 'round' | 'circle' | 'slice' | 'slant' | 'bracket' | 'hex' | 'notched';

/**
 * 原生按钮类型
 */
export type NativeButtonType = 'button' | 'submit' | 'reset';

/**
 * 按钮组件属性接口
 */
export interface ExButtonProps {
  /** 按钮类型 */
  type?: ButtonType;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 按钮形状 */
  shape?: ButtonShape;
  /** 是否为朴素按钮 */
  plain?: boolean;
  /** 是否启用强调发光，未显式设置时按按钮语义决定 */
  glow?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;

  /** 是否为块级按钮 */
  block?: boolean;
  /** 原生按钮类型 */
  nativeType?: NativeButtonType;
  /** 是否自动聚焦 */
  autofocus?: boolean;
  /** 按钮标签，用于无障碍访问 */
  ariaLabel?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 按钮组件事件接口
 */
export interface ExButtonEmits {
  /** 点击事件 */
  click: [event: MouseEvent];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
}

/**
 * 按钮组件暴露的方法接口
 */
export interface ExButtonExposed {
  /** 聚焦按钮 */
  focus: () => void;
  /** 失焦按钮 */
  blur: () => void;
  /** 获取按钮DOM元素 */
  getElement: () => HTMLButtonElement | null;
}
