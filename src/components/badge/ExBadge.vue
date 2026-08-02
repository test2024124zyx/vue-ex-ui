<template>
  <div
    ref="badgeRef"
    :class="badgeClasses"
    :style="props.style"
  >
    <!-- 子内容 -->
    <div
      v-if="hasSlotContent"
      class="ex-badge__content"
    >
      <slot></slot>
    </div>

    <!-- 徽章本体 -->
    <component
      :is="badgeTag"
      v-if="showBadge"
      :class="badgeSupClasses"
      :style="badgeSupStyles"
      :type="props.clickable ? 'button' : undefined"
      :title="badgeTitle || undefined"
      :aria-label="accessibleLabel || undefined"
      @click="handleClick"
    >
      <!-- 状态点模式 -->
      <template v-if="isStatusMode">
        <span class="ex-badge__status-dot"></span>
        <span
          v-if="text"
          class="ex-badge__status-text"
        >
          {{ text }}
        </span>
      </template>

      <!-- 数字/文本模式 -->
      <template v-else-if="!dot">
        <span class="ex-badge__count-text">
          {{ displayCount }}
        </span>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, useSlots } from 'vue';
import type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed } from './types';
import { hasRenderableContent } from '../../utils/vnode';
import { getFirstGrapheme } from '../../utils/text';
import { useLocale } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExBadge',
});

const DEFAULT_OVERFLOW_COUNT = 99;

const props = withDefaults(defineProps<ExBadgeProps>(), {
  type: 'primary',
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  overflowCount: DEFAULT_OVERFLOW_COUNT,
  showZero: false,
  dot: false,
  position: 'top-right',
  shape: 'default',
  clickable: false,
});

const emit = defineEmits<ExBadgeEmits>();
const slots = useSlots();
const badgeRef = ref<HTMLElement>();
const { t } = useLocale('badge');

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 计算属性
const hasSlotContent = computed(() => hasRenderableContent(slots.default?.({})));

const isStatusMode = computed(() => {
  return !!props.status && !hasSlotContent.value;
});

const showBadge = computed(() => {
  if (isStatusMode.value) return true;
  if (props.dot) return true;

  const count = Number(props.count);
  if (Number.isNaN(count)) return Boolean(props.count);

  return count > 0 || (count === 0 && props.showZero);
});

const displayCount = computed(() => {
  if (props.dot || isStatusMode.value) return '';

  const count = Number(props.count);
  if (Number.isNaN(count)) return props.count ?? '';

  if (count > props.overflowCount) {
    return t('more', { count: props.overflowCount });
  }

  return count.toString();
});

const badgeTitle = computed((): string => {
  if (props.title) return props.title;
  if (isStatusMode.value) return props.text || '';
  return String(displayCount.value ?? '');
});

const accessibleLabel = computed((): string => {
  if (props.ariaLabel) return props.ariaLabel;
  if (isStatusMode.value) return props.text || t('status');
  if (props.dot) return t('dot');
  return String(displayCount.value ?? '');
});

const badgeTag = computed(() => (props.clickable ? 'button' : 'span'));

const normalizedPosition = computed(() =>
  hasSlotContent.value && !isStatusMode.value ? props.position : undefined
);

const normalizedShape = computed(() => {
  if (isStatusMode.value) return 'status';
  if (props.dot) return 'dot';
  return 'count';
});

const normalizedVisualShape = computed(() => {
  if (normalizedShape.value !== 'count') return undefined;
  if (props.shape !== 'circle') return props.shape;

  const countText = String(displayCount.value ?? '');
  return getFirstGrapheme(countText) === countText ? 'circle' : 'round';
});

const badgeClasses = computed(() => {
  const classes = ['ex-badge'];

  if (hasSlotContent.value) {
    classes.push('ex-badge--with-content');
  }

  if (isStatusMode.value) {
    classes.push('ex-badge--status');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const badgeSupClasses = computed(() => {
  const classes = ['ex-badge__sup'];

  // 类型样式
  if (isStatusMode.value && props.status) {
    classes.push(`ex-badge__sup--status-${props.status}`);
  } else {
    classes.push(`ex-badge__sup--${props.type}`);
  }

  // 尺寸样式
  classes.push(`ex-badge__sup--${componentSize.value}`);

  // 形状样式
  classes.push(`ex-badge__sup--${normalizedShape.value}`);

  // 视觉形状
  if (normalizedVisualShape.value && normalizedVisualShape.value !== 'default') {
    classes.push(`ex-badge__sup--shape-${normalizedVisualShape.value}`);
  }

  // 位置样式
  if (normalizedPosition.value) classes.push(`ex-badge__sup--${normalizedPosition.value}`);

  if (props.clickable) classes.push('is-clickable');

  return classes;
});

const badgeSupStyles = computed(() => {
  const styles: Record<string, string | number> = {};

  // 自定义颜色
  if (props.color) {
    styles.background = props.color;
    styles.borderColor = props.color;
  }

  // 偏移量
  if (props.offset && hasSlotContent.value) {
    const [x, y] = props.offset;
    // 偏移作为定位变换的增量，避免覆盖角落锚定所需的 50% translate。
    styles['--ex-badge-offset-x'] = typeof x === 'number' ? `${x}px` : x;
    styles['--ex-badge-offset-y'] = typeof y === 'number' ? `${y}px` : y;
  }

  // 自定义徽章样式
  if (props.badgeStyle) {
    if (typeof props.badgeStyle === 'string') {
      const inlineStyles = Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      return inlineStyles ? `${inlineStyles}; ${props.badgeStyle}` : props.badgeStyle;
    } else {
      Object.assign(styles, props.badgeStyle);
    }
  }

  return styles;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

// 暴露的方法
const getElement = () => {
  return badgeRef.value || null;
};

defineExpose<ExBadgeExposed>({
  getElement,
});
</script>
<style lang="scss" scoped src="./ExBadge.scss"></style>
