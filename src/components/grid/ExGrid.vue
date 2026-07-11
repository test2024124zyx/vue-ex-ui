<template>
  <div
    :class="gridClasses"
    :style="gridStyles"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { normalizeGridGutter } from './grid-utils';
import type { ExGridProps } from './types';

defineOptions({
  name: 'ExGrid',
});

const props = withDefaults(defineProps<ExGridProps>(), {
  gutter: 0,
  justify: 'start',
  align: 'top',
  wrap: true,
});

const gridClasses = computed(() => [
  'ex-grid',
  `ex-grid--justify-${props.justify}`,
  `ex-grid--align-${props.align}`,
  { 'ex-grid--nowrap': !props.wrap },
]);

const gridStyles = computed<Record<string, string>>(() => {
  const gutter = normalizeGridGutter(props.gutter);
  // 即使为 0 也显式写入，避免嵌套 Grid 继承外层 gutter。
  return {
    '--ex-grid-gutter-x': `${gutter.horizontal}px`,
    '--ex-grid-gutter-y': `${gutter.vertical}px`,
  };
});
</script>

<style scoped lang="scss" src="./ExGrid.scss"></style>
