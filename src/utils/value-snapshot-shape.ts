import { toRaw } from 'vue';
import { usesNativeIdentity } from './native-identity';

// 签名只是预筛选，按成员限制访问量，避免反复遍历大集合中的共享子图。
const MEMBER_SHAPE_BUDGET = 32;

/** 生成候选的必要条件，访问器和无序成员的实际值仍交由快照比较。 */
export function createSnapshotMemberShape() {
  const atoms = new Map<unknown, number>();
  const ownKeys = new WeakMap<object, Array<string | symbol>>();
  const negativeZero = Symbol();
  const id = (value: unknown) => {
    const atom = Object.is(value, -0) ? negativeZero : value;
    const existing = atoms.get(atom);
    if (existing !== undefined) return existing;
    const next = atoms.size;
    atoms.set(atom, next);
    return next;
  };

  return ([key, value]: readonly [object, unknown]): string | undefined => {
    const pending: unknown[] = [value, key];
    const visited = new WeakMap<object, number>();
    let referenceCount = 0;
    let remaining = MEMBER_SHAPE_BUDGET;
    const shape: Array<string | number> = [];
    while (pending.length && remaining-- > 0) {
      const item = pending.pop();
      if (item === null || typeof item !== 'object') {
        shape.push('value', id(item));
        continue;
      }
      const node = toRaw(item);
      if (usesNativeIdentity(node)) {
        shape.push('native', id(node));
        continue;
      }
      const reference = visited.get(node);
      if (reference !== undefined) {
        shape.push('reference', reference);
        continue;
      }
      visited.set(node, referenceCount++);
      shape.push('object', id(Object.getPrototypeOf(node)));
      if (node instanceof Date) shape.push('date', id(node.getTime()));
      else if (node instanceof RegExp) shape.push('regexp', id(node.source), id(node.flags));
      else if (node instanceof Map || node instanceof Set) {
        shape.push('collection', node.size);
        if (node.size > remaining) break;
        remaining -= node.size;
        const fixed: Array<[number, unknown]> = [];
        for (const [entryKey, entryValue] of node.entries()) {
          if (entryKey === null || typeof entryKey !== 'object') {
            fixed.push([id(entryKey), entryValue]);
          }
        }
        fixed.sort(([first], [second]) => first - second);
        shape.push(fixed.length);
        for (const [keyId, entryValue] of fixed) {
          shape.push(keyId);
          pending.push(entryValue);
        }
      }
      let properties = ownKeys.get(node);
      if (!properties) {
        properties = Reflect.ownKeys(node);
        ownKeys.set(node, properties);
      }
      shape.push('properties', properties.length);
      if (properties.length > remaining) break;
      remaining -= properties.length;
      const keys = properties.map(key => ({ key, id: id(key) }));
      keys.sort((first, second) => first.id - second.id);
      for (const { key, id: keyId } of keys) {
        const descriptor = Object.getOwnPropertyDescriptor(node, key);
        if (!descriptor || !('value' in descriptor)) return undefined;
        shape.push(keyId);
        const value: unknown = descriptor.value;
        if (value !== null && typeof value === 'object') {
          shape.push('child');
          pending.push(value);
        } else {
          shape.push('value', id(value));
        }
      }
    }
    return shape.join(',');
  };
}
