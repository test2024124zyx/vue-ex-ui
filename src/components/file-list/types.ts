/**
 * 文件项
 */
export interface FileItem {
  /** 文件ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: string;
  /** 文件URL */
  url?: string;
  /** 缩略图URL */
  thumbUrl?: string;
  /** 修改时间 */
  modifiedTime?: Date;
  /** 创建时间 */
  createdTime?: Date;
  /** 是否为文件夹 */
  isDirectory?: boolean;
  /** 子文件（如果是文件夹） */
  children?: FileItem[];
  /** 自定义数据 */
  meta?: Record<string, unknown>;
}

/**
 * 视图模式
 */
export type ViewMode = 'list' | 'grid' | 'table' | 'tree';

/**
 * 排序字段
 */
export type SortField = 'name' | 'size' | 'type' | 'modifiedTime' | 'createdTime';

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 文件列表组件属性
 */
export interface ExFileListProps {
  /** 文件列表 */
  files: FileItem[];
  /** 视图模式 */
  viewMode?: ViewMode;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 已选择的文件ID */
  selectedIds?: string[];
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示搜索 */
  showSearch?: boolean;
  /** 是否显示排序 */
  showSort?: boolean;
  /** 是否显示视图切换 */
  showViewSwitch?: boolean;
  /** 排序字段 */
  sortField?: SortField;
  /** 排序方向 */
  sortOrder?: SortOrder;
  /** 是否显示文件大小 */
  showSize?: boolean;
  /** 是否显示文件类型 */
  showType?: boolean;
  /** 是否显示修改时间 */
  showModifiedTime?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 是否可预览 */
  previewable?: boolean;
  /** 是否可下载 */
  downloadable?: boolean;
  /** 是否可删除 */
  deletable?: boolean;
  /** 是否可重命名 */
  renamable?: boolean;
  /** 空状态文本 */
  emptyText?: string;
  /** 加载状态 */
  loading?: boolean;
  /** 每页显示数量 */
  pageSize?: number;
  /** 是否显示分页 */
  showPagination?: boolean;
}

/**
 * 文件列表组件事件
 */
export interface ExFileListEmits {
  /** 选择变化 */
  'update:selectedIds': [ids: string[]];
  /** 文件选择 */
  select: [file: FileItem, selected: boolean];
  /** 文件点击 */
  click: [file: FileItem];
  /** 文件双击 */
  dblclick: [file: FileItem];
  /** 文件预览 */
  preview: [file: FileItem];
  /** 文件下载 */
  download: [file: FileItem];
  /** 文件删除 */
  delete: [file: FileItem];
  /** 文件重命名 */
  rename: [file: FileItem, newName: string];
  /** 排序变化 */
  sort: [field: SortField, order: SortOrder];
  /** 搜索 */
  search: [keyword: string];
  /** 视图模式变化 */
  'update:viewMode': [mode: ViewMode];
  /** 页码变化 */
  'page-change': [page: number];
}

/**
 * 文件列表组件暴露的方法
 */
export interface ExFileListExposed {
  /** 选择所有文件 */
  selectAll: () => void;
  /** 取消选择所有文件 */
  unselectAll: () => void;
  /** 选择文件 */
  selectFile: (id: string) => void;
  /** 取消选择文件 */
  unselectFile: (id: string) => void;
  /** 获取选中的文件 */
  getSelectedFiles: () => FileItem[];
  /** 刷新列表 */
  refresh: () => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
