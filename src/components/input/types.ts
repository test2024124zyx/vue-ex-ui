import type { VNodeChild } from 'vue';

/** 原生单行输入类型，以及由组件切换渲染的 textarea。 */
export type InputType =
  'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'textarea';

export type InputSize = 'small' | 'medium' | 'large';
export type InputStatus = 'default' | 'success' | 'warning' | 'error';
export type InputVariant = 'neon' | 'ghost' | 'filled';
export type InputModelValue = string | number;
export type InputValidateTrigger = 'input' | 'change' | 'blur' | 'manual';

export interface InputModelModifiers {
  number?: boolean;
  trim?: boolean;
  lazy?: boolean;
}

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
  /** neon 变体的终端提示符文本。 */
  prompt?: string;
  /** 是否显示 neon 变体的终端提示符；存在 prefix 插槽时不重复显示。 */
  showPrompt?: boolean;
  /** 支持字符串或数字初值；未使用 number 修饰符时编辑模型仍返回字符串。 */
  modelValue?: InputModelValue;
  /** Vue v-model 支持的 trim、number 与 lazy 修饰符。 */
  modelModifiers?: InputModelModifiers;
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
  /** 本地 rules 的校验时机，默认失焦校验，manual 仅通过 exposed.validate 触发。 */
  validateTrigger?: InputValidateTrigger | InputValidateTrigger[];
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
  'update:modelValue': [value: InputModelValue];
  input: [value: InputModelValue, event: Event];
  change: [value: InputModelValue, event: Event];
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
