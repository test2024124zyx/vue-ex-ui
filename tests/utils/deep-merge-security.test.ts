import { describe, expect, it } from 'vitest';
import { deepMerge } from '../../src/utils';

const malicious = () =>
  JSON.parse(
    '{"__proto__":{"inheritedMarker":true},"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true},"safe":1}'
  ) as Record<string, unknown>;

function expectSafe(
  record: Record<string, unknown>,
  prototype: object | null = Object.prototype
): void {
  expect(Object.getPrototypeOf(record)).toBe(prototype);
  expect(record.inheritedMarker).toBeUndefined();
  expect(Object.hasOwn(record, '__proto__')).toBe(false);
  expect(Object.hasOwn(record, 'constructor')).toBe(false);
  expect(Object.hasOwn(record, 'prototype')).toBe(false);
  expect(({} as Record<string, unknown>).polluted).toBeUndefined();
}

describe('deepMerge 的目标和来源共享危险键边界', () => {
  it.each(['target', 'source'] as const)('%s 中的危险键不能进入返回值原型', position => {
    const input = malicious();
    const result =
      position === 'target'
        ? deepMerge(input, { safe: 2 })
        : deepMerge<Record<string, unknown>>({}, input);
    expectSafe(result);
    expect(result.safe).toBe(position === 'target' ? 2 : 1);
    // 调用者原始 JSON 保持不变，安全合并只创建返回对象。
    expect(Object.hasOwn(input, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(input)).toBe(Object.prototype);
  });

  it('目标和来源在实际递归合并的每层都过滤危险键', () => {
    const result = deepMerge({ nested: malicious() }, { nested: { ...malicious(), added: 2 } });
    expectSafe(result.nested);
    expect(result.nested.safe).toBe(1);
    expect(result.nested.added).toBe(2);
  });

  it('保留空原型目标、可枚举符号以及特殊对象替换语义', () => {
    const key = Symbol('审计符号');
    const target = Object.assign(Object.create(null), malicious(), { [key]: '保留' });
    const previousDate = new Date('2026-01-01');
    const nextDate = new Date('2026-09-22');
    const result = deepMerge(target, { date: previousDate }, { date: nextDate });
    expectSafe(result, null);
    expect(result[key]).toBe('保留');
    expect(result.date).toBe(nextDate);
  });
});
