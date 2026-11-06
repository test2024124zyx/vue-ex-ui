<template>
  <component
    :is="rootTag"
    v-bind="$attrs"
    :class="iconClasses"
    :style="iconStyles"
    :type="clickable ? 'button' : undefined"
    :disabled="clickable && disabled ? true : undefined"
    :role="rootRole"
    :aria-label="accessibleLabel"
    :aria-hidden="rootAriaHidden"
    @click="handleClick"
  >
    <span
      v-if="hasVisual"
      class="ex-icon__content"
      aria-hidden="true"
    >
      <slot v-if="hasSlotContent"></slot>

      <!-- 内置内容来自冻结注册表，不接受运行时写入。 -->
      <!-- eslint-disable vue/no-v-html -->
      <svg
        v-else-if="builtinIconBody"
        viewBox="0 0 24 24"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        v-html="builtinIconBody"
      />
      <!-- eslint-enable vue/no-v-html -->

      <span
        v-else-if="src && color"
        class="ex-icon__image-mask"
        :style="imageMaskStyle"
      ></span>

      <img
        v-else-if="src"
        class="ex-icon__image"
        :src="src"
        alt=""
        aria-hidden="true"
        decoding="async"
        draggable="false"
      />

      <i
        v-else-if="fontIconClasses.length"
        :class="fontIconClasses"
      ></i>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots, type CSSProperties } from 'vue';
import { useRenderComputed } from '../../composables/useRenderComputed';
import { hasRenderableContent } from '../../utils/vnode';
import {
  createIconMaskUrl,
  getFontIconClasses,
  normalizeIconRotation,
  normalizeIconSize,
} from './icon-utils';
import { getBuiltinIcon } from './icons';
import type { ExIconEmits, ExIconProps } from './types';

defineOptions({
  name: 'ExIcon',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExIconProps>(), {
  size: 16,
  clickable: false,
  disabled: false,
  spin: false,
  rotate: 0,
});

const emit = defineEmits<ExIconEmits>();
const attrs = useAttrs();
const slots = useSlots();

const rootTag = computed(() => (props.clickable ? 'button' : 'span'));
const hasSlotContent = useRenderComputed(() => hasRenderableContent(slots.default?.({})));
const builtinIconBody = computed(() => (props.icon ? getBuiltinIcon(props.icon) : ''));
const fontIconClasses = computed(() => getFontIconClasses(props.name, props.prefix));
const hasVisual = computed(
  () =>
    hasSlotContent.value ||
    Boolean(builtinIconBody.value) ||
    Boolean(props.src) ||
    fontIconClasses.value.length > 0
);

const iconClasses = computed(() => [
  'ex-icon',
  props.customClass,
  {
    'ex-icon--empty': !hasVisual.value,
    'ex-icon--clickable': props.clickable,
    'ex-icon--disabled': props.clickable && props.disabled,
    'ex-icon--spin': props.spin,
  },
]);

const iconStyles = computed<CSSProperties>(
  () =>
    ({
      '--ex-icon-size': normalizeIconSize(props.size),
      '--ex-icon-rotation': `${normalizeIconRotation(props.rotate)}deg`,
      ...(props.color ? { color: props.color } : {}),
    }) as CSSProperties
);

const imageMaskStyle = computed<CSSProperties>(
  () =>
    ({
      '--ex-icon-src': props.src ? createIconMaskUrl(props.src) : undefined,
    }) as CSSProperties
);

const attributeLabel = useRenderComputed(() => {
  const value = attrs['aria-label'];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
});

const accessibleLabel = computed(() => {
  const explicit = attributeLabel.value || props.ariaLabel?.trim() || props.alt?.trim();
  if (explicit) return explicit;
  if (!props.clickable) return undefined;
  return props.icon || props.name || undefined;
});

const rootRole = computed(() => {
  if (typeof attrs.role === 'string') return attrs.role;
  return !props.clickable && accessibleLabel.value ? 'img' : undefined;
});

const rootAriaHidden = computed(() => {
  const explicit = attrs['aria-hidden'];
  if (explicit !== undefined) return explicit as string | boolean;
  return !props.clickable && !accessibleLabel.value ? 'true' : undefined;
});

const handleClick = (event: MouseEvent) => {
  if (!props.clickable || props.disabled) return;
  emit('click', event);
};
</script>

<style scoped lang="scss" src="./ExIcon.scss"></style>
