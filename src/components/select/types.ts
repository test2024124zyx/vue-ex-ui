/**
 * ExSelect 组件类型定义
 * 游戏主题选择器组件
 */

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 搜索关键词 */
  keywords?: string[];
  /** 额外数据 */
  [key: string]: unknown;
}

export interface SelectOptionGroup {
  /** 分组稳定标识，动态调整组内数据时可保持插槽实例。 */
  key?: string | number;
  /** 分组标签 */
  label: string;
  /** 分组选项 */
  options: SelectOption[];
}

export type SelectOptions = Array<SelectOption | SelectOptionGroup>;

/** 选择器绑定值：单选为标量，多选为数组 */
export type SelectValue = string | number | null | Array<string | number>;

export interface ExSelectProps {
  /** 绑定值（单选为标量，多选为数组） */
  modelValue?: SelectValue;
  /** 选项数据 */
  options?: SelectOptions;
  /** 占位符 */
  placeholder?: string;
  /** 原生控件标识；会绑定到实际可交互的触发器或搜索输入框 */
  id?: string;
  /** 尺寸 */
  size?: SelectSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读；只读状态仍可获得焦点，但不会打开或改变选项 */
  readonly?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否为远程搜索（由 remoteMethod 拉取选项；关闭本地过滤） */
  remote?: boolean;
  /** 远程搜索方法：输入变化时调用，父级据此更新 options */
  remoteMethod?: (query: string) => void;
  /** 加载中（远程搜索时由父级控制） */
  loading?: boolean;
  /** 远程搜索防抖（毫秒），默认 300 */
  remoteDebounce?: number;
  /** 是否多选 */
  multiple?: boolean;
  /** 多选时最多可选数量（0 表示不限制） */
  multipleLimit?: number;
  /** 多选时是否折叠标签（仅显示第一个，其余以 +N 计数） */
  collapseTags?: boolean;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /**
   * 是否对选项启用虚拟滚动，支持普通选项和分组选项。
   * 适用于上千选项的大列表，避免一次性渲染全部 DOM 导致卡顿。默认 false。
   */
  virtual?: boolean;
  /** 虚拟滚动时单个选项的固定高度（像素），默认 44；自定义值必须与实际行高一致 */
  optionHeight?: number;
}

export interface ExSelectSlots {
  /** 选项展示内容，不放置独立交互控件；选择语义由外层选项节点维护。 */
  option?: (scope: { option: SelectOption; index: number; selected: boolean }) => unknown;
  /** 单选值的展示内容，搜索输入仍使用字符串标签。 */
  label?: (scope: { option: SelectOption }) => unknown;
  /** 多选标签内容，删除按钮仍由组件维护。 */
  tag?: (scope: { option: SelectOption }) => unknown;
  /** 分组标题内容，虚拟滚动时与普通选项采用同一固定行高。 */
  group?: (scope: { group: SelectOptionGroup }) => unknown;
  /** 空列表内容。 */
  empty?: () => unknown;
  /** 加载中的内容。 */
  loading?: () => unknown;
}

export interface ExSelectEmits {
  /** 值变化事件 */
  (e: 'update:modelValue', value: SelectValue): void;
  /** 选择变化事件（多选时 value 为数组，option 为当前已选选项数组） */
  (e: 'change', value: SelectValue, option: SelectOption | SelectOption[] | null): void;
  /** 多选时移除标签 */
  (e: 'remove-tag', value: string | number): void;
  /** 清空事件 */
  (e: 'clear'): void;
  /** 聚焦事件 */
  (e: 'focus', event: FocusEvent): void;
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void;
  /** 下拉显示状态变化 */
  (e: 'visible-change', visible: boolean): void;
}

export interface ExSelectExposed {
  /** 使选择器获取焦点 */
  focus: () => void;
  /** 使选择器失去焦点 */
  blur: () => void;
  /** 显示下拉菜单 */
  showDropdown: () => void;
  /** 隐藏下拉菜单 */
  hideDropdown: () => void;
}
