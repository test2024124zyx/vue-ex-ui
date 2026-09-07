<template>
  <div
    ref="carouselRef"
    :class="carouselClasses"
    :style="carouselStyles"
    role="region"
    :aria-label="ariaLabel || t('carousel.carousel')"
    tabindex="0"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
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
        @touchcancel="resetTouch"
      >
        <SlotContent />
      </div>

      <!-- 前一个按钮 -->
      <button
        v-if="arrow !== 'never'"
        v-show="arrow === 'always' || (arrow === 'hover' && (isHovering || isFocusWithin))"
        class="ex-carousel__arrow ex-carousel__arrow--prev"
        :class="{ 'ex-carousel__arrow--disabled': !canGoPrev }"
        :disabled="!canGoPrev"
        :aria-label="t('carousel.previous')"
        type="button"
        @click="prev"
      >
        <slot name="arrow-prev">
          <ExIcon
            icon="arrow-left-s-line"
            :size="24"
            aria-hidden="true"
          />
        </slot>
      </button>

      <!-- 下一个按钮 -->
      <button
        v-if="arrow !== 'never'"
        v-show="arrow === 'always' || (arrow === 'hover' && (isHovering || isFocusWithin))"
        class="ex-carousel__arrow ex-carousel__arrow--next"
        :class="{ 'ex-carousel__arrow--disabled': !canGoNext }"
        :disabled="!canGoNext"
        :aria-label="t('carousel.next')"
        type="button"
        @click="next"
      >
        <slot name="arrow-next">
          <ExIcon
            icon="arrow-right-s-line"
            :size="24"
            aria-hidden="true"
          />
        </slot>
      </button>
    </div>

    <!-- 指示器 -->
    <div
      v-if="indicatorsVisible"
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
        type="button"
        @click="goTo(index)"
      >
        <span class="ex-carousel__indicator-dot" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import type { ExCarouselProps, ExCarouselEmits, ExCarouselExposed } from './types';
import { useI18n } from '../../locale';
import { carouselContextKey } from './context';
import { useSlotItems } from '../../composables/useSlotItems';

defineOptions({
  name: 'ExCarousel',
});

const DEFAULT_AUTOPLAY_INTERVAL = 3000;
const GESTURE_INTENT_THRESHOLD_PX = 12;
const SWIPE_TRIGGER_THRESHOLD_PX = 50;

// 注意：布尔类型 prop 未传时 Vue 默认转为 false，因此必须用 withDefaults 显式给出真值默认，
// 否则 `props.xxx ?? true` 会因 `false ?? true === false` 而失效（导致指示器不显示、循环失效等）
const props = withDefaults(defineProps<ExCarouselProps>(), {
  modelValue: 0,
  height: '400px',
  autoplay: true,
  interval: DEFAULT_AUTOPLAY_INTERVAL,
  loop: true,
  arrow: 'hover',
  indicatorPosition: 'bottom',
  showIndicators: true,
  pauseOnHover: true,
  direction: 'horizontal',
  effect: 'slide',
});

// 设置默认值
const modelValue = computed(() => props.modelValue ?? 0);
const height = computed(() => props.height ?? '400px');
const autoplay = computed(() => props.autoplay ?? true);
const interval = computed(() => props.interval ?? DEFAULT_AUTOPLAY_INTERVAL);
const loop = computed(() => props.loop ?? true);
const arrow = computed(() => props.arrow ?? 'hover');
const indicatorPosition = computed(() => props.indicatorPosition ?? 'bottom');
const indicatorsVisible = computed(() => props.showIndicators ?? true);
const pauseOnHover = computed(() => props.pauseOnHover ?? true);
const direction = computed(() => props.direction ?? 'horizontal');
const effect = computed(() => props.effect ?? 'slide');

const emit = defineEmits<ExCarouselEmits>();

const { t } = useI18n();

const carouselRef = ref<HTMLDivElement>();
const trackRef = ref<HTMLDivElement>();
const requestedIndex = ref(
  Number.isFinite(modelValue.value) ? Math.max(0, Math.trunc(modelValue.value)) : 0
);
const currentIndex = computed({
  get: () => normalizeIndex(requestedIndex.value),
  set: (value: number) => {
    requestedIndex.value = value;
  },
});
const isHovering = ref(false);
const isFocusWithin = ref(false);
const prefersReducedMotion = ref(false);
const autoplayTimer = ref<number>();
const { items: slotItems, SlotContent } = useSlotItems('ExCarouselItem');
const mountedItemCount = ref(0);
const itemCount = computed(() => Math.max(slotItems.value.length, mountedItemCount.value));
const isTransitioning = ref(false);
let transitionTimer: number | undefined;
let mounted = false;
let itemObserver: MutationObserver | undefined;
let reducedMotionQuery: MediaQueryList | null = null;

