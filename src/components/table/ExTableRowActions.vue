<template>
  <div
    class="ex-table-row-actions"
    @click.stop
  >
    <div class="ex-table-row-actions__buttons">
      <template v-if="editing">
        <ExButton
          size="small"
          :glow="false"
          :disabled="disabled"
          :loading="saving"
          @click="emit('save')"
        >
          {{ t('save') }}
        </ExButton>
        <ExButton
          size="small"
          :glow="false"
          @click="emit('cancel')"
        >
          {{ t('cancel') }}
        </ExButton>
      </template>
      <ExButton
        v-else
        size="small"
        :glow="false"
        :disabled="disabled"
        @click="emit('edit')"
      >
        {{ t('edit') }}
      </ExButton>
    </div>
    <span
      v-if="error"
      class="ex-table-row-actions__error"
      role="alert"
    >
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import ExButton from '../button/ExButton.vue';
import { useLocale } from '../../locale';

defineProps<{ editing: boolean; saving?: boolean; disabled?: boolean; error?: string }>();
const emit = defineEmits<{ edit: []; save: []; cancel: [] }>();
const { t } = useLocale('table');
</script>

<style scoped>
.ex-table-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ex-spacing-2);
  align-items: center;
}

.ex-table-row-actions__error {
  flex-basis: 100%;
  color: var(--ex-color-danger, var(--ex-color-error));
  font-size: var(--ex-text-sm);
  overflow-wrap: anywhere;
}

.ex-table-row-actions__buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--ex-spacing-2);
}

/* 操作按钮以完整文案计算最小宽度，避免窄列把英文逐字折行撑高整行。 */
.ex-table-row-actions__buttons :deep(.ex-button) {
  flex-shrink: 0;
  white-space: nowrap;
  overflow-wrap: normal;
}
</style>
