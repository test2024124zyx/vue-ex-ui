<template>
  <div
    ref="pickerRef"
    :class="pickerClasses"
    :style="pickerStyles"
  >
    <div class="ex-datetime-picker__input-wrapper">
      <input
        ref="inputRef"
        class="ex-datetime-picker__input"
        :value="displayValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        readonly
        role="combobox"
        aria-haspopup="dialog"
        :aria-controls="panelId"
        :aria-expanded="isOpen"
        v-bind="fieldAriaAttrs"
        :aria-label="inputAriaLabel"
        @click="togglePanel"
        @keydown="handleInputKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div class="ex-datetime-picker__icons">
        <button
          v-if="clearable && hasValue && !disabled && !readonly"
          type="button"
          class="ex-datetime-picker__clear"
          :aria-label="tCommon('clear')"
          @click="handleClear"
        >
          <ExIcon
            icon="close-circle-line"
            :size="16"
            aria-hidden="true"
          />
        </button>
        <span
          class="ex-datetime-picker__icon"
          aria-hidden="true"
        >
          <ExIcon
            icon="calendar-line"
            :size="16"
          />
        </span>
      </div>
    </div>

    <Teleport
      to="body"
      :disabled="!teleported"
    >
      <Transition name="ex-datetime-picker-dropdown">
        <div
          v-if="isOpen"
          :id="panelId"
          ref="panelRef"
          class="ex-datetime-picker__dropdown"
          :class="portalEffectClasses"
          role="dialog"
          :aria-label="tDatePicker('panel')"
          :data-theme="configTheme"
          :style="panelStyle"
          @keydown="handlePanelKeydown"
        >
          <div class="ex-datetime-picker__panel">
            <div class="ex-datetime-picker__header">
              <button
                type="button"
                class="ex-datetime-picker__nav-btn"
                data-action="previous-year"
                :aria-label="tCommon('prevYear')"
                @click="changeYear(-1)"
              >
                <ExIcon
                  icon="arrow-left-double-line"
                  :size="16"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                class="ex-datetime-picker__nav-btn"
                data-action="previous-month"
                :aria-label="tCommon('prevMonth')"
                @click="changeMonth(-1)"
              >
                <ExIcon
                  icon="arrow-left-s-line"
                  :size="16"
                  aria-hidden="true"
                />
              </button>

              <div
                class="ex-datetime-picker__current"
                aria-live="polite"
              >
                {{ currentYearMonth }}
              </div>

              <button
                type="button"
                class="ex-datetime-picker__nav-btn"
                data-action="next-month"
                :aria-label="tCommon('nextMonth')"
                @click="changeMonth(1)"
              >
                <ExIcon
                  icon="arrow-right-s-line"
                  :size="16"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                class="ex-datetime-picker__nav-btn"
                data-action="next-year"
                :aria-label="tCommon('nextYear')"
                @click="changeYear(1)"
              >
                <ExIcon
                  icon="arrow-right-double-line"
                  :size="16"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div
              class="ex-datetime-picker__calendar-grid"
              role="grid"
              :aria-label="currentYearMonth"
            >
              <div
                class="ex-datetime-picker__weekdays"
                role="row"
              >
                <span
                  v-for="weekday in weekdays"
                  :key="weekday"
                  class="ex-datetime-picker__weekday"
                  role="columnheader"
                >
                  {{ weekday }}
                </span>
              </div>

              <div
                v-for="(week, weekIndex) in calendarWeeks"
                :key="weekIndex"
                class="ex-datetime-picker__week"
                role="row"
              >
                <div
                  v-for="day in week"
                  :key="day.key"
                  class="ex-datetime-picker__day-cell"
                  role="gridcell"
                >
                  <button
                    type="button"
                    :class="getDayClasses(day)"
                    :data-date="day.key"
                    :disabled="day.disabled"
                    :tabindex="!day.disabled && isSameDay(day.date, focusedDate) ? 0 : -1"
                    :aria-label="formatDate(day.date, 'YYYY-MM-DD')"
                    :aria-selected="day.isSelected"
                    :aria-current="day.isToday ? 'date' : undefined"
                    @click="selectDate(day.date)"
                    @focus="focusedDate = new Date(day.date)"
                    @keydown="handleDayKeydown($event, day.date)"
                    @pointerenter="previewRange(day.date)"
                    @pointerleave="hoverDate = null"
                  >
                    {{ day.day }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="hasTime"
              class="ex-datetime-picker__time-panel"
            >
              <div class="ex-datetime-picker__time-header">
                {{ tTimePicker('selectTime') }}
              </div>
              <div class="ex-datetime-picker__time-inputs">
                <fieldset
                  v-if="!isRangeMode || rangeStart"
                  class="ex-datetime-picker__time-group"
                >
                  <legend v-if="isRangeMode">
                    {{ tTimePicker('startTime') }}
                  </legend>
                  <div class="ex-datetime-picker__time-selectors">
                    <input
                      v-model.number="hours"
                      class="ex-datetime-picker__time-input"
                      data-time-part="hour"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="23"
                      step="1"
                      :aria-label="tTimePicker('hour')"
                      @change="updateStartTime"
                      @blur="updateStartTime"
                    />
                    <span aria-hidden="true">:</span>
                    <input
                      v-model.number="minutes"
                      class="ex-datetime-picker__time-input"
                      data-time-part="minute"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="59"
                      :step="minuteStep"
                      :aria-label="tTimePicker('minute')"
                      @change="updateStartTime"
                      @blur="updateStartTime"
                    />
                    <span aria-hidden="true">:</span>
                    <input
                      v-model.number="seconds"
                      class="ex-datetime-picker__time-input"
                      data-time-part="second"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="59"
                      step="1"
                      :aria-label="tTimePicker('second')"
                      @change="updateStartTime"
                      @blur="updateStartTime"
                    />
                  </div>
                </fieldset>

                <fieldset
                  v-if="isRangeMode && rangeEnd"
                  class="ex-datetime-picker__time-group"
                >
                  <legend>{{ tTimePicker('endTime') }}</legend>
                  <div class="ex-datetime-picker__time-selectors">
                    <input
                      v-model.number="endHours"
                      class="ex-datetime-picker__time-input"
                      data-time-part="end-hour"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="23"
                      step="1"
                      :aria-label="tTimePicker('hour')"
                      @change="updateEndTime"
                      @blur="updateEndTime"
                    />
                    <span aria-hidden="true">:</span>
                    <input
                      v-model.number="endMinutes"
                      class="ex-datetime-picker__time-input"
                      data-time-part="end-minute"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="59"
                      :step="minuteStep"
                      :aria-label="tTimePicker('minute')"
                      @change="updateEndTime"
                      @blur="updateEndTime"
                    />
                    <span aria-hidden="true">:</span>
                    <input
                      v-model.number="endSeconds"
                      class="ex-datetime-picker__time-input"
                      data-time-part="end-second"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="59"
                      step="1"
                      :aria-label="tTimePicker('second')"
                      @change="updateEndTime"
                      @blur="updateEndTime"
                    />
                  </div>
                </fieldset>
              </div>
            </div>

            <div class="ex-datetime-picker__footer">
              <button
                v-if="showToday"
                type="button"
                class="ex-datetime-picker__today-btn"
                :disabled="isTodayDisabled"
                @click="selectToday"
              >
                {{ tCommon('today') }}
              </button>
              <button
                type="button"
                class="ex-datetime-picker__confirm-btn"
                :disabled="!canConfirm"
                @click="handleConfirm"
              >
                {{ tCommon('confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useLocale } from '../../locale';
import {
  addDays,
  cloneDate,
  formatDate,
  isSameDay,
  normalizeMinuteStep,
  normalizeMinuteStepSize,
  normalizeTimeUnit,
  setMonthClamped,
  setYearClamped,
  startOfDay,
  toDateKey,
} from '../../utils/date';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { useFormFieldState } from '../form/use-form-item';
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import ExIcon from '../icon/ExIcon.vue';
import type {
  DateTimePickerValue,
  ExDateTimePickerEmits,
  ExDateTimePickerExposed,
  ExDateTimePickerProps,
} from './types';

defineOptions({
  name: 'ExDateTimePicker',
});

const props = withDefaults(defineProps<ExDateTimePickerProps>(), {
  type: 'date',
  size: undefined,
  placeholder: '',
  format: '',
  disabled: false,
  readonly: false,
  clearable: true,
  showTime: false,
  timeStep: 1,
  showToday: true,
  teleported: true,
});

const emit = defineEmits<ExDateTimePickerEmits>();
const { t: tCommon } = useLocale('common');
const { t: tDatePicker } = useLocale('datePicker');
const { t: tCalendar } = useLocale('calendar');
const { t: tTimePicker } = useLocale('timePicker');
const {
  formItem,
  disabled,
  readonly,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const dropdownZIndex = useZIndexLayer('dropdown');
const instanceId = useId();
const panelId = `ex-datetime-picker-panel-${instanceId}`;

const pickerRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const panelRef = ref<HTMLElement>();
const isOpen = ref(false);
const { styles: popupOverlayStyles, containsTarget } = usePopupOverlay({
  active: () => isOpen.value,
  container: panelRef,
  zIndex: () => dropdownZIndex.value,
  onEscape: () => closePanel({ restoreFocus: true, discardDraft: true }),
});
const panelPositionStyle = ref<CSSProperties>({});
const portalEffectClasses = computed(() => ({
  'ex-no-neon': !neonEffect.value,
  'ex-no-animation': !animation.value,
}));
const panelStyle = computed<CSSProperties>(() => ({
  ...panelPositionStyle.value,
  ...popupOverlayStyles.value,
}));
const currentDate = ref(new Date());
const focusedDate = ref(startOfDay(new Date()));
const selectedDate = ref<Date | null>(null);
const rangeStart = ref<Date | null>(null);
const rangeEnd = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);

const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const endHours = ref(0);
const endMinutes = ref(0);
const endSeconds = ref(0);

interface CalendarDay {
  date: Date;
  day: number;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

const isRangeMode = computed(() => props.type === 'daterange' || props.type === 'datetimerange');
const hasTime = computed(
  () => props.showTime || props.type === 'datetime' || props.type === 'datetimerange'
);
const minuteStep = computed(() => normalizeMinuteStepSize(props.timeStep));
const effectiveFormat = computed(
  () => props.format || (hasTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
);
const hasValue = computed(() =>
  isRangeMode.value ? Boolean(rangeStart.value || rangeEnd.value) : Boolean(selectedDate.value)
);
const canConfirm = computed(() =>
  isRangeMode.value ? Boolean(rangeStart.value && rangeEnd.value) : Boolean(selectedDate.value)
);

const pickerClasses = computed(() => [
  'ex-datetime-picker',
  `ex-datetime-picker--${componentSize.value}`,
  {
    'ex-datetime-picker--range': isRangeMode.value,
    'ex-datetime-picker--disabled': disabled.value,
    'ex-datetime-picker--readonly': readonly.value,
    'ex-datetime-picker--open': isOpen.value,
  },
  ...normalizeCustomClass(props.class),
]);
const pickerStyles = computed<string | CSSProperties | undefined>(() => props.style || undefined);

const currentPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  if (!isRangeMode.value) return tDatePicker('placeholder');
  const start = props.startPlaceholder || tDatePicker('startDate');
  const end = props.endPlaceholder || tDatePicker('endDate');
  return `${start} ${tDatePicker('rangeSeparator')} ${end}`;
});
const inputAriaLabel = computed(() => props.ariaLabel || currentPlaceholder.value);

const displayValue = computed(() => {
  if (!isRangeMode.value) {
    return selectedDate.value ? formatDate(selectedDate.value, effectiveFormat.value) : '';
  }
  const start = rangeStart.value ? formatDate(rangeStart.value, effectiveFormat.value) : '';
  const end = rangeEnd.value ? formatDate(rangeEnd.value, effectiveFormat.value) : '';
  if (start && end) return `${start} ${tDatePicker('rangeSeparator')} ${end}`;
  return start || end;
});

const weekdays = computed(() => tCalendar('weekdaysShort').split(','));
const currentYearMonth = computed(() => {
  const year = tCalendar('yearFormat', { year: currentDate.value.getFullYear() });
  const month = tCalendar('monthFormat', { month: currentDate.value.getMonth() + 1 });
  return `${year} ${month}`;
});

const isDateDisabled = (date: Date): boolean =>
  props.disabledDate ? Boolean(props.disabledDate(new Date(date.getTime()))) : false;

const getActualRangeBounds = (): [number, number] | null => {
  if (!rangeStart.value) return null;
  const start = startOfDay(rangeStart.value).getTime();
  if (!rangeEnd.value) return [start, start];
  const end = startOfDay(rangeEnd.value).getTime();
  return start <= end ? [start, end] : [end, start];
};

const getPreviewRangeBounds = (): [number, number] | null => {
  if (!rangeStart.value) return null;
  const candidate = rangeEnd.value || hoverDate.value || rangeStart.value;
  const start = startOfDay(rangeStart.value).getTime();
  const end = startOfDay(candidate).getTime();
  return start <= end ? [start, end] : [end, start];
};

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const today = startOfDay(new Date());
  const actualRange = getActualRangeBounds();

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const timestamp = startOfDay(date).getTime();
    const isSelected = isRangeMode.value
      ? actualRange !== null && timestamp >= actualRange[0] && timestamp <= actualRange[1]
      : isSameDay(date, selectedDate.value);
    return {
      date,
      day: date.getDate(),
      key: toDateKey(date),
      isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSelected,
      disabled: isDateDisabled(date),
    };
  });
});

