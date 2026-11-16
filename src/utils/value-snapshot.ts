import { toRaw } from 'vue';

interface PendingPair {
  left: unknown;
  right: unknown;
  next: PendingPair | undefined;
}

type ObjectEntry = [object, unknown];

interface CollectionMatch {
  left: ObjectEntry[];
  right: ObjectEntry[];
  used: Set<number>;
}

interface PendingMatch {
  collection: CollectionMatch;
  index: number;
  next: PendingMatch | undefined;
}

interface MatchChoice {
  match: PendingMatch;
  candidate: number;
  mappedCount: number;
}

function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

/** 迭代比较值快照，支持常用结构与循环引用，不依赖 JSON 的丢失类型序列化。 */
export function equalValueSnapshot(left: unknown, right: unknown): boolean {
  let pending: PendingPair | undefined = { left, right, next: undefined };
  let matches: PendingMatch | undefined;
  const seen = new WeakMap<object, object>();
  const reverseSeen = new WeakMap<object, object>();
  const mapped: Array<[object, object]> = [];
  const choices: MatchChoice[] = [];

  function enqueue(leftValue: unknown, rightValue: unknown): void {
    pending = { left: leftValue, right: rightValue, next: pending };
  }

  function compareCollection(a: Map<unknown, unknown> | Set<unknown>, b: typeof a): boolean {
    if (a.size !== b.size) return false;
    const leftEntries: ObjectEntry[] = [];
    for (const [key, value] of a.entries()) {
      if (isObject(key)) {
        leftEntries.push([toRaw(key), value]);
      } else {
        if (!b.has(key)) return false;
        if (b instanceof Map) enqueue(value, b.get(key));
      }
    }
    if (!leftEntries.length) return true;
    const rightEntries: ObjectEntry[] = [];
    for (const [key, value] of b.entries()) {
      if (isObject(key)) rightEntries.push([toRaw(key), value]);
    }
    matches = {
      collection: { left: leftEntries, right: rightEntries, used: new Set() },
      index: 0,
      next: matches,
    };
    return true;
  }

  function comparePair(leftValue: unknown, rightValue: unknown): boolean {
    if (!isObject(leftValue) || !isObject(rightValue)) return Object.is(leftValue, rightValue);
    const a = toRaw(leftValue);
    const b = toRaw(rightValue);
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    // 不透明对象无法靠自有属性比较；只允许同一原生对象继续作为确认值。
    if (
      a instanceof Promise ||
      a instanceof WeakMap ||
      a instanceof WeakSet ||
      (typeof Blob !== 'undefined' && a instanceof Blob)
    ) {
      return a === b;
    }
    if (seen.has(a)) return seen.get(a) === b;
    // 双向身份映射同时识别共享引用被拆分或合并，保留对象图的关系。
    if (reverseSeen.has(b)) return false;
    seen.set(a, b);
    reverseSeen.set(b, a);
    if (choices.length) mapped.push([a, b]);
    if (a instanceof Date && b instanceof Date && !Object.is(a.getTime(), b.getTime()))
      return false;
    if (
      a instanceof RegExp &&
      b instanceof RegExp &&
      (a.source !== b.source || a.flags !== b.flags)
    )
      return false;
    if ((a instanceof Map && b instanceof Map) || (a instanceof Set && b instanceof Set)) {
      if (!compareCollection(a, b)) return false;
    } else if (
      a instanceof ArrayBuffer ||
      (typeof SharedArrayBuffer !== 'undefined' && a instanceof SharedArrayBuffer)
    ) {
      enqueue(new Uint8Array(a), new Uint8Array(b as ArrayBufferLike));
    } else if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      if (a.byteLength !== b.byteLength) return false;
      const first = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      const second = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
      for (let index = 0; index < first.length; index++)
        if (first[index] !== second[index]) return false;
    }
    const keys = Reflect.ownKeys(a);
    if (keys.length !== Reflect.ownKeys(b).length) return false;
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      enqueue(Reflect.get(a, key), Reflect.get(b, key));
    }
    return true;
  }

  function matchEntry(match: PendingMatch, start: number): boolean {
    const { collection, index, next } = match;
    const [key, value] = collection.left[index]!;
    const linkedKey = seen.get(key);
    for (let candidate = start; candidate < collection.right.length; candidate++) {
      if (collection.used.has(candidate)) continue;
      const [otherKey, otherValue] = collection.right[candidate]!;
      if (linkedKey ? otherKey !== linkedKey : reverseSeen.has(otherKey)) continue;
      if (Object.getPrototypeOf(key) !== Object.getPrototypeOf(otherKey)) continue;
      choices.push({ match, candidate, mappedCount: mapped.length });
      collection.used.add(candidate);
      matches = index + 1 < collection.left.length ? { collection, index: index + 1, next } : next;
      enqueue(value, otherValue);
      enqueue(key, otherKey);
      return true;
    }
    return false;
  }

  function retryMatch(): boolean {
    pending = undefined;
    while (choices.length) {
      const { match, candidate, mappedCount } = choices.pop()!;
      // 撤销候选引入的身份映射，保留进入该集合成员前已确认的引用关系。
      while (mapped.length > mappedCount) {
        const [a, b] = mapped.pop()!;
        seen.delete(a);
        reverseSeen.delete(b);
      }
      match.collection.used.delete(candidate);
      if (matchEntry(match, candidate + 1)) return true;
    }
    return false;
  }

  // 先确认固定位置的配对，再尝试无序对象成员，减少共享引用需要回退的次数。
  while (pending || matches) {
    if (pending) {
      const pair: PendingPair = pending;
      pending = pair.next;
      if (!comparePair(pair.left, pair.right) && !retryMatch()) return false;
    } else if (matches && !matchEntry(matches, 0) && !retryMatch()) {
      return false;
    }
  }
  return true;
}
