import type { VNodeChild } from 'vue';

/** 原生单行输入类型，以及由组件切换渲染的 textarea。 */
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea';

export type InputSize = 'small' | 'medium' | 'large';
export type InputStatus = 'default' | 'success' | 'warning' | 'error';
export type InputVariant = 'neon' | 'ghost' | 'filled';
export type InputModelValue = string | number;

/** 文本域自动高度配置；最大行数小于最小行数时按最小行数处理。 */
export type InputAutosize =
  | boolean
  | {
      minRows?: number;
      maxRows?: number;
    };

export interface ExInputProps {
  /** 真实输入控件 ID，同时用于标签和消息关联。 */
  id?: string;
  type?: InputType;
  size?: InputSize;
  status?: InputStatus;
  variant?: InputVariant;
  /** 数字仅作为初值兼容；用户编辑事件始终返回字符串。 */
  modelValue?: InputModelValue;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  /** 仅在 type="password" 时渲染可见性切换按钮。 */
  showPassword?: boolean;
  maxlength?: number;
  minlength?: number;
  showWordLimit?: boolean;
  prepend?: string;
  append?: string;
  autofocus?: boolean;
  autocomplete?: string;
  rules?: ValidationRule[];
  errorMessage?: string;
  helpText?: string;
  label?: string;
  required?: boolean;
  rows?: number;
  autosize?: InputAutosize;
  /** 将模型字符串转换为控件显示字符串。 */
  formatter?: (value: string) => string;
  /** 将控件显示字符串转换为模型字符串。 */
  parser?: (value: string) => string;
}

export interface ExInputEmits {
  'update:modelValue': [value: string];
  input: [value: string, event: Event];
  change: [value: string, event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
  enter: [event: KeyboardEvent];
  'validation-error': [error: string];
}

export interface ExInputSlots {
  prefix?: () => VNodeChild;
  suffix?: () => VNodeChild;
  prepend?: () => VNodeChild;
  append?: () => VNodeChild;
  label?: () => VNodeChild;
  help?: () => VNodeChild;
  error?: () => VNodeChild;
}

export type ValidationResult = boolean | string;
export type ValidationRule = (value: string) => ValidationResult;

export interface ExInputExposed {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  select: () => void;
  clear: () => void;
  validate: () => boolean;
  getInputElement: () => HTMLInputElement | HTMLTextAreaElement | null;
}
