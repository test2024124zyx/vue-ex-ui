<script setup lang="ts">
import { computed, defineOptions } from 'vue';
import type { ExSpaceProps } from './types';

defineOptions({ name: 'ExSpace' });

const presetMap = {
  small: 8,
  medium: 12,
  large: 16,
} as const;

const props = withDefaults(defineProps<ExSpaceProps>(), {
  direction: 'horizontal',
  size: 'medium',
  wrap: false,
  align: 'start',
  justify: 'start',
});

const isVertical = computed(() => props.direction === 'vertical');
const gapPx = computed(() => {
  if (typeof props.size === 'number') return props.size;
  return presetMap[props.size] ?? presetMap.medium;
});

const classes = computed(() => [
  'ex-space',
  `ex-space--${props.direction}`,
  props.wrap ? 'is-wrap' : '',
]);

const justifyContent = computed(() => {
  switch (props.justify) {
  case 'start':
    return 'flex-start';
  case 'end':
    return 'flex-end';
  case 'center':
    return 'center';
  case 'space-between':
    return 'space-between';
  case 'space-around':
    return 'space-around';
  case 'space-evenly':
    return 'space-evenly';
  default:
    return 'flex-start';
  }
});

const alignItems = computed(() => {
  switch (props.align) {
  case 'start':
    return 'flex-start';
  case 'end':
    return 'flex-end';
  case 'center':
    return 'center';
  default:
    return 'flex-start';
  }
});
</script>

<template>
  <div
    class="ex-space"
    :class="classes"
    role="group"
    :style="{
      '--ex-space-gap': gapPx + 'px',
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      justifyContent: justifyContent,
      alignItems: alignItems,
    }"
  >
    <slot />
  </div>
</template>
