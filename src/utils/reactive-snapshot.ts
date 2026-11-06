import { isRef } from 'vue';

/** 迭代读取响应式对象图，替代递归 deep 监听，保留嵌套业务数据的失效通知。 */
export function captureReactiveValue(source: unknown): unknown[] {
  const snapshot: unknown[] = [];
  const pending = [source];
  const seen = new Set<object>();
  while (pending.length) {
    const value = pending.pop();
    snapshot.push(value);
    if (!value || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
    if (isRef(value)) pending.push(value.value);
    else if (Array.isArray(value)) {
      for (const item of value) pending.push(item);
    } else if (value instanceof Map) {
      value.forEach((item, key) => pending.push(key, item));
    } else if (value instanceof Set) {
      value.forEach(item => pending.push(item));
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      const keys = Reflect.ownKeys(value).filter(key =>
        Object.prototype.propertyIsEnumerable.call(value, key)
      );
      snapshot.push(...keys);
      for (const key of keys) pending.push(Reflect.get(value, key));
    }
  }
  return snapshot;
}
