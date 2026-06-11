<template>
  <div
    ref="treeRef"
    :class="treeClasses"
    :style="treeStyles"
    role="tree"
  >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue';
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
});

const emit = defineEmits<ExTreeEmits>();

const treeRef = ref<HTMLDivElement>();
const filterValue = ref('');

// 内部状态
const internalExpandedKeys = ref<string[]>(
  props.expandedKeys || props.defaultExpandedKeys || []
);
const internalSelectedKeys = ref<string[]>(
  props.selectedKeys || props.defaultSelectedKeys || []
);
const internalCheckedKeys = ref<string[]>(
  props.checkedKeys || props.defaultCheckedKeys || []
);
const halfCheckedKeys = ref<string[]>([]);

// 节点映射
const nodeMap = computed(() => {
  const map = new Map<string, TreeNode>();
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
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

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const treeStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 监听外部变化
watch(
  () => props.expandedKeys,
  (val) => {
    if (val !== undefined) {
      internalExpandedKeys.value = [...val];
    }
  }
);

watch(
  () => props.selectedKeys,
  (val) => {
    if (val !== undefined) {
      internalSelectedKeys.value = [...val];
    }
  }
);

watch(
  () => props.checkedKeys,
  (val) => {
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
    nodes.forEach((node) => {
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
  (val) => {
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
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        const childKeys = getAllChildKeys(node);
        const checkedCount = childKeys.filter((key) => checked.has(key)).length;

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
        if (node.children.some((child) => child.key === targetKey)) {
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

// 处理展开/收起
const handleToggle = (node: TreeNode, expanded: boolean) => {
  const index = internalExpandedKeys.value.indexOf(node.key);

  if (expanded && index === -1) {
    internalExpandedKeys.value.push(node.key);
  } else if (!expanded && index > -1) {
    internalExpandedKeys.value.splice(index, 1);
  }

  emit('update:expandedKeys', internalExpandedKeys.value);
  emit('expand', internalExpandedKeys.value, node, expanded);
};

// 处理选择
const handleSelect = (node: TreeNode, selected: boolean) => {
  if (!props.selectable || node.disabled || node.selectable === false) return;

  if (props.multiple) {
    const index = internalSelectedKeys.value.indexOf(node.key);
    if (selected && index === -1) {
      internalSelectedKeys.value.push(node.key);
    } else if (!selected && index > -1) {
      internalSelectedKeys.value.splice(index, 1);
    }
  } else {
    internalSelectedKeys.value = selected ? [node.key] : [];
  }

  emit('update:selectedKeys', internalSelectedKeys.value);
  emit('select', internalSelectedKeys.value, node, selected);
};

// 处理勾选
const handleCheck = (node: TreeNode, checked: boolean) => {
  if (!props.checkable || node.disabled || node.checkable === false) return;

  const checkedSet = new Set(internalCheckedKeys.value);

  if (checked) {
    checkedSet.add(node.key);
    if (!props.checkStrictly) {
      // 级联勾选子节点
      getAllChildKeys(node).forEach((key) => checkedSet.add(key));
      // 级联勾选父节点
      const parentKeys = getAllParentKeys(node.key);
      parentKeys.forEach((parentKey) => {
        const parentNode = nodeMap.value.get(parentKey);
        if (parentNode?.children) {
          const allChildrenChecked = parentNode.children.every((child) =>
            checkedSet.has(child.key)
          );
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
      getAllChildKeys(node).forEach((key) => checkedSet.delete(key));
      // 级联取消父节点
      getAllParentKeys(node.key).forEach((key) => checkedSet.delete(key));
    }
  }

  internalCheckedKeys.value = Array.from(checkedSet);
  updateHalfCheckedKeys();

  emit('update:checkedKeys', internalCheckedKeys.value);
  emit('check', internalCheckedKeys.value, node, checked);
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
  emit('node-drop', dragNode, dropNode, position, event);
};

// 其他暴露的方法
const getSelectedNodes = (): TreeNode[] => {
  return internalSelectedKeys.value
    .map((key) => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getCheckedNodes = (): TreeNode[] => {
  return internalCheckedKeys.value
    .map((key) => nodeMap.value.get(key))
    .filter((node): node is TreeNode => node !== undefined);
};

const getHalfCheckedNodes = (): TreeNode[] => {
  return halfCheckedKeys.value
    .map((key) => nodeMap.value.get(key))
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
