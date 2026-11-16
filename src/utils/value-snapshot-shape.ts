import { toRaw } from 'vue';
import { usesNativeIdentity } from './native-identity';

// 签名只是预筛选，按成员限制访问量，避免反复遍历大集合中的共享子图。
const MEMBER_SHAPE_BUDGET = 32;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
type OwnShape = { signature: number; children: object[] };

function bytesOf(value: object): Uint8Array | undefined {
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (
    value instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer)
  ) {
    return new Uint8Array(value);
  }
  return undefined;
}

/** 生成候选的必要条件，访问器和无序成员的实际值仍交由快照比较。 */
export function createSnapshotMemberShape() {
  const atoms = new Map<unknown, number>();
  const ownShapes = new WeakMap<object, OwnShape | null>();
  const negativeZero = Symbol();
  const id = (value: unknown) => {
    const atom = Object.is(value, -0) ? negativeZero : value;
    const existing = atoms.get(atom);
    if (existing !== undefined) return existing;
    const next = atoms.size;
    atoms.set(atom, next);
    return next;
  };

  function readOwnShape(node: object): OwnShape | null {
    const cached = ownShapes.get(node);
    if (cached !== undefined) return cached;
    const shape: Array<string | number> = [];
    const children: object[] = [];
    const append = (value: unknown) => {
      if (value !== null && typeof value === 'object') {
        shape.push('child');
        children.push(value);
      } else {
        shape.push('value', id(value));
      }
    };
    const bytes = bytesOf(node);
    if (bytes) {
      // 摘要仅淘汰不相容候选，实际相等仍由完整的逐字节比较确认。
      let hash = FNV_OFFSET_BASIS;
      for (const byte of bytes) hash = Math.imul(hash ^ byte, FNV_PRIME);
      shape.push('binary', bytes.length, hash);
    }
    if (node instanceof Map || node instanceof Set) {
      shape.push('collection', node.size);
      const fixed: Array<[number, unknown]> = [];
      for (const [entryKey, entryValue] of node.entries()) {
        if (entryKey === null || typeof entryKey !== 'object')
          fixed.push([id(entryKey), entryValue]);
      }
      fixed.sort(([first], [second]) => first - second);
      for (const [keyId, entryValue] of fixed) {
        shape.push(keyId);
        append(entryValue);
      }
    }
    const keys = Reflect.ownKeys(node).map(key => ({ key, id: id(key) }));
    keys.sort((first, second) => first.id - second.id);
    shape.push('properties', keys.length);
    for (const { key, id: keyId } of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(node, key);
      if (!descriptor || !('value' in descriptor)) {
        ownShapes.set(node, null);
        return null;
      }
      shape.push(keyId);
      append(descriptor.value);
    }
    const result = { signature: id(shape.join(',')), children };
    ownShapes.set(node, result);
    return result;
  }

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
      // 同一节点的完整浅层内容只读取一次，预算只限制追踪后续对象关系。
      const own = readOwnShape(node);
      if (!own) return undefined;
      shape.push(own.signature);
      const limit = Math.min(own.children.length, Math.max(0, remaining - pending.length));
      for (let index = limit - 1; index >= 0; index--) {
        pending.push(own.children[index]);
      }
    }
    return shape.join(',');
  };
}
