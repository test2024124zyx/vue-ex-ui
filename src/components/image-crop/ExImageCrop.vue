<template>
  <div
    ref="cropRef"
    class="ex-image-crop"
    role="region"
    :aria-label="resolvedAriaLabel"
    :aria-busy="isBusy"
  >
    <div
      v-if="showToolbar"
      class="ex-image-crop__toolbar"
      :class="`ex-image-crop__toolbar--${toolbarPosition}`"
      role="toolbar"
      :aria-label="t('toolbar')"
    >
      <div class="ex-image-crop__toolbar-group">
        <button
          v-if="zoomable"
          type="button"
          class="ex-image-crop__toolbar-button"
          :aria-label="t('zoomOut')"
          :title="t('zoomOut')"
          :disabled="!isReady || isCropping || zoom <= minZoom"
          @click="zoomOut"
        >
          <ExIcon
            icon="zoom-out-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="zoomable"
          type="button"
          class="ex-image-crop__toolbar-button"
          :aria-label="t('zoomIn')"
          :title="t('zoomIn')"
          :disabled="!isReady || isCropping || zoom >= maxZoom"
          @click="zoomIn"
        >
          <ExIcon
            icon="zoom-in-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          type="button"
          class="ex-image-crop__toolbar-button"
          :aria-label="t('rotateLeft')"
          :title="t('rotateLeft')"
          :disabled="!isReady || isCropping"
          @click="rotateLeft"
        >
          <ExIcon
            icon="anticlockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          v-if="rotatable"
          type="button"
          class="ex-image-crop__toolbar-button"
          :aria-label="t('rotateRight')"
          :title="t('rotateRight')"
          :disabled="!isReady || isCropping"
          @click="rotateRight"
        >
          <ExIcon
            icon="clockwise-line"
            :size="18"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="ex-image-crop__toolbar-button"
          :aria-label="t('reset')"
          :title="t('reset')"
          :disabled="!isReady || isCropping"
          @click="reset"
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
          data-action="cancel"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ t('cancel') }}
        </ExButton>
        <ExButton
          type="primary"
          size="small"
          data-action="crop"
          :loading="isCropping"
          :disabled="!isReady"
          @click="handleCrop"
        >
          {{ t('confirmCrop') }}
        </ExButton>
      </div>
    </div>

    <div
      ref="containerRef"
      class="ex-image-crop__container"
      :style="{ backgroundColor }"
      @pointermove="handlePointerMove"
      @pointerup="endPointerInteraction"
      @pointercancel="endPointerInteraction"
    >
      <canvas
        ref="canvasRef"
        class="ex-image-crop__canvas"
        aria-hidden="true"
      ></canvas>

      <div
        v-if="isLoading"
        class="ex-image-crop__status"
        role="status"
      >
        {{ t('sourceLoading') }}
      </div>
      <div
        v-else-if="displayError"
        class="ex-image-crop__status is-error"
        role="alert"
      >
        {{ displayError }}
      </div>

      <template v-if="isReady">
        <svg
          class="ex-image-crop__mask"
          width="100%"
          height="100%"
          aria-hidden="true"
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
            fill="rgba(0, 0, 0, 0.62)"
            :mask="`url(#${maskId})`"
          />
        </svg>

        <div
          class="ex-image-crop__crop-box"
          :class="{ 'is-circle': shape === 'circle', 'is-interacting': Boolean(interaction) }"
          :style="cropBoxStyle"
          role="group"
          tabindex="0"
          :aria-label="t('cropArea')"
          @pointerdown="startDrag"
          @keydown="handleCropBoxKeydown"
        >
          <div
            v-if="showGrid"
            class="ex-image-crop__grid"
            :style="{ '--ex-crop-grid-rows': gridRows, '--ex-crop-grid-cols': gridCols }"
            aria-hidden="true"
          ></div>

          <button
            v-for="direction in handleDirections"
            :key="direction"
            type="button"
            class="ex-image-crop__handle"
            :class="`ex-image-crop__handle--${direction}`"
            :data-direction="direction"
            :aria-label="handleLabel(direction)"
            :title="handleLabel(direction)"
            @pointerdown.stop="startResize($event, direction)"
            @keydown.stop="handleResizeKeydown($event, direction)"
          ></button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import {
  loadBrowserImageResource,
  type LoadedBrowserImageResource,
} from '../../utils/image-resource';
import { ExImageCropError, toImageCropError } from './errors';
import {
  createImageLayout,
  createInitialCropArea,
  moveCropArea,
  normalizeCropArea,
  normalizeQuarterTurn,
  reprojectCropArea,
  resizeCropArea,
  type CropConstraints,
  type CropResizeDirection,
  type ImageCropLayout,
} from './geometry';
import { drawCropPreview, renderCrop, validateCropConfiguration } from './utils';
import type {
  CropArea,
  CropResult,
  CropRotation,
  CropSize,
  ExImageCropEmits,
  ExImageCropExposed,
  ExImageCropProps,
} from './types';

