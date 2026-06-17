// ExUI useCustomClass —— 归一化组件的 `class` 自定义属性
//
// 组件普遍支持 `class?: string | string[] | Record<string, boolean>`，
// 并把它合并进根元素的类名数组。此前这段「字符串/数组/对象」三分支的判断在
// 40+ 个组件里重复粘贴，这里抽成单一实现。

export type CustomClassValue = string | string[] | Record<string, boolean> | undefined | null;

/**
 * 将 `class` 属性归一化为类名数组（过滤空值；对象取值为真的键）。
 *
 * @example
 * normalizeCustomClass('a')                 // ['a']
 * normalizeCustomClass(['a', 'b'])          // ['a', 'b']
 * normalizeCustomClass({ a: true, b: false })// ['a']
 */
export function normalizeCustomClass(custom: CustomClassValue): string[] {
  if (!custom) return [];
  if (typeof custom === 'string') return custom ? [custom] : [];
  if (Array.isArray(custom)) return custom.filter(Boolean);
  return Object.entries(custom)
    .filter(([, value]) => value)
    .map(([key]) => key);
}
