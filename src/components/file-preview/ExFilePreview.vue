<template>
  <Teleport to="body">
    <Transition name="ex-preview-fade">
      <div
        v-if="visible"
        ref="previewRef"
        :class="previewClasses"
        :data-theme="configTheme"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        :style="previewStyle"
        tabindex="-1"
        @keydown="handleShortcut"
      >
        <div
          class="ex-file-preview__mask"
          :style="{ background: maskBackground }"
          aria-hidden="true"
          @click="handleMaskClick"
        ></div>

        <div
          v-if="showToolbar"
          class="ex-file-preview__toolbar"
        >
          <div class="ex-file-preview__toolbar-left">
            <span class="ex-file-preview__filename">
              {{ currentFile?.name || t('preview') }}
            </span>
          </div>

          <div class="ex-file-preview__toolbar-actions">
            <template v-if="currentType === 'image' && zoomable">
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-preview__toolbar-btn"
                :disabled="cannotZoomOut"
                :aria-label="t('zoomOut')"
                @click="requestZoomOut"
              >
                <ExIcon
                  icon="zoom-out-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
              <span
                class="ex-file-preview__toolbar-scale"
                aria-live="polite"
              >
                {{ Math.round(currentScale * 100) }}%
              </span>
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-preview__toolbar-btn"
                :disabled="cannotZoomIn"
                :aria-label="t('zoomIn')"
                @click="requestZoomIn"
              >
                <ExIcon
                  icon="zoom-in-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-preview__toolbar-btn"
                :aria-label="t('resetZoom')"
                @click="requestResetZoom"
              >
                <ExIcon
                  icon="aspect-ratio-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
            </template>

            <template v-if="currentType === 'image' && rotatable">
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-preview__toolbar-btn"
                :aria-label="t('rotateCounterclockwise')"
                @click="requestRotateCounterclockwise"
              >
                <ExIcon
                  icon="anticlockwise-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
              <ExButton
                type="text"
                shape="circle"
                class="ex-file-preview__toolbar-btn"
                :aria-label="t('rotateClockwise')"
                @click="requestRotateClockwise"
              >
                <ExIcon
                  icon="clockwise-line"
                  :size="20"
                  aria-hidden="true"
                />
              </ExButton>
            </template>

            <slot
              v-if="currentFile"
              name="toolbar"
              :file="currentFile"
              :index="currentIndex"
            ></slot>

            <ExButton
              v-if="canDownload"
              type="text"
              shape="circle"
              class="ex-file-preview__toolbar-btn"
              :aria-label="t('downloadFile')"
              @click="requestDownload"
            >
              <ExIcon
                icon="download-2-line"
                :size="20"
                aria-hidden="true"
              />
            </ExButton>
            <ExButton
              v-if="showClose"
              type="text"
              shape="circle"
              class="ex-file-preview__toolbar-btn"
              :aria-label="t('closePreview')"
              @click="requestClose"
            >
              <ExIcon
                icon="close-line"
                :size="20"
                aria-hidden="true"
              />
            </ExButton>
          </div>
        </div>

        <ExButton
          v-if="!showToolbar && showClose"
          type="text"
          shape="circle"
          class="ex-file-preview__toolbar-btn ex-file-preview__standalone-close"
          :aria-label="t('closePreview')"
          @click="requestClose"
        >
          <ExIcon
            icon="close-line"
            :size="20"
            aria-hidden="true"
          />
        </ExButton>

        <div class="ex-file-preview__content">
          <ExButton
            v-if="fileList.length > 1 && currentIndex > 0"
            type="text"
            shape="circle"
            class="ex-file-preview__nav ex-file-preview__nav--prev"
            :aria-label="t('previousFile')"
            @click="requestPrevious"
          >
            <ExIcon
              icon="arrow-left-s-line"
              :size="32"
              aria-hidden="true"
            />
          </ExButton>
          <ExButton
            v-if="fileList.length > 1 && currentIndex < fileList.length - 1"
            type="text"
            shape="circle"
            class="ex-file-preview__nav ex-file-preview__nav--next"
            :aria-label="t('nextFile')"
            @click="requestNext"
          >
            <ExIcon
              icon="arrow-right-s-line"
              :size="32"
              aria-hidden="true"
            />
          </ExButton>

          <div
            v-if="!currentFile"
            class="ex-file-preview__empty"
            role="status"
          >
            <ExIcon
              icon="file-unknow-line"
              :size="64"
              aria-hidden="true"
            />
            <p>{{ t('empty') }}</p>
          </div>

          <div
            v-else-if="!currentUrl"
            class="ex-file-preview__invalid"
            role="alert"
          >
            <ExIcon
              icon="error-warning-line"
              :size="64"
              aria-hidden="true"
            />
            <p>{{ t('invalidSource') }}</p>
          </div>

          <div
            v-else-if="currentType === 'image'"
            class="ex-file-preview__image-wrapper"
            @wheel="handleWheel"
          >
            <img
              :key="currentUrl"
              :src="currentUrl"
              :alt="currentFile.name || ''"
              class="ex-file-preview__image"
              :style="imageStyle"
              draggable="false"
              @load="handleMediaReady"
              @error="handleMediaError"
            />
            <div
              v-if="mediaState === 'loading'"
              class="ex-file-preview__media-status"
              role="status"
            >
              {{ t('loading') }}
            </div>
            <div
              v-else-if="mediaState === 'error'"
              class="ex-file-preview__media-error"
              role="alert"
            >
              {{ t('loadFailed') }}
            </div>
          </div>

          <video
            v-else-if="currentType === 'video'"
            :key="currentUrl"
            :src="currentUrl"
            class="ex-file-preview__video"
            controls
            preload="metadata"
            @loadeddata="handleMediaReady"
            @error="handleMediaError"
          ></video>

          <audio
            v-else-if="currentType === 'audio'"
            :key="currentUrl"
            :src="currentUrl"
            class="ex-file-preview__audio"
            controls
            preload="metadata"
            @loadeddata="handleMediaReady"
            @error="handleMediaError"
          ></audio>

          <iframe
            v-else-if="currentType === 'pdf'"
            :key="currentUrl"
            :src="currentUrl"
            class="ex-file-preview__pdf"
            :title="`${currentFile.name || t('preview')} - ${t('pdfDocument')}`"
            sandbox=""
            referrerpolicy="no-referrer"
            @load="handleMediaReady"
            @error="handleMediaError"
          ></iframe>

          <div
            v-else-if="currentType === 'text' || currentType === 'code'"
            class="ex-file-preview__text"
          >
            <div
              v-if="textState === 'loading'"
              class="ex-file-preview__loading"
              role="status"
            >
              {{ t('loading') }}
            </div>
            <div
              v-else-if="textState === 'error'"
              class="ex-file-preview__text-error"
              role="alert"
            >
              {{ textErrorMessage }}
            </div>
            <ol
              v-else-if="currentType === 'code' && showLineNumbers"
              class="ex-file-preview__code-lines"
            >
              <li
                v-for="(line, lineIndex) in textLines"
                :key="lineIndex"
              >
                <code>{{ displayTextLine(line) }}</code>
              </li>
            </ol>
            <pre v-else><code>{{ textContent }}</code></pre>
          </div>

          <div
            v-else
            class="ex-file-preview__unsupported"
            role="status"
          >
            <ExIcon
              icon="file-unknow-line"
              :size="64"
              aria-hidden="true"
            />
            <p>{{ t('unsupported') }}</p>
            <ExButton
              v-if="canDownload"
              type="primary"
              @click="requestDownload"
            >
              {{ t('downloadFile') }}
            </ExButton>
          </div>
        </div>

        <div
          v-if="$slots.footer && currentFile"
          class="ex-file-preview__footer"
        >
          <slot
            name="footer"
            :file="currentFile"
            :index="currentIndex"
          ></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { useControllableState } from '../../composables/useControllableState';
