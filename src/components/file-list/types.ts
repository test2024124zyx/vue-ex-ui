/** 文件时间允许直接传入 Date、时间戳或可解析的标准日期字符串。 */
export type FileItemTime = Date | number | string;

/** 文件列表的数据项；目录无需伪造 size 和 MIME type。 */
export interface FileItem {
  /** 全量数据树内唯一且非空的标识。 */
  id: string;
  /** 展示名称。 */
  name: string;
  /** 文件大小（字节）；目录或未知大小可省略。 */
  size?: number;
  /** MIME 类型；目录或未知类型可省略。 */
  type?: string;
  /** 文件资源地址。 */
  url?: string;
  /** 缩略图地址；其生命周期由调用方管理。 */
  thumbUrl?: string;
  /** 最后修改时间。 */
  modifiedTime?: FileItemTime;
  /** 创建时间。 */
  createdTime?: FileItemTime;
  /** 是否为目录。 */
  isDirectory?: boolean;
  /** 目录子项。 */
  children?: readonly FileItem[];
  /** 业务扩展数据。 */
  meta?: Readonly<Record<string, unknown>>;
}

/** 文件列表视图。 */
export type ViewMode = 'list' | 'grid' | 'table' | 'tree';

/** 文件排序字段。 */
export type SortField = 'name' | 'size' | 'type' | 'modifiedTime';

/** 文件排序方向。 */
export type SortOrder = 'asc' | 'desc';

export interface ExFileListProps {
  /** 文件或目录数据。 */
  files: readonly FileItem[];
  /** 受控视图模式。 */
  viewMode?: ViewMode;
  /** 非受控视图初始值。 */
  defaultViewMode?: ViewMode;
  /** 是否允许选择。 */
  selectable?: boolean;
  /** 是否允许多选。 */
  multiple?: boolean;
  /** 受控选中标识。 */
  selectedIds?: readonly string[];
  /** 非受控选中标识初始值。 */
  defaultSelectedIds?: readonly string[];
  /** 是否显示工具栏。 */
  showToolbar?: boolean;
  /** 是否显示搜索框。 */
  showSearch?: boolean;
  /** 受控搜索值。 */
  searchValue?: string;
  /** 非受控搜索初始值。 */
  defaultSearchValue?: string;
  /** 是否显示排序控件。 */
  showSort?: boolean;
  /** 是否显示视图切换。 */
  showViewSwitch?: boolean;
  /** 受控排序字段。 */
  sortField?: SortField;
  /** 非受控排序字段初始值。 */
  defaultSortField?: SortField;
  /** 受控排序方向。 */
  sortOrder?: SortOrder;
  /** 非受控排序方向初始值。 */
  defaultSortOrder?: SortOrder;
  /** 是否显示文件大小。 */
  showSize?: boolean;
  /** 是否显示文件类型。 */
  showType?: boolean;
  /** 是否显示修改时间。 */
  showModifiedTime?: boolean;
  /** 是否显示可用操作。 */
  showActions?: boolean;
  /** 是否允许请求预览文件。 */
  previewable?: boolean;
  /** 是否允许请求下载文件。 */
  downloadable?: boolean;
  /** 是否允许请求删除文件或目录。 */
  deletable?: boolean;
  /** 空状态文本。 */
  emptyText?: string;
  /** 是否处于加载状态。 */
  loading?: boolean;
  /** 每页根级条目数量；非法值回退为 20。 */
  pageSize?: number;
  /** 是否显示分页。 */
  showPagination?: boolean;
  /** 受控当前页码。 */
  currentPage?: number;
  /** 非受控当前页码初始值。 */
  defaultCurrentPage?: number;
}

export interface ExFileListEmits {
  /** 请求更新选中标识。 */
  'update:selectedIds': [ids: string[]];
  /** 用户请求选择或取消选择一个文件。 */
  'selection-request': [file: FileItem, selected: boolean, nextIds: string[]];
  /** 用户点击文件主体。 */
  click: [file: FileItem];
  /** 用户双击文件主体。 */
  dblclick: [file: FileItem];
  /** 用户请求预览；组件不宣称预览已经完成。 */
  'preview-request': [file: FileItem];
  /** 用户请求下载；组件不宣称下载已经完成。 */
  'download-request': [file: FileItem];
  /** 用户请求删除；组件不宣称数据已经删除。 */
  'delete-request': [file: FileItem];
  /** 请求更新搜索值。 */
  'update:searchValue': [value: string];
  /** 用户输入搜索值。 */
  search: [value: string];
  /** 请求更新排序字段。 */
  'update:sortField': [field: SortField];
  /** 请求更新排序方向。 */
  'update:sortOrder': [order: SortOrder];
  /** 用户请求排序。 */
  sort: [field: SortField, order: SortOrder];
  /** 请求更新视图模式。 */
  'update:viewMode': [mode: ViewMode];
  /** 请求更新当前页码。 */
  'update:currentPage': [page: number];
  /** 用户请求切换页码。 */
  'page-change': [page: number];
}

/** 只暴露能够在受控和非受控模式中保持真实语义的查询能力。 */
export interface ExFileListExposed {
  /** 获取当前真实选中的数据项，包含递归子项。 */
  getSelectedFiles: () => FileItem[];
  /** 获取组件根元素。 */
  getElement: () => HTMLDivElement | null;
}
