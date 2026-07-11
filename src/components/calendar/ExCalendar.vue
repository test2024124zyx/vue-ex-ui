<template>
  <div ref="calendarRef" :class="calendarClasses" :style="calendarStyles" :aria-label="ariaLabel">
    <!-- 日历头部 -->
    <div class="ex-calendar__header">
      <div class="ex-calendar__nav">
        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="t('calendar.prevYear')"
          @click="prevYear"
        >
          <ExIcon icon="arrow-left-double-line" :size="20" aria-hidden="true" />
        </button>
        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="prevPeriodLabel"
          @click="prevPeriod"
        >
          <ExIcon icon="arrow-left-s-line" :size="20" aria-hidden="true" />
        </button>

        <div class="ex-calendar__current">
          <span class="ex-calendar__year">
            {{ t('calendar.yearFormat', { year: currentYear }) }}
          </span>
          <span v-if="activeMode !== 'year'" class="ex-calendar__month">
            {{ t('calendar.monthFormat', { month: currentMonth }) }}
          </span>
          <span v-if="activeMode === 'day'" class="ex-calendar__day">
            {{ t('calendar.dayFormat', { day: currentDay }) }}
          </span>
          <span v-if="activeMode === 'week'" class="ex-calendar__week">
            {{ t('calendar.weekFormat', { week: currentWeek }) }}
          </span>
        </div>

        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="nextPeriodLabel"
          @click="nextPeriod"
        >
          <ExIcon icon="arrow-right-s-line" :size="20" aria-hidden="true" />
        </button>
        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="t('calendar.nextYear')"
          @click="nextYear"
        >
          <ExIcon icon="arrow-right-double-line" :size="20" aria-hidden="true" />
        </button>
      </div>

      <div class="ex-calendar__actions">
        <div class="ex-calendar__mode-switch">
          <button
            v-for="m in modes"
            :key="m.value"
            :class="[
              'ex-calendar__mode-btn',
              { 'ex-calendar__mode-btn--active': activeMode === m.value },
            ]"
            type="button"
            @click="changeMode(m.value)"
          >
            {{ m.label }}
          </button>
        </div>

        <button v-if="showToday" class="ex-calendar__today-btn" type="button" @click="goToday">
          {{ t('common.today') }}
        </button>
      </div>
    </div>

    <!-- 日视图 -->
    <div v-if="activeMode === 'day'" class="ex-calendar__day-view">
      <div class="ex-calendar__day-header">
        <div class="ex-calendar__day-title">
          <span class="ex-calendar__day-weekday">{{ currentWeekday }}</span>
          <span v-if="currentHoliday" class="ex-calendar__day-holiday">{{ currentHoliday }}</span>
          <span v-else-if="currentSolarTerm" class="ex-calendar__day-solar-term">
            {{ currentSolarTerm }}
          </span>
          <span v-else-if="showLunar && currentLunar" class="ex-calendar__day-lunar">
            {{ currentLunar }}
          </span>
        </div>
      </div>

      <div class="ex-calendar__day-content">
        <div v-if="dayEvents.length > 0" class="ex-calendar__day-events">
          <div
            v-for="event in dayEvents"
            :key="event.id"
            :class="[
              'ex-calendar__day-event',
              `ex-calendar__day-event--${event.type || 'primary'}`,
            ]"
            @click="handleEventClick(event, currentDate)"
          >
            <div class="ex-calendar__day-event-header">
              <span class="ex-calendar__day-event-title">{{ event.title }}</span>
            </div>
            <div v-if="event.description" class="ex-calendar__day-event-description">
              {{ event.description }}
            </div>
          </div>
        </div>
        <div v-else class="ex-calendar__day-empty">
          {{ t('calendar.noEvents') }}
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-else-if="activeMode === 'week'" class="ex-calendar__week-view">
      <div class="ex-calendar__weekdays">
        <div v-for="day in weekdays" :key="day" class="ex-calendar__weekday">
          {{ day }}
        </div>
      </div>

      <div class="ex-calendar__week-body">
        <div
          v-for="cell in weekCells"
          :key="cell.date.getTime()"
          :class="getCellClasses(cell)"
          role="button"
          :tabindex="cell.disabled ? -1 : 0"
          :aria-selected="isDateSelected(cell.date)"
          :aria-disabled="cell.disabled"
          @click="handleDateClick(cell)"
          @keydown="handleCellKeydown(cell, $event)"
        >
          <div class="ex-calendar__date-content">
            <div class="ex-calendar__date-info">
              <span class="ex-calendar__date-number">{{ cell.day }}</span>
              <span v-if="cell.holiday" class="ex-calendar__holiday">{{ cell.holiday }}</span>
              <span v-else-if="cell.solarTerm" class="ex-calendar__solar-term">
                {{ cell.solarTerm }}
              </span>
              <span v-else-if="showLunar && cell.lunar" class="ex-calendar__lunar">
                {{ cell.lunar }}
              </span>
            </div>

            <div v-if="cell.checkedIn" class="ex-calendar__check-in">
              <ExIcon icon="checkbox-circle-fill" :size="16" aria-hidden="true" />
            </div>
          </div>

          <div v-if="cell.events.length > 0" class="ex-calendar__events">
            <div
              v-for="event in cell.events.slice(0, 2)"
              :key="event.id"
              :class="['ex-calendar__event', `ex-calendar__event--${event.type || 'primary'}`]"
              @click.stop="handleEventClick(event, cell.date)"
            >
              <span class="ex-calendar__event-dot" />
              <span class="ex-calendar__event-title">{{ event.title }}</span>
            </div>
            <div v-if="cell.events.length > 2" class="ex-calendar__event-more">
              +{{ cell.events.length - 2 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月视图 -->
    <div v-else-if="activeMode === 'month'" class="ex-calendar__month-view">
      <div class="ex-calendar__weekdays">
        <div v-for="day in weekdays" :key="day" class="ex-calendar__weekday">
          {{ day }}
        </div>
      </div>

      <div class="ex-calendar__body">
        <div
          v-for="cell in calendarCells"
          :key="cell.date.getTime()"
          :class="getCellClasses(cell)"
          role="button"
          :tabindex="cell.disabled ? -1 : 0"
          :aria-selected="isDateSelected(cell.date)"
          :aria-disabled="cell.disabled"
          @click="handleDateClick(cell)"
          @keydown="handleCellKeydown(cell, $event)"
        >
          <div class="ex-calendar__date-content">
            <div class="ex-calendar__date-info">
              <span class="ex-calendar__date-number">{{ cell.day }}</span>
              <span v-if="cell.holiday" class="ex-calendar__holiday">{{ cell.holiday }}</span>
              <span v-else-if="cell.solarTerm" class="ex-calendar__solar-term">
                {{ cell.solarTerm }}
              </span>
              <span v-else-if="showLunar && cell.lunar" class="ex-calendar__lunar">
                {{ cell.lunar }}
              </span>
            </div>

            <div v-if="cell.checkedIn" class="ex-calendar__check-in">
              <ExIcon icon="checkbox-circle-fill" :size="16" aria-hidden="true" />
            </div>
          </div>

          <div v-if="cell.events.length > 0" class="ex-calendar__events">
            <div
              v-for="event in cell.events.slice(0, 3)"
              :key="event.id"
              :class="['ex-calendar__event', `ex-calendar__event--${event.type || 'primary'}`]"
              @click.stop="handleEventClick(event, cell.date)"
            >
              <span class="ex-calendar__event-dot" />
              <span class="ex-calendar__event-title">{{ event.title }}</span>
            </div>
            <div v-if="cell.events.length > 3" class="ex-calendar__event-more">
              +{{ cell.events.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 年视图 -->
    <div v-else class="ex-calendar__year-view">
      <div class="ex-calendar__year-grid">
        <div
          v-for="month in 12"
          :key="month"
          class="ex-calendar__year-month"
          @click="selectMonth(month)"
        >
          <div class="ex-calendar__year-month-title">
            {{ t('calendar.monthFormat', { month }) }}
          </div>
          <div class="ex-calendar__year-month-preview">
            <div class="ex-calendar__year-weekdays">
              <span v-for="day in weekdays" :key="day">
                {{ day }}
              </span>
            </div>
            <div class="ex-calendar__year-days">
              <span
                v-for="(day, index) in getMonthDays(month)"
                :key="index"
                :class="['ex-calendar__year-day', { 'ex-calendar__year-day--today': day.isToday }]"
              >
                {{ day.day || '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, shallowRef, onMounted } from 'vue';
// lunar-javascript 为可选依赖，运行时按需动态加载（仅在开启农历/节气时），
// 未安装时静默降级——不显示农历与节气，组件其余功能不受影响。
import { useI18n } from '../../locale';
import { parseLocalDate, setMonthClamped, setYearClamped } from '../../utils/date';
import type {
  ExCalendarProps,
  ExCalendarEmits,
  ExCalendarExposed,
  CalendarDateCell,
  CalendarEvent,
  CalendarMode,
} from './types';

defineOptions({
  name: 'ExCalendar',
});

const props = withDefaults(defineProps<ExCalendarProps>(), {
  mode: 'month',
  events: () => [],
  showToday: true,
  fullscreen: false,
  checkedInDates: () => [],
  showLunar: false,
  showSolarTerm: true,
  holidays: () => [],
});

const emit = defineEmits<ExCalendarEmits>();

const { t } = useI18n();

// 按需加载 lunar-javascript（可选依赖）。加载完成后写入响应式 ref，
// 依赖它的 computed（农历/节气、日历单元格）会自动重新计算。
type LunarModule = typeof import('lunar-javascript');
const lunarLib = shallowRef<LunarModule | null>(null);
let lunarLoading = false;
const ensureLunarLib = async () => {
  if (lunarLib.value || lunarLoading) return;
  if (!props.showLunar && !props.showSolarTerm) return;
  lunarLoading = true;
  try {
    lunarLib.value = await import('lunar-javascript');
  } catch (_error) {
    // 未安装 lunar-javascript 时静默降级
  } finally {
    lunarLoading = false;
  }
};
onMounted(ensureLunarLib);
watch(() => [props.showLunar, props.showSolarTerm], ensureLunarLib);

const calendarRef = ref<HTMLDivElement>();
const currentDate = ref(new Date());
const internalSelectedDate = ref<Date | null>(null);

// undefined 表示非受控；null 是受控的明确清空值。单元格计算直接读取数据源，
// 避免通过额外版本号驱动视图，确保受控值变化能可靠触发模板更新。
const getSelectedTimestamp = (): number | null => {
  const selected = props.modelValue === undefined ? internalSelectedDate.value : props.modelValue;
  if (!selected) return null;

  const normalized = new Date(selected);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};
// 内部视图模式：初始化自 props.mode，支持 v-model:mode；外部不接管时按钮也能切换
const activeMode = ref<CalendarMode>(props.mode);
watch(
  () => props.mode,
  m => {
    activeMode.value = m;
  }
);

// 视图模式选项
const modes = computed(() => [
  { value: 'day' as CalendarMode, label: t('calendar.modeDay') },
  { value: 'week' as CalendarMode, label: t('calendar.modeWeek') },
  { value: 'month' as CalendarMode, label: t('calendar.modeMonth') },
  { value: 'year' as CalendarMode, label: t('calendar.modeYear') },
]);

// 星期标题
const weekdays = computed(() => t('calendar.weekdaysShort').split(','));

// 上/下一周期的无障碍标签
const prevPeriodLabel = computed(() => {
  if (activeMode.value === 'day') return t('calendar.prevDay');
  if (activeMode.value === 'week') return t('calendar.prevWeek');
  return t('calendar.prevMonth');
});

const nextPeriodLabel = computed(() => {
  if (activeMode.value === 'day') return t('calendar.nextDay');
  if (activeMode.value === 'week') return t('calendar.nextWeek');
  return t('calendar.nextMonth');
});

// 计算属性
const calendarClasses = computed(() => {
  const classes = ['ex-calendar', `ex-calendar--${activeMode.value}`];

  if (props.fullscreen) classes.push('ex-calendar--fullscreen');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const calendarStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const currentDay = computed(() => currentDate.value.getDate());
const currentWeekday = computed(() => weekdays.value[currentDate.value.getDay()]);

// 计算当前周数
const currentWeek = computed(() => {
  const date = new Date(currentDate.value);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
});

// 当前日期的农历
const currentLunar = computed(() => {
  if (!props.showLunar) return '';
  return getLunarDate(currentDate.value);
});

// 当前日期的节气
const currentSolarTerm = computed(() => {
  if (!props.showSolarTerm) return '';
  return getSolarTerm(currentDate.value);
});

// 当前日期的节假日
const currentHoliday = computed(() => {
  return getHoliday(currentDate.value);
});

const getDayTimestamp = (value: Date | string): number | null => {
  const date = parseLocalDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

// 日视图的事件
const dayEvents = computed(() => {
  const date = new Date(currentDate.value);
  date.setHours(0, 0, 0, 0);
  return props.events.filter(event => {
    return getDayTimestamp(event.date) === date.getTime();
  });
});

// 周视图的单元格
const weekCells = computed(() => {
  const cells: CalendarDateCell[] = [];
  const date = new Date(currentDate.value);
  const dayOfWeek = date.getDay();

  // 获取本周的第一天（周日）
  const firstDay = new Date(date);
  firstDay.setDate(date.getDate() - dayOfWeek);

  // 生成本周7天
  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(firstDay);
    cellDate.setDate(firstDay.getDate() + i);
    cells.push(createCell(cellDate, cellDate.getDate(), true));
  }

  return cells;
});

// 月视图的单元格数据
const calendarCells = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstDayWeek = firstDay.getDay();

  const lastDay = new Date(year, month + 1, 0);
  const lastDayDate = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: CalendarDateCell[] = [];

  // 上月日期
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    cells.push(createCell(date, day, false));
  }

  // 当月日期
  for (let day = 1; day <= lastDayDate; day++) {
    const date = new Date(year, month, day);
    cells.push(createCell(date, day, true));
  }

  // 下月日期
  const remainingDays = 42 - cells.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    cells.push(createCell(date, day, false));
  }

  return cells;
});

// 使用 lunar-javascript 库进行农历转换（库未加载时返回空字符串）
const getLunarDate = (date: Date): string => {
  const SolarCls = lunarLib.value?.Solar;
  if (!SolarCls) return '';
  try {
    const solar = SolarCls.fromDate(date);
    const lunar = solar.getLunar();

    // 如果是初一，显示月份
    if (lunar.getDay() === 1) {
      return lunar.getMonthInChinese() + '月';
    }

    // 显示日期
    return lunar.getDayInChinese();
  } catch (_error) {
    // 静默处理农历转换失败
    return '';
  }
};

// 获取节气（库未加载时返回空字符串）
const getSolarTerm = (date: Date): string => {
  const SolarCls = lunarLib.value?.Solar;
  if (!SolarCls) return '';
  try {
    const solar = SolarCls.fromDate(date);
    const lunar = solar.getLunar();
    const jieQi = lunar.getJieQi();

    return jieQi || '';
  } catch (_error) {
    // 静默处理节气获取失败
    return '';
  }
};

// 获取节假日
const getHoliday = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // 查找自定义节假日
  const holiday = props.holidays.find(h => h.date === dateStr);
  if (holiday) {
    return holiday.name;
  }

  // 获取农历节日（库未加载时跳过）
  const SolarCls = lunarLib.value?.Solar;
  if (!SolarCls) return '';
  try {
    const solar = SolarCls.fromDate(date);
    const lunar = solar.getLunar();
    const festivals = lunar.getFestivals();

    // 返回第一个节日，如果存在的话
    if (festivals.length > 0 && festivals[0]) {
      return festivals[0];
    }
  } catch (_error) {
    // 静默处理节日获取失败
  }

  return '';
};

// 创建单元格数据
const createCell = (date: Date, day: number, isCurrentMonth: boolean): CalendarDateCell => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);
  const dateTime = cellDate.getTime();

  const isToday = dateTime === today.getTime();
  // 获取该日期的事件
  const dateEvents = props.events.filter(event => {
    return getDayTimestamp(event.date) === dateTime;
  });

  // 检查是否签到
  const checkedIn = props.checkedInDates.some(checkedDate => {
    return getDayTimestamp(checkedDate) === dateTime;
  });

  // 获取节假日
  const holiday = getHoliday(date);

  // 获取节气
  const solarTerm = props.showSolarTerm ? getSolarTerm(date) : undefined;

  // 获取农历日期
  const lunar = props.showLunar ? getLunarDate(date) : undefined;

  return {
    date,
    day,
    isCurrentMonth,
    isToday,
    disabled: props.disabledDate ? props.disabledDate(date) : false,
    events: dateEvents,
    checkedIn,
    holiday,
    solarTerm,
    lunar,
  };
};

// 获取年视图中某月的日期
const getMonthDays = (month: number) => {
  const year = currentDate.value.getFullYear();
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayWeek = firstDay.getDay();
  const lastDayDate = lastDay.getDate();

  const days: Array<{ day: number | null; isToday: boolean }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 填充空白
  for (let i = 0; i < firstDayWeek; i++) {
    days.push({ day: null, isToday: false });
  }

  // 填充日期
  for (let day = 1; day <= lastDayDate; day++) {
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    days.push({ day, isToday: date.getTime() === today.getTime() });
  }

  return days;
};

// 获取单元格样式类
const isDateSelected = (date: Date): boolean => {
  const selectedTime = getSelectedTimestamp();
  if (selectedTime === null) return false;

  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime() === selectedTime;
};

const getCellClasses = (cell: CalendarDateCell) => {
  const classes = ['ex-calendar__cell'];

  if (!cell.isCurrentMonth) classes.push('ex-calendar__cell--other-month');
  if (cell.isToday) classes.push('ex-calendar__cell--today');
  if (cell.disabled) classes.push('ex-calendar__cell--disabled');
  if (cell.checkedIn) classes.push('ex-calendar__cell--checked-in');
  if (cell.events.length > 0) classes.push('ex-calendar__cell--has-events');
  if (cell.holiday) classes.push('ex-calendar__cell--holiday');
  if (cell.solarTerm) classes.push('ex-calendar__cell--solar-term');

  return classes;
};

// 方法
const handleDateClick = (cell: CalendarDateCell) => {
  if (cell.disabled) return;

  internalSelectedDate.value = new Date(cell.date);
  currentDate.value = new Date(cell.date);
  emit('update:modelValue', cell.date);
  emit('select', cell.date, cell);
  emit('date-click', cell.date, cell);
};

const handleEventClick = (event: CalendarEvent, date: Date) => {
  emit('event-click', event, date);
};

// 日期格键盘支持（Enter/Space 选择）
const handleCellKeydown = (cell: CalendarDateCell, event: KeyboardEvent) => {
  if (cell.disabled) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleDateClick(cell);
  }
};

