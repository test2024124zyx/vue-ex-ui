<template>
  <ExVirtualList
    v-if="virtual"
    ref="listRef"
    :data-source="nodes"
    :height="height"
    :item-height="itemHeight"
    :buffer="buffer"
    :threshold="0"
    :item-key="item => (item as WindowNode).node.value"
    wrapper-role="presentation"
    :wrapper-tabindex="-1"
  >
    <template #default="{ item }"><slot :flat="item as WindowNode" /></template>
  </ExVirtualList>
  <template v-else>
    <slot
      v-for="flat in nodes"
      :key="flat.node.value"
      :flat="flat"
    />
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExVirtualList from '../virtual-list/ExVirtualList.vue';
import type { TreeSelectNode } from './types';

interface WindowNode {
  node: TreeSelectNode;
  disabled: boolean;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  position: number;
  setSize: number;
}
defineProps<{
  nodes: WindowNode[];
  virtual: boolean;
  height: number;
  itemHeight: number;
  buffer: number;
}>();
const listRef = ref<InstanceType<typeof ExVirtualList>>();
// 键盘导航同步更新窗口，不能等待浏览器稍后的 scroll 事件才创建目标节点。
const scrollToIndex = (index: number) => {
  listRef.value?.scrollToIndex(index);
  listRef.value?.refresh();
};
defineExpose({ scrollToIndex });
</script>
