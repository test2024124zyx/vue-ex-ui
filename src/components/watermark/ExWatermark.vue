<template>
  <div ref="containerRef" class="ex-watermark" :style="containerStyle" role="presentation">
    <div
      class="ex-watermark__overlay"
      :class="{ 'is-fixed': fullPage }"
      :style="overlayStyle"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { watermarkPropDefs } from './types';
import { useWatermark } from './useWatermark';
import { useI18n } from '../../locale';

// 定义组件选项
defineOptions({ name: 'ExWatermark' });

// 定义 Props
const props = defineProps(watermarkPropDefs);

// 使用国际化
const { t } = useI18n();

// 容器元素引用
const containerRef = ref<HTMLElement | null>(null);

// 使用水印组合式函数
const { overlayDataUrl, refresh, toDataURL } = useWatermark(props, t, containerRef);

// 暴露的方法接口
interface WatermarkExposed {
  /** 手动刷新水印 */
  refresh: () => Promise<void>;
  /** 获取水印的 base64 数据 URL */
  toDataURL: () => string;
}

// 暴露方法给父组件
defineExpose<WatermarkExposed>({ refresh, toDataURL });

// 容器样式：全屏模式不需要相对定位
const containerStyle = computed(() => {
  return props.fullPage ? {} : { position: 'relative' as const };
});

// 水印覆盖层样式
const overlayStyle = computed(() => {
  const bg = overlayDataUrl.value ? `url("${overlayDataUrl.value}")` : 'none';
  return {
    backgroundImage: bg,
    backgroundSize: `${props.gapX}px ${props.gapY}px`,
    backgroundRepeat: props.repeat ? 'repeat' : 'no-repeat',
    backgroundPosition: `${props.offsetX}px ${props.offsetY}px`,
    opacity: props.opacity,
    '--wm-pointer-events': props.pointerEvents,
    '--wm-z-index': String(props.zIndex),
    '--wm-user-select': props.selectable ? 'text' : 'none',
  };
});
</script>
<style lang="scss" scoped src="./ExWatermark.scss"></style>
