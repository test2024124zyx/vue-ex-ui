<template>
  <div
    :class="flexClasses"
    :style="flexStyles"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { resolveFlexGap } from './flex-utils';
import type { ExFlexProps } from './types';

defineOptions({
  name: 'ExFlex',
});

const props = withDefaults(defineProps<ExFlexProps>(), {
  direction: 'row',
  wrap: 'nowrap',
  justify: 'flex-start',
  align: 'flex-start',
  alignContent: 'stretch',
  inline: false,
  vertical: false,
});

const flexClasses = computed(() => [
  'ex-flex',
  {
    'ex-flex--inline': props.inline,
    'ex-flex--vertical': props.vertical,
  },
]);

const flexStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    flexDirection: props.vertical ? 'column' : props.direction,
    flexWrap: props.wrap,
    justifyContent: props.justify,
    alignItems: props.align,
  };

  if (props.wrap !== 'nowrap') styles.alignContent = props.alignContent;
  const gap = resolveFlexGap(props.gap);
  const rowGap = resolveFlexGap(props.rowGap);
  const columnGap = resolveFlexGap(props.columnGap);
  if (gap !== undefined) styles.gap = gap;
  if (rowGap !== undefined) styles.rowGap = rowGap;
  if (columnGap !== undefined) styles.columnGap = columnGap;
  return styles;
});
</script>

<style scoped lang="scss" src="./ExFlex.scss"></style>
