import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import type { TableColumn } from './types';
import type {
  TableColumnInteractionEmits,
  TableColumnInteractionProps,
} from './table-column-interaction-types';

interface ColumnOptions extends TableColumnInteractionProps {
  columns: TableColumn[];
  loading?: boolean;
}

type ColumnEmit = <K extends keyof TableColumnInteractionEmits>(
  event: K,
  ...args: TableColumnInteractionEmits[K]
) => void;

interface ResizeSession {
  key: string;
  pointerId: number;
  startX: number;
  width: number;
  widths: Record<string, number>;
  direction: number;
}

export const TABLE_MIN_COLUMN_WIDTH = 48;
export const TABLE_COLUMN_KEYBOARD_STEP = 10;
export const TABLE_COLUMN_DRAG_TYPE = 'application/x-ex-ui-table-column';
export const TABLE_MANAGED_WIDTH_ATTRIBUTE = 'data-column-managed-width';
const sideOf = (column: TableColumn) => (column.fixed === true ? 'left' : column.fixed || 'none');

/** 交互宽度生成的布局下限不能反过来成为业务下限，否则列放大后无法缩小。 */
export function measureTableColumnMinimum(
  header: HTMLElement | null | undefined,
  column: TableColumn
): number | undefined {
  if (!header) return undefined;
  const managed = header.hasAttribute(TABLE_MANAGED_WIDTH_ATTRIBUTE);
  const previous = header.style.getPropertyValue('min-width');
  const priority = header.style.getPropertyPriority('min-width');
  if (managed) {
    if (column.minWidth !== undefined) {
      header.style.setProperty(
        'min-width',
        typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth
      );
    } else header.style.removeProperty('min-width');
  }
  try {
    const css = getComputedStyle(header).minWidth;
    return /^\d+(?:\.\d+)?px$/.test(css) ? Number.parseFloat(css) : undefined;
  } finally {
    if (managed) {
      if (previous) header.style.setProperty('min-width', previous, priority);
      else header.style.removeProperty('min-width');
    }
  }
}

/** 控件的 ARIA 与实际列宽使用同一套有限数值和上下界规则。 */
export function normalizeTableColumnBounds(column: TableColumn, resolvedMinimum = 0) {
  const configured =
    typeof column.minWidth === 'number'
      ? column.minWidth
      : typeof column.minWidth === 'string' && /^\d+(?:\.\d+)?px$/.test(column.minWidth)
        ? Number.parseFloat(column.minWidth)
        : 0;
  const minimum = Math.max(
    TABLE_MIN_COLUMN_WIDTH,
    Number.isFinite(configured) ? configured : 0,
    Number.isFinite(resolvedMinimum) ? resolvedMinimum : 0
  );
  const maximum =
    Number.isFinite(column.maxWidth) && (column.maxWidth ?? 0) >= minimum
      ? column.maxWidth!
      : Infinity;
  return { minimum, maximum };
}

