import { computed, type ComputedRef } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import { cloneDate } from '../../utils/date';
import { formatPickerDate, getPeriodStart, type DatePeriod } from './date-periods';
import type { DateTimePickerValue, ExDateTimePickerProps } from './types';

/** 日期值必须是独立快照；无效日期或不完整范围统一视为空值。 */
export function clonePickerValue(value: DateTimePickerValue): DateTimePickerValue {
  if (Array.isArray(value)) {
    const first = cloneDate(value[0]);
    const second = cloneDate(value[1]);
    return first && second ? [first, second] : null;
  }
  return cloneDate(value);
}

/** 确认值与面板草稿分离，父级拒绝更新时不允许草稿污染外部显示。 */
export function usePickerValue(
  props: ExDateTimePickerProps,
  range: ComputedRef<boolean>,
  hasTime: ComputedRef<boolean>,
  period: ComputedRef<DatePeriod>,
  separator: () => string
) {
  const state = useControllableState<DateTimePickerValue>({
    controlledValue: () => props.modelValue,
    defaultValue: null,
    clone: clonePickerValue,
  });
  const currentValue = computed(() => {
    const value = clonePickerValue(state.value.value);
    const normalize = (date: Date) =>
      period.value === 'date' ? date : getPeriodStart(date, period.value);
    if (range.value) {
      if (!Array.isArray(value)) return null;
      const ordered = value[0].getTime() <= value[1].getTime() ? value : [value[1], value[0]];
      return ordered.map(normalize);
    }
    return !value || Array.isArray(value) ? null : normalize(value);
  });
  const displayValue = computed(() => {
    const defaults: Record<DatePeriod, string> = {
      date: hasTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
      week: 'GGGG-[W]WW',
      month: 'YYYY-MM',
      year: 'YYYY',
    };
    const format = props.format || defaults[period.value];
    const value = currentValue.value;
    if (Array.isArray(value))
      return value.map(date => formatPickerDate(date, format)).join(` ${separator()} `);
    return value ? formatPickerDate(value, format) : '';
  });
  return {
    currentValue,
    displayValue,
    hasValue: computed(() => currentValue.value !== null),
    requestValue: state.request,
  };
}
