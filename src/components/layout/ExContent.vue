<template>
  <component
    :is="tag"
    ref="contentRef"
    :class="contentClasses"
  >
    <div class="ex-content__inner">
      <slot></slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAnimation } from '../config-provider/composables';
import type { ExContentExposed, ExContentProps } from './types';

defineOptions({ name: 'ExContent' });

const props = withDefaults(defineProps<ExContentProps>(), {
  tag: 'main',
  grid: false,
  scanline: false,
});

const contentRef = ref<HTMLElement>();
const globalAnimation = useAnimation();
// 网格和扫描线由伪元素绘制，不增加无语义装饰节点。
const contentClasses = computed(() => [
  'ex-content',
  {
    'ex-content--grid': props.grid,
    'ex-content--scanline': props.scanline,
    'ex-content--no-animation': !globalAnimation.value,
  },
]);

const getElement = (): HTMLElement | null => contentRef.value ?? null;

defineExpose<ExContentExposed>({ getElement });
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-content {
  position: relative;
  isolation: isolate;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  padding: var(--ex-spacing-6);
  overflow: auto;
  background: var(--ex-color-bg-primary);
  @include custom-scrollbar;

  &__inner {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  &--grid::before,
  &--scanline::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    content: '';
    pointer-events: none;
  }

  &--grid::before {
    background-image:
      linear-gradient(
        rgba(var(--ex-color-cyber-green-rgb), var(--ex-cyber-grid-opacity)) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(var(--ex-color-cyber-cyan-rgb), var(--ex-cyber-grid-opacity)) 1px,
        transparent 1px
      );
    background-size: var(--ex-cyber-grid-size) var(--ex-cyber-grid-size);
    opacity: 0.9;
  }

  &--scanline::after {
    background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(0, 0, 0, 0.9) 2px 4px);
    opacity: var(--ex-cyber-scanline-opacity);
    animation: ex-content-scanline var(--ex-cyber-scanline-duration) linear infinite;
  }

  &--no-animation::after {
    animation: none;
  }

  @include mobile {
    padding: var(--ex-spacing-4);
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
}

@keyframes ex-content-scanline {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 0 100%;
  }
}
</style>
