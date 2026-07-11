<template>
  <div
    ref="compressRef"
    class="ex-image-compress"
    :aria-busy="isBusy ? 'true' : 'false'"
  >
    <div
      v-if="sourceError"
      class="ex-image-compress__error"
      role="alert"
    >
      {{ sourceError.message }}
    </div>

    <section
      v-if="showPreview"
      class="ex-image-compress__preview"
      :aria-label="t('imageCompress.preview')"
    >
      <figure class="ex-image-compress__preview-item ex-image-compress__preview-original">
        <figcaption class="ex-image-compress__preview-label">
          {{ t('imageCompress.original') }}
        </figcaption>
        <div class="ex-image-compress__preview-image">
          <img
            v-if="sourceResource"
            :src="sourceResource.previewUrl"
            :alt="t('imageCompress.original')"
          />
          <div
            v-else
            class="ex-image-compress__preview-placeholder"
            role="status"
          >
            <ExIcon
              icon="image-line"
              :size="48"
              aria-hidden="true"
            />
            <span class="ex-image-compress__sr-only">
              {{
                isLoadingSource ? t('imageCompress.sourceLoading') : t('imageCompress.noPreview')
              }}
            </span>
          </div>
        </div>
        <div
          v-if="sourceResource"
          class="ex-image-compress__preview-info"
        >
          <span>{{ formatBytes(sourceResource.originalSize) }}</span>
          <span>
            {{ sourceResource.originalDimension.width }} ×
            {{ sourceResource.originalDimension.height }}
          </span>
        </div>
      </figure>

      <ExIcon
        v-if="showComparison"
        class="ex-image-compress__preview-arrow"
        icon="arrow-right-line"
        :size="32"
        aria-hidden="true"
      />

      <figure
        v-if="showComparison"
        class="ex-image-compress__preview-item ex-image-compress__preview-compressed"
      >
        <figcaption class="ex-image-compress__preview-label">
          {{ t('imageCompress.compressed') }}
        </figcaption>
        <div class="ex-image-compress__preview-image">
          <img
            v-if="compressedUrl"
            :src="compressedUrl"
            :alt="t('imageCompress.compressed')"
          />
          <div
            v-else
            class="ex-image-compress__preview-placeholder"
            aria-hidden="true"
          >
            <ExIcon
              icon="image-line"
              :size="48"
              aria-hidden="true"
            />
          </div>
        </div>
        <div
          v-if="result"
          class="ex-image-compress__preview-info"
        >
          <span class="ex-image-compress__preview-size">
            {{ formatBytes(result.compressedSize) }}
            <span
              class="ex-image-compress__preview-ratio"
              :class="{
                'ex-image-compress__preview-ratio--larger': result.compressionRatio < 0,
              }"
            >
              ({{ result.compressionRatio }}%)
            </span>
          </span>
          <span>
            {{ result.compressedDimension.width }} ×
            {{ result.compressedDimension.height }}
          </span>
        </div>
      </figure>
    </section>

    <div class="ex-image-compress__controls">
      <fieldset class="ex-image-compress__control-group">
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.mode') }}
        </legend>
        <div class="ex-image-compress__control-buttons">
          <ExButton
            v-for="item in modeOptions"
            :key="item.value"
            class="ex-image-compress__mode-button"
            :data-mode="item.value"
            :type="currentMode === item.value ? 'primary' : 'default'"
            size="small"
            :disabled="item.value === 'quality' && currentOutputType === 'image/png'"
            :aria-pressed="currentMode === item.value ? 'true' : 'false'"
            @click="setMode(item.value)"
          >
            {{ item.label }}
          </ExButton>
        </div>
      </fieldset>

      <fieldset
        v-if="currentOutputType !== 'image/png'"
        class="ex-image-compress__control-group"
      >
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.compressQuality') }}: {{ Math.round(currentQuality * 100) }}%
        </legend>
        <ExSlider
          v-model="currentQuality"
          :min="0.01"
          :max="1"
          :step="0.01"
        />
      </fieldset>

      <fieldset
        v-if="currentMode === 'size'"
        class="ex-image-compress__control-group"
      >
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.targetSize') }}
        </legend>
        <ExNumberInput
          v-model="currentTargetSize"
          :min="0.001"
          :max="10240"
          :step="10"
        />
      </fieldset>

      <fieldset
        v-if="currentMode === 'dimension'"
        class="ex-image-compress__control-group"
      >
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.maxWidth') }}
        </legend>
        <ExNumberInput
          v-model="currentMaxWidth"
          :min="1"
          :max="32767"
          :step="10"
        />
      </fieldset>

      <fieldset
        v-if="currentMode === 'dimension'"
        class="ex-image-compress__control-group"
      >
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.maxHeight') }}
        </legend>
        <ExNumberInput
          v-model="currentMaxHeight"
          :min="1"
          :max="32767"
          :step="10"
        />
      </fieldset>

      <fieldset class="ex-image-compress__control-group">
        <legend class="ex-image-compress__control-label">
          {{ t('imageCompress.outputFormat') }}
        </legend>
        <ExSelect
          :model-value="currentOutputType"
          :options="outputTypeOptions"
          @update:model-value="handleOutputTypeChange"
        />
      </fieldset>
    </div>

    <div class="ex-image-compress__actions">
      <ExButton
        :disabled="isCompressing"
        @click="reset"
      >
        {{ t('imageCompress.reset') }}
      </ExButton>
      <ExButton
        type="primary"
        :loading="isCompressing"
        :disabled="!sourceResource || isLoadingSource"
        @click="handleCompressClick"
      >
        {{ isCompressing ? t('imageCompress.compressing') : t('imageCompress.startCompress') }}
      </ExButton>
      <ExButton
        v-if="result"
        type="success"
        @click="download()"
      >
        <template #prefix>
          <ExIcon
            icon="download-2-line"
            :size="16"
            aria-hidden="true"
          />
        </template>
        {{ t('imageCompress.download') }}
      </ExButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import ExNumberInput from '../number-input/ExNumberInput.vue';
