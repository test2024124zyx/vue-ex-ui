<template>
  <div
    ref="sliderRef"
    :class="sliderClasses"
    :style="sliderStyles"
    role="group"
    :aria-label="ariaLabel || t('slider.input')"
    :aria-disabled="disabled"
  >
    <!-- 滑块轨道容器 -->
    <div
      ref="trackRef"
      class="ex-slider__track-wrapper"
      :style="trackWrapperStyle"
      @mousedown="handleTrackClick"
      @touchstart="handleTrackClick"
    >
      <!-- 背景轨道 -->
      <div class="ex-slider__track"></div>

      <!-- 激活轨道 -->
      <div
        class="ex-slider__bar"
        :style="barStyle"
      ></div>

      <!-- 步进点 -->
      <div
        v-if="showStops && stopsData.length > 0"
        class="ex-slider__stops"
      >
        <div
          v-for="stop in stopsData"
          :key="stop"
          class="ex-slider__stop"
          :style="getStopStyle(stop)"
        ></div>
      </div>

      <!-- 标记 -->
      <div
        v-if="hasMarks"
        class="ex-slider__marks"
      >
        <div
          v-for="(mark, key) in normalizedMarks"
          :key="key"
          class="ex-slider__mark"
          :style="getMarkStyle(Number(key))"
        >
          <div class="ex-slider__mark-label">
            {{ mark.label }}
          </div>
        </div>
      </div>

      <!-- 滑块手柄 - 单个值 -->
      <div
        v-if="!range"
        ref="thumbRef"
        class="ex-slider__thumb"
        :class="{ 'is-dragging': isDragging }"
        :style="getThumbStyle(currentValue as number)"
        :tabindex="disabled ? -1 : 0"
        role="slider"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="currentValue as number"
        :aria-label="ariaLabel || t('slider.button')"
        :aria-description="ariaDescription"
        v-bind="fieldAriaAttrs"
        @mousedown="handleThumbMouseDown($event, 0)"
        @touchstart="handleThumbMouseDown($event, 0)"
        @keydown="handleKeyDown($event, 0)"
        @blur="handleThumbBlur"
      >
        <!-- 提示信息 -->
        <div
          v-if="showTooltip && (isDragging || isHovering)"
          class="ex-slider__tooltip"
          :class="`ex-slider__tooltip--${tooltipPlacement}`"
        >
          {{ formatValue(currentValue as number) }}
        </div>
      </div>

      <!-- 滑块手柄 - 范围值 -->
      <template v-else>
        <!-- 起始手柄 -->
        <div
          ref="thumbStartRef"
          class="ex-slider__thumb ex-slider__thumb--start"
          :class="{ 'is-dragging': isDraggingStart }"
          :style="getThumbStyle((currentValue as [number, number])[0])"
          :tabindex="disabled ? -1 : 0"
          role="slider"
          :aria-valuemin="min"
          :aria-valuemax="(currentValue as [number, number])[1]"
          :aria-valuenow="(currentValue as [number, number])[0]"
          :aria-label="getRangeThumbAriaLabel(0)"
          :aria-description="ariaDescription"
          v-bind="fieldAriaAttrs"
          @mousedown="handleThumbMouseDown($event, 0)"
          @touchstart="handleThumbMouseDown($event, 0)"
          @keydown="handleKeyDown($event, 0)"
          @blur="handleThumbBlur"
        >
          <div
            v-if="showTooltip && (isDraggingStart || isHoveringStart)"
            class="ex-slider__tooltip"
            :class="`ex-slider__tooltip--${tooltipPlacement}`"
          >
            {{ formatValue((currentValue as [number, number])[0]) }}
          </div>
        </div>

        <!-- 结束手柄 -->
        <div
          ref="thumbEndRef"
          class="ex-slider__thumb ex-slider__thumb--end"
          :class="{ 'is-dragging': isDraggingEnd }"
          :style="getThumbStyle((currentValue as [number, number])[1])"
          :tabindex="disabled ? -1 : 0"
          role="slider"
          :aria-valuemin="(currentValue as [number, number])[0]"
          :aria-valuemax="max"
          :aria-valuenow="(currentValue as [number, number])[1]"
          :aria-label="getRangeThumbAriaLabel(1)"
          :aria-description="ariaDescription"
          v-bind="fieldAriaAttrs"
          @mousedown="handleThumbMouseDown($event, 1)"
          @touchstart="handleThumbMouseDown($event, 1)"
          @keydown="handleKeyDown($event, 1)"
          @blur="handleThumbBlur"
        >
          <div
            v-if="showTooltip && (isDraggingEnd || isHoveringEnd)"
            class="ex-slider__tooltip"
            :class="`ex-slider__tooltip--${tooltipPlacement}`"
          >
            {{ formatValue((currentValue as [number, number])[1]) }}
          </div>
        </div>
      </template>
    </div>

    <!-- 输入框 -->
    <div
      v-if="showInput"
      class="ex-slider__input-wrapper"
    >
      <template v-if="!range">
        <input
          v-model.number="inputValue"
          type="number"
          class="ex-slider__input"
          :min="min"
          :max="max"
          :step="effectiveStep"
          :disabled="disabled"
          :readonly="readonly"
          v-bind="fieldAriaAttrs"
          :aria-label="t('slider.input')"
          @change="handleInputChange"
        />
      </template>
      <template v-else>
        <input
          v-model.number="inputStartValue"
          type="number"
          class="ex-slider__input"
          :min="min"
          :max="(currentValue as [number, number])[1]"
          :step="effectiveStep"
          :disabled="disabled"
          :readonly="readonly"
          v-bind="fieldAriaAttrs"
          :aria-label="t('slider.startInput')"
          @change="handleInputChange"
        />
        <span class="ex-slider__input-separator">-</span>
        <input
          v-model.number="inputEndValue"
          type="number"
          class="ex-slider__input"
          :min="(currentValue as [number, number])[0]"
          :max="max"
          :step="effectiveStep"
          :disabled="disabled"
          :readonly="readonly"
          v-bind="fieldAriaAttrs"
          :aria-label="t('slider.endInput')"
          @change="handleInputChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { ExSliderProps, ExSliderEmits, ExSliderExposed, SliderMark } from './types';
