<template>
  <div
    ref="nodeRootRef"
    :class="nodeClasses"
    :style="{ paddingLeft: `${level * 24}px`, '--ex-tree-indent': `${level * 24}px` }"
    role="treeitem"
    :tabindex="isDisabled ? -1 : 0"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="isSelected"
    :aria-checked="checkable ? isChecked : undefined"
    :aria-disabled="isDisabled"
    :aria-level="level + 1"
    :draggable="draggable && !isDisabled"
    @keydown="handleKeydown"
    @dragstart="handleDragStart"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    <div class="ex-tree-node__content" @click="handleClick" @contextmenu="handleContextmenu">
      <!-- 展开/收起图标 -->
      <span v-if="hasChildren" class="ex-tree-node__expand-icon" @click.stop="handleToggle">
        <ExIcon v-if="isExpanded" icon="arrow-down-s-line" :size="16" aria-hidden="true" />
        <ExIcon v-else icon="arrow-right-s-line" :size="16" aria-hidden="true" />
      </span>
      <span v-else class="ex-tree-node__expand-icon ex-tree-node__expand-icon--placeholder" />

      <!-- 复选框 -->
      <span v-if="checkable && node.checkable !== false" class="ex-tree-node__checkbox" @click.stop>
        <ExCheckbox
          :model-value="isChecked"
          :indeterminate="isHalfChecked"
          :disabled="isDisabled"
          @update:model-value="handleCheckChange"
        />
      </span>

      <!-- 图标 -->
      <span v-if="showIcon" class="ex-tree-node__icon">
        <!-- node.icon 支持内置图标名或图片 URL（内置名优先，未命中时按 URL 渲染） -->
        <ExIcon v-if="node.icon" :icon="node.icon" :src="node.icon" :size="16" aria-hidden="true" />
        <ExIcon
          v-else-if="hasChildren"
          :icon="isExpanded ? 'folder-open-line' : 'folder-line'"
          :size="16"
          aria-hidden="true"
        />
        <ExIcon v-else icon="file-line" :size="16" aria-hidden="true" />
      </span>

      <!-- 标题 -->
      <span class="ex-tree-node__label">
        {{ node.label }}
      </span>
    </div>

    <!-- 子节点（虚拟滚动 flat 模式下由父级统一扁平渲染，这里不再递归） -->
    <div v-if="hasChildren && isExpanded && !flat" class="ex-tree-node__children" role="group">
      <ExTreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys"
        :selectable="selectable"
        :checkable="checkable"
        :show-line="showLine"
        :show-icon="showIcon"
        :draggable="draggable"
        :disabled="disabled"
        @toggle="(node, expanded) => $emit('toggle', node, expanded)"
        @select="(node, selected) => $emit('select', node, selected)"
        @check="(node, checked) => $emit('check', node, checked)"
        @node-click="(node, event) => $emit('node-click', node, event)"
        @node-contextmenu="(node, event) => $emit('node-contextmenu', node, event)"
        @node-drag-start="(node, event) => $emit('node-drag-start', node, event)"
        @node-drag-enter="(node, event) => $emit('node-drag-enter', node, event)"
        @node-drag-leave="(node, event) => $emit('node-drag-leave', node, event)"
        @node-drag-end="(node, event) => $emit('node-drag-end', node, event)"
        @node-drop="
          (dragNode, dropNode, position, event) =>
            $emit('node-drop', dragNode, dropNode, position, event)
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import { computed, ref, nextTick } from 'vue';
import type { TreeNode } from './types';

interface Props {
  node: TreeNode;
  level: number;
  expandedKeys: string[];
  selectedKeys: string[];
  checkedKeys: string[];
  halfCheckedKeys: string[];
  selectable: boolean;
  checkable: boolean;
  showLine: boolean;
  showIcon: boolean;
  draggable: boolean;
  disabled: boolean;
  /** 扁平模式：不递归渲染子节点（供虚拟滚动使用） */
  flat?: boolean;
}

interface Emits {
  (e: 'toggle', node: TreeNode, expanded: boolean): void;
  (e: 'select', node: TreeNode, selected: boolean): void;
  (e: 'check', node: TreeNode, checked: boolean): void;
  (e: 'node-click', node: TreeNode, event: MouseEvent): void;
  (e: 'node-contextmenu', node: TreeNode, event: MouseEvent): void;
  (e: 'node-drag-start', node: TreeNode, event: DragEvent): void;
  (e: 'node-drag-enter', node: TreeNode, event: DragEvent): void;
  (e: 'node-drag-leave', node: TreeNode, event: DragEvent): void;
  (e: 'node-drag-end', node: TreeNode, event: DragEvent): void;
  (
    e: 'node-drop',
    dragNode: TreeNode,
    dropNode: TreeNode,
    position: 'before' | 'after' | 'inner',
    event: DragEvent
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isDragOver = ref(false);
const dropPosition = ref<'before' | 'after' | 'inner' | null>(null);
const nodeRootRef = ref<HTMLElement>();

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expandedKeys.includes(props.node.key);
});

const isSelected = computed(() => {
  return props.selectedKeys.includes(props.node.key);
});

const isChecked = computed(() => {
  return props.checkedKeys.includes(props.node.key);
});

const isHalfChecked = computed(() => {
  return props.halfCheckedKeys.includes(props.node.key);
});

