export interface TimeValue {
  h: number;
  m: number;
  s: number;
}
export type TimeUnit = keyof TimeValue;
const DEFAULT_TIME_FORMAT = 'HH:mm:ss';
const TOKENS: Record<string, TimeUnit> = { HH: 'h', mm: 'm', ss: 's' };
const MAXIMUMS: Record<TimeUnit, number> = { h: 23, m: 59, s: 59 };

/** 时间格式使用互不重复的时间单位，非法配置回退到完整时分秒。 */
export function normalizeTimeFormat(value: string): string {
  const parts = value.split(':');
  return parts.length > 0 &&
    new Set(parts).size === parts.length &&
    parts.every(part => Object.prototype.hasOwnProperty.call(TOKENS, part))
    ? value
    : DEFAULT_TIME_FORMAT;
}

/** 按显示顺序读取时间，不把非法字符或超界值默认为合法零点。 */
export function parseTimeValue(value: string, format: string): TimeValue | null {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split(':');
  const units = normalizeTimeFormat(format)
    .split(':')
    .map(token => TOKENS[token]!);
  const result: TimeValue = { h: 0, m: 0, s: 0 };
  for (const [index, unit] of units.entries()) {
    const part = parts[index];
    if (part === undefined || !/^\d{1,2}$/.test(part)) return null;
    const number = Number(part);
    if (number > MAXIMUMS[unit]) return null;
    result[unit] = number;
  }
  return result;
}

/** 输出顺序严格跟随格式，单值与范围端点使用同一套规则。 */
export function formatTimeValue(value: TimeValue, format: string): string {
  return normalizeTimeFormat(format)
    .split(':')
    .map(token => String(value[TOKENS[token]!]).padStart(2, '0'))
    .join(':');
}
