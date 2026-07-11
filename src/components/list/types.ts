import type { VNode } from 'vue';

export type ListSize = 'small' | 'medium' | 'large';

/** 响应式网格列数；未设置断点继承较小断点。 */
export interface ListGrid {
  /** 项间距，非法负值规范为 0。 */
  gutter?: number;
  /** 所有断点的初始列数，默认 4。 */
  column?: number;
  /** 小于 480px。 */
  xs?: number;
  /** 大于等于 480px。 */
  sm?: number;
  /** 大于等于 768px。 */
  md?: number;
  /** 大于等于 1024px。 */
  lg?: number;
  /** 大于等于 1280px。 */
  xl?: number;
  /** 大于等于 1536px。 */
  xxl?: number;
}

/** List 的便捷数据结构；完整自定义内容可使用 item 插槽。 */
export interface ListItem {
  key?: PropertyKey;
  title?: string;
  description?: string;
  /** 图片图标地址。 */
  icon?: string;
  /** 装饰头像地址。 */
  avatar?: string;
  extra?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export type ListItemKeyResolver = (item: ListItem, index: number) => PropertyKey | null | undefined;
export type ListItemKey = string | ListItemKeyResolver;

export interface ExListProps {
  data?: readonly ListItem[];
  /** 未设置时继承 ConfigProvider 全局尺寸。 */
  size?: ListSize;
  bordered?: boolean;
  split?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  loadingText?: string;
  /** 显式空字符串隐藏默认空态文案。 */
  emptyText?: string;
  /** 唯一键字段或解析函数；无有效值时使用稳定对象身份。 */
  itemKey?: ListItemKey;
  grid?: ListGrid;
  /** 开启后每项使用原生 button 并发送 item-click。 */
  clickable?: boolean;
}

export interface ExListEmits {
  'item-click': [item: ListItem, index: number, event: MouseEvent];
}

export interface ListSlotProps {
  item: ListItem;
  index: number;
}

export interface ExListSlots {
  item?: (props: ListSlotProps) => VNode[];
  icon?: (props: ListSlotProps) => VNode[];
  title?: (props: ListSlotProps) => VNode[];
  description?: (props: ListSlotProps) => VNode[];
  extra?: (props: ListSlotProps) => VNode[];
  empty?: () => VNode[];
}

export interface ExListExposed {
  getElement: () => HTMLDivElement | null;
}