import { useOverlay } from '../../composables/useOverlay';
import { useLocale } from '../../locale';
import { ExFilePreviewError } from './errors';
import {
  clampPreviewIndex,
  clampPreviewScale,
  detectPreviewType,
  normalizePreviewRotation,
  resolvePreviewScaleConfig,
  validatePreviewUrl,
} from './preview-utils';
import { usePreviewSources } from './usePreviewSources';
import type {
  ExFilePreviewEmits,
  ExFilePreviewExposed,
  ExFilePreviewProps,
  ExFilePreviewSlots,
  PreviewFile,
} from './types';

defineOptions({
  name: 'ExFilePreview',
});

const props = withDefaults(defineProps<ExFilePreviewProps>(), {
  visible: false,
  defaultCurrentIndex: 0,
  showToolbar: true,
  showDownload: true,
  showClose: true,
  defaultScale: 1,
  defaultRotate: 0,
  zoomable: true,
  rotatable: true,
  minScale: 0.1,
  maxScale: 5,
  scaleStep: 0.1,
  rotateStep: 90,
  maxTextBytes: 1_048_576,
  maskBackground: 'rgba(0, 0, 0, 0.9)',
  maskClosable: true,
  closeOnEscape: true,
  lockScroll: true,
  showLineNumbers: true,
  zIndex: undefined,
});

