<template>
  <component
    :is="actualTag"
    :class="[
      'ex-typography',
      `ex-typography--${variant}`,
      `ex-typography--${size}`,
      {
        'ex-typography--truncate': truncate,
        'ex-typography--gradient': gradient,
        'ex-typography--glow': glow,
        'ex-typography--center': center,
        'ex-typography--bold': bold,
        'ex-typography--italic': italic,
        'ex-typography--underline': underline,
      },
    ]"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot>{{ text }}</slot>
  </component>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import type { ExTypographyProps } from './types';

defineOptions({
  name: 'ExTypography',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExTypographyProps>(), {
  variant: 'body',
  size: 'md',
  color: 'text-primary',
  truncate: false,
  gradient: false,
  glow: false,
  center: false,
  bold: false,
  italic: false,
  underline: false,
  maxLines: 1,
});

// 计算样式
const computedStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  // 设置颜色
  if (props.color && !props.gradient) {
    style.color = `var(--ex-color-${props.color})`;
  }

  // 设置多行截断
  if (props.truncate && props.maxLines > 1) {
    style.display = '-webkit-box';
    style.WebkitLineClamp = props.maxLines;
    style.WebkitBoxOrient = 'vertical';
    style.overflow = 'hidden';
  }

  // 合并自定义样式
  return { ...style, ...props.customStyle };
});

// 获取默认标签映射
const getDefaultTag = (variant: string): string => {
  const tagMap: Record<string, string> = {
    display: 'h1',
    heading: 'h2',
    title: 'h3',
    body: 'p',
    caption: 'span',
    overline: 'span',
  };
  return tagMap[variant] || 'p';
};

// 如果没有指定标签，使用默认映射
const actualTag = computed(() => props.tag || getDefaultTag(props.variant));
</script>
<style lang="scss" src="./ExTypography.scss" scoped></style>
