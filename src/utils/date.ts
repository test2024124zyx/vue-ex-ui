const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_TOKEN_SOURCE = 'YYYY|MM|DD|HH|mm|ss';
const DATE_TOKENS = new RegExp(DATE_TOKEN_SOURCE, 'g');
const DATE_TOKEN_SEQUENCE = new RegExp(`^(?:${DATE_TOKEN_SOURCE}|[TZ])+$`);

/** 判断值是否为有效 Date。 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

/** 返回独立日期副本，无效输入返回 null。 */
export function cloneDate(value: unknown): Date | null {
  return isValidDate(value) ? new Date(value.getTime()) : null;
}

/** 构造本地日历日，保留 0–99 年，并支持月末计算所需的日期进位。 */
export function createLocalDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, day);
  return date;
}

/**
 * 解析 Date 或日期字符串。YYYY-MM-DD 按本地日历解析，避免被当作 UTC 日期后发生偏移。
 */
export function parseLocalDate(value: Date | string): Date | null {
  if (value instanceof Date) return cloneDate(value);

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const parsed = createLocalDate(year, month, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day
      ? parsed
      : null;
  }

  const parsed = new Date(value);
  return isValidDate(parsed) ? parsed : null;
}

/** 设置月份，并把月末日期夹到目标月份的有效范围。 */
export function setMonthClamped(date: Date, targetMonth: number): Date {
  const result = new Date(date.getTime());
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(targetMonth);
  const lastDay = createLocalDate(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/** 设置年份，并正确处理闰日。 */
export function setYearClamped(date: Date, targetYear: number): Date {
  const result = new Date(date.getTime());
  const month = result.getMonth();
  const day = result.getDate();
  result.setDate(1);
  result.setFullYear(targetYear);
  result.setMonth(month);
  const lastDay = createLocalDate(targetYear, month + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/** 返回本地当天零点的日期副本。 */
export function startOfDay(date: Date): Date {
  const result = new Date(date.getTime());
  result.setHours(0, 0, 0, 0);
  return result;
}

/** 比较两个 Date 是否表示同一个本地日历日。 */
export function isSameDay(left: Date | null, right: Date | null): boolean {
  if (!isValidDate(left) || !isValidDate(right)) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/** 按本地日历增加天数。 */
export function addDays(date: Date, amount: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + amount);
  return result;
}

/** 将本地年月日换算成 UTC 日序，忽略时分秒及夏令时长度变化。 */
export function calendarDayNumber(date: Date): number {
  const utc = new Date(0);
  utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return utc.getTime() / MILLISECONDS_PER_DAY;
}

/** 返回稳定的本地 YYYY-MM-DD 标识。 */
export function toDateKey(date: Date): string {
  return formatDate(date, 'YYYY-MM-DD');
}

/** 格式化本地日期时间，保留普通单词和方括号中的文本。 */
export function formatDate(date: Date, format: string): string {
  if (!isValidDate(date)) return '';
  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()).padStart(4, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  };
  return format.replace(/\[([^\]]*)\]|[A-Za-z]+/g, (word, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    return DATE_TOKEN_SEQUENCE.test(word)
      ? word.replace(DATE_TOKENS, token => tokens[token]!)
      : word;
  });
}

/** 将时、分、秒输入规范为有限整数范围。 */
export function normalizeTimeUnit(value: number, maximum: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(0, Math.trunc(value)));
}

/** 将分钟吸附到 1～60 范围内的有效步长，并保证结果不超过 59。 */
export function normalizeMinuteStepSize(step: number): number {
  return Number.isFinite(step) ? Math.min(60, Math.max(1, Math.trunc(step))) : 1;
}

/** 将分钟吸附到有效刻度，并保证结果不超过 59。 */
export function normalizeMinuteStep(minutes: number, step: number): number {
  const normalizedMinutes = normalizeTimeUnit(minutes, 59);
  const normalizedStep = normalizeMinuteStepSize(step);
  const maximumTick = Math.floor(59 / normalizedStep) * normalizedStep;
  return Math.min(Math.round(normalizedMinutes / normalizedStep) * normalizedStep, maximumTick);
}
