<template>
  <footer
    ref="footerRef"
    :class="footerClasses"
    :style="footerStyles"
  >
    <!-- 存在具名区域时，默认插槽稳定回退到中间区域。 -->
    <template v-if="$slots.left || $slots.center || $slots.right">
      <div
        v-if="$slots.left"
        class="ex-footer__left"
      >
        <slot name="left"></slot>
      </div>
      <div
        v-if="$slots.center || $slots.default"
        class="ex-footer__center"
      >
        <slot
          v-if="$slots.center"
          name="center"
        ></slot>
        <slot v-else></slot>
      </div>
      <div
        v-if="$slots.right"
        class="ex-footer__right"
      >
        <slot name="right"></slot>
      </div>
    </template>
    <div
      v-else
      class="ex-footer__content"
    >
      <slot></slot>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAnimation, useNeonEffect } from '../config-provider/composables';
import { normalizeLayoutLength } from './layout-utils';
import type { ExFooterExposed, ExFooterProps } from './types';

defineOptions({ name: 'ExFooter' });

const props = withDefaults(defineProps<ExFooterProps>(), {
  height: 64,
  fixed: false,
  neonBorder: undefined,
  blur: false,
});

const footerRef = ref<HTMLElement>();
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

const footerClasses = computed(() => [
  'ex-footer',
  {
    'ex-footer--fixed': props.fixed,
    'ex-footer--neon-border': props.neonBorder ?? globalNeonEffect.value,
    'ex-footer--blur': props.blur,
    'ex-footer--no-animation': !globalAnimation.value,
  },
]);
const footerStyles = computed<Record<string, string>>(() => ({
  '--ex-footer-height': normalizeLayoutLength(props.height, 64),
}));

const getElement = (): HTMLElement | null => footerRef.value ?? null;

defineExpose<ExFooterExposed>({ getElement });
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-footer {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 var(--ex-footer-height);
  align-items: center;
  height: var(--ex-footer-height);
  min-height: var(--ex-footer-height);
  padding-inline: var(--ex-spacing-6);
  background: var(--ex-color-bg-secondary);
  border-top: 1px solid var(--ex-color-border-primary);
  transition:
    background-color var(--ex-motion-duration-base) var(--ex-motion-ease-in-out),
    border-color var(--ex-motion-duration-base) var(--ex-motion-ease-in-out),
    box-shadow var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);

  &__left,
  &__center,
  &__right {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: var(--ex-spacing-4);
  }

  &__left {
    margin-right: auto;
  }

  &__center {
    flex: 1 1 auto;
    justify-content: center;
  }

  &__right {
    margin-left: auto;
  }

  &__content {
    flex: 1 1 auto;
    min-width: 0;
  }

  &--fixed {
    position: fixed;
    inset: auto 0 0;
    z-index: var(--ex-z-sticky);
  }

  &--neon-border {
    border-top-color: var(--ex-color-primary);
    box-shadow: 0 -2px 8px var(--ex-color-primary-alpha-20);
  }

  &--blur {
    background: var(--ex-color-bg-secondary-alpha-80);
    backdrop-filter: blur(12px);
  }

  &--no-animation {
    transition: none;
  }

  @include mobile {
    padding-inline: var(--ex-spacing-4);
  }
}
</style>
