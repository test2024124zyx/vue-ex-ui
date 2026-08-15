/**
 * 通用工具函数库
 */

// 导出日志工具
export { logger, createLogger } from './logger';
export type { LogLevel, LoggerOptions } from './logger';

const UNSAFE_MERGE_KEYS = new Set<PropertyKey>(['__proto__', 'prototype', 'constructor']);

const isPlainRecord = (value: unknown): value is Record<PropertyKey, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
};

/** 深度合并普通对象；特殊对象按值替换，并阻止原型污染键。 */
export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  if (!isPlainRecord(target)) return (sources[sources.length - 1] ?? target) as T;
  const result: Record<PropertyKey, unknown> = Object.assign(
    Object.create(Object.getPrototypeOf(target) as object | null) as Record<PropertyKey, unknown>,
    target
  );

  for (const source of sources) {
    if (!isPlainRecord(source)) continue;
    const sourceRecord = source as unknown as Record<PropertyKey, unknown>;

    for (const key of Reflect.ownKeys(sourceRecord)) {
      if (UNSAFE_MERGE_KEYS.has(key)) continue;
      const sourceValue = sourceRecord[key];
      const targetValue = result[key];
      result[key] =
        isPlainRecord(sourceValue) && isPlainRecord(targetValue)
          ? deepMerge(targetValue, sourceValue)
          : sourceValue;
    }
  }

  return result as T;
}

/**
 * 检查是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * 检查是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查是否为 VNode
 */
export function isVNode(value: unknown): boolean {
  return !!(
    value &&
    typeof value === 'object' &&
    (value as { __v_isVNode?: boolean }).__v_isVNode === true
  );
}

/**
 * 检查是否为组件
 */
export function isComponent(value: unknown): boolean {
  if (typeof value === 'function') return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    render?: unknown;
    setup?: unknown;
    template?: unknown;
  };
  return (
    typeof candidate.render === 'function' ||
    typeof candidate.setup === 'function' ||
    (typeof candidate.template === 'string' && candidate.template.trim().length > 0)
  );
}

/**
 * 安全地访问对象属性
 */
export function hasOwnProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** 防抖与节流函数共享可取消、可刷新语义。 */
export { debounce } from './debounce';
export type { DebouncedFunction } from './debounce';
export { throttle } from './throttle';
export type { ThrottledFunction } from './throttle';

/**
 * 生成唯一 ID
 */
export { generateId, generateRandomId, generateUUID } from './id';

/**
 * 深度克隆
 */
export { deepClone } from './clone';

/**
 * 格式化工具
 */
export { formatTimestamp, formatFileSize } from './format';

/**
 * 输入格式化工具
 */
export * from './formatters';

/**
 * HTML 消毒工具
 */
export { sanitizeHtml, escapeHtml, containsDangerousHtml } from './sanitize';

/**
 * 类名合并
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 样式对象转换为字符串
 */
export function styleToString(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value}`)
    .join('; ');
}
