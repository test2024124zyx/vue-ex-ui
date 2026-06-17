<template>
  <div
    ref="cropRef"
    class="ex-image-crop"
  >
    <!-- 工具栏 -->
    <div
      v-if="showToolbar && toolbarPosition === 'top'"
      class="ex-image-crop__toolbar"
    >
      <div class="ex-image-crop__toolbar-group">
        <button
          v-if="zoomable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="zoomOut"
        >
          <ExIcon
            icon="zoom-out-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="zoomable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="zoomIn"
        >
          <ExIcon
            icon="zoom-in-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="rotateLeft"
        >
          <ExIcon
            icon="anticlockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="rotateRight"
        >
          <ExIcon
            icon="clockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          class="ex-image-crop__toolbar-btn"
          @click.stop="reset"
        >
          <ExIcon
            icon="refresh-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
      </div>
      <div class="ex-image-crop__toolbar-group">
        <ExButton
          size="small"
          @click.stop="handleCancel"
        >
          {{ t('imageCrop.cancel') }}
        </ExButton>
        <ExButton
          type="primary"
          size="small"
          @click.stop="handleCrop"
        >
          {{ t('imageCrop.confirmCrop') }}
        </ExButton>
      </div>
    </div>

    <!-- 裁剪区域 -->
    <div
      ref="containerRef"
      class="ex-image-crop__container"
      :style="{ backgroundColor }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <canvas
        ref="canvasRef"
        class="ex-image-crop__canvas"
        :style="canvasStyle"
      />

      <!-- 裁剪框 -->
      <div
        class="ex-image-crop__crop-box"
        :class="{ 'is-circle': shape === 'circle' }"
        :style="cropBoxStyle"
      >
        <!-- 网格 -->
        <div
          v-if="showGrid"
          class="ex-image-crop__grid"
        >
          <div
            v-for="i in gridRows - 1"
            :key="`row-${i}`"
            class="ex-image-crop__grid-line ex-image-crop__grid-line--horizontal"
            :style="{ top: `${(i / gridRows) * 100}%` }"
          />
          <div
            v-for="i in gridCols - 1"
            :key="`col-${i}`"
            class="ex-image-crop__grid-line ex-image-crop__grid-line--vertical"
            :style="{ left: `${(i / gridCols) * 100}%` }"
          />
        </div>

        <!-- 调整手柄 -->
        <div
          class="ex-image-crop__handle ex-image-crop__handle--nw"
          data-direction="nw"
        />
        <div
          class="ex-image-crop__handle ex-image-crop__handle--ne"
          data-direction="ne"
        />
        <div
          class="ex-image-crop__handle ex-image-crop__handle--sw"
          data-direction="sw"
        />
        <div
          class="ex-image-crop__handle ex-image-crop__handle--se"
          data-direction="se"
        />
        <div
          v-if="mode === 'free'"
          class="ex-image-crop__handle ex-image-crop__handle--n"
          data-direction="n"
        />
        <div
          v-if="mode === 'free'"
          class="ex-image-crop__handle ex-image-crop__handle--s"
          data-direction="s"
        />
        <div
          v-if="mode === 'free'"
          class="ex-image-crop__handle ex-image-crop__handle--w"
          data-direction="w"
        />
        <div
          v-if="mode === 'free'"
          class="ex-image-crop__handle ex-image-crop__handle--e"
          data-direction="e"
        />
      </div>

      <!-- 遮罩层 -->
      <svg
        class="ex-image-crop__mask"
        :style="{ pointerEvents: 'none' }"
      >
        <defs>
          <mask :id="maskId">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="white"
            />
            <rect
              v-if="shape === 'rect'"
              :x="cropArea.x"
              :y="cropArea.y"
              :width="cropArea.width"
              :height="cropArea.height"
              fill="black"
            />
            <circle
              v-else
              :cx="cropArea.x + cropArea.width / 2"
              :cy="cropArea.y + cropArea.height / 2"
              :r="cropArea.width / 2"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          :mask="`url(#${maskId})`"
        />
      </svg>
    </div>

    <!-- 底部工具栏 -->
    <div
      v-if="showToolbar && toolbarPosition === 'bottom'"
      class="ex-image-crop__toolbar"
    >
      <div class="ex-image-crop__toolbar-group">
        <button
          v-if="zoomable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="zoomOut"
        >
          <ExIcon
            icon="zoom-out-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="zoomable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="zoomIn"
        >
          <ExIcon
            icon="zoom-in-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="rotateLeft"
        >
          <ExIcon
            icon="anticlockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          class="ex-image-crop__toolbar-btn"
          @click.stop="rotateRight"
        >
          <ExIcon
            icon="clockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          class="ex-image-crop__toolbar-btn"
          @click.stop="reset"
        >
          <ExIcon
            icon="refresh-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
      </div>
      <div class="ex-image-crop__toolbar-group">
        <ExButton
          size="small"
          @click.stop="handleCancel"
        >
          {{ t('imageCrop.cancel') }}
        </ExButton>
        <ExButton
          type="primary"
          size="small"
          @click.stop="handleCrop"
        >
          {{ t('imageCrop.confirmCrop') }}
        </ExButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { generateId } from '../../utils/id';
