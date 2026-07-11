import { describe, expect, it } from 'vitest';
import {
  normalizeImageDimension,
  normalizeImageRadius,
} from '../../../src/components/image/image-utils';

describe('image utilities', () => {
  it('将非负数字和纯数字字符串统一为像素值', () => {
    expect(normalizeImageDimension(300)).toBe('300px');
    expect(normalizeImageDimension(0)).toBe('0px');
    expect(normalizeImageDimension('300')).toBe('300px');
    expect(normalizeImageDimension(' 12.5 ')).toBe('12.5px');
  });

  it('保留有效 CSS 长度、关键字和函数', () => {
    expect(normalizeImageDimension('50%')).toBe('50%');
    expect(normalizeImageDimension('12rem')).toBe('12rem');
    expect(normalizeImageDimension('auto')).toBe('auto');
    expect(normalizeImageDimension('max-content')).toBe('max-content');
    expect(normalizeImageDimension('calc(100% - 2rem)')).toBe('calc(100% - 2rem)');
    expect(normalizeImageDimension('var(--image-width)')).toBe('var(--image-width)');
  });

  it('拒绝负数、非有限值、空值与可破坏声明边界的字符串', () => {
    expect(normalizeImageDimension(-1)).toBeUndefined();
    expect(normalizeImageDimension(Number.NaN)).toBeUndefined();
    expect(normalizeImageDimension(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(normalizeImageDimension('')).toBeUndefined();
    expect(normalizeImageDimension('-2px')).toBeUndefined();
    expect(normalizeImageDimension('10px; color: red')).toBeUndefined();
    expect(normalizeImageDimension('unknown-value')).toBeUndefined();
  });

  it('圆角接受像素、百分比和 CSS 函数，但拒绝尺寸关键字', () => {
    expect(normalizeImageRadius(8)).toBe('8px');
    expect(normalizeImageRadius('50%')).toBe('50%');
    expect(normalizeImageRadius('var(--ex-radius-lg)')).toBe('var(--ex-radius-lg)');
    expect(normalizeImageRadius('auto')).toBeUndefined();
    expect(normalizeImageRadius(-1)).toBeUndefined();
  });
});
