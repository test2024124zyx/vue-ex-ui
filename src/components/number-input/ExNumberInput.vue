<template>
  <div
    ref="numberInputRef"
    :class="numberInputClasses"
    :style="numberInputStyles"
  >
    <!-- 左侧减少按钮 -->
    <button
      v-if="controls && controlsPosition === 'both'"
      type="button"
      class="ex-number-input__button ex-number-input__button--decrease"
      :disabled="disabled || isDecreaseDisabled"
      :tabindex="disabled || isDecreaseDisabled ? -1 : 0"
      :aria-label="t('numberInput.decrease')"
      @click="handleDecrease"
    >
      <slot name="decrease-icon">
        <ex-icon
          icon="subtract-line"
          :size="iconSize"
          :color="getIconColor(disabled || isDecreaseDisabled)"
        />
      </slot>
    </button>

    <!-- 输入框 -->
    <input
      ref="inputRef"
      type="text"
      inputmode="decimal"
      class="ex-number-input__input"
      :value="displayValue"
      :placeholder="placeholder || t('numberInput.placeholder')"
      :disabled="disabled"
      :readonly="readonly"
      :name="name"
      :aria-label="ariaLabel"
      v-bind="fieldAriaAttrs"
      :aria-valuemin="ariaValueMin"
      :aria-valuemax="ariaValueMax"
      :aria-valuenow="modelValue ?? undefined"
      :aria-readonly="readonly"
      role="spinbutton"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- 右侧控制按钮 -->
    <div
      v-if="controls && controlsPosition === 'right'"
      class="ex-number-input__controls"
    >
      <button
        type="button"
        class="ex-number-input__button ex-number-input__button--increase"
        :disabled="disabled || isIncreaseDisabled"
        :tabindex="disabled || isIncreaseDisabled ? -1 : 0"
        :aria-label="t('numberInput.increase')"
        @click="handleIncrease"
      >
        <slot name="increase-icon">
          <ex-icon
            icon="arrow-up-s-line"
            :size="controlIconSize"
            :color="getIconColor(disabled || isIncreaseDisabled)"
          />
        </slot>
      </button>
      <button
        type="button"
        class="ex-number-input__button ex-number-input__button--decrease"
        :disabled="disabled || isDecreaseDisabled"
        :tabindex="disabled || isDecreaseDisabled ? -1 : 0"
        :aria-label="t('numberInput.decrease')"
        @click="handleDecrease"
      >
        <slot name="decrease-icon">
          <ex-icon
            icon="arrow-down-s-line"
            :size="controlIconSize"
            :color="getIconColor(disabled || isDecreaseDisabled)"
          />
        </slot>
      </button>
    </div>

    <!-- 两侧布局的右侧增加按钮 -->
    <button
      v-if="controls && controlsPosition === 'both'"
      type="button"
      class="ex-number-input__button ex-number-input__button--increase"
      :disabled="disabled || isIncreaseDisabled"
      :tabindex="disabled || isIncreaseDisabled ? -1 : 0"
      :aria-label="t('numberInput.increase')"
      @click="handleIncrease"
    >
      <slot name="increase-icon">
        <ex-icon
          icon="add-line"
          :size="iconSize"
          :color="getIconColor(disabled || isIncreaseDisabled)"
        />
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import type { ExNumberInputProps, ExNumberInputEmits, ExNumberInputExposed } from './types';
import { useI18n } from '../../locale';
import { debounce } from '../../utils/debounce';
import { addDecimal, formatFixedDecimal, snapToDecimalStep } from '../../utils/decimal';
import type { DebouncedFunction } from '../../utils/debounce';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { useFormFieldState } from '../form/use-form-item';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExNumberInput',
});

const props = withDefaults(defineProps<ExNumberInputProps>(), {
  modelValue: null,
  min: -Infinity,
  max: Infinity,
  step: 1,
  precision: undefined,
  size: undefined,
  disabled: false,
  readonly: false,
  placeholder: '',
  controls: true,
  controlsPosition: 'right',
  strictStep: false,
  debounceDelay: 0,
});

const emit = defineEmits<ExNumberInputEmits>();

const { t } = useI18n();
const {
  formItem,
  disabled,
  readonly,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);

const numberInputRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const displayValue = ref<string>('');
const isFocused = ref(false);
const hasDraft = ref(false);
let debouncedInput: DebouncedFunction<(value: number) => void> | null = null;

