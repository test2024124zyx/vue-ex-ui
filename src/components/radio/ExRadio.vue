<template>
  <div :class="wrapperClasses" :style="wrapperStyles">
    <label :class="radioClasses" :for="radioId">
      <!-- 隐藏的原生单选框 -->
      <input
        v-if="radioGroupContext"
        :id="radioId"
        ref="radioRef"
        type="radio"
        :class="inputClasses"
        :name="radioName"
        :value="value"
        :checked="isChecked"
        :disabled="currentDisabled"
        :readonly="currentReadonly"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="showErrorMessage"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <input
        v-else
        :id="radioId"
        ref="radioRef"
        v-model="radioValue"
        type="radio"
        :class="inputClasses"
        :name="radioName"
        :value="value"
        :disabled="currentDisabled"
        :readonly="currentReadonly"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="showErrorMessage"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- 自定义单选框外观 -->
      <span :class="radioBoxClasses">
        <span v-if="isChecked" class="ex-radio__dot" />
      </span>

      <!-- 标签文本 -->
      <span v-if="hasLabel" class="ex-radio__label-text">
        <slot>{{ label }}</slot>
      </span>
    </label>

    <!-- 底部信息 -->
    <div v-if="showBottomInfo" class="ex-radio__bottom">
      <!-- 帮助文本 -->
      <div v-if="helpText || $slots.help" :id="`${radioId}-help`" class="ex-radio__help">
        <slot name="help">
          {{ helpText }}
        </slot>
      </div>

      <!-- 错误信息 -->
      <transition name="ex-radio-error">
        <div
          v-if="showErrorMessage"
          :id="`${radioId}-error`"
          class="ex-radio__error"
          role="alert"
          aria-live="polite"
        >
          <ex-icon icon="error-warning-line" :size="14" class="ex-radio__error-icon" />
          <slot name="error">
            {{ currentErrorMessage }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, useSlots, inject } from 'vue';
import type { ExRadioProps, ExRadioEmits, ExRadioSlots, ExRadioInstance } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExRadio',
});

const props = withDefaults(defineProps<ExRadioProps>(), {
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  status: 'default',
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<ExRadioEmits>();

defineSlots<ExRadioSlots>();

const slots = useSlots();
const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 注入 RadioGroup 上下文
const radioGroupContext = inject<{
  modelValue: import('vue').ComputedRef<string | number | boolean>;
  name?: string;
  size?: import('vue').ComputedRef<string>;
  status?: string;
  disabled?: boolean;
  readonly?: boolean;
  updateValue: (value: string | number | boolean) => void;
} | null>('radioGroup', null);

const radioId = `ex-radio-${Math.random().toString(36).substring(2, 11)}`;
const radioRef = ref<HTMLInputElement>();
const isFocused = ref(false);
const currentErrorMessage = ref('');

// 计算属性
const radioValue = computed({
  get: () => {
    return radioGroupContext ? radioGroupContext.modelValue.value : props.modelValue;
  },
  set: value => {
    if (value !== undefined) {
      if (radioGroupContext) {
        radioGroupContext.updateValue(value);
      } else {
        emit('update:modelValue', value);
      }
    }
  },
});

const isChecked = computed(() => {
  return radioValue.value === props.value;
});

const hasLabel = computed(() => {
  return Boolean(props.label || slots.default);
});

const radioName = computed(() => {
  return radioGroupContext?.name || props.name || `radio-${radioId}`;
});

const currentSize = computed(() => {
  // 优先级：组件自己的 size prop > RadioGroup 的 size > ConfigProvider 的 size
  if (props.size) {
    return props.size;
  }
  return radioGroupContext?.size?.value || componentSize.value;
});

const currentStatus = computed(() => {
  return radioGroupContext?.status || props.status;
});

const currentDisabled = computed(() => {
  return radioGroupContext?.disabled || props.disabled;
});

const currentReadonly = computed(() => {
  return radioGroupContext?.readonly || props.readonly;
});

// Icon size is handled by the icon component itself based on the radio size

// 样式类
const wrapperClasses = computed(() => {
  const classes = ['ex-radio'];

  if (currentSize.value) classes.push(`ex-radio--${currentSize.value}`);
  if (currentStatus.value) classes.push(`ex-radio--${currentStatus.value}`);
  if (currentDisabled.value) classes.push('ex-radio--disabled');
  if (currentReadonly.value) classes.push('ex-radio--readonly');
  if (isFocused.value) classes.push('ex-radio--focused');
  if (isChecked.value) classes.push('ex-radio--checked');
  if (currentStatus.value === 'error' || showErrorMessage.value) {
    classes.push('ex-radio--error');
  }
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const radioClasses = computed(() => {
  const classes = ['ex-radio__wrapper'];
  if (currentDisabled.value) classes.push('ex-radio__wrapper--disabled');
  return classes;
});

const inputClasses = computed(() => {
  return ['ex-radio__input'];
});

const radioBoxClasses = computed(() => {
  const classes = ['ex-radio__box'];

  if (isChecked.value) classes.push('ex-radio__box--checked');
  if (currentDisabled.value) classes.push('ex-radio__box--disabled');

  return classes;
});

const wrapperStyles = computed(() => {
  return props.customStyle || {};
});

const showErrorMessage = computed(() => {
  return Boolean(currentErrorMessage.value) || currentStatus.value === 'error';
});

const showBottomInfo = computed(() => {
  return props.helpText || slots.help || showErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  const ids: string[] = [];

  if (props.helpText || slots.help) {
    ids.push(`${radioId}-help`);
  }

  if (showErrorMessage.value) {
    ids.push(`${radioId}-error`);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
});

// 事件处理
const handleChange = (event: Event) => {
  if (currentDisabled.value || currentReadonly.value) {
    event.preventDefault();
    return;
  }

  if (radioGroupContext && props.value !== undefined) {
    radioGroupContext.updateValue(props.value);
  } else if (props.value !== undefined) {
    validateRadio(props.value);
    emit('change', props.value, event);
  }
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};

// 验证
const validateRadio = (value: string | number | boolean) => {
  if (!props.rules || props.rules.length === 0) {
    currentErrorMessage.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      currentErrorMessage.value =
        typeof result === 'string' ? result : t('common.validationError') || '验证失败';
      return false;
    }
  }

  currentErrorMessage.value = '';
  return true;
};

watch(
  () => props.errorMessage,
  newError => {
    if (newError) {
      currentErrorMessage.value = newError;
    }
  },
  { immediate: true }
);

// 暴露方法
const focus = () => {
  radioRef.value?.focus();
};

const blur = () => {
  radioRef.value?.blur();
};

const getRadioElement = () => {
  return radioRef.value || null;
};

defineExpose<ExRadioInstance>({
  focus,
  blur,
  getRadioElement,
});
</script>

<style scoped lang="scss" src="./ExRadio.scss"></style>
