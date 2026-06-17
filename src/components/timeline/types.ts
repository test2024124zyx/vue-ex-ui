/**
 * Timeline 时间轴组件类型定义
 */

/**
 * 时间轴模式
 */
export type TimelineMode = 'left' | 'right' | 'alternate';

/**
 * 时间轴方向
 */
export type TimelineDirection = 'vertical' | 'horizontal';

/**
 * 时间轴项类型
 */
export type TimelineItemType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 时间轴项尺寸
 */
export type TimelineItemSize = 'small' | 'medium' | 'large';

/**
 * Timeline 组件属性
 */
export interface ExTimelineProps {
  /** 时间轴方向 */
  direction?: TimelineDirection;
  /** 时间轴模式（仅垂直方向有效） */
  mode?: TimelineMode;
  /** 是否显示连接线 */
  showLine?: boolean;
  /** 是否反转顺序 */
  reverse?: boolean;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * Timeline 组件暴露的方法
 */
export interface ExTimelineExposed {
  /** 获取时间轴DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * TimelineItem 组件属性
 */
export interface ExTimelineItemProps {
  /** 时间戳或时间文本 */
  timestamp?: string;
  /** 时间戳位置（仅垂直方向有效） */
  timestampPosition?: 'top' | 'bottom';
  /** 节点类型 */
  type?: TimelineItemType;
  /** 节点尺寸 */
  size?: TimelineItemSize;
  /** 节点颜色（自定义颜色） */
  color?: string;
  /** 是否为空心节点 */
  hollow?: boolean;
  /** 是否隐藏连接线 */
  hideLine?: boolean;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * TimelineItem 组件事件
 */
export interface ExTimelineItemEmits {
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void;
}

/**
 * TimelineItem 组件暴露的方法
 */
export interface ExTimelineItemExposed {
  /** 获取时间轴项DOM元素 */
  getElement: () => HTMLDivElement | null;
}