const isDisabled = computed(() => {
  return props.disabled || props.node.disabled;
});

const nodeClasses = computed(() => {
  return [
    'ex-tree-node',
    {
      'ex-tree-node--expanded': isExpanded.value,
      'ex-tree-node--selected': isSelected.value,
      'ex-tree-node--disabled': isDisabled.value,
      'ex-tree-node--drag-over': isDragOver.value,
      [`ex-tree-node--drop-${dropPosition.value}`]: dropPosition.value,
    },
  ];
});

const handleToggle = () => {
  if (!hasChildren.value || isDisabled.value) return;
  emit('toggle', props.node, !isExpanded.value);
};

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) return;

  emit('node-click', props.node, event);

  if (props.selectable && props.node.selectable !== false) {
    emit('select', props.node, !isSelected.value);
  }
};

const handleContextmenu = (event: MouseEvent) => {
  event.preventDefault();
  emit('node-contextmenu', props.node, event);
};

const handleCheckChange = (val: string | number | boolean) => {
  if (isDisabled.value) return;
  emit('check', props.node, Boolean(val));
};

// 键盘导航（WAI-ARIA tree 模式）
const handleKeydown = (event: KeyboardEvent) => {
  const key = event.key;
  const root = nodeRootRef.value?.closest('.ex-tree');

  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End': {
      event.preventDefault();
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('.ex-tree-node[role="treeitem"]')
      ).filter(el => el.tabIndex >= 0);
      const idx = nodeRootRef.value ? items.indexOf(nodeRootRef.value) : -1;
      let target: HTMLElement | undefined;
      if (key === 'ArrowDown') target = items[idx + 1];
      else if (key === 'ArrowUp') target = items[idx - 1];
      else if (key === 'Home') target = items[0];
      else target = items[items.length - 1];
      target?.focus();
      break;
    }
    case 'ArrowRight': {
      event.preventDefault();
      if (hasChildren.value && !isExpanded.value) {
        emit('toggle', props.node, true);
      } else if (hasChildren.value && isExpanded.value) {
        nextTick(() => {
          nodeRootRef.value
            ?.querySelector<HTMLElement>('.ex-tree-node__children > .ex-tree-node[role="treeitem"]')
            ?.focus();
        });
      }
      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      if (hasChildren.value && isExpanded.value) {
        emit('toggle', props.node, false);
      } else {
        (
          nodeRootRef.value?.parentElement?.closest(
            '.ex-tree-node[role="treeitem"]'
          ) as HTMLElement | null
        )?.focus();
      }
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (props.checkable && props.node.checkable !== false && !isDisabled.value) {
        emit('check', props.node, !isChecked.value);
      } else {
        handleClick(event as unknown as MouseEvent);
      }
      break;
    }
  }
};

// 拖拽相关
const handleDragStart = (event: DragEvent) => {
  if (isDisabled.value) return;
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('text/plain', props.node.key);
  emit('node-drag-start', props.node, event);
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
  emit('node-drag-enter', props.node, event);
};

const handleDragLeave = (event: DragEvent) => {
  isDragOver.value = false;
  dropPosition.value = null;
  emit('node-drag-leave', props.node, event);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';

  // 计算放置位置
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const height = rect.height;

  if (offsetY < height * 0.25) {
    dropPosition.value = 'before';
  } else if (offsetY > height * 0.75) {
    dropPosition.value = 'after';
  } else {
    dropPosition.value = 'inner';
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const dragKey = event.dataTransfer!.getData('text/plain');
  if (dragKey && dropPosition.value) {
    // 这里需要从父组件获取 dragNode
    // 简化处理，直接传递 key
    emit('node-drop', { key: dragKey } as TreeNode, props.node, dropPosition.value, event);
  }

  dropPosition.value = null;
};

const handleDragEnd = (event: DragEvent) => {
  isDragOver.value = false;
  dropPosition.value = null;
  emit('node-drag-end', props.node, event);
};
</script>

<style scoped lang="scss">
.ex-tree-node {
  position: relative;
  user-select: none;

  &__content {
    display: flex;
    align-items: center;
    gap: var(--ex-spacing-2);
    padding: var(--ex-spacing-1) var(--ex-spacing-2);
    border-radius: var(--ex-radius-sm);
    cursor: pointer;
    transition: all var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);

    &:hover {
      background: var(--ex-color-bg-hover);
    }
  }

  &--selected > &__content {
    background: rgba(var(--ex-color-neon-blue-500-rgb), 0.1);
    color: var(--ex-color-primary);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .ex-tree-node__content {
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }
  }

  &--drag-over {
    &.ex-tree-node--drop-before::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--ex-color-primary);
    }

    &.ex-tree-node--drop-after::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--ex-color-primary);
    }

    &.ex-tree-node--drop-inner > .ex-tree-node__content {
      background: rgba(var(--ex-color-neon-blue-500-rgb), 0.2);
      border: 1px dashed var(--ex-color-primary);
    }
  }

  &__expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);

    img {
      filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(500%) hue-rotate(180deg);
    }

    &--placeholder {
      cursor: default;
    }
  }

  &__checkbox {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--ex-color-primary);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    img {
      filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(500%) hue-rotate(180deg);
    }
  }

  &__label {
    flex: 1;
    font-size: var(--ex-text-sm);
    color: var(--ex-color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__children {
    margin-left: 0;
  }
}
</style>
