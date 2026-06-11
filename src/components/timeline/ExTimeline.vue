<template>
  <div
    ref="timelineRef"
    :class="timelineClasses"
    :style="timelineStyles"
    role="list"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import type { ExTimelineProps, ExTimelineExposed } from './types';

defineOptions({
  name: 'ExTimeline',
});

const props = withDefaults(defineProps<ExTimelineProps>(), {
  direction: 'vertical',
  mode: 'left',
  showLine: true,
  reverse: false,
});

const timelineRef = ref<HTMLDivElement>();

// 提供给子组件的上下文
provide('timeline-direction', computed(() => props.direction));
provide('timeline-mode', computed(() => props.mode));
provide('timeline-show-line', computed(() => props.showLine));

// 计算属性
const timelineClasses = computed(() => {
  const classes = [
    'ex-timeline',
    `ex-timeline--${props.direction}`,
  ];

  if (props.direction === 'vertical') {
    classes.push(`ex-timeline--${props.mode}`);
  }

  if (props.reverse) {
    classes.push('ex-timeline--reverse');
  }

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

const timelineStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const ariaLabel = computed(() => {
  return props.direction === 'horizontal' ? '水平时间轴' : '垂直时间轴';
});

// 暴露的方法
const getElement = () => timelineRef.value || null;

defineExpose<ExTimelineExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTimeline.scss"></style>