import { useI18n } from '../../locale';
import { useFormFieldState } from '../form/use-form-item';

defineOptions({
  name: 'ExSlider',
});

const props = withDefaults(defineProps<ExSliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  showInput: false,
  showStops: false,
  showTooltip: true,
  tooltipPlacement: 'top',
  size: undefined,
  direction: 'horizontal',
  height: '200px',
  reverse: false,
});

const emit = defineEmits<ExSliderEmits>();
const { t } = useI18n();

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const {
  formItem,
  disabled,
  readonly,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);

// 失焦：触发 FormItem 的 blur 校验
const handleThumbBlur = () => {
  formItem?.onFieldBlur();
};

// Refs
const sliderRef = ref<HTMLDivElement>();
const trackRef = ref<HTMLDivElement>();
const thumbRef = ref<HTMLDivElement>();
const thumbStartRef = ref<HTMLDivElement>();
const thumbEndRef = ref<HTMLDivElement>();

// State
const currentValue = ref<number | [number, number]>(props.modelValue);
const isDragging = ref(false);
const isDraggingStart = ref(false);
const isDraggingEnd = ref(false);
const isHovering = ref(false);
const isHoveringStart = ref(false);
const isHoveringEnd = ref(false);
const activeThumbIndex = ref(0);
const MAX_RENDERED_STOPS = 1000;

// Input values
const inputValue = ref(0);
const inputStartValue = ref(0);
const inputEndValue = ref(0);

// 计算属性
const sliderClasses = computed(() => {
  const classes = [
    'ex-slider',
    `ex-slider--${componentSize.value}`,
    `ex-slider--${props.direction}`,
  ];

  if (disabled.value) classes.push('ex-slider--disabled');
  if (props.range) classes.push('ex-slider--range');
  if (props.reverse) classes.push('ex-slider--reverse');
  if (isDragging.value || isDraggingStart.value || isDraggingEnd.value) {
    classes.push('is-dragging');
  }

  return classes;
});

const sliderStyles = computed(() => {
  if (props.direction === 'vertical') {
    return { height: props.height };
  }
  return undefined;
});

const trackWrapperStyle = computed(() => {
  if (props.direction === 'vertical') {
    return { height: '100%' };
  }
  return undefined;
});

