import { describe, expect, it } from 'vitest';
import {
  getNextLoadingBarPercentage,
  mergeLoadingBarOptions,
  normalizeLoadingBarHeight,
  normalizeLoadingBarPercentage,
  normalizeLoadingBarStatus,
  normalizeLoadingBarZIndex,
  resolveLoadingBarColor,
} from '../../../src/components/loading-bar/loading-bar-utils';

describe('LoadingBar 工具函数', () => {
  it('百分比仅接受有限数值并限制到标准范围', () => {
    expect(normalizeLoadingBarPercentage(-1)).toBe(0);
    expect(normalizeLoadingBarPercentage(42.5)).toBe(42.5);
    expect(normalizeLoadingBarPercentage(101)).toBe(100);
    expect(normalizeLoadingBarPercentage(Number.NaN)).toBe(0);
    expect(normalizeLoadingBarPercentage('50' as never)).toBe(0);
  });

  it('高度与层级在声明式组件中安全规范', () => {
    expect(normalizeLoadingBarHeight(0)).toBe(3);
    expect(normalizeLoadingBarHeight(5.5)).toBe(5.5);
    expect(normalizeLoadingBarHeight(20)).toBe(16);
    expect(normalizeLoadingBarHeight(Number.NaN)).toBe(3);
    expect(normalizeLoadingBarZIndex(1000.9)).toBe(1000);
    expect(normalizeLoadingBarZIndex(-1)).toBeUndefined();
    expect(normalizeLoadingBarZIndex(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('状态仅保留真实实现集合', () => {
    expect(normalizeLoadingBarStatus('success')).toBe('success');
    expect(normalizeLoadingBarStatus('unknown')).toBe('loading');
    expect(normalizeLoadingBarStatus(undefined)).toBe('loading');
  });

  it('颜色字符串和函数结果会清理空白，异常由调用方感知', () => {
    expect(resolveLoadingBarColor('  #29abe2  ', 20)).toBe('#29abe2');
    expect(resolveLoadingBarColor('   ', 20)).toBeUndefined();
    expect(resolveLoadingBarColor(undefined, 20)).toBeUndefined();
    expect(resolveLoadingBarColor(value => ` rgb(${value} 0 0) `, 30)).toBe('rgb(30 0 0)');
    expect(resolveLoadingBarColor((() => 42) as never, 30)).toBeUndefined();
    expect(() =>
      resolveLoadingBarColor(() => {
        throw new Error('配色失败');
      }, 30)
    ).toThrow('配色失败');
  });

  it('自动推进单调且不会超过等待上限', () => {
    expect(getNextLoadingBarPercentage(0)).toBeGreaterThan(0);
    expect(getNextLoadingBarPercentage(30)).toBeGreaterThan(30);
    expect(getNextLoadingBarPercentage(89.9)).toBeLessThanOrEqual(90);
    expect(getNextLoadingBarPercentage(90)).toBe(90);
    expect(getNextLoadingBarPercentage(100)).toBe(90);
  });

  it('服务配置校验是原子的，并忽略已删除的未知字段', () => {
    const original = { color: undefined, height: 3, zIndex: undefined };
    const updated = mergeLoadingBarOptions(original, {
      color: '  #ff007f  ',
      height: 6,
      zIndex: 1200.8,
      duration: 1,
    } as never);

    expect(updated).toEqual({ color: '#ff007f', height: 6, zIndex: 1200 });
    expect(original).toEqual({ color: undefined, height: 3, zIndex: undefined });
    expect(() => mergeLoadingBarOptions(updated, { height: Number.NaN })).toThrow(TypeError);
    expect(() => mergeLoadingBarOptions(updated, { height: 0 })).toThrow(RangeError);
    expect(() => mergeLoadingBarOptions(updated, { height: 17 })).toThrow(RangeError);
    expect(() => mergeLoadingBarOptions(updated, { zIndex: Number.NaN })).toThrow(TypeError);
    expect(() => mergeLoadingBarOptions(updated, { zIndex: -1 })).toThrow(RangeError);
    expect(() => mergeLoadingBarOptions(updated, { zIndex: 2_147_483_648 })).toThrow(RangeError);
    expect(() => mergeLoadingBarOptions(updated, { color: '' })).toThrow(TypeError);
  });
});