import ExSelect from '../select/ExSelect.vue';
import ExSlider from '../slider/ExSlider.vue';
import type { SelectOption, SelectValue } from '../select/types';
import { useI18n } from '../../locale';
import { ExImageCompressError } from './errors';
import {
  compressLoadedImage,
  downloadCompressedImage,
  formatBytes,
  loadImageResource,
  normalizeCompressOptions,
} from './utils';
import type { ImageCompressLoadedResource } from './utils';
import type {
  CompressMode,
  CompressResult,
  ExImageCompressEmits,
  ExImageCompressExposed,
  ExImageCompressProps,
  ImageOutputType,
} from './types';

defineOptions({
  name: 'ExImageCompress',
});

const props = withDefaults(defineProps<ExImageCompressProps>(), {
  mode: 'quality',
  quality: 0.8,
  targetSize: 500,
  maxWidth: 1920,
  maxHeight: 1080,
  outputType: 'image/jpeg',
  keepAspectRatio: true,
  backgroundColor: '#ffffff',
  autoCompress: false,
  showPreview: true,
  showComparison: true,
});

const emit = defineEmits<ExImageCompressEmits>();
const { t } = useI18n();

const compressRef = ref<HTMLDivElement | null>(null);
const sourceResource = shallowRef<ImageCompressLoadedResource | null>(null);
const sourceError = shallowRef<Error | null>(null);
const result = shallowRef<CompressResult | null>(null);
const compressedUrl = ref('');
const isLoadingSource = ref(false);
const isCompressing = ref(false);

const initialOptions = normalizeCompressOptions(props);
const currentOutputType = ref<ImageOutputType>(initialOptions.outputType);
const currentMode = ref<CompressMode>(
  initialOptions.outputType === 'image/png' && initialOptions.mode === 'quality'
    ? 'dimension'
    : initialOptions.mode
);
const currentQuality = ref(initialOptions.quality);
const currentTargetSize = ref(props.targetSize);
const currentMaxWidth = ref(initialOptions.maxWidth);
const currentMaxHeight = ref(initialOptions.maxHeight);

