/**
 * 分页尺寸
 */
export type PaginationSize = 'small' | 'medium' | 'large';

/**
 * 分页对齐方式
 */
export type PaginationAlign = 'left' | 'center' | 'right';

/**
 * 分页组件属性
 */
export interface ExPaginationProps {
  /** 当前页码；显式传入后等待父级回写，undefined 使用内部状态。 */
  current?: number;
  /** 每页条数；与页码独立受控，未受控页码在容量请求时立即调整。 */
  pageSize?: number;
  /** 数据总数 */
  total: number;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean;
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean;
  /** 是否显示总数 */
  showTotal?: boolean;
  /** 总数文本模板函数 */
  totalText?: (total: number, range: [number, number]) => string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否简洁模式 */
  simple?: boolean;
  /** 尺寸 */
  size?: PaginationSize;
  /** 对齐方式 */
  align?: PaginationAlign;
  /** 显示的页码按钮数量（奇数） */
  showPages?: number;
  /** 是否隐藏单页 */
  hideOnSinglePage?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 分页组件事件
 */
export interface ExPaginationEmits {
  /** 页码改变时触发 */
  'update:current': [current: number];
  /** 每页条数改变时触发 */
  'update:pageSize': [pageSize: number];
  /** 页码或每页条数改变时触发 */
  change: [current: number, pageSize: number];
}

/**
 * 分页组件暴露的方法
 */
export interface ExPaginationExposed {
  /** 获取分页DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 跳转到指定页 */
  goToPage: (page: number) => void;
  /** 上一页 */
  prev: () => void;
  /** 下一页 */
  next: () => void;
}
