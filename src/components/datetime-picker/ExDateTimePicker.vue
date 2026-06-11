<template>
  <div ref="pickerRef" :class="pickerClasses" :style="pickerStyles" @click="handleClick">
    <!-- 输入框 -->
    <div class="ex-datetime-picker__input-wrapper">
      <input
        ref="inputRef"
        :value="displayValue"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        readonly
        :aria-label="ariaLabel"
        class="ex-datetime-picker__input"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- 图标 -->
      <div class="ex-datetime-picker__icons">
        <!-- 清除按钮 -->
        <button
          v-if="clearable && modelValue && !disabled"
          class="ex-datetime-picker__clear"
          type="button"
          :aria-label="t('clear')"
          @click.stop="handleClear"
        >
          <ExIcon icon="close-circle-line" :size="16" aria-hidden="true" />
        </button>

        <!-- 日历图标 -->
        <div class="ex-datetime-picker__icon">
          <ExIcon icon="calendar-line" :size="16" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- 下拉面板 -->
    <transition name="ex-datetime-picker-dropdown">
      <div v-if="isOpen" class="ex-datetime-picker__dropdown" @click.stop>
        <!-- 日期选择面板 -->
        <div class="ex-datetime-picker__panel">
          <!-- 头部 -->
          <div class="ex-datetime-picker__header">
            <button
              class="ex-datetime-picker__nav-btn"
              type="button"
              :aria-label="t('prevYear')"
              @click="changeYear(-1)"
            >
              <ExIcon icon="arrow-left-double-line" :size="16" aria-hidden="true" />
            </button>
            <button
              class="ex-datetime-picker__nav-btn"
              type="button"
              :aria-label="t('prevMonth')"
              @click="changeMonth(-1)"
            >
              <ExIcon icon="arrow-left-s-line" :size="16" aria-hidden="true" />
            </button>

            <div class="ex-datetime-picker__current">
              {{ currentYearMonth }}
            </div>

            <button
              class="ex-datetime-picker__nav-btn"
              type="button"
              :aria-label="t('nextMonth')"
              @click="changeMonth(1)"
            >
              <ExIcon icon="arrow-right-s-line" :size="16" aria-hidden="true" />
            </button>
            <button
              class="ex-datetime-picker__nav-btn"
              type="button"
              :aria-label="t('nextYear')"
              @click="changeYear(1)"
            >
              <ExIcon icon="arrow-right-double-line" :size="16" aria-hidden="true" />
            </button>
          </div>

          <!-- 星期标题 -->
          <div class="ex-datetime-picker__weekdays">
            <div v-for="day in weekdays" :key="day" class="ex-datetime-picker__weekday">
              {{ day }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="ex-datetime-picker__days">
            <button
              v-for="day in calendarDays"
              :key="day.key"
              :class="getDayClasses(day)"
              :disabled="day.disabled"
              type="button"
              @click="selectDate(day.date)"
              @mouseenter="isRangeMode && rangeStart && !rangeEnd ? (hoverDate = day.date) : null"
              @mouseleave="hoverDate = null"
            >
              {{ day.day }}
            </button>
          </div>

          <!-- 时间选择面板 -->
          <div
            v-if="showTime || type === 'datetime' || type === 'datetimerange'"
            class="ex-datetime-picker__time-panel"
          >
            <div class="ex-datetime-picker__time-header">
              {{ isRangeMode ? '选择时间' : '选择时间' }}
            </div>
            <div class="ex-datetime-picker__time-inputs">
              <div v-if="!isRangeMode || rangeStart" class="ex-datetime-picker__time-input-group">
                <label v-if="isRangeMode">开始时间</label>
                <div class="ex-datetime-picker__time-selectors">
                  <input
                    v-model.number="hours"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="时"
                    class="ex-datetime-picker__time-input"
                    @input="updateTime"
                    @blur="updateTime"
                  />
                  <span>:</span>
                  <input
                    v-model.number="minutes"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="分"
                    class="ex-datetime-picker__time-input"
                    @input="updateTime"
                    @blur="updateTime"
                  />
                  <span>:</span>
                  <input
                    v-model.number="seconds"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="秒"
                    class="ex-datetime-picker__time-input"
                    @input="updateTime"
                    @blur="updateTime"
                  />
                </div>
              </div>
              <div v-if="isRangeMode && rangeEnd" class="ex-datetime-picker__time-input-group">
                <label>结束时间</label>
                <div class="ex-datetime-picker__time-selectors">
                  <input
                    v-model.number="endHours"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="时"
                    class="ex-datetime-picker__time-input"
                    @input="updateEndTime"
                    @blur="updateEndTime"
                  />
                  <span>:</span>
                  <input
                    v-model.number="endMinutes"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="分"
                    class="ex-datetime-picker__time-input"
                    @input="updateEndTime"
                    @blur="updateEndTime"
                  />
                  <span>:</span>
                  <input
                    v-model.number="endSeconds"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="秒"
                    class="ex-datetime-picker__time-input"
                    @input="updateEndTime"
                    @blur="updateEndTime"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="ex-datetime-picker__footer">
            <button
              v-if="showToday"
              class="ex-datetime-picker__today-btn"
              type="button"
              @click="selectToday"
            >
              {{ t('today') }}
            </button>
            <button class="ex-datetime-picker__confirm-btn" type="button" @click="handleConfirm">
              {{ t('confirm') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type {
  ExDateTimePickerProps,
  ExDateTimePickerEmits,
  ExDateTimePickerExposed,
} from './types';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExDateTimePicker',
});

const props = withDefaults(defineProps<ExDateTimePickerProps>(), {
  type: 'date',
  size: 'medium',
  placeholder: '',
  format: 'YYYY-MM-DD',
  disabled: false,
  readonly: false,
  clearable: true,
  showTime: false,
  timeStep: 1,
  showToday: true,
  showClear: true,
});

const emit = defineEmits<ExDateTimePickerEmits>();

const { t } = useLocale('common');
const pickerRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const rangeStart = ref<Date | null>(null);
const rangeEnd = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);

