<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGlobalSize } from '../config-provider/composables';
import type { ExSpaceProps } from './types';
import { SPACE_SIZE_PRESETS, resolveSpaceGap } from './space-utils';

defineOptions({ name: 'ExSpace' });

const rootRef = ref<HTMLElement>();
const getElement = () => rootRef.value || null;
defineExpose({ getElement });

const props = withDefaults(defineProps<ExSpaceProps>(), {
  direction: 'horizontal',
  wrap: false,
  align: 'start',
  justify: 'start',
});

const globalSize = useGlobalSize();
const isVertical = computed(() => props.direction === 'vertical');
const gapValue = computed(() => {
  const size = props.size ?? globalSize.value;
  return resolveSpaceGap(size) ?? `${SPACE_SIZE_PRESETS.medium}px`;
});

const classes = computed(() => [`ex-space--${props.direction}`, props.wrap ? 'is-wrap' : '']);

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
    ref="rootRef"
    class="ex-space"
    :class="classes"
    :style="{
      '--ex-space-gap': gapValue,
      flexDirection: isVertical ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      justifyContent: justifyContent,
      alignItems: alignItems,
    }"
  >
    <slot></slot>
  </div>
</template>
