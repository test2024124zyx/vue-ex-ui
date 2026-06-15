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
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, getCurrentInstance, onBeforeUnmount } from 'vue';
import type { ExCarouselItemProps } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExCarouselItem',
});

const props = defineProps<ExCarouselItemProps>();

const { t } = useI18n();

const instance = getCurrentInstance();
const uid = instance?.uid ?? 0;

// 注入父组件数据
const carousel = inject<{
  currentIndex: { value: number };
  direction: { value: string };
  effect: { value: string };
  registerItem: (uid: number) => void;
  unregisterItem: (uid: number) => void;
  getItemIndex: (uid: number) => number;
}>('carousel', {
  currentIndex: { value: 0 },
  direction: { value: 'horizontal' },
  effect: { value: 'slide' },
  registerItem: () => {},
  unregisterItem: () => {},
  getItemIndex: () => 0,
});

// 注册到父组件；卸载时注销，避免索引错位与泄漏
carousel.registerItem(uid);
onBeforeUnmount(() => carousel.unregisterItem(uid));

// 当前项索引（实时计算，随增删/重排更新）
const index = computed(() => carousel.getItemIndex(uid));

// 计算属性
const itemClasses = computed(() => {
  const classes = ['ex-carousel-item'];

  const isActive = index.value === carousel.currentIndex.value;

  if (isActive) classes.push('ex-carousel-item--active');

  classes.push(...normalizeCustomClass(props.class));

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
