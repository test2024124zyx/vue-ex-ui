import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { deepClone } from '../../src/utils/clone';
import { equalValueSnapshot } from '../../src/utils/value-snapshot';

describe('无序集合快照', () => {
  it('按原始键和成员匹配，忽略插入顺序并保留符号与 NaN 语义', () => {
    const key = Symbol('唯一键');
    const entries = new Map<unknown, unknown>([
      [key, 1],
      [NaN, undefined],
      ['value', 3],
    ]);
    expect(equalValueSnapshot(reactive(entries), new Map([...entries].reverse()))).toBe(true);
    const missingKey = new Map(entries);
    missingKey.delete(NaN);
    missingKey.set(null, undefined);
    expect(equalValueSnapshot(entries, missingKey)).toBe(false);
    expect(equalValueSnapshot(new Set([key, NaN, -0]), new Set([0, NaN, key]))).toBe(true);
    expect(equalValueSnapshot(new Set([key, 0]), new Set([key, 1]))).toBe(false);
  });

  it('区分成功换序与对象键关联到了错误的值', () => {
    const first = { id: 1 };
    const second = { id: 1 };
    const source = new Map([
      [first, { name: '甲' }],
      [second, { name: '乙' }],
    ]);
    const entries = [...deepClone(source)].reverse();
    expect(equalValueSnapshot(source, new Map(entries))).toBe(true);
    entries[0]![1].name = '丙';
    expect(equalValueSnapshot(source, new Map(entries))).toBe(false);
  });

  it('结合集合外层的共享引用匹配，识别引用拆分和合并', () => {
    const key = { value: 1 };
    const other = { value: 1 };
    const source = { key, values: new Set([key, other]) };
    const snapshot = deepClone(source);
    snapshot.values = new Set([...snapshot.values].reverse());
    expect(equalValueSnapshot(source, snapshot)).toBe(true);
    snapshot.key = { value: 1 };
    expect(equalValueSnapshot(source, snapshot)).toBe(false);
    expect(equalValueSnapshot(snapshot, source)).toBe(false);
  });

  it('在 Map 与 Set 的循环引用中保留别名和容器自有属性', () => {
    const map = new Map<object, unknown>();
    const set = new Set([map, {}]);
    map.set(set, map);
    map.set(map, set);
    const newMap = new Map<object, unknown>();
    const newSet = new Set([{}, newMap]);
    newMap.set(newMap, newSet);
    newMap.set(newSet, newMap);
    expect(equalValueSnapshot(map, newMap)).toBe(true);
    Reflect.set(newMap, 'version', 1);
    expect(equalValueSnapshot(map, newMap)).toBe(false);
  });

  it('大量同形成员后出现不相容成员时按结构与数量淘汰候选', () => {
    const pool = (distinct: number) =>
      new Set(
        Array.from({ length: 10 }, (_, index) => ({
          metadata: { value: index === 9 ? distinct : 0 },
        }))
      );
    const start = performance.now();
    expect(equalValueSnapshot(pool(1), pool(0))).toBe(false);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('无法静态读取的访问器仍按实际的值比较', () => {
    const entry = {
      get nested() {
        return { value: 2 };
      },
    };
    expect(equalValueSnapshot(new Set([entry]), new Set([{ nested: { value: 2 } }]))).toBe(true);
  });

  it('带回指的不透明 Promise 保留身份，不展开它的附加属性', () => {
    const promise = Promise.resolve();
    const entry = { promise };
    Object.assign(promise, { owner: entry });
    const source = new Set([entry]);
    expect(equalValueSnapshot(source, deepClone(source))).toBe(true);
    expect(equalValueSnapshot(source, new Set([{ promise: Promise.resolve() }]))).toBe(false);
  });

  it('共享的大环只生成有界结构，成员换序后仍能正确比较', () => {
    const nodes: Array<{ id: number; next?: object }> = Array.from({ length: 1000 }, (_, id) => ({
      id,
    }));
    nodes.forEach((node, index) => {
      node.next = nodes[(index + 1) % nodes.length];
    });
    const values = new Set(nodes);
    const snapshot = new Set([...deepClone(values)].reverse());
    const start = performance.now();
    expect(equalValueSnapshot(values, snapshot)).toBe(true);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('按原始键直接匹配大集合，深层结构沿用迭代遍历', () => {
    const entries = Array.from({ length: 12_000 }, (_, index) => [index, index] as const);
    expect(equalValueSnapshot(new Map(entries), new Map(entries.toReversed()))).toBe(true);
    let left: unknown = new Set([2, 1]);
    let right: unknown = new Set([1, 2]);
    for (let index = 0; index < entries.length; index++) {
      left = { next: left };
      right = { next: right };
    }
    expect(equalValueSnapshot(left, right)).toBe(true);
  });
});
