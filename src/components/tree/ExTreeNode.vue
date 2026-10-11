<template>
  <div
    ref="nodeRootRef"
    :class="nodeClasses"
    :style="{ paddingLeft: `${level * 24}px`, '--ex-tree-indent': `${level * 24}px` }"
    role="treeitem"
    :data-node-key="node.key"
    :tabindex="isDisabled ? -1 : activeKey === node.key ? 0 : -1"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="selectable ? isSelected : undefined"
    :aria-checked="checkable ? (isHalfChecked ? 'mixed' : isChecked) : undefined"
    :aria-disabled="isDisabled"
    :aria-busy="loadState.status === 'loading' || undefined"
    :aria-level="level + 1"
    :aria-posinset="position"
    :aria-setsize="setSize"
    :draggable="draggable && !isDisabled"
    @focus="handleFocus"
    @keydown="handleKeydown"
    @dragstart.stop="handleDragStart"
    @dragenter.stop="handleDragEnter"
    @dragleave.stop="handleDragLeave"
    @dragover.stop="handleDragOver"
    @drop.stop="handleDrop"
    @dragend.stop="handleDragEnd"
  >
    <div
      class="ex-tree-node__content"
      @click="handleClick"
      @contextmenu="handleContextmenu"
    >
      <!-- 展开/收起图标 -->
      <span
        v-if="hasChildren"
        class="ex-tree-node__expand-icon"
        @click.stop="handleToggle"
      >
        <ExIcon
          v-if="loadState.status === 'loading'"
          icon="loader-4-line"
          :size="16"
          class="ex-tree-node__loading-icon"
          aria-hidden="true"
        />
        <ExIcon
          v-else-if="isExpanded"
          icon="arrow-down-s-line"
          :size="16"
          aria-hidden="true"
        />
        <ExIcon
          v-else
          icon="arrow-right-s-line"
          :size="16"
          aria-hidden="true"
        />
      </span>
      <span
        v-else
        class="ex-tree-node__expand-icon ex-tree-node__expand-icon--placeholder"
      ></span>

      <!-- 复选框 -->
      <span
        v-if="checkable && node.checkable !== false"
        class="ex-tree-node__checkbox"
        @click.stop
      >
        <ExCheckbox
          :model-value="isChecked"
          :indeterminate="isHalfChecked"
          :disabled="isDisabled"
          :aria-label="node.label"
          @change="handleCheckChange"
        />
      </span>

      <!-- 图标 -->
      <span
        v-if="showIcon"
        class="ex-tree-node__icon"
      >
        <!-- node.icon 支持内置图标名或图片 URL（内置名优先，未命中时按 URL 渲染） -->
        <ExIcon
          v-if="node.icon"
          :icon="node.icon"
          :src="node.icon"
          :size="16"
          aria-hidden="true"
        />
        <ExIcon
          v-else-if="hasChildren"
          :icon="isExpanded ? 'folder-open-line' : 'folder-line'"
          :size="16"
          aria-hidden="true"
        />
        <ExIcon
          v-else
          icon="file-line"
          :size="16"
          aria-hidden="true"
        />
      </span>

      <!-- 标题 -->
      <span class="ex-tree-node__label">
        <slot :node="node">{{ node.label }}</slot>
      </span>
      <span
        v-if="loadState.status === 'loading'"
        class="ex-tree-node__status"
        role="status"
      >
        {{ t('loading') }}
      </span>
      <span
        v-else-if="loadState.status === 'error'"
        class="ex-tree-node__status ex-tree-node__status--error"
        role="status"
      >
        {{ t('loadError') }}
      </span>
      <button
        v-if="loadState.status === 'error'"
        type="button"
        class="ex-tree-node__retry"
        :disabled="isDisabled"
        :aria-label="`${node.label}: ${t('retryLoad')}`"
        @click.stop="handleRetry"
      >
        {{ t('retryLoad') }}
      </button>
    </div>

    <!-- 子节点（虚拟滚动 flat 模式下由父级统一扁平渲染，这里不再递归） -->
    <div
      v-if="hasChildren && isExpanded && !flat"
      class="ex-tree-node__children"
      role="group"
    >
      <ExTreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        :checked-keys="checkedKeys"
        :half-checked-keys="halfCheckedKeys"
        :active-key="activeKey"
        :selectable="selectable"
        :checkable="checkable"
        :show-line="showLine"
        :show-icon="showIcon"
        :draggable="draggable"
        :disabled="disabled"
        @toggle="(node, expanded) => $emit('toggle', node, expanded)"
        @select="(node, selected) => $emit('select', node, selected)"
        @check="(node, checked) => $emit('check', node, checked)"
        @focus-node="node => $emit('focus-node', node)"
        @navigate="(node, key) => $emit('navigate', node, key)"
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
      >
        <template #default="{ node: childNode }">
          <slot :node="childNode">
            {{ childNode.label }}
          </slot>
        </template>
      </ExTreeNode>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from '../checkbox/ExCheckbox.vue';
