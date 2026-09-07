<template>
  <div
    ref="affixRef"
    :class="affixClasses"
    :style="wrapperStyle"
  >
    <div
      ref="contentRef"
      :class="['ex-affix__content', { 'is-fixed': isFixed }]"
      :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type { ExAffixProps, ExAffixEmits, ExAffixExposed } from './types';
import { useZIndexLayer } from '../config-provider/composables';

defineOptions({
  name: 'ExAffix',
});

const props = withDefaults(defineProps<ExAffixProps>(), {
  offsetTop: undefined,
  offsetBottom: undefined,
  target: () => window,
  zIndex: undefined,
});

const emit = defineEmits<ExAffixEmits>();
const stickyZIndex = useZIndexLayer('sticky');

const affixRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();
const isFixed = ref(false);
const affixStyle = ref<Record<string, string | number>>({});
const placeholderStyle = ref<{
  width?: string;
  height?: string;
}>({});

const affixClasses = computed(() => ['ex-affix']);

const wrapperStyle = computed(() => {
  if (isFixed.value) {
    return placeholderStyle.value;
  }
  return {};
});

const contentStyle = computed(() => {
  if (isFixed.value) {
    return affixStyle.value;
  }
  return {};
});

// 滚动容器元素
let scrollContainer: HTMLElement | Window | null = null;
const listenedScrollTargets = new Set<HTMLElement | Window>();
let resizeObserver: ResizeObserver | null = null;

const getTargetRect = (target: HTMLElement | Window) => {
  if (target === window) {
    return {
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
    };
  }
  return (target as HTMLElement).getBoundingClientRect();
};

const getOffset = (element: HTMLElement, container: HTMLElement | Window) => {
  const rect = element.getBoundingClientRect();
  const containerRect = getTargetRect(container);

  return {
    top: rect.top - containerRect.top,
    bottom: containerRect.bottom - rect.bottom,
    left: rect.left - containerRect.left,
    width: rect.width,
    height: rect.height,
  };
};

const updatePosition = () => {
  if (!affixRef.value || !scrollContainer) return;

  const offset = getOffset(affixRef.value, scrollContainer);

  const shouldFixTop = props.offsetTop !== undefined && offset.top <= props.offsetTop;
  const shouldFixBottom = props.offsetBottom !== undefined && offset.bottom <= props.offsetBottom;

  const shouldFix = shouldFixTop || shouldFixBottom;

  if (shouldFix !== isFixed.value) {
    isFixed.value = shouldFix;
    emit('change', shouldFix);
  }

  if (shouldFix) {
    const rect = affixRef.value.getBoundingClientRect();
    const containerRect = getTargetRect(scrollContainer);

    placeholderStyle.value = {
      width: `${rect.width}px`,
      height: `${contentRef.value?.getBoundingClientRect().height ?? rect.height}px`,
    };

    const styles: Record<string, string | number> = {
      position: 'fixed',
      width: `${rect.width}px`,
      zIndex: props.zIndex ?? stickyZIndex.value,
      left: `${rect.left}px`,
    };

    if (shouldFixTop) {
      // fixed 使用视口坐标，自定义容器的边界必须换算到视口。
      styles.top = `${containerRect.top + (props.offsetTop ?? 0)}px`;
    } else if (shouldFixBottom) {
      styles.bottom = `${window.innerHeight - containerRect.bottom + (props.offsetBottom ?? 0)}px`;
    }

    affixStyle.value = styles;
  } else {
    placeholderStyle.value = {};
    affixStyle.value = {};
  }
};

// 使用 requestAnimationFrame 节流，避免每个 scroll 事件都触发同步布局读取
let ticking = false;
let animationFrameId: number | null = null;
const scheduleUpdate = () => {
  if (ticking) return;
  ticking = true;
  animationFrameId = requestAnimationFrame(() => {
    ticking = false;
    animationFrameId = null;
    updatePosition();
  });
};

const handleScroll = () => {
  scheduleUpdate();
};

const handleResize = () => {
  scheduleUpdate();
};

const isScrollable = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return /(auto|scroll|overlay)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
};

const getScrollAncestors = (element: HTMLElement) => {
  const ancestors: HTMLElement[] = [];
  let current = element.parentElement;
  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollable(current)) ancestors.push(current);
    current = current.parentElement;
  }
  return ancestors;
};

const observeLayout = () => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (typeof ResizeObserver === 'undefined') return;

  resizeObserver = new ResizeObserver(scheduleUpdate);
  if (affixRef.value) resizeObserver.observe(affixRef.value);
  if (contentRef.value) resizeObserver.observe(contentRef.value);
  if (scrollContainer instanceof HTMLElement) resizeObserver.observe(scrollContainer);
};

const addListeners = () => {
  try {
    scrollContainer = props.target();
  } catch {
    scrollContainer = window;
  }
  if (!(scrollContainer instanceof HTMLElement) && scrollContainer !== window) {
    scrollContainer = window;
  }

  const scrollTargets: Array<HTMLElement | Window> = [scrollContainer];
  if (affixRef.value) {
    scrollTargets.push(...getScrollAncestors(affixRef.value));
  }
  scrollTargets.push(window);
  scrollTargets.forEach(target => {
    if (listenedScrollTargets.has(target)) return;
    target.addEventListener('scroll', handleScroll, { passive: true });
    listenedScrollTargets.add(target);
  });

  window.addEventListener('resize', handleResize);
  observeLayout();
};

const removeListeners = () => {
  listenedScrollTargets.forEach(target => target.removeEventListener('scroll', handleScroll));
  listenedScrollTargets.clear();
  scrollContainer = null;
  window.removeEventListener('resize', handleResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
};

watch(
  () => props.target,
  () => {
    removeListeners();
    addListeners();
    updatePosition();
  }
);

watch([() => props.offsetTop, () => props.offsetBottom, () => props.zIndex, stickyZIndex], () => {
  updatePosition();
});

onMounted(() => {
  addListeners();
  updatePosition();
});

onBeforeUnmount(() => {
  removeListeners();
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    ticking = false;
  }
});

const getElement = () => affixRef.value || null;

defineExpose<ExAffixExposed>({
  updatePosition,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExAffix.scss"></style>
