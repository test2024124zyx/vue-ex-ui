import { addDays, formatDate, isValidDate, startOfDay } from '../../utils/date';

export type DatePeriod = 'date' | 'week' | 'month' | 'year';
export const DAYS_PER_WEEK = 7;
export const MONTHS_PER_YEAR = 12;
export const YEARS_PER_PAGE = 12;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_FIRST_WEEK_DAY = 4;

/** 周一作为周期起点；其余模式保持本地日历，避免 UTC 偏移改变日期。 */
export function getPeriodStart(date: Date, period: DatePeriod): Date {
  const result = startOfDay(date);
  if (period === 'week') return addDays(result, -((result.getDay() + 6) % DAYS_PER_WEEK));
  if (period === 'month' || period === 'year') result.setDate(1);
  if (period === 'year') result.setMonth(0);
  return result;
}

/** 返回周期最后一个本地日历日，范围预览包含整个末端周期。 */
export function getPeriodEnd(date: Date, period: DatePeriod): Date {
  const start = getPeriodStart(date, period);
  if (period === 'week') return addDays(start, DAYS_PER_WEEK - 1);
  if (period === 'month') start.setMonth(start.getMonth() + 1);
  else if (period === 'year') start.setFullYear(start.getFullYear() + 1);
  else return start;
  return addDays(start, -1);
}

/** ISO 8601：包含周四的年份为周年，包含一月四日的一周为第一周。 */
export function getIsoWeek(date: Date): { year: number; week: number } {
  const monday = getPeriodStart(date, 'week');
  const year = addDays(monday, ISO_FIRST_WEEK_DAY - 1).getFullYear();
  const january = new Date(monday);
  january.setFullYear(year, 0, ISO_FIRST_WEEK_DAY);
  const firstMonday = getPeriodStart(january, 'week');
  // 用 UTC 日序差计算日历天数，避免夏令时的一天不等于二十四小时。
  const ordinal = (value: Date) =>
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / MILLISECONDS_PER_DAY;
  return { year, week: Math.round((ordinal(monday) - ordinal(firstMonday)) / DAYS_PER_WEEK) + 1 };
}

/** GGGG/WW 表示 ISO 周年与周数，方括号中的内容按字面展示。 */
export function formatPickerDate(date: Date, format: string): string {
  if (!isValidDate(date)) return '';
  const iso = getIsoWeek(date);
  return format.replace(
    /\[([^\]]*)\]|GGGG|WW|YYYY|MM|DD|HH|mm|ss/g,
    (token, literal: string | undefined) => {
      if (literal !== undefined) return literal;
      if (token === 'GGGG') return String(iso.year).padStart(4, '0');
      if (token === 'WW') return String(iso.week).padStart(2, '0');
      return formatDate(date, token);
    }
  );
}
