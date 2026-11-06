import { nextTick, watch, type ComputedRef, type Ref } from 'vue';
import { setMonthClamped } from '../../utils/date';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import type { CalendarDateCell } from './types';

export const CALENDAR_WEEK_LENGTH = 7;
const FOCUS_SEARCH_LIMIT_DAYS = 366;

interface CalendarKeyboardOptions {
  currentDate: Ref<Date>;
  focusedDate: Ref<number | null>;
  element: Ref<HTMLElement | undefined>;
  cells: ComputedRef<CalendarDateCell[]>;
  timestamp(date: Date): number;
  isDisabled(date: Date): boolean;
  select(cell: CalendarDateCell): void;
}

/** 维护日期网格的单一键盘入口，工具栏翻页只更新入口而不抢走按钮焦点。 */
export function useCalendarKeyboard(options: CalendarKeyboardOptions) {
  watch(
    [options.cells, () => options.currentDate.value.getTime()],
    ([cells, viewDate], previous) => {
      const target =
        viewDate !== previous?.[1]
          ? options.timestamp(options.currentDate.value)
          : options.focusedDate.value;
      const enabled =
        cells.find(cell => !cell.disabled && options.timestamp(cell.date) === target) ??
        cells.find(cell => !cell.disabled && cell.isCurrentMonth) ??
        cells.find(cell => !cell.disabled);
      options.focusedDate.value = enabled ? options.timestamp(enabled.date) : null;
    },
    { immediate: true }
  );

  const focusDate = (date: Date) => {
    const target = new Date(date);
    const direction = target.getTime() >= options.currentDate.value.getTime() ? 1 : -1;
    for (let attempts = 0; attempts < FOCUS_SEARCH_LIMIT_DAYS; attempts++) {
      if (!options.isDisabled(target)) {
        options.focusedDate.value = options.timestamp(target);
        options.currentDate.value = new Date(target);
        nextTick(() =>
          options.element.value
            ?.querySelector<HTMLElement>(`[data-date="${options.focusedDate.value}"]`)
            ?.focus()
        );
        return;
      }
      target.setDate(target.getDate() + direction);
    }
  };

  const handleCellKeydown = (cell: CalendarDateCell, event: KeyboardEvent) => {
    if (cell.disabled || event.target !== event.currentTarget || isComposingKeyboardEvent(event))
      return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      options.select(cell);
      return;
    }
    let target = new Date(cell.date);
    if (event.key === 'ArrowLeft') target.setDate(target.getDate() - 1);
    else if (event.key === 'ArrowRight') target.setDate(target.getDate() + 1);
    else if (event.key === 'ArrowUp') target.setDate(target.getDate() - CALENDAR_WEEK_LENGTH);
    else if (event.key === 'ArrowDown') target.setDate(target.getDate() + CALENDAR_WEEK_LENGTH);
    else if (event.key === 'Home') target.setDate(target.getDate() - target.getDay());
    else if (event.key === 'End')
      target.setDate(target.getDate() + CALENDAR_WEEK_LENGTH - 1 - target.getDay());
    else if (event.key === 'PageUp') target = setMonthClamped(target, target.getMonth() - 1);
    else if (event.key === 'PageDown') target = setMonthClamped(target, target.getMonth() + 1);
    else return;
    event.preventDefault();
    focusDate(target);
  };

  return {
    handleCellKeydown,
    isCellFocusable: (cell: CalendarDateCell) =>
      !cell.disabled && options.timestamp(cell.date) === options.focusedDate.value,
  };
}