/** 宽度与顺序单独保存，叶列继续使用原对象，避免使单元格缓存整体失效。 */
export function useTableColumnInteractions(
  props: ColumnOptions,
  emit: ColumnEmit,
  root?: Ref<HTMLElement | undefined>
) {
  const measuredMinimums = ref<Record<string, number>>({});
  const minimumFor = (key: string) => {
    const header = [...(root?.value?.querySelectorAll('th') ?? [])].find(
      element => element.getAttribute('data-column-key') === key
    );
    const column = index.value.get(key)?.column;
    const minimum = column ? measureTableColumnMinimum(header, column) : undefined;
    if (minimum !== undefined && Number.isFinite(minimum)) {
      measuredMinimums.value = { ...measuredMinimums.value, [key]: minimum };
    }
    return measuredMinimums.value[key] ?? 0;
  };
  const widths = useControllableState<Record<string, number>>({
    controlledValue: () => props.columnWidths,
    defaultValue: () => props.defaultColumnWidths ?? {},
    clone: value =>
      Object.fromEntries(
        Object.entries(value).filter(([, width]) => Number.isFinite(width) && width > 0)
      ),
    onChange: value => emit('update:columnWidths', value),
  });
  const order = useControllableState<string[]>({
    controlledValue: () => props.columnOrder,
    defaultValue: () => props.defaultColumnOrder ?? [],
    clone: value => [...new Set(value)],
    onChange: value => {
      emit('update:columnOrder', value);
      emit('column-order-change', value);
    },
  });
  const index = computed(() => {
    const result = new Map<string, { column: TableColumn; parent: TableColumn | undefined }>();
    const pending = props.columns.map(column => ({
      column,
      parent: undefined as TableColumn | undefined,
    }));
    const visited = new Set<TableColumn>();
    while (pending.length) {
      const item = pending.pop()!;
      if (visited.has(item.column)) continue;
      visited.add(item.column);
      result.set(item.column.key, item);
      for (const child of item.column.children ?? [])
        pending.push({ column: child, parent: item.column });
    }
    return result;
  });
  const effectiveColumns = computed(() => {
    const positions = new Map(order.value.value.map((key, position) => [key, position]));
    const visit = (columns: TableColumn[], ancestors: Set<TableColumn>): TableColumn[] => {
      const regions = new Map<string, TableColumn[]>();
      for (const column of columns) {
        const side = sideOf(column);
        const region = regions.get(side) ?? [];
        region.push(column);
        regions.set(side, region);
      }
      for (const region of regions.values()) {
        region.sort(
          (left, right) =>
            (positions.get(left.key) ?? Infinity) - (positions.get(right.key) ?? Infinity)
        );
      }
      const cursors = new Map<string, number>();
      return columns.map(original => {
        const side = sideOf(original);
        const cursor = cursors.get(side) ?? 0;
        cursors.set(side, cursor + 1);
        const column = regions.get(side)![cursor]!;
        if (!column.children?.length || ancestors.has(column)) return column;
        const children = visit(column.children, new Set(ancestors).add(column));
        return children.every((child, position) => child === column.children?.[position])
          ? column
          : { ...column, children };
      });
    };
    return visit(props.columns, new Set());
  });
  const canResize = (column: TableColumn) =>
    !props.loading &&
    !column.children?.length &&
    (column.resizable ?? props.resizableColumns ?? false);
  const canReorder = (column: TableColumn) =>
    !props.loading &&
    !column.children?.length &&
    (column.reorderable ?? props.reorderableColumns ?? false);
  const hasManagedWidth = (column: TableColumn) => {
    if (column.children?.length) return false;
    const value = Object.prototype.hasOwnProperty.call(widths.value.value, column.key)
      ? widths.value.value[column.key]
      : undefined;
    return (
      (Number.isFinite(value) && (value ?? 0) > 0) ||
      (column.resizable ?? props.resizableColumns ?? false)
    );
  };
  const getColumnWidth = (column: TableColumn): string | number | undefined => {
    let value = Object.prototype.hasOwnProperty.call(widths.value.value, column.key)
      ? widths.value.value[column.key]
      : undefined;
    if (!Number.isFinite(value) || (value ?? 0) <= 0) {
      if (!hasManagedWidth(column)) return column.width;
      value =
        typeof column.width === 'number'
          ? column.width
          : typeof column.width === 'string' && /^\d+(?:\.\d+)?px$/.test(column.width)
            ? Number.parseFloat(column.width)
            : undefined;
      if (!Number.isFinite(value) || (value ?? 0) <= 0) return column.width;
    }
    const { minimum, maximum } = normalizeTableColumnBounds(
      column,
      measuredMinimums.value[column.key]
    );
    return Math.max(minimum, Math.min(maximum, value!));
  };
  const resizeColumn = (key: string, width: number) => {
    const column = index.value.get(key)?.column;
    if (!column || !canResize(column) || !Number.isFinite(width) || width <= 0) return false;
    const { minimum, maximum } = normalizeTableColumnBounds(column, minimumFor(key));
    const next = Math.max(minimum, Math.min(maximum, width));
    widths.request({ ...widths.value.value, [key]: next });
    emit('column-resize', key, next);
    return true;
  };
  const siblingColumns = (key: string) => {
    const source = index.value.get(key);
    if (!source) return [];
    const pending = [...effectiveColumns.value];
    if (!source.parent) return pending;
    const visited = new Set<TableColumn>();
    while (pending.length) {
      const column = pending.pop()!;
      if (visited.has(column)) continue;
      visited.add(column);
      if (column.key === source.parent.key) return column.children ?? [];
      pending.push(...(column.children ?? []));
    }
    return [];
  };
  const moveColumn = (key: string, target: string, position: 'before' | 'after') => {
    const source = index.value.get(key);
    const destination = index.value.get(target);
    if (
      !source ||
      !destination ||
      key === target ||
      !canReorder(source.column) ||
      !canReorder(destination.column) ||
      source.parent !== destination.parent ||
      sideOf(source.column) !== sideOf(destination.column) ||
      !['before', 'after'].includes(position)
    )
      return false;
    const siblings = siblingColumns(key)
      .map(column => column.key)
      .filter(item => item !== key);
    const targetIndex = siblings.indexOf(target);
    if (targetIndex < 0) return false;
    siblings.splice(targetIndex + (position === 'after' ? 1 : 0), 0, key);
    const siblingSet = new Set(siblings);
    order.request([...order.value.value.filter(item => !siblingSet.has(item)), ...siblings]);
    return true;
  };
  const moveColumnByOffset = (key: string, offset: number) => {
    if (offset !== -1 && offset !== 1) return false;
    const siblings = siblingColumns(key);
    const target = siblings[siblings.findIndex(column => column.key === key) + offset];
    return target ? moveColumn(key, target.key, offset < 0 ? 'before' : 'after') : false;
  };
  const resizingKey = ref<string>();
  let session: ResizeSession | undefined;
  const detach = () => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onEnd);
      document.removeEventListener('pointercancel', onCancel);
    }
    session = undefined;
    resizingKey.value = undefined;
  };
  const cancelResize = () => {
    const previous = session;
    detach();
    if (previous) {
      const restored = { ...widths.value.value };
      if (Object.prototype.hasOwnProperty.call(previous.widths, previous.key)) {
        Object.defineProperty(restored, previous.key, {
          value: previous.widths[previous.key],
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else delete restored[previous.key];
      widths.request(restored);
    }
  };
  function onMove(event: PointerEvent) {
    if (!session || event.pointerId !== session.pointerId) return;
    resizeColumn(session.key, session.width + (event.clientX - session.startX) * session.direction);
  }
  function onEnd(event: PointerEvent) {
    if (event.pointerId === session?.pointerId) detach();
  }
  function onCancel(event: PointerEvent) {
    if (event.pointerId === session?.pointerId) cancelResize();
  }
  const startResize = (event: PointerEvent, column: TableColumn, header: HTMLElement) => {
    if (event.button !== 0 || !canResize(column)) return;
    cancelResize();
    const width = header.getBoundingClientRect().width;
    if (!Number.isFinite(width) || width <= 0) return;
    const minimum = measureTableColumnMinimum(header, column);
    if (minimum !== undefined && Number.isFinite(minimum))
      measuredMinimums.value = { ...measuredMinimums.value, [column.key]: minimum };
    event.preventDefault();
    session = {
      key: column.key,
      pointerId: event.pointerId,
      startX: event.clientX,
      width,
      widths: { ...widths.value.value },
      direction: getComputedStyle(header).direction === 'rtl' ? -1 : 1,
    };
    resizingKey.value = column.key;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onCancel);
  };
  watch([index, () => props.loading, () => props.resizableColumns], () => {
    const column = session ? index.value.get(session.key)?.column : undefined;
    if (session && (!column || !canResize(column))) cancelResize();
  });
  onBeforeUnmount(detach);
  return {
    effectiveColumns,
    getColumnWidth,
    hasManagedWidth,
    canResize,
    canReorder,
    resizeColumn,
    moveColumn,
    moveColumnByOffset,
    startResize,
    cancelResize,
    resizingKey,
  };
}
