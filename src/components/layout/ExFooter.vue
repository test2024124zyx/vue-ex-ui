<template>
  <footer ref="footerRef" :class="footerClasses" :style="footerStyles" role="contentinfo">
    <!-- 左侧插槽 -->
    <div v-if="$slots.left" class="ex-footer__left">
      <slot name="left" />
    </div>

    <!-- 中间插槽 -->
    <div v-if="$slots.center" class="ex-footer__center">
      <slot name="center" />
    </div>

    <!-- 默认插槽 -->
    <div
      v-if="$slots.default && !$slots.left && !$slots.center && !$slots.right"
      class="ex-footer__content"
    >
      <slot />
    </div>

    <!-- 右侧插槽 -->
    <div v-if="$slots.right" class="ex-footer__right">
      <slot name="right" />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref } from 'vue';
import type { ExFooterProps, ExFooterExposed } from './types';
import { useNeonEffect, useAnimation } from '../config-provider/composables';

defineOptions({
  name: 'ExFooter',
});

const props = withDefaults(defineProps<ExFooterProps>(), {
  height: 64,
  fixed: false,
  // 默认 undefined，使未显式设置时回退到 ConfigProvider 的全局 neon-effect
  neonBorder: undefined,
  blur: false,
});

const footerRef = ref<HTMLElement>();

// 全局配置
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

// 计算类名
const footerClasses = computed(() => {
  const classes = ['ex-footer'];

  if (props.fixed) classes.push('ex-footer--fixed');
  // 支持全局霓虹效果配置
  if (props.neonBorder || (props.neonBorder === undefined && globalNeonEffect.value)) {
    classes.push('ex-footer--neon-border');
  }
  if (props.blur) classes.push('ex-footer--blur');
  // 支持全局动画配置
  if (!globalAnimation.value) classes.push('ex-footer--no-animation');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

// 计算样式
const footerStyles = computed(() => {
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
const getElement = () => footerRef.value || null;

defineExpose<ExFooterExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-footer {
  display: flex;
  align-items: center;
  padding: 0 var(--ex-spacing-6);
  background: var(--ex-color-bg-secondary);
  border-top: 1px solid var(--ex-color-border-primary);
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
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--ex-z-sticky);
  }

  // 霓虹边框
  &--neon-border {
    border-top-color: var(--ex-color-primary);
    box-shadow: 0 -2px 8px var(--ex-color-primary-alpha-20);
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
