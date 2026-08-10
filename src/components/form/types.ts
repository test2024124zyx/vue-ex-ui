// ============================================================================
// 基础类型定义
// ============================================================================

export type FormSize = 'small' | 'medium' | 'large';
export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type FormLabelAlign = 'left' | 'right' | 'top';
export type FormLabelPlacement = 'left' | 'top';
export type FormValidateStatus = 'success' | 'warning' | 'error' | 'validating' | '';

// ============================================================================
// 表单验证规则
// ============================================================================

// 验证器回调函数类型
export type ValidatorCallback = (error?: string) => void;

// 验证器函数类型
export type ValidatorFunction = (
  rule: FormRule,
  value: unknown,
  callback: ValidatorCallback
) => void;

// 内置验证器类型
export interface BuiltinValidators {
  required: ValidatorFunction;
  type: ValidatorFunction;
  email: ValidatorFunction;
  url: ValidatorFunction;
  number: ValidatorFunction;
  integer: ValidatorFunction;
  float: ValidatorFunction;
  min: ValidatorFunction;
  max: ValidatorFunction;
  minValue: ValidatorFunction;
  maxValue: ValidatorFunction;
  len: ValidatorFunction;
  pattern: ValidatorFunction;
  enum: ValidatorFunction;
}

export interface FormRule {
  /** 是否必填 */
  required?: boolean;
  /** 错误消息 */
  message?: string;
  /** 触发验证的时机 */
  trigger?: 'blur' | 'change' | 'input' | Array<'blur' | 'change' | 'input'>;
  /** 最小长度 */
  min?: number;
  /** 最大长度 */
  max?: number;
  /** 最小值 */
  minValue?: number;
  /** 最大值 */
  maxValue?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (rule: FormRule, value: unknown, callback: (error?: string) => void) => void;
  /** 异步验证函数 */
  asyncValidator?: (
    rule: FormRule,
    value: unknown,
    callback: (error?: string) => void
  ) => Promise<void>;
  /** 验证类型 */
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'method'
    | 'regexp'
    | 'integer'
    | 'float'
    | 'array'
    | 'object'
    | 'enum'
    | 'date'
    | 'url'
    | 'hex'
    | 'email';
  /** 枚举值 */
  enum?: unknown[];
  /** 字段长度 */
  len?: number;
  /** 是否允许空白字符 */
  whitespace?: boolean;
  /** 转换函数 */
  transform?: (value: unknown) => unknown;
}

// ============================================================================
// 表单验证结果
// ============================================================================

export interface FormValidateResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误信息 */
  errors: FormValidateError[];
  /** 当前结果是否已被更新的一次验证取代 */
  outOfDate?: boolean;
}

export interface FormValidateError {
  /** 字段名 */
  field: string;
  /** 错误消息 */
  message: string;
  /** 字段值 */
  value: unknown;
}

/** 单个表单项的验证结果 */
export interface FormItemValidateResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误消息 */
  error?: string;
  /** 当前结果是否已被更新的一次验证取代 */
  outOfDate?: boolean;
}

// ============================================================================
// Form 组件 Props
// ============================================================================

