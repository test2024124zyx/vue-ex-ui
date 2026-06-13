<template>
  <div
    :class="[
      'ex-date-picker',
      `ex-date-picker--${size}`,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-clearable': clearable && !disabled && !readonly,
        'is-focused': focused,
        'has-error': !!errorMessage,
        'is-range': isRange,
      },
    ]"
  >
    <!-- 单个输入框 -->
    <div v-if="!isRange" class="ex-date-picker__input-wrapper" @click="handleInputClick">
      <input
        ref="inputRef"
        :value="displayValue"
        :placeholder="computedPlaceholder"
        :disabled="disabled"
        :readonly="readonly || !editable"
        class="ex-date-picker__input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      <span class="ex-date-picker__suffix">
        <ex-icon
          v-if="clearable && displayValue && !disabled && !readonly"
          name="close-circle"
          class="ex-date-picker__clear"
          @click.stop="handleClear"
        />
        <ex-icon :name="suffixIcon" class="ex-date-picker__icon" />
      </span>
    </div>

    <!-- 范围输入框 -->
    <div v-else class="ex-date-picker__range-wrapper" @click="handleInputClick">
      <input
        ref="startInputRef"
        :value="startDisplayValue"
        :placeholder="computedPlaceholder"
        :disabled="disabled"
        :readonly="readonly || !editable"
        class="ex-date-picker__input ex-date-picker__input--start"
        @input="handleStartInput"
        @blur="handleBlur"
        @focus="handleStartFocus"
        @keydown="handleKeydown"
      />
      <span class="ex-date-picker__separator">{{ rangeSeparator }}</span>
      <input
        ref="endInputRef"
        :value="endDisplayValue"
        :placeholder="computedEndPlaceholder"
        :disabled="disabled"
        :readonly="readonly || !editable"
        class="ex-date-picker__input ex-date-picker__input--end"
        @input="handleEndInput"
        @blur="handleBlur"
        @focus="handleEndFocus"
        @keydown="handleKeydown"
      />
      <span class="ex-date-picker__suffix">
        <ex-icon
          v-if="clearable && (startDisplayValue || endDisplayValue) && !disabled && !readonly"
          name="close-circle"
          class="ex-date-picker__clear"
          @click.stop="handleClear"
        />
        <ex-icon :name="suffixIcon" class="ex-date-picker__icon" />
      </span>
    </div>

    <!-- 弹出面板 -->
    <teleport to="body">
      <div
        v-if="visible"
        ref="popoverRef"
        :class="['ex-date-picker__popover', `ex-date-picker__popover--${popoverPlacement}`]"
        :style="popoverStyle"
      >
        <div class="ex-date-picker__panel">
          <!-- 日期面板 -->
          <date-panel
            v-if="showDatePanel"
            :value="Array.isArray(panelValue) ? panelValue[0] : panelValue"
            :type="
              type === 'datetime' || type === 'daterange' || type === 'datetimerange'
                ? 'date'
                : type
            "
            :disabled-date="disabledDate"
            :first-day-of-week="firstDayOfWeek"
            :show-week-number="showWeekNumber"
            :locale="locale"
            @select="handleDateSelect"
            @change="handlePanelChange"
          />

          <!-- 时间面板 -->
          <time-panel
            v-if="showTimePanel"
            :value="Array.isArray(panelValue) ? panelValue[0] : panelValue"
            :format="timeFormat"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            :disabled-seconds="disabledSeconds"
            :hour-step="hourStep"
            :minute-step="minuteStep"
            :second-step="secondStep"
            :use12-hours="use12Hours"
            @select="handleTimeSelect"
          />

          <!-- 快捷选项 -->
          <div v-if="shortcuts && shortcuts.length > 0" class="ex-date-picker__shortcuts">
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.text"
              type="button"
              class="ex-date-picker__shortcut"
              @click="handleShortcutClick(shortcut)"
            >
              {{ shortcut.text }}
            </button>
          </div>

          <!-- 底部操作 -->
          <div v-if="showFooter" class="ex-date-picker__footer">
            <ex-button size="small" @click="handleCancel">
              {{ t('datePicker.cancel') }}
            </ex-button>
            <ex-button
              type="primary"
              size="small"
              :disabled="!isValidSelection"
              @click="handleConfirm"
            >
              {{ t('datePicker.confirm') }}
            </ex-button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../locale';
import type {
  ExDatePickerProps,
  DateValue,
  DateRangeValue,
  DateShortcut,
  DatePickerPlacement,
} from './types';
import {
  dateUtils,
  getDefaultFormat,
  getDefaultPlaceholder,
  getRangeEndPlaceholder,
} from './utils';
import ExIcon from '../icon/ExIcon.vue';
import ExButton from '../button/ExButton.vue';
import DatePanel from './DatePanel.vue';
import TimePanel from './TimePanel.vue';

defineOptions({
  name: 'ExDatePicker',
});

