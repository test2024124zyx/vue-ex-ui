<template>
  <div ref="badgeRef" :class="badgeClasses" :style="badgeStyles">
    <!-- 子内容 -->
    <div v-if="hasSlotContent" class="ex-badge__content">
      <slot />
    </div>

    <!-- 徽章本体 -->
    <div
      v-if="showBadge"
      :class="badgeSupClasses"
      :style="badgeSupStyles"
      :title="badgeTitle"
      @click="handleClick"
    >
      <!-- 状态点模式 -->
      <template v-if="isStatusMode">
        <span class="ex-badge__status-dot" />
        <span v-if="text" class="ex-badge__status-text">
          {{ text }}
        </span>
      </template>

      <!-- 数字/文本模式 -->
      <template v-else-if="!dot">
        <span class="ex-badge__count-text">
          {{ displayCount }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, useSlots } from 'vue';
import type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExBadge',
});

const props = withDefaults(defineProps<ExBadgeProps>(), {
  type: 'primary',
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  overflowCount: 99,
  showZero: false,
  dot: false,
  position: 'top-right',
});

const emit = defineEmits<ExBadgeEmits>();
const slots = useSlots();
const badgeRef = ref<HTMLElement>();
const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 计算属性
const hasSlotContent = computed(() => {
  return !!slots.default;
});

const isStatusMode = computed(() => {
  return !!props.status && !hasSlotContent.value;
});

const showBadge = computed(() => {
  if (isStatusMode.value) return true;
  if (props.dot) return true;

  const count = Number(props.count);
  if (isNaN(count)) return !!props.count;

  return count > 0 || (count === 0 && props.showZero);
});

const displayCount = computed(() => {
  if (props.dot || isStatusMode.value) return '';

  const count = Number(props.count);
  if (isNaN(count)) return props.count;

  if (count > props.overflowCount) {
    return t('badge.more', { count: props.overflowCount });
  }

  return count.toString();
});

const badgeTitle = computed((): string => {
  if (props.title) return props.title;
  if (isStatusMode.value) return props.text || '';
  return String(displayCount.value || '');
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
  if (props.status) {
    classes.push(`ex-badge__sup--status-${props.status}`);
  } else {
    classes.push(`ex-badge__sup--${props.type}`);
  }

  // 尺寸样式
  classes.push(`ex-badge__sup--${componentSize.value}`);

  // 形状样式
  if (props.dot) {
    classes.push('ex-badge__sup--dot');
  } else if (isStatusMode.value) {
    classes.push('ex-badge__sup--status');
  } else {
    classes.push('ex-badge__sup--count');
  }

  // 位置样式
  if (hasSlotContent.value) {
    classes.push(`ex-badge__sup--${props.position}`);
  }

  return classes;
});

const badgeStyles = computed(() => {
  if (!props.style) return undefined;

  if (typeof props.style === 'string') {
    return props.style;
  }

  return props.style;
});

const badgeSupStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 自定义颜色
  if (props.color) {
    styles.backgroundColor = props.color;
    styles.borderColor = props.color;
  }

  // 偏移量
  if (props.offset && hasSlotContent.value) {
    const [x, y] = props.offset;
    styles.transform = `translate(${typeof x === 'number' ? x + 'px' : x}, ${typeof y === 'number' ? y + 'px' : y})`;
  }

  // 自定义徽章样式
  if (props.badgeStyle) {
    if (typeof props.badgeStyle === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.badgeStyle}`;
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