const emit = defineEmits<ExFilePreviewEmits>();
defineSlots<ExFilePreviewSlots>();

const { t } = useLocale('filePreview');
const baseZIndex = useZIndexLayer('modal');
const configTheme = useConfigTheme();
const animation = useAnimation();
const neonEffect = useNeonEffect();
const previewRef = ref<HTMLDivElement>();
const { files: fileList, sourceFailure } = usePreviewSources(
  () => props.file,
  () => props.files
);

const indexState = useControllableState<number>({
  controlledValue: () => props.currentIndex,
  defaultValue: () => props.defaultCurrentIndex,
  onChange: index => emit('update:currentIndex', index),
});

const currentIndex = computed(() =>
  clampPreviewIndex(indexState.value.value, fileList.value.length)
);
const currentFile = computed<PreviewFile | undefined>(() => fileList.value[currentIndex.value]);
const currentType = computed(() =>
  currentFile.value ? detectPreviewType(currentFile.value, props.type) : 'unknown'
);
const currentUrl = computed(() =>
  currentFile.value ? validatePreviewUrl(currentFile.value.url, currentType.value) : null
);
const dialogLabel = computed(() =>
  props.ariaLabel ? props.ariaLabel : currentFile.value?.name || t('preview')
);
const previewStyle = computed(() => ({ zIndex: props.zIndex ?? baseZIndex.value }));
const previewClasses = computed(() => [
  'ex-file-preview',
  {
    'ex-no-animation': !animation.value,
    'ex-no-neon': !neonEffect.value,
  },
]);
const canDownload = computed(() =>
  Boolean(props.showDownload && currentFile.value && currentUrl.value)
);

watch(
  [() => indexState.value.value, () => fileList.value.length],
  ([requestedIndex, length]) => {
    const normalizedIndex = clampPreviewIndex(requestedIndex, length);
    if (!Object.is(requestedIndex, normalizedIndex)) indexState.request(normalizedIndex);
  },
  { immediate: true }
);

const scaleConfig = computed(() =>
  resolvePreviewScaleConfig(props.minScale, props.maxScale, props.scaleStep)
);
const scaleState = useControllableState<number>({
  controlledValue: () =>
    props.scale === undefined ? undefined : clampPreviewScale(props.scale, scaleConfig.value),
  defaultValue: () => clampPreviewScale(props.defaultScale, scaleConfig.value),
  onChange: scale => emit('update:scale', scale),
});
const currentScale = computed(() => clampPreviewScale(scaleState.value.value, scaleConfig.value));
const cannotZoomOut = computed(() => currentScale.value <= scaleConfig.value.min);
const cannotZoomIn = computed(() => currentScale.value >= scaleConfig.value.max);

watch(scaleConfig, config => {
  const normalizedScale = clampPreviewScale(scaleState.value.value, config);
  if (!Object.is(scaleState.value.value, normalizedScale)) scaleState.request(normalizedScale);
});

const rotateState = useControllableState<number>({
  controlledValue: () =>
    props.rotate === undefined ? undefined : normalizePreviewRotation(props.rotate),
  defaultValue: () => normalizePreviewRotation(props.defaultRotate),
  onChange: rotate => emit('update:rotate', rotate),
});
const currentRotate = computed(() => normalizePreviewRotation(rotateState.value.value));
const rotationStep = computed(() =>
  Number.isFinite(props.rotateStep) && props.rotateStep > 0 ? props.rotateStep : 90
);
const imageStyle = computed(() => ({
  transform: `scale(${currentScale.value}) rotate(${currentRotate.value}deg)`,
}));

const requestNavigation = (nextIndex: number): void => {
  const normalizedIndex = clampPreviewIndex(nextIndex, fileList.value.length);
  if (normalizedIndex === currentIndex.value) return;
  const nextFile = fileList.value[normalizedIndex];
  if (!nextFile) return;
  indexState.request(normalizedIndex);
  emit('navigation-request', normalizedIndex, nextFile);
};

const requestPrevious = (): void => requestNavigation(currentIndex.value - 1);
const requestNext = (): void => requestNavigation(currentIndex.value + 1);

