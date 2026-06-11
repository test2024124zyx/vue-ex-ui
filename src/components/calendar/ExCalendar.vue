<template>
  <div
    ref="calendarRef"
    :class="calendarClasses"
    :style="calendarStyles"
    :aria-label="ariaLabel"
  >
    <!-- 日历头部 -->
    <div class="ex-calendar__header">
      <div class="ex-calendar__nav">
        <button
          class="ex-calendar__nav-btn"
          type="button"
          aria-label="上一年"
          @click="prevYear"
        >
          <img
            src="https://api.iconify.design/ri/arrow-left-double-line.svg"
            alt="prev year"
            width="20"
            height="20"
          >
        </button>
        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="mode === 'day' ? '上一天' : mode === 'week' ? '上一周' : '上个月'"
          @click="prevPeriod"
        >
          <img
            src="https://api.iconify.design/ri/arrow-left-s-line.svg"
            alt="prev"
            width="20"
            height="20"
          >
        </button>
        
        <div class="ex-calendar__current">
          <span class="ex-calendar__year">{{ currentYear }}年</span>
          <span
            v-if="mode !== 'year'"
            class="ex-calendar__month"
          >{{ currentMonth }}月</span>
          <span
            v-if="mode === 'day'"
            class="ex-calendar__day"
          >{{ currentDay }}日</span>
          <span
            v-if="mode === 'week'"
            class="ex-calendar__week"
          >第{{ currentWeek }}周</span>
        </div>
        
        <button
          class="ex-calendar__nav-btn"
          type="button"
          :aria-label="mode === 'day' ? '下一天' : mode === 'week' ? '下一周' : '下个月'"
          @click="nextPeriod"
        >
          <img
            src="https://api.iconify.design/ri/arrow-right-s-line.svg"
            alt="next"
            width="20"
            height="20"
          >
        </button>
        <button
          class="ex-calendar__nav-btn"
          type="button"
          aria-label="下一年"
          @click="nextYear"
        >
          <img
            src="https://api.iconify.design/ri/arrow-right-double-line.svg"
            alt="next year"
            width="20"
            height="20"
          >
        </button>
      </div>
      
      <div class="ex-calendar__actions">
        <div class="ex-calendar__mode-switch">
          <button
            v-for="m in modes"
            :key="m.value"
            :class="['ex-calendar__mode-btn', { 'ex-calendar__mode-btn--active': mode === m.value }]"
            type="button"
            @click="changeMode(m.value)"
          >
            {{ m.label }}
          </button>
        </div>
        
        <button
          v-if="showToday"
          class="ex-calendar__today-btn"
          type="button"
          @click="goToday"
        >
          今天
        </button>
      </div>
    </div>

    <!-- 日视图 -->
    <div
      v-if="mode === 'day'"
      class="ex-calendar__day-view"
    >
      <div class="ex-calendar__day-header">
        <div class="ex-calendar__day-title">
          <span class="ex-calendar__day-weekday">{{ currentWeekday }}</span>
          <span
            v-if="currentHoliday"
            class="ex-calendar__day-holiday"
          >{{ currentHoliday }}</span>
          <span
            v-else-if="currentSolarTerm"
            class="ex-calendar__day-solar-term"
          >{{ currentSolarTerm }}</span>
          <span
            v-else-if="showLunar && currentLunar"
            class="ex-calendar__day-lunar"
          >{{ currentLunar }}</span>
        </div>
      </div>
      
      <div class="ex-calendar__day-content">
        <div
          v-if="dayEvents.length > 0"
          class="ex-calendar__day-events"
        >
          <div
            v-for="event in dayEvents"
            :key="event.id"
            :class="['ex-calendar__day-event', `ex-calendar__day-event--${event.type || 'primary'}`]"
            @click="handleEventClick(event, currentDate)"
          >
            <div class="ex-calendar__day-event-header">
              <span class="ex-calendar__day-event-title">{{ event.title }}</span>
            </div>
            <div
              v-if="event.description"
              class="ex-calendar__day-event-description"
            >
              {{ event.description }}
            </div>
          </div>
        </div>
        <div
          v-else
          class="ex-calendar__day-empty"
        >
          暂无事件
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div
      v-else-if="mode === 'week'"
      class="ex-calendar__week-view"
    >
      <div class="ex-calendar__weekdays">
        <div
          v-for="day in weekdays"
          :key="day"
          class="ex-calendar__weekday"
        >
          {{ day }}
        </div>
      </div>
      
      <div class="ex-calendar__week-body">
        <div
          v-for="cell in weekCells"
          :key="cell.date.getTime()"
          :class="getCellClasses(cell)"
          @click="handleDateClick(cell)"
        >
          <div class="ex-calendar__date-content">
            <div class="ex-calendar__date-info">
              <span class="ex-calendar__date-number">{{ cell.day }}</span>
              <span
                v-if="cell.holiday"
                class="ex-calendar__holiday"
              >{{ cell.holiday }}</span>
              <span
                v-else-if="cell.solarTerm"
                class="ex-calendar__solar-term"
              >{{ cell.solarTerm }}</span>
              <span
                v-else-if="showLunar && cell.lunar"
                class="ex-calendar__lunar"
              >{{ cell.lunar }}</span>
            </div>
            
            <div
              v-if="cell.checkedIn"
              class="ex-calendar__check-in"
            >
              <img
                src="https://api.iconify.design/ri/checkbox-circle-fill.svg"
                alt="checked in"
                width="16"
                height="16"
              >
            </div>
          </div>
          
          <div
            v-if="cell.events.length > 0"
            class="ex-calendar__events"
          >
            <div
              v-for="event in cell.events.slice(0, 2)"
              :key="event.id"
              :class="['ex-calendar__event', `ex-calendar__event--${event.type || 'primary'}`]"
              @click.stop="handleEventClick(event, cell.date)"
            >
              <span class="ex-calendar__event-dot" />
              <span class="ex-calendar__event-title">{{ event.title }}</span>
            </div>
            <div
              v-if="cell.events.length > 2"
              class="ex-calendar__event-more"
            >
              +{{ cell.events.length - 2 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月视图 -->
    <div
      v-else-if="mode === 'month'"
      class="ex-calendar__month-view"
    >
      <div class="ex-calendar__weekdays">
        <div
          v-for="day in weekdays"
          :key="day"
          class="ex-calendar__weekday"
        >
          {{ day }}
        </div>
      </div>

      <div class="ex-calendar__body">
        <div
          v-for="cell in calendarCells"
          :key="cell.date.getTime()"
          :class="getCellClasses(cell)"
          @click="handleDateClick(cell)"
        >
          <div class="ex-calendar__date-content">
            <div class="ex-calendar__date-info">
              <span class="ex-calendar__date-number">{{ cell.day }}</span>
              <span
                v-if="cell.holiday"
                class="ex-calendar__holiday"
              >{{ cell.holiday }}</span>
              <span
                v-else-if="cell.solarTerm"
                class="ex-calendar__solar-term"
              >{{ cell.solarTerm }}</span>
              <span
                v-else-if="showLunar && cell.lunar"
                class="ex-calendar__lunar"
              >{{ cell.lunar }}</span>
            </div>
            
            <div
              v-if="cell.checkedIn"
              class="ex-calendar__check-in"
            >
              <img
                src="https://api.iconify.design/ri/checkbox-circle-fill.svg"
                alt="checked in"
                width="16"
                height="16"
              >
            </div>
          </div>
          
          <div
            v-if="cell.events.length > 0"
            class="ex-calendar__events"
          >
            <div
              v-for="event in cell.events.slice(0, 3)"
              :key="event.id"
              :class="['ex-calendar__event', `ex-calendar__event--${event.type || 'primary'}`]"
              @click.stop="handleEventClick(event, cell.date)"
            >
              <span class="ex-calendar__event-dot" />
              <span class="ex-calendar__event-title">{{ event.title }}</span>
            </div>
            <div
              v-if="cell.events.length > 3"
              class="ex-calendar__event-more"
            >
              +{{ cell.events.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 年视图 -->
    <div
      v-else
      class="ex-calendar__year-view"
    >
      <div class="ex-calendar__year-grid">
        <div
          v-for="month in 12"
          :key="month"
          class="ex-calendar__year-month"
          @click="selectMonth(month)"
        >
          <div class="ex-calendar__year-month-title">
            {{ month }}月
          </div>
          <div class="ex-calendar__year-month-preview">
            <div class="ex-calendar__year-weekdays">
              <span
                v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
                :key="day"
              >{{ day }}</span>
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
import { computed, ref, watch } from 'vue';
import { Solar } from 'lunar-javascript';
import type { ExCalendarProps, ExCalendarEmits, ExCalendarExposed, CalendarDateCell, CalendarEvent, CalendarMode } from './types';

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

const calendarRef = ref<HTMLDivElement>();
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);

// 视图模式选项
const modes = [
  { value: 'day' as CalendarMode, label: '日' },
  { value: 'week' as CalendarMode, label: '周' },
  { value: 'month' as CalendarMode, label: '月' },
  { value: 'year' as CalendarMode, label: '年' },
];

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算属性
const calendarClasses = computed(() => {
  const classes = ['ex-calendar', `ex-calendar--${props.mode}`];

  if (props.fullscreen) classes.push('ex-calendar--fullscreen');

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

const calendarStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);
const currentDay = computed(() => currentDate.value.getDate());
const currentWeekday = computed(() => weekdays[currentDate.value.getDay()]);

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

// 日视图的事件
const dayEvents = computed(() => {
  const date = new Date(currentDate.value);
  date.setHours(0, 0, 0, 0);
  return props.events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === date.getTime();
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

// 使用 lunar-javascript 库进行农历转换
const getLunarDate = (date: Date): string => {
  try {
    const solar = Solar.fromDate(date);
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

// 获取节气
const getSolarTerm = (date: Date): string => {
  try {
    const solar = Solar.fromDate(date);
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
  
  // 获取农历节日
  try {
    const solar = Solar.fromDate(date);
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
  const isSelected = selectedDate.value ? 
    dateTime === new Date(selectedDate.value).setHours(0, 0, 0, 0) : 
    false;
  
  // 获取该日期的事件
  const dateEvents = props.events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === dateTime;
  });
  
  // 检查是否签到
  const checkedIn = props.checkedInDates.some(checkedDate => {
    const checkDate = new Date(checkedDate);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === dateTime;
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
    isSelected,
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
const getCellClasses = (cell: CalendarDateCell) => {
  const classes = ['ex-calendar__cell'];
  
  if (!cell.isCurrentMonth) classes.push('ex-calendar__cell--other-month');
  if (cell.isToday) classes.push('ex-calendar__cell--today');
  if (cell.isSelected) classes.push('ex-calendar__cell--selected');
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
  
  selectedDate.value = cell.date;
  currentDate.value = new Date(cell.date);
  emit('update:modelValue', cell.date);
  emit('select', cell.date, cell);
  emit('date-click', cell.date, cell);
};

const handleEventClick = (event: CalendarEvent, date: Date) => {
  emit('event-click', event, date);
};

const selectDate = (date: Date) => {
  selectedDate.value = date;
  currentDate.value = new Date(date);
  emit('update:modelValue', date);
};

const goToday = () => {
  const today = new Date();
  currentDate.value = today;
  selectedDate.value = today;
  emit('update:modelValue', today);
};

const changeMode = (newMode: CalendarMode) => {
  emit('mode-change', newMode);
};

const prevPeriod = () => {
  const newDate = new Date(currentDate.value);
  
  switch (props.mode) {
  case 'day':
    newDate.setDate(newDate.getDate() - 1);
    break;
  case 'week':
    newDate.setDate(newDate.getDate() - 7);
    break;
  case 'month':
    newDate.setMonth(newDate.getMonth() - 1);
    emit('month-change', newDate.getFullYear(), newDate.getMonth() + 1);
    break;
  case 'year':
    newDate.setFullYear(newDate.getFullYear() - 1);
    emit('year-change', newDate.getFullYear());
    break;
  }
  
  currentDate.value = newDate;
};

const nextPeriod = () => {
  const newDate = new Date(currentDate.value);
  
  switch (props.mode) {
  case 'day':
    newDate.setDate(newDate.getDate() + 1);
    break;
  case 'week':
    newDate.setDate(newDate.getDate() + 7);
    break;
  case 'month':
    newDate.setMonth(newDate.getMonth() + 1);
    emit('month-change', newDate.getFullYear(), newDate.getMonth() + 1);
    break;
  case 'year':
    newDate.setFullYear(newDate.getFullYear() + 1);
    emit('year-change', newDate.getFullYear());
    break;
  }
  
  currentDate.value = newDate;
};

const selectMonth = (month: number) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(month - 1);
  currentDate.value = newDate;
  changeMode('month');
};

const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
  emit('month-change', newDate.getFullYear(), newDate.getMonth() + 1);
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
  emit('month-change', newDate.getFullYear(), newDate.getMonth() + 1);
};

const prevYear = () => {
  const newDate = new Date(currentDate.value);
  newDate.setFullYear(newDate.getFullYear() - 1);
  currentDate.value = newDate;
  emit('year-change', newDate.getFullYear());
};

const nextYear = () => {
  const newDate = new Date(currentDate.value);
  newDate.setFullYear(newDate.getFullYear() + 1);
  currentDate.value = newDate;
  emit('year-change', newDate.getFullYear());
};

const getElement = () => {
  return calendarRef.value || null;
};

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue instanceof Date) {
    selectedDate.value = newValue;
    currentDate.value = new Date(newValue);
  }
}, { immediate: true });

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
