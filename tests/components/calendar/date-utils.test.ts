import {
  formatDate,
  isSameDay,
  normalizeMinuteStep,
  parseLocalDate,
  setMonthClamped,
  setYearClamped,
  startOfDay,
} from '../../../src/utils/date';

describe('calendar date utilities', () => {
  it('按本地日历日期解析 YYYY-MM-DD，而不是依赖 UTC 字符串规则', () => {
    const date = parseLocalDate('2024-02-29');

    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(1);
    expect(date?.getDate()).toBe(29);
    expect(date?.getHours()).toBe(0);
  });

  it('拒绝溢出或无效的日期字符串', () => {
    expect(parseLocalDate('2024-02-31')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
  });

  it('切换月份时把月末日期夹到目标月最后一天', () => {
    expect(setMonthClamped(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
    expect(setMonthClamped(new Date(2023, 2, 31), 1)).toEqual(new Date(2023, 1, 28));
    expect(setMonthClamped(new Date(2024, 0, 31), -1)).toEqual(new Date(2023, 11, 31));
  });

  it('切换年份时正确处理闰日', () => {
    expect(setYearClamped(new Date(2024, 1, 29), 2025)).toEqual(new Date(2025, 1, 28));
  });

  it('格式化全部日期时间占位符并拒绝无效日期', () => {
    const date = new Date(2024, 1, 3, 4, 5, 6);
    expect(formatDate(date, 'YYYY/MM/DD HH:mm:ss YYYY')).toBe('2024/02/03 04:05:06 2024');
    expect(formatDate(new Date(Number.NaN), 'YYYY-MM-DD')).toBe('');
  });

  it('按本地日历日比较且不修改输入对象', () => {
    const source = new Date(2024, 1, 3, 18, 30);
    const normalized = startOfDay(source);
    expect(normalized).toEqual(new Date(2024, 1, 3));
    expect(source.getHours()).toBe(18);
    expect(isSameDay(source, new Date(2024, 1, 3, 1))).toBe(true);
    expect(isSameDay(source, new Date(2024, 1, 4))).toBe(false);
  });

  it('分钟步长会被规范到 1～60，并将分钟吸附到有效刻度', () => {
    expect(normalizeMinuteStep(13, 15)).toBe(15);
    expect(normalizeMinuteStep(58, 15)).toBe(45);
    expect(normalizeMinuteStep(30, 60)).toBe(0);
    expect(normalizeMinuteStep(7, Number.POSITIVE_INFINITY)).toBe(7);
  });
});
