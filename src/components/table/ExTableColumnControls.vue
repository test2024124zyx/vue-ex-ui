<template>
  <div
    class="ex-table-column-controls"
    @click.stop
  >
    <template v-if="reorderable">
      <button
        type="button"
        class="ex-table-column-controls__move"
        :disabled="disabled"
        :aria-label="t('moveColumnBefore', { column: title })"
        @click="emit('move', 'before')"
      >
        <ExIcon
          icon="arrow-left-s-line"
          :size="14"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        class="ex-table-column-controls__drag"
        :draggable="!disabled"
        :disabled="disabled"
        :aria-label="t('reorderColumn', { column: title })"
        @dragstart="dragStart"
        @dragend="columnDrag?.clear()"
        @dragover.prevent="dragOver"
        @drop.prevent.stop="drop"
        @keydown.left.prevent="emit('move', 'before')"
        @keydown.right.prevent="emit('move', 'after')"
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>
      <button
        type="button"
        class="ex-table-column-controls__move"
        :disabled="disabled"
        :aria-label="t('moveColumnAfter', { column: title })"
        @click="emit('move', 'after')"
      >
        <ExIcon
          icon="arrow-right-s-line"
          :size="14"
          aria-hidden="true"
        />
      </button>
    </template>
    <div
      v-if="resizable"
      class="ex-table-column-controls__resize"
      :class="{ 'ex-table-column-controls__resize--active': resizing }"
      role="separator"
      aria-orientation="vertical"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled || undefined"
      :aria-label="t('resizeColumn', { column: title })"
      :aria-valuemin="minimum"
      :aria-valuemax="maximum"
      :aria-valuenow="numericWidth"
      @pointerdown.stop="startResize"
      @keydown="resizeKey"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import type { TableColumn } from './types';
import { TABLE_COLUMN_DRAG_KEY } from './column-drag';
import {
  TABLE_COLUMN_KEYBOARD_STEP,
  TABLE_COLUMN_DRAG_TYPE,
  normalizeTableColumnBounds,
  measureTableColumnMinimum,
} from './use-table-column-interactions';

const props = defineProps<{
  column: TableColumn;
  width?: number | string;
  resizable?: boolean;
  reorderable?: boolean;
  resizing?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  'resize-start': [event: PointerEvent, column: TableColumn, header: HTMLElement];
  resize: [width: number];
  move: [direction: 'before' | 'after'];
  drop: [source: string, position: 'before' | 'after'];
  'resize-cancel': [];
}>();
const { t } = useLocale('table');
const columnDrag = inject(TABLE_COLUMN_DRAG_KEY, null);
const title = computed(() => props.column.title || props.column.key);
const resolvedMinimum = ref<number>();
const bounds = computed(() => normalizeTableColumnBounds(props.column, resolvedMinimum.value));
const minimum = computed(() => bounds.value.minimum);
const maximum = computed(() =>
  Number.isFinite(bounds.value.maximum) ? bounds.value.maximum : undefined
);
const clampWidth = (value: number) =>
  Math.max(bounds.value.minimum, Math.min(bounds.value.maximum, value));
const numericWidth = computed(() => {
  const value =
    typeof props.width === 'number'
      ? props.width
      : props.width && /^\d+(?:\.\d+)?px$/.test(props.width)
        ? Number.parseFloat(props.width)
        : undefined;
  // 非有限值和非正数不进入辅助语义；键盘操作随后回退到真实表头尺寸。
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? clampWidth(value)
    : undefined;
});
function headerFor(event: Event) {
  return (event.currentTarget as HTMLElement | null)?.closest('th');
}
function measureMinimum(header: HTMLElement | null | undefined) {
  // 与指针和暴露方法共享原始下限，排除组件自己施加的已调整宽度。
  const value = measureTableColumnMinimum(header, props.column);
  resolvedMinimum.value = Number.isFinite(value) ? value : undefined;
}
function startResize(event: PointerEvent) {
  const header = headerFor(event);
  if (!props.disabled && header) {
    measureMinimum(header);
    emit('resize-start', event, props.column, header);
  }
}
function resizeKey(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('resize-cancel');
    return;
  }
  const header = headerFor(event);
  measureMinimum(header);
  const measuredWidth = header?.getBoundingClientRect().width;
  // 表头内容可能撑大声明列宽，箭头必须从用户实际看到的宽度开始移动。
  const width = clampWidth(
    measuredWidth && Number.isFinite(measuredWidth) && measuredWidth > 0
      ? measuredWidth
      : (numericWidth.value ?? minimum.value)
  );
  const rtl = header && getComputedStyle(header).direction === 'rtl';
  const delta = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    emit('resize', clampWidth(width + delta * TABLE_COLUMN_KEYBOARD_STEP));
  } else if (event.key === 'Home') {
    event.preventDefault();
    emit('resize', minimum.value);
  } else if (event.key === 'End' && maximum.value !== undefined) {
    event.preventDefault();
    emit('resize', maximum.value);
  }
}
function dragStart(event: DragEvent) {
  if (props.disabled || !event.dataTransfer) return;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(TABLE_COLUMN_DRAG_TYPE, props.column.key);
  columnDrag?.start(props.column.key, event);
}
function dragOver(event: DragEvent) {
  if (!props.disabled && event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}
function drop(event: DragEvent) {
  if (props.disabled) return;
  const key = columnDrag?.consume(event);
  if (key) emit('drop', key, 'before');
}
</script>

<style scoped>
.ex-table-column-controls {
  display: inline-flex;
  align-items: center;
  gap: var(--ex-spacing-1);
}

.ex-table-column-controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--ex-touch-target-min, 44px);
  min-height: var(--ex-touch-target-min, 44px);
  border: 1px solid var(--ex-color-border);
  background: var(--ex-color-bg-secondary);
  color: var(--ex-color-text-secondary);
  cursor: pointer;
}

.ex-table-column-controls__drag {
  cursor: grab;
}

.ex-table-column-controls__resize {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;
  width: var(--ex-spacing-3);
  border-inline-end: 2px solid var(--ex-color-border);
  cursor: col-resize;
  touch-action: none;
}

.ex-table-column-controls__resize--active,
.ex-table-column-controls__resize:hover {
  border-color: var(--ex-color-primary);
}

.ex-table-column-controls :focus-visible {
  outline: 2px solid var(--ex-color-primary);
  outline-offset: 2px;
}

.ex-table-column-controls button:disabled {
  opacity: var(--ex-opacity-disabled, 0.5);
  cursor: not-allowed;
}

@media (forced-colors: active) {
  .ex-table-column-controls button,
  .ex-table-column-controls__resize {
    border-color: ButtonText;
    color: ButtonText;
  }
}
</style>
