<template>
  <div
    :class="itemClasses"
    :style="itemStyles"
    role="group"
    :aria-roledescription="t('carousel.slide')"
    :aria-label="`${t('carousel.slide')} ${index + 1}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, getCurrentInstance } from 'vue';
import type { ExCarouselItemProps } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExCarouselItem',
});

const props = defineProps<ExCarouselItemProps>();

const { t } = useI18n();

const instance = getCurrentInstance();

// 注入父组件数据
const carousel = inject<{
  currentIndex: { value: number };
  direction: { value: string };
  effect: { value: string };
  registerItem: (uid: number) => number;
}>('carousel', {
  currentIndex: { value: 0 },
  direction: { value: 'horizontal' },
  effect: { value: 'slide' },
  registerItem: () => 0,
});

// 获取当前项的索引
const index = carousel.registerItem(instance?.uid || 0);

// 计算属性
const itemClasses = computed(() => {
  const classes = ['ex-carousel-item'];

  const isActive = index === carousel.currentIndex.value;

  if (isActive) classes.push('ex-carousel-item--active');

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

const itemStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});
</script>

<style lang="scss">
// 不使用 scoped，让父组件可以控制样式
.ex-carousel-item {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
