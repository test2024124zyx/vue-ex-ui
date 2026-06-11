<template>
  <div ref="uploadRef" :class="uploadClasses" :aria-label="ariaLabel">
    <!-- 拖拽上传区域 -->
    <div
      v-if="drag"
      class="ex-file-upload__drag"
      :class="{ 'is-dragover': isDragOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="handleClick"
    >
      <div class="ex-file-upload__drag-icon">
        <slot name="drag-icon">
          <ExIcon icon="upload-cloud-2-line" :size="48" aria-hidden="true" />
        </slot>
      </div>
      <div class="ex-file-upload__drag-text">
        {{ dragText || t('dragHint') }}
      </div>
      <div class="ex-file-upload__drag-description">
        {{ dragDescription || t('dragDescription') }}
      </div>
      <div v-if="accept" class="ex-file-upload__drag-tip">
        {{ t('acceptTip', { accept }) }}
      </div>
      <div v-if="maxSize" class="ex-file-upload__drag-tip">
        {{ t('maxSizeTip', { size: `${maxSize}MB` }) }}
      </div>
    </div>

    <!-- 按钮上传 -->
    <div
      v-else-if="listType !== 'picture-card'"
      class="ex-file-upload__button"
      @click="handleClick"
    >
      <slot name="trigger">
        <ExButton :disabled="disabled || isLimitExceeded">
          <template #prefix>
            <ExIcon icon="upload-2-line" :size="16" aria-hidden="true" />
          </template>
          {{ buttonText || t('selectFile') }}
        </ExButton>
      </slot>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="inputRef"
      type="file"
      class="ex-file-upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <!-- 提示信息 -->
    <div v-if="(tip || $slots.tip) && listType !== 'picture-card'" class="ex-file-upload__tip">
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>

    <!-- 文件列表 -->
    <div
      v-if="showFileList"
      class="ex-file-upload__list"
      :class="{ 'ex-file-upload__list--card': listType === 'picture-card' }"
    >
      <transition-group :name="listType === 'picture-card' ? 'ex-upload-list' : 'ex-list'">
        <!-- 文件项 -->
        <div v-for="file in internalFileList" :key="file.uid" :class="getFileItemClass(file)">
          <!-- 文本列表 -->
          <template v-if="listType === 'text'">
            <div class="ex-file-upload__list-item-info">
              <ExIcon
                icon="file-text-line"
                :size="16"
                class="ex-file-upload__list-item-icon"
                aria-hidden="true"
              />
              <span class="ex-file-upload__list-item-name" @click="handlePreview(file)">
                {{ file.name }}
              </span>
            </div>
            <div class="ex-file-upload__list-item-actions">
              <span v-if="file.status === 'uploading'" class="ex-file-upload__list-item-progress">
                {{ file.percent }}%
              </span>
              <ExIcon
                v-if="file.status === 'success'"
                icon="check-line"
                :size="16"
                class="ex-file-upload__list-item-status-icon success"
                aria-hidden="true"
              />
              <ExIcon
                v-if="file.status === 'error'"
                icon="close-line"
                :size="16"
                class="ex-file-upload__list-item-status-icon error"
                aria-hidden="true"
              />
              <ExIcon
                icon="delete-bin-line"
                :size="16"
                class="ex-file-upload__list-item-delete"
                clickable
                @click="handleRemove(file)"
              />
            </div>
            <div v-if="file.status === 'uploading'" class="ex-file-upload__list-item-progress-bar">
              <div
                class="ex-file-upload__list-item-progress-bar-inner"
                :style="{ width: `${file.percent}%` }"
              />
            </div>
          </template>

          <!-- 图片列表 -->
          <template v-else-if="listType === 'picture'">
            <img
              v-if="file.thumbUrl || file.url"
              :src="file.thumbUrl || file.url"
              :alt="file.name"
              class="ex-file-upload__list-item-thumbnail"
            />
            <div v-else class="ex-file-upload__list-item-thumbnail-placeholder">
              <ExIcon icon="image-line" :size="24" aria-hidden="true" />
            </div>
            <div class="ex-file-upload__list-item-info">
              <span class="ex-file-upload__list-item-name" @click="handlePreview(file)">
                {{ file.name }}
              </span>
              <div class="ex-file-upload__list-item-actions">
                <ExIcon icon="eye-line" :size="16" clickable @click="handlePreview(file)" />
                <ExIcon icon="delete-bin-line" :size="16" clickable @click="handleRemove(file)" />
              </div>
            </div>
            <div v-if="file.status === 'uploading'" class="ex-file-upload__list-item-progress-bar">
              <div
                class="ex-file-upload__list-item-progress-bar-inner"
                :style="{ width: `${file.percent}%` }"
              />
            </div>
          </template>

          <!-- 卡片列表 -->
          <template v-else-if="listType === 'picture-card'">
            <div class="ex-file-upload__list-item-card-content">
              <img
                v-if="file.thumbUrl || file.url"
                :src="file.thumbUrl || file.url"
                :alt="file.name"
                class="ex-file-upload__list-item-card-image"
              />
              <div v-else class="ex-file-upload__list-item-card-placeholder">
                <ExIcon icon="image-line" :size="32" aria-hidden="true" />
              </div>
              <div v-if="file.status === 'uploading'" class="ex-file-upload__list-item-card-mask">
                <div class="ex-file-upload__list-item-card-progress">{{ file.percent }}%</div>
              </div>
              <div v-else class="ex-file-upload__list-item-card-actions">
                <ExIcon icon="eye-line" :size="20" clickable @click="handlePreview(file)" />
                <ExIcon icon="delete-bin-line" :size="20" clickable @click="handleRemove(file)" />
              </div>
            </div>
          </template>
        </div>

        <!-- picture-card 模式的上传按钮 -->
        <div
          v-if="listType === 'picture-card' && !isLimitExceeded"
          key="upload-trigger"
          class="ex-file-upload__list-item ex-file-upload__list-item--card ex-file-upload__upload-trigger"
          :class="{ 'is-dragover': isDragOver }"
          @click="handleClick"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
        >
          <div class="ex-file-upload__upload-trigger-content">
            <ExIcon
              icon="add-line"
              :size="32"
              class="ex-file-upload__upload-trigger-icon"
              aria-hidden="true"
            />
            <div class="ex-file-upload__upload-trigger-text">
              {{ buttonText || t('selectFile') }}
            </div>
          </div>
        </div>
      </transition-group>

      <!-- picture-card 模式的提示信息 -->
      <div
        v-if="(tip || $slots.tip) && listType === 'picture-card'"
        class="ex-file-upload__tip ex-file-upload__tip--card"
      >
        <slot name="tip">
          {{ tip }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch } from 'vue';
