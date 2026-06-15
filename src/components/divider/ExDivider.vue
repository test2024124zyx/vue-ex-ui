<script setup lang="ts">
import { computed, defineOptions, useSlots } from 'vue';
import { useI18n } from '../../locale';
import type { ExDividerProps } from './types';

defineOptions({ name: 'ExDivider' });

const props = withDefaults(defineProps<ExDividerProps>(), {
  type: 'horizontal',
  orientation: 'center',
  dashed: false,
  size: 'default',
  plain: false,
});

const slots = useSlots();
const { t } = useI18n();

const isVertical = computed(() => props.type === 'vertical');
const hasTitle = computed(() => !!slots.default);

const classes = computed(() => [
  'ex-divider',
  `ex-divider--${props.type}`,
  {
    'ex-divider--dashed': props.dashed,
    'ex-divider--plain': props.plain,
    [`ex-divider--${props.orientation}`]: hasTitle.value && !isVertical.value,
    [`ex-divider--size-${props.size}`]: typeof props.size === 'string',
  },
]);

const dividerStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.margin !== undefined) {
    const margin = typeof props.margin === 'number' ? `${props.margin}px` : props.margin;
    style['--ex-divider-margin'] = isVertical.value ? `0 ${margin}` : `${margin} 0`;
  }

  if (typeof props.size === 'number') {
    style['--ex-divider-size'] = `${props.size}px`;
  }

  if (props.orientationMargin !== undefined && !isVertical.value) {
    const orientationMargin =
      typeof props.orientationMargin === 'number'
        ? `${props.orientationMargin}px`
        : props.orientationMargin;
    style['--ex-divider-orientation-margin'] = orientationMargin;
  }

  if (props.color) {
    style['--ex-divider-color'] = props.color;
  }

  return style;
});

const ariaLabel = computed(() => {
  if (hasTitle.value) return undefined;
  return isVertical.value ? t('divider.vertical') : t('divider.horizontal');
});
</script>

<template>
  <div
    :class="classes"
    role="separator"
    :aria-orientation="isVertical ? 'vertical' : 'horizontal'"
    :aria-label="ariaLabel"
    :style="dividerStyle"
  >
    <!-- 水平分割线：无文字时渲染单条连续线，避免两条半线在正中相接处出现断开 -->
    <template v-if="!isVertical">
      <div class="ex-divider__line" aria-hidden="true" />
      <template v-if="hasTitle">
        <div class="ex-divider__content">
          <slot />
        </div>
        <div class="ex-divider__line" aria-hidden="true" />
      </template>
    </template>

    <!-- 垂直分割线 -->
    <div v-else class="ex-divider__line ex-divider__line--vertical" aria-hidden="true" />
  </div>
</template>
<style scoped lang="scss" src="./ExDivider.scss"></style>
