/** 叶列可独立覆盖表级交互开关；调整宽度以像素计。 */
export interface TableInteractiveColumn {
  resizable?: boolean;
  reorderable?: boolean;
  maxWidth?: number;
}

export interface TableColumnInteractionProps {
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
  /** 显式传入后仅派发变更请求，等待父级回写。 */
  columnWidths?: Record<string, number>;
  defaultColumnWidths?: Record<string, number>;
  /** 按同级分组与固定区域解释，不会将叶列移出原有分组。 */
  columnOrder?: string[];
  defaultColumnOrder?: string[];
}

export interface TableColumnInteractionEmits {
  'update:columnWidths': [widths: Record<string, number>];
  'column-resize': [key: string, width: number];
  'update:columnOrder': [keys: string[]];
  'column-order-change': [keys: string[]];
}

export interface TableColumnInteractionExposed {
  resizeColumn: (key: string, width: number) => boolean;
  moveColumn: (key: string, target: string, position: 'before' | 'after') => boolean;
  moveColumnByOffset: (key: string, offset: number) => boolean;
  cancelResize: () => void;
}
