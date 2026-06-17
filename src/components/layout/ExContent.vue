<template>
  <main
    ref="contentRef"
    :class="contentClasses"
    :style="contentStyles"
    role="main"
  >
    <!-- 背景网格效果 -->
    <div
      v-if="grid"
      class="ex-content__grid"
    />

    <!-- 扫描线效果 -->
    <div
      v-if="scanline"
      class="ex-content__scanline"
    />

    <!-- 内容 -->
    <div class="ex-content__inner">
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref } from 'vue';
import type { ExContentProps, ExContentExposed } from './types';

defineOptions({
  name: 'ExContent',
});

const props = withDefaults(defineProps<ExContentProps>(), {
  grid: false,
  scanline: false,
});

const contentRef = ref<HTMLElement>();

// 计算类名
const contentClasses = computed(() => {
  const classes = ['ex-content'];

  if (props.grid) classes.push('ex-content--grid');
  if (props.scanline) classes.push('ex-content--scanline');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

// 计算样式
const contentStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

// 暴露方法
const getElement = () => contentRef.value || null;

defineExpose<ExContentExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-content {
  position: relative;
  flex: auto;
  min-height: 0;
  padding: var(--ex-spacing-6);
  background: var(--ex-color-bg-primary);
  overflow-y: auto;
  @include custom-scrollbar();

  // 内容容器
  &__inner {
    position: relative;
    z-index: 1;
  }

  // 背景网格
  &__grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(var(--ex-color-border-primary) 1px, transparent 1px),
      linear-gradient(90deg, var(--ex-color-border-primary) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.1;
    pointer-events: none;
    z-index: 0;
  }

  // 扫描线效果
  &__scanline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      var(--ex-color-primary-alpha-05) 50%,
      transparent 100%
    );
    background-size: 100% 4px;
    animation: ex-scanline 8s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  // 响应式
  @include mobile {
    padding: var(--ex-spacing-4);
  }
}

// 扫描线动画
@keyframes ex-scanline {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}
</style>