const effectiveStep = computed(() => {
  return Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
});

const barStyle = computed(() => {
  const isVertical = props.direction === 'vertical';
  const isReverse = props.reverse;

  if (!props.range) {
    const value = currentValue.value as number;
    const percent = getPercent(value);

    if (isVertical) {
      return isReverse ? { top: 0, height: `${percent}%` } : { bottom: 0, height: `${percent}%` };
    }
    return isReverse ? { right: 0, width: `${percent}%` } : { left: 0, width: `${percent}%` };
  } else {
    const [start, end] = currentValue.value as [number, number];
    const startPercent = getPercent(start);
    const endPercent = getPercent(end);

    if (isVertical) {
      return isReverse
        ? { top: `${100 - endPercent}%`, height: `${endPercent - startPercent}%` }
        : { bottom: `${startPercent}%`, height: `${endPercent - startPercent}%` };
    }
    return isReverse
      ? { right: `${100 - endPercent}%`, width: `${endPercent - startPercent}%` }
      : { left: `${startPercent}%`, width: `${endPercent - startPercent}%` };
  }
});

const stopsData = computed(() => {
  if (!props.showStops) return [];
  if (!Number.isFinite(props.step) || props.step <= 0 || props.max <= props.min) return [];
  const stops: number[] = [];
  const stepCount = (props.max - props.min) / props.step;
  if (!Number.isFinite(stepCount) || stepCount > MAX_RENDERED_STOPS) return [];

  for (let i = 1; i < stepCount; i++) {
    stops.push(props.min + i * props.step);
  }

  return stops;
});

const hasMarks = computed(() => {
  return props.marks && Object.keys(props.marks).length > 0;
});

const normalizedMarks = computed(() => {
  if (!props.marks) return {};

  const result: Record<number, SliderMark> = {};

  Object.entries(props.marks).forEach(([key, value]) => {
    const numKey = Number(key);
    if (numKey >= props.min && numKey <= props.max) {
      if (typeof value === 'string') {
        result[numKey] = { value: numKey, label: value };
      } else {
        result[numKey] = { ...value, value: numKey };
      }
    }
  });

  return result;
});

// 工具函数
const getPercent = (value: number): number => {
  const span = props.max - props.min;
  if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, ((value - props.min) / span) * 100));
};

const getValueFromPercent = (percent: number): number => {
  const value = props.min + (percent / 100) * (props.max - props.min);
  return roundToStep(value);
};

const roundToStep = (value: number): number => {
  const normalizedValue = Number.isFinite(value) ? value : props.min;
  const step = effectiveStep.value;
  const remainder = (normalizedValue - props.min) % step;
  let rounded = normalizedValue - remainder;

  if (Math.abs(remainder) >= step / 2) {
    rounded += remainder > 0 ? step : -step;
  }

  if (props.max <= props.min) return props.min;
  return Math.max(props.min, Math.min(props.max, rounded));
};

const getRangeThumbAriaLabel = (thumbIndex: number) => {
  const thumbLabel = thumbIndex === 0 ? t('slider.startValue') : t('slider.endValue');
  return props.ariaLabel ? `${props.ariaLabel} ${thumbLabel}` : thumbLabel;
};

const getThumbStyle = (value: number) => {
  const percent = getPercent(value);
  const isVertical = props.direction === 'vertical';
  const isReverse = props.reverse;

  if (isVertical) {
    return isReverse ? { top: `${percent}%` } : { bottom: `${percent}%` };
  }
  return isReverse ? { right: `${percent}%` } : { left: `${percent}%` };
};

const getStopStyle = (value: number) => {
  const percent = getPercent(value);
  const isVertical = props.direction === 'vertical';
  const isReverse = props.reverse;

  if (isVertical) {
    return isReverse ? { top: `${percent}%` } : { bottom: `${percent}%` };
  }
  return isReverse ? { right: `${percent}%` } : { left: `${percent}%` };
};

const getMarkStyle = (value: number) => {
  const percent = getPercent(value);
  const isVertical = props.direction === 'vertical';
  const isReverse = props.reverse;

  if (isVertical) {
    return isReverse ? { top: `${percent}%` } : { bottom: `${percent}%` };
  }
  return isReverse ? { right: `${percent}%` } : { left: `${percent}%` };
};

