<template>
  <div
    ref="downloadRef"
    class="ex-file-download"
  >
    <slot
      :download="handleDownload"
      :status="status"
      :percent="percent"
    >
      <ExButton
        :type="buttonType"
        :size="buttonSize"
        :disabled="disabled || status === 'downloading'"
        :loading="status === 'downloading'"
        @click="handleDownload"
      >
        <template #prefix>
          <ExIcon
            v-if="status === 'idle' || status === 'paused'"
            icon="download-2-line"
            :size="16"
            aria-hidden="true"
          />
          <ExIcon
            v-else-if="status === 'success'"
            icon="check-line"
            :size="16"
            aria-hidden="true"
          />
          <ExIcon
            v-else-if="status === 'error'"
            icon="close-line"
            :size="16"
            aria-hidden="true"
          />
        </template>
        {{ getButtonText() }}
      </ExButton>
    </slot>

    <!-- 进度条 -->
    <div
      v-if="showProgress && status === 'downloading'"
      class="ex-file-download__progress"
    >
      <div class="ex-file-download__progress-bar">
        <div
          class="ex-file-download__progress-bar-inner"
          :style="{ width: `${percent}%` }"
        />
      </div>
      <div class="ex-file-download__progress-text">
        {{ percent }}% ({{ formatBytes(loaded) }} / {{ formatBytes(total) }})
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type {
  ExFileDownloadProps,
  ExFileDownloadEmits,
  ExFileDownloadExposed,
  DownloadStatus,
} from './types';
import { useLocale } from '../../locale';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExFileDownload',
});

const props = withDefaults(defineProps<ExFileDownloadProps>(), {
  method: 'link',
  showProgress: true,
  autoDownload: false,
  withCredentials: false,
  buttonType: 'primary',
  buttonSize: 'medium',
  disabled: false,
});

const emit = defineEmits<ExFileDownloadEmits>();

const { t } = useLocale('fileDownload');
const downloadRef = ref<HTMLDivElement>();
const status = ref<DownloadStatus>('idle');
const percent = ref(0);
const loaded = ref(0);
const total = ref(0);
const xhr = ref<XMLHttpRequest>();
const fetchController = ref<AbortController>();

// 自动下载
onMounted(() => {
  if (props.autoDownload) {
    handleDownload();
  }
});

// 清理：卸载时中止进行中的 XHR / fetch，避免回调落在已销毁实例上
onBeforeUnmount(() => {
  xhr.value?.abort();
  fetchController.value?.abort();
});

// 获取按钮文本
const getButtonText = () => {
  if (props.buttonText) return props.buttonText;

  switch (status.value) {
    case 'downloading':
      return t('downloading');
    case 'success':
      return t('downloadSuccess');
    case 'error':
      return t('downloadError');
    case 'paused':
      return t('resume');
    default:
      return t('download');
  }
};

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 下载文件
const handleDownload = () => {
  if (props.disabled || status.value === 'downloading') return;

  if (props.method === 'link') {
    downloadByLink();
  } else if (props.method === 'fetch') {
    downloadByFetch();
  } else {
    downloadByXHR();
  }
};

// 通过链接下载
const downloadByLink = () => {
  const link = document.createElement('a');
  link.href = props.url;
  if (props.filename) {
    link.download = props.filename;
  }
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  status.value = 'success';
  emit('start');
  emit('success', new Blob());
};

// 通过Fetch下载
const downloadByFetch = async () => {
  const controller = new AbortController();
  fetchController.value = controller;
  try {
    status.value = 'downloading';
    percent.value = 0;
    emit('start');

    const response = await fetch(props.url, {
      headers: props.headers,
      credentials: props.withCredentials ? 'include' : 'same-origin',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    total.value = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const chunks: Uint8Array[] = [];
    loaded.value = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded.value += value.length;

      if (total.value > 0) {
        percent.value = Math.round((loaded.value / total.value) * 100);
        emit('progress', percent.value, loaded.value, total.value);
      }
    }

    // 创建 Blob 对象（使用类型断言解决 ArrayBufferLike 兼容性问题）
    // eslint-disable-next-line no-undef
    const blob = new Blob(chunks as unknown as BlobPart[]);
    downloadBlob(blob);

    status.value = 'success';
    emit('success', blob);
  } catch (error) {
    // 主动中止（暂停 / 取消）不视为下载错误
    if ((error as Error)?.name === 'AbortError') return;
    status.value = 'error';
    emit('error', error as Error);
  } finally {
    if (fetchController.value === controller) fetchController.value = undefined;
  }
};

// 通过XHR下载
const downloadByXHR = () => {
  status.value = 'downloading';
  percent.value = 0;
  emit('start');

  xhr.value = new XMLHttpRequest();
  xhr.value.open('GET', props.url, true);
  xhr.value.responseType = 'blob';

  if (props.headers) {
    Object.entries(props.headers).forEach(([key, value]) => {
      xhr.value!.setRequestHeader(key, value);
    });
  }

  if (props.withCredentials) {
    xhr.value.withCredentials = true;
  }

  xhr.value.addEventListener('progress', e => {
    if (e.lengthComputable) {
      loaded.value = e.loaded;
      total.value = e.total;
      percent.value = Math.round((e.loaded / e.total) * 100);
      emit('progress', percent.value, e.loaded, e.total);
    }
  });

  xhr.value.addEventListener('load', () => {
    if (xhr.value!.status >= 200 && xhr.value!.status < 300) {
      const blob = xhr.value!.response as Blob;
      downloadBlob(blob);
      status.value = 'success';
      emit('success', blob);
    } else {
      status.value = 'error';
      emit('error', new Error(`HTTP error! status: ${xhr.value!.status}`));
    }
  });

  xhr.value.addEventListener('error', () => {
    status.value = 'error';
    emit('error', new Error('Download failed'));
  });

  xhr.value.send();
};

// 下载Blob
const downloadBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = props.filename || 'download';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 暂停下载（xhr / fetch 均支持中止；注意 resume 为重新下载，非断点续传）
const pause = () => {
  if (status.value !== 'downloading') return;
  if (xhr.value) {
    xhr.value.abort();
  } else if (fetchController.value) {
    fetchController.value.abort();
  } else {
    // link 方式无中止能力
    return;
  }
  status.value = 'paused';
  emit('pause');
};

// 恢复下载（从头重新下载，非断点续传）
const resume = () => {
  if (status.value === 'paused') {
    handleDownload();
    emit('resume');
  }
};

// 取消下载
const cancel = () => {
  xhr.value?.abort();
  fetchController.value?.abort();
  status.value = 'idle';
  percent.value = 0;
  loaded.value = 0;
  total.value = 0;
  emit('cancel');
};

const getElement = () => downloadRef.value || null;

defineExpose<ExFileDownloadExposed>({
  download: handleDownload,
  pause,
  resume,
  cancel,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFileDownload.scss"></style>