const requestScale = (scale: number, force = false): void => {
  if (!props.zoomable || currentType.value !== 'image') return;
  const normalizedScale = clampPreviewScale(scale, scaleConfig.value);
  if (!force && Object.is(normalizedScale, currentScale.value)) return;
  scaleState.request(normalizedScale);
};

const requestZoomIn = (): void => requestScale(currentScale.value + scaleConfig.value.step);
const requestZoomOut = (): void => requestScale(currentScale.value - scaleConfig.value.step);
const requestResetZoom = (): void => requestScale(1, true);

const requestRotation = (rotation: number, force = false): void => {
  if (!props.rotatable || currentType.value !== 'image') return;
  const normalizedRotation = normalizePreviewRotation(rotation);
  if (!force && Object.is(normalizedRotation, currentRotate.value)) return;
  rotateState.request(normalizedRotation);
};

const requestRotateClockwise = (): void =>
  requestRotation(currentRotate.value + rotationStep.value);
const requestRotateCounterclockwise = (): void =>
  requestRotation(currentRotate.value - rotationStep.value);
const requestResetRotation = (): void => requestRotation(0, true);

const requestDownload = (): void => {
  if (currentFile.value && currentUrl.value) emit('download-request', currentFile.value);
};

const requestClose = (): void => {
  if (!props.visible) return;
  emit('update:visible', false);
  emit('close-request');
};

useOverlay({
  active: () => props.visible,
  container: previewRef,
  lockScroll: () => props.lockScroll,
  closeOnEscape: () => props.closeOnEscape,
  onEscape: () => requestClose(),
  restoreFocus: true,
});

const handleMaskClick = (): void => {
  if (props.maskClosable) requestClose();
};

const handleWheel = (event: WheelEvent): void => {
  if (!props.zoomable || currentType.value !== 'image') return;
  if (event.deltaY < 0 && !cannotZoomIn.value) {
    event.preventDefault();
    requestZoomIn();
  } else if (event.deltaY > 0 && !cannotZoomOut.value) {
    event.preventDefault();
    requestZoomOut();
  }
};

const isShortcutInput = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, video, audio, iframe, [contenteditable]:not([contenteditable="false"])'
    )
  );
};

const handleShortcut = (event: KeyboardEvent): void => {
  if (isShortcutInput(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === 'ArrowLeft' && currentIndex.value > 0) {
    event.preventDefault();
    requestPrevious();
  } else if (event.key === 'ArrowRight' && currentIndex.value < fileList.value.length - 1) {
    event.preventDefault();
    requestNext();
  } else if (
    currentType.value === 'image' &&
    props.zoomable &&
    (event.key === '+' || event.key === '=') &&
    !cannotZoomIn.value
  ) {
    event.preventDefault();
    requestZoomIn();
  } else if (
    currentType.value === 'image' &&
    props.zoomable &&
    event.key === '-' &&
    !cannotZoomOut.value
  ) {
    event.preventDefault();
    requestZoomOut();
  } else if (event.key === '0' && props.zoomable && currentType.value === 'image') {
    event.preventDefault();
    requestResetZoom();
  }
};

type MediaState = 'idle' | 'loading' | 'ready' | 'error';
const mediaState = ref<MediaState>('idle');

watch(
  [() => props.visible, currentType, currentUrl],
  ([visible, type, url]) => {
    mediaState.value =
      visible && url && (type === 'image' || type === 'video' || type === 'audio' || type === 'pdf')
        ? 'loading'
        : 'idle';
  },
  { immediate: true }
);

const isCurrentMediaEvent = (event: Event): boolean => {
  const target = event.currentTarget;
  return target instanceof Node && Boolean(previewRef.value?.contains(target));
};

const handleMediaReady = (event: Event): void => {
  if (!isCurrentMediaEvent(event)) return;
  if (!currentFile.value) return;
  mediaState.value = 'ready';
  emit('ready', currentFile.value, currentIndex.value);
};

const handleMediaError = (cause: Event): void => {
  if (!isCurrentMediaEvent(cause)) return;
  if (!currentFile.value) return;
  mediaState.value = 'error';
  emit(
    'error',
    new ExFilePreviewError('文件预览加载失败', { code: 'load-failed', cause }),
    currentFile.value,
    currentIndex.value
  );
};

let reportedInvalidSource = '';
watch(
  [() => props.visible, currentFile, currentUrl, currentIndex, sourceFailure],
  ([visible, file, url, index, failure]) => {
    if (!visible || !file || url) {
      reportedInvalidSource = '';
      return;
    }

    const reportKey = `${index}:${file.url}:${failure?.file === file ? 'blob' : 'url'}`;
    if (reportKey === reportedInvalidSource) return;
    reportedInvalidSource = reportKey;
    const error =
      failure?.file === file
        ? failure.error
        : new ExFilePreviewError('文件预览地址无效或协议不受支持', {
            code: 'invalid-source',
          });
    emit('error', error, file, index);
  },
  { immediate: true }
);

type TextState = 'idle' | 'loading' | 'ready' | 'error';
const textState = ref<TextState>('idle');
const textContent = ref('');
const textError = ref<ExFilePreviewError | null>(null);
const textLines = computed(() => textContent.value.split('\n'));
const textErrorMessage = computed(() =>
  textError.value?.code === 'text-too-large' ? t('textTooLarge') : t('loadFailed')
);
const normalizedMaxTextBytes = computed(() =>
  Number.isFinite(props.maxTextBytes) && props.maxTextBytes > 0
    ? Math.floor(props.maxTextBytes)
    : 1_048_576
);

const displayTextLine = (line: string): string => line || '\u200b';
const createTextTooLargeError = (): ExFilePreviewError =>
  new ExFilePreviewError('文本内容超过允许的最大字节数', { code: 'text-too-large' });

const readBoundedText = async (response: Response, byteLimit: number): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw createTextTooLargeError();
  }

  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      receivedBytes += result.value.byteLength;
      if (receivedBytes > byteLimit) {
        try {
          await reader.cancel();
        } catch {
          // 超限错误是稳定业务结果，流取消异常只作为底层清理失败处理。
        }
        throw createTextTooLargeError();
      }
      chunks.push(decoder.decode(result.value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return chunks.join('');
  } finally {
    reader.releaseLock();
  }
};

