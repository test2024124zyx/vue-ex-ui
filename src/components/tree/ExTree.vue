<template>
  <div
    ref="treeRef"
    :class="treeClasses"
    :style="treeStyles"
    role="tree"
  >
    <!-- 虚拟滚动模式：扁平化 + 窗口化渲染 -->
    <div
      v-if="virtual"
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
            v-for="{ node, level } in virtualNodes"
            :key="node.key"
            flat
            :node="node"
            :level="level"
            :style="{ height: `${itemHeight}px` }"
            :expanded-keys="internalExpandedKeys"
            :selected-keys="internalSelectedKeys"
            :checked-keys="internalCheckedKeys"
            :half-checked-keys="halfCheckedKeys"
            :selectable="selectable"
            :checkable="checkable"
            :show-line="showLine"
            :show-icon="showIcon"
            :draggable="draggable"
            :disabled="disabled"
            @toggle="handleToggle"
            @select="handleSelect"
            @check="handleCheck"
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextmenu"
            @node-drag-start="handleNodeDragStart"
            @node-drag-enter="handleNodeDragEnter"
            @node-drag-leave="handleNodeDragLeave"
            @node-drag-end="handleNodeDragEnd"
            @node-drop="handleNodeDrop"
          />
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
        :expanded-keys="internalExpandedKeys"
        :selected-keys="internalSelectedKeys"
        :checked-keys="internalCheckedKeys"
        :half-checked-keys="halfCheckedKeys"
        :selectable="selectable"
        :checkable="checkable"
        :show-line="showLine"
        :show-icon="showIcon"
        :draggable="draggable"
        :disabled="disabled"
        @toggle="handleToggle"
        @select="handleSelect"
        @check="handleCheck"
        @node-click="handleNodeClick"
        @node-contextmenu="handleNodeContextmenu"
        @node-drag-start="handleNodeDragStart"
        @node-drag-enter="handleNodeDragEnter"
        @node-drag-leave="handleNodeDragLeave"
        @node-drag-end="handleNodeDragEnd"
        @node-drop="handleNodeDrop"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { ref, computed, watch, provide, onBeforeUnmount } from 'vue';
import type { ExTreeProps, ExTreeEmits, ExTreeExposed, TreeNode } from './types';
import ExTreeNode from './ExTreeNode.vue';

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

const treeRef = ref<HTMLDivElement>();
const filterValue = ref('');

// 内部状态（始终持有副本，避免原地 mutate 外部传入的 prop 数组）
const internalExpandedKeys = ref<string[]>([
  ...(props.expandedKeys ?? props.defaultExpandedKeys ?? []),
]);
const internalSelectedKeys = ref<string[]>([
  ...(props.selectedKeys ?? props.defaultSelectedKeys ?? []),
]);
const internalCheckedKeys = ref<string[]>([
  ...(props.checkedKeys ?? props.defaultCheckedKeys ?? []),
]);
const halfCheckedKeys = ref<string[]>([]);

// 节点映射
const nodeMap = computed(() => {
  const map = new Map<string, TreeNode>();
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      map.set(node.key, node);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(props.data);
  return map;
});

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

const viewportStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  overflowY: 'auto' as const,
}));

// 扁平化所有当前可见节点（携带层级），仅展开的分支才向下递归
const flattenedNodes = computed<{ node: TreeNode; level: number }[]>(() => {
  const result: { node: TreeNode; level: number }[] = [];
  const walk = (nodes: TreeNode[], level: number) => {
    for (const node of nodes) {
      result.push({ node, level });
      if (
        node.children &&
        node.children.length > 0 &&
        internalExpandedKeys.value.includes(node.key)
      ) {
        walk(node.children, level + 1);
      }
    }
  };
  walk(filteredData.value, 0);
  return result;
});

const virtualRange = computed(() => {
  const total = flattenedNodes.value.length;
  const viewport = typeof props.height === 'number' ? props.height : 400;
  const buffer = props.virtualBuffer;
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - buffer);
  const visibleCount = Math.ceil(viewport / props.itemHeight) + buffer * 2;
  const end = Math.min(total, start + visibleCount);
  return { start, end };
});

const virtualNodes = computed(() =>
  flattenedNodes.value.slice(virtualRange.value.start, virtualRange.value.end)
);

const topSpacerHeight = computed(() => virtualRange.value.start * props.itemHeight);
const totalSpacerHeight = computed(() => flattenedNodes.value.length * props.itemHeight);

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
  if (virtualRaf !== null) {
    cancelAnimationFrame(virtualRaf);
    virtualRaf = null;
  }
});

// 监听外部变化
watch(
  () => props.expandedKeys,
  val => {
    if (val !== undefined) {
      internalExpandedKeys.value = [...val];
    }
  }
);

watch(
  () => props.selectedKeys,
  val => {
    if (val !== undefined) {
      internalSelectedKeys.value = [...val];
    }
  }
);

watch(
  () => props.checkedKeys,
  val => {
    if (val !== undefined) {
      internalCheckedKeys.value = [...val];
      updateHalfCheckedKeys();
    }
  }
);

// 暴露的方法（需要在 watch 之前定义）
const expandAll = () => {
  const keys: string[] = [];
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key);
        traverse(node.children);
      }
    });
  };
  traverse(props.data);
  internalExpandedKeys.value = keys;
  emit('update:expandedKeys', keys);
};

