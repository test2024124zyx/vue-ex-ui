<template>
  <div
    ref="uploadRef"
    :class="uploadClasses"
    role="group"
    :aria-label="rootAriaLabel"
  >
    <div
      v-if="drag"
      class="ex-file-upload__drag"
      :class="{ 'is-dragover': isDragOver }"
      role="button"
      :tabindex="disabled || isLimitReached ? -1 : 0"
      :aria-disabled="disabled || isLimitReached ? 'true' : undefined"
      @click="openFileDialog"
      @keydown.enter.prevent="openFileDialog"
      @keydown.space.prevent="openFileDialog"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
    >
      <div class="ex-file-upload__drag-icon">
        <slot name="drag-icon">
          <ExIcon
            icon="upload-cloud-2-line"
            :size="48"
            aria-hidden="true"
          />
        </slot>
      </div>
      <div class="ex-file-upload__drag-text">
        {{ dragText || t('dragHint') }}
      </div>
      <div class="ex-file-upload__drag-description">
        {{ dragDescription || t('dragDescription') }}
      </div>
      <div
        v-if="accept"
        class="ex-file-upload__drag-tip"
      >
        {{ t('acceptTip', { accept }) }}
      </div>
      <div
        v-if="normalizedMaxFileSize"
        class="ex-file-upload__drag-tip"
      >
        {{ t('maxFileSizeTip', { size: formatUploadFileSize(normalizedMaxFileSize) }) }}
      </div>
    </div>

    <div
      v-else-if="listType !== 'picture-card'"
      class="ex-file-upload__button"
    >
      <slot
        name="trigger"
        :disabled="disabled || isLimitReached"
        :open-file-dialog="openFileDialog"
      >
        <ExButton
          :disabled="disabled || isLimitReached"
          @click="openFileDialog"
        >
          <template #prefix>
            <ExIcon
              icon="upload-2-line"
              :size="16"
              aria-hidden="true"
            />
          </template>
          {{ buttonText || t('selectFile') }}
        </ExButton>
      </slot>
    </div>

    <input
      ref="inputRef"
      type="file"
      class="ex-file-upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || isLimitReached"
      @change="handleFileChange"
    />

    <div
      v-if="(tip || $slots.tip) && listType !== 'picture-card'"
      class="ex-file-upload__tip"
    >
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>

    <TransitionGroup
      v-if="showFileList"
      :name="listType === 'picture-card' ? 'ex-upload-list' : 'ex-list'"
      tag="ul"
      class="ex-file-upload__list"
      :class="{ 'ex-file-upload__list--card': listType === 'picture-card' }"
    >
      <li
        v-for="file in displayedFileList"
        :key="file.uid"
        :class="getFileItemClass(file)"
        :aria-label="getFileItemLabel(file)"
      >
        <template v-if="listType === 'text'">
          <div class="ex-file-upload__list-item-info">
            <ExIcon
              icon="file-text-line"
              :size="16"
              class="ex-file-upload__list-item-icon"
              aria-hidden="true"
            />
            <button
              type="button"
              class="ex-file-upload__list-item-name"
              :disabled="disabled"
              :aria-label="t('previewFile', { name: file.name })"
              @click="handlePreview(file)"
            >
              {{ file.name }}
            </button>
          </div>
          <div class="ex-file-upload__list-item-actions">
            <span
              v-if="file.status === 'uploading'"
              class="ex-file-upload__list-item-progress"
              aria-hidden="true"
            >
              {{ getFilePercent(file) }}%
            </span>
            <ExIcon
              v-else-if="file.status === 'success'"
              icon="check-line"
              :size="16"
              class="ex-file-upload__list-item-status-icon is-success"
              aria-hidden="true"
            />
            <ExIcon
              v-else-if="file.status === 'error'"
              icon="close-line"
              :size="16"
              class="ex-file-upload__list-item-status-icon is-error"
              aria-hidden="true"
            />
            <ExButton
              type="text"
              size="small"
              shape="circle"
              class="ex-file-upload__list-item-action"
              :disabled="disabled"
              :aria-label="t('removeFile', { name: file.name })"
              @click="handleRemove(file)"
            >
              <ExIcon
                icon="delete-bin-line"
                :size="16"
                aria-hidden="true"
              />
            </ExButton>
          </div>
          <UploadProgress
            v-if="file.status === 'uploading'"
            :percent="getFilePercent(file)"
            :label="t('uploadProgress', { name: file.name })"
          />
        </template>

        <template v-else-if="listType === 'picture'">
          <img
            v-if="getPreviewUrl(file)"
            :src="getPreviewUrl(file)"
            :alt="file.name"
            class="ex-file-upload__list-item-thumbnail"
          />
          <div
            v-else
            class="ex-file-upload__list-item-thumbnail-placeholder"
            aria-hidden="true"
          >
            <ExIcon
              icon="image-line"
              :size="24"
              aria-hidden="true"
            />
          </div>
          <div class="ex-file-upload__list-item-info">
            <button
              type="button"
              class="ex-file-upload__list-item-name"
              :disabled="disabled"
              :aria-label="t('previewFile', { name: file.name })"
              @click="handlePreview(file)"
            >
              {{ file.name }}
            </button>
            <div class="ex-file-upload__list-item-actions">
              <ExButton
                type="text"
                size="small"
                shape="circle"
                class="ex-file-upload__list-item-action"
                :disabled="disabled"
                :aria-label="t('previewFile', { name: file.name })"
                @click="handlePreview(file)"
              >
                <ExIcon
                  icon="eye-line"
                  :size="16"
                  aria-hidden="true"
                />
              </ExButton>
              <ExButton
                type="text"
                size="small"
                shape="circle"
                class="ex-file-upload__list-item-action"
                :disabled="disabled"
                :aria-label="t('removeFile', { name: file.name })"
                @click="handleRemove(file)"
              >
                <ExIcon
                  icon="delete-bin-line"
                  :size="16"
                  aria-hidden="true"
                />
              </ExButton>
            </div>
          </div>
          <UploadProgress
            v-if="file.status === 'uploading'"
            :percent="getFilePercent(file)"
            :label="t('uploadProgress', { name: file.name })"
          />
        </template>

        <template v-else>
          <div class="ex-file-upload__list-item-card-content">
            <img
              v-if="getPreviewUrl(file)"
              :src="getPreviewUrl(file)"
              :alt="file.name"
              class="ex-file-upload__list-item-card-image"
            />
            <div
              v-else
              class="ex-file-upload__list-item-card-placeholder"
              aria-hidden="true"
            >
              <ExIcon
                icon="image-line"
                :size="32"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="file.status === 'uploading'"
              class="ex-file-upload__list-item-card-mask"
            >
              <span class="ex-file-upload__list-item-card-progress">
                {{ getFilePercent(file) }}%
              </span>
              <UploadProgress
                :percent="getFilePercent(file)"
                :label="t('uploadProgress', { name: file.name })"
                visually-hidden
              />
            </div>
            <div
              v-else
              class="ex-file-upload__list-item-card-actions"
            >
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-upload__list-item-action"
                :disabled="disabled"
                :aria-label="t('previewFile', { name: file.name })"
                @click="handlePreview(file)"
              >
                <ExIcon
                  icon="eye-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-upload__list-item-action"
                :disabled="disabled"
                :aria-label="t('removeFile', { name: file.name })"
                @click="handleRemove(file)"
              >
                <ExIcon
                  icon="delete-bin-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
            </div>
          </div>
        </template>

        <span class="ex-file-upload__sr-only">
          {{ getFileStatusLabel(file) }}
        </span>
      </li>

      <li
        v-if="listType === 'picture-card' && !isLimitReached"
        key="upload-trigger"
        class="ex-file-upload__list-item ex-file-upload__list-item--picture-card ex-file-upload__upload-trigger"
        :class="{ 'is-dragover': isDragOver, 'is-disabled': disabled }"
      >
        <button
          type="button"
          class="ex-file-upload__upload-trigger-content"
          :disabled="disabled"
          :aria-label="buttonText || t('selectFile')"
          @click="openFileDialog"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
        >
          <ExIcon
            icon="add-line"
            :size="32"
            class="ex-file-upload__upload-trigger-icon"
            aria-hidden="true"
          />
          <span class="ex-file-upload__upload-trigger-text">
            {{ buttonText || t('selectFile') }}
          </span>
        </button>
      </li>
    </TransitionGroup>

    <div
      v-if="showFileList && (tip || $slots.tip) && listType === 'picture-card'"
      class="ex-file-upload__tip ex-file-upload__tip--card"
    >
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import { createUploadRequest } from './upload-request';
import type { UploadRequestHandle } from './upload-request';
import {
  cloneUploadFileList,
  formatUploadFileSize,
  getUploadResponseUrl,
  matchesUploadAccept,
  normalizeUploadLimit,
  normalizeUploadMaxFileSize,
  normalizeUploadPercent,
} from './upload-utils';
import { useUploadPreviewUrls } from './useUploadPreviewUrls';
import type {
  ExFileUploadEmits,
  ExFileUploadExposed,
  ExFileUploadProps,
  ExFileUploadSlots,
  UploadAbortReason,
  UploadFile,
  UploadRejection,
  UploadResult,
} from './types';

