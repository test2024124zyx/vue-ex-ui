import type { SelectOptions } from '../select/types';
import type { TableColumn, TableDataItem } from './types';

export type TableEditErrors = Record<string, string>;

/** 编辑列的输入方式；复杂业务控件可通过 edit-列名 插槽替换。 */
export interface TableEditableColumn {
  editable?: boolean | ((record: TableDataItem, index: number) => boolean);
  editor?: 'text' | 'number' | 'checkbox' | 'select';
  editorOptions?: SelectOptions;
}

/** 校验与保存均接收隔离副本，取消后 signal.aborted 为 true。 */
export interface TableEditContext {
  key: string | number;
  index: number;
  original: TableDataItem;
  signal: AbortSignal;
}

export interface TableEditResult {
  key: string | number;
  record: TableDataItem;
  original: TableDataItem;
}

export interface TableRowEditState {
  draft: TableDataItem;
  errors: TableEditErrors;
  saving: boolean;
}

export interface TableEditingProps {
  /** 开启行级编辑操作列；默认关闭，原记录始终由父级管理。 */
  editable?: boolean;
  /** 限制可编辑记录。 */
  isRowEditable?: (record: TableDataItem, index: number) => boolean;
  /** 返回字段错误；$row 用于整行错误。返回空对象或 undefined 表示通过。 */
  validateEdit?: (
    draft: TableDataItem,
    context: TableEditContext
  ) => TableEditErrors | void | Promise<TableEditErrors | void>;
  /** 异步持久化，可返回服务端规范化记录；成功后以 update:data 请求父级回写。 */
  saveEdit?: (
    draft: TableDataItem,
    context: TableEditContext
  ) => TableDataItem | void | Promise<TableDataItem | void>;
}

export interface TableEditingEmits {
  'update:data': [data: TableDataItem[]];
  'edit-start': [key: string | number, record: TableDataItem];
  'edit-cancel': [key: string | number];
  'edit-save': [result: TableEditResult];
  'edit-error': [error: unknown, key: string | number];
}

export interface TableEditingExposed {
  /** index 为原始数据索引；有唯一 rowKey 时可省略。 */
  startRowEdit: (record: TableDataItem, index?: number) => boolean;
  setEditValue: (
    record: TableDataItem,
    index: number,
    column: TableColumn,
    value: unknown
  ) => boolean;
  saveRowEdit: (record: TableDataItem, index?: number) => Promise<boolean>;
  cancelRowEdit: (record: TableDataItem, index?: number) => boolean;
  getEditState: (record: TableDataItem, index?: number) => TableRowEditState | undefined;
}
