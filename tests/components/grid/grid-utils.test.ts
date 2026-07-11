import { describe, expect, it } from 'vitest';
import {
  createGridItemStyles,
  normalizeGridGutter,
  normalizeGridLine,
  normalizeGridOrder,
  normalizeGridSpan,
} from '../../../src/components/grid/grid-utils';

describe('Grid 数值与响应式工具', () => {
  it('规范预设、单值和双向 gutter', () => {
    expect(normalizeGridGutter('md')).toEqual({ horizontal: 16, vertical: 16 });
    expect(normalizeGridGutter(12.5)).toEqual({ horizontal: 12.5, vertical: 12.5 });
    expect(normalizeGridGutter([8, 24])).toEqual({ horizontal: 8, vertical: 24 });
    expect(normalizeGridGutter([-8, Number.NaN])).toEqual({ horizontal: 0, vertical: 0 });
    expect(normalizeGridGutter('unknown' as 'md')).toEqual({ horizontal: 0, vertical: 0 });
  });

  it('把 span 和位移限制到 24 栅格安全整数', () => {
    expect(normalizeGridSpan('auto')).toBe('auto');
    expect(normalizeGridSpan(7.9)).toBe(7);
    expect(normalizeGridSpan(-1)).toBe(0);
    expect(normalizeGridSpan(30)).toBe(24);
    expect(normalizeGridSpan(Number.NaN)).toBe(24);
    expect(normalizeGridLine(-2)).toBe(0);
    expect(normalizeGridLine(30)).toBe(24);
    expect(normalizeGridLine(Number.NaN)).toBe(0);
  });

  it('order 只接受安全整数', () => {
    expect(normalizeGridOrder(4.9)).toBe(4);
    expect(normalizeGridOrder(-4.9)).toBe(-4);
    expect(normalizeGridOrder(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeGridOrder(Number.MAX_VALUE)).toBe(0);
  });

  it('为每个断点生成完整有效样式，并继承上一个断点未覆盖字段', () => {
    const styles = createGridItemStyles({
      span: 12,
      offset: 2,
      push: 0,
      pull: 0,
      order: 3,
      sm: 6,
      md: { span: 5, offset: 1, push: 2, order: -4 },
    });

    expect(styles).toMatchObject({
      '--ex-grid-xs-flex': '0 0 50%',
      '--ex-grid-xs-offset': '8.33333333%',
      '--ex-grid-xs-order': '3',
      '--ex-grid-sm-flex': '0 0 25%',
      '--ex-grid-sm-offset': '8.33333333%',
      '--ex-grid-sm-order': '3',
      '--ex-grid-md-flex': '0 0 20.83333333%',
      '--ex-grid-md-offset': '4.16666667%',
      '--ex-grid-md-push': '8.33333333%',
      '--ex-grid-md-order': '-4',
      '--ex-grid-lg-flex': '0 0 20.83333333%',
      '--ex-grid-lg-push': '8.33333333%',
    });
  });

  it('span=0 在对应断点隐藏，auto 使用真实弹性宽度', () => {
    const hidden = createGridItemStyles({ span: 0 });
    expect(hidden['--ex-grid-xs-display']).toBe('none');
    expect(hidden['--ex-grid-xs-flex']).toBe('0 0 0%');

    const automatic = createGridItemStyles({ span: 'auto' });
    expect(automatic['--ex-grid-xs-display']).toBe('block');
    expect(automatic['--ex-grid-xs-flex']).toBe('1 0 0%');
    expect(automatic['--ex-grid-xs-max-width']).toBe('100%');
  });

  it('所有断点都显式写入有效值，阻断嵌套 GridItem 的变量继承', () => {
    const styles = createGridItemStyles({ span: 24 });
    for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
      expect(styles[`--ex-grid-${breakpoint}-flex`]).toBe('0 0 100%');
      expect(styles[`--ex-grid-${breakpoint}-offset`]).toBe('0%');
      expect(styles[`--ex-grid-${breakpoint}-order`]).toBe('0');
    }
  });
});