// 触摸相关
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);
const touchActive = ref(false);
const touchIntent = ref<'carousel' | 'page' | null>(null);

// 子项索引以真实 DOM 顺序为准，保证 keyed 节点重排后语义与视觉顺序一致。
const itemUids = ref<number[]>([]);
const itemElements = new Map<number, HTMLElement>();
const elementUids = new Map<HTMLElement, number>();

const normalizeIndex = (value: number, count = itemCount.value): number => {
  const integer = Number.isFinite(value) ? Math.trunc(value) : 0;
  if (count <= 0) return Math.max(0, integer);
  return Math.min(Math.max(0, integer), count - 1);
};

const reconcileCurrentIndex = (emitCorrection: boolean) => {
  const nextIndex = normalizeIndex(requestedIndex.value);
  if (nextIndex === requestedIndex.value) return;

  const previousIndex = requestedIndex.value;
  currentIndex.value = nextIndex;
  if (emitCorrection) {
    emit('update:modelValue', nextIndex);
    emit('change', nextIndex, previousIndex);
  }
};

const syncItemOrder = () => {
  const orderedUids = trackRef.value
    ? Array.from(trackRef.value.children)
        .map(element => elementUids.get(element as HTMLElement))
        .filter((uid): uid is number => uid !== undefined)
    : [];
  const orderChanged =
    orderedUids.length !== itemUids.value.length ||
    orderedUids.some((uid, index) => uid !== itemUids.value[index]);
  const previousCount = mountedItemCount.value;

  if (orderChanged) {
    itemUids.value = orderedUids;
  }
  mountedItemCount.value = orderedUids.length;

  if (itemCount.value < previousCount) {
    reconcileCurrentIndex(true);
  }
  if (mounted && itemCount.value !== previousCount) {
    startAutoplay();
  }
};

const registerItem = (uid: number, element?: HTMLElement) => {
  if (!element) {
    if (!itemUids.value.includes(uid)) itemUids.value.push(uid);
    return;
  }
  const previousElement = itemElements.get(uid);
  if (previousElement && previousElement !== element) {
    elementUids.delete(previousElement);
  }
  itemElements.set(uid, element);
  elementUids.set(element, uid);
  syncItemOrder();
};

const unregisterItem = (uid: number) => {
  const element = itemElements.get(uid);
  if (element) elementUids.delete(element);
  itemElements.delete(uid);
  syncItemOrder();
};
const getItemIndex = (uid: number) => itemUids.value.indexOf(uid);

// 提供给子组件
provide(carouselContextKey, {
  currentIndex,
  direction,
  effect,
  registerItem,
  unregisterItem,
  getItemIndex,
});

// 计算属性
const carouselClasses = computed(() => {
  const classes = [
    'ex-carousel',
    `ex-carousel--${direction.value}`,
    `ex-carousel--${effect.value}`,
    `ex-carousel--indicator-${indicatorPosition.value}`,
  ];

  classes.push(...normalizeCustomClass(props.class));

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
      styles.transition = prefersReducedMotion.value
        ? 'none'
        : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      styles.transform = `translateY(-${currentIndex.value * 100}%)`;
      styles.transition = prefersReducedMotion.value
        ? 'none'
        : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  } else if (effect.value === 'fade') {
    // Fade 效果由 CSS 处理，移除 transform
    styles.transform = 'none';
    styles.transition = 'none';
  }

  return styles;
});

const canGoPrev = computed(() => {
  return loop.value ? itemCount.value > 1 : currentIndex.value > 0;
});

const canGoNext = computed(() => {
  return loop.value ? itemCount.value > 1 : currentIndex.value < itemCount.value - 1;
});

