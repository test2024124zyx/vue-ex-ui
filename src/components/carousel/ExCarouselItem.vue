<template>
  <div
    ref="itemRef"
    :class="itemClasses"
    :style="itemStyles"
    role="group"
    :aria-roledescription="t('carousel.slide')"
    :aria-label="`${t('carousel.slide')} ${Math.max(0, index) + 1}`"
    :aria-hidden="!isActive"
    :inert="!isActive || undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ExCarouselItemProps } from './types';
import { useI18n } from '../../locale';
import { carouselContextKey } from './context';

defineOptions({
  name: 'ExCarouselItem',
});

const props = defineProps<ExCarouselItemProps>();

const { t } = useI18n();

const instance = getCurrentInstance();
if (!instance) {
  throw new Error('ExCarouselItem 初始化失败');
}
const uid = instance.uid;
const itemRef = ref<HTMLDivElement>();

const carousel = inject(carouselContextKey, null);
if (!carousel) {
  throw new Error('ExCarouselItem 必须作为 ExCarousel 的子组件使用');
}

// 元素挂载后注册真实 DOM，父组件据此处理动态重排与删除。
onMounted(() => {
  if (itemRef.value) carousel.registerItem(uid, itemRef.value);
});
onBeforeUnmount(() => carousel.unregisterItem(uid));

// 当前项索引（实时计算，随增删/重排更新）
const index = computed(() => carousel.getItemIndex(uid));
const isActive = computed(() => index.value === carousel.currentIndex.value);

// 计算属性
const itemClasses = computed(() => {
  const classes = ['ex-carousel-item'];

  if (isActive.value) classes.push('ex-carousel-item--active');

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
