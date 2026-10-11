import { describe, expect, it } from 'vitest';
import { deepClone } from '../../../src/utils/clone';
import { equalEditSnapshot } from '../../../src/components/table/table-editing-state';

describe('Table 编辑冲突快照', () => {
  it('日期、集合、二进制和循环记录在无改动时不误报冲突', () => {
    const record: Record<string, unknown> = {
      date: new Date('2026-01-01'),
      pattern: /test/gi,
      tags: new Set(['a', 'b']),
      map: new Map([['a', { count: 1 }]]),
      buffer: new Uint8Array([1, 2]).buffer,
      view: new DataView(new Uint8Array([3, 4]).buffer),
    };
    record.self = record;
    expect(equalEditSnapshot(record, deepClone(record))).toBe(true);
  });

  it.each([
    [new Date('2026-01-01'), new Date('2026-02-01')],
    [/a/g, /a/i],
    [new Set([1]), new Set([1, 2])],
    [new Map([['a', 1]]), new Map([['a', 2]])],
    [new Map([['a', 1]]), new Map()],
    [new Uint8Array([1]), new Uint8Array([2])],
    [new Uint8Array([1]), new Uint8Array([1, 2])],
    [{ count: 1 }, { count: 2 }],
    [{ a: undefined }, {}],
    [{ a: 1 }, { b: 1 }],
    [[], {}],
    [null, {}],
  ])('识别字段类型或结构变更 %#', (before, after) => {
    expect(equalEditSnapshot(before, after)).toBe(false);
  });

  it('循环图指向关系改变视作外部更新，而不是无限递归', () => {
    const before: Record<string, unknown> = {};
    before.self = before;
    const after: Record<string, unknown> = {};
    after.self = {};
    expect(equalEditSnapshot(before, after)).toBe(false);
  });
});
