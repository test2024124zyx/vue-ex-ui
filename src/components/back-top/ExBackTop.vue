<template>
  <Teleport to="body">
    <Transition
      :name="transitionName"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="visible && shouldShowOnDevice"
        ref="backTopRef"
        :class="backTopClasses"
        :style="backTopStyles"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <!-- 进度环 -->
        <div v-if="showProgress && progressType === 'circle'" class="ex-back-top__progress-circle">
          <svg class="ex-back-top__progress-svg" viewBox="0 0 50 50">
            <circle
              class="ex-back-top__progress-bg"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.2"
            />
            <circle
              class="ex-back-top__progress-bar"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              :stroke-dasharray="progressCircumference"
              :stroke-dashoffset="progressOffset"
              transform="rotate(-90 25 25)"
            />
          </svg>
        </div>

        <!-- 进度条 -->
        <div v-if="showProgress && progressType === 'line'" class="ex-back-top__progress-line">
          <div class="ex-back-top__progress-fill" :style="progressLineStyles" />
        </div>

        <!-- 内容区域 -->
        <div class="ex-back-top__content">
          <!-- 图标 -->
          <div v-if="iconComponent" class="ex-back-top__icon">
            <component
              :is="iconComponent"
              v-if="isVNode(iconComponent) || isComponent(iconComponent)"
            />
            <i v-else :class="iconComponent" />
          </div>

          <!-- 文字 -->
          <div v-if="showText && text" class="ex-back-top__text">
            {{ text }}
          </div>

          <!-- 百分比 -->
          <div v-if="showPercent" class="ex-back-top__percent">
            {{ Math.round(scrollInfo.scrollPercent) }}%
          </div>

          <!-- 自定义内容 -->
          <div v-if="$slots.default" class="ex-back-top__slot">
            <slot />
          </div>
        </div>

        <!-- 拖拽指示器 -->
        <div v-if="draggable && !dragState.dragging" class="ex-back-top__drag-indicator">
          <i class="ex-icon ex-icon-drag" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, reactive, isVNode } from 'vue';
import type { CSSProperties } from 'vue';
import type {
  ExBackTopProps,
  ExBackTopEmits,
  BackTopScrollInfo,
  BackTopTrigger,
  BackTopDragState,
} from './types';
import {
  defaultBackTopConfig,
  getTarget,
  getScrollInfo,
  shouldShow,
  scrollToPosition,
  getPositionStyles,
  // getDefaultOffset,
  getSizeStyles,
  getShapeStyles,
  getThemeStyles,
  getHoverThemeStyles,
  throttle,
  debounce,
  isMobile,
  savePosition,
  loadPosition,
  calculateDragBounds,
  createPerformanceMonitor,
  recordScrollEvent,
  recordClickEvent,
  recordScrollAnimation,
  createTrigger,
  getDefaultIcon,
  validateConfig,
  clamp,
} from './utils';

defineOptions({
  name: 'ExBackTop',
});

const props = withDefaults(defineProps<ExBackTopProps>(), {
  position: 'bottom-right',
  shape: 'circle',
  size: 'medium',
  visibilityHeight: 400,
  scrollBehavior: 'smooth',
  scrollDuration: 500,
  scrollTo: 0,
  animation: 'fade',
  showText: false,
  showProgress: false,
  progressType: 'circle',
  showPercent: false,
  zIndex: 1000,
  enabled: true,
  draggable: false,
  rememberPosition: false,
  storageKey: 'ex-back-top-position',
  throttleDelay: 16,
  showOnMobile: true,
  mobileBreakpoint: 768,
});

const emit = defineEmits<ExBackTopEmits>();

// 组件引用
const backTopRef = ref<HTMLElement>();

// 响应式状态
const visible = ref(false);
const scrolling = ref(false);
const scrollInfo = reactive<BackTopScrollInfo>({
  scrollTop: 0,
  scrollPercent: 0,
  scrollHeight: 0,
  clientHeight: 0,
  scrollingDown: false,
  scrollSpeed: 0,
});

// 拖拽状态
const dragState = reactive<BackTopDragState>({
  dragging: false,
  startPosition: { x: 0, y: 0 },
  currentPosition: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  bounds: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});

// 性能监控
const performanceMonitor = createPerformanceMonitor();

// 事件监听器引用
let scrollListener: (() => void) | null = null;
let resizeListener: (() => void) | null = null;

