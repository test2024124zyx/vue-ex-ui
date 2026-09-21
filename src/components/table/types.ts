/**
 * 表格列对齐方式
 */
export type TableColumnAlign = 'left' | 'center' | 'right';

/**
 * 表格尺寸
 */
export type TableSize = 'small' | 'medium' | 'large';

/**
 * 表格布局模式
 */
export type TableLayout = 'table' | 'card';

/**
 * 表格行选择类型
 */
export type TableSelectionType = 'checkbox' | 'radio';

/**
 * 表格行数据
 */
export interface TableRowData {
  [key: string]: unknown;
}

/**
 * 表格排序器
 */
export interface TableSorter {
  field: string;
  order: 'asc' | 'desc' | 'descend' | null;
  sorter?: (a: unknown, b: unknown) => number;
}

/**
 * 表格分页
 */
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * 单元格渲染信息
 */
export interface CellRenderInfo<T = unknown> {
  value: unknown;
  record: TableRowData;
  index: number;
  column: TableColumn<T>;
  editing?: boolean;
}

/**
 * 表头渲染信息
 */
export interface HeaderRenderInfo<T = unknown> {
  column: TableColumn<T>;
  index: number;
  sortOrder?: 'asc' | 'desc' | null;
  filteredValue?: unknown[];
  sortable?: boolean;
  filtered?: boolean;
}

/**
 * 表格渲染选项
 */
export interface TableRenderOptions {
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  size?: TableSize;
  showHeader?: boolean;
  tableLayout?: 'auto' | 'fixed';
}

/**
 * 表格列定义
 */
export interface TableColumn<T = unknown> {
  /** 列的唯一标识 */
  key: string;
  /** 列标题 */
  title?: string;
  /** 数据字段名 */
  dataIndex?: string;
  /** 列宽度 */
  width?: string | number;
  /** 最小宽度 */
  minWidth?: string | number;
  /** 对齐方式 */
  align?: TableColumnAlign;
  /** 是否固定列；固定列应设置 width 或 minWidth 以计算相邻列偏移 */
  fixed?: 'left' | 'right' | boolean;
  /** 是否可排序 */
  sortable?: boolean;
  /** 本地自定义比较器，接收完整记录；返回负数表示 a 在 b 前，降序由组件反转；remoteSort 时不调用 */
  sorter?: (a: TableDataItem, b: TableDataItem) => number;
  /** 自定义渲染函数 */
  render?: (value: unknown, record: unknown, index: number) => unknown;
  /** 自定义插槽名称 */
  slot?: string;
  /** 子列 */
  children?: TableColumn<T>[];
  /** 过滤器 */
  onFilter?: (value: unknown, record: T) => boolean;
  /** 当前生效的过滤值；同列多个值按任一匹配处理 */
  filteredValue?: readonly unknown[];
  /** 是否省略显示 */
  ellipsis?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 表头自定义类名 */
  headerClassName?: string;
}

/**
 * 表格数据项
 */
export interface TableDataItem {
  /** 唯一标识 */
  key?: string | number;
  [key: string]: unknown;
}

/**
 * 排序信息
 */
export interface TableSortInfo {
  /** 排序字段 */
  key: string;
  /** 排序方向 */
  order: 'asc' | 'desc' | null;
}

/**
 * 表格组件属性接口
 */
export interface ExTableProps {
  /** 表格列配置 */
  columns: TableColumn[];
  /** 表格数据 */
  data: TableDataItem[];
  /**
   * 显式启用不可变行缓存，默认关闭以兼容原地修改后重新传入数组。
   * 开启后，修改普通行或其嵌套数据时须替换行对象；渲染器的外部状态须使用响应式值。
   * 引用与显示索引未变的行复用格式化结果，换位、列配置和响应式依赖变化仍会更新。
   */
  immutable?: boolean;
  /** 表格尺寸 */
  size?: TableSize;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否显示斑马纹 */
  striped?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 空数据文本 */
  emptyText?: string;
  /** 是否显示表头 */
  showHeader?: boolean;
  /**
   * 远程/受控排序：为 true 时禁用内置本地排序，仅派发 sort-change 事件，
   * 由外部根据事件自行排序后回传 data（避免与服务端排序双重排序）。
   */
  remoteSort?: boolean;
  /** 行的 key 字段名 */
  rowKey?: string;
  /** 是否开启行选择列 */
  selectable?: boolean;
  /** 选择类型：多选 checkbox（默认）/ 单选 radio */
  selectionType?: TableSelectionType;
  /** 已选行的 key 列表（支持 v-model:selectedRowKeys） */
  selectedRowKeys?: Array<string | number>;
  /** 判断某行是否可被选择，返回 false 则该行禁用选择 */
  isRowSelectable?: (record: TableDataItem, index: number) => boolean;
  /** 最大高度（超出显示滚动条） */
  maxHeight?: string | number;
  /**
   * 是否启用行虚拟滚动，适配大数据量（上千行）渲染。
   * 需配合固定 rowHeight；开启后仅渲染可视窗口内的行。默认 false。
   */
  virtual?: boolean;
  /** 虚拟滚动时的固定行高（像素），默认 48 */
  rowHeight?: number;
  /** 虚拟滚动视口高度（像素）；未设置时回退到 maxHeight，再回退到 400 */
  virtualHeight?: number;
  /** 虚拟滚动视口上下额外渲染的缓冲行数，默认 6 */
  virtualBuffer?: number;
  /** 布局模式（移动端可使用卡片模式） */
  layout?: TableLayout;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 表格组件事件接口
 */
export interface ExTableEmits {
  /** 行点击事件 */
  'row-click': [record: TableDataItem, index: number, event: MouseEvent];
  /** 排序变化事件 */
  'sort-change': [sortInfo: TableSortInfo];
  /** 选中行 key 列表更新（v-model:selectedRowKeys） */
  'update:selectedRowKeys': [keys: Array<string | number>];
  /** 选择变化：选中的 key 列表与对应行数据 */
  'selection-change': [keys: Array<string | number>, rows: TableDataItem[]];
  /** 单行选择切换 */
  select: [record: TableDataItem, selected: boolean, selectedRows: TableDataItem[]];
  /** 全选 / 取消全选 */
  'select-all': [selected: boolean, selectedRows: TableDataItem[]];
}

/**
 * 表格组件暴露的方法接口
 */
export interface ExTableExposed {
  /** 获取表格DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 清除排序 */
  clearSort: () => void;
  /** 清空选择 */
  clearSelection: () => void;
  /** 切换某行选中状态（不传 selected 则取反） */
  toggleRowSelection: (record: TableDataItem, selected?: boolean) => void;
  /** 切换全选 */
  toggleAllSelection: () => void;
}
