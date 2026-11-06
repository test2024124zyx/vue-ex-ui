<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="cardStyles"
    :aria-label="hasClickListener() ? undefined : ariaLabel"
    :aria-busy="loading || undefined"
    :aria-disabled="hasClickListener() && loading ? 'true' : undefined"
    @click.self="handleClick"
  >
    <button
      v-if="hasClickListener()"
      class="ex-card__primary-action"
      type="button"
      :disabled="loading"
      :aria-label="ariaLabel || t('card.more')"
      @click="handleClick"
    ></button>

    <!-- 封面图片 -->
    <div
      v-if="cover || $slots.cover"
      class="ex-card__cover"
      :style="coverStyle"
      :inert="loading || undefined"
    >
      <slot name="cover">
        <img
          :src="cover"
          :alt="ariaLabel || ''"
          class="ex-card__cover-image"
        />
      </slot>
    </div>

    <!-- 卡片头部 -->
    <div
      v-if="$slots.header"
      class="ex-card__header"
      :style="headerStyle"
      :inert="loading || undefined"
    >
      <slot name="header" />
    </div>

    <!-- 卡片内容 -->
    <div
      class="ex-card__body"
      :style="bodyStyle"
      :inert="loading || undefined"
    >
      <slot />
    </div>

    <!-- 卡片底部 -->
    <div
      v-if="$slots.footer || $slots.actions"
      class="ex-card__footer"
      :style="footerStyle"
      :inert="loading || undefined"
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
      role="status"
      aria-live="polite"
      :aria-label="t('common.loading')"
    >
      <div class="ex-card__loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useComponentSize } from '../config-provider/composables';
import { computed, ref, type EmitFn } from 'vue';
import type { ExCardProps, ExCardEmits, ExCardExposed } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExCard',
});

const props = withDefaults(defineProps<ExCardProps>(), {
  type: 'default',
  shadow: 'base',
  bordered: true,
  hoverable: false,
  loading: false,
});

// click 影响渲染，作为响应式属性接收；保留 Vue 分发以兼容 once 和错误处理。
const emit: EmitFn<ExCardEmits> = defineEmits([] as string[]);
const { t } = useI18n();

const cardRef = ref<HTMLDivElement>();
const componentSize = useComponentSize(computed(() => props.size));

// 仅在实际注册 click 监听器时提供按钮语义，静态卡片不会进入 Tab 顺序。
const hasClickListener = (): boolean => Boolean(props.onClick || props.onClickOnce);

// 计算属性
const cardClasses = computed(() => {
  const classes = [
    'ex-card',
    `ex-card--${props.type}`,
    `ex-card--${componentSize.value}`,
    `ex-card--shadow-${props.shadow}`,
  ];

  if (!props.bordered) classes.push('ex-card--borderless');
  if (props.hoverable) classes.push('ex-card--hoverable');
  if (props.loading) classes.push('ex-card--loading');
  if (hasClickListener()) classes.push('ex-card--clickable');

  classes.push(...normalizeCustomClass(props.class));

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
