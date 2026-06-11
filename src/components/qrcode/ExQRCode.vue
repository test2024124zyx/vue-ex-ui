<template>
  <div
    ref="qrcodeRef"
    :class="qrcodeClasses"
    :style="qrcodeStyles"
    role="img"
    :aria-label="ariaLabel || `QR Code: ${value}`"
  >
    <canvas
      ref="canvasRef"
      class="ex-qrcode__canvas"
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
    >
      <div class="ex-qrcode__loading-spinner" />
    </div>

    <!-- 错误状态 -->
    <div
      v-if="error"
      class="ex-qrcode__error"
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
import { computed, onMounted, ref, watch } from 'vue';
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

// 计算属性
const qrcodeClasses = computed(() => {
  const classes = ['ex-qrcode'];

  if (props.type) classes.push(`ex-qrcode--${props.type}`);
  if (props.bordered) classes.push('ex-qrcode--bordered');
  if (loading.value) classes.push('ex-qrcode--loading');
  if (error.value) classes.push('ex-qrcode--error');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const qrcodeStyles = computed(() => {
  const styles: Record<string, string> = {
    width: `${props.size}px`,
    height: `${props.size}px`,
  };

  if (props.borderRadius) {
    styles.borderRadius = `${props.borderRadius}px`;
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
  const size = props.iconSize || 40;
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});

// 生成二维码
const generateQRCode = async () => {
  if (!props.value || !canvasRef.value) {
    error.value = true;
    return;
  }

  try {
    loading.value = true;
    error.value = false;

    await QRCodeGenerator.toCanvas(canvasRef.value, props.value, {
      width: props.size,
      margin: props.includeMargin ? 2 : 0,
      errorCorrectionLevel: props.level,
      color: {
        dark: props.fgColor,
        light: props.bgColor,
      },
    });

    loading.value = false;
  } catch (err) {
    error.value = true;
    loading.value = false;
    if (import.meta.env.DEV) {
      console.error('QRCode generation error:', err);
    }
  }
};

// 下载二维码
const download = (filename?: string) => {
  if (!canvasRef.value || error.value) return;

  const url = canvasRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename || `qrcode-${Date.now()}.png`;
  link.href = url;
  link.click();
};

// 获取二维码数据URL
const toDataURL = (type: 'image/png' | 'image/jpeg' = 'image/png'): string => {
  if (!canvasRef.value || error.value) return '';
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