// 时间选择
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const endHours = ref(0);
const endMinutes = ref(0);
const endSeconds = ref(0);

// 是否为范围选择模式
const isRangeMode = computed(() => {
  return props.type === 'daterange' || props.type === 'datetimerange';
});

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算属性
const pickerClasses = computed(() => {
  const classes = ['ex-datetime-picker', `ex-datetime-picker--${props.size}`];

  if (props.disabled) classes.push('ex-datetime-picker--disabled');
  if (isOpen.value) classes.push('ex-datetime-picker--open');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const pickerStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const currentPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  if (isRangeMode.value) {
    return `${props.startPlaceholder || '开始日期'} ~ ${props.endPlaceholder || '结束日期'}`;
  }
  return t('input.placeholder');
});

const displayValue = computed(() => {
  const format =
    props.type === 'datetime' || props.type === 'datetimerange'
      ? 'YYYY-MM-DD HH:mm:ss'
      : props.format;

  if (isRangeMode.value) {
    if (!rangeStart.value && !rangeEnd.value) return '';
    const start = rangeStart.value ? formatDate(rangeStart.value, format) : '';
    const end = rangeEnd.value ? formatDate(rangeEnd.value, format) : '';
    return start && end ? `${start} ~ ${end}` : start || end;
  }
  if (!selectedDate.value) return '';
  return formatDate(selectedDate.value, format);
});

const currentYearMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth() + 1;
  return `${year}年 ${month}月`;
});

