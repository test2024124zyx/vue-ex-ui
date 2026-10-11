import type { VNode } from 'vue';

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

/** 异步子节点请求的取消上下文。 */
export interface TreeLoadContext {
  /** 收起、重载、数据替换或卸载时取消；加载函数也应将信号传给请求。 */
  signal: AbortSignal;
}

/** 返回当前节点的完整子节点列表，空数组表示已确认没有子节点。 */
export type TreeLoadData = (node: TreeNode, context: TreeLoadContext) => Promise<TreeNode[]>;

/** 节点加载状态快照；取消恢复 idle，失败保留 error 供调用方展示。 */
export interface TreeNodeLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error?: unknown;
}

/**
 * 树组件属性
 */
export interface ExTreeProps {
  /** 树节点数据 */
  data: TreeNode[];
  /** 异步加载子节点；isLeaf:false 的未知分支在展开后首次加载。 */
  loadData?: TreeLoadData;
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
  /** 树容器的无障碍名称。 */
  ariaLabel?: string;
  /** 是否虚拟滚动（大数据量时仅渲染可视窗口内的节点） */
  virtual?: boolean;
  /** 节点行高（虚拟滚动时使用，像素） */
  itemHeight?: number;
  /** 虚拟滚动视口高度（像素或 CSS 值），默认 400 */
  height?: number | string;
  /** 虚拟滚动视口上下额外渲染的缓冲行数，默认 6 */
  virtualBuffer?: number;
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
  /** 子节点成功加载并纳入当前树后触发。 */
  load: [node: TreeNode, children: TreeNode[]];
  /** 请求或返回数据校验失败时触发；取消不会触发。 */
  'load-error': [error: unknown, node: TreeNode];
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
  'node-drop': [
    dragNode: TreeNode,
    dropNode: TreeNode,
    position: 'before' | 'after' | 'inner',
    event: DragEvent,
  ];
}

/** 树节点内容插槽。 */
export interface ExTreeSlots {
  default?: (props: { node: TreeNode }) => VNode[];
}

/**
 * 树组件暴露的方法
 */
export interface ExTreeExposed {
  /** 重新加载节点，保留旧子树直到成功；取消、失败或节点不可加载时返回 false。 */
  reloadNode: (key: string) => Promise<boolean>;
  /** 取消节点正在进行的请求，不清除已成功加载的数据。 */
  cancelNodeLoad: (key: string) => boolean;
  /** 获取节点加载状态的隔离快照。 */
  getNodeLoadState: (key: string) => TreeNodeLoadState;
  /** 获取当前选中的节点 */
  getSelectedNodes: () => TreeNode[];
  /** 获取当前勾选的节点 */
  getCheckedNodes: () => TreeNode[];
  /** 获取半选中的节点 */
  getHalfCheckedNodes: () => TreeNode[];
  /** 请求父级或内部状态更新某个节点的选择状态；返回是否接受请求。 */
  requestNodeSelection: (key: string, selected: boolean) => boolean;
  /** 请求父级或内部状态更新某个节点的勾选状态；返回是否接受请求。 */
  requestNodeCheck: (key: string, checked: boolean) => boolean;
  /** 请求父级或内部状态更新某个节点的展开状态；返回是否接受请求。 */
  requestNodeExpansion: (key: string, expanded: boolean) => boolean;
  /** 获取节点 */
  getNode: (key: string) => TreeNode | null;
  /** 请求展开所有可展开节点。 */
  requestExpandAll: () => void;
  /** 请求收起所有节点。 */
  requestCollapseAll: () => void;
  /** 过滤节点 */
  filter: (value: string) => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
