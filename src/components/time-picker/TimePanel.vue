<template>
  <div class="ex-time-panel">
    <div class="ex-time-panel__content">
      <!-- 时间选择器 -->
      <div class="ex-time-panel__selectors">
        <!-- 小时选择 -->
        <div class="ex-time-panel__column">
          <div class="ex-time-panel__header">
            {{ t('timePicker.hour') }}
          </div>
          <div ref="hourScrollRef" class="ex-time-panel__list" @scroll="handleHourScroll">
            <div
              v-for="hour in hourOptions"
              :key="hour.value"
              class="ex-time-panel__item"
              :class="{
                'ex-time-panel__item--selected': hour.value === selectedHour,
                'ex-time-panel__item--disabled': hour.disabled,
              }"
              @click="selectHour(hour.value)"
            >
              {{ hour.label }}
            </div>
          </div>
        </div>

        <!-- 分钟选择 -->
        <div class="ex-time-panel__column">
          <div class="ex-time-panel__header">
            {{ t('timePicker.minute') }}
          </div>
          <div ref="minuteScrollRef" class="ex-time-panel__list" @scroll="handleMinuteScroll">
            <div
              v-for="minute in minuteOptions"
              :key="minute.value"
              class="ex-time-panel__item"
              :class="{
                'ex-time-panel__item--selected': minute.value === selectedMinute,
                'ex-time-panel__item--disabled': minute.disabled,
              }"
              @click="selectMinute(minute.value)"
            >
              {{ minute.label }}
            </div>
          </div>
        </div>

        <!-- 秒选择 -->
        <div v-if="showSeconds" class="ex-time-panel__column">
          <div class="ex-time-panel__header">
            {{ t('timePicker.second') }}
          </div>
          <div ref="secondScrollRef" class="ex-time-panel__list" @scroll="handleSecondScroll">
            <div
              v-for="second in secondOptions"
              :key="second.value"
              class="ex-time-panel__item"
              :class="{
                'ex-time-panel__item--selected': second.value === selectedSecond,
                'ex-time-panel__item--disabled': second.disabled,
              }"
              @click="selectSecond(second.value)"
            >
              {{ second.label }}
            </div>
          </div>
        </div>

        <!-- AM/PM 选择 -->
        <div v-if="use12Hours" class="ex-time-panel__column">
          <div class="ex-time-panel__header">
            {{ t('timePicker.period') }}
          </div>
          <div class="ex-time-panel__list">
            <div
              class="ex-time-panel__item"
              :class="{
                'ex-time-panel__item--selected': selectedPeriod === 'AM',
              }"
              @click="selectPeriod('AM')"
            >
              {{ t('timePicker.am') }}
            </div>
            <div
              class="ex-time-panel__item"
              :class="{
                'ex-time-panel__item--selected': selectedPeriod === 'PM',
              }"
              @click="selectPeriod('PM')"
            >
              {{ t('timePicker.pm') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="ex-time-panel__footer">
      <div class="ex-time-panel__actions">
        <button v-if="showNow" type="button" class="ex-time-panel__now-btn" @click="handleNow">
          {{ t('timePicker.now') }}
        </button>
        <button
          type="button"
          class="ex-time-panel__confirm-btn"
          :disabled="!isValidSelection"
          @click="handleConfirm"
        >
          {{ t('timePicker.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useI18n } from '../../locale';
import type { TimeStep, DisabledTime } from './types';
import { getCurrentTime, padZero, getHour12 } from './utils';

interface TimeOption {
  value: number;
  label: string;
  disabled: boolean;
}

interface Props {
  value?: Date | null;
  format?: string;
  step?: TimeStep;
  disabledTime?: DisabledTime;
  showNow?: boolean;
  use12Hours?: boolean;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  format: 'HH:mm:ss',
  step: () => ({ hour: 1, minute: 1, second: 1 }),
  disabledTime: undefined,
  showNow: true,
  use12Hours: false,
  visible: false,
});

const emit = defineEmits<{
  change: [time: Date];
  confirm: [];
  now: [];
}>();

const { t } = useI18n();

// 模板引用
const hourScrollRef = ref<HTMLElement>();
const minuteScrollRef = ref<HTMLElement>();
const secondScrollRef = ref<HTMLElement>();

// 响应式状态
const selectedHour = ref(0);
const selectedMinute = ref(0);
const selectedSecond = ref(0);
const selectedPeriod = ref<'AM' | 'PM'>('AM');

// 计算属性
const showSeconds = computed(() => {
  return props.format.includes('s');
});

const hourOptions = computed((): TimeOption[] => {
  const options: TimeOption[] = [];
  const maxHour = props.use12Hours ? 12 : 23;
  const minHour = props.use12Hours ? 1 : 0;

  for (let i = minHour; i <= maxHour; i += props.step.hour || 1) {
    const disabledTimeResult =
      props.disabledTime && typeof props.disabledTime === 'function'
        ? props.disabledTime(currentTime.value)
        : null;
    const disabled =
      (disabledTimeResult &&
        typeof disabledTimeResult === 'object' &&
        disabledTimeResult.disabledHours &&
        disabledTimeResult.disabledHours().includes(i)) ||
      false;
    options.push({
      value: i,
      label: padZero(i),
      disabled,
    });
  }

  return options;
});

const minuteOptions = computed((): TimeOption[] => {
  const options: TimeOption[] = [];

  for (let i = 0; i < 60; i += props.step.minute || 1) {
    const disabledTimeResult =
      props.disabledTime && typeof props.disabledTime === 'function'
        ? props.disabledTime(currentTime.value)
        : null;
    const disabled =
      (disabledTimeResult &&
        typeof disabledTimeResult === 'object' &&
        disabledTimeResult.disabledMinutes &&
        disabledTimeResult.disabledMinutes(selectedHour.value).includes(i)) ||
      false;
    options.push({
      value: i,
      label: padZero(i),
      disabled,
    });
  }

  return options;
});

const secondOptions = computed((): TimeOption[] => {
  const options: TimeOption[] = [];

  for (let i = 0; i < 60; i += props.step.second || 1) {
    const disabledTimeResult =
      props.disabledTime && typeof props.disabledTime === 'function'
        ? props.disabledTime(currentTime.value)
        : null;
    const disabled =
      (disabledTimeResult &&
        typeof disabledTimeResult === 'object' &&
        disabledTimeResult.disabledSeconds &&
        disabledTimeResult.disabledSeconds(selectedHour.value, selectedMinute.value).includes(i)) ||
      false;
    options.push({
      value: i,
      label: padZero(i),
      disabled,
    });
  }

  return options;
});

const isValidSelection = computed(() => {
  const hourOption = hourOptions.value.find(opt => opt.value === selectedHour.value);
  const minuteOption = minuteOptions.value.find(opt => opt.value === selectedMinute.value);
  const secondOption = secondOptions.value.find(opt => opt.value === selectedSecond.value);

  return !hourOption?.disabled && !minuteOption?.disabled && !secondOption?.disabled;
});

const currentTime = computed(() => {
  let hour = selectedHour.value;

  if (props.use12Hours) {
    if (selectedPeriod.value === 'PM' && hour !== 12) {
      hour += 12;
    } else if (selectedPeriod.value === 'AM' && hour === 12) {
      hour = 0;
    }
  }

  const time = new Date();
  time.setHours(hour, selectedMinute.value, selectedSecond.value, 0);
  return time;
});

// 监听器
watch(
  () => props.value,
  newValue => {
    if (newValue) {
      updateSelectedTime(newValue);
    } else {
      // 设置默认时间
      const now = getCurrentTime();
      updateSelectedTime(now);
    }
  },
  { immediate: true }
);

watch(
  () => props.visible,
  visible => {
    if (visible) {
      nextTick(() => {
        scrollToSelected();
      });
    }
  }
);

watch([selectedHour, selectedMinute, selectedSecond, selectedPeriod], () => {
  emit('change', currentTime.value);
});

// 更新选中时间
const updateSelectedTime = (time: Date) => {
  if (props.use12Hours) {
    const hour12 = getHour12(time.getHours());
    selectedHour.value = hour12.hour;
    selectedPeriod.value = hour12.period;
  } else {
    selectedHour.value = time.getHours();
  }

  selectedMinute.value = time.getMinutes();
  selectedSecond.value = time.getSeconds();
};

// 选择时间
const selectHour = (hour: number) => {
  const option = hourOptions.value.find(opt => opt.value === hour);
  if (option?.disabled) return;

  selectedHour.value = hour;
  scrollToItem(hourScrollRef.value, hour, hourOptions.value);
};

const selectMinute = (minute: number) => {
  const option = minuteOptions.value.find(opt => opt.value === minute);
  if (option?.disabled) return;

  selectedMinute.value = minute;
  scrollToItem(minuteScrollRef.value, minute, minuteOptions.value);
};

const selectSecond = (second: number) => {
  const option = secondOptions.value.find(opt => opt.value === second);
  if (option?.disabled) return;

  selectedSecond.value = second;
  scrollToItem(secondScrollRef.value, second, secondOptions.value);
};

const selectPeriod = (period: 'AM' | 'PM') => {
  selectedPeriod.value = period;
};

// 滚动处理
const handleHourScroll = () => {
  handleScroll(hourScrollRef.value, hourOptions.value, selectHour);
};

const handleMinuteScroll = () => {
  handleScroll(minuteScrollRef.value, minuteOptions.value, selectMinute);
};

const handleSecondScroll = () => {
  handleScroll(secondScrollRef.value, secondOptions.value, selectSecond);
};

const handleScroll = (
  scrollEl: HTMLElement | undefined,
  options: TimeOption[],
  selectFn: (value: number) => void
) => {
  if (!scrollEl) return;

  const itemHeight = 32; // 每个选项的高度
  const scrollTop = scrollEl.scrollTop;
  const index = Math.round(scrollTop / itemHeight);

  if (index >= 0 && index < options.length) {
    const option = options[index];
    // 检查选项是否存在且未禁用
    if (option && !option.disabled) {
      selectFn(option.value);
    }
  }
};

// 滚动到选中项
const scrollToSelected = () => {
  nextTick(() => {
    scrollToItem(hourScrollRef.value, selectedHour.value, hourOptions.value);
    scrollToItem(minuteScrollRef.value, selectedMinute.value, minuteOptions.value);
    if (showSeconds.value) {
      scrollToItem(secondScrollRef.value, selectedSecond.value, secondOptions.value);
    }
  });
};

const scrollToItem = (scrollEl: HTMLElement | undefined, value: number, options: TimeOption[]) => {
  if (!scrollEl) return;

  const index = options.findIndex(opt => opt.value === value);
  if (index >= 0) {
    const itemHeight = 32;
    scrollEl.scrollTop = index * itemHeight;
  }
};

// 事件处理
const handleNow = () => {
  const now = getCurrentTime();
  updateSelectedTime(now);
  emit('now');
  nextTick(() => {
    scrollToSelected();
  });
};

const handleConfirm = () => {
  if (isValidSelection.value) {
    emit('confirm');
  }
};

// 生命周期
onMounted(() => {
  if (props.visible) {
    scrollToSelected();
  }
});
</script>