const calendarWeeks = computed(() =>
  Array.from({ length: 6 }, (_, index) => calendarDays.value.slice(index * 7, index * 7 + 7))
);

const getDayClasses = (day: CalendarDay) => {
  const classes = ['ex-datetime-picker__day'];
  if (!day.isCurrentMonth) classes.push('ex-datetime-picker__day--other-month');
  if (day.isToday) classes.push('ex-datetime-picker__day--today');
  if (day.isSelected) classes.push('ex-datetime-picker__day--selected');
  if (day.disabled) classes.push('ex-datetime-picker__day--disabled');

  if (isRangeMode.value && rangeStart.value) {
    const bounds = getPreviewRangeBounds();
    const timestamp = startOfDay(day.date).getTime();
    if (bounds) {
      if (timestamp === bounds[0]) classes.push('ex-datetime-picker__day--range-start');
      if (timestamp === bounds[1]) classes.push('ex-datetime-picker__day--range-end');
      if (timestamp > bounds[0] && timestamp < bounds[1]) {
        classes.push('ex-datetime-picker__day--in-range');
      }
    }
  }
  return classes;
};

const isTodayDisabled = computed(() => isDateDisabled(startOfDay(new Date())));

const syncStartTime = (date: Date | null) => {
  hours.value = date?.getHours() ?? 0;
  minutes.value = date?.getMinutes() ?? 0;
  seconds.value = date?.getSeconds() ?? 0;
};

