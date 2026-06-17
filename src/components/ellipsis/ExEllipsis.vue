<template>
  <div
    ref="rootRef"
    role="group"
    :aria-label="computedAria"
    :class="ellipsisClasses"
  >
    <div
      ref="contentRef"
      :class="contentClasses"
      :style="contentStyle"
      :title="tooltip && !expanded ? fullText : undefined"
    >
      <slot />
    </div>

    <!-- 展开/收起按钮：仅在内容确实溢出（或已展开）时显示 -->
    <div
      v-if="expandable && (isOverflowing || expanded)"
      class="ex-ellipsis__actions"
    >
      <button
        class="ex-ellipsis__btn"
        type="button"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-label="expanded ? t('ellipsis.collapse') : t('ellipsis.expand')"
        @click="toggle"
      >
        <span class="ex-ellipsis__btn-text">
          {{ expanded ? t('ellipsis.collapse') : t('ellipsis.expand') }}
        </span>
        <span
          class="ex-ellipsis__btn-icon"
          :class="{ 'is-expanded': expanded }"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ellipsisPropDefs } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExEllipsis',
});

const props = defineProps(ellipsisPropDefs);
const { t } = useI18n();

// 溢出检测：内容实际高度超出折叠高度时才需要"展开"按钮
// 默认 true（未测量前假定溢出），在能拿到布局信息的环境中测量后修正
const isOverflowing = ref(true);
let resizeObserver: ResizeObserver | null = null;

const checkOverflow = () => {
  const el = contentRef.value;
  if (!el) return;
  if (expanded.value) return; // 展开状态下不重新判定
  // 无法测量（如 jsdom/未渲染）时保持当前判定
  if (el.scrollHeight === 0 && el.clientHeight === 0) return;
  isOverflowing.value = el.scrollHeight > el.clientHeight + 1;
};

onMounted(() => {
  nextTick(checkOverflow);
  if (typeof ResizeObserver !== 'undefined' && contentRef.value) {
    resizeObserver = new ResizeObserver(() => checkOverflow());
    resizeObserver.observe(contentRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(
  () => props.lines,
  () => nextTick(checkOverflow)
);

const rootRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const expanded = ref(false);

const getElement = () => rootRef.value || null;
defineExpose({ getElement });

const toggle = () => {
  expanded.value = !expanded.value;
};

const ellipsisClasses = computed(() => [
  'ex-ellipsis',
  {
    'ex-ellipsis--expanded': expanded.value,
    'ex-ellipsis--expandable': props.expandable,
  },
]);

const contentClasses = computed(() => [
  'ex-ellipsis__content',
  {
    'is-expanded': expanded.value,
    'is-ellipsis': !expanded.value,
  },
]);

const contentStyle = computed(() => {
  if (expanded.value) {
    return {};
  }

  return {
    WebkitLineClamp: String(props.lines),
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as Record<string, string>;
});

const fullText = computed(() => {
  return props.ariaLabel || contentRef.value?.textContent || '';
});

const computedAria = computed(() => props.ariaLabel || undefined);
</script>
<style lang="scss" scoped src="./ExEllipsis.scss"></style>
