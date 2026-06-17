<template>
  <div
    :class="gridClasses"
    :style="gridStyles"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { gridProps } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExGrid',
});

const props = defineProps(gridProps);
const { t: _t } = useI18n();

// 计算栅格样式类
const gridClasses = computed(() => [
  'ex-grid',
  `ex-grid--justify-${props.justify}`,
  `ex-grid--align-${props.align}`,
  {
    'ex-grid--nowrap': !props.wrap,
  },
]);

// gutter 预设值映射（类似 Bootstrap 的 spacing scale）
const gutterPresets: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// 计算栅格样式
const gridStyles = computed(() => {
  const styles: Record<string, string> = {};
  if (props.gutter) {
    let gutterValue = props.gutter;
    
    // 处理预设值
    if (typeof gutterValue === 'string') {
      gutterValue = gutterPresets[gutterValue] || 0;
    }
    
    if (Array.isArray(gutterValue)) {
      // 数组格式：[水平间隔, 垂直间隔]
      // 间距通过 .ex-grid 负 margin + 子项 padding 实现，避免与百分比列宽（flex-basis）叠加导致整行溢出换行
      const [horizontal = 0, vertical = 0] = gutterValue;
      styles['--ex-grid-gutter-x'] = `${horizontal}px`;
      styles['--ex-grid-gutter-y'] = `${vertical}px`;
    } else {
      styles['--ex-grid-gutter-x'] = `${gutterValue}px`;
      styles['--ex-grid-gutter-y'] = `${gutterValue}px`;
    }
  }
  return styles;
});
</script>
<style lang="scss" scoped src="./ExGrid.scss"></style>
