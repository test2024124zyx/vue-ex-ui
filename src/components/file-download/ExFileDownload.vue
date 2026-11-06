<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { CSSProperties } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import { hasRenderableContent } from '../../utils/vnode';
import {
  calculateDownloadProgress,
  formatDownloadBytes,
  normalizeDownloadUrl,
  parseContentLength,
  resolveDownloadFilename,
} from './download-utils';
import { ExFileDownloadError } from './errors';
import type {
  ExFileDownloadEmits,
  ExFileDownloadExposed,
  ExFileDownloadProgress,
  ExFileDownloadProps,
  ExFileDownloadRequestTransport,
  ExFileDownloadResult,
  ExFileDownloadSlotProps,
  ExFileDownloadSlots,
  ExFileDownloadStatus,
  ExFileDownloadTransport,
} from './types';

defineOptions({ name: 'ExFileDownload' });

const DEFAULT_MAX_DOWNLOAD_BYTES = 512 * 1024 * 1024;

const props = withDefaults(defineProps<ExFileDownloadProps>(), {
  filename: undefined,
  transport: 'link',
  showProgress: true,
  headers: undefined,
  maxBytes: DEFAULT_MAX_DOWNLOAD_BYTES,
  withCredentials: false,
  buttonText: undefined,
  buttonType: 'primary',
  buttonSize: 'medium',
  disabled: false,
});
const emit = defineEmits<ExFileDownloadEmits>();
const slots = defineSlots<ExFileDownloadSlots>();
const { t } = useLocale('fileDownload');

interface ActiveOperation {
  transport: ExFileDownloadRequestTransport;
  cancelled: boolean;
  controller?: AbortController;
  xhr?: XMLHttpRequest;
}

interface DownloadResponse {
  blob: Blob;
  contentDisposition: string | null;
}

const TRANSPORTS = new Set<ExFileDownloadTransport>(['link', 'fetch', 'xhr']);
const EMPTY_PROGRESS: ExFileDownloadProgress = { loaded: 0, total: null, percent: null };

const downloadRef = ref<HTMLDivElement>();
const status = ref<ExFileDownloadStatus>('idle');
const progress = ref<ExFileDownloadProgress>({ ...EMPTY_PROGRESS });
const pendingObjectUrls = new Map<string, ReturnType<typeof setTimeout>>();
let activeOperation: ActiveOperation | null = null;
let isHandlingLink = false;
let isUnmounted = false;

const isDownloading = computed(() => status.value === 'downloading');
const isTriggerDisabled = computed(() => props.disabled || isDownloading.value);
const progressStyle = computed<CSSProperties>(() => ({
  '--ex-file-download-progress': `${progress.value.percent ?? 35}%`,
}));
const progressText = computed(() => {
  if (progress.value.total === null || progress.value.percent === null) {
    return `${t('downloading')} (${formatDownloadBytes(progress.value.loaded)})`;
  }
  return `${progress.value.percent}% (${formatDownloadBytes(progress.value.loaded)} / ${formatDownloadBytes(progress.value.total)})`;
});
const buttonText = computed(() => {
  if (props.buttonText !== undefined) return props.buttonText;

  switch (status.value) {
    case 'downloading':
      return t('downloading');
    case 'triggered':
      return t('downloadRequested');
    case 'success':
      return t('downloadReady');
    case 'error':
      return t('downloadError');
    default:
      return t('download');
  }
});

const resetProgress = () => {
  progress.value = { ...EMPTY_PROGRESS };
};

const normalizeTransport = (): ExFileDownloadTransport => {
  if (!TRANSPORTS.has(props.transport)) {
    throw new ExFileDownloadError('invalid-transport', `不支持下载传输方式：${props.transport}`);
  }
  return props.transport;
};

