<template>
  <div
    :class="flexClasses"
    :style="flexStyles"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { flexProps } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExFlex',
});

const props = defineProps(flexProps);
const { t: _t } = useI18n();

// 计算 flex 容器类名
const flexClasses = computed(() => [
  'ex-flex',
  {
    'ex-flex--inline': props.inline,
    'ex-flex--vertical': props.vertical,
  },
]);

// gap 预设值映射
const gapPresets: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// 计算 flex 容器样式
const flexStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 设置 flex-direction
  // vertical 优先级高于 direction，但会在控制台警告
  if (props.vertical && props.direction !== 'row') {
    console.warn('[ExFlex] vertical 和 direction 同时设置时，vertical 优先生效');
  }
  if (props.vertical) {
    styles.flexDirection = 'column';
  } else {
    styles.flexDirection = props.direction;
  }

  // 设置 flex-wrap
  styles.flexWrap = props.wrap;

  // 设置 justify-content
  styles.justifyContent = props.justify;

  // 设置 align-items
  styles.alignItems = props.align;

  // 设置 align-content
  if (props.wrap !== 'nowrap') {
    styles.alignContent = props.alignContent;
  }

  // 设置间隙
  let gapValue = props.gap;
  let rowGapValue = props.rowGap;
  let columnGapValue = props.columnGap;

  // 处理预设值
  if (typeof gapValue === 'string' && gapPresets[gapValue]) {
    gapValue = gapPresets[gapValue];
  }
  if (typeof rowGapValue === 'string' && gapPresets[rowGapValue]) {
    rowGapValue = gapPresets[rowGapValue];
  }
  if (typeof columnGapValue === 'string' && gapPresets[columnGapValue]) {
    columnGapValue = gapPresets[columnGapValue];
  }

  if (gapValue !== undefined) {
    const gapStr = typeof gapValue === 'number' ? `${gapValue}px` : gapValue;
    styles.gap = gapStr;
    // 为降级方案设置CSS变量
    styles['--ex-flex-gap'] = gapStr;
  }

  if (rowGapValue !== undefined) {
    const rowGapStr = typeof rowGapValue === 'number' ? `${rowGapValue}px` : rowGapValue;
    styles.rowGap = rowGapStr;
    styles['--ex-flex-row-gap'] = rowGapStr;
  }

  if (columnGapValue !== undefined) {
    const columnGapStr = typeof columnGapValue === 'number' ? `${columnGapValue}px` : columnGapValue;
    styles.columnGap = columnGapStr;
    styles['--ex-flex-column-gap'] = columnGapStr;
  }

  return styles;
});
</script>

<style lang="scss" scoped src="./ExFlex.scss"></style>
