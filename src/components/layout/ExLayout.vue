<template>
  <div
    ref="layoutRef"
    :class="layoutClasses"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { layoutContextKey } from './context';
import type { ExLayoutExposed, ExLayoutProps } from './types';

defineOptions({ name: 'ExLayout' });

const props = defineProps<ExLayoutProps>();
const layoutRef = ref<HTMLDivElement>();
const siderCount = ref(0);

const registerSider = (): (() => void) => {
  siderCount.value += 1;
  let registered = true;
  return () => {
    if (!registered) return;
    registered = false;
    siderCount.value = Math.max(0, siderCount.value - 1);
  };
};

provide(layoutContextKey, { registerSider });

const effectiveDirection = computed(
  () => props.direction ?? (siderCount.value > 0 ? 'horizontal' : 'vertical')
);
const layoutClasses = computed(() => [
  'ex-layout',
  `ex-layout--${effectiveDirection.value}`,
  {
    'ex-layout--auto': props.direction === undefined,
    'ex-layout--has-sider': siderCount.value > 0,
  },
]);

const getElement = (): HTMLDivElement | null => layoutRef.value ?? null;

defineExpose<ExLayoutExposed>({ getElement });
</script>

<style scoped lang="scss">
.ex-layout {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  color: inherit;

  &--horizontal {
    flex-direction: row;
  }

  &--vertical {
    flex-direction: column;
  }

  // 首次渲染和 SSR 阶段尚未注册子组件时，由 DOM 结构保证方向正确。
  &--auto:has(> .ex-sider) {
    flex-direction: row;
  }
}
</style>
