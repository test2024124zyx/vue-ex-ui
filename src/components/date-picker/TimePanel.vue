<template>
  <div class="ex-time-panel">
    <div class="ex-time-panel__content">
      <!-- 小时列 -->
      <div class="ex-time-panel__column">
        <div class="ex-time-panel__header">
          {{ t('datePicker.hour') }}
        </div>
        <div ref="hourListRef" class="ex-time-panel__list">
          <div
            v-for="hour in hours"
            :key="hour"
            :class="[
              'ex-time-panel__item',
              {
                'is-selected': selectedHour === hour,
                'is-disabled': isHourDisabled(hour),
              },
            ]"
            @click="handleHourClick(hour)"
          >
            {{ formatTimeUnit(hour) }}
          </div>
        </div>
      </div>

      <!-- 分钟列 -->
      <div class="ex-time-panel__column">
        <div class="ex-time-panel__header">
          {{ t('datePicker.minute') }}
        </div>
        <div ref="minuteListRef" class="ex-time-panel__list">
          <div
            v-for="minute in minutes"
            :key="minute"
            :class="[
              'ex-time-panel__item',
              {
                'is-selected': selectedMinute === minute,
                'is-disabled': isMinuteDisabled(minute),
              },
            ]"
            @click="handleMinuteClick(minute)"
          >
            {{ formatTimeUnit(minute) }}
          </div>
        </div>
      </div>

      <!-- 秒钟列 -->
      <div v-if="showSeconds" class="ex-time-panel__column">
        <div class="ex-time-panel__header">
          {{ t('datePicker.second') }}
        </div>
        <div ref="secondListRef" class="ex-time-panel__list">
          <div
            v-for="second in seconds"
            :key="second"
            :class="[
              'ex-time-panel__item',
              {
                'is-selected': selectedSecond === second,
                'is-disabled': isSecondDisabled(second),
              },
            ]"
            @click="handleSecondClick(second)"
          >
            {{ formatTimeUnit(second) }}
          </div>
        </div>
      </div>

      <!-- AM/PM 列 -->
      <div v-if="use12Hours" class="ex-time-panel__column">
        <div class="ex-time-panel__header">
          {{ t('datePicker.ampm') }}
        </div>
        <div class="ex-time-panel__list">
          <div
            :class="['ex-time-panel__item', { 'is-selected': selectedAmPm === 'AM' }]"
            @click="handleAmPmClick('AM')"
          >
            AM
          </div>
          <div
            :class="['ex-time-panel__item', { 'is-selected': selectedAmPm === 'PM' }]"
            @click="handleAmPmClick('PM')"
          >
            PM
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from '../../locale';
import type { TimePanelProps } from './types';
import { getHourRange, getMinuteRange, getSecondRange } from './utils';

defineOptions({
  name: 'TimePanel',
});

const props = withDefaults(defineProps<TimePanelProps>(), {
  format: 'HH:mm:ss',
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  use12Hours: false,
});

const emit = defineEmits<{
  select: [time: Date | Date[]];
}>();

const { t } = useI18n();

// 引用
const hourListRef = ref<HTMLElement>();
const minuteListRef = ref<HTMLElement>();
const secondListRef = ref<HTMLElement>();

// 状态
const selectedHour = ref(0);
const selectedMinute = ref(0);
const selectedSecond = ref(0);
const selectedAmPm = ref<'AM' | 'PM'>('AM');

// 计算属性
const showSeconds = computed(() => props.format.includes('s'));

const hours = computed(() => {
  const range = props.use12Hours ? 12 : 24;
  const hours = getHourRange().filter(h => h < range);
  return hours.filter((_, index) => index % props.hourStep === 0);
});

const minutes = computed(() => {
  return getMinuteRange(props.minuteStep);
});

const seconds = computed(() => {
  return getSecondRange(props.secondStep);
});

const currentTime = computed(() => {
  let hour = selectedHour.value;

  if (props.use12Hours) {
    if (selectedAmPm.value === 'PM' && hour !== 12) {
      hour += 12;
    } else if (selectedAmPm.value === 'AM' && hour === 12) {
      hour = 0;
    }
  }

  const date = new Date();
  date.setHours(hour, selectedMinute.value, selectedSecond.value, 0);
  return date;
});

// 方法
const formatTimeUnit = (value: number) => {
  return value.toString().padStart(2, '0');
};

const isHourDisabled = (hour: number) => {
  if (!props.disabledHours) return false;

  let actualHour = hour;
  if (props.use12Hours) {
    if (selectedAmPm.value === 'PM' && hour !== 12) {
      actualHour = hour + 12;
    } else if (selectedAmPm.value === 'AM' && hour === 12) {
      actualHour = 0;
    }
  }

  return props.disabledHours().includes(actualHour);
};

const isMinuteDisabled = (minute: number) => {
  if (!props.disabledMinutes) return false;
  return props.disabledMinutes(selectedHour.value).includes(minute);
};

const isSecondDisabled = (second: number) => {
  if (!props.disabledSeconds) return false;
  return props.disabledSeconds(selectedHour.value, selectedMinute.value).includes(second);
};

const scrollToSelected = (
  listRef: HTMLElement | undefined,
  selectedValue: number,
  step: number
) => {
  if (!listRef) return;

  nextTick(() => {
    const items = listRef.querySelectorAll('.ex-time-panel__item');
    const selectedIndex = Math.floor(selectedValue / step);
    const selectedItem = items[selectedIndex] as HTMLElement;

    if (selectedItem) {
      const listHeight = listRef.clientHeight;
      const itemHeight = selectedItem.offsetHeight;
      const scrollTop = selectedItem.offsetTop - (listHeight - itemHeight) / 2;

      listRef.scrollTop = Math.max(0, scrollTop);
    }
  });
};

const updateFromValue = () => {
  if (!props.value) return;

  const date = Array.isArray(props.value) ? props.value[0] : props.value;
  if (!date) return;

  let hour = date.getHours();

  if (props.use12Hours) {
    selectedAmPm.value = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) {
      hour = 12;
    } else if (hour > 12) {
      hour -= 12;
    }
  }

  selectedHour.value = hour;
  selectedMinute.value = date.getMinutes();
  selectedSecond.value = date.getSeconds();

  // 滚动到选中项
  scrollToSelected(hourListRef.value, selectedHour.value, props.hourStep);
  scrollToSelected(minuteListRef.value, selectedMinute.value, props.minuteStep);
  scrollToSelected(secondListRef.value, selectedSecond.value, props.secondStep);
};

const emitChange = () => {
  if (Array.isArray(props.value)) {
    // 范围时间选择的处理逻辑
    const range = [...props.value];
    range[0] = currentTime.value;
    emit('select', range);
  } else {
    emit('select', currentTime.value);
  }
};

// 事件处理
const handleHourClick = (hour: number) => {
  if (isHourDisabled(hour)) return;

  selectedHour.value = hour;
  emitChange();
};

const handleMinuteClick = (minute: number) => {
  if (isMinuteDisabled(minute)) return;

  selectedMinute.value = minute;
  emitChange();
};

const handleSecondClick = (second: number) => {
  if (isSecondDisabled(second)) return;

  selectedSecond.value = second;
  emitChange();
};

const handleAmPmClick = (ampm: 'AM' | 'PM') => {
  selectedAmPm.value = ampm;
  emitChange();
};

// 监听
watch(() => props.value, updateFromValue, { immediate: true });

// 生命周期
onMounted(() => {
  updateFromValue();
});
</script>