const props = withDefaults(defineProps<ExDatePickerProps>(), {
  type: 'date',
  size: 'medium',
  clearable: true,
  editable: true,
  rangeSeparator: ' - ',
  placement: 'bottom-start',
  firstDayOfWeek: 0,
  locale: 'zh',
});

const emit = defineEmits<{
  'update:modelValue': [value: DateValue | DateRangeValue | null];
  change: [value: DateValue | DateRangeValue | null, dateString: string | string[]];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
  'panel-change': [value: Date, mode: string];
}>();

const { t } = useI18n();

// 引用
const inputRef = ref<HTMLInputElement>();
const startInputRef = ref<HTMLInputElement>();
const endInputRef = ref<HTMLInputElement>();
const popoverRef = ref<HTMLElement>();

// 状态
const visible = ref(false);
const focused = ref(false);
const panelValue = ref<Date | Date[]>(new Date());
const currentInput = ref<'start' | 'end'>('start');

// 计算属性
const isRange = computed(() => props.type.includes('range'));

const format = computed(() => props.format || getDefaultFormat(props.type));

const timeFormat = computed(() => {
  if (props.type === 'datetime' || props.type === 'datetimerange') {
    return format.value.split(' ')[1] || 'HH:mm:ss';
  }
  return 'HH:mm:ss';
});

const showDatePanel = computed(() => {
  return ['date', 'datetime', 'daterange', 'datetimerange', 'month', 'year'].includes(props.type);
});

const showTimePanel = computed(() => {
  return props.type === 'datetime' || props.type === 'datetimerange';
});

const showFooter = computed(() => {
  return showTimePanel.value || (props.shortcuts && props.shortcuts.length > 0);
});

const suffixIcon = computed(() => {
  if (props.type === 'datetime' || props.type === 'datetimerange') {
    return 'clock-circle';
  }
  return 'calendar';
});

const computedPlaceholder = computed(() => {
  return props.placeholder || getDefaultPlaceholder(props.type, props.locale);
});

const computedEndPlaceholder = computed(() => {
  return props.endPlaceholder || getRangeEndPlaceholder(props.type, props.locale);
});

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue) return '';

  if (isRange.value) return '';

  const date =
    typeof props.modelValue === 'string'
      ? dateUtils.parse(props.modelValue, format.value)
      : (props.modelValue as Date);

  return date ? dateUtils.format(date, format.value) : '';
});

const startDisplayValue = computed(() => {
  if (!isRange.value || !props.modelValue) return '';

  const range = props.modelValue as DateRangeValue;
  if (!range || !range[0]) return '';

  const date =
    typeof range[0] === 'string' ? dateUtils.parse(range[0], format.value) : (range[0] as Date);

  return date ? dateUtils.format(date, format.value) : '';
});

const endDisplayValue = computed(() => {
  if (!isRange.value || !props.modelValue) return '';

  const range = props.modelValue as DateRangeValue;
  if (!range || !range[1]) return '';

  const date =
    typeof range[1] === 'string' ? dateUtils.parse(range[1], format.value) : (range[1] as Date);

  return date ? dateUtils.format(date, format.value) : '';
});

// 验证选择是否有效
const isValidSelection = computed(() => {
  if (!panelValue.value) return false;

  if (isRange.value) {
    const range = panelValue.value as Date[];
    return range.length === 2 && range[0] && range[1];
  }

  return dateUtils.isValid(panelValue.value as Date);
});

// 错误信息
const errorMessage = computed(() => {
  // 这里可以添加验证逻辑
  return '';
});

// 弹出框位置
const popoverStyle = ref<Record<string, string>>({});
const popoverPlacement = ref(props.placement);

// 方法
const updatePanelValue = () => {
  if (!props.modelValue) {
    panelValue.value = new Date();
    return;
  }

  if (isRange.value) {
    const range = props.modelValue as DateRangeValue;
    const dates: Date[] = [];

    if (range[0]) {
      const date =
        typeof range[0] === 'string' ? dateUtils.parse(range[0], format.value) : range[0];
      if (date) dates.push(date as Date);
    }

    if (range[1]) {
      const date =
        typeof range[1] === 'string' ? dateUtils.parse(range[1], format.value) : range[1];
      if (date) dates.push(typeof date === 'number' ? new Date(date) : date);
    }

    panelValue.value = dates.length > 0 ? dates : [new Date()];
  } else {
    const date =
      typeof props.modelValue === 'string'
        ? dateUtils.parse(props.modelValue, format.value)
        : (props.modelValue as Date);

    panelValue.value = date || new Date();
  }
};

