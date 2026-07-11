<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="buttonStyles"
    :type="nativeType"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span v-if="loading" class="ex-button__loading-icon">
      <slot name="loading">
        <span class="ex-button__loading-spinner" aria-hidden="true" />
      </slot>
    </span>

    <span v-if="$slots.prefix && !loading" class="ex-button__icon ex-button__icon--left">
      <slot name="prefix" />
    </span>

    <span v-if="$slots.default" class="ex-button__content">
      <slot />
    </span>

    <span v-if="$slots.suffix && !loading" class="ex-button__icon ex-button__icon--right">
      <slot name="suffix" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref } from 'vue';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExButton',
});

const props = withDefaults(defineProps<ExButtonProps>(), {
  type: 'primary',
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  shape: 'default',
  plain: false,
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  autofocus: false,
});

const emit = defineEmits<ExButtonEmits>();

const buttonRef = ref<HTMLButtonElement>();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 计算属性
const buttonClasses = computed(() => {
  const classes = [
    'ex-button',
    `ex-button--${props.type}`,
    `ex-button--${componentSize.value}`,
    `ex-button--${props.shape}`,
  ];

  if (props.plain) classes.push('ex-button--plain');
  if (props.disabled) classes.push('ex-button--disabled');
  if (props.loading) classes.push('ex-button--loading');
  if (props.block) classes.push('ex-button--block');
  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const buttonStyles = computed(() => {
  if (!props.style) return undefined;

  if (typeof props.style === 'string') {
    return props.style;
  }

  return props.style;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

// 暴露的方法
const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

const getElement = () => {
  return buttonRef.value || null;
};

defineExpose<ExButtonExposed>({
  focus,
  blur,
  getElement,
});
</script>
<style scoped lang="scss" src="./ExButton.scss"></style>
