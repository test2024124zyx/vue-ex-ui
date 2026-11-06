<template>
  <div
    ref="containerRef"
    :class="containerClasses"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExContainerExposed, ExContainerProps } from './types';

defineOptions({ name: 'ExContainer' });

const props = withDefaults(defineProps<ExContainerProps>(), {
  fluid: false,
  size: undefined,
});

const containerRef = ref<HTMLDivElement>();
// fluid 与固定尺寸互斥，避免同时输出相互覆盖的类名。
const containerClasses = computed(() => [
  'ex-container',
  props.fluid ? 'ex-container--fluid' : props.size ? `ex-container--${props.size}` : undefined,
]);

const getElement = (): HTMLDivElement | null => containerRef.value ?? null;

defineExpose<ExContainerExposed>({ getElement });
</script>

<style scoped lang="scss">
@use 'sass:map';
@use '../../styles/tokens' as *;
@use '../../styles/mixins' as *;

.ex-container {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  padding-inline: var(--ex-spacing-container, var(--ex-spacing-4));

  @include respond-to(sm) {
    max-width: map.get($sizes, container-sm);
  }

  @include respond-to(md) {
    max-width: map.get($sizes, container-md);
  }

  @include respond-to(lg) {
    max-width: map.get($sizes, container-lg);
  }

  @include respond-to(xl) {
    max-width: map.get($sizes, container-xl);
  }

  @include respond-to(2xl) {
    max-width: map.get($sizes, container-2xl);
  }

  &--fluid {
    max-width: none;
  }

  &--sm {
    max-width: map.get($sizes, container-sm);
  }

  &--md {
    max-width: map.get($sizes, container-md);
  }

  &--lg {
    max-width: map.get($sizes, container-lg);
  }

  &--xl {
    max-width: map.get($sizes, container-xl);
  }

  &--2xl {
    max-width: map.get($sizes, container-2xl);
  }
}
</style>
