import type { LayoutBreakpoint, LayoutLength } from './types';

/** 与 Sass 设计令牌同步的运行时断点。 */
export const BREAKPOINT_PIXELS: Readonly<Record<LayoutBreakpoint, number>> = Object.freeze({
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
});

/** 将布局尺寸规范为可执行 CSS 长度，非法值回退到组件默认值。 */
export function normalizeLayoutLength(value: LayoutLength, fallback: LayoutLength): string {
  const normalize = (candidate: LayoutLength): string | null => {
    if (typeof candidate === 'number') {
      return Number.isFinite(candidate) && candidate >= 0 ? candidate + 'px' : null;
    }
    const trimmed = candidate.trim();
    const simpleLength = /^(-?\d*\.?\d+)(?:[a-z%]+)?$/i.exec(trimmed);
    if (simpleLength && Number(simpleLength[1]) < 0) return null;
    return trimmed || null;
  };

  return normalize(value) ?? normalize(fallback) ?? '0px';
}

/** 判断规范化尺寸是否是带可选单位的零值。 */
export function isZeroLayoutLength(value: string): boolean {
  return /^[-+]?0+(?:\.0+)?(?:[a-z%]+)?$/i.test(value.trim());
}

/** 仅允许非负有限动画时长。 */
export function normalizeTransitionDuration(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** 生成“达到断点”的媒体查询，未知运行时输入不会产生无效 CSS。 */
export function getSiderBreakpointQuery(breakpoint: unknown): string | null {
  if (typeof breakpoint !== 'string' || !(breakpoint in BREAKPOINT_PIXELS)) return null;
  return `(min-width: ${BREAKPOINT_PIXELS[breakpoint as LayoutBreakpoint]}px)`;
}
