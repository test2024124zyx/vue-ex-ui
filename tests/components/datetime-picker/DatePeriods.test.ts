import { describe, expect, it } from 'vitest';
import {
  getPeriodStart,
  getPeriodEnd,
  getIsoWeek,
  formatPickerDate,
} from '../../../src/components/datetime-picker/date-periods';

describe('年月与 ISO 周的本地日历语义', () => {
  it('年和月归一化为周期起点，闰年末日正确', () => {
    const source = new Date(2024, 1, 29, 23, 59);
    expect(getPeriodStart(source, 'year')).toEqual(new Date(2024, 0, 1));
    expect(getPeriodStart(source, 'month')).toEqual(new Date(2024, 1, 1));
    expect(getPeriodEnd(source, 'month')).toEqual(new Date(2024, 1, 29));
    expect(getPeriodEnd(source, 'year')).toEqual(new Date(2024, 11, 31));
    expect(source).toEqual(new Date(2024, 1, 29, 23, 59));
  });

  it.each([
    [new Date(2021, 0, 1), new Date(2020, 11, 28), 2020, 53],
    [new Date(2024, 11, 31), new Date(2024, 11, 30), 2025, 1],
    [new Date(2026, 9, 29), new Date(2026, 9, 26), 2026, 44],
  ])('ISO 周使用周一且跨年按周年：%s', (date, start, year, week) => {
    expect(getPeriodStart(date, 'week')).toEqual(start);
    expect(getIsoWeek(date)).toEqual({ year, week });
    expect(getPeriodEnd(date, 'week').getDay()).toBe(0);
    expect(formatPickerDate(date, 'GGGG-[W]WW')).toBe(`${year}-W${String(week).padStart(2, '0')}`);
  });

  it('保留普通日期格式与转义文字，日期模式按本地零点处理', () => {
    const date = new Date(2024, 1, 3, 4, 5, 6);
    expect(formatPickerDate(date, '[YYYY] YYYY-MM-DD HH:mm:ss')).toBe('YYYY 2024-02-03 04:05:06');
    expect(getPeriodStart(date, 'date')).toEqual(new Date(2024, 1, 3));
    expect(getPeriodEnd(date, 'date')).toEqual(new Date(2024, 1, 3));
  });
});
