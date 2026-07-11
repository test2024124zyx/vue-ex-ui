<template>
  <div
    ref="rootRef"
    :class="ellipsisClasses"
    :role="groupRole"
    :aria-label="accessibleLabel"
  >
    <div
      :id="contentId"
      ref="contentRef"
      :class="contentClasses"
      :style="contentStyle"
      :title="tooltipText"
    >
      <slot />
    </div>

    <div
      v-if="showActions"
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useI18n } from '../../locale';
import type { ExEllipsisEmits, ExEllipsisExposed, ExEllipsisProps } from './types';

defineOptions({ name: 'ExEllipsis' });

const props = withDefaults(defineProps<ExEllipsisProps>(), {
  lines: 1,
  expandable: false,
  tooltip: true,
  ariaLabel: undefined,
  expanded: undefined,
  defaultExpanded: false,
});
const emit = defineEmits<ExEllipsisEmits>();
const { t } = useI18n();
const rootRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const contentId = `ex-ellipsis-content-${useId()}`;
const internalExpanded = ref(props.defaultExpanded);
const isOverflowing = ref(false);
const fullText = ref('');
let resizeObserver: ResizeObserver | null = null;
let measureFrame: number | undefined;

const normalizedLines = computed(() => {
  if (!Number.isFinite(props.lines) || props.lines <= 0) return 1;
  return Math.max(1, Math.trunc(props.lines));
});
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

const ellipsisClasses = computed(() => [
  'ex-ellipsis',
  {
    'ex-ellipsis--expanded': isExpanded.value,
    'ex-ellipsis--expandable': props.expandable,
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
  fullText.value = element.textContent?.trim() || '';
  if (isExpanded.value) return;

  const measurable =
    element.scrollHeight > 0 ||
    element.clientHeight > 0 ||
    element.scrollWidth > 0 ||
    element.clientWidth > 0;
  isOverflowing.value =
    measurable &&
    (element.scrollHeight > element.clientHeight + 1 ||
      element.scrollWidth > element.clientWidth + 1);
};

const queueMeasurement = () => {
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
  queueMeasurement();
  if (typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver(queueMeasurement);
  if (rootRef.value) resizeObserver.observe(rootRef.value);
  if (contentRef.value) resizeObserver.observe(contentRef.value);
});

onUpdated(queueMeasurement);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
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
