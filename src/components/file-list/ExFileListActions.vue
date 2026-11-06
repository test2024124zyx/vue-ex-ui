<template>
  <ExButton
    v-if="previewable && !file.isDirectory"
    type="text"
    size="small"
    shape="circle"
    class="ex-file-list__action-button"
    :aria-label="t('previewFile', { name: file.name })"
    @click="emit('preview-request', file)"
  >
    <template #prefix>
      <ExIcon
        icon="eye-line"
        :size="16"
        aria-hidden="true"
      />
    </template>
  </ExButton>
  <ExButton
    v-if="downloadable && !file.isDirectory"
    type="text"
    size="small"
    shape="circle"
    class="ex-file-list__action-button"
    :aria-label="t('downloadFile', { name: file.name })"
    @click="emit('download-request', file)"
  >
    <template #prefix>
      <ExIcon
        icon="download-2-line"
        :size="16"
        aria-hidden="true"
      />
    </template>
  </ExButton>
  <ExButton
    v-if="deletable"
    type="text"
    size="small"
    shape="circle"
    class="ex-file-list__action-button"
    :aria-label="t('deleteFile', { name: file.name })"
    @click="emit('delete-request', file)"
  >
    <template #prefix>
      <ExIcon
        icon="delete-bin-line"
        :size="16"
        aria-hidden="true"
      />
    </template>
  </ExButton>
</template>

<script setup lang="ts">
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import type { FileItem } from './types';

interface Props {
  /** 当前操作对应的原始文件项。 */
  file: FileItem;
  /** 是否允许请求预览普通文件。 */
  previewable: boolean;
  /** 是否允许请求下载普通文件。 */
  downloadable: boolean;
  /** 是否允许请求删除文件或目录。 */
  deletable: boolean;
}

interface Emits {
  'preview-request': [file: FileItem];
  'download-request': [file: FileItem];
  'delete-request': [file: FileItem];
}

defineOptions({ name: 'ExFileListActions' });

defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useLocale('fileList');
</script>

<style scoped lang="scss">
.ex-file-list__action-button {
  width: 28px;
  min-width: 28px;
  height: 28px;
}
</style>
