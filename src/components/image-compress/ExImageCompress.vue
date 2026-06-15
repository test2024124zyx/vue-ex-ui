<template>
  <div ref="compressRef" class="ex-image-compress">
    <!-- 预览区域 -->
    <div v-if="showPreview" class="ex-image-compress__preview">
      <div class="ex-image-compress__preview-item">
        <div class="ex-image-compress__preview-label">
          {{ t('imageCompress.original') }}
        </div>
        <div class="ex-image-compress__preview-image">
          <img v-if="originalUrl" :src="originalUrl" :alt="t('imageCompress.original')" />
          <div v-else class="ex-image-compress__preview-placeholder">
            <ExIcon icon="image-line" :size="48" aria-hidden="true" />
          </div>
        </div>
        <div v-if="originalSize" class="ex-image-compress__preview-info">
          <div>{{ formatBytes(originalSize) }}</div>
          <div>{{ originalDimension.width }} × {{ originalDimension.height }}</div>
        </div>
      </div>

      <div v-if="showComparison && compressedUrl" class="ex-image-compress__preview-arrow">
        <ExIcon icon="arrow-right-line" :size="32" aria-hidden="true" />
      </div>

      <div v-if="showComparison" class="ex-image-compress__preview-item">
        <div class="ex-image-compress__preview-label">
          {{ t('imageCompress.compressed') }}
        </div>
        <div class="ex-image-compress__preview-image">
          <img v-if="compressedUrl" :src="compressedUrl" :alt="t('imageCompress.compressed')" />
          <div v-else class="ex-image-compress__preview-placeholder">
            <ExIcon icon="image-line" :size="48" aria-hidden="true" />
          </div>
        </div>
        <div v-if="compressedSize" class="ex-image-compress__preview-info">
          <div class="ex-image-compress__preview-size">
            {{ formatBytes(compressedSize) }}
            <span class="ex-image-compress__preview-ratio">({{ compressionRatio }}%)</span>
          </div>
          <div>{{ compressedDimension.width }} × {{ compressedDimension.height }}</div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="ex-image-compress__controls">
      <div class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">{{ t('imageCompress.mode') }}</label>
        <div class="ex-image-compress__control-buttons">
          <ExButton
            :type="currentMode === 'quality' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'quality'"
          >
            {{ t('imageCompress.qualityFirst') }}
          </ExButton>
          <ExButton
            :type="currentMode === 'size' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'size'"
          >
            {{ t('imageCompress.sizeFirst') }}
          </ExButton>
          <ExButton
            :type="currentMode === 'dimension' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'dimension'"
          >
            {{ t('imageCompress.dimensionFirst') }}
          </ExButton>
        </div>
      </div>

      <div v-if="currentMode === 'quality'" class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">
          {{ t('imageCompress.compressQuality') }}: {{ Math.round(currentQuality * 100) }}%
        </label>
        <ExSlider v-model="currentQuality" :min="0.1" :max="1" :step="0.05" />
      </div>

      <div v-if="currentMode === 'size'" class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">{{ t('imageCompress.targetSize') }}</label>
        <ExNumberInput
          v-model="currentTargetSize"
          :min="10"
          :max="10240"
          :step="10"
          :placeholder="t('imageCompress.minValue', { value: 10 })"
        />
      </div>

      <div v-if="currentMode === 'dimension'" class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">{{ t('imageCompress.maxWidth') }}</label>
        <ExNumberInput
          v-model="currentMaxWidth"
          :min="100"
          :max="7680"
          :step="10"
          :placeholder="t('imageCompress.minValue', { value: 100 })"
        />
      </div>

      <div v-if="currentMode === 'dimension'" class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">{{ t('imageCompress.maxHeight') }}</label>
        <ExNumberInput
          v-model="currentMaxHeight"
          :min="100"
          :max="4320"
          :step="10"
          :placeholder="t('imageCompress.minValue', { value: 100 })"
        />
      </div>

      <div class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">
          {{ t('imageCompress.outputFormat') }}
        </label>
        <ExSelect v-model="currentOutputType" :options="outputTypeOptions" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="ex-image-compress__actions">
      <ExButton @click="handleReset">
        {{ t('imageCompress.reset') }}
      </ExButton>
      <ExButton type="primary" :loading="isCompressing" @click="handleCompress">
        {{ isCompressing ? t('imageCompress.compressing') : t('imageCompress.startCompress') }}
      </ExButton>
      <ExButton v-if="compressedBlob" type="success" @click="() => handleDownload()">
        <template #prefix>
          <ExIcon icon="download-2-line" :size="16" aria-hidden="true" />
        </template>
        {{ t('imageCompress.download') }}
      </ExButton>
    </div>

    <!-- 隐藏的canvas -->
    <canvas ref="canvasRef" style="display: none" />
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { ref, computed, watch } from 'vue';
import type {
  ExImageCompressProps,
  ExImageCompressEmits,
  ExImageCompressExposed,
  CompressResult,
  CompressMode,
} from './types';
import type { SelectOption } from '../select/types';
import ExButton from '../button/ExButton.vue';
import ExNumberInput from '../number-input/ExNumberInput.vue';
import ExSelect from '../select/ExSelect.vue';
import ExSlider from '../slider/ExSlider.vue';
import { useI18n } from '../../locale';
import { formatBytes } from './utils';

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
  autoCompress: false,
  showPreview: true,
  showComparison: true,
  algorithm: 'quality',
});

const emit = defineEmits<ExImageCompressEmits>();

const { t } = useI18n();

const compressRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
// SSR 环境无 Image 构造器，需守卫；该对象仅在客户端的加载/绘制逻辑中使用
const image = typeof Image !== 'undefined' ? new Image() : (null as unknown as HTMLImageElement);

const originalUrl = ref('');
const compressedUrl = ref('');
const compressedBlob = ref<Blob | null>(null);
const originalSize = ref(0);
const compressedSize = ref(0);
const originalDimension = ref({ width: 0, height: 0 });
const compressedDimension = ref({ width: 0, height: 0 });
const isCompressing = ref(false);
const result = ref<CompressResult | null>(null);

const currentMode = ref<CompressMode>(props.mode);
const currentQuality = ref(props.quality);
const currentTargetSize = ref(props.targetSize);
const currentMaxWidth = ref(props.maxWidth);
const currentMaxHeight = ref(props.maxHeight);
const currentOutputType = ref(props.outputType);

// NumberInput 组件已经内置了最小值/最大值验证，不需要额外的 watch

// 输出格式选项
const outputTypeOptions: SelectOption[] = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
];

const compressionRatio = computed(() => {
  if (!originalSize.value || !compressedSize.value) return 0;
  return Math.round((1 - compressedSize.value / originalSize.value) * 100);
});

// 加载图片
const loadImage = async () => {
  if (!props.src) return;

  try {
    let url: string;
    let size = 0;

    if (typeof props.src === 'string') {
      url = props.src;
      // 设置 crossOrigin 以避免 canvas 被污染
      image.crossOrigin = 'anonymous';
      // 获取文件大小
      const response = await fetch(url);
      const blob = await response.blob();
      size = blob.size;
    } else {
      url = URL.createObjectURL(props.src);
      size = props.src.size;
    }

    originalUrl.value = url;
    originalSize.value = size;

    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    originalDimension.value = { width: image.width, height: image.height };
    emit('load', originalDimension.value);

    if (props.autoCompress) {
      await handleCompress();
    }
  } catch (error) {
    emit('error', error as Error);
    if (import.meta.env.DEV) {
      console.error('加载图片失败:', error);
    }
  }
};

// 压缩图片
const compress = async (): Promise<CompressResult> => {
  if (!canvasRef.value) throw new Error('Canvas not found');
  if (!image.complete || !image.naturalWidth) {
    throw new Error('Image not loaded');
  }

  isCompressing.value = true;
  emit('start');

  try {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get context');

    let width = image.width;
    let height = image.height;

    // 根据模式调整尺寸
    if (currentMode.value === 'dimension') {
      if (width > currentMaxWidth.value || height > currentMaxHeight.value) {
        const ratio = Math.min(currentMaxWidth.value / width, currentMaxHeight.value / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
    }

    canvas.width = width;
    canvas.height = height;

    // 绘制图片
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    let quality = currentQuality.value;
    let blob: Blob | null = null;

    // 根据模式压缩
    if (currentMode.value === 'size') {
      // 二分查找最佳质量
      let minQuality = 0.1;
      let maxQuality = 1;
      const targetBytes = currentTargetSize.value * 1024;

      while (maxQuality - minQuality > 0.01) {
        quality = (minQuality + maxQuality) / 2;
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            b => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
            currentOutputType.value,
            quality
          );
        });

        if (blob.size > targetBytes) {
          maxQuality = quality;
        } else {
          minQuality = quality;
        }

        emit('progress', Math.round(((1 - (maxQuality - minQuality)) / 1) * 100));
      }
    } else {
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          b => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          currentOutputType.value,
          quality
        );
      });
    }

    if (!blob) throw new Error('Failed to create blob');

    const dataUrl = canvas.toDataURL(currentOutputType.value, quality);

    compressedBlob.value = blob;
    compressedUrl.value = dataUrl;
    compressedSize.value = blob.size;
    compressedDimension.value = { width, height };

    result.value = {
      blob,
      dataUrl,
      originalSize: originalSize.value,
      compressedSize: blob.size,
      compressionRatio: compressionRatio.value,
      originalDimension: originalDimension.value,
      compressedDimension: { width, height },
    };

    emit('progress', 100);
    emit('compress', result.value);

    return result.value;
  } finally {
    isCompressing.value = false;
  }
};

const handleCompress = async () => {
  try {
    await compress();
  } catch (error) {
    emit('error', error as Error);
  }
};

const handleDownload = (filename?: string) => {
  if (!compressedBlob.value) return;

  const url = URL.createObjectURL(compressedBlob.value);
  const link = document.createElement('a');
  link.href = url;

  // 使用提供的文件名或生成默认文件名
  const extension = currentOutputType.value.split('/')[1];
  link.download = filename || `compressed-${Date.now()}.${extension}`;

  link.click();
  URL.revokeObjectURL(url);
};

const handleReset = () => {
  compressedUrl.value = '';
  compressedBlob.value = null;
  compressedSize.value = 0;
  compressedDimension.value = { width: 0, height: 0 };
  result.value = null;
  currentQuality.value = props.quality;
  currentTargetSize.value = props.targetSize;
  currentMaxWidth.value = props.maxWidth;
  currentMaxHeight.value = props.maxHeight;
  currentOutputType.value = props.outputType;
};

const getResult = () => result.value;

// 监听 src 变化
watch(
  () => props.src,
  () => {
    if (props.src) {
      loadImage();
    }
  },
  { immediate: true }
);

const getElement = () => compressRef.value || null;

defineExpose<ExImageCompressExposed>({
  compress,
  download: handleDownload,
  getResult,
  reset: handleReset,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExImageCompress.scss"></style>
