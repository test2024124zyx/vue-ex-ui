<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="buttonStyles"
    :type="nativeType"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    :aria-label="resolvedAriaLabel"
    :aria-busy="loading || undefined"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span
      v-if="loading"
      class="ex-button__loading-icon"
      aria-hidden="true"
    >
      <slot name="loading">
        <span
          class="ex-button__loading-spinner"
          aria-hidden="true"
        ></span>
      </slot>
    </span>

    <span
      v-if="$slots.prefix && !loading"
      class="ex-button__icon ex-button__icon--left"
    >
      <slot name="prefix"></slot>
    </span>

    <span
      v-if="showDefaultContent"
      class="ex-button__content"
    >
      <template v-if="circleSlotText !== undefined">{{ circleDisplayText }}</template>
      <slot v-else></slot>
    </span>

    <span
      v-if="$slots.suffix && !loading"
      class="ex-button__icon ex-button__icon--right"
    >
      <slot name="suffix"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, useSlots } from 'vue';
import { getFirstGrapheme } from '../../utils/text';
import { getPlainTextContent } from '../../utils/vnode';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExButton',
});

const props = withDefaults(defineProps<ExButtonProps>(), {
  type: 'default',
  size: undefined,
  shape: 'default',
  plain: false,
  glow: true,
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  autofocus: false,
});

const emit = defineEmits<ExButtonEmits>();
const slots = useSlots();

const buttonRef = ref<HTMLButtonElement>();

// 显式尺寸优先，否则继承 ConfigProvider。
const componentSize = useComponentSize(computed(() => props.size));

const plainSlotText = computed(() => getPlainTextContent(slots.default?.({})));
const circleSlotText = computed(() =>
  props.shape === 'circle' && plainSlotText.value !== undefined
    ? plainSlotText.value.trim()
    : undefined
);
const circleDisplayText = computed(() => getFirstGrapheme(circleSlotText.value ?? ''));
const resolvedAriaLabel = computed(
  () => props.ariaLabel || (circleSlotText.value ? circleSlotText.value : undefined)
);
const showDefaultContent = computed(
  () => Boolean(slots.default) && !(props.shape === 'circle' && props.loading)
);

// 计算属性
const buttonClasses = computed(() => {
  const classes = [
    'ex-button',
    `ex-button--${props.type}`,
    `ex-button--${componentSize.value}`,
    `ex-button--${props.shape}`,
  ];

  if (props.plain) classes.push('ex-button--plain');
  if (props.glow) classes.push('ex-button--glow');
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