const outputTypeOptions: SelectOption[] = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
];
const modeOptions = computed(() => [
  { value: 'quality' as const, label: t('imageCompress.qualityFirst') },
  { value: 'size' as const, label: t('imageCompress.sizeFirst') },
  { value: 'dimension' as const, label: t('imageCompress.dimensionFirst') },
]);
const isBusy = computed(() => isLoadingSource.value || isCompressing.value);

let sourceController: AbortController | null = null;
let compressionController: AbortController | null = null;
let sourceGeneration = 0;
let sourceLoadPromise: Promise<ImageCompressLoadedResource | null> | null = null;
let activeCompression: Promise<CompressResult> | null = null;
let isDisposed = false;

const asError = (error: unknown, fallback: string): Error =>
  error instanceof Error ? error : new Error(fallback);

const isAbortError = (error: Error): boolean =>
  error instanceof ExImageCompressError && error.code === 'ABORTED';

const clearCompressedResult = (): void => {
  if (compressedUrl.value) {
    URL.revokeObjectURL(compressedUrl.value);
    compressedUrl.value = '';
  }
  result.value = null;
};

const cancelCompression = (): void => {
  compressionController?.abort();
  compressionController = null;
  activeCompression = null;
  isCompressing.value = false;
};

const disposeSourceResource = (): void => {
  sourceResource.value?.dispose();
  sourceResource.value = null;
};

const startSourceLoad = (): void => {
  sourceGeneration += 1;
  const generation = sourceGeneration;
  sourceController?.abort();
  cancelCompression();
  disposeSourceResource();
  clearCompressedResult();
  sourceError.value = null;
  isLoadingSource.value = true;

  const controller = new AbortController();
  sourceController = controller;
  const task = (async (): Promise<ImageCompressLoadedResource | null> => {
    try {
      const resource = await loadImageResource(props.src, controller.signal);
      if (isDisposed || controller.signal.aborted || generation !== sourceGeneration) {
        resource.dispose();
        return null;
      }

      sourceResource.value = resource;
      emit('load', {
        originalSize: resource.originalSize,
        originalType: resource.originalType,
        originalDimension: { ...resource.originalDimension },
      });
      return resource;
    } catch (error) {
      const normalized = asError(error, t('imageCompress.loadError'));
      if (!isDisposed && generation === sourceGeneration && !isAbortError(normalized)) {
        sourceError.value = normalized;
        emit('error', normalized);
      }
      return null;
    } finally {
      if (generation === sourceGeneration) {
        isLoadingSource.value = false;
      }
    }
  })();

  sourceLoadPromise = task;
  if (props.autoCompress) {
    void task.then(resource => {
      if (!resource || generation !== sourceGeneration || isDisposed) return;
      void compress().catch(() => undefined);
    });
  }
};

const createCompressionOptions = (signal: AbortSignal) => ({
  mode: currentMode.value,
  quality: currentQuality.value,
  targetSize: currentTargetSize.value,
  maxWidth: currentMaxWidth.value,
  maxHeight: currentMaxHeight.value,
  outputType: currentOutputType.value,
  keepAspectRatio: props.keepAspectRatio,
  backgroundColor: props.backgroundColor,
  signal,
});

