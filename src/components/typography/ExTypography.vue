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

const DEFAULT_TEXT_GRADIENT =
  'var(--ex-gradient-primary, linear-gradient(135deg, var(--ex-color-primary), var(--ex-color-secondary)))';

/** 仅计算需要由属性驱动的样式，排版变体和文本效果仍由独立类控制。 */
const computedStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  // 渐变优先于普通文字颜色，并为未挂载主题选择器的宿主提供语义色回退。
  if (props.gradient) {
    (style as Record<string, string>)['--ex-typography-gradient'] = DEFAULT_TEXT_GRADIENT;
  }

  // 支持主题色名和原始 CSS 颜色值。
  if (props.color && !props.gradient) {
    const isRawColor = /^(#|rgb|hsl|var\(|color\()/i.test(props.color);
    style.color = isRawColor ? props.color : `var(--ex-color-${props.color})`;
  }

  // 多行截断需要由浏览器的 line-clamp 布局共同完成。
  if (props.truncate && props.maxLines > 1) {
    style.display = '-webkit-box';
    style.WebkitLineClamp = props.maxLines;
    style.WebkitBoxOrient = 'vertical';
    style.overflow = 'hidden';
  }

  // 调用方样式最后合并，保留 Vue 原生样式覆盖能力。
  return { ...style, ...props.customStyle };
});

/** 根据排版语义选择默认标签，显式 tag 始终优先。 */
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

const actualTag = computed(() => props.tag || getDefaultTag(props.variant));
</script>
<style lang="scss" src="./ExTypography.scss" scoped></style>