const formatValue = (value: number): string => {
  if (props.formatTooltip) {
    return props.formatTooltip(value);
  }
  return String(value);
};

// 事件处理：从鼠标或触摸事件获取位置
const getPositionFromEvent = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
  if ('touches' in event) {
    const touch = event.touches[0];
    if (!touch) return { x: 0, y: 0 };
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
};

const getValueFromPosition = (clientX: number, clientY: number): number => {
  if (!trackRef.value) return props.min;

  const rect = trackRef.value.getBoundingClientRect();
  const isVertical = props.direction === 'vertical';
  const isReverse = props.reverse;

  let percent: number;

  if (isVertical) {
    if (rect.height <= 0) return props.min;
    const position = clientY - rect.top;
    percent = (position / rect.height) * 100;
    if (!isReverse) {
      percent = 100 - percent;
    }
  } else {
    if (rect.width <= 0) return props.min;
    const position = clientX - rect.left;
    percent = (position / rect.width) * 100;
    if (isReverse) {
      percent = 100 - percent;
    }
  }

  return getValueFromPercent(Math.max(0, Math.min(100, percent)));
};

/**
 * 更新滑块值
 * @param newValue 新值
 * @param commit 是否提交（emit change）：拖拽过程中为 false，仅在松手/键盘/点击时为 true
 */
const updateValue = (newValue: number | [number, number], commit = true) => {
  if (!interactive.value) return;
  currentValue.value = newValue;
  emit('update:modelValue', newValue);
  emit('input', newValue);
  if (commit) {
    emit('change', newValue);
    formItem?.onFieldChange();
  }
};

const handleTrackClick = (event: MouseEvent | TouchEvent) => {
  if (!interactive.value) return;

  event.preventDefault();
  const { x, y } = getPositionFromEvent(event);
  const value = getValueFromPosition(x, y);

  if (!props.range) {
    updateValue(value);
  } else {
    const [start, end] = currentValue.value as [number, number];
    const distToStart = Math.abs(value - start);
    const distToEnd = Math.abs(value - end);

    if (distToStart < distToEnd) {
      updateValue([value, end]);
    } else {
      updateValue([start, value]);
    }
  }
};

const handleThumbMouseDown = (event: MouseEvent | TouchEvent, thumbIndex: number) => {
  if (!interactive.value) return;

  event.preventDefault();
  event.stopPropagation();

  activeThumbIndex.value = thumbIndex;

  if (!props.range) {
    isDragging.value = true;
  } else {
    if (thumbIndex === 0) {
      isDraggingStart.value = true;
    } else {
      isDraggingEnd.value = true;
    }
  }

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchmove', handleMouseMove, { passive: false });
  document.addEventListener('touchend', handleMouseUp);
  document.addEventListener('touchcancel', handleMouseUp);
};

const handleMouseMove = (event: MouseEvent | TouchEvent) => {
  if (!interactive.value) return;

  if ('touches' in event && event.cancelable) {
    event.preventDefault();
  }

  const { x, y } = getPositionFromEvent(event);
  const value = getValueFromPosition(x, y);

  // 拖拽过程中只 emit input，不 emit change
  if (!props.range) {
    updateValue(value, false);
  } else {
    const [start, end] = currentValue.value as [number, number];

    if (activeThumbIndex.value === 0) {
      updateValue([Math.min(value, end), end], false);
    } else {
      updateValue([start, Math.max(value, start)], false);
    }
  }
};

const handleMouseUp = () => {
  const wasDragging = isDragging.value || isDraggingStart.value || isDraggingEnd.value;

  isDragging.value = false;
  isDraggingStart.value = false;
  isDraggingEnd.value = false;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleMouseMove);
  document.removeEventListener('touchend', handleMouseUp);
  document.removeEventListener('touchcancel', handleMouseUp);

  // 拖拽结束时提交一次 change
  if (wasDragging && interactive.value) {
    emit('change', currentValue.value);
    formItem?.onFieldChange();
  }
};

