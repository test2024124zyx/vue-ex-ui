import { computed, type ComputedRef } from 'vue';
import type { TableColumn } from './types';

interface TableHeaderCell {
  column: TableColumn;
  path: string;
  colspan: number;
  rowspan: number;
  leafIndex: number;
  isLeaf: boolean;
}

export const getFixedSide = (column: TableColumn): 'left' | 'right' | undefined =>
  column.fixed === true ? 'left' : column.fixed || undefined;
const toCssLength = (value: string | number) => (typeof value === 'number' ? `${value}px` : value);

/** 分组表头和固定偏移按列缓存，不随单元格数量重复扫描。 */
export function useTableColumns(
  columns: ComputedRef<TableColumn[]>,
  getWidth: (column: TableColumn) => string | number | undefined = column => column.width,
  hasManagedWidth: (column: TableColumn) => boolean = () => false
) {
  const structure = computed(() => {
    const leaves: TableColumn[] = [];
    const cells: Array<TableHeaderCell & { depth: number }> = [];
    let depth = 1;
    const visit = (
      items: TableColumn[],
      level: number,
      path: string,
      ancestors: Set<TableColumn>
    ): number => {
      let count = 0;
      items.forEach((column, index) => {
        const children =
          Array.isArray(column.children) && !ancestors.has(column)
            ? column.children.filter(Boolean)
            : [];
        const isLeaf = children.length === 0;
        const cell: TableHeaderCell & { depth: number } = {
          column,
          path: `${path}${column.key}:${index}`,
          colspan: 1,
          rowspan: 1,
          leafIndex: isLeaf ? leaves.length : -1,
          isLeaf,
          depth: level,
        };
        cells.push(cell);
        depth = Math.max(depth, level + 1);
        if (isLeaf) leaves.push(column);
        else
          cell.colspan = visit(
            children,
            level + 1,
            `${cell.path}/`,
            new Set(ancestors).add(column)
          );
        count += cell.colspan;
      });
      return count;
    };
    visit(columns.value, 0, '', new Set());
    const rows = Array.from({ length: depth }, () => [] as TableHeaderCell[]);
    for (const cell of cells) {
      if (cell.isLeaf) cell.rowspan = depth - cell.depth;
      rows[cell.depth]!.push(cell);
    }
    return { leaves, depth, rows };
  });
  const leafColumns = computed(() => structure.value.leaves);
  const headerDepth = computed(() => structure.value.depth);
  const headerRows = computed(() => structure.value.rows);
  const lastAutoWidthColumnIndex = computed(() => {
    for (let index = leafColumns.value.length - 1; index >= 0; index--)
      if (!getWidth(leafColumns.value[index]!)) return index;
    return -1;
  });
  const fixedOffsets = computed(() => {
    const build = (side: 'left' | 'right') => {
      const offsets = Array<string>(leafColumns.value.length).fill('0px');
      let pixels = 0;
      const lengths: string[] = [];
      for (
        let index = side === 'left' ? 0 : leafColumns.value.length - 1;
        index >= 0 && index < leafColumns.value.length;
        index += side === 'left' ? 1 : -1
      ) {
        const column = leafColumns.value[index]!;
        if (getFixedSide(column) !== side) continue;
        offsets[index] = lengths.length
          ? `calc(${[...lengths, ...(pixels ? [`${pixels}px`] : [])].join(' + ')})`
          : `${pixels}px`;
        const length = toCssLength(getWidth(column) ?? column.minWidth ?? 0);
        if (/^\d+(?:\.\d+)?px$/.test(length)) pixels += Number.parseFloat(length);
        else lengths.push(length);
      }
      return offsets;
    };
    return { left: build('left'), right: build('right') };
  });
  const getColumnStyle = (column: TableColumn, index = -1, header = false) => {
    const style: Record<string, string> = {};
    const width = getWidth(column);
    if (width) style.width = toCssLength(width);
    else if (index >= 0 && index === lastAutoWidthColumnIndex.value) style.width = '100%';
    if (column.minWidth) style.minWidth = toCssLength(column.minWidth);
    if (index >= 0 && width && hasManagedWidth(column)) {
      // 原生自动布局把 width 当作偏好；受管理列额外声明下限，确保请求反映到真实轨道。
      style.boxSizing = 'border-box';
      const desired = toCssLength(width);
      const minimum = column.minWidth === undefined ? undefined : toCssLength(column.minWidth);
      if (!minimum) style.minWidth = desired;
      else if (/^\d+(?:\.\d+)?px$/.test(desired) && /^\d+(?:\.\d+)?px$/.test(minimum)) {
        style.minWidth = `${Math.max(Number.parseFloat(desired), Number.parseFloat(minimum))}px`;
      } else style.minWidth = `max(${desired}, ${minimum})`;
    }
    const fixed = getFixedSide(column);
    if (fixed && index >= 0) {
      style.position = 'sticky';
      style[fixed] = fixedOffsets.value[fixed][index] ?? '0px';
      style.zIndex = header ? '3' : '2';
    }
    return style;
  };
  return { leafColumns, headerDepth, headerRows, getColumnStyle };
}
