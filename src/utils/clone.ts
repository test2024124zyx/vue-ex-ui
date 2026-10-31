type ConstructableView = new (
  buffer: ArrayBufferLike,
  byteOffset?: number,
  length?: number
) => ArrayBufferView;

interface CloneContext {
  seen: WeakMap<object, unknown>;
  hydrated: WeakSet<object>;
  hydrating: WeakSet<object>;
}

type CloneableBuffer = ArrayBuffer | SharedArrayBuffer;

const isSharedArrayBuffer = (value: object): value is SharedArrayBuffer =>
  typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer;

const isCloneableBuffer = (value: object): value is CloneableBuffer =>
  value instanceof ArrayBuffer || isSharedArrayBuffer(value);

const getOrCreateBufferShell = (value: CloneableBuffer, context: CloneContext): CloneableBuffer => {
  const existing = context.seen.get(value);
  if (existing) return existing as CloneableBuffer;

  const cloned = value.slice(0) as CloneableBuffer;
  context.seen.set(value, cloned);
  return cloned;
};

const cloneArrayBufferView = (value: ArrayBufferView, buffer: ArrayBufferLike): ArrayBufferView => {
  if (value instanceof DataView) {
    return new DataView(buffer, value.byteOffset, value.byteLength);
  }

  const View = value.constructor as ConstructableView;
  const length =
    'length' in value ? (value as ArrayBufferView & { length: number }).length : undefined;
  return new View(buffer, value.byteOffset, length);
};

const cloneOwnProperties = (source: object, target: object, context: CloneContext): void => {
  if (context.hydrated.has(source) || context.hydrating.has(source)) return;
  context.hydrating.add(source);

  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor) continue;
    if ('value' in descriptor) descriptor.value = cloneValue(descriptor.value, context);
    Object.defineProperty(target, key, descriptor);
  }

  context.hydrating.delete(source);
  context.hydrated.add(source);
};

const cloneValue = (value: unknown, context: CloneContext): unknown => {
  if (value === null || typeof value !== 'object') return value;
  const existing = context.seen.get(value);
  if (existing !== undefined) return existing;

  if (value instanceof WeakMap || value instanceof WeakSet || value instanceof Promise)
    return value;

  // File 继承 Blob；二进制内容不可变，保留原生对象才能保持读取和上传所需的内部槽。
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;

  if (value instanceof Date) {
    const cloned = new Date(value.getTime());
    context.seen.set(value, cloned);
    cloneOwnProperties(value, cloned, context);
    return cloned;
  }

  if (value instanceof RegExp) {
    const cloned = new RegExp(value.source, value.flags);
    context.seen.set(value, cloned);
    cloneOwnProperties(value, cloned, context);
    return cloned;
  }

  if (isCloneableBuffer(value)) {
    const cloned = getOrCreateBufferShell(value, context);
    cloneOwnProperties(value, cloned, context);
    return cloned;
  }

  if (ArrayBuffer.isView(value)) {
    const sourceBuffer = value.buffer as CloneableBuffer;
    const clonedBuffer = getOrCreateBufferShell(sourceBuffer, context);
    const cloned = cloneArrayBufferView(value, clonedBuffer);
    context.seen.set(value, cloned);
    cloneOwnProperties(value, cloned, context);
    // 先登记 view 再复制 buffer 自定义属性，循环引用才能指回同一个 view。
    cloneOwnProperties(sourceBuffer, clonedBuffer, context);
    return cloned;
  }

  if (value instanceof Map) {
    const cloned = new Map<unknown, unknown>();
    context.seen.set(value, cloned);
    for (const [key, item] of value) {
      cloned.set(cloneValue(key, context), cloneValue(item, context));
    }
    cloneOwnProperties(value, cloned, context);
    return cloned;
  }

  if (value instanceof Set) {
    const cloned = new Set<unknown>();
    context.seen.set(value, cloned);
    for (const item of value) cloned.add(cloneValue(item, context));
    cloneOwnProperties(value, cloned, context);
    return cloned;
  }

  const cloned: object = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value) as object | null);
  context.seen.set(value, cloned);
  cloneOwnProperties(value, cloned, context);
  return cloned;
};

/** 深度克隆常用结构，保留循环引用、属性描述符与类实例原型。 */
export function deepClone<T>(value: T): T {
  return cloneValue(value, {
    seen: new WeakMap(),
    hydrated: new WeakSet(),
    hydrating: new WeakSet(),
  }) as T;
}
