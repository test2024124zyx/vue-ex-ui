<template>
  <div
    v-if="actions.length"
    class="ex-file-upload-task-actions"
  >
    <button
      v-for="action in actions"
      :key="action.name"
      type="button"
      :data-upload-action="action.name"
      :disabled="disabled || file.status === 'cancelling'"
      :aria-label="t(action.label, { name: file.name })"
      @click="action.run"
    >
      {{ t(action.label, { name: '' }).trim() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '../../locale';
import type { UploadFile } from './types';

const props = defineProps<{
  file: UploadFile;
  tus: boolean;
  disabled: boolean;
  canStart: boolean;
}>();
const emit = defineEmits<{ start: []; pause: []; cancel: [] }>();
const { t } = useLocale('fileUpload');
const actions = computed(() => {
  const items: Array<{ name: string; label: string; run: () => void }> = [];
  if (props.canStart && ['ready', 'paused', 'error'].includes(props.file.status)) {
    const name =
      props.file.status === 'error' ? 'retry' : props.file.status === 'paused' ? 'resume' : 'start';
    const label =
      name === 'retry' ? 'retryUpload' : name === 'resume' ? 'resumeUpload' : 'startUpload';
    items.push({ name, label, run: () => emit('start') });
  }
  if (props.tus && ['queued', 'uploading'].includes(props.file.status)) {
    items.push({ name: 'pause', label: 'pauseUpload', run: () => emit('pause') });
  }
  if (
    props.tus &&
    props.file.status !== 'success' &&
    (props.file.tusUploadUrl ||
      ['queued', 'uploading', 'paused', 'cancelling'].includes(props.file.status))
  ) {
    items.push({ name: 'cancel', label: 'cancelUpload', run: () => emit('cancel') });
  }
  return items;
});
</script>

<style scoped lang="scss">
.ex-file-upload-task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ex-spacing-2);
  margin-top: var(--ex-spacing-2);

  button {
    max-width: 100%;
    padding: var(--ex-spacing-1) var(--ex-spacing-2);
    color: var(--ex-color-primary);
    font: inherit;
    font-size: var(--ex-text-sm);
    overflow-wrap: anywhere;
    text-align: start;
    background: var(--ex-color-bg-surface);
    border: 1px solid var(--ex-color-border-primary);
    border-radius: var(--ex-radius-sm);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--ex-color-primary);
      outline-offset: 2px;
    }

    &:disabled {
      color: var(--ex-color-text-disabled);
      cursor: not-allowed;
    }
  }
}
</style>