defineOptions({
  name: 'ExFileUpload',
});

const UploadProgress = defineComponent({
  name: 'ExFileUploadProgress',
  props: {
    percent: { type: Number, required: true },
    label: { type: String, required: true },
    visuallyHidden: { type: Boolean, default: false },
  },
  setup(progressProps) {
    return () =>
      h(
        'div',
        {
          class: progressProps.visuallyHidden
            ? 'ex-file-upload__sr-only'
            : 'ex-file-upload__list-item-progress-bar',
          role: 'progressbar',
          'aria-label': progressProps.label,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': progressProps.percent,
        },
        progressProps.visuallyHidden
          ? undefined
          : h('div', {
              class: 'ex-file-upload__list-item-progress-bar-inner',
              style: { width: `${progressProps.percent}%` },
            })
      );
  },
});

const props = withDefaults(defineProps<ExFileUploadProps>(), {
  method: 'POST',
  name: 'file',
  multiple: false,
  drag: false,
  defaultFileList: () => [],
  autoUpload: true,
  showFileList: true,
  listType: 'text',
  disabled: false,
  withCredentials: false,
  timeout: 0,
});

const emit = defineEmits<ExFileUploadEmits>();
defineSlots<ExFileUploadSlots>();

const { t } = useLocale('fileUpload');
const uploadRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);
const destroyed = ref(false);
const isControlled = computed(() => props.fileList !== undefined);
const initialFiles = cloneUploadFileList(props.fileList ?? props.defaultFileList);
const internalFileList = shallowRef<UploadFile[]>(cloneUploadFileList(initialFiles));
const operationFileList = shallowRef<UploadFile[]>(cloneUploadFileList(initialFiles));
const displayedFileList = computed<readonly UploadFile[]>(() =>
  isControlled.value ? (props.fileList ?? []) : internalFileList.value
);
const normalizedLimit = computed(() => normalizeUploadLimit(props.limit));
const normalizedMaxFileSize = computed(() => normalizeUploadMaxFileSize(props.maxFileSize));
const isLimitReached = computed(
  () =>
    normalizedLimit.value !== undefined && displayedFileList.value.length >= normalizedLimit.value
);
const rootAriaLabel = computed(() =>
  props.ariaLabel ? props.ariaLabel : props.drag ? t('dragHint') : t('uploadGroup')
);
const uploadClasses = computed(() => [
  'ex-file-upload',
  `ex-file-upload--${props.listType}`,
  {
    'ex-file-upload--drag': props.drag,
    'ex-file-upload--disabled': props.disabled,
  },
]);

