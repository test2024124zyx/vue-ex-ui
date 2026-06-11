<template>
  <div ref="numberInputRef" :class="numberInputClasses" :style="numberInputStyles">
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
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue ?? undefined"
      role="spinbutton"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- 右侧控制按钮 -->
    <div v-if="controls && controlsPosition === 'right'" class="ex-number-input__controls">
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
import { computed, ref, watch } from 'vue';
import type { ExNumberInputProps, ExNumberInputEmits, ExNumberInputExposed } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { debounce } from '../../utils/debounce';
import { useFormItem } from '../form/use-form-item';
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
const componentSize = useComponentSize(computed(() => props.size));

// 所在 FormItem 的字段上下文（用于 blur 自动校验；change 由 FormItem 的 model watch 兜底）
const formItem = useFormItem();

const numberInputRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const displayValue = ref<string>('');
const isFocused = ref(false);

// 计算属性
const numberInputClasses = computed(() => {
  const classes = [
    'ex-number-input',
    `ex-number-input--${componentSize.value}`,
    `ex-number-input--controls-${props.controlsPosition}`,
  ];

  if (props.disabled) classes.push('ex-number-input--disabled');
  if (props.readonly) classes.push('ex-number-input--readonly');
  if (isFocused.value) classes.push('ex-number-input--focused');
  if (!props.controls) classes.push('ex-number-input--no-controls');

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

const numberInputStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const isIncreaseDisabled = computed(() => {
  if (props.modelValue === null) return false;
  return props.modelValue >= props.max;
});

const isDecreaseDisabled = computed(() => {
  if (props.modelValue === null) return false;
  return props.modelValue <= props.min;
});

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

// 格式化数字（处理浮点数精度问题）
const formatNumber = (value: number): number => {
  if (props.precision !== undefined) {
    // 使用更可靠的方法处理精度
    const multiplier = Math.pow(10, props.precision);
    return Math.round(value * multiplier) / multiplier;
  }
  return value;
};

// 验证并限制数值范围
const validateValue = (value: number): number => {
  let result = value;

  // 限制范围
  if (result < props.min) result = props.min;
  if (result > props.max) result = props.max;

  // 严格步长模式
  if (props.strictStep && props.step !== 0) {
    const steps = Math.round((result - props.min) / props.step);
    result = props.min + steps * props.step;
  }

  return formatNumber(result);
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
  if (isNaN(num)) return props.modelValue;

  return num;
};

// 更新显示值
const updateDisplayValue = () => {
  if (isFocused.value) return; // 聚焦时不更新显示值

  if (props.modelValue === null) {
    displayValue.value = '';
  } else {
    // 应用精度格式化
    const formattedValue = formatNumber(props.modelValue);
    displayValue.value = String(formattedValue);
  }
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  () => {
    updateDisplayValue();
  },
  { immediate: true }
);

// 防抖的输入事件
const debouncedInput =
  props.debounceDelay > 0
    ? debounce((value: number) => {
        emit('input', value);
      }, props.debounceDelay)
    : null;

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // 实时输入过滤（只允许数字、负号、小数点）
  const filtered = value.replace(/[^\d.-]/g, '');
  if (filtered !== value) {
    value = filtered;
    target.value = filtered;
  }

  displayValue.value = value;

  const parsedValue = parseValue(value);
  if (parsedValue !== null) {
    if (debouncedInput) {
      debouncedInput(parsedValue);
    } else {
      emit('input', parsedValue);
    }
  }
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  const parsedValue = parseValue(value);
  if (parsedValue === null) {
    emit('update:modelValue', null);
    emit('change', null, props.modelValue);
    return;
  }

  const validatedValue = validateValue(parsedValue);
  const oldValue = props.modelValue;

  emit('update:modelValue', validatedValue);
  emit('change', validatedValue, oldValue);

  // 更新显示值
  displayValue.value = String(validatedValue);
};

const handleFocus = (event: FocusEvent) => {
  if (props.disabled || props.readonly) return;
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  updateDisplayValue();
  emit('blur', event);
  formItem?.onFieldBlur();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return;

  // 上下箭头键
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (event.shiftKey) {
      handleIncrease(props.step * 10); // Shift + 上箭头：大步长
    } else {
      handleIncrease();
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (event.shiftKey) {
      handleDecrease(props.step * 10); // Shift + 下箭头：大步长
    } else {
      handleDecrease();
    }
  }
  // PageUp/PageDown 快速增减
  else if (event.key === 'PageUp') {
    event.preventDefault();
    handleIncrease(props.step * 10);
  } else if (event.key === 'PageDown') {
    event.preventDefault();
    handleDecrease(props.step * 10);
  }
  // Home/End 跳转到最小/最大值
  else if (event.key === 'Home') {
    event.preventDefault();
    if (props.min !== -Infinity) {
      const oldValue = props.modelValue;
      emit('update:modelValue', props.min);
      emit('change', props.min, oldValue);
    }
  } else if (event.key === 'End') {
    event.preventDefault();
    if (props.max !== Infinity) {
      const oldValue = props.modelValue;
      emit('update:modelValue', props.max);
      emit('change', props.max, oldValue);
    }
  }
};

const handleIncrease = (customStepOrEvent?: number | Event) => {
  if (props.disabled || isIncreaseDisabled.value) return;

  // 如果是事件对象，忽略它
  const customStep = typeof customStepOrEvent === 'number' ? customStepOrEvent : undefined;

  const currentValue = props.modelValue ?? 0;
  const stepValue = customStep ?? props.step;
  const newValue = validateValue(currentValue + stepValue);
  const oldValue = props.modelValue;

  emit('update:modelValue', newValue);
  emit('change', newValue, oldValue);
  emit('increase', newValue);
};

const handleDecrease = (customStepOrEvent?: number | Event) => {
  if (props.disabled || isDecreaseDisabled.value) return;

  // 如果是事件对象，忽略它
  const customStep = typeof customStepOrEvent === 'number' ? customStepOrEvent : undefined;

  const currentValue = props.modelValue ?? 0;
  const stepValue = customStep ?? props.step;
  const newValue = validateValue(currentValue - stepValue);
  const oldValue = props.modelValue;

  emit('update:modelValue', newValue);
  emit('change', newValue, oldValue);
  emit('decrease', newValue);
};

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
