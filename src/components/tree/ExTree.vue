<template>
  <div
    ref="treeRef"
    :class="treeClasses"
    :style="treeStyles"
    role="tree"
    :aria-label="ariaLabel"
    :aria-multiselectable="multiple ? true : undefined"
    :aria-disabled="disabled || undefined"
  >
    <!-- 虚拟滚动模式：扁平化 + 窗口化渲染 -->
    <div
      v-if="virtual"
      ref="viewportRef"
      class="ex-tree__viewport"
      :style="viewportStyle"
      @scroll.passive="handleVirtualScroll"
    >
      <div
        class="ex-tree__phantom"
        :style="{ height: `${totalSpacerHeight}px`, position: 'relative' }"
      >
        <div :style="{ transform: `translateY(${topSpacerHeight}px)` }">
          <ExTreeNode
            v-for="{ node, level, position, setSize } in virtualNodes"
            :key="node.key"
            flat
            :node="node"
            :level="level"
            :position="position"
            :set-size="setSize"
            :style="{ height: `${safeItemHeight}px` }"
            :expanded-keys="effectiveExpandedKeys"
            :selected-keys="effectiveSelectedKeys"
            :checked-keys="effectiveCheckedKeys"
            :half-checked-keys="halfCheckedKeys"
            :active-key="renderedActiveKey"
            :selectable="selectable"
            :checkable="checkable"
            :show-line="showLine"
            :show-icon="showIcon"
            :draggable="draggable"
            :disabled="disabled"
            @toggle="handleToggle"
            @select="handleSelect"
            @check="handleCheck"
            @focus-node="handleFocusNode"
            @navigate="handleNavigate"
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextmenu"
            @node-drag-start="handleNodeDragStart"
            @node-drag-enter="handleNodeDragEnter"
            @node-drag-leave="handleNodeDragLeave"
            @node-drag-end="handleNodeDragEnd"
            @node-drop="handleNodeDrop"
          >
            <template #default="{ node: slotNode }">
              <slot :node="slotNode">
                {{ slotNode.label }}
              </slot>
            </template>
          </ExTreeNode>
        </div>
      </div>
    </div>

    <!-- 普通递归渲染 -->
    <template v-else>
      <ExTreeNode
        v-for="node in filteredData"
        :key="node.key"
        :node="node"
        :level="0"
        :expanded-keys="effectiveExpandedKeys"
        :selected-keys="effectiveSelectedKeys"
        :checked-keys="effectiveCheckedKeys"
        :half-checked-keys="halfCheckedKeys"
        :active-key="renderedActiveKey"
        :selectable="selectable"
        :checkable="checkable"
        :show-line="showLine"
        :show-icon="showIcon"
        :draggable="draggable"
        :disabled="disabled"
        @toggle="handleToggle"
        @select="handleSelect"
        @check="handleCheck"
        @focus-node="handleFocusNode"
        @navigate="handleNavigate"
        @node-click="handleNodeClick"
        @node-contextmenu="handleNodeContextmenu"
        @node-drag-start="handleNodeDragStart"
        @node-drag-enter="handleNodeDragEnter"
        @node-drag-leave="handleNodeDragLeave"
        @node-drag-end="handleNodeDragEnd"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ node: slotNode }">
          <slot :node="slotNode">
            {{ slotNode.label }}
          </slot>
        </template>
      </ExTreeNode>
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { ref, computed, watch, provide, onBeforeUnmount, nextTick } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import type { ExTreeProps, ExTreeEmits, ExTreeExposed, ExTreeSlots, TreeNode } from './types';
import ExTreeNode from './ExTreeNode.vue';
import { TREE_STATE_KEY } from './state';

defineOptions({
  name: 'ExTree',
});

