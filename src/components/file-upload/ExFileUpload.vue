<template>
  <div
    ref="uploadRef"
    :class="uploadClasses"
    role="group"
    :aria-label="rootAriaLabel"
    :aria-labelledby="field.labelledBy.value"
    :aria-describedby="field.describedBy.value"
    :aria-invalid="field.invalid.value || undefined"
    :aria-disabled="disabled || undefined"
    @focusout="handleFieldBlur"
  >
    <div
      v-if="drag"
      class="ex-file-upload__drag"
      :class="{ 'is-dragover': isDragOver }"
      role="button"
      :tabindex="mutationDisabled || isLimitReached ? -1 : 0"
      :aria-disabled="mutationDisabled || isLimitReached ? 'true' : undefined"
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
      v-else-if="listType !== 'picture-card' || !showFileList"
      class="ex-file-upload__button"
    >
      <slot
        name="trigger"
        :disabled="mutationDisabled || isLimitReached"
        :open-file-dialog="openFileDialog"
      >
        <ExButton
          :disabled="mutationDisabled || isLimitReached"
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
      :disabled="mutationDisabled || isLimitReached"
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
              :disabled="mutationDisabled"
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
                :disabled="mutationDisabled"
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
                :disabled="mutationDisabled"
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

        <div
          v-if="listType === 'picture-card'"
          class="ex-file-upload__card-caption"
          :title="file.name"
        >
          {{ file.name }}
        </div>
        <UploadTaskActions
          :file="file"
          :tus="transport === 'tus'"
          :disabled="mutationDisabled"
          :can-start="Boolean(action)"
          @start="resume(file)"
          @pause="pause(file)"
          @cancel="cancel(file)"
        />
        <p
          v-if="file.error"
          class="ex-file-upload__error"
          role="alert"
        >
          {{ file.error }}
        </p>
        <span class="ex-file-upload__sr-only">
          {{ getFileStatusLabel(file) }}
        </span>
      </li>

      <li
        v-if="listType === 'picture-card' && !isLimitReached"
        key="upload-trigger"
        class="ex-file-upload__list-item ex-file-upload__list-item--picture-card ex-file-upload__upload-trigger"
        :class="{ 'is-dragover': isDragOver, 'is-disabled': mutationDisabled }"
      >
        <button
          type="button"
          class="ex-file-upload__upload-trigger-content"
          :disabled="mutationDisabled"
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
import { useFormFieldState } from '../form/use-form-item';
import { generateId } from '../../utils/id';
import UploadTaskActions from './UploadTaskActions.vue';
import { useUploadTransfers } from './useUploadTransfers';
import {
  cloneUploadFileList,
  formatUploadFileSize,
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
  UploadFile,
  UploadRejection,
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
  transport: 'xhr',
  method: 'POST',
  name: 'file',
  multiple: false,
  drag: false,
  defaultFileList: () => [],
  autoUpload: true,
  showFileList: true,
  listType: 'text',
  disabled: false,
  readonly: false,
  withCredentials: false,
  timeout: 0,
});

const emit = defineEmits<ExFileUploadEmits>();
defineSlots<ExFileUploadSlots>();

const { t } = useLocale('fileUpload');
const field = useFormFieldState(props);
const { disabled } = field;
const mutationDisabled = computed(() => !field.interactive.value);
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
  field.labelledBy.value
    ? undefined
    : props.ariaLabel || (props.drag ? t('dragHint') : t('uploadGroup'))
);
const uploadClasses = computed(() => [
  'ex-file-upload',
  `ex-file-upload--${props.listType}`,
  {
    'ex-file-upload--drag': props.drag,
    'ex-file-upload--disabled': disabled.value,
    'ex-file-upload--readonly': field.readonly.value,
  },
]);

const { synchronize: synchronizePreviewUrls, getPreviewUrl } = useUploadPreviewUrls();
watch(displayedFileList, files => synchronizePreviewUrls(files), { deep: true, immediate: true });

let selectionRevision = 0;

const invalidatePendingSelections = (): void => {
  selectionRevision += 1;
};

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

const transfers = useUploadTransfers({
  props,
  files: operationFileList,
  disabled,
  mutationDisabled,
  destroyed,
  patchFile,
  emit,
});
const { startUpload, submit, abort, pause, resume, cancel, abortActiveUpload, abortUploads } =
  transfers;

watch(
  () => field.formItem?.resetRevision?.value,
  () => {
    // 表单已经恢复模型；只清理旧任务，不再发列表变更或删除服务端续传资源。
    invalidatePendingSelections();
    transfers.dispose();
    selectionQueue = Promise.resolve();
    const restored = cloneUploadFileList(isControlled.value ? props.fileList! : initialFiles);
    operationFileList.value = restored;
    if (!isControlled.value) internalFileList.value = cloneUploadFileList(restored);
    isDragOver.value = false;
    if (inputRef.value) inputRef.value.value = '';
  },
  { flush: 'post' }
);