const { synchronize: synchronizePreviewUrls, getPreviewUrl } = useUploadPreviewUrls();
watch(displayedFileList, files => synchronizePreviewUrls(files), { deep: true, immediate: true });

interface ActiveUpload {
  file: UploadFile;
  handle: UploadRequestHandle;
  result: Promise<UploadResult>;
}

const activeUploads = new Map<string, ActiveUpload>();

const requestFileList = (files: readonly UploadFile[]): UploadFile[] => {
  const operationSnapshot = cloneUploadFileList(files);
  operationFileList.value = operationSnapshot;
  if (!isControlled.value) internalFileList.value = cloneUploadFileList(operationSnapshot);
  const emittedSnapshot = cloneUploadFileList(operationSnapshot);
  emit('update:fileList', emittedSnapshot);
  return cloneUploadFileList(operationSnapshot);
};

const patchFile = (
  uid: string,
  patch: Partial<UploadFile>
): { file: UploadFile; files: UploadFile[] } | null => {
  const nextFiles = cloneUploadFileList(operationFileList.value);
  const index = nextFiles.findIndex(file => file.uid === uid);
  const currentFile = nextFiles[index];
  if (index < 0 || !currentFile) return null;
  const nextFile = { ...currentFile, ...patch };
  nextFiles[index] = nextFile;
  const files = requestFileList(nextFiles);
  return { file: { ...nextFile }, files };
};