const updatePopoverPosition = async () => {
  if (!visible.value || !popoverRef.value) return;

  await nextTick();

  const trigger = inputRef.value || startInputRef.value;
  if (!trigger) return;

  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popoverRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = triggerRect.bottom + 4;
  let left = triggerRect.left;

  // 检查是否超出视口
  if (left + popoverRect.width > viewportWidth) {
    left = viewportWidth - popoverRect.width - 8;
  }

  if (top + popoverRect.height > viewportHeight) {
    top = triggerRect.top - popoverRect.height - 4;
    popoverPlacement.value = props.placement?.replace('bottom', 'top') as DatePickerPlacement;
  } else {
    popoverPlacement.value = props.placement;
  }

  popoverStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '2000',
  };
};

const showPopover = () => {
  if (props.disabled || props.readonly) return;

  visible.value = true;
  updatePanelValue();
  updatePopoverPosition();
};

const hidePopover = () => {
  visible.value = false;
};

const handleInputClick = () => {
  if (!visible.value) {
    showPopover();
  }
};

const handleInput = (event: Event) => {
  if (!props.editable) return;

  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (!value) {
    emit('update:modelValue', null);
    emit('change', null, '');
    return;
  }

  const date = dateUtils.parse(value, format.value);
  if (date && (!props.disabledDate || !props.disabledDate(date))) {
    emit('update:modelValue', date);
    emit('change', date, value);
  }
};

const handleStartInput = (event: Event) => {
  if (!props.editable) return;

  const target = event.target as HTMLInputElement;
  const value = target.value;

  const range = (props.modelValue as DateRangeValue) || [null, null];
  const date = value ? dateUtils.parse(value, format.value) : null;

  if (!date || (props.disabledDate && props.disabledDate(date))) return;

  const newRange: DateRangeValue = [date, range[1]];
  emit('update:modelValue', newRange);
  emit('change', newRange, [value, endDisplayValue.value]);
};

const handleEndInput = (event: Event) => {
  if (!props.editable) return;

  const target = event.target as HTMLInputElement;
  const value = target.value;

  const range = (props.modelValue as DateRangeValue) || [null, null];
  const date = value ? dateUtils.parse(value, format.value) : null;

  if (!date || (props.disabledDate && props.disabledDate(date))) return;

  const newRange: DateRangeValue = [range[0], date];
  emit('update:modelValue', newRange);
  emit('change', newRange, [startDisplayValue.value, value]);
};

const handleFocus = (event: FocusEvent) => {
  focused.value = true;
  emit('focus', event);
  showPopover();
};

const handleStartFocus = (event: FocusEvent) => {
  currentInput.value = 'start';
  handleFocus(event);
};

const handleEndFocus = (event: FocusEvent) => {
  currentInput.value = 'end';
  handleFocus(event);
};

const handleBlur = (event: FocusEvent) => {
  focused.value = false;
  emit('blur', event);

  // 延迟隐藏，允许点击面板
  setTimeout(() => {
    if (!focused.value) {
      hidePopover();
    }
  }, 200);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hidePopover();
  } else if (event.key === 'Enter') {
    if (visible.value && isValidSelection.value) {
      handleConfirm();
    } else {
      showPopover();
    }
  }
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('change', null, isRange.value ? ['', ''] : '');
  emit('clear');
  hidePopover();
};

const handleDateSelect = (date: Date | Date[]) => {
  panelValue.value = date;

  if (!showTimePanel.value && !isRange.value) {
    // 单个日期选择且不需要时间，直接确认
    handleConfirm();
  }
};

const handleTimeSelect = (time: Date | Date[]) => {
  panelValue.value = time;
};

const handlePanelChange = (value: Date, mode: string) => {
  emit('panel-change', value, mode);
};

const handleShortcutClick = (shortcut: DateShortcut) => {
  const value = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value;

  if (isRange.value) {
    panelValue.value = value as Date[];
  } else {
    panelValue.value = value as Date;
  }

  handleConfirm();
};

const handleConfirm = () => {
  if (!isValidSelection.value) return;

  if (isRange.value) {
    const range = panelValue.value as Date[];
    const dateStrings = range.map(date => dateUtils.format(date, format.value));
    emit('update:modelValue', range);
    emit('change', range, dateStrings);
  } else {
    const date = panelValue.value as Date;
    const dateString = dateUtils.format(date, format.value);
    emit('update:modelValue', date);
    emit('change', date, dateString);
  }

  hidePopover();
};

const handleCancel = () => {
  updatePanelValue();
  hidePopover();
};

// 点击外部关闭
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  const trigger = inputRef.value || startInputRef.value;

  if (!trigger || !popoverRef.value) return;

  if (!trigger.contains(target) && !popoverRef.value.contains(target)) {
    hidePopover();
  }
};

// 监听
watch(() => props.modelValue, updatePanelValue, { immediate: true });

watch(visible, newVisible => {
  if (newVisible) {
    updatePopoverPosition();
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', updatePopoverPosition);
  } else {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('resize', updatePopoverPosition);
  }
});

// 生命周期
onMounted(() => {
  updatePanelValue();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updatePopoverPosition);
});
</script>
