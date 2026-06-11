<template>
  <div
    ref="containerRef"
    :class="containerClasses"
    :style="containerStyles"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExContainerProps, ExContainerExposed } from './types';

defineOptions({
  name: 'ExContainer',
});

const props = withDefaults(defineProps<ExContainerProps>(), {
  fluid: false,
  size: undefined,
});

const containerRef = ref<HTMLElement>();

// 计算类名
const containerClasses = computed(() => {
  const classes = ['ex-container'];

  if (props.fluid) {
    classes.push('ex-container--fluid');
  } else if (props.size) {
    classes.push(`ex-container--${props.size}`);
  }

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

// 计算样式
const containerStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

// 暴露方法
const getElement = () => containerRef.value || null;

defineExpose<ExContainerExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--ex-spacing-4);
  padding-right: var(--ex-spacing-4);

  // 响应式容器宽度（基于项目标准断点）
  @include respond-to(sm) {
    max-width: 448px;  // 480px - 32px padding
    padding-left: var(--ex-spacing-6);
    padding-right: var(--ex-spacing-6);
  }

  @include respond-to(md) {
    max-width: 720px;  // 768px - 48px padding
  }

  @include respond-to(lg) {
    max-width: 960px;  // 1024px - 64px padding
    padding-left: var(--ex-spacing-8);
    padding-right: var(--ex-spacing-8);
  }

  @include respond-to(xl) {
    max-width: 1216px; // 1280px - 64px padding
  }

  @include respond-to(2xl) {
    max-width: 1472px; // 1536px - 64px padding
  }

  // 流式容器（100%宽度）
  &--fluid {
    max-width: 100%;
  }

  // 固定尺寸容器（基于项目标准断点）
  &--sm {
    max-width: 448px;  // 480px - padding
  }

  &--md {
    max-width: 720px;  // 768px - padding
  }

  &--lg {
    max-width: 960px;  // 1024px - padding
  }

  &--xl {
    max-width: 1216px; // 1280px - padding
  }

  &--2xl {
    max-width: 1472px; // 1536px - padding
  }
}
</style>
