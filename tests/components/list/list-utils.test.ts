import { describe, expect, it } from 'vitest';
import {
  getListItemKeyCandidate,
  normalizeListGrid,
  normalizeListSize,
} from '../../../src/components/list/list-utils';
import type { ListItem } from '../../../src/components/list/types';

describe('List 工具函数', () => {
  it('尺寸只接受真实三档值', () => {
    expect(normalizeListSize('small')).toBe('small');
    expect(normalizeListSize('huge')).toBe('medium');
    expect(normalizeListSize(undefined)).toBe('medium');
  });

  it('grid 断点继承最近有效值并规范列数与间距', () => {
    expect(
      normalizeListGrid({
        column: 3.9,
        gutter: -4,
        xs: 1,
        sm: 2.8,
        md: 0,
        lg: 5,
        xl: 99,
      })
    ).toEqual({
      '--ex-list-grid-gutter': '0px',
      '--ex-list-grid-columns-xs': '1',
      '--ex-list-grid-columns-sm': '2',
      '--ex-list-grid-columns-md': '2',
      '--ex-list-grid-columns-lg': '5',
      '--ex-list-grid-columns-xl': '24',
      '--ex-list-grid-columns-xxl': '24',
    });
  });

  it('空 grid 使用四列稳定默认值并阻断外层 CSS 变量继承', () => {
    expect(normalizeListGrid({})).toEqual({
      '--ex-list-grid-gutter': '0px',
      '--ex-list-grid-columns-xs': '4',
      '--ex-list-grid-columns-sm': '4',
      '--ex-list-grid-columns-md': '4',
      '--ex-list-grid-columns-lg': '4',
      '--ex-list-grid-columns-xl': '4',
      '--ex-list-grid-columns-xxl': '4',
    });
  });

  it('字段名与函数解析器只返回合法 PropertyKey', () => {
    const item: ListItem = { key: 1, id: 'server-a', invalid: {} };
    const symbol = Symbol('row');

    expect(getListItemKeyCandidate(item, 0, 'key')).toBe(1);
    expect(getListItemKeyCandidate(item, 0, 'id')).toBe('server-a');
    expect(getListItemKeyCandidate(item, 0, 'invalid')).toBeUndefined();
    expect(getListItemKeyCandidate(item, 2, (_item, index) => `${index}`)).toBe('2');
    expect(getListItemKeyCandidate(item, 0, () => symbol)).toBe(symbol);
    expect(getListItemKeyCandidate(item, 0, () => null)).toBeUndefined();
  });

  it('解析器异常直接暴露配置错误，不静默更换键策略', () => {
    const error = new Error('key resolver failed');
    expect(() =>
      getListItemKeyCandidate({ title: 'A' }, 0, () => {
        throw error;
      })
    ).toThrow(error);
  });
});
