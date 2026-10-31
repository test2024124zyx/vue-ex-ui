import { toRaw } from 'vue';

/** 迭代比较值快照，支持常用结构与循环引用，不依赖 JSON 的丢失类型序列化。 */
export function equalValueSnapshot(left: unknown, right: unknown): boolean {
  const pending: Array<[unknown, unknown]> = [[left, right]];
  const seen = new WeakMap<object, object>();
  while (pending.length) {
    const [leftValue, rightValue] = pending.pop()!;
    const a = leftValue && typeof leftValue === 'object' ? toRaw(leftValue) : leftValue;
    const b = rightValue && typeof rightValue === 'object' ? toRaw(rightValue) : rightValue;
    if (Object.is(a, b)) continue;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    if (seen.has(a)) {
      if (seen.get(a) !== b) return false;
      continue;
    }
    seen.set(a, b);
    if (a instanceof Date && b instanceof Date && !Object.is(a.getTime(), b.getTime()))
      return false;
    if (
      a instanceof RegExp &&
      b instanceof RegExp &&
      (a.source !== b.source || a.flags !== b.flags)
    )
      return false;
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      pending.push([[...a], [...b]]);
    } else if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      pending.push([[...a], [...b]]);
    } else if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
      pending.push([new Uint8Array(a), new Uint8Array(b)]);
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
      pending.push([Reflect.get(a, key), Reflect.get(b, key)]);
    }
  }
  return true;
}
