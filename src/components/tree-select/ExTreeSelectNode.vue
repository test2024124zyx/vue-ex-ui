<template>
  <div
    ref="rootRef"
    class="ex-tree-select__node"
    :class="{ 'is-selected': selected, 'is-disabled': disabled }"
    role="treeitem"
    :tabindex="disabled ? -1 : active ? 0 : -1"
    :aria-expanded="expandable ? expanded : undefined"
    :aria-selected="multiple ? undefined : selected"
    :aria-checked="multiple ? checked : undefined"
    :aria-disabled="disabled || undefined"
    :aria-busy="loadState.status === 'loading' || undefined"
    :aria-level="level + 1"
    :aria-posinset="position"
    :aria-setsize="setSize"
    :style="{ paddingLeft: `${level * NODE_INDENT + NODE_PADDING}px`, height: `${height}px` }"
    @click="emit('select')"
    @keydown="emit('keydown', $event)"
  >
    <span
      class="ex-tree-select__expand"
      :class="{ 'is-leaf': !expandable }"
      aria-hidden="true"
      @click.stop="expandable && emit('expand')"
    >
      <ExIcon
        v-if="expandable"
        :icon="loadState.status === 'loading' ? 'loader-4-line' : 'arrow-right-s-line'"
        :size="14"
        :class="{ 'is-expanded': expanded }"
        :spin="loadState.status === 'loading'"
        aria-hidden="true"
      />
    </span>
    <span
      v-if="multiple"
      class="ex-tree-select__checkbox"
      :class="{ 'is-checked': checked === true, 'is-indeterminate': checked === 'mixed' }"
    ></span>
    <span class="ex-tree-select__node-label">{{ node.label }}</span>
    <span
      v-if="loadState.status === 'loading'"
      class="ex-tree-select__status"
      role="status"
    >
      {{ t('loading') }}
    </span>
    <button
      v-if="loadState.status === 'error'"
      type="button"
      class="ex-tree-select__retry"
      :disabled="disabled"
      :aria-label="`${node.label}: ${t('loadError')}. ${t('retryLoad')}`"
      @click.stop="emit('retry')"
      @keydown.stop
    >
      {{ t('retryLoad') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import type { TreeSelectLoadState, TreeSelectNode } from './types';

defineProps<{
  node: TreeSelectNode;
  disabled: boolean;
  selected: boolean;
  multiple: boolean;
  checked: boolean | 'mixed';
  expanded: boolean;
  expandable: boolean;
  active: boolean;
  level: number;
  position: number;
  setSize: number;
  height: number;
  loadState: TreeSelectLoadState;
}>();
const emit = defineEmits<{
  select: [];
  expand: [];
  retry: [];
  keydown: [event: KeyboardEvent];
}>();
const NODE_INDENT = 18;
const NODE_PADDING = 8;
const rootRef = ref<HTMLElement>();
const { t } = useLocale('tree');
// 父组件在虚拟窗口渲染完成后通过公开焦点方法定位节点。
defineExpose({ focus: () => rootRef.value?.focus() });
</script>

<style scoped lang="scss">
.ex-tree-select__node {
  display: flex;
  align-items: center;
  gap: var(--ex-spacing-1);
  box-sizing: border-box;
  padding-right: var(--ex-spacing-3);
  color: var(--ex-color-text-primary);
  cursor: pointer;
  &:hover {
    background: var(--ex-color-bg-hover);
  }
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--ex-color-primary-alpha-50);
  }
  &.is-selected {
    background: var(--ex-color-primary-alpha-20);
    color: var(--ex-color-primary);
  }
  &.is-disabled {
    color: var(--ex-color-text-disabled);
    cursor: not-allowed;
  }
}
.ex-tree-select__expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--ex-color-text-tertiary);
  &.is-leaf {
    cursor: default;
  }
  .is-expanded {
    transform: rotate(90deg);
  }
}
.ex-tree-select__checkbox {
  position: relative;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-sm);
  background: var(--ex-color-bg-secondary);
  &.is-checked,
  &.is-indeterminate {
    background: var(--ex-color-primary);
    border-color: var(--ex-color-primary);
  }
  &.is-checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid var(--ex-color-white);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  &.is-indeterminate::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 6px;
    width: 7px;
    height: 2px;
    background: var(--ex-color-white);
  }
}
.ex-tree-select__node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--ex-text-sm);
}
.ex-tree-select__status {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-xs);
}
.ex-tree-select__retry {
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-sm);
  color: var(--ex-color-primary);
  background: var(--ex-color-bg-secondary);
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid var(--ex-color-primary);
    outline-offset: 2px;
  }
}
</style>
