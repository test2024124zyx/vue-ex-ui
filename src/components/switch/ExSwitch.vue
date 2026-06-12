<template>
  <div :class="switchClasses" :style="switchStyles" @click="handleClick">
    <!-- 开关前文本 -->
    <span
      v-if="inactiveText && !inlinePrompt"
      class="ex-switch__label ex-switch__label--left"
      :class="{ 'is-active': !isChecked }"
    >
      {{ inactiveText }}
    </span>

    <!-- 开关主体 -->
    <div class="ex-switch__core" :style="coreStyle">
      <!-- 内联文本 -->
      <span v-if="inlinePrompt && hasText" class="ex-switch__inner">
        <span class="ex-switch__inner-text">
          <slot v-if="isChecked" name="active">{{ activeText }}</slot>
          <slot v-else name="inactive">{{ inactiveText }}</slot>
        </span>
      </span>

      <!-- 开关按钮 -->
      <div class="ex-switch__action">
        <div v-if="loading" class="ex-switch__loading">
          <div class="ex-switch__spinner" />
        </div>
      </div>

      <!-- 隐藏的原生 input -->
      <input
        :id="id"
        ref="inputRef"
        type="checkbox"
        class="ex-switch__input"
        :name="name"
        :disabled="disabled"
        :checked="isChecked"
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
    </div>

    <!-- 开关后文本 -->
    <span
      v-if="activeText && !inlinePrompt"
      class="ex-switch__label ex-switch__label--right"
      :class="{ 'is-active': isChecked }"
    >
      {{ activeText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue';
import type { ExSwitchProps, ExSwitchEmits, ExSwitchInstance } from './types';
import { useComponentSize } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';

defineOptions({
  name: 'ExSwitch',
});

const props = withDefaults(defineProps<ExSwitchProps>(), {
  modelValue: false,
  activeValue: true,
  inactiveValue: false,
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  disabled: false,
  loading: false,
  inlinePrompt: false,
  required: false,
});

const emit = defineEmits<ExSwitchEmits>();

const inputRef = ref<HTMLInputElement>();
const isFocused = ref(false);

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 所在 FormItem 的字段上下文（用于 change 自动校验）
const formItem = useFormItem();

// 计算属性
const isChecked = computed(() => {
  return props.modelValue === props.activeValue;
});

const slots = useSlots();

const hasText = computed(() => {
  return !!(props.activeText || props.inactiveText || slots.active || slots.inactive);
});

const switchClasses = computed(() => {
  const classes = ['ex-switch', `ex-switch--${componentSize.value}`];

  if (isChecked.value) classes.push('is-checked');
  if (props.disabled) classes.push('is-disabled');
  if (props.loading) classes.push('is-loading');
  if (isFocused.value) classes.push('is-focused');
  if (hasText.value) classes.push('has-text');
  if (props.inlinePrompt && hasText.value) classes.push('has-inline-prompt');
  if (props.validateStatus) classes.push(`is-${props.validateStatus}`);
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const switchStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.customStyle) {
    Object.assign(styles, props.customStyle);
  }

  return styles;
});

const coreStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (isChecked.value && props.activeColor) {
    styles.backgroundColor = props.activeColor;
    styles.borderColor = props.activeColor;
  } else if (!isChecked.value && props.inactiveColor) {
    styles.backgroundColor = props.inactiveColor;
    styles.borderColor = props.inactiveColor;
  }

  return styles;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }

  toggle();
};

const handleChange = (event: Event) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }

  const target = event.target as HTMLInputElement;
  const newValue = target.checked ? props.activeValue : props.inactiveValue;

  emit('update:modelValue', newValue);
  emit('change', newValue);
  formItem?.onFieldChange();
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) return;

  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    toggle();
    emit('keydown', event);
  }
};

// 暴露方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const toggle = () => {
  if (props.disabled || props.loading) return;

  const newValue = isChecked.value ? props.inactiveValue : props.activeValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  formItem?.onFieldChange();
};

defineExpose<ExSwitchInstance>({
  focus,
  blur,
  toggle,
});
</script>

<style scoped lang="scss" src="./ExSwitch.scss"></style>
