<template>
  <div
    v-if="current"
    class="ex-chart-data-navigation"
  >
    <p
      :id="instructionsId"
      class="ex-chart-data-navigation__instructions"
    >
      {{ t('chart.keyboardInstructions') }}
    </p>
    <div
      ref="navigationRef"
      class="ex-chart-data-navigation__control"
      role="listbox"
      tabindex="0"
      :aria-label="t('chart.dataNavigation')"
      :aria-describedby="instructionsId"
      :aria-activedescendant="optionId"
      @focus="handleFocus"
      @blur="clearHighlight"
      @keydown="handleKeydown"
    >
      <span
        :id="optionId"
        :key="optionId"
        role="option"
        :aria-selected="highlighted"
        :aria-posinset="index + 1"
        :aria-setsize="items.length"
      >
        {{ description }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from '../../locale';
import { generateId } from '../../utils/id';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { registerOverlayEscapeBoundary } from '../../composables/overlay-manager';
import type { ChartNavigationItem } from './chart-accessibility';

defineOptions({ name: 'ExChartDataNavigation' });
const props = defineProps<{ items: readonly ChartNavigationItem[] }>();
const emit = defineEmits<{
  highlight: [item: ChartNavigationItem | null];
  activate: [item: ChartNavigationItem];
}>();
const { t } = useI18n();
const identifier = generateId('ex-chart-data');
const instructionsId = `${identifier}-instructions`;
const index = ref(0);
const highlighted = ref(false);
const navigationRef = ref<HTMLElement>();
let releaseEscapeBoundary: (() => void) | undefined;
const current = computed(() => props.items[index.value]);
const optionId = computed(
  () => `${identifier}-${current.value?.seriesIndex}-${current.value?.dataIndex}`
);
const description = computed(() => {
  const item = current.value;
  if (!item) return '';
  const value = Array.isArray(item.value) ? item.value.join(', ') : String(item.value);
  return item.label ? `${item.label}: ${value}` : value;
});

const clearHighlight = () => {
  highlighted.value = false;
  emit('highlight', null);
};
const handleFocus = () => {
  if (!current.value) return;
  highlighted.value = true;
  emit('highlight', current.value);
};
const handleKeydown = (event: KeyboardEvent) => {
  if (isComposingKeyboardEvent(event)) return;
  if (event.key === 'Escape') {
    if (!highlighted.value) return;
    event.preventDefault();
    event.stopPropagation();
    clearHighlight();
    return;
  }
  if ((event.key === 'Enter' || event.key === ' ') && current.value) {
    event.preventDefault();
    emit('activate', current.value);
    return;
  }
  let next = index.value;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next += 1;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next -= 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = props.items.length - 1;
  else return;
  event.preventDefault();
  index.value = Math.max(0, Math.min(props.items.length - 1, next));
  handleFocus();
};

watch(
  () => props.items,
  (items, previous) => {
    const selected = previous[index.value];
    const retainedIndex = selected
      ? items.findIndex(
          item => item.seriesIndex === selected.seriesIndex && item.dataIndex === selected.dataIndex
        )
      : -1;
    index.value =
      retainedIndex >= 0 ? retainedIndex : Math.max(0, Math.min(index.value, items.length - 1));
    if (highlighted.value) {
      if (current.value) emit('highlight', current.value);
      else clearHighlight();
    }
  }
);

onMounted(() => {
  if (!navigationRef.value) return;
  releaseEscapeBoundary = registerOverlayEscapeBoundary(
    navigationRef.value,
    () => highlighted.value,
    clearHighlight
  );
});
onBeforeUnmount(() => {
  releaseEscapeBoundary?.();
  if (highlighted.value) clearHighlight();
});
</script>

<style scoped lang="scss">
.ex-chart-data-navigation {
  &__instructions {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__control {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);

    &:focus-visible {
      inset: auto var(--ex-spacing-2) var(--ex-spacing-2);
      z-index: 2;
      width: auto;
      height: auto;
      padding: var(--ex-spacing-2) var(--ex-spacing-3);
      overflow: visible;
      clip-path: none;
      color: var(--ex-color-text-primary);
      background: var(--ex-color-bg-elevated);
      border-radius: var(--ex-radius-sm);
      outline: 2px solid var(--ex-color-primary);
      outline-offset: 2px;
    }
  }
}
</style>
