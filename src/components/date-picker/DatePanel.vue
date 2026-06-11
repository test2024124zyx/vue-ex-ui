<template>
  <div class="ex-date-panel">
    <!-- 头部导航 -->
    <div class="ex-date-panel__header">
      <div class="ex-date-panel__nav">
        <button
          type="button"
          class="ex-date-panel__nav-btn"
          @click="handlePrevYear"
        >
          <ex-icon name="double-left" />
        </button>
        <button
          v-if="showMonthNav"
          type="button"
          class="ex-date-panel__nav-btn"
          @click="handlePrevMonth"
        >
          <ex-icon name="left" />
        </button>
        
        <div class="ex-date-panel__title">
          <button
            v-if="showYearSelect"
            type="button"
            class="ex-date-panel__title-btn"
            @click="handleYearClick"
          >
            {{ currentYear }}年
          </button>
          <button
            v-if="showMonthSelect"
            type="button"
            class="ex-date-panel__title-btn"
            @click="handleMonthClick"
          >
            {{ getMonthName(currentMonth) }}
          </button>
        </div>
        
        <button
          v-if="showMonthNav"
          type="button"
          class="ex-date-panel__nav-btn"
          @click="handleNextMonth"
        >
          <ex-icon name="right" />
        </button>
        <button
          type="button"
          class="ex-date-panel__nav-btn"
          @click="handleNextYear"
        >
          <ex-icon name="double-right" />
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="ex-date-panel__content">
      <!-- 日期视图 -->
      <div
        v-if="currentView === 'date'"
        class="ex-date-panel__date-view"
      >
        <!-- 星期标题 -->
        <div class="ex-date-panel__weekdays">
          <div
            v-if="showWeekNumber"
            class="ex-date-panel__weekday ex-date-panel__weekday--week-number"
          >
            {{ t('datePicker.week') }}
          </div>
          <div
            v-for="weekday in weekdays"
            :key="weekday"
            class="ex-date-panel__weekday"
          >
            {{ weekday }}
          </div>
        </div>

        <!-- 日期网格 -->
        <div class="ex-date-panel__dates">
          <div
            v-for="(week, weekIndex) in calendar"
            :key="weekIndex"
            class="ex-date-panel__week"
          >
            <div
              v-if="showWeekNumber && week[0]"
              class="ex-date-panel__week-number"
            >
              {{ getWeekNumber(week[0]) }}
            </div>
            <div
              v-for="(date, dateIndex) in week"
              :key="dateIndex"
              :class="[
                'ex-date-panel__date',
                {
                  'is-today': isToday(date),
                  'is-selected': isSelected(date),
                  'is-in-range': isInRange(date),
                  'is-range-start': isRangeStart(date),
                  'is-range-end': isRangeEnd(date),
                  'is-other-month': !isSameMonth(date, currentDate),
                  'is-disabled': isDisabled(date),
                  'is-hover': isHover(date)
                }
              ]"
              @click="handleDateClick(date)"
              @mouseenter="handleDateHover(date)"
              @mouseleave="handleDateLeave"
            >
              {{ date.getDate() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 月份视图 -->
      <div
        v-else-if="currentView === 'month'"
        class="ex-date-panel__month-view"
      >
        <div class="ex-date-panel__months">
          <div
            v-for="(month, index) in months"
            :key="index"
            :class="[
              'ex-date-panel__month',
              {
                'is-selected': isMonthSelected(index),
                'is-disabled': isMonthDisabled(index)
              }
            ]"
            @click="handleMonthSelect(index)"
          >
            {{ month }}
          </div>
        </div>
      </div>

      <!-- 年份视图 -->
      <div
        v-else-if="currentView === 'year'"
        class="ex-date-panel__year-view"
      >
        <div class="ex-date-panel__years">
          <div
            v-for="year in years"
            :key="year"
            :class="[
              'ex-date-panel__year',
              {
                'is-selected': isYearSelected(year),
                'is-disabled': isYearDisabled(year)
              }
            ]"
            @click="handleYearSelect(year)"
          >
            {{ year }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DatePanelProps } from './types'
import { dateUtils, generateCalendar, getYearRange } from './utils'
import ExIcon from '../icon/ExIcon.vue'

defineOptions({
  name: 'DatePanel'
})

const props = withDefaults(defineProps<DatePanelProps>(), {
  type: 'date',
  firstDayOfWeek: 0,
  locale: 'zh'
})

const emit = defineEmits<{
  select: [date: Date | Date[]]
  change: [date: Date, mode: string]
}>()

const { t } = useI18n()

// 状态
const currentDate = ref(new Date())
const currentView = ref<'date' | 'month' | 'year'>('date')
const hoverDate = ref<Date | null>(null)
const rangeStart = ref<Date | null>(null)
const rangeEnd = ref<Date | null>(null)

// 计算属性
const isRange = computed(() => props.type.includes('range'))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const showMonthNav = computed(() => currentView.value === 'date')
const showYearSelect = computed(() => currentView.value === 'date' || currentView.value === 'month')
const showMonthSelect = computed(() => currentView.value === 'date')

// 星期标题
const weekdays = computed(() => {
  const days = props.locale === 'zh' 
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  // 根据一周开始日调整顺序
  const start = props.firstDayOfWeek
  return [...days.slice(start), ...days.slice(0, start)]
})

// 日历数据
const calendar = computed(() => {
  const cal = generateCalendar(currentYear.value, currentMonth.value)
  
  // 根据一周开始日调整
  if (props.firstDayOfWeek !== 0) {
    return cal.map(week => {
      const adjustedWeek = [...week]
      // 这里需要根据firstDayOfWeek调整每周的开始日
      return adjustedWeek
    })
  }
  
  return cal
})