import type {
  ExFileUploadProps,
  ExFileUploadEmits,
  ExFileUploadExposed,
  UploadFile,
} from './types';
import { useLocale } from '../../locale';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExFileUpload',
});

const props = withDefaults(defineProps<ExFileUploadProps>(), {
  name: 'file',
  multiple: false,
  drag: false,
  autoUpload: true,
  showFileList: true,
  listType: 'text',
  disabled: false,
  withCredentials: false,
  fileList: () => [],
});

const emit = defineEmits<ExFileUploadEmits>();

const { t } = useLocale('fileUpload');
const uploadRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);
const internalFileList = ref<UploadFile[]>([...props.fileList]);
const uploadQueue = new Map<string, XMLHttpRequest>();

// 计算属性
const uploadClasses = computed(() => [
  'ex-file-upload',
  {
    'ex-file-upload--drag': props.drag,
    'ex-file-upload--disabled': props.disabled,
    [`ex-file-upload--${props.listType}`]: props.listType,
  },
]);

const isLimitExceeded = computed(() => {
  return props.limit !== undefined && internalFileList.value.length >= props.limit;
});

const ariaLabel = computed(() => {
  return props.drag ? t('dragHint') : t('selectFile');
});

// 监听文件列表变化
watch(
  () => props.fileList,
  newList => {
    internalFileList.value = [...newList];
  },
  { deep: true }
);

// 生成唯一ID
const generateUid = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 获取文件项类名
const getFileItemClass = (file: UploadFile) => {
  return [
    'ex-file-upload__list-item',
    `ex-file-upload__list-item--${file.status}`,
    `ex-file-upload__list-item--${props.listType}`,
  ];
};

// 点击上传
const handleClick = () => {
  if (props.disabled || isLimitExceeded.value) return;
  inputRef.value?.click();
};

// 文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (files.length === 0) return;

  handleFiles(files);
  // 清空input，允许重复选择同一文件
  target.value = '';
};

// 拖拽相关
const handleDragOver = () => {
  if (props.disabled) return;
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;
  isDragOver.value = false;

  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length === 0) return;

  handleFiles(files);
};