const emitRejection = (rejection: UploadRejection, files = operationFileList.value): void => {
  emit('rejected', rejection, cloneUploadFileList(files));
};

const getFilePercent = (file: UploadFile): number => normalizeUploadPercent(file.percent ?? 0);
const getFileStatusLabel = (file: UploadFile): string =>
  t(`status${file.status[0]?.toUpperCase()}${file.status.slice(1)}`);
const getFileItemLabel = (file: UploadFile): string => `${file.name}, ${getFileStatusLabel(file)}`;
const getFileItemClass = (file: UploadFile) => [
  'ex-file-upload__list-item',
  `ex-file-upload__list-item--${file.status}`,
  `ex-file-upload__list-item--${props.listType}`,
];

const abortActiveUpload = (uid: string, reason: UploadAbortReason): boolean => {
  const task = activeUploads.get(uid);
  if (!task || !task.handle.abort()) return false;
  activeUploads.delete(uid);
  const patched = patchFile(uid, { status: 'ready', percent: 0, error: undefined });
  const file = patched?.file ?? { ...task.file, status: 'ready', percent: 0, error: undefined };
  const files = patched?.files ?? cloneUploadFileList(operationFileList.value);
  emit('aborted', file, files, reason);
  return true;
};

const abortUploads = (uids: readonly string[], reason: UploadAbortReason): number =>
  uids.reduce((count, uid) => count + Number(abortActiveUpload(uid, reason)), 0);

watch(
  () => props.fileList,
  (nextFiles, previousFiles) => {
    if (nextFiles !== undefined) {
      operationFileList.value = cloneUploadFileList(nextFiles);
      const currentUids = new Set(nextFiles.map(file => file.uid));
      const removedTaskUids = [...activeUploads.keys()].filter(uid => !currentUids.has(uid));
      abortUploads(removedTaskUids, 'external');
    } else if (previousFiles !== undefined) {
      internalFileList.value = cloneUploadFileList(previousFiles);
      operationFileList.value = cloneUploadFileList(previousFiles);
    }
  },
  { deep: true }
);

watch(
  () => props.disabled,
  disabled => {
    if (disabled) isDragOver.value = false;
  }
);

const openFileDialog = (): boolean => {
  if (props.disabled || isLimitReached.value || !inputRef.value) return false;
  inputRef.value.click();
  return true;
};

const createUploadFile = (raw: File): UploadFile => ({
  uid: generateId('ex-upload'),
  name: raw.name,
  size: raw.size,
  type: raw.type,
  status: 'ready',
  percent: 0,
  raw,
});

const validateFile = (file: File): UploadRejection | null => {
  if (!matchesUploadAccept(file, props.accept)) {
    return { code: 'accept', file, accept: props.accept ?? '' };
  }
  if (normalizedMaxFileSize.value !== undefined && file.size > normalizedMaxFileSize.value) {
    return {
      code: 'size',
      file,
      maxFileSize: normalizedMaxFileSize.value,
    };
  }
  return null;
};

