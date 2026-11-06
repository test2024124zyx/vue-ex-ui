<template>
  <span
    :class="classes"
    :style="styles"
    :role="clickable && !closable ? 'button' : undefined"
    :tabindex="clickable && !closable ? 0 : undefined"
    :aria-label="clickable && !closable ? accessibleLabel : undefined"
    @click="handleClick"
    @keydown.enter="handleKeydown"
    @keydown.space.prevent="handleKeydown"
  >
    <span
      class="ex-tag__body"
      :role="clickable && closable ? 'button' : undefined"
      :tabindex="clickable && closable ? 0 : undefined"
      :aria-label="clickable && closable ? accessibleLabel : undefined"
      @keydown.enter.stop="handleKeydown"
      @keydown.space.stop.prevent="handleKeydown"
    >
      <span
        v-if="$slots.prefix"
        class="ex-tag__prefix"
      >
        <slot name="prefix"></slot>
      </span>

      <span class="ex-tag__content">
        <slot></slot>
      </span>
    </span>

    <button
      v-if="closable"
      type="button"
      class="ex-tag__close"
      :aria-label="closeAccessibleLabel"
      @click.stop="handleClose"
      @keydown.stop
    >
      <slot name="close">
        <ExIcon
          icon="close-line"
          :size="closeIconSize"
        />
      </slot>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TagProps } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useComponentSize } from '../config-provider/composables';
import { useLocale } from '../../locale';

const props = withDefaults(defineProps<TagProps>(), {
  type: 'primary',
  closable: false,
  clickable: false,
  round: false,
  effect: 'light',
});

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent];
  close: [event: MouseEvent];
}>();

const { t } = useLocale('tag');

const CLOSE_ICON_SIZES = {
  large: 14,
  medium: 12,
  small: 10,
} as const;

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

const closeIconSize = computed(() => CLOSE_ICON_SIZES[componentSize.value]);

const accessibleLabel = computed(() => props.ariaLabel?.trim() || undefined);
const closeAccessibleLabel = computed(() => props.closeAriaLabel?.trim() || t('close'));

const classes = computed(() => [
  'ex-tag',
  `ex-tag--${props.type}`,
  `ex-tag--${componentSize.value}`,
  `ex-tag--${props.effect}`,
  {
    'is-round': props.round,
    'is-closable': props.closable,
    'is-clickable': props.clickable,
  },
]);

const styles = computed(() => {
  const style: {
    '--ex-tag-text-color'?: string;
    '--ex-tag-bg-color'?: string;
    '--ex-tag-border-color'?: string;
  } = {};

  if (props.color) {
    style['--ex-tag-text-color'] = props.color;
  }
  if (props.bgColor) {
    style['--ex-tag-bg-color'] = props.bgColor;
  }
  if (props.borderColor) {
    style['--ex-tag-border-color'] = props.borderColor;
  }

  return style;
});

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.clickable) return;
  emit('click', event);
};

const handleClose = (event: MouseEvent) => {
  emit('close', event);
};
</script>
<style lang="scss" scoped src="./ExTag.scss"></style>