let textRequestRevision = 0;
let textRequestController: AbortController | null = null;

const cancelTextRequest = (): void => {
  textRequestRevision += 1;
  textRequestController?.abort();
  textRequestController = null;
};

const loadTextContent = async (
  url: string,
  file: PreviewFile,
  index: number,
  byteLimit: number
): Promise<void> => {
  cancelTextRequest();
  const revision = ++textRequestRevision;
  const controller = new AbortController();
  textRequestController = controller;
  textState.value = 'loading';
  textContent.value = '';
  textError.value = null;

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (revision !== textRequestRevision || controller.signal.aborted) return;
    if (!response.ok) {
      throw new ExFilePreviewError(`文本加载失败（HTTP ${response.status}）`, {
        code: 'http-error',
        status: response.status,
      });
    }

    const rawContentLength = response.headers.get('content-length');
    const contentLength =
      rawContentLength !== null && /^\d+$/.test(rawContentLength) ? Number(rawContentLength) : null;
    if (contentLength !== null && Number.isFinite(contentLength) && contentLength > byteLimit) {
      controller.abort();
      throw createTextTooLargeError();
    }

    const content = await readBoundedText(response, byteLimit);
    if (revision !== textRequestRevision || controller.signal.aborted) return;
    textContent.value = content;
    textState.value = 'ready';
    emit('ready', file, index);
  } catch (cause) {
    if (
      revision !== textRequestRevision ||
      (controller.signal.aborted && !(cause instanceof ExFilePreviewError))
    ) {
      return;
    }
    const error =
      cause instanceof ExFilePreviewError
        ? cause
        : new ExFilePreviewError('文本内容加载失败', { code: 'load-failed', cause });
    textError.value = error;
    textState.value = 'error';
    emit('error', error, file, index);
  } finally {
    if (revision === textRequestRevision) textRequestController = null;
  }
};

watch(
  [() => props.visible, currentFile, currentType, currentUrl, currentIndex, normalizedMaxTextBytes],
  ([visible, file, type, url, index, byteLimit]) => {
    if (visible && file && url && (type === 'text' || type === 'code')) {
      void loadTextContent(url, file, index, byteLimit);
      return;
    }
    cancelTextRequest();
    textState.value = 'idle';
    textContent.value = '';
    textError.value = null;
  },
  { immediate: true }
);

onBeforeUnmount(cancelTextRequest);

const getElement = (): HTMLDivElement | null => previewRef.value ?? null;

defineExpose<ExFilePreviewExposed>({
  requestPrevious,
  requestNext,
  requestZoomIn,
  requestZoomOut,
  requestResetZoom,
  requestRotateClockwise,
  requestRotateCounterclockwise,
  requestResetRotation,
  requestDownload,
  requestClose,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFilePreview.scss"></style>