watch(
  () => props.fileList,
  (nextFiles, previousFiles) => {
    // 自身进度、成功和新增回写不撤销选择队列；真正替换文件来源才使旧选择失效。
    const sameSources =
      nextFiles !== undefined &&
      nextFiles.length === operationFileList.value.length &&
      nextFiles.every((file, index) => {
        const current = operationFileList.value[index];
        return current?.uid === file.uid && current.raw === file.raw;
      });
    if (!sameSources) invalidatePendingSelections();
    if (nextFiles !== undefined) {
      operationFileList.value = cloneUploadFileList(nextFiles);
      transfers.invalidateExternal(nextFiles);
    } else if (previousFiles !== undefined) {
      internalFileList.value = cloneUploadFileList(previousFiles);
      operationFileList.value = cloneUploadFileList(previousFiles);
    }
  },
  { deep: true }
);

watch(mutationDisabled, disabled => {
  if (disabled) {
    isDragOver.value = false;
    invalidatePendingSelections();
    // 已发送的上传由显式中止接口管理；尚在解析配置的任务不得再发出请求。
    transfers.abortPending(field.disabled.value ? 'disabled' : 'readonly');
  }
});

const openFileDialog = (): boolean => {
  if (mutationDisabled.value || isLimitReached.value || !inputRef.value) return false;
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

let selectionQueue: Promise<void> = Promise.resolve();

const processSelectedFiles = async (files: readonly File[], revision: number): Promise<void> => {
  let nextFiles = cloneUploadFileList(operationFileList.value);
  const addedFiles: UploadFile[] = [];

  for (const originalFile of files) {
    if (destroyed.value || revision !== selectionRevision || mutationDisabled.value) return;
    let candidate = originalFile;
    if (props.beforeAdd) {
      try {
        const result = await props.beforeAdd(originalFile, cloneUploadFileList(nextFiles));
        if (destroyed.value || revision !== selectionRevision || mutationDisabled.value) return;
        if (result === false) {
          emitRejection({ code: 'before-add', file: originalFile }, nextFiles);
          continue;
        }
        if (result instanceof File) candidate = result;
      } catch (cause) {
        if (destroyed.value || revision !== selectionRevision || mutationDisabled.value) return;
        emitRejection({ code: 'before-add-error', file: originalFile, cause }, nextFiles);
        continue;
      }
    }

    nextFiles = [...cloneUploadFileList(operationFileList.value), ...addedFiles];

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

  if (
    addedFiles.length === 0 ||
    destroyed.value ||
    revision !== selectionRevision ||
    mutationDisabled.value
  ) {
    return;
  }
  nextFiles = [...cloneUploadFileList(operationFileList.value), ...addedFiles];
  const committedFiles = requestFileList(nextFiles);
  field.formItem?.onFieldChange();
  for (const file of addedFiles) emit('added', { ...file }, cloneUploadFileList(committedFiles));
  if (props.autoUpload) void Promise.all(addedFiles.map(startUpload));
};

const enqueueFiles = (files: File[]): void => {
  if (mutationDisabled.value || files.length === 0) return;
  const queuedRevision = selectionRevision;
  let acceptedSelection = files;
  if (!props.multiple && files.length > 1) {
    acceptedSelection = files.slice(0, 1);
    for (const file of files.slice(1)) {
      emitRejection({ code: 'multiple', file });
    }
  }
  selectionQueue = selectionQueue.then(() =>
    processSelectedFiles(acceptedSelection, queuedRevision)
  );
};

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  enqueueFiles(Array.from(target.files ?? []));
  target.value = '';
};

const handleDragOver = (): void => {
  if (!mutationDisabled.value && !isLimitReached.value) isDragOver.value = true;
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
  if (mutationDisabled.value || isLimitReached.value) return;
  enqueueFiles(Array.from(event.dataTransfer?.files ?? []));
};

const handleRemove = (file: UploadFile): void => {
  if (mutationDisabled.value) return;
  invalidatePendingSelections();
  abortActiveUpload(file.uid, 'remove');
  requestFileList(operationFileList.value.filter(item => item.uid !== file.uid));
  transfers.invalidateExternal(operationFileList.value);
  field.formItem?.onFieldChange();
  emit('remove-request', file);
};

const handlePreview = (file: UploadFile): void => {
  if (!disabled.value) emit('preview-request', file);
};

// 只有焦点离开整个上传字段时才触发失焦校验。
const handleFieldBlur = (event: FocusEvent): void => {
  if (event.relatedTarget instanceof Node && uploadRef.value?.contains(event.relatedTarget)) return;
  field.formItem?.onFieldBlur();
};

const requestClear = (): number => {
  if (mutationDisabled.value) return 0;
  invalidatePendingSelections();
  const abortedCount = abortUploads([...transfers.active.keys()], 'clear');
  requestFileList([]);
  transfers.invalidateExternal([]);
  field.formItem?.onFieldChange();
  return abortedCount;
};

const getFiles = (): UploadFile[] => cloneUploadFileList(displayedFileList.value);
const getElement = (): HTMLDivElement | null => uploadRef.value ?? null;

onBeforeUnmount(() => {
  destroyed.value = true;
  // 卸载属于资源清理，不再向已销毁的业务树发送列表或中止事件。
  transfers.dispose();
});

defineExpose<ExFileUploadExposed>({
  openFileDialog,
  submit,
  abort,
  pause,
  resume,
  cancel,
  requestClear,
  getFiles,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFileUpload.scss"></style>