defineOptions({ name: 'ExImageCrop' });

const props = withDefaults(defineProps<ExImageCropProps>(), {
  shape: 'rect',
  quality: 0.9,
  outputType: 'image/png',
  outputBackgroundColor: '#ffffff',
  showGrid: true,
  gridRows: 3,
  gridCols: 3,
  zoomable: true,
  rotatable: true,
  zoomStep: 0.1,
  minZoom: 0.5,
  maxZoom: 4,
  minWidth: 48,
  minHeight: 48,
  backgroundColor: '#111827',
  showToolbar: true,
  toolbarPosition: 'bottom',
  ariaLabel: '',
});

const emit = defineEmits<ExImageCropEmits>();
const { t } = useLocale('imageCrop');

const cropRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const maskId = generateId('image-crop-mask');
const resource = ref<LoadedBrowserImageResource | null>(null);
const containerSize = ref<CropSize>({ width: 0, height: 0 });
const layout = ref<ImageCropLayout | null>(null);
const cropArea = ref<CropArea>({ x: 0, y: 0, width: 1, height: 1 });
const zoom = ref(1);
const rotation = ref<CropRotation>(0);
const isLoading = ref(false);
const isCropping = ref(false);
const displayError = ref('');
const configurationValid = ref(true);

interface PointerInteraction {
  pointerId: number;
  kind: 'drag' | 'resize';
  direction?: CropResizeDirection;
  startX: number;
  startY: number;
  startArea: CropArea;
}

const interaction = ref<PointerInteraction | null>(null);
let resizeObserver: ResizeObserver | null = null;
let loadController: AbortController | null = null;
let cropController: AbortController | null = null;
let cropPromise: Promise<CropResult> | null = null;
let cropOperationToken: symbol | null = null;
let loadGeneration = 0;

const resolvedAriaLabel = computed(() => props.ariaLabel.trim() || t('editor'));
const isReady = computed(() =>
  Boolean(resource.value && layout.value && configurationValid.value && !isLoading.value)
);
const isBusy = computed(() => isLoading.value || isCropping.value);
const effectiveAspectRatio = computed(() => (props.shape === 'circle' ? 1 : props.aspectRatio));
const handleDirections = computed<CropResizeDirection[]>(() =>
  effectiveAspectRatio.value
    ? ['nw', 'ne', 'sw', 'se']
    : ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e']
);
const cropBoxStyle = computed(() => ({
  left: cropArea.value.x + 'px',
  top: cropArea.value.y + 'px',
  width: cropArea.value.width + 'px',
  height: cropArea.value.height + 'px',
}));

const handleNames: Record<CropResizeDirection, string> = {
  n: 'resizeNorth',
  s: 'resizeSouth',
  e: 'resizeEast',
  w: 'resizeWest',
  nw: 'resizeNorthwest',
  ne: 'resizeNortheast',
  sw: 'resizeSouthwest',
  se: 'resizeSoutheast',
};
const handleLabel = (direction: CropResizeDirection): string => t(handleNames[direction]);

const cloneArea = (area: CropArea): CropArea => ({ ...area });

const currentConstraints = (): CropConstraints => ({
  minWidth: props.minWidth,
  minHeight: props.minHeight,
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
  aspectRatio: effectiveAspectRatio.value,
});

const validateConfiguration = (): void => {
  validateCropConfiguration({
    quality: props.quality,
    outputType: props.outputType,
    zoomStep: props.zoomStep,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    aspectRatio: props.aspectRatio,
    gridRows: props.gridRows,
    gridCols: props.gridCols,
  });
};

const reportError = (
  error: unknown,
  fallbackCode: 'LOAD_FAILED' | 'INVALID_CONFIGURATION' | 'ENCODE_FAILED'
): ExImageCropError => {
  const normalized = toImageCropError(error, fallbackCode, '图片裁剪失败');
  displayError.value = normalized.message;
  emit('error', normalized);
  return normalized;
};

