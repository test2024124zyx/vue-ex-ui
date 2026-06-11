import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

export type RadioValue = string | number | boolean;
export type RadioSize = 'small' | 'medium' | 'large';
export type RadioStatus = 'default' | 'success' | 'warning' | 'error';

// ============================================================================
// Radio 组件 Props
// ============================================================================

export interface ExRadioProps {
  /** 绑定值 */
  modelValue?: RadioValue;
  /** 单选框的值 */
  value?: RadioValue;
  /** 单选框名称 */
  name?: string;
  /** 单选框标签 */
  label?: string;
  /** 组件大小 */
  size?: RadioSize;
  /** 组件状态 */
  status?: RadioStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** 帮助文本 */
  helpText?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 表单验证规则 */
  rules?: Array<(value: RadioValue) => boolean | string>;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// Radio 组件 Emits
// ============================================================================

export interface ExRadioEmits {
  /** 值变化事件 */
  'update:modelValue': [value: RadioValue];
  /** 变化事件 */
  change: [value: RadioValue, event: Event];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
}

// ============================================================================
// Radio 组件 Slots
// ============================================================================

export interface ExRadioSlots {
  /** 默认插槽（标签内容） */
  default?: () => VNode[];
  /** 帮助文本插槽 */
  help?: () => VNode[];
  /** 错误信息插槽 */
  error?: () => VNode[];
}

// ============================================================================
// Radio 组件实例
// ============================================================================

export interface ExRadioInstance {
  /** 聚焦单选框 */
  focus: () => void;
  /** 失焦单选框 */
  blur: () => void;
  /** 获取单选框元素 */
  getRadioElement: () => HTMLInputElement | null;
}

// ============================================================================
// RadioGroup 组件 Props
// ============================================================================

export interface ExRadioGroupProps {
  /** 绑定值 */
  modelValue?: RadioValue;
  /** 表单域 name 属性 */
  name?: string;
  /** 组件大小 */
  size?: RadioSize;
  /** 组件状态 */
  status?: RadioStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
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
  rules?: Array<(value: RadioValue) => boolean | string>;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// RadioGroup 组件 Emits
// ============================================================================

export interface ExRadioGroupEmits {
  /** 值变化事件 */
  'update:modelValue': [value: RadioValue];
  /** 变化事件 */
  change: [value: RadioValue];
}

// ============================================================================
// RadioGroup 组件 Slots
// ============================================================================

export interface ExRadioGroupSlots {
  /** 默认插槽 */
  default?: () => VNode[];
  /** 标签插槽 */
  label?: () => VNode[];
  /** 帮助文本插槽 */
  help?: () => VNode[];
  /** 错误信息插槽 */
  error?: () => VNode[];
}

// ============================================================================
// RadioGroup 组件实例
// ============================================================================

export interface ExRadioGroupInstance {
  /** 获取当前选中的值 */
  getValue: () => RadioValue;
  /** 设置选中的值 */
  setValue: (value: RadioValue) => void;
  /** 获取单选框组元素 */
  getRadioGroupElement: () => HTMLElement | null;
}
