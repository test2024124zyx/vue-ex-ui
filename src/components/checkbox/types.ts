import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

export type CheckboxValue = boolean | string | number;
export type CheckboxSize = 'small' | 'medium' | 'large';
export type CheckboxStatus = 'default' | 'success' | 'warning' | 'error';

// ============================================================================
// Checkbox 组件 Props
// ============================================================================

export interface ExCheckboxProps {
  /** 绑定值 */
  modelValue?: boolean | string | number;
  /** 选中状态的值 */
  trueValue?: boolean | string | number;
  /** 未选中状态的值 */
  falseValue?: boolean | string | number;
  /** 复选框的值（在 CheckboxGroup 中使用） */
  value?: string | number;
  /** 复选框标签 */
  label?: string;
  /** 原生复选框的无障碍名称；无可见标签时必须提供。 */
  ariaLabel?: string;
  /** 组件大小 */
  size?: CheckboxSize;
  /** 组件状态 */
  status?: CheckboxStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否为中间状态 */
  indeterminate?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** 帮助文本 */
  helpText?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 表单验证规则 */
  rules?: Array<(value: CheckboxValue | CheckboxValue[]) => boolean | string>;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// Checkbox 组件 Emits
// ============================================================================

export interface ExCheckboxEmits {
  /** 值变化事件 */
  'update:modelValue': [value: boolean | string | number];
  /** 变化事件 */
  change: [value: boolean | string | number, event: Event];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
}

// ============================================================================
// Checkbox 组件 Slots
// ============================================================================

export interface ExCheckboxSlots {
  /** 默认插槽（标签内容） */
  default?: () => VNode[];
  /** 标签插槽 */
  label?: () => VNode[];
  /** 帮助文本插槽 */
  help?: () => VNode[];
  /** 错误信息插槽 */
  error?: () => VNode[];
}

// ============================================================================
// Checkbox 组件实例
// ============================================================================

export interface ExCheckboxInstance {
  /** 聚焦复选框 */
  focus: () => void;
  /** 失焦复选框 */
  blur: () => void;
  /** 获取复选框元素 */
  getCheckboxElement: () => HTMLInputElement | null;
}

// ============================================================================
// CheckboxGroup 组件 Props
// ============================================================================

export interface ExCheckboxGroupProps {
  /** 绑定值 */
  modelValue?: Array<string | number>;
  /** 选项列表 */
  options?: CheckboxOption[];
  /** 表单域 name 属性 */
  name?: string;
  /** 组件大小 */
  size?: CheckboxSize;
  /** 组件状态 */
  status?: CheckboxStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 最小选择数量 */
  min?: number;
  /** 最大选择数量 */
  max?: number;
  /** 是否垂直排列 */
  vertical?: boolean;
  /** 标签文本 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 帮助文本 */
  helpText?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 表单验证规则 */
  rules?: Array<(value: Array<string | number>) => boolean | string>;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// CheckboxGroup 选项
// ============================================================================

export interface CheckboxOption {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}

// ============================================================================
// CheckboxGroup 组件 Emits
// ============================================================================

export interface ExCheckboxGroupEmits {
  /** 值变化事件 */
  'update:modelValue': [value: Array<string | number>];
  /** 变化事件 */
  change: [value: Array<string | number>];
}

// ============================================================================
// CheckboxGroup 组件 Slots
// ============================================================================

export interface ExCheckboxGroupSlots {
  /** 默认插槽 */
  default?: () => VNode[];
  /** 选项插槽 */
  option?: (props: { option: CheckboxOption; index: number }) => VNode[];
  /** 标签插槽 */
  label?: () => VNode[];
  /** 帮助文本插槽 */
  help?: () => VNode[];
  /** 错误信息插槽 */
  error?: () => VNode[];
}

// ============================================================================
// CheckboxGroup 组件实例
// ============================================================================

export interface ExCheckboxGroupInstance {
  /** 全选 */
  checkAll: () => void;
  /** 取消全选 */
  uncheckAll: () => void;
  /** 反选 */
  toggleAll: () => void;
  /** 获取复选框组元素 */
  getCheckboxGroupElement: () => HTMLElement | null;
}
