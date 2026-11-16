import type { CSSProperties } from 'vue';

/** 将样式对象的驼峰键转为 CSS 声明。 */
export function styleToString(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value}`)
    .join('; ');
}

/** 保留字符串中的原始 CSS 声明顺序，让调用方样式可以覆盖生成值。 */
export function mergeInlineStyles(
  generated: Record<string, string | number>,
  custom?: string | CSSProperties | Record<string, string | number>
) {
  if (!custom) return generated;
  if (typeof custom !== 'string') return { ...generated, ...custom };

  const declarations = styleToString(generated);
  return declarations ? `${declarations}; ${custom}` : custom;
}
