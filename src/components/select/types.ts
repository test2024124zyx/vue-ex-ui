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
  /** 分组标签 */
  label: string;
  /** 分组选项 */
  options: SelectOption[];
}

export type SelectOptions = Array<SelectOption | SelectOptionGroup>;

export interface ExSelectProps {
  /** 绑定值 */
  modelValue?: string | number | null;
  /** 选项数据 */
  options?: SelectOptions;
  /** 占位符 */
  placeholder?: string;
  /** 尺寸 */
  size?: SelectSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

export interface ExSelectEmits {
  /** 值变化事件 */
  (e: 'update:modelValue', value: string | number | null): void;
  /** 选择变化事件 */
  (e: 'change', value: string | number | null, option: SelectOption | null): void;
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
