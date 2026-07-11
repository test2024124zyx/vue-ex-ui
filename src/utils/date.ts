/** 判断值是否为有效 Date。 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

/** 返回独立日期副本，无效输入返回 null。 */
export function cloneDate(value: unknown): Date | null {
  return isValidDate(value) ? new Date(value.getTime()) : null;
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
    const parsed = new Date(year, month, day);
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
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
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
  const lastDay = new Date(targetYear, month + 1, 0).getDate();
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

/** 返回稳定的本地 YYYY-MM-DD 标识。 */
export function toDateKey(date: Date): string {
  return formatDate(date, 'YYYY-MM-DD');
}

/** 使用固定占位符格式化本地日期时间。 */
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
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, token => tokens[token]!);
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