const props = withDefaults(defineProps<ExTreeProps>(), {
  data: () => [],
  defaultExpandedKeys: () => [],
  expandedKeys: undefined,
  defaultSelectedKeys: () => [],
  selectedKeys: undefined,
  defaultCheckedKeys: () => [],
  checkedKeys: undefined,
  selectable: true,
  multiple: false,
  checkable: false,
  checkStrictly: false,
  defaultExpandAll: false,
  showLine: false,
  showIcon: true,
  draggable: false,
  disabled: false,
  virtual: false,
  itemHeight: 28,
  height: 400,
  virtualBuffer: 6,
});

const emit = defineEmits<ExTreeEmits>();
defineSlots<ExTreeSlots>();

const treeRef = ref<HTMLDivElement>();
const viewportRef = ref<HTMLDivElement>();
const measuredViewportHeight = ref(0);
let viewportObserver: ResizeObserver | undefined;
watch(
  viewportRef,
  element => {
    viewportObserver?.disconnect();
    measuredViewportHeight.value = element?.clientHeight ?? 0;
    if (!element || typeof ResizeObserver === 'undefined') return;
    viewportObserver = new ResizeObserver(() => {
      measuredViewportHeight.value = element.clientHeight;
    });
    viewportObserver.observe(element);
  },
  { flush: 'post' }
);
const filterValue = ref('');

const findFirstEnabledKey = (nodes: readonly TreeNode[]): string | null => {
  for (const node of nodes) {
    if (!node.disabled) return node.key;
    const childKey = node.children ? findFirstEnabledKey(node.children) : null;
    if (childKey) return childKey;
  }
  return null;
};
const activeKey = ref<string | null>(findFirstEnabledKey(props.data));

const collectExpandableKeys = (nodes: readonly TreeNode[]): string[] => {
  const keys: string[] = [];
  const visit = (items: readonly TreeNode[]) => {
    for (const node of items) {
      if (!node.disabled && node.children && node.children.length > 0) {
        keys.push(node.key);
        visit(node.children);
      }
    }
  };
  visit(nodes);
  return keys;
};

const expandedState = useControllableState<string[]>({
  controlledValue: () => props.expandedKeys,
  defaultValue: () =>
    props.defaultExpandAll ? collectExpandableKeys(props.data) : [...props.defaultExpandedKeys],
  clone: keys => [...keys],
  onChange: keys => emit('update:expandedKeys', keys),
});
const selectedState = useControllableState<string[]>({
  controlledValue: () => props.selectedKeys,
  defaultValue: () => [...props.defaultSelectedKeys],
  clone: keys => [...keys],
  onChange: keys => emit('update:selectedKeys', keys),
});
const checkedState = useControllableState<string[]>({
  controlledValue: () => props.checkedKeys,
  defaultValue: () => [...props.defaultCheckedKeys],
  clone: keys => [...keys],
  onChange: keys => emit('update:checkedKeys', keys),
});

const effectiveExpandedKeys = expandedState.value;
const effectiveSelectedKeys = selectedState.value;
const effectiveCheckedKeys = checkedState.value;
const expandedKeySet = computed(() => new Set(effectiveExpandedKeys.value));
const selectedKeySet = computed(() => new Set(effectiveSelectedKeys.value));
const checkedKeySet = computed(() => new Set(effectiveCheckedKeys.value));

// 一次前序遍历建立节点与父节点索引，数据变化时统一重建。
const treeIndex = computed(() => {
  const nodes = new Map<string, TreeNode>();
  const parents = new Map<string, string>();
  const pending = props.data
    .map(node => ({ node, parent: undefined as string | undefined }))
    .reverse();
  while (pending.length) {
    const entry = pending.pop();
    if (!entry) continue;
    const { node, parent } = entry;
    nodes.set(node.key, node);
    if (parent !== undefined) parents.set(node.key, parent);
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      if (child) pending.push({ node: child, parent: node.key });
    }
  }
  return { nodes, parents };
});
const nodeMap = computed(() => treeIndex.value.nodes);