const goTo = (index: number) => {
  if (isTransitioning.value || itemCount.value === 0) return;

  const newIndex = normalizeIndex(index);

  if (newIndex === currentIndex.value) return;

  isTransitioning.value = true;
  const oldIndex = currentIndex.value;
  currentIndex.value = newIndex;

  emit('update:modelValue', newIndex);
  emit('change', newIndex, oldIndex);

  transitionTimer = window.setTimeout(() => {
    isTransitioning.value = false;
    transitionTimer = undefined;
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
  stopAutoplay();
  if (
    !autoplay.value ||
    itemCount.value <= 1 ||
    prefersReducedMotion.value ||
    isFocusWithin.value ||
    (isHovering.value && pauseOnHover.value)
  ) {
    return;
  }

  const delay =
    Number.isFinite(interval.value) && interval.value > 0
      ? interval.value
      : DEFAULT_AUTOPLAY_INTERVAL;
  autoplayTimer.value = window.setInterval(() => {
    next();
  }, delay);
};

const stopAutoplay = () => {
  if (autoplayTimer.value !== undefined) {
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

const handleFocusIn = () => {
  isFocusWithin.value = true;
  stopAutoplay();
};

const handleFocusOut = (event: FocusEvent) => {
  if (event.relatedTarget instanceof Node && carouselRef.value?.contains(event.relatedTarget)) {
    return;
  }
  isFocusWithin.value = false;
  if (autoplay.value && !(isHovering.value && pauseOnHover.value)) startAutoplay();
};

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;
  touchActive.value = true;
  touchIntent.value = null;
};

const resolveTouchIntent = () => {
  if (touchIntent.value !== null) return;

  const dx = Math.abs(touchEndX.value - touchStartX.value);
  const dy = Math.abs(touchEndY.value - touchStartY.value);
  if (Math.max(dx, dy) < GESTURE_INTENT_THRESHOLD_PX) return;

  touchIntent.value =
    (direction.value === 'horizontal' && dx > dy) || (direction.value === 'vertical' && dy > dx)
      ? 'carousel'
      : 'page';
};

const handleTouchMove = (e: TouchEvent) => {
  if (!touchActive.value) return;
  const touch = e.touches[0];
  if (!touch) return;

  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;

  // 滑动方向与轮播方向一致时阻止默认滚动，避免与页面滚动冲突
  resolveTouchIntent();
  if (touchIntent.value === 'carousel') {
    if (e.cancelable) e.preventDefault();
  }
};

const resetTouch = () => {
  touchActive.value = false;
  touchStartX.value = 0;
  touchStartY.value = 0;
  touchEndX.value = 0;
  touchEndY.value = 0;
  touchIntent.value = null;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!touchActive.value) return;

  // touchmove 可能因系统事件合并或短促手势而缺失，结束事件中的 changedTouches 才是最终位置。
  const touch = e.changedTouches[0];
  if (touch) {
    touchEndX.value = touch.clientX;
    touchEndY.value = touch.clientY;
  }

  resolveTouchIntent();

  if (touchIntent.value !== 'carousel') {
    resetTouch();
    return;
  }

  const deltaX = touchEndX.value - touchStartX.value;
  const deltaY = touchEndY.value - touchStartY.value;

  if (direction.value === 'horizontal') {
    if (Math.abs(deltaX) > SWIPE_TRIGGER_THRESHOLD_PX) {
      if (deltaX > 0) {
        prev();
      } else {
        next();
      }
    }
  } else {
    if (Math.abs(deltaY) > SWIPE_TRIGGER_THRESHOLD_PX) {
      if (deltaY > 0) {
        prev();
      } else {
        next();
      }
    }
  }

  resetTouch();
};

// 监听 modelValue 变化（受控）：直接同步 currentIndex，绕过过渡锁，避免脱节
watch(modelValue, newValue => {
  const clamped = normalizeIndex(newValue);
  if (clamped !== newValue) {
    emit('update:modelValue', clamped);
  }
  const oldIndex = currentIndex.value;
  requestedIndex.value = Number.isFinite(newValue) ? Math.max(0, Math.trunc(newValue)) : 0;
  if (itemCount.value > 0 && clamped !== oldIndex) emit('change', clamped, oldIndex);
});

// 自动播放配置变化时重启定时器（运行时改 autoplay/interval 生效）
watch([autoplay, interval, pauseOnHover], () => {
  stopAutoplay();
  if (!(isHovering.value && pauseOnHover.value) && !isFocusWithin.value) {
    startAutoplay();
  }
});

const handleReducedMotionChange = (event: MediaQueryListEvent): void => {
  prefersReducedMotion.value = event.matches;
  if (event.matches) stopAutoplay();
  else if (!isFocusWithin.value && !(isHovering.value && pauseOnHover.value)) startAutoplay();
};

// 生命周期
onMounted(() => {
  mounted = true;
  if (typeof window.matchMedia === 'function') {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener?.('change', handleReducedMotionChange);
  }
  syncItemOrder();
  reconcileCurrentIndex(true);
  startAutoplay();

  // 监听子元素变化
  if (trackRef.value) {
    itemObserver = new MutationObserver(() => {
      syncItemOrder();
    });

    itemObserver.observe(trackRef.value, {
      childList: true,
    });
  }
});

onBeforeUnmount(() => {
  mounted = false;
  itemObserver?.disconnect();
  itemObserver = undefined;
  reducedMotionQuery?.removeEventListener?.('change', handleReducedMotionChange);
  reducedMotionQuery = null;
  stopAutoplay();
  resetTouch();
  if (transitionTimer !== undefined) {
    window.clearTimeout(transitionTimer);
    transitionTimer = undefined;
  }
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