const normalizeError = (
  error: unknown,
  fallbackCode: 'network-error' | 'unsupported' = 'network-error'
): ExFileDownloadError => {
  if (error instanceof ExFileDownloadError) return error;
  const message = error instanceof Error && error.message ? error.message : '下载失败';
  return new ExFileDownloadError(fallbackCode, message, { cause: error });
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError';

const isActive = (operation: ActiveOperation): boolean =>
  !isUnmounted && !operation.cancelled && activeOperation === operation;

const reportProgress = (operation: ActiveOperation, next: ExFileDownloadProgress) => {
  if (!isActive(operation)) return;
  progress.value = next;
  emit('progress', next);
};

const normalizedMaxBytes = computed(() =>
  Number.isFinite(props.maxBytes) && props.maxBytes > 0
    ? Math.floor(props.maxBytes)
    : DEFAULT_MAX_DOWNLOAD_BYTES
);

const createSizeExceededError = () =>
  new ExFileDownloadError(
    'size-exceeded',
    `下载内容超过允许的最大大小 ${formatDownloadBytes(normalizedMaxBytes.value)}`
  );

/** 创建临时链接并保证节点始终从文档中移除。 */
const triggerBrowserDownload = (url: string, filename: string) => {
  if (typeof document === 'undefined') {
    throw new ExFileDownloadError('unsupported', '当前运行环境不支持浏览器下载');
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.hidden = true;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
};

const releaseObjectUrl = (url: string) => {
  const timer = pendingObjectUrls.get(url);
  if (timer !== undefined) clearTimeout(timer);
  pendingObjectUrls.delete(url);
  URL.revokeObjectURL(url);
};

/** 延迟到下一任务释放对象 URL，避免浏览器尚未接管链接就失去数据源。 */
const scheduleObjectUrlRelease = (url: string) => {
  const timer = setTimeout(() => releaseObjectUrl(url), 0);
  pendingObjectUrls.set(url, timer);
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof URL.revokeObjectURL !== 'function'
  ) {
    throw new ExFileDownloadError('unsupported', '当前运行环境不支持 Blob 下载');
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    triggerBrowserDownload(objectUrl, filename);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
  scheduleObjectUrlRelease(objectUrl);
};

const downloadByFetch = async (
  operation: ActiveOperation,
  url: string
): Promise<DownloadResponse> => {
  if (typeof fetch !== 'function' || typeof AbortController !== 'function') {
    throw new ExFileDownloadError('unsupported', '当前运行环境不支持 Fetch 下载');
  }

  const controller = new AbortController();
  operation.controller = controller;
  const response = await fetch(url, {
    headers: props.headers,
    credentials: props.withCredentials ? 'include' : 'same-origin',
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new ExFileDownloadError(
      'http-error',
      `下载请求失败：${response.status} ${response.statusText}`.trim(),
      { status: response.status }
    );
  }

  const contentDisposition = response.headers.get('content-disposition');
  const declaredTotal = parseContentLength(response.headers.get('content-length'));
  if (declaredTotal !== null && declaredTotal > normalizedMaxBytes.value) {
    controller.abort();
    throw createSizeExceededError();
  }
  if (!response.body) {
    const blob = await response.blob();
    if (blob.size > normalizedMaxBytes.value) {
      controller.abort();
      throw createSizeExceededError();
    }
    reportProgress(operation, calculateDownloadProgress(blob.size, blob.size, true));
    return { blob, contentDisposition };
  }

  const total = declaredTotal;
  const contentType = response.headers.get('content-type') ?? '';
  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    const buffer = new ArrayBuffer(value.byteLength);
    const chunk = new Uint8Array(buffer);
    chunk.set(value);
    chunks.push(buffer);
    loaded += chunk.byteLength;
    if (loaded > normalizedMaxBytes.value) {
      if (typeof reader.cancel === 'function') {
        void reader.cancel().catch(() => undefined);
      }
      controller.abort();
      throw createSizeExceededError();
    }
    reportProgress(operation, calculateDownloadProgress(loaded, total));
  }

  return {
    blob: new Blob(chunks, { type: contentType }),
    contentDisposition,
  };
};

const downloadByXhr = (operation: ActiveOperation, url: string): Promise<DownloadResponse> => {
  if (typeof XMLHttpRequest !== 'function') {
    return Promise.reject(new ExFileDownloadError('unsupported', '当前运行环境不支持 XHR 下载'));
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    operation.xhr = request;
    let settled = false;

    const resolveOnce = (value: DownloadResponse) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const rejectOnce = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    request.addEventListener('progress', event => {
      const total = event.lengthComputable ? event.total : null;
      if (
        event.loaded > normalizedMaxBytes.value ||
        (total !== null && total > normalizedMaxBytes.value)
      ) {
        rejectOnce(createSizeExceededError());
        request.abort();
        return;
      }
      reportProgress(operation, calculateDownloadProgress(event.loaded, total));
    });
    request.addEventListener('load', () => {
      const successfulStatus =
        (request.status >= 200 && request.status < 300) ||
        (request.status === 0 && url.startsWith('blob:'));
      if (!successfulStatus) {
        rejectOnce(
          new ExFileDownloadError(
            'http-error',
            `下载请求失败：${request.status} ${request.statusText}`.trim(),
            { status: request.status }
          )
        );
        return;
      }

      const blob =
        request.response instanceof Blob ? request.response : new Blob([request.response]);
      if (blob.size > normalizedMaxBytes.value) {
        rejectOnce(createSizeExceededError());
        return;
      }
      const knownTotal = progress.value.total ?? blob.size;
      reportProgress(operation, calculateDownloadProgress(blob.size, knownTotal, true));
      resolveOnce({
        blob,
        contentDisposition: request.getResponseHeader('content-disposition'),
      });
    });
    request.addEventListener('error', () => {
      rejectOnce(new ExFileDownloadError('network-error', 'XHR 下载请求失败'));
    });
    request.addEventListener('abort', () => {
      rejectOnce(new DOMException('下载已取消', 'AbortError'));
    });

    try {
      request.open('GET', url, true);
      request.responseType = 'blob';
      for (const [name, value] of Object.entries(props.headers ?? {})) {
        request.setRequestHeader(name, value);
      }
      request.withCredentials = props.withCredentials;
      request.send();
    } catch (error) {
      rejectOnce(normalizeError(error));
    }
  });
};

const handleDownload = async (): Promise<ExFileDownloadResult> => {
  if (props.disabled) return { outcome: 'ignored', reason: 'disabled' };
  if (activeOperation || isHandlingLink) return { outcome: 'ignored', reason: 'busy' };

  let transport: ExFileDownloadTransport;
  let url: string;
  try {
    transport = normalizeTransport();
    url = normalizeDownloadUrl(props.url);
  } catch (error) {
    const downloadError = normalizeError(error);
    status.value = 'error';
    emit('error', downloadError);
    return { outcome: 'error', error: downloadError };
  }

  // 地址与文件名属于同一次下载快照，后续属性切换只影响下一次请求。
  const requestedFilename = props.filename;
  resetProgress();

  if (transport === 'link') {
    isHandlingLink = true;
    try {
      emit('start', transport);
      const filename = resolveDownloadFilename(requestedFilename, null, url);
      triggerBrowserDownload(url, filename);
      status.value = 'triggered';
      emit('trigger', url, filename);
      return { outcome: 'triggered', transport, url, filename };
    } catch (error) {
      const downloadError = normalizeError(error, 'unsupported');
      status.value = 'error';
      emit('error', downloadError);
      return { outcome: 'error', error: downloadError };
    } finally {
      isHandlingLink = false;
    }
  }

  const operation: ActiveOperation = { transport, cancelled: false };
  activeOperation = operation;
  status.value = 'downloading';
  emit('start', transport);
  if (!isActive(operation)) return { outcome: 'cancelled', transport };

  try {
    const response =
      transport === 'fetch'
        ? await downloadByFetch(operation, url)
        : await downloadByXhr(operation, url);

    if (!isActive(operation)) return { outcome: 'cancelled', transport };

    const filename = resolveDownloadFilename(requestedFilename, response.contentDisposition, url);
    downloadBlob(response.blob, filename);
    status.value = 'success';
    emit('success', response.blob, filename);
    return { outcome: 'success', transport, blob: response.blob, filename };
  } catch (error) {
    if (operation.cancelled || isAbortError(error) || !isActive(operation)) {
      return { outcome: 'cancelled', transport };
    }

    const downloadError = normalizeError(error);
    status.value = 'error';
    emit('error', downloadError);
    return { outcome: 'error', error: downloadError };
  } finally {
    if (activeOperation === operation) activeOperation = null;
  }
};

const cancel = (): boolean => {
  const operation = activeOperation;
  if (!operation) return false;

  operation.cancelled = true;
  activeOperation = null;
  operation.controller?.abort();
  operation.xhr?.abort();
  status.value = 'idle';
  resetProgress();
  if (!isUnmounted) emit('cancel');
  return true;
};

const getElement = () => downloadRef.value ?? null;
const slotProps = computed<ExFileDownloadSlotProps>(() => ({
  download: handleDownload,
  cancel,
  status: status.value,
  progress: progress.value,
  disabled: isTriggerDisabled.value,
}));
const hasTriggerSlot = computed(() => hasRenderableContent(slots.default?.(slotProps.value)));
const hasProgressSlot = computed(() =>
  hasRenderableContent(slots.progress?.({ progress: progress.value }))
);

onBeforeUnmount(() => {
  isUnmounted = true;
  const operation = activeOperation;
  if (operation) {
    operation.cancelled = true;
    activeOperation = null;
    operation.controller?.abort();
    operation.xhr?.abort();
  }

  for (const url of [...pendingObjectUrls.keys()]) releaseObjectUrl(url);
});

defineExpose<ExFileDownloadExposed>({
  download: handleDownload,
  cancel,
  getElement,
});
</script>

<template>
  <div
    ref="downloadRef"
    class="ex-file-download"
    :aria-busy="isDownloading ? 'true' : 'false'"
  >
    <slot
      v-if="hasTriggerSlot"
      :download="handleDownload"
      :cancel="cancel"
      :status="status"
      :progress="progress"
      :disabled="isTriggerDisabled"
    />
    <ExButton
      v-else
      :type="buttonType"
      :size="buttonSize"
      :disabled="isTriggerDisabled"
      :loading="isDownloading"
      @click="handleDownload"
    >
      <template #prefix>
        <ExIcon
          v-if="status === 'success'"
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
        <ExIcon
          v-else
          icon="download-2-line"
          :size="16"
          aria-hidden="true"
        />
      </template>
      {{ buttonText }}
    </ExButton>

    <slot
      v-if="showProgress && isDownloading && hasProgressSlot"
      name="progress"
      :progress="progress"
    />
    <div
      v-else-if="showProgress && isDownloading"
      class="ex-file-download__progress"
    >
      <div
        class="ex-file-download__progress-bar"
        role="progressbar"
        :aria-label="t('progressLabel')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="progress.percent ?? undefined"
        :aria-valuetext="progressText"
      >
        <div
          class="ex-file-download__progress-bar-inner"
          :class="{ 'is-indeterminate': progress.percent === null }"
          :style="progressStyle"
        />
      </div>
      <div class="ex-file-download__progress-text">
        {{ progressText }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ExFileDownload.scss"></style>