const syncEndTime = (date: Date | null) => {
  endHours.value = date?.getHours() ?? 0;
  endMinutes.value = date?.getMinutes() ?? 0;
  endSeconds.value = date?.getSeconds() ?? 0;
};

/** 从受控值重建独立草稿，取消面板时不会把未确认状态泄漏到下一次打开。 */
const syncFromModel = () => {
  selectedDate.value = null;
  rangeStart.value = null;
  rangeEnd.value = null;
  hoverDate.value = null;

  if (isRangeMode.value) {
    if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
      const first = cloneDate(props.modelValue[0]);
      const second = cloneDate(props.modelValue[1]);
      if (first && second) {
        [rangeStart.value, rangeEnd.value] =
          first.getTime() <= second.getTime() ? [first, second] : [second, first];
      }
    }
    syncStartTime(rangeStart.value);
    syncEndTime(rangeEnd.value);
    const anchor = rangeStart.value || startOfDay(new Date());
    currentDate.value = new Date(anchor);
    focusedDate.value = startOfDay(anchor);
    return;
  }

  selectedDate.value = cloneDate(props.modelValue);
  syncStartTime(selectedDate.value);
  syncEndTime(null);
  const anchor = selectedDate.value || startOfDay(new Date());
  currentDate.value = new Date(anchor);
  focusedDate.value = startOfDay(anchor);
};

