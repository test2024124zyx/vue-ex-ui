import type { Theme } from '../../types/theme';
import { getChartPalette, getChartTheme, type ChartPalette } from './utils';

/** 保留 ECharts 对同类多组件的数组契约，并独立合并每个组件的默认值。 */
export function mergeChartComponent(
  value: unknown,
  defaults: Record<string, unknown>,
  show: boolean
): Record<string, unknown> | Record<string, unknown>[] {
  const merge = (item: unknown) => ({
    ...defaults,
    ...(item && typeof item === 'object' && !Array.isArray(item) ? item : {}),
    show,
  });
  return Array.isArray(value) ? value.map(merge) : merge(value);
}

/** Canvas 不会继承 CSS 变量，必须在所属文档中解析后再交给 ECharts。 */
export function resolveChartColor(
  element: HTMLElement | undefined,
  token: string,
  fallback: string,
  overrides: Record<string, string> = {}
): string {
  const view = element?.ownerDocument.defaultView;
  if (!element || !view) return fallback;
  const candidate =
    element.style.getPropertyValue(token).trim() ||
    overrides[token] ||
    view.getComputedStyle(element).getPropertyValue(token).trim();
  if (!candidate) return fallback;
  const probe = element.ownerDocument.createElement('span');
  probe.style.color = candidate;
  if (!probe.style.color) return fallback;
  if (!candidate.includes('var(')) return candidate;
  probe.style.display = 'none';
  element.appendChild(probe);
  try {
    const resolved = view.getComputedStyle(probe).color;
    return resolved && !resolved.includes('var(') ? resolved : fallback;
  } finally {
    probe.remove();
  }
}

/** 以现有双主题为回退，让品牌主色、文字与表面 token 同时作用于 Canvas/SVG。 */
export function resolveChartTheme(
  theme: Theme,
  element: HTMLElement | undefined,
  overrides: Record<string, string>
): Record<string, unknown> {
  const configuration = getChartTheme(theme) as Record<string, unknown>;
  const colors = configuration.color as string[];
  const palette = resolveChartPalette(theme, element, overrides);
  return getChartTheme(theme, {
    series: [palette.accent, ...colors.slice(1)],
    text: palette.text,
    title: palette.text,
    mutedText: palette.mutedText,
    surface: palette.surface,
    border: palette.border,
  }) as Record<string, unknown>;
}

/** 附属控件与图表使用同一组 token，透明色交由已加载的 ECharts 解析。 */
export function resolveChartPalette(
  theme: Theme,
  element: HTMLElement | undefined,
  overrides: Record<string, string>,
  modifyAlpha?: (color: string, alpha: number) => string
): ChartPalette {
  const fallback = getChartPalette(theme);
  const read = (token: string, color: string) =>
    resolveChartColor(element, token, color, overrides);
  const accent = read('--ex-color-primary', fallback.accent);
  return {
    accent,
    text: read('--ex-color-text-primary', fallback.text),
    mutedText: read('--ex-color-text-secondary', fallback.mutedText),
    surface: read('--ex-color-bg-elevated', fallback.surface),
    border: read('--ex-color-border-secondary', fallback.border),
    accentFill: modifyAlpha?.(accent, 0.2) ?? accent,
    accentArea: modifyAlpha?.(accent, 0.3) ?? accent,
  };
}
