/** 树选择节点 */
export interface TreeSelectNode {
  /** 节点值（唯一） */
  value: string | number;
  /** 节点显示文本 */
  label: string;
  /** 子节点 */
  children?: TreeSelectNode[];
  /** 是否禁用；禁用节点及其整个子树均不可交互 */
  disabled?: boolean;
  /** false 表示子节点尚未加载；空结果加载成功后自动视为叶子。 */
  isLeaf?: boolean;
}

export interface TreeSelectLoadContext {
  /** 收起、关闭、禁用、数据替换和卸载时中止。 */
  signal: AbortSignal;
  /** 当前节点的完整值路径。 */
  path: Array<string | number>;
}
export type TreeSelectLoadData = (
  node: TreeSelectNode,
  context: TreeSelectLoadContext
) => Promise<TreeSelectNode[]>;
export interface TreeSelectLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error?: unknown;
}

/** 树选择尺寸 */
export type TreeSelectSize = 'small' | 'medium' | 'large';

/** 单选 / 多选的值类型 */
export type TreeSelectValue = string | number | Array<string | number> | null;

/**
 * TreeSelect 组件属性
 */
export interface ExTreeSelectProps {
  /** 绑定值：单选为值、多选为数组；undefined 为非受控，null 为显式受控空值 */
  modelValue?: TreeSelectValue;
  /** 树形数据 */
  data?: TreeSelectNode[];
  /** 异步加载子节点，输入数据不会被原地改写。 */
  loadData?: TreeSelectLoadData;
  /** 只渲染可视窗口内的树节点。 */
  virtual?: boolean;
  /** 树区域高度，单位像素。 */
  height?: number;
  /** 虚拟节点行高，单位像素，须与实际内容一致。 */
  itemHeight?: number;
  /** 虚拟窗口上下预渲染节点数量。 */
  virtualBuffer?: number;
  /** 是否多选（显示复选框） */
  multiple?: boolean;
  /** 多选时父子节点选中状态不再关联 */
  checkStrictly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 触发器原生 ID */
  id?: string;
  /** 触发器无障碍名称 */
  ariaLabel?: string;
  /** 触发器与树弹层的外部标签元素 ID */
  ariaLabelledby?: string;
  /** 触发器无障碍描述元素 ID */
  ariaDescribedby?: string;
  /** 是否可搜索过滤 */
  filterable?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 尺寸 */
  size?: TreeSelectSize;
  /** 是否默认展开全部节点 */
  defaultExpandAll?: boolean;
  /** 多选时是否折叠超出的标签 */
  collapseTags?: boolean;
  /** 弹层是否传送到 body */
  teleported?: boolean;
  /** 弹层自定义类名 */
  popperClass?: string;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * TreeSelect 组件事件
 */
export interface ExTreeSelectEmits {
  /** 更新绑定值 */
  'update:modelValue': [value: TreeSelectValue];
  /** 值变化 */
  change: [value: TreeSelectValue, nodes: TreeSelectNode | TreeSelectNode[] | null];
  /** 面板显隐变化 */
  'visible-change': [visible: boolean];
  /** 节点展开/收起 */
  expand: [keys: Array<string | number>];
  /** 获得焦点 */
  focus: [event: FocusEvent];
  /** 失去焦点 */
  blur: [event: FocusEvent];
  /** 清空 */
  clear: [];
  /** 子节点成功加载。 */
  load: [node: TreeSelectNode, children: TreeSelectNode[]];
  /** 子节点加载或返回结构校验失败。 */
  'load-error': [error: unknown, node: TreeSelectNode];
}

/**
 * TreeSelect 暴露方法
 */
export interface ExTreeSelectExposed {
  /** 聚焦 */
  focus: () => void;
  /** 失焦 */
  blur: () => void;
  /** 展开全部 */
  expandAll: () => void;
  /** 收起全部 */
  collapseAll: () => void;
  /** 强制重载节点，成功返回 true；当前面板必须打开且可交互。 */
  reloadNode: (value: string | number) => Promise<boolean>;
  /** 中止指定节点的在途加载。 */
  cancelNodeLoad: (value: string | number) => boolean;
  /** 获取独立加载状态快照。 */
  getNodeLoadState: (value: string | number) => TreeSelectLoadState;
}
