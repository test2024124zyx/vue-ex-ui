<template>
  <div
    class="ex-table-edit-cell"
    @keydown="handleKeydown"
  >
    <ExCheckbox
      v-if="column.editor === 'checkbox'"
      :model-value="value === true"
      :disabled="disabled"
      :aria-label="label"
      :status="error ? 'error' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @update:model-value="emit('update:value', $event === true)"
    />
    <ExSelect
      v-else-if="column.editor === 'select'"
      :model-value="selectValue"
      :options="column.editorOptions ?? []"
      :disabled="disabled"
      :aria-label="label"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="error ? errorId : undefined"
      @update:model-value="emit('update:value', $event)"
    />
    <ExInput
      v-else
      :model-value="value == null ? '' : String(value)"
      :type="column.editor === 'number' ? 'number' : 'text'"
      :disabled="disabled"
      :aria-label="label"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="error ? errorId : undefined"
      @update:model-value="updateText"
    />
    <span
      v-if="error"
      :id="errorId"
      class="ex-table-edit-cell__error"
      role="alert"
    >
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import ExInput from '../input/ExInput.vue';
import ExSelect from '../select/ExSelect.vue';
import { useLocale } from '../../locale';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import type { TableColumn } from './types';

const props = defineProps<{
  column: TableColumn;
  value: unknown;
  error?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{ 'update:value': [value: unknown]; cancel: [] }>();
const { t } = useLocale('table');
const errorId = `ex-table-edit-${useId()}`;
const label = computed(() => t('editCell', { column: props.column.title || props.column.key }));
const selectValue = computed(() =>
  typeof props.value === 'string' || typeof props.value === 'number' ? props.value : null
);
function updateText(value: string | number) {
  if (props.column.editor !== 'number') emit('update:value', value);
  else if (value === '') emit('update:value', null);
  else if (Number.isFinite(Number(value))) emit('update:value', Number(value));
}
function handleKeydown(event: KeyboardEvent) {
  // Escape 优先交给输入法取消候选，避免连带丢弃尚未保存的整行草稿。
  if (event.key !== 'Escape' || isComposingKeyboardEvent(event)) return;
  event.preventDefault();
  event.stopPropagation();
  emit('cancel');
}
</script>

<style scoped>
.ex-table-edit-cell {
  min-width: 0;
  width: 100%;
}

.ex-table-edit-cell__error {
  display: block;
  margin-top: var(--ex-spacing-1);
  color: var(--ex-color-danger, var(--ex-color-error));
  font-size: var(--ex-text-sm);
  overflow-wrap: anywhere;
}
</style>
