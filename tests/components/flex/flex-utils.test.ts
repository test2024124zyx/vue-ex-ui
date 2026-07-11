import { describe, expect, it } from 'vitest';
import {
  normalizeFlexFactor,
  normalizeFlexOrder,
  resolveFlexBasis,
  resolveFlexGap,
  resolveFlexShorthand,
} from '../../../src/components/flex/flex-utils';

describe('Flex 数值与长度工具', () => {
  it('解析预设、数字和自定义 CSS 长度', () => {
    expect(resolveFlexGap('xs')).toBe('4px');
    expect(resolveFlexGap('md')).toBe('16px');
    expect(resolveFlexGap(0)).toBe('0px');
    expect(resolveFlexGap(12.5)).toBe('12.5px');
    expect(resolveFlexGap(' calc(1rem + 2px) ')).toBe('calc(1rem + 2px)');
  });

  it('负间距收敛到 0，非有限值和空字符串不生成 CSS', () => {
    expect(resolveFlexGap(-4)).toBe('0px');
    expect(resolveFlexGap(Number.NaN)).toBeUndefined();
    expect(resolveFlexGap(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(resolveFlexGap('   ')).toBeUndefined();
  });

  it('grow/shrink 只接受非负有限值', () => {
    expect(normalizeFlexFactor(2.5, 0)).toBe(2.5);
    expect(normalizeFlexFactor(-1, 0)).toBe(0);
    expect(normalizeFlexFactor(Number.NaN, 1)).toBe(1);
  });

  it('basis 数字按非负像素处理，自定义值去除首尾空白', () => {
    expect(resolveFlexBasis(0)).toBe('0px');
    expect(resolveFlexBasis(-20)).toBe('0px');
    expect(resolveFlexBasis(' 25% ')).toBe('25%');
    expect(resolveFlexBasis('')).toBe('auto');
  });

  it('order 只输出安全整数', () => {
    expect(normalizeFlexOrder(2.8)).toBe(2);
    expect(normalizeFlexOrder(-2.8)).toBe(-2);
    expect(normalizeFlexOrder(Number.NaN)).toBe(0);
    expect(normalizeFlexOrder(Number.MAX_VALUE)).toBe(0);
  });

  it('显式 flex 优先且保留 0，非法显式值回退到拆分属性', () => {
    expect(resolveFlexShorthand(0, 1, 1, 'auto')).toBe('0');
    expect(resolveFlexShorthand(' 2 1 25% ', 0, 1, 'auto')).toBe('2 1 25%');
    expect(resolveFlexShorthand(Number.NaN, 2, 0, 100)).toBe('2 0 100px');
    expect(resolveFlexShorthand(undefined, 0, 1, 'auto')).toBeUndefined();
  });
});
