<template>
  <Teleport to="body">
    <Transition name="ex-preview-fade">
      <div v-if="visible" ref="previewRef" class="ex-file-preview" @click="handleMaskClick">
        <!-- 遮罩层 -->
        <div class="ex-file-preview__mask" :style="{ background: maskBackground }" />

        <!-- 工具栏 -->
        <div v-if="showToolbar" class="ex-file-preview__toolbar">
          <div class="ex-file-preview__toolbar-left">
            <span class="ex-file-preview__filename">
              {{ currentFile.name || t('filePreview.preview') }}
            </span>
          </div>
          <div class="ex-file-preview__toolbar-actions">
            <template v-if="currentType === 'image' && zoomable">
              <button class="ex-file-preview__toolbar-btn" @click.stop="zoomOut">
                <ExIcon icon="zoom-out-line" :size="20" aria-hidden="true" />
              </button>
              <span class="ex-file-preview__toolbar-scale">
                {{ Math.round(currentScale * 100) }}%
              </span>
              <button class="ex-file-preview__toolbar-btn" @click.stop="zoomIn">
                <ExIcon icon="zoom-in-line" :size="20" aria-hidden="true" />
              </button>
              <button class="ex-file-preview__toolbar-btn" @click.stop="resetZoom">
                <ExIcon icon="aspect-ratio-line" :size="20" aria-hidden="true" />
              </button>
            </template>
            <template v-if="currentType === 'image' && rotatable">
              <button class="ex-file-preview__toolbar-btn" @click.stop="rotateLeft">
                <ExIcon icon="anticlockwise-line" :size="20" aria-hidden="true" />
              </button>
              <button class="ex-file-preview__toolbar-btn" @click.stop="rotateRight">
                <ExIcon icon="clockwise-line" :size="20" aria-hidden="true" />
              </button>
            </template>
            <button
              v-if="showDownload"
              class="ex-file-preview__toolbar-btn"
              @click.stop="handleDownload"
            >
              <ExIcon icon="download-2-line" :size="20" aria-hidden="true" />
            </button>
            <button v-if="showClose" class="ex-file-preview__toolbar-btn" @click.stop="handleClose">
              <ExIcon icon="close-line" :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="ex-file-preview__content" @click.stop>
          <!-- 上一个/下一个按钮 -->
          <button
            v-if="fileList.length > 1 && currentIndex > 0"
            class="ex-file-preview__nav ex-file-preview__nav--prev"
            @click.stop="handlePrev"
          >
            <ExIcon icon="arrow-left-s-line" :size="32" aria-hidden="true" />
          </button>
          <button
            v-if="fileList.length > 1 && currentIndex < fileList.length - 1"
            class="ex-file-preview__nav ex-file-preview__nav--next"
            @click.stop="handleNext"
          >
            <ExIcon icon="arrow-right-s-line" :size="32" aria-hidden="true" />
          </button>

          <!-- 图片预览 -->
          <div
            v-if="currentType === 'image'"
            class="ex-file-preview__image-wrapper"
            @wheel.prevent="handleWheel"
          >
            <img
              :src="currentFile.url"
              :alt="currentFile.name"
              class="ex-file-preview__image"
              :style="imageStyle"
              @load="handleLoad"
              @error="handleError"
            />
          </div>

          <!-- 视频预览 -->
          <video
            v-else-if="currentType === 'video'"
            :src="currentFile.url"
            class="ex-file-preview__video"
            controls
            @loadeddata="handleLoad"
            @error="handleError"
          />

          <!-- 音频预览 -->
          <audio
            v-else-if="currentType === 'audio'"
            :src="currentFile.url"
            class="ex-file-preview__audio"
            controls
            @loadeddata="handleLoad"
            @error="handleError"
          />

          <!-- PDF预览 -->
          <iframe
            v-else-if="currentType === 'pdf'"
            :src="currentFile.url"
            class="ex-file-preview__pdf"
            @load="handleLoad"
            @error="handleError"
          />

          <!-- 文本/代码预览 -->
          <div
            v-else-if="currentType === 'text' || currentType === 'code'"
            class="ex-file-preview__text"
          >
            <pre
              v-if="textContent"
              :class="{ 'show-line-numbers': showLineNumbers }"
            ><code>{{ textContent }}</code></pre>
            <div v-else class="ex-file-preview__loading">
              {{ t('filePreview.loading') }}
            </div>
          </div>

          <!-- 不支持的类型 -->
          <div v-else class="ex-file-preview__unsupported">
            <ExIcon icon="file-unknow-line" :size="64" aria-hidden="true" />
            <p>{{ t('filePreview.unsupported') }}</p>
            <ExButton v-if="showDownload" type="primary" @click="handleDownload">
              {{ t('filePreview.downloadFile') }}
            </ExButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type {
  ExFilePreviewProps,
  ExFilePreviewEmits,
  ExFilePreviewExposed,
  PreviewFile,
  PreviewType,
} from './types';
import ExButton from '../button/ExButton.vue';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExFilePreview',
});

