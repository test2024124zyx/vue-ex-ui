import {
  BrowserImageError,
  assertImagePixelBudget,
  encodeCanvasToBlob,
  throwIfImageOperationAborted,
} from '../../utils/image-resource';
import { ExImageCropError, toImageCropError } from './errors';
import { previewAreaToSource, type ImageCropLayout } from './geometry';
import type { CropArea, CropOutputType, CropShape, CropSize } from './types';

const OUTPUT_TYPES: readonly CropOutputType[] = ['image/png', 'image/jpeg', 'image/webp'];

export interface CropConfigurationInput {
  quality?: number;
  outputType?: unknown;
  zoomStep?: number;
  minZoom?: number;
  maxZoom?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  gridRows?: number;
  gridCols?: number;
}

export interface RenderCropOptions {
  area: CropArea;
  shape: CropShape;
  outputType: CropOutputType;
  quality: number;
  backgroundColor: string;
  signal?: AbortSignal;
}

export interface RenderCropResult {
  blob: Blob;
  sourceArea: CropArea;
  outputSize: CropSize;
}

const assertFinitePositive = (value: number | undefined, name: string): void => {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    throw new ExImageCropError('INVALID_CONFIGURATION', name + ' 必须是正有限数');
  }
};

/** 对会改变几何或编码语义的输入做严格运行时验证。 */
export function validateCropConfiguration(configuration: CropConfigurationInput): void {
  if (
    configuration.quality !== undefined &&
    (!Number.isFinite(configuration.quality) ||
      configuration.quality < 0 ||
      configuration.quality > 1)
  ) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '输出质量必须在 0 到 1 之间');
  }
  if (
    configuration.outputType !== undefined &&
    !OUTPUT_TYPES.includes(configuration.outputType as CropOutputType)
  ) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '输出格式不受支持');
  }

  assertFinitePositive(configuration.zoomStep, '缩放步长');
  assertFinitePositive(configuration.minZoom, '最小缩放');
  assertFinitePositive(configuration.maxZoom, '最大缩放');
  assertFinitePositive(configuration.minWidth, '最小裁剪宽度');
  assertFinitePositive(configuration.minHeight, '最小裁剪高度');
  assertFinitePositive(configuration.maxWidth, '最大裁剪宽度');
  assertFinitePositive(configuration.maxHeight, '最大裁剪高度');
  assertFinitePositive(configuration.aspectRatio, '固定宽高比');

  if (
    configuration.minZoom !== undefined &&
    configuration.maxZoom !== undefined &&
    configuration.maxZoom < configuration.minZoom
  ) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '最大缩放不能小于最小缩放');
  }
  if (
    configuration.minWidth !== undefined &&
    configuration.maxWidth !== undefined &&
    configuration.maxWidth < configuration.minWidth
  ) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '最大裁剪宽度不能小于最小宽度');
  }
  if (
    configuration.minHeight !== undefined &&
    configuration.maxHeight !== undefined &&
    configuration.maxHeight < configuration.minHeight
  ) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '最大裁剪高度不能小于最小高度');
  }

  for (const [value, name] of [
    [configuration.gridRows, '网格行数'],
    [configuration.gridCols, '网格列数'],
  ] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
      throw new ExImageCropError('INVALID_CONFIGURATION', name + ' 必须是正整数');
    }
  }
}