import { useI18n } from '../../locale';
import type {
  ExImageCropProps,
  ExImageCropEmits,
  ExImageCropExposed,
  CropArea,
  CropResult,
} from './types';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExImageCrop',
});

const props = withDefaults(defineProps<ExImageCropProps>(), {
  shape: 'rect',
  mode: 'free',
  quality: 0.9,
  outputType: 'image/png',
  showGrid: true,
  gridRows: 3,
  gridCols: 3,
  zoomable: true,
  rotatable: true,
  zoomStep: 0.1,
  rotateStep: 90,
  minZoom: 0.1,
  maxZoom: 3,
  backgroundColor: '#000000',
  showToolbar: true,
  toolbarPosition: 'bottom',
  minWidth: 50,
  minHeight: 50,
});

const emit = defineEmits<ExImageCropEmits>();

const { t } = useI18n();

const cropRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
// SSR 环境无 Image 构造器，需守卫；该对象仅在客户端的加载/绘制逻辑中使用
const image = typeof Image !== 'undefined' ? new Image() : (null as unknown as HTMLImageElement);
const maskId = generateId('crop-mask');

const imageLoaded = ref(false);
const imageSize = ref({ width: 0, height: 0 });
const containerSize = ref({ width: 0, height: 0 });
const scale = ref(1);
const rotation = ref(0);
const cropArea = ref<CropArea>({
  x: 0,
  y: 0,
  width: 200,
  height: 200,
});

const isDragging = ref(false);
const isResizing = ref(false);
const resizeDirection = ref('');
const startPos = ref({ x: 0, y: 0 });
const startArea = ref<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