import { computed, ref, nextTick, inject } from 'vue';
import type { VNode } from 'vue';
import type { TreeNode } from './types';
import { TREE_STATE_KEY } from './state';
import { useLocale } from '../../locale';
import { useAnimation } from '../config-provider/composables';

interface Props {
  node: TreeNode;
  level: number;
  expandedKeys: string[];
  selectedKeys: string[];
  checkedKeys: string[];
  halfCheckedKeys: string[];
  activeKey: string | null;
  selectable: boolean;
  checkable: boolean;
  showLine: boolean;
  showIcon: boolean;
  draggable: boolean;
  disabled: boolean;
  /** 扁平模式：不递归渲染子节点（供虚拟滚动使用） */
  flat?: boolean;
  /** 虚拟节点显式携带同级集合位置。 */
  position?: number;
  setSize?: number;
}

interface Emits {
  (e: 'toggle', node: TreeNode, expanded: boolean): void;
  (e: 'select', node: TreeNode, selected: boolean): void;
  (e: 'check', node: TreeNode, checked: boolean): void;
  (e: 'focus-node', node: TreeNode): void;
  (
    e: 'navigate',
    node: TreeNode,
    key: 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'
  ): void;
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

interface Slots {
  default?: (props: { node: TreeNode }) => VNode[];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();
const stateLookup = inject(TREE_STATE_KEY, undefined);
const { t } = useLocale('tree');
const animation = useAnimation();

const isDragOver = ref(false);
const dropPosition = ref<'before' | 'after' | 'inner' | null>(null);
const nodeRootRef = ref<HTMLElement>();

const hasChildren = computed(() => {
  return stateLookup?.isExpandable(props.node) ?? Boolean(props.node.children?.length);
});
const loadState = computed(() => stateLookup?.getLoadState(props.node.key) ?? { status: 'idle' });
const handleRetry = () => {
  if (isDisabled.value) return;
  const focused = typeof document === 'undefined' ? null : document.activeElement;
  const restoreFocus = focused?.classList.contains('ex-tree-node__retry');
  void stateLookup?.reload(props.node.key).then(() => {
    nextTick(() => {
      // 重试按钮成功后消失时恢复节点焦点；用户已移到其他控件时不抢夺焦点。
      if (restoreFocus && !focused?.isConnected && document.activeElement === document.body) {
        nodeRootRef.value?.focus();
      }
    });
  });
};

const isExpanded = computed(() => {
  return (
    stateLookup?.expanded.value.has(props.node.key) ?? props.expandedKeys.includes(props.node.key)
  );
});

const isSelected = computed(() => {
  return (
    stateLookup?.selected.value.has(props.node.key) ?? props.selectedKeys.includes(props.node.key)
  );
});

const isChecked = computed(() => {
  return (
    stateLookup?.checked.value.has(props.node.key) ?? props.checkedKeys.includes(props.node.key)
  );
});

const isHalfChecked = computed(() => {
  return (
    stateLookup?.halfChecked.value.has(props.node.key) ??
    props.halfCheckedKeys.includes(props.node.key)
  );
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
      'ex-tree-node--no-animation': !animation.value,
      'ex-tree-node--drag-over': isDragOver.value,
      [`ex-tree-node--drop-${dropPosition.value}`]: dropPosition.value,
    },
  ];
});

const handleToggle = () => {
  if (!hasChildren.value || isDisabled.value) return;
  nodeRootRef.value?.focus();
  emit('toggle', props.node, !isExpanded.value);
};

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) return;

  nodeRootRef.value?.focus();
  emit('node-click', props.node, event);

  if (props.selectable && props.node.selectable !== false) {
    emit('select', props.node, !isSelected.value);
  }
};

const handleFocus = () => emit('focus-node', props.node);

const handleContextmenu = (event: MouseEvent) => {
  event.preventDefault();
  emit('node-contextmenu', props.node, event);
};

const handleCheckChange = (val: string | number | boolean, event: Event) => {
  if (isDisabled.value) return;
  emit('check', props.node, Boolean(val));

  // ExCheckbox 使用原生 input；受控父级未接受请求时需恢复真实 prop 状态。
  nextTick(() => {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    input.checked = isChecked.value;
    input.indeterminate = isHalfChecked.value;
  });
};

