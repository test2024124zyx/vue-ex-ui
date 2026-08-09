import type {
  ExGridItemProps,
  GridGutter,
  GridGutterPreset,
  GridSpan,
  ResponsiveValue,
} from './types';
import { SPACING_PRESETS } from '../../utils/spacing';

export const GRID_GUTTER_PRESETS: Record<GridGutterPreset, number> = {
  xs: SPACING_PRESETS.xs,
  sm: SPACING_PRESETS.sm,
  md: SPACING_PRESETS.md,
  lg: SPACING_PRESETS.lg,
  xl: SPACING_PRESETS.xl,
};

export const GRID_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type GridBreakpoint = (typeof GRID_BREAKPOINTS)[number];

export interface NormalizedGridGutter {
  horizontal: number;
  vertical: number;
}

interface GridItemState {
  span: GridSpan;
  offset: number;
  push: number;
  pull: number;
  order: number;
}

const normalizeGutterValue = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

/** 规范 gutter，并始终返回双向数值以阻断嵌套容器变量继承。 */
export function normalizeGridGutter(gutter: GridGutter): NormalizedGridGutter {
  if (Array.isArray(gutter)) {
    return {
      horizontal: normalizeGutterValue(gutter[0] ?? 0),
      vertical: normalizeGutterValue(gutter[1] ?? 0),
    };
  }
  const value =
    typeof gutter === 'string'
      ? (GRID_GUTTER_PRESETS[gutter as GridGutterPreset] ?? 0)
      : normalizeGutterValue(gutter);
  return { horizontal: value, vertical: value };
}

/** 规范 span 到 0 至 24 的整数范围，非法值回退为满行。 */
export function normalizeGridSpan(span: GridSpan): GridSpan {
  if (span === 'auto') return span;
  if (!Number.isFinite(span)) return 24;
  return Math.min(24, Math.max(0, Math.floor(span)));
}

/** 规范 offset/push/pull 到 0 至 24 的整数范围。 */
export function normalizeGridLine(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(24, Math.max(0, Math.floor(value)));
}

/** order 只接受安全整数。 */
export function normalizeGridOrder(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const normalized = Math.trunc(value);
  return Number.isSafeInteger(normalized) ? normalized : 0;
}

const toPercentage = (columns: number): string => {
  const percentage =
    Math.round(((columns / 24) * 100 + Number.EPSILON) * 100_000_000) / 100_000_000;
  return `${percentage}%`;
};

const normalizeState = (props: ExGridItemProps): GridItemState => ({
  span: normalizeGridSpan(props.span ?? 24),
  offset: normalizeGridLine(props.offset ?? 0),
  push: normalizeGridLine(props.push ?? 0),
  pull: normalizeGridLine(props.pull ?? 0),
  order: normalizeGridOrder(props.order ?? 0),
});

const applyResponsiveValue = (
  state: GridItemState,
  value: GridSpan | ResponsiveValue | undefined
): GridItemState => {
  if (value === undefined) return { ...state };
  if (typeof value === 'number' || value === 'auto') {
    return { ...state, span: normalizeGridSpan(value) };
  }
  return {
    span: value.span === undefined ? state.span : normalizeGridSpan(value.span),
    offset: value.offset === undefined ? state.offset : normalizeGridLine(value.offset),
    push: value.push === undefined ? state.push : normalizeGridLine(value.push),
    pull: value.pull === undefined ? state.pull : normalizeGridLine(value.pull),
    order: value.order === undefined ? state.order : normalizeGridOrder(value.order),
  };
};

const writeBreakpointStyles = (
  styles: Record<string, string>,
  breakpoint: GridBreakpoint,
  state: GridItemState
): void => {
  const prefix = `--ex-grid-${breakpoint}`;
  if (state.span === 'auto') {
    styles[`${prefix}-display`] = 'block';
    styles[`${prefix}-flex`] = '1 0 0%';
    styles[`${prefix}-max-width`] = '100%';
  } else if (state.span === 0) {
    styles[`${prefix}-display`] = 'none';
    styles[`${prefix}-flex`] = '0 0 0%';
    styles[`${prefix}-max-width`] = '0%';
  } else {
    const width = toPercentage(state.span);
    styles[`${prefix}-display`] = 'block';
    styles[`${prefix}-flex`] = `0 0 ${width}`;
    styles[`${prefix}-max-width`] = width;
  }
  styles[`${prefix}-offset`] = toPercentage(state.offset);
  styles[`${prefix}-push`] = toPercentage(state.push);
  styles[`${prefix}-pull`] = toPercentage(state.pull);
  styles[`${prefix}-order`] = String(state.order);
};

/**
 * 为每个断点计算完整状态，而不是生成可能没有 CSS 实现的动态类名。
 * 完整写入还能阻断嵌套 GridItem 从父项继承自定义变量。
 */
export function createGridItemStyles(props: ExGridItemProps): Record<string, string> {
  const styles: Record<string, string> = {};
  let state = normalizeState(props);

  for (const breakpoint of GRID_BREAKPOINTS) {
    state = applyResponsiveValue(state, props[breakpoint]);
    writeBreakpointStyles(styles, breakpoint, state);
  }

  return styles;
}