const clonePickerValue = (value: DateTimePickerValue): DateTimePickerValue => {
  if (Array.isArray(value)) return [new Date(value[0]), new Date(value[1])];
  return value instanceof Date ? new Date(value) : null;
};

const emitCommittedValue = (value: DateTimePickerValue) => {
  if (!interactive.value) return;
  emit('update:modelValue', clonePickerValue(value));
  emit('change', clonePickerValue(value));
  formItem?.onFieldChange();
};

const commitSingle = (date: Date) => {
  const value = new Date(date.getTime());
  selectedDate.value = new Date(value);
  emitCommittedValue(value);
};

const commitRange = (start: Date, end: Date) => {
  const value: [Date, Date] = [new Date(start.getTime()), new Date(end.getTime())];
  rangeStart.value = new Date(value[0]);
  rangeEnd.value = new Date(value[1]);
  emitCommittedValue(value);
};

interface ClosePanelOptions {
  restoreFocus?: boolean;
  discardDraft?: boolean;
}

const closePanel = ({ restoreFocus = false, discardDraft = false }: ClosePanelOptions = {}) => {
  if (!isOpen.value) return;
  isOpen.value = false;
  if (discardDraft) syncFromModel();
  emit('visible-change', false);
  if (restoreFocus) nextTick(() => inputRef.value?.focus());
};

