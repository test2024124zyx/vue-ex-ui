<template>
  <div
    ref="containerRef"
    class="ex-watermark"
    :style="containerStyle"
  >
    <div
      ref="overlayRef"
      class="ex-watermark__overlay"
      :class="{ 'is-fixed': fullPage }"
      :style="overlayStyle"
      aria-hidden="true"
    ></div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, normalizeStyle, ref, useAttrs } from 'vue';
import { useZIndexLayer } from '../config-provider/composables';
import { watermarkPropDefs } from './types';
import { useWatermark } from './useWatermark';
import { normalizeNumber } from './watermark-utils';
import { useI18n } from '../../locale';
import type { CSSProperties } from 'vue';
import type { ExWatermarkEmits, ExWatermarkExposed } from './types';

// 定义组件选项
defineOptions({ name: 'ExWatermark' });

// 定义 Props
const props = defineProps(watermarkPropDefs);
const emit = defineEmits<ExWatermarkEmits>();

// 使用国际化
const { t } = useI18n();

// 容器元素引用
const containerRef = ref<HTMLElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);
const attrs = useAttrs();
const defaultWatermarkZIndex = useZIndexLayer('watermark');

// 将交互和层级放在容器变量上，允许调用方通过根元素样式覆盖。
const containerStyle = computed(
  () =>
    ({
      position: 'relative',
      overflow: props.antiTamper ? 'hidden' : undefined,
      '--ex-watermark-z-index': String(props.zIndex ?? defaultWatermarkZIndex.value),
      '--ex-watermark-pointer-events': props.pointerEvents,
      '--ex-watermark-user-select': props.selectable ? 'text' : 'none',
    }) satisfies CSSProperties
);

function restoreContainerStyle(element: HTMLElement): void {
  const normalized = normalizeStyle([attrs.style]);
  const overrides = typeof normalized === 'object' ? normalized : {};
  for (const [name, value] of Object.entries(containerStyle.value)) {
    if (value === undefined || name in overrides) continue;
    if (
      name === 'overflow' &&
      ['overflowX', 'overflowY', 'overflow-x', 'overflow-y'].some(key => key in overrides)
    )
      continue;
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  }
}

// 使用水印组合式函数
const { overlayDataUrl, tileWidth, tileHeight, refresh, toDataURL } = useWatermark(
  props,
  t,
  containerRef,
  overlayRef,
  {
    onError: error => emit('error', error),
    onRemove: () => emit('remove'),
    restoreContainerStyle,
  }
);

// 暴露方法给父组件
defineExpose<ExWatermarkExposed>({ refresh, toDataURL });

// 水印覆盖层样式
const overlayStyle = computed(() => {
  const bg = overlayDataUrl.value ? `url("${overlayDataUrl.value}")` : 'none';
  return {
    backgroundImage: bg,
    backgroundSize:
      tileWidth.value > 0 && tileHeight.value > 0
        ? `${tileWidth.value}px ${tileHeight.value}px`
        : undefined,
    backgroundRepeat: props.repeat ? 'repeat' : 'no-repeat',
    // 偏移是有方向的位置，不能复用间距等尺寸的非负下界。
    backgroundPosition: `${normalizeNumber(props.offsetX, 0, Number.NEGATIVE_INFINITY)}px ${normalizeNumber(
      props.offsetY,
      0,
      Number.NEGATIVE_INFINITY
    )}px`,
    opacity: normalizeNumber(props.opacity, 0.3, 0, 1),
  };
});
</script>
<style lang="scss" scoped src="./ExWatermark.scss"></style>
