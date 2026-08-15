import { addDays, isValidDate, parseLocalDate, startOfDay, toDateKey } from '../../utils/date';
import type { HeatmapDataItem } from './types';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 单个热力图最多展示 366 个日历日，避免一次创建不可用的大量 DOM。 */
export const MAX_HEATMAP_RANGE_DAYS = 366;

export interface HeatmapRange {
  start: Date;
  end: Date;
  dayCount: number;
}

export type HeatmapRangeError = 'invalid-start' | 'invalid-end' | 'reversed' | 'too-large';

export type HeatmapRangeResult =
  { ok: true; range: HeatmapRange } | { ok: false; reason: HeatmapRangeError };

export interface HeatmapCalendarCell extends HeatmapDataItem {
  /** 独立的本地日期对象，供格式化和键盘导航使用。 */
  dateValue: Date;
  /** 是否位于调用方声明的日期范围内。 */
  inRange: boolean;
  /** 当天是否存在调用方提供的有效数据项。 */
  hasData: boolean;
}

const parseDateKey = (value: string): Date | null => {
  if (!DATE_KEY_PATTERN.test(value)) return null;
  return parseLocalDate(value);
};

const calendarDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY;

const calendarDayCount = (start: Date, end: Date): number =>
  calendarDayNumber(end) - calendarDayNumber(start) + 1;

/**
 * 解析并验证展示范围。日期只接受 YYYY-MM-DD，按本地日历日处理，不依赖 UTC 字符串解析。
 */
export function resolveHeatmapRange(
  startDate?: string,
  endDate?: string,
  today: Date = new Date()
): HeatmapRangeResult {
  const end =
    endDate !== undefined ? parseDateKey(endDate) : isValidDate(today) ? startOfDay(today) : null;
  if (!end) return { ok: false, reason: 'invalid-end' };

  const start = startDate !== undefined ? parseDateKey(startDate) : addDays(end, -364);
  if (!start) return { ok: false, reason: 'invalid-start' };

  const dayCount = calendarDayCount(start, end);
  if (dayCount < 1) return { ok: false, reason: 'reversed' };
  if (dayCount > MAX_HEATMAP_RANGE_DAYS) return { ok: false, reason: 'too-large' };

  return {
    ok: true,
    range: {
      start,
      end,
      dayCount,
    },
  };
}

const normalizeHeatmapValue = (value: number): number =>
  Number.isFinite(value) && value >= 0 ? value : 0;

/** 过滤非法日期并规范数值；重复日期采用数组中最后一项。 */
export function normalizeHeatmapData(
  data: readonly HeatmapDataItem[]
): Map<string, HeatmapDataItem> {
  const normalized = new Map<string, HeatmapDataItem>();

  for (const item of data) {
    if (!parseDateKey(item.date)) continue;
    normalized.set(item.date, {
      ...item,
      date: item.date,
      value: normalizeHeatmapValue(item.value),
    });
  }

  return normalized;
}

/** 创建从周日到周六对齐的完整周网格。范围外单元格只承担布局占位。 */
export function createHeatmapCalendar(
  data: ReadonlyMap<string, HeatmapDataItem>,
  range: HeatmapRange
): HeatmapCalendarCell[][] {
  const alignedStart = addDays(range.start, -range.start.getDay());
  const alignedEnd = addDays(range.end, 6 - range.end.getDay());
  const weeks: HeatmapCalendarCell[][] = [];
  let current = alignedStart;

  while (current.getTime() <= alignedEnd.getTime()) {
    const week: HeatmapCalendarCell[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const dateValue = new Date(current.getTime());
      const date = toDateKey(dateValue);
      const inRange =
        dateValue.getTime() >= range.start.getTime() && dateValue.getTime() <= range.end.getTime();
      const source = inRange ? data.get(date) : undefined;

      week.push({
        ...(source ?? { date, value: 0 }),
        date,
        value: source?.value ?? 0,
        dateValue,
        inRange,
        hasData: Boolean(source),
      });
      current = addDays(current, 1);
    }

    weeks.push(week);
  }

  return weeks;
}

/** 配置值有效时优先使用，否则从可见数据中推导，最小为 1。 */
export function resolveHeatmapMaximum(
  data: Iterable<Pick<HeatmapDataItem, 'value'>>,
  configuredMaximum?: number
): number {
  if (Number.isFinite(configuredMaximum) && (configuredMaximum ?? 0) > 0) {
    return configuredMaximum as number;
  }

  let maximum = 1;
  for (const item of data) {
    maximum = Math.max(maximum, normalizeHeatmapValue(item.value));
  }
  return maximum;
}

/** 将非负数值映射到 0～4 的固定颜色等级。 */
export function getHeatmapLevel(value: number, maximum: number): 0 | 1 | 2 | 3 | 4 {
  const normalizedValue = normalizeHeatmapValue(value);
  if (normalizedValue === 0) return 0;

  const safeMaximum = Number.isFinite(maximum) && maximum > 0 ? maximum : 1;
  const ratio = normalizedValue / safeMaximum;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  return 4;
}

/** 规范 CSS 像素参数，拒绝负数与非有限值，并限制异常大值。 */
export function normalizeHeatmapMetric(value: number, fallback: number, maximum: number): number {
  if (!Number.isFinite(value) || value < 0) return fallback;
  return Math.min(value, maximum);
}