const runCompression = async (): Promise<CompressResult> => {
  const resource = sourceResource.value ?? (await sourceLoadPromise);
  if (!resource) {
    throw (
      sourceError.value ?? new ExImageCompressError('LOAD_FAILED', t('imageCompress.loadError'))
    );
  }

  const generation = sourceGeneration;
  const controller = new AbortController();
  compressionController = controller;
  isCompressing.value = true;
  emit('start');

  try {
    const compressed = await compressLoadedImage(
      resource,
      createCompressionOptions(controller.signal)
    );
    if (isDisposed || controller.signal.aborted || generation !== sourceGeneration) {
      throw new ExImageCompressError('ABORTED', '图片压缩已取消');
    }

    clearCompressedResult();
    result.value = compressed;
    compressedUrl.value = URL.createObjectURL(compressed.blob);
    emit('compress', compressed);
    return compressed;
  } catch (error) {
    const normalized = asError(error, t('imageCompress.compressError'));
    if (!isDisposed && !isAbortError(normalized)) emit('error', normalized);
    throw normalized;
  } finally {
    if (compressionController === controller) {
      compressionController = null;
      isCompressing.value = false;
    }
  }
};

const compress = (): Promise<CompressResult> => {
  if (activeCompression) return activeCompression;

  const task = runCompression();
  activeCompression = task;
  const clearTask = (): void => {
    if (activeCompression === task) activeCompression = null;
  };
  void task.then(clearTask, clearTask);
  return task;
};

const handleCompressClick = (): void => {
  void compress().catch(() => undefined);
};

const setMode = (mode: CompressMode): void => {
  if (mode === 'quality' && currentOutputType.value === 'image/png') return;
  currentMode.value = mode;
};

const isImageOutputType = (value: unknown): value is ImageOutputType =>
  value === 'image/jpeg' || value === 'image/png' || value === 'image/webp';

const handleOutputTypeChange = (value: SelectValue): void => {
  if (!isImageOutputType(value)) return;
  currentOutputType.value = value;
  if (value === 'image/png' && currentMode.value === 'quality') {
    currentMode.value = 'dimension';
  }
};

const restoreSettings = (): void => {
  const options = normalizeCompressOptions(props);
  currentOutputType.value = options.outputType;
  currentMode.value =
    options.outputType === 'image/png' && options.mode === 'quality' ? 'dimension' : options.mode;
  currentQuality.value = options.quality;
  currentTargetSize.value =
    Number.isFinite(props.targetSize) && props.targetSize > 0 ? props.targetSize : 500;
  currentMaxWidth.value = options.maxWidth;
  currentMaxHeight.value = options.maxHeight;
};

const reset = (): void => {
  cancelCompression();
  clearCompressedResult();
  restoreSettings();
};

const download = (filename?: string): void => {
  if (!result.value) return;
  downloadCompressedImage(result.value.blob, filename);
};

watch(
  () => props.src,
  () => startSourceLoad(),
  { immediate: true }
);
watch([() => props.mode, () => props.outputType], ([mode, outputType]) => {
  currentOutputType.value = outputType;
  currentMode.value = outputType === 'image/png' && mode === 'quality' ? 'dimension' : mode;
});
watch(
  () => props.quality,
  quality => {
    currentQuality.value = normalizeCompressOptions({ quality }).quality;
  }
);
watch(
  () => props.targetSize,
  targetSize => {
    currentTargetSize.value = Number.isFinite(targetSize) && targetSize > 0 ? targetSize : 500;
  }
);
watch(
  () => props.maxWidth,
  maxWidth => {
    currentMaxWidth.value = normalizeCompressOptions({ maxWidth }).maxWidth;
  }
);
watch(
  () => props.maxHeight,
  maxHeight => {
    currentMaxHeight.value = normalizeCompressOptions({ maxHeight }).maxHeight;
  }
);
watch(
  () => props.autoCompress,
  autoCompress => {
    if (autoCompress && sourceResource.value && !result.value) {
      void compress().catch(() => undefined);
    }
  }
);

onBeforeUnmount(() => {
  isDisposed = true;
  sourceGeneration += 1;
  sourceController?.abort();
  cancelCompression();
  disposeSourceResource();
  clearCompressedResult();
});

const getResult = (): CompressResult | null => result.value;
const getElement = (): HTMLDivElement | null => compressRef.value;

defineExpose<ExImageCompressExposed>({
  compress,
  download,
  getResult,
  reset,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExImageCompress.scss"></style>
