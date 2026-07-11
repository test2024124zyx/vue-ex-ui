<template>
  <slot />
</template>

<script setup lang="ts">
import type { ExDescriptionsItemProps } from './types';

defineOptions({
  name: 'ExDescriptionsItem',
});

defineProps<ExDescriptionsItemProps>();

// 父组件直接解析该配置节点，不会挂载此组件；真正挂载说明使用位置无效。
throw new Error('ExDescriptionsItem 必须作为 ExDescriptions 的直接子项使用');
</script>
