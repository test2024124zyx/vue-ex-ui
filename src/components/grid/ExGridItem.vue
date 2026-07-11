<template>
  <div
    class="ex-grid-item"
    :style="gridItemStyles"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { createGridItemStyles } from './grid-utils';
import type { ExGridItemProps } from './types';

defineOptions({
  name: 'ExGridItem',
});

const props = withDefaults(defineProps<ExGridItemProps>(), {
  span: 24,
  offset: 0,
  push: 0,
  pull: 0,
  order: 0,
});

const gridItemStyles = computed(() => createGridItemStyles(props));
</script>

<style scoped lang="scss" src="./ExGridItem.scss"></style>
