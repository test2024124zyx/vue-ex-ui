import { toRaw } from 'vue';
import { usesNativeIdentity } from './native-identity';
import { createSnapshotMemberShape } from './value-snapshot-shape';

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
  leftCounts: Map<object, number>;
  rightIndices: Map<object, number[]>;
  firstAvailable: number;
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
  groupCount: number;
}

type MembershipIndex = WeakMap<object, Map<CollectionMatch, number>>;

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
  const leftMemberships: MembershipIndex = new WeakMap();
  const rightMemberships: MembershipIndex = new WeakMap();
  const groups: CollectionMatch[] = [];
  let readShape: ReturnType<typeof createSnapshotMemberShape> | undefined;

  function enqueue(leftValue: unknown, rightValue: unknown): void {
    pending = { left: leftValue, right: rightValue, next: pending };
  }

  function indexMembership(
    index: MembershipIndex,
    key: object,
    group: CollectionMatch,
    count: number
  ): void {
    let memberships = index.get(key);
    if (!memberships) {
      memberships = new Map();
      index.set(key, memberships);
    }
    memberships.set(group, count);
  }

  function enqueueGroup(leftEntries: ObjectEntry[], rightEntries: ObjectEntry[]): boolean {
    const leftCounts = new Map<object, number>();
    for (const [key] of leftEntries) leftCounts.set(key, (leftCounts.get(key) ?? 0) + 1);
    const rightIndices = new Map<object, number[]>();
    rightEntries.forEach(([key], index) => {
      const indices = rightIndices.get(key);
      if (indices) indices.push(index);
      else rightIndices.set(key, [index]);
    });
    const collection: CollectionMatch = {
      left: leftEntries,
      right: rightEntries,
      used: new Set(),
      leftCounts,
      rightIndices,
      firstAvailable: 0,
    };
    if (!mappedMembersFit(collection)) return false;
    for (const [key, count] of leftCounts) indexMembership(leftMemberships, key, collection, count);
    for (const [key, indices] of rightIndices)
      indexMembership(rightMemberships, key, collection, indices.length);
    groups.push(collection);
    matches = { collection, index: 0, next: matches };
    return true;
  }

  function groupMembers<T>(
    entries: ObjectEntry[],
    classify: (entry: ObjectEntry) => T | undefined
  ): Map<T, ObjectEntry[]> | undefined {
    const groups = new Map<T, ObjectEntry[]>();
    for (const entry of entries) {
      const shape = classify(entry);
      if (shape === undefined) return undefined;
      const group = groups.get(shape);
      if (group) group.push(entry);
      else groups.set(shape, [entry]);
    }
    return groups;
  }

  function groupReadableMembers(
    left: ObjectEntry[],
    right: ObjectEntry[],
    readFields: ReturnType<typeof createSnapshotMemberShape>['readableFields']
  ): boolean {
    const fields = new Map([...left, ...right].map(entry => [entry, readFields(entry)]));
    const first = fields.get(left[0]!)!;
    // 每个候选都能静态读取的字段才可用于分组，getter 与普通数据仍能按实际值比较。
    const candidates = [...fields.values()];
    const common = [...first.keys()].filter(path => candidates.every(values => values.has(path)));
    if (!common.length) return enqueueGroup(left, right);
    const classify = (entry: ObjectEntry) => {
      const values = fields.get(entry)!;
      return common.map(path => values.get(path)).join(',');
    };
    const leftGroups = groupMembers(left, classify)!;
    const rightGroups = groupMembers(right, classify)!;
    for (const [shape, entries] of leftGroups) {
      const compatible = rightGroups.get(shape);
      if (entries.length !== compatible?.length || !enqueueGroup(entries, compatible)) return false;
    }
    return true;
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
    readShape ??= createSnapshotMemberShape();
    const leftOutlines = groupMembers(leftEntries, readShape.outline)!;
    const rightOutlines = groupMembers(rightEntries, readShape.outline)!;
    for (const [outline, leftGroup] of leftOutlines) {
      const rightGroup = rightOutlines.get(outline);
      if (leftGroup.length !== rightGroup?.length) return false;
      const leftShapes = groupMembers(leftGroup, readShape.detailed);
      const rightShapes = leftShapes && groupMembers(rightGroup, readShape.detailed);
      // 访问器的实际值交给完整比较，回退仍受原型和自有键约束。
      if (!leftShapes || !rightShapes) {
        if (!groupReadableMembers(leftGroup, rightGroup, readShape.readableFields)) return false;
        continue;
      }
      for (const [shape, leftShape] of leftShapes) {
        const rightShape = rightShapes.get(shape);
        if (leftShape.length !== rightShape?.length) return false;
        if (!enqueueGroup(leftShape, rightShape)) return false;
      }
    }
    return true;
  }

  function mappedMembersFit({ leftCounts, rightIndices }: CollectionMatch): boolean {
    for (const [key, count] of leftCounts) {
      const linked = seen.get(key);
      if (linked && rightIndices.get(linked)?.length !== count) return false;
    }
    for (const [key, candidates] of rightIndices) {
      const linked = reverseSeen.get(key);
      if (linked && leftCounts.get(linked) !== candidates.length) return false;
    }
    return true;
  }

  function mappingFitsGroups(a: object, b: object): boolean {
    const first = leftMemberships.get(a);
    const second = rightMemberships.get(b);
    if ((first?.size ?? 0) !== (second?.size ?? 0)) return false;
    if (first && second) {
      for (const [group, count] of first) if (second.get(group) !== count) return false;
    }
    return true;
  }

  function comparePair(leftValue: unknown, rightValue: unknown): boolean {
    if (!isObject(leftValue) || !isObject(rightValue)) return Object.is(leftValue, rightValue);
    const a = toRaw(leftValue);
    const b = toRaw(rightValue);
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    // 不透明对象无法靠自有属性比较；只允许同一原生对象继续作为确认值。
    if (usesNativeIdentity(a)) return a === b;
    if (seen.has(a)) return seen.get(a) === b;
    // 双向身份映射同时识别共享引用被拆分或合并，保留对象图的关系。
    if (reverseSeen.has(b)) return false;
    // 一次新引用配对须满足所有已登记集合的成员约束。
    if (!mappingFitsGroups(a, b)) return false;
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
    const linkedCandidates = linkedKey ? (collection.rightIndices.get(linkedKey) ?? []) : undefined;
    const length = linkedCandidates?.length ?? collection.right.length;
    for (
      let offset = linkedCandidates ? 0 : Math.max(start, collection.firstAvailable);
      offset < length;
      offset++
    ) {
      const candidate = linkedCandidates?.[offset] ?? offset;
      if (candidate < start || collection.used.has(candidate)) continue;
      const [otherKey, otherValue] = collection.right[candidate]!;
      if (!linkedKey && reverseSeen.has(otherKey)) continue;
      if (Object.getPrototypeOf(key) !== Object.getPrototypeOf(otherKey)) continue;
      choices.push({ match, candidate, mappedCount: mapped.length, groupCount: groups.length });
      collection.used.add(candidate);
      while (collection.used.has(collection.firstAvailable)) collection.firstAvailable++;
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
      const { match, candidate, mappedCount, groupCount } = choices.pop()!;
      // 撤销候选引入的身份映射，保留进入该集合成员前已确认的引用关系。
      while (mapped.length > mappedCount) {
        const [a, b] = mapped.pop()!;
        seen.delete(a);
        reverseSeen.delete(b);
      }
      while (groups.length > groupCount) {
        const group = groups.pop()!;
        for (const key of group.leftCounts.keys()) leftMemberships.get(key)?.delete(group);
        for (const key of group.rightIndices.keys()) rightMemberships.get(key)?.delete(group);
      }
      match.collection.used.delete(candidate);
      match.collection.firstAvailable = Math.min(match.collection.firstAvailable, candidate);
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