const startUpload = (sourceFile: UploadFile): Promise<UploadResult> => {
  const existing = activeUploads.get(sourceFile.uid);
  if (existing) return existing.result;

  const currentFile =
    operationFileList.value.find(file => file.uid === sourceFile.uid) ?? sourceFile;
  if (currentFile.status !== 'ready') {
    return Promise.resolve({ uid: currentFile.uid, outcome: 'ignored', reason: 'not-ready' });
  }
  if (!props.action) {
    return Promise.resolve({ uid: currentFile.uid, outcome: 'ignored', reason: 'no-action' });
  }
  if (!currentFile.raw) {
    return Promise.resolve({ uid: currentFile.uid, outcome: 'ignored', reason: 'missing-raw' });
  }

  const uploading = patchFile(currentFile.uid, {
    status: 'uploading',
    percent: 0,
    error: undefined,
  })?.file ?? { ...currentFile, status: 'uploading' as const, percent: 0 };
  const task = {} as ActiveUpload;
  const handle = createUploadRequest({
    file: uploading,
    action: props.action,
    method: props.method,
    headers: props.headers,
    data: props.data,
    name: props.name,
    withCredentials: props.withCredentials,
    timeout: props.timeout,
    onProgress: percent => {
      if (activeUploads.get(uploading.uid) !== task) return;
      const currentPercent = getFilePercent(
        operationFileList.value.find(file => file.uid === uploading.uid) ?? uploading
      );
      const patched = patchFile(uploading.uid, { percent: Math.max(currentPercent, percent) });
      if (patched) emit('progress', patched.file, patched.files);
    },
  });

  const result = handle.promise.then(transportResult => {
    if (activeUploads.get(uploading.uid) !== task) {
      return { uid: uploading.uid, outcome: 'aborted' } satisfies UploadResult;
    }
    activeUploads.delete(uploading.uid);

    if (transportResult.outcome === 'aborted') {
      const patched = patchFile(uploading.uid, { status: 'ready', percent: 0 });
      const file = patched?.file ?? { ...uploading, status: 'ready' as const, percent: 0 };
      const files = patched?.files ?? cloneUploadFileList(operationFileList.value);
      emit('aborted', file, files, 'manual');
      return { uid: uploading.uid, outcome: 'aborted' } satisfies UploadResult;
    }

    if (transportResult.outcome === 'error') {
      const patched = patchFile(uploading.uid, {
        status: 'error',
        error: transportResult.error.message,
      });
      const file = patched?.file ?? {
        ...uploading,
        status: 'error' as const,
        error: transportResult.error.message,
      };
      const files = patched?.files ?? cloneUploadFileList(operationFileList.value);
      emit('error', transportResult.error, file, files);
      return {
        uid: uploading.uid,
        outcome: 'error',
        error: transportResult.error,
      } satisfies UploadResult;
    }

    const responseUrl = getUploadResponseUrl(transportResult.response);
    const patched = patchFile(uploading.uid, {
      status: 'success',
      percent: 100,
      response: transportResult.response,
      ...(responseUrl ? { url: responseUrl } : {}),
      error: undefined,
    });
    const file = patched?.file ?? {
      ...uploading,
      status: 'success' as const,
      percent: 100,
      response: transportResult.response,
      ...(responseUrl ? { url: responseUrl } : {}),
    };
    const files = patched?.files ?? cloneUploadFileList(operationFileList.value);
    emit('success', transportResult.response, file, files);
    return {
      uid: uploading.uid,
      outcome: 'success',
      response: transportResult.response,
    } satisfies UploadResult;
  });

  task.file = uploading;
  task.handle = handle;
  task.result = result;
  activeUploads.set(uploading.uid, task);
  return result;
};

const submit = (file?: UploadFile | string): Promise<UploadResult[]> => {
  let targets: UploadFile[];
  if (typeof file === 'string') {
    const target = operationFileList.value.find(item => item.uid === file);
    targets = target ? [target] : [];
  } else if (file) {
    targets = [operationFileList.value.find(item => item.uid === file.uid) ?? file];
  } else {
    targets = operationFileList.value.filter(item => item.status === 'ready');
  }
  return Promise.all(targets.map(startUpload));
};

