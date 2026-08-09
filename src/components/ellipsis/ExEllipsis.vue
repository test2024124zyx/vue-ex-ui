<template>
  <div
    ref="rootRef"
    :class="ellipsisClasses"
    :role="groupRole"
    :aria-label="accessibleLabel"
  >
    <EllipsisTooltip
      ref="tooltipRef"
      class="ex-ellipsis__tooltip"
      :content="tooltipText"
      :disabled="!tooltipText"
      trigger="hover-focus"
      :close-delay="0"
      :tabindex="tooltipTabIndex"
    >
      <div
        :id="contentId"
        ref="contentRef"
        :class="contentClasses"
        :style="contentStyle"
      >
        <slot></slot>
      </div>
    </EllipsisTooltip>

    <div
      v-if="showActions && normalizedExpandControl === 'button'"
      class="ex-ellipsis__actions"
    >
      <button
        class="ex-ellipsis__btn"
        type="button"
        :aria-controls="contentId"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? t('ellipsis.collapse') : t('ellipsis.expand')"
        @click="toggle"
      >
        <span class="ex-ellipsis__btn-text">
          {{ isExpanded ? t('ellipsis.collapse') : t('ellipsis.expand') }}
        </span>
        <span
          class="ex-ellipsis__btn-icon"
          :class="{ 'is-expanded': isExpanded }"
          aria-hidden="true"
        >
          <ExIcon
            icon="arrow-down-s-line"
            :size="16"
          />
        </span>
      </button>
    </div>

    <button
      v-else-if="showActions"
      class="ex-ellipsis__inline-control"
      type="button"
      :aria-controls="contentId"
      :aria-expanded="isExpanded"
      :aria-label="isExpanded ? t('ellipsis.collapse') : t('ellipsis.expand')"
      @click="toggle"
    >
      <span
        class="ex-ellipsis__btn-icon"
        :class="{ 'is-expanded': isExpanded }"
        aria-hidden="true"
      >
        <ExIcon
          icon="arrow-down-s-line"
          :size="16"
        />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue';
import type { Component, CSSProperties } from 'vue';
import { useI18n } from '../../locale';
import ExIcon from '../icon/ExIcon.vue';
import ExTooltip from '../tooltip/ExTooltip.vue';
import type { ExTooltipExposed } from '../tooltip/types';
import type { ExEllipsisEmits, ExEllipsisExposed, ExEllipsisProps } from './types';

defineOptions({ name: 'ExEllipsis' });

// 将内部 Tooltip 的完整组件泛型收窄，避免生成声明时泄漏 Vue 全局组件注册表类型。
const EllipsisTooltip = ExTooltip as Component;

const props = withDefaults(defineProps<ExEllipsisProps>(), {
  lines: 1,
  expandable: false,
  expandControl: 'button',
  tooltip: true,
  ariaLabel: undefined,
  expanded: undefined,
  defaultExpanded: false,
});
const emit = defineEmits<ExEllipsisEmits>();
const { t } = useI18n();
const rootRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const tooltipRef = ref<ExTooltipExposed>();
const contentId = `ex-ellipsis-content-${useId()}`;
const internalExpanded = ref(props.defaultExpanded);
const isOverflowing = ref(false);
const fullText = ref('');
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let measureFrame: number | undefined;
let usesWindowResizeFallback = false;
let isUnmounted = false;

// 允许浏览器存在极小的布局舍入误差，不把它误判为真实溢出。
const OVERFLOW_TOLERANCE_PX = 1;

const normalizedLines = computed(() => {
  if (!Number.isFinite(props.lines) || props.lines <= 0) return 1;
  return Math.max(1, Math.trunc(props.lines));
});
const normalizedExpandControl = computed(() =>
  props.expandControl === 'inline' ? 'inline' : 'button'
);
const isControlled = computed(() => props.expanded !== undefined);
const requestedExpanded = computed(() => props.expanded ?? internalExpanded.value);
const isExpanded = computed(() => props.expandable && requestedExpanded.value);
const accessibleLabel = computed(() => props.ariaLabel?.trim() || undefined);
const groupRole = computed(() =>
  props.expandable || accessibleLabel.value ? ('group' as const) : undefined
);
const showActions = computed(() => props.expandable && (isOverflowing.value || isExpanded.value));
const tooltipText = computed(() =>
  props.tooltip && isOverflowing.value && !isExpanded.value && fullText.value
    ? fullText.value
    : undefined
);
const tooltipTabIndex = computed(() => (tooltipText.value ? 0 : undefined));

