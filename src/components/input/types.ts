import type { VNode } from 'vue';

/**
 * 输入框类型
 */
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea';

/**
 * 输入框尺寸
 */
export type InputSize = 'small' | 'medium' | 'large';

/**
 * 输入框状态
 */
export type InputStatus = 'default' | 'success' | 'warning' | 'error';

/**
 * 输入框变体（游戏风格）
 */
export type InputVariant = 'neon' | 'ghost' | 'filled';

/**
 * 输入框属性接口
 */
export interface ExInputProps {
  /** 输入框类型 */
  type?: InputType;
  /** 输入框大小 */
  size?: InputSize;
  /** 输入框状态 */
  status?: InputStatus;
  /** 输入框变体 */
  variant?: InputVariant;
  /** 输入框值 */
  modelValue?: string | number;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 是否显示密码切换按钮 */
  showPassword?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 最小长度 */
  minlength?: number;
  /** 是否显示字数统计 */
  showWordLimit?: boolean;
  /** 输入框前缀内容 */
  prepend?: string;
  /** 输入框后缀内容 */
  append?: string;
  /** 自动聚焦 */
  autofocus?: boolean;
  /** 自动完成 */
  autocomplete?: string;
  /** 表单验证规则 */
  rules?: ValidationRule[];
  /** 错误信息 */
  errorMessage?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 标签文本 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 文本域行数 */
  rows?: number;
  /** 文本域最小行数 */
  minRows?: number;
  /** 文本域最大行数 */
  maxRows?: number;
  /** 是否自适应高度 */
  autosize?: boolean | { minRows?: number; maxRows?: number };
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
  /** 格式化显示值 */
  formatter?: (value: string) => string;
  /** 解析实际值 */
  parser?: (value: string) => string;
}

/**
 * 输入框事件接口
 */
export interface ExInputEmits {
  /** 值变化事件 */
  'update:modelValue': [value: string | number];
  /** 输入事件 */
  input: [value: string | number, event: Event];
  /** 变化事件 */
  change: [value: string | number, event: Event];
  /** 聚焦事件 */
  focus: [event: FocusEvent];
  /** 失焦事件 */
  blur: [event: FocusEvent];
  /** 清除事件 */
  clear: [];
  /** 按键事件 */
  keydown: [event: KeyboardEvent];
  /** 按键抬起事件 */
  keyup: [event: KeyboardEvent];
  /** 回车事件 */
  enter: [event: KeyboardEvent];
  /** 验证错误事件 */
  'validation-error': [error: string];
}

/**
 * 输入框插槽接口
 */
export interface ExInputSlots {
  /** 前缀插槽 */
  prefix?: () => VNode[];
  /** 后缀插槽 */
  suffix?: () => VNode[];
  /** 前置内容插槽 */
  prepend?: () => VNode[];
  /** 后置内容插槽 */
  append?: () => VNode[];
  /** 标签插槽 */
  label?: () => VNode[];
  /** 帮助文本插槽 */
  help?: () => VNode[];
  /** 错误信息插槽 */
  error?: () => VNode[];
}

/**
 * 验证结果类型
 */
export type ValidationResult = boolean | string;

/**
 * 验证规则函数类型
 */
export type ValidationRule = (value: string | number) => ValidationResult;

/**
 * 输入框实例接口
 */
export interface ExInputInstance {
  /** 聚焦输入框 */
  focus: () => void;
  /** 失焦输入框 */
  blur: () => void;
  /** 选中输入框内容 */
  select: () => void;
  /** 清除输入框内容 */
  clear: () => void;
  /** 手动触发验证 */
  validate: () => boolean;
  /** 获取输入框元素 */
  getInputElement: () => HTMLInputElement | HTMLTextAreaElement | null;
}
