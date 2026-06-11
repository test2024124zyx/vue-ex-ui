<template>
  <div
    ref="barcodeRef"
    :class="barcodeClasses"
    :style="barcodeStyles"
    role="img"
    :aria-label="ariaLabel || `Barcode: ${value}`"
  >
    <!-- SVG 容器 -->
    <svg
      ref="svgRef"
      class="ex-barcode__svg"
    />

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="ex-barcode__loading"
    >
      <div class="ex-barcode__loading-spinner" />
      <p class="ex-barcode__loading-text">
        {{ t('barcode.generating') }}
      </p>
    </div>

    <!-- 错误状态 -->
    <div
      v-if="error"
      class="ex-barcode__error"
    >
      <slot
        name="error"
        :error="errorMessage"
      >
        <div class="ex-barcode__error-icon">
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
        <p class="ex-barcode__error-text">
          {{ errorText || errorMessage || t('barcode.error') }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ExBarcodeProps, ExBarcodeExposed } from './types';
import { useI18n } from '../../locale';
import { generateBarcode } from './barcode-generator';

defineOptions({
  name: 'ExBarcode',
});

const props = withDefaults(defineProps<ExBarcodeProps>(), {
  value: '',
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  textPosition: 'bottom',
  textMargin: 2,
  fontSize: 20,
  font: 'monospace',
  textAlign: 'center',
  lineColor: '#000000',
  background: '#ffffff',
  margin: 10,
  flat: false,
  type: 'default',
  bordered: true,
  borderRadius: 8,
});

const { t } = useI18n();

// Refs
const barcodeRef = ref<HTMLDivElement>();
const svgRef = ref<SVGSVGElement>();
const loading = ref(false);
const error = ref(false);
const errorMessage = ref('');

// 计算属性
const barcodeClasses = computed(() => {
  const classes = ['ex-barcode'];

  if (props.type) classes.push(`ex-barcode--${props.type}`);
  if (props.bordered) classes.push('ex-barcode--bordered');
  if (loading.value) classes.push('ex-barcode--loading');
  if (error.value) classes.push('ex-barcode--error');

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

const barcodeStyles = computed(() => {
  const styles: Record<string, string> = {};

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

// 生成条码
const generate = async () => {
  if (!props.value || !svgRef.value) {
    error.value = true;
    errorMessage.value = 'Invalid value';
    return;
  }

  try {
    loading.value = true;
    error.value = false;
    errorMessage.value = '';

    // 清空 SVG
    svgRef.value.innerHTML = '';

    // 生成条码
    await generateBarcode(svgRef.value, props.value, {
      format: props.format,
      width: props.width,
      height: props.height,
      displayValue: props.displayValue,
      textPosition: props.textPosition,
      textMargin: props.textMargin,
      fontSize: props.fontSize,
      font: props.font,
      textAlign: props.textAlign,
      lineColor: props.lineColor,
      background: props.background,
      margin: props.margin,
      marginTop: props.marginTop,
      marginBottom: props.marginBottom,
      marginLeft: props.marginLeft,
      marginRight: props.marginRight,
      flat: props.flat,
      valid: (valid: boolean) => {
        if (!valid) {
          error.value = true;
          errorMessage.value = 'Invalid barcode value for format';
        }
      },
    });

    loading.value = false;
  } catch (err) {
    error.value = true;
    errorMessage.value = err instanceof Error ? err.message : 'Generation failed';
    loading.value = false;
    if (import.meta.env.DEV) {
      console.error('Barcode generation error:', err);
    }
  }
};

// 下载条码
const download = (filename?: string) => {
  if (!svgRef.value || error.value) return;

  try {
    // 创建 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取 SVG 尺寸
    const svgData = new XMLSerializer().serializeToString(svgRef.value);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // 下载
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = filename || `barcode-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };
    img.src = url;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('Download error:', err);
    }
  }
};

// 获取条码数据URL
const toDataURL = (type: 'image/png' | 'image/jpeg' = 'image/png'): string => {
  if (!svgRef.value || error.value) return '';

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const svgData = new XMLSerializer().serializeToString(svgRef.value);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return canvas.toDataURL(type);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('toDataURL error:', err);
    }
    return '';
  }
};

// 监听值变化
watch(
  () => [
    props.value,
    props.format,
    props.width,
    props.height,
    props.displayValue,
    props.lineColor,
    props.background,
  ],
  () => {
    generate();
  }
);

// 挂载时生成
onMounted(() => {
  generate();
});

// 暴露的方法
const getElement = () => barcodeRef.value || null;

defineExpose<ExBarcodeExposed>({
  getElement,
  download,
  toDataURL,
  refresh: generate,
});
</script>

<style scoped lang="scss" src="./ExBarcode.scss"></style>
