/**
 * 通用工具函数库
 */

// 导出日志工具
export { logger, createLogger } from './logger';
export type { LogLevel, LoggerOptions } from './logger';

/**
 * 深度合并对象
 */
export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const result = { ...target };

  for (const source of sources) {
    if (!source) continue;

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = (result as Record<string, unknown>)[key as string];

        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          (result as Record<string, unknown>)[key as string] = deepMerge(targetValue, sourceValue);
        } else {
          (result as Record<string, unknown>)[key as string] = sourceValue;
        }
      }
    }
  }

  return result;
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
  return typeof value === 'number' && !isNaN(value);
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
  return !!(
    value &&
    (typeof value === 'function' ||
      (typeof value === 'object' && (value as { render?: unknown }).render))
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

/**
 * 防抖函数
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export { throttle } from './throttle';

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
    .map(
      ([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value}`
    )
    .join('; ');
}
