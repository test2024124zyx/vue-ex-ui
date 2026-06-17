/**
 * 列表尺寸
 */
export type ListSize = 'small' | 'medium' | 'large';

/**
 * 列表网格配置
 */
export interface ListGrid {
  gutter?: number;
  column?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  enabled?: boolean;
  itemHeight?: number | ((index: number) => number);
  buffer?: number;
}

/**
 * 列表项数据
 */
export interface ListItem {
  /** 唯一标识 */
  key?: string | number;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 头像 */
  avatar?: string;
  /** 额外内容 */
  extra?: string;
  /** 是否禁用 */
  disabled?: boolean;
  [key: string]: unknown;
}

/**
 * 列表组件属性接口
 */
export interface ExListProps {
  /** 列表数据 */
  data?: ListItem[];
  /** 列表尺寸 */
  size?: ListSize;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否显示分割线 */
  split?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 空数据文本 */
  emptyText?: string;
  /** 行的 key 字段名 */
  itemKey?: string;
  /** 栅格布局配置（设置后以网格方式排列列表项） */
  grid?: ListGrid;
  /** 是否启用虚拟滚动（大数据量时仅渲染可视窗口，需配合固定 itemHeight + height） */
  virtual?: boolean;
  /** 虚拟滚动每项高度（像素），默认 64 */
  itemHeight?: number;
  /** 虚拟滚动视口高度（像素或 CSS 值），默认 400 */
  height?: number | string;
  /** 列表项是否可点击（启用后补全 role/tabindex/键盘可达性） */
  clickable?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 列表组件事件接口
 */
export interface ExListEmits {
  /** 列表项点击事件 */
  'item-click': [item: ListItem, index: number, event: MouseEvent];
}

/**
 * 列表组件暴露的方法接口
 */
export interface ExListExposed {
  /** 获取列表DOM元素 */
  getElement: () => HTMLDivElement | null;
}