// 计算属性
const numberInputClasses = computed(() => {
  const classes = [
    'ex-number-input',
    `ex-number-input--${componentSize.value}`,
    `ex-number-input--controls-${props.controlsPosition}`,
  ];

  if (disabled.value) classes.push('ex-number-input--disabled');
  if (readonly.value) classes.push('ex-number-input--readonly');
  if (isFocused.value) classes.push('ex-number-input--focused');
  if (!props.controls) classes.push('ex-number-input--no-controls');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const numberInputStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const ariaValueMin = computed(() => (Number.isFinite(props.min) ? props.min : undefined));
const ariaValueMax = computed(() => (Number.isFinite(props.max) ? props.max : undefined));

// 图标尺寸
const iconSize = computed(() => {
  const sizeMap = {
    small: 14,
    medium: 16,
    large: 18,
  };
  return sizeMap[componentSize.value];
});

const controlIconSize = computed(() => {
  const sizeMap = {
    small: 10,
    medium: 12,
    large: 14,
  };
  return sizeMap[componentSize.value];
});

// 获取图标颜色
const getIconColor = (isDisabled: boolean) => {
  if (isDisabled) {
    return 'var(--ex-color-text-disabled)';
  }
  return 'var(--ex-color-text-secondary)';
};

const precision = computed(() => {
  const digits = props.precision;
  return digits !== undefined && Number.isInteger(digits) && digits >= 0 ? digits : undefined;
});
const effectiveStep = computed(() =>
  Number.isFinite(props.step) && props.step !== 0 ? Math.abs(props.step) : 1
);
const stepBase = computed(() => (Number.isFinite(props.min) ? props.min : 0));
const MAXIMUM_FIXED_DIGITS = 100;
const LARGE_STEP_MULTIPLIER = 10;
const largeStep = computed(() =>
  snapToDecimalStep(effectiveStep.value * LARGE_STEP_MULTIPLIER, 0, effectiveStep.value)
);

// 保留数字模型，在可表示的范围内按指定小数位舍入。
const formatNumber = (value: number): number => {
  const digits = precision.value;
  if (digits === undefined || Number.isInteger(value)) return value;
  return snapToDecimalStep(value, 0, Number(`1e-${digits}`));
};

const formatDisplayNumber = (value: number): string => {
  const digits = precision.value;
  if (digits === undefined || digits > MAXIMUM_FIXED_DIGITS) return String(value);
  return formatFixedDecimal(value, digits);
};

// 验证并限制数值范围
const validateValue = (value: number, snap = false): number => {
  let result = value;

  // 限制范围
  if (result < props.min) result = props.min;
  if (result > props.max) result = props.max;

  // 严格步长模式：以有限的基准对齐步长（min 为 ±Infinity 时退化为 0，避免 NaN）
  if (snap) {
    result = snapToDecimalStep(result, stepBase.value, effectiveStep.value);

    // 对齐后再次夹取范围，避免步长对齐导致越界
    if (result < props.min) result = props.min;
    if (result > props.max) result = props.max;
  }

  // 精度与区间无法同时满足时，显式数值边界优先，防止舍入重新越界。
  return Math.min(props.max, Math.max(props.min, formatNumber(result)));
};

// 解析输入值（增强输入验证）
const parseValue = (input: string): number | null => {
  // 允许空值、负号、小数点开头
  if (input === '' || input === '-' || input === '.' || input === '-.') return null;

  // 过滤非法字符（只允许数字、负号、小数点）
  const filtered = input.replace(/[^\d.-]/g, '');
  if (filtered !== input) {
    return props.modelValue;
  }

  const num = Number(input);
  if (!Number.isFinite(num)) return props.modelValue;

  return num;
};

const stepValue = computed(() =>
  hasDraft.value ? (parseValue(displayValue.value) ?? props.modelValue) : props.modelValue
);
const isIncreaseDisabled = computed(
  () => !interactive.value || (stepValue.value !== null && stepValue.value >= props.max)
);
const isDecreaseDisabled = computed(
  () => !interactive.value || (stepValue.value !== null && stepValue.value <= props.min)
);

// 更新显示值
const updateDisplayValue = (force = false) => {
  if (isFocused.value && !force) return;

  hasDraft.value = false;
  if (props.modelValue === null) {
    displayValue.value = '';
  } else {
    // 应用精度格式化
    const formattedValue = validateValue(props.modelValue);
    displayValue.value = formatDisplayNumber(formattedValue);
  }
  if (force && inputRef.value) inputRef.value.value = displayValue.value;
};

// 外部确认值优先于尚未提交的草稿，聚焦状态不阻挡显式数据更新。
watch(
  () => props.modelValue,
  () => {
    debouncedInput?.cancel();
    updateDisplayValue(true);
  },
  { immediate: true }
);

watch([() => props.precision, () => props.min, () => props.max], () => updateDisplayValue());

const discardDraft = () => {
  debouncedInput?.cancel();
  updateDisplayValue(true);
  formItem?.onFieldDraftDiscard?.();
};

// 重置可能写回与当前模型相同的值，必须独立订阅通知，并等待父级属性同步。
watch(() => formItem?.resetRevision?.value, discardDraft, { flush: 'post' });

watch(
  () => props.debounceDelay,
  delay => {
    debouncedInput?.cancel();
    debouncedInput =
      delay > 0
        ? debounce((value: number) => {
            emit('input', value);
          }, delay)
        : null;
  },
  { immediate: true }
);

// 事件处理
const handleInput = (event: Event) => {
  if (!interactive.value) {
    discardDraft();
    return;
  }
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // 实时输入过滤（只允许数字、负号、小数点）
  const filtered = value.replace(/[^\d.-]/g, '');
  if (filtered !== value) {
    value = filtered;
    target.value = filtered;
  }

  displayValue.value = value;
  hasDraft.value = true;

  const parsedValue = parseValue(value);
  if (parsedValue !== null) {
    if (debouncedInput) {
      debouncedInput(parsedValue);
    } else {
      emit('input', parsedValue);
    }
  }
  // 保持 change 才提交模型的既有行为，同时让实时校验看到用户正在编辑的值。
  formItem?.onFieldInput?.({ value: parsedValue });
};

const handleChange = (event: Event) => {
  debouncedInput?.cancel();
  if (!interactive.value) {
    discardDraft();
    return;
  }
  const target = event.target as HTMLInputElement;
  const value = target.value;
  // 程序化回写完成后，浏览器补发的 change 仍对应同一个已确认值。
  if (!hasDraft.value && value === displayValue.value) return;
  hasDraft.value = false;

  const parsedValue = parseValue(value);
  if (parsedValue === null) {
    emit('update:modelValue', null);
    emit('change', null, props.modelValue);
    formItem?.onFieldChange();
    return;
  }

  const validatedValue = validateValue(parsedValue, props.strictStep);
  const oldValue = props.modelValue;

  emit('update:modelValue', validatedValue);
  emit('change', validatedValue, oldValue);
  formItem?.onFieldChange();

  // 更新显示值
  displayValue.value = formatDisplayNumber(validatedValue);
};

const handleFocus = (event: FocusEvent) => {
  if (!interactive.value) return;
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  discardDraft();
  emit('blur', event);
  formItem?.onFieldBlur();
};

const commitSteppedValue = (newValue: number, direction?: 1 | -1) => {
  if (!Number.isFinite(newValue)) return;
  const oldValue = props.modelValue;
  // 确认同值不会触发属性监听，立即撤销草稿和待发送的输入事件。
  if (hasDraft.value && newValue === oldValue) discardDraft();
  emit('update:modelValue', newValue);
  emit('change', newValue, oldValue);
  if (direction === 1) emit('increase', newValue);
  else if (direction === -1) emit('decrease', newValue);
  formItem?.onFieldChange();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!interactive.value || isComposingKeyboardEvent(event)) return;

  // 上下箭头键
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (event.shiftKey) {
      handleIncrease(largeStep.value); // Shift + 上箭头：大步长
    } else {
      handleIncrease();
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (event.shiftKey) {
      handleDecrease(largeStep.value); // Shift + 下箭头：大步长
    } else {
      handleDecrease();
    }
  }
  // PageUp/PageDown 快速增减
  else if (event.key === 'PageUp') {
    event.preventDefault();
    handleIncrease(largeStep.value);
  } else if (event.key === 'PageDown') {
    event.preventDefault();
    handleDecrease(largeStep.value);
  }
  // Home/End 跳转到最小/最大值
  else if (event.key === 'Home') {
    event.preventDefault();
    commitSteppedValue(props.min);
  } else if (event.key === 'End') {
    event.preventDefault();
    commitSteppedValue(props.max);
  }
};

const applyStep = (direction: 1 | -1, stepOrEvent?: number | Event) => {
  if (direction === 1 ? isIncreaseDisabled.value : isDecreaseDisabled.value) return;
  const step = typeof stepOrEvent === 'number' ? stepOrEvent : effectiveStep.value;
  commitSteppedValue(validateValue(addDecimal(stepValue.value ?? 0, direction * step)), direction);
};

const handleIncrease = (stepOrEvent?: number | Event) => applyStep(1, stepOrEvent);
const handleDecrease = (stepOrEvent?: number | Event) => applyStep(-1, stepOrEvent);

watch(interactive, canInteract => {
  if (!canInteract) {
    discardDraft();
  }
});

// 卸载时清理防抖待执行的定时器
onBeforeUnmount(() => {
  debouncedInput?.cancel();
});

// 暴露的方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const select = () => {
  inputRef.value?.select();
};

const increase = () => {
  handleIncrease();
};

const decrease = () => {
  handleDecrease();
};

const getElement = () => {
  return numberInputRef.value || null;
};

defineExpose<ExNumberInputExposed>({
  focus,
  blur,
  select,
  increase,
  decrease,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExNumberInput.scss"></style>