// 过滤后的数据
const filteredData = computed(() => {
  if (!filterValue.value || !props.filterNodeMethod) {
    return props.data;
  }

  const filter = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];

    for (const node of nodes) {
      const match = props.filterNodeMethod!(filterValue.value, node);
      const children = node.children ? filter(node.children) : [];

      if (match || children.length > 0) {
        result.push({
          ...node,
          children: children.length > 0 ? children : node.children,
        });
      }
    }

    return result;
  };

  return filter(props.data);
});

// 样式类
const treeClasses = computed(() => {
  const classes = ['ex-tree'];

  if (props.showLine) classes.push('ex-tree--show-line');
  if (props.disabled) classes.push('ex-tree--disabled');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const treeStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// ============================================================================
// 虚拟滚动：将当前可见（已展开）的节点扁平化后做窗口化渲染
// ============================================================================
const scrollTop = ref(0);

const safeItemHeight = computed(() =>
  Number.isFinite(props.itemHeight) && props.itemHeight >= 1 ? Math.floor(props.itemHeight) : 28
);
const safeVirtualBuffer = computed(() =>
  Number.isFinite(props.virtualBuffer) && props.virtualBuffer >= 0
    ? Math.floor(props.virtualBuffer)
    : 6
);
const safeViewportHeight = computed(() =>
  typeof props.height === 'number' && Number.isFinite(props.height) && props.height > 0
    ? props.height
    : measuredViewportHeight.value || 400
);
const viewportStyle = computed(() => ({
  height:
    typeof props.height === 'number'
      ? `${safeViewportHeight.value}px`
      : props.height.trim() || '400px',
  overflowY: 'auto' as const,
}));

// 扁平化所有当前可见节点（携带层级），仅展开的分支才向下递归
interface VisibleTreeNode {
  node: TreeNode;
  level: number;
  position: number;
  setSize: number;
}
const flattenedNodes = computed<VisibleTreeNode[]>(() => {
  const result: VisibleTreeNode[] = [];
  const stack = filteredData.value
    .map((node, index, nodes) => ({ node, level: 0, position: index + 1, setSize: nodes.length }))
    .reverse();
  while (stack.length) {
    const item = stack.pop()!;
    result.push(item);
    const children = item.node.children;
    if (children && expandedKeySet.value.has(item.node.key)) {
      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push({
          node: children[index]!,
          level: item.level + 1,
          position: index + 1,
          setSize: children.length,
        });
      }
    }
  }
  return result;
});

const virtualRange = computed(() => {
  const total = flattenedNodes.value.length;
  const viewport = safeViewportHeight.value;
  const buffer = safeVirtualBuffer.value;
  const visibleCount = Math.ceil(viewport / safeItemHeight.value) + buffer * 2;
  const start = Math.min(
    Math.max(0, total - visibleCount),
    Math.max(0, Math.floor(scrollTop.value / safeItemHeight.value) - buffer)
  );
  const end = Math.min(total, start + visibleCount);
  return { start, end };
});

const virtualNodes = computed(() =>
  flattenedNodes.value.slice(virtualRange.value.start, virtualRange.value.end)
);

watch(
  flattenedNodes,
  nodes => {
    const enabledNodes = nodes.filter(({ node }) => !node.disabled);
    if (enabledNodes.some(({ node }) => node.key === activeKey.value)) return;

    const selectedNode = enabledNodes.find(({ node }) => selectedKeySet.value.has(node.key));
    activeKey.value = selectedNode?.node.key ?? enabledNodes[0]?.node.key ?? null;
  },
  { immediate: true }
);

const renderedActiveKey = computed(() => {
  if (!props.virtual) return activeKey.value;
  const enabledNodes = virtualNodes.value.filter(({ node }) => !node.disabled);
  if (enabledNodes.some(({ node }) => node.key === activeKey.value)) {
    return activeKey.value;
  }
  return enabledNodes[0]?.node.key ?? null;
});

const topSpacerHeight = computed(() => virtualRange.value.start * safeItemHeight.value);
const totalSpacerHeight = computed(() => flattenedNodes.value.length * safeItemHeight.value);
watch([totalSpacerHeight, safeViewportHeight], () => {
  const bounded = Math.min(
    scrollTop.value,
    Math.max(0, totalSpacerHeight.value - safeViewportHeight.value)
  );
  scrollTop.value = bounded;
  if (viewportRef.value) viewportRef.value.scrollTop = bounded;
});

let virtualRaf: number | null = null;
const handleVirtualScroll = (e: Event) => {
  if (virtualRaf !== null) cancelAnimationFrame(virtualRaf);
  const el = e.target as HTMLElement;
  virtualRaf = requestAnimationFrame(() => {
    scrollTop.value = el.scrollTop;
    virtualRaf = null;
  });
};

onBeforeUnmount(() => {
  viewportObserver?.disconnect();
  if (virtualRaf !== null) {
    cancelAnimationFrame(virtualRaf);
    virtualRaf = null;
  }
});

// 半选状态完全由真实 checkedKeys 推导，不维护可失步的第二份状态。
const halfCheckedKeys = computed<string[]>(() => {
  if (props.checkStrictly) {
    return [];
  }

  const { nodes, parents } = treeIndex.value;
  const orderedNodes = Array.from(nodes.values());
  const counts = new Map<string, { total: number; checked: number }>();
  const half = new Set<string>();
  // 逆前序保证先汇总孩子；每条父子边只处理一次，时间和空间均为 O(N)。
  for (let index = orderedNodes.length - 1; index >= 0; index -= 1) {
    const node = orderedNodes[index];
    if (!node) continue;
    const descendants = counts.get(node.key) ?? { total: 0, checked: 0 };
    if (descendants.checked > 0 && descendants.checked < descendants.total) half.add(node.key);
    const parent = parents.get(node.key);
    if (parent === undefined) continue;
    const parentCount = counts.get(parent) ?? { total: 0, checked: 0 };
    const checkable = isNodeCheckable(node);
    parentCount.total += descendants.total + Number(checkable);
    parentCount.checked +=
      descendants.checked + Number(checkable && checkedKeySet.value.has(node.key));
    counts.set(parent, parentCount);
  }
  // 查询方法保持原来的前序结果顺序，索引优化不改变对外契约。
  return orderedNodes.filter(node => half.has(node.key)).map(node => node.key);
});

// 获取所有子节点的 key
const isNodeCheckable = (node: TreeNode): boolean => !node.disabled && node.checkable !== false;

const getAllChildKeys = (node: TreeNode): string[] => {
  const keys: string[] = [];
  const traverse = (n: TreeNode) => {
    if (isNodeCheckable(n)) keys.push(n.key);
    if (n.children) {
      n.children.forEach(traverse);
    }
  };
  if (node.children) {
    node.children.forEach(traverse);
  }
  return keys;
};

// 获取所有父节点的 key
const getAllParentKeys = (key: string): string[] => {
  const keys: string[] = [];
  const parents = treeIndex.value.parents;
  let parent = parents.get(key);
  while (parent !== undefined) {
    keys.push(parent);
    parent = parents.get(parent);
  }

  return keys;
};

// 处理展开/收起（不可变更新 + emit 拷贝，避免外泄内部引用）
const handleToggle = (node: TreeNode, expanded: boolean) => {
  if (props.disabled || node.disabled) return;
  const currentKeys = effectiveExpandedKeys.value;
  const has = expandedKeySet.value.has(node.key);
  let nextKeys: string[];

  if (expanded && !has) {
    nextKeys = [...currentKeys, node.key];
  } else if (!expanded && has) {
    nextKeys = currentKeys.filter(key => key !== node.key);
  } else {
    return;
  }

  expandedState.request(nextKeys);
  emit('expand', [...nextKeys], node, expanded);
};

// 处理选择
const handleSelect = (node: TreeNode, selected: boolean) => {
  if (props.disabled || !props.selectable || node.disabled || node.selectable === false) return;

  const currentKeys = effectiveSelectedKeys.value;
  let nextKeys: string[];

  if (props.multiple) {
    const has = selectedKeySet.value.has(node.key);
    if (selected && !has) {
      nextKeys = [...currentKeys, node.key];
    } else if (!selected && has) {
      nextKeys = currentKeys.filter(key => key !== node.key);
    } else {
      return;
    }
  } else {
    nextKeys = selected ? [node.key] : [];
  }

  selectedState.request(nextKeys);
  emit('select', [...nextKeys], node, selected);
};

// 处理勾选
const handleCheck = (node: TreeNode, checked: boolean) => {
  if (props.disabled || !props.checkable || node.disabled || node.checkable === false) return;

  const checkedSet = new Set(effectiveCheckedKeys.value);

  if (checked) {
    checkedSet.add(node.key);
    if (!props.checkStrictly) {
      // 级联勾选子节点
      getAllChildKeys(node).forEach(key => checkedSet.add(key));
      // 级联勾选父节点
      const parentKeys = getAllParentKeys(node.key);
      parentKeys.forEach(parentKey => {
        const parentNode = nodeMap.value.get(parentKey);
        if (parentNode?.children) {
          const checkableChildren = parentNode.children.filter(isNodeCheckable);
          const allChildrenChecked = checkableChildren.every(child => checkedSet.has(child.key));
          if (isNodeCheckable(parentNode) && checkableChildren.length > 0 && allChildrenChecked) {
            checkedSet.add(parentKey);
          }
        }
      });
    }
  } else {
    checkedSet.delete(node.key);
    if (!props.checkStrictly) {
      // 级联取消子节点
      getAllChildKeys(node).forEach(key => checkedSet.delete(key));
      // 级联取消父节点
      getAllParentKeys(node.key).forEach(key => checkedSet.delete(key));
    }
  }

  const nextKeys = Array.from(checkedSet);
  checkedState.request(nextKeys);
  emit('check', [...nextKeys], node, checked);
};

// 处理节点点击
const handleNodeClick = (node: TreeNode, event: MouseEvent) => {
  emit('node-click', node, event);
};

const handleFocusNode = (node: TreeNode) => {
  activeKey.value = node.key;
};

const focusNodeByKey = (key: string) => {
  nextTick(() => {
    const target = Array.from(
      treeRef.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []
    ).find(item => item.dataset.nodeKey === key);
    target?.focus();
  });
};

const handleNavigate = (
  node: TreeNode,
  key: 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'
) => {
  const enabledNodes = flattenedNodes.value.filter(item => !item.node.disabled);
  const currentIndex = enabledNodes.findIndex(item => item.node.key === node.key);
  let target: VisibleTreeNode | undefined = enabledNodes[currentIndex];
  if (key === 'ArrowDown') target = enabledNodes[currentIndex + 1];
  else if (key === 'ArrowUp') target = enabledNodes[currentIndex - 1];
  else if (key === 'Home') target = enabledNodes[0];
  else if (key === 'End') target = enabledNodes[enabledNodes.length - 1];
  else if (key === 'ArrowRight') {
    const child = node.children?.find(item => !item.disabled);
    target = enabledNodes.find(item => item.node.key === child?.key);
  } else if (key === 'ArrowLeft') {
    const parent = treeIndex.value.parents.get(node.key);
    target = enabledNodes.find(item => item.node.key === parent);
  }
  if (!target || target.node.key === node.key) return;

  activeKey.value = target.node.key;
  if (props.virtual) {
    const targetIndex = flattenedNodes.value.findIndex(item => item.node.key === target.node.key);
    const nextScrollTop = targetIndex * safeItemHeight.value;
    scrollTop.value = nextScrollTop;
    if (viewportRef.value) viewportRef.value.scrollTop = nextScrollTop;
  }
  focusNodeByKey(target.node.key);
};

// 处理节点右键
const handleNodeContextmenu = (node: TreeNode, event: MouseEvent) => {
  emit('node-contextmenu', node, event);
};

// 拖拽相关
const handleNodeDragStart = (node: TreeNode, event: DragEvent) => {
  emit('node-drag-start', node, event);
};

const handleNodeDragEnter = (node: TreeNode, event: DragEvent) => {
  emit('node-drag-enter', node, event);
};

const handleNodeDragLeave = (node: TreeNode, event: DragEvent) => {
  emit('node-drag-leave', node, event);
};

const handleNodeDragEnd = (node: TreeNode, event: DragEvent) => {
  emit('node-drag-end', node, event);
};

const handleNodeDrop = (
  dragNode: TreeNode,
  dropNode: TreeNode,
  position: 'before' | 'after' | 'inner',
  event: DragEvent
) => {
  // 只接受当前树发起的拖拽，保证事件中的 dragNode 始终是完整原始节点。
  const resolvedDragNode = nodeMap.value.get(dragNode.key);
  if (!resolvedDragNode) return;
  emit('node-drop', resolvedDragNode, dropNode, position, event);
};

// 其他暴露的方法
const getSelectedNodes = (): TreeNode[] => {
  return effectiveSelectedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getCheckedNodes = (): TreeNode[] => {
  return effectiveCheckedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getHalfCheckedNodes = (): TreeNode[] => {
  return halfCheckedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const requestNodeSelection = (key: string, selected: boolean): boolean => {
  const node = nodeMap.value.get(key);
  if (!node || props.disabled || !props.selectable || node.disabled || node.selectable === false) {
    return false;
  }
  handleSelect(node, selected);
  return true;
};

const requestNodeCheck = (key: string, checked: boolean): boolean => {
  const node = nodeMap.value.get(key);
  if (!node || props.disabled || !props.checkable || node.disabled || node.checkable === false) {
    return false;
  }
  handleCheck(node, checked);
  return true;
};

const requestNodeExpansion = (key: string, expanded: boolean): boolean => {
  const node = nodeMap.value.get(key);
  if (!node || props.disabled || node.disabled) return false;
  handleToggle(node, expanded);
  return true;
};

const getNode = (key: string): TreeNode | null => {
  return nodeMap.value.get(key) || null;
};

const requestExpandAll = () => {
  expandedState.request(collectExpandableKeys(props.data));
};

const requestCollapseAll = () => {
  expandedState.request([]);
};

const filter = (value: string) => {
  filterValue.value = value;

  // 过滤时自动展开命中节点的所有祖先，确保命中项可见
  if (value && props.filterNodeMethod) {
    const toExpand = new Set(effectiveExpandedKeys.value);
    const walk = (nodes: TreeNode[], ancestors: string[]) => {
      for (const node of nodes) {
        if (props.filterNodeMethod!(value, node)) {
          ancestors.forEach(k => toExpand.add(k));
        }
        if (node.children && node.children.length > 0) {
          walk(node.children, [...ancestors, node.key]);
        }
      }
    };
    walk(props.data, []);
    const nextKeys = Array.from(toExpand);
    if (
      nextKeys.length !== effectiveExpandedKeys.value.length ||
      nextKeys.some(key => !expandedKeySet.value.has(key))
    ) {
      expandedState.request(nextKeys);
    }
  }
};

const getElement = () => treeRef.value || null;

// 提供给子组件
provide(TREE_STATE_KEY, {
  expanded: expandedKeySet,
  selected: selectedKeySet,
  checked: checkedKeySet,
  halfChecked: computed(() => new Set(halfCheckedKeys.value)),
});
provide('tree', {
  props,
  nodeMap,
});

defineExpose<ExTreeExposed>({
  getSelectedNodes,
  getCheckedNodes,
  getHalfCheckedNodes,
  requestNodeSelection,
  requestNodeCheck,
  requestNodeExpansion,
  getNode,
  requestExpandAll,
  requestCollapseAll,
  filter,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTree.scss"></style>
