<template>
  <div
    class="ex-date-period-grid"
    role="grid"
    :aria-label="label"
  >
    <div
      v-for="(row, index) in rows"
      :key="index"
      class="ex-date-period-grid__row"
      role="row"
    >
      <div
        v-for="cell in row"
        :key="cell.key"
        role="gridcell"
        :aria-selected="cell.selected"
      >
        <button
          type="button"
          class="ex-date-period-grid__cell"
          :class="{ 'is-selected': cell.selected, 'is-preview': cell.preview }"
          :data-period="cell.key"
          :data-date="toDateKey(cell.date)"
          :disabled="cell.disabled"
          :tabindex="
            isSameDay(cell.date, getPeriodStart(focused, period)) && !cell.disabled ? 0 : -1
          "
          @click="emit('select', cell.date)"
          @focus="emit('focus', cell.date)"
          @keydown="handleKeydown($event, cell.date)"
          @pointerenter="emit('preview', cell.disabled ? null : cell.date)"
          @pointerleave="emit('preview', null)"
        >
          {{ cell.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isSameDay, setMonthClamped, setYearClamped, toDateKey } from '../../utils/date';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { getPeriodStart, MONTHS_PER_YEAR, YEARS_PER_PAGE } from './date-periods';
import { useLocale } from '../../locale';

const props = defineProps<{
  period: 'year' | 'month';
  current: Date;
  focused: Date;
  selection: Date[];
  preview?: Date | null;
  label: string;
  disabledDate: (date: Date) => boolean;
}>();
const emit = defineEmits<{
  select: [date: Date];
  focus: [date: Date];
  navigate: [date: Date];
  preview: [date: Date | null];
}>();
const { t } = useLocale('datePicker');
const COLUMN_COUNT = 3;
const MAX_KEYBOARD_SEARCH_PERIODS = YEARS_PER_PAGE * MONTHS_PER_YEAR;
const cells = computed(() => {
  const anchor = getPeriodStart(props.current, 'year');
  const baseYear = Math.floor(anchor.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const count = props.period === 'year' ? YEARS_PER_PAGE : MONTHS_PER_YEAR;
  const values = props.selection.map(date => getPeriodStart(date, props.period).getTime());
  const first = values[0];
  const last = values[1] ?? first;
  const preview = props.preview ? getPeriodStart(props.preview, props.period).getTime() : undefined;
  const monthNames = t('monthsShort').split(',');
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(anchor);
    if (props.period === 'year') date.setFullYear(baseYear + index);
    else date.setMonth(index);
    const time = date.getTime();
    return {
      date,
      key: props.period === 'year' ? String(date.getFullYear()) : toDateKey(date).slice(0, 7),
      label: props.period === 'year' ? String(date.getFullYear()) : monthNames[index],
      selected: first !== undefined && last !== undefined && time >= first && time <= last,
      preview:
        first !== undefined &&
        preview !== undefined &&
        time >= Math.min(first, preview) &&
        time <= Math.max(first, preview),
      disabled: props.disabledDate(date),
    };
  });
});
const rows = computed(() =>
  Array.from({ length: Math.ceil(cells.value.length / COLUMN_COUNT) }, (_, index) =>
    cells.value.slice(index * COLUMN_COUNT, (index + 1) * COLUMN_COUNT)
  )
);

/** 网格方向键按行列移动，跨页焦点由父级统一更新并跳过禁用周期。 */
const handleKeydown = (event: KeyboardEvent, date: Date) => {
  if (isComposingKeyboardEvent(event)) return;
  const index = cells.value.findIndex(cell => isSameDay(cell.date, date));
  const pageSize = props.period === 'year' ? YEARS_PER_PAGE : MONTHS_PER_YEAR;
  const offsets: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -COLUMN_COUNT,
    ArrowDown: COLUMN_COUNT,
    Home: -(index % COLUMN_COUNT),
    End: COLUMN_COUNT - 1 - (index % COLUMN_COUNT),
    PageUp: -pageSize,
    PageDown: pageSize,
  };
  const offset = offsets[event.key];
  if (offset === undefined) return;
  event.preventDefault();
  const move = (amount: number) =>
    props.period === 'year'
      ? setYearClamped(date, date.getFullYear() + amount)
      : setMonthClamped(date, date.getMonth() + amount);
  const direction = offset < 0 ? -1 : 1;
  for (let attempt = 0; attempt < MAX_KEYBOARD_SEARCH_PERIODS; attempt++) {
    const next = getPeriodStart(move(offset + attempt * direction), props.period);
    if (!props.disabledDate(next)) {
      emit('navigate', next);
      return;
    }
  }
};
</script>

<style scoped lang="scss">
.ex-date-period-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ex-spacing-2);
  margin-bottom: var(--ex-spacing-3);
  &__row {
    display: contents;
  }
  &__cell {
    width: 100%;
    min-height: var(--ex-button-touch-target);
    padding: var(--ex-spacing-2);
    color: var(--ex-color-text-primary);
    font: inherit;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ex-radius-base);
    cursor: pointer;
    &:hover:not(:disabled),
    &.is-preview {
      background: var(--ex-color-bg-tertiary);
    }
    &:focus-visible {
      outline: 2px solid var(--ex-color-primary);
      outline-offset: 1px;
    }
    &.is-selected {
      color: var(--ex-color-primary);
      background: var(--ex-color-bg-tertiary);
      border-color: var(--ex-color-primary);
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}
</style>