// 计算属性
const trigger = computed<BackTopTrigger>(() =>
  createTrigger(props.visibilityHeight, props.visibilityPercent, props.trigger?.custom)
);

const iconComponent = computed(() => {
  return props.icon || getDefaultIcon();
});

const shouldShowOnDevice = computed(() => {
  if (!props.showOnMobile && isMobile(props.mobileBreakpoint)) {
    return false;
  }
  return true;
});

const backTopClasses = computed(() => [
  'ex-back-top',
  `ex-back-top--${props.position}`,
  `ex-back-top--${props.shape}`,
  `ex-back-top--${props.size}`,
  {
    'ex-back-top--visible': visible.value,
    'ex-back-top--scrolling': scrolling.value,
    'ex-back-top--draggable': props.draggable,
    'ex-back-top--dragging': dragState.dragging,
    'ex-back-top--with-text': props.showText && props.text,
    'ex-back-top--with-progress': props.showProgress,
    'ex-back-top--with-percent': props.showPercent,
  },
  props.className,
]);

const backTopStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {
    zIndex: props.zIndex,
    ...props.style,
  };

  // 位置样式
  const positionStyles = getPositionStyles(props.position, props.offset || {});
  Object.assign(styles, positionStyles);

  // 拖拽位置覆盖
  if (props.draggable && (dragState.currentPosition.x !== 0 || dragState.currentPosition.y !== 0)) {
    styles.transform = `translate(${dragState.currentPosition.x}px, ${dragState.currentPosition.y}px)`;
  }

  // 尺寸样式
  const sizeStyles = getSizeStyles(props.size);
  Object.assign(styles, sizeStyles);

  // 形状样式
  const shapeStyles = getShapeStyles(props.shape);
  Object.assign(styles, shapeStyles);

  // 主题样式
  if (props.theme) {
    const themeStyles = getThemeStyles({
      ...defaultBackTopConfig.defaultTheme,
      ...props.theme,
    });
    Object.assign(styles, themeStyles);

    // 悬停样式变量
    const hoverStyles = getHoverThemeStyles({
      ...defaultBackTopConfig.defaultTheme,
      ...props.theme,
    });
    Object.assign(styles, hoverStyles);
  }

  // 动画配置
  if (props.animationConfig) {
    const duration =
      props.animationConfig.enterDuration ||
      defaultBackTopConfig.defaultAnimationConfig.enterDuration;
    const easing =
      props.animationConfig.easing || defaultBackTopConfig.defaultAnimationConfig.easing;
    styles.transition = `all ${duration}ms ${easing}`;
  }

  return styles;
});

const progressCircumference = computed(() => {
  const radius = 20;
  return 2 * Math.PI * radius;
});

const progressOffset = computed(() => {
  const progress = scrollInfo.scrollPercent / 100;
  return progressCircumference.value * (1 - progress);
});

const progressLineStyles = computed(
  (): CSSProperties => ({
    width: `${scrollInfo.scrollPercent}%`,
  })
);

const transitionName = computed(() => {
  switch (props.animation) {
    case 'fade':
      return 'ex-back-top-fade';
    case 'slide':
      return 'ex-back-top-slide';
    case 'zoom':
      return 'ex-back-top-zoom';
    case 'bounce':
      return 'ex-back-top-bounce';
    default:
      return 'ex-back-top-fade';
  }
});

// 核心方法
const updateScrollInfo = () => {
  if (!props.enabled) {
    return;
  }

  const target = getTarget(props.target || window);
  const newScrollInfo = getScrollInfo(target);

  Object.assign(scrollInfo, newScrollInfo);
};

const checkVisibility = () => {
  if (!props.enabled) {
    visible.value = false;
    return;
  }

  const shouldBeVisible = shouldShow(scrollInfo, trigger.value);

  if (shouldBeVisible !== visible.value) {
    visible.value = shouldBeVisible;
    emit('visibility-change', shouldBeVisible);
    props.onVisibilityChange?.(shouldBeVisible);
  }
};

const scrollToTop = async (): Promise<void> => {
  if (scrolling.value) {
    return;
  }

  const startTime = performance.now();
  scrolling.value = true;

  emit('scroll-start');
  props.onScrollStart?.();

  try {
    const target = getTarget(props.target || window);
    await scrollToPosition(target, props.scrollTo, {
      behavior: props.scrollBehavior,
      duration: props.scrollDuration,
    });
  } finally {
    scrolling.value = false;
    const scrollTime = performance.now() - startTime;
    recordScrollAnimation(performanceMonitor, scrollTime);

    emit('scroll-end');
    props.onScrollEnd?.();
  }
};

