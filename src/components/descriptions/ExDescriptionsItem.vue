<template>
  <!-- 占位组件：实际渲染由父级 ExDescriptions 收集 vnode 后统一完成。
       直接使用时回退渲染默认插槽，避免内容丢失。 -->
  <slot />
</template>

<script setup lang="ts">
import type { ExDescriptionsItemProps } from './types';

defineOptions({
  name: 'ExDescriptionsItem',
});

withDefaults(defineProps<ExDescriptionsItemProps>(), {
  span: 1,
});
</script>
