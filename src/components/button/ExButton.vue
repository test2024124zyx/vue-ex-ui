<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="props.style"
    :data-ex-button-glitch-text="glitchText || undefined"
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
      v-if="$slots.prefix"
      class="ex-button__icon ex-button__icon--left"
      aria-hidden="true"
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
      v-if="$slots.suffix"
      class="ex-button__icon ex-button__icon--right"
      aria-hidden="true"
    >
      <slot name="suffix"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useRenderComputed } from '../../composables/useRenderComputed';
import { computed, onMounted, ref, useAttrs, useSlots, watch } from 'vue';
import { getFirstGrapheme } from '../../utils/text';
import { getPlainTextContent } from '../../utils/vnode';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

import { useAnimation, useComponentSize, useNeonEffect } from '../config-provider/composables';

defineOptions({
  name: 'ExButton',
});

const defaultGlowTypes = new Set<NonNullable<ExButtonProps['type']>>([
  'primary',
  'success',
  'warning',
  'danger',
  'error',
  'info',
]);

const props = withDefaults(defineProps<ExButtonProps>(), {
  type: 'default',
  size: undefined,
  shape: 'default',
  plain: false,
  glow: undefined,
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  autofocus: false,
});

const emit = defineEmits<ExButtonEmits>();
const attrs = useAttrs();
const slots = useSlots();

const buttonRef = ref<HTMLButtonElement>();

// 显式尺寸优先，否则继承 ConfigProvider。
const componentSize = useComponentSize(computed(() => props.size));
const neonEffect = useNeonEffect();
const animation = useAnimation();
const glowEnabled = computed(
  () => neonEffect.value && (props.glow ?? defaultGlowTypes.has(props.type))
);

const plainSlotText = useRenderComputed(() => getPlainTextContent(slots.default?.({})));
const circleSlotText = computed(() =>
  props.shape === 'circle' && plainSlotText.value !== undefined
    ? plainSlotText.value.trim()
    : undefined
);
const circleDisplayText = computed(() => getFirstGrapheme(circleSlotText.value ?? ''));
const glitchText = computed(() => {
  if (!glowEnabled.value || props.loading || props.disabled) return undefined;

  const text =
    props.shape === 'circle'
      ? circleDisplayText.value
      : plainSlotText.value?.replace(/\s+/g, ' ').trim();

  return text || undefined;
});
const nativeAriaLabel = useRenderComputed(() => {
  const value = attrs['aria-label'];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
});
const resolvedAriaLabel = computed(() => {
  const explicitLabel = props.ariaLabel?.trim() || nativeAriaLabel.value;
  if (explicitLabel) return explicitLabel;

  if (circleSlotText.value) return circleSlotText.value;

  if (props.loading) return plainSlotText.value?.trim() || undefined;

  return undefined;
});
const showDefaultContent = useRenderComputed(
  () => Boolean(slots.default) && !(props.shape === 'circle' && props.loading)
);

// 计算属性
// 仅在开发环境提示缺少可访问名称的图标按钮，避免生产环境增加运行时开销。
const warnIfMissingAccessibleName = () => {
  if (!import.meta.env.DEV) return;

  const button = buttonRef.value;
  if (!button) return;

  const contentText = button.querySelector('.ex-button__content')?.textContent?.trim();
  const hasAccessibleName = Boolean(
    button.getAttribute('aria-label')?.trim() ||
    contentText ||
    button.getAttribute('aria-labelledby')?.trim() ||
    button.getAttribute('title')?.trim()
  );

  if (!hasAccessibleName) {
    console.warn(
      '[ExButton] 图标或空按钮必须提供 ariaLabel（模板属性可使用 aria-label），以保证可访问名称。'
    );
  }
};

onMounted(warnIfMissingAccessibleName);
watch(
  [() => props.ariaLabel, () => props.loading, () => props.shape],
  warnIfMissingAccessibleName,
  {
    flush: 'post',
  }
);

const buttonClasses = computed(() => {
  const classes = [
    'ex-button',
    `ex-button--${props.type}`,
    `ex-button--${componentSize.value}`,
    `ex-button--${props.shape}`,
    `ex-button--shape-${props.shape}`,
  ];

  if (props.plain) classes.push('ex-button--plain');
  if (glowEnabled.value) classes.push('ex-button--glow');
  if (!neonEffect.value) classes.push('ex-button--no-neon');
  if (!animation.value) classes.push('ex-button--no-animation');
  if (props.disabled) classes.push('ex-button--disabled');
  if (props.loading) classes.push('ex-button--loading');
  if (props.block) classes.push('ex-button--block');
  classes.push(...normalizeCustomClass(props.class));

  return classes;
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
