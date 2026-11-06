import { computed, type Ref, type ComputedRef } from 'vue';
import { addDays, isSameDay, startOfDay, toDateKey } from '../../utils/date';
import { DAYS_PER_WEEK, getPeriodEnd, getPeriodStart, type DatePeriod } from './date-periods';

export interface CalendarDay {
  date: Date;
  day: number;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

interface DateGridOptions {
  currentDate: Ref<Date>;
  selectedDate: Ref<Date | null>;
  rangeStart: Ref<Date | null>;
  rangeEnd: Ref<Date | null>;
  hoverDate: Ref<Date | null>;
  range: ComputedRef<boolean>;
  period: ComputedRef<DatePeriod>;
  isDateDisabled: (date: Date) => boolean;
}

const CALENDAR_WEEK_COUNT = 6;

/** 日历网格、周期高亮与范围预览共用一组日历边界。 */
export function useDateGrid(options: DateGridOptions) {
  const rangeBounds = (preview = false): [number, number] | null => {
    const first = options.rangeStart.value;
    if (!first) return null;
    const second = options.rangeEnd.value || (preview ? options.hoverDate.value : null) || first;
    const [start, end] = first <= second ? [first, second] : [second, first];
    return [
      getPeriodStart(start, options.period.value).getTime(),
      getPeriodEnd(end, options.period.value).getTime(),
    ];
  };
  const calendarDays = computed<CalendarDay[]>(() => {
    const year = options.currentDate.value.getFullYear();
    const month = options.currentDate.value.getMonth();
    const firstOfMonth = new Date(options.currentDate.value);
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    const firstWeekday = options.period.value === 'week' ? 1 : 0;
    const offset = (firstOfMonth.getDay() - firstWeekday + DAYS_PER_WEEK) % DAYS_PER_WEEK;
    const gridStart = addDays(firstOfMonth, -offset);
    const actualRange = rangeBounds();
    const selected = options.selectedDate.value;
    const selectionStart = selected
      ? getPeriodStart(selected, options.period.value).getTime()
      : null;
    const selectionEnd = selected ? getPeriodEnd(selected, options.period.value).getTime() : null;
    const today = startOfDay(new Date());
    return Array.from({ length: CALENDAR_WEEK_COUNT * DAYS_PER_WEEK }, (_, index) => {
      const date = addDays(gridStart, index);
      const timestamp = date.getTime();
      return {
        date,
        day: date.getDate(),
        key: toDateKey(date),
        isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
        isToday: isSameDay(date, today),
        isSelected: options.range.value
          ? actualRange !== null && timestamp >= actualRange[0] && timestamp <= actualRange[1]
          : selectionStart !== null &&
            selectionEnd !== null &&
            timestamp >= selectionStart &&
            timestamp <= selectionEnd,
        disabled: options.isDateDisabled(date),
      };
    });
  });
  const calendarWeeks = computed(() =>
    Array.from({ length: CALENDAR_WEEK_COUNT }, (_, index) =>
      calendarDays.value.slice(index * DAYS_PER_WEEK, (index + 1) * DAYS_PER_WEEK)
    )
  );
  const getDayClasses = (day: CalendarDay) => {
    const classes = ['ex-datetime-picker__day'];
    if (!day.isCurrentMonth) classes.push('ex-datetime-picker__day--other-month');
    if (day.isToday) classes.push('ex-datetime-picker__day--today');
    if (day.isSelected) classes.push('ex-datetime-picker__day--selected');
    if (day.disabled) classes.push('ex-datetime-picker__day--disabled');
    if (options.range.value) {
      const bounds = rangeBounds(true);
      const timestamp = day.date.getTime();
      if (bounds) {
        if (timestamp === bounds[0]) classes.push('ex-datetime-picker__day--range-start');
        if (timestamp === bounds[1]) classes.push('ex-datetime-picker__day--range-end');
        if (timestamp > bounds[0] && timestamp < bounds[1])
          classes.push('ex-datetime-picker__day--in-range');
      }
    }
    return classes;
  };
  return { calendarWeeks, getDayClasses };
}