/** 使用布局中的同一变换绘制预览画布。 */
export function drawCropPreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  containerSize: CropSize,
  layout: ImageCropLayout,
  pixelRatio = 1
): void {
  if (!Number.isFinite(pixelRatio) || pixelRatio <= 0) {
    throw new ExImageCropError('INVALID_CONFIGURATION', '设备像素比必须是正有限数');
  }

  const pixelWidth = Math.max(1, Math.round(containerSize.width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(containerSize.height * pixelRatio));
  try {
    assertImagePixelBudget(pixelWidth, pixelHeight);
  } catch (error) {
    throw toImageCropError(error, 'INVALID_DIMENSION', '预览尺寸超过安全上限');
  }

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.style.width = containerSize.width + 'px';
  canvas.style.height = containerSize.height + 'px';
  const context = canvas.getContext('2d');
  if (!context) {
    throw new ExImageCropError('CANVAS_UNAVAILABLE', '当前浏览器无法创建 Canvas 2D 上下文');
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, containerSize.width, containerSize.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.save();
  context.translate(containerSize.width / 2, containerSize.height / 2);
  context.rotate((layout.rotation * Math.PI) / 180);
  context.scale(layout.displayScale, layout.displayScale);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  context.restore();
}

function assertRenderArea(sourceArea: CropArea, layout: ImageCropLayout, shape: CropShape): void {
  const values = [sourceArea.x, sourceArea.y, sourceArea.width, sourceArea.height];
  if (
    values.some(value => !Number.isFinite(value)) ||
    sourceArea.width <= 0 ||
    sourceArea.height <= 0
  ) {
    throw new ExImageCropError('INVALID_AREA', '裁剪区域无效');
  }
  const epsilon = 0.000001;
  if (
    sourceArea.x < -epsilon ||
    sourceArea.y < -epsilon ||
    sourceArea.x + sourceArea.width > layout.rotatedSize.width + epsilon ||
    sourceArea.y + sourceArea.height > layout.rotatedSize.height + epsilon
  ) {
    throw new ExImageCropError('INVALID_AREA', '裁剪区域超出图片范围');
  }
  if (shape === 'circle' && Math.abs(sourceArea.width - sourceArea.height) > epsilon) {
    throw new ExImageCropError('INVALID_AREA', '圆形裁剪区域必须保持正方形');
  }
}

function drawExportImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  originalSize: CropSize,
  layout: ImageCropLayout,
  sourceArea: CropArea,
  outputSize: CropSize,
  options: RenderCropOptions
): void {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, outputSize.width, outputSize.height);

  if (options.outputType === 'image/jpeg') {
    context.fillStyle = options.backgroundColor.trim() || '#ffffff';
    context.fillRect(0, 0, outputSize.width, outputSize.height);
  }

  context.save();
  context.beginPath();
  if (options.shape === 'circle') {
    const radius = Math.min(outputSize.width, outputSize.height) / 2;
    context.arc(outputSize.width / 2, outputSize.height / 2, radius, 0, Math.PI * 2);
  } else {
    context.rect(0, 0, outputSize.width, outputSize.height);
  }
  context.clip();

  context.scale(outputSize.width / sourceArea.width, outputSize.height / sourceArea.height);
  context.translate(-sourceArea.x, -sourceArea.y);
  context.translate(layout.rotatedSize.width / 2, layout.rotatedSize.height / 2);
  context.rotate((layout.rotation * Math.PI) / 180);
  context.translate(-originalSize.width / 2, -originalSize.height / 2);
  context.drawImage(image, 0, 0);
  context.restore();
}

/** 按预览的真实旋转、缩放和裁剪框生成来源分辨率 Blob。 */
export async function renderCrop(
  image: HTMLImageElement,
  originalSize: CropSize,
  layout: ImageCropLayout,
  options: RenderCropOptions
): Promise<RenderCropResult> {
  try {
    throwIfImageOperationAborted(options.signal);
    if (typeof document === 'undefined') {
      throw new ExImageCropError('DOM_UNAVAILABLE', '当前环境不支持浏览器图片裁剪');
    }

    let sourceArea: CropArea;
    try {
      sourceArea = previewAreaToSource(options.area, layout);
    } catch (error) {
      throw new ExImageCropError('INVALID_AREA', '裁剪区域不在当前图片内', error);
    }
    assertRenderArea(sourceArea, layout, options.shape);

    const outputSize = {
      width: Math.max(1, Math.round(sourceArea.width)),
      height: Math.max(1, Math.round(sourceArea.height)),
    };
    assertImagePixelBudget(outputSize.width, outputSize.height);
    const canvas = document.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new ExImageCropError('CANVAS_UNAVAILABLE', '当前浏览器无法创建 Canvas 2D 上下文');
    }

    try {
      drawExportImage(context, image, originalSize, layout, sourceArea, outputSize, options);
      const quality = options.outputType === 'image/png' ? undefined : options.quality;
      const blob = await encodeCanvasToBlob(canvas, options.outputType, quality, options.signal);
      throwIfImageOperationAborted(options.signal);
      return {
        blob,
        sourceArea: { ...sourceArea },
        outputSize,
      };
    } finally {
      // 归零临时画布，尽快释放浏览器持有的导出像素缓冲区。
      canvas.width = 0;
      canvas.height = 0;
    }
  } catch (error) {
    if (error instanceof BrowserImageError) {
      throw toImageCropError(error, error.code, '图片裁剪失败');
    }
    throw toImageCropError(error, 'ENCODE_FAILED', '图片裁剪失败');
  }
}
