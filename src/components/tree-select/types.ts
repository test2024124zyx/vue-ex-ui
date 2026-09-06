/** 树选择节点 */
export interface TreeSelectNode {
  /** 节点值（唯一） */
  value: string | number;
  /** 节点显示文本 */
  label: string;
  /** 子节点 */
  children?: TreeSelectNode[];
  /** 是否禁用 */
  disabled?: boolean;
}

/** 树选择尺寸 */
export type TreeSelectSize = 'small' | 'medium' | 'large';

/** 单选 / 多选的值类型 */
export type TreeSelectValue = string | number | Array<string | number> | null;

/**
 * TreeSelect 组件属性
 */
export interface ExTreeSelectProps {
  /** 绑定值：单选为值，多选为值数组 */
  modelValue?: TreeSelectValue;
  /** 树形数据 */
  data?: TreeSelectNode[];
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
}
