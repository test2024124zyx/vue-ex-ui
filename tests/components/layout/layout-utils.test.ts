import { describe, expect, it } from 'vitest';
import {
  BREAKPOINT_PIXELS,
  getSiderBreakpointQuery,
  isZeroLayoutLength,
  normalizeLayoutLength,
  normalizeTransitionDuration,
} from '../../../src/components/layout/layout-utils';

describe('layout-utils', () => {
  it('将数字尺寸转换为 CSS 长度并保留有效字符串', () => {
    expect(normalizeLayoutLength(80, 64)).toBe('80px');
    expect(normalizeLayoutLength(0, 64)).toBe('0px');
    expect(normalizeLayoutLength(' 5rem ', 64)).toBe('5rem');
    expect(normalizeLayoutLength('calc(100% - 2rem)', 64)).toBe('calc(100% - 2rem)');
  });

  it('非法数字和空字符串回退到声明默认值', () => {
    expect(normalizeLayoutLength(-1, 64)).toBe('64px');
    expect(normalizeLayoutLength('-2rem', 64)).toBe('64px');
    expect(normalizeLayoutLength(Number.NaN, '4rem')).toBe('4rem');
    expect(normalizeLayoutLength('', 64)).toBe('64px');
    expect(normalizeLayoutLength('   ', '3rem')).toBe('3rem');
  });

  it('识别带单位和无单位的零宽度', () => {
    expect(isZeroLayoutLength('0')).toBe(true);
    expect(isZeroLayoutLength('0px')).toBe(true);
    expect(isZeroLayoutLength('0.0rem')).toBe(true);
    expect(isZeroLayoutLength('var(--width)')).toBe(false);
    expect(isZeroLayoutLength('1px')).toBe(false);
  });

  it('动画时长只接受非负有限值', () => {
    expect(normalizeTransitionDuration(0, 300)).toBe(0);
    expect(normalizeTransitionDuration(120.5, 300)).toBe(120.5);
    expect(normalizeTransitionDuration(-1, 300)).toBe(300);
    expect(normalizeTransitionDuration(Number.POSITIVE_INFINITY, 300)).toBe(300);
  });

  it('响应式断点与设计令牌保持一致并生成 min-width 查询', () => {
    expect(BREAKPOINT_PIXELS).toEqual({
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    });
    expect(Object.isFrozen(BREAKPOINT_PIXELS)).toBe(true);
    expect(getSiderBreakpointQuery('sm')).toBe('(min-width: 480px)');
    expect(getSiderBreakpointQuery('2xl')).toBe('(min-width: 1536px)');
    expect(getSiderBreakpointQuery('xs')).toBeNull();
    expect(getSiderBreakpointQuery(undefined)).toBeNull();
  });
});
