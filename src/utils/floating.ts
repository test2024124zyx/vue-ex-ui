export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
export type FloatingAlignment = 'start' | 'end';
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${FloatingAlignment}`;

export interface FloatingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface FloatingSize {
  width: number;
  height: number;
}

export interface FloatingViewport {
  width: number;
  height: number;
}

export interface ComputeFloatingPositionOptions {
  reference: FloatingRect;
  floating: FloatingSize;
  viewport: FloatingViewport;
  placement: FloatingPlacement;
  offset?: number;
  padding?: number;
  flip?: boolean;
  matchReferenceWidth?: boolean;
}

export interface FloatingPosition {
  x: number;
  y: number;
  placement: FloatingPlacement;
  width?: number;
}

const SIDES = new Set<FloatingSide>(['top', 'right', 'bottom', 'left']);
const ALIGNMENTS = new Set<FloatingAlignment>(['start', 'end']);

const finiteNonNegative = (value: number, fallback = 0): number =>
  Number.isFinite(value) && value >= 0 ? value : fallback;

const oppositeSide = (side: FloatingSide): FloatingSide => {
  const opposites: Record<FloatingSide, FloatingSide> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  };
  return opposites[side];
};

const joinPlacement = (
  side: FloatingSide,
  alignment: FloatingAlignment | undefined
): FloatingPlacement => (alignment ? `${side}-${alignment}` : side);

/**
 * 计算 fixed 浮层坐标：先按首选方向布局，再在主轴空间不足时翻转，最后移入视口边界。
 * 纯函数不读取 DOM，便于 Dropdown、Tooltip 与 Popover 共享并独立验证。
 */
export function computeFloatingPosition(options: ComputeFloatingPositionOptions): FloatingPosition {
  const [rawSide, rawAlignment] = options.placement.split('-');
  let side: FloatingSide = SIDES.has(rawSide as FloatingSide)
    ? (rawSide as FloatingSide)
    : 'bottom';
  const alignment = ALIGNMENTS.has(rawAlignment as FloatingAlignment)
    ? (rawAlignment as FloatingAlignment)
    : undefined;
  const offset = finiteNonNegative(options.offset ?? 0);
  const padding = finiteNonNegative(options.padding ?? 8);
  const viewportWidth = finiteNonNegative(options.viewport.width);
  const viewportHeight = finiteNonNegative(options.viewport.height);
  const referenceWidth = finiteNonNegative(options.reference.width);
  const floatingWidth = options.matchReferenceWidth
    ? referenceWidth
    : finiteNonNegative(options.floating.width);
  const floatingHeight = finiteNonNegative(options.floating.height);

  if (options.flip !== false) {
    const available: Record<FloatingSide, number> = {
      top: options.reference.top - padding - offset,
      right: viewportWidth - padding - options.reference.right - offset,
      bottom: viewportHeight - padding - options.reference.bottom - offset,
      left: options.reference.left - padding - offset,
    };
    const required = side === 'top' || side === 'bottom' ? floatingHeight : floatingWidth;
    const opposite = oppositeSide(side);
    if (available[side] < required && available[opposite] > available[side]) {
      side = opposite;
    }
  }

  let x: number;
  let y: number;
  if (side === 'top' || side === 'bottom') {
    y =
      side === 'bottom'
        ? options.reference.bottom + offset
        : options.reference.top - floatingHeight - offset;
    if (alignment === 'start') x = options.reference.left;
    else if (alignment === 'end') x = options.reference.right - floatingWidth;
    else x = options.reference.left + (referenceWidth - floatingWidth) / 2;
  } else {
    x =
      side === 'right'
        ? options.reference.right + offset
        : options.reference.left - floatingWidth - offset;
    if (alignment === 'start') y = options.reference.top;
    else if (alignment === 'end') y = options.reference.bottom - floatingHeight;
    else y = options.reference.top + (options.reference.height - floatingHeight) / 2;
  }

  const maximumX = Math.max(padding, viewportWidth - floatingWidth - padding);
  const maximumY = Math.max(padding, viewportHeight - floatingHeight - padding);
  x = Math.min(Math.max(x, padding), maximumX);
  y = Math.min(Math.max(y, padding), maximumY);

  return {
    x,
    y,
    placement: joinPlacement(side, alignment),
    ...(options.matchReferenceWidth ? { width: referenceWidth } : {}),
  };
}
