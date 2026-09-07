<template>
  <div
    :id="id"
    :class="rateClasses"
    :style="rateStyles"
    role="slider"
    :tabindex="effectiveDisabled ? undefined : 0"
    :aria-valuemin="0"
    :aria-valuemax="normalizedMax"
    :aria-valuenow="currentValue"
    :aria-label="ariaLabel || (fieldAriaAttrs['aria-labelledby'] ? undefined : t('label'))"
    v-bind="fieldAriaAttrs"
    :aria-disabled="effectiveDisabled"
    :aria-readonly="effectiveReadonly"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
    @blur="handleBlur"
  >
    <!-- 评分星星 -->
    <div class="ex-rate__stars">
      <span
        v-for="item in normalizedMax"
        :key="item"
        :class="getStarClasses(item)"
        @mouseenter="handleMouseEnter(item)"
        @mousemove="handleMouseMove(item, $event)"
        @click="handleClick(item, $event)"
      >
        <!-- 未选中的图标 -->
        <span class="ex-rate__icon ex-rate__icon--void">
          <slot
            name="icon-void"
            :index="item"
            :color="voidColor"
          >
            <ex-icon
              icon="star-line"
              :size="iconSize"
              :color="voidColor"
            >
              <i
                v-if="effectiveVoidIconClass"
                :class="effectiveVoidIconClass"
              ></i>
            </ex-icon>
          </slot>
        </span>

        <!-- 选中的图标 -->
        <span
          class="ex-rate__icon ex-rate__icon--active"
          :style="getActiveStyle(item)"
        >
          <slot
            name="icon-active"
            :index="item"
            :color="effectiveDisabled ? disabledVoidColor : color"
          >
            <ex-icon
              icon="star-fill"
              :size="iconSize"
              :color="effectiveDisabled ? disabledVoidColor : color"
            />
          </slot>
        </span>
      </span>
    </div>

    <!-- 分数显示 -->
    <span
      v-if="showScore || showText"
      class="ex-rate__text"
      :style="{ color: textColor }"
    >
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ExRateProps, ExRateEmits } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useFormFieldState } from '../form/use-form-item';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExRate',
});

const props = withDefaults(defineProps<ExRateProps>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  readonly: false,
  allowHalf: false,
  showScore: false,
  showText: false,
  scoreTemplate: '{value}',
  size: undefined,
  color: 'var(--ex-color-primary, #00f0ff)',
  voidColor: 'var(--ex-color-text-disabled, #4a5568)',
  disabledVoidColor: 'var(--ex-color-text-disabled, #6b7280)',
});

const emit = defineEmits<ExRateEmits>();
const { t } = useLocale('rate');

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const {
  formItem,
  disabled: effectiveDisabled,
  readonly: effectiveReadonly,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);
const normalizedMax = computed(() =>
  Number.isFinite(props.max) && props.max > 0 ? Math.floor(props.max) : 5
);

const normalizeValue = (value: number) => {
  const finiteValue = Number.isFinite(value) ? value : 0;
  const step = props.allowHalf ? 0.5 : 1;
  return Math.min(normalizedMax.value, Math.max(0, Math.round(finiteValue / step) * step));
};

// 响应式状态
const currentValue = ref(normalizeValue(props.modelValue));
const hoverValue = ref(-1);
const isHovering = ref(false);

// 计算属性
const rateClasses = computed(() => {
  const classes = ['ex-rate', `ex-rate--${componentSize.value}`];

  if (effectiveDisabled.value) classes.push('is-disabled');
  if (effectiveReadonly.value) classes.push('is-readonly');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const rateStyles = computed(() => {
  if (typeof props.customStyle === 'string') {
    return props.customStyle;
  }
  return props.customStyle || {};
});

const iconSize = computed(() => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
  };
  return sizeMap[componentSize.value];
});

// 类名只替换当前状态的未选中图形，外部插槽优先，空类名保留内置图标。
const effectiveVoidIconClass = computed(() =>
  (effectiveDisabled.value ? props.disabledVoidIconClass : props.voidIconClass)?.trim()
);

const displayValue = computed(() => {
  return isHovering.value ? hoverValue.value : currentValue.value;
});

const displayText = computed(() => {
  if (props.showText && props.texts && props.texts.length > 0) {
    const index = Math.ceil(displayValue.value) - 1;
    return props.texts[index] || '';
  }

  if (props.showScore) {
    return props.scoreTemplate.replace('{value}', displayValue.value.toString());
  }

  return '';
});

// 方法
function getStarClasses(item: number) {
  const classes = ['ex-rate__star'];

  const value = displayValue.value;

  if (item <= value) {
    classes.push('is-active');
  } else if (props.allowHalf && item - 0.5 <= value) {
    classes.push('is-half');
  }

  if (!effectiveDisabled.value && !effectiveReadonly.value) {
    classes.push('is-interactive');
  }

  return classes;
}

function getActiveStyle(item: number) {
  const value = displayValue.value;
  const styles: Record<string, string> = {};

  if (props.allowHalf && item - 0.5 <= value && item > value) {
    styles.clipPath = 'inset(0 50% 0 0)';
  }

  return styles;
}

function getValueFromEvent(item: number, event: MouseEvent): number {
  if (!props.allowHalf) {
    return item;
  }

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const isHalf = offsetX < rect.width / 2;

  return isHalf ? item - 0.5 : item;
}

function handleMouseEnter(item: number) {
  if (effectiveDisabled.value || effectiveReadonly.value) return;

  isHovering.value = true;
  hoverValue.value = item;
}

function handleMouseMove(item: number, event: MouseEvent) {
  if (effectiveDisabled.value || effectiveReadonly.value || !props.allowHalf) return;

  const value = getValueFromEvent(item, event);
  hoverValue.value = value;
}

function handleMouseLeave() {
  isHovering.value = false;
  hoverValue.value = -1;
}

// 失焦：触发 FormItem 的 blur 校验
function handleBlur() {
  formItem?.onFieldBlur();
}

function handleClick(item: number, event: MouseEvent) {
  commitValue(getValueFromEvent(item, event));
}

function setCurrentValue(value: number) {
  commitValue(value);
}

function resetCurrentValue() {
  commitValue(0);
}

function commitValue(value: number) {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  const normalizedValue = normalizeValue(value);
  currentValue.value = normalizedValue;
  emit('update:modelValue', normalizedValue);
  emit('change', normalizedValue);
  formItem?.onFieldChange();
}

// 键盘操作：左右方向键增减评分
function handleKeydown(event: KeyboardEvent) {
  if (effectiveDisabled.value || effectiveReadonly.value) return;

  const step = props.allowHalf ? 0.5 : 1;
  let newValue: number;

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    newValue = Math.min(normalizedMax.value, currentValue.value + step);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    newValue = Math.max(0, currentValue.value - step);
  } else if (event.key === 'Home') {
    newValue = 0;
  } else if (event.key === 'End') {
    newValue = normalizedMax.value;
  } else {
    return;
  }

  event.preventDefault();
  if (newValue !== currentValue.value) {
    commitValue(newValue);
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    currentValue.value = normalizeValue(newValue);
  }
);

watch([normalizedMax, () => props.allowHalf], () => {
  currentValue.value = normalizeValue(currentValue.value);
});

watch([effectiveDisabled, effectiveReadonly], ([disabled, readonly]) => {
  if (disabled || readonly) handleMouseLeave();
});

// 暴露方法
defineExpose({
  setCurrentValue,
  resetCurrentValue,
});
</script>

<style scoped lang="scss" src="./ExRate.scss"></style>
