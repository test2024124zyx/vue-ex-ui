<template>
  <div
    ref="carouselRef"
    :class="carouselClasses"
    :style="carouselStyles"
    role="region"
    :aria-label="ariaLabel || t('carousel.carousel')"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 轮播容器 -->
    <div class="ex-carousel__container">
      <!-- 轮播项包装器 -->
      <div
        ref="trackRef"
        class="ex-carousel__track"
        :style="trackStyles"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <slot />
      </div>

      <!-- 前一个按钮 -->
      <button
        v-if="arrow !== 'never'"
        v-show="arrow === 'always' || (arrow === 'hover' && isHovering)"
        class="ex-carousel__arrow ex-carousel__arrow--prev"
        :class="{ 'ex-carousel__arrow--disabled': !canGoPrev }"
        :disabled="!canGoPrev"
        :aria-label="t('carousel.previous')"
        @click="prev"
      >
        <slot name="arrow-prev">
          <ExIcon icon="arrow-left-s-line" :size="24" aria-hidden="true" />
        </slot>
      </button>

      <!-- 下一个按钮 -->
      <button
        v-if="arrow !== 'never'"
        v-show="arrow === 'always' || (arrow === 'hover' && isHovering)"
        class="ex-carousel__arrow ex-carousel__arrow--next"
        :class="{ 'ex-carousel__arrow--disabled': !canGoNext }"
        :disabled="!canGoNext"
        :aria-label="t('carousel.next')"
        @click="next"
      >
        <slot name="arrow-next">
          <ExIcon icon="arrow-right-s-line" :size="24" aria-hidden="true" />
        </slot>
      </button>
    </div>

    <!-- 指示器 -->
    <div
      v-if="showIndicators"
      class="ex-carousel__indicators"
      :class="`ex-carousel__indicators--${indicatorPosition}`"
    >
      <button
        v-for="(_item, index) in itemCount"
        :key="index"
        class="ex-carousel__indicator"
        :class="{ 'ex-carousel__indicator--active': index === currentIndex }"
        :aria-label="`${t('carousel.goToSlide')} ${index + 1}`"
        :aria-current="index === currentIndex ? 'true' : 'false'"
        @click="goTo(index)"
      >
        <span class="ex-carousel__indicator-dot" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import type { ExCarouselProps, ExCarouselEmits, ExCarouselExposed } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExCarousel',
});

const props = defineProps<ExCarouselProps>();

// 设置默认值
const modelValue = computed(() => props.modelValue ?? 0);
const height = computed(() => props.height ?? '400px');
const autoplay = computed(() => props.autoplay ?? true);
const interval = computed(() => props.interval ?? 3000);
const loop = computed(() => props.loop ?? true);
const arrow = computed(() => props.arrow ?? 'hover');
const indicatorPosition = computed(() => props.indicatorPosition ?? 'bottom');
const showIndicators = computed(() => props.showIndicators ?? true);
const pauseOnHover = computed(() => props.pauseOnHover ?? true);
const direction = computed(() => props.direction ?? 'horizontal');
const effect = computed(() => props.effect ?? 'slide');

const emit = defineEmits<ExCarouselEmits>();

const { t } = useI18n();

const carouselRef = ref<HTMLDivElement>();
const trackRef = ref<HTMLDivElement>();
const currentIndex = ref(modelValue.value);
const isHovering = ref(false);
const autoplayTimer = ref<number>();
const itemCount = ref(0);
const isTransitioning = ref(false);

// 触摸相关
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);

// 子组件注册
const itemUids = ref<number[]>([]);
const registerItem = (uid: number) => {
  if (!itemUids.value.includes(uid)) {
    itemUids.value.push(uid);
  }
  return itemUids.value.indexOf(uid);
};

// 提供给子组件
provide('carousel', {
  currentIndex,
  direction,
  effect,
  registerItem,
});

