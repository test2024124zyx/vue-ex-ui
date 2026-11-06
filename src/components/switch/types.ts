import type { VNode } from 'vue';

// ============================================================================
// 基础类型定义
// ============================================================================

export type SwitchValue = boolean | string | number;
export type SwitchSize = 'small' | 'medium' | 'large';
export type SwitchStatus = 'success' | 'warning' | 'error';

// ============================================================================
// Switch 组件 Props
// ============================================================================

export interface ExSwitchProps {
  /** 绑定值 */
  modelValue?: SwitchValue;
  /** 开关打开时的值 */
  activeValue?: SwitchValue;
  /** 开关关闭时的值 */
  inactiveValue?: SwitchValue;
  /** 开关打开时的文字描述 */
  activeText?: string;
  /** 开关关闭时的文字描述 */
  inactiveText?: string;
  /** 开关打开时的颜色 */
  activeColor?: string;
  /** 开关关闭时的颜色 */
  inactiveColor?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 开关大小 */
  size?: SwitchSize;
  /** 是否显示内联文本 */
  inlinePrompt?: boolean;
  /** 开关宽度 */
  width?: number | string;
  /** 验证状态 */
  validateStatus?: SwitchStatus;
  /** 是否必填 */
  required?: boolean;
  /** 原生 name 属性 */
  name?: string;
  /** 原生 id 属性 */
  id?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 无障碍描述 */
  ariaDescribedby?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// Switch 组件 Emits
// ============================================================================

export interface ExSwitchEmits {
  /** 值改变时触发 */
  'update:modelValue': [value: SwitchValue];
  /** 值改变时触发 */
  change: [value: SwitchValue];
  /** 获得焦点时触发 */
  focus: [event: FocusEvent];
  /** 失去焦点时触发 */
  blur: [event: FocusEvent];
  /** 键盘事件触发 */
  keydown: [event: KeyboardEvent];
}

// ============================================================================
// Switch 组件 Slots
// ============================================================================

export interface ExSwitchSlots {
  /** 开关打开时的内容 */
  active?: () => VNode[];
  /** 开关关闭时的内容 */
  inactive?: () => VNode[];
}

// ============================================================================
// Switch 组件实例
// ============================================================================

export interface ExSwitchInstance {
  /** 聚焦开关 */
  focus: () => void;
  /** 失焦开关 */
  blur: () => void;
  /** 切换开关状态 */
  toggle: () => void;
}
