import { normalizeStyle } from 'vue';

/** 使用 Vue 的样式解析规则保留函数内分号，仅传播 ExUI 变量，避免浮层继承布局属性。 */
export function resolveThemeOverrides(...sources: unknown[]): Record<string, string> {
  const styles = normalizeStyle(sources);
  if (!styles || typeof styles === 'string') return {};

  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (key.startsWith('--ex-') && (typeof value === 'string' || typeof value === 'number')) {
      variables[key] = String(value);
    }
  }
  return variables;
}
