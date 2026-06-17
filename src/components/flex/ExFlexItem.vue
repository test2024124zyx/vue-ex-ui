<template>
  <div
    :class="flexItemClasses"
    :style="flexItemStyles"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { flexItemProps } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExFlexItem',
});

const props = defineProps(flexItemProps);
const { t: _t } = useI18n();

// 计算 flex 项目类名
const flexItemClasses = computed(() => ['ex-flex-item']);

// 计算 flex 项目样式
const flexItemStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 设置 flex 简写属性
  if (props.flex !== undefined) {
    styles.flex = typeof props.flex === 'number' ? String(props.flex) : props.flex;
  } else {
    // 只有在非默认值时才设置，避免生成不必要的样式
    const hasCustomFlex = props.grow !== 0 || props.shrink !== 1 || props.basis !== 'auto';
    if (hasCustomFlex) {
      const basisValue = typeof props.basis === 'number' ? `${props.basis}px` : props.basis;
      // 使用 flex 简写属性，避免浏览器合并导致的测试问题
      styles.flex = `${props.grow} ${props.shrink} ${basisValue}`;
    }
  }

  // 设置 align-self
  if (props.alignSelf !== 'auto') {
    styles.alignSelf = props.alignSelf;
  }

  // 设置 order
  if (props.order !== 0) {
    styles.order = String(props.order);
  }

  return styles;
});
</script>

<style lang="scss" scoped src="./ExFlexItem.scss"></style>