const scrollToPositionMethod = async (position: number): Promise<void> => {
  if (scrolling.value) {
    return;
  }

  const startTime = performance.now();
  scrolling.value = true;

  try {
    const target = getTarget(props.target || window);
    await scrollToPosition(target, position, {
      behavior: props.scrollBehavior,
      duration: props.scrollDuration,
    });
  } finally {
    scrolling.value = false;
    const scrollTime = performance.now() - startTime;
    recordScrollAnimation(performanceMonitor, scrollTime);
  }
};

const show = () => {
  visible.value = true;
  emit('visibility-change', true);
  props.onVisibilityChange?.(true);
};

const hide = () => {
  visible.value = false;
  emit('visibility-change', false);
  props.onVisibilityChange?.(false);
};

const toggle = () => {
  if (visible.value) {
    hide();
  } else {
    show();
  }
};

const getTargetElement = () => {
  return getTarget(props.target || window);
};

const resetPosition = () => {
  if (props.draggable) {
    dragState.currentPosition = { x: 0, y: 0 };
    dragState.offset = { x: 0, y: 0 };

    if (props.rememberPosition) {
      savePosition(props.storageKey, { x: 0, y: 0 });
    }
  }
};

const savePositionMethod = () => {
  if (props.draggable && props.rememberPosition) {
    savePosition(props.storageKey, dragState.currentPosition);
  }
};

const loadPositionMethod = () => {
  if (props.draggable && props.rememberPosition) {
    const position = loadPosition(props.storageKey);
    if (position) {
      dragState.currentPosition = position;
    }
  }
};

// 拖拽相关方法
const startDrag = (clientX: number, clientY: number) => {
  if (!props.draggable || !backTopRef.value) {
    return;
  }

  dragState.dragging = true;
  dragState.startPosition = { x: clientX, y: clientY };
  dragState.bounds = calculateDragBounds(backTopRef.value, props.dragBounds);

  document.addEventListener('mousemove', handleMouseMove, { passive: false });
  document.addEventListener('mouseup', handleMouseUp, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  document.body.style.userSelect = 'none';
};

const updateDrag = (clientX: number, clientY: number) => {
  if (!dragState.dragging) {
    return;
  }

  const deltaX = clientX - dragState.startPosition.x;
  const deltaY = clientY - dragState.startPosition.y;

  const newX = clamp(dragState.offset.x + deltaX, -dragState.bounds.left, dragState.bounds.right);
  const newY = clamp(dragState.offset.y + deltaY, -dragState.bounds.top, dragState.bounds.bottom);

  dragState.currentPosition = { x: newX, y: newY };

  emit('drag-move', new MouseEvent('mousemove'), dragState.currentPosition);
};

const endDrag = (event: MouseEvent | TouchEvent) => {
  if (!dragState.dragging) {
    return;
  }

  dragState.dragging = false;
  dragState.offset = { ...dragState.currentPosition };

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);

  document.body.style.userSelect = '';

  if (props.rememberPosition) {
    savePositionMethod();
  }

  emit('drag-end', event, dragState.currentPosition);
  props.onDragEnd?.(event, dragState.currentPosition);
};

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (dragState.dragging) {
    return;
  }

  recordClickEvent(performanceMonitor);

  emit('click', event);
  props.onClick?.(event);

  scrollToTop();
};

const handleMouseDown = (event: MouseEvent) => {
  if (!props.draggable) {
    return;
  }

  event.preventDefault();
  startDrag(event.clientX, event.clientY);

  emit('drag-start', event);
  props.onDragStart?.(event);
};

const handleTouchStart = (event: TouchEvent) => {
  if (!props.draggable) {
    return;
  }

  event.preventDefault();
  const touch = event.touches[0];
  // 检查 touch 是否存在
  if (!touch) return;

  startDrag(touch.clientX, touch.clientY);

  emit('drag-start', event);
  props.onDragStart?.(event);
};

const handleMouseMove = (event: MouseEvent) => {
  event.preventDefault();
  updateDrag(event.clientX, event.clientY);
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  const touch = event.touches[0];
  // 检查 touch 是否存在
  if (!touch) return;

  updateDrag(touch.clientX, touch.clientY);
};