// 计算样式
const canvasStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)`,
}));

const cropBoxStyle = computed(() => ({
  left: `${cropArea.value.x}px`,
  top: `${cropArea.value.y}px`,
  width: `${cropArea.value.width}px`,
  height: `${cropArea.value.height}px`,
}));

// 加载图片
const loadImage = async () => {
  try {
    let url: string;
    if (typeof props.src === 'string') {
      url = props.src;
      // 设置 crossOrigin 以避免 canvas 被污染
      image.crossOrigin = 'anonymous';
    } else {
      url = URL.createObjectURL(props.src);
    }

    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    imageSize.value = { width: image.width, height: image.height };
    imageLoaded.value = true;
    emit('load', imageSize.value);

    await nextTick();
    drawImage();
    initCropArea();
  } catch (error) {
    emit('error', error as Error);
  }
};

// 绘制图片
const drawImage = () => {
  if (!canvasRef.value || !imageLoaded.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 设置canvas尺寸
  const container = containerRef.value;
  if (!container) return;

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  containerSize.value = { width: containerWidth, height: containerHeight };

  // 计算适应容器的尺寸
  const imageRatio = image.width / image.height;
  const containerRatio = containerWidth / containerHeight;

  let drawWidth, drawHeight;
  if (imageRatio > containerRatio) {
    drawWidth = containerWidth * 0.9;
    drawHeight = drawWidth / imageRatio;
  } else {
    drawHeight = containerHeight * 0.9;
    drawWidth = drawHeight * imageRatio;
  }

  canvas.width = drawWidth;
  canvas.height = drawHeight;

  ctx.clearRect(0, 0, drawWidth, drawHeight);
  ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
};

// 初始化裁剪区域
const initCropArea = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const canvasRect = canvas.getBoundingClientRect();
  const containerRect = containerRef.value?.getBoundingClientRect();
  if (!containerRect) return;

  const offsetX = canvasRect.left - containerRect.left;
  const offsetY = canvasRect.top - containerRect.top;

  if (props.initialArea) {
    cropArea.value = {
      x: props.initialArea.x ?? offsetX + canvasRect.width * 0.1,
      y: props.initialArea.y ?? offsetY + canvasRect.height * 0.1,
      width: props.initialArea.width ?? canvasRect.width * 0.8,
      height: props.initialArea.height ?? canvasRect.height * 0.8,
    };
  } else {
    const size = Math.min(canvasRect.width, canvasRect.height) * 0.8;
    cropArea.value = {
      x: offsetX + (canvasRect.width - size) / 2,
      y: offsetY + (canvasRect.height - size) / 2,
      width: size,
      height: props.aspectRatio ? size / props.aspectRatio : size,
    };
  }

  emit('change', cropArea.value);
};

// 鼠标/触摸事件处理
const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains('ex-image-crop__handle')) {
    isResizing.value = true;
    resizeDirection.value = target.dataset.direction || '';
    startPos.value = { x: e.clientX, y: e.clientY };
    startArea.value = { ...cropArea.value };
    e.preventDefault();
  } else if (
    target.classList.contains('ex-image-crop__crop-box') ||
    target.closest('.ex-image-crop__crop-box')
  ) {
    isDragging.value = true;
    startPos.value = { x: e.clientX, y: e.clientY };
    startArea.value = { ...cropArea.value };
    e.preventDefault();
  }
};

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  const target = e.target as HTMLElement;

  if (target.classList.contains('ex-image-crop__handle')) {
    isResizing.value = true;
    resizeDirection.value = target.dataset.direction || '';
    startPos.value = { x: touch.clientX, y: touch.clientY };
    startArea.value = { ...cropArea.value };
    e.preventDefault();
  } else if (
    target.classList.contains('ex-image-crop__crop-box') ||
    target.closest('.ex-image-crop__crop-box')
  ) {
    isDragging.value = true;
    startPos.value = { x: touch.clientX, y: touch.clientY };
    startArea.value = { ...cropArea.value };
    e.preventDefault();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const dx = e.clientX - startPos.value.x;
    const dy = e.clientY - startPos.value.y;

    const newX = Math.max(
      0,
      Math.min(startArea.value.x + dx, containerSize.value.width - cropArea.value.width)
    );
    const newY = Math.max(
      0,
      Math.min(startArea.value.y + dy, containerSize.value.height - cropArea.value.height)
    );

    cropArea.value.x = newX;
    cropArea.value.y = newY;
    emit('change', cropArea.value);
  } else if (isResizing.value) {
    handleResize(e.clientX, e.clientY);
  }
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  if (isDragging.value) {
    const dx = touch.clientX - startPos.value.x;
    const dy = touch.clientY - startPos.value.y;

    const newX = Math.max(
      0,
      Math.min(startArea.value.x + dx, containerSize.value.width - cropArea.value.width)
    );
    const newY = Math.max(
      0,
      Math.min(startArea.value.y + dy, containerSize.value.height - cropArea.value.height)
    );

    cropArea.value.x = newX;
    cropArea.value.y = newY;
    emit('change', cropArea.value);
  } else if (isResizing.value) {
    handleResize(touch.clientX, touch.clientY);
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  isResizing.value = false;
  resizeDirection.value = '';
};

// 调整大小
const handleResize = (clientX: number, clientY: number) => {
  const dx = clientX - startPos.value.x;
  const dy = clientY - startPos.value.y;
  const dir = resizeDirection.value;

  let newArea = { ...startArea.value };

  // 圆形裁剪：保持正圆
  if (props.shape === 'circle') {
    // 使用对角线方向的最大变化量
    const delta = Math.max(Math.abs(dx), Math.abs(dy));
    const sign = dx + dy > 0 ? 1 : -1;

    if (dir.includes('e') || dir.includes('s')) {
      newArea.width = startArea.value.width + delta * sign;
      newArea.height = newArea.width;
    } else if (dir.includes('w') || dir.includes('n')) {
      newArea.width = startArea.value.width - delta * sign;
      newArea.height = newArea.width;
      if (dir.includes('w')) {
        newArea.x = startArea.value.x + startArea.value.width - newArea.width;
      }
      if (dir.includes('n')) {
        newArea.y = startArea.value.y + startArea.value.height - newArea.height;
      }
    }
  }
  // 固定宽高比裁剪
  else if (props.aspectRatio) {
    // 根据拖动方向决定以哪个维度为准
    if (dir.includes('e') || dir.includes('w')) {
      // 水平方向拖动，以宽度为准
      if (dir.includes('w')) {
        newArea.x = startArea.value.x + dx;
        newArea.width = startArea.value.width - dx;
      } else {
        newArea.width = startArea.value.width + dx;
      }
      newArea.height = newArea.width / props.aspectRatio;

      // 调整y位置保持中心
      if (dir === 'e' || dir === 'w') {
        newArea.y = startArea.value.y + (startArea.value.height - newArea.height) / 2;
      } else if (dir.includes('n')) {
        newArea.y = startArea.value.y + startArea.value.height - newArea.height;
      }
    } else {
      // 垂直方向拖动，以高度为准
      if (dir.includes('n')) {
        newArea.y = startArea.value.y + dy;
        newArea.height = startArea.value.height - dy;
      } else {
        newArea.height = startArea.value.height + dy;
      }
      newArea.width = newArea.height * props.aspectRatio;

      // 调整x位置保持中心
      if (dir === 'n' || dir === 's') {
        newArea.x = startArea.value.x + (startArea.value.width - newArea.width) / 2;
      } else if (dir.includes('w')) {
        newArea.x = startArea.value.x + startArea.value.width - newArea.width;
      }
    }
  }
  // 自由裁剪
  else {
    if (dir.includes('n')) {
      newArea.y = startArea.value.y + dy;
      newArea.height = startArea.value.height - dy;
    }
    if (dir.includes('s')) {
      newArea.height = startArea.value.height + dy;
    }
    if (dir.includes('w')) {
      newArea.x = startArea.value.x + dx;
      newArea.width = startArea.value.width - dx;
    }
    if (dir.includes('e')) {
      newArea.width = startArea.value.width + dx;
    }
  }

  // 限制最小/最大尺寸
  newArea.width = Math.max(
    props.minWidth || 50,
    Math.min(newArea.width, props.maxWidth || containerSize.value.width)
  );
  newArea.height = Math.max(
    props.minHeight || 50,
    Math.min(newArea.height, props.maxHeight || containerSize.value.height)
  );

  // 圆形裁剪确保正圆（在限制尺寸后）
  if (props.shape === 'circle') {
    const size = Math.min(newArea.width, newArea.height);
    newArea.width = size;
    newArea.height = size;
  }
  // 固定宽高比确保比例（在限制尺寸后）
  else if (props.aspectRatio) {
    const currentRatio = newArea.width / newArea.height;
    if (Math.abs(currentRatio - props.aspectRatio) > 0.01) {
      // 重新计算以保持比例
      if (newArea.width > newArea.height * props.aspectRatio) {
        newArea.width = newArea.height * props.aspectRatio;
      } else {
        newArea.height = newArea.width / props.aspectRatio;
      }
    }
  }

  // 限制边界
  newArea.x = Math.max(0, Math.min(newArea.x, containerSize.value.width - newArea.width));
  newArea.y = Math.max(0, Math.min(newArea.y, containerSize.value.height - newArea.height));

  cropArea.value = newArea;
  emit('change', cropArea.value);
};

// 缩放和旋转
const zoomIn = () => {
  if (scale.value < props.maxZoom) {
    scale.value = Math.min(scale.value + props.zoomStep, props.maxZoom);
    emit('zoom', scale.value);
  }
};

const zoomOut = () => {
  if (scale.value > props.minZoom) {
    scale.value = Math.max(scale.value - props.zoomStep, props.minZoom);
    emit('zoom', scale.value);
  }
};

const rotateRight = () => {
  rotation.value = (rotation.value + props.rotateStep) % 360;
  emit('rotate', rotation.value);
};

const rotateLeft = () => {
  rotation.value = (rotation.value - props.rotateStep + 360) % 360;
  emit('rotate', rotation.value);
};

// 重置
const reset = () => {
  scale.value = 1;
  rotation.value = 0;
  initCropArea();
};

// 执行裁剪
const crop = async (): Promise<CropResult> => {
  const canvas = canvasRef.value;
  if (!canvas) throw new Error('Canvas not found');

  const canvasRect = canvas.getBoundingClientRect();
  const containerRect = containerRef.value?.getBoundingClientRect();
  if (!containerRect) throw new Error('Container not found');

  // 计算相对于canvas的裁剪区域
  const offsetX = canvasRect.left - containerRect.left;
  const offsetY = canvasRect.top - containerRect.top;

  const relativeArea = {
    x: (cropArea.value.x - offsetX) / scale.value,
    y: (cropArea.value.y - offsetY) / scale.value,
    width: cropArea.value.width / scale.value,
    height: cropArea.value.height / scale.value,
  };

  // 创建裁剪canvas
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = relativeArea.width;
  cropCanvas.height = relativeArea.height;
  const ctx = cropCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get context');

  // 绘制裁剪区域
  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;

  ctx.drawImage(
    canvas,
    relativeArea.x * scaleX,
    relativeArea.y * scaleY,
    relativeArea.width * scaleX,
    relativeArea.height * scaleY,
    0,
    0,
    relativeArea.width,
    relativeArea.height
  );

  // 如果是圆形，应用遮罩
  if (props.shape === 'circle') {
    const radius = relativeArea.width / 2;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 转换为Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    cropCanvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      props.outputType,
      props.quality
    );
  });

  const dataUrl = cropCanvas.toDataURL(props.outputType, props.quality);

  const result: CropResult = {
    blob,
    dataUrl,
    area: cropArea.value,
    originalSize: imageSize.value,
    croppedSize: {
      width: Math.round(relativeArea.width),
      height: Math.round(relativeArea.height),
    },
  };

  // console.log('裁剪结果生成:', result);
  return result;
};

const handleCrop = async () => {
  try {
    // console.log('开始裁剪...');
    const result = await crop();

    emit('crop', result);
  } catch (error) {
    emit('error', error as Error);
    if (import.meta.env.DEV) {
      console.error('裁剪失败:', error);
    }
  }
};

const handleCancel = () => {
  emit('cancel');
};

const setArea = (area: Partial<CropArea>) => {
  cropArea.value = { ...cropArea.value, ...area };
  emit('change', cropArea.value);
};

const getArea = () => cropArea.value;

// 监听src变化
watch(() => props.src, loadImage, { immediate: true });

// 监听窗口大小变化
const handleWindowResize = () => {
  drawImage();
  initCropArea();
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('touchmove', handleTouchMove);
  window.addEventListener('touchend', handleMouseUp);
  window.addEventListener('resize', handleWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleMouseUp);
  window.removeEventListener('resize', handleWindowResize);
});

const getElement = () => cropRef.value || null;

defineExpose<ExImageCropExposed>({
  crop,
  reset,
  zoomIn,
  zoomOut,
  rotateRight,
  rotateLeft,
  setArea,
  getArea,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExImageCrop.scss"></style>