const props = withDefaults(defineProps<ExFilePreviewProps>(), {
  visible: false,
  initialIndex: 0,
  showToolbar: true,
  showDownload: true,
  showClose: true,
  scale: 1,
  rotate: 0,
  zoomable: true,
  rotatable: true,
  minScale: 0.1,
  maxScale: 5,
  scaleStep: 0.1,
  rotateStep: 90,
  maskBackground: 'rgba(0, 0, 0, 0.9)',
  maskClosable: true,
  showLineNumbers: true,
});

const emit = defineEmits<ExFilePreviewEmits>();

const { t } = useI18n();

const previewRef = ref<HTMLDivElement>();
const currentScale = ref(props.scale);
const currentRotate = ref(props.rotate);
const textContent = ref('');
const currentIndex = ref(props.initialIndex);

// 文件列表
const fileList = computed<PreviewFile[]>(() => {
  if (props.files && props.files.length > 0) {
    return props.files.map(f => (typeof f === 'string' ? { url: f } : f));
  }
  if (props.file) {
    const file = typeof props.file === 'string' ? { url: props.file } : props.file;
    return [file];
  }
  return [];
});

// 当前文件对象
const currentFile = computed<PreviewFile>(() => {
  if (fileList.value.length === 0) {
    return { url: '' };
  }
  // 确保返回值不为 undefined
  return fileList.value[currentIndex.value] || fileList.value[0] || { url: '' };
});

// 检测文件类型
const currentType = computed<PreviewType>(() => {
  if (props.type) return props.type;

  const url = currentFile.value.url;
  const mimeType = currentFile.value.mimeType;

  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
  }

  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'vue'].includes(ext || ''))
    return 'code';

  return 'unknown';
});

// 图片样式
const imageStyle = computed(() => ({
  transform: `scale(${currentScale.value}) rotate(${currentRotate.value}deg)`,
  transition: 'transform 0.3s ease',
}));

// 监听可见性
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      document.body.style.overflow = 'hidden';
      if (currentType.value === 'text' || currentType.value === 'code') {
        loadTextContent();
      }
    } else {
      document.body.style.overflow = '';
    }
  }
);

// 加载文本内容
const loadTextContent = async () => {
  try {
    const response = await fetch(currentFile.value.url);
    textContent.value = await response.text();
  } catch (error) {
    handleError(error as Error);
  }
};

// 缩放
const zoomIn = () => {
  if (currentScale.value < props.maxScale) {
    currentScale.value = Math.min(currentScale.value + props.scaleStep, props.maxScale);
    emit('update:scale', currentScale.value);
  }
};

const zoomOut = () => {
  if (currentScale.value > props.minScale) {
    currentScale.value = Math.max(currentScale.value - props.scaleStep, props.minScale);
    emit('update:scale', currentScale.value);
  }
};

const resetZoom = () => {
  currentScale.value = 1;
  emit('update:scale', currentScale.value);
};

// 旋转
const rotateRight = () => {
  currentRotate.value = (currentRotate.value + props.rotateStep) % 360;
  emit('update:rotate', currentRotate.value);
};

const rotateLeft = () => {
  currentRotate.value = (currentRotate.value - props.rotateStep + 360) % 360;
  emit('update:rotate', currentRotate.value);
};

// 切换文件
const handlePrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetZoom();
    resetRotate();
  }
};

const handleNext = () => {
  if (currentIndex.value < fileList.value.length - 1) {
    currentIndex.value++;
    resetZoom();
    resetRotate();
  }
};

const resetRotate = () => {
  currentRotate.value = 0;
  emit('update:rotate', currentRotate.value);
};

// 鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (!props.zoomable) return;
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 遮罩点击
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose();
  }
};

// 关闭
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

// 下载
const handleDownload = () => {
  emit('download', currentFile.value);
  const link = document.createElement('a');
  link.href = currentFile.value.url;
  link.download = currentFile.value.name || 'download';
  link.click();
};

// 加载完成
const handleLoad = () => {
  emit('load');
};

// 加载失败
const handleError = (error: Event | Error) => {
  const err = error instanceof Error ? error : new Error('Load failed');
  emit('error', err);
};

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return;

  switch (e.key) {
    case 'Escape':
      if (props.maskClosable) handleClose();
      break;
    case '+':
    case '=':
      if (props.zoomable) zoomIn();
      break;
    case '-':
      if (props.zoomable) zoomOut();
      break;
    case '0':
      if (props.zoomable) resetZoom();
      break;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

const getElement = () => previewRef.value || null;

defineExpose<ExFilePreviewExposed>({
  zoomIn,
  zoomOut,
  resetZoom,
  rotateRight,
  rotateLeft,
  resetRotate,
  download: handleDownload,
  close: handleClose,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExFilePreview.scss"></style>