// 默认展开所有
watch(
  () => props.defaultExpandAll,
  val => {
    if (val) {
      expandAll();
    }
  },
  { immediate: true }
);

// 更新半选状态
const updateHalfCheckedKeys = () => {
  if (props.checkStrictly) {
    halfCheckedKeys.value = [];
    return;
  }

  const half = new Set<string>();
  const checked = new Set(internalCheckedKeys.value);

  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        const childKeys = getAllChildKeys(node);
        const checkedCount = childKeys.filter(key => checked.has(key)).length;

        if (checkedCount > 0 && checkedCount < childKeys.length) {
          half.add(node.key);
        }

        traverse(node.children);
      }
    });
  };

  traverse(props.data);
  halfCheckedKeys.value = Array.from(half);
};

// 获取所有子节点的 key
const getAllChildKeys = (node: TreeNode): string[] => {
  const keys: string[] = [];
  const traverse = (n: TreeNode) => {
    keys.push(n.key);
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
  const findParent = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.children) {
        if (node.children.some(child => child.key === targetKey)) {
          return node;
        }
        const parent = findParent(node.children, targetKey);
        if (parent) return parent;
      }
    }
    return null;
  };

  let currentKey = key;
  while (true) {
    const parent = findParent(props.data, currentKey);
    if (!parent) break;
    keys.push(parent.key);
    currentKey = parent.key;
  }

  return keys;
};

// 处理展开/收起（不可变更新 + emit 拷贝，避免外泄内部引用）
const handleToggle = (node: TreeNode, expanded: boolean) => {
  const has = internalExpandedKeys.value.includes(node.key);

  if (expanded && !has) {
    internalExpandedKeys.value = [...internalExpandedKeys.value, node.key];
  } else if (!expanded && has) {
    internalExpandedKeys.value = internalExpandedKeys.value.filter(k => k !== node.key);
  } else {
    return;
  }

  emit('update:expandedKeys', [...internalExpandedKeys.value]);
  emit('expand', [...internalExpandedKeys.value], node, expanded);
};

// 处理选择
const handleSelect = (node: TreeNode, selected: boolean) => {
  if (!props.selectable || node.disabled || node.selectable === false) return;

  if (props.multiple) {
    const has = internalSelectedKeys.value.includes(node.key);
    if (selected && !has) {
      internalSelectedKeys.value = [...internalSelectedKeys.value, node.key];
    } else if (!selected && has) {
      internalSelectedKeys.value = internalSelectedKeys.value.filter(k => k !== node.key);
    }
  } else {
    internalSelectedKeys.value = selected ? [node.key] : [];
  }

  emit('update:selectedKeys', [...internalSelectedKeys.value]);
  emit('select', [...internalSelectedKeys.value], node, selected);
};

// 处理勾选
const handleCheck = (node: TreeNode, checked: boolean) => {
  if (!props.checkable || node.disabled || node.checkable === false) return;

  const checkedSet = new Set(internalCheckedKeys.value);

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
          const allChildrenChecked = parentNode.children.every(child => checkedSet.has(child.key));
          if (allChildrenChecked) {
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

  internalCheckedKeys.value = Array.from(checkedSet);
  updateHalfCheckedKeys();

  emit('update:checkedKeys', [...internalCheckedKeys.value]);
  emit('check', [...internalCheckedKeys.value], node, checked);
};

// 处理节点点击
const handleNodeClick = (node: TreeNode, event: MouseEvent) => {
  emit('node-click', node, event);
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
  // 子组件只携带 key 透传，这里用 nodeMap 还原出完整的拖拽节点
  const resolvedDragNode = nodeMap.value.get(dragNode.key) ?? dragNode;
  emit('node-drop', resolvedDragNode, dropNode, position, event);
};

// 其他暴露的方法
const getSelectedNodes = (): TreeNode[] => {
  return internalSelectedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getCheckedNodes = (): TreeNode[] => {
  return internalCheckedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getHalfCheckedNodes = (): TreeNode[] => {
  return halfCheckedKeys.value
    .map(key => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const setSelected = (key: string, selected: boolean) => {
  const node = nodeMap.value.get(key);
  if (node) {
    handleSelect(node, selected);
  }
};

const setChecked = (key: string, checked: boolean) => {
  const node = nodeMap.value.get(key);
  if (node) {
    handleCheck(node, checked);
  }
};

const setExpanded = (key: string, expanded: boolean) => {
  const node = nodeMap.value.get(key);
  if (node) {
    handleToggle(node, expanded);
  }
};

const getNode = (key: string): TreeNode | null => {
  return nodeMap.value.get(key) || null;
};

const collapseAll = () => {
  internalExpandedKeys.value = [];
  emit('update:expandedKeys', []);
};

const filter = (value: string) => {
  filterValue.value = value;

  // 过滤时自动展开命中节点的所有祖先，确保命中项可见
  if (value && props.filterNodeMethod) {
    const toExpand = new Set(internalExpandedKeys.value);
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
    internalExpandedKeys.value = Array.from(toExpand);
    emit('update:expandedKeys', [...internalExpandedKeys.value]);
  }
};

const getElement = () => treeRef.value || null;

// 提供给子组件
provide('tree', {
  props,
  nodeMap,
});

defineExpose<ExTreeExposed>({
  getSelectedNodes,
  getCheckedNodes,
  getHalfCheckedNodes,
  setSelected,
  setChecked,
  setExpanded,
  getNode,
  expandAll,
  collapseAll,
  filter,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTree.scss"></style>
