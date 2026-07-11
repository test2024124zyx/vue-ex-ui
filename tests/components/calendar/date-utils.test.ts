import {
  parseCalendarDate,
  setCalendarMonth,
  setCalendarYear,
} from '../../../src/components/calendar/date-utils';

describe('calendar date utilities', () => {
  it('按本地日历日期解析 YYYY-MM-DD，而不是依赖 UTC 字符串规则', () => {
    const date = parseCalendarDate('2024-02-29');

    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(1);
    expect(date?.getDate()).toBe(29);
    expect(date?.getHours()).toBe(0);
  });

  it('拒绝溢出或无效的日期字符串', () => {
    expect(parseCalendarDate('2024-02-31')).toBeNull();
    expect(parseCalendarDate('not-a-date')).toBeNull();
  });

  it('切换月份时把月末日期夹到目标月最后一天', () => {
    expect(setCalendarMonth(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
    expect(setCalendarMonth(new Date(2023, 2, 31), 1)).toEqual(new Date(2023, 1, 28));
    expect(setCalendarMonth(new Date(2024, 0, 31), -1)).toEqual(new Date(2023, 11, 31));
  });

  it('切换年份时正确处理闰日', () => {
    expect(setCalendarYear(new Date(2024, 1, 29), 2025)).toEqual(new Date(2025, 1, 28));
  });
});
