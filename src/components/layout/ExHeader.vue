<template>
  <header
    ref="headerRef"
    :class="headerClasses"
    :style="headerStyles"
  >
    <!-- 存在具名区域时，默认插槽稳定回退到中间区域。 -->
    <template v-if="$slots.left || $slots.center || $slots.right">
      <div
        v-if="$slots.left"
        class="ex-header__left"
      >
        <slot name="left"></slot>
      </div>
      <div
        v-if="$slots.center || $slots.default"
        class="ex-header__center"
      >
        <slot
          v-if="$slots.center"
          name="center"
        ></slot>
        <slot v-else></slot>
      </div>
      <div
        v-if="$slots.right"
        class="ex-header__right"
      >
        <slot name="right"></slot>
      </div>
    </template>
    <div
      v-else
      class="ex-header__content"
    >
      <slot></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAnimation, useNeonEffect } from '../config-provider/composables';
import { normalizeLayoutLength } from './layout-utils';
import type { ExHeaderExposed, ExHeaderProps } from './types';

defineOptions({ name: 'ExHeader' });

const props = withDefaults(defineProps<ExHeaderProps>(), {
  height: 64,
  fixed: false,
  neonBorder: undefined,
  blur: false,
});

const headerRef = ref<HTMLElement>();
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

const headerClasses = computed(() => [
  'ex-header',
  {
    'ex-header--fixed': props.fixed,
    'ex-header--neon-border': props.neonBorder ?? globalNeonEffect.value,
    'ex-header--blur': props.blur,
    'ex-header--no-animation': !globalAnimation.value,
  },
]);
const headerStyles = computed<Record<string, string>>(() => ({
  '--ex-header-height': normalizeLayoutLength(props.height, 64),
}));

const getElement = (): HTMLElement | null => headerRef.value ?? null;

defineExpose<ExHeaderExposed>({ getElement });
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-header {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 var(--ex-header-height);
  align-items: center;
  height: var(--ex-header-height);
  min-height: var(--ex-header-height);
  padding-inline: var(--ex-spacing-6);
  background: var(--ex-color-bg-secondary);
  border-bottom: 1px solid var(--ex-color-border-primary);
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
    inset: 0 0 auto;
    z-index: var(--ex-z-sticky);
  }

  &--neon-border {
    border-bottom-color: var(--ex-color-primary);
    box-shadow: 0 2px 8px var(--ex-color-primary-alpha-20);
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
