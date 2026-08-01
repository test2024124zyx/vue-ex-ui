<template>
  <component
    :is="actualTag"
    :class="[
      'ex-typography',
      `ex-typography--${props.variant}`,
      `ex-typography--${props.size}`,
      {
        'ex-typography--truncate': props.truncate,
        'ex-typography--truncate-single-line': isSingleLineTruncate,
        'ex-typography--truncate-multiline': isMultiLineTruncate,
        'ex-typography--gradient': props.gradient,
        'ex-typography--gradient-animated': props.gradient && props.gradientAnimated,
        'ex-typography--glow': props.glow,
        'ex-typography--center': props.center,
        'ex-typography--bold': props.bold,
        'ex-typography--italic': props.italic,
        'ex-typography--underline': props.underline,
      },
    ]"
    :style="computedStyle"
    :title="truncationTitle"
    v-bind="$attrs"
  >
    <slot>{{ props.text }}</slot>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots, type CSSProperties } from 'vue';
import type { ExTypographyProps, TypographyTag, TypographyVariant } from './types';

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
  gradientAnimated: false,
  glow: false,
  center: false,
  bold: false,
  italic: false,
  underline: false,
  maxLines: 1,
});

const DEFAULT_TEXT_GRADIENT =
  'linear-gradient(90deg, var(--ex-color-primary) 0%, var(--ex-color-secondary) 100%)';

const MIN_MULTILINE_LINES = 2;
const THEME_COLOR_TOKENS = new Set([
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'danger',
  'info',
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'text-inverse',
  'text-disabled',
  'white',
  'black',
]);
const DEFAULT_TAG_BY_VARIANT: Record<TypographyVariant, TypographyTag> = {
  display: 'h1',
  heading: 'h2',
  title: 'h3',
  body: 'p',
  caption: 'span',
  overline: 'span',
};

const attrs = useAttrs();
const slots = useSlots();

// 将异常的行数输入收敛为浏览器 line-clamp 可以稳定处理的正整数。
const normalizedMaxLines = computed(() => {
  const maxLines = Number(props.maxLines);

  if (!Number.isFinite(maxLines)) {
    return 1;
  }

  return Math.max(1, Math.floor(maxLines));
});

const isMultiLineTruncate = computed(
  () => props.truncate && normalizedMaxLines.value >= MIN_MULTILINE_LINES
);
const isSingleLineTruncate = computed(() => props.truncate && !isMultiLineTruncate.value);

const isThemeColor = (color: string): boolean => THEME_COLOR_TOKENS.has(color.toLowerCase());

/** 仅计算需要由属性驱动的样式，排版变体和文本效果仍由独立类控制。 */
const computedStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  // 渐变优先于普通文字颜色，并为未挂载主题选择器的宿主提供语义色回退。
  if (props.gradient) {
    (style as Record<string, string>)['--ex-typography-gradient'] = DEFAULT_TEXT_GRADIENT;

    // 渐变文本的 color 是透明的，显式提供发光颜色才能让 gradient + glow 同时可见。
    if (props.glow) {
      (style as Record<string, string>)['--ex-typography-glow-color'] = 'var(--ex-color-primary)';
    }
  }

  // 仅将已注册的语义色映射为主题变量，其余交给浏览器解析为原始 CSS 颜色。
  if (props.color && !props.gradient) {
    const color = props.color.trim();
    style.color = isThemeColor(color) ? `var(--ex-color-${color.toLowerCase()})` : color;
  }

  // 多行截断需要由浏览器的 line-clamp 布局共同完成。
  if (isMultiLineTruncate.value) {
    style.display = '-webkit-box';
    style.WebkitLineClamp = normalizedMaxLines.value;
    style.WebkitBoxOrient = 'vertical';
    style.overflow = 'hidden';
  }

  // 调用方样式最后合并，保留 Vue 原生样式覆盖能力。
  return { ...style, ...props.customStyle };
});

/** 截断 text 属性时补充原文提示；插槽内容需要由调用方提供可访问名称。 */
const truncationTitle = computed(() => {
  if (!props.truncate || !props.text || slots.default || attrs.title !== undefined) {
    return undefined;
  }

  return props.text;
});

const actualTag = computed(() => props.tag ?? DEFAULT_TAG_BY_VARIANT[props.variant] ?? 'p');
</script>
<style lang="scss" src="./ExTypography.scss" scoped></style>
