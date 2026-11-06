<template>
  <div
    class="ex-flex-item"
    :style="flexItemStyles"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { normalizeFlexOrder, resolveFlexShorthand } from './flex-utils';
import type { ExFlexItemProps } from './types';

defineOptions({
  name: 'ExFlexItem',
});

const props = withDefaults(defineProps<ExFlexItemProps>(), {
  grow: 0,
  shrink: 1,
  basis: 'auto',
  alignSelf: 'auto',
  order: 0,
});

const flexItemStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {};
  const flex = resolveFlexShorthand(props.flex, props.grow, props.shrink, props.basis);
  const order = normalizeFlexOrder(props.order);
  if (flex !== undefined) styles.flex = flex;
  if (props.alignSelf !== 'auto') styles.alignSelf = props.alignSelf;
  if (order !== 0) styles.order = order;
  return styles;
});
</script>

<style scoped lang="scss" src="./ExFlexItem.scss"></style>
