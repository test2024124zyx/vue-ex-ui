import {
  normalizeLineNumber,
  parseHighlightedLines,
} from '../../../src/components/code/line-utils';

describe('code line utils', () => {
  it('将非有限起始行号恢复为安全整数', () => {
    expect(normalizeLineNumber(Number.POSITIVE_INFINITY)).toBe(1);
    expect(normalizeLineNumber(3.9)).toBe(3);
  });

  it('仅展开当前可见范围内的高亮行，超大范围不会形成无界循环', () => {
    expect([...parseHighlightedLines('1-999999999', 10, 12)]).toEqual([10, 11, 12]);
  });

  it('忽略无效、倒序和非有限行号', () => {
    expect([...parseHighlightedLines('x,5-3,7,Infinity', 1, 10)]).toEqual([7]);
    expect(parseHighlightedLines([2, Number.NaN, 20], 1, 10)).toEqual(new Set([2]));
  });
});
