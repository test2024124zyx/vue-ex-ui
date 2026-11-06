import type { CropArea, CropRotation, CropSize } from './types';

export type CropResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export interface CropConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export interface ImageCropLayout {
  rotation: CropRotation;
  baseScale: number;
  displayScale: number;
  rotatedSize: CropSize;
  imageBounds: CropArea;
}

interface ConstraintLimits {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatio?: number;
}

const assertFinitePositive = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(name + ' 必须是正有限数');
  }
};

const assertArea = (area: CropArea, name: string): void => {
  if (
    !Number.isFinite(area.x) ||
    !Number.isFinite(area.y) ||
    !Number.isFinite(area.width) ||
    !Number.isFinite(area.height) ||
    area.width <= 0 ||
    area.height <= 0
  ) {
    throw new RangeError(name + ' 必须包含有效坐标和正尺寸');
  }
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

/** 仅接受可以由组件真实导出的 90 度旋转。 */
export function normalizeQuarterTurn(angle: number): CropRotation {
  if (!Number.isFinite(angle) || !Number.isInteger(angle / 90)) {
    throw new RangeError('旋转角度必须是 90 的整数倍');
  }
  return (((angle % 360) + 360) % 360) as CropRotation;
}

/** 计算直角旋转后的轴对齐图片尺寸。 */
export function calculateRotatedSize(size: CropSize, rotation: number): CropSize {
  assertFinitePositive(size.width, '图片宽度');
  assertFinitePositive(size.height, '图片高度');
  const normalized = normalizeQuarterTurn(rotation);
  return normalized === 90 || normalized === 270
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

/** 建立预览绘制、交互约束与导出映射共用的布局。 */
export function createImageLayout(
  imageSize: CropSize,
  containerSize: CropSize,
  rotation: number,
  zoom: number,
  paddingRatio = 0.9
): ImageCropLayout {
  assertFinitePositive(containerSize.width, '容器宽度');
  assertFinitePositive(containerSize.height, '容器高度');
  assertFinitePositive(zoom, '缩放比例');
  if (!Number.isFinite(paddingRatio) || paddingRatio <= 0 || paddingRatio > 1) {
    throw new RangeError('预览留白比例必须大于 0 且不超过 1');
  }

  const normalizedRotation = normalizeQuarterTurn(rotation);
  const rotatedSize = calculateRotatedSize(imageSize, normalizedRotation);
  const baseScale = Math.min(
    (containerSize.width * paddingRatio) / rotatedSize.width,
    (containerSize.height * paddingRatio) / rotatedSize.height
  );
  const displayScale = baseScale * zoom;
  const width = rotatedSize.width * displayScale;
  const height = rotatedSize.height * displayScale;

  return {
    rotation: normalizedRotation,
    baseScale,
    displayScale,
    rotatedSize,
    imageBounds: {
      x: (containerSize.width - width) / 2,
      y: (containerSize.height - height) / 2,
      width,
      height,
    },
  };
}

function resolveLimits(bounds: CropArea, constraints: CropConstraints): ConstraintLimits {
  assertArea(bounds, '裁剪边界');

  const validateOptional = (value: number | undefined, name: string): void => {
    if (value !== undefined) assertFinitePositive(value, name);
  };
  validateOptional(constraints.minWidth, '最小宽度');
  validateOptional(constraints.minHeight, '最小高度');
  validateOptional(constraints.maxWidth, '最大宽度');
  validateOptional(constraints.maxHeight, '最大高度');
  validateOptional(constraints.aspectRatio, '固定宽高比');

  const maxWidth = Math.min(bounds.width, constraints.maxWidth ?? bounds.width);
  const maxHeight = Math.min(bounds.height, constraints.maxHeight ?? bounds.height);
  const minWidth = Math.min(maxWidth, constraints.minWidth ?? 1);
  const minHeight = Math.min(maxHeight, constraints.minHeight ?? 1);

  return {
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    aspectRatio: constraints.aspectRatio,
  };
}

function resolveFixedWidthLimits(limits: ConstraintLimits): { minimum: number; maximum: number } {
  const ratio = limits.aspectRatio;
  if (!ratio) {
    return { minimum: limits.minWidth, maximum: limits.maxWidth };
  }

  const maximum = Math.min(limits.maxWidth, limits.maxHeight * ratio);
  const minimum = Math.min(maximum, Math.max(limits.minWidth, limits.minHeight * ratio));
  return { minimum, maximum };
}

/** 将任意有效区域收敛到图片边界和尺寸约束内。 */
export function normalizeCropArea(
  area: CropArea,
  bounds: CropArea,
  constraints: CropConstraints
): CropArea {
  assertArea(area, '裁剪区域');
  const limits = resolveLimits(bounds, constraints);

  let width: number;
  let height: number;
  if (limits.aspectRatio) {
    const fixed = resolveFixedWidthLimits(limits);
    width = clamp(area.width, fixed.minimum, fixed.maximum);
    height = width / limits.aspectRatio;
  } else {
    width = clamp(area.width, limits.minWidth, limits.maxWidth);
    height = clamp(area.height, limits.minHeight, limits.maxHeight);
  }

  return {
    x: clamp(area.x, bounds.x, bounds.x + bounds.width - width),
    y: clamp(area.y, bounds.y, bounds.y + bounds.height - height),
    width,
    height,
  };
}

/** 根据图片可见边界生成居中的初始裁剪框。 */
export function createInitialCropArea(
  bounds: CropArea,
  initialArea: CropArea | undefined,
  constraints: CropConstraints
): CropArea {
  if (initialArea) return normalizeCropArea(initialArea, bounds, constraints);

  const limits = resolveLimits(bounds, constraints);
  let width = bounds.width * 0.8;
  let height = bounds.height * 0.8;
  if (limits.aspectRatio) {
    width = Math.min(width, height * limits.aspectRatio);
    height = width / limits.aspectRatio;
  }

  return normalizeCropArea(
    {
      x: bounds.x + (bounds.width - width) / 2,
      y: bounds.y + (bounds.height - height) / 2,
      width,
      height,
    },
    bounds,
    constraints
  );
}

/** 移动裁剪框且保持其尺寸不变。 */
export function moveCropArea(area: CropArea, dx: number, dy: number, bounds: CropArea): CropArea {
  assertArea(area, '裁剪区域');
  assertArea(bounds, '裁剪边界');
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    throw new RangeError('移动距离必须是有限数');
  }

  return {
    ...area,
    x: clamp(area.x + dx, bounds.x, bounds.x + bounds.width - area.width),
    y: clamp(area.y + dy, bounds.y, bounds.y + bounds.height - area.height),
  };
}

function resizeFreeArea(
  area: CropArea,
  direction: CropResizeDirection,
  dx: number,
  dy: number,
  bounds: CropArea,
  limits: ConstraintLimits
): CropArea {
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  let left = area.x;
  let top = area.y;
  let nextRight = right;
  let nextBottom = bottom;

  if (direction.includes('w')) {
    left = clamp(area.x + dx, Math.max(bounds.x, right - limits.maxWidth), right - limits.minWidth);
  } else if (direction.includes('e')) {
    nextRight = clamp(
      right + dx,
      area.x + limits.minWidth,
      Math.min(bounds.x + bounds.width, area.x + limits.maxWidth)
    );
  }
  if (direction.includes('n')) {
    top = clamp(
      area.y + dy,
      Math.max(bounds.y, bottom - limits.maxHeight),
      bottom - limits.minHeight
    );
  } else if (direction.includes('s')) {
    nextBottom = clamp(
      bottom + dy,
      area.y + limits.minHeight,
      Math.min(bounds.y + bounds.height, area.y + limits.maxHeight)
    );
  }

  return {
    x: left,
    y: top,
    width: nextRight - left,
    height: nextBottom - top,
  };
}

function resizeFixedArea(
  area: CropArea,
  direction: CropResizeDirection,
  dx: number,
  dy: number,
  bounds: CropArea,
  limits: ConstraintLimits
): CropArea {
  if (direction.length !== 2 || !limits.aspectRatio) {
    throw new RangeError('固定比例裁剪仅支持角手柄');
  }

  const ratio = limits.aspectRatio;
  const east = direction.includes('e');
  const south = direction.includes('s');
  const anchorX = east ? area.x : area.x + area.width;
  const anchorY = south ? area.y : area.y + area.height;
  const deltaFromX = (east ? 1 : -1) * dx;
  const deltaFromY = (south ? 1 : -1) * dy * ratio;
  const candidateWidth = area.width + (deltaFromX + deltaFromY) / 2;
  const fixed = resolveFixedWidthLimits(limits);
  const horizontalRoom = east ? bounds.x + bounds.width - anchorX : anchorX - bounds.x;
  const verticalRoom = south ? bounds.y + bounds.height - anchorY : anchorY - bounds.y;
  const maximum = Math.min(fixed.maximum, horizontalRoom, verticalRoom * ratio);
  const minimum = Math.min(maximum, fixed.minimum);
  const width = clamp(candidateWidth, minimum, maximum);
  const height = width / ratio;

  return {
    x: east ? anchorX : anchorX - width,
    y: south ? anchorY : anchorY - height,
    width,
    height,
  };
}

/** 从交互起始快照计算新的裁剪框，避免累计浮点误差。 */
export function resizeCropArea(
  area: CropArea,
  direction: CropResizeDirection,
  dx: number,
  dy: number,
  bounds: CropArea,
  constraints: CropConstraints
): CropArea {
  assertArea(area, '裁剪区域');
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    throw new RangeError('缩放距离必须是有限数');
  }
  const limits = resolveLimits(bounds, constraints);
  return limits.aspectRatio
    ? resizeFixedArea(area, direction, dx, dy, bounds, limits)
    : resizeFreeArea(area, direction, dx, dy, bounds, limits);
}

