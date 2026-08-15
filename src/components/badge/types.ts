/**
 * 徽章类型
 */
export type BadgeType =
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 徽章尺寸
 */
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * 徽章状态
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

/**
 * 徽章位置
 */
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * 徽章形状
 */
export type BadgeShape = 'default' | 'round' | 'circle';

/**
 * 徽章组件属性接口
 */
export interface ExBadgeProps {
  /** 徽章显示的数字 */
  count?: number | string;
  /** 是否显示为小红点 */
  dot?: boolean;
  /** 是否启用徽章的按钮语义与键盘交互 */
  clickable?: boolean;
  /** 徽章类型 */
  type?: BadgeType;
  /** 徽章尺寸 */
  size?: BadgeSize;
  /** 徽章状态（用于状态点） */
  status?: BadgeStatus;
  /** 状态点的文本 */
  text?: string;
  /** 展示封顶的数字值 */
  overflowCount?: number;
  /** 当数值为 0 时，是否展示 Badge */
  showZero?: boolean;
  /** 设置徽章的偏移量，格式为 [x, y] */
  offset?: [number | string, number | string];
  /** 自定义徽章颜色 */
  color?: string;
  /** 徽章位置 */
  position?: BadgePosition;
  /** 徽章形状，仅对数字/文本徽章生效 */
  shape?: BadgeShape;
  /** 鼠标悬停时显示的文字 */
  title?: string;
  /** 徽章的无障碍名称 */
  ariaLabel?: string;
  /** 自定义徽章样式 */
  badgeStyle?: string | Record<string, string | number>;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 徽章组件事件接口
 */
export interface ExBadgeEmits {
  /** 点击徽章时触发 */
  click: [event: MouseEvent];
}

/**
 * 徽章组件暴露的方法接口
 */
export interface ExBadgeExposed {
  /** 获取徽章DOM元素 */
  getElement: () => HTMLElement | null;
}
