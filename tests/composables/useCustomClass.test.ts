import { describe, expect, it } from 'vitest';
import { normalizeCustomClass } from '../../src/composables/useCustomClass';

describe('normalizeCustomClass', () => {
  it('应该支持字符串、空值和数组类名', () => {
    expect(normalizeCustomClass('card')).toEqual(['card']);
    expect(normalizeCustomClass('')).toEqual([]);
    expect(normalizeCustomClass(null)).toEqual([]);
    expect(normalizeCustomClass(undefined)).toEqual([]);
    expect(normalizeCustomClass(['card', '', 'active'])).toEqual(['card', 'active']);
  });

  it('对象类名应该只保留真值键', () => {
    expect(
      normalizeCustomClass({ card: true, disabled: false, active: 1 as unknown as boolean })
    ).toEqual(['card', 'active']);
  });
});
