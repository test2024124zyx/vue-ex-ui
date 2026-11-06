/**
 * 级联选择器选项
 */
export interface CascaderOption {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 子选项 */
  children?: CascaderOption[];
  /** 是否禁用；禁用节点及其整个子树均不可交互 */
  disabled?: boolean;
  /** false 表示仍可异步加载子项；成功返回空数组后自动视为叶子。 */
  isLeaf?: boolean;
  /** 自定义选项内容所需的业务附加字段。 */
  [key: string]: unknown;
}

export type CascaderPath = Array<string | number>;
export interface CascaderLoadContext {
  /** 离开分支、关闭、禁用或卸载时中止。 */
  signal: AbortSignal;
  /** 完整路径用于区分不同分支中相同的 value。 */
  path: CascaderPath;
}
export type CascaderLoadData = (
  option: CascaderOption,
  context: CascaderLoadContext
) => Promise<CascaderOption[]>;
export interface CascaderLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error?: unknown;
}

export interface ExCascaderSlots {
  /** 选项内容；列索引从零开始，选择与展开语义仍由组件维护。 */
  option?: (scope: {
    option: CascaderOption;
    level: number;
    selected: boolean;
    expanded: boolean;
  }) => unknown;
  /** 搜索结果的完整路径内容。 */
  'search-result'?: (scope: { labels: string[]; values: Array<string | number> }) => unknown;
  /** 无匹配搜索结果时的内容。 */
  empty?: () => unknown;
}

/**
 * 触发方式
 */
export type CascaderTrigger = 'click' | 'hover';

/**
 * 级联选择器尺寸
 */
export type CascaderSize = 'small' | 'medium' | 'large';

/**
 * 级联选择器组件属性接口
 */
export interface ExCascaderProps {
  /** 当前选中值；undefined 为非受控，null 为显式受控空值 */
  modelValue?: (string | number)[] | null;
  /** 真实输入控件的标识 */
  id?: string;
  /** 选项数据 */
  options?: CascaderOption[];
  /** 异步加载子项，完整路径作为缓存和请求身份。 */
  loadData?: CascaderLoadData;
  /** 多选使用独立 selectedPaths，保持单选 modelValue 的类型不变。 */
  multiple?: boolean;
  /** 多选受控路径；undefined 使用内部状态，空数组是显式受控空值。 */
  selectedPaths?: CascaderPath[];
  /** 多选时只显示首个标签和其余数量。 */
  collapseTags?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读；只读状态仍可聚焦，但不会打开或改变选项 */
  readonly?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否可搜索 */
  filterable?: boolean;
  /** 触发方式 */
  trigger?: CascaderTrigger;
  /** 尺寸 */
  size?: CascaderSize;
  /** 分隔符 */
  separator?: string;
  /** 是否显示完整路径 */
  showAllLevels?: boolean;
  /** 是否可以选择任意一级 */
  changeOnSelect?: boolean;
  /** 下拉面板是否传送到 body（默认 true，避免被祖先 overflow 裁剪） */
  teleported?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 级联选择器组件事件接口
 */
export interface ExCascaderEmits {
  /** 值变化事件 */
  'update:modelValue': [value: (string | number)[]];
  /** 选择变化事件 */
  change: [value: (string | number)[], selectedOptions: CascaderOption[]];
  /** 展开/收起事件 */
  'visible-change': [visible: boolean];
  /** 清空事件 */
  clear: [];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
  /** 多选请求更新完整路径集合。 */
  'update:selectedPaths': [paths: CascaderPath[]];
  /** 多选变更请求与每条完整选项路径。 */
  'selection-change': [paths: CascaderPath[], options: CascaderOption[][]];
  /** 异步子项成功加载。 */
  load: [option: CascaderOption, children: CascaderOption[], path: CascaderPath];
  /** 异步请求或返回结构校验失败。 */
  'load-error': [error: unknown, option: CascaderOption, path: CascaderPath];
}

/**
 * 级联选择器组件暴露的方法接口
 */
export interface ExCascaderExposed {
  /** 获取选中的选项 */
  getCheckedNodes: () => CascaderOption[];
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 使真实输入控件获得焦点 */
  focus: () => void;
  /** 使真实输入控件失去焦点 */
  blur: () => void;
  /** 显示下拉面板 */
  show: () => void;
  /** 隐藏下拉面板 */
  hide: () => void;
  /** 获取真实生效的多选路径快照。 */
  getCheckedPaths: () => CascaderPath[];
  /** 重载完整路径节点；要求面板打开且可交互。 */
  reloadNode: (path: CascaderPath) => Promise<boolean>;
  /** 中止指定完整路径的在途加载。 */
  cancelNodeLoad: (path: CascaderPath) => boolean;
  /** 返回该路径的独立加载状态快照。 */
  getNodeLoadState: (path: CascaderPath) => CascaderLoadState;
}
