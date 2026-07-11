/** 把 Date 或日期字符串转换为独立、有效的本地 Date。 */
export function parseCalendarDate(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value);
  }

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
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** 设置月份并把月末日夹到目标月份的有效范围。 */
export function setCalendarMonth(date: Date, targetMonth: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(targetMonth);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/** 设置年份并正确处理 2 月 29 日。 */
export function setCalendarYear(date: Date, targetYear: number): Date {
  const result = new Date(date);
  const month = result.getMonth();
  const day = result.getDate();
  result.setDate(1);
  result.setFullYear(targetYear);
  result.setMonth(month);
  const lastDay = new Date(targetYear, month + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}
