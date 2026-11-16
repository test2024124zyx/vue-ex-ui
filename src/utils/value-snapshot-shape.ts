import { toRaw } from 'vue';
import { usesNativeIdentity } from './native-identity';

// 签名只是预筛选，按成员限制访问量，避免反复遍历大集合中的共享子图。
const MEMBER_SHAPE_BUDGET = 32;
const READABLE_FIELDS_BUDGET = MEMBER_SHAPE_BUDGET * 2;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
type OwnShape = { signature: number; children: object[] };
type KeyToken = { key: string | symbol; id: number };
type Field = { id: number; value: unknown };
type ReadableNode = { others: KeyToken[]; fields: Field[] };
type ObservedProperty = { value: unknown } | { error: unknown };

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
  const internalShapes = new WeakMap<object, OwnShape | null>();
  const ownKeys = new WeakMap<object, KeyToken[]>();
  const readableNodes = new WeakMap<object, ReadableNode>();
  const observedNodes = new WeakMap<object, Field[]>();
  const observedProperties = new WeakMap<object, Map<PropertyKey, ObservedProperty>>();
  const outlines = new WeakMap<object, string>();
  const negativeZero = Symbol();
  const id = (value: unknown) => {
    const atom = Object.is(value, -0) ? negativeZero : value;
    const existing = atoms.get(atom);
    if (existing !== undefined) return existing;
    const next = atoms.size;
    atoms.set(atom, next);
    return next;
  };

  function keysOf(node: object): KeyToken[] {
    const cached = ownKeys.get(node);
    if (cached) return cached;
    const keys = Reflect.ownKeys(node).map(key => ({ key, id: id(key) }));
    keys.sort((first, second) => first.id - second.id);
    ownKeys.set(node, keys);
    return keys;
  }

  function outlineOf(value: unknown): string {
    if (value === null || typeof value !== 'object') return `value:${id(value)}`;
    const node = toRaw(value);
    if (usesNativeIdentity(node)) return `native:${id(node)}`;
    const cached = outlines.get(node);
    if (cached !== undefined) return cached;
    // 判断自有键无需读取访问器，仍可作为回退分组的必要条件。
    const shape = `object:${id(Object.getPrototypeOf(node))}:${keysOf(node)
      .map(key => key.id)
      .join(',')}`;
    outlines.set(node, shape);
    return shape;
  }

  function fieldsOf(node: object): ReadableNode {
    const cached = readableNodes.get(node);
    if (cached) return cached;
    const result: ReadableNode = { others: [], fields: [] };
    for (const token of keysOf(node)) {
      const descriptor = Object.getOwnPropertyDescriptor(node, token.key);
      if (descriptor && 'value' in descriptor)
        result.fields.push({ id: token.id, value: descriptor.value });
      else result.others.push(token);
    }
    readableNodes.set(node, result);
    return result;
  }

  function observedFieldsOf(node: object, { fields, others }: ReadableNode): Field[] {
    if (!others.length) return fields;
    const previous = observedNodes.get(node);
    if (previous) return previous;
    const properties = new Map<PropertyKey, ObservedProperty>();
    const result = [...fields];
    for (const { key, id } of others) {
      try {
        const value: unknown = Reflect.get(node, key);
        properties.set(key, { value });
        result.push({ id, value });
      } catch (error) {
        // 保留读取失败的结果，等完整配对真正使用该属性时再抛出。
        properties.set(key, { error });
      }
    }
    result.sort((a, b) => a.id - b.id);
    observedNodes.set(node, result);
    observedProperties.set(node, properties);
    return result;
  }

  function readValue(node: object, key: PropertyKey): unknown {
    const property = observedProperties.get(node)?.get(key);
    if (!property) return Reflect.get(node, key);
    if ('error' in property) throw property.error;
    return property.value;
  }

  function appendValue(shape: Array<string | number>, children: object[], value: unknown): void {
    if (value !== null && typeof value === 'object') {
      shape.push('child');
      children.push(value);
    } else {
      shape.push('value', id(value));
    }
  }

  function internalShapeOf(node: object): OwnShape | undefined {
    const cached = internalShapes.get(node);
    if (cached !== undefined) return cached ?? undefined;
    const shape: Array<string | number> = [];
    const children: object[] = [];
    const bytes = bytesOf(node);
    if (bytes) {
      // 摘要仅淘汰不相容候选，实际相等仍由完整的逐字节比较确认。
      let hash = FNV_OFFSET_BASIS;
      for (const byte of bytes) hash = Math.imul(hash ^ byte, FNV_PRIME);
      shape.push('binary', bytes.length, hash);
    } else if (node instanceof Date) {
      shape.push('date', id(node.getTime()));
    } else if (node instanceof RegExp) {
      shape.push('regexp', id(node.source), id(node.flags));
    } else if (node instanceof Map || node instanceof Set) {
      shape.push('collection', node.size);
      const fixed: Array<[number, unknown]> = [];
      for (const [entryKey, entryValue] of node.entries()) {
        if (entryKey === null || typeof entryKey !== 'object')
          fixed.push([id(entryKey), entryValue]);
      }
      fixed.sort(([first], [second]) => first - second);
      for (const [keyId, entryValue] of fixed) {
        shape.push(keyId);
        appendValue(shape, children, entryValue);
      }
    }
    const result = shape.length ? { signature: id(shape.join(',')), children } : undefined;
    internalShapes.set(node, result ?? null);
    return result;
  }

  function readOwnShape(node: object): OwnShape | null {
    const cached = ownShapes.get(node);
    if (cached !== undefined) return cached;
    const internal = internalShapeOf(node);
    const { others, fields } = fieldsOf(node);
    if (others.length) {
      ownShapes.set(node, null);
      return null;
    }
    const shape: Array<string | number> = internal ? ['internal', internal.signature] : [];
    const children = internal ? [...internal.children] : [];
    shape.push('properties', fields.length);
    for (const { id, value } of fields) {
      shape.push(id);
      appendValue(shape, children, value);
    }
    const result = { signature: id(shape.join(',')), children };
    ownShapes.set(node, result);
    return result;
  }

  function detailed([key, value]: readonly [object, unknown]): string | undefined {
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
  }

  function readableFields(
    [key, value]: readonly [object, unknown],
    includeValue: boolean,
    observeAccessors: boolean
  ): Map<string, number> {
    const result = new Map<string, number>();
    const pending: Array<{ node: unknown; path: string; root?: true }> = [
      { node: key, path: 'key', root: true },
    ];
    if (includeValue && value !== key) pending.push({ node: value, path: 'value', root: true });
    const visited = new WeakSet<object>();
    let remaining = MEMBER_SHAPE_BUDGET;
    let fieldBudget = READABLE_FIELDS_BUDGET;
    while (pending.length && remaining-- > 0) {
      const { node: item, path, root } = pending.shift()!;
      if (!root && fieldBudget === 0) break;
      if (item === null || typeof item !== 'object') continue;
      const node = toRaw(item);
      if (usesNativeIdentity(node) || visited.has(node)) continue;
      visited.add(node);
      // 原生对象的内部值不受额外自有访问器影响，可独立参与候选筛选。
      const internal = internalShapeOf(node);
      if (internal) result.set(`${path}.internal`, internal.signature);
      const known = readOwnShape(node);
      if (known) result.set(`${path}.data`, known.signature);
      // 成员本身的字段参与筛选，预算只限制递归展开的子图。
      const readable = fieldsOf(node);
      const fields = observeAccessors ? observedFieldsOf(node, readable) : readable.fields;
      const count = root ? fields.length : Math.min(fieldBudget, fields.length);
      if (!root) fieldBudget -= count;
      for (let index = 0; index < count; index++) {
        const { id: keyId, value } = fields[index]!;
        const position = `${path}.${keyId}`;
        result.set(position, id(outlineOf(value)));
        if (value !== null && typeof value === 'object' && pending.length < remaining) {
          pending.push({ node: value, path: position });
        }
      }
    }
    return result;
  }

  return {
    outline: ([key, value]: readonly [object, unknown]) => `${outlineOf(key)}|${outlineOf(value)}`,
    detailed,
    readableFields,
    readValue,
  };
}
