import type { FormRule, BuiltinValidators } from './types';

// 获取字段值
export function getFieldValue(model: Record<string, unknown>, prop: string): unknown {
  const keys = prop.split('.');
  let value: unknown = model;

  for (const key of keys) {
    if (
      value &&
      typeof value === 'object' &&
      value !== null &&
      key in (value as Record<string, unknown>)
    ) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return value;
}

// 设置字段值
export function setFieldValue(model: Record<string, unknown>, prop: string, value: unknown): void {
  const keys = prop.split('.');
  const lastKey = keys.pop()!;
  let target: Record<string, unknown> = model;

  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') {
      target[key] = {};
    }
    target = target[key] as Record<string, unknown>;
  }

  target[lastKey] = value;
}

// 重置字段
export function resetField(
  model: Record<string, unknown>,
  prop: string,
  initialValue?: unknown
): void {
  setFieldValue(model, prop, initialValue);
}

// 验证字段
export async function validateField(
  rules: FormRule[],
  value: unknown,
  field: string
): Promise<{ valid: boolean; error?: string }> {
  for (const rule of rules) {
    try {
      const result = await validateRule(rule, value, field);
      if (!result.valid) {
        return result;
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return { valid: true };
}

// 验证单个规则
async function validateRule(
  rule: FormRule,
  value: unknown,
  _field: string
): Promise<{ valid: boolean; error?: string }> {
  // 转换值
  if (rule.transform) {
    value = rule.transform(value);
  }

  // 自定义异步验证器
  if (rule.asyncValidator) {
    return new Promise((resolve) => {
      rule.asyncValidator!(rule, value, (error?: string) => {
        resolve({
          valid: !error,
          error: error || rule.message,
        });
      });
    });
  }

  // 自定义验证器
  if (rule.validator) {
    return new Promise((resolve) => {
      rule.validator!(rule, value, (error?: string) => {
        resolve({
          valid: !error,
          error: error || rule.message,
        });
      });
    });
  }

  // 内置验证器
  const validator = getBuiltinValidator(rule);
  if (validator) {
    return new Promise((resolve) => {
      validator(rule, value, (error?: string) => {
        resolve({
          valid: !error,
          error: error || rule.message,
        });
      });
    });
  }

  return { valid: true };
}

// 获取内置验证器
function getBuiltinValidator(
  rule: FormRule
): ((rule: FormRule, value: unknown, callback: (error?: string) => void) => void) | null {
  if (rule.required) {
    return builtinValidators.required;
  }

  if (rule.type) {
    switch (rule.type) {
    case 'email':
      return builtinValidators.email;
    case 'url':
      return builtinValidators.url;
    case 'number':
      return builtinValidators.number;
    case 'integer':
      return builtinValidators.integer;
    case 'float':
      return builtinValidators.float;
    }
  }

  if (rule.min !== undefined) {
    return builtinValidators.min;
  }

  if (rule.max !== undefined) {
    return builtinValidators.max;
  }

  if (rule.minValue !== undefined) {
    return builtinValidators.minValue;
  }

  if (rule.maxValue !== undefined) {
    return builtinValidators.maxValue;
  }

  if (rule.pattern) {
    return builtinValidators.pattern;
  }

  if (rule.enum) {
    return builtinValidators.enum;
  }

  return null;
}

// 内置验证器
export const builtinValidators: BuiltinValidators = {
  required(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (value === undefined || value === null || value === '') {
      callback(rule.message || '此字段为必填项');
      return;
    }

    if (Array.isArray(value) && value.length === 0) {
      callback(rule.message || '此字段为必填项');
      return;
    }

    if (typeof value === 'string' && rule.whitespace !== false && value.trim() === '') {
      callback(rule.message || '此字段为必填项');
      return;
    }

    callback();
  },

  email(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      callback(rule.message || '请输入有效的邮箱地址');
      return;
    }

    callback();
  },

  url(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    try {
      new URL(String(value));
      callback();
    } catch {
      callback(rule.message || '请输入有效的网址');
    }
  },

  number(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    if (isNaN(Number(value))) {
      callback(rule.message || '请输入有效的数字');
      return;
    }

    callback();
  },

  integer(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    if (!Number.isInteger(Number(value))) {
      callback(rule.message || '请输入整数');
      return;
    }

    callback();
  },

  float(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const num = Number(value);
    if (isNaN(num)) {
      callback(rule.message || '请输入有效的数字');
      return;
    }

    callback();
  },

  min(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const length = Array.isArray(value) ? value.length : String(value).length;
    if (length < rule.min!) {
      callback(rule.message || `最少需要 ${rule.min} 个字符`);
      return;
    }

    callback();
  },

  max(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const length = Array.isArray(value) ? value.length : String(value).length;
    if (length > rule.max!) {
      callback(rule.message || `最多允许 ${rule.max} 个字符`);
      return;
    }

    callback();
  },

  minValue(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const num = Number(value);
    if (isNaN(num) || num < rule.minValue!) {
      callback(rule.message || `值不能小于 ${rule.minValue}`);
      return;
    }

    callback();
  },

  maxValue(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    const num = Number(value);
    if (isNaN(num) || num > rule.maxValue!) {
      callback(rule.message || `值不能大于 ${rule.maxValue}`);
      return;
    }

    callback();
  },

  pattern(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    if (!rule.pattern!.test(String(value))) {
      callback(rule.message || '格式不正确');
      return;
    }

    callback();
  },

  enum(rule: FormRule, value: unknown, callback: (error?: string) => void) {
    if (!value) {
      callback();
      return;
    }

    if (!rule.enum!.includes(value)) {
      callback(rule.message || '值不在允许的范围内');
      return;
    }

    callback();
  },
};

// 验证工具函数
export const validateUtils = {
  // 是否为空值
  isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === '';
  },

  // 是否为有效邮箱
  isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // 是否为有效URL
  isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // 是否为数字
  isNumber(value: unknown): boolean {
    return !isNaN(Number(value));
  },

  // 是否为整数
  isInteger(value: unknown): boolean {
    return Number.isInteger(Number(value));
  },

  // 是否为手机号
  isPhone(value: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  },

  // 是否为身份证号
  isIdCard(value: string): boolean {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return idCardRegex.test(value);
  },
};

// 常用验证规则
export const commonRules = {
  // 必填
  required: (message?: string): FormRule => ({
    required: true,
    message: message || '此字段为必填项',
  }),

  // 邮箱
  email: (message?: string): FormRule => ({
    type: 'email',
    message: message || '请输入有效的邮箱地址',
  }),

  // 手机号
  phone: (message?: string): FormRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号',
  }),

  // 长度范围
  length: (min: number, max: number, message?: string): FormRule => ({
    min,
    max,
    message: message || `长度应在 ${min} 到 ${max} 个字符之间`,
  }),

  // 最小长度
  minLength: (min: number, message?: string): FormRule => ({
    min,
    message: message || `最少需要 ${min} 个字符`,
  }),

  // 最大长度
  maxLength: (max: number, message?: string): FormRule => ({
    max,
    message: message || `最多允许 ${max} 个字符`,
  }),

  // 数值范围
  range: (min: number, max: number, message?: string): FormRule => ({
    minValue: min,
    maxValue: max,
    message: message || `值应在 ${min} 到 ${max} 之间`,
  }),

  // 正则表达式
  pattern: (pattern: RegExp, message?: string): FormRule => ({
    pattern,
    message: message || '格式不正确',
  }),
};