let selectionQueue: Promise<void> = Promise.resolve();

const processSelectedFiles = async (files: readonly File[]): Promise<void> => {
  let nextFiles = cloneUploadFileList(operationFileList.value);
  const addedFiles: UploadFile[] = [];

  for (const originalFile of files) {
    if (destroyed.value) return;
    let candidate = originalFile;
    if (props.beforeAdd) {
      try {
        const result = await props.beforeAdd(originalFile, cloneUploadFileList(nextFiles));
        if (destroyed.value) return;
        if (result === false) {
          emitRejection({ code: 'before-add', file: originalFile }, nextFiles);
          continue;
        }
        if (result instanceof File) candidate = result;
      } catch (cause) {
        emitRejection({ code: 'before-add-error', file: originalFile, cause }, nextFiles);
        continue;
      }
    }

    const rejection = validateFile(candidate);
    if (rejection) {
      emitRejection(rejection, nextFiles);
      continue;
    }
    if (normalizedLimit.value !== undefined && nextFiles.length >= normalizedLimit.value) {
      emitRejection({ code: 'limit', file: candidate, limit: normalizedLimit.value }, nextFiles);
      continue;
    }

    const uploadFile = createUploadFile(candidate);
    nextFiles = [...nextFiles, uploadFile];
    addedFiles.push(uploadFile);
  }

  if (addedFiles.length === 0 || destroyed.value) return;
  const committedFiles = requestFileList(nextFiles);
  for (const file of addedFiles) emit('added', { ...file }, cloneUploadFileList(committedFiles));
  if (props.autoUpload) void Promise.all(addedFiles.map(startUpload));
};

const enqueueFiles = (files: File[]): void => {
  if (props.disabled || files.length === 0) return;
  let acceptedSelection = files;
  if (!props.multiple && files.length > 1) {
    acceptedSelection = files.slice(0, 1);
    for (const file of files.slice(1)) {
      emitRejection({ code: 'multiple', file });
    }
  }
  selectionQueue = selectionQueue.then(() => processSelectedFiles(acceptedSelection));
};

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  enqueueFiles(Array.from(target.files ?? []));
  target.value = '';
};

const handleDragOver = (): void => {
  if (!props.disabled && !isLimitReached.value) isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent): void => {
  const currentTarget = event.currentTarget;
  if (currentTarget instanceof Element && event.relatedTarget instanceof Node) {
    if (currentTarget.contains(event.relatedTarget)) return;
  }
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent): void => {
  isDragOver.value = false;
  if (props.disabled || isLimitReached.value) return;
  enqueueFiles(Array.from(event.dataTransfer?.files ?? []));
};

const handleRemove = (file: UploadFile): void => {
  if (props.disabled) return;
  abortActiveUpload(file.uid, 'remove');
  requestFileList(operationFileList.value.filter(item => item.uid !== file.uid));
  emit('remove-request', file);
};

const handlePreview = (file: UploadFile): void => {
  if (!props.disabled) emit('preview-request', file);
};

const abort = (file?: UploadFile | string): number => {
  if (file) {
    const uid = typeof file === 'string' ? file : file.uid;
    return Number(abortActiveUpload(uid, 'manual'));
  }
  return abortUploads([...activeUploads.keys()], 'manual');
};

const requestClear = (): number => {
  const abortedCount = abortUploads([...activeUploads.keys()], 'clear');
  requestFileList([]);
  return abortedCount;
};

const getFiles = (): UploadFile[] => cloneUploadFileList(displayedFileList.value);
const getElement = (): HTMLDivElement | null => uploadRef.value ?? null;

onBeforeUnmount(() => {
  destroyed.value = true;
  // 卸载属于资源清理，不再向已销毁的业务树发送列表或中止事件。
  for (const [uid, task] of activeUploads) {
    activeUploads.delete(uid);
    task.handle.abort();
  }
});

defineExpose<ExFileUploadExposed>({
  openFileDialog,
  submit,
  abort,
  requestClear,
  getFiles,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFileUpload.scss"></style>
