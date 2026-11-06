import { describe, expect, it } from 'vitest';
import {
  calculateTextareaHeight,
  mergeAriaTokens,
  normalizeInputValue,
  normalizeNonNegativeInteger,
  normalizePositiveInteger,
  resolveTextareaRows,
} from '../../../src/components/input/input-utils';

describe('input-utils', () => {
  it('把可接受的模型初值稳定转换为字符串', () => {
    expect(normalizeInputValue(undefined)).toBe('');
    expect(normalizeInputValue(null)).toBe('');
    expect(normalizeInputValue('text')).toBe('text');
    expect(normalizeInputValue(0)).toBe('0');
    expect(normalizeInputValue(12.5)).toBe('12.5');
  });

  it('只接受符合原生约束的有限整数', () => {
    expect(normalizeNonNegativeInteger(0)).toBe(0);
    expect(normalizeNonNegativeInteger(8)).toBe(8);
    expect(normalizeNonNegativeInteger(-1)).toBeUndefined();
    expect(normalizeNonNegativeInteger(1.5)).toBeUndefined();
    expect(normalizeNonNegativeInteger(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(normalizeNonNegativeInteger(Number.NaN)).toBeUndefined();

    expect(normalizePositiveInteger(1, 3)).toBe(1);
    expect(normalizePositiveInteger(0, 3)).toBe(3);
    expect(normalizePositiveInteger(-1, 3)).toBe(3);
    expect(normalizePositiveInteger(2.5, 3)).toBe(3);
  });

  it('自动高度行数配置以 rows 为默认下限，并修正颠倒或非法边界', () => {
    expect(resolveTextareaRows(true, 5)).toEqual({
      minRows: 5,
      maxRows: undefined,
    });
    expect(resolveTextareaRows({ minRows: 2, maxRows: 1 }, 3)).toEqual({
      minRows: 2,
      maxRows: 2,
    });
    expect(resolveTextareaRows({ minRows: -1, maxRows: Number.NaN }, 0)).toEqual({
      minRows: 3,
      maxRows: undefined,
    });
  });

  it('自动高度包含内边距和边框，并在内容超过最大行数时开启滚动', () => {
    const baseMetrics = {
      lineHeight: '20px',
      fontSize: '16px',
      paddingTop: '4px',
      paddingBottom: '4px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
      minRows: 2,
      maxRows: 4,
    };

    expect(
      calculateTextareaHeight({
        ...baseMetrics,
        scrollHeight: 20,
      })
    ).toEqual({
      height: 50,
      overflowY: 'hidden',
    });
    expect(
      calculateTextareaHeight({
        ...baseMetrics,
        scrollHeight: 120,
      })
    ).toEqual({
      height: 90,
      overflowY: 'auto',
    });
  });

  it('line-height 无法解析时依据字号回退，所有测量值都拒绝 NaN 污染', () => {
    expect(
      calculateTextareaHeight({
        scrollHeight: Number.NaN,
        lineHeight: 'normal',
        fontSize: '10px',
        paddingTop: 'invalid',
        paddingBottom: '',
        borderTopWidth: 'invalid',
        borderBottomWidth: '',
        minRows: 2,
      })
    ).toEqual({
      height: 24,
      overflowY: 'hidden',
    });
  });

  it('合并 aria token 时压缩空白、去重，并在没有有效 token 时返回 undefined', () => {
    expect(mergeAriaTokens(' external   help ', 'help internal', undefined)).toBe(
      'external help internal'
    );
    expect(mergeAriaTokens('', '   ', undefined)).toBeUndefined();
  });
});
