import type { FormRule, BuiltinValidators } from './types';
import { t } from '../../locale';
import { isSafeUrl } from '../../utils/sanitize';
import { isIdCard } from './id-card';

// 判断值是否为"空"（用于可选字段短路）。注意：0 / false 不算空，
// 以免 minValue/maxValue/enum 在边界值 0 处被误判跳过。
function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/** 表单数字支持有限数值和非空数字字符串，避免隐式转换其他类型。 */
function parseFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

const DECIMAL_RANGE_INPUT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

function parseRangeValue(value: unknown): number | undefined {
  if (typeof value === 'string' && !DECIMAL_RANGE_INPUT.test(value.trim())) return undefined;
  return parseFiniteNumber(value);
}

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !isSafeUrl(value)) return false;
  try {
    const { protocol } = new URL(value.trim());
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

type BuiltinValidatorFn = (
  rule: FormRule,
  value: unknown,
  callback: (error?: string) => void,
  translate?: typeof t
) => void;

const UNSAFE_FIELD_PATH_SEGMENTS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_ARRAY_INDEX = 2 ** 32 - 2;
const PHONE_NUMBER_PATTERN = /^1[3-9]\d{9}$/;
type FieldContainer = Record<string, unknown> | unknown[];

/**
 * 将点分隔字段路径解析为安全片段。空片段与原型链关键字都不能参与读写。
 */
function parseFieldPath(prop: string): string[] | null {
  const keys = prop.split('.');
  if (
    keys.length === 0 ||
    keys.some(key => key.length === 0 || UNSAFE_FIELD_PATH_SEGMENTS.has(key))
  ) {
    return null;
  }
  return keys;
}

function isFieldContainer(value: unknown): value is FieldContainer {
  return typeof value === 'object' && value !== null;
}

function isArrayIndex(key: string): boolean {
  if (!/^(?:0|[1-9]\d*)$/u.test(key)) return false;
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index <= MAX_ARRAY_INDEX;
}

function readOwn(container: FieldContainer, key: string): unknown {
  if (!Object.prototype.hasOwnProperty.call(container, key)) return undefined;
  return (container as Record<string, unknown>)[key];
}

function writeOwn(container: FieldContainer, key: string, value: unknown): void {
  (container as Record<string, unknown>)[key] = value;
}

// 获取字段值
export function getFieldValue(model: Record<string, unknown>, prop: string): unknown {
  const keys = parseFieldPath(prop);
  if (!keys) return undefined;
  let value: unknown = model;

  for (const key of keys) {
    if (!isFieldContainer(value)) return undefined;
    value = readOwn(value, key);
  }

  return value;
}

// 设置字段值
export function setFieldValue(model: Record<string, unknown>, prop: string, value: unknown): void {
  const keys = parseFieldPath(prop);
  if (!keys) return;
  const lastKey = keys[keys.length - 1]!;
  let target: FieldContainer = model;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index]!;
    const nextKey = keys[index + 1]!;
    let child = readOwn(target, key);
    if (!isFieldContainer(child)) {
      child = isArrayIndex(nextKey) ? [] : {};
      writeOwn(target, key, child);
    }
    target = child as FieldContainer;
  }

  writeOwn(target, lastKey, value);
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
  field: string,
  translate: typeof t = t
): Promise<{ valid: boolean; error?: string }> {
  for (const rule of rules) {
    try {
      const result = await validateRule(rule, value, field, translate);
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

// 验证单个规则（一条规则会校验其声明的所有维度，任一失败即返回）
async function validateRule(
  rule: FormRule,
  value: unknown,
  _field: string,
  translate: typeof t
): Promise<{ valid: boolean; error?: string }> {
  // 转换值
  if (rule.transform) {
    value = rule.transform(value);
  }

  // 内置验证器：依次执行该规则声明的所有维度（required + type + min/max + pattern...）
  const validators = getBuiltinValidators(rule);
  for (const validator of validators) {
    const result = await new Promise<{ valid: boolean; error?: string }>(resolve => {
      validator(
        rule,
        value,
        (error?: string) => {
          resolve({ valid: !error, error: error || rule.message });
        },
        translate
      );
    });

    if (!result.valid) {
      return result;
    }
  }

  for (const validator of [rule.validator, rule.asyncValidator]) {
    if (!validator) continue;
    const result = await runCustomValidator(validator, rule, value, translate);
    if (!result.valid) return result;
  }

  return { valid: true };
}

function runCustomValidator(
  validator: NonNullable<FormRule['validator']>,
  rule: FormRule,
  value: unknown,
  translate: typeof t
): Promise<{ valid: boolean; error?: string }> {
  return new Promise(resolve => {
    let completed = false;
    const finish = (valid: boolean, error?: string) => {
      if (completed) return;
      completed = true;
      resolve(valid ? { valid: true } : { valid: false, error });
    };
    const reject = (error: unknown) => {
      const message = error instanceof Error ? error.message : error == null ? '' : String(error);
      finish(false, message || rule.message || translate('common.validationError'));
    };
    try {
      const result = validator(rule, value, error => {
        finish(!error, error || rule.message);
      });
      // 回调已完成时也接住晚到的 Promise 拒绝，防止未处理异常逸出验证链路。
      if (result && typeof result.then === 'function') {
        void Promise.resolve(result).then(() => finish(true), reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// 收集一条规则声明的所有内置校验器
function getBuiltinValidators(rule: FormRule): BuiltinValidatorFn[] {
  const validators: BuiltinValidatorFn[] = [];

  if (rule.required) {
    validators.push(builtinValidators.required);
  }

  if (rule.type) {
    switch (rule.type) {
      case 'email':
        validators.push(builtinValidators.email);
        break;
      case 'url':
        validators.push(builtinValidators.url);
        break;
      case 'number':
        validators.push(builtinValidators.number);
        break;
      case 'integer':
        validators.push(builtinValidators.integer);
        break;
      case 'float':
        validators.push(builtinValidators.float);
        break;
      case 'string':
      case 'boolean':
      case 'method':
      case 'regexp':
      case 'array':
      case 'object':
      case 'date':
      case 'hex':
        validators.push(builtinValidators.type);
        break;
      case 'enum':
        validators.push(builtinValidators.enum);
        break;
    }
  }

  if (rule.min !== undefined) {
    validators.push(builtinValidators.min);
  }

  if (rule.max !== undefined) {
    validators.push(builtinValidators.max);
  }

  if (rule.minValue !== undefined) {
    validators.push(builtinValidators.minValue);
  }

  if (rule.maxValue !== undefined) {
    validators.push(builtinValidators.maxValue);
  }

  if (rule.pattern) {
    validators.push(builtinValidators.pattern);
  }

  if (rule.len !== undefined) {
    validators.push(builtinValidators.len);
  }

  if (rule.enum && rule.type !== 'enum') {
    validators.push(builtinValidators.enum);
  }

  return validators;
}

// 翻译器由调用链显式传递，异步校验与多 App 不借助可串扰的全局临时状态。
// 独立调用内置验证器仍默认使用全局翻译器，保留既有三参数调用契约。
export const builtinValidators: BuiltinValidators = {
  required(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback(rule.message || translate('validators.required'));
      return;
    }

    if (Array.isArray(value) && value.length === 0) {
      callback(rule.message || translate('validators.required'));
      return;
    }

    if (typeof value === 'string' && rule.whitespace !== false && value.trim() === '') {
      callback(rule.message || translate('validators.required'));
      return;
    }

    callback();
  },

  type(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const valid = (() => {
      switch (rule.type) {
        case 'string':
          return typeof value === 'string';
        case 'boolean':
          return typeof value === 'boolean';
        case 'method':
          return typeof value === 'function';
        case 'regexp':
          return value instanceof RegExp;
        case 'array':
          return Array.isArray(value);
        case 'object':
          return typeof value === 'object' && value !== null && !Array.isArray(value);
        case 'date':
          return value instanceof Date && !Number.isNaN(value.getTime());
        case 'hex':
          return typeof value === 'string' && /^(?:0x)?[0-9a-f]+$/i.test(value);
        default:
          return true;
      }
    })();

    if (!valid) {
      callback(rule.message || translate('validators.type'));
      return;
    }

    callback();
  },

  email(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      callback(rule.message || translate('validators.email'));
      return;
    }

    callback();
  },

  url(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    callback(isHttpUrl(value) ? undefined : rule.message || translate('validators.url'));
  },

  number(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    if (parseFiniteNumber(value) === undefined) {
      callback(rule.message || translate('validators.number'));
      return;
    }

    callback();
  },

  integer(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    if (!Number.isInteger(parseFiniteNumber(value))) {
      callback(rule.message || translate('validators.integer'));
      return;
    }

    callback();
  },

  float(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const num = parseFiniteNumber(value);
    if (num === undefined || Number.isInteger(num)) {
      callback(rule.message || translate('validators.float'));
      return;
    }

    callback();
  },

  min(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const length = Array.isArray(value) ? value.length : String(value).length;
    if (length < rule.min!) {
      callback(rule.message || translate('validators.min', { min: rule.min! }));
      return;
    }

    callback();
  },

  max(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const length = Array.isArray(value) ? value.length : String(value).length;
    if (length > rule.max!) {
      callback(rule.message || translate('validators.max', { max: rule.max! }));
      return;
    }

    callback();
  },

  minValue(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const num = parseRangeValue(value);
    if (num === undefined || num < rule.minValue!) {
      callback(rule.message || translate('validators.minValue', { min: rule.minValue! }));
      return;
    }

    callback();
  },

  maxValue(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const num = parseRangeValue(value);
    if (num === undefined || num > rule.maxValue!) {
      callback(rule.message || translate('validators.maxValue', { max: rule.maxValue! }));
      return;
    }

    callback();
  },

  len(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const length = Array.isArray(value) ? value.length : String(value).length;
    if (length !== rule.len) {
      callback(rule.message || translate('validators.len', { len: rule.len! }));
      return;
    }

    callback();
  },

  pattern(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    const pattern = rule.pattern!;
    pattern.lastIndex = 0;
    const matches = pattern.test(String(value));
    pattern.lastIndex = 0;
    if (!matches) {
      const phoneRule =
        pattern.source === PHONE_NUMBER_PATTERN.source &&
        pattern.flags === PHONE_NUMBER_PATTERN.flags;
      const key = phoneRule ? 'validators.phone' : 'validators.pattern';
      callback(rule.message || translate(key));
      return;
    }

    callback();
  },

  enum(rule: FormRule, value: unknown, callback: (error?: string) => void, translate = t) {
    if (isEmptyValue(value)) {
      callback();
      return;
    }

    if (!rule.enum || !rule.enum.includes(value)) {
      callback(rule.message || translate('validators.enum'));
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

  // 是否为有效的绝对 HTTP(S) 地址
  isUrl(value: string): boolean {
    return isHttpUrl(value);
  },

  // 是否为数字
  isNumber(value: unknown): boolean {
    return parseFiniteNumber(value) !== undefined;
  },

  // 是否为整数
  isInteger(value: unknown): boolean {
    return Number.isInteger(parseFiniteNumber(value));
  },

  // 是否为手机号
  isPhone(value: string): boolean {
    return PHONE_NUMBER_PATTERN.test(value);
  },

  // 是否为身份证号
  isIdCard,
};

// 常用验证规则
export const commonRules = {
  // 必填
  required: (message?: string): FormRule => ({
    required: true,
    message,
  }),

  // 邮箱
  email: (message?: string): FormRule => ({
    type: 'email',
    message,
  }),

  // 手机号
  phone: (message?: string): FormRule => ({
    pattern: PHONE_NUMBER_PATTERN,
    message,
  }),

  // 长度范围
  length: (min: number, max: number, message?: string): FormRule => ({
    min,
    max,
    message,
  }),

  // 最小长度
  minLength: (min: number, message?: string): FormRule => ({
    min,
    message,
  }),

  // 最大长度
  maxLength: (max: number, message?: string): FormRule => ({
    max,
    message,
  }),

  // 数值范围
  range: (min: number, max: number, message?: string): FormRule => ({
    minValue: min,
    maxValue: max,
    message,
  }),

  // 正则表达式
  pattern: (pattern: RegExp, message?: string): FormRule => ({
    pattern,
    message,
  }),
};