const visibleImageBounds = (currentLayout: ImageCropLayout): CropArea => {
  const bounds = currentLayout.imageBounds;
  const left = Math.max(0, bounds.x);
  const top = Math.max(0, bounds.y);
  const right = Math.min(containerSize.value.width, bounds.x + bounds.width);
  const bottom = Math.min(containerSize.value.height, bounds.y + bounds.height);
  if (right <= left || bottom <= top) {
    throw new ExImageCropError('INVALID_AREA', '当前缩放下图片没有可裁剪区域');
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
};

const emitAreaChange = (): void => emit('change', cloneArea(cropArea.value));

const drawPreview = (): void => {
  if (!canvasRef.value || !resource.value || !layout.value) return;
  const pixelRatio =
    typeof window === 'undefined' ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  drawCropPreview(
    canvasRef.value,
    resource.value.image,
    containerSize.value,
    layout.value,
    pixelRatio
  );
};

const initializeArea = (): void => {
  if (!layout.value) return;
  cropArea.value = createInitialCropArea(
    visibleImageBounds(layout.value),
    props.initialArea,
    currentConstraints()
  );
  emitAreaChange();
};

const rebuildLayout = (mode: 'initialize' | 'preserve-source' | 'keep-preview'): void => {
  if (!resource.value || containerSize.value.width <= 0 || containerSize.value.height <= 0) {
    return;
  }

  const previous = layout.value;
  const next = createImageLayout(
    resource.value.dimension,
    containerSize.value,
    rotation.value,
    zoom.value
  );
  layout.value = next;
  drawPreview();

  if (!previous || mode === 'initialize') {
    initializeArea();
    return;
  }

  try {
    const nextArea =
      mode === 'preserve-source'
        ? reprojectCropArea(cropArea.value, previous, next, currentConstraints())
        : cropArea.value;
    cropArea.value = normalizeCropArea(nextArea, visibleImageBounds(next), currentConstraints());
    emitAreaChange();
  } catch {
    initializeArea();
  }
};

const releaseResource = (): void => {
  resource.value?.dispose();
  resource.value = null;
  layout.value = null;
};

const cancelCropOperation = (): void => {
  cropController?.abort();
  cropController = null;
  cropPromise = null;
  cropOperationToken = null;
  isCropping.value = false;
};

const loadSource = async (): Promise<void> => {
  const generation = ++loadGeneration;
  loadController?.abort();
  loadController = new AbortController();
  const controller = loadController;
  cancelCropOperation();
  releaseResource();
  interaction.value = null;
  displayError.value = '';
  configurationValid.value = true;
  isLoading.value = true;
  zoom.value = Math.min(props.maxZoom, Math.max(props.minZoom, 1));
  rotation.value = 0;

  try {
    validateConfiguration();
    const loaded = await loadBrowserImageResource(props.src, controller.signal);
    if (generation !== loadGeneration || controller.signal.aborted) {
      loaded.dispose();
      return;
    }

    resource.value = loaded;
    emit('load', { ...loaded.dimension });
    await nextTick();
    rebuildLayout('initialize');
  } catch (error) {
    if (generation !== loadGeneration || controller.signal.aborted) return;
    releaseResource();
    configurationValid.value =
      !(error instanceof ExImageCropError) || error.code !== 'INVALID_CONFIGURATION';
    reportError(error, configurationValid.value ? 'LOAD_FAILED' : 'INVALID_CONFIGURATION');
  } finally {
    if (generation === loadGeneration) isLoading.value = false;
  }
};

const updateZoom = (nextZoom: number): void => {
  if (!isReady.value) return;
  const normalized = Math.min(props.maxZoom, Math.max(props.minZoom, nextZoom));
  if (normalized === zoom.value) return;
  zoom.value = normalized;
  rebuildLayout('keep-preview');
  emit('zoom', zoom.value);
};

const zoomIn = (): void => updateZoom(zoom.value + props.zoomStep);
const zoomOut = (): void => updateZoom(zoom.value - props.zoomStep);

const updateRotation = (angle: number): void => {
  if (!isReady.value) return;
  rotation.value = normalizeQuarterTurn(angle);
  rebuildLayout('keep-preview');
  emit('rotate', rotation.value);
};

const rotateRight = (): void => updateRotation(rotation.value + 90);
const rotateLeft = (): void => updateRotation(rotation.value - 90);

const reset = (): void => {
  if (!resource.value) return;
  const initialZoom = Math.min(props.maxZoom, Math.max(props.minZoom, 1));
  const zoomChanged = zoom.value !== initialZoom;
  const rotationChanged = rotation.value !== 0;
  zoom.value = initialZoom;
  rotation.value = 0;
  displayError.value = '';
  rebuildLayout('initialize');
  if (zoomChanged) emit('zoom', zoom.value);
  if (rotationChanged) emit('rotate', rotation.value);
};

const applyArea = (area: CropArea): void => {
  cropArea.value = area;
  emitAreaChange();
};

const startInteraction = (
  event: PointerEvent,
  kind: PointerInteraction['kind'],
  direction?: CropResizeDirection
): void => {
  if (!isReady.value || isCropping.value || event.button !== 0) return;
  interaction.value = {
    pointerId: event.pointerId,
    kind,
    direction,
    startX: event.clientX,
    startY: event.clientY,
    startArea: cloneArea(cropArea.value),
  };
  containerRef.value?.setPointerCapture?.(event.pointerId);
  event.preventDefault();
};

const startDrag = (event: PointerEvent): void => startInteraction(event, 'drag');
const startResize = (event: PointerEvent, direction: CropResizeDirection): void =>
  startInteraction(event, 'resize', direction);

const handlePointerMove = (event: PointerEvent): void => {
  const current = interaction.value;
  if (!current || current.pointerId !== event.pointerId || !layout.value) return;
  const dx = event.clientX - current.startX;
  const dy = event.clientY - current.startY;
  const bounds = visibleImageBounds(layout.value);
  const next =
    current.kind === 'drag'
      ? moveCropArea(current.startArea, dx, dy, bounds)
      : resizeCropArea(
          current.startArea,
          current.direction as CropResizeDirection,
          dx,
          dy,
          bounds,
          currentConstraints()
        );
  applyArea(next);
  event.preventDefault();
};

const endPointerInteraction = (event: PointerEvent): void => {
  if (!interaction.value || interaction.value.pointerId !== event.pointerId) return;
  containerRef.value?.releasePointerCapture?.(event.pointerId);
  interaction.value = null;
};

const keyboardDelta = (event: KeyboardEvent): { dx: number; dy: number } | null => {
  const step = event.shiftKey ? 10 : 1;
  if (event.key === 'ArrowLeft') return { dx: -step, dy: 0 };
  if (event.key === 'ArrowRight') return { dx: step, dy: 0 };
  if (event.key === 'ArrowUp') return { dx: 0, dy: -step };
  if (event.key === 'ArrowDown') return { dx: 0, dy: step };
  return null;
};

const handleCropBoxKeydown = (event: KeyboardEvent): void => {
  const delta = keyboardDelta(event);
  if (!delta || !layout.value || !isReady.value) return;
  applyArea(moveCropArea(cropArea.value, delta.dx, delta.dy, visibleImageBounds(layout.value)));
  event.preventDefault();
};

const handleResizeKeydown = (event: KeyboardEvent, direction: CropResizeDirection): void => {
  const delta = keyboardDelta(event);
  if (!delta || !layout.value || !isReady.value) return;
  applyArea(
    resizeCropArea(
      cropArea.value,
      direction,
      delta.dx,
      delta.dy,
      visibleImageBounds(layout.value),
      currentConstraints()
    )
  );
  event.preventDefault();
};

const crop = (): Promise<CropResult> => {
  if (cropPromise) return cropPromise;
  if (!resource.value || !layout.value || !isReady.value) {
    return Promise.reject(new ExImageCropError('NOT_READY', '图片尚未准备完成'));
  }

  const currentResource = resource.value;
  const currentLayout = layout.value;
  const previewArea = cloneArea(cropArea.value);
  const currentRotation = rotation.value;
  const currentZoom = zoom.value;
  const currentShape = props.shape;
  const currentOutputType = props.outputType;
  const currentQuality = props.quality;
  const currentBackgroundColor = props.outputBackgroundColor;
  const controller = new AbortController();
  const operationToken = Symbol('image-crop-operation');
  cropController = controller;
  cropOperationToken = operationToken;
  isCropping.value = true;

  const pending = (async (): Promise<CropResult> => {
    try {
      const rendered = await renderCrop(
        currentResource.image,
        currentResource.dimension,
        currentLayout,
        {
          area: previewArea,
          shape: currentShape,
          outputType: currentOutputType,
          quality: currentQuality,
          backgroundColor: currentBackgroundColor,
          signal: controller.signal,
        }
      );
      return {
        blob: rendered.blob,
        previewArea: cloneArea(previewArea),
        sourceArea: cloneArea(rendered.sourceArea),
        originalSize: { ...currentResource.dimension },
        outputSize: { ...rendered.outputSize },
        outputType: currentOutputType,
        rotation: currentRotation,
        zoom: currentZoom,
      };
    } catch (error) {
      throw toImageCropError(error, 'ENCODE_FAILED', '图片裁剪失败');
    } finally {
      if (cropOperationToken === operationToken) {
        cropPromise = null;
        cropController = null;
        cropOperationToken = null;
        isCropping.value = false;
      }
    }
  })();
  cropPromise = pending;
  return pending;
};

const handleCrop = (): void => {
  void crop()
    .then(result => emit('crop', result))
    .catch(error => {
      const normalized = toImageCropError(error, 'ENCODE_FAILED', '图片裁剪失败');
      if (normalized.code !== 'ABORTED') reportError(normalized, 'ENCODE_FAILED');
    });
};

const handleCancel = (): void => {
  cancelCropOperation();
  emit('cancel');
};

const setArea = (area: CropArea): void => {
  if (!layout.value || !isReady.value) {
    throw new ExImageCropError('NOT_READY', '图片尚未准备完成');
  }
  try {
    applyArea(normalizeCropArea(area, visibleImageBounds(layout.value), currentConstraints()));
  } catch (error) {
    throw new ExImageCropError('INVALID_AREA', '裁剪区域无效', error);
  }
};

const getArea = (): CropArea => cloneArea(cropArea.value);
const getElement = (): HTMLDivElement | null => cropRef.value ?? null;

const updateContainerSize = (size: CropSize): void => {
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    return;
  }
  const hadLayout = Boolean(layout.value);
  const previousSize = containerSize.value;
  const previousLayout = layout.value;
  const previousArea = cropArea.value;
  containerSize.value = { width: size.width, height: size.height };
  try {
    rebuildLayout(hadLayout ? 'preserve-source' : 'initialize');
    displayError.value = '';
  } catch (error) {
    // 无效画布尺寸不能提交半成品布局；保留上次有效裁剪，等待容器恢复。
    containerSize.value = previousSize;
    layout.value = previousLayout;
    cropArea.value = previousArea;
    reportError(error, 'ENCODE_FAILED');
  }
};