// 月份列表
const months = computed(() => {
  if (props.locale === 'zh') {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
})

// 年份列表
const years = computed(() => {
  return getYearRange(currentYear.value, 12)
})

// 方法
const getMonthName = (month: number) => {
  return months.value[month]
}

const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}

const isToday = (date: Date) => {
  const today = new Date()
  return dateUtils.isSame(date, today, 'day')
}

const isSelected = (date: Date) => {
  if (!props.value) return false
  
  if (isRange.value) {
    const range = props.value as Date[]
    return range.some(d => d && dateUtils.isSame(date, d, 'day'))
  }
  
  const value = props.value as Date
  return dateUtils.isSame(date, value, 'day')
}

const isInRange = (date: Date) => {
  if (!isRange.value || !rangeStart.value || !rangeEnd.value) return false
  
  return dateUtils.isAfter(date, rangeStart.value) && dateUtils.isBefore(date, rangeEnd.value)
}

const isRangeStart = (date: Date) => {
  return rangeStart.value && dateUtils.isSame(date, rangeStart.value, 'day')
}

const isRangeEnd = (date: Date) => {
  return rangeEnd.value && dateUtils.isSame(date, rangeEnd.value, 'day')
}

const isSameMonth = (date: Date, compareDate: Date) => {
  return dateUtils.isSame(date, compareDate, 'month')
}

const isDisabled = (date: Date) => {
  return props.disabledDate ? props.disabledDate(date) : false
}

const isHover = (date: Date) => {
  return hoverDate.value && dateUtils.isSame(date, hoverDate.value, 'day')
}

const isMonthSelected = (month: number) => {
  if (!props.value) return false
  
  const value = Array.isArray(props.value) ? props.value[0] : props.value
  return value && value.getMonth() === month && value.getFullYear() === currentYear.value
}

const isMonthDisabled = (month: number) => {
  if (!props.disabledDate) return false
  
  const date = new Date(currentYear.value, month, 1)
  return props.disabledDate(date)
}

const isYearSelected = (year: number) => {
  if (!props.value) return false
  
  const value = Array.isArray(props.value) ? props.value[0] : props.value
  return value && value.getFullYear() === year
}

const isYearDisabled = (year: number) => {
  if (!props.disabledDate) return false
  
  const date = new Date(year, 0, 1)
  return props.disabledDate(date)
}

// 事件处理
const handlePrevYear = () => {
  currentDate.value = dateUtils.subtract(currentDate.value, 1, 'year')
  emit('change', currentDate.value, 'year')
}

const handleNextYear = () => {
  currentDate.value = dateUtils.add(currentDate.value, 1, 'year')
  emit('change', currentDate.value, 'year')
}

const handlePrevMonth = () => {
  currentDate.value = dateUtils.subtract(currentDate.value, 1, 'month')
  emit('change', currentDate.value, 'month')
}

const handleNextMonth = () => {
  currentDate.value = dateUtils.add(currentDate.value, 1, 'month')
  emit('change', currentDate.value, 'month')
}

const handleYearClick = () => {
  currentView.value = 'year'
}

const handleMonthClick = () => {
  currentView.value = 'month'
}

const handleDateClick = (date: Date) => {
  if (isDisabled(date)) return
  
  if (isRange.value) {
    if (!rangeStart.value || (rangeStart.value && rangeEnd.value)) {
      // 开始新的范围选择
      rangeStart.value = date
      rangeEnd.value = null
    } else {
      // 完成范围选择
      if (dateUtils.isBefore(date, rangeStart.value)) {
        rangeEnd.value = rangeStart.value
        rangeStart.value = date
      } else {
        rangeEnd.value = date
      }
      
      emit('select', [rangeStart.value, rangeEnd.value])
    }
  } else {
    emit('select', date)
  }
}

const handleDateHover = (date: Date) => {
  if (isRange.value && rangeStart.value && !rangeEnd.value) {
    hoverDate.value = date
  }
}

const handleDateLeave = () => {
  hoverDate.value = null
}

const handleMonthSelect = (month: number) => {
  if (isMonthDisabled(month)) return
  
  const newDate = new Date(currentYear.value, month, 1)
  
  if (props.type === 'month') {
    emit('select', newDate)
  } else {
    currentDate.value = newDate
    currentView.value = 'date'
    emit('change', currentDate.value, 'month')
  }
}

const handleYearSelect = (year: number) => {
  if (isYearDisabled(year)) return
  
  const newDate = new Date(year, currentMonth.value, 1)
  
  if (props.type === 'year') {
    emit('select', newDate)
  } else {
    currentDate.value = newDate
    currentView.value = currentView.value === 'year' ? 'month' : 'date'
    emit('change', currentDate.value, 'year')
  }
}

// 初始化
const initializePanel = () => {
  if (props.value) {
    const value = Array.isArray(props.value) ? props.value[0] : props.value
    if (value) {
      currentDate.value = new Date(value)
    }
    
    if (isRange.value && Array.isArray(props.value)) {
      rangeStart.value = props.value[0] || null
      rangeEnd.value = props.value[1] || null
    }
  }
  
  // 根据类型设置视图
  switch (props.type) {
    case 'year':
      currentView.value = 'year'
      break
    case 'month':
      currentView.value = 'month'
      break
    default:
      currentView.value = 'date'
  }
}

// 监听
watch(() => props.value, initializePanel, { immediate: true })
watch(() => props.type, initializePanel)
</script>