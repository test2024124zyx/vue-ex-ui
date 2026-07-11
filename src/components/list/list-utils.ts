import type { ListGrid, ListItem, ListItemKey, ListSize } from './types';

export const LIST_GRID_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

const LIST_SIZES = new Set<ListSize>(['small', 'medium', 'large']);

/** 运行时尺寸输入只接受真实的三档样式。 */
export function normalizeListSize(value: unknown): ListSize {
  return LIST_SIZES.has(value as ListSize) ? (value as ListSize) : 'medium';
}

const normalizeColumn = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(24, Math.max(1, Math.floor(value)));
};

const normalizeGutter = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;

/**
 * 计算所有断点的完整列数。未设置或非法断点继承最近有效值，避免生成没有 CSS 语义的配置。
 */
export function normalizeListGrid(grid: ListGrid): Record<string, string> {
  const styles: Record<string, string> = {
    '--ex-list-grid-gutter': `${normalizeGutter(grid.gutter)}px`,
  };
  let columns = normalizeColumn(grid.column, 4);

  for (const breakpoint of LIST_GRID_BREAKPOINTS) {
    columns = normalizeColumn(grid[breakpoint], columns);
    styles[`--ex-list-grid-columns-${breakpoint}`] = String(columns);
  }

  return styles;
}

const isPropertyKey = (value: unknown): value is PropertyKey =>
  typeof value === 'string' ||
  typeof value === 'symbol' ||
  (typeof value === 'number' && Number.isFinite(value));

/** 执行字段或函数键解析器；非法结果交由组件的对象身份键兜底。 */
export function getListItemKeyCandidate(
  item: ListItem,
  index: number,
  itemKey: ListItemKey
): PropertyKey | undefined {
  const candidate = typeof itemKey === 'function' ? itemKey(item, index) : item[itemKey];
  return isPropertyKey(candidate) ? candidate : undefined;
}
