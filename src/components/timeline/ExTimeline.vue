<template>
  <div
    ref="timelineRef"
    :class="timelineClasses"
    :style="timelineStyles"
    role="list"
    :aria-label="ariaLabel"
  >
    <TimelineContent />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, provide, ref, useSlots, Fragment, isVNode, cloneVNode } from 'vue';
import type { VNode } from 'vue';
import type { ExTimelineProps, ExTimelineExposed } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExTimeline',
});

const { t } = useI18n();

const props = withDefaults(defineProps<ExTimelineProps>(), {
  direction: 'vertical',
  mode: 'left',
  showLine: true,
  reverse: false,
});

const timelineRef = ref<HTMLDivElement>();
const slots = useSlots();
// 展开 Fragment 后再反转，以实际时间线项目为单位，保留嵌套分组的 key 身份。
const flattenItems = (nodes: unknown[], prefix = ''): VNode[] =>
  nodes.flatMap((node, index) => {
    if (!isVNode(node)) return [];
    const key = `${prefix}/${String(node.key ?? index)}`;
    if (node.type === Fragment && Array.isArray(node.children))
      return flattenItems(node.children, key);
    return [cloneVNode(node, { key })];
  });
const TimelineContent = () => {
  const nodes = flattenItems(slots.default?.() ?? []);
  return props.reverse ? [...nodes].reverse() : nodes;
};

// 提供给子组件的上下文
provide(
  'timeline-direction',
  computed(() => props.direction)
);
provide(
  'timeline-mode',
  computed(() => props.mode)
);
provide(
  'timeline-show-line',
  computed(() => props.showLine)
);

// 计算属性
const timelineClasses = computed(() => {
  const classes = ['ex-timeline', `ex-timeline--${props.direction}`];

  if (props.direction === 'vertical') {
    classes.push(`ex-timeline--${props.mode}`);
  } else if (props.mode === 'alternate') {
    // 水平方向同样支持 alternate（内容在轴线上下交替）
    classes.push('ex-timeline--alternate');
  }

  if (props.reverse) {
    classes.push('ex-timeline--reverse');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const timelineStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const ariaLabel = computed(() => {
  return props.direction === 'horizontal' ? t('timeline.horizontal') : t('timeline.vertical');
});

// 暴露的方法
const getElement = () => timelineRef.value || null;

defineExpose<ExTimelineExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTimeline.scss"></style>
