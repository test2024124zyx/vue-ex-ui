import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';
import { deepClone } from '../../src/utils/clone';
import { equalValueSnapshot } from '../../src/utils/value-snapshot';

// 用实际属性枚举和候选查询次数约束规模，避免共享 CI 运行器耗时抖动。
function compareWithLinearWork(left: unknown, right: unknown, members: number): boolean {
  const maxOperations = members * 24;
  const ownKeys = Reflect.ownKeys;
  const readDescriptor = Object.getOwnPropertyDescriptor;
  const has = Set.prototype.has;
  let operations = 0;
  const count = () => {
    if (++operations > maxOperations) throw new Error(`集合比较超过 ${maxOperations} 次候选操作`);
  };
  Reflect.ownKeys = value => {
    count();
    return ownKeys(value);
  };
  Object.getOwnPropertyDescriptor = (value, key) => {
    count();
    return readDescriptor(value, key);
  };
  Set.prototype.has = function (this: Set<unknown>, value: unknown) {
    count();
    return has.call(this, value);
  };
  try {
    return equalValueSnapshot(left, right);
  } finally {
    Reflect.ownKeys = ownKeys;
    Object.getOwnPropertyDescriptor = readDescriptor;
    Set.prototype.has = has;
  }
}

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
    const source = pool(1);
    expect(compareWithLinearWork(source, pool(0), source.size)).toBe(false);
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
    expect(compareWithLinearWork(values, snapshot, values.size)).toBe(true);
  });

  it('宽数组作为集合成员时可从后半部分识别不相容内容', () => {
    const width = 32;
    const pool = (distinct: number) =>
      new Set(
        Array.from({ length: 10 }, (_, index) => {
          const values = Array<number>(width).fill(0);
          if (index === 9) values[values.length - 1] = distinct;
          return values;
        })
      );
    const source = pool(1);
    expect(compareWithLinearWork(source, pool(0), source.size * width)).toBe(false);
  });

  it('共享数组确定了所有成员身份后按映射直接寻找候选', () => {
    const entries: Array<{ all?: object[] }> = Array.from({ length: 18_000 }, () => ({}));
    for (const entry of entries) entry.all = entries;
    const source = new Set(entries);
    const clone = deepClone(source);
    expect(compareWithLinearWork(source, clone, source.size)).toBe(true);
  });

  it.each([false, true])('按实际字节筛选二进制成员，DataView：%s', view => {
    const pool = (different: number) =>
      new Set(
        Array.from({ length: 10 }, (_, index) => {
          const buffer = Uint8Array.of(index === 9 ? different : 0).buffer;
          return view ? new DataView(buffer) : buffer;
        })
      );
    const source = pool(1);
    expect(compareWithLinearWork(source, pool(0), source.size)).toBe(false);
    expect(equalValueSnapshot(source, new Set([...deepClone(source)].reverse()))).toBe(true);
  });

  it('大量互不引用的同形对象按可用候选前沿完成匹配', () => {
    const source = new Set(Array.from({ length: 18_000 }, () => ({})));
    const copied = deepClone(source);
    expect(compareWithLinearWork(source, copied, source.size)).toBe(true);
  });

  it('集合外层确认了无法匹配的引用时，先拒绝候选组', () => {
    const items = Array.from({ length: 10 }, () => ({}));
    const source = { values: new Set(items), selected: items.at(-1) };
    const snapshot = deepClone(source);
    snapshot.selected = {};
    expect(compareWithLinearWork(source, snapshot, items.length)).toBe(false);
    expect(compareWithLinearWork(snapshot, source, items.length)).toBe(false);
  });

  it('含访问器的原型组不会堵住大量普通对象的候选游标', () => {
    const special = Object.defineProperty([], 'score', { enumerable: true, get: () => 1 });
    const items = Array.from({ length: 18_000 }, () => ({}));
    const source = new Set([...items, special]);
    const snapshot = new Set([...deepClone(source)].reverse());
    expect(compareWithLinearWork(source, snapshot, source.size)).toBe(true);
  });

  it('一个集合自由配对时立即校验另一集合的成员引用', () => {
    const target = {};
    const values = new Set(Array.from({ length: 9 }, () => ({ selected: target })));
    const source = { values, anchors: new Set([target]) };
    const snapshot = deepClone(source);
    const external = {};
    for (const value of snapshot.values) value.selected = external;
    expect(compareWithLinearWork(source, snapshot, values.size)).toBe(false);
  });

  it('同原型的访问器成员仍按自有键隔离候选', () => {
    const special = {
      get score() {
        return 1;
      },
    };
    const source = new Set([...Array.from({ length: 18_000 }, () => ({})), special]);
    const snapshot = new Set([...deepClone(source)].reverse());
    expect(compareWithLinearWork(source, snapshot, source.size)).toBe(true);
  });

  it('回退候选时撤销这一分支登记的嵌套集合约束', () => {
    const member = (id: number) => ({
      first: new Set([{ id }]),
      second: new Set([{ active: true }]),
    });
    const source = new Set([member(1), member(2)]);
    const reordered = new Set([...deepClone(source)].reverse());
    expect(equalValueSnapshot(source, reordered)).toBe(true);
  });

  it.each([false, true])('含访问器时仍使用双方可读取的数据字段，嵌套=%s', nested => {
    let reads = 0;
    const pool = (different: number) =>
      new Set(
        Array.from({ length: 10 }, (_, index) => {
          const data = {
            id: index === 9 ? different : 0,
            get score() {
              reads++;
              return 1;
            },
          };
          return nested ? { data } : data;
        })
      );
    expect(equalValueSnapshot(pool(1), pool(0))).toBe(false);
    expect(reads).toBe(0);
  });

  it.each([0, 1])('部分候选的 getter 不取消其余候选的静态约束，实际值=%i', actual => {
    const zeros = () => Array.from({ length: 8 }, () => ({ id: 0 }));
    const left = new Set([...zeros(), { id: 1 }]);
    const right = new Set([
      ...zeros(),
      {
        get id() {
          return actual;
        },
      },
    ]);
    expect(compareWithLinearWork(left, right, left.size)).toBe(actual === 1);
  });

  it('精确候选与访问器候选交错时保留回退次序', () => {
    const source = new Set([{ id: 1 }, { id: 0 }, { id: 0 }]);
    const target = new Set([
      {
        get id() {
          return 0;
        },
      },
      { id: 0 },
      { id: 1 },
    ]);
    expect(compareWithLinearWork(source, target, source.size)).toBe(true);
  });

  it('带访问器并共享宽数组的成员复用静态描述符', () => {
    const entries: Array<{ readonly score: number; all?: object[] }> = Array.from(
      { length: 800 },
      () => ({
        get score() {
          return 1;
        },
      })
    );
    for (const entry of entries) entry.all = entries;
    const source = new Set(entries);
    const snapshot = deepClone(source, { materializeAccessors: true });
    expect(compareWithLinearWork(source, snapshot, source.size)).toBe(true);
  });

  it('宽对象的访问器不会遮住最后一个静态字段的差异', () => {
    const shared = Object.fromEntries(
      Array.from({ length: 96 }, (_, index) => [`field_${index}`, 0])
    );
    let reads = 0;
    const entries = (id: number) =>
      new Set(
        Array.from({ length: 8 }, (_, index) => ({
          ...shared,
          id: index === 7 ? id : 0,
          get score() {
            reads++;
            return 0;
          },
        }))
      );
    expect(compareWithLinearWork(entries(1), entries(0), 8 * 98)).toBe(false);
    expect(reads).toBe(0);
  });

  it.each([false, true])('按完整静态交集优先验证受限成员，存在未知候选=%s', wildcard => {
    let reads = 0;
    const unknown = () => {
      reads++;
      return 0;
    };
    const first = () => ({
      kind: 0,
      a: 0,
      get b() {
        return unknown();
      },
    });
    const second = () => ({
      kind: 1,
      get a() {
        return unknown();
      },
      b: 0,
    });
    const partial = (kind: number) => ({
      kind,
      get a() {
        return unknown();
      },
      get b() {
        return unknown();
      },
    });
    const left = new Set([
      ...Array.from({ length: 6 }, () => partial(0)),
      ...Array.from({ length: 5 }, () => partial(1)),
      {
        get kind() {
          return unknown();
        },
        a: 1,
        b: 1,
      },
    ]);
    const right = new Set([
      ...Array.from({ length: 6 }, first),
      ...Array.from({ length: wildcard ? 5 : 6 }, second),
      ...(wildcard ? [partial(1)] : []),
    ]);
    expect(compareWithLinearWork(left, right, left.size)).toBe(false);
    if (!wildcard) expect(reads).toBe(0);
  });

  it('所有对象键共享一个宽 Map 值时只比较一次该值', () => {
    const entries = Array.from({ length: 800 }, (_, id) => ({
      id,
      get score() {
        return 1;
      },
    }));
    const source = new Map(entries.map(key => [key, entries]));
    const snapshot = deepClone(source, { materializeAccessors: true });
    const set = Map.prototype.set;
    const maxWrites = entries.length * 100;
    let writes = 0;
    Map.prototype.set = function <K, V>(this: Map<K, V>, key: K, value: V) {
      if (++writes > maxWrites) throw new Error('重复展开了共享的 Map 值');
      return set.call(this, key, value) as Map<K, V>;
    };
    try {
      expect(equalValueSnapshot(source, new Map([...snapshot].reverse()))).toBe(true);
    } finally {
      Map.prototype.set = set;
    }
    const values = snapshot.values().next().value!;
    values[0] = { ...values[0]! };
    expect(equalValueSnapshot(source, snapshot)).toBe(false);
  });

  it('未匹配的首项不会使静态候选在换序后反复扫描已用位置', () => {
    const zeros = () => Array.from({ length: 4000 }, () => ({ id: 0 }));
    const left = new Set([
      ...zeros(),
      {
        get id() {
          return 1;
        },
      },
    ]);
    const right = new Set([{ id: 1 }, ...zeros()]);
    expect(compareWithLinearWork(left, right, left.size)).toBe(true);
  });

  it('共享引用使前一配对回退时恢复候选索引的可用位置', () => {
    const member = (value: object) => ({
      id: 0,
      get value() {
        return value;
      },
    });
    const shared = {};
    const copied = {};
    const left = new Set([
      member(shared),
      member(shared),
      member({}),
      {
        get id() {
          return 1;
        },
        value: null,
      },
    ]);
    const right = new Set([{ id: 1, value: null }, member({}), member(copied), member(copied)]);
    expect(equalValueSnapshot(left, right)).toBe(true);
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