// 计算属性
const carouselClasses = computed(() => {
  const classes = [
    'ex-carousel',
    `ex-carousel--${direction.value}`,
    `ex-carousel--${effect.value}`,
  ];

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

const carouselStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (height.value) {
    styles.height = typeof height.value === 'number' ? `${height.value}px` : height.value;
  }

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

const trackStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (effect.value === 'slide') {
    if (direction.value === 'horizontal') {
      styles.transform = `translateX(-${currentIndex.value * 100}%)`;
      styles.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      styles.transform = `translateY(-${currentIndex.value * 100}%)`;
      styles.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  } else if (effect.value === 'fade') {
    // Fade 效果由 CSS 处理，移除 transform
    styles.transform = 'none';
    styles.transition = 'none';
  }

  return styles;
});

const canGoPrev = computed(() => {
  return loop.value || currentIndex.value > 0;
});

const canGoNext = computed(() => {
  return loop.value || currentIndex.value < itemCount.value - 1;
});

// 方法
const updateItemCount = () => {
  if (trackRef.value) {
    itemCount.value = trackRef.value.children.length;
  }
};

const goTo = (index: number) => {
  if (isTransitioning.value) return;

  const newIndex = Math.max(0, Math.min(index, itemCount.value - 1));

  if (newIndex === currentIndex.value) return;

  isTransitioning.value = true;
  const oldIndex = currentIndex.value;
  currentIndex.value = newIndex;

  emit('update:modelValue', newIndex);
  emit('change', newIndex, oldIndex);

  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const next = () => {
  if (!canGoNext.value) return;

  let nextIndex = currentIndex.value + 1;

  if (nextIndex >= itemCount.value) {
    nextIndex = loop.value ? 0 : itemCount.value - 1;
  }

  goTo(nextIndex);
};

const prev = () => {
  if (!canGoPrev.value) return;

  let prevIndex = currentIndex.value - 1;

  if (prevIndex < 0) {
    prevIndex = loop.value ? itemCount.value - 1 : 0;
  }

  goTo(prevIndex);
};

const startAutoplay = () => {
  if (!autoplay.value || itemCount.value <= 1) return;

  stopAutoplay();

  autoplayTimer.value = window.setInterval(() => {
    next();
  }, interval.value);
};

const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value);
    autoplayTimer.value = undefined;
  }
};

const handleMouseEnter = () => {
  isHovering.value = true;

  if (pauseOnHover.value) {
    stopAutoplay();
  }
};

const handleMouseLeave = () => {
  isHovering.value = false;

  if (pauseOnHover.value && autoplay.value) {
    startAutoplay();
  }
};

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;
};

const handleTouchEnd = () => {
  const deltaX = touchEndX.value - touchStartX.value;
  const deltaY = touchEndY.value - touchStartY.value;

  const threshold = 50;

  if (direction.value === 'horizontal') {
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prev();
      } else {
        next();
      }
    }
  } else {
    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        prev();
      } else {
        next();
      }
    }
  }

  touchStartX.value = 0;
  touchStartY.value = 0;
  touchEndX.value = 0;
  touchEndY.value = 0;
};

// 监听 modelValue 变化
watch(modelValue, newValue => {
  if (newValue !== currentIndex.value) {
    goTo(newValue);
  }
});

// 生命周期
onMounted(() => {
  updateItemCount();
  startAutoplay();

  // 监听子元素变化
  if (trackRef.value) {
    const observer = new MutationObserver(() => {
      updateItemCount();
    });

    observer.observe(trackRef.value, {
      childList: true,
    });

    onBeforeUnmount(() => {
      observer.disconnect();
    });
  }
});

onBeforeUnmount(() => {
  stopAutoplay();
});

// 暴露的方法
const getElement = () => {
  return carouselRef.value || null;
};

defineExpose<ExCarouselExposed>({
  next,
  prev,
  goTo,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCarousel.scss"></style>