// 日历天数
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // 当月第一天
  const firstDay = new Date(year, month, 1);
  const firstDayWeek = firstDay.getDay();

  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0);
  const lastDayDate = lastDay.getDate();

  // 上月最后几天
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days: Array<{
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    disabled: boolean;
    key: string;
  }> = [];

  // 上月日期
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      disabled: props.disabledDate ? props.disabledDate(date) : false,
      key: `prev-${day}`,
    });
  }

  // 当月日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= lastDayDate; day++) {
    const date = new Date(year, month, day);
    const isToday = date.getTime() === today.getTime();

    let isSelected = false;
    if (isRangeMode.value) {
      const dateTime = date.getTime();
      const startTime = rangeStart.value ? new Date(rangeStart.value).setHours(0, 0, 0, 0) : null;
      const endTime = rangeEnd.value ? new Date(rangeEnd.value).setHours(0, 0, 0, 0) : null;

      if (startTime && endTime) {
        isSelected = dateTime >= startTime && dateTime <= endTime;
      } else if (startTime) {
        isSelected = dateTime === startTime;
      }
    } else {
      isSelected = selectedDate.value
        ? date.getTime() === new Date(selectedDate.value).setHours(0, 0, 0, 0)
        : false;
    }

    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday,
      isSelected,
      disabled: props.disabledDate ? props.disabledDate(date) : false,
      key: `current-${day}`,
    });
  }

  // 下月日期
  const remainingDays = 42 - days.length; // 6行 x 7列
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      disabled: props.disabledDate ? props.disabledDate(date) : false,
      key: `next-${day}`,
    });
  }

  return days;
});

// 方法
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
  key: string;
}

const getDayClasses = (day: CalendarDay) => {
  const classes = ['ex-datetime-picker__day'];

  if (!day.isCurrentMonth) classes.push('ex-datetime-picker__day--other-month');
  if (day.isToday) classes.push('ex-datetime-picker__day--today');
  if (day.isSelected) classes.push('ex-datetime-picker__day--selected');
  if (day.disabled) classes.push('ex-datetime-picker__day--disabled');

  // 范围选择模式的额外样式
  if (isRangeMode.value && rangeStart.value) {
    const dateTime = day.date.getTime();
    const startTime = new Date(rangeStart.value).setHours(0, 0, 0, 0);
    const endTime = rangeEnd.value ? new Date(rangeEnd.value).setHours(0, 0, 0, 0) : null;
    const hoverTime = hoverDate.value ? new Date(hoverDate.value).setHours(0, 0, 0, 0) : null;

    // 范围起始
    if (dateTime === startTime) {
      classes.push('ex-datetime-picker__day--range-start');
    }

    // 范围结束
    if (endTime && dateTime === endTime) {
      classes.push('ex-datetime-picker__day--range-end');
    }

    // 范围中间（包括悬停预览）
    const effectiveEndTime = endTime || hoverTime;
    if (effectiveEndTime && dateTime > startTime && dateTime < effectiveEndTime) {
      classes.push('ex-datetime-picker__day--in-range');
    }
  }

  return classes;
};

const changeYear = (offset: number) => {
  const newDate = new Date(currentDate.value);
  newDate.setFullYear(newDate.getFullYear() + offset);
  currentDate.value = newDate;
};

const changeMonth = (offset: number) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
};

// 校验并限制时间输入
const validateHours = (value: number) => {
  if (isNaN(value) || value < 0) return 0;
  if (value > 23) return 23;
  return Math.floor(value);
};

const validateMinutes = (value: number) => {
  if (isNaN(value) || value < 0) return 0;
  if (value > 59) return 59;
  return Math.floor(value);
};

const validateSeconds = (value: number) => {
  if (isNaN(value) || value < 0) return 0;
  if (value > 59) return 59;
  return Math.floor(value);
};

const updateTime = () => {
  // 校验并限制输入值
  hours.value = validateHours(hours.value);
  minutes.value = validateMinutes(minutes.value);
  seconds.value = validateSeconds(seconds.value);

  if (selectedDate.value) {
    const newDate = new Date(selectedDate.value);
    newDate.setHours(hours.value);
    newDate.setMinutes(minutes.value);
    newDate.setSeconds(seconds.value);
    selectedDate.value = newDate;
  }
  if (isRangeMode.value && rangeStart.value) {
    const newDate = new Date(rangeStart.value);
    newDate.setHours(hours.value);
    newDate.setMinutes(minutes.value);
    newDate.setSeconds(seconds.value);
    rangeStart.value = newDate;
  }
};

const updateEndTime = () => {
  // 校验并限制输入值
  endHours.value = validateHours(endHours.value);
  endMinutes.value = validateMinutes(endMinutes.value);
  endSeconds.value = validateSeconds(endSeconds.value);

  if (isRangeMode.value && rangeEnd.value) {
    const newDate = new Date(rangeEnd.value);
    newDate.setHours(endHours.value);
    newDate.setMinutes(endMinutes.value);
    newDate.setSeconds(endSeconds.value);
    rangeEnd.value = newDate;
  }
};

