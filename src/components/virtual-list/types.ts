import type { CSSProperties } from 'vue';

/**
 * 虚拟列表项
 */
export interface VirtualListItem {
  key: string | number;
  data: unknown;
  height?: number;
}

/**
 * 虚拟项
 */
export interface VirtualItem {
  index: number;
  offset?: number;
  top: number;
  bottom: number;
  height: number;
  data: unknown;
  visible: boolean;
}

/**
 * 高度缓存
 */
export interface HeightCache {
  heights: Map<number, number>;
  averageHeight: number;
  totalHeight: number;
  initialized: boolean;
  [key: string]: unknown;
}

/**
 * 渲染范围
 */
export interface RenderRange {
  start: number;
  end: number;
  offsetTop: number;
  startIndex: number;
  endIndex: number;
  startOffset: number;
  endOffset: number;
}

/**
 * 项目位置
 */
export interface ItemPosition {
  index: number;
  top: number;
  bottom: number;
  height: number;
}

/**
 * 滚动状态
 */
export interface ScrollState {
  scrollTop: number;
  scrollHeight?: number;
  clientHeight?: number;
  isScrolling: boolean;
  direction?: 'up' | 'down' | 'none';
  lastScrollTime?: number;
}

/**
 * VirtualList 组件 Props
 */
export interface ExVirtualListProps {
  /** 数据源 */
  dataSource: unknown[];
  /** 容器高度 */
  height: number | string;
  /** 项目高度（固定值或函数） */
  itemHeight: number | ((index: number, item: unknown) => number);
  /** 缓冲区大小（上下额外渲染的项目数） */
  buffer?: number;
  /** 项目唯一键（字段名或函数） */
  itemKey?: string | ((item: unknown, index: number) => string | number);
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 滚动容器的自定义样式 */
  wrapStyle?: CSSProperties;
  /** 启用虚拟滚动的阈值（数据量小于此值时不使用虚拟滚动） */
  threshold?: number;
  /** 是否启用虚拟滚动 */
  virtual?: boolean;
  /** 触发加载更多的距离阈值（距离底部多少像素时触发） */
  loadMoreThreshold?: number;
}

/**
 * VirtualList 组件事件
 */
export interface ExVirtualListEmits {
  /** 滚动事件 */
  scroll: [scrollInfo: ScrollInfo];
  /** 项目点击事件 */
  'item-click': [item: unknown, index: number];
  /** 到达顶部事件 */
  'reach-top': [];
  /** 到达底部事件 */
  'reach-bottom': [];
  /** 加载更多事件（接近底部时触发） */
  'load-more': [];
}

/**
 * 滚动信息
 */
export interface ScrollInfo {
  /** 滚动位置 */
  scrollTop: number;
  /** 滚动高度 */
  scrollHeight: number;
  /** 容器高度 */
  clientHeight: number;
  /** 是否在顶部 */
  isTop: boolean;
  /** 是否在底部 */
  isBottom: boolean;
}

/**
 * 可见范围
 */
export interface VisibleRange {
  /** 开始索引 */
  startIndex: number;
  /** 结束索引 */
  endIndex: number;
  /** 可见项目数量 */
  visibleCount: number;
}
