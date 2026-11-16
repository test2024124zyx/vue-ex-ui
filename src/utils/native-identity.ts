/** 这些原生对象依赖内部槽，快照应保留其身份。 */
export function usesNativeIdentity(value: object): boolean {
  return (
    value instanceof Promise ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof Node !== 'undefined' && value instanceof Node)
  );
}
