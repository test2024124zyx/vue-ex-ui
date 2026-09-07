<template>
  <div
    ref="barcodeRef"
    :class="barcodeClasses"
    :style="barcodeStyles"
    :role="loading || error ? 'group' : 'img'"
    :aria-label="barcodeAriaLabel"
    :aria-busy="loading || undefined"
  >
    <!-- SVG 容器 -->
    <svg
      ref="svgRef"
      class="ex-barcode__svg"
      aria-hidden="true"
    />

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="ex-barcode__loading"
      role="status"
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
      role="alert"
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
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ExBarcodeProps, ExBarcodeExposed } from './types';
import { useI18n } from '../../locale';
import { generateBarcode } from './barcode-generator';
import { MAX_BARCODE_VALUE_LENGTH, normalizeBarcodeOptions } from './barcode-limits';
import { assertImagePixelBudget } from '../../utils/image-resource';

defineOptions({
  name: 'ExBarcode',
});

const BARCODE_EXPORT_FALLBACK_WIDTH = 300;
const BARCODE_EXPORT_FALLBACK_HEIGHT = 150;
const BARCODE_EXPORT_PIXEL_ERROR = 'Barcode image exceeds browser safe pixel limits';

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
let generationId = 0;
let disposed = false;
const pendingImageLoadCancels = new Set<() => void>();

// 计算属性
const barcodeClasses = computed(() => {
  const classes = ['ex-barcode'];

  if (props.type) classes.push(`ex-barcode--${props.type}`);
  if (props.bordered) classes.push('ex-barcode--bordered');
  if (loading.value) classes.push('ex-barcode--loading');
  if (error.value) classes.push('ex-barcode--error');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const barcodeAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  return props.value.length <= MAX_BARCODE_VALUE_LENGTH
    ? `${t('barcode.label')}: ${props.value}`
    : t('barcode.label');
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
const generate = async (): Promise<void> => {
  const requestId = ++generationId;
  if (!props.value || !svgRef.value) {
    loading.value = false;
    error.value = true;
    errorMessage.value = t('barcode.invalidValue');
    return;
  }

  try {
    loading.value = true;
    error.value = false;
    errorMessage.value = '';

    // 清空 SVG
    svgRef.value.innerHTML = '';

    // 生成条码
    await generateBarcode(
      svgRef.value,
      props.value,
      normalizeBarcodeOptions({
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
          if (!valid && requestId === generationId && !disposed) {
            error.value = true;
            errorMessage.value = t('barcode.invalidValue');
          }
        },
      })
    );
  } catch (err) {
    if (requestId !== generationId || disposed) return;
    error.value = true;
    errorMessage.value = err instanceof Error ? err.message : t('barcode.error');
  } finally {
    if (requestId === generationId && !disposed) loading.value = false;
  }
};

const revokeObjectUrl = (url: string): void => {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // 浏览器资源清理失败不应覆盖原始导出结果。
  }
};

/** 解码临时 SVG，并允许组件卸载同步结束所有待处理导出。 */
const loadSvgImage = (svg: SVGSVGElement): Promise<HTMLImageElement | null> => {
  return new Promise(resolve => {
    let url: string | null = null;
    let settled = false;
    const image = new Image();

    const finish = (result: HTMLImageElement | null): void => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      pendingImageLoadCancels.delete(cancel);
      if (url) revokeObjectUrl(url);
      url = null;
      resolve(result);
    };
    const cancel = (): void => {
      finish(null);
      try {
        image.src = '';
      } catch {
        // 部分浏览器在释放中的图片上写入空地址会抛错，URL 已由 finish 回收。
      }
    };

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      url = URL.createObjectURL(svgBlob);
      image.onload = () => finish(image);
      image.onerror = () => finish(null);
      pendingImageLoadCancels.add(cancel);
      image.src = url;
    } catch {
      finish(null);
    }
  });
};

const setExportPixelError = (): void => {
  if (disposed) return;
  error.value = true;
  errorMessage.value = BARCODE_EXPORT_PIXEL_ERROR;
};

/** 像素预算检查必须早于 canvas 宽高赋值，避免浏览器先分配超大位图。 */
const renderExportCanvas = async (svg: SVGSVGElement): Promise<HTMLCanvasElement | null> => {
  const image = await loadSvgImage(svg);
  if (!image || disposed) return null;

  const width =
    image.naturalWidth || image.width || svg.clientWidth || BARCODE_EXPORT_FALLBACK_WIDTH;
  const height =
    image.naturalHeight || image.height || svg.clientHeight || BARCODE_EXPORT_FALLBACK_HEIGHT;
  try {
    assertImagePixelBudget(width, height);
  } catch {
    setExportPixelError();
    return null;
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0);
    return canvas;
  } catch {
    return null;
  }
};

// 下载条码
const download = (filename?: string): void => {
  const svg = svgRef.value;
  if (!svg || loading.value || error.value || disposed) return;

  void renderExportCanvas(svg).then(canvas => {
    if (!canvas || disposed) return;
    try {
      canvas.toBlob(blob => {
        if (!blob || disposed) return;
        let downloadUrl: string | null = null;
        try {
          downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename || `barcode-${Date.now()}.png`;
          link.href = downloadUrl;
          link.click();
        } catch {
          // toBlob 的异步回调也须独立兜底，确保下载失败不会变成未捕获异常。
        } finally {
          if (downloadUrl) revokeObjectUrl(downloadUrl);
        }
      });
    } catch {
      // 下载能力不可用时保持组件可用，不向宿主控制台写入噪声。
    }
  });
};

// 获取条码数据URL（SVG→canvas 为异步绘制，必须等 img.onload 后再读取，故返回 Promise）
const toDataURL = async (type: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> => {
  const svg = svgRef.value;
  if (!svg || loading.value || error.value || disposed) return '';
  const canvas = await renderExportCanvas(svg);
  if (!canvas || disposed) return '';

  try {
    return canvas.toDataURL(type);
  } catch {
    return '';
  }
};

// 监听值变化（覆盖所有影响渲染的 prop，避免改了某些 prop 不重绘）
watch(
  () => [
    props.value,
    props.format,
    props.width,
    props.height,
    props.displayValue,
    props.textPosition,
    props.textMargin,
    props.fontSize,
    props.font,
    props.textAlign,
    props.lineColor,
    props.background,
    props.margin,
    props.marginTop,
    props.marginBottom,
    props.marginLeft,
    props.marginRight,
    props.flat,
  ],
  () => {
    void generate();
  }
);

// 挂载时生成
onMounted(() => {
  void generate();
});

onBeforeUnmount(() => {
  disposed = true;
  generationId += 1;
  for (const cancel of [...pendingImageLoadCancels]) cancel();
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
