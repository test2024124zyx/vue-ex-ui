/**
 * 树节点数据
 */
export interface TreeNode {
  /** 节点唯一标识 */
  key: string;
  /** 节点标题 */
  label: string;
  /** 子节点 */
  children?: TreeNode[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否可勾选 */
  checkable?: boolean;
  /** 是否为叶子节点 */
  isLeaf?: boolean;
  /** 图标 */
  icon?: string;
  /** 自定义数据 */
  data?: unknown;
}

/**
 * 树组件属性
 */
export interface ExTreeProps {
  /** 树节点数据 */
  data: TreeNode[];
  /** 默认展开的节点 key 数组 */
  defaultExpandedKeys?: string[];
  /** 展开的节点 key 数组（受控） */
  expandedKeys?: string[];
  /** 默认选中的节点 key 数组 */
  defaultSelectedKeys?: string[];
  /** 选中的节点 key 数组（受控） */
  selectedKeys?: string[];
  /** 默认勾选的节点 key 数组 */
  defaultCheckedKeys?: string[];
  /** 勾选的节点 key 数组（受控） */
  checkedKeys?: string[];
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否显示复选框 */
  checkable?: boolean;
  /** 勾选时是否级联 */
  checkStrictly?: boolean;
  /** 是否默认展开所有节点 */
  defaultExpandAll?: boolean;
  /** 是否显示连接线 */
  showLine?: boolean;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否虚拟滚动 */
  virtual?: boolean;
  /** 节点高度（虚拟滚动时使用） */
  itemHeight?: number;
  /** 过滤函数 */
  filterNodeMethod?: (value: string, node: TreeNode) => boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 树组件事件
 */
export interface ExTreeEmits {
  /** 展开/收起节点时触发 */
  'update:expandedKeys': [keys: string[]];
  /** 选中节点时触发 */
  'update:selectedKeys': [keys: string[]];
  /** 勾选节点时触发 */
  'update:checkedKeys': [keys: string[]];
  /** 节点展开时触发 */
  expand: [expandedKeys: string[], node: TreeNode, expanded: boolean];
  /** 节点选中时触发 */
  select: [selectedKeys: string[], node: TreeNode, selected: boolean];
  /** 节点勾选时触发 */
  check: [checkedKeys: string[], node: TreeNode, checked: boolean];
  /** 节点点击时触发 */
  'node-click': [node: TreeNode, event: MouseEvent];
  /** 节点右键点击时触发 */
  'node-contextmenu': [node: TreeNode, event: MouseEvent];
  /** 节点拖拽开始时触发 */
  'node-drag-start': [node: TreeNode, event: DragEvent];
  /** 节点拖拽进入时触发 */
  'node-drag-enter': [node: TreeNode, event: DragEvent];
  /** 节点拖拽离开时触发 */
  'node-drag-leave': [node: TreeNode, event: DragEvent];
  /** 节点拖拽结束时触发 */
  'node-drag-end': [node: TreeNode, event: DragEvent];
  /** 节点放置时触发 */
  'node-drop': [dragNode: TreeNode, dropNode: TreeNode, position: 'before' | 'after' | 'inner', event: DragEvent];
}

/**
 * 树组件暴露的方法
 */
export interface ExTreeExposed {
  /** 获取当前选中的节点 */
  getSelectedNodes: () => TreeNode[];
  /** 获取当前勾选的节点 */
  getCheckedNodes: () => TreeNode[];
  /** 获取半选中的节点 */
  getHalfCheckedNodes: () => TreeNode[];
  /** 设置某个节点的选中状态 */
  setSelected: (key: string, selected: boolean) => void;
  /** 设置某个节点的勾选状态 */
  setChecked: (key: string, checked: boolean) => void;
  /** 设置某个节点的展开状态 */
  setExpanded: (key: string, expanded: boolean) => void;
  /** 获取节点 */
  getNode: (key: string) => TreeNode | null;
  /** 展开所有节点 */
  expandAll: () => void;
  /** 收起所有节点 */
  collapseAll: () => void;
  /** 过滤节点 */
  filter: (value: string) => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
