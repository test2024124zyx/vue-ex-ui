<template>
  <section
    ref="layoutRef"
    :class="layoutClasses"
    :style="layoutStyles"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import type { ExLayoutProps, ExLayoutExposed } from './types';

defineOptions({
  name: 'ExLayout',
});

const props = withDefaults(defineProps<ExLayoutProps>(), {
  hasSider: false,
  direction: 'vertical',
});

const layoutRef = ref<HTMLElement>();

// 提供布局上下文
provide('ex-layout', {
  hasSider: computed(() => props.hasSider),
});

// 计算类名
const layoutClasses = computed(() => {
  const classes = ['ex-layout'];

  if (props.hasSider) {
    classes.push('ex-layout--has-sider');
  }

  classes.push(`ex-layout--${props.direction}`);

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
const layoutStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

// 暴露方法
const getElement = () => layoutRef.value || null;

defineExpose<ExLayoutExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-layout {
  display: flex;
  flex: auto;
  flex-direction: column;
  min-height: 0;
  background: var(--ex-color-bg-primary);
  color: var(--ex-color-text-primary);

  // 水平布局
  &--horizontal {
    flex-direction: row;
  }

  // 垂直布局
  &--vertical {
    flex-direction: column;
  }

  // 有侧边栏的布局
  &--has-sider {
    flex-direction: row;

    > .ex-layout {
      flex-direction: column;
    }
  }
}
</style>
