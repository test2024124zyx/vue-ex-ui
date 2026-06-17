<template>
  <div
    ref="itemRef"
    :class="itemClasses"
    :style="itemStyles"
    role="listitem"
    @click="handleClick"
  >
    <!-- 垂直布局 -->
    <template v-if="direction === 'vertical'">
      <!-- 左侧内容区（alternate 模式） -->
      <div
        v-if="mode === 'alternate' && isRightSide"
        class="ex-timeline-item__content ex-timeline-item__content--left"
      >
        <div
          v-if="timestamp && timestampPosition === 'top'"
          class="ex-timeline-item__timestamp ex-timeline-item__timestamp--top"
        >
          <slot name="timestamp">
            {{ timestamp }}
          </slot>
        </div>
        <div class="ex-timeline-item__card">
          <slot />
        </div>
        <div
          v-if="timestamp && timestampPosition === 'bottom'"
          class="ex-timeline-item__timestamp ex-timeline-item__timestamp--bottom"
        >
          <slot name="timestamp">
            {{ timestamp }}
          </slot>
        </div>
      </div>

      <!-- 时间轴节点 -->
      <div class="ex-timeline-item__tail-wrapper">
        <!-- 连接线 -->
        <div
          v-if="showLine && !hideLine"
          class="ex-timeline-item__tail"
        />

        <!-- 节点 -->
        <div
          class="ex-timeline-item__node"
          :style="nodeStyle"
        >
          <slot name="dot">
            <div class="ex-timeline-item__dot" />
          </slot>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="ex-timeline-item__content ex-timeline-item__content--right">
        <div
          v-if="timestamp && timestampPosition === 'top' && (mode !== 'alternate' || !isRightSide)"
          class="ex-timeline-item__timestamp ex-timeline-item__timestamp--top"
        >
          <slot name="timestamp">
            {{ timestamp }}
          </slot>
        </div>
        <div
          v-if="mode !== 'alternate' || !isRightSide"
          class="ex-timeline-item__card"
        >
          <slot />
        </div>
        <div
          v-if="
            timestamp && timestampPosition === 'bottom' && (mode !== 'alternate' || !isRightSide)
          "
          class="ex-timeline-item__timestamp ex-timeline-item__timestamp--bottom"
        >
          <slot name="timestamp">
            {{ timestamp }}
          </slot>
        </div>
      </div>
    </template>

    <!-- 水平布局 -->
    <template v-else>
      <div class="ex-timeline-item__horizontal-wrapper">
        <!-- 节点 -->
        <div class="ex-timeline-item__node-horizontal">
          <div
            class="ex-timeline-item__node"
            :style="nodeStyle"
          >
            <slot name="dot">
              <div class="ex-timeline-item__dot" />
            </slot>
          </div>

          <!-- 连接线 -->
          <div
            v-if="showLine && !hideLine"
            class="ex-timeline-item__tail-horizontal"
          />
        </div>

        <!-- 内容区 -->
        <div class="ex-timeline-item__content ex-timeline-item__content--horizontal">
          <div
            v-if="timestamp"
            class="ex-timeline-item__timestamp ex-timeline-item__timestamp--horizontal"
          >
            <slot name="timestamp">
              {{ timestamp }}
            </slot>
          </div>
          <div class="ex-timeline-item__card">
            <slot />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, ref, onMounted, onUpdated } from 'vue';
import type { ComputedRef } from 'vue';
import type {
  ExTimelineItemProps,
  ExTimelineItemEmits,
  ExTimelineItemExposed,
  TimelineDirection,
  TimelineMode,
} from './types';

defineOptions({
  name: 'ExTimelineItem',
});

const props = withDefaults(defineProps<ExTimelineItemProps>(), {
  type: 'default',
  size: 'medium',
  timestampPosition: 'bottom',
  hollow: false,
  hideLine: false,
});

const emit = defineEmits<ExTimelineItemEmits>();

const itemRef = ref<HTMLDivElement>();
const itemIndex = ref(0);

// 注入父组件提供的上下文
const direction = inject<ComputedRef<TimelineDirection>>(
  'timeline-direction',
  computed(() => 'vertical')
);
const mode = inject<ComputedRef<TimelineMode>>(
  'timeline-mode',
  computed(() => 'left')
);
const showLine = inject<ComputedRef<boolean>>(
  'timeline-show-line',
  computed(() => true)
);

// 计算当前项是否在右侧（alternate 模式）
const isRightSide = computed(() => {
  return mode.value === 'alternate' && itemIndex.value % 2 === 1;
});

// 计算属性
const itemClasses = computed(() => {
  const classes = [
    'ex-timeline-item',
    `ex-timeline-item--${direction.value}`,
    `ex-timeline-item--${props.type}`,
    `ex-timeline-item--${props.size}`,
  ];

  if (direction.value === 'vertical') {
    classes.push(`ex-timeline-item--${mode.value}`);
    if (isRightSide.value) {
      classes.push('ex-timeline-item--right');
    }
  } else if (mode.value === 'alternate') {
    // 水平交替：奇数项内容置于轴线上方
    classes.push('ex-timeline-item--alternate');
    if (isRightSide.value) {
      classes.push('ex-timeline-item--above');
    }
  }

  if (props.hollow) {
    classes.push('ex-timeline-item--hollow');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const itemStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const nodeStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (props.color) {
    styles.borderColor = props.color;
    if (!props.hollow) {
      styles.backgroundColor = props.color;
    }
  }

  return styles;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

// 计算当前项在兄弟节点中的索引（onUpdated 时重算，保证动态增删/重排后 alternate 左右不错位）
const updateItemIndex = () => {
  const el = itemRef.value;
  if (el && el.parentElement) {
    const idx = Array.from(el.parentElement.children).indexOf(el);
    if (idx !== itemIndex.value) {
      itemIndex.value = idx;
    }
  }
};

onMounted(updateItemIndex);
onUpdated(updateItemIndex);

// 暴露的方法
const getElement = () => itemRef.value || null;

defineExpose<ExTimelineItemExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTimelineItem.scss"></style>
