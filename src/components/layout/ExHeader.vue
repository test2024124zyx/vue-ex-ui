<template>
  <header ref="headerRef" :class="headerClasses" :style="headerStyles" role="banner">
    <!-- 左侧插槽 -->
    <div v-if="$slots.left" class="ex-header__left">
      <slot name="left" />
    </div>

    <!-- 中间插槽 -->
    <div v-if="$slots.center" class="ex-header__center">
      <slot name="center" />
    </div>

    <!-- 默认插槽 -->
    <div
      v-if="$slots.default && !$slots.left && !$slots.center && !$slots.right"
      class="ex-header__content"
    >
      <slot />
    </div>

    <!-- 右侧插槽 -->
    <div v-if="$slots.right" class="ex-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref } from 'vue';
import type { ExHeaderProps, ExHeaderExposed } from './types';
import { useNeonEffect, useAnimation } from '../config-provider/composables';

defineOptions({
  name: 'ExHeader',
});

const props = withDefaults(defineProps<ExHeaderProps>(), {
  height: 64,
  fixed: false,
  neonBorder: false,
  blur: false,
});

const headerRef = ref<HTMLElement>();

// 全局配置
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

// 计算类名
const headerClasses = computed(() => {
  const classes = ['ex-header'];

  if (props.fixed) classes.push('ex-header--fixed');
  // 支持全局霓虹效果配置
  if (props.neonBorder || (props.neonBorder === undefined && globalNeonEffect.value)) {
    classes.push('ex-header--neon-border');
  }
  if (props.blur) classes.push('ex-header--blur');
  // 支持全局动画配置
  if (!globalAnimation.value) classes.push('ex-header--no-animation');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

// 计算样式
const headerStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 高度
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  // 合并用户样式
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    } else {
      Object.assign(styles, props.style);
    }
  }

  return styles;
});

// 暴露方法
const getElement = () => headerRef.value || null;

defineExpose<ExHeaderExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-header {
  display: flex;
  align-items: center;
  padding: 0 var(--ex-spacing-6);
  background: var(--ex-color-bg-secondary);
  border-bottom: 1px solid var(--ex-color-border-primary);
  @include transition(all);

  // 左中右布局
  &__left,
  &__center,
  &__right {
    display: flex;
    align-items: center;
    gap: var(--ex-spacing-4);
  }

  &__left {
    margin-right: auto;
  }

  &__center {
    flex: 1;
    justify-content: center;
  }

  &__right {
    margin-left: auto;
  }

  &__content {
    flex: 1;
  }

  // 固定定位
  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--ex-z-sticky);
  }

  // 霓虹边框
  &--neon-border {
    border-bottom-color: var(--ex-color-primary);
    box-shadow: 0 2px 8px var(--ex-color-primary-alpha-20);
  }

  // 背景模糊
  &--blur {
    background: var(--ex-color-bg-secondary-alpha-80);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  // 禁用动画
  &--no-animation,
  &--no-animation * {
    transition: none !important;
    animation: none !important;
  }

  // 响应式
  @include mobile {
    padding: 0 var(--ex-spacing-4);
  }
}
</style>