const selectDate = (date: Date) => {
  if (props.disabledDate && props.disabledDate(date)) return;

  if (isRangeMode.value) {
    // 范围选择模式
    if (!rangeStart.value || (rangeStart.value && rangeEnd.value)) {
      // 开始新的范围选择
      const newDate = new Date(date);
      newDate.setHours(hours.value || 0);
      newDate.setMinutes(minutes.value || 0);
      newDate.setSeconds(seconds.value || 0);
      rangeStart.value = newDate;
      rangeEnd.value = null;
      hoverDate.value = null;

      // 不自动关闭，等待选择结束日期
    } else {
      // 选择结束日期
      let startDate = rangeStart.value;
      let endDate = new Date(date);
      endDate.setHours(endHours.value || 23);
      endDate.setMinutes(endMinutes.value || 59);
      endDate.setSeconds(endSeconds.value || 59);

      if (endDate < startDate) {
        // 如果选择的日期早于开始日期，交换它们
        [startDate, endDate] = [endDate, startDate];
        rangeStart.value = startDate;
        rangeEnd.value = endDate;
      } else {
        rangeEnd.value = endDate;
      }

      // 只有在不显示时间选择器或用户点击确认时才发送值
      if (!props.showTime && props.type !== 'datetimerange') {
        emit('update:modelValue', [rangeStart.value, rangeEnd.value]);
        emit('change', [rangeStart.value, rangeEnd.value]);
        isOpen.value = false;
      }
    }
  } else {
    // 单日期选择模式
    const newDate = new Date(date);
    newDate.setHours(hours.value || 0);
    newDate.setMinutes(minutes.value || 0);
    newDate.setSeconds(seconds.value || 0);
    selectedDate.value = newDate;

    if (!props.showTime && props.type !== 'datetime') {
      emit('update:modelValue', newDate);
      emit('change', newDate);
      isOpen.value = false;
    }
  }
};

const selectToday = () => {
  const today = new Date();
  selectDate(today);
  currentDate.value = today;
};

const handleClick = () => {
  if (props.disabled || props.readonly) return;
  isOpen.value = !isOpen.value;
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleClear = () => {
  if (isRangeMode.value) {
    rangeStart.value = null;
    rangeEnd.value = null;
    hoverDate.value = null;
  } else {
    selectedDate.value = null;
  }
  emit('update:modelValue', null);
  emit('change', null);
  emit('clear');
};

const handleConfirm = () => {
  if (isRangeMode.value) {
    if (rangeStart.value && rangeEnd.value) {
      emit('update:modelValue', [rangeStart.value, rangeEnd.value]);
      emit('change', [rangeStart.value, rangeEnd.value]);
    }
  } else {
    if (selectedDate.value) {
      emit('update:modelValue', selectedDate.value);
      emit('change', selectedDate.value);
    }
  }
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (isRangeMode.value) {
      if (Array.isArray(newValue) && newValue.length === 2) {
        rangeStart.value = newValue[0];
        rangeEnd.value = newValue[1];
        if (newValue[0]) {
          currentDate.value = new Date(newValue[0]);
          hours.value = newValue[0].getHours();
          minutes.value = newValue[0].getMinutes();
          seconds.value = newValue[0].getSeconds();
        }
        if (newValue[1]) {
          endHours.value = newValue[1].getHours();
          endMinutes.value = newValue[1].getMinutes();
          endSeconds.value = newValue[1].getSeconds();
        }
      } else {
        rangeStart.value = null;
        rangeEnd.value = null;
      }
    } else {
      if (newValue instanceof Date) {
        selectedDate.value = newValue;
        currentDate.value = new Date(newValue);
        hours.value = newValue.getHours();
        minutes.value = newValue.getMinutes();
        seconds.value = newValue.getSeconds();
      } else {
        selectedDate.value = null;
      }
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 暴露的方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const getElement = () => {
  return pickerRef.value || null;
};

defineExpose<ExDateTimePickerExposed>({
  focus,
  blur,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExDateTimePicker.scss"></style>
