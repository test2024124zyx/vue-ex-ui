import { computed, watch, type ComputedRef } from 'vue';
import type { ExTableProps, TableCellSpan, TableColumn, TableSpanError } from './types';
import type { DisplayTableRow } from './use-table-rows';
import { getFixedSide } from './use-table-columns';

const SINGLE_CELL: TableCellSpan = { rowspan: 1, colspan: 1 };
const COVERED_CELL: TableCellSpan = { rowspan: 0, colspan: 0 };

/** 跨度只合并合法的连续区域；非法请求退回普通单元格，避免吞掉业务内容。 */
export function useTableSpans(
  props: ExTableProps,
  rows: ComputedRef<DisplayTableRow[]>,
  columns: ComputedRef<TableColumn[]>,
  hasDetails: (row: DisplayTableRow) => boolean,
  isEditing: (row: DisplayTableRow) => boolean,
  report: (errors: TableSpanError[]) => void
) {
  const matrix = computed(() => {
    if (!props.spanMethod || props.layout === 'card') return undefined;
    const result = rows.value.map(() => columns.value.map(() => SINGLE_CELL));
    const errors: TableSpanError[] = [];
    for (let rowIndex = 0; rowIndex < rows.value.length; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columns.value.length; columnIndex++) {
        if (result[rowIndex]![columnIndex] === COVERED_CELL) continue;
        const column = columns.value[columnIndex]!;
        let requested: ReturnType<NonNullable<ExTableProps['spanMethod']>>;
        try {
          requested = props.spanMethod({
            record: rows.value[rowIndex]!.record,
            column,
            rowIndex,
            columnIndex,
          });
        } catch {
          errors.push({ rowIndex, columnIndex, reason: 'callback-error' });
          continue;
        }
        if (!requested) continue;
        const span = Array.isArray(requested)
          ? { rowspan: requested[0], colspan: requested[1] }
          : requested;
        const { rowspan, colspan } = span;
        if (
          !Number.isInteger(rowspan) ||
          !Number.isInteger(colspan) ||
          rowspan < 1 ||
          colspan < 1
        ) {
          errors.push({ rowIndex, columnIndex, reason: 'invalid-span' });
          continue;
        }
        if (
          rowIndex + rowspan > rows.value.length ||
          columnIndex + colspan > columns.value.length
        ) {
          errors.push({ rowIndex, columnIndex, reason: 'out-of-bounds' });
          continue;
        }
        let reason: TableSpanError['reason'] | undefined;
        for (let row = rowIndex; row < rowIndex + rowspan; row++) {
          if ((rowspan > 1 || colspan > 1) && isEditing(rows.value[row]!))
            reason = 'editing-boundary';
          if (row < rowIndex + rowspan - 1 && hasDetails(rows.value[row]!))
            reason = 'detail-boundary';
          for (let col = columnIndex; col < columnIndex + colspan; col++) {
            if (getFixedSide(columns.value[col]!) !== getFixedSide(column))
              reason = 'fixed-boundary';
            if (result[row]![col] === COVERED_CELL) reason = 'overlap';
          }
        }
        if (reason) {
          errors.push({ rowIndex, columnIndex, reason });
          continue;
        }
        for (let row = rowIndex; row < rowIndex + rowspan; row++)
          for (let col = columnIndex; col < columnIndex + colspan; col++)
            result[row]![col] =
              row === rowIndex && col === columnIndex ? { rowspan, colspan } : COVERED_CELL;
      }
    }
    return { cells: result, errors };
  });
  watch(
    () => matrix.value?.errors,
    errors => {
      if (errors?.length) report(errors);
    },
    { immediate: true }
  );
  const getSpan = (row: number, column: number) =>
    matrix.value?.cells[row]?.[column] ?? SINGLE_CELL;
  const extendRange = (initialStart: number, initialEnd: number) => {
    if (!matrix.value) return { start: initialStart, end: initialEnd };
    let start = initialStart;
    let end = initialEnd;
    let changed = true;
    while (changed) {
      changed = false;
      for (let row = 0; row < end; row++) {
        for (const span of matrix.value.cells[row] ?? []) {
          if (span.rowspan <= 1 || row + span.rowspan <= start) continue;
          const nextStart = Math.min(start, row);
          const nextEnd = Math.max(end, row + span.rowspan);
          if (nextStart !== start || nextEnd !== end) {
            start = nextStart;
            end = nextEnd;
            changed = true;
          }
        }
      }
    }
    return { start, end };
  };
  return { getSpan, extendRange };
}