const handleMouseUp = (event: MouseEvent) => {
  endDrag(event);
};

const handleTouchEnd = (event: TouchEvent) => {
  endDrag(event);
};

const handleScroll = throttle(() => {
  recordScrollEvent(performanceMonitor);
  updateScrollInfo();
  checkVisibility();
}, props.throttleDelay);

const handleResize = debounce(() => {
  if (props.draggable && backTopRef.value) {
    dragState.bounds = calculateDragBounds(backTopRef.value, props.dragBounds);
  }
}, 100);

// 动画事件
const handleBeforeEnter = () => {
  // 进入动画开始前
};

const handleAfterEnter = () => {
  // 进入动画结束后
};

const handleBeforeLeave = () => {
  // 离开动画开始前
};

const handleAfterLeave = () => {
  // 离开动画结束后
};

// 设置事件监听器
const setupListeners = () => {
  if (!props.enabled) {
    return;
  }

  const target = getTarget(props.target || window);

  // 滚动事件
  scrollListener = handleScroll;
  target.addEventListener('scroll', scrollListener, { passive: true });

  // 窗口大小改变事件
  resizeListener = handleResize;
  window.addEventListener('resize', resizeListener, { passive: true });
};

// 清理事件监听器
const cleanupListeners = () => {
  if (scrollListener) {
    const target = getTarget(props.target || window);
    target.removeEventListener('scroll', scrollListener);
    scrollListener = null;
  }

  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
    resizeListener = null;
  }
};

// 工具函数：检查是否为组件
const isComponent = (value: unknown): boolean => {
  return Boolean(
    value &&
      (typeof value === 'function' ||
        (typeof value === 'object' && (value as { render?: unknown }).render))
  );
};

// 监听器
watch(
  () => props.enabled,
  enabled => {
    if (enabled) {
      setupListeners();
      nextTick(() => {
        updateScrollInfo();
        checkVisibility();
      });
    } else {
      cleanupListeners();
      hide();
    }
  }
);

watch(
  () => props.target,
  () => {
    cleanupListeners();
    setupListeners();
    nextTick(() => {
      updateScrollInfo();
      checkVisibility();
    });
  }
);

// 生命周期
onMounted(() => {
  // 验证配置
  if (!validateConfig(props)) {
    console.warn('Invalid BackTop configuration');
    return;
  }

  // 启动性能监控
  performanceMonitor.start();

  // 加载保存的位置
  if (props.draggable && props.rememberPosition) {
    loadPositionMethod();
  }

  // 设置事件监听器
  setupListeners();

  // 初始更新
  nextTick(() => {
    updateScrollInfo();
    checkVisibility();
  });
});

onBeforeUnmount(() => {
  // 清理事件监听器
  cleanupListeners();

  // 清理拖拽事件监听器
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);

  // 恢复用户选择
  document.body.style.userSelect = '';

  // 停止性能监控
  performanceMonitor.stop();
});

// 暴露组件实例
defineExpose({
  $el: backTopRef,
  visible,
  scrollInfo,
  scrollToTop,
  scrollToPosition: scrollToPositionMethod,
  show,
  hide,
  toggle,
  updateScrollInfo,
  checkVisibility,
  getTarget: getTargetElement,
  resetPosition,
  savePosition: savePositionMethod,
  loadPosition: loadPositionMethod,
});
</script>

<style lang="scss" scoped>
@use '../../styles/mixins' as *;