const ellipsisClasses = computed(() => [
  'ex-ellipsis',
  `ex-ellipsis--control-${normalizedExpandControl.value}`,
  {
    'ex-ellipsis--expanded': isExpanded.value,
    'ex-ellipsis--expandable': props.expandable,
    'ex-ellipsis--has-control': showActions.value,
  },
]);
const contentClasses = computed(() => [
  'ex-ellipsis__content',
  isExpanded.value ? 'is-expanded' : 'is-ellipsis',
]);
const contentStyle = computed<CSSProperties>(() => ({
  '--ex-ellipsis-lines': normalizedLines.value,
}));

/** 同时检测多行高度溢出与单行水平溢出，并同步真实可见文本。 */
const checkOverflow = () => {
  const element = contentRef.value;
  if (!element) return;

  // Tooltip 需要可读的纯文本，去除模板缩进和插槽节点之间多余的空白。
  fullText.value = element.textContent?.replace(/\s+/g, ' ').trim() || '';
  if (isExpanded.value) return;

  const measurable =
    element.scrollHeight > 0 ||
    element.clientHeight > 0 ||
    element.scrollWidth > 0 ||
    element.clientWidth > 0;
  isOverflowing.value =
    measurable &&
    (element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE_PX ||
      element.scrollWidth > element.clientWidth + OVERFLOW_TOLERANCE_PX);
};

const queueMeasurement = () => {
  if (isUnmounted) return;
  if (typeof requestAnimationFrame === 'undefined') {
    nextTick(checkOverflow);
    return;
  }
  if (measureFrame !== undefined) cancelAnimationFrame(measureFrame);
  measureFrame = requestAnimationFrame(() => {
    measureFrame = undefined;
    checkOverflow();
  });
};

const requestExpanded = (expanded: boolean) => {
  if (!props.expandable || isExpanded.value === expanded) return;
  emit('update:expanded', expanded);
  if (!isControlled.value) internalExpanded.value = expanded;
};

const expand = () => requestExpanded(true);
const collapse = () => requestExpanded(false);
const toggle = () => requestExpanded(!isExpanded.value);
const getElement = () => rootRef.value ?? null;

watch(tooltipText, text => {
  if (!text) tooltipRef.value?.hide();
});

watch(
  isExpanded,
  expanded => {
    if (expanded) emit('expand');
    else emit('collapse');
    if (!expanded) nextTick(checkOverflow);
  },
  { flush: 'sync' }
);
watch(normalizedLines, queueMeasurement);

onMounted(() => {
  // 首次挂载直接在下一轮 Vue 更新中测量，尽量避免按钮晚一帧出现造成布局跳动。
  void nextTick(checkOverflow);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(queueMeasurement);
    if (rootRef.value) resizeObserver.observe(rootRef.value);
    if (contentRef.value) resizeObserver.observe(contentRef.value);
  } else if (typeof window !== 'undefined') {
    // 不支持 ResizeObserver 的浏览器至少可以在窗口尺寸变化时重新计算。
    window.addEventListener('resize', queueMeasurement, { passive: true });
    usesWindowResizeFallback = true;
  }

  if (typeof MutationObserver !== 'undefined' && contentRef.value) {
    mutationObserver = new MutationObserver(queueMeasurement);
    mutationObserver.observe(contentRef.value, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // 字体加载完成后字宽可能改变；重新测量避免省略状态停留在旧结果。
  const fontSet =
    typeof document !== 'undefined' && 'fonts' in document ? document.fonts : undefined;
  if (fontSet) {
    void fontSet.ready.then(() => {
      if (!isUnmounted) queueMeasurement();
    });
  }
});

onUpdated(queueMeasurement);

onBeforeUnmount(() => {
  isUnmounted = true;
  resizeObserver?.disconnect();
  resizeObserver = null;
  mutationObserver?.disconnect();
  mutationObserver = null;
  if (usesWindowResizeFallback && typeof window !== 'undefined') {
    window.removeEventListener('resize', queueMeasurement);
  }
  usesWindowResizeFallback = false;
  if (measureFrame !== undefined) cancelAnimationFrame(measureFrame);
  measureFrame = undefined;
});

defineExpose<ExEllipsisExposed>({
  getElement,
  checkOverflow,
  expand,
  collapse,
  toggle,
  isExpanded: () => isExpanded.value,
});
</script>

<style scoped lang="scss" src="./ExEllipsis.scss"></style>