/** 把预览 CSS 像素区域映射为旋转后图片的来源像素区域。 */
export function previewAreaToSource(area: CropArea, layout: ImageCropLayout): CropArea {
  assertArea(area, '裁剪区域');
  assertFinitePositive(layout.displayScale, '显示缩放');
  const bounds = layout.imageBounds;
  const epsilon = 0.000001;
  if (
    area.x < bounds.x - epsilon ||
    area.y < bounds.y - epsilon ||
    area.x + area.width > bounds.x + bounds.width + epsilon ||
    area.y + area.height > bounds.y + bounds.height + epsilon
  ) {
    throw new RangeError('裁剪区域必须位于当前图片范围内');
  }

  return {
    x: (area.x - bounds.x) / layout.displayScale,
    y: (area.y - bounds.y) / layout.displayScale,
    width: area.width / layout.displayScale,
    height: area.height / layout.displayScale,
  };
}

/** 容器尺寸变化时保留同一来源像素范围。 */
export function reprojectCropArea(
  area: CropArea,
  previousLayout: ImageCropLayout,
  nextLayout: ImageCropLayout,
  constraints: CropConstraints
): CropArea {
  if (previousLayout.rotation !== nextLayout.rotation) {
    throw new RangeError('不同旋转方向之间不能直接重投影裁剪区域');
  }
  const sourceArea = previewAreaToSource(area, previousLayout);
  return normalizeCropArea(
    {
      x: nextLayout.imageBounds.x + sourceArea.x * nextLayout.displayScale,
      y: nextLayout.imageBounds.y + sourceArea.y * nextLayout.displayScale,
      width: sourceArea.width * nextLayout.displayScale,
      height: sourceArea.height * nextLayout.displayScale,
    },
    nextLayout.imageBounds,
    constraints
  );
}