.ex-back-top {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ex-back-top-bg, #ffffff);
  color: var(--ex-back-top-color, #666666);
  border: 1px solid var(--ex-back-top-border, #d9d9d9);
  box-shadow: var(--ex-back-top-shadow, 0 2px 8px rgba(0, 0, 0, 0.15));
  cursor: pointer;
  user-select: none;
  z-index: var(--ex-back-top-z-index, 1000);
  @include transition(all);

  &:hover {
    background: var(--hover-bg, var(--ex-back-top-hover-bg, #1890ff));
    color: var(--hover-color, var(--ex-back-top-hover-color, #ffffff));
    border-color: var(--hover-border, var(--ex-back-top-hover-border, #1890ff));
    box-shadow: var(
      --hover-shadow,
      var(--ex-back-top-hover-shadow, 0 4px 12px rgba(var(--ex-color-neon-blue-500-rgb), 0.3))
    );
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  // 尺寸
  &--small {
    width: var(--ex-back-top-size-small, 36px);
    height: var(--ex-back-top-size-small, 36px);
    font-size: 14px;
  }

  &--medium {
    width: var(--ex-back-top-size-medium, 48px);
    height: var(--ex-back-top-size-medium, 48px);
    font-size: 16px;
  }

  &--large {
    width: var(--ex-back-top-size-large, 60px);
    height: var(--ex-back-top-size-large, 60px);
    font-size: 18px;
  }

  // 形状
  &--circle {
    border-radius: 50%;
  }

  &--square {
    border-radius: 0;
  }

  &--rounded {
    border-radius: var(--ex-radius-base, 6px);
  }

  // 状态
  &--scrolling {
    pointer-events: none;
    opacity: 0.7;
  }

  &--draggable {
    cursor: move;

    &:hover {
      transform: none;
    }
  }

  &--dragging {
    cursor: grabbing;
    z-index: calc(var(--ex-back-top-z-index, 1000) + 1);

    &:hover {
      transform: none;
    }
  }

  &--with-text {
    flex-direction: column;
    padding: var(--ex-spacing-2);
    width: auto;
    min-width: var(--ex-back-top-size-medium, 48px);
  }

  &--with-progress {
    position: relative;
  }
}

.ex-back-top__progress-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ex-back-top__progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ex-back-top__progress-bg,
.ex-back-top__progress-bar {
  transition: stroke-dashoffset 0.3s ease;
}

.ex-back-top__progress-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(var(--ex-color-white-rgb), 0.3);
  overflow: hidden;
}

.ex-back-top__progress-fill {
  height: 100%;
  background: currentColor;
  @include transition(width);
}

.ex-back-top__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ex-spacing-1);
  z-index: 1;
}

.ex-back-top__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  line-height: 1;
}

.ex-back-top__text {
  font-size: var(--ex-text-xs);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.ex-back-top__percent {
  font-size: var(--ex-text-xs);
  font-weight: 600;
  line-height: 1;
}

.ex-back-top__slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ex-back-top__drag-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: var(--ex-color-primary);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0.8;
  pointer-events: none;
}

// 过渡动画
.ex-back-top-fade-enter-active,
.ex-back-top-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.ex-back-top-fade-enter-from,
.ex-back-top-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.ex-back-top-slide-enter-active,
.ex-back-top-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.ex-back-top-slide-enter-from,
.ex-back-top-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.ex-back-top-zoom-enter-active,
.ex-back-top-zoom-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.ex-back-top-zoom-enter-from,
.ex-back-top-zoom-leave-to {
  opacity: 0;
  transform: scale(0);
}

.ex-back-top-bounce-enter-active {
  animation: ex-back-top-bounce-in 0.6s ease;
}

.ex-back-top-bounce-leave-active {
  animation: ex-back-top-bounce-out 0.3s ease;
}

@keyframes ex-back-top-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes ex-back-top-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

// 响应式
@media (max-width: 768px) {
  .ex-back-top {
    &--small {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    &--medium {
      width: 40px;
      height: 40px;
      font-size: 14px;
    }

    &--large {
      width: 48px;
      height: 48px;
      font-size: 16px;
    }

    &--with-text {
      .ex-back-top__text {
        font-size: 10px;
      }
    }
  }
}

// 无障碍
@media (prefers-reduced-motion: reduce) {
  .ex-back-top {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  .ex-back-top-fade-enter-active,
  .ex-back-top-fade-leave-active,
  .ex-back-top-slide-enter-active,
  .ex-back-top-slide-leave-active,
  .ex-back-top-zoom-enter-active,
  .ex-back-top-zoom-leave-active,
  .ex-back-top-bounce-enter-active,
  .ex-back-top-bounce-leave-active {
    transition: none !important;
    animation: none !important;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .ex-back-top {
    border-width: 2px;
    font-weight: 600;

    &:hover {
      border-width: 2px;
    }
  }
}

// 暗色主题
@media (prefers-color-scheme: dark) {
  .ex-back-top {
    --ex-back-top-bg: #1f1f1f;
    --ex-back-top-color: #ffffff;
    --ex-back-top-border: #434343;
    --ex-back-top-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

// 打印样式
@media print {
  .ex-back-top {
    display: none !important;
  }
}
</style>
