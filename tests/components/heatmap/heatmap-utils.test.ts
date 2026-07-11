import { describe, expect, it } from 'vitest';
import {
  MAX_HEATMAP_RANGE_DAYS,
  createHeatmapCalendar,
  getHeatmapLevel,
  normalizeHeatmapData,
  normalizeHeatmapMetric,
  resolveHeatmapMaximum,
  resolveHeatmapRange,
} from '../../../src/components/heatmap/heatmap-utils';

describe('heatmap utilities', () => {
  it('默认生成包含结束日在内的 365 个本地日历日', () => {
    const result = resolveHeatmapRange(undefined, undefined, new Date(2024, 2, 10, 18, 30));

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.range.start).toEqual(new Date(2023, 2, 12));
    expect(result.range.end).toEqual(new Date(2024, 2, 10));
    expect(result.range.dayCount).toBe(365);
  });

  it('严格拒绝无效、倒置和超长日期范围', () => {
    expect(resolveHeatmapRange('2024-02-30', '2024-03-01')).toEqual({
      ok: false,
      reason: 'invalid-start',
    });
    expect(resolveHeatmapRange('', '2024-03-01')).toEqual({
      ok: false,
      reason: 'invalid-start',
    });
    expect(resolveHeatmapRange('2024-03-02', 'bad-date')).toEqual({
      ok: false,
      reason: 'invalid-end',
    });
    expect(resolveHeatmapRange('2024-03-02', '2024-03-01')).toEqual({
      ok: false,
      reason: 'reversed',
    });
    expect(resolveHeatmapRange('2023-01-01', '2024-01-02')).toEqual({
      ok: false,
      reason: 'too-large',
    });
    expect(MAX_HEATMAP_RANGE_DAYS).toBe(366);
  });

  it('过滤非法日期、规范异常数值，并让后出现的重复日期生效', () => {
    const normalized = normalizeHeatmapData([
      { date: '2024-02-29', value: 2, source: 'first' },
      { date: '2024-02-30', value: 8 },
      { date: '2024-03-01', value: Number.NaN },
      { date: '2024-03-02', value: -4 },
      { date: '2024-02-29', value: 5, source: 'last' },
    ]);

    expect([...normalized.keys()]).toEqual(['2024-02-29', '2024-03-01', '2024-03-02']);
    expect(normalized.get('2024-02-29')).toMatchObject({ value: 5, source: 'last' });
    expect(normalized.get('2024-03-01')?.value).toBe(0);
    expect(normalized.get('2024-03-02')?.value).toBe(0);
  });

  it('按完整周补齐网格，但明确标记范围外占位单元格', () => {
    const rangeResult = resolveHeatmapRange('2024-01-02', '2024-01-05');
    expect(rangeResult.ok).toBe(true);
    if (!rangeResult.ok) return;

    const calendar = createHeatmapCalendar(
      normalizeHeatmapData([{ date: '2024-01-03', value: 7, label: '有效数据' }]),
      rangeResult.range
    );

    expect(calendar).toHaveLength(1);
    expect(calendar[0]).toHaveLength(7);
    expect(calendar[0]?.[0]).toMatchObject({ date: '2023-12-31', inRange: false });
    expect(calendar[0]?.[2]).toMatchObject({
      date: '2024-01-02',
      inRange: true,
      hasData: false,
      value: 0,
    });
    expect(calendar[0]?.[3]).toMatchObject({
      date: '2024-01-03',
      inRange: true,
      hasData: true,
      value: 7,
      label: '有效数据',
    });
    expect(calendar[0]?.[6]).toMatchObject({ date: '2024-01-06', inRange: false });
  });

  it('最大值与颜色等级只接受有限非负数', () => {
    expect(resolveHeatmapMaximum([{ value: 2 }, { value: 10 }])).toBe(10);
    expect(resolveHeatmapMaximum([{ value: 2 }, { value: 10 }], 20)).toBe(20);
    expect(resolveHeatmapMaximum([{ value: 2 }], Number.POSITIVE_INFINITY)).toBe(2);
    expect(resolveHeatmapMaximum([], -1)).toBe(1);
    expect(getHeatmapLevel(0, 10)).toBe(0);
    expect(getHeatmapLevel(2, 10)).toBe(1);
    expect(getHeatmapLevel(4, 10)).toBe(2);
    expect(getHeatmapLevel(6, 10)).toBe(3);
    expect(getHeatmapLevel(10, 10)).toBe(4);
    expect(getHeatmapLevel(Number.NaN, 10)).toBe(0);
  });

  it('像素参数会回退并限制在安全范围', () => {
    expect(normalizeHeatmapMetric(8, 4, 64)).toBe(8);
    expect(normalizeHeatmapMetric(-1, 4, 64)).toBe(4);
    expect(normalizeHeatmapMetric(Number.NaN, 4, 64)).toBe(4);
    expect(normalizeHeatmapMetric(100, 4, 64)).toBe(64);
  });
});
