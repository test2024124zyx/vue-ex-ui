<template>
  <div
    :class="gridItemClasses"
    :style="gridItemStyles"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { gridItemProps, type ResponsiveValue } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExGridItem',
});

const props = defineProps(gridItemProps);
const { t: _t } = useI18n();

// 计算栅格项样式类
const gridItemClasses = computed(() => {
  const classes = ['ex-grid-item'];

  // 基础栅格
  if (props.span === 'auto') {
    classes.push('ex-grid-item--auto');
  } else if (props.span !== 24) {
    classes.push(`ex-grid-item--span-${props.span}`);
  }

  if (props.offset > 0) {
    classes.push(`ex-grid-item--offset-${props.offset}`);
  }

  if (props.push > 0) {
    classes.push(`ex-grid-item--push-${props.push}`);
  }

  if (props.pull > 0) {
    classes.push(`ex-grid-item--pull-${props.pull}`);
  }

  if (props.order !== 0) {
    classes.push(`ex-grid-item--order-${props.order}`);
  }

  // 响应式栅格
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
  breakpoints.forEach((breakpoint) => {
    const value = props[breakpoint];
    if (value !== undefined) {
      if (typeof value === 'number') {
        classes.push(`ex-grid-item--${breakpoint}-${value}`);
      } else {
        const config = value as ResponsiveValue;
        if (config.span !== undefined) {
          classes.push(`ex-grid-item--${breakpoint}-${config.span}`);
        }
        if (config.offset !== undefined && config.offset > 0) {
          classes.push(`ex-grid-item--${breakpoint}-offset-${config.offset}`);
        }
        if (config.push !== undefined && config.push > 0) {
          classes.push(`ex-grid-item--${breakpoint}-push-${config.push}`);
        }
        if (config.pull !== undefined && config.pull > 0) {
          classes.push(`ex-grid-item--${breakpoint}-pull-${config.pull}`);
        }
        if (config.order !== undefined && config.order !== 0) {
          classes.push(`ex-grid-item--${breakpoint}-order-${config.order}`);
        }
      }
    }
  });

  return classes;
});

// 计算栅格项样式 - 使用 CSS 变量优化性能
const gridItemStyles = computed(() => {
  const styles: Record<string, string> = {};
  
  // 对于非常用值，使用 CSS 变量动态设置
  // 这样可以避免生成大量的 CSS 类
  const isCommonSpan = (span: number) => {
    return span % 2 === 0 || span === 1 || span === 24;
  };
  
  if (props.span === 'auto') {
    // auto 模式：自动等宽分配剩余空间
    styles.flex = '1 0 0%';
  } else if (props.span !== 24 && !isCommonSpan(props.span as number)) {
    styles['--ex-grid-item-width'] = `${((props.span as number) / 24) * 100}%`;
  }
  
  const isCommonOffset = (offset: number) => {
    return offset <= 12 && (offset % 2 === 0 || offset === 1);
  };
  
  if (props.offset > 0 && !isCommonOffset(props.offset)) {
    styles['--ex-grid-item-offset'] = `${(props.offset / 24) * 100}%`;
  }

  if (props.push > 0 && !isCommonOffset(props.push)) {
    styles['--ex-grid-item-push'] = `${(props.push / 24) * 100}%`;
  }

  if (props.pull > 0 && !isCommonOffset(props.pull)) {
    styles['--ex-grid-item-pull'] = `${(props.pull / 24) * 100}%`;
  }
  
  if (props.order !== 0 && (props.order < -2 || props.order > 2)) {
    styles['--ex-grid-item-order'] = String(props.order);
  }
  
  return styles;
});
</script>
<style lang="scss" scoped src="./ExGridItem.scss"></style>
