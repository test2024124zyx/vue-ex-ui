import { describe, expect, it } from 'vitest';
import { formatFileSize, formatTimestamp } from '../../src/utils/format';

describe('formatTimestamp', () => {
  it('只替换日期占位符，保留普通字母、显式字面量和无分隔符格式', () => {
    const timestamp = new Date(2024, 2, 25, 14, 30, 45).getTime();
    expect(formatTimestamp(timestamp, 'YYYY年MM月DD日 HH:mm:ss 班级Bass [备注 mm] DDD')).toBe(
      '2024年03月25日 14:30:45 班级Bass 备注 mm DDD'
    );
    expect(formatTimestamp(timestamp, 'YYYYMMDDTHHmmssZ')).toBe('20240325T143045Z');
  });

  it('支持默认时间格式和重复的自定义日期占位符', () => {
    const date = new Date(2024, 0, 2, 3, 4, 5);

    expect(formatTimestamp(date.getTime())).toBe('03:04:05');
    expect(formatTimestamp(date.getTime(), 'YYYY-MM-DD HH:mm:ss YYYY')).toBe(
      '2024-01-02 03:04:05 2024'
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 9e20])('非法时间戳 %s 返回空文本', value => {
    expect(formatTimestamp(value)).toBe('');
  });
});

describe('formatFileSize', () => {
  it.each([
    [Number.NaN, '0 B'],
    [Number.POSITIVE_INFINITY, '0 B'],
    [-1, '0 B'],
    [0, '0 B'],
    [0.5, '0.5 B'],
    [Number.MIN_VALUE, '0 B'],
    [1, '1 B'],
    [1536, '1.5 KB'],
    [1024 ** 4, '1 TB'],
    [1024 ** 5, '1 PB'],
    [1024 ** 8, '1 YB'],
  ])('将 %s 字节稳定格式化为 %s', (value, expected) => {
    expect(formatFileSize(value)).toBe(expected);
  });
});
