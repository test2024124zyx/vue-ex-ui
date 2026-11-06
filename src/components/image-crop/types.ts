import type { ExImageCropError } from './errors';

/** 裁剪形状。 */
export type CropShape = 'rect' | 'circle';

/** 浏览器可验证的输出格式。 */
export type CropOutputType = 'image/png' | 'image/jpeg' | 'image/webp';

/** 图片来源。字符串来源会先通过 fetch 读取，避免污染 Canvas。 */
export type ImageCropSource = string | Blob;

/** 预览与导出共用的直角旋转状态。 */
export type CropRotation = 0 | 90 | 180 | 270;

/** 二维尺寸。 */
export interface CropSize {
  width: number;
  height: number;
}

/** 裁剪区域，单位由具体字段说明决定。 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 裁剪结果。 */
export interface CropResult {
  /** 已编码图片数据。 */
  blob: Blob;
  /** 裁剪框在预览容器内的 CSS 像素区域。 */
  previewArea: CropArea;
  /** 裁剪框在旋转后图片中的来源像素区域。 */
  sourceArea: CropArea;
  /** 未旋转原图的像素尺寸。 */
  originalSize: CropSize;
  /** 输出图片的像素尺寸。 */
  outputSize: CropSize;
  /** 实际输出格式。 */
  outputType: CropOutputType;
  /** 导出时的旋转状态。 */
  rotation: CropRotation;
  /** 导出时的预览缩放状态。 */
  zoom: number;
}

/** 图片裁剪组件属性。 */
export interface ExImageCropProps {
  /** 图片 URL 或 Blob。 */
  src: ImageCropSource;
  /** 裁剪形状。 */
  shape?: CropShape;
  /** 固定宽高比；圆形裁剪始终使用 1。 */
  aspectRatio?: number;
  /** 初始裁剪框，单位为预览容器 CSS 像素。 */
  initialArea?: CropArea;
  /** 最小裁剪宽度，单位为 CSS 像素。 */
  minWidth?: number;
  /** 最小裁剪高度，单位为 CSS 像素。 */
  minHeight?: number;
  /** 最大裁剪宽度，单位为 CSS 像素。 */
  maxWidth?: number;
  /** 最大裁剪高度，单位为 CSS 像素。 */
  maxHeight?: number;
  /** JPEG/WebP 输出质量，范围 0 到 1。 */
  quality?: number;
  /** 输出图片格式。 */
  outputType?: CropOutputType;
  /** JPEG 透明区域填充色。 */
  outputBackgroundColor?: string;
  /** 是否显示网格。 */
  showGrid?: boolean;
  /** 网格行数。 */
  gridRows?: number;
  /** 网格列数。 */
  gridCols?: number;
  /** 是否显示缩放操作。 */
  zoomable?: boolean;
  /** 是否显示旋转操作。 */
  rotatable?: boolean;
  /** 每次缩放变化量。 */
  zoomStep?: number;
  /** 最小预览缩放。 */
  minZoom?: number;
  /** 最大预览缩放。 */
  maxZoom?: number;
  /** 预览区域背景色。 */
  backgroundColor?: string;
  /** 是否显示工具栏。 */
  showToolbar?: boolean;
  /** 工具栏位置。 */
  toolbarPosition?: 'top' | 'bottom';
  /** 裁剪编辑器的无障碍名称。 */
  ariaLabel?: string;
}

/** 图片裁剪组件事件。 */
export interface ExImageCropEmits {
  /** 预览裁剪区域变化。 */
  change: [area: CropArea];
  /** 裁剪完成。 */
  crop: [result: CropResult];
  /** 用户取消。 */
  cancel: [];
  /** 图片加载完成。 */
  load: [size: CropSize];
  /** 图片加载、配置或导出失败。 */
  error: [error: ExImageCropError];
  /** 缩放变化。 */
  zoom: [scale: number];
  /** 旋转变化。 */
  rotate: [angle: CropRotation];
}

/** 图片裁剪组件暴露的方法。 */
export interface ExImageCropExposed {
  /** 执行裁剪。 */
  crop: () => Promise<CropResult>;
  /** 重置旋转、缩放与裁剪框。 */
  reset: () => void;
  /** 放大预览。 */
  zoomIn: () => void;
  /** 缩小预览。 */
  zoomOut: () => void;
  /** 顺时针旋转 90 度。 */
  rotateRight: () => void;
  /** 逆时针旋转 90 度。 */
  rotateLeft: () => void;
  /** 设置完整预览裁剪区域。 */
  setArea: (area: CropArea) => void;
  /** 获取裁剪区域快照。 */
  getArea: () => CropArea;
  /** 获取组件根元素。 */
  getElement: () => HTMLDivElement | null;
}