const handleKeyDown = (event: KeyboardEvent, thumbIndex: number) => {
  if (!interactive.value || event.isComposing) return;

  const { key } = event;

  let increment = 0;

  // 遵循 WAI-ARIA slider 规范：Up/Right 始终增大值，Down/Left 始终减小值，
  // 与视觉方向（vertical/reverse）无关
  if (key === 'ArrowUp' || key === 'ArrowRight') {
    increment = props.step;
  } else if (key === 'ArrowDown' || key === 'ArrowLeft') {
    increment = -props.step;
  } else if (key === 'Home') {
    const currentVal = props.range
      ? (currentValue.value as [number, number])[thumbIndex]
      : (currentValue.value as number);
    increment = props.min - (currentVal ?? props.min);
  } else if (key === 'End') {
    const currentVal = props.range
      ? (currentValue.value as [number, number])[thumbIndex]
      : (currentValue.value as number);
    increment = props.max - (currentVal ?? props.max);
  } else if (key === 'PageUp') {
    increment = props.step * 10;
  } else if (key === 'PageDown') {
    increment = -props.step * 10;
  }

  if (increment !== 0) {
    event.preventDefault();

    if (!props.range) {
      const newValue = roundToStep((currentValue.value as number) + increment);
      updateValue(newValue);
    } else {
      const [start, end] = currentValue.value as [number, number];

      if (thumbIndex === 0) {
        const newStart = roundToStep(start + increment);
        updateValue([Math.min(newStart, end), end]);
      } else {
        const newEnd = roundToStep(end + increment);
        updateValue([start, Math.max(newEnd, start)]);
      }
    }
  }
};

const handleInputChange = () => {
  if (!props.range) {
    const value = roundToStep(inputValue.value);
    updateValue(value);
  } else {
    const start = roundToStep(inputStartValue.value);
    const end = roundToStep(inputEndValue.value);
    updateValue([Math.min(start, end), Math.max(start, end)]);
  }
};

// 监听
watch(interactive, canInteract => {
  if (!canInteract) handleMouseUp();
});
watch(
  [() => props.modelValue, () => props.range],
  ([newValue, isRange]) => {
    const scalarValue = Array.isArray(newValue) ? newValue[0] : newValue;
    const normalizedScalar = roundToStep(scalarValue ?? props.min);

    if (!isRange) {
      currentValue.value = normalizedScalar;
      inputValue.value = normalizedScalar;
      return;
    }

    const source = Array.isArray(newValue)
      ? newValue
      : ([normalizedScalar, normalizedScalar] as [number, number]);
    const start = roundToStep(source[0] ?? props.min);
    const end = roundToStep(source[1] ?? start);
    const normalizedStart = Math.min(start, end);
    const normalizedEnd = Math.max(start, end);
    currentValue.value = [normalizedStart, normalizedEnd];
    inputStartValue.value = normalizedStart;
    inputEndValue.value = normalizedEnd;
  },
  { immediate: true, flush: 'sync' }
);

// 悬停事件
onMounted(() => {
  if (thumbRef.value) {
    thumbRef.value.addEventListener('mouseenter', () => (isHovering.value = true));
    thumbRef.value.addEventListener('mouseleave', () => (isHovering.value = false));
  }

  if (thumbStartRef.value) {
    thumbStartRef.value.addEventListener('mouseenter', () => (isHoveringStart.value = true));
    thumbStartRef.value.addEventListener('mouseleave', () => (isHoveringStart.value = false));
  }

  if (thumbEndRef.value) {
    thumbEndRef.value.addEventListener('mouseenter', () => (isHoveringEnd.value = true));
    thumbEndRef.value.addEventListener('mouseleave', () => (isHoveringEnd.value = false));
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleMouseMove);
  document.removeEventListener('touchend', handleMouseUp);
  document.removeEventListener('touchcancel', handleMouseUp);
});

// 暴露的方法
const getElement = () => sliderRef.value || null;

const reset = () => {
  if (!props.range) {
    updateValue(props.min);
  } else {
    updateValue([props.min, props.max]);
  }
};

// 聚焦/取消聚焦滑块手柄（范围模式聚焦起始手柄）
const focus = () => {
  (thumbRef.value || thumbStartRef.value)?.focus();
};

const blur = () => {
  (thumbRef.value || thumbStartRef.value)?.blur();
};

defineExpose<ExSliderExposed>({
  getElement,
  reset,
  focus,
  blur,
});
</script>

<style scoped lang="scss" src="./ExSlider.scss"></style>