const selectDate = (date: Date) => {
  internalSelectedDate.value = new Date(date);
  currentDate.value = new Date(date);
  emit('update:modelValue', date);
};

const goToday = () => {
  const today = new Date();
  currentDate.value = today;
  internalSelectedDate.value = today;
  emit('update:modelValue', today);
};

const changeMode = (newMode: CalendarMode) => {
  activeMode.value = newMode;
  emit('update:mode', newMode);
  emit('mode-change', newMode);
};

const prevPeriod = () => {
  const newDate = new Date(currentDate.value);

  switch (activeMode.value) {
    case 'day':
      newDate.setDate(newDate.getDate() - 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() - 7);
      break;
    case 'month':
      currentDate.value = setMonthClamped(newDate, newDate.getMonth() - 1);
      emit('month-change', currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
      return;
    case 'year':
      currentDate.value = setYearClamped(newDate, newDate.getFullYear() - 1);
      emit('year-change', currentDate.value.getFullYear());
      return;
  }

  currentDate.value = newDate;
};

const nextPeriod = () => {
  const newDate = new Date(currentDate.value);

  switch (activeMode.value) {
    case 'day':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'month':
      currentDate.value = setMonthClamped(newDate, newDate.getMonth() + 1);
      emit('month-change', currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
      return;
    case 'year':
      currentDate.value = setYearClamped(newDate, newDate.getFullYear() + 1);
      emit('year-change', currentDate.value.getFullYear());
      return;
  }

  currentDate.value = newDate;
};

const selectMonth = (month: number) => {
  currentDate.value = setMonthClamped(currentDate.value, month - 1);
  changeMode('month');
};

const prevMonth = () => {
  currentDate.value = setMonthClamped(currentDate.value, currentDate.value.getMonth() - 1);
  emit('month-change', currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
};

const nextMonth = () => {
  currentDate.value = setMonthClamped(currentDate.value, currentDate.value.getMonth() + 1);
  emit('month-change', currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
};

const prevYear = () => {
  currentDate.value = setYearClamped(currentDate.value, currentDate.value.getFullYear() - 1);
  emit('year-change', currentDate.value.getFullYear());
};

const nextYear = () => {
  currentDate.value = setYearClamped(currentDate.value, currentDate.value.getFullYear() + 1);
  emit('year-change', currentDate.value.getFullYear());
};

const getElement = () => {
  return calendarRef.value || null;
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue instanceof Date) {
      currentDate.value = new Date(newValue);
    }
  },
  { immediate: true }
);

// 暴露的方法
defineExpose<ExCalendarExposed>({
  selectDate,
  goToday,
  prevMonth,
  nextMonth,
  prevYear,
  nextYear,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCalendar.scss"></style>
