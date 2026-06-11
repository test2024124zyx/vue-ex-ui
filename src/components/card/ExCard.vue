<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="cardStyles"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <div
      v-if="cover || $slots.cover"
      class="ex-card__cover"
      :style="coverStyle"
    >
      <slot name="cover">
        <img
          :src="cover"
          :alt="ariaLabel || 'Card cover'"
          class="ex-card__cover-image"
        >
      </slot>
    </div>

    <!-- 卡片头部 -->
    <div
      v-if="$slots.header"
      class="ex-card__header"
      :style="headerStyle"
    >
      <slot name="header" />
    </div>

    <!-- 卡片内容 -->
    <div
      class="ex-card__body"
      :style="bodyStyle"
    >
      <slot />
    </div>

    <!-- 卡片底部 -->
    <div
      v-if="$slots.footer || $slots.actions"
      class="ex-card__footer"
      :style="footerStyle"
    >
      <slot name="footer">
        <div
          v-if="$slots.actions"
          class="ex-card__actions"
        >
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <!-- 加载遮罩 -->
    <div
      v-if="loading"
      class="ex-card__loading"
    >
      <div class="ex-card__loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExCardProps, ExCardEmits, ExCardExposed } from './types';

defineOptions({
  name: 'ExCard',
});

const props = withDefaults(defineProps<ExCardProps>(), {
  type: 'default',
  size: 'medium',
  shadow: 'base',
  bordered: true,
  hoverable: false,
  loading: false,
});

const emit = defineEmits<ExCardEmits>();

const cardRef = ref<HTMLDivElement>();

// 计算属性
const cardClasses = computed(() => {
  const classes = [
    'ex-card',
    `ex-card--${props.type}`,
    `ex-card--${props.size}`,
    `ex-card--shadow-${props.shadow}`,
  ];

  if (!props.bordered) classes.push('ex-card--borderless');
  if (props.hoverable) classes.push('ex-card--hoverable');
  if (props.loading) classes.push('ex-card--loading');

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

const cardStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const coverStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.coverHeight) {
    styles.height =
      typeof props.coverHeight === 'number' ? `${props.coverHeight}px` : props.coverHeight;
  }
  return styles;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (!props.loading) {
    emit('click', event);
  }
};

// 暴露的方法
const getElement = () => cardRef.value || null;

defineExpose<ExCardExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExCard.scss"></style>