const measureContainer = (): void => {
  const element = containerRef.value;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  updateContainerSize({ width: rect.width, height: rect.height });
};

const setupResizeObserver = (): void => {
  if (!containerRef.value) return;
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        updateContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.value);
  } else if (typeof window !== 'undefined') {
    window.addEventListener('resize', measureContainer);
    measureContainer();
  }
};

watch(
  () => props.src,
  () => void loadSource(),
  { immediate: true }
);

const applyValidatedConfiguration = (update: () => void): void => {
  const shouldReload = !configurationValid.value && !resource.value;
  try {
    validateConfiguration();
    configurationValid.value = true;
    displayError.value = '';
    if (shouldReload) {
      void loadSource();
      return;
    }
    update();
  } catch (error) {
    configurationValid.value = false;
    reportError(error, 'INVALID_CONFIGURATION');
  }
};

watch(
  () => [
    props.shape,
    props.aspectRatio,
    props.minWidth,
    props.minHeight,
    props.maxWidth,
    props.maxHeight,
    props.initialArea,
  ],
  () => applyValidatedConfiguration(() => layout.value && initializeArea())
);

watch(
  () => [
    props.quality,
    props.outputType,
    props.zoomStep,
    props.minZoom,
    props.maxZoom,
    props.gridRows,
    props.gridCols,
  ],
  () =>
    applyValidatedConfiguration(() => {
      const nextZoom = Math.min(props.maxZoom, Math.max(props.minZoom, zoom.value));
      if (nextZoom !== zoom.value) {
        zoom.value = nextZoom;
        rebuildLayout('keep-preview');
        emit('zoom', zoom.value);
      }
    })
);

onMounted(setupResizeObserver);

onBeforeUnmount(() => {
  loadGeneration += 1;
  loadController?.abort();
  cancelCropOperation();
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (typeof window !== 'undefined') window.removeEventListener('resize', measureContainer);
  releaseResource();
});

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
