<template>
  <div
    ref="qrcodeRef"
    :class="qrcodeClasses"
    :style="qrcodeStyles"
    role="img"
    :aria-label="ariaLabel || `QR Code: ${value}`"
    :aria-busy="loading || undefined"
  >
    <canvas
      ref="canvasRef"
      class="ex-qrcode__canvas"
      aria-hidden="true"
    />

    <!-- 中心图标/Logo -->
    <div
      v-if="$slots.icon"
      class="ex-qrcode__icon"
      :style="iconStyle"
    >
      <slot name="icon" />
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="ex-qrcode__loading"
      role="status"
      aria-live="polite"
      :aria-label="t('qrcode.loading')"
    >
      <div class="ex-qrcode__loading-spinner" />
    </div>

    <!-- 错误状态 -->
    <div
      v-if="error"
      class="ex-qrcode__error"
      role="alert"
    >
      <div class="ex-qrcode__error-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M24 4L4 24L24 44L44 24L24 4Z"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M24 16V26"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <circle
            cx="24"
            cy="32"
            r="1.5"
            fill="currentColor"
          />
        </svg>
      </div>
      <p class="ex-qrcode__error-text">
        {{ errorText || t('qrcode.error') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ExQRCodeProps, ExQRCodeExposed } from './types';
import { useI18n } from '../../locale';
import QRCodeGenerator from './qrcode-generator';

defineOptions({
  name: 'ExQRCode',
});

const props = withDefaults(defineProps<ExQRCodeProps>(), {
  value: '',
  size: 200,
  level: 'M',
  bgColor: '#ffffff',
  fgColor: '#000000',
  includeMargin: true,
  bordered: true,
  borderRadius: 8,
  iconSize: 40,
  type: 'default',
});

const { t } = useI18n();

// Refs
const qrcodeRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const loading = ref(false);
const error = ref(false);
const ready = ref(false);
let generationRevision = 0;

const DEFAULT_QRCODE_SIZE = 200;
const MIN_QRCODE_SIZE = 32;
const MAX_QRCODE_SIZE = 2048;

const clampFiniteNumber = (value: number, min: number, max: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

const normalizedSize = computed(() =>
  clampFiniteNumber(props.size, MIN_QRCODE_SIZE, MAX_QRCODE_SIZE, DEFAULT_QRCODE_SIZE)
);
const normalizedIconSize = computed(() =>
  clampFiniteNumber(props.iconSize, 0, normalizedSize.value, Math.min(40, normalizedSize.value))
);
const normalizedBorderRadius = computed(() =>
  clampFiniteNumber(props.borderRadius, 0, normalizedSize.value / 2, 8)
);

// 计算属性
const qrcodeClasses = computed(() => {
  const classes = ['ex-qrcode'];

  if (props.type) classes.push(`ex-qrcode--${props.type}`);
  if (props.bordered) classes.push('ex-qrcode--bordered');
  if (loading.value) classes.push('ex-qrcode--loading');
  if (error.value) classes.push('ex-qrcode--error');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const qrcodeStyles = computed(() => {
  const styles: Record<string, string> = {
    width: `${normalizedSize.value}px`,
    height: `${normalizedSize.value}px`,
  };

  if (normalizedBorderRadius.value > 0) {
    styles.borderRadius = `${normalizedBorderRadius.value}px`;
  }

  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    }
    return { ...styles, ...props.style };
  }

  return styles;
});

const iconStyle = computed(() => {
  return {
    width: `${normalizedIconSize.value}px`,
    height: `${normalizedIconSize.value}px`,
  };
});

const clearCanvas = () => {
  if (!canvasRef.value) return;
  const width = canvasRef.value.width;
  canvasRef.value.width = width;
};

// 先在独立画布生成，确认仍是最新请求后再一次性提交到可见画布。
const createStagingCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = normalizedSize.value;
  canvas.height = normalizedSize.value;
  return canvas;
};

const commitGeneratedCanvas = (generatedCanvas: HTMLCanvasElement): void => {
  const outputCanvas = canvasRef.value;
  if (!outputCanvas) return;
  outputCanvas.width = generatedCanvas.width;
  outputCanvas.height = generatedCanvas.height;
  const context = outputCanvas.getContext('2d');
  if (!context) throw new Error('当前浏览器无法提交二维码画布');
  context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  context.drawImage(generatedCanvas, 0, 0);
};

// 生成二维码
const generateQRCode = async () => {
  const revision = ++generationRevision;
  ready.value = false;
  if (!props.value || !canvasRef.value) {
    loading.value = false;
    error.value = true;
    clearCanvas();
    return;
  }

  try {
    loading.value = true;
    error.value = false;
    const generatedCanvas = createStagingCanvas();

    await QRCodeGenerator.toCanvas(generatedCanvas, props.value, {
      width: normalizedSize.value,
      margin: props.includeMargin ? 2 : 0,
      errorCorrectionLevel: props.level,
      color: {
        dark: props.fgColor,
        light: props.bgColor,
      },
    });

    if (revision !== generationRevision) return;
    commitGeneratedCanvas(generatedCanvas);
    ready.value = true;
    loading.value = false;
  } catch (err) {
    if (revision !== generationRevision) return;
    error.value = true;
    loading.value = false;
    clearCanvas();
    if (import.meta.env.DEV) {
      console.error('QRCode generation error:', err);
    }
  }
};

// 下载二维码
const download = (filename?: string) => {
  if (!canvasRef.value || !ready.value || error.value) return;

  const url = canvasRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename || `qrcode-${Date.now()}.png`;
  link.href = url;
  link.click();
};

// 获取二维码数据URL
const toDataURL = (type: 'image/png' | 'image/jpeg' = 'image/png'): string => {
  if (!canvasRef.value || !ready.value || error.value) return '';
  return canvasRef.value.toDataURL(type);
};

// 监听值变化
watch(
  () => [props.value, props.size, props.level, props.bgColor, props.fgColor, props.includeMargin],
  () => {
    generateQRCode();
  }
);

// 挂载时生成
onMounted(() => {
  generateQRCode();
});

onBeforeUnmount(() => {
  generationRevision += 1;
});

// 暴露的方法
const getElement = () => qrcodeRef.value || null;

defineExpose<ExQRCodeExposed>({
  getElement,
  download,
  toDataURL,
  refresh: generateQRCode,
});
</script>

<style scoped lang="scss" src="./ExQRCode.scss"></style>