const focusCurrentDay = () => {
  nextTick(() => {
    const key = toDateKey(focusedDate.value);
    const day = panelRef.value?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`);
    if (day && !day.disabled) day.focus();
  });
};

const PANEL_VIEWPORT_GAP = 8;

const updatePanelPosition = () => {
  if (!props.teleported) {
    panelPositionStyle.value = {};
    return;
  }
  if (!inputRef.value || !panelRef.value || typeof window === 'undefined') return;

  const triggerRect = inputRef.value.getBoundingClientRect();
  const panelWidth = panelRef.value.offsetWidth;
  const panelHeight = panelRef.value.offsetHeight;
  const maxLeft = Math.max(PANEL_VIEWPORT_GAP, window.innerWidth - panelWidth - PANEL_VIEWPORT_GAP);
  const left = Math.min(Math.max(PANEL_VIEWPORT_GAP, triggerRect.left), maxLeft);
  const spaceBelow = window.innerHeight - triggerRect.bottom - PANEL_VIEWPORT_GAP;
  const spaceAbove = triggerRect.top - PANEL_VIEWPORT_GAP;
  const openAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;
  const desiredTop = openAbove
    ? triggerRect.top - panelHeight - PANEL_VIEWPORT_GAP
    : triggerRect.bottom + PANEL_VIEWPORT_GAP;
  const maxTop = Math.max(
    PANEL_VIEWPORT_GAP,
    window.innerHeight - panelHeight - PANEL_VIEWPORT_GAP
  );
  const top = Math.min(Math.max(PANEL_VIEWPORT_GAP, desiredTop), maxTop);

  panelPositionStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
  };
};

const openPanel = (focusCalendar = false) => {
  if (!interactive.value || isOpen.value) return;
  syncFromModel();
  isOpen.value = true;
  emit('visible-change', true);
  nextTick(() => {
    updatePanelPosition();
    if (focusCalendar) {
      if (isDateDisabled(focusedDate.value)) {
        const nextEnabled = findEnabledDate(addDays(focusedDate.value, 1), 1);
        const previousEnabled = nextEnabled
          ? null
          : findEnabledDate(addDays(focusedDate.value, -1), -1);
        const enabledDate = nextEnabled || previousEnabled;
        if (enabledDate) focusDate(enabledDate);
      } else {
        focusCurrentDay();
      }
    }
  });
};

const togglePanel = () => {
  if (!interactive.value) return;
  if (isOpen.value) closePanel({ discardDraft: true });
  else openPanel();
};

const handleInputKeydown = (event: KeyboardEvent) => {
  if (!interactive.value || event.isComposing) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!isOpen.value) openPanel(true);
    else focusCurrentDay();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    togglePanel();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closePanel({ discardDraft: true });
  }
};

const handleEscape = () => closePanel({ restoreFocus: true, discardDraft: true });

const handlePanelKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  handleEscape();
};

const changeMonth = (offset: number) => {
  const next = setMonthClamped(currentDate.value, currentDate.value.getMonth() + offset);
  currentDate.value = next;
  focusedDate.value = startOfDay(next);
};

const changeYear = (offset: number) => {
  const next = setYearClamped(currentDate.value, currentDate.value.getFullYear() + offset);
  currentDate.value = next;
  focusedDate.value = startOfDay(next);
};

const withTime = (date: Date, h: number, m: number, s: number): Date => {
  const result = startOfDay(date);
  if (hasTime.value) result.setHours(h, m, s, 0);
  return result;
};

const selectDate = (date: Date) => {
  if (isDateDisabled(date)) return;
  focusedDate.value = startOfDay(date);
  currentDate.value = new Date(date);

  if (!isRangeMode.value) {
    const next = withTime(date, hours.value, minutes.value, seconds.value);
    selectedDate.value = next;
    if (!hasTime.value) {
      commitSingle(next);
      closePanel({ restoreFocus: true });
    }
    return;
  }

  if (!rangeStart.value || rangeEnd.value) {
    rangeStart.value = withTime(date, hours.value, minutes.value, seconds.value);
    rangeEnd.value = null;
    hoverDate.value = null;
    return;
  }

  const candidate = withTime(date, endHours.value, endMinutes.value, endSeconds.value);
  const first = rangeStart.value;
  [rangeStart.value, rangeEnd.value] =
    first.getTime() <= candidate.getTime() ? [first, candidate] : [candidate, first];
  if (hasTime.value) {
    syncStartTime(rangeStart.value);
    syncEndTime(rangeEnd.value);
  }
  hoverDate.value = null;

  if (!hasTime.value) {
    commitRange(rangeStart.value, rangeEnd.value);
    closePanel({ restoreFocus: true });
  }
};

const previewRange = (date: Date) => {
  if (isRangeMode.value && rangeStart.value && !rangeEnd.value && !isDateDisabled(date)) {
    hoverDate.value = new Date(date);
  }
};

const updateStartTime = () => {
  hours.value = normalizeTimeUnit(hours.value, 23);
  minutes.value = normalizeMinuteStep(minutes.value, minuteStep.value);
  seconds.value = normalizeTimeUnit(seconds.value, 59);
  const target = isRangeMode.value ? rangeStart.value : selectedDate.value;
  if (!target) return;
  const updated = new Date(target);
  updated.setHours(hours.value, minutes.value, seconds.value, 0);
  if (isRangeMode.value) rangeStart.value = updated;
  else selectedDate.value = updated;
};

const updateEndTime = () => {
  endHours.value = normalizeTimeUnit(endHours.value, 23);
  endMinutes.value = normalizeMinuteStep(endMinutes.value, minuteStep.value);
  endSeconds.value = normalizeTimeUnit(endSeconds.value, 59);
  if (!rangeEnd.value) return;
  const updated = new Date(rangeEnd.value);
  updated.setHours(endHours.value, endMinutes.value, endSeconds.value, 0);
  rangeEnd.value = updated;
  if (rangeStart.value && rangeEnd.value < rangeStart.value) {
    [rangeStart.value, rangeEnd.value] = [rangeEnd.value, rangeStart.value];
    syncStartTime(rangeStart.value);
    syncEndTime(rangeEnd.value);
  }
};

const handleConfirm = () => {
  if (!canConfirm.value) return;
  updateStartTime();
  if (isRangeMode.value) {
    updateEndTime();
    if (rangeStart.value && rangeEnd.value) commitRange(rangeStart.value, rangeEnd.value);
  } else if (selectedDate.value) {
    commitSingle(selectedDate.value);
  }
  closePanel({ restoreFocus: true });
};

const selectToday = () => {
  const today = startOfDay(new Date());
  if (isDateDisabled(today)) return;
  currentDate.value = new Date(today);
  focusedDate.value = new Date(today);
  selectDate(today);
};

const focusDate = (date: Date) => {
  const next = startOfDay(date);
  focusedDate.value = next;
  if (
    next.getFullYear() !== currentDate.value.getFullYear() ||
    next.getMonth() !== currentDate.value.getMonth()
  ) {
    currentDate.value = new Date(next);
  }
  focusCurrentDay();
};

const MAX_DISABLED_DATE_SEARCH_DAYS = 3660;

const findEnabledDate = (initial: Date, direction: number): Date | null => {
  let candidate = new Date(initial);
  for (let attempts = 0; attempts <= MAX_DISABLED_DATE_SEARCH_DAYS; attempts += 1) {
    if (!isDateDisabled(candidate)) return candidate;
    candidate = addDays(candidate, direction);
  }
  return null;
};

const handleDayKeydown = (event: KeyboardEvent, date: Date) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    handleEscape();
    return;
  }

  let target: Date;
  let direction = 1;
  if (event.key === 'ArrowLeft') {
    target = addDays(date, -1);
    direction = -1;
  } else if (event.key === 'ArrowRight') target = addDays(date, 1);
  else if (event.key === 'ArrowUp') {
    target = addDays(date, -7);
    direction = -1;
  } else if (event.key === 'ArrowDown') target = addDays(date, 7);
  else if (event.key === 'Home') {
    target = addDays(date, -date.getDay());
    direction = -1;
  } else if (event.key === 'End') target = addDays(date, 6 - date.getDay());
  else if (event.key === 'PageUp') {
    target = setMonthClamped(date, date.getMonth() - 1);
    direction = -1;
  } else if (event.key === 'PageDown') target = setMonthClamped(date, date.getMonth() + 1);
  else return;

  event.preventDefault();
  const enabledDate = findEnabledDate(target, direction);
  if (enabledDate) focusDate(enabledDate);
};

const handleFocus = (event: FocusEvent) => emit('focus', event);
const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
  formItem?.onFieldBlur();
};

const handleClear = () => {
  if (!interactive.value) return;
  selectedDate.value = null;
  rangeStart.value = null;
  rangeEnd.value = null;
  hoverDate.value = null;
  emitCommittedValue(null);
  emit('clear');
  closePanel();
};

const handleClickOutside = (event: PointerEvent) => {
  if (!(event.target instanceof Node)) return;
  const isInsideTrigger = pickerRef.value?.contains(event.target);
  const isInsidePanel = containsTarget(event.target);
  if (!isInsideTrigger && !isInsidePanel) {
    closePanel({ discardDraft: true });
  }
};

watch([() => props.modelValue, () => props.type], () => syncFromModel(), { immediate: true });

watch(interactive, canInteract => {
  if (!canInteract) closePanel({ discardDraft: true });
});

watch(
  () => props.timeStep,
  () => {
    if (hasTime.value) {
      updateStartTime();
      updateEndTime();
    }
  }
);

watch(isOpen, open => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (open) {
    document.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
  } else {
    document.removeEventListener('pointerdown', handleClickOutside);
    window.removeEventListener('resize', updatePanelPosition);
    window.removeEventListener('scroll', updatePanelPosition, true);
  }
});

watch(
  () => props.teleported,
  () => nextTick(updatePanelPosition)
);

onBeforeUnmount(() => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  document.removeEventListener('pointerdown', handleClickOutside);
  window.removeEventListener('resize', updatePanelPosition);
  window.removeEventListener('scroll', updatePanelPosition, true);
});

const focus = () => inputRef.value?.focus();
const blur = () => inputRef.value?.blur();
const getElement = () => pickerRef.value ?? null;

defineExpose<ExDateTimePickerExposed>({ focus, blur, getElement });
</script>

<style scoped lang="scss" src="./ExDateTimePicker.scss"></style>
