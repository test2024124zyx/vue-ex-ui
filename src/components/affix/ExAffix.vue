<template>
  <div
    ref="affixRef"
    :class="affixClasses"
    :style="wrapperStyle"
  >
    <div
      :class="['ex-affix__content', { 'is-fixed': isFixed }]"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type { ExAffixProps, ExAffixEmits, ExAffixExposed } from './types';

defineOptions({
  name: 'ExAffix',
});

const props = withDefaults(defineProps<ExAffixProps>(), {
  offsetTop: undefined,
  offsetBottom: undefined,
  target: () => window,
  zIndex: 100,
});

const emit = defineEmits<ExAffixEmits>();

const affixRef = ref<HTMLDivElement>();
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
let scrollContainer: HTMLElement | Window;

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
  if (!affixRef.value) return;

  const offset = getOffset(affixRef.value, scrollContainer);

  const shouldFixTop =
    props.offsetTop !== undefined && offset.top <= props.offsetTop;
  const shouldFixBottom =
    props.offsetBottom !== undefined && offset.bottom <= props.offsetBottom;

  const shouldFix = shouldFixTop || shouldFixBottom;

  if (shouldFix !== isFixed.value) {
    isFixed.value = shouldFix;
    emit('change', shouldFix);
  }

  if (shouldFix) {
    const rect = affixRef.value.getBoundingClientRect();

    placeholderStyle.value = {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };

    const styles: Record<string, string | number> = {
      position: 'fixed',
      width: `${rect.width}px`,
      zIndex: props.zIndex,
      left: `${rect.left}px`,
    };

    if (shouldFixTop) {
      styles.top = `${props.offsetTop}px`;
    } else if (shouldFixBottom) {
      styles.bottom = `${props.offsetBottom}px`;
    }

    affixStyle.value = styles;
  } else {
    placeholderStyle.value = {};
    affixStyle.value = {};
  }
};

// 使用 requestAnimationFrame 节流，避免每个 scroll 事件都触发同步布局读取
let ticking = false;
const scheduleUpdate = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updatePosition();
  });
};

const handleScroll = () => {
  scheduleUpdate();
};

const handleResize = () => {
  scheduleUpdate();
};

const addListeners = () => {
  scrollContainer = props.target();

  scrollContainer.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
};

const removeListeners = () => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', handleResize);
};

watch(() => props.target, () => {
  removeListeners();
  addListeners();
  updatePosition();
});

watch([() => props.offsetTop, () => props.offsetBottom], () => {
  updatePosition();
});

onMounted(() => {
  addListeners();
  updatePosition();
});

onBeforeUnmount(() => {
  removeListeners();
});

const getElement = () => affixRef.value || null;

defineExpose<ExAffixExposed>({
  updatePosition,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExAffix.scss"></style>
