<template>
  <div
    ref="compressRef"
    class="ex-image-compress"
  >
    <!-- 预览区域 -->
    <div
      v-if="showPreview"
      class="ex-image-compress__preview"
    >
      <div class="ex-image-compress__preview-item">
        <div class="ex-image-compress__preview-label">
          原图
        </div>
        <div class="ex-image-compress__preview-image">
          <img
            v-if="originalUrl"
            :src="originalUrl"
            alt="原图"
          >
          <div
            v-else
            class="ex-image-compress__preview-placeholder"
          >
            <img
              src="https://api.iconify.design/ri/image-line.svg"
              alt="占位"
              width="48"
              height="48"
            >
          </div>
        </div>
        <div
          v-if="originalSize"
          class="ex-image-compress__preview-info"
        >
          <div>{{ formatBytes(originalSize) }}</div>
          <div>{{ originalDimension.width }} × {{ originalDimension.height }}</div>
        </div>
      </div>

      <div
        v-if="showComparison && compressedUrl"
        class="ex-image-compress__preview-arrow"
      >
        <img
          src="https://api.iconify.design/ri/arrow-right-line.svg"
          alt="箭头"
          width="32"
          height="32"
        >
      </div>

      <div
        v-if="showComparison"
        class="ex-image-compress__preview-item"
      >
        <div class="ex-image-compress__preview-label">
          压缩后
        </div>
        <div class="ex-image-compress__preview-image">
          <img
            v-if="compressedUrl"
            :src="compressedUrl"
            alt="压缩后"
          >
          <div
            v-else
            class="ex-image-compress__preview-placeholder"
          >
            <img
              src="https://api.iconify.design/ri/image-line.svg"
              alt="占位"
              width="48"
              height="48"
            >
          </div>
        </div>
        <div
          v-if="compressedSize"
          class="ex-image-compress__preview-info"
        >
          <div class="ex-image-compress__preview-size">
            {{ formatBytes(compressedSize) }}
            <span class="ex-image-compress__preview-ratio">
              ({{ compressionRatio }}%)
            </span>
          </div>
          <div>{{ compressedDimension.width }} × {{ compressedDimension.height }}</div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="ex-image-compress__controls">
      <div class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">压缩模式</label>
        <div class="ex-image-compress__control-buttons">
          <ExButton
            :type="currentMode === 'quality' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'quality'"
          >
            质量优先
          </ExButton>
          <ExButton
            :type="currentMode === 'size' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'size'"
          >
            大小优先
          </ExButton>
          <ExButton
            :type="currentMode === 'dimension' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'dimension'"
          >
            尺寸优先
          </ExButton>
        </div>
      </div>

      <div
        v-if="currentMode === 'quality'"
        class="ex-image-compress__control-group"
      >
        <label class="ex-image-compress__control-label">
          压缩质量: {{ Math.round(currentQuality * 100) }}%
        </label>
        <ExSlider
          v-model="currentQuality"
          :min="0.1"
          :max="1"
          :step="0.05"
        />
      </div>

      <div
        v-if="currentMode === 'size'"
        class="ex-image-compress__control-group"
      >
        <label class="ex-image-compress__control-label">目标大小 (KB)</label>
        <ExNumberInput
          v-model="currentTargetSize"
          :min="10"
          :max="10240"
          :step="10"
          placeholder="最小 10"
        />
      </div>

      <div
        v-if="currentMode === 'dimension'"
        class="ex-image-compress__control-group"
      >
        <label class="ex-image-compress__control-label">最大宽度 (px)</label>
        <ExNumberInput
          v-model="currentMaxWidth"
          :min="100"
          :max="7680"
          :step="10"
          placeholder="最小 100"
        />
      </div>

      <div
        v-if="currentMode === 'dimension'"
        class="ex-image-compress__control-group"
      >
        <label class="ex-image-compress__control-label">最大高度 (px)</label>
        <ExNumberInput
          v-model="currentMaxHeight"
          :min="100"
          :max="4320"
          :step="10"
          placeholder="最小 100"
        />
      </div>

      <div class="ex-image-compress__control-group">
        <label class="ex-image-compress__control-label">输出格式</label>
        <ExSelect
          v-model="currentOutputType"
          :options="outputTypeOptions"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="ex-image-compress__actions">
      <ExButton @click="handleReset">
        重置
      </ExButton>
      <ExButton
        type="primary"
        :loading="isCompressing"
        @click="handleCompress"
      >
        {{ isCompressing ? '压缩中...' : '开始压缩' }}
      </ExButton>
      <ExButton
        v-if="compressedBlob"
        type="success"
        @click="() => handleDownload()"
      >
        <template #prefix>
          <img
            src="https://api.iconify.design/ri/download-2-line.svg"
            alt="下载"
            width="16"
            height="16"
          >
        </template>
        下载
      </ExButton>
    </div>

    <!-- 隐藏的canvas -->
    <canvas
      ref="canvasRef"
      style="display: none;"
    />
  </div>
</template>

<script setup lang="ts">
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

const compressRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const image = new Image();

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
        const ratio = Math.min(
          currentMaxWidth.value / width,
          currentMaxHeight.value / height
        );
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
            (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
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
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
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
watch(() => props.src, () => {
  if (props.src) {
    loadImage();
  }
}, { immediate: true });

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