export interface ExFormProps {
  /** 表单数据对象 */
  model?: Record<string, unknown>;
  /** 表单验证规则 */
  rules?: Record<string, FormRule | FormRule[]>;
  /** 表单布局 */
  layout?: FormLayout;
  /** 表单尺寸 */
  size?: FormSize;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: FormLabelAlign;
  /** 标签位置 */
  labelPlacement?: FormLabelPlacement;
  /** 是否显示冒号 */
  showColon?: boolean;
  /** 是否显示验证反馈图标 */
  hasFeedback?: boolean;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 表单名称 */
  name?: string;
  /** 是否在规则改变后立即触发一次验证 */
  validateOnRuleChange?: boolean;
  /** 滚动到第一个错误字段 */
  scrollToError?: boolean;
  /** 错误字段滚动后是否自动聚焦控件 */
  focusToError?: boolean;
  /** 错误字段的滚动行为配置 */
  scrollIntoViewOptions?: ScrollIntoViewOptions | boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// Form 组件 Emits
// ============================================================================

export interface ExFormEmits {
  /** 表单提交事件 */
  submit: [event: Event];
  /** 表单重置事件 */
  reset: [event: Event];
  /** 字段值改变事件 */
  'field-change': [field: string, value: unknown];
  /** 字段验证事件 */
  'field-validate': [field: string, result: FormValidateResult];
}

// ============================================================================
// FormItem 组件 Props
// ============================================================================

export interface ExFormItemProps {
  /** 字段名 */
  prop?: string;
  /** 标签文本 */
  label?: string;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签对齐方式 */
  labelAlign?: FormLabelAlign;
  /** 标签位置 */
  labelPlacement?: FormLabelPlacement;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  rules?: FormRule | FormRule[];
  /** 验证状态 */
  validateStatus?: FormValidateStatus;
  /** 帮助文本 */
  help?: string;
  /** 错误消息 */
  error?: string;
  /** 是否显示验证反馈图标 */
  hasFeedback?: boolean;
  /** 是否显示冒号 */
  showColon?: boolean;
  /** 表单项尺寸 */
  size?: FormSize;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
}

// ============================================================================
// FormItem 组件 Emits
// ============================================================================

export interface ExFormItemEmits {
  /** 验证状态改变事件 */
  'validate-status-change': [status: FormValidateStatus, error?: string];
}

// ============================================================================
// FormItem 组件 Slots
// ============================================================================

export interface ExFormItemSlots {
  /** 默认插槽 - 表单控件 */
  default?: () => unknown;
  /** 标签插槽 */
  label?: () => unknown;
}

// ============================================================================
// Form 实例方法
// ============================================================================

export interface FormInstance {
  /** 验证整个表单 */
  validate: (
    callback?: (valid: boolean, errors?: FormValidateError[]) => void
  ) => Promise<FormValidateResult>;
  /** 验证指定字段 */
  validateField: (
    props: string | string[],
    callback?: (valid: boolean, errors?: FormValidateError[]) => void
  ) => Promise<FormValidateResult>;
  /** 重置整个表单 */
  resetFields: (props?: string | string[]) => void;
  /** 清除验证结果 */
  clearValidate: (props?: string | string[]) => void;
  /** 滚动到指定字段 */
  scrollToField: (prop: string, options?: ScrollIntoViewOptions | boolean) => void;
  /** 获取字段值 */
  getFieldValue: (prop: string) => unknown;
  /** 设置字段值 */
  setFieldValue: (prop: string, value: unknown) => void;
  /** 获取所有字段值 */
  getFieldsValue: (props?: string[]) => Record<string, unknown>;
  /** 设置多个字段值 */
  setFieldsValue: (values: Record<string, unknown>) => void;
}

// ============================================================================
// FormItem 实例方法
// ============================================================================

export interface FormItemInstance {
  /** 验证字段 */
  validate: (trigger?: string) => Promise<FormItemValidateResult>;
  /** 重置字段 */
  resetField: () => void;
  /** 清除验证结果 */
  clearValidate: () => void;
}

// ============================================================================
// 表单上下文
// ============================================================================

export interface FormContext {
  /** 表单属性 */
  props: ExFormProps;
  /** 表单数据 */
  model: Record<string, unknown>;
  /** 验证规则 */
  rules: Record<string, FormRule | FormRule[]>;
  /** 添加字段 */
  addField: (field: FormItemContext) => void;
  /** 移除字段 */
  removeField: (field: FormItemContext) => void;
  /** 验证字段 */
  validateField: (prop: string, trigger?: string) => Promise<FormItemValidateResult>;
  /** 通知表单字段验证结果 */
  notifyFieldValidate: (prop: string, result: FormItemValidateResult) => void;
  /** 重置字段 */
  resetField: (prop: string) => void;
  /** 清除验证 */
  clearValidate: (prop: string) => void;
}

// ============================================================================
// 表单项上下文
// ============================================================================

export interface FormItemContext {
  /** 字段名 */
  prop: string;
  /** 表单项属性 */
  props: ExFormItemProps;
  /** 验证状态 */
  validateStatus: FormValidateStatus;
  /** 错误消息 */
  validateMessage: string;
  /** 验证字段 */
  validate: (trigger?: string) => Promise<FormItemValidateResult>;
  /** 重置字段 */
  resetField: () => void;
  /** 清除验证 */
  clearValidate: () => void;
}