// 处理文件
const handleFiles = (files: File[]) => {
  // 检查数量限制
  if (props.limit !== undefined) {
    const remainingSlots = props.limit - internalFileList.value.length;
    if (files.length > remainingSlots) {
      emit('exceed', files, internalFileList.value);
      files = files.slice(0, remainingSlots);
    }
  }

  files.forEach(file => {
    // 检查文件大小
    if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
      if (import.meta.env.DEV) {
        console.warn(`File ${file.name} exceeds size limit`);
      }
      return;
    }

    const uploadFile: UploadFile = {
      uid: generateUid(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      percent: 0,
      raw: file,
    };

    // 先添加到列表
    internalFileList.value.push(uploadFile);
    emit('change', uploadFile, internalFileList.value);
    emit('update:fileList', internalFileList.value);

    // 如果是图片，生成缩略图
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = _e => {
        uploadFile.thumbUrl = _e.target?.result as string;
        // 触发响应式更新
        emit('update:fileList', [...internalFileList.value]);
      };
      reader.readAsDataURL(file);
    }

    // 自动上传
    if (props.autoUpload && props.action) {
      uploadFile.status = 'uploading';
      uploadSingleFile(uploadFile);
    }
  });
};

// 上传单个文件
const uploadSingleFile = (file: UploadFile) => {
  if (!props.action || !file.raw) return;

  const xhr = new XMLHttpRequest();
  uploadQueue.set(file.uid, xhr);

  const formData = new FormData();
  formData.append(props.name, file.raw);

  // 添加额外数据
  if (props.data) {
    Object.entries(props.data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
  }

  // 上传进度
  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      file.percent = Math.round((e.loaded / e.total) * 100);
      emit('progress', file.percent, file);
    }
  });

  // 上传成功
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      file.status = 'success';
      try {
        file.response = JSON.parse(xhr.responseText);
        file.url = (file.response as { url?: string })?.url || file.thumbUrl;
      } catch (_e) {
        file.response = xhr.responseText;
      }
      emit('success', file.response, file, internalFileList.value);
    } else {
      file.status = 'error';
      file.error = xhr.statusText;
      emit('error', new Error(xhr.statusText), file, internalFileList.value);
    }
    uploadQueue.delete(file.uid);
    emit('update:fileList', internalFileList.value);
  });

  // 上传失败
  xhr.addEventListener('error', _e => {
    file.status = 'error';
    file.error = 'Upload failed';
    emit('error', new Error('Upload failed'), file, internalFileList.value);
    uploadQueue.delete(file.uid);
    emit('update:fileList', internalFileList.value);
  });

  // 发送请求
  xhr.open('POST', props.action);

  // 设置请求头
  if (props.headers) {
    Object.entries(props.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
  }

  if (props.withCredentials) {
    xhr.withCredentials = true;
  }

  xhr.send(formData);
};

// 移除文件
const handleRemove = (file: UploadFile) => {
  const index = internalFileList.value.findIndex(f => f.uid === file.uid);
  if (index > -1) {
    // 如果正在上传，中止上传
    const xhr = uploadQueue.get(file.uid);
    if (xhr) {
      xhr.abort();
      uploadQueue.delete(file.uid);
    }

    internalFileList.value.splice(index, 1);
    emit('remove', file, internalFileList.value);
    emit('update:fileList', internalFileList.value);
  }
};

// 预览文件
const handlePreview = (file: UploadFile) => {
  emit('preview', file);
};

// 手动上传
const submit = () => {
  internalFileList.value
    .filter(file => file.status === 'ready')
    .forEach(file => {
      file.status = 'uploading';
      uploadSingleFile(file);
    });
};

// 清空文件列表
const clearFiles = () => {
  // 中止所有上传
  uploadQueue.forEach(xhr => xhr.abort());
  uploadQueue.clear();

  internalFileList.value = [];
  emit('update:fileList', internalFileList.value);
};

// 中止上传
const abort = (file?: UploadFile) => {
  if (file) {
    const xhr = uploadQueue.get(file.uid);
    if (xhr) {
      xhr.abort();
      uploadQueue.delete(file.uid);
      file.status = 'ready';
    }
  } else {
    uploadQueue.forEach(xhr => xhr.abort());
    uploadQueue.clear();
    internalFileList.value.forEach(f => {
      if (f.status === 'uploading') {
        f.status = 'ready';
      }
    });
  }
};

const getElement = () => uploadRef.value || null;

defineExpose<ExFileUploadExposed>({
  submit,
  clearFiles,
  abort,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFileUpload.scss"></style>