// 键盘导航（WAI-ARIA tree 模式）
const handleKeydown = (event: KeyboardEvent) => {
  // 节点插槽可以包含按钮等控件，子控件的键盘事件不得冒充树节点操作。
  if (event.target !== nodeRootRef.value) return;

  const key = event.key;

  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End': {
      event.preventDefault();
      emit('navigate', props.node, key);
      break;
    }
    case 'ArrowRight': {
      event.preventDefault();
      if (loadState.value.status === 'error') {
        handleRetry();
      } else if (hasChildren.value && !isExpanded.value) {
        emit('toggle', props.node, true);
      } else if (hasChildren.value && isExpanded.value) {
        emit('navigate', props.node, key);
      }
      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      if (hasChildren.value && isExpanded.value) {
        emit('toggle', props.node, false);
      } else {
        emit('navigate', props.node, key);
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
  if (isDisabled.value || !props.draggable || !event.dataTransfer) return;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', props.node.key);
  emit('node-drag-start', props.node, event);
};

const handleDragEnter = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable || !event.dataTransfer) return;
  event.preventDefault();
  isDragOver.value = true;
  emit('node-drag-enter', props.node, event);
};

const handleDragLeave = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable) return;
  isDragOver.value = false;
  dropPosition.value = null;
  emit('node-drag-leave', props.node, event);
};

const handleDragOver = (event: DragEvent) => {
  if (isDisabled.value || !props.draggable || !event.dataTransfer) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

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
  if (isDisabled.value || !props.draggable || !event.dataTransfer) return;
  event.preventDefault();
  isDragOver.value = false;

  const dragKey = event.dataTransfer.getData('text/plain');
  if (dragKey && dragKey !== props.node.key && dropPosition.value) {
    // 父组件会通过唯一 key 解析完整原始节点，无法解析的外部拖拽不会继续发出。
    emit('node-drop', { key: dragKey } as TreeNode, props.node, dropPosition.value, event);
  }

  dropPosition.value = null;
};

const handleDragEnd = (event: DragEvent) => {
  if (!props.draggable) return;
  isDragOver.value = false;
  dropPosition.value = null;
  emit('node-drag-end', props.node, event);
};
</script>

<style scoped lang="scss">
.ex-tree-node {
  position: relative;
  user-select: none;

  &:focus-visible {
    outline: none;

    > .ex-tree-node__content {
      outline: 2px solid var(--ex-color-primary);
      outline-offset: 1px;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    gap: var(--ex-spacing-2);
    padding: var(--ex-spacing-1) var(--ex-spacing-2);
    border-radius: var(--ex-radius-sm);
    cursor: pointer;
    transition:
      color var(--ex-motion-duration-base) var(--ex-motion-ease-in-out),
      background-color var(--ex-motion-duration-base) var(--ex-motion-ease-in-out),
      outline-color var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);

    &:hover {
      background: var(--ex-color-bg-hover);
    }
  }

  &--selected > &__content {
    background: var(--ex-color-primary-alpha-10);
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
      background: var(--ex-color-primary-alpha-20);
      border: 1px dashed var(--ex-color-primary);
    }
  }

  &__expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    cursor: pointer;
    transition: transform var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);

    &--placeholder {
      cursor: default;
    }
  }

  &__checkbox {
    display: flex;
    flex-shrink: 0;
    align-items: center;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--ex-color-primary);
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  &__label {
    flex: 1;
    overflow: hidden;
    color: var(--ex-color-text-primary);
    font-size: var(--ex-text-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__children {
    margin-left: 0;
  }

  &__status {
    overflow: hidden;
    font-size: var(--ex-text-xs);
    color: var(--ex-color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;

    &--error {
      color: var(--ex-color-danger);
    }
  }

  &__retry {
    flex-shrink: 0;
    padding: var(--ex-spacing-1) var(--ex-spacing-2);
    border: 1px solid var(--ex-color-border);
    border-radius: var(--ex-radius-sm);
    background: var(--ex-color-bg-primary);
    color: var(--ex-color-primary);
    font: inherit;
    font-size: var(--ex-text-xs);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--ex-color-primary);
      outline-offset: 1px;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__loading-icon {
    animation: ex-tree-loading var(--ex-motion-duration-slow) linear infinite;
  }

  &--no-animation &__loading-icon {
    animation: none;
  }
}

@keyframes ex-tree-loading {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ex-tree-node__loading-icon {
    animation: none;
  }
}
</style>
